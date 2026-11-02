# BLUE ALERTS — Cumulative Evolution Log

## Cycle — Faction-specific V94 tank signatures

- Base source: \`main\` at \`1b0768b56bc61976391bc6fd930faa3a336e2e7c\`.
- Working branch: \`feat/blue-alerts-faction-tank-signatures-20261102\`.
- Runtime implementation: \`25e1c4293c7a952bccece21e463cf6958d43530e\`.
- Preview integration: \`0c45e035d0dc1b56be3b14bc98fa406bb7873c94\`.
- Static contract tests: \`19200aedf93894b474e35c0515b4602689e3f3ec\`, corrected preview labels in \`28f5784e5e1aebae34eacf20dad1016225994623\`.
- Desktop/mobile visual tests: \`5543f70ba92ccc34cdace0409021f2e3aa2089bb\`.
- Model documentation: \`12ed5c0b9fb224bd91e2b750575c329ddc99a8e7\`.

### Runtime changes

The existing \`createTank(THREE, { team, variant, scale })\` API and V94 combat contract remain intact, including \`userData.turret\`.

- BLUE SENTINEL: low-profile turret, sloped cheek armor, compact sensor/rangefinder cluster and cool sensor accents.
- RED BASTION: raised reinforced turret, side armor slabs, command cupola, protected rangefinder and warm sensor accents.
- Both: sloped front glacis, engine-deck grilles, fenders, return rollers, hub caps, 36 instanced track shoes and 60 instanced wheel fasteners.
- Repeated tread and fastener detail is instanced; no external model, texture, paid asset, API or service was added.
- Existing collision and movement code was not changed.

### Changed files

- \`game-data/models/blue-alert-models.js\`
- \`game-data/models/preview.html\`
- \`scripts/validate_model_kit.py\`
- \`scripts/validate_model_preview_browser.mjs\`
- \`game-data/models/README.md\`
- \`docs/EVOLUTION_LOG.md\`

### Validation and evidence boundary

- Static model-kit contract and Node syntax checks: added to the existing CI workflow; result pending for this branch head.
- Desktop and 390×844 mobile WebGL preview: added assertions for both faction profiles, 36 tread instances, 60 wheel-fastener instances, signature parts and camera framing; result pending for this branch head.
- V94 browser/runtime and OpenRTS/native interaction checks: required by the existing workflow; result pending for this branch head.
- Physical Samsung hardware test: not performed.
- The OpenRTS smoke test is a separate native-engine interaction check; it does not prove that the Three.js tank models are imported into OpenRTS.
- No claim of release or merge to \`main\`; this work remains isolated in its feature branch until review and validation.


### Regression correction — first CI attempt

- The first PR workflow run \`41376877894\` failed in the existing V94 inline-module syntax check before the new model-kit/browser tests could execute.
- Cause: the initial file replacement inserted the new constructor before the legacy constructor body instead of replacing the complete function block.
- Correction: replace the entire \`createTank\` function region, retaining the following \`createInfantry\` export; fix commit \`602ec00be216d6d27c5f6277fdc33e036cbed86f\`.
- The failed run is retained as evidence; no test is claimed from it. A new workflow run must validate the corrected branch head.


### Browser-test correction — mobile preview state

- Corrected runtime syntax validation passed in workflow \`41376956514\` through the standalone V94 build and static model checks.
- The desktop BLUE SENTINEL and RED BASTION previews rendered and their faction assertions passed. The browser test then failed because the preview was still set to the control tower when the mobile tank assertion began.
- Correction: explicitly select the tank asset and assert the BLUE SENTINEL state before capturing either mobile faction screenshot; fix commit \`3c736a55fbd46794c6c4c11ce36dc9590757e1c3\`.
- The desktop screenshots from the failed attempt were inspected: the two turret profiles are visibly distinct, and the track shoes/glacis/engine details render. The failure was in test setup, not a reported model-render exception.
- A fresh workflow run is required; the failed run is not counted as a pass.


## Performance correction — instanced faction-tank detail

- The first visually successful tank build measured **101 draw calls for one previewed tank** (99 mesh objects). That was too expensive to accept as a mobile-oriented result even though the V94 browser simulation passed.
- Repeated parts are now batched into InstancedMesh groups: 7 engine grilles, 8 reactive-armor tiles, 6 return rollers, 12 road wheels, 12 hubs, 12 hub caps, 4 smoke dischargers, 36 track shoes and 60 wheel fasteners; faction turret cheeks/plates/smoke banks are also instanced.
- Runtime optimization commit: \`387c2deed19a5473488422caabb807f623c6c9a9\`.
- Preview diagnostics now expose the detail-instance counts. Regression checks enforce a compact mesh count and a maximum of 60 draw calls for one previewed tank; both factions must satisfy the same budget.
- Validation for this optimization is pending; do not infer a draw-call reduction until the next exact-head browser preview run reports it.


## Cycle — softened BLUE SENTINEL and RED BASTION armor silhouettes

- Parent revision: `36886553c9cb3e21a8682890bfb4110ae199e085` on the existing faction-tank PR branch.
- Runtime/model commit: `d7cf6019fadd82cb88ca148d8586b1dd7b50bafe`.
- Scope: the same V94-loaded `createTank(THREE, { team, variant, scale })` model path; no detached render-only asset.
- Visual correction: replaced plain rectangular primitives on the major hull, glacis, engine deck, turret shells, faction cheek plates, side skirts and heavy reinforcements with chamfered, bevel-extruded geometry. Repeated armor details stay instanced.
- Preview framing: desktop tank preview moved closer while keeping a wider safety distance on narrow mobile viewports.
- Regression coverage: static checks require the bevel geometry helper and V94 `BLUE_MODELS.createTank` integration; browser checks verify at least 12 bevelled armor parts on each faction, named hull/turret parts, triangle budget, and existing draw-call budget.
- Existing gameplay contracts preserved: outer unit group, `userData.turret`, collision, HP, movement, targeting and weapons.
- Validation boundary: source changes are committed to the existing PR branch. The exact-head GitHub Actions workflow must finish before this cycle can be marked CI-verified. Physical Samsung testing remains not performed. OpenRTS smoke tests validate its separate native engine path and do not import these Three.js tank meshes.


## Cycle — faction-specific infantry equipment and live gait (V94)

- Base source: `main` at `1b0768b56bc61976391bc6fd930faa3a336e2e7c`.
- Working branch: `feat/blue-alerts-faction-infantry-gait-20261102`.
- Model implementation: `1d9ef30dcddaa1da3254f36c5cd353328d61dd7f`.
- V94 movement-loop integration: `08ea8f0e6a5bc03ed05beb194757db287ffb2216`.
- Model preview integration: `9965207431096cac1078d385128f134556cf1e18`.
- Static contract validation: `254f0bb57a1c71727c34b0af7cabcb7d33cd4177`.
- Desktop/mobile preview acceptance tests: `19dffd1a9edb934d7e3fc2ca205072f60986f959`.
- V94 desktop/mobile movement-gait acceptance tests: `bce9fb0018549a94bff1805fceccf685f6885356`.

### Runtime changes

The existing V94 `createUnit(..., 'infantry')` path now loads the faction-specific model and attaches its animation rig to the outer RTS unit group.

- BLUE SENTINEL rifleman: low-profile helmet, cyan visor/communications details, compact shoulder marks and lighter field armor.
- RED BASTION rifleman: reinforced brow and jaw guard, cheek armor, heavier shoulder pauldrons and warm optics.
- Both: layered carrier, chest magazines, belt pouches, backpack/radio, canteen, segmented arms/legs, combat boots and a detailed assault rifle.
- Repeated magazine and utility pouches use InstancedMesh groups.
- A deterministic gait helper animates opposing arm/leg pivots from measured unit displacement. Idle movement uses a subtle breathing motion.
- The animation remains on the model's child rig; the outer V94 unit position, collision footprint, selection ring, HP, speed, weapon and targeting contracts are unchanged.
- No external models, textures, paid APIs, assets or services were introduced.

### Changed files

- `game-data/models/blue-alert-models.js`
- `game-data/models/preview.html`
- `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`
- `scripts/validate_model_kit.py`
- `scripts/validate_model_preview_browser.mjs`
- `scripts/validate_v94_browser.mjs`
- `docs/EVOLUTION_LOG.md`

### Validation and evidence boundary

- Static model export and V94 wiring assertions: added; exact-head CI result pending.
- Model preview now checks both faction profiles, named signature parts, gait phase, triangle budget and a 60-draw-call ceiling at desktop and 390×844 mobile sizes; exact-head result pending.
- V94 browser test now moves the live blue infantry probe on desktop and mobile and asserts that position, gait intensity and opposing limb rotations change together; exact-head result pending.
- Standalone HTML build, complete V94 browser suite, OpenRTS build, native selection/movement/attack and screenshot capture remain required in the existing workflow; exact-head result pending.
- Physical Samsung test: not performed.
- OpenRTS smoke tests exercise its separate native engine path; they do not prove that the Three.js infantry meshes are imported into OpenRTS.
- No merge or deployment claim is made. The change remains on its feature branch pending exact-head CI evidence and review.


### Static-validator correction — first exact-head CI attempt

- Workflow `41382789517` reached the expanded model-kit validator and failed because faction mesh names were incorrectly searched in `preview.html` instead of `blue-alert-models.js`.
- The failure occurred before Playwright, standalone build or OpenRTS steps; no browser/native result is claimed from that run.
- Corrected the validator to check faction profile and rig-part tokens in the model source, while keeping preview-only hooks in the preview contract.
- Fix commit: `d68f53cfe0dfbdcf7e4e74d689c9d1f068e528ff`.
- A fresh exact-head workflow is required before this cycle can be marked verified.


### Static-validator correction — generated pivot names

- Workflow `41382845446` passed the V94 static validator but failed the model-kit contract because the test expected literal `left-leg-pivot` and `right-leg-pivot` strings. The model correctly constructs those names from the `makeLeg(label)` helper.
- Updated the static contract to assert the pivot factory (`makeArm`, `makeLeg`) and left/right pivot names remain asserted by the rendered browser diagnostics.
- Fix commit: `37ea334339aeb7e36792efdd003e420e3d26d166`.
- No browser, standalone-build or OpenRTS test is claimed from the failed run; a fresh exact-head workflow is required.


### Mobile geometry-budget correction

- Workflow `41382910552` passed all static checks and the standalone V94 build, then failed the desktop model-preview geometry-budget assertion for the new BLUE SENTINEL infantry. The assertion combined triangle and draw-call limits, so the failing metric was not yet isolated.
- Reduced the per-soldier mesh count by batching repeated pouches and removing 13 redundant small meshes (duplicate fasteners, ear blocks, elbow/ankle overlays, boot soles, pack straps and a trigger-guard detail) while retaining the faction silhouette, armor carrier, articulated limbs, rifle, helmet optics and backpack.
- Runtime optimization commit: `204ab7903cadf3b84042e889356bd9b24248cf65`.
- The browser test now logs triangle/draw-call counts and reports the specific failed budget; test commit: `71b8f4a87fdc6a2fb57f9509f58f3f5097a22843`.
- No desktop/mobile render or gameplay result is claimed from the failed run. The next exact-head workflow must recheck the 60-draw-call ceiling before the runtime gait tests can run.


### Infantry ground-contact and QA-probe correction

- Visual geometry review identified that the lower-leg pivot at Y=0.51 placed the boot soles below the battlefield plane. Raised both leg pivots to Y=0.62 so the combat boots terminate at approximately ground level.
- Added preview world-bounds diagnostics and desktop/mobile browser assertions for both faction profiles (`boundsMinY >= -0.03`).
- Made the V94 gait probe create a fresh test infantry only if the starting blue rifleman has already been eliminated; this prevents the movement test from depending on unrelated combat casualties.
- Model ground-contact fix: `2a6dd074831cfe3d81bc0498536736fb8bd41ad3`.
- Preview bounds diagnostic: `b781bd52b9d18dcf0798988e2bb113ac0c88f8ed`.
- QA probe fallback: `de75269dce52ac35bdb39b1e5f71bfab9943b84d`.
- Ground-contact browser assertions: `cd9c95a78ded227e75601f90e2de807d1fe43bc7`.
- No gameplay/browser/native test is claimed from the preceding run while it was still in progress; the next exact-head workflow must revalidate the complete build and interaction suite.
