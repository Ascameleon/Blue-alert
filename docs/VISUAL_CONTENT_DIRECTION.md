# BLUE ALERTS — Visual & Content Direction 1.0

Status: production specification for the existing Three.js prototype. This is a design/content foundation, not a claim that new 3D assets or gameplay have already been integrated.

## Creative target

Move from toy-like low-poly RTS presentation to a grounded, readable, premium military strategy game. Keep the existing BLUE ALERTS identity, blue/red faction readability, mobile-first playability and the current game's source lineage. Do not imitate a named commercial game or reuse unlicensed assets.

### Art direction: "Industrial near-future, 2030s"

- Materials: painted armor with edge wear, dark rubber, brushed steel, concrete, dusty glass, restrained emissive optics.
- Silhouette first: each unit must be recognizable at gameplay camera distance before small detail is added.
- Palette: friendly forces use desaturated naval blue + pale markings; hostile forces use oxide red + charcoal; neutral infrastructure uses concrete, olive and warning amber.
- Lighting: clear daylight baseline, warm industrial practicals, restrained fog and contact shadows. Avoid oversaturated bloom and plastic-looking specular.
- Environment: functional military-industrial sites, service roads, drainage, barriers, cable trays, power equipment, loading bays, perimeter lights and believable terrain transitions.
- UI: compact command-console language, strong contrast, consistent spacing, large touch targets, no clipped labels or tiny critical text.

## Asset quality gates

Every new production asset must pass all gates before it is integrated:
1. Original or license-verified source; record source URL, license and attribution.
2. Editable source retained (Blender or source format) plus exported GLB/glTF.
3. Correct scale, origin, forward axis, faction material variants and collision proxy.
4. PBR maps where appropriate; texture budgets defined per LOD.
5. At least 3 LOD levels for large/repeated assets; instancing for repeated props.
6. Animation contract for moving parts (turret, barrel, tracks, wheels, doors, radar).
7. In-engine preview at gameplay camera distance and on a representative mobile GPU.
8. Runtime performance and memory measured; no showcase-only asset accepted as completed work.

## First content pack: "First Contact"

### Battlefield
A damaged logistics and energy-transfer facility at the edge of a dry industrial basin. Three readable combat lanes: elevated service road, central loading yard, and low drainage route. The HQ is visible from spawn; resource nodes and capture points create meaningful movement decisions.

Set dressing: concrete jersey barriers, road markings, cable reels, transformer banks, pipes, ventilation units, floodlights, cargo pallets, sand berms, wreckage and sparse hardy vegetation. Props must not obstruct pathfinding or touch controls.

### Friendly faction — Blue Directorate
- Command Hub: headquarters, communications mast, command windows, generator connection.
- Bastion MBT: heavy tracked tank, rotating turret, layered side armor, optics and visible running gear.
- Lynx IFV: lighter tracked transport/support vehicle with troop compartment.
- Ranger squad: 4-person rifle squad with distinct silhouettes, backpacks and readable team markings.
- Warden artillery: long-range support vehicle; slow traverse and clear firing feedback.
- Utility truck: logistics and repair role.

### Hostile faction — Red Front
Use a distinct silhouette language, not merely recolored blue assets: angular armor plates, exposed external stowage, different turret profile, asymmetric sensor mast and red/oxide identification panels.
- Redoubt MBT: enemy heavy armor.
- Sentry gun: deployable perimeter defense.
- Raider squad: fast infantry with lighter kit.
- Siege carrier: slow support platform.

### Mission sequence
1. First Contact — identify the enemy HQ; learn camera, selection and move.
2. Secure the Yard — capture a relay point while defending a resource route.
3. Broken Convoy — escort a damaged utility truck through an ambush lane.
4. Power Cut — disable two substations to weaken enemy defenses.
5. Hold the Line — survive coordinated armor and infantry waves.
6. Counterstrike — destroy the enemy command hub after opening one of two tactical routes.

Each mission needs a clear objective, one optional objective, readable briefing, success/failure conditions and a post-mission debrief. Do not add mission text that is not wired to gameplay.

## Camera-distance readability

- Strategic camera: unit silhouette, team color and health state readable.
- Tactical zoom: turret, weapon class, squad count and damage state readable.
- Close inspection: material breakup, bolts, optics, stowage and animation detail visible.
The game must remain legible at the default mobile camera; detail must never replace silhouette.

## UI and mobile acceptance

- All labels wrap or abbreviate intentionally; no mid-word clipping.
- Minimum touch target 44 CSS px; primary combat actions separated from destructive actions.
- Safe-area insets respected; no HUD overlap with browser/system navigation.
- Minimap remains tappable and does not obscure mission-critical terrain.
- Selection feedback, command confirmation and unavailable-action reasons are explicit.
- Test portrait and landscape; keep the current layout usable on narrow phones.

## Production order (one integrated vertical slice)

1. Lock one friendly MBT and one hostile MBT as quality benchmark assets.
2. Integrate both into the existing Three.js runtime with faction materials, LODs, collision and turret animation.
3. Replace one battlefield sector with the industrial logistics yard set.
4. Integrate one infantry squad with locomotion/idle/attack animation and selection.
5. Wire First Contact mission objectives to real game state.
6. Validate desktop browser and a physical Android device; capture screenshots and frame-time/memory evidence.
7. Only then expand the asset pack and mission campaign.

## Definition of done

A design document, render, model viewer or static scene is not a playable improvement. A milestone is done only when the content is integrated into the existing game, interactions work, automated regression tests pass, browser runtime is inspected, and mobile validation is recorded separately. Preserve the original prototype and use a reversible feature branch for all work.
