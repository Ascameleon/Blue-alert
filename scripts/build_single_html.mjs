import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build as bundle } from 'esbuild';

const root = process.cwd();
const sourcePath = resolve(root, 'BLUE_ALERTS_v94_ASSET_INTEGRATION.html');
const modelPath = resolve(root, 'game-data/models/blue-alert-models.js');
const outputDir = resolve(root, 'dist');
const outputPath = resolve(outputDir, 'BLUE_ALERTS_V94_BUILD_ZONE_JOUABLE.html');
const html = await readFile(sourcePath, 'utf8');
const model = await readFile(modelPath, 'utf8');

const modelImportPattern = /await import\('\.\/game-data\/models\/blue-alert-models\.js\?v=\d+'\)/;
assert.match(html, modelImportPattern, 'expected the versioned local BLUE_MODELS import');
assert.match(model, /export\s+(?:async\s+)?function\s+createBuilding/, 'model module must expose createBuilding');
assert.match(model, /export\s+(?:async\s+)?function\s+createTank/, 'model module must expose createTank');

const exportedNames = [...model.matchAll(/^export\s+(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)].map(match => match[1]);
assert.ok(exportedNames.includes('createBuilding') && exportedNames.includes('createTank'),
  'required model constructors must be exported');
const inlineModelSource = model.replace(/^(\s*)export\s+/gm, '$1');
const inlineFactory = '(() => {\n' + inlineModelSource + '\nreturn Object.freeze({ ' +
  exportedNames.join(', ') + ' });\n})()';
let bundledHtml = html.replace(modelImportPattern, inlineFactory);
assert.notEqual(bundledHtml, html, 'model import must be replaced');

const threeLoaderPattern = /const THREE = await \(async \(\) => \{[\s\S]*?\n\}\)\(\);/;
assert.match(bundledHtml, threeLoaderPattern, 'expected the multi-CDN Three.js loader');
bundledHtml = bundledHtml.replace(threeLoaderPattern, "import * as THREE from 'three';");

const modulePattern = /<script type="module">([\s\S]*?)<\/script>/;
const moduleMatch = bundledHtml.match(modulePattern);
assert.ok(moduleMatch, 'expected the V94 runtime module script');
const result = await bundle({
  stdin: {
    contents: moduleMatch[1],
    resolveDir: root,
    sourcefile: 'BLUE_ALERTS_V94_RUNTIME_ENTRY.js',
    loader: 'js'
  },
  bundle: true,
  write: false,
  platform: 'browser',
  format: 'esm',
  target: ['es2022'],
  treeShaking: true,
  legalComments: 'inline',
  minify: false,
  sourcemap: false
});
assert.equal(result.outputFiles.length, 1, 'Three.js runtime must produce one bundled module');
const runtimeBundle = result.outputFiles[0].text;
assert.ok(runtimeBundle.includes('WebGLRenderer'), 'bundled runtime must include Three.js WebGLRenderer');
assert.ok(runtimeBundle.includes('PerspectiveCamera'), 'bundled runtime must include perspective camera support');
assert.ok(!/https?:\/\/(?:cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com)\/.*three/i.test(runtimeBundle),
  'standalone runtime must not retain external Three.js CDN imports');
assert.doesNotMatch(runtimeBundle, /^\\s*import\\s/m,
  'standalone runtime must not retain unresolved static module imports');
assert.doesNotMatch(runtimeBundle, /\\bimport\\s*\\(/,
  'standalone runtime must not retain unresolved dynamic module imports');
bundledHtml = bundledHtml.replace(moduleMatch[0], '<script type="module">\n' + runtimeBundle + '\n</script>');
assert.ok(!bundledHtml.includes('./game-data/models/blue-alert-models.js?v='), 'bundle must not require a separate model file');
assert.ok(!bundledHtml.includes('https://cdn.jsdelivr.net/npm/three@0.160.0'), 'bundle must not require the Three.js CDN');
assert.ok(bundledHtml.includes('window.__BLUE_ALERTS_ENGINE__'), 'bundle must expose runtime diagnostics');

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, bundledHtml, 'utf8');
const sha = value => createHash('sha256').update(value).digest('hex');
const manifest = {
  artifact: 'BLUE_ALERTS_V94_BUILD_ZONE_JOUABLE.html',
  source_html_sha256: sha(html),
  embedded_model_module_sha256: sha(model),
  bundled_three_runtime_sha256: sha(runtimeBundle),
  output_sha256: sha(bundledHtml),
  bytes: Buffer.byteLength(bundledHtml),
  single_html_file: true,
  offline_3d_runtime: true,
  embedded: ['game-data/models/blue-alert-models.js', 'Three.js 0.160.0'],
  external_runtime_dependencies: [],
  notes: 'The procedural model kit and Three.js WebGL runtime are bundled into one HTML file. The standalone 3D game does not require a CDN or network access.'
};
await writeFile(resolve(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));
