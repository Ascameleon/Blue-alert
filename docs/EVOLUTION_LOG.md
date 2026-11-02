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

## Cycle 3 — industrial logistics environment integrated into the playable V94 source

- Source: `BLUE_ALERTS_v94_ASSET_INTEGRATION.html` (the actual V94 source consumed by the single-file build), not the older V1 prototype.
- Added one runtime scene group with four authored clusters: electrical substation, loading gantry, fuel silos and cargo stacks.
- Added 12 instanced cargo crates and 8 instanced hazard barrels to bound repeated-object draw calls.
- Set dressing is explicitly non-blocking and positioned on the outer map perimeter to preserve the central road and construction zones.
- Added browser acceptance checks for runtime scene presence, four clusters and exact instanced batch counts.
- Added static source-contract checks for the environment builder, instancing and non-blocking contract.
- Commits: `115d7f811cea54ab4b41c6c79f6385db0be3998b` (V94 scene), `a0554eadcb60c2ca0ee83054e06fa55631884ae5` (browser checks), `34013cc636fa196e59230d31746d7003ae6c2b19` (static checks).
- Validation boundary: source files were read back from GitHub and the PR head is `34013cc636fa196e59230d31746d7003ae6c2b19`. No workflow run for this exact head was available at inspection time. The earlier green run `41366840683` targeted commit `74085e775daefbbf8fa675dff765da0195b85950`, so it does not validate this cycle. Browser rendering, screenshots, mobile frame time and physical Android remain unverified.
- Next priority: obtain a CI run against the current PR head, inspect the generated desktop/mobile screenshots, then address the largest remaining visual gap with license-verified, editable faction MBT assets integrated into the live unit runtime and reversible procedural fallbacks.
