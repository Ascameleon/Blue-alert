#!/usr/bin/env python3
"""Static integrity checks for the BLUE ALERTS v94 3D HTML prototype."""
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import sys
import tempfile

HTML = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("BLUE_ALERTS_v94_ASSET_INTEGRATION.html")
MODEL_LIBRARY = Path("game-data/models/blue-alert-models.js")
BROWSER_TEST = Path("scripts/validate_v94_browser.mjs")


class ScriptCollector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.scripts = []
        self.external_scripts = []
        self.current = None
        self.current_type = ""

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "script":
            return
        attrs = dict(attrs)
        if attrs.get("src"):
            self.external_scripts.append(attrs["src"])
            self.current = None
            self.current_type = ""
        else:
            self.current = []
            self.current_type = (attrs.get("type") or "").lower()

    def handle_data(self, data):
        if self.current is not None:
            self.current.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "script" and self.current is not None:
            code = "".join(self.current).strip()
            if code:
                self.scripts.append((self.current_type, code))
            self.current = None
            self.current_type = ""


def check_js(code: str, module: bool, label: str) -> None:
    suffix = ".mjs" if module or "import " in code or "export " in code else ".js"
    with tempfile.NamedTemporaryFile("w", suffix=suffix, encoding="utf-8", delete=False) as handle:
        handle.write(code)
        temp = Path(handle.name)
    try:
        result = subprocess.run(["node", "--check", str(temp)], text=True, capture_output=True)
        if result.returncode:
            print(result.stderr, file=sys.stderr)
            raise SystemExit(f"FAIL: {label} has a JavaScript syntax error")
    finally:
        temp.unlink(missing_ok=True)


