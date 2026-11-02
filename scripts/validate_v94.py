#!/usr/bin/env python3
"""Static integrity checks for the BLUE ALERTS v94 3D HTML prototype."""
from html.parser import HTMLParser
import json
from pathlib import Path
import subprocess
import sys
import tempfile

HTML = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("BLUE_ALERTS_v94_ASSET_INTEGRATION.html")
MODEL_LIBRARY = Path("game-data/models/blue-alert-models.js")
CAMPAIGN = Path("game-data/campaigns/first-contact.campaign.json")


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
    if not CAMPAIGN.is_file():
        raise SystemExit(f"FAIL: {CAMPAIGN} is missing")

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
    )
    missing = [feature for feature in required_features if feature not in source]
    if missing:
        raise SystemExit("FAIL: expected v94 3D/game features missing: " + ", ".join(missing))

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
        "function collectFxParts",
        "parts: collectFxParts(mesh)",
        "parts: collectFxParts(flash)",
        "for (const part of e.parts)",
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

    if "e.mesh.traverse(object =>" in source:
        raise SystemExit("FAIL: model VFX hot loop must use cached mesh/material references")

    campaign = json.loads(CAMPAIGN.read_text(encoding="utf-8"))
    missions = campaign.get("missions", [])
    if campaign.get("schemaVersion") != 1 or campaign.get("campaignId") != "first-contact":
        raise SystemExit("FAIL: First Contact campaign identity/schema is invalid")
    if len(missions) != 6 or [m.get("order") for m in missions] != list(range(1, 7)):
        raise SystemExit("FAIL: campaign must contain six ordered missions")
    mission_ids = [m.get("id") for m in missions]
    if len(set(mission_ids)) != len(mission_ids) or any(not value for value in mission_ids):
        raise SystemExit("FAIL: campaign mission IDs must be unique and non-empty")
    objective_ids = []
    objective_count = 0
    for mission in missions:
        for field in ("title", "briefing", "success", "debrief"):
            if not mission.get(field):
                raise SystemExit(f"FAIL: mission {mission.get('id')} is missing {field}")
        if not mission.get("failure") or not mission.get("primaryObjectives"):
            raise SystemExit(f"FAIL: mission {mission.get('id')} needs failure conditions and primary objectives")
        if not isinstance(mission.get("optionalObjectives"), list) or not mission["optionalObjectives"]:
            raise SystemExit(f"FAIL: mission {mission.get('id')} needs at least one optional objective")
        for objective in mission["primaryObjectives"] + mission["optionalObjectives"]:
            objective_count += 1
            objective_id = objective.get("id")
            if not objective_id:
                raise SystemExit(f"FAIL: mission {mission.get('id')} contains an objective without an ID")
            objective_ids.append(objective_id)
            if not objective.get("title") or not objective.get("type"):
                raise SystemExit(f"FAIL: objective {objective_id} needs a title and type")
    if objective_count != 18 or len(set(objective_ids)) != objective_count:
        raise SystemExit("FAIL: campaign must contain 18 uniquely identified objectives")
    print(f"PASS: First Contact campaign; {len(missions)} missions and {objective_count} unique objectives.")

    terrain_start = source.index("/* ─── Deterministic terrain art")
    terrain_end = source.index("/* ─── Game state", terrain_start)
    terrain_section = source[terrain_start:terrain_end]
    if "Math.random()" in terrain_section:
        raise SystemExit("FAIL: terrain prop placement must be deterministic")
    if "vertexColors: true" not in terrain_section:
        raise SystemExit("FAIL: terrain must use deterministic vertex color variation")


    environment_contract = {
        "runtime industrial set": "addIndustrialLogisticsSet",
        "four authored clusters": "clusterCount:group.children.length",
        "instanced cargo batch": "new THREE.InstancedMesh(new THREE.BoxGeometry(1.65,1.45,1.65),steel,12)",
        "instanced hazard batch": "new THREE.InstancedMesh(new THREE.CylinderGeometry(.42,.42,1.15,10),hazard,8)",
        "non-blocking environment": "blocksMovement:false"
    }
    for label, token in environment_contract.items():
        if token not in source:
            raise SystemExit(f"FAIL: missing {label} contract in runtime HTML")

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
