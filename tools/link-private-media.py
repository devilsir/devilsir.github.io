#!/usr/bin/env python3
from pathlib import Path
import re

root=Path(__file__).resolve().parents[1]
targets={
  "Album-Familia/index.html":"album-familia",
  "Album-Familia/app.js":"album-familia",
  "Album-World-Stars/index.html":"album-world-stars",
  "Album-World-Stars/app.js":"album-world-stars",
  "Album-World-Stars/references.js":"album-world-stars",
  "Timbo-Speaker/index.html":"timbo-speaker",
  "silvinho/silvinho/index.html":"silvinho",
  "silvinho/silvinho/app.js":"silvinho",
  "silvinho/silvinho/config.js":"silvinho",
}
total=0
for name,slug in targets.items():
    file=root/name
    original=file.read_text(encoding="utf-8")
    if slug=="timbo-speaker":
        def convert(match):
            global total
            folder=match.group("folder")
            total+=1
            return match.group("quote")+"/private-media/timbo-speaker/"+folder+"/"
        pattern=r"(?P<quote>['\"\x60])(?:\./)?(?P<folder>models|audio|video)/(?!(?:mpeg|wav)(?=[;\"\x27]))"
        changed=re.sub(pattern,convert,original)
    else:
        pattern=r"(?<![A-Za-z0-9_./-])(?:\./)?assets/"
        def replacement(match):
            global total
            total+=1
            return "/private-media/"+slug+"/assets/"
        changed=re.sub(pattern,replacement,original)
    if name.endswith("index.html"):
        changed=changed.replace('src="/access-gate.js"', 'src="/access-gate.js?v=private20261015c"')
    if original==changed:
        print("No modification:",name)
        continue
    if "data:/private-media/" in changed or "data:audio/private-media/" in changed:
        raise RuntimeError("Invalid data URL rewrite: "+name)
    file.write_text(changed,encoding="utf-8")
    print("Updated",name,"new length",len(changed))
gate=root/"access-gate.js"
original=gate.read_text(encoding="utf-8")
changed=original.replace(
 "await navigator.serviceWorker.register('/private-assets-sw.js',{scope:'/'});",
 "await navigator.serviceWorker.register('/private-assets-sw.js?v=private20261015c',{scope:'/',updateViaCache:'none'});"
).replace(
 "input.value='';await unlock();",
 "input.value='';await installPrivateAssets(accessToken);location.reload();return;"
).replace(
 "    verifyStored().then(valid=>{if(!valid){input.focus({preventScroll:true})}});",
 ""
).replace(
 "  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();",
 "  const restored=verifyStored();\n  const boot=()=>{restored.then(ok=>{if(!ok)mount()}).catch(()=>mount())};\n  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();"
)
if changed==original or "const restored=verifyStored();" not in changed:
    raise RuntimeError("Failed to initialize authentication before media loading")
gate.write_text(changed,encoding="utf-8")
sw=root/"private-assets-sw.js"
sw.write_text(r'''const API='https://uknijxfkmsuqpbiyllvc.supabase.co/functions/v1/portfolio-access';
const scopes={'album-familia':'albums','album-world-stars':'albums','timbo-speaker':'timbo','silvinho':'timbo'};
const credentials=new Map();
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('message',e=>{
 const id=e.source?.id,data=e.data;
 if(!id||data?.type!=='portfolio-session'||!['albums','timbo'].includes(data.scope)||!/^[a-f0-9]{64}$/.test(data.token||''))return;
 credentials.set(id,{scope:data.scope,token:data.token,expires:Date.now()+14400000});
});
function matchAsset(url){
 const uri=new URL(url);
 if(uri.origin!==self.location.origin)return null;
 const parts=uri.pathname.split('/').filter(Boolean);
 if(parts.shift()!=='private-media')return null;
 const project=parts.shift(),scope=scopes[project];
 if(!scope||!parts.length||!/\.(?:glb|gltf|png|webp|jpe?g|gif|svg|mp3|wav|ogg|mp4|webm|avif)$/i.test(parts.at(-1)))return null;
 let decoded;
 try{decoded=parts.map(decodeURIComponent)}catch{return null}
 if(decoded.some(item=>!item||item==='.'||item==='..'||item.includes('/')||item.includes('\\')))return null;
 return {scope,path:project+'/'+decoded.join('/')};
}
async function getToken(clientId,scope){
 for(let i=0;i<40;i++){
  const session=credentials.get(clientId);
  if(session?.scope===scope&&session.expires>Date.now())return session.token;
  await new Promise(resolve=>setTimeout(resolve,200));
 }
 return null;
}
self.addEventListener('fetch',event=>{
 const target=matchAsset(event.request.url);
 if(!target)return;
 event.respondWith((async()=>{
  const token=await getToken(event.clientId||event.resultingClientId,target.scope);
  if(!token)return new Response('Sessão necessária',{status:401,headers:{'Cache-Control':'no-store'}});
  const h=new Headers({'X-Portfolio-Token':token});
  if(event.request.headers.has('Range'))h.set('Range',event.request.headers.get('Range'));
  try{
   const targetUrl=API+'/asset/'+target.path.split('/').map(encodeURIComponent).join('/');
   const result=await fetch(targetUrl,{headers:h,cache:'no-store',redirect:'error'});
   if(result.status===401)credentials.delete(event.clientId);
   return result;
  }catch(e){return new Response('Armazenamento privado indisponível',{status:503})}
 })());
});
''',encoding="utf-8")
for name,slug in targets.items():
    data=(root/name).read_text(encoding="utf-8")
    if slug=="timbo-speaker" and "data:audio/mpeg;base64" not in data:
        raise RuntimeError("Embedded audio damaged in Timbo-Speaker")
    if re.search(r'''(?:["'\x60])(?:\./)?assets/(?:album|stickers|app-icon)''',data):
        raise RuntimeError("Unmigrated asset references in "+name)
    if name.endswith("index.html") and 'src="/access-gate.js?v=private20261015c"' not in data:
        raise RuntimeError("Access gate version not updated for "+name)
print("Replaced media references:",total)
