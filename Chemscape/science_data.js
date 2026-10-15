(()=>{
'use strict';
const A=window.CHEMSCAPE_LEGENDS_DATA,L=window.CHEMSCAPE_LEVELS,D=window.CHEMSCAPE_DEFINITIONS,V=window.CHEMSCAPE_V7,M=window.CHEMSCAPE_ASSET_META,clone=v=>JSON.parse(JSON.stringify(v));
const skills={astronomy:{name:'Astronomia',text:'Observe estrelas, planetas e órbitas no observatório científico. Produza cartas celestes e aprimore sua precisão com instrumentos de observação.'},chemistry:{name:'Química',text:'Analise substâncias na estação de Química e prepare reagentes na bancada. Cada oito níveis acrescentam 1 de poder mágico.'},physics:{name:'Física',text:'Estude forças e movimento na estação de Física e fabrique lentes. Cada oito níveis acrescentam 1 de resistência.'},astrology:{name:'Astrologia',text:'Um ofício místico de Vitrália: interprete cartas astrais e produza mapas estelares. Cada nível acrescenta 1 de mana máxima.'},quantum:{name:'Quântica',text:'Estude ressonâncias na estação quântica e estabilize núcleos. Cada oito níveis acrescentam 1 de poder mágico.'}};
for(const [id,s]of Object.entries(skills)){A.professions[id]={...s,icon:'science-'+id,group:'profession'};A.skillOrder.push(id);V.ui['science-'+id]='ui/skills/'+id+'.svg';}
window.CHEMSCAPE_ASSETS.register(Object.keys(skills).map(id=>'ui/skills/'+id+'.svg'));
const names={astronomy:'Carta celeste de observação',chemistry:'Reagente de restauração',physics:'Lente de precisão',astrology:'Carta astral de Vitrália',quantum:'Núcleo de ressonância'};
for(const [id,name]of Object.entries(names)){
 const item=clone(D.items[id==='physics'?'amuleto-ambar':'item-pocao-de-restauracao']);Object.assign(item,{id:'science-'+id,name,description:skills[id].text,icon:V.ui['science-'+id],sprite:'science-'+id,worldTags:['shared'],rarity:'uncommon',requirements:{level:1,attributes:{}},flat:{},percent:{},damageModifiers:{},resistances:{},value:30,questItem:false,discardable:true,tradable:true});
 if(id==='physics')Object.assign(item,{category:'accessory',slot:'accessory',stackMax:1,flat:{accuracy:.02,resistance:2}});
 else Object.assign(item,{category:'consumable',slot:'',stackMax:99,use:{hp:id==='chemistry'?35:0,mp:id==='chemistry'?10:0,duration:id==='chemistry'?0:90,buff:id==='astronomy'?{accuracy:.025}:id==='astrology'?{mpRegen:.2}:id==='quantum'?{magic:4,maxMP:8}:{},cooldown:15,ability:'',allowWaste:false,world:'any'}});
 D.items[item.id]=item;L.sprites[item.id]={file:item.icon,w:64,h:64,anchor:[32,54],visualBounds:[6,6,52,52],scale:.8};M[item.id]={label:name,thumb:item.icon,world:'shared',kind:'pickup',entity:'drop',category:'Ciências e artes astrais',tags:['skill','ciência','ofício']};
}
for(const [id,name,skill,xp,cost]of [
 ['science-celestial-chart','Traçar carta celeste','astronomy',75,[['prof-cloth',1],['legend-copper',1]]],
 ['science-reaction','Preparar reagente de restauração','chemistry',65,[['legend-herb',2],['legend-copper',1]]],
 ['science-optics','Montar lente de precisão','physics',65,[['legend-copper',2],['legend-tin',1]]],
 ['science-star-chart','Preparar carta astral','astrology',65,[['prof-cloth',1],['legend-herb',1]]],
 ['science-entanglement','Estabilizar núcleo quântico','quantum',80,[['legend-distillate',1],['legend-tin',1]]]
 ])A.recipes[id]={name,station:'bench',skill,level:1,xp,cost,item:'science-'+skill,quantity:1};
const stations={chemistry:['v7_spectrometer','Estação de Química'],physics:['v7_generator','Estação de Física'],astrology:['v6_lunar_observatory','Cartas astrais de Vitrália'],quantum:['v7_collider','Estação quântica'],astronomy:['v6_aion_observatory','Observatório de Astronomia']};
function applyMaps(maps){for(const id of ['world1','alchemy','exp-lab','arc-observatory']){const l=maps[id];if(!l)continue;const origin=id==='world1'?[1060,1920]:id==='alchemy'?[1050,3500]:[480,1120];for(const [i,[skill,[sprite,name]]]of Object.entries(stations).entries()){const key='science-'+id+'-'+skill;if(l.objects.some(o=>o.id===key))continue;const p=A.safePoint(l,[origin[0]+i*140,origin[1]]);l.objects.push({id:key,name,sprite,x:p[0],y:p[1],kind:'prop',scale:['astrology','astronomy'].includes(skill)?.28:.45,skillStation:'study',studySkill:skill});}}}
const original=A.applyMaps;A.applyMaps=maps=>{original(maps);applyMaps(maps);};applyMaps({...L.worlds,...L.rooms});D.contentVersion=14;
window.CHEMSCAPE_SCIENCE_DATA={skills,applyMaps};
})();
