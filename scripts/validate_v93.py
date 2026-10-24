#!/usr/bin/env python3
"""Static checks for the user's BLUE ALERTS v93 HTML file.

Run with:
  python3 scripts/validate_v93.py [path-to-html]
This is a syntax/integrity check, not a browser gameplay test.
"""
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import sys
import tempfile

DEFAULT = Path("BLUE_ALERTS_v93_COLLISION_FRAME_FIX.html")

class Scripts(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.inline = []
        self.external = []
        self._current = None

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "script":
            return
        attrs = dict(attrs)
        src = attrs.get("src")
        if src:
            self.external.append(src)
            self._current = None
        else:
            self._current = []

    def handle_data(self, data):
        if self._current is not None:
            self._current.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "script" and self._current is not None:
            code = "".join(self._current).strip()
            if code:
                self.inline.append(code)
            self._current = None

def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT
    if not path.is_file():
        raise SystemExit(
            f"FAIL: {path} not found. Add the exact v93 file to the repository "
            "before running this validator in CI."
        )
    source = path.read_text(encoding="utf-8")
    lower = source.lower()
    for token in ("<!doctype html", "<html", "</html>", "<body", "</body>"):
        if token not in lower:
            raise SystemExit(f"FAIL: required HTML token missing: {token}")
    parser = Scripts()
    parser.feed(source)
    parser.close()
    if "three.min.js" not in source and "three.module.js" not in source:
        raise SystemExit("FAIL: expected a Three.js runtime reference was not found")
    if not parser.inline:
        raise SystemExit("FAIL: no inline JavaScript blocks found")
    for i, code in enumerate(parser.inline, 1):
        with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as f:
            f.write(code)
            temp = Path(f.name)
        try:
            result = subprocess.run(["node", "--check", str(temp)], text=True, capture_output=True)
            if result.returncode:
                print(result.stderr, file=sys.stderr)
                raise SystemExit(f"FAIL: inline script #{i} has a syntax error")
        finally:
            temp.unlink(missing_ok=True)
    required_features = ("requestAnimationFrame", "function walkTo", "function animate", "WebGLRenderer")
    missing = [feature for feature in required_features if feature not in source]
    if missing:
        raise SystemExit("FAIL: expected RTS/3D features missing: " + ", ".join(missing))
    print(f"PASS: {path}: HTML structure, Three.js reference and {len(parser.inline)} inline JS blocks.")
    print("NOTE: browser startup, WebGL rendering, collision behavior and gameplay are not tested here.")
    if parser.external:
        print("External script dependencies:")
        for url in parser.external:
            print(f" - {url}")

if __name__ == "__main__":
    main()
