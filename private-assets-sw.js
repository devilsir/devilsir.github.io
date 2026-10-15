const API='https://uknijxfkmsuqpbiyllvc.supabase.co/functions/v1/portfolio-access';
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
