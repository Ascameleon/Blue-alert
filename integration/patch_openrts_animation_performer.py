#!/usr/bin/env python3
"""Make legacy OpenRTS animation actors safe for static models without AnimControl."""
from __future__ import annotations

import sys
from pathlib import Path

if len(sys.argv) != 2:
    raise SystemExit("Usage: patch_openrts_animation_performer.py <AnimationPerformer.java>")

path = Path(sys.argv[1])
if not path.is_file():
    raise SystemExit(f"OpenRTS AnimationPerformer.java not found: {path}")

source = path.read_text()
old = "\t\tAnimChannel channel = s.getControl(AnimControl.class).getChannel(0);"
new = """\t\tAnimControl animControl = s.getControl(AnimControl.class);
\t\tif (animControl == null) {
\t\t\t// Static models have no animation channel; ignore their optional animation actors.
\t\t\treturn;
\t\t}
\t\tAnimChannel channel = animControl.getChannel(0);"""

if old in source:
    source = source.replace(old, new, 1)
elif new not in source:
    raise RuntimeError("AnimationPerformer animation channel lookup was not found")

if "if (animControl == null)" not in source or "animControl.getChannel(0)" not in source:
    raise RuntimeError("AnimationPerformer null-control guard was not installed")

path.write_text(source)
print("Patched AnimationPerformer to skip animation actors on static models.")
