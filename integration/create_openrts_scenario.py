#!/usr/bin/env python3
"""Create a deterministic OpenRTS skirmish map from the pinned test terrain."""
from __future__ import annotations

import copy
import json
import math
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

if len(sys.argv) != 5:
    raise SystemExit(
        "Usage: create_openrts_scenario.py <base.btf> <output.btf> <army-data-dir> <report.json>"
    )

base_path, output_path, army_dir, report_path = map(Path, sys.argv[1:])
data = json.loads(base_path.read_text())
map_data = data.get("map", {})

# The pinned OpenRTS test map leaves cliffShapeID empty on many elevated tiles.
# Any level transition then asks BuilderManager for CliffShape/ and aborts.
# StdRockyVegyDug is defined in the pinned engine's cliffshapes.xml and is
# already linked by StdMapStyle, so use it as the deterministic default.
DEFAULT_CLIFF_SHAPE_ID = "StdRockyVegyDug"
cliff_shape_defaults_applied = 0
for tile in map_data.get("tiles", []):
    if not tile.get("cliffShapeID"):
        tile["cliffShapeID"] = DEFAULT_CLIFF_SHAPE_ID
        cliff_shape_defaults_applied += 1
for ramp in map_data.get("ramps", []):
    for tile in ramp.get("tiles", []):
        if not tile.get("cliffShapeID"):
            tile["cliffShapeID"] = DEFAULT_CLIFF_SHAPE_ID
            cliff_shape_defaults_applied += 1
if any(not tile.get("cliffShapeID") for tile in map_data.get("tiles", [])):
    raise RuntimeError("Map contains tiles without a valid cliff shape ID")
if any(
    not tile.get("cliffShapeID")
    for ramp in map_data.get("ramps", [])
    for tile in ramp.get("tiles", [])
):
    raise RuntimeError("Ramp contains tiles without a valid cliff shape ID")

width = int(map_data.get("atlas", {}).get("mapWidth", 0))
height = int(map_data.get("atlas", {}).get("mapHeight", 0))
if width < 60 or height < 60:
    raise RuntimeError(f"Unexpected OpenRTS test map dimensions: {width}x{height}")

unit_ids: set[str] = set()
for xml_path in army_dir.rglob("*.xml"):
    try:
        root = ET.parse(xml_path).getroot()
    except ET.ParseError as error:
        raise RuntimeError(f"Invalid engine unit definition {xml_path}: {error}") from error
    for element in root.iter():
        value = element.attrib.get("id")
        if value:
            unit_ids.add(value)

required = {"Marine", "humantank"}
missing = sorted(required - unit_ids)
if missing:
    raise RuntimeError(f"Required OpenRTS unit definitions are missing: {missing}")

engagement = data.get("engagement")
if not isinstance(engagement, dict):
    raise RuntimeError("Base battlefield has no engagement section")
templates = engagement.get("initialEngagement")
if not isinstance(templates, list) or not templates:
    raise RuntimeError("Base battlefield has no UnitMemento template")
template = templates[0]

# OpenRTS default factions: 1 = red, 2 = blue.
placements = [
    ("humantank", "1", 35, 36, 0.0),
    ("humantank", "1", 35, 44, 0.0),
    ("Marine", "1", 32, 37, 0.0),
    ("Marine", "1", 32, 40, 0.0),
    ("Marine", "1", 32, 43, 0.0),
    ("Marine", "1", 34, 40, 0.0),
    ("humantank", "2", 45, 36, math.pi),
    ("humantank", "2", 45, 44, math.pi),
    ("Marine", "2", 48, 37, math.pi),
    ("Marine", "2", 48, 40, math.pi),
    ("Marine", "2", 48, 43, math.pi),
    ("Marine", "2", 46, 40, math.pi),
]

units = []
seen_positions = set()
for builder_id, faction_name, x, y, orientation in placements:
    if builder_id not in required:
        raise RuntimeError(f"Unexpected unit builder: {builder_id}")
    if not (2 <= x < width - 2 and 2 <= y < height - 2):
        raise RuntimeError(f"Unit position is outside the map: {(x, y)}")
    if (x, y) in seen_positions:
        raise RuntimeError(f"Duplicate unit position: {(x, y)}")
    seen_positions.add((x, y))
    unit = copy.deepcopy(template)
    unit["builderID"] = builder_id
    unit["factionName"] = faction_name
    unit["pos"] = {"x": float(x), "y": float(y), "z": 0.0}
    unit["orientation"] = float(orientation)
    units.append(unit)

engagement["initialEngagement"] = units
output_path.parent.mkdir(parents=True, exist_ok=True)
output_path.write_text(json.dumps(data, separators=(",", ":")))

# Re-open the written file to prove the runtime input is valid JSON and complete.
verified = json.loads(output_path.read_text())
verified_units = verified["engagement"]["initialEngagement"]
if len(verified_units) != 12:
    raise RuntimeError(f"Expected 12 initial units, found {len(verified_units)}")
if {unit["factionName"] for unit in verified_units} != {"1", "2"}:
    raise RuntimeError("Scenario must contain both OpenRTS factions")

report = {
    "status": "validated",
    "map": {"width": width, "height": height, "style": map_data.get("mapStyleID")},
    "unit_count": len(verified_units),
    "factions": {"1": "red", "2": "blue"},
    "unit_composition": {"humantank": 4, "Marine": 8},
    "cliff_shape_id": DEFAULT_CLIFF_SHAPE_ID,
    "cliff_shape_defaults_applied": cliff_shape_defaults_applied,
    "source_map": str(base_path),
    "output_map": str(output_path),
}
report_path.parent.mkdir(parents=True, exist_ok=True)
report_path.write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report, indent=2))
