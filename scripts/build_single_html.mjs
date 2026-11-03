import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const sourcePath = resolve(root, 'BLUE_ALERTS_v94_ASSET_INTEGRATION.html');
const modelPath = resolve(root, 'game-data/models/blue-alert-models.js');
const outputDir = resolve(root, 'dist');
const outputPath = resolve(outputDir, 'BLUE_ALERTS_V94_BUILD_ZONE_JOUABLE.html');
const html = await readFile(sourcePath, 'utf8');
const model = await readFile(modelPath, 'utf8');
const importPattern = /await import\('\.\/game-data\/models\/blue-alert-models\.js\?v=11'\)/;
assert.match(html, importPattern, 'expected the versioned local BLUE_MODELS import');
assert.match(model, /export\s+(?:async\s+)?function\s+createBuilding/, 'model module must expose createBuilding');
assert.match(model, /export\s+(?:async\s+)?function\s+createTank/, 'model module must expose createTank');
const exportedNames = [...model.matchAll(/^export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)].map(match => match[1]);
assert.ok(exportedNames.includes('createBuilding') && exportedNames.includes('createTank'), 'required model constructors must be exported');
const inlineModelSource = model.replace(/^(\s*)export\s+/gm, '$1');
const inlineFactory = '(() => {\n' + inlineModelSource + '\nreturn Object.freeze({ ' + exportedNames.join(', ') + ' });\n})()';
const bundled = html.replace(importPattern, inlineFactory);
assert.notEqual(bundled, html, 'model import must be replaced');
assert.ok(!bundled.includes('./game-data/models/blue-alert-models.js?v=11'), 'bundle must not require a separate model file');
assert.ok(!bundled.includes('data:text/javascript;base64,'), 'bundle must not rely on opaque-origin data-module imports');
assert.ok(bundled.includes('build-zone'), 'build-zone QA hook must remain in the bundle');
await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, bundled, 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
const manifest = {
  artifact: 'BLUE_ALERTS_V94_BUILD_ZONE_JOUABLE.html',
  source_html_sha256: sha(html),
  embedded_model_module_sha256: sha(model),
  output_sha256: sha(bundled),
  bytes: Buffer.byteLength(bundled),
  single_html_file: true,
  embedded: ['game-data/models/blue-alert-models.js'],
  external_runtime_dependencies: ['Three.js 0.160.0 from jsDelivr/unpkg/cdnjs'],
  notes: 'The procedural model constructors are inlined into the HTML module scope. Three.js remains CDN-loaded; internet access is required for the 3D renderer.'
};
await writeFile(resolve(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
