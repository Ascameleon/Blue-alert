#!/usr/bin/env python3
"""Create a deterministic OpenRTS skirmish map from the pinned test terrain."""
from __future__ import annotations

import copy
import json
import math
import shutil
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

# OpenRTS resolves cliffs by builder ID; the test map leaves many blank.
# This ID exists in the pinned engine's cliffshapes.xml and is linked by StdMapStyle.
DEFAULT_CLIFF_SHAPE_ID = "StdRockyVegyDug"
cliff_shape_defaults_applied = 0
map_tiles = map_data.get("tiles", [])
# Preserve the source cliff markers before filling missing IDs for engine compatibility.
original_cliff_tile_indices = {
    int(tile["index"]) for tile in map_tiles if tile.get("cliffShapeID")
}
for tile in map_tiles:
    if not tile.get("cliffShapeID"):
        tile["cliffShapeID"] = DEFAULT_CLIFF_SHAPE_ID
        cliff_shape_defaults_applied += 1
if any(not tile.get("cliffShapeID") for tile in map_tiles):
    raise RuntimeError("Map contains tiles without a valid cliff shape ID")

# The pinned engine stores Ramp tile references as integer indices. The
# bundled legacy test.btf stores inline Tile objects instead; those deserialize
# without a Map and crash Ramp.compute(). Normalize them to tilesRef indices.
ramp_count = 0
ramp_tile_reference_count = 0
for ramp in map_data.get("ramps", []):
    legacy_tiles = ramp.pop("tiles", [])
    tile_refs = ramp.get("tilesRef") or [
        int(tile["index"])
        for tile in legacy_tiles
        if isinstance(tile, dict) and "index" in tile
    ]
    if not tile_refs:
        raise RuntimeError("Ramp has no tile indices after serialization normalization")
    if len(set(tile_refs)) != len(tile_refs):
        raise RuntimeError("Ramp contains duplicate tile indices")
    for index in tile_refs:
        if not isinstance(index, int) or index < 0 or index >= len(map_tiles):
            raise RuntimeError(f"Ramp tile index is outside the map: {index}")
    ramp["tilesRef"] = tile_refs
    ramp_count += 1
    ramp_tile_reference_count += len(tile_refs)
if any("tiles" in ramp for ramp in map_data.get("ramps", [])):
    raise RuntimeError("Legacy inline Ramp.tiles objects remain in the runtime map")

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

required = {"Marine", "rollerTank"}
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
    # Keep both factions in the western flat lane, clear of the central
    # cliff cluster. This prevents the cliff from occluding units in the
    # camera view while preserving the two-faction group-movement test.
    ("rollerTank", "1", 18, 35, 0.0),
    ("rollerTank", "1", 18, 40, 0.0),
    ("Marine", "1", 19, 36, 0.0),
    ("Marine", "1", 20, 37, 0.0),
    ("Marine", "1", 19, 39, 0.0),
    ("Marine", "1", 20, 41, 0.0),
    ("rollerTank", "2", 28, 35, math.pi),
    ("rollerTank", "2", 28, 40, math.pi),
    ("Marine", "2", 27, 36, math.pi),
    ("Marine", "2", 26, 37, math.pi),
    ("Marine", "2", 27, 39, math.pi),
    ("Marine", "2", 26, 41, math.pi),
]

