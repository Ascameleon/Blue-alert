# BLUE ALERTS Evolution Log

## 2026-11-02 — VFX performance and campaign validation

Baseline workflow 41366022672 failed at desktop VFX cleanup: after the 8-second wait one explosion still had 0.0819 seconds remaining; 38 RAF frames advanced. The model preview, mobile layout checks, static checks and standalone build had passed before that failure.

On `evolution/visual-content-foundation`, the existing V94 HTML now caches mesh/material references once when explosion and muzzle-flash effects spawn. Per-frame VFX updates use those cached records instead of traversing the Object3D tree and allocating vectors/arrays repeatedly. Static validation now checks this contract and the six-mission / 18-objective First Contact data. Playwright records desktop cleanup FPS with a 5.5 FPS minimum; existing mobile performance criteria remain unchanged.

Post-change CI run 41366739099 is in progress at the time of this entry. No post-change browser pass or physical Android test is claimed yet. Campaign data remains authored content, not wired to runtime mission state.

Next priority after green CI: wire Mission 1 reach-zone and reveal-target objectives to real game state and add browser regression coverage.

### Visual evidence review

Inspected the actual baseline artifacts from run `41366022672` (artifact `openrts-graphical-smoke-test`): `desktop-v94-gameplay.png`, `desktop-v94-explosion-vfx.png`, and the 390x844 model-preview capture. The gameplay still shows a broad flat green field, a simple road/grid, low-detail geometric vehicles and sparse structures; the explosion reads as a small stylized ring/core effect. This confirms that the visual-quality gap remains substantial. The visual-direction and map files are specifications, not runtime environment integration.

### Next highest-impact product cycle

After the current CI run is green, prioritize one license-verified, editable, detailed MBT asset pair (Blue Directorate and Red Front) with correct scale/origin, three LODs, collision proxy, rotating turret and firing animation, integrated into the live V94 game. Keep the current procedural models as reversible fallbacks. Then replace one visible battlefield sector with the industrial logistics-yard layout and test camera-distance readability and mobile frame time.
