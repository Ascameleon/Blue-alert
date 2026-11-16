# Blue Alert — AI and 3D production toolchain

This toolchain supports production of the existing Blue Alert RTS. It does not replace the current Three.js web runtime or the separately maintained OpenRTS Java submodule. No engine migration is authorized by this document.

## Selected tools

| Role | Project | Repository | Use in Blue Alert | Constraints |
|---|---|---|---|---|
| Coding agent | Qwen Code | https://github.com/QwenLM/qwen-code | Inspect the repository, implement bounded changes, run tests and review diffs | Requires a desktop/remote development host, Node.js 22+ for npm install, and user-configured model authentication |
| Prompt/model reference (not approved) | MiniMax H3 | https://github.com/MiniMax-AI/MiniMax-H3 | Not used in the Blue Alert production pipeline pending license review | The upstream model repository points to the MiniMax H3 Community License Agreement, not an OSI-approved open-source license. Its acceptable-use policy includes a prohibition on military purposes; because Blue Alert is a military-themed RTS, do not use H3 or its outputs for this project until qualified legal review confirms that the intended game use is permitted. No separate permissive license for the bundled prompt skill was verified |
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
- MiniMax H3 is excluded from this project's approved toolchain pending qualified license review. The upstream [Community License Agreement](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE) is not an OSI-approved open-source license and its acceptable-use policy prohibits military purposes. Do not install the H3 skill, use H3 model weights, or generate/integrate H3 outputs for this military-themed RTS unless a qualified review confirms the intended use is permitted.
- Connect the official MiniMax MCP only after the owner supplies/configures API credentials and explicitly approves any paid generation.

## Hard boundaries

- No credentials, tokens, or private account data in Git.
- No paid API calls, cloud GPU usage, or credit-consuming generation without explicit approval.
- Do not add the MCP servers as runtime dependencies of the shipped game.
- Do not commit generated media unless the asset license and provenance are recorded.
- Keep the current engine and repository history. A Godot/Unreal/Unity migration requires a separate technical decision.
- A tool is not considered connected until its local/remote endpoint is configured and a harmless smoke test succeeds. Documentation or a GitHub link alone is not proof of connection.

## License audit — 16 November 2026

The following upstream license files were checked before documenting these integrations:

- **Qwen Code:** Apache License 2.0 (`QwenLM/qwen-code/LICENSE`).
- **MiniMax MCP:** MIT (`MiniMax-AI/MiniMax-MCP/LICENSE`); the software license does not make hosted generation free, and API use may be billed.
- **Comfy MCP:** dual-licensed under AGPL-3.0-or-later or a separate commercial license (`Comfy-Org/comfy-mcp/LICENSE`). Do not embed or redistribute it in a proprietary product under the AGPL option without reviewing the obligations; no commercial license is assumed.
- **MCP for Blender:** MIT (`ahujasid/mcp-for-blender/LICENSE`).
- **Godot MCP:** MIT (`Coding-Solo/godot-mcp/LICENSE`); this remains conditional and is not integrated into the current game.
- **MiniMax H3:** the upstream README links to the [MiniMax H3 Community License Agreement](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE). This is a custom community license, not an OSI-approved open-source license; it has territorial restrictions and an acceptable-use policy that prohibits military purposes. Blue Alert therefore does not use H3 or H3-generated outputs pending qualified legal review. No separate permissive license for the bundled prompt skill was verified.

This audit covers the listed upstream project licenses only. Third-party models, assets, textures, generated media and dependencies must be checked independently before redistribution.
