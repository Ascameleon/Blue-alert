# BLUE ALERTS — Cumulative Evolution Log

This log distinguishes runtime integration, static checks, browser rendering, CI simulation, native desktop interaction and physical Android validation.

## Cycle 5 — V94 industrial logistics environment

- Base: `1b0768b56bc61976391bc6fd930faa3a336e2e7c` on `main` (2026-11-02).
- Branch: `feat/blue-alerts-industrial-yard-runtime-20261102`.
- Runtime: integrated four authored, non-blocking environment clusters into the existing V94 Three.js scene:
  - Electrical substation with three transformers, insulators, switchgear and perimeter fence.
  - Loading gantry with braced legs, crossbeam, trolley, hoist and hazard markings.
  - Three ribbed fuel silos with ladders, warning plates and transfer pipe.
  - Cargo apron with 18 instanced, color-varied crates and 8 instanced hazard barrels.
- Performance choices: cached shared box/cylinder geometry; instancing for repeated cargo; desktop-only shadow casting; no external assets, downloads or paid services.
- Gameplay safety: all clusters and props are tagged `blocksMovement:false`; four clearance zones exclude the substation, gantry, silos and cargo apron from deterministic scrub, tree and rock placement. Placement and pathfinding systems remain unchanged.
- Regression coverage: desktop and 390x844 mobile browser assertions for runtime diagnostics, cluster count, instanced counts and non-blocking flag. A dedicated desktop camera focus captures the gantry as visual evidence.
- Static validator: source-contract checks for each cluster and instanced set; existing inline-script syntax validation remains active.

### Exact commits

- Runtime foundation: `ac97bb455f8331c8cfa467effa68163e67dc3883`.
- Runtime clearance and deterministic vegetation exclusions: `b791d07b4d2e9c32ea92f1441965273ede5a7f7e`.
- Runtime gantry detail and visible placement: `0ee7683c25db9579ad0f1d5b7212fd6764183e2e`.
- Browser assertions and visual capture: `365fb1c12983ba5a432de02c499a68ab65bfb886`.
- Browser clearance coverage: `f77c19465df495cfb2d4abdaae470768796e7b0c`.
- Browser camera-focus ordering fix: `e037a0563e945cb2c061babeb5052fc6519a627a` (attempted frame wait; still failed because focus/reset disturbed the next projection assertion).
- Browser final capture ordering: `0a2d7e54264714be9443bec14cc9f46d56a2de7d` (industrial screenshot moved after all camera-sensitive gameplay checks).
- Static validator: `c55c6a5b53aed560c9fa6698135d0d610efb6aa5`; clearance assertions: `6a2f6f9b109c01d3df9b5275f1e3a0afa2a8c81e`.
- This log is updated after the source and test commits.

### Evidence boundary
- Main baseline commit `1b0768b56bc61976391bc6fd930faa3a336e2e7c` passed desktop/mobile WebGL, standalone V94 build, OpenRTS build, 12/12 native scenario movement, and native left-click selection/right-click move and attack in workflow `41368243696`.
- Mission objectives PR #28 head `ff40bfc1500c1164fd31f0650431c758578e1e93` passed workflow `41370139368`, including desktop/mobile browser rendering, standalone HTML build, OpenRTS build and interactive native input. PR #28 remains separate and draft.
- First browser attempt on PR head `faecb959b5acc73c79ff1621d8ef779a6a2b003c` rendered and saved both the normal gameplay and gantry screenshots, then failed in the existing build-placement test because the camera had not advanced a frame after the visual-focus reset. The gantry screenshot was inspected; the failure was a test-camera synchronization issue, not a reported WebGL or runtime exception. The first correction added a frame wait but still failed. The robust correction moves the gantry screenshot to the end of the desktop sequence, after all construction/combat projection assertions, so the visual focus never mutates the camera before gameplay tests. A fresh exact-head CI run is required after this ordering change.
- CI mobile emulation is not a physical Samsung test. No physical Android device test is claimed.
- The OpenRTS screenshot is a separate native engine smoke test; it is not evidence that the V94 HTML scene and OpenRTS are one merged runtime.


## Cycle 5 — final verification

