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
