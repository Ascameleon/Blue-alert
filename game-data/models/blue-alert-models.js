/**
 * BLUE ALERT — procedural RTS asset kit
 * Original Three.js meshes; no external asset/API dependency.
 * API: createTank(THREE, options), createInfantry(THREE, options),
 * createBuilding(THREE, type, options), createLandscape(THREE, options),
 * createTree(THREE, options), createRock(THREE, options).
 */
const PALETTE = {
  blue: 0x416d83, blueDark: 0x263f4b, blueLight: 0x86a9b5,
  red: 0x963f36, redDark: 0x542b29, olive: 0x68704b,
  metal: 0x77817d, dark: 0x252c2b, glass: 0x8db8c1,
  concrete: 0x777a72, sand: 0x9b8c68, grass: 0x53634b
};
const mat = (THREE, color, roughness=0.82, metalness=0.12) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });
const box = (THREE, parent, name, size, position, material, rotation) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name; mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
};
const cylinder = (THREE, parent, name, rt, rb, h, pos, material, segments=12) => {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segments), material);
  mesh.name=name; mesh.position.set(...pos); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
};
const sphere = (THREE, parent, name, radius, pos, material, scale=[1,1,1]) => {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 8), material);
  mesh.name=name; mesh.position.set(...pos); mesh.scale.set(...scale); mesh.castShadow=true; parent.add(mesh); return mesh;
};
const teamColor = (THREE, team='blue') => mat(THREE, PALETTE[team] ?? PALETTE.blue);
const addMarking = (THREE, group, x, y, z, team) => {
  const stripe = box(THREE, group, 'team-marking', [0.34,0.035,0.07], [x,y,z], teamColor(THREE,team));
  stripe.rotation.y = Math.PI/2; return stripe;
};

export function createTank(THREE, options={}) {
  const { team='blue', variant='main-battle-tank', scale=1 } = options;
  const g = new THREE.Group(); g.name = 'BA_Tank_' + variant;
  const hull=teamColor(THREE,team), armor=mat(THREE,PALETTE.olive), dark=mat(THREE,PALETTE.dark), metal=mat(THREE,PALETTE.metal);
  box(THREE,g,'lower-hull',[2.55,.48,1.48],[0,.55,0],hull);
  box(THREE,g,'upper-hull',[1.85,.35,1.22],[-.12,.91,0],armor);
  // Continuous track housings with individual road wheels.
  for (const side of [-1,1]) {
    box(THREE,g,'track-belt',[2.65,.48,.22],[0,.39,side*.79],dark);
    for (let i=0;i<6;i++) {
      const wheel=cylinder(THREE,g,'road-wheel',.19,.19,.12,[ -.98+i*.39,.38,side*.84],metal,12);
      wheel.rotation.x=Math.PI/2;
      cylinder(THREE,g,'wheel-hub',.075,.075,.135,[-.98+i*.39,.38,side*.84],dark,10).rotation.x=Math.PI/2;
    }
    box(THREE,g,'track-highlight',[1.92,.035,.025],[0,.15,side*.91],mat(THREE,0x9a9b87));
  }
  const turret=new THREE.Group(); turret.name='rotating-turret'; turret.position.set(.05,1.12,0); g.add(turret);
  cylinder(THREE,turret,'turret-ring',.52,.56,.12,[0,0,0],dark,16);
  box(THREE,turret,'turret-body',[1.15,.42,.95],[0,.25,0],hull);
  box(THREE,turret,'commander-hatch',[.32,.12,.31],[-.23,.51,.05],armor);
  cylinder(THREE,turret,'hatch-rim',.19,.19,.05,[-.23,.59,.05],dark,12);
  const barrel=cylinder(THREE,turret,'main-cannon',.105,.14,1.48,[.87,.28,0],metal,12);
  barrel.rotation.z=-Math.PI/2;
  cylinder(THREE,turret,'muzzle',.13,.11,.19,[1.58,.28,0],dark,12).rotation.z=-Math.PI/2;
  // Rear exhausts and lamps.
  for (const z of [-.42,.42]) {
    cylinder(THREE,g,'exhaust',.07,.09,.22,[-1.17,.91,z],dark,8);
    sphere(THREE,g,'rear-lamp',.055,[-1.3,.62,z],mat(THREE,0xb74432));
  }
  addMarking(THREE,g,.15,1.11,-.755,team);
  g.userData={kind:'vehicle',unitType:variant,team,turret};
  g.scale.setScalar(scale); return g;
}

