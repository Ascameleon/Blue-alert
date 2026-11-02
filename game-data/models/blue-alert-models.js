/**
 * BLUE ALERT — procedural RTS asset kit
 * Original Three.js meshes; no external asset/API dependency.
 * API: createTank, createInfantry, createHarvester, createBuilding, createCitadel,
 * createAircraft, createHelicopter, createDrone, createProjectile, createExplosion,
 * createMuzzleFlash, createRelay, createOreNode, createLandscape, createTree, createRock.
 */
const PALETTE = {
  blue: 0x416d83, blueDark: 0x263f4b, blueLight: 0x86a9b5,
  red: 0x963f36, redDark: 0x542b29, olive: 0x68704b,
  metal: 0x77817d, dark: 0x252c2b, glass: 0x8db8c1,
  concrete: 0x777a72, sand: 0x9b8c68, grass: 0x53634b
};
const mat = (THREE, color, roughness=0.82, metalness=0.12) =>
  new THREE.MeshPhysicalMaterial({
    color, roughness, metalness,
    clearcoat: metalness > 0.35 ? 0.32 : 0.12,
    clearcoatRoughness: 0.38,
    reflectivity: 0.62,
    envMapIntensity: metalness > 0.35 ? 1.25 : 0.8
  });
const box = (THREE, parent, name, size, position, material, rotation) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name; mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
};
const beveledBoxGeometry = (THREE, size, bevel = 0.04) => {
  const [width, height, depth] = size;
  const b = Math.min(bevel, width * 0.12, height * 0.12, depth * 0.12);
  const cornerCut = Math.min(width, height) * 0.18;
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2 + b + cornerCut, -height / 2 + b);
  shape.lineTo(width / 2 - b - cornerCut, -height / 2 + b);
  shape.lineTo(width / 2 - b, -height / 2 + b + cornerCut);
  shape.lineTo(width / 2 - b, height / 2 - b - cornerCut);
  shape.lineTo(width / 2 - b - cornerCut, height / 2 - b);
  shape.lineTo(-width / 2 + b + cornerCut, height / 2 - b);
  shape.lineTo(-width / 2 + b, height / 2 - b - cornerCut);
  shape.lineTo(-width / 2 + b, -height / 2 + b + cornerCut);
  shape.closePath();
  const innerDepth = Math.max(0.02, depth - 2 * b);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: innerDepth,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: b,
    bevelThickness: b,
    curveSegments: 2
  });
  geometry.translate(0, 0, -innerDepth / 2);
  geometry.computeVertexNormals();
  geometry.userData.beveledArmor = true;
  return geometry;
};
const beveledBox = (THREE, parent, name, size, position, material, rotation, bevel = 0.04) => {
  const mesh = new THREE.Mesh(beveledBoxGeometry(THREE, size, bevel), material);
  mesh.name = name;
  mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.beveledArmor = true;
  parent.add(mesh);
  return mesh;
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
  const isRed = team === 'red';
  const isHeavy = variant === 'heavy';
  const factionProfile = isRed ? 'RED_BASTION' : 'BLUE_SENTINEL';
  const g = new THREE.Group();
  g.name = 'BA_Tank_' + (isRed ? 'RedBastion' : 'BlueSentinel') + '_' + variant;

  const hull = teamColor(THREE, team);
  const armor = mat(THREE, isRed ? 0x716052 : 0x68745d, .72, .24);
  const dark = mat(THREE, 0x20292b, .9, .04);
  const metal = mat(THREE, 0x89938e, .38, .68);
  const edge = mat(THREE, isRed ? 0xd07a4d : 0x6fc0d2, .38, .52);
  const optics = mat(THREE, isRed ? 0xf0a45e : 0x83d9ed, .2, .7);
  const rubber = mat(THREE, 0x1d2527, .96, .02);
  const heavyArmor = mat(THREE, isRed ? 0x897463 : 0x87908a, .66, .32);

  const addInstances=(parent,name,geometry,material,transforms)=>{
    const mesh=new THREE.InstancedMesh(geometry,material,transforms.length);
    mesh.name=name;
    mesh.castShadow=true;
    mesh.receiveShadow=true;
    mesh.userData.beveledArmor=!!geometry.userData?.beveledArmor;
    const transform=new THREE.Object3D();
    transforms.forEach((item,index)=>{
      transform.position.set(...(item.position||[0,0,0]));
      transform.rotation.set(...(item.rotation||[0,0,0]));
      transform.scale.set(...(item.scale||[1,1,1]));
      transform.updateMatrix();
      mesh.setMatrixAt(index,transform.matrix);
    });
    mesh.instanceMatrix.needsUpdate=true;
    parent.add(mesh);
    return mesh;
  };

  // Layered hull: lower chassis, raised crew cell and a sloped forward glacis.
  beveledBox(THREE,g,'lower-hull',[2.62,.48,1.5],[0,.55,0],hull,null,.055);
  beveledBox(THREE,g,'upper-hull',[1.9,.35,1.22],[-.12,.91,0],armor,null,.045);
  beveledBox(THREE,g,'front-glacis',[.72,.2,1.22],[.82,.72,0],heavyArmor,[0,0,-.34],.028);
  beveledBox(THREE,g,'engine-deck',[.76,.13,.98],[-.82,1.105,0],dark,null,.018);

  const grilleTransforms=Array.from({length:7},(_,i)=>({position:[-1.12+i*.1,1.18,0]}));
  addInstances(g,'engine-deck-grilles-instanced',new THREE.BoxGeometry(.055,.025,.78),metal,grilleTransforms);
  const armorTileTransforms=[];
  const skirtTransforms=[];
  const fenderTransforms=[];
  const smokeTransforms=[];
  const rollerTransforms=[];
  for(const side of [-1,1]){
    for(let i=0;i<4;i++) armorTileTransforms.push({
      position:[-.72+i*.43,.73,side*.68],rotation:[0,0,side*.05]
    });
    skirtTransforms.push({position:[-.04,.56,side*.74]});
    fenderTransforms.push({position:[.94,.65,side*.79],rotation:[0,0,-.12]});
    fenderTransforms.push({position:[-1.02,.65,side*.79],rotation:[0,0,.1],scale:[.9,1,1]});
    for(let i=0;i<2;i++) smokeTransforms.push({
      position:[.68+i*.15,1.05,side*.48],rotation:[0,0,Math.PI/2]
    });
    for(const x of [-.55,.25,.82]) rollerTransforms.push({
      position:[x,.68,side*.84],rotation:[Math.PI/2,0,0]
    });
  }
  addInstances(g,'reactive-armor-tiles-instanced',beveledBoxGeometry(THREE,[.3,.19,.1],.014),heavyArmor,armorTileTransforms);
  addInstances(g,'side-skirt-armor-instanced',beveledBoxGeometry(THREE,[1.62,.18,.1],.012),armor,skirtTransforms);
  addInstances(g,'fenders-instanced',beveledBoxGeometry(THREE,[.38,.09,.2],.012),hull,fenderTransforms);
  addInstances(g,'smoke-dischargers-instanced',new THREE.CylinderGeometry(.045,.055,.16,8),dark,smokeTransforms);
  addInstances(g,'return-rollers-instanced',new THREE.CylinderGeometry(.075,.075,.12,10),metal,rollerTransforms);

  beveledBox(THREE,g,'commander-hatch',[.32,.08,.3],[-.62,1.12,.08],dark,null,.012);
  cylinder(THREE,g,'hatch-rim',.19,.19,.05,[-.62,1.17,.08],metal,12);
  sphere(THREE,g,'gunner-optic',.075,[.36,1.18,.28],optics,[1,.55,.7]);
  cylinder(THREE,g,'radio-antenna',.018,.018,.72,[-.86,1.42,-.35],dark,6);

  // Track belts, road wheels, hubs and tread shoes are batched by part type.
  const beltTransforms=[],wheelTransforms=[],hubTransforms=[],capTransforms=[];
  const shoeTransforms=[],boltTransforms=[];
  for(const side of [-1,1]){
    beltTransforms.push({position:[0,.39,side*.79]});
    for(let i=0;i<6;i++){
      const x=-.98+i*.39;
      wheelTransforms.push({position:[x,.38,side*.84],rotation:[Math.PI/2,0,0]});
      hubTransforms.push({position:[x,.38,side*.84],rotation:[Math.PI/2,0,0]});
      capTransforms.push({position:[x,.38,side*.84],rotation:[Math.PI/2,0,0]});
      for(let bolt=0;bolt<5;bolt++){
        const angle=(bolt/5)*Math.PI*2;
        boltTransforms.push({
          position:[x+Math.cos(angle)*.12,.38+Math.sin(angle)*.12,side*.914],
          rotation:[Math.PI/2,0,0]
        });
      }
    }
    for(let i=0;i<18;i++) shoeTransforms.push({
      position:[-1.18+i*.139,.39,side*.925],
      rotation:[0,0,(i%2===0?-.025:.025)]
    });
  }
  addInstances(g,'track-belts-instanced',new THREE.BoxGeometry(2.68,.48,.22),rubber,beltTransforms);
  addInstances(g,'road-wheels-instanced',new THREE.CylinderGeometry(.19,.19,.13,16),metal,wheelTransforms);
  addInstances(g,'wheel-hubs-instanced',new THREE.CylinderGeometry(.085,.085,.145,12),dark,hubTransforms);
  addInstances(g,'wheel-hub-caps-instanced',new THREE.CylinderGeometry(.045,.045,.155,10),edge,capTransforms);
  addInstances(g,'track-shoe-instanced',new THREE.BoxGeometry(.105,.29,.035),mat(THREE,0x56605d,.88,.28),shoeTransforms);
  addInstances(g,'wheel-bolts-instanced',new THREE.CylinderGeometry(.018,.018,.026,6),mat(THREE,0xc1c6bd,.42,.72),boltTransforms);

  // The two factions have distinct turret silhouettes, not just different paint.
  const turret=new THREE.Group();
  turret.name='rotating-turret';
  turret.position.set(.05,1.12,0);
  g.add(turret);
  cylinder(THREE,turret,'turret-ring',.54,.58,.13,[0,0,0],dark,18);
  let factionDetailCounts={};
  if(isRed){
    beveledBox(THREE,turret,'turret-body',[1.3,.5,1.08],[0,.29,0],hull,null,.055);
    beveledBox(THREE,turret,'red-bastion-roof-plate',[.82,.12,.84],[-.08,.57,0],armor,null,.018);
    const redCheeks=[],redSidePlates=[],redSmoke=[];
    for(const side of [-1,1]){
      redCheeks.push({position:[-.12,.24,side*.59],rotation:[0,0,side*.09]});
      redSidePlates.push({position:[-.08,.08,side*.63]});
      redSmoke.push({position:[.42,.42,side*.38],rotation:[0,0,Math.PI/2]});
    }
    addInstances(turret,'red-turret-cheeks-instanced',beveledBoxGeometry(THREE,[.52,.3,.18],.02),heavyArmor,redCheeks);
    addInstances(turret,'red-bastion-side-plates-instanced',beveledBoxGeometry(THREE,[.62,.13,.12],.012),edge,redSidePlates);
    cylinder(THREE,turret,'red-bastion-cupola',.18,.2,.15,[-.34,.64,0],dark,12);
    cylinder(THREE,turret,'red-bastion-rangefinder',.07,.08,.18,[.1,.66,.3],optics,10).rotation.z=Math.PI/2;
    addInstances(turret,'red-bastion-smoke-banks-instanced',new THREE.CylinderGeometry(.055,.06,.22,8),dark,redSmoke);
    factionDetailCounts={turretCheeks:2,turretSidePlates:2,smokeBanks:2};
  }else{
    beveledBox(THREE,turret,'turret-body',[1.22,.36,.96],[0,.24,0],hull,null,.045);
    beveledBox(THREE,turret,'blue-sentinel-crown',[.78,.12,.8],[-.12,.47,0],armor,null,.018);
    const blueCheeks=[];
    for(const side of [-1,1]) blueCheeks.push({
      position:[.16,.2,side*.53],rotation:[0,0,side*.13]
    });
    addInstances(turret,'blue-turret-cheeks-instanced',beveledBoxGeometry(THREE,[.46,.23,.16],.018),heavyArmor,blueCheeks);
    cylinder(THREE,turret,'blue-sentinel-optic',.075,.085,.16,[.38,.48,.26],optics,10).rotation.z=Math.PI/2;
    cylinder(THREE,turret,'blue-sentinel-laser-rangefinder',.045,.05,.12,[.42,.38,-.28],edge,10).rotation.z=Math.PI/2;
    beveledBox(THREE,turret,'blue-sentinel-rear-sensor',[.25,.12,.32],[-.42,.43,0],dark,null,.012);
    factionDetailCounts={turretCheeks:2,turretSidePlates:0,smokeBanks:0};
  }
  if(isHeavy){
    const reinforcementTransforms=[];
    for(const side of [-1,1]) reinforcementTransforms.push({
      position:[-.28,.23,side*.64],rotation:[0,0,side*.08]
    });
    addInstances(turret,'heavy-turret-reinforcements-instanced',beveledBoxGeometry(THREE,[.5,.25,.14],.016),heavyArmor,reinforcementTransforms);
    beveledBox(THREE,turret,'heavy-turret-roof-armor',[.62,.1,.76],[-.16,.67,0],armor,null,.014);
  }
  beveledBox(THREE,turret,'commander-hatch',[.32,.12,.31],[-.23,.53,.05],armor,null,.012);
  cylinder(THREE,turret,'hatch-rim',.19,.19,.05,[-.23,.6,.05],dark,12);
  const barrel=cylinder(THREE,turret,'main-cannon',.105,.14,isHeavy?1.72:1.52,[.88,.3,0],metal,14);
  barrel.rotation.z=-Math.PI/2;
  const barrelCollar=cylinder(THREE,turret,'cannon-thermal-collar',.145,.145,.16,[1.27,.3,0],heavyArmor,12);
  barrelCollar.rotation.z=-Math.PI/2;
  const muzzle=cylinder(THREE,turret,'muzzle',.13,.11,.2,[isHeavy?1.76:1.66,.3,0],dark,12);
  muzzle.rotation.z=-Math.PI/2;

  const exhaustTransforms=[],lampTransforms=[],towTransforms=[];
  for(const side of [-1,1]){
    exhaustTransforms.push({position:[-1.17,.91,side*.42]});
    lampTransforms.push({position:[-1.3,.62,side*.42]});
    towTransforms.push({position:[-1.28,.49,side*.48]});
  }
  addInstances(g,'exhausts-instanced',new THREE.CylinderGeometry(.07,.09,.22,8),dark,exhaustTransforms);
  addInstances(g,'rear-lamps-instanced',new THREE.SphereGeometry(.055,10,8),mat(THREE,0xb74432),lampTransforms);
  addInstances(g,'rear-tow-points-instanced',new THREE.BoxGeometry(.14,.08,.08),metal,towTransforms);
  addMarking(THREE,g,.15,1.11,-.755,team);

  g.userData={
    kind:'vehicle',unitType:variant,team,turret,factionProfile,
    trackShoeInstances:shoeTransforms.length,
    wheelBoltInstances:boltTransforms.length,
    detailInstances:{
      engineGrilles:grilleTransforms.length,
      reactiveArmorTiles:armorTileTransforms.length,
      returnRollers:rollerTransforms.length,
      roadWheels:wheelTransforms.length,
      wheelHubs:hubTransforms.length,
      wheelHubCaps:capTransforms.length,
      smokeDischargers:smokeTransforms.length,
      faction: factionDetailCounts
    }
  };
  const beveledArmorParts = [];
  g.traverse(object => {
    if (object.isMesh && object.geometry?.userData?.beveledArmor) beveledArmorParts.push(object.name);
  });
  g.userData.beveledArmorPartCount = beveledArmorParts.length;
  g.userData.beveledArmorParts = beveledArmorParts;
  g.scale.setScalar(scale);
  return g;
}

