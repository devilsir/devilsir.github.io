import { createClient } from "npm:@supabase/supabase-js@2.57.0";
const SUPABASE_API_URL=Deno.env.get("SUPABASE_URL")||"";
const KEY=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||"";
const api=createClient(SUPABASE_API_URL,KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const allowedOrigin="https://devilsir.github.io";
const scopeFor:Record<string,string>={"Album-Familia":"albums","Album-World-Stars":"albums","Timbo-Speaker":"timbo","silvinho":"timbo"};
const cors={"Access-Control-Allow-Origin":allowedOrigin,"Access-Control-Allow-Headers":"Content-Type,apikey,Authorization,X-Portfolio-Token","Access-Control-Allow-Methods":"GET,POST,OPTIONS","Vary":"Origin","Cache-Control":"no-store"};
function json(v:unknown,status=200){return new Response(JSON.stringify(v),{status,headers:{...cors,"Content-Type":"application/json;charset=utf-8"}})}
async function digest(s:string){const b=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)));return [...b].map(x=>x.toString(16).padStart(2,"0")).join("")}
function safe(path:string){let p=path;try{p=decodeURIComponent(p)}catch{return null}return p.length<650&&!p.startsWith("/")&&!p.includes("\\")&&!p.split("/").some(v=>v===".."||v==="."||v==="")?p:null}
function contentType(f:string){const ext=f.split(".").pop()?.toLowerCase()||"";return ({html:"text/html; charset=utf-8",css:"text/css",js:"text/javascript",mjs:"text/javascript",json:"application/json",png:"image/png",webp:"image/webp",jpg:"image/jpeg",jpeg:"image/jpeg",gif:"image/gif",glb:"model/gltf-binary",gltf:"model/gltf+json",wav:"audio/wav",mp3:"audio/mpeg",ogg:"audio/ogg",mp4:"video/mp4",webm:"video/webm",wasm:"application/wasm",svg:"image/svg+xml",woff2:"font/woff2"})[ext]||"application/octet-stream"}
Deno.serve(async req=>{
try{
if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
const origin=req.headers.get("Origin");if(origin&&origin!==allowedOrigin)return json({error:"Origem não autorizada"},403);
const route=new URL(req.url).pathname.split("/functions/v1/portfolio-access")[1]||"/";
if(route==="/login"&&req.method==="POST"){
 let body:any;try{body=await req.json()}catch{return json({error:"Dados inválidos"},400)}
 const scope=body?.scope,pw=body?.password;
 if(!["albums","timbo"].includes(scope)||typeof pw!=="string"||pw.length>128)return json({error:"Dados inválidos"},400);
 const ip=req.headers.get("cf-connecting-ip")||req.headers.get("x-forwarded-for")?.split(",")[0]||"unknown";
 const fingerprint=await digest(ip+"|"+scope);
 const bytes=crypto.getRandomValues(new Uint8Array(32));
 const token=[...bytes].map(b=>b.toString(16).padStart(2,"0")).join("");
 const {data,error}=await api.rpc("portfolio_access_login",{p_scope:scope,p_password:pw,p_fingerprint:fingerprint,p_token_digest:await digest(token)});
 if(error){console.error("login RPC",error.message);return json({error:"Verificação indisponível"},503)}
 if(!data)return json({error:"Senha inválida ou limite de tentativas excedido"},401);
 return json({token,expiresIn:14400,scope});
}
if(route==="/check"&&req.method==="POST"){
 let body:any;try{body=await req.json()}catch{return json({valid:false},400)}
 const token=req.headers.get("X-Portfolio-Token")||"";
 if(!["albums","timbo"].includes(body?.scope)||!/^[a-f0-9]{64}$/.test(token))return json({valid:false},401);
 const {data,error}=await api.rpc("portfolio_access_check",{p_scope:body.scope,p_token_digest:await digest(token)});
 return json({valid:!!data&&!error},data&&!error?200:401);
}
if(route==="/logout"&&req.method==="POST"){
 const token=req.headers.get("X-Portfolio-Token")||"";
 if(/^[a-f0-9]{64}$/.test(token))await api.rpc("portfolio_access_logout",{p_token_digest:await digest(token)});
 return json({ok:true});
}
if(route.startsWith("/asset/")&&req.method==="GET"){
 const path=safe(route.slice(7));if(!path)return json({error:"Caminho inválido"},400);
 const [project,...parts]=path.split("/");const scope=scopeFor[project];
 if(!scope||parts.length===0)return json({error:"Arquivo inválido"},404);
 const token=req.headers.get("X-Portfolio-Token")||"";
 if(!/^[a-f0-9]{64}$/.test(token))return json({error:"Não autorizado"},401);
 const {data:valid,error:checkError}=await api.rpc("portfolio_access_check",{p_scope:scope,p_token_digest:await digest(token)});
 if(checkError||!valid)return json({error:"Sessão expirada"},401);
 const {data,error}=await api.storage.from("portfolio-private").download(path);
 if(error||!data)return json({error:"Arquivo não encontrado"},404);
 return new Response(data.stream(),{status:200,headers:{...cors,"Content-Type":contentType(path),"X-Content-Type-Options":"nosniff"}});
}
return json({error:"Não encontrado"},404);
}catch(e){console.error("portfolio-access",String(e));return json({error:"Erro interno"},500)}
});