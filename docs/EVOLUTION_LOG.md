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


## Cycle — compact mobile battlefield HUD (2026-11-03)

- Base: accepted `main` at `462b6d448c810485b597effcf3e60c708dbbd48e`; new focused branch: `fix/v94-mobile-hud-compact-20261103`.
- The supplied Samsung gameplay capture showed the mobile top bar wrapping its title, a separate selection-mode pill, a five-button command row, a redundant HQ badge, and a tall mission card stacked over the battlefield. This consumed too much vertical play space before the bottom build dock.
- Reworked only the mobile HUD layout in `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`: one-line brand/status header, hidden redundant mode pill and HQ badge, retained all five command buttons at the existing 44px minimum touch height, moved the mission card directly below the command row, and reduced its objective detail to one readable clipped line. Mission feedback toast now starts below the compact objective card. Desktop layout and game simulation contracts are unchanged.
- Added browser assertions for the exact mobile HUD geometry, visible header pills, command touch targets, HQ badge suppression, mission clearance and objective text overflow. Added fresh 390×844 current-engine capture `mobile-v94-hud-compact-390x844.png`.
- Changed files: `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `scripts/validate_v94_browser.mjs`, and `docs/EVOLUTION_LOG.md`.
- Exact-head workflow, standalone build, desktop/mobile rendering and OpenRTS checks are pending. No visual acceptance or release is claimed until the new mobile gameplay screenshot is inspected against the supplied baseline. Browser emulation is not a physical Samsung test.
- No new assets, paid APIs, credits or services; budget remains 0 €. No existing branch or accepted runtime was replaced.


### Exact-head workflow #41551375750 — mobile HUD branch validation diagnosis (2026-11-03)

- Exact tested head: `673797b71f8a53f91e2efbb93c8a011456b0be51` on `fix/v94-mobile-hud-compact-20261103`; GitHub Actions [run 41551375750](https://github.com/Ascameleon/Blue-alert/actions/runs/41551375750), attempt 1 and its retry both failed before reaching the new mobile HUD geometry assertions.
- Prototype, V94 static validation, model-kit validation, scenario validation, standalone HTML build and desktop/mobile model-preview rendering passed. The playable-game browser stage began and exercised mission objectives, combat VFX, unit death and explosion lifecycle.
- Both attempts timed out at the second desktop VFX drain immediately before controlled building-damage QA (`scripts/validate_v94_browser.mjs`, post-combat-rig wait). The earlier dedicated desktop combat-VFX lifecycle assertion in the same run had already reached zero active projectiles, muzzle flashes, explosions, impact rings and sparks. The later post-rig wait redundantly required impact rings/sparks to be zero again, even though those short-lived particles do not interfere with the controlled building-damage projectile sequence. This failure occurred before the new compact-HUD checks and before gameplay artifact upload, OpenRTS build and native interaction tests.
- Correction: retain the strict ring/spark natural-expiry assertions in the dedicated desktop and mobile VFX lifecycle probes. Narrow only the later post-rig isolation gate to active projectiles, model projectiles, muzzle flashes and model explosions; add a timeout state dump. This preserves the VFX lifecycle test rather than weakening it.
- Files changed in this follow-up: `scripts/validate_v94_browser.mjs` and `docs/EVOLUTION_LOG.md`. The mobile HUD HTML/CSS remains unchanged.
- The exact commit and fresh screenshot artifact paths will be recorded after the next exact-head workflow completes. No mobile HUD visual acceptance is claimed yet; no game version/release is created. Budget remains 0 €.


- Exact test-correction commit: `1d409c241d003977306e654ecb1cfd25c8d1ee90`. It retains the compact mobile HUD CSS from `673797b71f8a53f91e2efbb93c8a011456b0be51` and changes only the post-rig browser-test isolation plus this log. The follow-up validation must run against the final branch head created by this documentation update; no further branch writes are permitted until that workflow completes.


### Compact mobile HUD — stale assertion correction (2026-11-03)

- Exact-head workflow [41553206890](https://github.com/Ascameleon/Blue-alert/actions/runs/41553206890) completed the standalone HTML build, desktop/mobile model previews, desktop gameplay, mission completion, combat/VFX lifecycle and building-damage stages, then failed only at the legacy mobile assertion requiring the separate `#mobileHQBadge` to be visible below the command dock.
- That assertion contradicted the deliberate compact-HUD CSS, which hides the redundant badge (`display:none`) to reclaim battlefield space. The new geometry probe immediately above had already verified the intended state: 36px top bar, 44px command row, 44.5px mission card at y=88–132.5, and the HQ badge hidden.
- Inspected the exact-runtime screenshot from artifact [13193433407](https://github.com/Ascameleon/Blue-alert/actions/runs/41553206890/artifacts/13193433407), `v94-browser/mobile-v94-hud-compact-390x844.png`. It confirms the compact header, all five 44px touch controls, compact mission objective and substantially larger unobstructed battlefield region compared with the supplied Samsung baseline. This is a mobile usability/layout improvement only; it is not evidence of a graphical asset upgrade or commercial-grade visual quality.
- Corrected the obsolete assertion to require the HQ badge to stay hidden while retaining the command dock. No gameplay/runtime code or combat contract changed. The strict mission, toast-clearance, build-placement, combat and VFX assertions remain intact.
- Test-correction commit: `61ec9c35230f38e1ab052cafcd1b152d1c6cb040` (parent of this final documentation head). Changed files: `scripts/validate_v94_browser.mjs` and `docs/EVOLUTION_LOG.md`. The final documentation head must receive a fresh exact-head workflow; OpenRTS/native checks did not run after the prior browser failure.
- Evidence boundary: the screenshot is 390×844 Chromium emulation, not a physical Samsung capture. Budget remains 0 €; no version/release is created.
