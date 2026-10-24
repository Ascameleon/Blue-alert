# RTS engine audit — BLUE ALERTS

Audit date: 2026-10-24. This document distinguishes repositories inspected from code actually integrated.

## Decision

**Primary 3D engine candidate: OpenRTS** — https://github.com/methusalah/OpenRTS

Why:
- Generic 3D RTS engine rather than a camera-only plugin or a clone tied to a specific commercial game's data formats.
- MIT license, Java/jMonkeyEngine, Gradle launch path and example data.
- Already connected in this repository as the Git submodule `engine/OpenRTS`, pinned to `6066640f8ef2fa18b1de3e0dd213e4871b4b8543`.

Limitations:
- Upstream says it is still under development.
- The submodule pointer proves source linkage, not that the game builds, launches, or contains BLUE ALERTS gameplay.
- Must validate build on a clean checkout before porting gameplay.

## Alternatives reviewed

| Repository | Potential value | Decision |
|---|---|---|
| https://github.com/OpenSAGE/OpenSAGE | C# reimplementation of the SAGE engine used by Command & Conquer: Generals; useful for studying RTS architecture and data formats | Do not integrate as runtime now: upstream describes itself as early-stage, focused on compatibility with specific games, and not yet playable |
| https://github.com/DigitalExtinction/Game | Modern Rust + Bevy RTS, useful for ideas around large unit counts and simulation architecture | Do not adopt as dependency: the upstream repository is archived/read-only and its source is AGPL-3.0; assets have separate CC BY-SA licensing |
| https://github.com/EmilHakala/3D-RTS-Camera | Godot 4 RTS camera reference | Not compatible with current Java/HTML runtime; use only if a deliberate Godot migration is chosen |
| https://github.com/testman42/3D-RTS | Godot RTS template | Small tutorial/template, not a drop-in dependency for this Java/Three.js project |
| https://github.com/GoldenArmor/HostileKingdom | Unity 3D RTS project | Unity/C# stack mismatch; not adopted |

## Integration plan

1. Keep `BLUE_ALERTS.html` intact as the preserved web prototype.
2. Initialize the OpenRTS submodule and run `./gradlew run` with JDK 21 in a clean environment; capture actual build/runtime outcome.
3. Inspect OpenRTS's existing scene, units, pathfinding, orders, economy and UI before modifying it.
4. Port BLUE ALERTS mechanics incrementally into the Java engine; do not claim a port until the corresponding mechanics exist and are tested.
5. Add automated checks for compilation and data/config integrity, then do a manual gameplay smoke test.
6. Keep upstream projects as references/submodules only where there is a concrete technical need. Do not vendor multiple full engines into one runtime.

## Licensing and scope

OpenRTS: MIT. Digital Extinction: AGPL-3.0 source license, with assets potentially under separate CC BY-SA terms. OpenSAGE has its own license files and is non-commercial according to its README; review the current license before any redistribution or commercial use. This audit does not grant rights to third-party assets or proprietary game files.

## Verification boundary

Verified from GitHub metadata in this repository: OpenRTS submodule pointer and preserved HTML prototype are present. Not yet verified by this document: successful local Java build, successful launch, playable integration, or equivalence to the target reference image.
