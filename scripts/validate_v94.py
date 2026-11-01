#!/usr/bin/env python3
"""Static integrity checks for the BLUE ALERTS v94 3D HTML prototype."""
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import sys
import tempfile

HTML = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("BLUE_ALERTS_v94_ASSET_INTEGRATION.html")
MODEL_LIBRARY = Path("game-data/models/blue-alert-models.js")


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

    required_mobile_features = (
        'id="mobileCommands"',
        'id="mobileAttack"',
        "syncMobileAttackButton",
        "antialias: !isMobile",
        "isMobile ? 100 : 160",
        "isMobile ? 48 : 80",
    )
    missing = [feature for feature in required_mobile_features if feature not in source]
    if missing:
        raise SystemExit("FAIL: mobile RTS controls/performance integration missing: " + ", ".join(missing))

    terrain_start = source.index("/* ─── Deterministic terrain art")
    terrain_end = source.index("/* ─── Game state", terrain_start)
    terrain_section = source[terrain_start:terrain_end]
    if "Math.random()" in terrain_section:
        raise SystemExit("FAIL: terrain prop placement must be deterministic")
    if "vertexColors: true" not in terrain_section:
        raise SystemExit("FAIL: terrain must use deterministic vertex color variation")

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
