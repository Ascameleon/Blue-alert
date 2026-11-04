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

## Cycle — faction-specific BLUE SENTINEL and RED BASTION tanks (2026-11-02)

- Reconciled the existing tank-model branch with the verified industrial-yard mainline at `241bc45c1e76af6a4ad5b94dd9554469071a7e11`; no existing project files or branch history were discarded.
- The existing V94 `createTank(THREE, { team, variant, scale })` constructor now gives BLUE SENTINEL and RED BASTION distinct turret profiles and layered, chamfered hull armor.
- Added sloped glacis, engine grilles, fenders, return rollers, wheel hubs, 36 instanced tread shoes, 60 instanced wheel fasteners and faction-specific turret details.
- Repeated chassis parts are batched with InstancedMesh; the browser acceptance suite enforces the 60-draw-call ceiling and geometry budget on desktop and mobile.
- Model documentation and static/browser regression checks accompany the runtime change.
- Prior isolated exact-head workflow `41379372338` passed on the original PR head. This reconciliation creates a new exact head; the combined industrial-yard + tank suite must pass before merge.
- No paid assets, APIs or services. Physical Samsung testing is not claimed; mobile remains 390×844 browser emulation.


## Cycle — Mission 01 objective runtime and mobile HUD port to current main (2026-11-02)

- Ported the exercised Mission 01 runtime and mobile notification-clearance work from the earlier stacked branch onto current main base 05635dd14eb9d40df44df509946ae42e83058060, preserving the faction-specific tank silhouettes, industrial yard, layered vegetation and procedural terrain.
- Runtime objectives: deliver 600 minerals at a friendly refinery/HQ, produce three combat units, then destroy the enemy citadel. The citadel remains at 1 HP until both prerequisites are complete; starting credits, field ore and initial forces do not count.
- Desktop and mobile HUDs expose objective state and progress. The mobile mission notification is positioned below the command row and objective card.
- Added current-main browser acceptance for initial state, premature citadel attack, mineral delivery, production, final victory, mobile objective visibility, and notification non-overlap. Dedicated screenshots are required for mission completion, toast clearance and mobile progress.
- Source-branch workflow #215 passed browser, standalone V94, OpenRTS build, 12/12 unit movement and native selection/movement/attack checks. This current-main port is a new revision and has no validation result yet.
- No physical Samsung test is claimed. Mobile remains 390×844 browser emulation; budget remains 0.


## Cycle — faction infantry and movement-linked gait ported onto mission-enabled V94 (2026-11-02)

- Ported the current-main BLUE SENTINEL and RED BASTION rifleman models onto the mission-enabled V94 line, retaining the playable Mission 01 runtime and mobile objective HUD.
- Added layered faction armor, helmet profiles, tactical carrier, pouches, radio/backpack, canteen, articulated limbs and detailed assault rifle using original procedural Three.js geometry.
- Wired deterministic arm/leg gait to measured unit displacement while preserving the outer V94 unit transform and combat contracts.
- Added desktop and 390×844 mobile browser acceptance for live infantry displacement and opposing limb motion, plus dedicated gait screenshots.
- Source infantry exact-head workflow 41394159026 passed model preview, V94 desktop/mobile, standalone HTML, OpenRTS build, 12/12 unit movement and native selection/movement/attack. This combined mission+infantry port requires its own exact-head workflow.
- Mobile evidence is browser emulation, not a physical Samsung test. OpenRTS remains a separate engine and does not import Three.js infantry meshes. No paid assets or services; budget 0 €.

## Cycle — stabilize live V94 browser acceptance under concurrent RTS simulation (2026-11-02)

- Base: current `main` at `0f2ee955a0731cf3028940ccc8aa732eb4974adb`; combined mission + infantry branch `feat/blue-alerts-infantry-mission-main-20261102`.
- Inspected exact-head workflow `41395344818` on `dfcbef06db24cb20830f8c88082b076fbd31102a`. The desktop mission reached 100% (600 delivered minerals, 3 newly produced combat units, enemy citadel destroyed). Model previews, standalone V94 build, static checks and desktop gameplay checks completed before the browser suite stopped in mobile construction-price verification.
- Decoded job log showed the assertion compared mobile placement credits against a snapshot taken 2.8 seconds earlier. Autonomous combat can award kill credits during that wait, so the test incorrectly treated a reward as a construction-price regression. No runtime placement defect was observed.
- Inspected the captured desktop gameplay, infantry-gait and 390×844 mobile mission-progress screenshots. The mobile mission card is visible below the command controls and the progress state reads 2/3 without overlap.
- Also inspected main workflow `41395082088`: its mobile projectile assertion assumed exactly one projectile globally, but live AI combat had legitimately produced a second projectile (`2 !== 1`). This was another test assumption about a concurrent simulation, not evidence of a missing player projectile.
- Updated `scripts/validate_v94_browser.mjs` on the existing PR #36 branch:
  - Capture the mobile construction credit/building baseline immediately before the touch action.
  - Read the placement result immediately after the synchronous pointer action; assert exactly one new building and the configured 350-credit deduction without a multi-second reward window.
  - Measure projectile and muzzle-flash increments around the QA fire call in one synchronous browser evaluation, instead of assuming the whole live battlefield contains exactly one effect.
- No gameplay runtime behavior, game balance, or acceptance threshold was weakened. The test now measures the action under test rather than unrelated AI events.
- Test correction commit: `035a6aa51449b760a41e5258107ba38cf53e398a`.
- Exact-head CI must complete on the resulting branch head before PR #36 can be merged. The previous failed run did not reach OpenRTS build/native interaction; no pass is inferred from earlier isolated infantry or mission branches.
- Mobile browser validation remains 390×844 emulation, not a physical Samsung test. OpenRTS is a separate native engine and does not import the V94 Three.js infantry meshes. Budget remains 0 €.

### Exact-head verification and merge — faction infantry + Mission 01 (2026-11-02)

