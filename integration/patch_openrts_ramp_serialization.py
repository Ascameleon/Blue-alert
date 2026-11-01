#!/usr/bin/env python3
"""Patch the pinned OpenRTS Ramp JSON mapping to use stable tile indices."""
from __future__ import annotations

import sys
from pathlib import Path

if len(sys.argv) != 2:
    raise SystemExit("Usage: patch_openrts_ramp_serialization.py <Ramp.java>")

path = Path(sys.argv[1])
if not path.is_file():
    raise SystemExit(f"OpenRTS Ramp.java not found: {path}")

source = path.read_text()
ignore_import = "import com.fasterxml.jackson.annotation.JsonIgnore;"
property_import = "import com.fasterxml.jackson.annotation.JsonProperty;"
if ignore_import not in source:
    raise RuntimeError("Pinned OpenRTS Ramp.java has no JsonIgnore import")
if property_import not in source:
    source = source.replace(ignore_import, ignore_import + "\n" + property_import, 1)

getter = "\tpublic List<Tile> getTiles() {"
ignored_getter = "\t@JsonIgnore\n\tpublic List<Tile> getTiles() {"
if getter not in source and ignored_getter not in source:
    raise RuntimeError("Pinned OpenRTS Ramp.java getTiles() method not found")
if ignored_getter not in source:
    source = source.replace(getter, ignored_getter, 1)

if "getTilesRef()" not in source:
    methods = """\t@JsonProperty("tilesRef")
\tpublic List<Integer> getTilesRef() {
\t\treturn tilesRef;
\t}

\t@JsonProperty("tilesRef")
\tpublic void setTilesRef(List<Integer> refs) {
\t\tthis.tilesRef = refs == null ? new ArrayList<>() : new ArrayList<>(refs);
\t}

"""
    source = source.replace(ignored_getter, methods + ignored_getter, 1)

if "setTilesRef(List<Integer> refs)" not in source or "getTilesRef()" not in source:
    raise RuntimeError("Ramp tilesRef JSON accessors were not installed")
if "@JsonIgnore\n\tpublic List<Tile> getTiles()" not in source:
    raise RuntimeError("Ramp.getTiles() is not ignored for JSON serialization")

path.write_text(source)
print("Patched OpenRTS Ramp JSON mapping: tilesRef indices are serialized; Tile objects are runtime-only.")
