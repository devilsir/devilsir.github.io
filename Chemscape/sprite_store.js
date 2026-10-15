(()=>{
'use strict';
const A=window.CHEMSCAPE_ASSETS,L=window.CHEMSCAPE_LEVELS,M=window.CHEMSCAPE_ASSET_META,saved=window.CHEMSCAPE_SAVED_SPRITES||{files:{},names:{},layouts:{}},records=new Map(),urls=new Map(),originals=new Map();
for(const[id,m]of Object.entries(L.sprites))originals.set(id,{sprite:JSON.parse(JSON.stringify(m)),meta:JSON.parse(JSON.stringify(M[id]||{}))});
let database=null,error=null,channel=null;
const canonical=f=>String(A.resolve(f)||'').replace(/^assets\//,'');
function validPath(f){return typeof f==='string'&&f.length<240&&!/[\\:\x00-\x1f]/.test(f)&&!f.split('/').some(p=>!p||p==='.'||p==='..');}
function filePath(f){f=canonical(f);let n=0;while(saved.files?.[f]&&n++<8)f=saved.files[f];return f;}
function applyLayout(id,patch){const m=L.sprites[id];if(!m||!patch||typeof patch!=='object')return;for(const key of ['w','h','anchor','visualBounds','sheet','cell','frameCrops','noFlip','hasShadow','scale'])if(Object.hasOwn(patch,key))m[key]=JSON.parse(JSON.stringify(patch[key]));if(patch.sheet&&!patch.cell)delete m.cell;if(patch.clearFrameCrops)delete m.frameCrops;}
function apply(){
 for(const[id,base]of originals){const m=L.sprites[id];for(const key of Object.keys(m))delete m[key];Object.assign(m,JSON.parse(JSON.stringify(base.sprite)));M[id]=JSON.parse(JSON.stringify(base.meta));}
 for(const[id,layout]of Object.entries(saved.layouts||{}))applyLayout(id,layout);
 for(const[id,name]of Object.entries(saved.names||{}))if(L.sprites[id])M[id].label=name;
 for(const rec of records.values()){for(const[id,layout]of Object.entries(rec.layouts||{}))applyLayout(id,layout);for(const[id,name]of Object.entries(rec.names||{}))if(L.sprites[id])M[id].label=name;}
 for(const[id,m]of Object.entries(L.sprites))if(records.has(canonical(m.file))||saved.files?.[canonical(m.file)]||saved.layouts?.[id])delete M[id]?.thumb;
 A.register([...Object.values(saved.files||{}),...[...records.values()].map(r=>r.exportFile)]);
}
apply();
function openDB(){return new Promise((resolve,reject)=>{if(!window.indexedDB)return reject(Error('O navegador não permite salvar as sprites neste endereço.'));const q=indexedDB.open('chemscape-sprite-studio-v1',1);q.onupgradeneeded=()=>q.result.createObjectStore('assets',{keyPath:'file'});q.onsuccess=()=>{database=q.result;resolve(database);};q.onerror=()=>reject(q.error||Error('Não foi possível abrir o armazenamento das sprites.'));});}
function transaction(mode,action){return new Promise((resolve,reject)=>{if(!database)return reject(error||Error('Salvamento indisponível.'));const tx=database.transaction('assets',mode),store=tx.objectStore('assets');let request;try{request=action(store);}catch(e){tx.abort();reject(e);return;}tx.oncomplete=()=>resolve(request?.result);tx.onabort=tx.onerror=()=>reject(tx.error||request?.error||Error('Não foi possível salvar a sprite.'));});}
function replaceRecords(list){const previous=new Map(records),oldURLs=new Map(urls);records.clear();urls.clear();for(const r of list||[])if(validPath(r.file)&&validPath(r.exportFile)&&r.blob instanceof Blob){records.set(r.file,r);const old=previous.get(r.file),keep=old&&old.revision===r.revision&&old.updated===r.updated&&old.exportFile===r.exportFile&&old.blob.size===r.blob.size;urls.set(r.file,keep?oldURLs.get(r.file):URL.createObjectURL(r.blob));if(keep)oldURLs.delete(r.file);}for(const url of oldURLs.values())setTimeout(()=>URL.revokeObjectURL(url),10000);apply();}
const ready=openDB().then(()=>transaction('readonly',s=>s.getAll())).then(list=>replaceRecords(list)).catch(e=>{error=e;});
function notify(files){window.dispatchEvent(new CustomEvent('chemscape:sprites-changed',{detail:{files}}));}
async function reload(files){await ready;if(!database)return;const previous=[...records.keys()];replaceRecords(await transaction('readonly',s=>s.getAll()));notify(files||[...new Set([...previous,...records.keys()])]);}
function broadcast(files){if(!database)return;if(channel)channel.postMessage({files});else try{localStorage.setItem('chemscape-sprite-refresh',JSON.stringify({files,time:Date.now()}));}catch{}}
async function put(value){await ready;if(!validPath(value.file)||!validPath(value.exportFile)||!value.exportFile.toLowerCase().endsWith('.png')||!(value.blob instanceof Blob))throw Error('Nome ou imagem inválidos.');const file=canonical(value.file),rec={...value,file,updated:Math.max(Date.now(),(records.get(file)?.updated||0)+1),revision:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)};if(database){await transaction('readwrite',s=>s.put(rec));await reload([rec.file]);}else{replaceRecords([...records.values()].filter(r=>r.file!==rec.file).concat(rec));notify([rec.file]);}broadcast([rec.file]);return rec;}
async function remove(file){await ready;file=canonical(file);if(database){await transaction('readwrite',s=>s.delete(file));await reload([file]);}else{replaceRecords([...records.values()].filter(r=>r.file!==file));notify([file]);}broadcast([file]);}
function url(file){file=canonical(file);if(urls.has(file))return urls.get(file);return 'assets/'+filePath(file).split('/').map(encodeURIComponent).join('/')+'?v=17-'+(saved.revision||'20261015');}
function manifest(){const out=JSON.parse(JSON.stringify(saved));out.version=1;out.files=out.files||{};out.names=out.names||{};out.layouts=out.layouts||{};for(const r of records.values()){if(r.file!==r.exportFile)out.files[r.file]=r.exportFile;else delete out.files[r.file];Object.assign(out.names,r.names||{});Object.assign(out.layouts,r.layouts||{});out.revision=Math.max(out.revision||0,r.updated);}return out;}
function script(){return 'window.CHEMSCAPE_SAVED_SPRITES='+JSON.stringify(manifest()).replace(/</g,'\\u003c')+';\n';}
try{channel=new BroadcastChannel('chemscape-sprite-studio');channel.onmessage=e=>reload(e.data?.files).catch(()=>{});}catch{}
window.addEventListener('storage',e=>{if(e.key==='chemscape-sprite-refresh')reload().catch(()=>{});});
window.CHEMSCAPE_SPRITE_STORE={ready,url,canonical,validPath,manifest,script,put,remove,reload,get:file=>records.get(canonical(file)),all:()=>[...records.values()],get persistent(){return !!database;},get error(){return error;}};
})();
