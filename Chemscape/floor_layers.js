(()=>{
'use strict';
const count=6,layer=key=>Number(String(key).split(':')[3])||1;
const settings=(l,n)=>({name:'Camada '+n,visible:true,locked:false,...l.paint?.layers?.[n-1]});
const visible=(l,key)=>settings(l,layer(key)).visible!==false;
const compare=(l,a,b)=>layer(a)-layer(b)||(l.paint.tiles[a]?.order||0)-(l.paint.tiles[b]?.order||0);
const keys=l=>Object.keys(l.paint?.tiles||{}).filter(k=>visible(l,k)).sort((a,b)=>compare(l,a,b));
window.CHEMSCAPE_FLOOR_LAYERS={count,layer,settings,visible,compare,keys};
})();