export function createInfantry(THREE, options={}) {
  const { team='blue', role='rifleman', scale=1 }=options;
  const g=new THREE.Group(); g.name='BA_Infantry_'+role;
  const uniform=teamColor(THREE,team), cloth=mat(THREE,PALETTE.olive), boots=mat(THREE,PALETTE.dark), skin=mat(THREE,0xb18a69), gun=mat(THREE,0x252a28);
  box(THREE,g,'torso',[.34,.48,.22],[0,.76,0],uniform);
  sphere(THREE,g,'head',.14,[0,1.12,0],skin,[.88,1.05,.88]);
  cylinder(THREE,g,'helmet',.17,.18,.11,[0,1.24,0],cloth,10);
  box(THREE,g,'helmet-rim',[.34,.035,.27],[0,1.2,0],cloth);
  const armorPlate=mat(THREE,0x56645b,.72,.18), lens=mat(THREE,0x8fc5d0,.18,.55);
  box(THREE,g,'plate-carrier',[.31,.29,.25],[0,.78,.13],armorPlate);
  for(const side of [-1,1]){
    box(THREE,g,'utility-pouch',[.11,.13,.12],[side*.19,.68,.13],cloth);
    box(THREE,g,'knee-pad',[.16,.12,.17],[side*.1,.31,.08],armorPlate);
    sphere(THREE,g,'helmet-goggle-lens',.045,[side*.075,1.17,.12],lens,[1,.7,.45]);
  }
  box(THREE,g,'radio-antenna',[.025,.42,.025],[-.13,1.12,-.2],boots);
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
  let rotatingGun = null;
  const faction=teamColor(THREE,team), concrete=mat(THREE,PALETTE.concrete), dark=mat(THREE,PALETTE.dark), glass=mat(THREE,PALETTE.glass), roof=mat(THREE,0x454d49);
  const metal=mat(THREE,PALETTE.metal,0.38,0.72);
  box(THREE,g,'foundation',[3.5,.22,2.8],[0,.11,0],dark);
  if(type==='headquarters') {
    box(THREE,g,'command-core',[2.35,1.55,1.7],[0,1,0],concrete);
    box(THREE,g,'command-roof',[2.55,.2,1.9],[0,1.83,0],faction);
    box(THREE,g,'front-window',[1.45,.38,.035],[0,1.3,.87],glass);
    // Sculpted communications tower replacing the old square mast.
    cylinder(THREE,g,'comms-tower-shaft',.2,.34,1.25,[-.72,2.48,-.42],roof,10);
    cylinder(THREE,g,'comms-platform',.58,.58,.12,[-.72,3.12,-.42],metal,12);
    cylinder(THREE,g,'radar-cabin',.43,.43,.46,[-.72,3.42,-.42],glass,12);
    cylinder(THREE,g,'radar-roof',.48,.48,.1,[-.72,3.7,-.42],faction,12);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const mullion=box(THREE,g,'radar-cabin-mullion',[.035,.4,.035],[-.72+Math.cos(a)*.42,3.42,-.42+Math.sin(a)*.42],dark);mullion.rotation.y=-a;}
    cylinder(THREE,g,'radar-mast',.025,.025,.58,[-.72,4.02,-.42],dark,8);
    const dish=cylinder(THREE,g,'radar-dish',.28,.28,.045,[-.72,4.26,-.42],glass,16);dish.rotation.x=Math.PI/2.7;
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
  } else if(type==='controlTower' || type==='tower') {
    // Elevated octagonal air-traffic/control tower: tapered shaft, buttresses and panoramic glazed cab.
    const shaft=mat(THREE,0x68777a,.72,.28), trim=mat(THREE,0x303d42,.42,.55), warning=mat(THREE,0xe2ad45,.48,.28);
    const beaconMat=new THREE.MeshStandardMaterial({color:0xffc75a,emissive:0xff9e36,emissiveIntensity:.8,roughness:.28,metalness:.18});
    cylinder(THREE,g,'tower-foundation',1.18,1.35,.34,[0,.28,0],dark,12);
    cylinder(THREE,g,'tower-pedestal',.72,.95,.62,[0,.72,0],concrete,10);
    cylinder(THREE,g,'tapered-control-shaft',.48,.72,3.05,[0,2.48,0],shaft,10);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const brace=box(THREE,g,'tower-buttress',[.16,1.78,.18],[Math.cos(a)*.57,1.16,Math.sin(a)*.57],trim);brace.rotation.z=Math.cos(a)*-.18;brace.rotation.x=Math.sin(a)*.18;}
    cylinder(THREE,g,'lower-service-ring',.78,.78,.16,[0,1.2,0],trim,12);
    cylinder(THREE,g,'upper-platform',1.15,1.15,.22,[0,4.12,0],trim,12);
    cylinder(THREE,g,'observation-deck',1.03,1.03,.12,[0,4.28,0],warning,12);
    const rail=mat(THREE,0x9aa7a3,.38,.72);
    for(let i=0;i<16;i++){const a=i*Math.PI/8,x=Math.cos(a)*1.03,z=Math.sin(a)*1.03;const post=cylinder(THREE,g,'deck-rail-post',.025,.025,.42,[x,4.55,z],rail,6);post.rotation.z=Math.cos(a)*.04;post.rotation.x=Math.sin(a)*.04;}
    const handrail=new THREE.Mesh(new THREE.TorusGeometry(1.03,.028,6,48),rail);handrail.name='deck-perimeter-handrail';handrail.rotation.x=Math.PI/2;handrail.position.y=4.76;g.add(handrail);
    for(let i=0;i<6;i++){const y=.55+i*.42;const rung=box(THREE,g,'maintenance-ladder-rung',[.42,.045,.07],[.42,y,.57],metal);rung.rotation.z=-.08;}
    for(const side of [-1,1]){box(THREE,g,'ladder-rail',[.055,2.35,.06],[.21*side,.98,.57],trim);box(THREE,g,'cable-tray',[.08,2.1,.08],[.72,2.05,-.48],dark);}
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const brace=box(THREE,g,'deck-support-strut',[.09,.55,.09],[Math.cos(a)*.76,3.82,Math.sin(a)*.76],trim);brace.rotation.z=Math.cos(a)*-.28;brace.rotation.x=Math.sin(a)*.28;}
    const cab=new THREE.Group();cab.name='panoramic-control-cabin';cab.position.y=4.55;g.add(cab);
    cylinder(THREE,cab,'cabin-glass-band',.92,.92,.72,[0,0,0],glass,12);
    cylinder(THREE,cab,'cabin-roof',.98,.98,.16,[0,.43,0],faction,12);
    cylinder(THREE,cab,'cabin-sill',.98,.98,.12,[0,-.42,0],trim,12);
    for(let i=0;i<12;i++){const a=i*Math.PI/6;const mullion=box(THREE,cab,'window-mullion',[.045,.68,.045],[Math.cos(a)*.91,0,Math.sin(a)*.91],trim);mullion.rotation.y=-a;}
    for(let i=0;i<4;i++){const a=i*Math.PI/2;const lamp=sphere(THREE,cab,'cabin-navigation-light',.055,[Math.cos(a)*.99,.12,Math.sin(a)*.99],beaconMat,[1,.8,1]);lamp.userData.emissivePulse=true;}
    cylinder(THREE,g,'radar-pedestal',.12,.16,.36,[0,5.05,0],metal,10);
    const radar=new THREE.Group();radar.name='rotating-radar';radar.position.set(0,5.3,0);g.add(radar);
    cylinder(THREE,radar,'radar-hub',.12,.12,.18,[0,0,0],metal,10);
    box(THREE,radar,'radar-dish-arm',[1.35,.055,.08],[0,.08,0],trim);
    sphere(THREE,radar,'radar-dish',.42,[.7,.08,0],glass,[.22,1,.78]);
    cylinder(THREE,g,'lightning-mast',.025,.025,.72,[0,5.78,0],dark,8);
    for(let i=0;i<4;i++){const a=i*Math.PI/2;sphere(THREE,g,'aviation-beacon',.075,[Math.cos(a)*.88,4.6,Math.sin(a)*.88],warning,[1,.7,1]);}
    rotatingGun=radar;
  } else if(type==='turret') {
    // Circular armored barbette with a faceted rotating cupola, twin barrels and optics.
    const armor=mat(THREE,0x59666a,.58,.48), edge=mat(THREE,0x252f34,.42,.62), optic=mat(THREE,0x69d4ec,.16,.72);
    cylinder(THREE,g,'armored-base',1.02,1.18,.72,[0,.55,0],concrete,16);
    cylinder(THREE,g,'base-rim',1.08,1.08,.12,[0,.91,0],edge,16);
    cylinder(THREE,g,'rotating-platform',.82,.9,.2,[0,1.08,0],faction,16);
    const head=new THREE.Group();head.name='rotating-gun';head.position.y=1.18;g.add(head);
    cylinder(THREE,head,'cupola-lower-ring',.72,.78,.2,[0,.08,0],edge,16);
    const dome=new THREE.Mesh(new THREE.SphereGeometry(.68,16,10,0,Math.PI*2,0,Math.PI*.58),armor);dome.name='armored-cupola';dome.position.y=.34;dome.scale.y=.82;dome.castShadow=true;dome.receiveShadow=true;head.add(dome);
    cylinder(THREE,head,'roof-hatch',.2,.24,.1,[-.2,.82,0],edge,12);
    sphere(THREE,head,'targeting-optic',.13,[.3,.66,.43],optic,[1,.65,.65]);
    for(const side of [-1,1]){
      const sensor=box(THREE,head,'rangefinder-housing',[.22,.12,.16],[-.38,.61,side*.38],armor);
      sensor.rotation.y=side*.18;
      sphere(THREE,head,'rangefinder-lens',.055,[-.38,.62,side*.47],optic,[1,.8,.55]);
      for(let i=0;i<3;i++){const vent=box(THREE,head,'cupola-cooling-fin',[.2,.025,.08],[-.48+i*.12,.47,side*.57],edge);vent.rotation.y=side*.12;}
    }
    for(let i=0;i<12;i++){const a=i*Math.PI/6;const plate=box(THREE,head,'cupola-armor-segment',[.2,.24,.055],[Math.cos(a)*.56,.43,Math.sin(a)*.56],armor);plate.rotation.y=-a;}
    for(const side of [-1,1]){
      const barrel=cylinder(THREE,head,'autocannon-barrel',.075,.105,1.35,[.76,.42,side*.23],edge,12);barrel.rotation.z=-Math.PI/2;
      cylinder(THREE,head,'barrel-muzzle',.11,.11,.12,[1.43,.42,side*.23],metal,12).rotation.z=-Math.PI/2;
      box(THREE,head,'barrel-recoil-sleeve',[.34,.16,.15],[.38,.42,side*.23],armor);
    }
    for(let i=0;i<8;i++){const a=i*Math.PI/4;const bolt=cylinder(THREE,g,'ring-bolt',.035,.035,.035,[Math.cos(a)*.96,.99,Math.sin(a)*.96],metal,8);bolt.rotation.x=Math.PI/2;}
    rotatingGun=head;
  } else {
    box(THREE,g,'utility-building',[2.5,1.15,2],[0,.68,0],concrete);
    box(THREE,g,'utility-roof',[2.65,.18,2.15],[0,1.34,0],faction);
    box(THREE,g,'door',[.5,.75,.04],[0,.49,1.02],dark);
    box(THREE,g,'utility-window',[.45,.3,.04],[.75,.95,1.02],glass);
  }
  // Rectangular-building details are not reused on curved towers or turrets:
  // their fixed offsets would leave detached panels and vents outside the silhouette.
  if(type!=='controlTower' && type!=='tower' && type!=='turret') {
    box(THREE,g,'faction-panel',[.5,.22,.045],[-1.25,1.25,1.04],faction);
    for(const x of [-.85,.85]){
      box(THREE,g,'exterior-light',[.18,.12,.06],[x,1.08,1.42],glass);
      box(THREE,g,'service-vent',[.42,.26,.07],[x,1.52,-1.42],roof);
      for(let i=0;i<3;i++) box(THREE,g,'vent-slat',[.34,.025,.025],[x,1.43+i*.07,-1.46],metal);
    }
  }
  g.userData={kind:'building',buildingType:type,team,rotatingGun}; g.scale.setScalar(scale); return g;
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