def main():
    if not HTML.is_file():
        raise SystemExit(f"FAIL: {HTML} is missing")
    if not MODEL_LIBRARY.is_file():
        raise SystemExit(f"FAIL: {MODEL_LIBRARY} is missing")

    source = HTML.read_text(encoding="utf-8")
    lower = source.lower()
    required_html = ("<!doctype html", "<html", "</html>", "<body", "</body>")
    missing = [token for token in required_html if token not in lower]
    if missing:
        raise SystemExit("FAIL: missing HTML structure: " + ", ".join(missing))

    required_features = (
        "WebGLRenderer",
        "requestAnimationFrame",
        "function tick",
        "function spawn",
        "BLUE_MODELS",
        "game-data/models/blue-alert-models.js",
        "new THREE.Scene",
        "new THREE.PerspectiveCamera",
        "function terrainHash",
        "function terrainNoise",
        "createSeededTerrainRandom",
        "vertexColors: true",
        "terrain-ground",
        "window.__BLUE_ALERTS_TERRAIN",
        "function createTerrainSurfaceTextures(size)",
        "terrainSurfaceTextures.albedo",
                        "textureResolution: terrainSurfaceTextures.size",
        "textureChecksum: terrainSurfaceTextures.checksum",
        "surfaceMode: 'procedural-albedo-grain'",
        "function createLayeredTreeFoliageGeometry",
        "battlefield-trees-trunks-instanced",
        "battlefield-trees-foliage-instanced",
        "battlefield-rocks-instanced",
        "window.__BLUE_ALERTS_VEGETATION",
        "foliageTiers: treeFoliageGeometry.userData.branchWhorls",
        "branchWhorls: treeFoliageGeometry.userData.branchWhorls",
        "branchArms: treeFoliageGeometry.userData.branchArms",
        "needleClusters: treeFoliageGeometry.userData.needleClusters",
        "foliageTriangles: treeFoliageGeometry.userData.triangleCount",
        "blocksMovement: false",
    )
    missing = [feature for feature in required_features if feature not in source]
    if missing:
        raise SystemExit("FAIL: expected v94 3D/game features missing: " + ", ".join(missing))

    model_source = MODEL_LIBRARY.read_text(encoding="utf-8")
    required_tank_surface_features = (
        "TANK_SURFACE_TEXTURE_CACHE", "createTankSurfaceTextures",
        "TANK_ARMOR_MICROSCUFF_PBR_V1", "tankSurfaceBindings",
        "setSurfaceFinish", "surfaceTextureCount", "surfaceMaterialCount",
    )
    missing = [feature for feature in required_tank_surface_features if feature not in model_source]
    if missing:
        raise SystemExit("FAIL: procedural tank PBR surface pipeline is missing: " + ", ".join(missing))
    required_live_tank_surface_features = (
        "g.userData.tankModel = tank;", "window.__BLUE_ALERTS_TANK_SURFACE_QA__",
        "setEnabled(enabled)",
    )
    missing = [feature for feature in required_live_tank_surface_features if feature not in source]
    if missing:
        raise SystemExit("FAIL: live V94 tank surface QA integration is missing: " + ", ".join(missing))

    required_combat_features = (
        "tank.rotation.y = -Math.PI / 2;",
        "g.userData.turret = tank.userData.turret || null;",
        "BLUE_MODELS.createMuzzleFlash",
        "g.userData.flash = muzzleFlash;",
        "function setMuzzleFlashIntensity",
        "muzzle.getWorldPosition(from)",
        "start: start.clone()",
        "Math.atan2(dx, dz) - u.g.rotation.y",
        "window.__BLUE_ALERTS_COMBAT_QA",
    )
    missing = [feature for feature in required_combat_features if feature not in source]
    if missing:
        raise SystemExit("FAIL: 3D combat rig integration missing: " + ", ".join(missing))

    required_live_vfx_features = (
        "BLUE_MODELS?.createProjectile",
        "BLUE_MODELS?.createMuzzleFlash",
        "BLUE_MODELS?.createExplosion",
        "model-explosion",
        "model-muzzle",
        "disposeObject3D",
        "const unitTarget = target.g &&",
        "if (!unitTarget) target.dead = true;",
        "window.__BLUE_ALERTS_COMBAT_QA__",
        "qaFrameCount",
        "qaLastFrameDelta",
        "frameCount: qaFrameCount",
        "lastFrameDelta: qaLastFrameDelta",
    )
    missing = [feature for feature in required_live_vfx_features if feature not in source]
    if missing:
        raise SystemExit("FAIL: live combat VFX/death lifecycle missing: " + ", ".join(missing))


    required_environment_features = (
        "function addIndustrialLogisticsSet()",
        "BA_IndustrialLogisticsYard",
        "BA_Substation",
        "BA_LoadingGantry",
        "BA_FuelSilos",
        "BA_CargoStacks",
        "instanced-cargo-crates",
        "instanced-hazard-barrels",
        "window.__BLUE_ALERTS_ENVIRONMENT",
        "function insideIndustrialSet(",
        "exclusionZones:[",
        "clearanceZones:industrialYard.exclusionZones.length",
        "runtimeIntegrated:true",
        "blocksMovement:false",
    )
    missing = [feature for feature in required_environment_features if feature not in source]
    if missing:
        raise SystemExit("FAIL: V94 industrial environment integration missing: " + ", ".join(missing))

    required_building_damage_features = (
        "function spawnImpact(",
        "kind: 'impact-ring'",
        "kind: 'impact-spark'",
        "function applyBuildingDamageVisuals(",
        "function spawnBuildingSmoke(",
        "function spawnBuildingFlame(",
        "damageStage: 0",
        "if (!unitTarget && target.g) target.damageFxCd",
        "damageStage = stage",
        "scorchMark: !!target.scorch",
        "window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__",
        "impactRings: fx.filter(e => e.kind === 'impact-ring').length",
        "buildingSmoke: fx.filter(e => e.kind === 'building-smoke').length",
    )
    missing = [feature for feature in required_building_damage_features if feature not in source]
    if missing:
        raise SystemExit("FAIL: live impact/building damage states missing: " + ", ".join(missing))

    required_mission_features = (
        "const MISSION_TARGETS = Object.freeze({ deliveredOre: 600, combatUnitsProduced: 3 });",
        "function missionObjectiveSnapshot(",
        "function recordMissionDelivery(",
        "function recordMissionUnitProduction(",
        "function updateMissionHUD(",
        "missionState.enemyCitadelDestroyed = true;",
        "window.__BLUE_ALERTS_MISSION_QA__",
        "mobileMissionObjective",
        "mobileMissionBarFill",
        "Mission progress is driven by completed gameplay conditions",
    )
    missing = [feature for feature in required_mission_features if feature not in source]
    if missing:
        raise SystemExit("FAIL: playable mission objective tracking missing: " + ", ".join(missing))

    terrain_start = source.index("/* ─── Deterministic terrain art")
    terrain_end = source.index("/* ─── Game state", terrain_start)
    terrain_section = source[terrain_start:terrain_end]
    if "Math.random()" in terrain_section:
        raise SystemExit("FAIL: terrain prop placement must be deterministic")
    if "vertexColors: true" not in terrain_section:
        raise SystemExit("FAIL: terrain must use deterministic vertex color variation")
    if "new THREE.DataTexture" not in terrain_section or "terrainMaterial.map = terrainSurfaceTextures.albedo" not in terrain_section:
        raise SystemExit("FAIL: terrain must use deterministic procedural albedo texture")

    tree_start = source.index("function createLayeredTreeFoliageGeometry()")
    tree_end = source.index("const treeCapacity", tree_start)
    tree_section = source[tree_start:tree_end]
    required_tree_features = (
        "branchWhorls",
        "branchArms",
        "needleClusters",
        "new THREE.Quaternion()",
        "new THREE.ConeGeometry(radius, height, segments, 1)",
        "const appendNeedleCluster = (",
        "new THREE.DodecahedronGeometry(1, 0)",
        "needleSpraysPerArm: needleSprays.length",
        "geometry.userData",
        "function createLegacyLayeredTreeFoliageGeometry()",
    )
    missing = [feature for feature in required_tree_features if feature not in tree_section]
    if missing:
        raise SystemExit("FAIL: instanced evergreen asset is missing authored branch/needle geometry: " + ", ".join(missing))
    if "foliageTriangles: treeFoliageGeometry.userData.triangleCount" not in source:
        raise SystemExit("FAIL: evergreen geometry complexity must be exposed for browser acceptance")
    if "const tuftDirection" in tree_section or "tier.tuftHeight" in tree_section:
        raise SystemExit("FAIL: evergreen needle mass must not regress to isolated vertical cone spikes")
    if "if (!firstTreeFocus) firstTreeFocus = { x, z, scale };" not in source:
        raise SystemExit("FAIL: deterministic evergreen visual focus must track an accepted placed tree")
    required_tree_qa = (
        "setLegacy(enabled)",
        "treeFoliage.geometry = legacyTreeFoliageGeometry",
        "treeFoliage.geometry = treeFoliageGeometry",
    )
    missing = [token for token in required_tree_qa if token not in source]
    if missing:
        raise SystemExit("FAIL: evergreen A/B QA must switch the same InstancedMesh between legacy and detailed geometry: " + ", ".join(missing))


    wear_start = source.index("function addBattlefieldWear()")
    wear_end = source.index("const battlefieldWear = addBattlefieldWear()", wear_start)
    wear_section = source[wear_start:wear_end]
    required_wear_features = (
        "logistics-road-worn-shoulders",
        "const segmentShade = 0.96 + terrainHash(seed, 411) * 0.08;",
        "shoulderShading: 'per-segment-uniform-low-contrast'",
        "gantry-access-concrete-spur",
        "gantry-access-asphalt",
        "logistics-tire-wear",
        "worn-asphalt-repair-patches",
        "road-and-spur-crack-lines",
        "logistics-road-drain-grates",
        "gantry-apron-worn-safety-bars",
        "window.__BLUE_ALERTS_BATTLEFIELD_WEAR_QA",
        "focusRoad()",
        "focusCorridor()",
        "setVisible(visible)",
    )
    missing = [feature for feature in required_wear_features if feature not in wear_section]
    if missing:
        raise SystemExit("FAIL: logistics corridor wear is missing connected road/gantry detail: " + ", ".join(missing))
    if "blocksMovement: false" not in wear_section:
        raise SystemExit("FAIL: battlefield wear must remain visual-only and non-blocking")

    kill_start = source.index("function killUnit(u)")
    kill_end = source.index("function applyBuildingDamageVisuals", kill_start)
    kill_section = source[kill_start:kill_end]
    if "u.flashT = 0;" not in kill_section or "setMuzzleFlashIntensity(u.g.userData.flash, 0)" not in kill_section:
        raise SystemExit("FAIL: dead units must synchronously hide their attached turret muzzle flash")

    qa_start = source.index("const combatState =")
    qa_end = source.index("if (new URLSearchParams(location.search).get('qa') === '1')", qa_start)
    qa_section = source[qa_start:qa_end]
    required_qa = ("modelExplosionPositions", "existingExplosionMeshes", "explosionSpawned", "spawnedExplosionLife", "targetPosition", "qaSuppressCombat", "freezeNewCombat", "resumeCombat", "qaSuppressEconomyRewards", "freezeEconomyRewards", "resumeEconomyRewards", "combatSuppressed")
    missing = [token for token in required_qa if token not in qa_section]
    if missing:
        raise SystemExit("FAIL: combat QA must track the exact death explosion and isolated combat state: " + ", ".join(missing))

    building_qa_start = source.index("window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__")
    building_qa_end = source.index("window.__BLUE_ALERTS_MISSION_QA__", building_qa_start)
    building_qa_section = source[building_qa_start:building_qa_end]
    required_building_qa = (
        "units.find(u => !u.dead && u.team === 1 && u.kind === 'light' && u.dmg > 0 && u.g)",
        "units.find(u => !u.dead && u.team === 1 && u.dmg > 0 && u.g)",
        "shooterKind: shooter.kind",
        "live blue combat unit",
    )
    missing = [token for token in required_building_qa if token not in building_qa_section]
    if missing:
        raise SystemExit("FAIL: building damage QA must retain a live blue combat shooter and report its unit kind: " + ", ".join(missing))

    browser_test = BROWSER_TEST.read_text(encoding="utf-8")
    if "await desktop.locator('#endOverlay').evaluate(el => el.classList.add('hidden'))" not in browser_test:
        raise SystemExit("FAIL: desktop environment screenshots must clear the completed-mission overlay after its dedicated evidence capture")
    required_browser_test = (
        "desktopDeath.before.modelExplosions + 1",
        "mobileDeath.before.modelExplosions + 1",
        "desktopExplosionIndex",
        "mobileExplosionIndex",
        "spawnedExplosionLife",
        "freezeNewCombat",
        "resumeCombat",
        "desktopBuildingFreeze?.combatSuppressed === true",
        "mobileClean.combatSuppressed === true",
        "shooterKind",
        "desktopEconomyFreeze",
        "mobileEconomyFreeze",
        "freezeEconomyRewards",
        "resumeEconomyRewards",
        "desktopTreeBaseline",
        "mobileTreeBaseline",
        "desktop-v94-woodland-tree-baseline.png",
        "mobile-v94-woodland-tree-baseline-390x844.png",
        "setLegacy(true)",
        "setLegacy(false)",
        "battlefieldWear",
        "focusRoad()",
        "focusCorridor()",
        "setVisible(false)",
        "desktop-v94-road-wear-baseline.png",
        "desktop-v94-road-wear-detail.png",
        "mobile-v94-road-wear-baseline-390x844.png",
        "mobile-v94-road-wear-detail-390x844.png",
        "desktop-v94-tank-surface-baseline.png",
        "desktop-v94-tank-surface-detail.png",
        "mobile-v94-tank-surface-baseline-390x844.png",
        "mobile-v94-tank-surface-detail-390x844.png",
        "window.__BLUE_ALERTS_TANK_SURFACE_QA__",
        "setEnabled(false)",
        "setEnabled(true)",
        "desktop-v94-mission-complete.png",
        "await desktop.locator('#endOverlay').evaluate(el => el.classList.add('hidden'))",
        "desktop-v94-industrial-yard.png",
        "desktop-v94-terrain-surface.png",
    )
    missing = [token for token in required_browser_test if token not in browser_test]
    if missing:
        raise SystemExit("FAIL: desktop/mobile browser acceptance must verify a target-specific death explosion: " + ", ".join(missing))

    parser = ScriptCollector()
    parser.feed(source)
    parser.close()
    if not parser.scripts:
        raise SystemExit("FAIL: no inline JavaScript found to syntax-check")

    for index, (script_type, code) in enumerate(parser.scripts, start=1):
        check_js(code, script_type == "module", f"HTML script #{index}")

    check_js(MODEL_LIBRARY.read_text(encoding="utf-8"), True, "v94 model library")
    print(
        f"PASS: {HTML}; {len(parser.scripts)} inline script(s), "
        f"model library {MODEL_LIBRARY.stat().st_size} bytes; JavaScript syntax valid."
    )
    print("NOTE: this is static validation; browser WebGL rendering and gameplay still require a real browser test.")
    if parser.external_scripts:
        print("External script dependencies:")
        for url in parser.external_scripts:
            print(f" - {url}")


if __name__ == "__main__":
    main()
