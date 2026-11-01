# BLUE ALERTS — Launch & Runbook

This repository currently contains two distinct deliverables: the browser prototype and the OpenRTS Java engine submodule. They are not yet a single integrated game. Choose the target deliberately.

## A. Get the complete repository

Requires Git. Clone with the OpenRTS submodule:

```bash
git clone --recurse-submodules https://github.com/Ascameleon/Blue-alert.git
cd Blue-alert
```

If you already cloned without submodules:

```bash
git submodule update --init --recursive
```

## B. Run the browser prototype

Requires Python 3 (or another static HTTP server) and a modern browser with WebGL. From the repository root:

```bash
python3 -m http.server 8000
```

Open:

- Launch page: http://localhost:8000/docs/launch/
- Browser prototype: http://localhost:8000/docs/

The prototype currently imports Three.js from a CDN. An internet connection is required for that dependency unless the project is changed to bundle it locally. Opening the HTML directly with a file:// URL is not the recommended test path.

## C. Run the OpenRTS Java engine

Requires JDK 21 and network access to download Gradle dependencies on the first build. From the repository root:

```bash
cd engine/OpenRTS
./gradlew run
```

Windows PowerShell:

```powershell
cd engine/OpenRTS
.\gradlew.bat run
```

OpenRTS input hints from its upstream project: F1 game mode, F2 editor, F3 first-person view.

## D. Important integration status

The OpenRTS submodule is pinned to commit 6066640f8ef2fa18b1de3e0dd213e4871b4b8543. It is not yet merged with the browser prototype. The BLUE ALERTS scenario XML is currently a data pack marked as not yet loaded by the engine. Do not assume that its factions, resource values, capture points or victory condition are active in OpenRTS until an engine adapter and end-to-end test prove it.

## E. Release gate

Before publishing a public download or store page:

1. Select and name the canonical build.
2. Run a clean clone and verify the exact command above.
3. Test browser launch on desktop and Android; test CDN failure behavior.
4. Capture real, unedited gameplay footage from the release candidate.
5. Verify selection, movement, attack, production, resource economy, relay control, win/loss, restart and long-session stability.
6. Check every trailer and landing-page claim against that exact build.
7. Add platform, price, release date, support and legal/privacy links only when confirmed.

The landing page is a development page. It does not announce a release date, price, campaign completion or multiplayer availability.
