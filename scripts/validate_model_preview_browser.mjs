import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright';

const root=process.cwd();
const allowed=new Set([
  '/game-data/models/preview.html',
  '/game-data/models/blue-alert-models.js'
]);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8'};
const server=createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);
    if(!allowed.has(pathname)){res.writeHead(404);res.end('not found');return;}
    const file=resolve(root,'.'+pathname);
    if(!file.startsWith(root+sep)){res.writeHead(403);res.end('forbidden');return;}
    const data=await readFile(file);
    res.writeHead(200,{'content-type':mime[extname(file)]||'application/octet-stream','cache-control':'no-store'});
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
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  page.on('pageerror',error=>failures.push('pageerror: '+error.message));
  page.on('console',message=>{if(message.type()==='error')failures.push('console: '+message.text());});
  page.on('requestfailed',request=>{
    if(!request.url().includes('favicon'))failures.push('request failed: '+request.url()+' '+(request.failure()?.errorText||''));
  });
  const response=await page.goto(baseUrl+'/game-data/models/preview.html',{waitUntil:'networkidle',timeout:60000});
  assert.equal(response?.status(),200,'preview page must load');
  await page.waitForFunction(()=>typeof window.__BLUE_ALERTS_PREVIEW__==='function' && window.__BLUE_ALERTS_PREVIEW__().drawCalls>0,null,{timeout:30000});
  const initial=await page.evaluate(()=>window.__BLUE_ALERTS_PREVIEW__());
  assert.equal(initial.asset,'tank');
  assert.ok(initial.meshCount>0 && initial.triangleCount>0,'default tank must render real geometry');
  assert.ok(initial.environment,'procedural reflection environment must be assigned');
  assert.ok(initial.physicalMaterialCount>0,'PBR physical materials must be present');
  assert.ok(initial.canvasWidth>0 && initial.canvasHeight>0,'WebGL canvas must have a backing resolution');
  await page.screenshot({path:output+'/desktop-tank.png',fullPage:true});

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
  await page.waitForTimeout(400);
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
  await page.screenshot({path:output+'/mobile-control-tower-390x844.png',fullPage:true});
  console.log('MOBILE_LAYOUT '+JSON.stringify(mobile));
  assert.ok(mobile.documentWidth<=mobile.viewportWidth+1,'mobile preview must not overflow horizontally');
  assert.ok(mobile.viewWidth<=mobile.viewportWidth+1 && mobile.canvasWidth<=mobile.viewportWidth+1,'mobile 3D viewport and canvas must fit the device width');
  assert.ok(mobile.canvasWidth>=300 && mobile.canvasHeight>=400,'mobile WebGL canvas must remain usable');
  assert.ok(mobile.targets.length>=3 && mobile.targets.every(t=>t.width>=44 && t.height>=44),'all mobile controls must meet 44px touch-target minimum');

  assert.equal(failures.length,0,'browser must not report page, console or network errors: '+failures.join(' | '));
  const files=['desktop-tank.png','desktop-turret.png','desktop-control-tower.png','mobile-control-tower-390x844.png'];
  for(const file of files) assert.ok((await stat(output+'/'+file)).size>10000,'screenshot must contain rendered evidence: '+file);
  console.log(JSON.stringify({status:'PASS',initial,turret,tower,mobile,screenshots:files},null,2));
} catch(error) {
  console.error(error);
  if(failures.length) console.error('Browser errors:',failures);
  process.exitCode=1;
} finally {
  if(browser) await browser.close();
  await new Promise(resolveClose=>server.close(resolveClose));
}
