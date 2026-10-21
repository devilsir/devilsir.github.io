(function terreirosCollection(){
'use strict';
const V=window.V,C=V.Cozy,W=V.World,D=V.SceneDesign,T=48,data=V.TerreirosCollectionData,copy=x=>JSON.parse(JSON.stringify(x));
const groups=data.groups,byFamily=new Map(Object.values(groups).map(g=>[g.key,g]));
const B=V.TerreirosCollection={data,plans:V.TerreirosCollectionPlans||{},
 item(o){return byFamily.get(o?.scene?.family)?.items[o.scene.prop];},
 upgrade(maps){for(const[id,rows]of Object.entries(this.plans)){const d=maps[id];if(!d)continue;d.scenes||=[];for(const row of rows)if(!d.scenes.some(s=>s.id===row.id))d.scenes.push(copy(row));}return maps;},
 hydrate(m){if(!m?.objects)return;for(const o of m.objects){const i=this.item(o);if(!i)continue;o.label=o.scene.title||i.name;o.interactionRange=100;m.solids=m.solids.filter(s=>s.owner!==o.id);o.scene.hostDecor='solid-'+o.id;if(i.solid&&!m.solids.some(s=>s.owner===o.scene.hostDecor)){const z=(o.scene.size||i.size)*T;m.solids.push({x:o.x-z*.32,y:o.y-30,w:z*.64,h:17,owner:o.scene.hostDecor});}}},
 inspect(o){const i=this.item(o);if(!i)return;const pt=o.scene.text||i.description,en=pt===i.description?i.en:o.scene.textEn;
  V.UI.modal(o.scene.title||i.name,W.current.name,`<div class="two-cols"><article class="card"><canvas id="collection-object-art" width="160" height="160" aria-label="${V.escape(i.name)}"></canvas><h3 lang="en">${V.escape(i.word)}</h3><p>${V.escape(i.translation)}</p></article><article class="card"><p>${V.escape(pt)}</p>${en?'<p lang="en">'+V.escape(en)+'</p>':''}${pt===i.description?C.sourceLinks(i.sourceIds):''}</article></div>`,`<button id="collection-reading" class="secondary">Consultar leitura da casa</button>${i.action==='sit'?'<button id="collection-sit" class="primary">Sentar aqui</button>':''}`,true);
  const c=V.$('#collection-object-art');if(c?.getContext)C.prop(c.getContext('2d'),i.family,i.prop,4,4,152);
  V.$('#collection-reading').onclick=()=>V.Living.read(i.readingId,0,()=>this.inspect(o));
  V.$('#collection-sit')?.addEventListener('click',()=>{V.UI.close();C.playerSit(o);});
 }
};
for(const [name,g]of Object.entries(groups)){V.AdventureArt[g.key]=g.path;V.AncestralArt.sheets[g.key]={key:g.key,cols:6,rows:4};V.AncestralArt.bounds[g.key]=g.bounds;V.sceneAssets.push(...g.items.map(i=>({id:i.id,family:i.family,index:i.prop,name:i.name,description:i.description,category:name,solid:i.solid,size:i.size,layer:i.solid?'object':'ground',interaction:i.action,solidFootprint:i.solid?{x:.18,y:.74,width:.64,height:.15}:[],sourceRect:{x:g.bounds[i.prop][0],y:g.bounds[i.prop][1],width:g.bounds[i.prop][2],height:g.bounds[i.prop][3]}})));}
B.upgrade(C.layouts);for(const id of Object.keys(B.plans)){D.defaults[id]=copy(C.layouts[id]);if(V.Ancestral.authored[id])V.Ancestral.authored[id]=copy(C.layouts[id]);}
const prop=C.prop.bind(C);C.prop=function(ctx,family,index,x,y,size,...args){if(byFamily.has(family))return V.AncestralArt.tile(ctx,family,index,x,y,size);return prop(ctx,family,index,x,y,size,...args);};
const compose=C.compose.bind(C);C.compose=function(m){compose(m);B.hydrate(m);};
const hydrate=V.City.hydrate.bind(V.City);V.City.hydrate=function(m){hydrate(m);B.hydrate(m);};
const ground=C.ground.bind(C);C.ground=function(m){ground(m);const ctx=m.cache.getContext('2d');for(const o of m.objects){const i=B.item(o);if(i&&!i.solid){const z=(o.scene.size||i.size)*T;C.prop(ctx,i.family,i.prop,o.x-z/2,o.y-z*.99,z);}}};
const draw=C.drawObject.bind(C);C.drawObject=function(ctx,o,cam,t){const i=B.item(o);if(!i)return draw(ctx,o,cam,t);const x=o.x-cam.x,y=o.y-cam.y,z=(o.scene.size||i.size)*T;if(i.solid)C.prop(ctx,i.family,i.prop,x-z/2,y-z*.99,z);if(W.nearest?.id===o.id)V.Living.marker(ctx,x,y,'E','#d6c38e');};
const interact=V.Game.interact.bind(V.Game);V.Game.interact=function(o){if(!B.item(o)||V.modal||V.Dialogue.active)return interact(o);return B.inspect(o);};
const normalise=D.normalise.bind(D),doc=D.document.bind(D);D.normalise=function(input){if(input?.maps&&(input.terreirosAssetsVersion||0)<1){input=copy(input);B.upgrade(input.maps);}return normalise(input);};D.document=function(...args){return{...doc(...args),terreirosAssetsVersion:1};};
const init=V.Living.initContent.bind(V.Living);V.Living.initContent=function(...args){const result=init(...args);for(const s of data.sources)if(!V.content.sources.some(x=>x.id===s.id))V.content.sources.push(copy(s));return result;};
const mount=V.SceneEditor.mount.bind(V.SceneEditor);V.SceneEditor.mount=function(...args){const result=mount(...args),select=V.$('#editor-category');for(const[value,label]of [['umbanda','Umbanda · objetos'],['candomble','Candomblé · objetos'],['botica','Botica · cultivo e ciência']])if(select&&![...select.options].some(o=>o.value===value)){const option=document.createElement('option');option.value=value;option.textContent=label;select.appendChild(option);}return result;};
})();
