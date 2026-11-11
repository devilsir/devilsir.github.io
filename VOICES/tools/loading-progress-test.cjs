'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const {JSDOM}=require('jsdom');
const {environment}=require('./runtime-upgrade-test.cjs');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function controlled(){
 const dom=new JSDOM('<div id="loading"><p></p><progress max="1" value="0"></progress></div>',{url:'http://voices.local/',runScripts:'outside-only'}),w=dom.window;
 Object.defineProperty(w.HTMLImageElement.prototype,'src',{configurable:true,get(){return this._src||'';},set(value){this._src=new URL(value,w.document.baseURI).href;}});
 Object.defineProperty(w.HTMLImageElement.prototype,'naturalWidth',{configurable:true,get(){return this._width||0;}});
 w.V={$:selector=>w.document.querySelector(selector),Assets:{errors:[]},ImageFormats:{canonical:key=>key,resolve:value=>value},SceneShadows:{discard(){}},SpriteFrames:{draw(){return true;}},ObjectiveGuide:{_targetOutlines:new Map()}};
 for(const file of ['js/asset-loader.js','js/sprite-readiness.js'])w.eval(fs.readFileSync(path.join(root,file),'utf8'));
 const V=w.V,L=V.AssetLoader;
 return{dom,w,V,L,image(url){const im=V.Assets.image();im.src=url;return im;},finish(im){im._width=128;im.dispatchEvent(new w.Event('load'));}};
}
async function run(){
 let passed=0;
 const check=async(name,test)=>{await test();passed++;console.log('PASS '+name);};
 const counts=L=>({...L.counts()});
 await check('repeated image requests count once and stay pending until all copies are ready',async()=>{
  const e=controlled();try{const a=e.image('assets/icon.png?v=1'),b=e.image('assets/icon.png?v=2');assert.deepEqual(counts(e.L),{done:0,total:1});e.finish(a);assert.deepEqual(counts(e.L),{done:0,total:1});e.finish(b);assert.deepEqual(counts(e.L),{done:1,total:1});}finally{e.dom.window.close();}
 });
 await check('deferred scenes and cancelled image requests are excluded from startup',async()=>{
  const e=controlled();try{const deferred=e.image('assets/maritime/boat.png'),cancelled=e.image('assets/cancelled.png');cancelled.src='data:image/png;base64,AA==';assert.deepEqual(counts(e.L),{done:0,total:0});assert.equal(e.L.byImage.get(deferred).state,'deferred');const visible=e.image('assets/menu.png');e.finish(visible);assert.deepEqual(counts(e.L),{done:1,total:1});}finally{e.dom.window.close();}
 });
 await check('automatic retries do not increase either the completed count or the total',async()=>{
  const e=controlled();try{const im=e.image('assets/retry.png');im.dispatchEvent(new e.w.Event('error'));assert.equal(e.L.byImage.get(im).state,'waiting');assert.deepEqual(counts(e.L),{done:0,total:1});e.w.dispatchEvent(new e.w.Event('online'));assert.equal(e.L.byImage.get(im).attempt,2);e.finish(im);assert.deepEqual(counts(e.L),{done:1,total:1});}finally{e.dom.window.close();}
 });
 await check('failed images remain incomplete and a successful manual retry keeps the same total',async()=>{
  const e=controlled();try{e.L.maxAttempts=1;const im=e.image('assets/missing.png');im.dispatchEvent(new e.w.Event('error'));await pause(10);assert.equal(e.L.failed.size,1);assert.deepEqual(counts(e.L),{done:0,total:1});const retry=e.L.retryFailed();assert.deepEqual(counts(e.L),{done:0,total:1});e.finish(im);await retry;assert.equal(e.L.failed.size,0);assert.equal(e.V.Assets.errors.length,0);assert.deepEqual(counts(e.L),{done:1,total:1});}finally{e.dom.window.close();}
 });
 await check('bitmap decoding finishes before the last image is counted or startup completes',async()=>{
  const e=controlled();try{let decode;const im=e.image('assets/last-image.png');im.decode=()=>new Promise(resolve=>decode=resolve);e.finish(im);let ready=false;const completion=e.L.ready().then(()=>ready=true);await pause(10);assert(!ready);assert.deepEqual(counts(e.L),{done:0,total:1});decode();await completion;assert.deepEqual(counts(e.L),{done:1,total:1});assert.equal(e.V.$('#loading p').textContent,'Imagens carregadas: 1 / 1');}finally{e.dom.window.close();}
 });
 await check('the visible count, progress bar and accessibility values stay synchronized',async()=>{
  const e=controlled();try{const a=e.image('assets/a.png'),b=e.image('assets/b.png');e.finish(a);e.L.progress(true);const bar=e.V.$('progress');assert.match(e.V.$('p').textContent,/1 \/ 2$/);assert.equal(bar.max,2);assert.equal(bar.value,1);assert.equal(bar.getAttribute('aria-valuetext'),'1 de 2 imagens carregadas');assert.equal(e.V.$('#loading').getAttribute('aria-busy'),'true');e.finish(b);e.L.progress(true);assert.match(e.V.$('p').textContent,/2 \/ 2$/);assert.equal(bar.value,2);assert.equal(e.L.progressTimer,null);assert.equal(e.V.$('#loading').getAttribute('aria-busy'),'false');}finally{e.dom.window.close();}
 });

 const {dom,w,V}=await environment();
 try{
  const L=V.AssetLoader,samples=[],late=[],originalMake=L.make.bind(L),originalLoaded=L.loaded.bind(L),render=L.renderProgress.bind(L),worldInit=V.World.init.bind(V.World);
  let firstBitmap=false,worldSnapshot,release;
  L.make=function(...args){if(firstBitmap)late.push(args[2]);return originalMake(...args);};
  L.loaded=function(...args){firstBitmap=true;return originalLoaded(...args);};
  L.renderProgress=function(){render();if(!V.$('#loading').hidden)samples.push(counts(this));};
  V.World.init=function(...args){worldSnapshot={...counts(L),hidden:V.$('#loading').hidden,text:V.$('#loading p').textContent,bar:V.$('#loading progress').value,max:V.$('#loading progress').max};return worldInit(...args);};
  const settingsReady=V.ProfessorStudio.startPromise;
  V.ProfessorStudio.startPromise=Promise.resolve(settingsReady).then(()=>new Promise(resolve=>release=resolve));
  const init=V.Game.init();
  await check('saved artwork settings finish before any startup images are registered',async()=>{await pause(160);assert.deepEqual(counts(L),{done:0,total:0});assert([...L.records].every(r=>r.state==='deferred'));assert.equal(firstBitmap,false);release();await init;});
  await check('real startup registers every group before any image completes and keeps a fixed total',async()=>{
   assert.deepEqual(late,[]);assert(samples.length>0);const eager=[...L.records].filter(r=>r.state!=='deferred'),total=new Set(eager.map(r=>r.key)).size;assert(eager.length>total,'the game must exercise duplicate requests');assert.equal(new Set(samples.map(s=>s.total)).size,1);assert.equal(samples[0].total,total);for(let i=1;i<samples.length;i++)assert(samples[i].done>=samples[i-1].done);assert.deepEqual(samples.at(-1),{done:total,total});
  });
  await check('the final complete counter and full bar are visible before the world is built',async()=>{
   assert(worldSnapshot);assert.equal(worldSnapshot.hidden,false);assert.equal(worldSnapshot.done,worldSnapshot.total);assert.equal(worldSnapshot.bar,worldSnapshot.max);assert.equal(worldSnapshot.text,'Imagens carregadas: '+worldSnapshot.total+' / '+worldSnapshot.total);assert(V.$('#loading').hidden);assert.equal(V.Game.screen,'title');
  });
  await check('parallel registration preserves polished props, both mask variants and kitchen portraits',async()=>{
   assert.match(V.Assets.images.props.src,/\/props-polished\.webp/);assert.match(V.Assets.images['world-props'].src,/\/world-props-polished\.webp/);for(const index of [0,1]){assert.strictEqual(V.Assets.images[index?'historiograph-p2':'historiograph'],V.AncestralMask.image('portrait',index));assert.strictEqual(V.IllustratedInterface.images[index?'historio-p2':'historio'],V.AncestralMask.image('icon',index));assert.strictEqual(V.Assets.images[index?'item-device-p2':'item-device'],V.AncestralMask.image('icon',index));}for(const [key,meta]of Object.entries(V.ProfessionalKitchen.uniforms))assert.strictEqual(V.Assets.images[key+'-portrait'],V.Assets.images[meta.base+'-portrait']);assert.strictEqual(V.CulinaryInteriors.images['kitchen-interiors'],V.ProfessionalKitchen.images['industrial-kitchen']);
  });
 }finally{dom.window.close();}
 console.log(passed+' loading checks passed');
}
run().then(()=>process.exit(0)).catch(error=>{console.error(error.stack);process.exit(1);});
