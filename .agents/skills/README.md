# Game-dev agent skills integration

Curated Agent Skills from [gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills), stored in `.agents/skills/` for compatible coding agents.

## Included
- Router: chooses the smallest engine/task-specific skill set.
- Web prototype: three.js scene setup, glTF loading, materials and lighting.
- Game design: tower defense, game AI, level design, procedural generation, physics tuning and save systems. The tower-defense wave balancer and its reference guide are included.
- Player experience: UI/UX, game feel, input, camera, assets and audio.
- Engineering: performance optimization and shader programming.

## Project-specific engine boundary
Blue Alert contains an OpenRTS Java/jMonkeyEngine implementation and a separate HTML/Three.js prototype. The three.js skills apply only to the web prototype. For Java/OpenRTS work, preserve the existing engine and use the cross-engine design skills; do not apply three.js APIs to Java code.

## Usage
A compatible coding agent should read `.agents/skills/router/SKILL.md` first, inspect the target project and engine, then read only the selected skill. These files are guidance, not a runtime dependency, and do not modify game behavior by themselves.

Source skills are Apache-2.0; see `THIRD_PARTY_LICENSE`.
