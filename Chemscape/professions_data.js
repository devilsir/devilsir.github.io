(()=>{
'use strict';
const A=window.CHEMSCAPE_LEGENDS_DATA,L=window.CHEMSCAPE_LEVELS,D=window.CHEMSCAPE_DEFINITIONS,V=window.CHEMSCAPE_V7,M=window.CHEMSCAPE_ASSET_META,clone=v=>JSON.parse(JSON.stringify(v));
const definitions={
 attack:{name:'Ataque',icon:'attack',group:'combat',text:'Treine a precisão corpo a corpo na postura precisa ou equilibrada.'},
 strength:{name:'Força',icon:'prof-strength',group:'combat',text:'Treine golpes corpo a corpo na postura agressiva ou equilibrada.'},
 defence:{name:'Defesa',icon:'prof-defence',group:'combat',text:'Receba golpes ou lute na postura defensiva.'},
 constitution:{name:'Condição física',icon:'health',group:'combat',text:'Evolui em combate, ao causar e receber dano. Cada nível acrescenta 2 de vida máxima.'},
 ranged:{name:'Ranged',icon:'prof-bow',group:'combat',text:'Equipe um arco e leve flechas na mochila. Acerte alvos à distância para evoluir.'},
 magic:{name:'Magia',icon:'mana',group:'combat',text:'Cause dano com as técnicas mágicas da barra de habilidades.'},
 prayer:{name:'Prece',icon:'prof-prayer',group:'combat',text:'Ofereça ossos num altar para obter XP. Ative a prece para melhorar a defesa; os pontos se esgotam com o tempo.'},
 woodcutting:{name:'Corte de lenha',icon:'prof-axe',group:'profession',text:'Use F nas árvores marcadas para obter toras. O machado de aprendiz é usado automaticamente.'},
 firemaking:{name:'Arte do fogo',icon:'prof-fire',group:'profession',text:'Use toras na receita Acender fogueira. A fogueira permanece no chão durante algum tempo.'},
 crafting:{name:'Artesanato',icon:'prof-crafting',group:'profession',text:'Na bancada, produza arcos, flechas, tecido e sementes.'},
 farming:{name:'Agricultura',icon:'prof-farming',group:'profession',text:'Plante sementes nos canteiros com F, regue uma vez e volte para colher algodão.'}
};
for(const d of Object.values(A.professions))d.group='profession';
Object.assign(A.professions,definitions);
A.skillOrder=['attack','strength','defence','constitution','ranged','magic','prayer','woodcutting','firemaking','mining','herblore','fishing','crafting','farming','alchemy','smithing','research'];
const names={log:'Tora de madeira',charcoal:'Carvão vegetal',seed:'Sementes de algodão',cotton:'Algodão colhido',cloth:'Tecido artesanal',arrow:'Flechas de aprendiz',bones:'Ossos ancestrais',ash:'Cinza de oferenda',bow:'Arco de aprendiz'};
for(const [id,name]of Object.entries(names)){
 const item=clone(D.items[id==='bow'?'bastao-aurora':'legend-copper']);Object.assign(item,{id:'prof-'+id,name,description:name+'. Recurso dos ofícios de campo.',icon:window.CHEMSCAPE_ASSETS.resolve('items/professions/'+id+'.svg'),sprite:'prof-'+id,value:id==='bow'?55:6});
 if(id==='bow')Object.assign(item,{weaponType:'bow',requirements:{level:1,attributes:{}},flat:{dmg:6,accuracy:.03,as:-.12},description:'Arma de Ranged. Requer flechas na mochila; alcance de 480 px.'});
 else Object.assign(item,{category:'material',slot:'',stackMax:id==='arrow'?999:99,questItem:false,requirements:{level:1,attributes:{}},flat:{},percent:{}});
 D.items[item.id]=item;L.sprites[item.sprite]={file:item.icon,w:64,h:64,anchor:[32,54],visualBounds:[8,8,48,46],scale:.8};M[item.sprite]={label:name,thumb:item.icon,kind:'pickup',entity:'drop',world:'shared',category:'Ofícios e recursos',tags:['ofício','recurso']};
}
for(const id of ['strength','defence','bow','prayer','axe','fire','crafting','farming'])V.ui['prof-'+id]=window.CHEMSCAPE_ASSETS.resolve('items/professions/'+id+'.svg');
L.sprites['prof-plot']={file:'environment/props/farming/plot.svg',w:64,h:48,anchor:[32,36],visualBounds:[0,0,64,48],scale:1.5};
M['prof-plot']={label:'Canteiro de algodão',thumb:'environment/props/farming/plot.svg',kind:'prop',entity:'object',world:'shared',category:'Ofícios e recursos',tags:['agricultura']};
const recipe=(id,name,station,skill,xp,cost,item,quantity=1,level=1)=>A.recipes[id]={name,station,skill,level,xp,cost,item,quantity};
recipe('prof-bow','Montar arco de aprendiz','bench','crafting',70,[['prof-log',2]],'prof-bow');
recipe('prof-arrows','Produzir 20 flechas','bench','crafting',40,[['prof-log',1],['legend-copper',1]],'prof-arrow',20);
recipe('prof-seeds','Separar quatro sementes','bench','crafting',25,[['legend-herb',1]],'prof-seed',4);
recipe('prof-cloth','Tecer algodão','bench','crafting',65,[['prof-cotton',3]],'prof-cloth');
recipe('prof-fire','Acender fogueira','field','firemaking',50,[['prof-log',1]],'prof-charcoal');
recipe('prof-offering','Oferecer ossos ancestrais','altar','prayer',65,[['prof-bones',1]],'prof-ash');
for(const m of Object.values(D.monsters))if(/wolf|sheep|boar|bison|stag|beast|rat|hen|scorpion/.test(m.species+' '+m.sprite)&&!m.loot.entries.some(e=>e.itemId==='prof-bones'))m.loot.entries.push({itemId:'prof-bones',min:1,max:1,chance:1,guaranteed:true,condition:''});
function add(l,o){if(!l.objects.some(v=>v.id===o.id))l.objects.push(o);}
function applyMaps(maps){
 for(const l of Object.values(maps)){
  if(l.id==='alchemy'&&l.puzzleBridge){l.puzzleBridge.decorative=true;l.puzzleBridge.groundRepair={tile:'11,4',source:[192,10,252,68],bounds:[6090,2058,252,68]};l.obstacles=(l.obstacles||[]).filter(o=>!o.requiresPuzzle||Math.hypot(o.x+o.w/2-l.puzzleBridge.x,o.y+o.h/2-l.puzzleBridge.y)>350);}
  if(l.environment==='indoor'||!['world1','alchemy','exp-human','exp-orc','exp-goblin','exp-troll','exp-tauren','exp-lunar','exp-blood'].includes(l.id))continue;
  const origin=l.id==='world1'?[990,1680]:l.id==='alchemy'?[1110,3200]:[280,1170],point=p=>A.safePoint(l,p),prefix='prof-'+l.id;
  for(let i=0;i<2;i++){const p=point([origin[0]-100-i*110,origin[1]-100]);add(l,{id:prefix+'-tree-'+i,sprite:l.world==='science'?'tree_science':'tree_alchemy',x:p[0],y:p[1],name:'Cortar árvore · toras',kind:'tree',scale:.85,solid:[-10,-12,20,12],professionTree:true,skillNode:{skill:'woodcutting',itemId:'prof-log',level:1,quantity:1,xp:45,delay:40,duration:2.2}});}
  for(let i=0;i<2;i++){const p=point([origin[0]+i*110,origin[1]+80]);add(l,{id:prefix+'-plot-'+i,sprite:'prof-plot',x:p[0],y:p[1],name:'Canteiro de algodão',kind:'prop',scale:1,professionPlot:true,skillNode:{skill:'farming',level:1,itemId:'prof-cotton',quantity:3,xp:80,delay:1,duration:1}});}
  const p=point([origin[0]+180,origin[1]-30]);add(l,{id:prefix+'-altar',sprite:'tauren_spirit_stone',x:p[0],y:p[1],kind:'prop',name:'Altar ancestral',scale:.55,skillStation:'altar'});
  if(!l.objects.some(o=>o.skillStation==='bench')){const p=point([origin[0]+70,origin[1]-60]);add(l,{id:prefix+'-bench',sprite:'v7_terminal',x:p[0],y:p[1],kind:'prop',name:'Bancada de ofícios',scale:.7,skillStation:'bench'});}
 }
}
const sheep=L.sprites.sheep;if(sheep){sheep.sheet.animations.idle=[0,1,2,3,4,5,6,7];sheep.sheet.animations.walk=[0,1,2,3,4,5,6,7];sheep.sheet.animations.run=[0,1,2,3,4,5,6,7];sheep.sheet.animations.jump=[8,9,10,11,12,13];sheep.sheet.fpsByAnimation={idle:4,walk:8,run:8,jump:8};sheep.hasShadow=true;}
const original=A.applyMaps;A.applyMaps=maps=>{original(maps);applyMaps(maps);};applyMaps({...L.worlds,...L.rooms});
window.CHEMSCAPE_ASSETS.migrate(D);window.CHEMSCAPE_ASSETS.migrate(L);window.CHEMSCAPE_ASSETS.migrate(M);window.CHEMSCAPE_ASSETS.migrate(V);D.contentVersion=12;
window.CHEMSCAPE_PROFESSIONS_DATA={applyMaps,definitions};
})();