export function createInfantry(THREE, options={}) {
  const { team='blue', role='rifleman', scale=1 }=options;
  const g=new THREE.Group(); g.name='BA_Infantry_'+role;
  const uniform=teamColor(THREE,team), cloth=mat(THREE,PALETTE.olive), boots=mat(THREE,PALETTE.dark), skin=mat(THREE,0xb18a69), gun=mat(THREE,0x252a28);
  box(THREE,g,'torso',[.34,.48,.22],[0,.76,0],uniform);
  sphere(THREE,g,'head',.14,[0,1.12,0],skin,[.88,1.05,.88]);
  cylinder(THREE,g,'helmet',.17,.18,.11,[0,1.24,0],cloth,10);
  box(THREE,g,'helmet-rim',[.34,.035,.27],[0,1.2,0],cloth);
  box(THREE,g,'backpack',[.22,.3,.13],[-.02,.78,-.17],cloth);
  for (const side of [-1,1]) {
    box(THREE,g,'upper-arm',[.12,.32,.13],[side*.23,.79,0],uniform,[0,0,side*-.18]);
    box(THREE,g,'forearm',[.1,.25,.11],[side*.25,.62,.1],cloth);
    box(THREE,g,'leg',[.13,.36,.14],[side*.1,.36,0],cloth,[0,0,side*.04]);
    box(THREE,g,'boot',[.14,.11,.23],[side*.1,.12,.035],boots);
  }
  const rifle=box(THREE,g,'rifle',[.56,.055,.065],[.26,.68,.2],gun,[0,0,-.05]);
  cylinder(THREE,g,'rifle-barrel',.025,.025,.25,[.58,.69,.2],gun,6).rotation.z=-Math.PI/2;
  addMarking(THREE,g,.18,.87,.115,team);
  g.userData={kind:'infantry',role,team,weapon:rifle}; g.scale.setScalar(scale); return g;
}

export function createBuilding(THREE, type='barracks', options={}) {
  const {team='blue',scale=1}=options, g=new THREE.Group(); g.name='BA_Building_'+type;
  const faction=teamColor(THREE,team), concrete=mat(THREE,PALETTE.concrete), dark=mat(THREE,PALETTE.dark), glass=mat(THREE,PALETTE.glass), roof=mat(THREE,0x454d49);
  box(THREE,g,'foundation',[3.5,.22,2.8],[0,.11,0],dark);
  if(type==='headquarters') {
    box(THREE,g,'command-core',[2.35,1.55,1.7],[0,1,0],concrete);
    box(THREE,g,'command-roof',[2.55,.2,1.9],[0,1.83,0],faction);
    box(THREE,g,'front-window',[1.45,.38,.035],[0,1.3,.87],glass);
    box(THREE,g,'comms-tower',[.42,1.1,.42],[-.72,2.45,-.42],roof);
    cylinder(THREE,g,'radar-mast',.035,.035,.9,[-.72,3.38,-.42],dark,8);
    sphere(THREE,g,'radar-dish',.24,[ -.72,3.85,-.42],glass,[1,.25,.55]);
    box(THREE,g,'side-wing',[.65,.85,1.25],[1.35,.6,-.28],roof);
  } else if(type==='barracks') {
    box(THREE,g,'main-hall',[2.85,1.25,2.05],[0,.76,0],concrete);
    box(THREE,g,'roof',[3,.18,2.2],[0,1.48,0],faction);
    box(THREE,g,'garage-door',[1.15,.75,.04],[0,.51,1.04],dark);
    for(let i=-1;i<=1;i++) box(THREE,g,'window',[.28,.23,.035],[i*.78,1.03,1.045],glass);
    box(THREE,g,'side-vent',[.6,.42,.12],[1.2,1.02,-.3],roof);
  } else if(type==='refinery') {
    box(THREE,g,'processing-hall',[2.2,1.05,1.8],[-.25,.64,0],concrete);
    box(THREE,g,'roof',[2.35,.18,1.95],[-.25,1.22,0],faction);
    for(const x of [.65,1.15]) {
      cylinder(THREE,g,'refinery-tank',.38,.42,1.25,[x,.75,-.45],metal,14);
      cylinder(THREE,g,'tank-cap',.39,.39,.09,[x,1.4,-.45],dark,14);
      cylinder(THREE,g,'pipe',.075,.075,1.2,[x,.78,.65],roof,8);
    }
    box(THREE,g,'loading-bay',[.65,.5,.45],[.65,.36,.75],dark);
  } else if(type==='turret') {
    cylinder(THREE,g,'armored-base',.9,1.05,.65,[0,.53,0],concrete,12);
    cylinder(THREE,g,'rotating-platform',.63,.68,.18,[0,.95,0],faction,12);
    const head=new THREE.Group(); head.name='rotating-gun'; head.position.y=1.08; g.add(head);
    box(THREE,head,'turret-head',[1.05,.48,.8],[0,.18,0],faction);
    cylinder(THREE,head,'defense-cannon',.09,.13,1.25,[.7,.22,0],dark,10).rotation.z=-Math.PI/2;
    g.userData.rotatingGun=head;
  } else {
    box(THREE,g,'utility-building',[2.5,1.15,2],[0,.68,0],concrete);
    box(THREE,g,'utility-roof',[2.65,.18,2.15],[0,1.34,0],faction);
    box(THREE,g,'door',[.5,.75,.04],[0,.49,1.02],dark);
    box(THREE,g,'utility-window',[.45,.3,.04],[.75,.95,1.02],glass);
  }
  // faction banner and readable silhouette details
  box(THREE,g,'faction-panel',[.5,.22,.045],[-1.25,1.25,1.04],faction);
  g.userData={kind:'building',buildingType:type,team}; g.scale.setScalar(scale); return g;
}

