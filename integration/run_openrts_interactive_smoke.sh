#!/usr/bin/env bash
set -euo pipefail

ROOT="${GITHUB_WORKSPACE:-$(pwd)}"
LOG="$ROOT/artifacts/openrts-interactive-launch.log"
SCREEN="$ROOT/artifacts/openrts-interactive-screen.png"
mkdir -p "$ROOT/artifacts"
export ALSOFT_DRIVERS=null

cd "$ROOT/engine/OpenRTS"
./gradlew --offline --no-daemon \
  -I "$ROOT/integration/openrts-run-bluealerts-interactive.gradle" \
  :core:run >"$LOG" 2>&1 &
app_pid=$!

cleanup() {
  kill "$app_pid" 2>/dev/null || true
  pkill -P "$app_pid" 2>/dev/null || true
  wait "$app_pid" 2>/dev/null || true
}
trap cleanup EXIT

wait_for_marker() {
  local marker="$1"
  local timeout="$2"
  for _ in $(seq 1 "$timeout"); do
    if grep -Fq "$marker" "$LOG"; then
      return 0
    fi
    if grep -Fq "BLUE ALERTS INTERACTIVE FAILURE:" "$LOG"; then
      cat "$LOG"
      return 1
    fi
    if ! kill -0 "$app_pid" 2>/dev/null; then
      cat "$LOG"
      return 1
    fi
    sleep 1
  done
  echo "Timed out waiting for marker: $marker"
  cat "$LOG"
  return 1
}

wait_for_marker "BLUE ALERTS INTERACTIVE READY" 60

window_id=""
for _ in $(seq 1 20); do
  window_id="$(xdotool search --onlyvisible --name "BLUE ALERTS Interactive Smoke" 2>/dev/null | head -n1 || true)"
  if [ -n "$window_id" ]; then
    break
  fi
  sleep 1
done
if [ -z "$window_id" ]; then
  echo "Could not locate the BLUE ALERTS interactive test window."
  cat "$LOG"
  exit 1
fi

geometry="$(xwininfo -id "$window_id")"
window_x="$(awk '/Absolute upper-left X:/ {print $4}' <<<"$geometry")"
window_y="$(awk '/Absolute upper-left Y:/ {print $4}' <<<"$geometry")"
if [ -z "$window_x" ] || [ -z "$window_y" ]; then
  echo "Could not resolve the game window origin."
  cat "$geometry"
  exit 1
fi
echo "Interactive test window: id=$window_id origin=$window_x,$window_y"

ready_line="$(grep -F "BLUE ALERTS INTERACTIVE READY" "$LOG" | tail -n1)"
target_pair="$(sed -E 's/.*target=([0-9]+,[0-9]+).*/\1/' <<<"$ready_line")"
move_pair="$(sed -E 's/.*destination=([0-9]+,[0-9]+).*/\1/' <<<"$ready_line")"
if [[ ! "$target_pair" =~ ^[0-9]+,[0-9]+$ || ! "$move_pair" =~ ^[0-9]+,[0-9]+$ ]]; then
  echo "Invalid projected target or destination coordinates: $ready_line"
  cat "$LOG"
  exit 1
fi
IFS=, read -r target_x target_y <<<"$target_pair"
IFS=, read -r move_x move_y <<<"$move_pair"

# Use xdotool's window-relative coordinates so the X11 frame/titlebar
# cannot shift the camera-local positions. Log the root pointer position
# after each move to make coordinate failures diagnosable.
xdotool mousemove --sync --window "$window_id" "$target_x" "$target_y"
echo "Pointer after selection move: $(xdotool getmouselocation --shell)"
xdotool click 1
wait_for_marker "BLUE ALERTS INTERACTIVE SELECTED" 10

xdotool mousemove --sync --window "$window_id" "$move_x" "$move_y"
echo "Pointer after ground move: $(xdotool getmouselocation --shell)"
xdotool click 3
wait_for_marker "BLUE ALERTS INTERACTIVE MOVE_CLICK_RECEIVED" 8
wait_for_marker "BLUE ALERTS INTERACTIVE MOVED" 28
wait_for_marker "BLUE ALERTS INTERACTIVE ATTACK_READY" 5

enemy_line="$(grep -F "BLUE ALERTS INTERACTIVE ENEMY_SCREEN" "$LOG" | tail -n1)"
enemy_pair="$(sed -E 's/.*ENEMY_SCREEN ([0-9]+,[0-9]+).*/\1/' <<<"$enemy_line")"
if [[ ! "$enemy_pair" =~ ^[0-9]+,[0-9]+$ ]]; then
  echo "Invalid projected enemy coordinate: $enemy_line"
  cat "$LOG"
  exit 1
fi
IFS=, read -r enemy_x enemy_y <<<"$enemy_pair"
xdotool mousemove --sync --window "$window_id" "$enemy_x" "$enemy_y"
echo "Pointer before attack click: $(xdotool getmouselocation --shell)"
xdotool click 3
wait_for_marker "BLUE ALERTS INTERACTIVE ATTACK_CLICK_RECEIVED" 8
wait_for_marker "BLUE ALERTS INTERACTIVE PASS selection+move+attack" 35

sleep 2
import -window root "$SCREEN"
test -s "$SCREEN"
test "$(stat -c%s "$SCREEN")" -gt 10000
if grep -Eq "SEVERE: Uncaught exception|Uncaught exception thrown in Thread|Exception: java.lang" "$LOG"; then
  echo "BLUE ALERTS interactive runtime exception detected."
  cat "$LOG"
  exit 1
fi

echo "BLUE ALERTS interactive input smoke passed: real left-click selection, right-click movement, and right-click attack caused verified state changes."
