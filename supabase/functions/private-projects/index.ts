import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BUCKET = 'portfolio-private';
const PROJECTS: Record<string, string> = {
  'album-familia': 'albums',
  'album-world-stars': 'albums',
  'timbo-speaker': 'timbo',
  'silvinho': 'timbo',
};
const COOKIE = '__Host-portfolio-access';
const encoder = new TextEncoder();
const cors = {
  'Access-Control-Allow-Origin': 'https://devilsir.github.io',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,apikey',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Vary': 'Origin',
};
const baseHeaders = { ...cors, 'Cache-Control': 'private,no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
const response = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { ...baseHeaders, 'Content-Type': 'application/json; charset=utf-8', ...headers } });

function base64url(data: Uint8Array) {
  let value = '';
  for (const byte of data) value += String.fromCharCode(byte);
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function decodeB64(value: string) {
  const str = atob(value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4));
  return Uint8Array.from(str, ch => ch.charCodeAt(0));
}
async function mac(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
}
async function verifyToken(token: string, secret: string, scope: string) {
  const [value, signature, extra] = token.split('.');
  if (!value || !signature || extra) return false;
  const expected = await mac(value, secret);
  if (signature.length !== expected.length) return false;
  let bad = 0;
  for (let i = 0; i < signature.length; i++) bad |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  if (bad) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(decodeB64(value)));
    return payload.scope === scope && Number.isSafeInteger(payload.exp) && payload.exp > Date.now() && payload.exp < Date.now() + 86400000;
  } catch { return false; }
}
async function makeToken(scope: string, secret: string) {
  const body = base64url(encoder.encode(JSON.stringify({ scope, exp: Date.now() + 4 * 3600 * 1000, jti: crypto.randomUUID() })));
  return body + '.' + await mac(body, secret);
}
function cookies(req: Request) {
  const value = req.headers.get('Cookie') || '';
  const found = value.split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE + '='));
  return found?.slice(COOKIE.length + 1) || '';
}
function clientIp(req: Request) {
  return (req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || 'unknown').slice(0, 128);
}
async function hash(value: string) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))), v => v.toString(16).padStart(2,'0')).join('');
}
async function verifyPassword(input: string, hashHex: string) {
  const [algorithm, iterations, salt, expected] = hashHex.split('$');
  if (algorithm !== 'pbkdf2-sha256' || !/^\d+$/.test(iterations) || !/^[0-9a-f]{32,128}$/.test(salt) || !/^[0-9a-f]{64}$/.test(expected)) throw Error('Invalid credential configuration');
  const key = await crypto.subtle.importKey('raw', encoder.encode(input.normalize('NFC')), 'PBKDF2', false, ['deriveBits']);
  const saltBytes = Uint8Array.from(salt.match(/../g)!, b => parseInt(b,16));
  const actual = new Uint8Array(await crypto.subtle.deriveBits({ name:'PBKDF2',hash:'SHA-256',salt:saltBytes,iterations:parseInt(iterations,10)}, key, 256));
  const target = Uint8Array.from(expected.match(/../g)!, b => parseInt(b,16));
  let mismatch = 0;
  for(let i=0;i<32;i++) mismatch |= actual[i] ^ target[i];
  return mismatch === 0;
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: baseHeaders });
  const origin = req.headers.get('Origin');
  if (origin && origin !== 'https://devilsir.github.io') return response({ error:'Origem não autorizada' },403);
  const secret = Deno.env.get('PORTFOLIO_SESSION_SECRET');
  const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const url = Deno.env.get('SUPABASE_URL');
  if (!secret || secret.length < 32 || !serviceRole || !url) return response({ error:'Serviço não configurado' },503);
  const supabase = createClient(url, serviceRole, { auth: { persistSession:false,autoRefreshToken:false }});
  const pathname = new URL(req.url).pathname;
  const tail = pathname.split('/functions/v1/private-projects')[1] || '/';
  if (tail === '/login' && req.method === 'POST') {
    let body: { scope?: string; password?: string };
    try { body = await req.json(); } catch { return response({error:'Dados inválidos'},400); }
    const scope = body.scope;
    const password = body.password;
    if ((scope !== 'albums' && scope !== 'timbo') || typeof password !== 'string' || password.length > 128) return response({error:'Dados inválidos'},400);
    const key = await hash(clientIp(req) + ':' + scope);
    const {data: allowed, error: rateError} = await supabase.rpc('portfolio_allow_attempt',{p_key:key});
    if (rateError) return response({error:'Limite temporariamente indisponível'},503);
    if (!allowed) return response({error:'Muitas tentativas. Aguarde 15 minutos.'},429);
    const verifier = Deno.env.get(scope === 'albums' ? 'PORTFOLIO_ALBUMS_HASH' : 'PORTFOLIO_TIMBO_HASH');
    if (!verifier) return response({error:'Grupo ainda não configurado'},503);
    const valid = await verifyPassword(password,verifier);
    const {error: recordError} = await supabase.rpc('portfolio_record_attempt',{p_key:key,p_success:valid});
    if (recordError) return response({error:'Falha ao registrar tentativa'},503);
    if (!valid) return response({error:'Senha incorreta'},401);
    const token = await makeToken(scope,secret);
    return response({ok:true,expiresIn:14400},200,{'Set-Cookie':COOKIE+'='+token+'; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=14400'});
  }
  if (tail === '/logout' && req.method === 'POST') return response({ok:true},200,{'Set-Cookie':COOKIE+'=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0'});
  if (req.method !== 'GET') return response({error:'Método inválido'},405);
  const path = tail.replace(/^\/+/, '');
  const segment = path.split('/');
  const project = segment.shift() || '';
  const scope = PROJECTS[project];
  if (!scope) return response({error:'Projeto não encontrado'},404);
  if (!await verifyToken(cookies(req),secret,scope)) return response({error:'Acesso não autorizado'},401);
  let asset = segment.join('/') || 'index.html';
  try {asset=decodeURIComponent(asset);} catch{return response({error:'Caminho inválido'},400);}
  if (asset.startsWith('/') || asset.includes('\\') || asset.split('/').some(p=>p === '..' || p === '.' || p === '') || asset.length>512) return response({error:'Caminho inválido'},400);
  const pathInBucket = project+'/'+asset;
  const {data, error} = await supabase.storage.from(BUCKET).download(pathInBucket);
  if (error || !data) return response({error:'Arquivo não encontrado'},404);
  const ext=asset.split('.').pop()?.toLowerCase();
  const mime:Record<string,string> = {
    html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',mjs:'text/javascript; charset=utf-8',
    css:'text/css; charset=utf-8',json:'application/json',webp:'image/webp',png:'image/png',jpg:'image/jpeg',
    jpeg:'image/jpeg',gif:'image/gif',svg:'image/svg+xml',ico:'image/x-icon',woff2:'font/woff2',
    wav:'audio/wav',mp3:'audio/mpeg',ogg:'audio/ogg',mp4:'video/mp4',webm:'video/webm',
    glb:'model/gltf-binary',gltf:'model/gltf+json',wasm:'application/wasm'
  };
  return new Response(data.stream(), {status:200,headers:{
    ...baseHeaders,
    'Content-Type':mime[ext||''] || data.type || 'application/octet-stream',
    'Content-Security-Policy':"frame-ancestors 'none'",
    'Cache-Control':'private,no-store'
  }});
});
