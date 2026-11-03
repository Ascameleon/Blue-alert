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
  if (options.freezeCombatAtStart) {
    await page.waitForFunction(
      () => typeof window.__BLUE_ALERTS_COMBAT_QA__?.freezeNewCombat === 'function',
      null,
      { timeout: 10000 }
    );
    const frozen = await page.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.freezeNewCombat());
    assert.equal(frozen?.combatSuppressed, true,
      'controlled QA must suppress autonomous combat before the simulation starts');
    assert.ok(frozen.activeProjectiles === 0 && frozen.modelProjectiles === 0 &&
      frozen.modelMuzzleFlashes === 0 && frozen.modelExplosions === 0 &&
      frozen.impactRings === 0 && frozen.impactSparks === 0,
      'controlled QA must freeze a clean combat scene before dismissing the start overlay');
  }
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
      environment: window.__BLUE_ALERTS_ENVIRONMENT || null,
      battlefieldWear: window.__BLUE_ALERTS_BATTLEFIELD_WEAR || null,
      camera: window.__BLUE_ALERTS_CAMERA_QA__?.snapshot() || null
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
  await loadGame(desktop, { combatRig: true, combatVfx: true, buildQa: true, environment: true, freezeCombatAtStart: true });
  const desktopMetrics = await metrics(desktop);
  assert.ok(desktopMetrics.webgl && !desktopMetrics.contextLost, 'desktop must render with a live WebGL context');
  assert.ok(desktopMetrics.canvasRect.width >= 1100 && desktopMetrics.canvasRect.height >= 650, 'desktop battlefield canvas must be visible at usable size');
  assert.ok(desktopMetrics.startOverlayHidden && !desktopMetrics.fallback && !desktopMetrics.runtimeError && !desktopMetrics.startupError, 'desktop game must start in the 3D runtime without fallback/errors');
  assert.equal(desktopMetrics.camera?.defaultDistance, 38, 'desktop opening camera must use the closer tactical framing');
  assert.equal(desktopMetrics.camera?.distance, 38, 'desktop opening camera must start at the authored tactical distance');
  assert.ok(desktopMetrics.battlefieldWear?.shoulderShading === 'per-segment-uniform-low-contrast' &&
    desktopMetrics.battlefieldWear?.roadShoulderSegments === 100 &&
    desktopMetrics.battlefieldWear.accessSpur &&
    desktopMetrics.battlefieldWear.tireSegments >= 100 &&
    desktopMetrics.battlefieldWear.asphaltRepairPatches === 7 &&
    desktopMetrics.battlefieldWear.crackSegments >= 40 &&
    desktopMetrics.battlefieldWear.drainGrates === 10 &&
    desktopMetrics.battlefieldWear.safetyBars === 8 &&
    desktopMetrics.battlefieldWear.blocksMovement === false &&
    desktopMetrics.battlefieldWear.renderObjects <= 8,
    'desktop battlefield must expose the connected, non-blocking logistics wear kit');

  const desktopRoadFocus = await desktop.evaluate(() => window.__BLUE_ALERTS_BATTLEFIELD_WEAR_QA?.focusRoad());
  assert.ok(desktopRoadFocus?.camera && desktopRoadFocus.visible, 'desktop road A/B focus must expose the detailed wear layer');
  const desktopRoadBaseline = await desktop.evaluate(() => window.__BLUE_ALERTS_BATTLEFIELD_WEAR_QA?.setVisible(false));
  assert.equal(desktopRoadBaseline?.visible, false, 'desktop road baseline must hide only the new wear layer');
  await desktop.waitForTimeout(300);
  await desktop.screenshot({ path: output + '/desktop-v94-road-wear-baseline.png', fullPage: false, timeout: 60000 });
  const desktopRoadDetail = await desktop.evaluate(() => window.__BLUE_ALERTS_BATTLEFIELD_WEAR_QA?.setVisible(true));
  assert.equal(desktopRoadDetail?.visible, true, 'desktop road detail must restore the complete wear layer');
  assert.deepEqual(desktopRoadDetail?.camera, desktopRoadBaseline?.camera, 'desktop road A/B must preserve camera pose');
  await desktop.waitForTimeout(300);
  await desktop.screenshot({ path: output + '/desktop-v94-road-wear-detail.png', fullPage: false, timeout: 60000 });

  const desktopCorridorFocus = await desktop.evaluate(() => window.__BLUE_ALERTS_BATTLEFIELD_WEAR_QA?.focusCorridor());
  assert.ok(desktopCorridorFocus?.camera && desktopCorridorFocus.visible, 'desktop gantry corridor focus must be available');
  const desktopCorridorBaseline = await desktop.evaluate(() => window.__BLUE_ALERTS_BATTLEFIELD_WEAR_QA?.setVisible(false));
  await desktop.waitForTimeout(300);
  await desktop.screenshot({ path: output + '/desktop-v94-logistics-corridor-wear-baseline.png', fullPage: false, timeout: 60000 });
  const desktopCorridorDetail = await desktop.evaluate(() => window.__BLUE_ALERTS_BATTLEFIELD_WEAR_QA?.setVisible(true));
  assert.deepEqual(desktopCorridorDetail?.camera, desktopCorridorBaseline?.camera, 'desktop corridor A/B must preserve camera pose');
  await desktop.waitForTimeout(300);
  await desktop.screenshot({ path: output + '/desktop-v94-logistics-corridor-wear-detail.png', fullPage: false, timeout: 60000 });
  const desktopWearReset = await desktop.evaluate(() => window.__BLUE_ALERTS_ENVIRONMENT_QA?.focus('base'));
  assert.equal(desktopWearReset?.name, 'base', 'desktop wear A/B must restore the default tactical camera before the camera test');

  await desktop.waitForTimeout(900);
  const desktopCameraBaseline = await desktop.evaluate(() => window.__BLUE_ALERTS_CAMERA_QA__?.setDistance(48));
  assert.equal(desktopCameraBaseline?.distance, 48, 'desktop A/B baseline must use the original 48-unit camera distance');
  await desktop.waitForTimeout(300);
  await desktop.screenshot({ path: output + '/desktop-v94-camera-baseline-48.png', fullPage: false, timeout: 60000 });
  const desktopCameraCloser = await desktop.evaluate(() => window.__BLUE_ALERTS_CAMERA_QA__?.setDistance(38));
  assert.equal(desktopCameraCloser?.distance, 38, 'desktop A/B improved frame must use the 38-unit camera distance');
  assert.deepEqual(desktopCameraCloser?.target, desktopCameraBaseline?.target, 'desktop A/B screenshots must preserve the exact same camera target');
  assert.equal(desktopCameraCloser?.yaw, desktopCameraBaseline?.yaw, 'desktop A/B screenshots must preserve camera yaw');
  assert.equal(desktopCameraCloser?.pitch, desktopCameraBaseline?.pitch, 'desktop A/B screenshots must preserve camera pitch');
  assert.ok(desktopCameraBaseline.distance / desktopCameraCloser.distance >= 1.2, 'desktop A/B framing must create a clearly visible scale increase of at least 20%');
  await desktop.waitForTimeout(300);
  await desktop.screenshot({ path: output + '/desktop-v94-tactical-camera-framing.png', fullPage: false, timeout: 60000 });
  assert.ok(desktopMetrics.terrain?.vertexColors && desktopMetrics.terrain.vertexCount > 2000 && desktopMetrics.terrain.colorCount === desktopMetrics.terrain.vertexCount, 'desktop terrain must expose a complete deterministic vertex-color field');
  const missionInitial = await desktop.evaluate(() => window.__BLUE_ALERTS_MISSION_QA__?.snapshot());
  assert.ok(missionInitial, 'playable mission objective diagnostics must be available');
  assert.equal(missionInitial.deliveredOre, 0, 'starting credits and ore in the field must not count as delivered resources');
  assert.equal(missionInitial.combatUnitsProduced, 0, 'starting forces must not count as newly produced combat units');
  assert.equal(missionInitial.completedCount, 0, 'mission objectives must begin incomplete');
  assert.ok(missionInitial.objectives[2].detail.includes('Verrouillée'),
    'the enemy citadel must be visibly locked until the delivery and production objectives are complete');
  const prematureCitadel = await desktop.evaluate(() => window.__BLUE_ALERTS_MISSION_QA__.destroyEnemyCitadel());
  assert.ok(!prematureCitadel.enemyCitadelDestroyed && !prematureCitadel.complete &&
    prematureCitadel.enemyCitadelAlive && prematureCitadel.enemyCitadelHp > 0,
    'premature citadel destruction must be blocked while either prerequisite objective is incomplete');
  assert.ok(await desktop.locator('#endOverlay').evaluate(el => el.classList.contains('hidden')),
    'a premature citadel attack must not end the mission or show the victory overlay');
  const missionAfterOre = await desktop.evaluate(() => window.__BLUE_ALERTS_MISSION_QA__.recordDelivery(600));
  assert.ok(missionAfterOre.objectives[0].complete && missionAfterOre.completedCount === 1,
    'the mineral objective must complete only after a real delivery event is recorded');
  const missionAfterProduction = await desktop.evaluate(() => {
    for (let i = 0; i < 3; i++) window.__BLUE_ALERTS_MISSION_QA__.recordProduction('light');
    return window.__BLUE_ALERTS_MISSION_QA__.snapshot();
  });
  assert.ok(missionAfterProduction.objectives[1].complete && missionAfterProduction.completedCount === 2 &&
    !missionAfterProduction.objectives[2].complete && missionAfterProduction.progressPercent >= 66,
    'the force objective must count three produced combat units without completing the citadel objective');
  console.log('DESKTOP_MISSION_OBJECTIVES ' + JSON.stringify({ initial: missionInitial, afterOre: missionAfterOre, afterProduction: missionAfterProduction }));
  assert.ok(desktopMetrics.terrain?.albedoMap && desktopMetrics.terrain.roughnessMap && desktopMetrics.terrain.bumpMap && desktopMetrics.terrain.surfaceTextureCount === 3 && desktopMetrics.terrain.surfaceMode === 'procedural-albedo-roughness-relief-v2' && desktopMetrics.terrain.bumpScale === 0.11 && desktopMetrics.terrain.textureResolution === 512 && desktopMetrics.terrain.textureChecksum > 0 && desktopMetrics.terrain.anisotropy >= 1, 'desktop terrain must use deterministic 512px albedo, roughness and micro-relief maps');
  assert.ok(desktopMetrics.terrainDressing?.scrubInstances >= 160 && desktopMetrics.terrainDressing.roadMarkers === 26,
    'desktop battlefield must include instanced scrub and reflective supply-road markers');
  assert.ok(desktopMetrics.vegetation?.treeCount >= 50 &&
    desktopMetrics.vegetation.trunkInstances === desktopMetrics.vegetation.treeCount &&
    desktopMetrics.vegetation.foliageInstances === desktopMetrics.vegetation.treeCount &&
    desktopMetrics.vegetation.foliageTiers === 3 &&
    desktopMetrics.vegetation.branchWhorls === 3 &&
    desktopMetrics.vegetation.branchArms >= 17 &&
    desktopMetrics.vegetation.needleSpraysPerArm === 3 &&
    desktopMetrics.vegetation.needleClusters === desktopMetrics.vegetation.branchArms * 3 &&
    desktopMetrics.vegetation.needleClusters >= 51 &&
    desktopMetrics.vegetation.foliageTriangles >= 1500 &&
    desktopMetrics.vegetation.rockInstances >= 30 &&
    desktopMetrics.vegetation.renderGroups === 3 && desktopMetrics.vegetation.blocksMovement === false,
    'desktop vegetation must render detailed instanced evergreen branch whorls and needle clusters without adding draw groups');
  assert.ok(desktopMetrics.environment?.runtimeIntegrated &&
    desktopMetrics.environment.clusterCount === 4 &&
    desktopMetrics.environment.cargoCrates === 18 &&
    desktopMetrics.environment.hazardBarrels === 8 &&
    desktopMetrics.environment.clearanceZones === 4 &&
    desktopMetrics.environment.blocksMovement === false,
    'desktop V94 must contain four non-blocking industrial clusters, 18 instanced crates and eight barrels');
  const desktopEconomyFreeze = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.freezeEconomyRewards());
  assert.ok(desktopEconomyFreeze?.economyRewardsFrozen, 'desktop construction-cost QA must freeze asynchronous reward credits');
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
  await desktop.screenshot({ path: output + '/desktop-v94-gameplay.png', fullPage: false, timeout: 60000 });


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
  const desktopEconomyResume = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.resumeEconomyRewards());
  assert.equal(desktopEconomyResume?.economyRewardsFrozen, false, 'desktop construction-cost QA must restore economy rewards after the placement assertions');

  await desktop.locator('#btnSound').click();
  await assert.equal(await desktop.locator('#btnSound').textContent(), 'Son : OFF', 'desktop sound toggle must respond');
  await desktop.locator('#btnSound').click();
  await assert.equal(await desktop.locator('#btnSound').textContent(), 'Son : ON', 'desktop sound toggle must restore');

  const desktopCombatFreeze = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
  assert.ok(desktopCombatFreeze?.combatSuppressed === true,
    'desktop controlled VFX QA must remain suppressed from simulation start');
  try {
    await desktop.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      return state && state.activeProjectiles === 0 && state.modelProjectiles === 0 &&
        state.modelMuzzleFlashes === 0 && state.modelExplosions === 0 &&
        state.impactRings === 0 && state.impactSparks === 0;
    }, null, { timeout: 15000, polling: 50 });
  } catch (error) {
    const state = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
    console.log('DESKTOP_PRE_VFX_COMBAT_DRAIN_TIMEOUT ' + JSON.stringify(state));
    throw error;
  }
  const desktopCombatBefore = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
  assert.ok(desktopCombatBefore?.livingBlueCombatUnits > 0 && desktopCombatBefore?.livingRedCombatUnits > 0, 'desktop combat QA must find live units on both factions');
  assert.equal(desktopCombatBefore?.combatSuppressed, true, 'desktop controlled VFX probe must remain isolated from autonomous combat');
  assert.ok(desktopCombatBefore.started && !desktopCombatBefore.gameOver, 'desktop gameplay simulation must be active before VFX tests');
  const desktopShot = await desktop.evaluate(() => {
    const qa = window.__BLUE_ALERTS_COMBAT_QA__;
    const baseline = qa.state();
    return { ...qa.fire(), baseline };
  });
  assert.equal(desktopShot.modelProjectiles, desktopShot.baseline.modelProjectiles + 1,
    'desktop QA fire must add exactly one procedural projectile to the live simulation');
  assert.equal(desktopShot.modelMuzzleFlashes, desktopShot.baseline.modelMuzzleFlashes + 1,
    'desktop QA fire must add one procedural muzzle flash to the live simulation');
  await desktop.waitForTimeout(35);
  await desktop.screenshot({ path: output + '/desktop-v94-projectile-vfx.png', fullPage: false, timeout: 60000 });
  try {
    await desktop.waitForFunction(sequence => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      const event = state?.lastImpactEvent;
      return state && event && event.id > sequence && event.ringCount === 1 && event.sparkCount >= 4;
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
  await desktop.screenshot({ path: output + '/desktop-v94-impact-vfx.png', fullPage: false, timeout: 60000 });

  const desktopDeath = await desktop.evaluate(() => {
    const qa = window.__BLUE_ALERTS_COMBAT_QA__;
    const before = qa.state();
    return { before, kill: qa.destroyEnemyUnit() };
  });
  const desktopKill = desktopDeath.kill;
  console.log('DESKTOP_UNIT_DEATH ' + JSON.stringify(desktopKill));
  assert.ok(desktopKill.targetDead && desktopKill.targetRemoved && desktopKill.killsDelta === 1 && desktopKill.creditsDelta >= 50 && desktopKill.explosionSpawned && desktopKill.modelExplosions === desktopDeath.before.modelExplosions + 1, 'desktop unit destruction must remove the unit, award its kill/reward and add exactly one new procedural explosion');
  assert.ok(desktopKill.flashWasActive && desktopKill.flashHidden && desktopKill.flashTimer === 0,
    'desktop unit death must immediately hide its attached turret flash and clear its timer');
  await desktop.bringToFront();
  try {
    await desktop.waitForFunction(({ frameCount, time, life, position }) => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      const index = state?.modelExplosionPositions?.findIndex(p =>
        Math.abs(p.x - position.x) < 0.001 && Math.abs(p.z - position.z) < 0.001) ?? -1;
      return state && state.frameCount >= frameCount + 2 && state.time > time &&
        index >= 0 && state.modelExplosionLives[index] < life;
    }, {
      frameCount: desktopKill.frameCount,
      time: desktopKill.time,
      life: desktopKill.spawnedExplosionLife,
      position: desktopKill.targetPosition
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
  const desktopExplosionIndex = desktopExplosionState.modelExplosionPositions.findIndex(p => Math.abs(p.x - desktopKill.targetPosition.x) < 0.001 && Math.abs(p.z - desktopKill.targetPosition.z) < 0.001);
  assert.ok(desktopExplosionIndex >= 0, 'desktop death explosion must remain attached to its original target position');
  console.log('DESKTOP_EXPLOSION_LIFECYCLE ' + JSON.stringify({ before: desktopKill, after: desktopExplosionState }));
  assert.ok(desktopExplosionState.started && !desktopExplosionState.gameOver && desktopExplosionState.time > desktopKill.time, 'desktop simulation clock must advance while the explosion is alive');
  assert.ok(desktopExplosionState.frameCount >= desktopKill.frameCount + 2 && desktopExplosionState.lastFrameDelta > 0, 'desktop requestAnimationFrame loop must continue after unit destruction');
  assert.ok(desktopExplosionState.modelExplosionLives[desktopExplosionIndex] < desktopKill.spawnedExplosionLife, 'desktop death explosion simulation lifetime must advance');
  await desktop.screenshot({ path: output + '/desktop-v94-explosion-vfx.png', fullPage: false, timeout: 60000 });
  // Autonomous fire was suppressed before the controlled shot; now verify its VFX expire naturally.
  try {
    await desktop.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      return state && state.activeProjectiles === 0 && state.modelProjectiles === 0 &&
        state.modelMuzzleFlashes === 0 && state.modelExplosions === 0 && state.impactRings === 0 && state.impactSparks === 0;
    }, null, { timeout: 15000, polling: 50 });
  } catch (error) {
    const state = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
    console.log('DESKTOP_VFX_CLEANUP_TIMEOUT ' + JSON.stringify(state));
    throw error;
  }
  const desktopClean = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.state());
  console.log('DESKTOP_COMBAT_VFX ' + JSON.stringify({ shot: desktopShot, kill: desktopKill, afterCleanup: desktopClean }));
  await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.resumeCombat());

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

  const desktopBuildingFreeze = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.freezeNewCombat());
  assert.ok(desktopBuildingFreeze?.combatSuppressed === true,
    'desktop building-damage QA must freeze unrelated combat before its controlled projectile burst');
  // The dedicated combat-VFX lifecycle probe above already verifies that impact rings and
  // sparks expire naturally. For the building-damage probe, only in-flight projectiles,
  // muzzle flashes and model explosions can interfere with the controlled shot sequence.
  try {
    await desktop.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      return state && state.activeProjectiles === 0 && state.modelProjectiles === 0 &&
        state.modelMuzzleFlashes === 0 && state.modelExplosions === 0;
    }, null, { timeout: 15000, polling: 50 });
  } catch (error) {
    const state = await desktop.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
    console.log('DESKTOP_PRE_BUILDING_VFX_DRAIN_TIMEOUT ' + JSON.stringify(state));
    throw error;
  }
  const desktopBuildingStart = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__.fireToStage(1));
  assert.ok(desktopBuildingStart?.shooterKind,
    'desktop building-damage QA must use a live blue combat unit');
  console.log('DESKTOP_BUILDING_STAGE1_START ' + JSON.stringify(desktopBuildingStart));
  try {
    await desktop.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot();
      return state && state.pendingProjectiles === 0 && state.damageStage === 1 &&
        state.hp <= state.maxHp * 0.55 && state.hp > state.maxHp * 0.25 && state.smokeSpawned > 0;
    }, null, { timeout: 15000, polling: 50 });
  } catch (error) {
    const state = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
    console.log('DESKTOP_BUILDING_STAGE1_TIMEOUT ' + JSON.stringify({ start: desktopBuildingStart, state }));
    throw error;
  }
  const desktopBuildingStage1 = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
  assert.ok(desktopBuildingStage1 && desktopBuildingStage1.pendingProjectiles === 0 && desktopBuildingStage1.hp <= desktopBuildingStage1.maxHp * 0.55 &&
    desktopBuildingStage1.hp > desktopBuildingStage1.maxHp * 0.25 && desktopBuildingStage1.damageStage === 1 &&
    desktopBuildingStage1.smokeSpawned > 0,
    'desktop building must enter damaged state with visible smoke after real projectile hits');
  await desktop.screenshot({ path: output + '/desktop-v94-building-damaged.png', fullPage: false, timeout: 60000 });
  const desktopBuildingCriticalStart = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__.fireToStage(2));
  console.log('DESKTOP_BUILDING_STAGE2_START ' + JSON.stringify(desktopBuildingCriticalStart));
  try {
    await desktop.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot();
      return state && state.pendingProjectiles === 0 && state.damageStage === 2 &&
        state.hp <= state.maxHp * 0.25 && state.hp > 0 && state.scorchMark && state.flamesSpawned > 0;
    }, null, { timeout: 15000, polling: 50 });
  } catch (error) {
    const state = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
    console.log('DESKTOP_BUILDING_STAGE2_TIMEOUT ' + JSON.stringify({ start: desktopBuildingCriticalStart, state }));
    throw error;
  }
  const desktopBuildingStage2 = await desktop.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
  console.log('DESKTOP_BUILDING_DAMAGE ' + JSON.stringify({ start: desktopBuildingStart, stage1: desktopBuildingStage1, criticalStart: desktopBuildingCriticalStart, stage2: desktopBuildingStage2 }));
  assert.ok(desktopBuildingStage2 && desktopBuildingStage2.pendingProjectiles === 0 && desktopBuildingStage2.hp <= desktopBuildingStage2.maxHp * 0.25 &&
    desktopBuildingStage2.hp > 0 && desktopBuildingStage2.scorchMark && desktopBuildingStage2.flamesSpawned > 0,
    'desktop critical building damage must show scorch and fire while the building remains alive');
  await desktop.screenshot({ path: output + '/desktop-v94-building-critical.png', fullPage: false, timeout: 60000 });

  // The infantry rig must follow actual V94 displacement, not merely animate in the preview.
  const infantryReady = await desktop.evaluate(() => window.__BLUE_ALERTS_INFANTRY_QA__?.snapshot());
  assert.ok(infantryReady?.profile === 'BLUE_SENTINEL_RIFLEMAN', 'V94 must attach the Blue Sentinel infantry rig to a live unit');
  const infantryWalkStart = await desktop.evaluate(() => window.__BLUE_ALERTS_INFANTRY_QA__.walkProbe());
  await desktop.waitForFunction(start => {
    const state = window.__BLUE_ALERTS_INFANTRY_QA__?.snapshot();
    return state && state.position[0] > start[0] + 0.3 && state.walkAmount > 0.2 && Math.abs(state.leftLeg - state.rightLeg) > 0.1;
  }, infantryWalkStart.position, { timeout: 5000, polling: 50 });
  const desktopInfantryGait = await desktop.evaluate(() => window.__BLUE_ALERTS_INFANTRY_QA__?.snapshot());
  assert.ok(desktopInfantryGait.position[0] > infantryWalkStart.position[0] + 0.3 && desktopInfantryGait.walkAmount > 0.2 && Math.abs(desktopInfantryGait.leftArm - desktopInfantryGait.rightArm) > 0.04, 'desktop V94 infantry arms and legs must animate in response to real movement');
  await desktop.screenshot({ path: output + '/desktop-v94-infantry-gait.png', fullPage: false, timeout: 60000 });
  const desktopTreeDetail = await desktop.evaluate(() => window.__BLUE_ALERTS_VEGETATION_QA?.focus());
  assert.ok(desktopTreeDetail?.branchWhorls === 3 && desktopTreeDetail.branchArms >= 17 &&
    desktopTreeDetail.needleSpraysPerArm === 3 &&
    desktopTreeDetail.needleClusters === desktopTreeDetail.branchArms * 3 &&
    desktopTreeDetail.needleClusters >= 51 && desktopTreeDetail.foliageTriangles >= 1500,
    'desktop live V94 must expose a complete instanced evergreen asset for close visual inspection');
  const desktopTreeBaseline = await desktop.evaluate(() => window.__BLUE_ALERTS_VEGETATION_QA?.setLegacy(true));
  assert.equal(desktopTreeBaseline, 'legacy', 'desktop A/B baseline must restore the previous three-cone evergreen geometry');
  await desktop.waitForTimeout(300);
  await desktop.screenshot({ path: output + '/desktop-v94-woodland-tree-baseline.png', fullPage: false, timeout: 60000 });
  assert.equal(await desktop.evaluate(() => window.__BLUE_ALERTS_VEGETATION_QA?.setLegacy(false)), 'detailed',
    'desktop A/B comparison must restore the detailed branch-and-needle geometry on the same instanced mesh');
  await desktop.waitForTimeout(300);
  await desktop.screenshot({ path: output + '/desktop-v94-woodland-tree-detail.png', fullPage: false, timeout: 60000 });
  const missionVictory = await desktop.evaluate(() => window.__BLUE_ALERTS_MISSION_QA__.destroyEnemyCitadel());
  assert.ok(missionVictory.enemyCitadelDestroyed && missionVictory.complete &&
    missionVictory.completedCount === 3 && missionVictory.progressPercent === 100,
    'destroying the enemy citadel through the combat damage path must complete all three mission objectives');
  assert.ok(!(await desktop.locator('#endOverlay').evaluate(el => el.classList.contains('hidden'))),
    'mission completion must display the victory overlay');
  assert.equal(await desktop.locator('#mBar').evaluate(el => Math.round(parseFloat(el.style.width))), 100,
    'the mission progress bar must reach 100 percent only after all objective conditions are met');
  console.log('DESKTOP_MISSION_COMPLETE ' + JSON.stringify(missionVictory));
  await desktop.screenshot({ path: output + '/desktop-v94-mission-complete.png', fullPage: false, timeout: 60000 });
  // Preserve the victory screenshot, then clear its overlay before environment evidence.
  await desktop.locator('#endOverlay').evaluate(el => el.classList.add('hidden'));
  assert.ok(await desktop.locator('#endOverlay').evaluate(el => el.classList.contains('hidden')),
    'desktop industrial-yard and terrain evidence must not be dimmed by the completed-mission overlay');
  // Capture the authored industrial set after all camera-sensitive gameplay
  // assertions so the visual focus cannot disturb construction projection tests.
  const industrialFocus = await desktop.evaluate(() => window.__BLUE_ALERTS_ENVIRONMENT_QA?.focus('gantry'));
  assert.equal(industrialFocus?.name, 'gantry', 'industrial yard visual focus must be available for evidence capture');
  await desktop.waitForTimeout(650);
  await desktop.screenshot({ path: output + '/desktop-v94-industrial-yard.png', fullPage: false, timeout: 60000 });
  const terrainFocus = await desktop.evaluate(() => window.__BLUE_ALERTS_TERRAIN_QA?.focus());
  assert.equal(terrainFocus?.textureResolution, 512, 'desktop terrain detail focus must be available');
  const desktopTerrainBaseline = await desktop.evaluate(() => window.__BLUE_ALERTS_TERRAIN_QA?.setReliefMaps(false));
  assert.equal(desktopTerrainBaseline?.enabled, false, 'desktop terrain A/B baseline must disable roughness and relief maps');
  assert.equal(desktopTerrainBaseline?.roughnessMap, false, 'desktop terrain baseline roughness map must be disabled');
  assert.equal(desktopTerrainBaseline?.bumpMap, false, 'desktop terrain baseline relief map must be disabled');
  await desktop.waitForTimeout(350);
  await desktop.screenshot({ path: output + '/desktop-v94-terrain-relief-baseline.png', fullPage: false, timeout: 60000 });
  const desktopTerrainDetail = await desktop.evaluate(() => window.__BLUE_ALERTS_TERRAIN_QA?.setReliefMaps(true));
  assert.equal(desktopTerrainDetail?.enabled, true, 'desktop terrain detail must restore roughness and relief maps');
  assert.equal(desktopTerrainDetail?.roughnessMap, true, 'desktop terrain detail roughness map must be active');
  assert.equal(desktopTerrainDetail?.bumpMap, true, 'desktop terrain detail bump map must be active');
  assert.equal(desktopTerrainDetail?.bumpScale, 0.11, 'desktop terrain relief must use the authored restrained bump scale');
  assert.deepEqual(desktopTerrainDetail?.target, desktopTerrainBaseline?.target, 'desktop terrain A/B must preserve the same camera target');
  assert.equal(desktopTerrainDetail?.distance, desktopTerrainBaseline?.distance, 'desktop terrain A/B must preserve camera distance');
  assert.equal(desktopTerrainDetail?.yaw, desktopTerrainBaseline?.yaw, 'desktop terrain A/B must preserve camera yaw');
  assert.equal(desktopTerrainDetail?.pitch, desktopTerrainBaseline?.pitch, 'desktop terrain A/B must preserve camera pitch');
  await desktop.waitForTimeout(350);
  await desktop.screenshot({ path: output + '/desktop-v94-terrain-relief-detail.png', fullPage: false, timeout: 60000 });
  await desktop.screenshot({ path: output + '/desktop-v94-terrain-surface.png', fullPage: false, timeout: 60000 });

  const desktopTankFocus = await desktop.evaluate(() => window.__BLUE_ALERTS_CAMERA_QA__?.focusTank());
  assert.ok(['light', 'heavy'].includes(desktopTankFocus?.unitKind),
    'desktop tank evidence must focus an actual live V94 combat unit');
  assert.equal(desktopTankFocus?.factionProfile, 'BLUE_SENTINEL',
    'desktop live V94 tank QA must resolve the nested BLUE SENTINEL model group');
  assert.equal(desktopTankFocus?.surfaceFinish, 'SENTINEL_BASTION_ARMOR_FIELDWEAR_V1',
    'desktop live V94 tank must bind the faction-seeded armor fieldwear finish');
  assert.ok(desktopTankFocus.surfaceTextureCount >= 6 && desktopTankFocus.surfaceMaterialCount >= 5,
    'desktop live V94 tank must bind cached albedo, roughness and micro-relief maps to its PBR materials');
  assert.equal(desktopTankFocus.trackLoopProfile, 'ROUNDED_CONTINUOUS_TRACK_V1',
    'desktop live V94 tank must use a continuous rounded track loop');
  assert.equal(desktopTankFocus.trackLoopSegments, 42,
    'desktop live V94 track loop must retain its authored closed profile');
  assert.equal(desktopTankFocus.trackShoeInstances, 56,
    'desktop live V94 tank must place tread shoes around both complete track loops');
  assert.equal(desktopTankFocus.trackGrouserInstances, 56,
    'desktop live V94 tank must place raised grousers around both complete track loops');
  const desktopTankBaseline = await desktop.evaluate(() => window.__BLUE_ALERTS_CAMERA_QA__?.setTankSurfaceMaps(false));
  assert.equal(desktopTankBaseline?.surfaceMapsEnabled, false, 'desktop tank A/B baseline must disable only the new surface maps');
  await desktop.waitForTimeout(300);
  await desktop.screenshot({ path: output + '/desktop-v94-tank-surface-baseline.png', fullPage: false, timeout: 60000 });
  const desktopTankDetail = await desktop.evaluate(() => window.__BLUE_ALERTS_CAMERA_QA__?.setTankSurfaceMaps(true));
  assert.equal(desktopTankDetail?.surfaceMapsEnabled, true, 'desktop tank A/B detail must restore the complete fieldwear maps');
  assert.deepEqual(desktopTankDetail.target, desktopTankBaseline.target, 'desktop tank A/B must preserve the same world target');
  assert.equal(desktopTankDetail.distance, desktopTankBaseline.distance, 'desktop tank A/B must preserve camera distance');
  assert.equal(desktopTankDetail.yaw, desktopTankBaseline.yaw, 'desktop tank A/B must preserve camera yaw');
  assert.equal(desktopTankDetail.pitch, desktopTankBaseline.pitch, 'desktop tank A/B must preserve camera pitch');
  await desktop.waitForTimeout(300);
  await desktop.screenshot({ path: output + '/desktop-v94-tank-surface-detail.png', fullPage: false, timeout: 60000 });
  const desktopTrackBaseline = await desktop.evaluate(() => window.__BLUE_ALERTS_CAMERA_QA__?.setTankTrackLoop(false));
  assert.equal(desktopTrackBaseline?.trackLoopEnabled, false, 'desktop track A/B baseline must restore the previous straight belt');
  assert.equal(desktopTrackBaseline?.trackShoeInstances, 36, 'desktop baseline must restore the previous 36 straight tread pieces');
  assert.equal(desktopTrackBaseline?.trackGrouserInstances, 0, 'desktop baseline must hide the new grousers');
  await desktop.waitForTimeout(300);
  await desktop.screenshot({ path: output + '/desktop-v94-tank-track-loop-baseline.png', fullPage: false, timeout: 60000 });
  const desktopTrackDetail = await desktop.evaluate(() => window.__BLUE_ALERTS_CAMERA_QA__?.setTankTrackLoop(true));
  assert.equal(desktopTrackDetail?.trackLoopEnabled, true, 'desktop track detail must restore the rounded loop');
  assert.equal(desktopTrackDetail?.trackShoeInstances, 56, 'desktop track detail must restore all 56 tread shoes');
  assert.equal(desktopTrackDetail?.trackGrouserInstances, 56, 'desktop track detail must restore all 56 grousers');
  assert.deepEqual(desktopTrackDetail.target, desktopTrackBaseline.target, 'desktop track A/B must preserve the same world target');
  assert.equal(desktopTrackDetail.distance, desktopTrackBaseline.distance, 'desktop track A/B must preserve camera distance');
  assert.equal(desktopTrackDetail.yaw, desktopTrackBaseline.yaw, 'desktop track A/B must preserve camera yaw');
  assert.equal(desktopTrackDetail.pitch, desktopTrackBaseline.pitch, 'desktop track A/B must preserve camera pitch');
  await desktop.waitForTimeout(300);
  await desktop.screenshot({ path: output + '/desktop-v94-tank-track-loop-detail.png', fullPage: false, timeout: 60000 });

  // Release the desktop WebGL context before opening the mobile viewport. This
  // keeps the mobile assertion independent of concurrent GPU/context pressure.
  await desktop.close();
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true
  });
  await loadGame(mobile, { combatVfx: true, buildQa: true, environment: true, freezeCombatAtStart: true });
  const mobileMetrics = await metrics(mobile);
  assert.ok(mobileMetrics.terrain?.albedoMap && mobileMetrics.terrain.roughnessMap && mobileMetrics.terrain.bumpMap &&
    mobileMetrics.terrain.surfaceTextureCount === 3 &&
    mobileMetrics.terrain.surfaceMode === 'procedural-albedo-roughness-relief-v2' &&
    mobileMetrics.terrain.bumpScale === 0.11 && mobileMetrics.terrain.textureResolution === 256 &&
    mobileMetrics.terrain.textureChecksum > 0 && mobileMetrics.terrain.anisotropy >= 1 && mobileMetrics.terrain.anisotropy <= 2,
    'mobile terrain must use deterministic 256px albedo, roughness and micro-relief maps');
  const mobileDockBaselineCamera = await mobile.evaluate(() => window.__BLUE_ALERTS_CAMERA_QA__?.snapshot());
  const mobileDockCollapsed = await mobile.evaluate(() => ({
    open: document.body.classList.contains('mobile-build-open'),
    sidebarHeight: document.getElementById('sidebar').getBoundingClientRect().height,
    cardsDisplay: getComputedStyle(document.getElementById('cards')).display,
    viewportHeight: document.getElementById('viewport').getBoundingClientRect().height,
    expanded: document.querySelector('#sidebar .tab.active')?.getAttribute('aria-expanded')
  }));
  assert.ok(!mobileDockCollapsed.open && mobileDockCollapsed.sidebarHeight <= 56 &&
    mobileDockCollapsed.cardsDisplay === 'none' && mobileDockCollapsed.viewportHeight >= 780 &&
    mobileDockCollapsed.expanded === 'false',
    'mobile production dock must start collapsed and return the maximum unobstructed battlefield area');
  await mobile.screenshot({ path: output + '/mobile-v94-build-dock-collapsed-390x844.png', fullPage: false, timeout: 60000 });
  await mobile.locator('#sidebar .tab[data-t="struct"]').tap();
  await mobile.waitForFunction(() =>
    document.body.classList.contains('mobile-build-open') &&
    getComputedStyle(document.getElementById('cards')).display === 'flex' &&
    Math.abs(document.getElementById('sidebar').getBoundingClientRect().height - 132) < 2,
    null, { timeout: 5000, polling: 40 });
  const mobileDockOpen = await mobile.evaluate(() => ({
    sidebarHeight: document.getElementById('sidebar').getBoundingClientRect().height,
    cardsDisplay: getComputedStyle(document.getElementById('cards')).display,
    viewportHeight: document.getElementById('viewport').getBoundingClientRect().height,
    expanded: document.querySelector('#sidebar .tab.active')?.getAttribute('aria-expanded'),
    camera: window.__BLUE_ALERTS_CAMERA_QA__?.snapshot()
  }));
  assert.ok(mobileDockOpen.sidebarHeight >= 130 && mobileDockOpen.sidebarHeight <= 134 &&
    mobileDockOpen.cardsDisplay === 'flex' && mobileDockOpen.viewportHeight >= 710 &&
    mobileDockOpen.viewportHeight <= 714 && mobileDockOpen.expanded === 'true',
    'opening the production drawer must expose a compact 132px card tray and preserve a large battlefield');
  assert.deepEqual(mobileDockOpen.camera?.target, mobileDockBaselineCamera?.target,
    'opening the production drawer must not move the tactical camera target');
  assert.equal(mobileDockOpen.camera?.distance, mobileDockBaselineCamera?.distance,
    'opening the production drawer must preserve tactical camera zoom');
  assert.equal(mobileDockOpen.camera?.yaw, mobileDockBaselineCamera?.yaw,
    'opening the production drawer must preserve tactical camera yaw');
  assert.equal(mobileDockOpen.camera?.pitch, mobileDockBaselineCamera?.pitch,
    'opening the production drawer must preserve tactical camera pitch');
  await mobile.screenshot({ path: output + '/mobile-v94-build-dock-open-390x844.png', fullPage: false, timeout: 60000 });
  const touchTargets = await mobile.evaluate(() => {
    const tabs = [...document.querySelectorAll('#sidebar .tab')].map(el => {
      const r = el.getBoundingClientRect();
      return { width: r.width, height: r.height, text: el.textContent.trim(), expanded: el.getAttribute('aria-expanded') };
    });
    const card = document.querySelector('#cards .card');
    const r = card?.getBoundingClientRect();
    return {
      tabs,
      firstCard: r ? { width: r.width, height: r.height } : null,
      cardsDisplay: getComputedStyle(document.getElementById('cards')).display,
      sidebarHeight: document.querySelector('#sidebar').getBoundingClientRect().height,
      viewportHeight: document.getElementById('viewport').getBoundingClientRect().height
    };
  });
  assert.ok(touchTargets.cardsDisplay === 'flex' && touchTargets.sidebarHeight >= 130 &&
    touchTargets.sidebarHeight <= 134 && touchTargets.viewportHeight >= 710 &&
    touchTargets.firstCard && touchTargets.firstCard.width >= 60 && touchTargets.firstCard.height >= 44,
    'expanded mobile production cards must remain visible and comfortably tappable');
  assert.ok(touchTargets.tabs.every(t => t.width >= 44 && t.height >= 44),
    'all three horizontal mobile production tabs must retain 44px touch targets');
  await mobile.locator('#sidebar .tab[data-t="struct"]').tap();
  await mobile.waitForFunction(() =>
    !document.body.classList.contains('mobile-build-open') &&
    getComputedStyle(document.getElementById('cards')).display === 'none' &&
    Math.abs(document.getElementById('sidebar').getBoundingClientRect().height - 54) < 2,
    null, { timeout: 5000, polling: 40 });

  assert.ok(mobileMetrics.webgl && !mobileMetrics.contextLost, 'mobile viewport must render with a live WebGL context');
  assert.ok(mobileMetrics.documentWidth <= mobileMetrics.viewportWidth + 1, 'mobile game must not overflow horizontally');
  assert.ok(mobileMetrics.canvasRect.width >= 380 && mobileMetrics.canvasRect.height >= 600, 'mobile battlefield must retain a usable touch area');
  assert.ok(mobileMetrics.startOverlayHidden && !mobileMetrics.fallback && !mobileMetrics.runtimeError && !mobileMetrics.startupError, 'mobile game must start in the 3D runtime without fallback/errors');
  assert.equal(mobileMetrics.camera?.defaultDistance, 40, 'mobile opening camera must use the portrait-safe tactical framing');
  assert.equal(mobileMetrics.camera?.distance, 40, 'mobile opening camera must start at the authored tactical distance');
  assert.ok(mobileMetrics.battlefieldWear?.shoulderShading === 'per-segment-uniform-low-contrast' &&
    mobileMetrics.battlefieldWear?.roadShoulderSegments === 100 &&
    mobileMetrics.battlefieldWear.accessSpur &&
    mobileMetrics.battlefieldWear.tireSegments >= 100 &&
    mobileMetrics.battlefieldWear.asphaltRepairPatches === 7 &&
    mobileMetrics.battlefieldWear.crackSegments >= 40 &&
    mobileMetrics.battlefieldWear.drainGrates === 10 &&
    mobileMetrics.battlefieldWear.safetyBars === 8 &&
    mobileMetrics.battlefieldWear.blocksMovement === false &&
    mobileMetrics.battlefieldWear.renderObjects <= 8,
    'mobile battlefield must retain the connected logistics wear kit');

  const mobileRoadFocus = await mobile.evaluate(() => window.__BLUE_ALERTS_BATTLEFIELD_WEAR_QA?.focusRoad());
  assert.ok(mobileRoadFocus?.camera && mobileRoadFocus.visible, 'mobile road A/B focus must expose the detailed wear layer');
  const mobileRoadBaseline = await mobile.evaluate(() => window.__BLUE_ALERTS_BATTLEFIELD_WEAR_QA?.setVisible(false));
  assert.equal(mobileRoadBaseline?.visible, false, 'mobile road baseline must hide only the new wear layer');
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: output + '/mobile-v94-road-wear-baseline-390x844.png', fullPage: false });
  const mobileRoadDetail = await mobile.evaluate(() => window.__BLUE_ALERTS_BATTLEFIELD_WEAR_QA?.setVisible(true));
  assert.equal(mobileRoadDetail?.visible, true, 'mobile road detail must restore the complete wear layer');
  assert.deepEqual(mobileRoadDetail?.camera, mobileRoadBaseline?.camera, 'mobile road A/B must preserve camera pose');
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: output + '/mobile-v94-road-wear-detail-390x844.png', fullPage: false });

  const mobileCorridorFocus = await mobile.evaluate(() => window.__BLUE_ALERTS_BATTLEFIELD_WEAR_QA?.focusCorridor());
  assert.ok(mobileCorridorFocus?.camera && mobileCorridorFocus.visible, 'mobile gantry corridor focus must be available');
  const mobileCorridorBaseline = await mobile.evaluate(() => window.__BLUE_ALERTS_BATTLEFIELD_WEAR_QA?.setVisible(false));
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: output + '/mobile-v94-logistics-corridor-wear-baseline-390x844.png', fullPage: false });
  const mobileCorridorDetail = await mobile.evaluate(() => window.__BLUE_ALERTS_BATTLEFIELD_WEAR_QA?.setVisible(true));
  assert.deepEqual(mobileCorridorDetail?.camera, mobileCorridorBaseline?.camera, 'mobile corridor A/B must preserve camera pose');
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: output + '/mobile-v94-logistics-corridor-wear-detail-390x844.png', fullPage: false });
  const mobileWearReset = await mobile.evaluate(() => window.__BLUE_ALERTS_ENVIRONMENT_QA?.focus('base'));
  assert.equal(mobileWearReset?.name, 'base', 'mobile wear A/B must restore the default tactical camera before the camera test');

  await mobile.waitForTimeout(900);
  const mobileCameraBaseline = await mobile.evaluate(() => window.__BLUE_ALERTS_CAMERA_QA__?.setDistance(48));
  assert.equal(mobileCameraBaseline?.distance, 48, 'mobile A/B baseline must use the original 48-unit camera distance');
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: output + '/mobile-v94-camera-baseline-48-390x844.png', fullPage: false });
  const mobileCameraCloser = await mobile.evaluate(() => window.__BLUE_ALERTS_CAMERA_QA__?.setDistance(40));
  assert.equal(mobileCameraCloser?.distance, 40, 'mobile A/B improved frame must use the 40-unit portrait camera distance');
  assert.deepEqual(mobileCameraCloser?.target, mobileCameraBaseline?.target, 'mobile A/B screenshots must preserve the exact same camera target');
  assert.equal(mobileCameraCloser?.yaw, mobileCameraBaseline?.yaw, 'mobile A/B screenshots must preserve camera yaw');
  assert.equal(mobileCameraCloser?.pitch, mobileCameraBaseline?.pitch, 'mobile A/B screenshots must preserve camera pitch');
  assert.ok(mobileCameraBaseline.distance / mobileCameraCloser.distance >= 1.15, 'mobile A/B framing must create a clearly visible scale increase of at least 15%');
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: output + '/mobile-v94-tactical-camera-framing-390x844.png', fullPage: false });
  assert.ok(mobileMetrics.terrain?.vertexColors && mobileMetrics.terrain.vertexCount > 2000 && mobileMetrics.terrain.colorCount === mobileMetrics.terrain.vertexCount, 'mobile terrain must retain the complete vertex-color field');
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
  const mobileMissionHud = await mobile.evaluate(() => {
    const el = document.getElementById('mobileMission');
    const rect = el.getBoundingClientRect();
    return { display: getComputedStyle(el).display, width: rect.width, left: rect.left, right: rect.right, viewportWidth: window.innerWidth,
      text: document.getElementById('mobileMissionObjective').textContent };
  });
  assert.ok(mobileMissionHud.display !== 'none' && mobileMissionHud.width > 0 &&
    mobileMissionHud.left >= 0 && mobileMissionHud.right <= mobileMissionHud.viewportWidth + 1 &&
    mobileMissionHud.text.includes('Livrer 600 minerais'),
    'mobile HUD must expose the active mission objective without horizontal overflow');

  const mobileHudLayout = await mobile.evaluate(() => {
    const rect = id => {
      const r = document.getElementById(id).getBoundingClientRect();
      return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height };
    };
    const pills = [...document.querySelectorAll('#topbar .pill')];
    const objective = document.getElementById('mobileMissionObjective');
    return {
      topbar: rect('topbar'),
      visibleTopbarPills: pills.filter(el => getComputedStyle(el).display !== 'none').length,
      commandModeDisplay: getComputedStyle(pills[1]).display,
      commands: rect('mobileCommands'),
      mission: rect('mobileMission'),
      hqBadgeDisplay: getComputedStyle(document.getElementById('mobileHQBadge')).display,
      objectiveWhiteSpace: getComputedStyle(objective).whiteSpace,
      objectiveOverflowX: getComputedStyle(objective).overflowX
    };
  });
  assert.ok(mobileHudLayout.topbar.height <= 36.5 && mobileHudLayout.visibleTopbarPills === 2 &&
    mobileHudLayout.commandModeDisplay === 'none',
    'mobile top bar must stay on one compact row without redundant command-mode pill');
  assert.equal(mobileHudLayout.hqBadgeDisplay, 'none',
    'mobile HUD must not spend a separate row on the redundant HQ badge');
  assert.ok(mobileHudLayout.mission.top >= mobileHudLayout.commands.bottom + 4 &&
    mobileHudLayout.mission.bottom <= 136 && mobileHudLayout.mission.height <= 50,
    'mobile mission objective must sit below touch commands in a compact card');
  assert.ok(mobileHudLayout.objectiveWhiteSpace === 'nowrap' && mobileHudLayout.objectiveOverflowX === 'hidden',
    'mobile mission detail must remain a single clipped line instead of expanding the HUD stack');
  console.log('MOBILE_HUD_COMPACT ' + JSON.stringify(mobileHudLayout));
  await mobile.screenshot({ path: output + '/mobile-v94-hud-compact-390x844.png', fullPage: false });
  const mobileToastClearance = await mobile.evaluate(() => {
    const toast = document.getElementById('toast');
    const commands = document.getElementById('mobileCommands');
    const mission = document.getElementById('mobileMission');
    toast.textContent = 'MISSION — OBJECTIF MIS À JOUR';
    toast.style.opacity = '1';
    const rect = element => {
      const r = element.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    };
    const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
    const t = rect(toast), c = rect(commands), m = rect(mission);
    return { toast: t, commands: c, mission: m, overlapsCommands: overlaps(t, c), overlapsMission: overlaps(t, m) };
  });
  assert.ok(!mobileToastClearance.overlapsCommands && !mobileToastClearance.overlapsMission,
    'mobile mission notifications must not cover command controls or the objective HUD');
  await mobile.screenshot({ path: output + '/mobile-v94-mission-toast-clearance-390x844.png', fullPage: false, timeout: 60000 });
  await mobile.evaluate(() => { document.getElementById('toast').style.opacity = '0'; });
  const mobileMissionProgress = await mobile.evaluate(() => {
    window.__BLUE_ALERTS_MISSION_QA__.recordDelivery(600);
    for (let i = 0; i < 3; i++) window.__BLUE_ALERTS_MISSION_QA__.recordProduction('light');
    return { state: window.__BLUE_ALERTS_MISSION_QA__.snapshot(), count: document.getElementById('mobileMissionCount').textContent };
  });
  assert.ok(mobileMissionProgress.state.completedCount === 2 && mobileMissionProgress.count === '2/3',
    'mobile mission HUD must update its objective count after gameplay progress');
  await mobile.screenshot({ path: output + '/mobile-v94-mission-progress-390x844.png', fullPage: false, timeout: 60000 });
  assert.ok(touchTargets.firstCard && touchTargets.firstCard.width >= 60 && touchTargets.firstCard.height >= 44, 'mobile build cards must remain tappable');
  const tabBox = await mobile.locator('#sidebar .tab[data-t="units"]').boundingBox();
  await mobile.touchscreen.tap(tabBox.x + tabBox.width / 2, tabBox.y + tabBox.height / 2);
  await assert.ok(await mobile.locator('#sidebar .tab[data-t="units"]').evaluate(el => el.classList.contains('active')), 'mobile touch must switch the unit tab');
  assert.equal(await mobile.locator('#sidebar .tab[data-t="units"]').getAttribute('aria-expanded'), 'true',
    'the selected mobile production category must expose its expanded state');
  await mobile.locator('#sidebar .tab[data-t="units"]').tap();
  await mobile.waitForFunction(() => !document.body.classList.contains('mobile-build-open') &&
    getComputedStyle(document.getElementById('cards')).display === 'none' &&
    Math.abs(document.getElementById('sidebar').getBoundingClientRect().height - 54) < 2,
    null, { timeout: 5000, polling: 40 });
  const mobileDockAfterUse = await mobile.evaluate(() => ({
    sidebarHeight: document.getElementById('sidebar').getBoundingClientRect().height,
    viewportHeight: document.getElementById('viewport').getBoundingClientRect().height
  }));
  assert.ok(mobileDockAfterUse.sidebarHeight <= 56 && mobileDockAfterUse.viewportHeight >= 780,
    'tapping the active category again must collapse the production drawer after use');
  await mobile.screenshot({ path: output + '/mobile-v94-build-dock-collapsed-after-use-390x844.png', fullPage: false, timeout: 60000 });

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
  assert.ok(mobileCommandsBox, 'mobile command dock must remain present after HUD compaction');
  assert.equal(await mobile.locator('#mobileHQBadge').evaluate(el => getComputedStyle(el).display), 'none',
    'redundant mobile HQ badge must remain collapsed to preserve battlefield space');
  assert.ok(mobileBuildBefore && mobileBuildBefore.pads.every(p => p.pad && p.grid && p.border),
    'mobile must render the same two construction pads');
  await mobile.waitForTimeout(2800);
  await mobile.screenshot({ path: output + '/mobile-v94-gameplay-390x844.png', fullPage: false, timeout: 60000 });

  // Real touch placement on the 390x844 mobile viewport.
  const mobileEconomyFreeze = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.freezeEconomyRewards());
  assert.ok(mobileEconomyFreeze?.economyRewardsFrozen, 'mobile construction-cost QA must freeze asynchronous reward credits');
  const mobilePlacementBefore = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILD_QA.snapshot());
  const mobileBuildPoint = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILD_QA.projectWorld(-24, -12));
  assert.ok(mobileBuildPoint.visible, 'mobile construction target must be visible above the bottom HUD');
  await mobile.locator('#cards .card').first().tap();
  await mobile.touchscreen.tap(mobileBuildPoint.x, mobileBuildPoint.y);
  // Pointer placement is synchronous; inspect the state immediately so unrelated
  // AI kill rewards cannot be mistaken for a construction-price regression.
  const mobileBuildAfter = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILD_QA.snapshot());
  assert.equal(mobileBuildAfter.playerBuildingCount, mobilePlacementBefore.playerBuildingCount + 1,
    'a real mobile touch must place exactly one power station');
  assert.equal(mobileBuildAfter.credits, mobilePlacementBefore.credits - 350,
    'a real mobile touch placement must deduct the configured power-station cost');
  const mobileEconomyResume = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.resumeEconomyRewards());
  assert.equal(mobileEconomyResume?.economyRewardsFrozen, false, 'mobile construction-cost QA must restore economy rewards after the placement assertion');

  const mobileFreeze = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.freezeNewCombat());
  assert.ok(mobileFreeze?.combatSuppressed === true,
    'mobile VFX and building-damage QA must suppress autonomous combat before controlled probes');
  try {
    await mobile.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      return state && state.activeProjectiles === 0 && state.modelProjectiles === 0 &&
        state.modelMuzzleFlashes === 0 && state.modelExplosions === 0 &&
        state.impactRings === 0 && state.impactSparks === 0;
    }, null, { timeout: 15000, polling: 50 });
  } catch (error) {
    const state = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
    console.log('MOBILE_PRE_VFX_COMBAT_DRAIN_TIMEOUT ' + JSON.stringify(state));
    throw error;
  }
  const mobileCombatBefore = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
  assert.equal(mobileCombatBefore?.combatSuppressed, true,
    'mobile QA must remain isolated from autonomous combat after the early freeze');
  assert.ok(mobileCombatBefore?.livingBlueCombatUnits > 0 && mobileCombatBefore?.livingRedCombatUnits > 0,
    'mobile combat QA must retain live units on both factions after autonomous fire is drained');
  assert.ok(mobileCombatBefore.started && !mobileCombatBefore.gameOver,
    'mobile gameplay simulation must be active before controlled VFX tests');
  // Keep the mobile page foregrounded: Chromium may throttle requestAnimationFrame on a background page.
  await mobile.bringToFront();
  await mobile.waitForFunction(() => document.visibilityState === 'visible', null, { timeout: 3000 });
  const mobileShot = await mobile.evaluate(() => {
    const qa = window.__BLUE_ALERTS_COMBAT_QA__;
    const baseline = qa.state();
    return { ...qa.fire(), baseline };
  });
  assert.equal(mobileShot.modelProjectiles, mobileShot.baseline.modelProjectiles + 1,
    'mobile QA fire must add exactly one procedural projectile to the live simulation');
  assert.equal(mobileShot.modelMuzzleFlashes, mobileShot.baseline.modelMuzzleFlashes + 1,
    'mobile QA fire must add one procedural muzzle flash to the live simulation');
  await mobile.waitForTimeout(35);
  await mobile.screenshot({ path: output + '/mobile-v94-projectile-vfx-390x844.png', fullPage: false, timeout: 60000 });
  try {
    await mobile.waitForFunction(sequence => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      const event = state?.lastImpactEvent;
      return state && event && event.id > sequence && event.ringCount === 1 && event.sparkCount >= 4;
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
  await mobile.screenshot({ path: output + '/mobile-v94-impact-vfx-390x844.png', fullPage: false, timeout: 60000 });

  const mobileDeath = await mobile.evaluate(() => {
    const qa = window.__BLUE_ALERTS_COMBAT_QA__;
    const before = qa.state();
    return { before, kill: qa.destroyEnemyUnit() };
  });
  const mobileKill = mobileDeath.kill;
  console.log('MOBILE_UNIT_DEATH ' + JSON.stringify(mobileKill));
  assert.ok(mobileKill.targetDead && mobileKill.targetRemoved && mobileKill.killsDelta === 1 && mobileKill.creditsDelta >= 50 && mobileKill.explosionSpawned && mobileKill.modelExplosions === mobileDeath.before.modelExplosions + 1, 'mobile unit destruction must remove the unit, award its kill/reward and add exactly one new procedural explosion');
  assert.ok(mobileKill.flashWasActive && mobileKill.flashHidden && mobileKill.flashTimer === 0,
    'mobile unit death must immediately hide its attached turret flash and clear its timer');
  await mobile.bringToFront();
  try {
    await mobile.waitForFunction(({ frameCount, time, life, position }) => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      const index = state?.modelExplosionPositions?.findIndex(p =>
        Math.abs(p.x - position.x) < 0.001 && Math.abs(p.z - position.z) < 0.001) ?? -1;
      return state && state.frameCount >= frameCount + 2 && state.time > time &&
        index >= 0 && state.modelExplosionLives[index] < life;
    }, {
      frameCount: mobileKill.frameCount,
      time: mobileKill.time,
      life: mobileKill.spawnedExplosionLife,
      position: mobileKill.targetPosition
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
  const mobileExplosionIndex = mobileExplosionState.modelExplosionPositions.findIndex(p => Math.abs(p.x - mobileKill.targetPosition.x) < 0.001 && Math.abs(p.z - mobileKill.targetPosition.z) < 0.001);
  assert.ok(mobileExplosionIndex >= 0 && mobileExplosionState.modelExplosionLives[mobileExplosionIndex] < mobileKill.spawnedExplosionLife, 'mobile death explosion simulation lifetime must advance');
  await mobile.screenshot({ path: output + '/mobile-v94-explosion-vfx-390x844.png', fullPage: false, timeout: 60000 });
  // Autonomous combat was frozen and drained before the controlled VFX probes above.
  // Keep that gate active while the test verifies natural expiry of its own effects.
  const mobileCleanupStartedAt = Date.now();
  try {
    await mobile.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_COMBAT_QA__?.state();
      return state && state.activeProjectiles === 0 && state.modelProjectiles === 0 &&
        state.modelMuzzleFlashes === 0 && state.modelExplosions === 0 && state.impactRings === 0 && state.impactSparks === 0;
    }, null, { timeout: 15000, polling: 50 });
  } catch (error) {
    const state = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__?.state());
    console.log('MOBILE_VFX_CLEANUP_TIMEOUT ' + JSON.stringify(state));
    throw error;
  }
  const mobileClean = await mobile.evaluate(() => window.__BLUE_ALERTS_COMBAT_QA__.state());
  assert.ok(mobileClean.combatSuppressed === true,
    'mobile building-damage QA must remain isolated from unrelated combat after VFX cleanup');
  const mobileCleanupElapsedMs = Date.now() - mobileCleanupStartedAt;
  console.log('MOBILE_VFX_CLEANUP_PERFORMANCE ' + JSON.stringify({
    elapsedMs: mobileCleanupElapsedMs,
    framesAdvanced: mobileClean.frameCount - mobileKill.frameCount,
    simulatedSeconds: Number((mobileClean.time - mobileKill.time).toFixed(3)),
    averageFps: Number(((mobileClean.frameCount - mobileKill.frameCount) / Math.max(0.001, mobileCleanupElapsedMs / 1000)).toFixed(1))
  }));
  console.log('MOBILE_COMBAT_VFX ' + JSON.stringify({ shot: mobileShot, kill: mobileKill, afterCleanup: mobileClean }));

  const mobileBuildingStart = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__.fireToStage(1));
  assert.ok(mobileBuildingStart?.shooterKind,
    'mobile building-damage QA must use a live blue combat unit');
  console.log('MOBILE_BUILDING_STAGE1_START ' + JSON.stringify(mobileBuildingStart));
  try {
    await mobile.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot();
      return state && state.pendingProjectiles === 0 && state.damageStage === 1 &&
        state.hp <= state.maxHp * 0.55 && state.hp > state.maxHp * 0.25 && state.smokeSpawned > 0;
    }, null, { timeout: 15000, polling: 50 });
  } catch (error) {
    const state = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
    console.log('MOBILE_BUILDING_STAGE1_TIMEOUT ' + JSON.stringify({ start: mobileBuildingStart, state }));
    throw error;
  }
  const mobileBuildingStage1 = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
  assert.ok(mobileBuildingStage1 && mobileBuildingStage1.pendingProjectiles === 0 && mobileBuildingStage1.hp <= mobileBuildingStage1.maxHp * 0.55 &&
    mobileBuildingStage1.hp > mobileBuildingStage1.maxHp * 0.25 && mobileBuildingStage1.damageStage === 1 &&
    mobileBuildingStage1.smokeSpawned > 0,
    'mobile building must enter damaged state with visible smoke after real projectile hits');
  await mobile.screenshot({ path: output + '/mobile-v94-building-damaged-390x844.png', fullPage: false, timeout: 60000 });
  const mobileBuildingCriticalStart = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__.fireToStage(2));
  console.log('MOBILE_BUILDING_STAGE2_START ' + JSON.stringify(mobileBuildingCriticalStart));
  try {
    await mobile.waitForFunction(() => {
      const state = window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot();
      return state && state.pendingProjectiles === 0 && state.damageStage === 2 &&
        state.hp <= state.maxHp * 0.25 && state.hp > 0 && state.scorchMark && state.flamesSpawned > 0;
    }, null, { timeout: 15000, polling: 50 });
  } catch (error) {
    const state = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
    console.log('MOBILE_BUILDING_STAGE2_TIMEOUT ' + JSON.stringify({ start: mobileBuildingCriticalStart, state }));
    throw error;
  }
  const mobileBuildingStage2 = await mobile.evaluate(() => window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__?.snapshot());
  console.log('MOBILE_BUILDING_DAMAGE ' + JSON.stringify({ start: mobileBuildingStart, stage1: mobileBuildingStage1, criticalStart: mobileBuildingCriticalStart, stage2: mobileBuildingStage2 }));
  assert.ok(mobileBuildingStage2 && mobileBuildingStage2.pendingProjectiles === 0 && mobileBuildingStage2.hp <= mobileBuildingStage2.maxHp * 0.25 &&
    mobileBuildingStage2.hp > 0 && mobileBuildingStage2.scorchMark && mobileBuildingStage2.flamesSpawned > 0,
    'mobile critical building damage must show scorch and fire while the building remains alive');
  await mobile.screenshot({ path: output + '/mobile-v94-building-critical-390x844.png', fullPage: false, timeout: 60000 });

  const mobileInfantryReady = await mobile.evaluate(() => window.__BLUE_ALERTS_INFANTRY_QA__?.snapshot());
  assert.ok(mobileInfantryReady?.profile === 'BLUE_SENTINEL_RIFLEMAN', 'mobile V94 must load the faction infantry rig');
  const mobileInfantryWalkStart = await mobile.evaluate(() => window.__BLUE_ALERTS_INFANTRY_QA__.walkProbe());
  await mobile.waitForFunction(start => {
    const state = window.__BLUE_ALERTS_INFANTRY_QA__?.snapshot();
    return state && state.position[0] > start[0] + 0.25 && state.walkAmount > 0.15 && Math.abs(state.leftLeg - state.rightLeg) > 0.08;
  }, mobileInfantryWalkStart.position, { timeout: 6000, polling: 50 });
  const mobileInfantryGait = await mobile.evaluate(() => window.__BLUE_ALERTS_INFANTRY_QA__?.snapshot());
  assert.ok(mobileInfantryGait.position[0] > mobileInfantryWalkStart.position[0] + 0.25 && mobileInfantryGait.walkAmount > 0.15, 'mobile V94 infantry gait must follow actual unit displacement');
  await mobile.screenshot({ path: output + '/mobile-v94-infantry-gait-390x844.png', fullPage: false, timeout: 60000 });
  const mobileTerrainFocus = await mobile.evaluate(() => window.__BLUE_ALERTS_TERRAIN_QA?.focus());
  assert.equal(mobileTerrainFocus?.textureResolution, 256, 'mobile terrain detail focus must be available');
  const mobileTerrainBaseline = await mobile.evaluate(() => window.__BLUE_ALERTS_TERRAIN_QA?.setReliefMaps(false));
  assert.equal(mobileTerrainBaseline?.enabled, false, 'mobile terrain A/B baseline must disable roughness and relief maps');
  assert.equal(mobileTerrainBaseline?.roughnessMap, false, 'mobile terrain baseline roughness map must be disabled');
  assert.equal(mobileTerrainBaseline?.bumpMap, false, 'mobile terrain baseline relief map must be disabled');
  await mobile.waitForTimeout(350);
  await mobile.screenshot({ path: output + '/mobile-v94-terrain-relief-baseline-390x844.png', fullPage: false, timeout: 60000 });
  const mobileTerrainDetail = await mobile.evaluate(() => window.__BLUE_ALERTS_TERRAIN_QA?.setReliefMaps(true));
  assert.equal(mobileTerrainDetail?.enabled, true, 'mobile terrain detail must restore roughness and relief maps');
  assert.equal(mobileTerrainDetail?.roughnessMap, true, 'mobile terrain detail roughness map must be active');
  assert.equal(mobileTerrainDetail?.bumpMap, true, 'mobile terrain detail bump map must be active');
  assert.equal(mobileTerrainDetail?.bumpScale, 0.11, 'mobile terrain relief must use the authored restrained bump scale');
  assert.deepEqual(mobileTerrainDetail?.target, mobileTerrainBaseline?.target, 'mobile terrain A/B must preserve the same camera target');
  assert.equal(mobileTerrainDetail?.distance, mobileTerrainBaseline?.distance, 'mobile terrain A/B must preserve camera distance');
  assert.equal(mobileTerrainDetail?.yaw, mobileTerrainBaseline?.yaw, 'mobile terrain A/B must preserve camera yaw');
  assert.equal(mobileTerrainDetail?.pitch, mobileTerrainBaseline?.pitch, 'mobile terrain A/B must preserve camera pitch');
  await mobile.waitForTimeout(350);
  await mobile.screenshot({ path: output + '/mobile-v94-terrain-relief-detail-390x844.png', fullPage: false, timeout: 60000 });
  await mobile.screenshot({ path: output + '/mobile-v94-terrain-surface-390x844.png', fullPage: false, timeout: 60000 });

  const mobileTreeDetail = await mobile.evaluate(() => window.__BLUE_ALERTS_VEGETATION_QA?.focus());
  assert.ok(mobileTreeDetail?.branchWhorls === 3 && mobileTreeDetail.branchArms >= 17 &&
    mobileTreeDetail.needleSpraysPerArm === 3 &&
    mobileTreeDetail.needleClusters === mobileTreeDetail.branchArms * 3 &&
    mobileTreeDetail.needleClusters >= 51 && mobileTreeDetail.foliageTriangles >= 1500,
    'mobile live V94 must expose the same detailed evergreen asset within the mobile draw-call budget');
  const mobileTreeBaseline = await mobile.evaluate(() => window.__BLUE_ALERTS_VEGETATION_QA?.setLegacy(true));
  assert.equal(mobileTreeBaseline, 'legacy', 'mobile A/B baseline must restore the previous three-cone evergreen geometry');
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: output + '/mobile-v94-woodland-tree-baseline-390x844.png', fullPage: false, timeout: 60000 });
  assert.equal(await mobile.evaluate(() => window.__BLUE_ALERTS_VEGETATION_QA?.setLegacy(false)), 'detailed',
    'mobile A/B comparison must restore the detailed branch-and-needle geometry on the same instanced mesh');
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: output + '/mobile-v94-woodland-tree-detail-390x844.png', fullPage: false, timeout: 60000 });

  const mobileTankFocus = await mobile.evaluate(() => window.__BLUE_ALERTS_CAMERA_QA__?.focusTank());
  assert.ok(['light', 'heavy'].includes(mobileTankFocus?.unitKind),
    'mobile tank evidence must focus an actual live V94 combat unit');
  assert.equal(mobileTankFocus?.factionProfile, 'BLUE_SENTINEL',
    'mobile live V94 tank QA must resolve the nested BLUE SENTINEL model group');
  assert.equal(mobileTankFocus?.surfaceFinish, 'SENTINEL_BASTION_ARMOR_FIELDWEAR_V1',
    'mobile live V94 tank must bind the faction-seeded armor fieldwear finish');
  assert.ok(mobileTankFocus.surfaceTextureCount >= 6 && mobileTankFocus.surfaceMaterialCount >= 5,
    'mobile live V94 tank must bind the cached PBR surface maps');
  assert.equal(mobileTankFocus.trackLoopProfile, 'ROUNDED_CONTINUOUS_TRACK_V1',
    'mobile live V94 tank must use a continuous rounded track loop');
  assert.equal(mobileTankFocus.trackLoopSegments, 42,
    'mobile live V94 track loop must retain its authored closed profile');
  assert.equal(mobileTankFocus.trackShoeInstances, 56,
    'mobile live V94 tank must place tread shoes around both complete track loops');
  assert.equal(mobileTankFocus.trackGrouserInstances, 56,
    'mobile live V94 tank must place raised grousers around both complete track loops');
  const mobileTankBaseline = await mobile.evaluate(() => window.__BLUE_ALERTS_CAMERA_QA__?.setTankSurfaceMaps(false));
  assert.equal(mobileTankBaseline?.surfaceMapsEnabled, false, 'mobile tank A/B baseline must disable only the surface maps');
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: output + '/mobile-v94-tank-surface-baseline-390x844.png', fullPage: false });
  const mobileTankDetail = await mobile.evaluate(() => window.__BLUE_ALERTS_CAMERA_QA__?.setTankSurfaceMaps(true));
  assert.equal(mobileTankDetail?.surfaceMapsEnabled, true, 'mobile tank A/B detail must restore the surface maps');
  assert.deepEqual(mobileTankDetail.target, mobileTankBaseline.target, 'mobile tank A/B must preserve the same world target');
  assert.equal(mobileTankDetail.distance, mobileTankBaseline.distance, 'mobile tank A/B must preserve camera distance');
  assert.equal(mobileTankDetail.yaw, mobileTankBaseline.yaw, 'mobile tank A/B must preserve camera yaw');
  assert.equal(mobileTankDetail.pitch, mobileTankBaseline.pitch, 'mobile tank A/B must preserve camera pitch');
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: output + '/mobile-v94-tank-surface-detail-390x844.png', fullPage: false });
  const mobileTrackBaseline = await mobile.evaluate(() => window.__BLUE_ALERTS_CAMERA_QA__?.setTankTrackLoop(false));
  assert.equal(mobileTrackBaseline?.trackLoopEnabled, false, 'mobile track A/B baseline must restore the previous straight belt');
  assert.equal(mobileTrackBaseline?.trackShoeInstances, 36, 'mobile baseline must restore the previous 36 straight tread pieces');
  assert.equal(mobileTrackBaseline?.trackGrouserInstances, 0, 'mobile baseline must hide the new grousers');
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: output + '/mobile-v94-tank-track-loop-baseline-390x844.png', fullPage: false, timeout: 60000 });
  const mobileTrackDetail = await mobile.evaluate(() => window.__BLUE_ALERTS_CAMERA_QA__?.setTankTrackLoop(true));
  assert.equal(mobileTrackDetail?.trackLoopEnabled, true, 'mobile track detail must restore the rounded loop');
  assert.equal(mobileTrackDetail?.trackShoeInstances, 56, 'mobile track detail must restore all 56 tread shoes');
  assert.equal(mobileTrackDetail?.trackGrouserInstances, 56, 'mobile track detail must restore all 56 grousers');
  assert.deepEqual(mobileTrackDetail.target, mobileTrackBaseline.target, 'mobile track A/B must preserve the same world target');
  assert.equal(mobileTrackDetail.distance, mobileTrackBaseline.distance, 'mobile track A/B must preserve camera distance');
  assert.equal(mobileTrackDetail.yaw, mobileTrackBaseline.yaw, 'mobile track A/B must preserve camera yaw');
  assert.equal(mobileTrackDetail.pitch, mobileTrackBaseline.pitch, 'mobile track A/B must preserve camera pitch');
  await mobile.waitForTimeout(300);
  await mobile.screenshot({ path: output + '/mobile-v94-tank-track-loop-detail-390x844.png', fullPage: false, timeout: 60000 });

  assert.ok(successfulThree.length > 0, 'a Three.js module must load successfully');
  assert.equal(failures.length, 0, 'browser must report no page or console errors: ' + failures.join(' | '));
  for (const file of ['desktop-v94-gameplay.png', 'mobile-v94-gameplay-390x844.png', 'desktop-v94-projectile-vfx.png', 'desktop-v94-explosion-vfx.png', 'mobile-v94-projectile-vfx-390x844.png', 'mobile-v94-explosion-vfx-390x844.png', 'desktop-v94-impact-vfx.png', 'mobile-v94-impact-vfx-390x844.png', 'desktop-v94-building-damaged.png', 'desktop-v94-building-critical.png', 'mobile-v94-building-damaged-390x844.png', 'mobile-v94-building-critical-390x844.png', 'desktop-v94-infantry-gait.png', 'mobile-v94-infantry-gait-390x844.png', 'desktop-v94-camera-baseline-48.png', 'mobile-v94-camera-baseline-48-390x844.png', 'desktop-v94-terrain-surface.png', 'mobile-v94-terrain-surface-390x844.png', 'desktop-v94-woodland-tree-baseline.png', 'desktop-v94-woodland-tree-detail.png', 'mobile-v94-woodland-tree-baseline-390x844.png', 'mobile-v94-woodland-tree-detail-390x844.png', 'desktop-v94-mission-complete.png', 'mobile-v94-mission-toast-clearance-390x844.png', 'mobile-v94-mission-progress-390x844.png', 'desktop-v94-road-wear-baseline.png', 'desktop-v94-road-wear-detail.png', 'desktop-v94-logistics-corridor-wear-baseline.png', 'desktop-v94-logistics-corridor-wear-detail.png', 'mobile-v94-road-wear-baseline-390x844.png', 'mobile-v94-road-wear-detail-390x844.png', 'mobile-v94-logistics-corridor-wear-baseline-390x844.png', 'mobile-v94-logistics-corridor-wear-detail-390x844.png', 'desktop-v94-tank-surface-baseline.png', 'desktop-v94-tank-surface-detail.png', 'mobile-v94-tank-surface-baseline-390x844.png', 'mobile-v94-tank-surface-detail-390x844.png', 'desktop-v94-tank-track-loop-baseline.png', 'desktop-v94-tank-track-loop-detail.png', 'mobile-v94-tank-track-loop-baseline-390x844.png', 'mobile-v94-tank-track-loop-detail-390x844.png']) {
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
    cameraAB: {
      desktop: { baseline: desktopCameraBaseline, improved: desktopCameraCloser },
      mobile: { baseline: mobileCameraBaseline, improved: mobileCameraCloser }
    },
    screenshots: ['desktop-v94-camera-baseline-48.png', 'desktop-v94-tactical-camera-framing.png', 'mobile-v94-camera-baseline-48-390x844.png', 'mobile-v94-tactical-camera-framing-390x844.png', 'desktop-v94-gameplay.png', 'mobile-v94-gameplay-390x844.png', 'desktop-v94-terrain-surface.png', 'mobile-v94-terrain-surface-390x844.png', 'desktop-v94-woodland-tree-baseline.png', 'desktop-v94-woodland-tree-detail.png', 'mobile-v94-woodland-tree-baseline-390x844.png', 'mobile-v94-woodland-tree-detail-390x844.png', 'desktop-v94-tank-surface-baseline.png', 'desktop-v94-tank-surface-detail.png', 'mobile-v94-tank-surface-baseline-390x844.png', 'mobile-v94-tank-surface-detail-390x844.png', 'desktop-v94-tank-track-loop-baseline.png', 'desktop-v94-tank-track-loop-detail.png', 'mobile-v94-tank-track-loop-baseline-390x844.png', 'mobile-v94-tank-track-loop-detail-390x844.png']
  }, null, 2));
} catch (error) {
  console.error(error);
  if (failures.length) console.error('Browser errors:', failures);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  await new Promise(resolveClose => server.close(resolveClose));
}
