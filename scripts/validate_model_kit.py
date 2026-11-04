#!/usr/bin/env python3
"""Static contract checks for the expanded BLUE ALERTS procedural 3D asset kit."""
from pathlib import Path
import subprocess
import tempfile

MODEL = Path("game-data/models/blue-alert-models.js")
PREVIEW = Path("game-data/models/preview.html")
GAME = Path("BLUE_ALERTS_v94_ASSET_INTEGRATION.html")
REQUIRED_EXPORTS = (
    "createTank", "createInfantry", "updateInfantryAnimation", "createBuilding", "createLandscape",
    "createTree", "createRock", "createAircraft", "createHelicopter", "setBuildingSurfaceDetail",
    "createDrone", "createProjectile", "createExplosion", "createMuzzleFlash",
    "createHarvester", "createCitadel", "createRelay", "createOreNode",
)
REQUIRED_MODEL = (
    "BLUE_SENTINEL_RIFLEMAN", "RED_BASTION_RIFLEMAN",
    "infantry-assault-rifle", "infantry-torso-rig", "makeArm", "makeLeg",
)
REQUIRED_PREVIEW = (
    "updateInfantryAnimation", "setBuildingSurfaceDetail", "__BLUE_ALERTS_PREVIEW_QA__", "setHqSurfaceDetail",
    "Avion d’attaque", "Hélicoptère d’assaut", "Drone de reconnaissance",
    "Projectile", "Explosion", "Flash de bouche", "createMuzzleFlash", "createAircraft", "createHelicopter",
    "createDrone", "createProjectile", "createExplosion",
    "Moissonneuse", "Citadelle", "Relais de capture", "Gisement de minerai", "Tour de contrôle", "controlTower",
    "createHarvester", "createCitadel", "createRelay", "createOreNode",
    "a==='aircraft'", "a==='helicopter'", "a==='drone'",
    "a==='projectile'", "a==='explosion'", "a==='muzzleFlash'",
    "a==='harvester'", "a==='citadel'", "a==='relay'", "a==='ore'",
    "BLUE SENTINEL", "RED BASTION",
)

def node_check(source: str, label: str) -> None:
    with tempfile.NamedTemporaryFile("w", suffix=".mjs", encoding="utf-8", delete=False) as f:
        f.write(source)
        path = Path(f.name)
    try:
        result = subprocess.run(["node", "--check", str(path)], text=True, capture_output=True)
        if result.returncode:
            raise SystemExit(f"FAIL: {label} syntax error\n{result.stderr}")
    finally:
        path.unlink(missing_ok=True)

