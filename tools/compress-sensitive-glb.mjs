import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const source = process.argv[2] || 'silvinho/silvinho/assets/model/silvio.glb';
const target = 49_000_000;
const nodeRoot = path.dirname(fileURLToPath(import.meta.url));
const reportFile = path.resolve(nodeRoot, 'silvio-compression-report.json');
const cli = path.resolve('node_modules/.bin/gltf-transform');
const candidates = [];
if (!fs.existsSync(source)) throw Error('Modelo ausente: ' + source);

function parseGLB(filename) {
  const bytes=fs.readFileSync(filename);
  if(bytes.length < 20 || bytes.toString('ascii',0,4) !== 'glTF' || bytes.readUInt32LE(4)!==2 || bytes.readUInt32LE(8)!==bytes.length) throw Error('GLB inválido: '+filename);
  const jsonLen=bytes.readUInt32LE(12),jsonType=bytes.readUInt32LE(16);
  if(jsonType!==0x4e4f534a || jsonLen>bytes.length-20)throw Error('JSON GLB inválido: '+filename);
  const doc=JSON.parse(bytes.toString('utf8',20,20+jsonLen));
  return {size:bytes.length,json:doc};
}
function topology(doc) {
  const size=k=>(doc[k]||[]).length;
  return {
    scenes:size('scenes'),nodes:size('nodes'),meshes:size('meshes'),
    materials:size('materials'),skins:size('skins'),animations:size('animations'),
    morphs:(doc.meshes||[]).reduce((sum,m)=>sum+(m.primitives||[]).reduce((count,p)=>count+(p.targets?.length||0),0),0),
    primitiveSignatures:(doc.meshes||[]).map(m=>(m.primitives||[]).map(p=>({
      mode:p.mode??4,attributes:Object.keys(p.attributes||{}).sort(),
      targets:(p.targets||[]).map(t=>Object.keys(t).sort())
    }))),
    animationChannels:(doc.animations||[]).map(a=>(a.channels||[]).map(c=>({
      path:c.target?.path,node:c.target?.node
    })))
  };
}
const original=parseGLB(source);
const baseline=topology(original.json);
if(original.size <= target){
  console.log('Já abaixo de 49 MB. Nenhum ajuste necessário.');
  process.exit(0);
}
console.log('Original: '+(original.size/1e6).toFixed(2)+' MB');
console.log('Texturas: '+(original.json.images||[]).length+
  ' | Geometria: '+(original.json.meshes||[]).length+
  ' | Animações: '+(original.json.animations||[]).length);
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'silvio-glb-'));
const tested=[];
let chosen=null;
function command(args) {
 const proc=spawnSync(cli,args,{encoding:'utf8',timeout:240000,maxBuffer:3_000_000});
 if(proc.status!==0) throw Error((proc.stderr||proc.stdout||'Conversion failed').slice(-1700));
}
function attempt(input,label,quality) {
  const dst=path.join(folder,'candidate-'+label+'-'+quality+'.glb');
  console.log('Testando resolução '+label+', WebP '+quality+'...');
  command(['webp',input,dst,'--quality',String(quality)]);
  const next=parseGLB(dst);
  if(JSON.stringify(topology(next.json))!==JSON.stringify(baseline))throw Error('Estrutura, skins ou animações mudaram; abortado.');
  if(next.json.asset?.version!=='2.0')throw Error('Formato alterado');
  tested.push({resolution:label,quality,bytes:next.size});
  candidates.push(dst);
  console.log('Resultado: '+(next.size/1e6).toFixed(2)+' MB');
  return {file:dst,size:next.size,quality,resolution:label};
}
const stages=[null,4096,3072,2048,1536,1024];
for (const dimension of stages) {
 let input=source;
 const label=dimension?String(dimension):'original';
 if(dimension) {
   input=path.join(folder,'resized-'+dimension+'.glb');
   console.log('Limitando texturas a '+dimension+' px');
   command(['resize',source,input,'--width',String(dimension),'--height',String(dimension)]);
 }
 const first=attempt(input,label,95);
 if(first.size<=target){chosen=first;break;}
 const lowest=attempt(input,label,70);
 if(lowest.size>target)continue;
 chosen=lowest;
 let low=71,high=94;
 while(low<=high) {
   const q=Math.floor((low+high)/2);
   const trial=attempt(input,label,q);
   if(trial.size<=target){chosen=trial;low=q+1;} else high=q-1;
 }
 break;
}
if(!chosen){
 console.log('Testando compressão estrutural Meshopt lossless da geometria/animações...');
 const meshout=path.join(folder,'meshopt.glb');
 command(['meshopt',source,meshout,'--level','high']);
 const compressed=parseGLB(meshout);
 console.log('Meshopt: '+(compressed.size/1e6).toFixed(2)+' MB');
 const nextTopology=topology(compressed.json);
 console.log('Contagens originais:',JSON.stringify(Object.fromEntries(Object.entries(baseline).filter(([k])=>!['primitiveSignatures','animationChannels'].includes(k)))));
 console.log('Contagens convertidas:',JSON.stringify(Object.fromEntries(Object.entries(nextTopology).filter(([k])=>!['primitiveSignatures','animationChannels'].includes(k)))));
 for(const k of ['scenes','meshes','animations','morphs']){
   if(nextTopology[k]!==baseline[k])throw Error('Meshopt modificou '+k+'; original preservado');
 }
 if(nextTopology.animationChannels.length!==baseline.animationChannels.length ||
   nextTopology.animationChannels.some((list,i)=>list.length!==baseline.animationChannels[i].length))
   throw Error('Meshopt mudou número de canais animados.');
 tested.push({method:'meshopt',quality:'geometry-encoded',bytes:compressed.size});
 if(compressed.size<=target)chosen={file:meshout,size:compressed.size,quality:'meshopt',resolution:'original',method:'meshopt'};
}
const report={
  originalPath:source,
  originalBytes:original.size,
  limitBytes:target,
  strategy:'Compressão de texturas com possível redução controlada da resolução; preservados nós, malhas, skins e canais de animação.',
  selected:chosen?{quality:chosen.quality,bytes:chosen.size,resolution:chosen.resolution,method:chosen.method||'webp'}:null,
  tested
};
fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');
if(!chosen){
  console.error('Não foi possível chegar a 49 MB sem exceder a redução para 1024px / WebP 70. Modelo original preservado.');
  process.exitCode=2;
}else{
  const candidatePath=source.replace(/\.glb$/i,'-compressed.glb');
  fs.copyFileSync(chosen.file,candidatePath);
  const final=parseGLB(candidatePath);
  if(final.size>target)throw Error('O arquivo final ultrapassa 49 MB!');
  console.log('Gerado candidato alternativo: '+candidatePath+' ('+(final.size/1e6).toFixed(2)+' MB). Original preservado.');
}
for(const tmp of candidates){try{fs.rmSync(tmp)}catch{}}
try{fs.rmdirSync(folder)}catch{}
