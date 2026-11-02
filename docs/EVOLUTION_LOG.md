# BLUE ALERTS Evolution Log

## 2026-11-02 — VFX performance and campaign validation

Baseline workflow 41366022672 failed at desktop VFX cleanup: after the 8-second wait one explosion still had 0.0819 seconds remaining; 38 RAF frames advanced. The model preview, mobile layout checks, static checks and standalone build had passed before that failure.

On `evolution/visual-content-foundation`, the existing V94 HTML now caches mesh/material references once when explosion and muzzle-flash effects spawn. Per-frame VFX updates use those cached records instead of traversing the Object3D tree and allocating vectors/arrays repeatedly. Static validation now checks this contract and the six-mission / 18-objective First Contact data. Playwright records desktop cleanup FPS with a 5.5 FPS minimum; existing mobile performance criteria remain unchanged.

Post-change CI run 41366739099 is in progress at the time of this entry. No post-change browser pass or physical Android test is claimed yet. Campaign data remains authored content, not wired to runtime mission state.

Next priority after green CI: wire Mission 1 reach-zone and reveal-target objectives to real game state and add browser regression coverage.