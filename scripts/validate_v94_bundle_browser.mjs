import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const file = resolve(root, 'dist/BLUE_ALERTS_V94_BUILD_ZONE_JOUABLE.html');
const output = resolve(root, 'artifacts/v94-bundle');
await mkdir(output, { recursive: true });
const server = createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
    if (pathname !== '/game.html') { res.writeHead(404); res.end('not found'); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': extname(file) === '.html' ? 'text/html; charset=utf-8' : 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(data);
  } catch (error) { res.writeHead(500); res.end(String(error)); }
});
await new Promise((resolveListen, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolveListen); });
const address = server.address();
const url = 'http://127.0.0.1:' + address.port + '/game.html';
let browser;
const externalRequests = [];
const pageErrors = [];
try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'] });
  for (const viewport of [{name:'desktop',width:1365,height:768},{name:'mobile',width:390,height:844}]) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1, isMobile: viewport.name === 'mobile', hasTouch: viewport.name === 'mobile' });
    page.on('pageerror', error => pageErrors.push(viewport.name + ': ' + error.message));
    await page.route('**/*', route => {
      const requestUrl = route.request().url();
      if (requestUrl.startsWith('http://127.0.0.1:') || requestUrl.startsWith('data:') || requestUrl.startsWith('blob:')) return route.continue();
      externalRequests.push(requestUrl);
      return route.abort('blockedbyclient');
    });
    const response = await page.goto(url + '?qa=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
    assert.equal(response?.status(), 200, viewport.name + ' standalone HTML must load');
    await page.waitForFunction(() => {
      const engine = window.__BLUE_ALERTS_ENGINE__;
      const canvas = document.querySelector('#viewport canvas');
      return engine && canvas && canvas.width > 0 && canvas.height > 0;
    }, null, { timeout: 30000 });
    const engine = await page.evaluate(() => {
      const canvas = document.querySelector('#viewport canvas');
      const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
      return {
        diagnostics: window.__BLUE_ALERTS_ENGINE__,
        canvas: !!canvas,
        canvasWidth: canvas?.width || 0,
        canvasHeight: canvas?.height || 0,
        webglContext: !!gl,
        fallback2D: !!document.getElementById('blue2dFallback')
      };
    });
    assert.equal(engine.diagnostics.renderer, 'WebGLRenderer', viewport.name + ' must use Three.js WebGLRenderer');
    assert.equal(engine.diagnostics.camera, 'PerspectiveCamera', viewport.name + ' must use a perspective 3D camera');
    assert.equal(engine.diagnostics.threeRevision, '160', viewport.name + ' must run bundled Three.js r160');
    assert.ok(engine.webglContext && engine.canvas && !engine.fallback2D, viewport.name + ' must render WebGL without 2D fallback: ' + JSON.stringify(engine));
    await page.locator('#btnStart').click();
    await page.waitForFunction(() => window.__BLUE_ALERTS_COMBAT_QA__?.state()?.time > 0.5, null, { timeout: 10000 });
    await page.screenshot({ path: output + '/' + viewport.name + '-standalone-webgl.png', fullPage: false, animations: 'disabled', timeout: 60000 });
    console.log(viewport.name.toUpperCase() + '_OFFLINE_3D ' + JSON.stringify(engine));
    await page.close();
  }
  assert.deepEqual(externalRequests, [], 'standalone V94 runtime must not request any external network resource: ' + JSON.stringify(externalRequests));
  assert.deepEqual(pageErrors, [], 'standalone V94 runtime must not emit page errors: ' + JSON.stringify(pageErrors));
  console.log('OFFLINE_3D_BUNDLE_PASS ' + JSON.stringify({ externalRequests: externalRequests.length, pageErrors: pageErrors.length }));
} finally {
  if (browser) await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