/* --- Expanded air, support and combat-effect assets (v95 kit) --- */
export function createAircraft(THREE, options={}) {
  const {team='blue', variant='strike-fighter', scale=1}=options;
  const g=new THREE.Group(); g.name='BA_Aircraft_'+variant;
  const paint=teamColor(THREE,team), underside=mat(THREE,0x343e43), canopy=mat(THREE,0x8fc5d0,.22,.48), metal=mat(THREE,0x9aa5a5,.42,.62), dark=mat(THREE,0x20282b);
  // Fuselage: nose points +X; wings span the Z axis.
  sphere(THREE,g,'fuselage-core',.5,[0,.52,0],paint,[3.25,.55,.66]);
  const nose=cylinder(THREE,g,'radome',.02,.34,.9,[1.68,.52,0],underside,12); nose.rotation.z=-Math.PI/2;
  box(THREE,g,'belly-armor',[2.25,.16,.72],[-.05,.22,0],underside);
  sphere(THREE,g,'cockpit-canopy',.39,[.42,.91,0],canopy,[1.18,.56,.82]);
  box(THREE,g,'main-wing',[1.15,.12,4.85],[-.12,.48,0],paint,[0,0,-.015]);
  box(THREE,g,'left-wingtip',[.34,.1,.42],[-.18,.49,2.55],underside);
  box(THREE,g,'right-wingtip',[.34,.1,.42],[-.18,.49,-2.55],underside);
  box(THREE,g,'tailplane',[.72,.1,2.05],[-1.45,.64,0],paint);
  box(THREE,g,'vertical-fin',[.82,.9,.14],[-1.55,.96,0],paint,[0,0,-.12]);
  for(const z of [-.48,.48]){
    const engine=cylinder(THREE,g,'jet-engine',.22,.28,1.05,[-1.28,.43,z],dark,12); engine.rotation.z=Math.PI/2;
    cylinder(THREE,g,'engine-nozzle',.18,.22,.12,[-1.82,.43,z],metal,12).rotation.z=Math.PI/2;
    box(THREE,g,'missile-pylon',[.62,.12,.13],[.05,.27,z*2.05],dark);
    const missile=cylinder(THREE,g,'air-to-ground-missile',.055,.075,.72,[.45,.2,z*2.05],metal,8); missile.rotation.z=-Math.PI/2;
  }
  for(const x of [-.95,.82]){
    const gear=cylinder(THREE,g,'landing-gear',.045,.045,.38,[x,.08,0],metal,8);
    gear.rotation.z=.18;
    cylinder(THREE,g,'landing-wheel',.12,.12,.08,[x-.05,-.08,0],dark,10).rotation.x=Math.PI/2;
  }
  addMarking(THREE,g,-.35,.56,-.94,team);
  g.userData={kind:'aircraft',unitType:variant,team,facingAxis:'+X'};
  g.scale.setScalar(scale); return g;
}

