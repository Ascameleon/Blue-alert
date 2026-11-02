import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const root=process.cwd();
const baselineSnapshot=JSON.parse(await readFile(resolve(root,'qa/baseline/base_snapshot.json'),'utf8'));
assert.equal(baselineSnapshot.base_commit,'b179e8088c348c0709589bfd5fa19fb024d42c82','baseline snapshot must match the PR base');
const baselinePreviewRaw=baselineSnapshot.preview_html;
const baselineImportMap='<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js","three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>';
const baselinePreview=baselinePreviewRaw.includes('type="importmap"')?baselinePreviewRaw:baselinePreviewRaw.replace('</head>',baselineImportMap+'</head>');
const baselineFiles=new Map([
  ['/game-data/models/preview.html',baselinePreview],
  ['/game-data/models/blue-alert-models.js',baselineSnapshot.models_js]
]);
console.log('Using frozen base visual fixtures from '+baselineSnapshot.base_commit);
const allowed=new Set([
  '/game-data/models/preview.html',
  '/game-data/models/blue-alert-models.js',
  '/baseline/game-data/models/preview.html',
  '/baseline/game-data/models/blue-alert-models.js'
]);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const server=createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    if(!allowed.has(pathname)){res.writeHead(404);res.end('not found');return;}
    let data;
    if(pathname.startsWith('/baseline/')){
      const baselinePath=pathname.slice('/baseline'.length);
      data=baselineFiles.get(baselinePath);
      if(!data){res.writeHead(404);res.end('baseline not found');return;}
      data=Buffer.from(data,'utf8');
    } else {
      const file=resolve(root,'.'+pathname);
      if(!file.startsWith(root+sep)){res.writeHead(403);res.end('forbidden');return;}
      data=await readFile(file);
    }
    res.writeHead(200,{'content-type':mime[extname(pathname)]||'application/octet-stream','cache-control':'no-store'});
    res.end(data);
  } catch(error) {
    res.writeHead(500);res.end(String(error));
  }
});
await new Promise((resolveListen,reject)=>{
  server.once('error',reject);
  server.listen(0,'127.0.0.1',resolveListen);
});
const address=server.address();
const baseUrl=`http://127.0.0.1:${address.port}`;
const output=resolve(root,'artifacts/model-preview');
await mkdir(output,{recursive:true});
let browser;
const failures=[];
try {
  browser=await chromium.launch({
    headless:true,
    args:[
      '--enable-webgl','--ignore-gpu-blocklist',
      '--use-gl=angle','--use-angle=swiftshader',
      '--enable-unsafe-swiftshader','--disable-dev-shm-usage'
    ]
  });
  // Capture the exact base-branch turret before the current model for a visual before/after review.
  const baselinePage=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  baselinePage.on('pageerror',error=>failures.push('baseline pageerror: '+error.message));
  baselinePage.on('console',message=>{if(message.type()==='error')failures.push('baseline console: '+message.text());});
  const baselineResponse=await baselinePage.goto(baseUrl+'/baseline/game-data/models/preview.html',{waitUntil:'domcontentloaded',timeout:60000});
  assert.equal(baselineResponse?.status(),200,'base-branch model preview must load');
  await baselinePage.waitForSelector('#view canvas',{timeout:30000});
  await baselinePage.selectOption('#asset','turret');
  await baselinePage.waitForTimeout(900);
  const baselineMetrics=await baselinePage.evaluate(()=>({canvas:!!document.querySelector('#view canvas'),width:document.querySelector('#view canvas')?.width||0,height:document.querySelector('#view canvas')?.height||0,asset:document.querySelector('#asset').value}));
  assert.ok(baselineMetrics.canvas && baselineMetrics.width>0 && baselineMetrics.height>0,'base-branch turret must render a WebGL canvas');
  await baselinePage.screenshot({path:output+'/baseline-turret.png',fullPage:true});
  await baselinePage.setViewportSize({width:390,height:844});
  await baselinePage.waitForTimeout(350);
  await baselinePage.screenshot({path:output+'/baseline-turret-mobile-390x844.png',fullPage:true});
  await baselinePage.close();

  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  page.on('pageerror',error=>failures.push('pageerror: '+error.message));
  page.on('console',message=>{if(message.type()==='error')failures.push('console: '+message.text());});
  page.on('requestfailed',request=>{
    if(!request.url().includes('favicon'))failures.push('request failed: '+request.url()+' '+(request.failure()?.errorText||''));
  });
  const response=await page.goto(baseUrl+'/game-data/models/preview.html',{waitUntil:'domcontentloaded',timeout:60000});
  assert.equal(response?.status(),200,'preview page must load');
  await page.waitForFunction(()=>typeof window.__BLUE_ALERTS_PREVIEW__==='function' && window.__BLUE_ALERTS_PREVIEW__().drawCalls>0,null,{timeout:30000});
  const initial=await page.evaluate(()=>window.__BLUE_ALERTS_PREVIEW__());
  assert.equal(initial.asset,'tank');
  assert.ok(initial.meshCount>=30 && initial.meshCount<=45 && initial.triangleCount>0,'detailed faction tank must batch repeated geometry into a compact mesh set');
  assert.ok(initial.drawCalls<=60,'one tank preview must stay within the instanced draw-call budget');
  assert.ok(initial.environment,'procedural reflection environment must be assigned');
  assert.ok(initial.physicalMaterialCount>0,'PBR physical materials must be present');
  assert.ok(initial.canvasWidth>0 && initial.canvasHeight>0,'WebGL canvas must have a backing resolution');
  assert.equal(initial.team,'blue');
  assert.equal(initial.factionProfile,'BLUE_SENTINEL','blue faction must use its own low-profile turret signature');
  assert.equal(initial.trackShoeInstances,36,'both tracks must expose 36 instanced tread shoes');
  assert.equal(initial.wheelBoltInstances,60,'twelve road wheels must expose 60 instanced wheel bolts');
  assert.deepEqual(initial.detailInstances,{engineGrilles:7,reactiveArmorTiles:8,returnRollers:6,roadWheels:12,wheelHubs:12,wheelHubCaps:12,smokeDischargers:4,faction:{turretCheeks:2,turretSidePlates:0,smokeBanks:0}},'repeated chassis and faction details must be batched');
  assert.ok(initial.cameraDistance<9,'desktop tank preview must frame the softened armor at a useful scale');
  assert.ok(initial.beveledArmorPartCount>=12,'blue tank must use bevelled armor geometry for its major silhouette and repeated plates');
  for(const name of ['lower-hull','upper-hull','front-glacis','engine-deck','reactive-armor-tiles-instanced','side-skirt-armor-instanced','turret-body','blue-sentinel-crown','blue-turret-cheeks-instanced']) {
    assert.ok(initial.beveledArmorParts.includes(name),'blue tank must render bevelled armor part: '+name);
  }
  assert.ok(initial.triangleCount<5000,'bevelled tank geometry must remain within the preview triangle budget');
  for(const name of ['front-glacis','engine-deck-grilles-instanced','reactive-armor-tiles-instanced','track-shoe-instanced','wheel-bolts-instanced','blue-sentinel-crown','blue-turret-cheeks-instanced','blue-sentinel-optic']) assert.ok(initial.signatureParts.includes(name),'blue tank signature part missing: '+name);
  await page.screenshot({path:output+'/desktop-blue-sentinel-tank.png',fullPage:true});

  // Both faction riflemen must render their own equipment silhouette and live gait rig.
  await page.selectOption('#asset','infantry');
  await page.waitForFunction(()=>window.__BLUE_ALERTS_PREVIEW__?.().asset==='infantry' &&
    window.__BLUE_ALERTS_PREVIEW__().hasAnimationRig && window.__BLUE_ALERTS_PREVIEW__().meshCount>=25,null,{timeout:10000});
  await page.waitForTimeout(450);
  const blueInfantry=await page.evaluate(()=>window.__BLUE_ALERTS_PREVIEW__());
  assert.equal(blueInfantry.factionProfile,'BLUE_SENTINEL_RIFLEMAN','blue infantry must use the Sentinel faction profile');
  assert.equal(blueInfantry.surfaceFinish,'FIELDWEAVE_CERAMIC_MICROSCUFF_V1','blue infantry must render original fabric/ceramic surface maps');
  assert.ok(blueInfantry.surfaceTextureCount>=7 && blueInfantry.surfaceMaterialCount>=5,
    'blue infantry must bind cached color, roughness and micro-relief maps to its PBR materials');
  assert.equal(blueInfantry.headScale,.82,'infantry head/helmet silhouette must use the corrected human proportion');
  assert.ok(blueInfantry.cameraDistance<8,'blue infantry preview camera must frame the model closely: '+blueInfantry.cameraDistance);
  assert.ok(blueInfantry.namedParts.includes('sentinel-visor') && blueInfantry.namedParts.includes('infantry-assault-rifle') &&
    blueInfantry.namedParts.includes('left-leg-pivot') && blueInfantry.namedParts.includes('right-leg-pivot'),
    'blue infantry must render its visor, rifle and independent leg pivots');
  console.log('BLUE_SENTINEL_INFANTRY_METRICS '+JSON.stringify({
    meshCount:blueInfantry.meshCount,triangleCount:blueInfantry.triangleCount,
    drawCalls:blueInfantry.drawCalls,animationPhase:blueInfantry.animationPhase
  }));
  assert.ok(blueInfantry.triangleCount>=1200,
    'blue infantry must retain its detailed geometry budget: '+blueInfantry.triangleCount+' triangles');
  assert.ok(blueInfantry.boundsMinY>=-0.03,
    'blue infantry combat boots must not sink below the ground plane: '+blueInfantry.boundsMinY);
  assert.ok(blueInfantry.renderOptimization?.savedDrawCalls>=25,
    'blue infantry must batch at least 25 static draw calls without crossing rig pivots: '+JSON.stringify(blueInfantry.renderOptimization));
  assert.ok(blueInfantry.meshCount<60,
    'blue infantry mesh count must reflect the static geometry batching: '+blueInfantry.meshCount);
  assert.ok(blueInfantry.drawCalls<=60,
    'blue infantry must stay within the 60-draw-call mobile preview ceiling: '+blueInfantry.drawCalls);
  assert.ok(blueInfantry.animationPhase>0 && blueInfantry.walkAmount>=0.8,
    'preview gait must advance its deterministic animation rig');
  await page.screenshot({path:output+'/desktop-blue-sentinel-infantry.png',fullPage:true});

  await page.selectOption('#team','red');
  await page.waitForFunction(()=>window.__BLUE_ALERTS_PREVIEW__?.().factionProfile==='RED_BASTION_RIFLEMAN',null,{timeout:10000});
  await page.waitForTimeout(350);
  const redInfantry=await page.evaluate(()=>window.__BLUE_ALERTS_PREVIEW__());
  assert.equal(redInfantry.surfaceFinish,'FIELDWEAVE_CERAMIC_MICROSCUFF_V1','red infantry must share the same textured surface pipeline');
  assert.ok(redInfantry.surfaceTextureCount>=7 && redInfantry.surfaceMaterialCount>=5,'red infantry PBR maps must be bound');
  assert.ok(redInfantry.namedParts.includes('bastion-brow-guard') &&
    redInfantry.namedParts.includes('bastion-jaw-guard') &&
    redInfantry.namedParts.includes('right-bastion-pauldron'),
    'red infantry must render reinforced Bastion helmet and shoulder armor');
  assert.ok(redInfantry.renderOptimization?.savedDrawCalls>=25,
    'red infantry must batch static geometry while preserving faction detail: '+JSON.stringify(redInfantry.renderOptimization));
  assert.ok(redInfantry.meshCount>=blueInfantry.meshCount-3 && redInfantry.drawCalls<=60,
    'red infantry must retain comparable detail and the same draw-call ceiling');
  assert.ok(redInfantry.boundsMinY>=-0.03,
    'red infantry combat boots must not sink below the ground plane: '+redInfantry.boundsMinY);
  assert.ok(redInfantry.cameraDistance<8,'red infantry preview camera must frame the model closely: '+redInfantry.cameraDistance);
  await page.screenshot({path:output+'/desktop-red-bastion-infantry.png',fullPage:true});
  await page.selectOption('#asset','tank');
  await page.selectOption('#team','blue');
  await page.waitForFunction(()=>window.__BLUE_ALERTS_PREVIEW__?.().factionProfile==='BLUE_SENTINEL',null,{timeout:10000});

  await page.selectOption('#team','red');
  await page.waitForFunction(()=>window.__BLUE_ALERTS_PREVIEW__?.().factionProfile==='RED_BASTION',null,{timeout:10000});
  const redTank=await page.evaluate(()=>window.__BLUE_ALERTS_PREVIEW__());
  assert.equal(redTank.team,'red');
  assert.equal(redTank.factionProfile,'RED_BASTION','red faction must use its reinforced high turret signature');
  assert.equal(redTank.trackShoeInstances,36);
  assert.equal(redTank.wheelBoltInstances,60);
  assert.ok(redTank.meshCount<=45 && redTank.drawCalls<=60,'red tank must share the same mobile-friendly draw-call budget');
  assert.ok(redTank.beveledArmorPartCount>=12,'red tank must use bevelled armor geometry');
  for(const name of ['lower-hull','upper-hull','front-glacis','turret-body','red-bastion-roof-plate','red-turret-cheeks-instanced','red-bastion-side-plates-instanced']) {
    assert.ok(redTank.beveledArmorParts.includes(name),'red tank must render bevelled armor part: '+name);
  }
  assert.ok(redTank.triangleCount<5000,'red bevelled tank geometry must remain within the preview triangle budget');
  assert.deepEqual(redTank.detailInstances.faction,{turretCheeks:2,turretSidePlates:2,smokeBanks:2},'red reinforced turret details must be instanced');
  for(const name of ['front-glacis','engine-deck-grilles-instanced','track-shoe-instanced','wheel-bolts-instanced','red-bastion-cupola','red-turret-cheeks-instanced','red-bastion-side-plates-instanced']) assert.ok(redTank.signatureParts.includes(name),'red tank signature part missing: '+name);
  assert.notEqual(redTank.factionProfile,initial.factionProfile,'factions must not share the same visual profile');
  await page.screenshot({path:output+'/desktop-red-bastion-tank.png',fullPage:true});
  await page.selectOption('#team','blue');
  await page.waitForFunction(()=>window.__BLUE_ALERTS_PREVIEW__?.().factionProfile==='BLUE_SENTINEL',null,{timeout:10000});

  await page.selectOption('#asset','turret');
  await page.waitForFunction(()=>window.__BLUE_ALERTS_PREVIEW__?.().asset==='turret' && window.__BLUE_ALERTS_PREVIEW__().meshCount>=20,null,{timeout:10000});
  await page.waitForTimeout(500);
  const turret=await page.evaluate(()=>window.__BLUE_ALERTS_PREVIEW__());
  assert.ok(turret.physicalMaterialCount>0 && turret.drawCalls>0,'turret must render with PBR materials');
  assert.equal(turret.genericDecorationCount,0,'turret must not have detached rectangular-building details');
  await page.screenshot({path:output+'/desktop-turret.png',fullPage:true});

  await page.selectOption('#asset','controlTower');
  await page.waitForFunction(()=>window.__BLUE_ALERTS_PREVIEW__?.().asset==='controlTower' && window.__BLUE_ALERTS_PREVIEW__().meshCount>=30,null,{timeout:10000});
  await page.waitForTimeout(500);
  const tower=await page.evaluate(()=>window.__BLUE_ALERTS_PREVIEW__());
  assert.ok(tower.physicalMaterialCount>0 && tower.drawCalls>0,'control tower must render with PBR materials');
  assert.equal(tower.genericDecorationCount,0,'control tower must not have detached rectangular-building details');
  await page.screenshot({path:output+'/desktop-control-tower.png',fullPage:true});

  await page.setViewportSize({width:390,height:844});
  await page.selectOption('#asset','tank');
  await page.waitForFunction(()=>window.__BLUE_ALERTS_PREVIEW__?.().asset==='tank' && window.__BLUE_ALERTS_PREVIEW__().factionProfile==='BLUE_SENTINEL',null,{timeout:10000});
  await page.waitForTimeout(400);
  await page.screenshot({path:output+'/mobile-blue-sentinel-tank-390x844.png',fullPage:true});
  await page.selectOption('#team','red');
  await page.waitForFunction(()=>window.__BLUE_ALERTS_PREVIEW__?.().factionProfile==='RED_BASTION',null,{timeout:10000});
  await page.screenshot({path:output+'/mobile-red-bastion-tank-390x844.png',fullPage:true});

  await page.selectOption('#asset','infantry');
  await page.selectOption('#team','blue');
  await page.waitForFunction(()=>window.__BLUE_ALERTS_PREVIEW__?.().factionProfile==='BLUE_SENTINEL_RIFLEMAN',null,{timeout:10000});
  await page.waitForTimeout(350);
  const mobileBlueInfantry=await page.evaluate(()=>window.__BLUE_ALERTS_PREVIEW__());
  assert.ok(mobileBlueInfantry.canvasWidth>=300 && mobileBlueInfantry.canvasHeight>=400 &&
    mobileBlueInfantry.hasAnimationRig && mobileBlueInfantry.drawCalls<=60 && mobileBlueInfantry.cameraDistance<8,
    'blue infantry must remain readable and animated in the mobile preview');
  await page.screenshot({path:output+'/mobile-blue-sentinel-infantry-390x844.png',fullPage:true});
  await page.selectOption('#team','red');
  await page.waitForFunction(()=>window.__BLUE_ALERTS_PREVIEW__?.().factionProfile==='RED_BASTION_RIFLEMAN',null,{timeout:10000});
  await page.waitForTimeout(350);
  await page.screenshot({path:output+'/mobile-red-bastion-infantry-390x844.png',fullPage:true});
  await page.selectOption('#asset','tank');
  await page.selectOption('#team','blue');
  await page.waitForFunction(()=>window.__BLUE_ALERTS_PREVIEW__?.().factionProfile==='BLUE_SENTINEL',null,{timeout:10000});
  await page.selectOption('#team','blue');
  await page.waitForFunction(()=>window.__BLUE_ALERTS_PREVIEW__?.().factionProfile==='BLUE_SENTINEL',null,{timeout:10000});
  const mobile=await page.evaluate(()=>{
    const view=document.querySelector('#view').getBoundingClientRect();
    const canvas=document.querySelector('#view canvas').getBoundingClientRect();
    const targets=[...document.querySelectorAll('header select,header button')].map(el=>{
      const r=el.getBoundingClientRect();return {tag:el.tagName,width:r.width,height:r.height};
    });
    return {
      viewportWidth:innerWidth,documentWidth:document.documentElement.scrollWidth,
      viewWidth:view.width,viewHeight:view.height,canvasWidth:canvas.width,canvasHeight:canvas.height,
      targets
    };
  });
  await page.selectOption('#asset','controlTower');
  await page.waitForFunction(()=>window.__BLUE_ALERTS_PREVIEW__?.().asset==='controlTower' && window.__BLUE_ALERTS_PREVIEW__().meshCount>=30,null,{timeout:10000});
  await page.waitForTimeout(350);
  await page.screenshot({path:output+'/mobile-control-tower-390x844.png',fullPage:true});
  await page.selectOption('#asset','turret');
  await page.waitForTimeout(450);
  await page.screenshot({path:output+'/mobile-turret-390x844.png',fullPage:true});
  console.log('MOBILE_LAYOUT '+JSON.stringify(mobile));
  console.log('VISUAL_BASELINE '+JSON.stringify(baselineMetrics));
  assert.ok(mobile.documentWidth<=mobile.viewportWidth+1,'mobile preview must not overflow horizontally');
  assert.ok(mobile.viewWidth<=mobile.viewportWidth+1 && mobile.canvasWidth<=mobile.viewportWidth+1,'mobile 3D viewport and canvas must fit the device width');
  assert.ok(mobile.canvasWidth>=300 && mobile.canvasHeight>=400,'mobile WebGL canvas must remain usable');
  assert.ok(mobile.targets.length>=3 && mobile.targets.every(t=>t.width>=44 && t.height>=44),'all mobile controls must meet 44px touch-target minimum');

  assert.equal(failures.length,0,'browser must not report page, console or network errors: '+failures.join(' | '));
  const files=['baseline-turret.png','baseline-turret-mobile-390x844.png','desktop-blue-sentinel-tank.png','desktop-red-bastion-tank.png','desktop-blue-sentinel-infantry.png','desktop-red-bastion-infantry.png','desktop-turret.png','desktop-control-tower.png','mobile-blue-sentinel-tank-390x844.png','mobile-red-bastion-tank-390x844.png','mobile-blue-sentinel-infantry-390x844.png','mobile-red-bastion-infantry-390x844.png','mobile-control-tower-390x844.png','mobile-turret-390x844.png'];
  for(const file of files) assert.ok((await stat(output+'/'+file)).size>10000,'screenshot must contain rendered evidence: '+file);
  console.log(JSON.stringify({status:'PASS',baseline:baselineMetrics,initial,turret,tower,mobile,screenshots:files},null,2));
} catch(error) {
  console.error(error);
  if(failures.length) console.error('Browser errors:',failures);
  process.exitCode=1;
} finally {
  if(browser) await browser.close();
  await new Promise(resolveClose=>server.close(resolveClose));
}
