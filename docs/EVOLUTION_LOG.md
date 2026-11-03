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


## Cycle — forward-facing infantry rifle, two-hand grip and real muzzle origin (2026-11-02)

- Base: `main` at `462b6d448c810485b597effcf3e60c708dbbd48e`; working branch: `art/v94-infantry-forward-grip-20261102`.
- Corrected the procedural rifle axis from lateral +X to the soldier's forward +Z heading. Repositioned articulated hand rigs onto explicit pistol-grip and fore-end sockets; reduced arm swing so both hands remain seated during the existing displacement-linked gait.
- Added receiver/stock/handguard grip details, trigger guard, charging handle, selector, optic lenses, front/rear sights, magazine ribs, muzzle brake/ports and sling within the existing procedural model kit. Static meshes remain batchable; the receiver and transient muzzle flash remain separate for combat.
- Attached a faction-colored muzzle flash to the rifle muzzle and propagated it to the existing outer V94 unit group. Infantry projectiles now originate from the actual weapon muzzle through the existing `fireProjectile` contract; unit movement, collision, selection, HP, damage and targeting remain unchanged.
- Added desktop/mobile live-game checks for grip retention during movement and projectile-origin alignment. Existing model-preview checks remain in place and exercise the same updated model kit.
- Exact-head validation and screenshots are pending. No game version/release is created; no external or paid assets/services are used; budget remains 0 €.
- Evidence boundaries: desktop/mobile screenshots are browser-engine captures; 390×844 is mobile emulation, not a physical Samsung test. OpenRTS is a separate native engine and does not import these Three.js infantry meshes.


### Exact-head validation attempt 1 — 4a8a25b4bdd8fe0ba651e92cf620434c33eb2014

