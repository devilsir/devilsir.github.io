(function communityFurniture(){
'use strict';
const V=window.V,C=V.Cozy,W=V.World,H=V.Homestead,G=V.HomeLiving,D=V.SceneDesign,data=V.CommunityFurnitureData,T=48,copy=x=>JSON.parse(JSON.stringify(x));
const families={'community-details':data.community,'apartment-details':data.apartments};
const item=o=>families[o?.scene?.family]?.[o.scene.prop];
for(const [name,sheet]of Object.entries(data.sheets)){
 V.AdventureArt[sheet.key]=sheet.path;
 V.AncestralArt.sheets['community-'+name]={key:sheet.key,cols:sheet.cols,rows:sheet.rows};
 V.AncestralArt.bounds['community-'+name]=sheet.bounds;
}
H.catalog.push(...data.apartments);
V.sceneAssets.push(...[...data.community,...data.apartments].map(i=>({id:i.id,family:i.family,index:i.prop,name:i.name,description:i.description,category:i.family==='community-details'?'ancestralidade':'moradia',size:i.size,solid:i.solid,layer:i.solid?'object':'ground',interaction:i.action||'observe',solidFootprint:i.solid?{x:.16,y:.73,width:.68,height:.19}:[]})));
const F=V.CommunityFurniture={data,additions:{},swaps:[],adjustments:[],
 hydrate(m){if(!m?.objects)return;for(const o of m.objects){const i=item(o);if(!i)continue;o.label=i.name;o.interactionRange=100;o.scene.hostDecor='solid-'+o.id;
  if(i.family==='apartment-details'){o.household=true;o.homeMap=m.id;}
  if(i.solid&&!m.solids.some(s=>s.owner===o.scene.hostDecor)){const z=(o.scene.size||i.size)*T;m.solids.push({x:o.x-z*.32,y:o.y-30,w:z*.64,h:17,owner:o.scene.hostDecor});}
  if(o.lifeInfo){o.lifeInfo.name=i.name;if(i.en){o.lifeInfo.en=i.en;o.lifeInfo.pt=i.description;}}
 }G.filterStored(m);},
 add(map,prop,x,y,size=2.3){const i=data.community[prop];(this.additions[map]||=[]).push({id:'custom-community-'+i.id,kind:'notice',family:i.family,prop,x,y,size,title:i.name,text:i.description,textEn:i.en});},
 upgrade(maps){for(const [map,rows]of Object.entries(this.additions)){const d=maps[map];if(!d)continue;d.scenes||=[];for(const s of rows)if(!d.scenes.some(o=>o.id===s.id))d.scenes.push(copy(s));}
  for(const s of this.swaps){const d=maps[s.map],o=d?.scenes.find(o=>o.id===s.id);if(o&&o.family===s.oldFamily&&o.prop===s.oldProp&&o.title===s.oldTitle){const i=data.apartments[s.prop];Object.assign(o,{family:i.family,prop:i.prop,title:i.name,text:i.description});}}
  for(const s of this.adjustments){const o=maps[s.map]?.scenes.find(o=>o.id===s.id);if(o&&Math.abs(o.x-s.oldX)<.01&&Math.abs(o.y-s.oldY)<.01){o.x=s.x;o.y=s.y;}}
  return maps;
 }
};
for(const [map,prop,x,y,size]of [
 ['umbanda',0,5,12,2.6],['umbanda',1,10,14,2.3],['umbanda',2,27,17,2.4],['umbanda',3,10,5,2.2],['umbanda',4,10,18,2.4],['umbanda',5,8,20,2.1],['umbanda',7,19,21,1.8],
 ['candomble',3,21,5,2.2],['candomble',6,26,10,2.4],['candomble',2,26,17,2.4],['candomble',5,12,6,2.1],['candomble',4,20,9,2.4],['candomble',7,20,23,1.8],
 ['botica',8,5,12,2.6],['botica',9,10,5,2.2],['botica',10,18.5,5,2.4],['botica',11,26,14,2.5],['botica',12,24,23.5,2.5],['botica',13,10,20,2.1],['botica',14,26,9,2.2],['botica',15,5,17,2.2]
])F.add('interior-'+map,prop,x,y,size);
// Introduce the new styles in existing apartments without filling their paths
// with extra furniture. Custom titles, positions and already edited styles stay.
for(const [map,oldProp,prop]of [
 ['202',20,7],['202',17,1],['203',20,7],['204',17,2],['204',18,3],['205',17,1],
 ['302',16,0],['303',20,5],['304',12,15],['304',22,14],['305',22,14]
]){const id='interior-horizonte-'+map,d=C.layouts[id],o=d?.scenes.find(o=>o.family==='home'&&o.prop===oldProp);if(o)F.swaps.push({map:id,id:o.id,oldFamily:o.family,oldProp,oldTitle:o.title,prop});}
for(const floor of [2,3])for(const unit of [2,3,4,5]){const map='interior-horizonte-'+floor+'0'+unit,d=C.layouts[map],o=d?.scenes.find(s=>s.id.endsWith('-toilet-white')),room=d?.construction.rooms[0];if(!o||!room)continue;const b=V.Rooms.box(room.polygon);F.adjustments.push({map,id:o.id,oldX:o.x,oldY:o.y,x:(b.x+b.w*.94-24)/T,y:(b.y+b.h*.25-24)/T});}
F.upgrade(C.layouts);
for(const id of new Set([...Object.keys(F.additions),...F.swaps.map(s=>s.map),...F.adjustments.map(s=>s.map)])){D.defaults[id]=copy(C.layouts[id]);if(H.defaults[id])H.defaults[id]=copy(C.layouts[id]);if(V.Ancestral.authored[id])V.Ancestral.authored[id]=copy(C.layouts[id]);}
const normalise=D.normalise.bind(D),document=D.document.bind(D);
D.normalise=function(input){if(input?.maps&&(input.communityFurnitureVersion||0)<1){input=copy(input);F.upgrade(input.maps);}return normalise(input);};
D.document=function(...args){return {...document(...args),communityFurnitureVersion:1};};
const prop=C.prop.bind(C);C.prop=function(ctx,family,index,x,y,size,...args){if(families[family])return V.AncestralArt.tile(ctx,family==='community-details'?'community-community':'community-apartments',index,x,y,size);return prop(ctx,family,index,x,y,size,...args);};
const getItem=G.item.bind(G);G.item=function(o){return o?.scene?.family==='apartment-details'?item(o):getItem(o);};
const isBed=H.isBed;H.isBed=o=>o?.scene?.family==='apartment-details'&&item(o)?.action==='bed'||isBed(o);
const hydrate=V.City.hydrate.bind(V.City);V.City.hydrate=function(m){hydrate(m);F.hydrate(m);};
const compose=C.compose.bind(C);C.compose=function(m){compose(m);F.hydrate(m);};
const apply=H.applyFurniture.bind(H);H.applyFurniture=function(...args){const result=apply(...args);for(const m of Object.values(W.maps))F.hydrate(m);return result;};
const ground=C.ground.bind(C);C.ground=function(m){ground(m);const ctx=m.cache.getContext('2d');for(const o of m.objects){const i=item(o);if(i?.solid===false){const z=(o.scene.size||i.size)*T;C.prop(ctx,i.family,i.prop,o.x-z/2,o.y-z*.99,z);}}};
const draw=C.drawObject.bind(C);C.drawObject=function(ctx,o,cam,t){const i=item(o);if(!i)return draw(ctx,o,cam,t);const z=(o.scene.size||i.size)*T,x=o.x-cam.x,y=o.y-cam.y;if(i.solid)C.prop(ctx,i.family,i.prop,x-z/2,y-z*.99,z);
 if(i.action==='light'&&H.ensure()?.lamps[o.id]){ctx.save();const g=ctx.createRadialGradient(x,y-z*.6,4,x,y-z*.6,z*.5);g.addColorStop(0,'#ffdf9470');g.addColorStop(1,'#ffdf9400');ctx.fillStyle=g;ctx.fillRect(x-z/2,y-z,z,z);ctx.restore();}
 if(W.nearest?.id===o.id)V.Living.marker(ctx,x,y,'E','#e7cb8e');
};
const instrument=V.Activities.instrument.bind(V.Activities);V.Activities.instrument=function(o){return o?.scene?.family==='apartment-details'&&item(o)?.action==='instrument'?'piano':instrument(o);};
const interact=V.Game.interact.bind(V.Game);V.Game.interact=function(o){const i=item(o);if(!i||V.modal||V.Dialogue.active)return interact(o);V.PixCollection.collect(i.word,'Ambiente · '+i.name);
 if(i.family==='community-details'){V.UI.modal(i.name,'CONVIVÊNCIA · '+W.current.name,`<p>${V.escape(i.description)}</p><p lang="en">${V.escape(i.en)}</p>${C.sourceLinks(i.sourceIds)}`);return;}
 switch(i.action){
 case'bed':return H.sleep(o);
 case'seat':return V.Activities.perform('sit');
 case'study':V.Living.journal('readings');return V.Activities.perform('read',{close:false});
 case'storage':return H.homeShop('stored',G.room());
 case'food':case'fridge':return V.Life.panel('food');
 case'cook':return V.Botica.recipes('food');
 case'media':return V.Life.games();
 case'instrument':return C.music(o);
 case'light':H.ensure().lamps[o.id]=!H.ensure().lamps[o.id];V.Save.save();return V.UI.toast('Abajur '+(H.ensure().lamps[o.id]?'aceso.':'apagado.'));
 case'wash':V.City.appliances.set(o.id,{startedAt:performance.now()/1000,duration:3.2});return V.UI.toast('Usando '+i.name.toLowerCase()+'.');
 case'sew':V.Activities.perform('think',{close:false});break;
 case'paint':V.Activities.perform('think',{close:false});break;
 }
 V.UI.modal(i.name,'MÓVEL DO APARTAMENTO',`<p>${V.escape(i.description)}</p>`);
};
const initContent=V.Living.initContent.bind(V.Living);V.Living.initContent=function(...args){const result=initContent(...args);for(const source of data.sources)if(!V.content.sources.some(s=>s.id===source.id))V.content.sources.push(copy(source));return result;};
})();