export function createHelicopter(THREE, options={}) {
  const {team='blue',variant='attack-helicopter',scale=1}=options;
  const g=new THREE.Group(); g.name='BA_Helicopter_'+variant;
  const paint=teamColor(THREE,team), glass=mat(THREE,0x8fc5d0,.2,.42), dark=mat(THREE,0x252c2b), metal=mat(THREE,0x89948f,.42,.6);
  sphere(THREE,g,'armored-cabin',.62,[.28,.72,0],paint,[1.65,.92,1.05]);
  sphere(THREE,g,'cockpit-glass',.38,[.78,.92,0],glass,[.72,.76,1.22]);
  box(THREE,g,'lower-keel',[1.25,.18,.62],[.12,.29,0],dark);
  const boom=cylinder(THREE,g,'tail-boom',.11,.2,2.15,[-1.18,.82,0],paint,10); boom.rotation.z=Math.PI/2;
  box(THREE,g,'tail-fin',[.52,.72,.12],[-2.05,.98,0],paint,[0,0,-.12]);
  box(THREE,g,'tailplane',[.25,.08,1.05],[-1.85,.8,0],paint);
  const mast=cylinder(THREE,g,'rotor-mast',.055,.07,.72,[.05,1.43,0],metal,10);
  const rotor=new THREE.Group(); rotor.name='main-rotor'; rotor.position.set(.05,1.82,0); g.add(rotor);
  for(let i=0;i<4;i++){const blade=box(THREE,rotor,'main-rotor-blade',[.13,.035,3.35],[0,0,0],dark); blade.rotation.y=i*Math.PI/2;}
  const tailRotor=new THREE.Group(); tailRotor.name='tail-rotor'; tailRotor.position.set(-2.17,1.02,0); g.add(tailRotor);
  for(let i=0;i<4;i++){const blade=box(THREE,tailRotor,'tail-rotor-blade',[.08,.035,.72],[0,0,0],metal); blade.rotation.y=i*Math.PI/2;}
  for(const z of [-.78,.78]){
    box(THREE,g,'weapon-stub-wing',[.82,.1,.16],[-.12,.58,z],paint);
    for(const x of [-.28,.24]){const rocket=cylinder(THREE,g,'rocket-pod',.1,.1,.62,[x,.42,z],metal,8);rocket.rotation.z=-Math.PI/2;}
    const skid=cylinder(THREE,g,'landing-skid',.055,.055,1.85,[.05,.12,z*.7],dark,8);skid.rotation.x=Math.PI/2;
    box(THREE,g,'skid-strut',[.08,.42,.08],[.08,.27,z*.7],metal);
  }
  addMarking(THREE,g,.15,.8,-.63,team);
  g.userData={kind:'helicopter',unitType:variant,team,mainRotor:rotor,tailRotor,facingAxis:'+X'};
  g.scale.setScalar(scale); return g;
}

