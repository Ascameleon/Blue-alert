# Blue Alert — AI and 3D production toolchain

This toolchain supports production of the existing Blue Alert RTS. It does not replace the current Three.js web runtime or the separately maintained OpenRTS Java submodule. No engine migration is authorized by this document.

## Selected tools

| Role | Project | Repository | Use in Blue Alert | Constraints |
|---|---|---|---|---|
| Coding agent | Qwen Code | https://github.com/QwenLM/qwen-code | Inspect the repository, implement bounded changes, run tests and review diffs | Requires a desktop/remote development host, Node.js 22+ for npm install, and user-configured model authentication |
| Video / prompt skill | MiniMax H3 | https://github.com/MiniMax-AI/MiniMax-H3 | Use the portable `h3-prompt-writing` skill to author consistent cinematic reference prompts | The skill itself does not generate video; hosted generation needs a MiniMax account/API and may consume credits |
| MiniMax API bridge | MiniMax MCP | https://github.com/MiniMax-AI/MiniMax-MCP | Optional connection to MiniMax image/video/audio APIs from an MCP client | API credentials required; generation may be billed. Never store keys in this repository |
| Local image/video workflow | ComfyUI + official Comfy MCP | https://github.com/Comfy-Org/comfy-mcp | Reproducible local workflows for concept art, texture maps, image references and media review | Requires ComfyUI and a capable host/GPU; project license is AGPL-3.0-or-later OR commercial—review before redistribution |
| 3D authoring bridge | MCP for Blender | https://github.com/ahujasid/mcp-for-blender | Create and refine meshes, materials, UVs, rigs, animations, LODs and export GLB/glTF assets | Requires Blender on a desktop/remote host; third-party MIT integration; imported assets retain their own licenses |
| Engine automation (conditional) | Godot MCP | https://github.com/Coding-Solo/godot-mcp | Evaluate only if a separately approved engine migration is chosen | Not integrated into the current Three.js/OpenRTS runtime; do not introduce Godot as an accidental parallel engine |

## Production pipeline

1. Qwen Code reads the current repository and proposes a scoped change; all edits stay on a feature branch.
2. MiniMax H3 / ComfyUI produce visual references only when generation is approved and cost is known.
3. Blender MCP turns approved references or existing assets into real, optimized 3D assets.
4. Export game-ready GLB/glTF with PBR textures, consistent scale/orientation, rig/animation where needed, collision proxies and LODs.
5. Integrate assets into the existing V94 Three.js pipeline without breaking gameplay contracts.
6. Run the existing desktop/mobile rendering and gameplay regression checks; keep OpenRTS validation separate.

## Installation notes (desktop or remote development host)

Qwen Code (Node.js 22+):
```bash
npm install -g @qwen-code/qwen-code@latest
cd /path/to/Blue-alert
qwen
```
Authenticate inside Qwen Code with `/auth`. Do not put API keys in tracked files.

Blender MCP:
```bash
uvx mcp-for-blender setup
```
Then open Blender and restart the chosen MCP client. Follow the upstream README for supported client configuration.

Comfy MCP:
```bash
pip install comfy-mcp "comfy-cli>=1.14.0"
```
This is only the MCP bridge; install and configure ComfyUI separately, then follow the upstream README to connect the local server.

MiniMax:
- Install the portable prompt skill from the H3 repository only if desired: `npx skills add https://github.com/MiniMax-AI/MiniMax-H3 --skill h3-prompt-writing`.
- Connect the official MiniMax MCP only after the owner supplies/configures API credentials and explicitly approves any paid generation.

## Hard boundaries

- No credentials, tokens, or private account data in Git.
- No paid API calls, cloud GPU usage, or credit-consuming generation without explicit approval.
- Do not add the MCP servers as runtime dependencies of the shipped game.
- Do not commit generated media unless the asset license and provenance are recorded.
- Keep the current engine and repository history. A Godot/Unreal/Unity migration requires a separate technical decision.
- A tool is not considered connected until its local/remote endpoint is configured and a harmless smoke test succeeds. Documentation or a GitHub link alone is not proof of connection.
