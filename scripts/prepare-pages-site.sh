#!/usr/bin/env bash
set -euo pipefail

output_dir="${1:-site}"
mkdir -p "$output_dir/game-data/models" "$output_dir/public/vendor"

cp BLUE_ALERTS_v94_ASSET_INTEGRATION.html "$output_dir/index.html"
cp game-data/models/blue-alert-models.js "$output_dir/game-data/models/blue-alert-models.js"
cp public/vendor/three.min.js "$output_dir/public/vendor/three.min.js"
cp public/vendor/THREE-LICENSE.txt "$output_dir/public/vendor/THREE-LICENSE.txt"

test -s "$output_dir/index.html"
test -s "$output_dir/game-data/models/blue-alert-models.js"
test -s "$output_dir/public/vendor/three.min.js"
test -s "$output_dir/public/vendor/THREE-LICENSE.txt"
grep -Fq 'public/vendor/three.min.js' "$output_dir/index.html"
grep -Fq "import('./game-data/models/blue-alert-models.js" "$output_dir/index.html"
grep -qi 'MIT' "$output_dir/public/vendor/THREE-LICENSE.txt"
