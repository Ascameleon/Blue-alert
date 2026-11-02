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
  page.on('requestfailed', request => {
    if (request.url().includes('three.module.js')) {
      failures.push('requestfailed: ' + request.url() + ' ' + (request.failure()?.errorText || 'unknown'));
    }
  });
  page.on('response', response => {
    if (response.url().includes('three.module.js')) {
      if (response.status() >= 200 && response.status() < 300) successfulThree.push(response.url());
      else failures.push('CDN response ' + response.status() + ': ' + response.url());
    }
  });
}
async function loadGame(page, options = {}) {
  watch(page);
  const params = new URLSearchParams();
  if (options.combatVfx) params.set('qa', '1');
  if (options.combatRig) params.set('combat-rig', '1');
  if (options.buildQa) params.set('build-zone', '1');
  if (options.environment) params.set('environment', '1');
  const query = params.toString();
  const response = await page.goto(url + (query ? '?' + query : ''), { waitUntil: 'domcontentloaded', timeout: 60000 });
  assert.equal(response?.status(), 200, 'v94 game HTML must load');
  await page.waitForFunction(() => {
    const canvas = document.querySelector('#viewport canvas');
    const fallback = document.getElementById('blue2dFallback');
    const runtimeError = document.getElementById('blueRuntimeError');
    const startupError = document.getElementById('blueStartupError');
    return (canvas && canvas.width > 0 && canvas.height > 0) || fallback || runtimeError || startupError;
  }, null, { timeout: 30000 });
  const startupState = await page.evaluate(() => {
    const canvas = document.querySelector('#viewport canvas');
    const fallback = document.getElementById('blue2dFallback');
    const runtimeError = document.getElementById('blueRuntimeError');
    const startupError = document.getElementById('blueStartupError');
    return {
      canvas: !!canvas,
      canvasWidth: canvas?.width || 0,
      canvasHeight: canvas?.height || 0,
      fallback: !!fallback,
      fallbackText: fallback?.innerText || '',
      runtimeError: !!runtimeError,
      runtimeText: runtimeError?.innerText || '',
      startupError: !!startupError,
      startupText: startupError?.innerText || ''
    };
  });
  assert.ok(startupState.canvas && !startupState.fallback && !startupState.runtimeError && !startupState.startupError,
    '3D startup must complete without fallback or error UI: ' + JSON.stringify(startupState));
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
      terrain: window.__BLUE_ALERTS_TERRAIN || null,
      terrainDressing: window.__BLUE_ALERTS_TERRAIN_DRESSING || null,
      vegetation: window.__BLUE_ALERTS_VEGETATION || null,
      environment: window.__BLUE_ALERTS_ENVIRONMENT || null
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
  await loadGame(desktop, { combatRig: true, combatVfx: true, buildQa: true, environment: true });
  const desktopMetrics = await metrics(desktop);
  assert.ok(desktopMetrics.webgl && !desktopMetrics.contextLost, 'desktop must render with a live WebGL context');
  assert.ok(desktopMetrics.canvasRect.width >= 1100 && desktopMetrics.canvasRect.height >= 650, 'desktop battlefield canvas must be visible at usable size');
  assert.ok(desktopMetrics.startOverlayHidden && !desktopMetrics.fallback && !desktopMetrics.runtimeError && !desktopMetrics.startupError, 'desktop game must start in the 3D runtime without fallback/errors');
  assert.ok(desktopMetrics.terrain?.vertexColors && desktopMetrics.terrain.vertexCount > 2000 && desktopMetrics.terrain.colorCount === desktopMetrics.terrain.vertexCount, 'desktop terrain must expose a complete deterministic vertex-color field');
  assert.ok(desktopMetrics.terrain?.albedoMap && desktopMetrics.terrain.surfaceMode === 'procedural-soil-stone-ruts' && desktopMetrics.terrain.textureResolution === 512 && desktopMetrics.terrain.textureChecksum > 0 && desktopMetrics.terrain.soilCoverage > 0.05 && desktopMetrics.terrain.roadRutsCoverage > 0.005 && desktopMetrics.terrain.anisotropy >= 1, 'desktop terrain must use a deterministic 512px procedural albedo surface');
  assert.ok(desktopMetrics.terrainDressing?.scrubInstances >= 160 && desktopMetrics.terrainDressing.roadMarkers === 26,
    'desktop battlefield must include instanced scrub and reflective supply-road markers');
  assert.ok(desktopMetrics.vegetation?.treeCount >= 50 &&
    desktopMetrics.vegetation.trunkInstances === desktopMetrics.vegetation.treeCount &&
    desktopMetrics.vegetation.foliageInstances === desktopMetrics.vegetation.treeCount &&
    desktopMetrics.vegetation.foliageTiers === 3 && desktopMetrics.vegetation.rockInstances >= 30 &&
    desktopMetrics.vegetation.renderGroups === 3 && desktopMetrics.vegetation.blocksMovement === false,
    'desktop vegetation must render layered tree silhouettes and field rocks in three non-blocking instanced groups');
  assert.ok(desktopMetrics.environment?.runtimeIntegrated &&
    desktopMetrics.environment.clusterCount === 4 &&
    desktopMetrics.environment.cargoCrates === 18 &&
    desktopMetrics.environment.hazardBarrels === 8 &&
    desktopMetrics.environment.clearanceZones === 4 &&
    desktopMetrics.environment.blocksMovement === false,
    'desktop V94 must contain four non-blocking industrial clusters, 18 instanced crates and eight barrels');
  const buildBefore = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILD_QA?.snapshot());
  assert.ok(buildBefore, 'build-zone QA diagnostics must be available');
  assert.ok(buildBefore.hq.modelsLoaded, 'the procedural model library must load from inside the single HTML file');
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

  const desktopCombatBefore = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
  assert.ok(desktopCombatBefore?.livingBlueCombatUnits > 0 && desktopCombatBefore?.livingRedCombatUnits > 0, 'desktop combat QA must find live units on both factions');
  assert.ok(desktopCombatBefore.started && !desktopCombatBefore.gameOver, 'desktop gameplay simulation must be active before VFX tests');
  assert.equal(desktopCombatBefore.modelProjectiles, 0, 'desktop VFX test must start without active procedural projectiles');
  const desktopShot = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.fire());
  assert.equal(desktopShot.modelProjectiles, 1, 'desktop live combat must use the procedural projectile model');
  assert.equal(desktopShot.modelMuzzleFlashes, 1, 'desktop live combat must show the procedural muzzle flash');
  await desktop.waitForTimeout(35);
  await desktop.screenshot({ path: output + '/desktop-v94-projectile-vfx.png', fullPage: true });
  try {
    await desktop.waitForFunction(sequence => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      return state && state.impactSequence > sequence && state.impactRings > 0 && state.impactSparks > 0;
    }, desktopShot.impactSequence, { timeout: 6000, polling: 50 });
  } catch (error) {
    const state = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
    console.log('DESKTOP_IMPACT_TIMEOUT ' + JSON.stringify({ shot: desktopShot, state }));
    throw error;
  }
  const desktopImpact = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.state());
  console.log('DESKTOP_PROJECTILE_IMPACT ' + JSON.stringify(desktopImpact));
  assert.ok(desktopImpact.lastImpactEvent?.id > desktopShot.impactSequence && desktopImpact.lastImpactEvent.ringCount === 1 && desktopImpact.lastImpactEvent.sparkCount >= 4,
    'desktop projectile hit must record a real shock ring and spark burst');
  await desktop.screenshot({ path: output + '/desktop-v94-impact-vfx.png', fullPage: true });

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
        state.modelMuzzleFlashes === 0 && state.modelExplosions === 0 && state.impactRings === 0 && state.impactSparks === 0;
    }, null, { timeout: 10000 });
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

  const desktopBuildingStart = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__.fireToStage(1));
  console.log('DESKTOP_BUILDING_STAGE1_START ' + JSON.stringify(desktopBuildingStart));
  try {
    await desktop.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot();
      return state && state.damageStage === 1 && state.hp <= state.maxHp * 0.55 &&
        state.hp > state.maxHp * 0.25 && state.smokeSpawned > 0;
    }, null, { timeout: 7000, polling: 50 });
  } catch (error) {
    const state = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
    console.log('DESKTOP_BUILDING_STAGE1_TIMEOUT ' + JSON.stringify({ start: desktopBuildingStart, state }));
    throw error;
  }
  const desktopBuildingStage1 = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
  assert.ok(desktopBuildingStage1 && desktopBuildingStage1.hp <= desktopBuildingStage1.maxHp * 0.55 &&
    desktopBuildingStage1.hp > desktopBuildingStage1.maxHp * 0.25 && desktopBuildingStage1.damageStage === 1 &&
    desktopBuildingStage1.smokeSpawned > 0,
    'desktop building must enter damaged state with visible smoke after real projectile hits');
  await desktop.screenshot({ path: output + '/desktop-v94-building-damaged.png', fullPage: true });
  const desktopBuildingCriticalStart = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__.fireToStage(2));
  console.log('DESKTOP_BUILDING_STAGE2_START ' + JSON.stringify(desktopBuildingCriticalStart));
  try {
    await desktop.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot();
      return state && state.damageStage === 2 && state.hp <= state.maxHp * 0.25 &&
        state.hp > 0 && state.scorchMark && state.flamesSpawned > 0;
    }, null, { timeout: 7000, polling: 50 });
  } catch (error) {
    const state = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
    console.log('DESKTOP_BUILDING_STAGE2_TIMEOUT ' + JSON.stringify({ start: desktopBuildingCriticalStart, state }));
    throw error;
  }
  const desktopBuildingStage2 = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
  console.log('DESKTOP_BUILDING_DAMAGE ' + JSON.stringify({ start: desktopBuildingStart, stage1: desktopBuildingStage1, criticalStart: desktopBuildingCriticalStart, stage2: desktopBuildingStage2 }));
  assert.ok(desktopBuildingStage2 && desktopBuildingStage2.hp <= desktopBuildingStage2.maxHp * 0.25 &&
    desktopBuildingStage2.hp > 0 && desktopBuildingStage2.scorchMark && desktopBuildingStage2.flamesSpawned > 0,
    'desktop critical building damage must show scorch and fire while the building remains alive');
  await desktop.screenshot({ path: output + '/desktop-v94-building-critical.png', fullPage: true });
  // Capture the authored industrial set after all camera-sensitive gameplay
  // assertions so the visual focus cannot disturb construction projection tests.
  const industrialFocus = await desktop.evaluate(() => window.__BLUE_ALERTS_ENVIRONMENT_QA?.focus('gantry'));
  assert.equal(industrialFocus?.name, 'gantry', 'industrial yard visual focus must be available for evidence capture');
  await desktop.waitForTimeout(650);
  await desktop.screenshot({ path: output + '/desktop-v94-industrial-yard.png', fullPage: true });
  const terrainFocus = await desktop.evaluate(() => window.__BLUE_ALERTS_TERRAIN_QA?.focus());
  assert.equal(terrainFocus?.textureResolution, 512, 'desktop terrain detail focus must be available');
  await desktop.waitForTimeout(300);
  await desktop.screenshot({ path: output + '/desktop-v94-terrain-surface.png', fullPage: true });

  // Release the desktop WebGL context before opening the mobile viewport. This
  // keeps the mobile assertion independent of concurrent GPU/context pressure.
  await desktop.close();
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true
  });
  await loadGame(mobile, { combatVfx: true, buildQa: true, environment: true });
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
  assert.ok(mobileMetrics.terrain?.albedoMap && mobileMetrics.terrain.surfaceMode === 'procedural-soil-stone-ruts' && mobileMetrics.terrain.textureResolution === 256 && mobileMetrics.terrain.textureChecksum > 0 && mobileMetrics.terrain.soilCoverage > 0.05 && mobileMetrics.terrain.roadRutsCoverage > 0.005 && mobileMetrics.terrain.anisotropy <= 2, 'mobile terrain must use a deterministic 256px procedural albedo surface with capped anisotropy');
  assert.ok(mobileMetrics.vegetation?.treeCount >= 30 &&
    mobileMetrics.vegetation.trunkInstances === mobileMetrics.vegetation.treeCount &&
    mobileMetrics.vegetation.foliageInstances === mobileMetrics.vegetation.treeCount &&
    mobileMetrics.vegetation.foliageTiers === 3 && mobileMetrics.vegetation.rockInstances >= 15 &&
    mobileMetrics.vegetation.renderGroups === 3 && mobileMetrics.vegetation.blocksMovement === false,
    'mobile vegetation must preserve layered trees and instanced rocks without blocking gameplay');
  assert.ok(mobileMetrics.environment?.runtimeIntegrated &&
    mobileMetrics.environment.clusterCount === 4 &&
    mobileMetrics.environment.cargoCrates === 18 &&
    mobileMetrics.environment.hazardBarrels === 8 &&
    mobileMetrics.environment.clearanceZones === 4 &&
    mobileMetrics.environment.blocksMovement === false,
    'mobile V94 must retain the industrial set without marking gameplay lanes as blocked');
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
const mobileCommandsBox = await mobile.locator('#mobileCommands').boundingBox();
  await mobile.screenshot({ path: 'artifacts/v94-browser/mobile-v94-gameplay-390x844.png', fullPage: false });
  const mobileHQBadgeBox = await mobile.locator('#mobileHQBadge').boundingBox();
  assert.ok(mobileCommandsBox && mobileHQBadgeBox && mobileHQBadgeBox.y >= mobileCommandsBox.y + mobileCommandsBox.height + 6,
    'the dedicated HQ badge must remain visible below the mobile command dock');
  assert.equal(await mobile.locator('#mobileHQBadge').textContent(), 'QG • BASE ALPHA',
    'mobile HUD must identify the blue command HQ');
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

  const mobileCombatBefore = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
  assert.ok(mobileCombatBefore?.livingBlueCombatUnits > 0 && mobileCombatBefore?.livingRedCombatUnits > 0, 'mobile combat QA must find live units on both factions');
  assert.ok(mobileCombatBefore.started && !mobileCombatBefore.gameOver, 'mobile gameplay simulation must be active before VFX tests');
  // Keep the mobile page foregrounded: Chromium may throttle requestAnimationFrame on a background page.
  await mobile.bringToFront();
  await mobile.waitForFunction(() => document.visibilityState === 'visible', null, { timeout: 3000 });
  const mobileShot = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.fire());
  assert.equal(mobileShot.modelProjectiles, 1, 'mobile live combat must use the procedural projectile model');
  assert.equal(mobileShot.modelMuzzleFlashes, 1, 'mobile live combat must show the procedural muzzle flash');
  await mobile.waitForTimeout(35);
  await mobile.screenshot({ path: output + '/mobile-v94-projectile-vfx-390x844.png', fullPage: true });
  try {
    await mobile.waitForFunction(sequence => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      return state && state.impactSequence > sequence && state.impactRings > 0 && state.impactSparks > 0;
    }, mobileShot.impactSequence, { timeout: 9000, polling: 50 });
  } catch (error) {
    const state = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
    console.log('MOBILE_IMPACT_TIMEOUT ' + JSON.stringify({ shot: mobileShot, state }));
    throw error;
  }
  const mobileImpact = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.state());
  console.log('MOBILE_PROJECTILE_IMPACT ' + JSON.stringify(mobileImpact));
  assert.ok(mobileImpact.lastImpactEvent?.id > mobileShot.impactSequence && mobileImpact.lastImpactEvent.ringCount === 1 && mobileImpact.lastImpactEvent.sparkCount >= 4,
    'mobile projectile hit must record a real shock ring and spark burst');
  await mobile.screenshot({ path: output + '/mobile-v94-impact-vfx-390x844.png', fullPage: true });

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
  const mobileCleanupStartedAt = Date.now();
  try {
    await mobile.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      return state && state.activeProjectiles === 0 && state.modelProjectiles === 0 &&
        state.modelMuzzleFlashes === 0 && state.modelExplosions === 0 && state.impactRings === 0 && state.impactSparks === 0;
    }, null, { timeout: 8000 });
  } catch (error) {
    const state = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
    console.log('MOBILE_VFX_CLEANUP_TIMEOUT ' + JSON.stringify(state));
    throw error;
  }
  const mobileClean = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.state());
  const mobileCleanupElapsedMs = Date.now() - mobileCleanupStartedAt;
  console.log('MOBILE_VFX_CLEANUP_PERFORMANCE ' + JSON.stringify({
    elapsedMs: mobileCleanupElapsedMs,
    framesAdvanced: mobileClean.frameCount - mobileKill.frameCount,
    simulatedSeconds: Number((mobileClean.time - mobileKill.time).toFixed(3)),
    averageFps: Number(((mobileClean.frameCount - mobileKill.frameCount) / Math.max(0.001, mobileCleanupElapsedMs / 1000)).toFixed(1))
  }));
  console.log('MOBILE_COMBAT_VFX ' + JSON.stringify({ shot: mobileShot, kill: mobileKill, afterCleanup: mobileClean }));

  const mobileBuildingStart = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__.fireToStage(1));
  console.log('MOBILE_BUILDING_STAGE1_START ' + JSON.stringify(mobileBuildingStart));
  try {
    await mobile.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot();
      return state && state.damageStage === 1 && state.hp <= state.maxHp * 0.55 &&
        state.hp > state.maxHp * 0.25 && state.smokeSpawned > 0;
    }, null, { timeout: 7000, polling: 50 });
  } catch (error) {
    const state = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
    console.log('MOBILE_BUILDING_STAGE1_TIMEOUT ' + JSON.stringify({ start: mobileBuildingStart, state }));
    throw error;
  }
  const mobileBuildingStage1 = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
  assert.ok(mobileBuildingStage1 && mobileBuildingStage1.hp <= mobileBuildingStage1.maxHp * 0.55 &&
    mobileBuildingStage1.hp > mobileBuildingStage1.maxHp * 0.25 && mobileBuildingStage1.damageStage === 1 &&
    mobileBuildingStage1.smokeSpawned > 0,
    'mobile building must enter damaged state with visible smoke after real projectile hits');
  await mobile.screenshot({ path: output + '/mobile-v94-building-damaged-390x844.png', fullPage: true });
  const mobileBuildingCriticalStart = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__.fireToStage(2));
  console.log('MOBILE_BUILDING_STAGE2_START ' + JSON.stringify(mobileBuildingCriticalStart));
  try {
    await mobile.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot();
      return state && state.damageStage === 2 && state.hp <= state.maxHp * 0.25 &&
        state.hp > 0 && state.scorchMark && state.flamesSpawned > 0;
    }, null, { timeout: 7000, polling: 50 });
  } catch (error) {
    const state = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
    console.log('MOBILE_BUILDING_STAGE2_TIMEOUT ' + JSON.stringify({ start: mobileBuildingCriticalStart, state }));
    throw error;
  }
  const mobileBuildingStage2 = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
  console.log('MOBILE_BUILDING_DAMAGE ' + JSON.stringify({ start: mobileBuildingStart, stage1: mobileBuildingStage1, criticalStart: mobileBuildingCriticalStart, stage2: mobileBuildingStage2 }));
  assert.ok(mobileBuildingStage2 && mobileBuildingStage2.hp <= mobileBuildingStage2.maxHp * 0.25 &&
    mobileBuildingStage2.hp > 0 && mobileBuildingStage2.scorchMark && mobileBuildingStage2.flamesSpawned > 0,
    'mobile critical building damage must show scorch and fire while the building remains alive');
  await mobile.screenshot({ path: output + '/mobile-v94-building-critical-390x844.png', fullPage: true });
  const mobileTerrainFocus = await mobile.evaluate(() => window.__BLUE_ALERTS_TERRAIN_QA?.focus());
  assert.equal(mobileTerrainFocus?.textureResolution, 256, 'mobile terrain detail focus must be available');
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: output + '/mobile-v94-terrain-surface-390x844.png', fullPage: true });

  assert.ok(successfulThree.length > 0, 'a Three.js module must load successfully');
  assert.equal(failures.length, 0, 'browser must report no page or console errors: ' + failures.join(' | '));
  for (const file of ['desktop-v94-gameplay.png', 'mobile-v94-gameplay-390x844.png', 'desktop-v94-projectile-vfx.png', 'desktop-v94-explosion-vfx.png', 'mobile-v94-projectile-vfx-390x844.png', 'mobile-v94-explosion-vfx-390x844.png', 'desktop-v94-impact-vfx.png', 'mobile-v94-impact-vfx-390x844.png', 'desktop-v94-building-damaged.png', 'desktop-v94-building-critical.png', 'mobile-v94-building-damaged-390x844.png', 'mobile-v94-building-critical-390x844.png', 'desktop-v94-terrain-surface.png', 'mobile-v94-terrain-surface-390x844.png']) {
    assert.ok((await stat(output + '/' + file)).size > 30000, 'rendered gameplay screenshot must contain visible evidence: ' + file);
  }
  assert.ok(Number(((mobileClean.frameCount - mobileKill.frameCount) / Math.max(0.001, mobileCleanupElapsedMs / 1000)).toFixed(1)) >= 8,
    'isolated mobile RAF loop must sustain at least 8 FPS during explosion cleanup');
  console.log(JSON.stringify({
    status: 'PASS',
    desktop: desktopMetrics,
    mobile: mobileMetrics,
    touchTargets,
    mobileCommands,
    combatRig,
    muzzleError,
    successfulThree,
    screenshots: ['desktop-v94-gameplay.png', 'mobile-v94-gameplay-390x844.png', 'desktop-v94-terrain-surface.png', 'mobile-v94-terrain-surface-390x844.png']
  }, null, 2));
} catch (error) {
  console.error(error);
  if (failures.length) console.error('Browser errors:', failures);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