export function createDrone(THREE, options={}) {
  const {team='blue',variant='recon-quadcopter',scale=1}=options;
  const g=new THREE.Group(); g.name='BA_Drone_'+variant;
  const paint=teamColor(THREE,team), dark=mat(THREE,0x252c2b), metal=mat(THREE,0x89948f,.38,.7), lens=mat(THREE,0x73c7df,.16,.7);
  box(THREE,g,'central-airframe',[.72,.2,.62],[0,.48,0],paint);
  sphere(THREE,g,'sensor-gimbal',.19,[.28,.26,0],dark,[1,.78,1]);
  sphere(THREE,g,'camera-lens',.095,[.43,.27,0],lens,[.55,1,1]);
  const rotors=[];
  for(const x of [-1,1]) for(const z of [-1,1]){
    const arm=box(THREE,g,'carbon-arm',[1.25,.075,.09],[x*.53,.48,z*.53],dark);
    arm.rotation.y=x*z*.08;
    cylinder(THREE,g,'motor-pod',.17,.18,.18,[x*1.02,.52,z*1.02],metal,10);
    const rotor=new THREE.Group();rotor.name='propeller-rotor';rotor.position.set(x*1.02,.63,z*1.02);g.add(rotor);
    for(let i=0;i<2;i++){const blade=box(THREE,rotor,'propeller-blade',[.1,.025,.82],[0,0,0],dark);blade.rotation.y=i*Math.PI/2;}
    rotors.push(rotor);
    const leg=cylinder(THREE,g,'landing-leg',.035,.035,.32,[x*.64,.2,z*.64],metal,8);
    leg.rotation.z=x*.18;
  }
  box(THREE,g,'battery-pack',[.42,.16,.34],[-.22,.31,0],dark);
  addMarking(THREE,g,0,.59,-.33,team);
  g.userData={kind:'drone',unitType:variant,team,rotors};
  g.scale.setScalar(scale); return g;
}

