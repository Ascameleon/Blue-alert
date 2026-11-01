# BLUE ALERTS — Story, Trailer Script & Storyboard

> Creative production brief for the existing BLUE ALERTS project. This document separates established scenario data from proposed narrative content. It does not claim that unimplemented campaign, dialogue, cinematic or multiplayer systems already exist.

## 1. Product promise

**BLUE ALERTS** is a modern real-time strategy battlefield about command under pressure: build an economy, secure strategic relays, assemble a combined-arms force, and break the opposing command before your own base falls.

**Tagline:** *One frontier. Two commands. No second chance.*

**Tone:** grounded military science-fiction, tense but readable, strategic rather than grim; no real-world nations or political groups.

## 2. World and factions

The opening scenario is **First Contact**, set in the **Frontier Basin**, a temperate industrial frontier scarred by abandoned infrastructure and contested communications relays.

- **Blue Command** — blue identity (#36A9FF). A disciplined expeditionary force built around rapid reconnaissance, resilient logistics and coordinated armour.
- **Red Dominion** — red identity (#F04452). A hardline rival command that prioritizes fortified positions, pressure and denial of strategic ground.

The names, colours, starting positions and command structures are present in the scenario XML. Their deeper history, characters and motivations below are narrative proposals for production, not existing in-game lore.

## 3. Story premise

A chain of three relay stations in the Frontier Basin controls long-range communications across the frontier. When the central relay goes dark, both commands receive contradictory orders and race to secure the basin. Blue Command believes the network can be restored and the frontier stabilized. Red Dominion believes control of the relays is the only way to prevent encirclement.

The first battle begins as a race for information. It becomes a fight for the command network itself. The player must decide whether to invest in power and production, hold the northern and southern approaches, or commit early to the central relay. Every choice changes the shape of the battlefield.

**Narrative question:** Is the objective to win the ground—or to control what the frontier will become after the guns fall silent?

## 4. Core gameplay story loop

1. **Establish command:** protect the HQ and assess the Frontier Basin.
2. **Secure the grid:** build power capacity and keep production online.
3. **Expand the line:** establish infantry and vehicle production.
4. **Take the relays:** contest north, centre and south for strategic income.
5. **Commit combined arms:** use rifle squads, scout vehicles and heavy tanks for complementary roles.
6. **Break the command:** destroy the opposing HQ while keeping your own command structure alive.

The scenario XML defines a 20-minute match limit, 800 starting credits, 120 credits/minute, power starting at 20, a 5,000-credit cap, and three capture relays. It defines the HQ-destruction victory condition. Treat these as scenario-data values until engine loading and in-game behavior are verified.

## 5. Character and voice direction

Keep voice work sparse: radio brevity, clear tactical intent, no long exposition during combat.

- **BLUE COMMANDER (player-facing radio):** calm, analytical, decisive. Short sentences. Never boast.
- **BLUE OPERATIONS OFFICER:** precise and observant; reports resources, relay status and threats.
- **RED FIELD COMMANDER:** controlled, severe, convinced that hesitation means defeat.
- **SYSTEM / ALERT VOICE:** neutral, concise, unmistakable.

### Sample radio lines (proposed)

- Blue Operations: “Command link is unstable. Three relays remain on the grid.”
- Blue Commander: “Secure the central relay. Keep the armour moving.”
- Blue Operations: “Power margin is falling. Production will stall if we expand blindly.”
- Red Commander: “The basin is not yours to inherit. Advance.”
- Blue Operations: “Enemy command structure exposed. This is the window.”
- Blue Commander: “All units, concentrate fire. End this.”

## 6. Opening cinematic — 60-second trailer script

**0–06 s — Signal lost**  
Black screen. A low radio carrier tone breaks into static. A map grid flickers; the Frontier Basin appears in fragments.  
VO (Blue Operations): “Frontier relay network. Last confirmed signal: six hours ago.”

**06–14 s — The two commands**  
Wide aerial reveal: ruined industrial basin, tree lines, distant smoke. Blue Command lights come alive on one side; Red Dominion answers on the other.  
VO: “Two commands received the same silence. Neither intends to retreat.”

**14–23 s — Build the war machine**  
Fast, tactile cuts: power plant turbines engage; barracks doors open; scout vehicle rolls out; tank turret traverses.  
SFX: generator thrum, hydraulic locks, tracked engine ignition.  
VO: “Build your base. Secure your supply. Choose where the line will break.”

**23–34 s — The relay race**  
Infantry move through ruins; scout vehicle crests a ridge; the central relay beacon ignites blue, then flashes red under incoming fire.  
Radio: “Central relay contested!”  
Music rises with restrained percussion.

**34–47 s — Combined-arms clash**  
Tank cannon fires; turret tracks a vehicle; infantry take cover; explosions illuminate smoke and dust. Show readable tactical silhouettes, not chaotic montage.  
VO: “Every unit has a purpose. Every second has a cost.”

**47–55 s — Command under fire**  
The Blue HQ takes damage. A warning pulse spreads across the command UI. Blue forces regroup and advance through the centre.  
Radio: “Enemy command structure exposed.”  
Commander: “All units. One target.”

**55–60 s — Title and invitation**  
A final cannon impact cuts to black. BLUE ALERTS logo resolves over a clean tactical map grid.  
VO: “BLUE ALERTS. One frontier. Two commands. No second chance.”  
On-screen: **FOLLOW DEVELOPMENT · PLAY THE AVAILABLE PROTOTYPE** (only enable a play CTA when the deployed prototype URL has been tested).

## 7. Storyboard — 10 production frames

| # | Duration | Picture / camera | Sound / text | Production note |
|---|---:|---|---|---|
| 1 | 0–6s | Black to a damaged tactical map; slow push-in | Carrier tone, static; “Signal lost” | Establish mystery; no expensive crowd simulation |
| 2 | 6–14s | High wide shot of Frontier Basin, industrial ruins and relay towers | Wind, distant machinery; location title | Use the actual map palette and landmarks |
| 3 | 14–19s | Blue HQ lights and power plant startup; close mechanical inserts | Generator startup, radio boot | Show recognizable existing building silhouettes |
| 4 | 19–23s | Barracks release rifle squad; scout vehicle and tank roll out | Doors, boots, engine | Unit proportions must match in-game assets |
| 5 | 23–29s | Scout vehicle races along tree line toward north relay | Engine, short radio call | Motion readable; camera tracks parallel |
| 6 | 29–34s | Central relay contested; beacon changes colour under fire | Alarm pulse; “Relay contested” | Relay capture is defined in scenario data; cinematic capture must be built |
| 7 | 34–41s | Tank and turret exchange fire; infantry advance in cover | Cannon report, impacts, debris | Prioritize clear silhouettes and impact timing |
| 8 | 41–47s | Tactical overhead shows north/centre/south fronts at once | Percussion builds; map pings | Demonstrate strategic scale, not fake UI features |
| 9 | 47–55s | Blue HQ warning; camera swings to a coordinated counterattack | Warning tone; “Enemy command exposed” | Do not show HUD widgets absent from the game |
| 10 | 55–60s | Logo over dark map grid; clean title card | Music resolves; tagline + CTA | CTA links only to verified destinations |

## 8. Art and audio direction

- **Visual identity:** modern industrial sci-fi, hard-surface vehicles, readable faction colours, restrained emissive accents, dusty temperate terrain, strong value contrast.
- **Camera language:** strategic overhead for decisions; low tracking shots for vehicle weight; short close-ups for machinery and command stakes.
- **Animation:** tank turret traverse, recoil, track movement; infantry locomotion and cover poses; rotating radar/relay elements; restrained destruction states.
- **Effects:** layered muzzle flash, projectile trail, impact flash, dust plume and debris; effects must remain legible at gameplay zoom.
- **Audio:** distinct faction radio filters, mechanical base ambience, weapon signatures by class, positional impact cues, adaptive music that grows with threat.
- **Accessibility:** subtitles for all voice lines, readable alerts, colour-independent faction identification using shape/insignia as well as colour.

## 9. Mission arc proposal

These are proposed campaign chapters; do not list them as playable until implemented and tested.

1. **First Contact** — establish the HQ, survive the first probe, identify the relay network.
2. **Northline** — capture the northern relay while defending the power supply.
3. **Broken Circuit** — restore production after a power disruption; protect the vehicle factory.
4. **The Centre Holds** — contest the central relay against a fortified Red Dominion line.
5. **Steel Horizon** — coordinate infantry, scout vehicles and tanks through the ruins.
6. **Command Breaker** — destroy the enemy HQ before the match timer expires.

Each mission needs: briefing, primary objective, optional objective, enemy composition, map triggers, win/loss state, debrief, QA cases and a clear unlock condition.

## 10. Store / trailer copy

**Short description:**  
Command the Frontier Basin in BLUE ALERTS, a real-time strategy battle of base building, reconnaissance and combined-arms warfare. Secure the relays, manage your resources and protect your command centre.

**Long description:**  
The Frontier Basin has gone silent. Blue Command and Red Dominion are moving to control its communications network—and only one command will hold the line. Build your base, balance power and credits, deploy infantry and armour, and fight for three strategic relays. Read the battlefield, adapt your production and strike at the enemy command before your own HQ falls.

**Feature claims to publish only after verification:** campaign length, skirmish AI difficulty, multiplayer, controller support, mobile compatibility, performance targets, release date, price and platform availability.

## 11. Launch checklist

- [ ] Confirm which game build is the canonical playable product (HTML prototype or OpenRTS port).
- [ ] Confirm the live play URL on desktop and Android; test fresh browser session and CDN failure state.
- [ ] Record genuine gameplay footage from that build; no mock screenshots presented as gameplay.
- [ ] Lock faction logos, game logo, typography, palette and trailer end card.
- [ ] Record/commission voice and original music only after script lock.
- [ ] Verify all trailer claims against the shipped build.
- [ ] Publish privacy, terms, support contact and platform details before collecting data or taking payments.
- [ ] Add store page only after platform, build, price and release status are confirmed.
