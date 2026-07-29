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

  // 3. Slot slugs unique within the bundle + assets exist + effect safety.
  const slotSlugs = new Set();
  for (const slot of manifest.slots) {
    if (slotSlugs.has(slot.slug)) {
      fail(dir, `slot "${slot.slug}" used more than once`);
    }
    slotSlugs.add(slot.slug);

    const assetPath = path.join(bundleDir, slot.image);
    if (!fs.existsSync(assetPath)) {
      fail(dir, `image not found: ${slot.image}`);
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
