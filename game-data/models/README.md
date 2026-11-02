# Blue Alert — Procedural 3D Model Kit

Original, code-generated Three.js components for the Blue Alert RTS prototype. This kit avoids paid generation APIs and external model downloads.

## Included
- Main battle tank: hull, layered armor, continuous track housings, six road wheels per side, hubs, turret group, cannon, muzzle, exhausts and team marking.
- Infantry unit: torso, helmet, head, backpack, articulated-looking limbs, boots and rifle.
- Buildings: headquarters, barracks, refinery, defense turret, plus generic utility structure.
- Terrain: deterministic low-poly height variation, asphalt road and lane markings, scattered trees and rocks.
- Interactive browser preview: `game-data/models/preview.html`.

## API
Import `blue-alert-models.js` as an ES module and pass the same Three.js namespace used by the game:

```js
import * as THREE from 'three';
import { createTank, createInfantry, createBuilding, createLandscape } from './blue-alert-models.js';

scene.add(createTank(THREE, { team: 'blue' }));
scene.add(createInfantry(THREE, { team: 'red', role: 'rifleman' }));
scene.add(createBuilding(THREE, 'headquarters', { team: 'blue' }));
scene.add(createLandscape(THREE, { size: 80, segments: 48, seed: 17 }));
```

Building types: `headquarters`, `barracks`, `refinery`, `turret`, `utility`.
Team colors: `blue`, `red`, or a palette key.

The tank exposes its turret as `group.userData.turret`; the defense turret exposes `group.userData.rotatingGun`. These can be rotated by gameplay code. Every top-level model exposes a `userData` descriptor for integration.

## Preview
Open `preview.html` through a local static server (module imports are commonly blocked from `file://` URLs). The preview uses Three.js from jsDelivr; the asset module itself has no dependency on a CDN.

## Current scope and limits
These are usable procedural meshes, not sculpted GLB/FBX files. They are designed for immediate use in the existing Three.js renderer. They do not replace game logic, collision, unit pathfinding, animation rigs, or production PBR texture maps. Preview and game integration should be verified in the target browser before describing the assets as fully integrated.


## Version 0.95 — expanded combat asset kit

The original v94 kit remains intact and gains additional procedural Three.js models:
- strike aircraft with fuselage, cockpit, wings, tail, twin engines, landing gear and weapon pylons;
- attack helicopter with cabin, tail boom, main/tail rotor groups, skids and rocket pods;
- reconnaissance quadcopter with four motor/propeller groups and a camera gimbal;
- ballistic projectile with nose, stabilizer fins and tracer;
- explosion effect with hot core, shockwave rings, sparks and smoke puffs;
- short-lived muzzle-flash effect with a hot core and directional flare;
- tracked ore harvester with collection drum, cargo hopper, cabin and drivetrain;
- command citadel with four bastions and a visible energy core;
- capture relay tower and ore-field cluster assets;
- the v94 browser prototype now uses the dedicated harvester, citadel and ore-node models while retaining the original gameplay health, movement and harvesting logic.
- extra reactive armour, side skirts, optics and antennae on the tank; plate carrier, pouches, knee pads and goggles on infantry; exterior lights and service vents on buildings.

The interactive preview exposes all five new asset types. The assets remain original procedural geometry, deliberately avoiding paid generation APIs and unlicensed downloads. They are not AI-sculpted GLB models; rotor spin, projectile travel and explosion lifetime require the game runtime to animate the returned groups. The relay model is an asset for the existing OpenRTS capture-point design; the OpenRTS scenario XML is still not loaded by the browser prototype. Validate scale, hitboxes, animation timing and frame rate in the actual game before gameplay integration.


## Faction-specific main battle tanks (V94)

The same \`createTank(THREE, { team, variant, scale })\` entry point now produces two distinct original silhouettes:

- **BLUE SENTINEL** — low-profile turret, sloped cheek plates, compact laser/rangefinder cluster and cool sensor accents.
- **RED BASTION** — taller reinforced turret, side armor slabs, raised command cupola, protected rangefinder and warm sensor accents.

Both retain the existing outer group and \`userData.turret\` contract used by V94 combat. Track belts remain continuous collision-safe chassis geometry; 36 instanced tread shoes and 60 instanced wheel fasteners add detail without creating one draw call per bolt or shoe. The sloped glacis, engine-deck grilles, fenders, return rollers and hub caps are procedural Three.js geometry. No third-party model, texture, API or paid asset is used.
