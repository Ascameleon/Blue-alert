import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const allowed = new Set([
  '/BLUE_ALERTS_v94_ASSET_INTEGRATION.html',
  '/game-data/models/blue-alert-models.js'
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
const url = 'http://127.0.0.1:' + address.port + '/BLUE_ALERTS_v94_ASSET_INTEGRATION.html';
const output = resolve(root, 'artifacts/v94-browser');
await mkdir(output, { recursive: true });
let browser;
const failures = [];
const successfulThree = [];
const successfulModel = [];
function watch(page) {
  page.on('pageerror', error => failures.push('pageerror: ' + error.message));
  page.on('console', message => {
    if (message.type() === 'error') failures.push('console: ' + message.text());
  });
  page.on('response', response => {
    if (response.status() >= 200 && response.status() < 300) {
      if (response.url().includes('three.module.js')) successfulThree.push(response.url());
      if (response.url().includes('blue-alert-models.js')) successfulModel.push(response.url());
    }
  });
}
async function loadGame(page, options = {}) {
  watch(page);
  const params = new URLSearchParams();
  if (options.combatVfx) params.set('qa', '1');
  if (options.combatRig) params.set('combat-rig', '1');
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
      '--enable-unsafe-swiftshader', '--disable-dev-shm-usage',
      '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows'
    ]
  });

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await loadGame(desktop, { combatRig: true, combatVfx: true });
  await desktop.bringToFront();
  const desktopMetrics = await metrics(desktop);
  assert.ok(desktopMetrics.webgl && !desktopMetrics.contextLost, 'desktop must render with a live WebGL context');
  assert.ok(desktopMetrics.canvasRect.width >= 1100 && desktopMetrics.canvasRect.height >= 650, 'desktop battlefield canvas must be visible at usable size');
  assert.ok(desktopMetrics.startOverlayHidden && !desktopMetrics.fallback && !desktopMetrics.runtimeError && !desktopMetrics.startupError, 'desktop game must start in the 3D runtime without fallback/errors');
  assert.ok(desktopMetrics.terrain?.vertexColors && desktopMetrics.terrain.vertexCount > 2000 && desktopMetrics.terrain.colorCount === desktopMetrics.terrain.vertexCount, 'desktop terrain must expose a complete deterministic vertex-color field');
  await desktop.screenshot({ path: output + '/desktop-v94-gameplay.png', fullPage: true });
  await desktop.locator('#btnSound').click();
  await assert.equal(await desktop.locator('#btnSound').textContent(), 'Son : OFF', 'desktop sound toggle must respond');
  await desktop.locator('#btnSound').click();
  await assert.equal(await desktop.locator('#btnSound').textContent(), 'Son : ON', 'desktop sound toggle must restore');

  const desktopCombatBefore = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
  assert.ok(desktopCombatBefore?.livingBlueCombatUnits > 0 && desktopCombatBefore?.livingRedCombatUnits > 0, 'desktop combat QA must find live units on both factions');
  assert.ok(desktopCombatBefore.started && !desktopCombatBefore.gameOver, 'desktop gameplay simulation must be active before VFX tests');
  assert.equal(desktopCombatBefore.modelProjectiles, 0, 'desktop VFX test must start without active procedural projectiles');
  const desktopShot = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.fire());
  assert.equal(desktopShot.modelProjectiles, 1, 'desktop live combat must use the procedural projectile model');
  assert.equal(desktopShot.modelMuzzleFlashes, 1, 'desktop live combat must show the procedural muzzle flash');
  await desktop.waitForTimeout(35);
  await desktop.screenshot({ path: output + '/desktop-v94-projectile-vfx.png', fullPage: true });
  const desktopKill = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.destroyEnemyUnit());
  console.log('DESKTOP_UNIT_DEATH ' + JSON.stringify(desktopKill));
  assert.ok(desktopKill.targetDead && desktopKill.targetRemoved && desktopKill.killsDelta === 1 && desktopKill.creditsDelta >= 50 && desktopKill.modelExplosions === 1, 'desktop unit destruction must remove the unit, award its kill/reward and spawn the procedural explosion');
  await desktop.bringToFront();
  try {
    await desktop.waitForFunction(({ frameCount, time, life }) => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      return state && state.frameCount >= frameCount + 2 && state.time > time &&
        state.modelExplosionLives.length === 1 && state.modelExplosionLives[0] < life;
    }, {
      frameCount: desktopKill.frameCount,
      time: desktopKill.time,
      life: desktopKill.modelExplosionLives[0]
    }, { timeout: 5000, polling: 50 });
  } catch (error) {
    const diagnostic = await desktop.evaluate(() => ({
      state: window.__BLUE_ALERTS_COMBAT_QA__?.state(),
      hasFocus: document.hasFocus(),
      visibilityState: document.visibilityState
    }));
    console.log('DESKTOP_EXPLOSION_PROGRESS_TIMEOUT ' + JSON.stringify({ before: desktopKill, diagnostic }));
    throw error;
  }
  const desktopExplosionState = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.state());
  assert.equal(desktopExplosionState.modelExplosions, 1, 'desktop explosion must remain in the live scene during its authored lifetime');
  console.log('DESKTOP_EXPLOSION_LIFECYCLE ' + JSON.stringify({ before: desktopKill, after: desktopExplosionState }));
  assert.ok(desktopExplosionState.started && !desktopExplosionState.gameOver && desktopExplosionState.time > desktopKill.time, 'desktop simulation clock must advance while the explosion is alive');
  assert.ok(desktopExplosionState.frameCount >= desktopKill.frameCount + 2 && desktopExplosionState.lastFrameDelta > 0, 'desktop requestAnimationFrame loop must continue after unit destruction');
  assert.ok(desktopExplosionState.modelExplosionLives[0] < desktopKill.modelExplosionLives[0], 'desktop explosion simulation lifetime must advance');
  await desktop.screenshot({ path: output + '/desktop-v94-explosion-vfx.png', fullPage: true });
  try {
    await desktop.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      return state && state.activeProjectiles === 0 && state.modelProjectiles === 0 &&
        state.modelMuzzleFlashes === 0 && state.modelExplosions === 0;
    }, null, { timeout: 8000 });
  } catch (error) {
    const state = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
    console.log('DESKTOP_VFX_CLEANUP_TIMEOUT ' + JSON.stringify(state));
    throw error;
  }
  const desktopClean = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.state());
  console.log('DESKTOP_COMBAT_VFX ' + JSON.stringify({ shot: desktopShot, kill: desktopKill, afterCleanup: desktopClean }));

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
  await loadGame(mobile, { combatVfx: true });
  await mobile.bringToFront();
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
  await mobile.screenshot({ path: output + '/mobile-v94-gameplay-390x844.png', fullPage: true });

  const mobileCombatBefore = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
  assert.ok(mobileCombatBefore?.livingBlueCombatUnits > 0 && mobileCombatBefore?.livingRedCombatUnits > 0, 'mobile combat QA must find live units on both factions');
  assert.ok(mobileCombatBefore.started && !mobileCombatBefore.gameOver, 'mobile gameplay simulation must be active before VFX tests');
  const mobileShot = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.fire());
  assert.equal(mobileShot.modelProjectiles, 1, 'mobile live combat must use the procedural projectile model');
  assert.equal(mobileShot.modelMuzzleFlashes, 1, 'mobile live combat must show the procedural muzzle flash');
  await mobile.waitForTimeout(35);
  await mobile.screenshot({ path: output + '/mobile-v94-projectile-vfx-390x844.png', fullPage: true });
  const mobileKill = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.destroyEnemyUnit());
  console.log('MOBILE_UNIT_DEATH ' + JSON.stringify(mobileKill));
  assert.ok(mobileKill.targetDead && mobileKill.targetRemoved && mobileKill.killsDelta === 1 && mobileKill.creditsDelta >= 50 && mobileKill.modelExplosions === 1, 'mobile unit destruction must remove the unit, award its kill/reward and spawn the procedural explosion');
  await mobile.bringToFront();
  try {
    await mobile.waitForFunction(({ frameCount, time, life }) => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      return state && state.frameCount >= frameCount + 2 && state.time > time &&
        state.modelExplosionLives.length === 1 && state.modelExplosionLives[0] < life;
    }, {
      frameCount: mobileKill.frameCount,
      time: mobileKill.time,
      life: mobileKill.modelExplosionLives[0]
    }, { timeout: 5000, polling: 50 });
  } catch (error) {
    const diagnostic = await mobile.evaluate(() => ({
      state: window.__BLUE_ALERTS_COMBAT_QA__?.state(),
      hasFocus: document.hasFocus(),
      visibilityState: document.visibilityState
    }));
    console.log('MOBILE_EXPLOSION_PROGRESS_TIMEOUT ' + JSON.stringify({ before: mobileKill, diagnostic }));
    throw error;
  }
  const mobileExplosionState = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.state());
  console.log('MOBILE_EXPLOSION_LIFECYCLE ' + JSON.stringify({ before: mobileKill, after: mobileExplosionState }));
  assert.ok(mobileExplosionState.started && !mobileExplosionState.gameOver && mobileExplosionState.time > mobileKill.time, 'mobile simulation clock must advance while the explosion is alive');
  assert.ok(mobileExplosionState.frameCount >= mobileKill.frameCount + 2 && mobileExplosionState.lastFrameDelta > 0, 'mobile requestAnimationFrame loop must continue after unit destruction');
  assert.ok(mobileExplosionState.modelExplosionLives[0] < mobileKill.modelExplosionLives[0], 'mobile explosion simulation lifetime must advance');
  await mobile.screenshot({ path: output + '/mobile-v94-explosion-vfx-390x844.png', fullPage: true });
  try {
    await mobile.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      return state && state.activeProjectiles === 0 && state.modelProjectiles === 0 &&
        state.modelMuzzleFlashes === 0 && state.modelExplosions === 0;
    }, null, { timeout: 8000 });
  } catch (error) {
    const state = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
    console.log('MOBILE_VFX_CLEANUP_TIMEOUT ' + JSON.stringify(state));
    throw error;
  }
  const mobileClean = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.state());
  console.log('MOBILE_COMBAT_VFX ' + JSON.stringify({ shot: mobileShot, kill: mobileKill, afterCleanup: mobileClean }));

  assert.ok(successfulThree.length > 0, 'a Three.js module must load successfully');
  assert.ok(successfulModel.length > 0, 'the local BLUE ALERTS model module must load successfully');
  assert.equal(failures.length, 0, 'browser must report no page or console errors: ' + failures.join(' | '));
  for (const file of ['desktop-v94-gameplay.png', 'mobile-v94-gameplay-390x844.png', 'desktop-v94-projectile-vfx.png', 'desktop-v94-explosion-vfx.png', 'mobile-v94-projectile-vfx-390x844.png', 'mobile-v94-explosion-vfx-390x844.png']) {
    assert.ok((await stat(output + '/' + file)).size > 30000, 'rendered gameplay screenshot must contain visible evidence: ' + file);
  }
  console.log(JSON.stringify({
    status: 'PASS',
    desktop: desktopMetrics,
    mobile: mobileMetrics,
    touchTargets,
    combatRig,
    muzzleError,
    successfulThree,
    successfulModel,
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