def main():
    for path in (MODEL, PREVIEW, GAME):
        if not path.is_file():
            raise SystemExit(f"FAIL: missing {path}")
    model = MODEL.read_text(encoding="utf-8")
    preview = PREVIEW.read_text(encoding="utf-8")
    game = GAME.read_text(encoding="utf-8")
    missing = [name for name in REQUIRED_EXPORTS if f"export function {name}" not in model]
    if missing:
        raise SystemExit("FAIL: missing model exports: " + ", ".join(missing))
    missing = [name for name in REQUIRED_MODEL if name not in model]
    if missing:
        raise SystemExit("FAIL: faction infantry model is missing: " + ", ".join(missing))
    REQUIRED_HERO_PARTS = (
        "SENTINEL_BASTION_FIELD_SOLDIER_V4", "faceted-helmet-shell", "gas-mask-faceplate",
        "gas-mask-optic-lens", "respirator-filter-housing", "respirator-filter-cap",
        "respirator-filter-vent", "respirator-breathing-hose", "gas-mask-chin-guard",
        "angular-pauldron", "articulated-knee-guard", "rifle-top-rail", "rifle-ejection-port",
        "createInfantrySurfaceTextures", "FIELDWEAVE_CERAMIC_MICROSCUFF_V2", "fabricBump", "armorBump", "metalBump",
        "createBuildingSurfaceTextures", "CAST_CONCRETE_PAINT_MICROWEAR_V1", "surfaceMaterialBindings", "surfaceTextureResolution", "resolutionCache", "surfaceMaterialBindingsActive",
        "head.scale.setScalar(.82)", "helmet shell above is the sole crown surface",
    )
    missing = [name for name in REQUIRED_HERO_PARTS if name not in model]
    if missing:
        raise SystemExit("FAIL: hero infantry sculpt is missing: " + ", ".join(missing))
    REQUIRED_ANATOMY = (
        "createInfantryLoftGeometry", "infEntryProfile = true",
        "anatomical-torso-loft", "ANATOMICAL_HARDSHELL_FIELDWEAVE_V2",
        "CONVEX_COMPOSITE_CERAMIC_V2", "REINFORCED_TREAD_AND_TOE_CAP_V2",
        "curvedPlate", "curvedArmorPlateCount", "-boot-tread-sole", "-boot-toe-cap",
        "new THREE.SphereGeometry(radius, 12, 8)", "new THREE.SphereGeometry(1, 12, 8)",
        "new THREE.SphereGeometry(.17, 24, 16)", "new THREE.SphereGeometry(radius, 8, 6)",
        "MOBILE_RTS_SOLDIER_GEOMETRY_V2",
        "SHOULDER_ELBOW_HIP_KNEE_V1",
        "TWO_HAND_FORWARD_READY_V1", "-elbow-pivot", "-knee-pivot",
        "-upper-arm-loft", "-forearm-loft", "-thigh-loft", "-calf-loft",
        "-glove-palm", "leftKnee.rotation.x", "rightKnee.rotation.x",
    )
    missing = [name for name in REQUIRED_ANATOMY if name not in model]
    if missing:
        raise SystemExit("FAIL: anatomical infantry and joint rig missing: " + ", ".join(missing))
    REQUIRED_BATCHING = ("mergeInfantryStaticMeshes", "mergedPartNames", "mergedBeveledPartNames", "keepSeparateForCombat", "renderOptimization")
    missing = [name for name in REQUIRED_BATCHING if name not in model]
    if missing:
        raise SystemExit("FAIL: infantry render batching contract missing: " + ", ".join(missing))
    if "surfaceFinish" not in preview or "surfaceTextureCount" not in preview or "surfaceMaterialCount" not in preview:
        raise SystemExit("FAIL: preview must expose real infantry PBR surface-map diagnostics")
    if "mergedPartNames" not in preview or "renderOptimization" not in preview:
        raise SystemExit("FAIL: preview must retain source part names and render-batching diagnostics")
    missing = [name for name in REQUIRED_PREVIEW if name not in preview]
    if missing:
        raise SystemExit("FAIL: preview does not expose: " + ", ".join(missing))
    required_tank_features = (
        "factionProfile", "BLUE_SENTINEL", "RED_BASTION", "cast-hull-shell", "front-glacis",
        "createCastHullGeometry", "createArmoredProfileGeometry", "createArmoredProfileMesh", "createTrackLoopGeometry",
        "CAST_MULTI_STATION_HULL_V2", "hullStationCount", "CLOSED_STADIUM_TREAD_LOOP_V1",
        "createCastTurretGeometry", "CAST_TURRET_STATIONS_V2", "turretStationCount", "MULTI_STATION_CAST_TURRET_V2",
        "track-belt-loop-left", "track-belt-loop-right", "trackLinkCount",
        "engine-deck-grilles-instanced", "reactive-armor-tiles-instanced",
        "return-rollers-instanced", "road-wheels-instanced", "wheel-hubs-instanced",
        "wheel-hub-caps-instanced", "track-shoe-instanced", "wheel-bolts-instanced",
        "blue-turret-cheeks-instanced", "red-turret-cheeks-instanced",
        "red-bastion-side-plates-instanced", "red-bastion-cupola",
        "heavy-turret-reinforcements-instanced",
        "beveledBoxGeometry", "beveledBox", "new THREE.ExtrudeGeometry",
        "geometry.userData.beveledArmor", "cornerCut",
    )
    missing = [feature for feature in required_tank_features if feature not in model]
    if missing:
        raise SystemExit("FAIL: faction tank signatures missing: " + ", ".join(missing))

    required_defense_turret_features = (
        "DEFENSE_CUPOLA_LOFT_V2", "defenseTurretGeometryProfile",
        "defenseTurretStationCount", "createCastTurretGeometry",
        "cupolaStations", "armored-cupola",
    )
    missing = [feature for feature in required_defense_turret_features if feature not in model]
    if missing:
        raise SystemExit("FAIL: cast defensive turret sculpt missing: " + ", ".join(missing))

    required_command_hq_features = (
        "ARMORED_BASTION_COMMAND_CORE_V3", "createCommandBunkerGeometry",
        "commandCoreGeometryProfile", "commandCoreProfileVertexCount", "commandCoreStationCount",
        "commandCoreStations", "geometry.userData.castCommandBunker", "command-core-cast-shell",
        "command-window-recess", "command-glass-pane-", "command-entry-frame",
        "command-entry-door", "command-buttress-left", "command-buttress-right",
        "command-roof-parapet", "command-annex-vent-louver", "CAST_CONCRETE_PAINT_MICROWEAR_V1",
        "createBuildingSurfaceTextures", "surfaceTextureCount", "surfaceMaterialCount", "setBuildingSurfaceDetail",
    )
    missing = [feature for feature in required_command_hq_features if feature not in model]
    if missing:
        raise SystemExit("FAIL: cast command-HQ architecture missing: " + ", ".join(missing))

    if "camera.position.set(a==='landscape'?22:a==='infantry'?2.75:8" not in preview or "infantryArmorParts" not in preview:
        raise SystemExit("FAIL: infantry preview must use close framing and expose actual armor mesh diagnostics")

    if "BLUE_MODELS.createTank" not in game:
        raise SystemExit("FAIL: V94 runtime must instantiate the faction tank model kit")
    for token in ("blue-alert-models.js?v=14", "defenseTurretGeometryProfile", "defenseTurretStationCount", "BLUE_MODELS.createHarvester", "BLUE_MODELS.createCitadel", "BLUE_MODELS.createOreNode", "BLUE_MODELS.updateInfantryAnimation", "g.userData.infantryRig"):
        if token not in game:
            raise SystemExit(f"FAIL: game integration missing {token}")
    node_check(model, "model kit")
    scripts = preview.split("<script type=\"module\">")
    if len(scripts) < 2:
        raise SystemExit("FAIL: preview module script missing")
    module = scripts[-1].split("</script>", 1)[0]
    node_check(module, "preview module")
    print(f"PASS: {len(REQUIRED_EXPORTS)} exported asset constructors and {len(REQUIRED_PREVIEW)} preview hooks.")
    print("PASS: faction-specific infantry profiles and deterministic gait are wired into V94.")
    print(f"PASS: model kit ({len(model)} chars) and preview module JavaScript syntax valid.")

if __name__ == "__main__":
    main()
