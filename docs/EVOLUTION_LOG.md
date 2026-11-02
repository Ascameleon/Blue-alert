# BLUE ALERTS — Cumulative Evolution Log

This log records verified source changes only. A design specification, static check, browser test, CI simulation, native desktop interaction, physical Android test and production release are distinct evidence levels.

## Cycle 4 — V94 Mission 01 objective tracking

- Base source: `1b0768b56bc61976391bc6fd930faa3a336e2e7c` (main, 2026-11-02).
- Feature branch: `feat/blue-alerts-mission-objective-runtime-20261102`.
- Scope: the existing playable V94 scenario, Mission 01 — Percée Nord. This is not a claim that the separate six-mission First Contact campaign data has been wired into the runtime.
- Runtime change: replace the misleading citadel-HP-only mission bar with three evaluated gameplay objectives:
  1. Deliver 600 minerals. Progress is recorded only when a harvester unloads cargo at a friendly refinery or HQ; starting credits and un-delivered ore do not count.
  2. Produce three combat units. Progress is recorded only when the player production queue completes infantry, light or heavy units; starting forces and harvesters do not count.
  3. Destroy the enemy citadel. Completion is set by the existing building damage/death path for the team-2 citadel.
- Presentation: objective check states and per-objective counts in the desktop mission panel; a compact active-objective/count/progress HUD on mobile.
- QA: added a query-gated mission snapshot/probe so the browser suite can verify initial state, delivery, production, final combat completion and mobile presentation.
- Regression coverage: desktop and mobile Playwright checks plus static source-contract and JavaScript syntax validation.

### Exact source commits

- Runtime: `4e6da2d01ac1512cdf99f33a99a53207c4c6786a` — `BLUE_ALERTS_v94_ASSET_INTEGRATION.html`.
- Browser tests: `5d9140a42788989ebd3129d96cd3e51b518d8ce4` — `scripts/validate_v94_browser.mjs`.
- Static validator: `240ff5ca129d04eb1d1c387097592d9d9410a37d` — `scripts/validate_v94.py`.
- Documentation: this file, committed after the three source/test changes.

### Validation boundary at this checkpoint

- The feature branch contains the runtime, browser-test and static-validator changes above.
- The feature has been ported onto the post-terrain mainline. Full browser, OpenRTS and native interaction validation is pending on the rebased branch head.
- The existing main-branch baseline run `41366901893` passed its V94 desktop/mobile browser validation, standalone HTML build, OpenRTS build and native desktop selection/movement/attack smoke test. That run tested base commit `9ee75ddca9d7773c251cd1cf824a7b6df50abc4f`, not this feature branch.
- Existing main-branch graphical artifact: `openrts-graphical-smoke-test` (artifact `13107407250`). The connector exposed the artifact metadata and job logs but not the binary screenshot contents for direct visual inspection in this run.
- Follow-up gameplay integrity fix: the enemy citadel is now locked at 1 HP until both delivery and production objectives are complete; a browser regression attempts an early citadel kill and verifies the mission remains active.
- No physical Samsung/Android device was tested.
- No paid APIs, assets, credits or services were used.

### Next priority after this branch is green

Wire the authored First Contact campaign content to real runtime mission state in small, testable increments. Do not label a map layout or objective JSON as playable until zone capture, escort, hold timers, wave director, briefing/debrief and failure conditions are implemented and tested in the V94 runtime.

## Cycle 5 — mobile mission toast clearance

- Parent gameplay: PR #28, Mission 01 objective HUD and early-citadel lock.
- Visual evidence inspected: artifact `13109028287`, screenshot `mobile-v94-mission-progress-390x844.png` (390×844 browser emulation).
- Verified issue: the mission-start toast at `top:48px` overlaps the mobile command row at `top:42px`; the screenshot visibly covers the attack-move/center controls.
- Runtime correction: mobile-only toast placement moved to `top:210px`, below the command row and objective card. Desktop toast placement is unchanged.
- Regression: Playwright forces a visible toast and asserts its bounding box intersects neither `#mobileCommands` nor `#mobileMission`; captures `mobile-v94-mission-toast-clearance-390x844.png`.
- Source/test commits: `793dfa0afaa353da437ab5d121729f388dc2d3db` and `ecfc696aaf1912aa075cb4dd4aba901475c96d36`.
- Validation status: pending on this stacked branch head; no merge claim. Browser mobile remains emulation, not physical Samsung testing.