export function createProjectile(THREE, options={}) {
  const {team='blue',type='cannon-shell',scale=1}=options;
  const g=new THREE.Group();g.name='BA_Projectile_'+type;
  const shell=mat(THREE,team==='red'?0xc76b43:0xb8c5c3,.32,.72), tip=mat(THREE,0xe0c27b,.3,.65), dark=mat(THREE,0x252b2a,.45,.6);
  const body=cylinder(THREE,g,'projectile-body',.085,.11,.68,[0,0,0],shell,10);body.rotation.z=-Math.PI/2;
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.09,.24,10),tip);nose.name='projectile-nose';nose.rotation.z=-Math.PI/2;nose.position.x=.44;nose.castShadow=true;g.add(nose);
  for(let i=0;i<4;i++){const fin=box(THREE,g,'stabilizer-fin',[.18,.025,.14],[-.27,0,0],dark);fin.rotation.x=i*Math.PI/2;}
  const tracer=sphere(THREE,g,'tracer-core',.045,[-.42,0,0],mat(THREE,0xffb64a,.3,.1),[2.8,.8,.8]);
  g.userData={kind:'projectile',projectileType:type,team,facingAxis:'+X',tracer};
  g.scale.setScalar(scale);return g;
}

export function createExplosion(THREE, options={}) {
  const {scale=1,intensity='medium',seed=23}=options;
  const g=new THREE.Group();g.name='BA_Explosion_'+intensity;
  const factor=intensity==='large'?1.45:intensity==='small'?.65:1;
  const coreMat=new THREE.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:.88});
  const hotMat=new THREE.MeshBasicMaterial({color:0xffe4a1,transparent:true,opacity:.82});
  const smokeMaterial=()=>new THREE.MeshStandardMaterial({color:0x4b4b45,roughness:.98,transparent:true,opacity:.46,depthWrite:false});
  sphere(THREE,g,'fireball-core',.72*factor,[0,.18,0],coreMat,[1,.82,1]);
  sphere(THREE,g,'hot-core',.38*factor,[.05,.2,.02],hotMat,[1,.9,1]);
  for(let i=0;i<3;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry((.62+i*.22)*factor,.035*factor,6,24),new THREE.MeshBasicMaterial({color:i===0?0xffc05b:0xb6a17a,transparent:true,opacity:.68-i*.15}));
    ring.name='shockwave-ring';ring.rotation.x=Math.PI/2+i*.18;ring.position.y=.12+i*.1;g.add(ring);
  }
  let state=seed>>>0;const rand=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};
  for(let i=0;i<12;i++){
    const angle=rand()*Math.PI*2,radius=(.5+rand()*1.25)*factor,height=(rand()-.25)*1.2*factor;
    const spark=new THREE.Mesh(new THREE.ConeGeometry(.045*factor,.28*factor,5),new THREE.MeshBasicMaterial({color:i%3===0?0xffe28a:0xff7838,transparent:true,opacity:1,depthWrite:false}));
    spark.name='explosion-spark';spark.position.set(Math.cos(angle)*radius,height,Math.sin(angle)*radius);spark.rotation.z=-angle;g.add(spark);
  }
  for(let i=0;i<5;i++)sphere(THREE,g,'smoke-puff',.28*factor,[((i%3)-1)*.36,.45+(i%2)*.24,((i*2)%3-1)*.28],smokeMaterial(),[1.1,1.25,1]);
  g.userData={kind:'effect',effectType:'explosion',intensity,lifetimeSeconds:intensity==='large'?1.8:1.2,requiresRuntimeAnimation:true};
  g.scale.setScalar(scale);return g;
}