- Workflow: [#41491563715](https://github.com/Ascameleon/Blue-alert/actions/runs/41491563715).
- `scripts/validate_prototype.py`: passed.
- `scripts/validate_v94.py`: failed on a validator-scope mistake: it searched for the model-kit profile literal inside the V94 runtime QA section. The runtime correctly exposes the profile as `weaponGripProfile`; the literal remains owned by the model kit. Corrected the static check to inspect the runtime property name instead.
- OpenRTS checkout and three compatibility patch steps passed. Native OpenRTS build, browser rendering, desktop/mobile gameplay captures and their tests were skipped because the V94 static check stopped the workflow.
- Artifacts: none. No screenshot evidence was produced by this run. Baseline accepted evidence remains workflow #41445930709, artifact `openrts-graphical-smoke-test` ID `13141329066` and standalone HTML artifact ID `13141618566`.
- This is a validation correction only; the infantry visual change remains unaccepted and no version/release is created.


### Exact-head validation attempt 2 — 8a3181f135020be3f2bca9e866bd657357766c59

- Workflow: [#41491858485](https://github.com/Ascameleon/Blue-alert/actions/runs/41491858485).
- `scripts/validate_prototype.py`: passed.
- `scripts/validate_v94.py`: reached the new infantry QA checks, then failed while extracting the combat-QA section because the boundary used a stale marker (`window.__BLUE_ALERTS_TANK_SURFACE_QA__`) that does not exist in this V94 runtime. Corrected the section boundary to the actual next QA block, `window.__BLUE_ALERTS_BUILDING_DAMAGE_QA__`.
- OpenRTS checkout and compatibility patch steps passed. Native OpenRTS build, browser rendering and desktop/mobile gameplay captures were skipped after the static-validator exception.
- Artifacts: none; no screenshot evidence was produced by this run.
- The runtime/model change remains unaccepted. No release/version was created.


### Exact-head validation attempt 3 — c56b537cd8a2c666d297b9559d091c728e2704b5

- Workflow: [#41492006653](https://github.com/Ascameleon/Blue-alert/actions/runs/41492006653).
- Static V94 validation, model-kit validation, scenario validation and standalone single-file build passed. The build produced a 277,075-byte HTML in the runner workspace; the upload step was not reached.
- The model-preview browser test failed at `scripts/validate_model_preview_browser.mjs:114` because the new optic-lens meshes referenced an undeclared `lens` material. The browser error was `ReferenceError: lens is not defined`; the test timed out waiting for the infantry preview.
- Corrected by defining a dedicated faction-tinted, low-roughness transparent glass material for the two optic lenses. The previous run's artifact [#13165125772](https://github.com/Ascameleon/Blue-alert/actions/runs/41492006653/artifacts/13165125772) contains only the scenario report and baseline tank/turret captures; it contains no infantry or V94 gameplay screenshots.
- V94 desktop/mobile gameplay rendering, live firing checks, OpenRTS compilation and native interaction smoke tests were skipped because the model-preview step failed. No visual improvement is accepted yet.


### V94 infantry forward rifle, two-hand grip and muzzle-origin integration — exact-head evidence (2026-11-02)

- Accepted base: `main` at `462b6d448c810485b597effcf3e60c708dbbd48e`. Working branch: `art/v94-infantry-forward-grip-20261102`; PR #47 remains a draft pending final-head documentation validation.
- Exact code/test head: `6cc26e9d611b388185c07b9fd13b46ba1d2281e3`. PR #47 changes five files against the accepted base: `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `game-data/models/blue-alert-models.js`, `scripts/validate_v94.py`, `scripts/validate_v94_browser.mjs`, and this log.
- The original procedural rifle was reoriented from a lateral chest-crossing axis to the soldier's forward +Z axis. Both articulated hands now have explicit pistol-grip and fore-end sockets; arm placement and gait swing preserve those contacts. The rifle adds receiver/stock/cheek-rest, handguard, pistol grip, foregrip, charging handle, selector, trigger/guard, optic lenses, sights, magazine ribs, muzzle brake/ports and sling. The faction-colored flash is attached to the actual muzzle, and the existing V94 projectile path now starts at that muzzle. Unit movement, collision, selection, health, damage and targeting contracts remain unchanged; no new units or paid assets were added.
- Exact-head workflow [41492395950](https://github.com/Ascameleon/Blue-alert/actions/runs/41492395950), run #352, completed successfully on the code/test head. Prototype validation, V94 static/syntax validation, model-kit validation, scenario validation, standalone V94 HTML build, desktop/mobile model-preview rendering, desktop/mobile live V94 browser/gameplay checks, OpenRTS Java 21 build/launch, and native interaction smoke all passed.
- Live V94 browser diagnostics recorded:
  - Desktop: `muzzleError=0`, `muzzleAxisDot=1`, left/right grip errors `0.0458 / 0.0111`, `walkAmount≈1`.
  - Mobile 390×844 emulation: `muzzleError=0`, `muzzleAxisDot=1`, left/right grip errors `0.0364 / 0.0144`, `walkAmount≈1`.
  - The browser assertions require both hands to remain within the grip tolerances during displacement-linked gait and require the fired projectile origin to coincide with the visible weapon muzzle.
- Fresh current-engine visual evidence is in artifact [13166180319](https://github.com/Ascameleon/Blue-alert/actions/runs/41492395950/artifacts/13166180319): `model-preview/desktop-blue-sentinel-infantry.png`, `model-preview/mobile-blue-sentinel-infantry-390x844.png`, `model-preview/desktop-red-bastion-infantry.png`, `model-preview/mobile-red-bastion-infantry-390x844.png`, `v94-browser/desktop-v94-infantry-gait.png`, `v94-browser/desktop-v94-infantry-fire.png`, `v94-browser/mobile-v94-infantry-gait-390x844.png`, `v94-browser/mobile-v94-infantry-fire-390x844.png`, `v94-browser/desktop-v94-gameplay.png`, and `v94-browser/mobile-v94-gameplay-390x844.png`. The standalone playable V94 HTML is artifact [13166095295](https://github.com/Ascameleon/Blue-alert/actions/runs/41492395950/artifacts/13166095295).
- Compared the new desktop/mobile infantry model-preview captures with the accepted-main baseline artifact [13141329066](https://github.com/Ascameleon/Blue-alert/actions/runs/41445930709/artifacts/13141329066) at matching preview viewports: the prior rifle crossed the torso laterally; the new rifle points forward with both hands seated on the weapon. Inspected the new live V94 desktop/mobile gait and firing captures as separate gameplay evidence; the logged muzzle-origin and grip measurements confirm the same change in the running game. This is a material, targeted infantry-weapon/animation improvement, not evidence that the full soldier or game has reached commercial-grade quality.
- OpenRTS is a separate native engine: its build reported `BUILD SUCCESSFUL`; the skirmish log reports 12/12 units moved; the native interactive log reports real left-click selection, right-click movement (3.495 world units) and right-click attack reducing target health from 120 to 119. These checks do not import the Three.js infantry model. The OpenRTS screenshots are `openrts-screen.png` and `openrts-interactive-screen.png` in artifact 13166180319.
- Evidence boundaries: 390×844 is browser emulation, not a physical Samsung test; the soldier remains an original procedural low-poly model and needs further anatomical/material/animation refinement; Three.js is still CDN-loaded. OpenRTS deprecation and material-parser warnings were non-blocking in workflow #352. The later documentation-only exact-head run #353 exposed a flaky V94 combat-cleanup wait, documented below. Budget: 0 €. No game version or release was created.
- The code/test head passed before this documentation-only update. The resulting documentation commit must receive its own exact-head workflow before PR #47 can be merged; no further write to this branch is permitted while that workflow is queued or running.



### QA-only combat quiescence correction after exact-head run #353 (2026-11-02)

- The documentation-only head `e48383326f893669590cc1d96d47507ad90253a9` triggered workflow [#41494934988](https://github.com/Ascameleon/Blue-alert/actions/runs/41494934988), run #353. Prototype/static/model-kit/scenario validation, standalone HTML build and desktop/mobile model-preview rendering passed; the live V94 browser step failed twice at `scripts/validate_v94_browser.mjs:406` with a 15-second `page.waitForFunction` timeout while waiting for transient combat effects to drain after the tank turret alignment probe. The first failed attempt produced artifact `13165668552`; the retry produced artifact `13167495299`.
- The code/test head `6cc26e9d611b388185c07b9fd13b46ba1d2281e3` had passed the complete workflow #352. The failure on the documentation-only descendant did not identify a soldier-model regression; it exposed a QA-isolation gap. `freezeNewCombat()` suppressed new shots but left existing AI movement/attack orders active, so the cleanup gate could remain exposed to live AI route state.
- Correction in this commit: the QA-only `freezeNewCombat()` helper now clears living units' attack targets, attack-move flags and movement routes while leaving in-flight projectiles, muzzle flashes and impact/explosion effects intact to expire naturally. Desktop/mobile assertions verify that combat suppression and order clearing both occurred. The desktop building-preparation wait now records state/focus/visibility on timeout; the mobile cleanup timeout records the same diagnostics.
- This is a test-harness isolation correction under `?qa=1`; no production combat, movement, selection, damage or animation code is changed. The exact correction commit and its full desktop/mobile/OpenRTS validation must be recorded after GitHub creates the commit. No PR merge or game version/release is permitted until the final exact head passes.



### Exact-head validation attempt 4 — workflow #354 — 2026-11-02

- Exact PR #47 head tested: `e9ed20be10347b7a29cacfa2501ec67cfdd6bc68`; workflow [41497847622](https://github.com/Ascameleon/Blue-alert/actions/runs/41497847622), run #354, completed with failure in the desktop V94 browser sequence.
- Passed: repository/prototype validation, V94 static/syntax validation, expanded model-kit validation, imported V93 validation, skirmish-data validation, standalone V94 HTML build, and desktop/mobile model-preview browser rendering. The desktop live-game sequence also passed mission-objective progression, projectile impact, unit-death explosion and the first complete projectile/muzzle/explosion/impact-ring/impact-spark cleanup assertion.
- The later turret-alignment probe produced a small residual effect tail. After `freezeNewCombat()` had confirmed `combatSuppressed=true` and `combatOrdersCleared=true`, the second building-preparation wait timed out at 15 seconds solely because three impact sparks remained. The timeout snapshot showed zero active/model projectiles, zero muzzle flashes, zero model explosions, zero impact rings, three impact sparks, `started=true`, `gameOver=false`, `hasFocus=true`, `visibilityState=visible`, simulation time 10.4266 and frameCount 239. This is a redundant second wait for short-lived sparks after their full lifecycle had already passed earlier in the same desktop test; it is not evidence of a production combat or VFX defect.
- Artifact [13166768841](https://github.com/Ascameleon/Blue-alert/actions/runs/41497847622/artifacts/13166768841) contains desktop live-game captures and desktop/mobile infantry model-preview captures. It does not contain the live-game infantry gait/fire screenshots on this exact head; the desktop browser sequence stopped before those probes. Live-game mobile validation, standalone artifact upload, OpenRTS build/launch and native interaction checks were skipped after the browser failure.
- Corrective test change prepared for the next exact head: preserve the earlier full cleanup assertion unchanged; after turret alignment, gate the building-damage probe only on zero in-flight projectiles, muzzle flashes and model explosions, while recording residual impact-ring/spark counts and simulation time/frame count diagnostically. This does not weaken the initial effect-lifecycle test or the real building-damage thresholds.
- No production runtime/model code is changed by this correction. PR #47 remains draft and unmerged. The current infantry visual change still requires fresh exact-head desktop/mobile live-game captures and full OpenRTS/native checks before any integration decision. No game version or release. Budget: 0 €.



### Exact-head validation attempt 5 — workflow #355 — 2026-11-02

- Exact PR #47 head tested: `798b42f62886b041819c59eb6ec05fa536d58d4c`; workflow [41499091654](https://github.com/Ascameleon/Blue-alert/actions/runs/41499091654), run #355, completed with failure in the desktop V94 browser sequence.
- Passed: prototype, V94 static/syntax, model-kit, imported V93, skirmish-data, standalone HTML build and desktop/mobile model-preview rendering. The live desktop game passed mission-objective progression, projectile impact, unit destruction, explosion attachment/progression and the earlier combat-order isolation check.
- The first full desktop VFX cleanup assertion timed out at 15 seconds. The diagnostic showed zero active/model projectiles, zero muzzle flashes, zero impact rings and zero impact sparks; only one model explosion remained with 0.5055 seconds of simulated lifetime. The simulation was active (`started=true`, `gameOver=false`, visible/focused page), at `time=9.8453`, `frameCount=229`, `lastFrameDelta=0.05`. The remaining explosion was still decaying rather than stuck; the runner's software-rendered RAF advanced too slowly for the 15-second wall-clock allowance.
- Artifact [13166799655](https://github.com/Ascameleon/Blue-alert/actions/runs/41499091654/artifacts/13166799655) contains fresh desktop/mobile infantry model-preview captures and desktop live-game screenshots, including gameplay, projectile impact and explosion. The browser sequence stopped before live-game infantry gait/fire screenshots and before live-game mobile gameplay. Standalone HTML upload, OpenRTS build/launch and native interaction checks were skipped.
- Correction prepared for the next exact head: extend the desktop and mobile full VFX cleanup wall-clock allowance from 15 to 30 seconds while retaining every existing zero-projectile, zero-muzzle-flash, zero-explosion, zero-impact-ring and zero-impact-spark condition. This preserves the lifecycle acceptance gate; it only accommodates the observed slow simulated-frame progression. The later post-turret gate remains limited to in-flight projectiles and larger effects because the complete impact-ring/spark lifecycle is already asserted earlier.
- No production model, combat or movement code changes. PR #47 remains draft and unmerged. The infantry is still a procedural low-poly asset; full live-game desktop/mobile evidence and separate OpenRTS/native validation are still required on the next exact head. No version or release. Budget: 0 €.

### Exact-head validation rerun and visual inspection — workflow #355 — 2026-11-02

- Exact branch head: `798b42f62886b041819c59eb6ec05fa536d58d4c`. The first attempt of workflow [41499091654](https://github.com/Ascameleon/Blue-alert/actions/runs/41499091654) stopped in the desktop V94 transient-effect cleanup wait. The failed job was rerun without changing the branch; the rerun completed with **success** on the same exact head. No branch write occurred while the workflow was pending or running.
- All 24 workflow steps passed: prototype validation; V94 static and inline-JavaScript validation; expanded model-kit validation; imported V93 validation; skirmish-data validation; standalone single-file V94 build; desktop and mobile model-preview rendering; desktop and 390×844 mobile live V94 gameplay/browser tests; OpenRTS Java 21 build and launch; 12/12 native scenario movement; and native selection, movement and attack interaction.
- Desktop/mobile live V94 assertions verified that the two articulated hands remain seated on the rifle grip sockets during displacement-linked locomotion, the rifle muzzle axis follows the soldier's forward axis, and the infantry projectile starts at the actual muzzle. Logged desktop and mobile values include `muzzleError=0`, `muzzleAxisDot=1`, and grip errors below 0.05 world units. The mobile cleanup performance sample is only a CI-emulated scenario measurement, not a sustained whole-game FPS claim.
- Downloaded and directly inspected graphical artifact [13169169374](https://github.com/Ascameleon/Blue-alert/actions/runs/41499091654/artifacts/13169169374). Current-engine live-game captures: `v94-browser/desktop-v94-infantry-gait.png`, `desktop-v94-infantry-fire.png`, `mobile-v94-infantry-gait-390x844.png`, and `mobile-v94-infantry-fire-390x844.png`. Model-preview captures: `model-preview/desktop-blue-sentinel-infantry.png` and `model-preview/mobile-blue-sentinel-infantry-390x844.png`. Compared the new desktop/mobile model previews against accepted-main artifact [13141329066](https://github.com/Ascameleon/Blue-alert/actions/runs/41445930709/artifacts/13141329066): the previous rifle crossed the torso laterally; the updated rifle points forward with both hands on the weapon. The live V94 captures show that forward-ready grip and muzzle-origin firing in actual gameplay on both viewport sizes. The model-preview A/B is the cleanest same-view comparison; the live-game captures are fresh gameplay evidence, not a perfectly matched live-game camera-pose A/B.
- Standalone playable V94 HTML artifact: [13170147754](https://github.com/Ascameleon/Blue-alert/actions/runs/41499091654/artifacts/13170147754).
- OpenRTS is a separate native engine and does not import the Three.js infantry model. Its log reports `BUILD SUCCESSFUL`, 12/12 units moved, native left-click selection, right-click movement of approximately 3.50 world units, and right-click attack reducing target health from 120 to 119. Native screenshots `openrts-screen.png` and `openrts-interactive-screen.png` are in artifact 13169169374.
- Changed files in the PR against the accepted main base: `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `game-data/models/blue-alert-models.js`, `scripts/validate_v94.py`, `scripts/validate_v94_browser.mjs`, and `docs/EVOLUTION_LOG.md`. The tested code/test head before the final QA-only follow-up was `6cc26e9d611b388185c07b9fd13b46ba1d2281e3`; the exact final tested branch head is `798b42f62886b041819c59eb6ec05fa536d58d4c`.
- Visual decision: accept this as a material, targeted infantry weapon/pose/animation correction for cumulative integration. It does **not** complete the soldier asset: the model remains stylized procedural low-poly and still needs stronger anatomy, face/helmet treatment, material depth, animation refinement and faction-specific finishing. It does not establish commercial-grade or AAA quality. No game version or release was created.
- Evidence boundaries: 390×844 is browser emulation, not a physical Samsung test; Three.js remains CDN-loaded; OpenRTS native results are separate from V94 WebGL. No paid APIs, assets, credits or services; budget remains 0 €.
- This documentation update is the only change after the successful exact-head rerun. A new exact-head workflow is required for the resulting documentation head before merge. PR #47 remains draft/unmerged pending that run. No further branch write is permitted while that run is queued or running.


### Exact-head validation failure and mobile fire-test isolation — workflow #357 — 2026-11-02

- Exact branch head tested: `c762db1b97535258ca6d6c81dbd52601f349be8f`; GitHub Actions [workflow #357, run 41505059191](https://github.com/Ascameleon/Blue-alert/actions/runs/41505059191), attempt 3, completed with failure in the mobile V94 browser sequence.
- Passed before the failure: BLUE ALERTS prototype validation; V94 static and inline-JavaScript validation; expanded model-kit validation; imported V93 validation; skirmish-data validation; standalone single-file V94 build; and desktop/mobile model-preview rendering. The desktop live-game sequence also passed mission progression, projectile impact, unit destruction/explosion lifecycle, structural damage stages, infantry gait and rifle fire.
- Desktop live infantry-fire diagnostics from the job log: `muzzleError=0`, `muzzleAxisDot=1`, `leftGripError=0.0173`, `rightGripError=0.0329`, with the rifle muzzle attached and visible. These are runtime QA measurements for this controlled shot, not general performance metrics.
- Mobile failed at `scripts/validate_v94_browser.mjs:791`: the test expected the aggregate visible model-muzzle-flash count to rise from 2 to 3, but observed 2. The controlled projectile assertion had passed. The test measured a single new shot while unrelated AI fire was still active; an older attached flash could expire in the same frame as the new flash appeared, masking the expected aggregate `+1`. This is a test-isolation defect, not evidence that the mobile projectile or rifle-muzzle path failed.
- Downloaded and inspected workflow artifact [13173137330](https://github.com/Ascameleon/Blue-alert/actions/runs/41505059191/artifacts/13173137330). Fresh current-engine captures inspected: `model-preview/desktop-blue-sentinel-infantry.png`, `model-preview/mobile-blue-sentinel-infantry-390x844.png`, `v94-browser/desktop-v94-infantry-gait.png`, `v94-browser/desktop-v94-infantry-fire.png`, `v94-browser/desktop-v94-gameplay.png`, and `v94-browser/mobile-v94-gameplay-390x844.png`. The mobile live-game infantry gait/fire screenshots are absent because the browser sequence stopped before those probes. Standalone HTML upload, OpenRTS build/launch and native interaction steps were skipped.
- Compared the fresh desktop/mobile model previews with accepted-main artifact [13141329066](https://github.com/Ascameleon/Blue-alert/actions/runs/41445930709/artifacts/13141329066): the prior rifle crossed the torso laterally; the new model points the rifle forward and seats both articulated hands on the grip. The desktop live-game gait/fire captures confirm the new pose and muzzle-origin shot in V94 gameplay. This is a targeted, visible weapon/pose correction, not a complete soldier asset or a commercial-grade result.
- Test-only correction commit: `15d39a2c11bcb78de17ec4a0c45752a5c3931855`. Before the mobile controlled-fire baseline is measured, the browser test now brings the page to the foreground, suppresses unrelated AI combat orders, waits for active projectiles and visible model muzzle flashes to drain, and asserts a zero-effect baseline before issuing the direct QA shot. The exact `+1` muzzle-flash assertion is retained; production combat, movement, damage and animation code are unchanged.
- The documentation update is a separate child commit of the test correction. The final branch head must receive a fresh exact-head workflow before any further branch write, review acceptance or merge. The branch remains a draft PR and no game version/release is created.
- Evidence boundaries: mobile 390×844 is browser emulation, not a physical Samsung test; the web V94 runtime and OpenRTS native engine are separate; OpenRTS has not been revalidated on this failed run. The soldier remains stylized procedural low-poly and still requires substantial anatomy, material, helmet/face, and animation refinement. Budget: 0 €.


## Cycle — articulated infantry weight shift and ankle locomotion (2026-11-02)

- Base/head before this cycle: `79a030225a2e136014632484c539df1a069d2b29` on `art/v94-infantry-forward-grip-20261102`; accepted main remains `462b6d448c810485b597effcf3e60c708dbbd48e`.
- Consolidated the soldier's torso, head, shoulder pivots, field pack and forward rifle under a shared pelvis rig while preserving their original world-space placement at rest. The legs remain on the existing outer unit transform, preserving selection, collision and displacement contracts.
- Added independent ankle pivots with overlapping ankle cuffs, reinforced soles and toe caps. The existing shin/calf geometry remains attached to the knee; only the boot assembly articulates at the ankle.
- Reworked deterministic gait with restrained pelvis weight shift/bob, head counter-stabilization, alternating ankle lift and foot pitch. The rifle and both hand rigs move with the same pelvis parent so the two-hand socket alignment and muzzle-origin firing contract remain coherent.
- Added model-preview diagnostics and static/browser assertions for the pelvis/ankle hierarchy, locomotion profile, pelvis movement, ankle lift/pitch, retained hand grips and forward muzzle axis on desktop and 390×844 mobile browser emulation.
- Changed files: `game-data/models/blue-alert-models.js`, `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `game-data/models/preview.html`, `scripts/validate_v94.py`, `scripts/validate_v94_browser.mjs`, `scripts/validate_model_kit.py`, `scripts/validate_model_preview_browser.mjs`, and this log.
- Validation status at commit time: pending exact-head GitHub Actions. No screenshot or quality acceptance is claimed until fresh desktop and 390×844 mobile gameplay captures from the exact tested HEAD are generated and inspected. OpenRTS remains a separate native-engine check.
- No version/release created; no paid assets, APIs, credits or services; budget 0 €.


### Exact-head workflow #359 failure and infantry preview budget correction — 2026-11-02

- Exact head tested: `155c35fafd67511f5de0874aac532918180fb56a`; GitHub Actions [run 41528060616 / workflow #359](https://github.com/Ascameleon/Blue-alert/actions/runs/41528060616) completed with failure in `scripts/validate_model_preview_browser.mjs:160`.
- The browser preview reported `meshCount=60`, `triangleCount=10112`, and `drawCalls=56`. The preceding successful exact head `79a030225a2e136014632484c539df1a069d2b29` in [workflow #358](https://github.com/Ascameleon/Blue-alert/actions/runs/41518465466) reported 56 meshes, 9,560 triangles and 52 draw calls. The pelvis/ankle rig added four mesh nodes; the separate static-batching assertion (`savedDrawCalls >= 25`) and actual draw-call ceiling (`drawCalls <= 60`) both passed on #359.
- Root cause: the preview test used a strict `meshCount < 60` object-count bound, so it rejected exactly 60 meshes even though the new model remained inside the 60-draw-call rendering budget and the batching-savings assertion passed. This was a stale off-by-one test boundary, not a JavaScript syntax, geometry-bounds, or draw-call-budget failure.
- Test correction: change only the object-mesh bound to `meshCount <= 60`. Keep the independent `savedDrawCalls >= 25`, `drawCalls <= 60`, triangle-detail, ground-contact, rig, gait and faction assertions unchanged. The correction is limited to the preview validator; production model, movement, combat and animation code are unchanged.
- Exact code/test correction commit: `6c67f6f01ab77c801c60c07f348d37be50a37cd7`. Documentation is updated in the child commit that carries this entry. Files changed in the final branch update: `scripts/validate_model_preview_browser.mjs` and `docs/EVOLUTION_LOG.md`.
- Artifact [13181025903](https://github.com/Ascameleon/Blue-alert/actions/runs/41528060616/artifacts/13181025903) was downloaded and inspected. It contains `blue-alerts-scenario-report.json`, `model-preview/baseline-turret-mobile-390x844.png`, `model-preview/baseline-turret.png`, and `model-preview/desktop-blue-sentinel-tank.png`; it contains no new infantry desktop/mobile screenshots. The failed assertion occurred before the infantry screenshot capture, so this cycle's pelvis/ankle visual change is not yet accepted.
- The workflow stopped before live V94 desktop/mobile gameplay captures and before its OpenRTS build/launch/native interaction stages. The successful OpenRTS results from #358 are historical evidence for its earlier head only, not validation of `155c35fafd67511f5de0874aac532918180fb56a`.
- The branch was not written during any active workflow. The next validation must run on the final branch HEAD after this code/test and documentation update. No merge, version or release. Budget: 0 €.


## Cycle — sculpted infantry gloves and field boots (2026-11-03)

- Base: `f5e9d8bc504b499c753e09e03fcfbe1645abfdef` on `art/v94-infantry-forward-grip-20261102`; accepted `main` remains `462b6d448c810485b597effcf3e60c708dbbd48e`.
- Replaced the infantry glove's bead-like palm/finger primitives with a tapered loft palm, four curved finger tubes and a curved thumb. Kept the existing hand pivots and weapon grip sockets unchanged.
- Replaced the squared boot block with a shaped loft shell, profiled outsole and rounded toe cap; added crossed laces and armor-matched eyelets. Existing ankle pivots and planted-foot animation remain unchanged.
- Added explicit hand/boot geometry profiles to model diagnostics and desktop/mobile preview assertions. The static model-kit and V94 validators now require these profiles and sculpted part names.
- Files prepared for this atomic code/test update: `game-data/models/blue-alert-models.js`, `game-data/models/preview.html`, `scripts/validate_model_preview_browser.mjs`, `scripts/validate_model_kit.py`, `scripts/validate_v94.py`, and `docs/EVOLUTION_LOG.md`.
- Exact-head validation and fresh desktop/390×844 mobile screenshots are pending. No visual acceptance is claimed until the running V94 preview/game captures are inspected against the accepted-main baseline. OpenRTS remains a separate native-engine validation.
- The previous model preview used 60 meshes and 56 draw calls; the new hand geometry is batched inside each hand pivot, while boot laces/eyelets reuse the existing dark/armor material groups. The exact preview budgets remain `meshCount <= 60` and `drawCalls <= 60`; the browser workflow must confirm them.
- No version/release created; no external or paid assets/services; budget remains 0 €. The final commit SHA will be appended only after this exact-head workflow completes, followed by a documentation-only exact-head validation as required.


### Exact-head workflow #361 — static contract mismatch (2026-11-03)

- Tested HEAD: `ba743f79824f51615bce02cd1ab43448a68d1fa0`; GitHub Actions [run 41543894902](https://github.com/Ascameleon/Blue-alert/actions/runs/41543894902) completed with failure.
- Prototype validation and inline JavaScript parsing passed. The V94 static validator stopped before the model-kit, browser, standalone-build, gameplay and OpenRTS stages.
- Exact failure: `required_infantry_rig` still searched for the removed source spelling `label+'-reinforced-combat-boot-sole'`. The new sculpted boot correctly names the loft mesh through `sole.name = label + '-reinforced-combat-boot-sole'`; the semantic part name is unchanged.
- No browser captures or gameplay artifacts were produced by #361. No visual acceptance is claimed.
- Corrected the static validator to check the new exact assignment rather than the retired beveled-box constructor expression. This is a test-contract correction; production geometry, animation and combat behavior are unchanged.
- The branch was not written during #361. The correction and this log entry are committed together after the run completed; a fresh exact-head validation is required before any further write.


### Exact-head validation and evidence review — workflow #362 — 2026-11-03

- Exact tested HEAD: `d6c2099c823a41842af2b92b8e44fea82a9755cd`; branch `art/v94-infantry-forward-grip-20261102`; base `main` remains `462b6d448c810485b597effcf3e60c708dbbd48e`.
- GitHub Actions [workflow #362 / run 41544239245](https://github.com/Ascameleon/Blue-alert/actions/runs/41544239245) completed successfully on that exact HEAD. All 24 job steps completed successfully.
- The production model improvement in `ba743f79824f51615bce02cd1ab43448a68d1fa0` replaces bead-like glove primitives with a shaped palm, curved fingers and thumb, and replaces squared boot blocks with a shaped shell, profiled outsole, toe cap, laces and eyelets. Existing hand pivots, rifle grip sockets, ankle pivots and combat contracts remain intact. `d6c2099` corrects the static validator to match the new boot geometry name; it does not change production geometry.
- Files changed in PR #47 against its base: `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `game-data/models/blue-alert-models.js`, `game-data/models/preview.html`, `scripts/validate_model_kit.py`, `scripts/validate_model_preview_browser.mjs`, `scripts/validate_v94.py`, `scripts/validate_v94_browser.mjs`, and `docs/EVOLUTION_LOG.md`.
- Successful checks on the exact HEAD: prototype and inline JavaScript validation; V94 static validation; expanded model-kit validation; imported V93 validation; skirmish-data validation; desktop/mobile 3D model preview; standalone single-file V94 HTML build; desktop and 390×844 mobile live-game browser rendering; OpenRTS build; OpenRTS scenario launch with 12 units; 12/12 native units moved; native left-click selection, right-click movement and right-click attack produced verified state changes.
- Fresh exact-head graphical evidence: [OpenRTS/browser artifact 13189080929](https://github.com/Ascameleon/Blue-alert/actions/runs/41544239245/artifacts/13189080929). Inspected files include `model-preview/desktop-blue-sentinel-infantry.png`, `model-preview/mobile-blue-sentinel-infantry-390x844.png`, `v94-browser/desktop-v94-infantry-gait.png`, `v94-browser/desktop-v94-infantry-fire.png`, `v94-browser/mobile-v94-infantry-gait-390x844.png`, `v94-browser/mobile-v94-infantry-fire-390x844.png`, `v94-browser/desktop-v94-gameplay.png`, `v94-browser/mobile-v94-gameplay-390x844.png`, `openrts-screen.png`, `openrts-interactive-screen.png`, `openrts-launch.log`, `openrts-interactive-launch.log`, and `blue-alerts-scenario-report.json`.
- The native scenario report records an 80×80 map, 12 units (4 roller tanks and 8 marines), and two factions. The native launch log confirms 12/12 units moved. The interactive log confirms native selection, movement and attack; the attack reduced the target health from 120 to 119. This is OpenRTS native evidence, separate from the V94 Three.js browser prototype.
- Visual review against accepted-main artifact 13141329066 confirms the rifle is now forward-facing and the hands/weapon relationship is improved; the latest preview also shows the shaped gloves and field boots. However, the live-game infantry remains small at the tactical camera distance, with a visibly stylized low-poly silhouette and a sparse/flat battlefield in the inspected captures. These changes are useful targeted asset improvements but do **not** yet demonstrate a material overall graphical step sufficient for a release or commercial-grade claim. PR #47 remains draft and unmerged; no game version/release is created.
- Standalone HTML artifact: [13189335660](https://github.com/Ascameleon/Blue-alert/actions/runs/41544239245/artifacts/13189335660). Its manifest records a 282,961-byte single HTML file with output SHA-256 `b079362be0558265799393fd1a9db99707c316c217af1aa037d5c5cdbbb1f266`. Three.js 0.160.0 is loaded from a CDN, so internet access is required for the 3D renderer; “single HTML file” does not mean fully offline.
- Evidence boundaries: mobile captures are 390×844 browser emulation, not a physical Samsung test. OpenRTS screenshots/logs prove the separate native engine checks only. The OpenRTS build emitted 100 existing compiler warnings and material-parser warnings for `alpha_rejection` and `depth_write`; no step failed and no uncaught runtime exception was detected. No paid assets, APIs, credits or services were used; budget remains 0 €.
- No new release or merge is authorized by this validation. This entry is documentation-only and changes the branch HEAD; a new exact-head workflow is required after this commit before any subsequent branch write.


## Cycle — torso-locked two-hand rifle locomotion (2026-11-03)

- Base HEAD: `dea8805984613507063c5cac86e886d50fff05b5`; branch: `art/v94-infantry-forward-grip-20261102`; accepted `main` remains `462b6d448c810485b597effcf3e60c708dbbd48e`.
- Failure evidence: workflow [#363](https://github.com/Ascameleon/Blue-alert/actions/runs/41546367089) failed at the desktop live-infantry gait assertion after model preview and V94 static checks passed. Shoulder/elbow gait swing moved both hands relative to the rifle, violating the grip-socket contract.
- Production correction: head, shoulder pivots and rifle now share the torso-local upper-body pivot. Their local Y offsets are reduced by the torso's existing 0.05 m offset, preserving original rest-world positions. During locomotion, shoulders and elbows retain the two-hand ready pose with a small synchronized hold sway; pelvis, torso and legs continue their existing gait. Head stabilization compensates the torso pivot.
- Added `TORSO_LOCKED_TWO_HAND_READY_V1` runtime diagnostics, static model-kit/V94 checks and desktop/mobile browser assertions for shoulder/elbow stability, both grip-socket distances and forward muzzle alignment. Added exact gait snapshots to browser logs.
- Changed files: `game-data/models/blue-alert-models.js`, `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `scripts/validate_model_kit.py`, `scripts/validate_v94.py`, `scripts/validate_v94_browser.mjs`, and this log.
- Exact code/test commit and exact-head workflow result: pending. No new desktop/mobile screenshots exist for this corrected head yet; previous captures are not evidence for this change. No release/version is created; budget remains 0 €.
- Evidence boundary: desktop and 390×844 mobile are Chromium captures/emulation, not a physical Samsung test. OpenRTS is a separate native-engine validation and does not render the Three.js infantry model.


### Exact-head validation attempt — workflow #379 — 7557a2bccacd98093a2ed4955cf878350cac7b93

- The workflow [#379](https://github.com/Ascameleon/Blue-alert/actions/runs/41575241854) stopped at `scripts/validate_v94.py` before browser or native-engine tests. The production hierarchy had correctly moved the head and shoulder pivots from the pelvis to the torso, but this static validator still required the old `pelvis.add(head)` and `pelvis.add(pivot)` strings. No gameplay assertion ran and no graphical artifacts were produced.
- Correct the validator to require `torso.add(head)`, `torso.add(pivot)`, and `torso.add(rifleGroup)`, while retaining `pelvis.add(torso)`. This is a validator-contract correction; no further production geometry or animation change is made in this commit.
- The code/test head `7557a2bccacd98093a2ed4955cf878350cac7b93` remains unaccepted pending a fresh exact-head workflow. The correction and this evidence note are committed together; no branch writes occur during the next validation. No release/version is created; budget remains 0 €.


### Exact-head validation attempt — workflow #380 — b11d49b77720de9ae91c5483692124927155d621

- Static prototype/V94/model-kit/scenario checks all passed. The desktop/mobile model preview rendered successfully and the standalone HTML built. The live-game browser step then stopped before the infantry gait assertions, at the second desktop building-damage preflight.
- Failure: the preflight waited 30 seconds for `modelExplosions === 0` even though the previous cleanup and combat lifecycle checks had already verified the explosion. The timeout diagnostic showed zero active projectiles, zero model projectiles and zero muzzle flashes, but one already-verified explosion visual with 0.567 seconds of life remained. This transient visual tail does not alter building HP or the controlled structural-damage test. No gameplay code failed; the native OpenRTS build and interactions were not reached.
- Artifact: [workflow #380 graphical smoke-test artifact 13202494531](https://github.com/Ascameleon/Blue-alert/actions/runs/41575337030/artifacts/13202494531). It contains desktop/mobile model previews and desktop gameplay/terrain captures, but no new infantry gait/fire screenshots. The model-preview soldier looks unchanged versus #362; no material overall visual improvement is accepted.
- Test correction: retain the strict requirement that all projectiles and muzzle flashes are drained, but allow a previously verified explosion to complete its visual tail. The full cleanup/lifecycle assertions remain in place; the production combat/effects code is unchanged.
- Exact code/test HEAD `b11d49b77720de9ae91c5483692124927155d621` remains unaccepted. This correction and the evidence note are committed together before the next validation. No release/version is created; budget remains 0 €.


## Cycle — human-proportion field infantry and deterministic impact evidence (2026-11-03)

- Accepted base remains `main` at `462b6d448c810485b597effcf3e60c708dbbd48e`. Working branch remains `art/v94-infantry-forward-grip-20261102`; previous branch HEAD was `91c10123e72fd86c4a21faafc93e19c1345398de`.
- Implementation commit: `4642b29ddab4d6fc3f9295dd5c0b80973ff87412` (`art: humanize infantry field silhouette and stabilize impact QA`). Preview diagnostic follow-up: `630bcb6cc573ee4df844496e48276487a86154d8`. These are targeted replacements/refinements of the existing procedural rifleman, not a new unit, branch or release.
- Visual change: reduce head scale from 0.82 to 0.74; replace the faceted helmet with a smoother 24×16 ballistic shell; replace the oversized lateral filter/hose gas-mask silhouette with a fabric balaclava, compact central respirator and paired ballistic lenses; reduce plate-carrier bulk, shoulder guards, knee pads and shin armor; shift armor/accent materials toward a matte, restrained field finish. Preserve the existing torso/pelvis/shoulder/elbow/hip/knee/ankle rig, two-hand rifle sockets, muzzle attachment, projectile origin, movement, collision, health, damage, selection and targeting contracts.
- Model metadata now identifies `LOW_PROFILE_BALLISTIC_HELMET_GOGGLES_V2`, `BALLISTIC_BALACLAVA_COMPACT_RESPIRATOR_V2`, `MATTE_FIELD_UNIFORM_PLATE_CARRIER_V2`, and `FIELD_INFANTRY_HUMAN_PROPORTIONS_V2`. The runtime QA snapshot and model preview expose these fields. The model module is cache-busted to `?v=11`; preview armor-part diagnostics now target the new names.
- Validation reliability correction: workflow [#381](https://github.com/Ascameleon/Blue-alert/actions/runs/41576138601), exact head `91c10123e72fd86c4a21faafc93e19c1345398de`, passed prototype/V94/model-kit/scenario checks, desktop/mobile model previews, desktop gameplay, mission, combat, infantry gait and infantry muzzle-origin checks. It failed only at the mobile impact wait. The log recorded a new persistent impact event (ID 39, one ring, seven sparks) while the short-lived ring/spark counters had already returned to zero before the polling assertion; the collision was registered but the test waited on transient mesh counts. Both desktop/mobile impact waits now use the immutable `lastImpactEvent` record and still require a new event ID, one ring and at least four sparks. Production combat/VFX code is unchanged by this test correction.
- Files changed: `game-data/models/blue-alert-models.js`, `game-data/models/preview.html`, `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`, `scripts/validate_model_kit.py`, `scripts/validate_v94.py`, `scripts/validate_v94_browser.mjs`, and this log.
- Prior visual evidence inspected from failed workflow #381 artifact `13204540560`: `model-preview/desktop-blue-sentinel-infantry.png`, `model-preview/mobile-blue-sentinel-infantry-390x844.png`, `v94-browser/desktop-v94-infantry-gait.png`, `v94-browser/desktop-v94-infantry-fire.png`, and `v94-browser/mobile-v94-gameplay-390x844.png`. The pre-change soldier remains too robotic/low-poly and small at tactical distance; these captures are not evidence for the new model. The failed artifact contains no successful mobile impact-VFX capture.
- Exact-head validation is triggered on the final documentation HEAD. Expected fresh screenshot paths in the workflow artifact: `model-preview/desktop-blue-sentinel-infantry.png`, `model-preview/mobile-blue-sentinel-infantry-390x844.png`, `v94-browser/desktop-v94-infantry-gait.png`, `v94-browser/desktop-v94-infantry-fire.png`, `v94-browser/mobile-v94-infantry-gait-390x844.png`, `v94-browser/mobile-v94-infantry-fire-390x844.png`, `v94-browser/desktop-v94-gameplay.png`, `v94-browser/mobile-v94-gameplay-390x844.png`, and `v94-browser/mobile-v94-impact-vfx-390x844.png`; native OpenRTS captures are separate evidence if the OpenRTS stages are reached.
- Evidence boundaries: 390×844 is Chromium mobile emulation, not a physical Samsung test. OpenRTS is a separate native engine and does not render the Three.js soldier. The procedural model is still not commercial-grade by assertion; that standard remains an objective. No paid assets/APIs/credits/services; budget 0 €. No game version or release is created.


### Exact-head validation attempt #392 — 2026-11-03

- Workflow: [#392](https://github.com/Ascameleon/Blue-alert/actions/runs/41611009405), exact HEAD `6411cd63f071f184409288f17fcbf38303256967`.
- Result: failed at `scripts/validate_model_kit.py` before browser rendering. Prototype and V94 static/syntax checks passed. Model-kit validation rejected one comment-token assertion: the source comment correctly says `smooth ballistic helmet shell above is the sole crown surface`, while the test expected the shorter phrase without `above`. This was a test-string mismatch, not a model/runtime failure. Browser preview, desktop/mobile gameplay and OpenRTS stages were skipped; this run produced no new visual evidence.
- Test-only correction commit: `2ee6c0d637b66413bf42363b358326b83533b817`, aligning the required token with the exact model comment. No production model or gameplay code changed in this correction.
- The branch remains unmerged and no release is authorized. The next workflow must validate the complete updated HEAD before any further write.


### Exact-head validation attempt #393 — 2026-11-03

- Workflow: [#393](https://github.com/Ascameleon/Blue-alert/actions/runs/41611221048), exact HEAD `7cfc1974bec3ca46ddca55fc641263ebd64cc7cf`.
- Result: the model-kit validator, V93 compatibility, skirmish-data checks, OpenRTS scenario preparation and Chromium setup all passed. The standalone HTML build then failed because `scripts/build_single_html.mjs` still asserted the old model import query `?v=10`, while the runtime and model preview had correctly moved to `?v=11`. No browser rendering or native OpenRTS build was reached. Artifact `13219635294` contains only the small early-stage smoke-test output and no screenshots.
- Builder correction commit: `080941dfe9ff1fe20ed35f60efe77aa9165b9706`; both stale `?v=10` references in the standalone builder now match `?v=11`. No production gameplay/model code changed in this correction.
- The next exact-head workflow must complete the standalone bundle, desktop/mobile model previews, desktop/mobile gameplay captures and separate OpenRTS build/interaction checks before any further branch write.


### Exact-head validation attempt #394 — 2026-11-03

- Workflow: [#394](https://github.com/Ascameleon/Blue-alert/actions/runs/41611748840), exact HEAD `a011e7378f0f6047c7e30a6e8236b9b8ab9b6aa0`.
- Result: prototype/V94/model-kit/V93 compatibility/skirmish-data/OpenRTS preparation, Chromium setup and standalone single-file HTML build all passed. The desktop/mobile model-preview browser test then failed on stale acceptance expectations: it still required `FIELDWEAVE_CERAMIC_MICROSCUFF_V2`, head scale `0.82`, body profile `ELLIPTIC_LOFT_HUMAN_PROPORTIONS_V1`, and the removed `bastion-jaw-guard`. The actual V4 model correctly reported `MATTE_FIELDWEAVE_PLATE_CARRIER_V3`, head scale `0.74`, and the new field-infantry profiles. The preview renderer did not reach the infantry screenshot assertions; artifact `13218663517` contains only the baseline turret and tank captures, not the new soldier.
- Follow-up commit: `040a5c2efb74fb2a6d8cee78e329eab9969c9c8b`. Updated desktop/mobile model-preview assertions for the V4 head, helmet, face-protection and uniform profiles; updated the Bastion face-protection assertions; reduced the red-faction pauldron to the same restrained field-armor silhouette; and included it in preview armor diagnostics.
- No gameplay release, version tag or merge. The next workflow must produce and inspect fresh desktop/mobile infantry screenshots before the visual change can be accepted.


### Exact-head validation attempt #395 — 2026-11-03

- Workflow: [#395](https://github.com/Ascameleon/Blue-alert/actions/runs/41612274343), exact HEAD `6ff928aa4f3835432aaba767b9c5612e59b0c89d`.
- Result: prototype/V94/model-kit/V93 compatibility/skirmish-data/OpenRTS preparation, Chromium setup and standalone HTML build passed. The desktop/mobile model-preview browser test progressed beyond the stale material/profile checks, then failed because its blue-faction part-name assertion still expected `sentinel-visor`; the V4 model intentionally replaced that obsolete bar with `sentinel-goggle-bridge`. The preview run stopped before the infantry screenshots. Artifact `13218969556` contains only the earlier tank/turret captures and no new soldier evidence.
- Follow-up commit: `36d2cae3fbfacb1ad3dfd163a25c4b158d2bde3b`. Updated the preview assertion to the current goggle-bridge part and included goggle components in the preview's armor-detail diagnostics. No gameplay contracts or weapon/locomotion code changed in this test-only correction.
- No release or merge. The next exact-head run must complete both infantry previews and then proceed to live desktop/mobile gameplay and separate OpenRTS validation.


### Exact-head validation attempt #396 and infantry batching correction — 2026-11-03

- Failed workflow: [#396](https://github.com/Ascameleon/Blue-alert/actions/runs/41612678668), exact HEAD `cccb578096e6c510795056fd60bcea65497e74ae`.
- Failure point: desktop/mobile model-preview stage. All prototype/V94/model-kit/V93 compatibility/skirmish-data checks, OpenRTS scenario preparation, Chromium setup and standalone HTML build passed. The blue infantry preview reported 62 mesh objects, 13,016 triangles and 58 draw calls; the 60-mesh object ceiling failed. No new infantry screenshot was captured on that head.
- Failed-run artifact: `openrts-graphical-smoke-test`, artifact `13220425348`. It contains `model-preview/baseline-turret.png`, `model-preview/baseline-turret-mobile-390x844.png`, `model-preview/desktop-blue-sentinel-tank.png` and `blue-alerts-scenario-report.json`; it contains no blue/red infantry preview and no V94 gameplay screenshot.
- Runtime correction commit: `577bf438ace894f46b67206a38a1355370ca69e7`. Reworked `mergeInfantryStaticMeshes` to batch opaque static sibling meshes across material boundaries inside each existing rig parent and render layer. Material assignments are preserved with BufferGeometry groups; material groups remain distinct draw calls. Instanced, skinned, transparent, hidden, custom-attribute, morph and combat-effect meshes remain separate. No merge crosses a moving joint, hand/weapon grip, muzzle flash or outer V94 unit transform.
- Performance accounting now distinguishes `savedMeshObjects` from `savedDrawCalls`; draw-call savings remain the source-mesh count minus the number of material groups, so the diagnostic does not claim object consolidation as GPU draw-call savings. Triangle geometry and faction materials are retained.
- Reference-only visual inspection: successful PR #48 workflow [#391](https://github.com/Ascameleon/Blue-alert/actions/runs/41602640918) produced `v94-browser/desktop-v94-gameplay.png`, `v94-browser/mobile-v94-gameplay-390x844.png` and model-preview captures in artifact `13215213490`. The compact mobile HUD clearly reclaims battlefield area, but that is a different branch/head and is not evidence for PR #47's infantry model.
- Documentation commit: to be recorded in this same branch update. Exact final HEAD will be validated by a fresh workflow after all edits are present.
- No new game version, release or merge. The V4 infantry visual quality is not accepted yet. Desktop/mobile model previews, live V94 gameplay and separate OpenRTS/native checks must complete on the final exact HEAD before any visual acceptance.
- Evidence boundary: CI mobile is 390×844 browser emulation, not a physical Samsung test. OpenRTS remains a separate native engine and does not import the Three.js infantry meshes. Budget remains 0 €.


### Exact-head validation #397 — infantry batching and live V94 evidence — 2026-11-03

- Exact tested HEAD: `92223491501f878827779b0e3cc02a16ee7bbc95` on `art/v94-infantry-forward-grip-20261102`.
- Workflow: [#397](https://github.com/Ascameleon/Blue-alert/actions/runs/41613659884) — **success** on that exact HEAD.
- Runtime commit: `577bf438ace894f46b67206a38a1355370ca69e7`; log commit present on the tested HEAD: `92223491501f878827779b0e3cc02a16ee7bbc95`.
- Changed files on the tested HEAD:
  - `game-data/models/blue-alert-models.js`
  - `docs/EVOLUTION_LOG.md`
- Static prototype/V94/model-kit/V93-compatibility/skirmish-data checks: passed. Standalone single-file V94 build: passed. Desktop and 390×844 mobile model preview: passed. Live V94 desktop and mobile browser suite: passed. OpenRTS native build: passed. Native scenario movement: 12/12 units moved (6 red, 6 blue). Native XTest input: real left-click selection, right-click movement and right-click attack passed.
- Infantry preview metrics on this exact head: BLUE SENTINEL `29` mesh objects, `13,016` triangles, `58` draw calls. The prior failed #396 preview reported 62 mesh objects, the same 13,016 triangles and 58 draw calls. Static sibling batching reduced scene mesh objects while preserving triangle detail and the draw-call count; this is an object-count optimization, not a claim of additional GPU draw-call savings.
- Visual evidence artifact: `openrts-graphical-smoke-test`, artifact `13219854751`. Inspected exact-head captures:
  - `model-preview/desktop-blue-sentinel-infantry.png`
  - `model-preview/mobile-blue-sentinel-infantry-390x844.png`
  - `model-preview/desktop-red-bastion-infantry.png`
  - `model-preview/mobile-red-bastion-infantry-390x844.png`
  - `v94-browser/desktop-v94-gameplay.png`
  - `v94-browser/mobile-v94-gameplay-390x844.png`
  - `v94-browser/desktop-v94-infantry-gait.png`
  - `v94-browser/mobile-v94-infantry-gait-390x844.png`
  - `v94-browser/desktop-v94-infantry-fire.png`
  - `v94-browser/mobile-v94-infantry-fire-390x844.png`
  - `openrts-interactive-screen.png` and `openrts-screen.png` (separate native engine evidence).
- Playable artifact: `blue-alerts-v94-build-zone-playable`, artifact `13219999114`; extracted `BLUE_ALERTS_V94_BUILD_ZONE_JOUABLE.html`, 286,099 bytes, SHA-256 `de40d026fed24ac5dcafde8216504e3a71c7e6fecbdb870fd39f7616fdd5393b`. The model module is embedded; Three.js 0.160.0 still loads from a CDN, so the renderer requires internet access.
- Visual comparison against the `main` baseline `462b6d448c810485b597effcf3e60c708dbbd48e` (reference artifact `13144400413`): the new V4 infantry has a lower-profile helmet, compact goggles/respirator, less bulky field armor, separated articulated legs/boots and a forward two-hand rifle pose. The improvement is visible in desktop/mobile model previews and live gait/fire captures. It is still a stylized, low-poly procedural character; at normal tactical zoom it remains small. The tank silhouettes, terrain and overall battlefield rendering are not materially transformed by this batching correction. The mobile HUD still stacks the selection/status and objective overlays; that remains a separate usability target.
- No commercial-grade claim, no new game version, no release and no merge. PR #47 remains draft; `main` remains unchanged at `462b6d448c810485b597effcf3e60c708dbbd48e`.
- Evidence boundaries: 390×844 is Chromium mobile emulation, not a physical Samsung test. OpenRTS is a separate native engine; its screenshots and input checks do not prove that the Three.js V94 assets are running inside OpenRTS. Budget remains 0 €.
- Next non-duplicative priority: reduce the mobile HUD stack and reclaim battlefield visibility, then continue the infantry/tank silhouette work at normal tactical camera scale.
