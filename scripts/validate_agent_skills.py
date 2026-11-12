#!/usr/bin/env python3
"""Validate the curated Agent Skills installed in this repository."""
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / ".agents" / "skills"
errors = []

def fail(message):
    errors.append(message)

router = SKILLS / "router" / "SKILL.md"
if not router.is_file():
    fail("missing .agents/skills/router/SKILL.md")

skill_files = sorted(SKILLS.glob("skills/**/SKILL.md"))
if not skill_files:
    fail("no installed discipline/engine/genre SKILL.md files found")

names = set()
for path in skill_files + ([router] if router.is_file() else []):
    content = path.read_text(encoding="utf-8")
    if not content.startswith("---\n"):
        fail(f"{path.relative_to(ROOT)}: missing YAML front matter")
        continue
    front = content.split("---\n", 2)
    if len(front) < 3:
        fail(f"{path.relative_to(ROOT)}: unterminated YAML front matter")
        continue
    header = front[1]
    name = re.search(r"(?m)^name:\s*([^\n#]+)", header)
    description = re.search(r"(?m)^description:\s*(?:>|\S)", header)
    if not name:
        fail(f"{path.relative_to(ROOT)}: missing name")
    else:
        value = name.group(1).strip().strip("'\"")
        if value in names:
            fail(f"{path.relative_to(ROOT)}: duplicate skill name {value}")
        names.add(value)
    if not description:
        fail(f"{path.relative_to(ROOT)}: missing description")

for relative in ("AGENTS.md", ".agents/skills/README.md", ".agents/skills/THIRD_PARTY_LICENSE"):
    if not (ROOT / relative).is_file():
        fail(f"missing {relative}")

if errors:
    print("\n".join(f"FAIL: {item}" for item in errors), file=sys.stderr)
    raise SystemExit(1)

print(f"PASS: router + {len(skill_files)} curated skills; front matter and attribution files present")
