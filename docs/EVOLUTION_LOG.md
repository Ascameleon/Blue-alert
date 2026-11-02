# BLUE ALERTS — Cumulative Evolution Log

This log records verified source changes only. A design specification, static check, simulation, browser test, physical-device test and production release are distinct evidence levels.

## Checkpoint 2026-11-02 — PR #26, visual/content foundation

- Base source checkpoint: `d135c36dcd2fc12f161f02060cd4dcb89905e32a`.
- Feature branch: `evolution/visual-content-foundation`.
- PR: https://github.com/Ascameleon/Blue-alert/pull/26 (draft; not merged).
- Preserved work: industrial-near-future visual direction, asset quality gates, faction identities, structured visual profile, three-lane industrial map layout, and six-mission First Contact campaign data.
- Campaign data: 6 ordered missions and 18 objective records. It is authored data and is not yet wired to runtime mission state.
- Map layout: three lanes and nine landmarks in `game-data/maps/industrial-logistics-basin.map.json`; explicitly marked as a layout specification, not runtime-integrated geometry.

## Cycle 2 — verified CI weakness and performance repair

### Baseline evidence

Workflow run `41366022672` on the PR merge commit failed in the desktop Playwright browser test at the VFX cleanup gate. The logged state had no active projectiles or muzzle flashes but one explosion still alive with `0.0819` seconds remaining after the 8-second wall-clock wait. Only 38 animation frames had advanced during that wait. The model preview, mobile layout checks, static checks, and standalone build steps preceding the failure passed. The remaining graphical/native steps were skipped after the failure.

### Implemented changes

- `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`: cache explosion and muzzle-flash mesh/material references once when each effect is spawned. The render loop now updates cached parts rather than traversing the full Object3D tree, allocating material arrays, cloning vectors and normalizing spark directions on every frame.
- `scripts/validate_v94.py`: assert that the hot loop uses cached effect parts and validate First Contact campaign structure, mission ordering, required narrative fields, and globally unique objective IDs (6 missions / 18 objectives).
- `scripts/validate_v94_browser.mjs`: measure desktop cleanup frame rate and require at least 5.5 FPS while the explosion completes. Existing mobile performance acceptance remains unchanged.
- `docs/EVOLUTION_LOG.md`: retain the source checkpoint, failure evidence, changes, blockers and next priority.

### Evidence boundary

- Baseline failure and exact diagnostics: GitHub Actions run `41366022672`.
- The first post-change run `41366739099` was cancelled while the branch was being updated.
- Fresh run `41366840683` is currently executing at the desktop/mobile playable-browser validation step. No post-change browser pass is claimed yet.
- No physical Samsung/Android device test has been performed in this cycle.
- No new external or paid assets/services were used.

## Visual evidence review

Inspected actual baseline artifacts from run `41366022672` (artifact `openrts-graphical-smoke-test`): `desktop-v94-gameplay.png`, `desktop-v94-explosion-vfx.png`, and the 390x844 model-preview capture. The gameplay still shows a broad flat green field, a simple road/grid, low-detail geometric vehicles and sparse structures; the explosion reads as a small stylized ring/core effect. This confirms that the visual-quality gap remains substantial. The visual-direction and map files are specifications, not runtime environment integration.

## Remaining blockers

1. Obtain a green post-change CI run including desktop and mobile Playwright checks, standalone build, OpenRTS build and native interaction smoke test.
2. Inspect post-change screenshots and runtime logs, not just the job conclusion.
3. Validate on a physical Android/Samsung device.
4. Wire the six campaign missions to actual game state before presenting them as playable.
5. Integrate benchmark Blue/Red MBT assets, LODs, collision and animation into the existing runtime; the current asset kit remains procedural geometry, not a completed premium asset pipeline.

## Next highest-impact product cycle

After the current CI run is green, prioritize one license-verified, editable, detailed MBT asset pair (Blue Directorate and Red Front) with correct scale/origin, three LODs, collision proxy, rotating turret and firing animation, integrated into the live V94 game. Keep current procedural models as reversible fallbacks. Then replace one visible battlefield sector with the industrial logistics-yard layout and test camera-distance readability and mobile frame time. Do not present a standalone model preview or layout document as a playable improvement.