units = []
seen_positions = set()
minimum_cliff_clearance = float('inf')
for builder_id, faction_name, x, y, orientation in placements:
    if builder_id not in required:
        raise RuntimeError(f"Unexpected unit builder: {builder_id}")
    if not (2 <= x < width - 2 and 2 <= y < height - 2):
        raise RuntimeError(f"Unit position is outside the map: {(x, y)}")
    if (x, y) in seen_positions:
        raise RuntimeError(f"Duplicate unit position: {(x, y)}")
    tile_index = y * width + x
    cliff_clearance = min(
        (abs(x - (index % width)) + abs(y - (index // width)) for index in original_cliff_tile_indices),
        default=999,
    )
    minimum_cliff_clearance = min(minimum_cliff_clearance, cliff_clearance)
    if cliff_clearance < 5:
        raise RuntimeError(f"Unit spawn is too close to the central cliff: {(x, y)} (clearance={cliff_clearance})")
    terrain_tile = map_tiles[tile_index]
    if (
        int(terrain_tile.get("level", 0)) != 0
        or abs(float(terrain_tile.get("elevation", 0.0))) > 0.01
        or tile_index in original_cliff_tile_indices
    ):
        raise RuntimeError(
            f"Unit spawn must be on flat, non-cliff terrain: {(x, y)} "
            f"(level={terrain_tile.get('level')}, elevation={terrain_tile.get('elevation')})"
        )
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

# OpenRTS loads a same-basename .btfatlas sidecar for every .btf map.
source_atlas_path = base_path.with_name(base_path.name + "atlas")
output_atlas_path = output_path.with_name(output_path.name + "atlas")
source_cover_path = base_path.with_name(base_path.name + "cover")
output_cover_path = output_path.with_name(output_path.name + "cover")
for source_sidecar, output_sidecar, label in (
    (source_atlas_path, output_atlas_path, "atlas"),
    (source_cover_path, output_cover_path, "cover"),
):
    if not source_sidecar.is_file():
        raise RuntimeError(f"Source map {label} sidecar is missing: {source_sidecar}")
    shutil.copyfile(source_sidecar, output_sidecar)
    if not output_sidecar.is_file() or output_sidecar.stat().st_size != source_sidecar.stat().st_size:
        raise RuntimeError(f"Generated map {label} sidecar is missing or incomplete")

# Re-open the written file to prove the runtime input is valid JSON and complete.
verified = json.loads(output_path.read_text())
verified_units = verified["engagement"]["initialEngagement"]
if len(verified_units) != 12:
    raise RuntimeError(f"Expected 12 initial units, found {len(verified_units)}")
if {unit["factionName"] for unit in verified_units} != {"1", "2"}:
    raise RuntimeError("Scenario must contain both OpenRTS factions")
for unit in verified_units:
    x, y = int(unit["pos"]["x"]), int(unit["pos"]["y"])
    tile_index = y * width + x
    terrain_tile = map_tiles[tile_index]
    if (
        int(terrain_tile.get("level", 0)) != 0
        or abs(float(terrain_tile.get("elevation", 0.0))) > 0.01
        or tile_index in original_cliff_tile_indices
    ):
        raise RuntimeError(f"Serialized unit is not on flat terrain: {(x, y)}")
verified_ramps = verified["map"].get("ramps", [])
if len(verified_ramps) != ramp_count:
    raise RuntimeError("Ramp count changed during serialization")
if any("tiles" in ramp or not ramp.get("tilesRef") for ramp in verified_ramps):
    raise RuntimeError("Runtime map contains an invalid Ramp serialization")

report = {
    "status": "validated",
    "map": {"width": width, "height": height, "style": map_data.get("mapStyleID")},
    "unit_count": len(verified_units),
    "factions": {"1": "red", "2": "blue"},
    "unit_composition": {"rollerTank": 4, "Marine": 8},
    "spawn_terrain": "all 12 units validated on level-0, elevation-0, non-cliff tiles in the western flat lane",
    "minimum_manhattan_clearance_from_cliff": minimum_cliff_clearance,
    "cliff_shape_id": DEFAULT_CLIFF_SHAPE_ID,
    "cliff_shape_defaults_applied": cliff_shape_defaults_applied,
    "ramp_count": ramp_count,
    "ramp_tile_reference_count": ramp_tile_reference_count,
    "source_map": str(base_path),
    "output_map": str(output_path),
    "source_atlas": str(source_atlas_path),
    "output_atlas": str(output_atlas_path),
    "atlas_bytes": output_atlas_path.stat().st_size,
    "source_cover": str(source_cover_path),
    "output_cover": str(output_cover_path),
    "cover_bytes": output_cover_path.stat().st_size,
}
report_path.parent.mkdir(parents=True, exist_ok=True)
report_path.write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report, indent=2))
