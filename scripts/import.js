#!/usr/bin/env node
/**
 * Push merged bundles to the Hou.la ingestion endpoint (the "Merge → imported
 * into the catalogue" tunnel). Runs in CI on push to `main` AFTER validate.js.
 *
 * For each bundle slug (passed as args = the changed dirs, or ALL if none), it
 * reads bundle.json + base64-encodes every referenced asset and POSTs to
 * `POST /api/internal/bundles/import` with the shared secret. The API
 * re-validates, ENFORCES transparency, uploads the art to R2 itself, and upserts
 * the catalogue row (art creds stay server-side — GitHub only ships the bytes).
 *
 * Env: HOULA_IMPORT_URL, BUNDLE_IMPORT_TOKEN (GitHub secrets).
 */
const fs = require('fs');
const path = require('path');

const API_URL = process.env.HOULA_IMPORT_URL;
const TOKEN = process.env.BUNDLE_IMPORT_TOKEN;
if (!API_URL || !TOKEN) {
  console.error('HOULA_IMPORT_URL and BUNDLE_IMPORT_TOKEN are required');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');
const BUNDLES_DIR = path.join(ROOT, 'bundles');

let slugs = process.argv.slice(2).filter(Boolean);
if (slugs.length === 0) {
  slugs = fs
    .readdirSync(BUNDLES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

(async () => {
  let failed = 0;
  for (const slug of slugs) {
    const dir = path.join(BUNDLES_DIR, slug);
    const manifestPath = path.join(dir, 'bundle.json');
    if (!fs.existsSync(manifestPath)) {
      console.log(`skip ${slug} (no bundle.json)`);
      continue;
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const assets = {};
    for (const slot of manifest.slots || []) {
      const base = String(slot.image || '').replace(/^assets\//, '');
      const assetPath = path.join(dir, 'assets', base);
      if (!fs.existsSync(assetPath)) {
        throw new Error(`${slug}: asset not found for slot ${slot.slug}: ${slot.image}`);
      }
      assets[base] = fs.readFileSync(assetPath).toString('base64');
    }

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-bundle-import-token': TOKEN },
      body: JSON.stringify({ ...manifest, assets }),
    });
    const text = await res.text();
    if (!res.ok) {
      console.error(`✗ ${slug}: HTTP ${res.status} ${text}`);
      failed++;
    } else {
      console.log(`✓ ${slug}: ${text}`);
    }
  }
  if (failed) {
    console.error(`\n${failed} bundle(s) failed to import.`);
    process.exit(1);
  }
  console.log('\nImport complete.');
})().catch((e) => {
  console.error('IMPORT ERROR:', e.message);
  process.exit(1);
});
