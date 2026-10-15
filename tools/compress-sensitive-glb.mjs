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
const groups=[
  {name:'Somente texturas de cor',slots:'baseColor'},
  {name:'Todas as texturas',slots:null}
];
function attempt(group,quality) {
  const dst=path.join(folder, 'candidate-'+(group.slots?'color':'all')+'-'+quality+'.glb');
  const args=['webp',source,dst,'--quality',String(quality)];
  if(group.slots)args.push('--slots',group.slots);
  console.log('Testando '+group.name+', qualidade '+quality+'...');
  const cmd=spawnSync(cli,args,{encoding:'utf8',timeout:240000,maxBuffer:3_000_000});
  if(cmd.status!==0){
    console.error((cmd.stderr||cmd.stdout||cmd.error?.message||'Falha de conversão').slice(-1800));
    throw Error('Falha ao recomprimir com glTF Transform.');
  }
  const next=parseGLB(dst);
  if(JSON.stringify(topology(next.json))!==JSON.stringify(baseline)){
    throw Error('A estrutura de meshes/nós/skins/animações mudou. Nenhum original será substituído.');
  }
  if(next.json.asset?.version!=='2.0')throw Error('Versão do arquivo mudou.');
  tested.push({group:group.name,quality,bytes:next.size});
  console.log('Resultado: '+(next.size/1e6).toFixed(2)+' MB');
  candidates.push(dst);
  return {file:dst,size:next.size,quality,group:group.name};
}
for(const group of groups){
  const first=attempt(group,100);
  if(first.size<=target){chosen=first;break;}
  const lowest=attempt(group,35);
  if(lowest.size>target)continue;
  let low=36,high=99;
  chosen=lowest;
  while(low<=high){
    const q=Math.floor((low+high)/2);
    const trial=attempt(group,q);
    if(trial.size<=target){chosen=trial;low=q+1;}
    else high=q-1;
  }
  break;
}
const report={
  originalPath:source,
  originalBytes:original.size,
  limitBytes:target,
  strategy:'Somente imagens dentro do GLB, sem reduzir resolução ou malhas. Mantidos números de nós, materiais, meshes, skins e canais de animação.',
  selected:chosen?{quality:chosen.quality,bytes:chosen.size,group:chosen.group}:null,
  tested
};
fs.writeFileSync(reportFile,JSON.stringify(report,null,2)+'\n');
if(!chosen){
  console.error('Não foi possível chegar a 49 MB mantendo texturas em WebP >= 35 de qualidade. Modelo original preservado.');
  process.exitCode=2;
}else{
  fs.copyFileSync(chosen.file,source);
  const final=parseGLB(source);
  if(final.size>target)throw Error('O arquivo final ultrapassa 49 MB!');
  console.log('Concluído: '+(original.size/1e6).toFixed(2)+' → '+(final.size/1e6).toFixed(2)+' MB, qualidade '+chosen.quality);
}
for(const tmp of candidates){try{fs.rmSync(tmp)}catch{}}
try{fs.rmdirSync(folder)}catch{}
