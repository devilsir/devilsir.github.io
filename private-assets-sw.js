/* Public service worker code; protected files remain on private Supabase Storage. */
const API='https://uknijxfkmsuqpbiyllvc.supabase.co/functions/v1/portfolio-access';
const roots={
 'Album-Familia':{slug:'album-familia',scope:'albums'},
 'Album-World-Stars':{slug:'album-world-stars',scope:'albums'},
 'Timbo-Speaker':{slug:'timbo-speaker',scope:'timbo'},
 'silvinho':{slug:'silvinho',scope:'timbo'}
};
const secrets=new Map();
const listeners=new Map();
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
 const id=event.source?.id;
 const data=event.data;
 if(!id||!data||data.type!=='portfolio-session')return;
 if(typeof data.token!=='string'||!/^[a-f0-9]{64}$/.test(data.token)||!['albums','timbo'].includes(data.scope))return;
 secrets.set(id,{scope:data.scope,token:data.token,expires:Date.now()+4*3600*1000});
 const pending=listeners.get(id)||[];
 for(const resolve of pending)resolve();
 listeners.delete(id);
});
function match(u){
 const pieces=u.pathname.replace(/^\/+/,'').split('/');
 let p=pieces[0],rest=pieces.slice(1);
 if(p==='silvinho'){if(rest[0]!=='silvinho')return null;rest=rest.slice(1)}
 const entry=roots[p];
 if(!entry||!/\.(?:glb|gltf|png|webp|jpe?g|gif|svg|mp3|wav|ogg|mp4|webm|avif)$/i.test(rest.join('/')))return null;
 if(rest.length===0||rest.some(part=>part==='..'))return null;
 let decoded;
 try { decoded=rest.map(decodeURIComponent).join('/'); } catch { return null; }
 if(decoded.split('/').some(part=>!part||part==='.'||part==='..'||part.includes('\\')))return null;
 return {path:entry.slug+'/'+decoded,scope:entry.scope};
}
async function session(id,scope){
 for(let retry=0;retry<12;retry++){
  const found=secrets.get(id);
  if(found?.scope===scope && found.expires>Date.now())return found.token;
  await new Promise(resolve=>{
   let done=false;
   const finish=()=>{if(!done){done=true;resolve()}};
   const a=listeners.get(id)||[];a.push(finish);listeners.set(id,a);
   setTimeout(finish,500);
  });
 }
 return null;
}
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url);
 if(u.origin!==self.location.origin)return;
 const asset=match(u);
 if(!asset)return;
 event.respondWith((async()=>{
  const token=await session(event.clientId,asset.scope);
  if(!token)return new Response('Session required',{status:401});
  const source=API+'/asset/'+asset.path.split('/').map(encodeURIComponent).join('/');
  const h=new Headers({'X-Portfolio-Token':token});
  if(event.request.headers.has('Range'))h.set('Range',event.request.headers.get('Range'));
  try {
   const upstream=await fetch(source,{headers:h,cache:'no-store'});
   if(upstream.status===401)secrets.delete(event.clientId);
   return upstream;
  }catch{
   return new Response('Private storage temporarily unavailable',{status:503});
  }
 })());
});
