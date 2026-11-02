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
