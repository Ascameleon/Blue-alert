#!/usr/bin/env python3
"""Validate BLUE ALERTS scenario data and prototype syntax prerequisites."""
from pathlib import Path
import xml.etree.ElementTree as ET

SCENARIO = Path("game-data/blue-alerts-skirmish.xml")

def main():
    root = ET.parse(SCENARIO).getroot()
    assert root.tag == "blueAlertsScenario", "unexpected scenario root"
    factions = root.findall("./factions/faction")
    assert len(factions) == 2, "skirmish must have exactly two factions"
    faction_ids = {f.get("id") for f in factions}
    assert faction_ids == {"blue", "red"}, "missing expected factions"

    structures = root.findall("./structures/structure")
    structure_ids = {s.get("id") for s in structures}
    for faction in factions:
        assert faction.get("commandStructure") in structure_ids, (
            f"unknown command structure for {faction.get('id')}"
        )

    units = root.findall("./units/unit")
    assert len(units) >= 3, "expected infantry, scout and heavy unit"
    unit_ids = {u.get("id") for u in units}
    assert {"rifle-squad", "scout-vehicle", "tank"} <= unit_ids
    weapons = {w.get("id") for w in root.findall("./weapons/weapon")}
    for unit in units:
        assert unit.get("weapon") in weapons, f"unknown weapon for {unit.get('id')}"
        for key in ("cost", "buildSeconds", "health", "speed", "range", "damage"):
            assert float(unit.get(key, "0")) > 0, f"{unit.get('id')} has invalid {key}"
    for structure in structures:
        assert float(structure.get("health", "0")) > 0
        assert float(structure.get("cost", "0")) >= 0
    points = root.findall("./map/capturePoint")
    assert len(points) >= 3, "map needs three capture points"
    print(f"PASS: scenario XML valid; {len(factions)} factions, {len(structures)} structures, {len(units)} unit types, {len(points)} capture points.")
    print("NOTE: scenario is design data and is not yet loaded by OpenRTS runtime.")

if __name__ == "__main__":
    main()