- Exact tested PR head: `5d0fd9ad3c17447f6c29094a01fd50446c1e3b14`.
- GitHub Actions workflow: [`41372113986`](https://github.com/Ascameleon/Blue-alert/actions/runs/41372113986) — **success**.
- Static V94 HTML validation, model-kit validation, scenario XML validation and standalone playable HTML build: passed.
- Playwright desktop and 390x844 mobile browser tests: passed. Coverage included WebGL startup, build-zone placement/rejection, combat projectile impacts, unit death/explosion lifecycle, building damage stages, mobile layout/touch targets, environment cluster diagnostics and mobile cleanup performance.
- OpenRTS build: passed.
- OpenRTS scenario smoke test: 12/12 units moved.
- Native input smoke test: real left-click selection, right-click movement and right-click attack each produced verified state changes.
- Visual artifact: `openrts-graphical-smoke-test` (artifact `13109696371`); inspected `v94-browser/desktop-v94-industrial-yard.png` and `v94-browser/mobile-v94-gameplay-390x844.png`.
- Standalone playable build: `blue-alerts-v94-build-zone-playable` (artifact `13109258207`); extracted and verified as `BLUE_ALERTS_V94_BUILD_ZONE_JOUABLE.html`.
- The mobile cleanup measurement was 33.8 FPS in the CI-emulated 390x844 browser scenario only. It is not a full-game sustained FPS claim and does not substitute for a physical Samsung test.
- The OpenRTS graphical/input smoke test remains a separate native engine test; it does not imply that the V94 HTML runtime has been ported into OpenRTS.
- PR #29 remains open and draft; no merge to `main` was performed.



## Cycle 6 — layered battlefield vegetation and instanced field rocks

- Base source: `main` at `1b0768b56bc61976391bc6fd930faa3a336e2e7c`.
- Continued in the existing environment-content branch: `feat/blue-alerts-industrial-yard-runtime-20261102`.
- Runtime commit: `b41bd15a1865d87978befb79f546d4d3355dbefa`.
- Browser regression commit: `6da8d6337f32a6dd4b71823333f99d04aefc3631`.
- Static contract commit: `0a41bc675dcdb406ebf00c4503de092e0ab72673`.

### Runtime change

The previous battlefield screenshot showed isolated single-cone trees and individually submitted rocks. Replaced that visual path with:
- A three-tier, eight-sided conifer silhouette with tier-specific vertex shading, deterministic rotation and per-instance color variation.
- Instanced trunk and foliage batches, preserving the existing deterministic placement stream and all existing build-zone/road/industrial exclusion checks.
- One instanced dodecahedron batch for weathered field rocks, retaining the original size/rotation distribution and deterministic placement.
- Exactly three environment render groups for trees and rocks (trunk, foliage, rocks), rather than one scene object per tree/rock.
- All props remain visual-only; `blocksMovement:false`; unit collision, pathfinding, building placement, resources and combat code were not modified.

### Changed files

- `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`
- `scripts/validate_v94_browser.mjs`
- `scripts/validate_v94.py`
- `docs/EVOLUTION_LOG.md`

### Regression coverage and evidence boundary

- Static validator now requires the layered-foliage builder, named instanced batches and vegetation diagnostics.
- Desktop browser acceptance requires at least 50 trees and 30 rocks; mobile acceptance requires at least 30 trees and 15 rocks. Both assert matching trunk/foliage instance counts, three foliage tiers, exactly three render groups and non-blocking placement.
- The previous exact-head industrial-yard workflow `41372567582` passed on its then-current branch head `d45cfa0b67c0fc46af64f9c42287004af09004ec`; that result does not validate these new commits.
- Exact-head static, standalone HTML, desktop/mobile WebGL, OpenRTS build and native input tests are pending for the new branch head. No pass is claimed until that run completes.
- The previous screenshots were inspected and establish the cone-tree baseline. New screenshots must be inspected after the exact-head workflow.
- CI mobile is browser emulation, not a physical Samsung test. OpenRTS remains a separate native engine test and does not import the V94 Three.js vegetation.
- No external assets, paid APIs, purchases or services were added; budget remains 0.


### Exact-head verification — 2026-11-02

- Tested branch head: `7056a1bd7ec408cab2a9e46de204a966467a8fb2`.
- GitHub Actions: [workflow 41385416290](https://github.com/Ascameleon/Blue-alert/actions/runs/41385416290) — **success** on that exact head.
- Static V94 validator, expanded model-kit validator, inline JavaScript syntax validation and standalone single-file V94 build: passed.
- Desktop WebGL browser result: 83 trees, 83 trunk instances, 83 foliage instances, three foliage tiers, 55 instanced rocks and three vegetation render groups. Existing scrub and road dressing: 236 scrub instances and 26 road markers. Four industrial clusters, 18 cargo crates and 8 barrels remained integrated and non-blocking.
- 390×844 mobile WebGL browser result: 45 trees, 45 trunk instances, 45 foliage instances, three foliage tiers, 35 instanced rocks and three vegetation render groups. Mobile canvas fit and existing touch-control checks passed.
- Full V94 desktop/mobile browser suite passed, including construction placement/rejection, combat impacts, projectile/explosion lifecycle, staged building damage, environment diagnostics and screenshot capture.
- OpenRTS build passed. Scenario report validated 12 units across both factions; native smoke log confirmed 12/12 units moved. Interactive native test passed real left-click selection, right-click movement and right-click attack with verified state changes.
- Inspected desktop gameplay, industrial-yard, mobile gameplay and OpenRTS interactive screenshots from artifact `13115138409`.
- Standalone V94 artifact `13115625268` was extracted and verified as a 200,752-byte single HTML file. The model module is embedded; Three.js 0.160.0 still loads from a CDN, so the renderer requires internet access.
- Evidence boundary: CI desktop/mobile are browser emulation, not a physical Samsung test. OpenRTS is a separate native engine smoke test and does not import the Three.js V94 vegetation.
- PR #29 remains open and draft against `main`; no merge was performed. Main remains at `1b0768b56bc61976391bc6fd930faa3a336e2e7c`.


## Cycle — deterministic terrain albedo and micro-relief pass (2026-11-02)

- Source branch: \`feat/blue-alerts-industrial-yard-runtime-20261102\`, based on the existing V94 industrial-yard work; base \`main\` remains \`a4df919e04665f2159a99113bece2c9cf6e96ec6\`.
- Before this change, the exact-head PR #29 workflow \`41386295965\` succeeded on \`a4df919e04665f2159a99113bece2c9cf6e96ec6\`. I inspected its decoded job log and the actual desktop gameplay, industrial-yard and 390×844 mobile screenshots. The road, industrial gantry and instanced vegetation rendered, but the ground still read as a largely uniform flat green plane at normal gameplay zoom.
- The existing deterministic vertex-color field and road/vegetation/industrial dressing are retained.
- Added deterministic procedural surface textures generated locally from the existing seeded terrain noise:
  - 512×512 albedo and grayscale bump maps on desktop.
  - 256×256 maps and reduced bump strength on mobile.
  - Warm soil flecks, exposed-stone mottling and multi-frequency grain modulate the existing vertex-color field.
  - The bump map adds subtle surface micro-relief without displacing the ground mesh or changing unit/building elevations, pathfinding, collision, construction pads or resource placement.
  - Mipmaps and capped anisotropy keep texture sampling bounded; no downloaded textures or external services.
- Added read-only terrain material diagnostics and a QA camera focus for dedicated desktop/mobile terrain screenshots.
- Changed files:
  - \`BLUE_ALERTS_v94_ASSET_INTEGRATION.html\`
  - \`scripts/validate_v94.py\`
  - \`scripts/validate_v94_browser.mjs\`
  - \`docs/EVOLUTION_LOG.md\`
- Regression coverage now requires the correct desktop/mobile texture resolutions, albedo/bump maps, positive deterministic checksum, and dedicated terrain-detail captures.
- Exact-head CI for the new commit is pending. No browser, standalone build, OpenRTS/native or screenshot result is claimed for this revision until its own workflow completes.
- Physical Samsung testing is not performed. Mobile validation remains 390×844 browser emulation; OpenRTS remains a separate native-engine smoke test and does not consume the V94 Three.js terrain.
- Budget remains 0: no paid APIs, assets, purchases or services.


### Static-validator correction — terrain diagnostic keys

- Exact-head workflow \`41387540776\` failed at \`Validate BLUE ALERTS v94 3D prototype\`, before the standalone build, browser, OpenRTS or native interaction stages.
- The terrain implementation exposed the diagnostic keys \`textureResolution\` and \`textureChecksum\`; the new static validator mistakenly searched for longer names that were not the actual object properties.
- Corrected the static contract to match the implemented diagnostic keys. No runtime code or test was weakened.
- Failed run retained: \`41387540776\` on \`ec9a6149b993c07b16b0e6ba79edc31ef6acda76\`. It provides no browser/native evidence.
- Validator correction commit is recorded by the following commit; a fresh exact-head workflow must pass before the terrain surface pass is considered verified.


### Performance correction — remove the extra bump-map shader sample

- Exact-head workflow \`41387802169\` passed the V94 static validator, model-kit validator, standalone HTML build and desktop/mobile model-preview checks, then failed the playable V94 browser suite during desktop transient-effect cleanup.
- The failure log showed a projectile impact and unit-death effect were created correctly, but the explosion cleanup wait timed out with one model explosion still at approximately \`0.015s\` remaining. The frame loop advanced unusually slowly in the software-rendered CI browser.
- The new terrain pass had introduced both an albedo map and a bump map. To avoid shipping a possible shader-cost regression, removed the second bump-map texture sample and retained the deterministic albedo/grain texture only. This keeps the visible multi-scale soil/stone flecks while avoiding extra bump-map shader work.
- The gameplay cleanup assertion and FPS threshold were not relaxed. Desktop remains 512×512; mobile remains 256×256 with anisotropy capped at 2.
- Failure retained: workflow \`41387802169\` on exact head \`ae891cbe08ccb9d8da18c39521f221bb29d5760e\`. It did not reach OpenRTS build or native interaction tests.
- The albedo-only performance correction and a fresh exact-head workflow are required before this terrain pass can be accepted.