export function createMuzzleFlash(THREE, options={}) {
  const {team='blue',scale=1}=options;
  const g=new THREE.Group();g.name='BA_MuzzleFlash';
  const hot=new THREE.MeshBasicMaterial({color:0xffef9a,transparent:true,opacity:.95});
  const glow=new THREE.MeshBasicMaterial({color:team==='red'?0xff7040:0xffb84a,transparent:true,opacity:.7});
  const core=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),hot);core.name='flash-core';core.scale.set(1.8,.8,.8);g.add(core);
  const flare=new THREE.Mesh(new THREE.ConeGeometry(.22,.72,8),glow);flare.name='flash-flare';flare.rotation.z=-Math.PI/2;flare.position.x=.34;g.add(flare);
  for(let i=0;i<4;i++){const ray=new THREE.Mesh(new THREE.ConeGeometry(.045,.42,5),hot);ray.name='flash-ray';ray.rotation.z=-Math.PI/2+i*Math.PI/2;ray.position.set(.12,Math.cos(i*Math.PI/2)*.18,Math.sin(i*Math.PI/2)*.18);g.add(ray);}
  g.userData={kind:'effect',effectType:'muzzle-flash',lifetimeSeconds:.12,requiresRuntimeAnimation:true};
  g.scale.setScalar(scale);return g;
}


/* --- Economy, objective and command-core assets (v95.1) --- */
export function createHarvester(THREE, options={}) {
  const {team='blue',scale=1}=options;
  const g=new THREE.Group();g.name='BA_Harvester';
  const paint=teamColor(THREE,team), armor=mat(THREE,0x77765a,.76,.22), dark=mat(THREE,0x252b29,.78,.18), steel=mat(THREE,0x8b928b,.42,.68), glass=mat(THREE,0x8fc5d0,.18,.55), ore=mat(THREE,0xb68b3a,.42,.52);
  box(THREE,g,'tracked-chassis',[2.7,.62,3.5],[-.15,.48,0],paint);
  box(THREE,g,'engine-deck',[2.1,.34,1.05],[-.65,.93,-.9],armor);
  box(THREE,g,'cargo-hopper',[2.25,.88,1.72],[-.62,1.14,-.08],dark);
  box(THREE,g,'hopper-rim',[2.42,.12,1.9],[-.62,1.63,-.08],steel);
  for(const side of [-1,1]){
    box(THREE,g,'track-belt',[.22,.52,3.72],[-.1,.34,side*1.43],dark);
    for(let i=0;i<7;i++){
      const wheel=cylinder(THREE,g,'road-wheel',.22,.22,.14,[-1.35+i*.39,.32,side*1.52],steel,10);
      wheel.rotation.x=Math.PI/2;
      box(THREE,g,'track-cleat',[.07,.08,.13],[-1.35+i*.39,.08,side*1.58],steel);
    }
    box(THREE,g,'hopper-side-rail',[.1,.3,1.8],[-.62,1.88,side*.98],armor);
    cylinder(THREE,g,'hydraulic-line',.035,.035,1.35,[.25,.72,side*1.02],steel,8).rotation.z=-.24;
  }
  box(THREE,g,'operator-cabin',[1.18,1.25,1.05],[.88,1.05,.56],armor);
  box(THREE,g,'windscreen',[.92,.62,.045],[.9,1.26,1.1],glass);
  box(THREE,g,'cabin-roof',[1.35,.15,1.2],[.88,1.76,.55],paint);
  cylinder(THREE,g,'exhaust-stack',.09,.12,.68,[-1.05,1.42,-.92],dark,8);
  // Front collection assembly with roller drum and replaceable teeth.
  box(THREE,g,'scoop-frame',[.32,.62,2.8],[1.55,.48,0],steel);
  const drum=cylinder(THREE,g,'ore-collection-drum',.34,.34,2.45,[1.78,.42,0],dark,14);drum.rotation.x=Math.PI/2;
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    const tooth=box(THREE,g,'scoop-tooth',[.32,.11,.1],[1.78+Math.cos(a)*.34,.42+Math.sin(a)*.34,0],ore);
    tooth.rotation.z=a;
  }
  for(const z of [-.86,-.43,0,.43,.86])box(THREE,g,'scoop-divider',[.28,.48,.055],[1.58,.52,z],steel);
  addMarking(THREE,g,.05,.83,-1.77,team);
  g.userData={kind:'vehicle',unitType:'harvester',team,facingAxis:'+X',collectionDrum:drum};
  g.scale.setScalar(scale);return g;
}

