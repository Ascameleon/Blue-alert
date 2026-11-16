import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const sourcePath = resolve(root, 'BLUE_ALERTS_v94_ASSET_INTEGRATION.html');
const modelPath = resolve(root, 'game-data/models/blue-alert-models.js');
const vendorPath = resolve(root, 'public/vendor/three.min.js');
const licensePath = resolve(root, 'public/vendor/THREE-LICENSE.txt');
const outputDir = resolve(root, 'dist');
const outputPath = resolve(outputDir, 'BLUE_ALERTS_V94_BUILD_ZONE_JOUABLE.html');
const html = await readFile(sourcePath, 'utf8');
const model = await readFile(modelPath, 'utf8');
const vendor = await readFile(vendorPath, 'utf8');
const vendorLicense = await readFile(licensePath, 'utf8');
const importPattern = /await import\('\.\/game-data\/models\/blue-alert-models\.js\?v=10'\)/;
const vendorTag = '<script src="./public/vendor/three.min.js"></script>';

assert.match(html, importPattern, 'expected the versioned local BLUE_MODELS import');
assert.ok(html.includes(vendorTag), 'game HTML must load the repository-vendored Three.js build');
assert.ok(html.includes("globalThis.THREE?.REVISION === '160'"), 'runtime must prefer the local Three.js r160 build');
assert.match(model, /export\s+(?:async\s+)?function\s+createBuilding/, 'model module must expose createBuilding');
assert.match(model, /export\s+(?:async\s+)?function\s+createTank/, 'model module must expose createTank');
const exportedNames = [...model.matchAll(/^export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)].map(match => match[1]);
assert.ok(exportedNames.includes('createBuilding') && exportedNames.includes('createTank'), 'required model constructors must be exported');
assert.ok(vendor.includes('const e="160"') && vendor.includes('t.REVISION=e'), 'vendored Three.js must be revision 160');
assert.ok(vendor.includes('@license') && vendor.includes('SPDX-License-Identifier: MIT'), 'Three.js source must retain its MIT license header');
assert.ok(!vendor.toLowerCase().includes('</script'), 'vendored source must be safe to inline in an HTML script element');
assert.ok(vendorLicense.includes('The MIT License') && vendorLicense.includes('three.js authors'), 'separate Three.js MIT notice must be preserved');

const inlineModelSource = model.replace(/^(\s*)export\s+/gm, '$1');
const inlineFactory = '(() => {\n' + inlineModelSource + '\nreturn Object.freeze({ ' + exportedNames.join(', ') + ' });\n})()';
const withVendor = html.replace(vendorTag, () => '<script>\n' + vendor + '\n</script>');
const bundled = withVendor.replace(importPattern, inlineFactory);
assert.notEqual(bundled, html, 'local vendor and model imports must be replaced');
assert.ok(!bundled.includes(vendorTag), 'bundle must not request a separate Three.js file');
assert.ok(!bundled.includes('./game-data/models/blue-alert-models.js?v=10'), 'bundle must not require a separate model file');
assert.ok(!bundled.includes('data:text/javascript;base64,'), 'bundle must not rely on opaque-origin data-module imports');
assert.ok(bundled.includes('build-zone'), 'build-zone QA hook must remain in the bundle');
await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, bundled, 'utf8');
await writeFile(resolve(outputDir, 'THREE-LICENSE.txt'), vendorLicense, 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
const manifest = {
  artifact: 'BLUE_ALERTS_V94_BUILD_ZONE_JOUABLE.html',
  source_html_sha256: sha(html),
  embedded_model_module_sha256: sha(model),
  embedded_three_js_sha256: sha(vendor),
  three_js_revision: '160',
  three_js_license: 'MIT',
  three_js_license_sha256: sha(vendorLicense),
  output_sha256: sha(bundled),
  bytes: Buffer.byteLength(bundled),
  single_html_file: true,
  offline_runtime: true,
  embedded: ['public/vendor/three.min.js', 'game-data/models/blue-alert-models.js'],
  external_runtime_dependencies: [],
  optional_network_fallbacks: [
    'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
    'https://unpkg.com/three@0.160.0/build/three.module.js',
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.js'
  ],
  license_file: 'THREE-LICENSE.txt',
  notes: 'Three.js 0.160.0 and the procedural model constructors are embedded in the HTML. The normal runtime requires no CDN or network access; optional CDN fallbacks are used only if the embedded runtime is unavailable.'
};
await writeFile(resolve(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
