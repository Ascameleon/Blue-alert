import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const allowed = new Set([
  '/dist/BLUE_ALERTS_V94_BUILD_ZONE_JOUABLE.html'
]);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
    if (!allowed.has(pathname)) { res.writeHead(404); res.end('not found'); return; }
    const file = resolve(root, '.' + pathname);
    if (!file.startsWith(root + sep)) { res.writeHead(403); res.end('forbidden'); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': mime[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(data);
  } catch (error) {
    res.writeHead(500); res.end(String(error));
  }
});
await new Promise((resolveListen, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolveListen);
});
const address = server.address();
const url = 'http://127.0.0.1:' + address.port + '/dist/BLUE_ALERTS_V94_BUILD_ZONE_JOUABLE.html';
const output = resolve(root, 'artifacts/v94-browser');
await mkdir(output, { recursive: true });
let browser;
const failures = [];
const successfulThree = [];
function watch(page) {
  page.on('pageerror', error => failures.push('pageerror: ' + error.message));
  page.on('console', message => {
    if (message.type() === 'error') failures.push('console: ' + message.text());
  });
  page.on('response', response => {
    if (response.status() >= 200 && response.status() < 300) {
      if (response.url().includes('three.module.js')) successfulThree.push(response.url());
    }
  });
}
async function loadGame(page, combatQa = false, buildQa = false) {
  watch(page);
  const params = new URLSearchParams();
  if (combatQa) params.set('qa', 'combat-rig');
  if (buildQa) params.set('build-zone', '1');
  const query = params.toString();
  const response = await page.goto(url + (query ? '?' + query : ''), { waitUntil: 'networkidle', timeout: 60000 });
  assert.equal(response?.status(), 200, 'v94 game HTML must load');
  await page.waitForFunction(() => {
    const canvas = document.querySelector('#viewport canvas');
    return canvas && canvas.width > 0 && canvas.height > 0 &&
      !document.getElementById('blue2dFallback') &&
      !document.getElementById('blueRuntimeError') &&
      !document.getElementById('blueStartupError');
  }, null, { timeout: 30000 });
  await page.locator('#btnStart').click();
  await page.waitForFunction(() => document.getElementById('startOverlay')?.classList.contains('hidden'));
  await page.waitForTimeout(1200);
}
async function metrics(page) {
  return page.evaluate(() => {
    const viewport = document.querySelector('#viewport');
    const canvas = viewport?.querySelector('canvas');
    const vr = viewport?.getBoundingClientRect();
    const cr = canvas?.getBoundingClientRect();
    const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
    return {
      viewportWidth: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      viewportRect: { width: vr?.width || 0, height: vr?.height || 0 },
      canvasRect: { width: cr?.width || 0, height: cr?.height || 0 },
      canvasBacking: { width: canvas?.width || 0, height: canvas?.height || 0 },
      webgl: !!gl,
      contextLost: gl ? gl.isContextLost() : true,
      renderer: gl ? gl.getParameter(gl.RENDERER) : 'unavailable',
      startOverlayHidden: document.getElementById('startOverlay')?.classList.contains('hidden'),
      fallback: !!document.getElementById('blue2dFallback'),
      runtimeError: !!document.getElementById('blueRuntimeError'),
      startupError: !!document.getElementById('blueStartupError'),
      terrain: window.__BLUE_ALERTS_TERRAIN || null
    };
  });
}
try {
  browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-webgl', '--ignore-gpu-blocklist',
      '--use-gl=angle', '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'
    ]
  });

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await loadGame(desktop, true, true);
  const desktopMetrics = await metrics(desktop);
  assert.ok(desktopMetrics.webgl && !desktopMetrics.contextLost, 'desktop must render with a live WebGL context');
  assert.ok(desktopMetrics.canvasRect.width >= 1100 && desktopMetrics.canvasRect.height >= 650, 'desktop battlefield canvas must be visible at usable size');
  assert.ok(desktopMetrics.startOverlayHidden && !desktopMetrics.fallback && !desktopMetrics.runtimeError && !desktopMetrics.startupError, 'desktop game must start in the 3D runtime without fallback/errors');
  assert.ok(desktopMetrics.terrain?.vertexColors && desktopMetrics.terrain.vertexCount > 2000 && desktopMetrics.terrain.colorCount === desktopMetrics.terrain.vertexCount, 'desktop terrain must expose a complete deterministic vertex-color field');
  const buildBefore = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILD_QA?.snapshot());
  assert.ok(buildBefore, 'build-zone QA diagnostics must be available');
  assert.ok(buildBefore.modelsLoaded, 'the procedural model library must load from inside the single HTML file');
  assert.ok(buildBefore.hq.team === 1 && buildBefore.hq.labelVisible && buildBefore.hq.perimeterVisible &&
    buildBefore.hq.labelY < 6.5 && buildBefore.hq.modelScale >= 1.3,
    'the player command HQ must be enlarged and its label kept below the mobile HUD');
  assert.ok(buildBefore.pads.every(p => p.pad && p.grid && p.border),
    'both construction pads must have visible ground, grid and perimeter');
  assert.ok(buildBefore.placement.clearNorth.ok,
    'an empty position inside the marked base pads must be buildable');
  assert.ok(!buildBefore.placement.outside.ok && !buildBefore.placement.road.ok &&
    !buildBefore.placement.overlap.ok && !buildBefore.placement.ore.ok,
    'enemy territory, road, occupied structures and ore deposits must reject construction');
  await desktop.waitForTimeout(2800);
  await desktop.screenshot({ path: output + '/desktop-v94-gameplay.png', fullPage: true });

  // Real mouse input: place a power station on the pad, then prove invalid ground
  // clicks do not spend credits or create structures.
  const buildPoint = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILD_QA.projectWorld(-24, -12));
  assert.ok(buildPoint.visible, 'valid construction test point must be visible on desktop');
  await desktop.locator('#cards .card').first().click();
  await desktop.mouse.move(buildPoint.x, buildPoint.y);
  await desktop.mouse.click(buildPoint.x, buildPoint.y);
  await desktop.waitForFunction(
    count => window.__BLUE_ALERTS_BUILD_QA.snapshot().playerBuildingCount === count + 1,
    buildBefore.playerBuildingCount,
    { timeout: 5000 }
  );
  const buildAfter = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILD_QA.snapshot());
  assert.equal(buildAfter.credits, buildBefore.credits - 350,
    'a successful power-station placement must deduct exactly its configured cost');

  const afterValidCount = buildAfter.playerBuildingCount;
  const afterValidCredits = buildAfter.credits;
  const roadPoint = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILD_QA.projectWorld(-12, 0));
  const outsidePoint = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILD_QA.projectWorld(0, 12));
  assert.ok(roadPoint.visible && outsidePoint.visible,
    'road and enemy-side rejection points must be visible on desktop');
  for (const point of [roadPoint, outsidePoint]) {
    await desktop.mouse.move(point.x, point.y);
    await desktop.mouse.click(point.x, point.y);
    await desktop.waitForTimeout(80);
    const rejected = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILD_QA.snapshot());
    assert.equal(rejected.playerBuildingCount, afterValidCount,
      'an invalid placement must not create a structure');
    assert.equal(rejected.credits, afterValidCredits,
      'an invalid placement must not consume credits');
  }

  await desktop.locator('#btnSound').click();
  await assert.equal(await desktop.locator('#btnSound').textContent(), 'Son : OFF', 'desktop sound toggle must respond');
  await desktop.locator('#btnSound').click();
  await assert.equal(await desktop.locator('#btnSound').textContent(), 'Son : ON', 'desktop sound toggle must restore');

  const combatProbe = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA.arm());
  assert.ok(combatProbe.shooterId && combatProbe.targetId, 'combat probe must arm real in-game 3D units');
  await desktop.waitForFunction(() => {
    const state = window.__BLUE_ALERTS_COMBAT_QA?.snapshot();
    return state && state.projectileStart && state.flashVisible && state.flashOpacity > 0.05;
  }, null, { timeout: 5000 });
  const combatRig = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA.snapshot());
  const muzzleError = Math.hypot(
    combatRig.projectileStart[0] - combatRig.muzzleWorld[0],
    combatRig.projectileStart[1] - combatRig.muzzleWorld[1],
    combatRig.projectileStart[2] - combatRig.muzzleWorld[2]
  );
  assert.ok(combatRig.turretAvailable && combatRig.alignment > 0.995,
    'detailed 3D tank turret must align with the target in world space');
  assert.ok(combatRig.flashVisible && combatRig.flashOpacity > 0.05,
    'detailed 3D tank must render its muzzle flash during firing');
  assert.ok(muzzleError < 0.05,
    'projectile must originate at the detailed tank muzzle, error=' + muzzleError.toFixed(4));

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true
  });
  await loadGame(mobile, false, true);
  const mobileMetrics = await metrics(mobile);
  const touchTargets = await mobile.evaluate(() => {
    const tabs = [...document.querySelectorAll('#sidebar .tab')].map(el => {
      const r = el.getBoundingClientRect();
      return { width: r.width, height: r.height, text: el.textContent.trim() };
    });
    const card = document.querySelector('#cards .card');
    const r = card?.getBoundingClientRect();
    return {
      tabs,
      firstCard: r ? { width: r.width, height: r.height } : null,
      sidebarHeight: document.querySelector('#sidebar').getBoundingClientRect().height
    };
  });
  assert.ok(mobileMetrics.webgl && !mobileMetrics.contextLost, 'mobile viewport must render with a live WebGL context');
  assert.ok(mobileMetrics.documentWidth <= mobileMetrics.viewportWidth + 1, 'mobile game must not overflow horizontally');
  assert.ok(mobileMetrics.canvasRect.width >= 380 && mobileMetrics.canvasRect.height >= 600, 'mobile battlefield must retain a usable touch area');
  assert.ok(mobileMetrics.startOverlayHidden && !mobileMetrics.fallback && !mobileMetrics.runtimeError && !mobileMetrics.startupError, 'mobile game must start in the 3D runtime without fallback/errors');
  assert.ok(mobileMetrics.terrain?.vertexColors && mobileMetrics.terrain.vertexCount > 2000 && mobileMetrics.terrain.colorCount === mobileMetrics.terrain.vertexCount, 'mobile terrain must retain the complete vertex-color field');
  assert.equal(touchTargets.tabs.length, 3, 'all three mobile sidebar tabs must be present');
  assert.ok(touchTargets.tabs.every(t => t.width >= 44 && t.height >= 44), 'every mobile tab must meet the 44px touch-target minimum');
  assert.ok(touchTargets.firstCard && touchTargets.firstCard.width >= 60 && touchTargets.firstCard.height >= 44, 'mobile build cards must remain tappable');
  const tabBox = await mobile.locator('#sidebar .tab[data-t="units"]').boundingBox();
  await mobile.touchscreen.tap(tabBox.x + tabBox.width / 2, tabBox.y + tabBox.height / 2);
  await assert.ok(await mobile.locator('#sidebar .tab[data-t="units"]').evaluate(el => el.classList.contains('active')), 'mobile touch must switch the unit tab');

  const mobileCommands = await mobile.evaluate(() => {
    const ids = ['mobileSelect', 'mobileAttack', 'mobileStop', 'mobileCenter', 'mobileSound'];
    return ids.map(id => {
      const el = document.getElementById(id);
      const r = el?.getBoundingClientRect();
      return { id, visible: !!el && getComputedStyle(el).display !== 'none' && r.width > 0 && r.height > 0,
        width: r?.width || 0, height: r?.height || 0 };
    });
  });
  assert.equal(mobileCommands.length, 5, 'all five mobile command controls must exist');
  assert.ok(mobileCommands.every(c => c.visible && c.width >= 44 && c.height >= 44),
    'all five mobile command controls must be visible and meet the 44x44px touch-target minimum');

  await mobile.locator('#mobileSelect').tap();
  assert.ok(await mobile.locator('#selinfo').evaluate(el => getComputedStyle(el).display !== 'none'),
    'mobile Select All must update the visible selection panel');

  await mobile.locator('#mobileAttack').tap();
  assert.equal(await mobile.locator('#mobileAttack').getAttribute('aria-pressed'), 'true',
    'mobile Attack-move must expose its active state');
  assert.equal((await mobile.locator('#cmdMode').textContent()).trim(), 'ATTACK-MOVE',
    'mobile Attack-move must update the command HUD');
  await mobile.locator('#mobileStop').tap();
  assert.equal(await mobile.locator('#mobileAttack').getAttribute('aria-pressed'), 'false',
    'Stop must clear the mobile Attack-move active state');
  assert.equal((await mobile.locator('#cmdMode').textContent()).trim(), 'SÉLECTION',
    'Stop must restore the selection command HUD');

  await mobile.locator('#mobileAttack').tap();
  await mobile.locator('#viewport canvas').tap({ position: { x: 190, y: 250 } });
  assert.equal(await mobile.locator('#mobileAttack').getAttribute('aria-pressed'), 'false',
    'issuing an Attack-move ground order must clear the mobile active state');
  assert.equal((await mobile.locator('#cmdMode').textContent()).trim(), 'SÉLECTION',
    'issuing an Attack-move ground order must restore the selection command HUD');

  await mobile.keyboard.press('a');
  assert.equal(await mobile.locator('#mobileAttack').getAttribute('aria-pressed'), 'true',
    'keyboard Attack-move must synchronize the mobile pressed state');
  await mobile.keyboard.press('Escape');
  assert.equal(await mobile.locator('#mobileAttack').getAttribute('aria-pressed'), 'false',
    'Escape must clear the mobile Attack-move pressed state');

  await mobile.locator('#mobileSound').tap();
  assert.equal(await mobile.locator('#mobileSound').getAttribute('aria-pressed'), 'false',
    'mobile sound toggle must expose OFF state');
  assert.equal((await mobile.locator('#mobileSound').textContent()).trim(), 'Son OFF',
    'mobile sound toggle label must show OFF');
  assert.equal((await mobile.locator('#btnSound').textContent()).trim(), 'Son : OFF',
    'mobile sound toggle must synchronize the desktop sound control');
  await mobile.locator('#mobileSound').tap();
  assert.equal(await mobile.locator('#mobileSound').getAttribute('aria-pressed'), 'true',
    'mobile sound toggle must restore ON state');
  assert.equal((await mobile.locator('#btnSound').textContent()).trim(), 'Son : ON',
    'mobile sound toggle must restore the desktop sound control');

  await mobile.locator('#mobileCenter').tap();
  await mobile.locator('.tab[data-t="struct"]').tap();
  const mobileBuildBefore = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILD_QA?.snapshot());
  assert.ok(mobileBuildBefore && mobileBuildBefore.pads.every(p => p.pad && p.grid && p.border),
    'mobile must render the same two construction pads');
  await mobile.waitForTimeout(2800);
  await mobile.screenshot({ path: output + '/mobile-v94-gameplay-390x844.png', fullPage: true });

  // Real touch placement on the 390x844 mobile viewport.
  const mobileBuildPoint = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILD_QA.projectWorld(-24, -12));
  assert.ok(mobileBuildPoint.visible, 'mobile construction target must be visible above the bottom HUD');
  await mobile.locator('#cards .card').first().tap();
  await mobile.touchscreen.tap(mobileBuildPoint.x, mobileBuildPoint.y);
  await mobile.waitForFunction(
    count => window.__BLUE_ALERTS_BUILD_QA.snapshot().playerBuildingCount === count + 1,
    mobileBuildBefore.playerBuildingCount,
    { timeout: 5000 }
  );
  const mobileBuildAfter = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILD_QA.snapshot());
  assert.equal(mobileBuildAfter.credits, mobileBuildBefore.credits - 350,
    'a real mobile touch placement must deduct the configured power-station cost');

  assert.ok(successfulThree.length > 0, 'a Three.js module must load successfully');
  assert.equal(failures.length, 0, 'browser must report no page or console errors: ' + failures.join(' | '));
  for (const file of ['desktop-v94-gameplay.png', 'mobile-v94-gameplay-390x844.png']) {
    assert.ok((await stat(output + '/' + file)).size > 30000, 'rendered gameplay screenshot must contain visible evidence: ' + file);
  }
  console.log(JSON.stringify({
    status: 'PASS',
    desktop: desktopMetrics,
    mobile: mobileMetrics,
    touchTargets,
    mobileCommands,
    combatRig,
    muzzleError,
    successfulThree,
    screenshots: ['desktop-v94-gameplay.png', 'mobile-v94-gameplay-390x844.png']
  }, null, 2));
} catch (error) {
  console.error(error);
  if (failures.length) console.error('Browser errors:', failures);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
