#!/usr/bin/env node
/**
 * Validate every bundle in bundles/ against the JSON schema + safety rules.
 * Run locally: `npm ci && npm run validate`. Also runs in CI on every PR.
 */
const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ROOT = path.resolve(__dirname, '..');
const BUNDLES_DIR = path.join(ROOT, 'bundles');
const schema = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'schema', 'bundle.schema.json'), 'utf8'),
);

// Tokens that must NEVER appear in an effect command/template (non-destructive rule).
const FORBIDDEN = [
  '/stop', '/ban', '/op', '/deop', '/kick', '/clear', '/whitelist',
  '/save-off', '/save-all', '/gamemode', 'op ', 'shutdown', 'rm ', 'del ',
  'format', 'mkfs', ':(){', 'sudo',
];

// Artwork rules from CONTRIBUTING.md §1. These used to be prose only: the manifest
// said "square, ~512x512, < 300 KB" and nothing checked it, so the reference bundle
// itself shipped a 458x512 / 362 KB asset. Contributors copy the example, so an
// unenforced rule is worse than no rule.
const MAX_ASSET_BYTES = 300 * 1024;
const MAX_ASSET_SIDE = 512;
const MIN_ASSET_SIDE = 128;

/**
 * Read intrinsic dimensions straight from the file header — no image dependency
 * (ajv is deliberately the only one). Returns { width, height, format } or null
 * when the bytes are not a PNG/WebP we recognise.
 */
function readImageSize(buf) {
  // PNG: 8-byte signature, then IHDR with width/height as BE uint32.
  if (buf.length >= 24 && buf.toString('latin1', 0, 8) === '\x89PNG\r\n\x1a\n') {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20), format: 'png' };
  }

  // WebP: RIFF container, then one of three chunk layouts.
  if (buf.length >= 30 && buf.toString('latin1', 0, 4) === 'RIFF' &&
      buf.toString('latin1', 8, 12) === 'WEBP') {
    const chunk = buf.toString('latin1', 12, 16);

    if (chunk === 'VP8X') {
      return {
        width: (buf.readUIntLE(24, 3) & 0xffffff) + 1,
        height: (buf.readUIntLE(27, 3) & 0xffffff) + 1,
        format: 'webp',
      };
    }
    if (chunk === 'VP8 ') {
      return {
        width: buf.readUInt16LE(26) & 0x3fff,
        height: buf.readUInt16LE(28) & 0x3fff,
        format: 'webp',
      };
    }
    if (chunk === 'VP8L') {
      const bits = buf.readUInt32LE(21);
      return {
        width: (bits & 0x3fff) + 1,
        height: ((bits >> 14) & 0x3fff) + 1,
        format: 'webp',
      };
    }
  }

  return null;
}

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

let errors = 0;
const fail = (bundle, msg) => {
  console.error(`  ✗ [${bundle}] ${msg}`);
  errors++;
};

if (!fs.existsSync(BUNDLES_DIR)) {
  console.log('No bundles/ directory — nothing to validate.');
  process.exit(0);
}

const dirs = fs
  .readdirSync(BUNDLES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

console.log(`Validating ${dirs.length} bundle(s)…\n`);

const seenSlugs = new Set();

for (const dir of dirs) {
  const bundleDir = path.join(BUNDLES_DIR, dir);
  const manifestPath = path.join(bundleDir, 'bundle.json');
  if (!fs.existsSync(manifestPath)) {
    fail(dir, 'missing bundle.json');
    continue;
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (e) {
    fail(dir, `bundle.json is not valid JSON: ${e.message}`);
    continue;
  }

  // 1. Schema.
  if (!validate(manifest)) {
    for (const err of validate.errors) {
      fail(dir, `schema ${err.instancePath || '/'} ${err.message}`);
    }
    continue;
  }

  // 2. Folder name must equal slug + globally unique.
  if (manifest.slug !== dir) {
    fail(dir, `slug "${manifest.slug}" must equal the folder name "${dir}"`);
  }
  if (seenSlugs.has(manifest.slug)) {
    fail(dir, `duplicate bundle slug "${manifest.slug}"`);
  }
  seenSlugs.add(manifest.slug);

  // 3. A pack that targets someone else's game must disclaim affiliation.
  if (manifest.game && !manifest.notice) {
    fail(
      dir,
      `"game" is set ("${manifest.game}") so "notice" is required — disclaim any ` +
        'affiliation with the game\'s publisher. See CONTRIBUTING.md §1.',
    );
  }

  // 4. Credits live in a per-bundle README (CONTRIBUTING.md checklist).
  if (!fs.existsSync(path.join(bundleDir, 'README.md'))) {
    fail(dir, 'missing README.md (short description + artwork credits)');
  }

  // 5. Slot slugs unique within the bundle + assets valid + effect safety.
  const slotSlugs = new Set();
  const checkedAssets = new Set();
  for (const slot of manifest.slots) {
    if (slotSlugs.has(slot.slug)) {
      fail(dir, `slot "${slot.slug}" used more than once`);
    }
    slotSlugs.add(slot.slug);

    // Several slots may share one asset — check each file once.
    const assetPath = path.join(bundleDir, slot.image);
    if (!fs.existsSync(assetPath)) {
      fail(dir, `image not found: ${slot.image}`);
    } else if (!checkedAssets.has(slot.image)) {
      checkedAssets.add(slot.image);
      const buf = fs.readFileSync(assetPath);
      const size = readImageSize(buf);

      if (buf.length > MAX_ASSET_BYTES) {
        fail(
          dir,
          `${slot.image} is ${(buf.length / 1024).toFixed(0)} KB — max ` +
            `${MAX_ASSET_BYTES / 1024} KB`,
        );
      }

      if (!size) {
        fail(dir, `${slot.image} is not a readable PNG or WebP file`);
      } else {
        // The extension is already constrained by the schema; make sure the bytes agree.
        const ext = path.extname(slot.image).slice(1).toLowerCase();
        if (size.format !== ext) {
          fail(dir, `${slot.image} is a ${size.format.toUpperCase()} file named .${ext}`);
        }
        if (size.width !== size.height) {
          fail(dir, `${slot.image} is ${size.width}x${size.height} — artwork must be square`);
        }
        if (size.width > MAX_ASSET_SIDE || size.height > MAX_ASSET_SIDE) {
          fail(
            dir,
            `${slot.image} is ${size.width}x${size.height} — max ` +
              `${MAX_ASSET_SIDE}x${MAX_ASSET_SIDE}`,
          );
        }
        if (size.width < MIN_ASSET_SIDE || size.height < MIN_ASSET_SIDE) {
          fail(
            dir,
            `${slot.image} is ${size.width}x${size.height} — min ` +
              `${MIN_ASSET_SIDE}x${MIN_ASSET_SIDE}`,
          );
        }
      }
    }

    if (slot.effect) {
      const blob = `${slot.effect.command || ''} ${slot.effect.template || ''}`.toLowerCase();
      for (const bad of FORBIDDEN) {
        if (blob.includes(bad.toLowerCase())) {
          fail(dir, `slot "${slot.slug}" effect contains forbidden token "${bad.trim()}"`);
        }
      }
    }
  }
}

if (errors > 0) {
  console.error(`\n${errors} error(s). See CONTRIBUTING.md.`);
  process.exit(1);
}
console.log('\n✓ All bundles valid.');