export function createCitadel(THREE, options={}) {
  const {team='red',scale=1}=options;
  const g=new THREE.Group();g.name='BA_Citadel';
  const faction=teamColor(THREE,team), dark=mat(THREE,0x252a2c,.5,.72), stone=mat(THREE,0x686c69,.92,.12), steel=mat(THREE,0x9ba19b,.4,.72);
  const glowColor=team==='red'?0xff4c43:0x43c8ff;
  cylinder(THREE,g,'citadel-foundation',5.1,5.4,.42,[0,.21,0],dark,24);
  cylinder(THREE,g,'outer-fortress-ring',4.45,4.8,.82,[0,.78,0],stone,20);
  cylinder(THREE,g,'armored-ring',3.85,4.0,.28,[0,1.32,0],faction,20);
  cylinder(THREE,g,'inner-command-base',2.8,3.2,1.25,[0,1.9,0],dark,18);
  cylinder(THREE,g,'core-platform',2.15,2.35,.24,[0,2.64,0],steel,18);
  const coreMat=new THREE.MeshStandardMaterial({color:glowColor,emissive:glowColor,emissiveIntensity:1.15,metalness:.35,roughness:.22});
  const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.55,1),coreMat);
  core.name='citadel-reactor-core';core.position.set(0,3.95,0);core.castShadow=true;g.add(core);
  const cage=new THREE.Group();cage.name='reactor-cage';g.add(cage);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4,x=Math.cos(a)*2.1,z=Math.sin(a)*2.1;
    const pylon=cylinder(THREE,cage,'reactor-pylon',.16,.22,2.5,[x,3.6,z],steel,8);
    pylon.rotation.z=Math.cos(a)*-.12;pylon.rotation.x=Math.sin(a)*.12;
    box(THREE,cage,'pylon-light',[.12,.18,.12],[x,4.25,z],mat(THREE,glowColor,.25,.5));
  }
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.05,.075,8,32),new THREE.MeshStandardMaterial({color:glowColor,emissive:glowColor,emissiveIntensity:.65,metalness:.45,roughness:.3}));
  ring.name='reactor-energy-ring';ring.rotation.x=Math.PI/2;ring.position.y=3.85;g.add(ring);
  for(let i=0;i<4;i++){
    const a=i*Math.PI/2;
    const bastion=cylinder(THREE,g,'outer-bastion',.68,.9,2.3,[Math.cos(a)*4.05,1.45,Math.sin(a)*4.05],dark,10);
    cylinder(THREE,g,'bastion-cap',.72,.72,.16,[Math.cos(a)*4.05,2.68,Math.sin(a)*4.05],faction,10);
    const slit=box(THREE,g,'bastion-slit',[.12,.55,.08],[Math.cos(a)*4.05,1.6,Math.sin(a)*4.05],mat(THREE,glowColor,.25,.45));
    slit.rotation.y=a;
  }
  box(THREE,g,'command-antenna-base',[.38,.18,.38],[-2.4,2.1,-1.8],steel);
  cylinder(THREE,g,'command-antenna',.035,.035,1.6,[-2.4,2.95,-1.8],steel,8);
  g.userData={kind:'building',buildingType:'citadel',team,core,reactorRing:ring};
  g.scale.setScalar(scale);return g;
}

export function createRelay(THREE, options={}) {
  const {team='neutral',scale=1}=options;
  const g=new THREE.Group();g.name='BA_Relay';
  const dark=mat(THREE,0x28343a,.55,.68), metal=mat(THREE,0x89968f,.42,.65), faction=team==='red'?mat(THREE,0xb64a43):team==='blue'?mat(THREE,0x438fb1):mat(THREE,0x9b9a81);
  const beaconColor=team==='red'?0xff554d:team==='blue'?0x4bc9ff:0xf3d36b;
  cylinder(THREE,g,'relay-foundation',1.7,1.9,.32,[0,.16,0],dark,16);
  cylinder(THREE,g,'relay-base',1.1,1.35,.62,[0,.56,0],faction,12);
  cylinder(THREE,g,'relay-mast',.12,.18,3.2,[0,2.4,0],metal,10);
  for(const y of [1.35,2.05,2.75])cylinder(THREE,g,'mast-collar',.28,.28,.12,[0,y,0],dark,12);
  for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3;
    const arm=box(THREE,g,'relay-antenna-arm',[.12,.1,1.55],[0,3.05,0],metal);
    arm.rotation.y=a;
  }
  const beaconMat=new THREE.MeshStandardMaterial({color:beaconColor,emissive:beaconColor,emissiveIntensity:1.2,roughness:.25,metalness:.35});
  sphere(THREE,g,'relay-beacon',.32,[0,3.95,0],beaconMat,[1,1.2,1]);
  const halo=new THREE.Mesh(new THREE.TorusGeometry(1.15,.045,8,32),new THREE.MeshBasicMaterial({color:beaconColor,transparent:true,opacity:.72}));
  halo.name='capture-halo';halo.rotation.x=Math.PI/2;halo.position.y=.12;g.add(halo);
  g.userData={kind:'objective',objectiveType:'relay',team,beacon:g.children.find(o=>o.name==='relay-beacon'),captureHalo:halo};
  g.scale.setScalar(scale);return g;
}

export function createOreNode(THREE, options={}) {
  const {scale=1,seed=31}=options;
  const g=new THREE.Group();g.name='BA_OreNode';
  const stone=mat(THREE,0x514e43,.98,.05), ore=mat(THREE,0xb38a3b,.42,.48), bright=mat(THREE,0xe2bf67,.32,.5);
  let state=seed>>>0;const rand=()=>{state=(1664525*state+1013904223)>>>0;return state/4294967296;};
  for(let i=0;i<7;i++){
    const a=rand()*Math.PI*2,r=.25+rand()*1.15,h=.22+rand()*.32;
    const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.48+rand()*.3,0),stone);
    rock.name='ore-rock';rock.position.set(Math.cos(a)*r,h,Math.sin(a)*r);rock.rotation.set(rand(),rand()*Math.PI,rand());rock.scale.set(1,.72,1.15);rock.castShadow=true;g.add(rock);
  }
  for(let i=0;i<5;i++){
    const a=i*Math.PI*2/5,r=.38+rand()*.65;
    const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.32+rand()*.22,0),i%2?ore:bright);
    crystal.name='ore-crystal';crystal.position.set(Math.cos(a)*r,.48+rand()*.22,Math.sin(a)*r);crystal.rotation.set(rand(),rand()*Math.PI,rand());crystal.castShadow=true;g.add(crystal);
  }
  const disk=new THREE.Mesh(new THREE.CircleGeometry(2.25,20),new THREE.MeshBasicMaterial({color:0xc0a020,transparent:true,opacity:.12,side:THREE.DoubleSide}));
  disk.name='ore-field-glow';disk.rotation.x=-Math.PI/2;disk.position.y=.025;g.add(disk);
  g.userData={kind:'resource',resourceType:'ore',seed};
  g.scale.setScalar(scale);return g;
}
