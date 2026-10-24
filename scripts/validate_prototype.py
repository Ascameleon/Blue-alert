#!/usr/bin/env python3
"""Static integrity checks for the BLUE ALERTS web prototype."""
from html.parser import HTMLParser
from pathlib import Path
import subprocess
import tempfile

HTML = Path("BLUE_ALERTS.html")

class ScriptCollector(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.scripts = []
        self.current = None
        self.external_scripts = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "script":
            return
        attrs = dict(attrs)
        self.current = [] if not attrs.get("src") else None
        if attrs.get("src"):
            self.external_scripts.append(attrs["src"])

    def handle_data(self, data):
        if self.current is not None:
            self.current.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "script" and self.current is not None:
            code = "".join(self.current).strip()
            if code:
                self.scripts.append(code)
            self.current = None

def main():
    if not HTML.is_file():
        raise SystemExit("FAIL: BLUE_ALERTS.html is missing")
    source = HTML.read_text(encoding="utf-8")
    parser = ScriptCollector()
    parser.feed(source)
    parser.close()

    required = ("<html", "</html>", "<body", "</body>")
    missing = [token for token in required if token not in source.lower()]
    if missing:
        raise SystemExit("FAIL: missing HTML structure: " + ", ".join(missing))
    if not parser.scripts:
        raise SystemExit("FAIL: no inline JavaScript found to syntax-check")

    print(f"HTML structure OK; {len(parser.scripts)} inline script(s) found.")
    for index, code in enumerate(parser.scripts, start=1):
        with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as f:
            f.write(code)
            path = f.name
        try:
            result = subprocess.run(["node", "--check", path], text=True, capture_output=True)
            if result.returncode:
                print(result.stderr)
                raise SystemExit(f"FAIL: inline script #{index} has a JavaScript syntax error")
        finally:
            Path(path).unlink(missing_ok=True)
    print("PASS: all inline JavaScript parses successfully.")
    if parser.external_scripts:
        print("External scripts (runtime availability not tested):")
        for url in parser.external_scripts:
            print(f" - {url}")

if __name__ == "__main__":
    main()
