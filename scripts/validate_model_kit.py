#!/usr/bin/env python3
"""Static contract checks for the expanded BLUE ALERTS procedural 3D asset kit."""
from pathlib import Path
import subprocess
import tempfile

MODEL = Path("game-data/models/blue-alert-models.js")
PREVIEW = Path("game-data/models/preview.html")
REQUIRED_EXPORTS = (
    "createTank", "createInfantry", "createBuilding", "createLandscape",
    "createTree", "createRock", "createAircraft", "createHelicopter",
    "createDrone", "createProjectile", "createExplosion",
    "a==='aircraft'", "a==='helicopter'", "a==='drone'",
    "a==='projectile'", "a==='explosion'",
)
REQUIRED_PREVIEW = (
    "Avion d’attaque", "Hélicoptère d’assaut", "Drone de reconnaissance",
    "Projectile", "Explosion", "createAircraft", "createHelicopter",
    "createDrone", "createProjectile", "createExplosion",
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
    for path in (MODEL, PREVIEW):
        if not path.is_file():
            raise SystemExit(f"FAIL: missing {path}")
    model = MODEL.read_text(encoding="utf-8")
    preview = PREVIEW.read_text(encoding="utf-8")
    missing = [name for name in REQUIRED_EXPORTS if f"export function {name}" not in model]
    if missing:
        raise SystemExit("FAIL: missing model exports: " + ", ".join(missing))
    missing = [name for name in REQUIRED_PREVIEW if name not in preview]
    if missing:
        raise SystemExit("FAIL: preview does not expose: " + ", ".join(missing))
    node_check(model, "model kit")
    scripts = preview.split("<script type=\"module\">")
    if len(scripts) < 2:
        raise SystemExit("FAIL: preview module script missing")
    module = scripts[-1].split("</script>", 1)[0]
    node_check(module, "preview module")
    print(f"PASS: {len(REQUIRED_EXPORTS)} exported asset constructors and {len(REQUIRED_PREVIEW)} preview hooks.")
    print(f"PASS: model kit ({len(model)} chars) and preview module JavaScript syntax valid.")

if __name__ == "__main__":
    main()
