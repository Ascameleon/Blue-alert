# Game-dev agent skills integration

Curated Agent Skills from [gamedev-skills/awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills), stored in `.agents/skills/` for compatible coding agents.

## Selected skills
- Router: selects relevant engine/task guidance.
- three.js: scene setup, glTF loading, materials and lighting. This is relevant to the existing HTML/Three.js prototype.
- Art assets, UI/UX, game feel, audio design and performance optimization.
- Game AI and tower-defense design for RTS gameplay systems.

## Important project-specific note
The repository also references OpenRTS (Java/jMonkeyEngine). The three.js skills apply only to the existing web prototype; do not apply them to the Java engine. Preserve both implementations and choose the skill set based on the target code.

## Usage
Compatible agents can read `.agents/skills/router/SKILL.md` first, then the smallest relevant skill under `.agents/skills/skills/`. These files are guidance, not a runtime dependency and do not change the game's code.

Source skills are Apache-2.0; see `THIRD_PARTY_LICENSE`.
