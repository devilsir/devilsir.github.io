/* Registered module: home-daily-collection */
(function(initialize){if(window.VoicesModules)window.VoicesModules.define('home-daily-collection',initialize);else if(window.VOICES_MODULE_MODE)throw new Error('Module loader is missing');else initialize();})(function(){
'use strict';
const V=window.V,D=V.HomeDesign,H=V.Homestead,C=V.Cozy,FAMILY='home-daily';
const rows=[
 ['breakfast','Mesa do café da manhã','Cozinha',54,'breakfast','food','preparing',2.6],['prep','Bancada de preparo · carvalho','Cozinha',69,'kitchen','food','preparing',2.6],['tea-cart','Carrinho de chá de nogueira','Cozinha',48,'tea','food','preparing',2.2],['loom','Tear doméstico com banco','Estudo',76,'weave','study','crafting',2.5],
 ['potting','Bancada de jardinagem','Decoração',62,'plant','plant','watering',2.6],['paint-table','Mesa de pintura com banco','Estudo',68,'paint','study','drawing',2.6],['chess-table','Mesa baixa de xadrez','Sala',52,'table','seat','playing',2.7],['reading-bench','Banco de leitura · verde-petróleo','Sala',61,'read','seat','reading',2.8],
 ['entry','Armário de entrada aberto','Sala',53,'coat','storage','tidying',2.5],['laundry','Bancada de dobrar roupa','Banheiro',57,'laundry','storage','tidying',2.6],['greenhouse','Estufa de vidro para plantas','Decoração',70,'plant','plant','watering',2.4],['aquarium','Aquário com gabinete de madeira','Decoração',84,'aquarium','decor','observing',2.6],
 ['floor-reading','Almofadas e cesto de leitura','Sala',29,'read','seat','reading',2.2,false],['screen','Biombo de trama natural','Decoração',65,'screen','decor','',2.7],['typewriter','Mesa de escrever com máquina','Estudo',71,'write','study','writing',2.5],['woodcraft','Bancada de marcenaria artesanal','Estudo',79,'workbench','storage','crafting',2.7]
];
const text={preparing:'Louças, utensílios e espaço para preparar uma refeição.',crafting:'Um canto para trabalhos manuais e projetos da casa.',watering:'Vasos e utensílios para cuidar das plantas.',drawing:'Tintas, tela e espaço de criação.',playing:'Uma mesa baixa para sentar e compartilhar uma partida.',reading:'Um lugar confortável para sentar com um livro.',tidying:'Organize os pertences e a mobília da casa.',observing:'Um aquário decorativo para observar os pequenos peixes.',writing:'Um canto para anotações, cartas e leituras.'};
const K=V.HomeDailyCollection={items:rows.map(([id,name,category,price,word,action,ambientAction,size,solid=true],prop)=>({id:'daily-'+id,name,category,price,word,action,ambientAction,size,solid,prop,family:FAMILY,description:text[ambientAction]||'Divida os espaços com madeira e trama natural.'}))};
H.catalog.push(...K.items);V.sceneAssets.push(...K.items.map(i=>({family:FAMILY,index:i.prop,id:i.id,name:i.name,description:i.description,category:'moradia',layer:'object',solid:i.solid,size:i.size,interaction:i.action,solidFootprint:i.solid?{x:.17,y:.73,width:.66,height:.2}:[]})));
const item=D.item.bind(D);D.item=o=>o?.scene?.family===FAMILY?K.items[o.scene.prop]:item(o);
const prop=C.prop.bind(C);C.prop=function(c,family,index,x,y,size,...rest){return family===FAMILY?D.art(c,FAMILY,index,x,y,size):prop(c,family,index,x,y,size,...rest);};
const group=V.AssetLoader.group.bind(V.AssetLoader);V.AssetLoader.group=key=>key.startsWith('assets/homestead/home-daily.')?'home-collection':group(key);
});