export function createTree(THREE, options={}) {
  const {scale=1, autumn=false}=options, g=new THREE.Group(); g.name='BA_Tree';
  cylinder(THREE,g,'trunk',.12,.2,1.35,[0,.68,0],mat(THREE,0x594432),7);
  const foliage=mat(THREE,autumn?0x8b7040:0x3f6343);
  sphere(THREE,g,'canopy-lower',.68,[0,1.45,0],foliage,[1,.92,.92]);
  sphere(THREE,g,'canopy-upper',.48,[.12,1.88,-.05],mat(THREE,autumn?0x9c7942:0x52734b),[.9,1,.9]);
  g.scale.setScalar(scale); return g;
}
export function createRock(THREE, options={}) {
  const {scale=1,color=0x77776c}=options, g=new THREE.Group(); g.name='BA_Rock';
  const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.5,0),mat(THREE,color));
  rock.name='weathered-rock'; rock.scale.set(1.3,.72,.9); rock.rotation.set(.18,.4,.1); rock.castShadow=true; rock.receiveShadow=true; g.add(rock);
  g.scale.setScalar(scale); return g;
}
export function createLandscape(THREE, options={}) {
  const {size=80,segments=48,seed=17}=options, g=new THREE.Group(); g.name='BA_Landscape';
  // Deterministic low-amplitude terrain, suitable for an RTS camera.
  const geo=new THREE.PlaneGeometry(size,size,segments,segments);
  const pos=geo.attributes.position;
  let s=seed>>>0;
  const rand=()=>{s=(1664525*s+1013904223)>>>0; return s/4294967296;};
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i), y=pos.getY(i);
    pos.setZ(i, Math.sin(x*.12)*.24+Math.cos(y*.1)*.2+(rand()-.5)*.13);
  }
  geo.computeVertexNormals();
  const ground=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:PALETTE.grass,roughness:1,flatShading:true}));
  ground.name='terrain'; ground.rotation.x=-Math.PI/2; ground.position.y=-.05; ground.receiveShadow=true; g.add(ground);
  const roadMat=mat(THREE,0x68685d), shoulder=mat(THREE,0x8b826c);
  box(THREE,g,'road-shoulder',[size*.82,.06,5.4],[0,.015,0],shoulder);
  box(THREE,g,'asphalt-road',[size*.82,.07,4.3],[0,.05,0],roadMat);
  for(let x=-size*.38;x<size*.4;x+=4.5) box(THREE,g,'road-dash',[1.4,.015,.09],[x,.091,0],mat(THREE,0xd1c9a7));
  // Scatter sparse original low-poly trees and rocks away from the road.
  for(let i=0;i<34;i++){
    const x=(rand()-.5)*size*.88, z=(rand()-.5)*size*.88;
    if(Math.abs(z)<4.8) continue;
    const prop=rand()>.36?createTree(THREE,{scale:.65+rand()*.65}):createRock(THREE,{scale:.6+rand()*.8});
    prop.position.set(x,0,z); g.add(prop);
  }
  g.userData={kind:'landscape',seed,size}; return g;
}
export const BLUE_ALERT_PALETTE = Object.freeze({...PALETTE});
