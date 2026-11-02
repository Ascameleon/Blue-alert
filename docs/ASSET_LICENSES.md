# BLUE ALERTS — Third-party asset register

## 3DAssets.dev — Tanks, Military Vehicles and Field Camp

- Source pack: https://3dassets.dev/packs/armoured-column-and-field-camp
- Licence: CC0 1.0 Universal; commercial reuse and modification permitted, attribution not required.
- Models currently integrated:
  - Main Battle Tank: https://cdn.3dassets.dev/assets/23667/v1/model.glb
  - Light Tank: https://cdn.3dassets.dev/assets/23673/v1/model.glb
  - Guard Tower: https://cdn.3dassets.dev/assets/23692/v1/model.glb
- Runtime loader: Three.js GLTFLoader 0.160.0.
- Runtime behavior: models are cloned per instance; mesh materials are cloned before faction tinting; original procedural tank constructors remain as fallback if the CDN or loader is unavailable.
- Limitations: these selected models are static meshes without rigged animation. Vehicle movement and turret aiming are controlled by the existing RTS unit controller; track tread animation is not claimed by this integration.
- Mobile note: GLB downloads require internet access; physical Samsung validation remains a separate acceptance test.

The upstream pack reports 74 models, 3.5 MB total, and CC0 1.0 licensing. Only the three listed models are currently referenced by the game.
