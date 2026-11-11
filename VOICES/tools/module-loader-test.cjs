'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom'),{root,manifest,editorManifest}=require('./runtime-files.cjs');
const source=fs.readFileSync(path.join(root,'js/module-loader.js'),'utf8');
function isolated(){const window={};vm.runInNewContext(source,{window});return window.VoicesModules;}
(async()=>{
 const api=isolated(),calls=[],catalog=[{id:'a',src:'a.js',requires:[]},{id:'b',src:'b.js',requires:['a']},{id:'c',src:'c.js',requires:['b']}];
 for(const id of ['c','a','b'])api.define(id,()=>calls.push(id));
 assert.deepEqual(Array.from(api.start([...catalog].reverse())),['a','b','c']);api.start(catalog);assert.deepEqual(calls,['a','b','c']);
 assert.throws(()=>isolated().resolve([{id:'a',src:'a',requires:['missing']}]),/Missing dependency/);
 assert.throws(()=>isolated().resolve([{id:'a',src:'a',requires:['b']},{id:'b',src:'b',requires:['a']}]),/cycle/);
 const waiting=isolated();let ran=false;waiting.define('a',()=>{ran=true;});assert.throws(()=>waiting.start(catalog),/not loaded/);assert.equal(ran,false);
 const duplicate=isolated();duplicate.define('a',()=>{});assert.throws(()=>duplicate.define('a',()=>{}),/Duplicate/);
 console.log('PASS module startup resolves dependencies independently of arrival and rejects missing, cyclic and duplicate definitions');
 const game=manifest().modules;assert.deepEqual(api.resolve(game).map(m=>m.id),api.resolve([...game].reverse()).map(m=>m.id));
 const editorHTML=fs.readFileSync(path.join(root,'sprite-editor.html'),'utf8'),editor=editorManifest(editorHTML),dom=new JSDOM(editorHTML,{url:'http://voices.local/sprite-editor.html',runScripts:'outside-only'}),w=dom.window;
 w.requestAnimationFrame=()=>1;w.ResizeObserver=class{observe(){}};
 w.HTMLCanvasElement.prototype.getContext=function(){return new Proxy({canvas:this,measureText:text=>({width:String(text).length*8})},{get:(target,key)=>key in target?target[key]:()=>{},set:(target,key,value)=>(target[key]=value,true)});};
 w.eval(source);for(const entry of [...editor].reverse())w.eval(fs.readFileSync(path.join(root,entry.src.split('?')[0]),'utf8'));w.VoicesModules.start([...editor].reverse());
 assert(w.VOICES_SPRITES.length>100);assert(w.document.querySelector('#asset-list').children.length>0);assert.equal(w.VoicesModules.status().initialized.length,editor.length);dom.window.close();
 console.log('PASS the standalone sprite editor starts with reversed file and catalog order');
 const {environment}=require('./runtime-upgrade-test.cjs');
 const snapshot=async order=>{const e=await environment({moduleOrder:order}),{V}=e;try{await V.Game.init();return{maps:Object.values(V.World.maps).map(m=>({id:m.id,width:m.width,height:m.height,objects:m.objects.length,links:m.objects.filter(o=>o.to).map(o=>({id:o.id,to:o.to,x:o.x,y:o.y})).sort((a,b)=>a.id.localeCompare(b.id))})).sort((a,b)=>a.id.localeCompare(b.id)),hooks:V.Hooks.list(V.Game),challenges:V.ChallengeCatalog.items().map(item=>item.key),recipes:V.CookingData.recipes.map(item=>item.id),species:V.NatureData.species.map(item=>item.id),errors:[...V.Assets.errors]};}finally{V.MapAssets.cancel();e.dom.window.close();}};
 assert.equal(JSON.stringify(await snapshot('reverse')),JSON.stringify(await snapshot('normal')));
 console.log('PASS the complete game has identical maps, entrances, extensions and content with reversed module arrival');
 process.exit(0);
})().catch(error=>{console.error(error.stack);process.exit(1);});
