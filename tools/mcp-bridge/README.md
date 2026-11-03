# Blue Alert — local MCP bridge

This bridge connects Qwen Code to tools running on the same desktop/remote workstation. It does not run inside GitHub Actions and it does not connect to Android apps.

## Zero-cost local path

1. Install Blender 3.0+ and Python 3.10+ on the workstation.
2. Install `uv` using its official installer.
3. Install and enable the Blender addon:
   ```bash
   uvx mcp-for-blender setup
   ```
   If setup is unavailable in the installed release, use `uvx mcp-for-blender install-addon`, then enable **Interface: MCP for Blender** in Blender Preferences.
4. Copy `.qwen/settings.example.json` to `.qwen/settings.json` in the repository root.
5. Start Blender. In the 3D viewport press **N**, open the MCP for Blender panel, and start its server if needed.
6. Restart Qwen Code in this repository and run `/mcp`. The Blender server must show connected before issuing scene-edit commands.

The example uses the local Blender MCP server at 127.0.0.1:9876. Keep the server bound to localhost; do not expose it to the public internet.

## ComfyUI

ComfyUI is a separate local service. Install ComfyUI and the official Comfy MCP server on the same workstation, then configure the exact local MCP transport/command from the current upstream Comfy-Org documentation. Do not point this project at Comfy Cloud: cloud generation consumes credits. The bridge must not start workflows automatically; test only discovery/read-only operations until an operator explicitly approves a generation.

## MiniMax

MiniMax's official MCP server is supported, but it requires a matching regional API host and API key. Hosted image/video/audio generation may be billable. Therefore MiniMax is deliberately **not enabled** in the default zero-cost configuration. Do not add a key to Git or trigger generation. If the owner later authorizes use and accepts any charges, configure the official `minimax-mcp` server locally using environment variables `MINIMAX_API_KEY`, `MINIMAX_API_HOST`, and `MINIMAX_MCP_BASE_PATH`.

## Security and acceptance

- Never commit `.qwen/settings.json`, API keys, OAuth tokens, or local output.
- Do not expose Blender's socket or MCP server outside localhost.
- Qwen authentication is configured interactively on the workstation; no tokens are stored in this repository.
- A GitHub file or successful commit is not proof of a live connection.
- Acceptance requires Qwen `/mcp` to show the server connected and a harmless Blender read-only query to return the running Blender scene.
- No generated assets are added to the game until provenance, license, scale, format, and desktop/mobile regression checks pass.

## Upstream references

- Qwen MCP: https://qwenlm.github.io/qwen-code-docs/en/users/features/mcp/
- Blender MCP: https://github.com/ahujasid/mcp-for-blender
- Comfy MCP: https://github.com/Comfy-Org/comfy-mcp
- MiniMax MCP: https://github.com/MiniMax-AI/MiniMax-MCP