- The combined current-main branch head `2ad69d67e15e76dee1ae48b116b5e169f63a4f9c` passed GitHub Actions workflow [`41399091079`](https://github.com/Ascameleon/Blue-alert/actions/runs/41399091079) with conclusion `success`.
- The tested tree includes the Mission 01 runtime/HUD already on main plus:
  - BLUE SENTINEL and RED BASTION procedural riflemen with distinct helmet/armor profiles, carrier pouches, backpack/radio, canteen, gloves, boots and assault rifle.
  - Independent arm/leg pivots and a deterministic gait driven by actual V94 unit displacement; idle breathing is retained.
  - Regression coverage for desktop and 390×844 mobile model previews, V94 live gait, mission progression, mobile HUD/toast clearance, touch construction, projectile/muzzle-flash deltas, impacts, explosion cleanup and building damage.
- The exact-head browser-test correction removed two false assumptions exposed by live RTS concurrency: the mobile purchase assertion now snapshots credits immediately before synchronous placement, and projectile/muzzle-flash checks measure the QA shot's own increment instead of requiring the entire battlefield to contain exactly one effect.
- Workflow results on the exact tested head:
  - Static V94/model validators, inline JavaScript syntax and standalone HTML build: passed.
  - Desktop and 390×844 mobile browser/WebGL suite: passed.
  - Mission 01 acceptance reached 100%: 600 delivered minerals, 3 produced combat units, enemy citadel destroyed.
  - Infantry preview metrics: 53 meshes, 1,732 triangles, 55 draw calls for the previewed rifleman; this remains a procedural low-poly model, not an AAA asset.
  - OpenRTS Java build: passed. Separate native OpenRTS scenario: 12/12 units moved (6/6 per faction); native mouse selection, movement and attack smoke test: passed.
- Exact-head evidence artifacts: graphical/browser artifact `13120223023`; standalone playable build artifact `13120603352`. Extracted playable file: `BLUE_ALERTS_V94_BUILD_ZONE_JOUABLE.html`, 229,222 bytes, SHA-256 `c76164c988be28e5e47633e1bb65a4a26aefe86b42c2eea939c3fede83474928`.
- Inspected desktop gameplay, desktop infantry gait, mobile gameplay, mobile infantry gait, mobile mission-progress/toast-clearance, mission-complete and native OpenRTS interaction screenshots. The OpenRTS screenshots are a separate engine smoke test; the Three.js infantry meshes are not imported into OpenRTS.
- PR #36 was merged without squash to preserve branch/commit lineage: [merge commit `dfccd5abbc83744e49bbd6607a1dafeda64f2e52`](https://github.com/Ascameleon/Blue-alert/commit/dfccd5abbc83744e49bbd6607a1dafeda64f2e52). Main deployment workflow `41399739606` succeeded on that commit.
- Post-merge OpenRTS/browser validation workflow `41399739647` was still running at the time of this log entry; no conclusion is inferred from its in-progress state.
- Mobile cleanup benchmark was 23.9 FPS in the 390×844 CI browser-emulation cleanup scenario only. This is not sustained gameplay FPS and is not a physical Samsung measurement.
- Three.js remains CDN-loaded; the standalone HTML embeds the model kit but still needs internet access for the renderer. No paid assets, APIs, purchases or services; budget remains 0 €.
- Next performance target: reduce the infantry model's 55 draw calls without losing faction silhouette or gait. Then reconcile the existing terrain-surface PR with the newly updated mainline before integration.

## Cycle — clear attached turret flashes immediately when a unit dies (2026-11-02)

- Audited post-merge main workflow `41399739647` on merge commit `dfccd5abbc83744e49bbd6607a1dafeda64f2e52`. Desktop mission acceptance reached 100%, desktop VFX/building-damage checks passed, and mobile projectile impact/unit-death/explosion checks passed, but mobile VFX cleanup timed out after 15 seconds.
- Exact timeout state: `activeProjectiles=0`, `modelProjectiles=0`, `modelExplosions=0`, `impactRings=0`, `impactSparks=0`, but `modelMuzzleFlashes=1`. This was not the earlier credit/test-race issue.
- Root cause: tank turret muzzle flashes are attached to the unit rig and their opacity is normally reset by the per-frame `flashT` countdown. `killUnit()` marks a unit dead and removes it from the scene; the unit-update loop then skips dead units before decrementing `flashT`. A flash active at death can therefore remain visible and keep the VFX cleanup counter non-zero indefinitely.
- Runtime fix in `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`: `killUnit()` now sets `u.flashT=0` and synchronously calls `setMuzzleFlashIntensity(u.g.userData.flash, 0)` before removing the rig.
- Regression coverage in `scripts/validate_v94_browser.mjs`: desktop and mobile QA now deliberately activate the target tank's attached flash before destroying it, then assert the flash was active, is hidden immediately after death, and its timer is zero. The existing 15-second global VFX cleanup assertion remains unchanged.
- Static coverage in `scripts/validate_v94.py`: verifies the kill path contains the immediate flash reset.
- Commits on `fix/v94-dead-unit-muzzle-flash-cleanup-20261102`: runtime `cf37a496837c5b70a438d5455066f434bb737161`; browser regression `2489064ea78869f061b242a5f8132888fe1392fc`; static validator `14d13a9a61dcce839286e99893fee154411e1cfa`.
- Exact-head CI is required before merge. No test pass is claimed for these new commits until the workflow completes.
- Also inspected existing draft PR #37 (`feat/blue-alerts-infantry-hero-render-20261102`). Its latest preview workflow `41400154451` fails the enforced 60-draw-call mobile ceiling: the hero infantry model reports 90 draw calls, 88 meshes and 5,140 triangles. The prior run `41400032419` stopped earlier because the static validator still expected model cache key v5. The latest artifact contains no hero-infantry render because the preview assertion exits before screenshots. PR #37 was not modified in this cycle; it needs geometry batching/instancing before it can be considered for merge.
- Mobile browser checks remain CI emulation only; no physical Samsung test is claimed. OpenRTS remains a separate native engine. Budget remains 0 €.

### Verification and integration — dead-unit turret muzzle-flash lifecycle (2026-11-02)

- The exact PR #38 head `c140d3e3a8d804d22328237a9db01a915c6e7e8a` passed workflow [`41400732657`](https://github.com/Ascameleon/Blue-alert/actions/runs/41400732657) with conclusion `success`.
- Targeted regression proved both desktop and mobile can deliberately set a red tank's attached turret flash visible, destroy the tank, and immediately observe `flashHidden=true` and `flashTimer=0`. The returned VFX state no longer counts the dead unit's attached flash.
- The previously failing mobile cleanup now completed in 1,733 ms (39 frames, 1.807 simulated seconds; 22.5 FPS in the 390×844 CI browser-emulation cleanup scenario). After cleanup: active projectiles 0, model projectiles 0, muzzle flashes 0, explosions 0, impact rings 0, impact sparks 0.
- Static prototype/V94/model-kit validators and JavaScript syntax checks: passed. Standalone HTML build: passed. Desktop and 390×844 mobile WebGL/gameplay, mission, projectile impact, explosion lifecycle, building damage, infantry gait and touch placement tests: passed.
- Mission 01 reached 100% (600 delivered minerals, 3 produced combat units, enemy citadel destroyed). OpenRTS Java build passed; separate native scenario moved 12/12 units, and native selection/movement/attack smoke tests passed.
- Evidence artifacts: graphical/browser/native `13121810503`; standalone HTML `13121770471`. Extracted build: `BLUE_ALERTS_V94_BUILD_ZONE_JOUABLE.html`, 229,795 bytes, SHA-256 `c18333861dfec02eefe334ff4fee30f5f2e31d13ec514a5e1894bd4d3e974726`. Desktop and mobile explosion, gameplay, mission, terrain and infantry-gait screenshots were inspected.
- PR #38 was merged with full commit history preserved: [`b6c35a9d428c67105b81bc614987535adaa8d2b4`](https://github.com/Ascameleon/Blue-alert/commit/b6c35a9d428c67105b81bc614987535adaa8d2b4).
- Post-merge main workflows `41401367522` (OpenRTS/browser validation) and `41401367526` (web deployment) were in progress at the time of this log entry; no conclusion is inferred until they finish.
- No physical Samsung test is claimed. The Three.js renderer remains CDN-loaded; internet access is required. No paid assets, APIs, services or purchases; budget 0 €.


## Cycle — deterministic death-explosion acceptance (2026-11-02)

- Latest main observed: `a58a561a2277bcefa5045a4d954fc74dc0e734ac`; mainline OpenRTS workflow `41401367522` passed, including Java build, graphical launch, 12/12 native unit movement and real selection/move/attack input.
- PR #38's dead-unit muzzle-flash fix was merged as `b6c35a9d428c67105b81bc614987535adaa8d2b4`; its exact-head workflow `41400732657` passed desktop/mobile V94, standalone build and OpenRTS/native checks.
- PR #37 exact-head workflow `41401898591` failed at the mobile unit-death assertion. The log showed the target was dead/removed, kill reward was awarded, flash was hidden and timer was zero, but the global model-explosion count was 2 with lives `[0.7112, 1.8]`. An unrelated live combat explosion made the old `=== 1` assertion incorrect; no product death-effect failure was observed.
- Added read-only world-position diagnostics for model explosions. The QA helper now tracks the newly spawned explosion by object identity and reports its position and initial lifetime.
- Desktop/mobile acceptance now captures the immediate pre-death count, requires exactly one additional explosion from the death call, and verifies that specific explosion advances at the destroyed unit's coordinates. Concurrent combat effects no longer invalidate the death-specific assertion.
- Static validation now requires the target-specific QA diagnostics and both desktop/mobile acceptance paths.
- This is a correction on the existing dedicated hero-infantry branch. Fresh exact-head browser, WebGL, standalone build, OpenRTS and native checks are still required; no pass or merge is claimed yet.


## Cycle — infantry surface finish and proportion pass (2026-11-02)

- Latest main/PR merge base: \`a58a561a2277bcefa5045a4d954fc74dc0e734ac\`. Existing PR #37 was continued in place; no restart, fork or new release branch.
- Exact tested branch head: \`1b395f4a9d2e7f53b9d642e74767bfbcb702786f\`.
- Replaced the infantry's flat material treatment with deterministic, cached, original 256×256 CanvasTexture maps per Three.js runtime and faction: field-weave/camouflage fabric, ceramic armor micro-scuffs, brushed metal grain, a roughness map, fabric micro-weave relief, armor-wear relief and metal-brush relief. Maps are shared by faction rather than recreated for every soldier; no external image, paid asset or API is used.
- Increased the contrast of the procedural surface maps after inspecting the first render; the final tested surface profile is \`FIELDWEAVE_CERAMIC_MICROSCUFF_V2\`.
- Reduced the oversized head/helmet rig to 0.82 scale for a more credible character proportion and removed the duplicate coplanar helmet crown mesh that could cause redundant overlapping geometry.
- Added browser-visible diagnostics and exact assertions for the surface profile, seven texture maps, five textured PBR materials and head scale. Updated the runtime import, standalone builder and static validator together to cache key \`v9\`.
- Changed files: \`game-data/models/blue-alert-models.js\`, \`game-data/models/preview.html\`, \`scripts/validate_model_preview_browser.mjs\`, \`scripts/validate_model_kit.py\`, \`BLUE_ALERTS_v94_ASSET_INTEGRATION.html\`, \`scripts/build_single_html.mjs\`, and this log.
- Exact-head GitHub Actions workflow [\`41406756387\`](https://github.com/Ascameleon/Blue-alert/actions/runs/41406756387) on \`1b395f4a9d2e7f53b9d642e74767bfbcb702786f\`: **success**. Prototype/V94/model-kit/scenario static validation, JavaScript syntax, standalone HTML build, desktop and 390×844 mobile 3D preview, desktop and mobile live V94 gameplay, OpenRTS Java build, native graphical launch and native selection/move/attack all passed.
- Final BLUE SENTINEL preview metrics: 48 meshes, 5,000 triangles, 50 draw calls; the mobile preview remains below the enforced 60-draw-call ceiling. The deterministic gait advances in preview and remains wired to the V94 unit animation contract.
- Mission 01 browser acceptance reached 100%: 600 minerals delivered, 3 combat units produced, enemy citadel destroyed. Native OpenRTS scenario validated 12 units (4 tanks and 8 marines); interactive log confirms selection, accepted move order, approximately 4 world units of movement and a successful attack reducing target health from 120 to 119.
- Exact-head evidence: graphical/browser/native artifact \`13124077197\`; standalone playable HTML artifact \`13124146616\`. Inspected current screenshots: \`model-preview/desktop-blue-sentinel-infantry.png\`, \`desktop-red-bastion-infantry.png\`, \`mobile-blue-sentinel-infantry-390x844.png\`, \`mobile-red-bastion-infantry-390x844.png\`, \`v94-browser/desktop-v94-gameplay.png\`, \`mobile-v94-gameplay-390x844.png\`, \`desktop-v94-infantry-gait.png\`, \`mobile-v94-infantry-gait-390x844.png\`, and \`openrts-interactive-screen.png\`.
- Visual comparison used the mainline baseline screenshots from workflow \`41401367522\`, artifact \`13121567899\`, against the current PR #37 captures. The actual running V94 model now has the sealed respirator, layered faction armor, detailed rifle, corrected head proportion and subtle surface variation. The surface-map effect is clearest in close-up; at the normal RTS camera the soldier remains small. The game and character are still stylized procedural low-poly assets. **Commercial-grade modern quality is not achieved and is not claimed.**
- OpenRTS is a separate native engine smoke test; its native units do not import these V94 Three.js meshes. Mobile evidence is 390×844 browser emulation, not a physical Samsung test.
- PR #37 remains open and in draft; it was not merged and no new game version/release was published. The work is accumulated as one quality pass, not a version-count increase. Budget remains 0 €.


## Cycle — anatomical infantry rig and weapon-ready pose (2026-11-02)

- Preserved the existing V94 model kit and PR #37 lineage. Current main at inspection: a58a561a2277bcefa5045a4d954fc74dc0e734ac; tested branch head: 750adad77a2b92ec74156efa2d0690d405e30680.
- Replaced the infantry's box torso and straight block limbs with original UV-mapped elliptic loft geometry for a tapered torso, upper arms, forearms, thighs and calves. Added a neck collar, elbow pivots, knee pivots, joint forms and visible glove palms/fingers. Moved the rifle into a forward two-hand-ready position while retaining the same combat weapon mesh reference and outer unit transform.
- Gait now animates four independent limb joints (both elbows and both knees in addition to shoulder/hip pivots). The existing V94 displacement-driven gait and idle behavior remain wired to the runtime.
- Kept the cached faction fabric/ceramic/metal maps and batching inside each articulation group. The weapon remains separate for combat/muzzle integration. Bumped the model-module import and standalone builder together to cache key v10.
- Updated preview diagnostics and regression tests to require the anatomical torso, tapered limbs, hand meshes, all four elbow/knee pivots and the two-hand weapon-grip profile.
- Changed source/test files: game-data/models/blue-alert-models.js, game-data/models/preview.html, BLUE_ALERTS_v94_ASSET_INTEGRATION.html, scripts/build_single_html.mjs, scripts/validate_model_kit.py, scripts/validate_model_preview_browser.mjs.
- Relevant commits: model 3c2b8bc02353f68c30ab6eed23b452504e450caa; runtime cache 155120fe4423dc218b1f922bb93a4fa1e726aacd; builder f3378c354545a6b677a41ed0a1bc9a92acb3d4ae; static validator a209d8756bc3966a902605c859115051a35bf46e; preview diagnostics 40648ea2747a273faebfab83bcbc7e15d50626db; browser acceptance 750adad77a2b92ec74156efa2d0690d405e30680.
- Exact-head GitHub Actions workflow [41411923975](https://github.com/Ascameleon/Blue-alert/actions/runs/41411923975) on 750adad77a2b92ec74156efa2d0690d405e30680: **success**. Static prototype/V94/model-kit/scenario checks, JavaScript syntax, standalone single-file build, desktop and 390×844 mobile model preview, desktop and mobile live V94 gameplay, OpenRTS Java build, graphical launch and native selection/move/attack all passed.
- BLUE SENTINEL preview metrics: 52 meshes, 7,868 triangles, 54 draw calls. Previous tested surface-finish head: 48 meshes, 5,000 triangles, 50 draw calls. The new geometry increase remains under the 60-draw-call preview ceiling. This is a geometry/rig metric, not a claim of commercial visual quality or measured gameplay frame rate.
- Native OpenRTS scenario validated 12/12 unit movement (6/6 per faction). Interactive log confirms a real native tank selection, accepted move order with 3.64 world units of movement, and attack reducing target health from 120 to 119.
- Exact-head evidence artifacts: graphical/browser/native 13126940057; standalone playable V94 HTML 13126092025. Inspected fresh current-head screenshots: model-preview/desktop-blue-sentinel-infantry.png, desktop-red-bastion-infantry.png, mobile-blue-sentinel-infantry-390x844.png, mobile-red-bastion-infantry-390x844.png, v94-browser/desktop-v94-gameplay.png, mobile-v94-gameplay-390x844.png, desktop-v94-infantry-gait.png, mobile-v94-infantry-gait-390x844.png, and openrts-interactive-screen.png.
- Visual review: the new tapered body, nested elbow/knee articulation, hands and walking pose are visible in the actual V94 model preview and live gait captures. The character remains a stylized procedural low-poly soldier and appears small at the normal RTS camera distance. **The commercial-grade modern target is not achieved.** No release/version was created and no PR was merged.
- PR #37 remains open, mergeable and in draft with an accurately scoped title/body: [refine faction infantry anatomy and surface finish](https://github.com/Ascameleon/Blue-alert/pull/37). The previous successful exact head a8d5660b8dac9698016eb534f23b25090700a1f3 and current head are both preserved in the same PR lineage.
- OpenRTS remains a separate native engine and does not import these V94 Three.js infantry meshes. Mobile browser evidence is 390×844 emulation, not a physical Samsung test. Three.js remains CDN-loaded, so the browser build requires internet access for the renderer. No paid assets, APIs, credits or services; budget remains 0 €.


## Cycle — closer tactical opening camera framing (2026-11-02)

- Base: current main `05e9f7a74bf2e0340410d7a2d3f5a1d93bd4cdc1`; branch: `art/v94-tactical-camera-framing-20261102`.
- Visual inspection of the actual mainline captures from workflow [41416690150](https://github.com/Ascameleon/Blue-alert/actions/runs/41416690150), artifact `13128825268`, showed that the opening RTS camera at distance 48 left infantry silhouettes and equipment too small to read in both the 1440×900 desktop and 390×844 mobile gameplay views.
- Changed only the initial/reset tactical camera framing: desktop distance 38, portrait/mobile distance 40. The player can still zoom out to the existing 95-unit maximum and zoom in to the existing 16-unit minimum. Camera target, pitch, yaw, battlefield, unit transforms, hitboxes, movement and combat logic are unchanged.
- The base-focus, space-bar reset, desktop Center button and mobile Center button now share the responsive default distance instead of silently reverting to 48.
- Added read-only QA diagnostics for the current/default camera distance and explicit browser assertions at desktop and mobile sizes. Added dedicated fresh gameplay screenshots for the opening camera framing.
- Intended visible effect: a closer, more legible tactical composition without enlarging units or changing game balance. This is a presentation improvement, not a claim that the soldier models have reached commercial-grade quality.
- Exact-head browser/OpenRTS validation and visual comparison are pending. No release/version or merge is authorized by this entry. Budget remains 0 €.


### Camera A/B proof and combat-cleanup isolation — 2026-11-02

- Exact-head workflow [41425794195](https://github.com/Ascameleon/Blue-alert/actions/runs/41425794195) on `e7cfce3f1fdc1e2382bc37d1165e8cda2f6fde82` passed the static/model checks but failed in the desktop VFX cleanup wait. The log showed active combat continuing to launch projectiles and create impact effects while the test waited for a globally empty VFX queue; the timeout was not caused by a missing death explosion and the threshold was not relaxed.
- Added a QA-only `freezeNewCombat` / `resumeCombat` switch around desktop and mobile cleanup probes. It prevents new unit/turret shots during the isolated cleanup window while existing projectiles, explosions, muzzle flashes and impact effects continue their normal lifecycle. The switch is exposed only by the `?qa=1` diagnostics and is restored after the probe; live gameplay behavior is unchanged.
- Camera evidence now waits for the opening HUD to settle, then captures the original 48-unit frame and the closer desktop 38 / mobile 40 frame from the same runtime, target, yaw, pitch, lighting and viewport. The browser test asserts the camera pose is unchanged and the framing scale delta is at least 20% desktop / 15% mobile.
- No merge, version or release is claimed until the corrected exact-head workflow and both A/B screenshot pairs are inspected.


### Evergreen visual-focus initialization correction — 2026-11-02

- Exact-head workflow [41431162131](https://github.com/Ascameleon/Blue-alert/actions/runs/41431162131) exposed a literal escaped-newline syntax error in the tree-focus declaration. The following correction commit separated the declaration into a real JavaScript line break; the subsequent exact-head workflow [41431268727](https://github.com/Ascameleon/Blue-alert/actions/runs/41431268727) passed the V94 syntax/static stage.
- Review of the corrected head found a second QA-only defect before visual acceptance: `firstTreeFocus` was declared but never assigned, so the new desktop/mobile foliage camera hook would throw instead of capturing the actual tree.
- The deterministic placement loop now records the first accepted tree's existing `x`, `z` and `scale` once, without changing the random sequence, instance transforms, tree count, pathing or render groups.
- Added a static source contract for the assignment. A fresh exact-head browser/standalone/OpenRTS/native workflow and visual inspection remain required. No merge, release or commercial-quality claim is made.


### Evergreen live-runtime A/B capture and desktop-page ordering correction — 2026-11-02

- Code review of the browser acceptance sequence found the desktop foliage focus was invoked after the desktop Playwright page had already been closed. Moved the desktop focus/capture before context release; mobile capture remains on the live mobile page.
- Added a same-runtime A/B switch on the existing foliage InstancedMesh. It swaps only the geometry between the exact previous three-cone silhouette and the new branch/needle geometry, keeping the same tree instances, transform, camera, lighting, viewport and draw group.
- Desktop and 390×844 mobile now capture both the legacy baseline and detailed tree from the exact PR head. The QA-only legacy geometry is allocated only when the test toggles it and is disposed immediately after restoring the detailed geometry.
- This is evidence instrumentation, not an extra production draw call or a new gameplay asset. Exact-head validation and visual inspection are pending; no release or merge is authorized.


### Evergreen A/B validator-scope correction — 2026-11-02

- Exact-head workflow [41432189610](https://github.com/Ascameleon/Blue-alert/actions/runs/41432189610) passed the repository prototype check but stopped at the V94 static validator because the geometry-section assertion incorrectly searched for the QA geometry swap methods outside the geometry-construction function.
- Kept the legacy geometry-construction requirement inside the tree geometry section and moved the `setLegacy` / same-InstancedMesh swap requirements to a source-wide QA contract check, matching their actual runtime location.
- No runtime geometry, transforms, instance count or draw groups changed. Fresh exact-head browser, standalone, OpenRTS/native and screenshot checks remain mandatory.


### Desktop evergreen A/B moved ahead of mission-complete overlay — 2026-11-02

- Inspection of the earlier crater A/B artifact showed the desktop mission-complete overlay obscured the scene when late visual-focus captures were taken. The same ordering would have obscured the new desktop tree A/B.
- Moved the desktop evergreen focus and legacy/detail pair to immediately after the live infantry-gait capture and before the citadel-destruction mission-completion test. The gameplay page remains active and unobscured; later mission, industrial-yard and terrain checks continue unchanged.
- Mobile A/B already runs before any full victory overlay and remains in its existing live mobile sequence.
- Exact-head browser, standalone, OpenRTS/native checks and inspection of all four tree screenshots remain pending. No visual acceptance or merge is claimed.


### Mobile construction-cost assertion isolation — 2026-11-02

- Exact-head workflow [41432551605](https://github.com/Ascameleon/Blue-alert/actions/runs/41432551605) completed desktop V94 gameplay, desktop tree A/B capture, mission, combat/VFX and building-damage checks, then failed at the mobile power-station cost assertion: actual credits were 4,735 versus expected 4,650. The placement itself succeeded; asynchronous combat/harvester income changed the credit balance during the touch assertion.
- Root cause: the test compared the whole live credit balance while the mobile simulation continued granting kill and resource-delivery rewards. This made an exact construction-cost assertion timing-dependent.
- Added a QA-only economy-reward freeze around desktop and mobile construction-cost checks. It gates only reward-credit additions from enemy kills, building kills and harvester deliveries; the build transaction still deducts its configured 350 credits, mission delivery accounting and the live production gameplay path remain unchanged unless the explicit QA hook is called.
- The browser checks still require exactly one placed power station and exactly 350 credits deducted, and now assert that reward credits are restored immediately after each placement test. Static validation requires the new QA hooks. No gameplay cost, test threshold or production balance was changed.
- The failed run's desktop A/B screenshots show a plainly visible geometric difference between the legacy three-cone silhouette and the new branch/needle form. The detailed form is still angular and needs visual-quality review; mobile A/B captures and a full exact-head passing workflow remain outstanding. No merge or release is authorized.


### Evergreen branch-mass visual rejection and needle-spray revision — 2026-11-02

- Inspected the exact-head desktop and 390×844 mobile A/B captures from workflow [#314](https://github.com/Ascameleon/Blue-alert/actions/runs/41434104005), artifact \`openrts-graphical-smoke-test\`, under \`v94-browser/desktop-v94-woodland-tree-{baseline,detail}.png\` and \`v94-browser/mobile-v94-woodland-tree-{baseline,detail}-390x844.png\`.
- Rejected the first detailed geometry: the new vertical cone tufts read as repeated spikes and made the tree look less natural, despite passing the earlier structural checks. This is a visual-quality rejection, not an accepted improvement.
- Reworked the existing three-whorl instanced foliage: each of the 17 tapered branch arms now carries three overlapping, low-poly dodecahedral needle masses aligned along the bough direction, with decreasing outer sprays and restrained facet-tone variation. Removed the isolated vertical tip cones.
- Preserved the existing deterministic tree transforms, trunk/foliage instance counts, collision/pathing behavior, material contract and three render groups. No external assets or paid services.
- Exposed \`needleSpraysPerArm\` and strengthened static/browser contracts to require exactly three sprays per branch, at least 51 clusters and at least 1,500 foliage triangles. Desktop/mobile same-runtime A/B capture remains the acceptance evidence.
- Pending a fresh exact-head browser capture, screenshot inspection and complete regression/OpenRTS/native checks. The previous screenshots are the rejected baseline for this revision; no merge, version, release or commercial-grade claim is authorized.


### Needle-spray validator contract correction — 2026-11-02

- Exact-head workflow [#315](https://github.com/Ascameleon/Blue-alert/actions/runs/41436059900) passed the repository prototype syntax check and then stopped at the V94 static validator.
- The runtime correctly declares the helper as a const arrow function, but the new source contract incorrectly searched for a function declaration. Corrected the validator token to match the actual declaration; no runtime geometry or gameplay behavior changed.
- Browser/WebGL capture, standalone build and OpenRTS/native checks did not run on that failed attempt. A new exact-head workflow is required before visual acceptance.


## Cycle — connected logistics corridor wear (2026-11-02)

- Base: merged main 628635e64aa45f74e5f2d930028eb76ee70f1fde; branch: art/v94-logistics-corridor-wear-20261102.
- The accepted V94 surface had a flat 200-unit road slab with simple center dashes; the existing gantry apron was not connected to the main road by a distinct service surface.
- Added one connected, deterministic, visual-only wear layer: irregular gravel shoulders, a concrete-and-asphalt gantry access spur, broken twin tire tracks, seven irregular asphalt repair patches, branching cracks, ten instanced drainage grates and eight faded apron safety bars.
- The details are grouped into a small set of batched meshes/instances. Existing road, industrial yard, evergreen geometry, pathfinding, collision and unit behavior remain unchanged. The new layer reports its counts and exposes a QA-only visibility toggle for matched A/B screenshots.
- Acceptance is pending exact-head static, desktop/mobile WebGL, standalone build, OpenRTS and native-input validation. The browser suite captures road and gantry-corridor baseline/detail pairs at 1440×900 and 390×844 with identical camera poses. No visual improvement or release is claimed until those images are inspected.
- Mobile captures are browser emulation, not a physical Samsung test. Three.js remains CDN-loaded. Budget: 0 €.


### Desktop environment evidence overlay correction — 2026-11-02

- Direct inspection of the exact PR #44 workflow artifact showed the desktop industrial-yard and terrain screenshots were taken after the mission-complete test while the victory overlay still dimmed the entire 3D scene. The road/gantry A/B screenshots were clear; the later two scene captures were not acceptable as visual evidence.
- Kept the dedicated mission-complete screenshot and its visible-overlay assertion unchanged, then hide only the overlay in the Playwright page before capturing the industrial-yard and terrain views. This is test-only evidence cleanup; it does not alter the game runtime or mission state.
- Added a static contract requiring the overlay-clear operation in the desktop visual test. Exact-head desktop/mobile, standalone, OpenRTS build/launch and native interaction checks must pass again before PR #44 is mergeable.

### Exact-head logistics corridor validation and visual inspection — 2026-11-02

- Tested code/test head: `c7fcc69eefd818644f5233e3f9043e3625208869`. GitHub Actions workflow [41445930709](https://github.com/Ascameleon/Blue-alert/actions/runs/41445930709), run #322, completed successfully. All 24 reported steps passed: repository/V94/model-kit/scenario validation, JavaScript/browser checks, standalone single-file V94 build, desktop and 390×844 mobile model preview and live gameplay, OpenRTS Java 21 build/launch, 12/12 native-engine unit movement, and real native mouse selection, move and attack.
- The exact-head graphical artifact is [13141329066](https://github.com/Ascameleon/Blue-alert/actions/runs/41445930709/artifacts/13141329066); the standalone playable V94 HTML artifact is [13141618566](https://github.com/Ascameleon/Blue-alert/actions/runs/41445930709/artifacts/13141618566).
- Directly inspected the actual runtime A/B captures from the graphical artifact: `v94-browser/desktop-v94-road-wear-baseline.png`, `desktop-v94-road-wear-detail.png`, `desktop-v94-logistics-corridor-wear-baseline.png`, `desktop-v94-logistics-corridor-wear-detail.png`, and the four corresponding `mobile-v94-*-390x844.png` captures. The same-runtime visibility toggle preserved the QA camera pose for each pair. The new continuous spur visibly connects the main road to the loading gantry; shoulders, tire wear, repairs, cracks and drainage details are visible in both desktop and mobile browser captures. This is accepted as a material environment/route-readability improvement, not as evidence of commercial-grade or AAA quality.
- OpenRTS evidence is separate from the V94 Three.js runtime. The interactive log records selection of a native tank, a movement order with 3.49 world units of observed movement, and an attack reducing target health from 120 to 119. The OpenRTS graphical launch log also records 12/12 units moved and no uncaught runtime exception. OpenRTS does not import the V94 procedural road or infantry meshes.
- Files changed against the accepted main base: `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `scripts/validate_v94.py`, `scripts/validate_v94_browser.mjs`, and this log. No external assets, paid APIs, credits or services were used; budget remains 0 €.
- Evidence boundaries: 390×844 is browser emulation, not a physical Samsung test; Three.js remains CDN-loaded; the CI log includes non-blocking Node deprecation notices and OpenRTS material-parser warnings, with no failed step or uncaught exception. No game version/release was created.
- The PR was merged with its branch history preserved in main merge commit `c261a3d75126ac01248b8066165bd20009449818`. The only commit after tested code/test head `c7fcc69eefd818644f5233e3f9043e3625208869` and before merge was `a1d9a8280f02fcf068110c7b1231d5c03c8eb338`, which changed only this log; the compare confirms no runtime or test file changed after the passing workflow. The available GitHub commit-status and workflow-run queries returned no post-merge main-run record, so a post-merge exact-main workflow pass is not claimed. No game version or release was created.


## Cycle — terrain PBR sampling-cost experiment (2026-11-03)

- Base exact head: `6f9434ce7cdce003a7fc000fa66cf415f7b0294e` on `art/v94-terrain-pbr-relief-20261103`; prior workflow #401 completed with failure in the desktop VFX cleanup wait. Static validation, V94 model-kit validation, standalone HTML build and desktop/mobile model preview passed; live gameplay rendering did not complete, so no gameplay screenshot, standalone artifact or OpenRTS build/launch is accepted for that head.
- Diagnostic evidence: during a 30-second browser cleanup wait, the desktop game advanced from frame 175 to frame 206 and simulated approximately 1.49 seconds. The death explosion aged from 1.7 seconds to 0.207 seconds, while projectile and impact effects cleared. This indicates very low browser-frame throughput in that run; it does not establish a terrain-only root cause.
- Controlled optimization experiment: preserve 512px deterministic albedo, tangent-space normal and roughness maps, but cap anisotropic sampling at 2 on desktop and mobile (previous desktop cap 8). This retains the three-map PBR material and relief while reducing worst-case texture sampling cost. The static validator now enforces this cap. No gameplay, camera, movement, animation or VFX timing contract is changed.
- This is a performance hypothesis, not a measured improvement. Exact-head desktop/mobile WebGL, VFX cleanup timing, standalone build, OpenRTS build/launch and native interaction must all pass; inspect fresh screenshots and compare with the previous accepted main before considering merge. If the timeout persists, isolate the renderer cost further rather than extending the timeout or suppressing assertions.
- No release/version created. No external or paid assets/services. Budget: 0 €.


## Cycle — terrain micro-relief response and mobile evidence (2026-11-03)

- Base branch head: `6ab1a86cf0bc858e9d01896a0963d9d7212ca02e`; branch: `art/v94-terrain-pbr-relief-20261103`. The exact-head workflow [#406](https://github.com/Ascameleon/Blue-alert/actions/runs/41640690607) completed with failure at the mobile terrain assertion. The browser test expected the obsolete surface-mode label `procedural-albedo-grain`; the current V94 runtime correctly reports `procedural-albedo-normal-roughness`. Static/prototype/model-kit checks, standalone HTML build, desktop/mobile model preview, mission progression, combat VFX lifecycle, building damage and desktop terrain captures ran before the stale assertion stopped the job. OpenRTS/native steps were skipped because the browser job failed.
- Inspected the actual desktop A/B captures in artifact [13233626397](https://github.com/Ascameleon/Blue-alert/actions/runs/41640690607/artifacts/13233626397): `v94-browser/desktop-v94-terrain-microrelief-baseline.png` and `v94-browser/desktop-v94-terrain-microrelief-detail.png`. The difference was visible but too restrained to accept as a material terrain-quality improvement. The measured mean absolute pixel difference across the battlefield region was approximately 3.32/255; this is a diagnostic comparison, not a visual-quality score. That artifact contained no mobile terrain A/B pair.
- Revised the same procedural surface rather than adding more props: normal-field gradient gain `1.65 → 2.4`, normal strength `0.55 → 0.95`, and a broader but still rough terrain-response range in the deterministic roughness map. The albedo, 512px desktop/256px mobile resolutions, single terrain mesh, anisotropy cap of 2, movement and combat contracts remain unchanged.
- Updated the desktop/mobile browser assertions to require all three maps, the correct PBR surface mode, deterministic checksum, resolution and anisotropy cap. Added fresh mobile 390×844 baseline/detail captures with the same terrain focus and camera pose. The static validator now enforces the revised relief field and evidence paths.
- Exact-head browser, standalone, OpenRTS/native validation and inspection of fresh desktop/mobile captures are pending. This remains an unaccepted visual experiment; no merge, game version, release or commercial-grade claim is authorized. Budget: 0 €.


## Cycle — infantry hard-surface sculpt and anatomical refinement (2026-11-03)

- Base exact PR head: `63276cf91ca966ecf4a14df57f19e5106cf78552`; branch remains `art/v94-terrain-pbr-relief-20261103`, PR #50 remains draft against `main`.
- Inspected exact-head workflow #410: all static/model-kit checks, standalone V94 build, desktop/mobile model previews, desktop/mobile live V94 gameplay, OpenRTS build/launch and native input checks completed successfully. The fresh gameplay capture still showed infantry as a small, angular figure at normal RTS scale; the model preview showed box-dominant chest/boot armor and visibly faceted limbs.
- Deepened the existing shared BLUE SENTINEL / RED BASTION infantry constructor rather than adding a new unit or changing gameplay:
  - Re-profiled the torso, upper arms, forearms, thighs and calves with additional anatomical cross-sections and higher radial resolution.
  - Replaced flat chest, abdominal, rib and shoulder-lock armor plates with convex composite shells.
  - Increased helmet shell tessellation while retaining faction-specific silhouette, respirator, optics and communication hardware.
  - Rebuilt combat boots as layered ankle cuffs, toe caps, tread soles and lacing details.
  - Preserved the outer V94 unit transform, four-joint gait rig, weapon group, faction identity, collision/pathing, combat targeting and muzzle/impact contracts.
- Added model diagnostics and static/browser contracts for the new sculpt profile, convex armor and boot construction. The browser test now captures the frozen base-branch infantry alongside the new desktop and 390×844 mobile previews for direct visual review.
- Changed files: `game-data/models/blue-alert-models.js`, `game-data/models/preview.html`, `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `scripts/validate_model_kit.py`, `scripts/validate_model_preview_browser.mjs`, and this log.
- Exact-head validation, actual desktop/mobile capture inspection, standalone build and separate OpenRTS/native verification are pending. This is an implementation candidate, not an accepted visual improvement; no release/version, merge or commercial-grade claim is authorized.
- Budget: 0 €. No external assets, paid APIs or services.


## Cycle — continuous cast-hull sculpt and impact-event regression (2026-11-03)

- Starting exact branch head: `c03390e80fd636a2571449fce0acb49f83dc5091` on `art/v94-terrain-pbr-relief-20261103`; PR #50 remains a draft against main `462b6d448c810485b597effcf3e60c708dbbd48e`. The preceding exact-head workflow [#41730532047](https://github.com/Ascameleon/Blue-alert/actions/runs/41730532047) completed with failure in the mobile impact wait. The durable impact record had advanced to event 1 with one ring and seven sparks, but the test waited for short-lived particle meshes to remain present; they had already expired by the time the slow mobile CI page was polled. Desktop building-damage stages 1 and 2 passed (turret HP 300 → 156 → 60, smoke and flames spawned, scorch mark present), mission completion passed, and desktop VFX/gait checks ran. This was a transient-effect assertion defect, not evidence that the projectile failed to hit.
- Deep tank geometry change: replace the three overlapping lower-hull, upper-hull and front-glacis blocks with one continuous seven-station cast hull. The longitudinal stations define rear taper, shoulder break, deck width and a strongly inclined forward nose; the glacis is a separate material group on the same shell rather than a floating plate. Preserve faction materials, turret pivot, muzzle transform, wheel locations, closed track loops, unit root transform and all gameplay/collision contracts. New profile: `CAST_MULTI_STATION_HULL_V2`.
- Evidence contract: capture frozen main-branch tank previews at desktop and 390×844 mobile sizes alongside the new faction tank previews; assert seven hull stations, integrated glacis identity, geometry budget and existing track/turret contracts. These are comparison fixtures, not a claim that commercial-grade quality has been reached.
- Regression correction: desktop and mobile projectile tests now wait on the durable `lastImpactEvent` record (event id, ring count and spark count) instead of requiring short-lived ring/spark meshes to survive an arbitrary browser polling interval. Actual VFX cleanup remains separately tested.
- Changed files: `game-data/models/blue-alert-models.js`, `game-data/models/preview.html`, `scripts/validate_model_kit.py`, `scripts/validate_model_preview_browser.mjs`, `scripts/validate_v94_browser.mjs`, and this log.
- Geometry implementation commit: `27edf9c65d7370aa800b2366be86dd3b2263ac2d`. Exact-head workflow [#41733549047](https://github.com/Ascameleon/Blue-alert/actions/runs/41733549047) failed before the new tank preview was rendered: the frozen main preview reports `canvasWidth`/`canvasHeight`, not a boolean `canvas` property. Static model-kit validation passed; the browser step stopped at this baseline-fixture assertion. Artifact [13278303158](https://github.com/Ascameleon/Blue-alert/actions/runs/41733549047/artifacts/13278303158) contains only `model-preview/baseline-turret.png`; no new hull screenshot exists yet, so no visual improvement is accepted. The assertion is corrected in the following commit and the exact final head must be rerun. No release, game version or merge. No paid assets/APIs/services; budget remains 0 €.

## Cycle — continuous faction-specific cast turret sculpt (2026-11-03)

- Starting exact PR head: `226f8efd0a599a1fa16b8a999471e1cc0f3e30fc`; implementation commit: `22654d5f723e95659683dc88244ea183eca26b61` on `art/v94-terrain-pbr-relief-20261103`. PR #50 remains a draft against main `462b6d448c810485b597effcf3e60c708dbbd48e`.
- Replaced the old faction turret's extruded side-profile body plus separate flat roof plate with one continuous, eight-sided cast shell lofted through seven longitudinal stations. The roof is an integrated material group with chamfered shoulders. BLUE SENTINEL keeps a lower, tapered profile; RED BASTION uses a taller, broader roof and heavier shoulders. Existing rotating turret group/pivot, turret ring, cannon mantlet, barrel, muzzle, commander hatch, faction optics and smoke-discharge details remain in place.
- Added explicit `MULTI_STATION_CAST_TURRET_V2` / `CAST_TURRET_STATIONS_V2` diagnostics and exact seven-station assertions for both factions. Updated the model-kit static contract and browser preview evidence contract. Changed files in the implementation commit: `game-data/models/blue-alert-models.js`, `game-data/models/preview.html`, `scripts/validate_model_kit.py`, and `scripts/validate_model_preview_browser.mjs`.
- Exact-head workflow [#41737422028](https://github.com/Ascameleon/Blue-alert/actions/runs/41737422028) on `22654d5f723e95659683dc88244ea183eca26b61` completed successfully. Prototype/V94/model-kit static validation, JavaScript syntax, standalone V94 HTML build, desktop and 390×844 mobile model preview, desktop and mobile live V94 gameplay, building damage stages 1 and 2, mission progression, projectile/impact/explosion cleanup, infantry gait, OpenRTS Java build/launch, 12/12 native unit movement, and native mouse selection/movement/attack all passed.
- The actual desktop A/B pair `model-preview/baseline-tank-desktop.png` and `model-preview/desktop-blue-sentinel-tank.png`, plus `model-preview/baseline-tank-mobile-390x844.png` and `model-preview/mobile-blue-sentinel-tank-390x844.png`, are in graphical artifact [13280291912](https://github.com/Ascameleon/Blue-alert/actions/runs/41737422028/artifacts/13280291912). RED BASTION desktop/mobile captures are `model-preview/desktop-red-bastion-tank.png` and `model-preview/mobile-red-bastion-tank-390x844.png`. The pair shows the change from the main-branch block-stacked turret to the continuous cast profile. Live V94 integration is evidenced separately by `v94-browser/desktop-v94-gameplay.png` and `v94-browser/mobile-v94-gameplay-390x844.png` in the same artifact.
- Visual boundary: the cast turret is a material asset-level improvement in the controlled model-preview comparison, and the live V94 capture confirms the updated tank renders in gameplay. The live gameplay screenshot is not a controlled old-vs-new A/B at normal RTS zoom; fine turret detail is less legible at that scale. Therefore this is not sufficient to authorize a release or claim the overall game has reached a commercial-grade standard. The wider battlefield, environment and art direction still require deeper work.
- Performance boundary: `DESKTOP_VFX_CLEANUP_PERFORMANCE` recorded 15,167 ms, 56 frames, 2.509 simulated seconds and 3.7 average FPS in this CI browser run. This is a CI-environment diagnostic, not a Samsung/device benchmark, but it remains a renderer-performance risk to investigate. The OpenRTS build emitted existing Java deprecation/type warnings; the interactive launch also logged a serialization-registration warning, while native selection, movement and attack still passed without an uncaught runtime exception.
- Standalone playable artifact [13279018765](https://github.com/Ascameleon/Blue-alert/actions/runs/41737422028/artifacts/13279018765) contains `BLUE_ALERTS_V94_BUILD_ZONE_JOUABLE.html` (287,100 bytes). The model module is embedded; Three.js 0.160.0 is still loaded from a CDN, so internet access is required for the 3D renderer. This is a test artifact, not a release/version.
- OpenRTS/native evidence is separate from the V94 Three.js game: its launch log records 12 units and 14 actors, with 12/12 units moved; the native input log records selection of `rollerTank` and target health 120 → 119 after attack. The native OpenRTS screenshot does not prove that V94 procedural meshes are imported by OpenRTS.
- No external/paid assets, APIs, credits or services were used; budget remains 0 €. Main was not changed, PR #50 was not merged, and no game version or release was created.

## Cycle — defensive turret cast-cupola integration and exact-head validation (2026-11-04)

- Starting exact branch head: `2b1f77ddcfc506e198634c037b329138304f7d67`; code implementation commit: `8acb84ab2bab84ba82735e774a7f6b41a0e22876` on `art/v94-terrain-pbr-relief-20261103`. PR #50 remains a draft against unchanged main `462b6d448c810485b597effcf3e60c708dbbd48e`.
- Replaced the defensive turret's partial spherical cupola with one continuous eight-sided cast shell lofted through seven longitudinal stations. The stations shape the front glacis, lower shoulders, roof break and tapered rear. The shell uses separate armor/roof material groups. Existing barbette, lower rotating ring, turret pivot, twin autocannons, recoil sleeves, optics, cooling details, ring bolts, 300 HP, 1.8-unit gameplay radius and combat-damage path remain unchanged.
- Propagated `DEFENSE_CUPOLA_LOFT_V2` and its seven-station count from the model kit into the live V94 building and QA snapshot. Added static and browser assertions that both the previewed defense turret and the actual enemy turret in the running game instantiate the new model.
- Code commit changed exactly: `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `game-data/models/blue-alert-models.js`, `game-data/models/preview.html`, `scripts/validate_model_kit.py`, `scripts/validate_model_preview_browser.mjs`, and `scripts/validate_v94_browser.mjs`.
- Exact-head workflow [#41741996590](https://github.com/Ascameleon/Blue-alert/actions/runs/41741996590) for `8acb84ab2bab84ba82735e774a7f6b41a0e22876` completed successfully. All 24 reported steps passed: repository/prototype/V94/model-kit/scenario validation, JavaScript checks, standalone V94 HTML build, desktop and 390×844 mobile model-preview rendering, desktop and mobile live V94 gameplay rendering, OpenRTS Java build/launch, 12/12 native unit movement, and real native mouse selection, movement and attack with verified state changes.
- Exact-head graphical artifact [13282348045](https://github.com/Ascameleon/Blue-alert/actions/runs/41741996590/artifacts/13282348045) contains the defensive-turret A/B capture paths `model-preview/baseline-turret.png`, `model-preview/baseline-turret-mobile-390x844.png`, `model-preview/desktop-turret.png`, and `model-preview/mobile-turret-390x844.png`; live V94 runtime captures `v94-browser/desktop-v94-gameplay.png` and `v94-browser/mobile-v94-gameplay-390x844.png`; and separate native OpenRTS evidence `openrts-screen.png`, `openrts-interactive-screen.png`, `openrts-launch.log`, `openrts-interactive-launch.log`, and `blue-alerts-scenario-report.json`. The standalone playable V94 HTML and manifest were uploaded separately as artifact [13282551412](https://github.com/Ascameleon/Blue-alert/actions/runs/41741996590/artifacts/13282551412).
- Visual acceptance boundary: screenshot files were generated and size-checked by the exact-head workflow, but their pixels were not manually inspected during this cycle because the downloaded archive could not be opened by the available runtime file-inspection tools. Therefore the cast-cupola change is implemented and technically validated, but its visual A/B is **not accepted** as a material improvement yet. The live-game captures are not a controlled before/after pair. No release/version, merge, or commercial-grade claim is authorized until the actual desktop/mobile images are inspected and the visible difference is confirmed.
- Native-engine boundary: OpenRTS build, launch, movement and real input checks are separate from the V94 Three.js runtime; they do not prove that V94 procedural meshes are imported into OpenRTS. The 390×844 capture is browser emulation, not a physical Samsung test. Three.js remains CDN-loaded in the standalone HTML.
- No external or paid assets, APIs, credits or services were used; budget remains 0 €. Main was not changed, PR #50 was not merged, and no game version or release was created.


## Cycle — command bunker depth-loft and live integration (2026-11-04)

- Implementation commit: `69bd5437f16fa9d64fba5e63a7e9950b5056ea58` on `art/v94-terrain-pbr-relief-20261103`. PR #50 remains a draft against unchanged `main` `462b6d448c810485b597effcf3e60c708dbbd48e`.
- Replaced the headquarters command core's single-depth extruded profile with a six-station depth-lofted shell. The nose and rear taper in plan, while the shoulders descend toward both armored end caps. The original foundation footprint, root transform, collision envelope, front service interfaces, radar and command-building contract remain unchanged.
- Exact-head workflow [#41756572381](https://github.com/Ascameleon/Blue-alert/actions/runs/41756572381) completed successfully. The OpenRTS build and launch passed separately; the scenario loaded 12 units, all 12 moved, and native mouse selection, movement and attack produced verified state changes. This native result does not prove that V94 Three.js assets are imported into OpenRTS.
- Inspected the actual model-preview A/B screenshots in artifact [13289380630](https://github.com/Ascameleon/Blue-alert/actions/runs/41756572381/artifacts/13289380630): `model-preview/baseline-hq-desktop.png` versus `model-preview/desktop-hq.png`, plus the 390×844 mobile equivalents. The new shell has a visibly tapered, lower armored silhouette and more coherent front-facing architecture than the rectangular baseline. The improvement is localized and still stylized; it does not establish commercial-grade quality. The live V94 gameplay capture remains comparatively simple, and the first HQ-focus capture was partially obscured by the floating base label.
- The exact-head graphical artifact also contains `v94-browser/desktop-v94-gameplay.png`, `v94-browser/mobile-v94-gameplay-390x844.png`, `v94-browser/desktop-v94-headquarters-focus.png`, and `v94-browser/mobile-v94-headquarters-focus-390x844.png`. These are web-runtime captures, not physical Samsung screenshots.
- No release/version, merge, external asset, paid API or service. Budget: 0 €.

## Cycle — V94 command-bunker concrete, armor-paint and metal surface response (2026-11-04)

- Starting exact branch head: `69bd5437f16fa9d64fba5e63a7e9950b5056ea58`; PR #50 remains open and draft. `main` remains `462b6d448c810485b597effcf3e60c708dbbd48e`.
- Added a deterministic, cached procedural surface set to the existing headquarters shell and its integrated architectural materials: concrete albedo/pore relief, painted-armor wear, brushed-metal grain and a shared roughness map. Desktop maps are 512×512; mobile maps are 256×256 with anisotropy capped at 2. No external textures, generated web images or paid services are used.
- The model kit exposes a reversible material-only A/B switch. The model-preview browser test and the actual running V94 game now capture the same HQ with surface maps disabled and enabled at desktop and 390×844 mobile sizes. The live camera focus also hides the floating HQ label for unobstructed inspection; this is QA-only and does not change normal gameplay presentation.
- Gameplay contracts preserved: command-core geometry/profile, building footprint and collision envelope, construction, radar rotation, unit movement/pathfinding, targeting, projectile damage, destruction stages and mission objectives are not altered.
- Expected screenshot paths: `model-preview/desktop-hq-surface-baseline.png`, `model-preview/desktop-hq-surface-detail.png`, `model-preview/mobile-hq-surface-baseline-390x844.png`, `model-preview/mobile-hq-surface-detail-390x844.png`, and the matching `v94-browser/*-headquarters-surface-{baseline,detail}*` desktop/mobile captures.
- First implementation commit: `5cb23e517a848efe004429a987550034d5b3fb5f`; exact-head workflow [#41758825316](https://github.com/Ascameleon/Blue-alert/actions/runs/41758825316) failed in `scripts/validate_model_preview_browser.mjs:355` because the same preview page reused its cached 512px desktop maps after switching to the 390×844 mobile viewport (actual 512, expected 256). Prototype, V94 static, model-kit static, scenario validation and standalone V94 build passed; the model-preview browser test stopped the workflow before live V94 browser rendering, OpenRTS native build/launch and native input checks.
- Artifact [13289282059](https://github.com/Ascameleon/Blue-alert/actions/runs/41758825316/artifacts/13289282059) contains `model-preview/desktop-hq-surface-baseline.png` and `model-preview/desktop-hq-surface-detail.png`. I inspected both: the initial surface change is too subtle at the captured scale to count as a material visual improvement. The mobile surface A/B captures were not produced because the 512→256 assertion stopped the test. This candidate is not visually accepted.
- Follow-up correction keys cached maps by their actual resolution, increases concrete/paint/metal texture contrast and bump relief, and adds an assertion that all four materials really have their map slots active or cleared. No release/version or merge is authorized.
- Budget: 0 €. OpenRTS/native checks remain separate from the V94 WebGL runtime.


- Follow-up implementation: per-resolution cache and stronger authored surface response are being validated on the exact branch head; the next run must produce fresh desktop/mobile model-preview and live V94 A/B screenshots before any visual acceptance.



## Cycle — curved conifer canopy and flared bark trunk (2026-11-04)

- Starting exact branch head: \`1b86d0363739568059a9a911fbd3e863d1924011\` on \`art/v94-terrain-pbr-relief-20261103\`; PR #50 remains a draft against unchanged \`main\` \`462b6d448c810485b597effcf3e60c708dbbd48e\`. All workflows for the branch were complete before this change; no concurrent validation was active.
- Visual diagnosis from exact-head workflow [#41759494751](https://github.com/Ascameleon/Blue-alert/actions/runs/41759494751): the existing evergreen still reads as a low-poly cone with detached angular tufts. The live V94 desktop/mobile captures show the tree in gameplay, but the canopy silhouette remains artificial. The headquarters material A/B screenshots from the same run differ only subtly at normal gameplay scale, so that material candidate is not accepted as a material visual improvement.
- Deepened the existing instanced evergreen instead of adding scenery: remove the exposed cone core; replace straight branch rods with six-segment, four-sided tapered Bézier boughs; distribute six overlapping needle masses per bough across four irregular whorls; and replace the short cylinder trunk with a 2.65-unit flared, ridged, vertex-coloured bark profile. Keep deterministic placement, existing tree count/instance matrices, three render groups, visual-only collision/pathing behavior and the old geometry as a reversible A/B baseline.
- New runtime profile: \`CURVED_BRAIDED_CONIFER_V3\`; trunk profile: \`TAPERED_FLARED_BARK_V2\`. Desktop and 390×844 mobile browser checks now assert the exact branch/cluster/trunk contracts and cap the shared foliage geometry at 6,000 triangles.
- Changed files: \`BLUE_ALERTS_v94_ASSET_INTEGRATION.html\`, \`scripts/validate_v94.py\`, \`scripts/validate_v94_browser.mjs\`, and this log.
- First exact-head workflow [#41762261026](https://github.com/Ascameleon/Blue-alert/actions/runs/41762261026) on implementation commit `ced1594886e8f417f1d112e50b88a6120b731d3e` failed at `scripts/validate_v94.py`: the static tree contract still required the removed cone-based branch helper `new THREE.ConeGeometry(radius, height, segments, 1)`. The prototype inline JavaScript syntax check passed; the V94 static validator stopped the job before browser rendering, desktop/mobile screenshots, standalone build and separate OpenRTS checks. This is a stale validator expectation, not evidence of a gameplay regression. The follow-up updates the contract to require Bézier branch lofts, the cone-free canopy profile and both trunk/canopy A/B restoration. No screenshots were produced by this failed run, so the visual candidate remains unaccepted.
- Second exact-head workflow [#41762373432](https://github.com/Ascameleon/Blue-alert/actions/runs/41762373432) on `4dd47fa13f866bf8dc92aae9930d37fb2a5409dd` passed the prototype/V94/model-kit/static/scenario checks and the standalone V94 build, but stopped at `scripts/validate_v94_browser.mjs:225`: the early desktop vegetation summary still hard-coded the old three-whorl, 17-arm, 51-cluster contract. The later close-focus desktop/mobile assertions had already been updated to V3; the early desktop and mobile metrics had not. Artifact [13290379606](https://github.com/Ascameleon/Blue-alert/actions/runs/41762373432/artifacts/13290379606) contains model-preview and pre-failure road/camera evidence, but no fresh tree A/B or V94 gameplay tree captures. The next correction updates both viewport summary contracts to the new profile. The visual candidate remains unaccepted.
- Exact implementation commit, workflow result, changed-file SHAs, fresh desktop/mobile screenshot paths and visual A/B acceptance decision will be recorded after the exact-head run finishes. Expected evidence: \`v94-browser/desktop-v94-woodland-tree-{baseline,detail}.png\` and \`v94-browser/mobile-v94-woodland-tree-{baseline,detail}-390x844.png\`, plus the gameplay desktop/mobile captures. No release/version or merge is authorized until those real runtime captures are inspected. Budget: 0 €.


## Cycle — forward rifle axis and physically aligned two-hand infantry rig (2026-11-04)

- Starting exact branch head: `55ceea123c875d9c3481814f5ee72078e4b50e5b` on `art/v94-terrain-pbr-relief-20261103`. PR #50 remains a draft against unchanged `main` `462b6d448c810485b597effcf3e60c708dbbd48e`.
- Visual diagnosis: the current V4 rifleman's barrel points laterally along model-local +X while the character faces +Z. The two hands are articulated, but the current source does not verify that either palm physically meets a weapon grip. The live desktop/mobile gait captures prove movement-driven joint animation, not a correct forward-ready hold.
- Reworked the existing soldier rig hierarchy so head, shoulder/elbow pivots, hip/knee pivots, field pack and weapon are parented to the torso. The rifle now points along the soldier's +Z forward axis. Its trigger and support grip anchors are positioned to coincide with the right and left glove palms; the upper-arm lofts sweep inward and the left support arm reaches the forward handguard. Reduced arm swing during locomotion so the rifleman keeps a stable two-hand hold while the legs retain the gait.
- Preserved the existing outer V94 unit transform, health, collision radius, targeting, damage, pathing, faction profiles, rifle receiver mesh, weapon material maps and mobile draw-call budget. No external assets, paid APIs or services.
- Changed files: `game-data/models/blue-alert-models.js`, `game-data/models/preview.html`, `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `scripts/validate_model_kit.py`, `scripts/validate_model_preview_browser.mjs`, `scripts/validate_v94_browser.mjs`, `scripts/validate_v94.py`, and this log.
- Added desktop/mobile preview and live V94 regression assertions for weapon-forward alignment, both hand-to-grip distances and torso-parented rig hierarchy. Fresh screenshots are expected at `model-preview/desktop-blue-sentinel-infantry.png`, `model-preview/desktop-red-bastion-infantry.png`, `model-preview/mobile-blue-sentinel-infantry-390x844.png`, `model-preview/mobile-red-bastion-infantry-390x844.png`, `v94-browser/desktop-v94-infantry-gait.png`, and `v94-browser/mobile-v94-infantry-gait-390x844.png`.
- Implementation commit: `1e5b4a29a839e3651821588e904eea8a502b86c7`. Exact-head workflow [#41766435573](https://github.com/Ascameleon/Blue-alert/actions/runs/41766435573) failed at `scripts/validate_v94.py:135` before model-kit, browser rendering or OpenRTS checks because the new static assertion referenced undefined `game` rather than the validator's loaded `source` text. The prototype/HTML structure and inline JavaScript parse checks passed; no desktop/mobile screenshots were produced, so this candidate has no visual acceptance. The follow-up changes the validator to inspect `source`; the corrected exact head must rerun the full suite before the model can be accepted. The candidate is not visually accepted until fresh desktop/mobile model-preview and live-game captures are inspected. No release/version or merge is authorized. Budget remains 0 €.
- The corrected validator commit `7259cf3d655b66f707097d6f34de7fd18d52e451` passed the V94 static validator, expanded model-kit validator, scenario checks, OpenRTS preparation and standalone V94 build. Exact-head workflow [#41766551590](https://github.com/Ascameleon/Blue-alert/actions/runs/41766551590) then failed in the desktop model-preview test: rifle forward alignment was 1.0 and torso parenting was true, but reported hand-to-grip distances were 0.838 and 0.817. Inspection showed the QA retained references to palm meshes that the static-mesh batching pass had merged and detached. No infantry screenshots were captured; artifact [13292583759](https://github.com/Ascameleon/Blue-alert/actions/runs/41766551590/artifacts/13292583759) contains baseline previews and the tank preview only. This is a probe-lifetime defect, not evidence that the forward axis is wrong. The next correction introduces non-rendering palm-anchor groups that remain attached to the elbow rig and records both hand/grip world coordinates. Visual acceptance remains blocked until the new exact-head desktop/mobile captures are inspected.
- The palm-anchor correction commit `e0596615b2cce6570ec56f2de421741053150460` fixed the detached-reference problem. Exact-head workflow [#41766994894](https://github.com/Ascameleon/Blue-alert/actions/runs/41766994894) passed static V94/model-kit/scenario checks and the standalone build, then failed the desktop preview grip assertion: forward alignment 1.0, torso parenting true, left hand offset 0.0114 and right offset 0.0357 against a 0.035 limit. The right hand drift is caused by the remaining shoulder/elbow counter-swing during the ready pose. Artifact [13293350976](https://github.com/Ascameleon/Blue-alert/actions/runs/41766994894/artifacts/13293350976) contains baseline previews and the tank preview only; the infantry screenshots were not reached. The next adjustment reduces shoulder swing from 0.12 to 0.08, neutral arm bias from -0.04 to -0.02 and elbow swing from 0.018 to 0.012, keeping the two-hand hold stable while preserving measurable arm movement and the leg-driven gait. No visual acceptance until fresh desktop/mobile captures exist.


## Cycle — sculpted V94 battlefield relief and slope-linked bedrock (2026-11-04)

- Starting implementation commit: `05ca232652c96db47051d02bc7aedb55ea008fae`. Follow-up commits: `afef7ea37fc3efab543001afce3893995d63331e` (grounded terrain/gait QA probes), `442422131c646b9a693d74bc794a112985c54476` (slope-linked bedrock exposure), and exact-head correction `3677d6bd1b5ec4324d28778b9fc21c611f726617` (terrain probe uses the computed height for the live unit placement). Branch: `art/v94-terrain-pbr-relief-20261103`; PR #50 remains a draft against unchanged `main` `462b6d448c810485b597effcf3e60c708dbbd48e`.
- Runtime work: replace the former 60×48 flat terrain grid with a deterministic 160×128 desktop / 120×96 mobile heightfield; author a diagonal ridge and swale; preserve flat road, construction pads and industrial clearances; compute terrain normals and slope exposure; blend exposed bedrock into the vertex palette only where the actual heightfield rises or breaks. Ground live units, buildings, trees, rocks, ore and battlefield dressing against the same `terrainHeightAt` function. No navigation, health, combat, weapon, mission or unit-collision contracts were intentionally changed.
- Regression coverage: desktop and 390×844 mobile browser checks assert the heightfield profile, vertex counts, bounded height range/slope, flat gameplay surfaces, grounded live units and probe restoration. Fresh viewport-sized screenshots are generated for live gameplay, terrain surface and close relief focus. Existing terrain A/B normal/roughness-map tests remain in place.
- Changed runtime/test files across this cycle: `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `scripts/validate_v94.py`, and `scripts/validate_v94_browser.mjs`. The final correction commit `3677d6bd1b5ec4324d28778b9fc21c611f726617` changes only the V94 HTML probe placement line.
- Exact-head workflow [#41772121994](https://github.com/Ascameleon/Blue-alert/actions/runs/41772121994) completed successfully on `3677d6bd1b5ec4324d28778b9fc21c611f726617`. All 24 job steps passed: prototype/V94/model-kit/scenario validation; desktop and mobile model preview; desktop and mobile live V94 rendering; standalone single-file V94 build; OpenRTS native build; OpenRTS skirmish launch; 12/12 unit movement; and real native left-click selection, right-click movement and attack. Native OpenRTS checks are separate from the V94 browser prototype.
- Evidence artifacts: [OpenRTS graphical smoke-test artifact 13295867990](https://github.com/Ascameleon/Blue-alert/actions/runs/41772121994/artifacts/13295867990) (79 uploaded files, including `openrts-screen.png`, `openrts-launch.log` and `blue-alerts-scenario-report.json`); [standalone playable V94 artifact 13295592868](https://github.com/Ascameleon/Blue-alert/actions/runs/41772121994/artifacts/13295592868). Relevant runtime captures include `v94-browser/desktop-v94-gameplay.png`, `v94-browser/mobile-v94-gameplay-390x844.png`, `v94-browser/desktop-v94-sculpted-terrain.png`, `v94-browser/mobile-v94-sculpted-terrain-390x844.png`, `v94-browser/desktop-v94-terrain-surface.png`, `v94-browser/mobile-v94-terrain-surface-390x844.png`, plus the desktop/mobile woodland and headquarters A/B captures. Model-preview captures include desktop/mobile tank, infantry, turret and headquarters views.
- Evidence boundary: the workflow confirms that fresh desktop/mobile screenshots were produced and the runtime assertions passed. The image archive could not be opened for direct visual inspection in this run, so no claim of a clearly material visual improvement or visual acceptance is made. The commercial-grade visual target remains unmet until the captures are inspected against the previous accepted main build.
- Performance warning: the CI log reports `DESKTOP_VFX_CLEANUP_PERFORMANCE` at 19,108 ms for 39 frames (about 2.0 frames/s) under the headless SwiftShader test environment. This is a CI rendering-throughput observation, not a physical-device benchmark; it remains an investigation item and must not be represented as Samsung performance.
- No version/release, merge or new branch created. No external/paid assets, APIs, credits or services. Budget: 0 €.


## Cycle — crease-aware hard-surface normals for V94 tank armor (2026-11-04)

- Starting exact branch head: `1faf242a7a066f3a372026713e8ecad12ff58138` on `art/v94-terrain-pbr-relief-20261103`; PR #50 remains a draft against unchanged `main` `462b6d448c810485b597effcf3e60c708dbbd48e`.
- Implementation commit: `2ed97d5afe6888203a0b90e64b71c9a477ecef94` — `art: add crease-aware hard-surface normals to V94 tank armor`.
- Visual problem: the seven-station cast hull and turret were lit with averaged vertex normals across every station and shoulder. This rounded the glacis, side armor and roof transitions into one soft highlight, obscuring the intended armored planes even though the underlying geometry had a defined cast profile.
- Change: added a deterministic crease-aware normal pass to the existing tank hull and faction-specific turret only. Faces within 34 degrees share area-weighted normals; sharper transitions split their vertex normals. UVs, material groups, draw ranges, geometry bounds and the existing one-shell mesh structure are preserved. No new meshes, external assets, APIs, credits or draw calls are introduced. The defense turret and non-tank models retain their existing normal treatment.
- Runtime diagnostics expose the normal profile, crease angle, vertex count and finite/unit-normal check. Added desktop/mobile model-preview assertions for both BLUE SENTINEL and RED BASTION, plus live V94 tank QA that focuses a real in-game tank for a close-up screenshot and restores the gameplay camera afterward.
- Changed files: `game-data/models/blue-alert-models.js`, `game-data/models/preview.html`, `scripts/validate_model_kit.py`, `scripts/validate_model_preview_browser.mjs`, `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `scripts/validate_v94.py`, `scripts/validate_v94_browser.mjs`, and `docs/EVOLUTION_LOG.md`.
- Exact-head checks required: model-kit/static validation; desktop and 390×844 mobile model-preview WebGL rendering for both factions; V94 static validation; desktop and mobile live gameplay plus tank close-up; standalone single-file V94 build; separate OpenRTS native build, skirmish launch, 12-unit movement and real mouse selection/movement/attack.
- Expected screenshot paths in the exact-head workflow artifact: `artifacts/model-preview/baseline-tank-desktop.png`, `artifacts/model-preview/desktop-blue-sentinel-tank.png`, `artifacts/model-preview/desktop-red-bastion-tank.png`, `artifacts/model-preview/baseline-tank-mobile-390x844.png`, `artifacts/model-preview/mobile-blue-sentinel-tank-390x844.png`, `artifacts/model-preview/mobile-red-bastion-tank-390x844.png`, `artifacts/v94-browser/desktop-v94-gameplay.png`, `artifacts/v94-browser/desktop-v94-tank-armor-closeup.png`, `artifacts/v94-browser/mobile-v94-gameplay-390x844.png`, and `artifacts/v94-browser/mobile-v94-tank-armor-closeup-390x844.png`.
- Evidence boundary at commit creation: these are required fresh capture paths, not yet inspected proof. Visual acceptance remains blocked until the exact-head desktop/mobile tank previews and live V94 close-ups are opened and compared with the frozen main-branch baseline. If the new planar armor read is not materially clearer, this candidate is not accepted. No version/release, merge or commercial-grade claim is authorized. Budget remains 0 €.


## Validation correction — exact-head run 41785290795 (2026-11-04)

- The first exact-head run for `b86202f7e833f6212a6f6286e08f2e2d11a96504` stopped at `scripts/validate_v94.py` before model-preview or gameplay rendering. Failure: the static validator incorrectly demanded the model-profile literal inside the runtime HTML instead of the imported model library.
- The live QA also needed to inspect the tank model child attached to the outer RTS unit group; the normal-profile metadata is correctly owned by that child, not the wrapper group.
- Correction implementation commit: `37987c93a17cd58f7747c83b5c4ff6fca1a4d93a` — the runtime QA now resolves the nested tank model, and the V94 static validator checks the crease-profile literal in `game-data/models/blue-alert-models.js` while checking runtime-only hooks in the HTML.
- The failed run produced no visual artifacts. No screenshot, gameplay or graphical improvement is accepted on the basis of this run. The next workflow must validate the corrected exact head before any further branch write.
- Budget remains 0 €. No version/release, merge or commercial-grade claim is authorized.


## Exact-head visual review — V94 terrain micro-relief (2026-11-04)

- Exact reviewed branch head: `79d6990acd5cf982957211f8dde5c0d581bf3c5b`; PR #50 remains open and draft against unchanged `main` `462b6d448c810485b597effcf3e60c708dbbd48e`.
- Exact-head workflow [#41791076553](https://github.com/Ascameleon/Blue-alert/actions/runs/41791076553), attempt 2, completed successfully. The workflow passed static/prototype/model-kit/scenario checks, desktop/mobile V94 WebGL, standalone HTML build, separate OpenRTS build/launch, 12/12 native unit movement, and real native mouse selection, movement and attack.
- Inspected artifact [13304509578](https://github.com/Ascameleon/Blue-alert/actions/runs/41791076553/artifacts/13304509578): `v94-browser/desktop-v94-gameplay.png`, `v94-browser/mobile-v94-gameplay-390x844.png`, `v94-browser/desktop-v94-sculpted-terrain.png`, `v94-browser/mobile-v94-sculpted-terrain-390x844.png`, and desktop/mobile `terrain-microrelief-{baseline,detail}` pairs. Compared the desktop gameplay capture with main-reference artifact [13144400413](https://github.com/Ascameleon/Blue-alert/actions/runs/41447685965/artifacts/13144400413). The updated tank hull reads more clearly, but the battlefield still looks predominantly like a flat green plane at normal gameplay scale.
- The same-camera desktop micro-relief A/B pair has a battlefield-region pixel MAE of 4.26/255 (diagnostic only, not a visual-quality score). Direct inspection still finds the normal/roughness change too subtle to accept as a material terrain improvement. The micro-relief candidate is not visually accepted.
- CI-only transient-effect measurements in this successful run were about 4.0 FPS desktop and 15.2 FPS mobile emulation. These are headless/SwiftShader test-environment observations, not physical-device or Samsung performance measurements. The native OpenRTS screenshot remains evidence for the separate native engine, not the V94 Three.js terrain.
- Decision: do not merge PR #50 or create a version/release. The next terrain pass must improve the actual macro landform silhouette and material response, not merely increase texture detail. Budget remains 0 €.

## Cycle — broad battlefield uplands and stronger slope-exposed bedrock (2026-11-04)

- Starting exact branch head: `79d6990acd5cf982957211f8dde5c0d581bf3c5b` on `art/v94-terrain-pbr-relief-20261103`. Preflight confirmed that all workflows for this branch were complete, PR #50 still targeted the unchanged main commit `462b6d448c810485b597effcf3e60c708dbbd48e`, and no other automation was writing to this branch.
- Runtime change: add two broad deterministic upland fields (northwest rise and northeast shoulder) to the existing ridge/swale heightfield, creating a more legible battlefield silhouette at RTS zoom. Strengthen the slope/elevation-linked bedrock blend so the surface palette follows the same landforms rather than relying on a uniform green ground. Keep the road, player/enemy build pads and industrial clearances flat; preserve the single terrain mesh, existing 160×128 desktop / 120×96 mobile geometry budgets, deterministic placement, and the shared height function used by units, buildings, vegetation, rocks, ore and props.
- Gameplay contracts intentionally preserved: outer unit transforms, movement/pathfinding, collision radii, construction placement, combat, animation, mission progression, resource locations and native OpenRTS integration. No new scene objects, meshes, draw calls, external assets or paid services are added.
- Regression gates now require the V2 landform/material profiles, at least 2.2 world units of terrain height range, maximum sampled slope no greater than 0.25, grounded terrain probe height at least 1.45, level road/base pads, and stronger bedrock exposure on both desktop and 390×844 mobile.
- Changed files in this implementation: `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `scripts/validate_v94.py`, `scripts/validate_v94_browser.mjs`, and `docs/EVOLUTION_LOG.md`.
- Exact-head desktop/mobile browser captures, standalone V94 build, gameplay regressions, OpenRTS/native checks and screenshot inspection are pending. The landform change is not accepted until the fresh gameplay and sculpted-terrain screenshots are opened and compared with the previous exact-head and main reference. No merge, version/release or commercial-grade claim is authorized. Budget: 0 €.


## Exact-head visual review — V2 uplands and bedrock (2026-11-04)

- Exact reviewed head: `ca0f4702cc43eacb0cfe8b206a64cb83e7643a15` on `art/v94-terrain-pbr-relief-20261103`; PR #50 remains open/draft against unchanged `main` `462b6d448c810485b597effcf3e60c708dbbd48e`.
- Exact-head workflow [#41799831026](https://github.com/Ascameleon/Blue-alert/actions/runs/41799831026) completed successfully. Static/prototype/model-kit/scenario validation, desktop/mobile V94 WebGL, standalone HTML, OpenRTS build/launch, 12/12 native movement, and real native mouse selection/movement/attack all passed.
- Inspected artifact [13307734258](https://github.com/Ascameleon/Blue-alert/actions/runs/41799831026/artifacts/13307734258), including `v94-browser/desktop-v94-gameplay.png`, `v94-browser/mobile-v94-gameplay-390x844.png`, `v94-browser/desktop-v94-sculpted-terrain.png`, and `v94-browser/mobile-v94-sculpted-terrain-390x844.png`. The gameplay captures still read as a predominantly flat green field at normal tactical scale. The V2 terrain focus framed the top of the north-west rise from above, so the silhouette was not legible. The same-camera terrain micro-relief A/B pair and headquarters surface A/B pair were also nearly indistinguishable at normal display size.
- The native OpenRTS screenshot is evidence for the separate Java/OpenRTS runtime only; it is not proof of V94 Three.js terrain quality. The CI transient-effect measurements were about 1.7 FPS desktop and 11.3 FPS mobile emulation in this run; these are headless/SwiftShader observations, not physical-device or Samsung performance measurements.
- Decision: V2 is not visually accepted. No merge, release, version or commercial-grade claim. The next pass must make the actual ridge profile readable from a live gameplay camera, not merely pass a height-range assertion. Budget remains 0 €.


## Cycle — V3 northern ridge faces and stratified bedrock (2026-11-04)

- Starting exact branch head: `ca0f4702cc43eacb0cfe8b206a64cb83e7643a15`. Preflight confirmed zero queued/in-progress workflows for this branch, PR #50 still draft against unchanged `main` `462b6d448c810485b597effcf3e60c708dbbd48e`, and no concurrent branch writer.
- Implementation commit: `317169f8a457abdc3754a4dd197108701614411c` (parent `ca0f4702cc43eacb0cfe8b206a64cb83e7643a15`). Runtime change: replace the low, summit-centred V2 shoulders with two stronger northern uplands centred at `(-84,68)` and `(84,68)`, a broader central saddle, and a quieter southern swale. Reduce random low-frequency ground mottling so the authored landform dominates at RTS scale. Use elevation- and slope-driven warm bedrock exposure plus darker valley soil; no additional scene objects, meshes, textures, draw calls, external assets or paid services.
- The live V94 evidence camera now approaches the north-west ridge from the south-east; the grounding probe is placed at `(-70,55)` on the actual rise. The same `terrainHeightAt` remains the sole grounding source for units, buildings, vegetation, rocks, ore and props. Roads, both build pads and industrial clearances remain level. Desktop/mobile geometry budgets remain 160×128 and 120×96.
- Regression gates: desktop/mobile height range at least 2.7, peak height at least 2.4, low saddle no higher than -0.30, maximum sampled slope no greater than 0.245, live ridge probe at least 1.75, bedrock-exposed vertex counts at least 4300 desktop / 2400 mobile, and zero drift for every checked live unit. Existing combat, pathfinding, collision, construction, animation, mission and native OpenRTS contracts remain unchanged.
- Changed files: `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `scripts/validate_v94.py`, `scripts/validate_v94_browser.mjs`, `docs/EVOLUTION_LOG.md`.
- Fresh exact-head screenshot targets: `artifacts/v94-browser/desktop-v94-gameplay.png`, `artifacts/v94-browser/mobile-v94-gameplay-390x844.png`, `artifacts/v94-browser/desktop-v94-sculpted-terrain.png`, and `artifacts/v94-browser/mobile-v94-sculpted-terrain-390x844.png`. These paths are expected outputs, not proof until the artifact is downloaded and each desktop/mobile capture is inspected. Visual acceptance remains pending. No version/release, merge or commercial-grade claim. Budget: 0 €.


## Validation correction — V3 terrain static profile assertion (2026-11-04)

- Candidate exact head `8f8889e37e0ddfef27777152400541b9c726455d` was checked by workflow [#41808357113](https://github.com/Ascameleon/Blue-alert/actions/runs/41808357113). The run failed immediately in `scripts/validate_v94.py`: one static assertion still expected the V2 `heightProfile` literal after the runtime and browser gates had moved to V3. Prototype JavaScript parsing passed; the V94 static validator stopped before WebGL rendering, so this run produced no fresh gameplay screenshots and provides no visual acceptance.
- Correction: update that final stale static assertion to require `SCULPTED_BATTLEFIELD_HEIGHTFIELD_V3`. No runtime code was changed in this correction. The exact-head workflow must rerun before the V3 terrain can be judged.
- No branch write was made until workflow #41808357113 had completed. No merge, version/release or paid service. Budget remains 0 €.
- Static validator correction commit: `8c5c9618fd54a0395f99d82aa1483ae2343eb23c`.


## Engine delivery correction — self-contained V94 WebGL runtime (2026-11-04)

- Preflight: branch `art/v94-terrain-pbr-relief-20261103` was at `88c87551ebe816f9a29c94442c93c023453dabe4`; all workflows listed for this branch had completed. PR #50 remains open/draft against unchanged `main` `462b6d448c810485b597effcf3e60c708dbbd48e`. No concurrent branch run was active.
- Root cause confirmed in source: the standalone HTML embedded the model kit but left Three.js loaded from jsDelivr/unpkg/cdnjs. When all CDN imports failed, the runtime deliberately replaced the viewport with a simplified 2D fallback. This made the distributed “single-file” game network-dependent and could present as a 2D game on a disconnected or restricted mobile browser.
- Change: the standalone builder now uses esbuild to bundle Three.js 0.160.0 and the existing procedural model kit directly into the single HTML artifact. The standalone manifest records zero external runtime dependencies and `offline_3d_runtime: true`. The normal source page retains its CDN fallback strategy; the standalone game no longer needs it.
- Added runtime diagnostics for the actual Three.js revision, WebGLRenderer, PerspectiveCamera, perspective projection and WebGL capability. Added a dedicated offline browser gate that blocks all non-local network requests, verifies the real WebGL context and perspective camera, starts the mission, and captures desktop and 390×844 mobile gameplay screenshots.
- Workflow now installs the pinned Three.js version and esbuild before building, then runs the offline 3D browser gate before the existing desktop/mobile gameplay suite.
- Changed files: `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `scripts/build_single_html.mjs`, `scripts/validate_v94_bundle_browser.mjs` (new), `.github/workflows/openrts-build.yml`, and this log.
- Evidence boundary: this is an engine-delivery/runtime dependency correction, not yet proof of commercial-grade graphics or a complete native OpenRTS port. Exact-head build, offline WebGL browser screenshots, existing V94 gameplay tests and separate OpenRTS checks are pending.
- No merge, release or version created. No paid assets/APIs/services. Budget remains 0 €.


## Standalone V94 WebGL module-resolution hardening (2026-11-04)

- Exact-head workflow [41812469057](https://github.com/Ascameleon/Blue-alert/actions/runs/41812469057) on `ab748c2159f6fb72b928ce0fe5ae374b68377a46` built the 1.63 MB single-file HTML, but the offline browser gate timed out before `window.__BLUE_ALERTS_ENGINE__` and the WebGL canvas appeared. The run produced no desktop/mobile standalone screenshots; no offline-runtime or visual acceptance is claimed.
- The preceding exact-head browser gate did not preserve page errors, failed requests or the startup panel text, so the timeout did not establish whether module resolution or WebGL initialization was the immediate cause.
- Correction commit `7e7927fbde2344bef6417163f3ba89d4a06e3844` switched the standalone bundle to a static Three.js import and added startup diagnostics, but workflow [41813044389](https://github.com/Ascameleon/Blue-alert/actions/runs/41813044389) stopped in the builder before browser execution: the two new unresolved-import regular expressions were emitted with double-escaped backslashes and Node rejected the pattern as an unterminated group. The runtime and visual tests were skipped. The guard is being simplified to explicit line/specifier checks; this correction does not change game visuals.
- The builder guard correction is in commit `4205bbb5c985c95d2891b763085757a1b18df55b`. Exact-head workflow [41813279617](https://github.com/Ascameleon/Blue-alert/actions/runs/41813279617) passed prototype, V94 static, model-kit, scenario and standalone HTML build checks, then failed in the offline browser gate after renderer initialization: the mission-start click completed, but the combat QA simulation clock did not exceed 0.5 seconds within 10 seconds. The run did not reach screenshot capture or the separate OpenRTS stages. The test did not yet log the post-start QA state or page errors, so the cause is not established. This cycle adds those diagnostics and a failure screenshot.
- This is a standalone-delivery and test-diagnostics correction, not a claim of improved battlefield graphics. Exact-head revalidation remains required. No merge, version or release. Budget remains 0 €.

- The post-start diagnostic patch is committed as `b4dd2cbde5341a8845df3599f271a9443336b695` in `scripts/validate_v94_bundle_browser.mjs`. It explicitly verifies that the start overlay closes, captures the combat QA state, engine diagnostics, page errors, and a desktop/mobile failure screenshot if simulation time does not advance. This commit is part of the final candidate head; exact-head CI has not yet run on it.


## Exact-head offline WebGL evidence — 2026-11-04

- Candidate head `f7517ec700bc979e30126b318f7dabb35d7fa810` ran as workflow [41813749521](https://github.com/Ascameleon/Blue-alert/actions/runs/41813749521). Prototype, V94 static checks, model-kit checks, scenario preparation and standalone HTML bundling passed.
- The offline browser initialized bundled Three.js r160, `WebGLRenderer`, `PerspectiveCamera`, WebGL2, and a live canvas. No external requests, page errors or console errors were recorded. After the start click, the mission state was `started=true`, `frameCount=29`, `time=0.4749`, with the document visible and focused. The gate failed only because it required `time>0.5` within 10 seconds; the actual state was just below that threshold.
- Fresh desktop capture from this exact head: artifact `13313262978`, `v94-bundle/desktop-start-failure.png`. It is a real current-engine gameplay frame and was inspected against the accepted main baseline. It shows a closer opening camera and visible road/terrain wear and more defined tank surfaces, but the scene remains low-poly/stylized; this single desktop frame is not sufficient to accept a material overall visual upgrade or the V3 ridge. No mobile capture exists for this run.
- Calibration: the offline gate now requires the game to be started, at least 20 animation frames, and at least 0.4 seconds of simulation time. It still verifies live gameplay progression while avoiding a false failure from the slow software-WebGL frame cadence. This does not change game runtime visuals.
- Changed test file: `scripts/validate_v94_bundle_browser.mjs`. Exact-head rerun, mobile evidence and full gameplay/OpenRTS checks remain pending. No merge, release or version. Budget remains 0 €.

- Test calibration commit: `4645ccb206ba489389c32348958f157c486b633a`. The next workflow must run on the final PR head before this correction can be considered verified.

## Exact-head browser validation correction — 2026-11-04

- Inspected workflow [41817904848](https://github.com/Ascameleon/Blue-alert/actions/runs/41817904848) on exact PR #50 head `66c7064c7f92626764ed787141a17f09060e3720`. Prototype, V94 static checks, model kit, scenario preparation, standalone single-file build, offline bundled Three.js/WebGL checks, model preview, and the full desktop/mobile live-gameplay assertions ran successfully. The browser step then failed at its final `successfulThree.length > 0` assertion; the suite had already captured the live desktop/mobile gameplay and visual A/B evidence.
- Root cause: the browser test still inferred Three.js availability from a successful network response to `three.module.js`, but the tested standalone HTML now embeds Three.js r160 into the same file. A successful bundled module intentionally produces no CDN/module network response. The game itself exposed `window.__BLUE_ALERTS_ENGINE__`, rendered a live WebGL canvas, and completed the gameplay assertions, so the network-only assertion was invalid.
- Replaced that network-only success check with explicit runtime assertions on both desktop and 390×844 mobile: engine identity, Three.js revision 160, `WebGLRenderer`, `PerspectiveCamera`, perspective projection, WebGL2 parity and supported texture size. The test now verifies the engine actually running rather than requiring a CDN request. No game runtime, terrain, model, combat, movement or balance code was changed.
- Inspected current-engine screenshots from artifact [13316890561](https://github.com/Ascameleon/Blue-alert/actions/runs/41817904848/artifacts/13316890561): `v94-browser/desktop-v94-gameplay.png`, `mobile-v94-gameplay-390x844.png`, `desktop-v94-sculpted-terrain.png`, `mobile-v94-sculpted-terrain-390x844.png`, and desktop/mobile `terrain-microrelief-{baseline,detail}` pairs. The heightfield's broad relief remains weak at tactical zoom; the normal/roughness A/B difference is subtle and does not materially transform the battlefield. The V3 terrain candidate is therefore **not visually accepted** and does not authorize a version or release. The running game remains visibly stylized/low-poly; commercial-grade quality is not established.
- The failed workflow stopped before the separate OpenRTS build, native graphical launch and native input checks. Those results are unknown, not passed. Mobile screenshots are browser emulation, not a physical Samsung capture. Exact screenshot files are preserved in the workflow artifact; no generic or generated imagery was used.
- Changed files in this correction: `scripts/validate_v94_browser.mjs` and `docs/EVOLUTION_LOG.md`. Next gate: run the complete workflow on the resulting exact head, inspect its job logs and fresh desktop/mobile captures, then evaluate OpenRTS separately. No merge, game version or release. No paid assets, APIs or services; budget remains 0 €.



## Domain-warped V94 battlefield field strata candidate (2026-11-04)

- Working branch: `art/v94-terrain-pbr-relief-20261103`; parent head: `b3d0cc758e8b143c72bfb70d3746f69ca5eb85bb`; PR #50 remains the sole terrain integration candidate.
- Replaced the low-contrast, uniform terrain vertex palette with deterministic domain-warped dry-grass, compacted-soil and exposed-stone strata. The existing V3 heightfield, slope-linked bedrock, PBR normal/roughness maps, unit grounding and gameplay contracts are preserved.
- The field palette fades out across the central supply road and all `TERRAIN_FLAT_ZONES`, keeping the authored build pads and industrial clearances visually restrained. It changes terrain colour only; no movement, collision, placement, unit or combat logic is changed.
- Added live runtime coverage/checksum diagnostics and desktop 1440×900 plus mobile 390×844 A/B screenshots at the normal gameplay camera. Each pair restores the accepted baseline and applies the field strata without changing camera pose.
- Changed files: `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `scripts/validate_v94.py`, `scripts/validate_v94_browser.mjs`, and this log. No external assets, paid APIs, credits or services; budget remains 0 €.
- Status: exact-head validation and screenshot inspection are pending. This is a candidate visual improvement, not an accepted release, not a new game version, and not evidence of commercial-grade quality. The exact commit SHA and artifact paths will be appended only after the final-head workflow has completed and its captures have been inspected.


## Field-strata validation correction (2026-11-04)

- Implementation commit: `82deeba4ce3d4098672325ab0e1a34e627917628` on `art/v94-terrain-pbr-relief-20261103`.
- Exact-head workflow [41838318598](https://github.com/Ascameleon/Blue-alert/actions/runs/41838318598) stopped in `scripts/validate_v94.py` before browser rendering. The static validator expected optional chaining on the A/B detail variable, while the browser test correctly used a direct property after asserting the object exists. No screenshot artifact was produced; the browser, standalone gameplay and OpenRTS stages were skipped, not passed.
- Corrected the two validator tokens to match the actual desktop/mobile A/B assertions and made the failure message describe the missing browser contract generically. No runtime or model code changed in this correction.
- Exact final-head validation and fresh desktop/mobile screenshot inspection are still required. The field-strata candidate remains unaccepted; no version or release.


## Field-strata runtime initialization correction (2026-11-04)

- Exact-head workflow [41838947496](https://github.com/Ascameleon/Blue-alert/actions/runs/41838947496) passed the prototype, V94 static validation, model kit, skirmish preparation and standalone HTML build, then failed in the offline bundled-WebGL browser gate before mission start. The runtime error overlay intercepted the start button; the only uploaded artifact, [13326004699](https://github.com/Ascameleon/Blue-alert/actions/runs/41838947496/artifacts/13326004699), was a 594-byte empty smoke-test ZIP, not screenshot evidence.
- Root cause: the terrain geometry's color BufferAttribute referenced `terrainFieldColors` before the array was initialized. The new field palette had been inserted after the existing geometry setup. Moved the color-attribute binding to immediately after the field array and its diagnostics are created.
- Added a short post-initialization settle and explicit runtime/startup overlay assertions to the offline browser gate, so any future startup exception is reported with its actual message instead of a 30-second click-interception timeout.
- No screenshots, gameplay assertions or OpenRTS/native stages were completed on this head. The field-strata candidate remains unaccepted; no version or release.


## Exact-head validation and visual audit — ccf794e15602f0893863e4fe0c7773c4b7c31c11 (2026-11-04)

- Workflow [41839589276](https://github.com/Ascameleon/Blue-alert/actions/runs/41839589276) completed successfully on this exact PR #50 head. All 25 workflow steps passed: repository/V94/model-kit/scenario checks, standalone single-file HTML build, offline bundled Three.js r160/WebGL, desktop and 390×844 mobile model preview and live gameplay, separate OpenRTS Java 21 build/launch, 12/12 native unit movement, and native mouse selection/move/attack.
- Exact-head artifacts: graphical evidence [13330026718](https://github.com/Ascameleon/Blue-alert/actions/runs/41839589276/artifacts/13330026718); standalone playable HTML [13328378794](https://github.com/Ascameleon/Blue-alert/actions/runs/41839589276/artifacts/13328378794). Graphical screenshot paths include `v94-browser/desktop-v94-gameplay.png`, `mobile-v94-gameplay-390x844.png`, desktop/mobile `*-woodland-tree-{baseline,detail}*`, `*-gameplay-field-{baseline,detail}*`, `*-terrain-microrelief-{baseline,detail}*`, `*-headquarters-surface-{baseline,detail}*`, and the infantry gait/tank armor close-ups. Standalone offline WebGL captures are `v94-bundle/desktop-standalone-webgl.png` and `mobile-standalone-webgl.png`.
- Inspected the actual V94 desktop/mobile captures. The field-strata and micro-relief A/B changes remain too subtle at tactical camera scale; the HQ surface A/B is nearly indistinguishable. The V3 conifer has curved branch structure, but its dodecahedral spray clusters still read as rounded foliage masses. The existing soldier and tank assets are more complete than placeholders but remain visibly stylized/procedural. No commercial-grade visual claim is justified; the terrain candidate is not accepted as a material release-level improvement.
- OpenRTS is a separate native engine: its build and graphical launch succeeded; scenario report validates an 80×80 map with 12 units. The movement smoke test recorded 12/12 moved. Interactive log recorded native tank selection, a 3.56-unit movement, enemy health 120→119 after attack, and `PASS selection+move+attack`. Evidence: `openrts-screen.png`, `openrts-interactive-screen.png`, `openrts-launch.log`, `openrts-interactive-launch.log`. OpenRTS does not import the V94 Three.js assets.
- Changed files in the tested ccf794e commit: `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `scripts/validate_v94_bundle_browser.mjs`, and `docs/EVOLUTION_LOG.md`. The exact workflow reported success; non-blocking Node deprecation notices and 100 legacy Java compiler warnings were present. No uncaught OpenRTS exception was recorded.
- Evidence boundaries: 390×844 is browser emulation, not a physical Samsung test. The V94 web runtime and native OpenRTS evidence are separate. No merge, game version or release was created; budget remains 0 €.

## First exact-head validation failure — b600dd4023e5dfcb830f00928b08e3d9869c7e7b (2026-11-04)

- Workflow [41846650072](https://github.com/Ascameleon/Blue-alert/actions/runs/41846650072) completed with failure in `Validate BLUE ALERTS v94 3D prototype`, before browser rendering, standalone build or OpenRTS. No screenshot artifacts were produced.
- Exact error: the static tree contract still required `new THREE.Quaternion()` and `new THREE.DodecahedronGeometry(1, 0)`. Those tokens belonged to the removed rounded dodecahedral cluster implementation; the intermediate V1 candidate used five flat tapered blades per cluster; V1 was not rendered or accepted. This was a stale validator contract, not a browser/runtime failure.
- Correction commit `19f8095bcc26a0062684923fc95de816aa9acab6` replaced those obsolete assertions with the fan-basis and `needleBladeCountPerCluster = 5` contracts. That validator/docs-only head did not produce a workflow run; the next runtime-bearing commit triggers exact-head validation.


## V94 woodland canopy — 3D ridge-needle candidate (2026-11-04)

- V2 supersedes the unrendered V1 candidate: four tapered blades per existing spray cluster, each with paired front/back facets meeting at a shallow ridge. This avoids flat camera-dependent leaf cards while preserving the existing branch skeleton and instance layout.
- Expected diagnostics: 504 blades, 32 triangles per cluster, approximately 5,040 total foliage triangles (1,008 branch triangles + 4,032 needle triangles). Browser checks bound the result to 3,200–5,200 triangles and assert the exact profile on desktop and mobile.
- Changed files in this candidate commit: `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `scripts/validate_v94.py`, `scripts/validate_v94_browser.mjs`, and `docs/EVOLUTION_LOG.md`. Exact commit SHA, workflow result, screenshot artifact paths and visual verdict will be recorded after exact-head validation.
- This remains a candidate, not an accepted visual improvement. Fresh desktop and 390×844 mobile captures from the exact V2 head are required; inspect the same-camera legacy/detail tree pair before acceptance. Browser mobile is emulation, not a physical Samsung test. OpenRTS remains separate. Budget: 0 €.


## V94 conifer canopy — dense terminal-leader candidate (2026-11-04)

- Exact-head workflow [41848250640](https://github.com/Ascameleon/Blue-alert/actions/runs/41848250640) succeeded on prior head `4d8a04f7a99972f185bc5c235afc15736716a49b`: repository/V94/model-kit/scenario validation, standalone offline Three.js r160/WebGL build, desktop and 390×844 mobile model preview/gameplay, OpenRTS Java 21 build/launch, 12/12 native unit movement, and native selection/move/attack all passed.
- Inspected current-runtime desktop/mobile tree A/B captures from artifact [13336035035](https://github.com/Ascameleon/Blue-alert/actions/runs/41848250640/artifacts/13336035035): `v94-browser/desktop-v94-woodland-tree-{baseline,detail}.png` and `v94-browser/mobile-v94-woodland-tree-{baseline,detail}-390x844.png`. Rejected the V2 detail: the long, sparse sprays read as palm-like radial fronds rather than a dense, tapered conifer canopy. The normal gameplay desktop/mobile captures still show a broad, stylized battlefield; this tree change is not a release-level visual improvement.
- New V3 candidate reshapes the same instanced tree asset rather than adding scenery: six shorter 3D needle blades per cluster, denser overlapping sprays along the existing 21 curved boughs, and one tapered central leader with three terminal sprays to close the apex. Expected shared geometry budget is 7,248 triangles (1,008 bough + 48 leader-stem + 6,192 needle triangles), 774 blades, 129 clusters, one leader stem and three leader sprays.
- Preserved the existing tree instance transforms/counts, trunk geometry/material, four bough whorls, 21 radial arms, collision/pathing, three render groups, gameplay and combat contracts. No paid assets, APIs, credits or services.
- Changed files: `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `scripts/validate_v94.py`, `scripts/validate_v94_browser.mjs`, and this log. Regression checks require the six-blade/leader profile and exact 7,248-triangle geometry on desktop and 390×844 mobile; the browser suite captures same-camera legacy/detail pairs at `v94-browser/desktop-v94-woodland-tree-{baseline,detail}.png` and `v94-browser/mobile-v94-woodland-tree-{baseline,detail}-390x844.png`, plus normal desktop/mobile gameplay.
- Implementation commits: runtime `a69eeb5594bc5dedd5c7b84577df98219798a2a9`; static validator `f2351a07d0c804ef49e4014574463aeace332a24`; desktop/mobile browser tests `a0f215595462cb8c43a3c14f3ec139ccc08f0f83`. Candidate branch continues directly from `4d8a04f7a99972f185bc5c235afc15736716a49b`.
- Status: candidate only. Fresh exact-head workflow, screenshot inspection, and separate OpenRTS/native verification remain required. Browser mobile is emulation, not a physical Samsung test. No merge, game version, release or commercial-grade claim is authorized. Budget remains 0 €.


## V3 candidate validation correction — exact-head failure and fix (2026-11-04)

- First candidate head `7855e6945ea7a70c6784949f2a8bd78cce6f225c` triggered workflow [41851572663](https://github.com/Ascameleon/Blue-alert/actions/runs/41851572663), which failed in `Validate BLUE ALERTS v94 3D prototype` before browser rendering or OpenRTS. Exact error: an unterminated Python string in the new static leader-profile assertion at `scripts/validate_v94.py:316`. Prototype syntax and the earlier setup/patch steps passed; no screenshot artifact was produced.
- Corrected the closing quote in validator commit `f2a11552eaab506e6a97e5545388cb4e3cc04109`. No runtime geometry change was made in this correction.
- The final candidate head must rerun the full workflow; expected fresh evidence paths are `v94-browser/desktop-v94-woodland-tree-{baseline,detail}.png`, `v94-browser/mobile-v94-woodland-tree-{baseline,detail}-390x844.png`, `v94-browser/desktop-v94-gameplay.png`, `v94-browser/mobile-v94-gameplay-390x844.png`, and the separate `openrts-graphical-smoke-test` artifact.
- No branch writes will occur while that exact-head validation is pending or in progress. No merge, version or release. Budget remains 0 €.


## V3 exact-head gameplay validation — focused-tree assertion correction (2026-11-04)

- Exact-head workflow [41851932130](https://github.com/Ascameleon/Blue-alert/actions/runs/41851932130) passed prototype/static V94 validation, model-kit and scenario validation, standalone offline Three.js r160/WebGL, desktop/mobile model previews, and desktop gameplay progression through objectives, projectile impact, unit death, explosion lifecycle, building damage stages and infantry gait. It failed at `scripts/validate_v94_browser.mjs:596` before the focused desktop/mobile tree A/B captures.
- The failure was a stale QA equation: `needleClusters === branchArms * 6` still assumed only the 126 bough clusters, while the new three terminal-leader sprays correctly raise the total to 129. The focused-tree assertion also retained the previous 3,200–6,000 triangle bound, while the candidate geometry is explicitly 7,248 triangles. No runtime exception was reported before that assertion.
- Artifact [13336770177](https://github.com/Ascameleon/Blue-alert/actions/runs/41851932130/artifacts/13336770177) contains `v94-browser/desktop-v94-gameplay.png` and `v94-browser/desktop-v94-infantry-gait.png`, plus the separate model-preview captures. The focused tree baseline/detail files and mobile gameplay screenshots are absent because the desktop tree assertion stopped the suite. The desktop gait capture still reads as a sparse, frond-like canopy at this camera angle; V3 is not visually accepted.
- Corrected the focused desktop/mobile assertions to account for the three leader clusters and exact 7,248-triangle geometry, and added static checks for both viewport contracts. Fresh exact-head desktop/mobile tree A/B captures and a new visual comparison remain mandatory. No version, release, merge or commercial-grade claim. Budget remains 0 €.


## V4 exact-head visual rejection and V5 drooping spruce crown candidate (2026-11-04)

- Exact-head workflow 41853587277 succeeded on commit feb8bc25ed0a544d0df99a955e370a597380f144. All 25 workflow steps passed: repository/V94/model-kit/scenario checks, standalone single-file HTML, offline Three.js r160/WebGL, desktop and 390×844 mobile model previews and live gameplay, separate OpenRTS Java 21 build/launch, 12/12 native unit movement, and native selection/move/attack.
- Exact-head graphical artifact 13337237370 contains v94-browser/desktop-v94-woodland-tree-baseline.png, v94-browser/desktop-v94-woodland-tree-detail.png, mobile-v94-woodland-tree-baseline-390x844.png, mobile-v94-woodland-tree-detail-390x844.png, desktop/mobile gameplay and infantry-gait captures, plus terrain, road, headquarters, industrial-yard, building-damage and combat-effect evidence. The standalone playable HTML is artifact 13336627956.
- Inspected the real same-camera tree A/B captures at desktop and mobile sizes. The current DENSE_LAYERED_CONIFER_V4 detail remains a palm-like radial canopy: the boughs read as horizontal fronds, the central leader remains exposed, and the lower trunk is largely bare. It is distinguishable from the legacy three-cone baseline, but it is not a convincing conifer and is rejected for visual acceptance. No release-level improvement is claimed.
- The same run's separate openrts-graphical-smoke-test artifact contains openrts-screen.png, openrts-interactive-screen.png, openrts-launch.log, openrts-interactive-launch.log and blue-alerts-scenario-report.json. Native OpenRTS loaded the 80×80 scenario with 12 units, moved 12/12, and passed native selection, movement and attack. This is separate from the V94 Three.js runtime and does not prove that V94 assets run inside OpenRTS.
- New V5 candidate reshapes the existing shared tree geometry rather than adding tree instances or scenery: five descending whorls retain 21 boughs; lower boughs start at 0.56 units and droop 0.42 units; four spray stations per bough feed eight tapered three-sided needlelets per cluster; four radial leader levels cover the central stem from four directions. The needles use narrow triangular cross-sections and darker spruce-green vertex colors instead of broad faceted leaf blades.
- Expected shared geometry budget: 6,944 triangles (1,008 bough + 48 leader stem + 5,888 needle triangles), 1,472 tapered needlelets, 184 clusters, 21 boughs, five whorls, four spray stations per bough and 16 leader clusters. The same trunk/foliage InstancedMesh groups, tree transforms/counts, collision/pathing, gameplay and combat contracts remain unchanged.
- Regression checks are updated to require the exact V5 profile and geometry diagnostics on desktop and 390×844 mobile, including lower-branch height/drop, needle cross-section ratio, leader coverage and triangle budget. Fresh exact-head desktop/mobile A/B captures and live gameplay checks are mandatory before visual acceptance. Mobile remains browser emulation, not a physical Samsung test. OpenRTS remains a separate native engine. Candidate only: no merge, game version, release or commercial-grade claim. Budget remains 0 €.
