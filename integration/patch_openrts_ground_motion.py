#!/usr/bin/env python3
"""Keep ground-unit collision correction in the 2D motion contract."""
from __future__ import annotations

import sys
from pathlib import Path

if len(sys.argv) != 2:
    raise SystemExit("Usage: patch_openrts_ground_motion.py <CollisionManager.java>")

path = Path(sys.argv[1])
if not path.is_file():
    raise SystemExit(f"OpenRTS CollisionManager.java not found: {path}")

source = path.read_text()
old = "res.setVelocity(getAntiOverlapVector().getScaled(traveledDistance));"
new = """Point2D antiOverlap = getAntiOverlapVector().get2D().getMult(traveledDistance);
            double correctionDistance = antiOverlap.getDistance(Point2D.ORIGIN);
            if (correctionDistance > 0) {
                res.setDistance(correctionDistance);
                res.setAngle(antiOverlap.getAngle());
            }"""

if old in source:
    source = source.replace(old, new, 1)
elif new not in source:
    raise RuntimeError("Ground-unit anti-overlap motion assignment was not found")

if "res.setVelocity(getAntiOverlapVector().getScaled(traveledDistance))" in source:
    raise RuntimeError("3D anti-overlap motion assignment remains")
if "res.setDistance(correctionDistance)" not in source or "res.setAngle(antiOverlap.getAngle())" not in source:
    raise RuntimeError("2D ground-motion correction was not installed")

path.write_text(source)
print("Patched ground-unit anti-overlap correction to use planar motion.")
