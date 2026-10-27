# BLUE ALERT — Modern Front (OpenRA foundation)

This directory begins the engine migration for Blue Alert. It is **not yet a playable OpenRA mod**: the engine/SDK must be vendored or initialized from the upstream OpenRAModSDK and then compiled/tested.

## Engine decision

Use [OpenRA](https://github.com/OpenRA/OpenRA) as the RTS runtime rather than extending the old single-file Canvas prototype. OpenRA is a C# RTS engine using SDL/OpenGL and already provides the core simulation systems expected from a real RTS: actors, orders, pathfinding, production, fog of war, combat, maps, lobby and multiplayer.

## Upstream references

- Engine: https://github.com/OpenRA/OpenRA
- Mod SDK: https://github.com/OpenRA/OpenRAModSDK
- EA-published Red Alert source: https://github.com/electronicarts/CnC_Red_Alert
- EA modding guidelines: https://www.ea.com/games/command-and-conquer/news/modding-faq

## Target implementation

1. Bootstrap from OpenRAModSDK; pin an upstream engine/SDK revision.
2. Build an original modern-warfare mod: new faction names, original UI/branding, original maps and original or explicitly redistributable assets.
3. Configure base construction, power/economy, production queues, infantry, vehicles, aircraft, targeting, damage, fog of war and skirmish AI using OpenRA traits/rules.
4. Add the Blue Alert-specific interface and balanced factions without presenting the project as an EA product.
5. Run SDK build and automated smoke tests; launch a skirmish and verify movement, attack, production, defeat/victory and save/replay where supported.

## Why the EA source is not copied wholesale here

EA's Red Alert source is GPLv3 with additional terms. The source-code license does not grant EA trademarks/publicity rights, and does not automatically grant rights to original art/audio assets. Any reused code must retain required notices and compatible licensing. This project must be clearly identified as modified and independent.

## Current verified status

- Branch created: `openra-foundation`.
- Engine migration documentation and a mod metadata starting point are committed in this branch.
- The OpenRA engine has **not** been compiled in this environment and this branch must not be described as a complete or playable release yet.
