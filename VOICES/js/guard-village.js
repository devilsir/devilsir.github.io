/* Registered module: guard-village */
(function(initialize){if(window.VoicesModules)window.VoicesModules.define('guard-village',initialize);else initialize();})(function(){
  'use strict';
  const V=window.V,C=V.Cozy,S=V.SceneDesign,A=V.NatureArt,T=48;
  const map='sanctuary-village-sa',family='guard-village',props='sanctuary-village-props',people='sanctuary-village-people';
  const copy=value=>JSON.parse(JSON.stringify(value));
  const facades=new Map([
    ['city-door-'+map+'-interior-sanctuary-bongani',{key:'sanctuary-village-bongani-home',entrance:.497}],
    ['city-door-'+map+'-interior-sanctuary-ranger-lindiwe',{key:'sanctuary-village-lindiwe-home',entrance:.451}]
  ]);

  const pieces=[
    ['Oficina dos guardas',6.4,{x:.10,y:.73,width:.80,height:.22}],
    ['Abrigo comunitário',5.8,[{x:.17,y:.75,width:.12,height:.19},{x:.70,y:.75,width:.12,height:.19},{x:.36,y:.73,width:.28,height:.17}]],
    ['Reservatório de chuva',2.6,{x:.25,y:.74,width:.50,height:.22}],
    ['Canteiro do viveiro',2.6,{x:.16,y:.77,width:.68,height:.19}],
    ['Painel das trilhas',1.8,{x:.20,y:.82,width:.60,height:.14}],
    ['Carrinho e ferramentas',2.0,{x:.17,y:.78,width:.66,height:.18}],
    ['Acácia',4.4,{x:.42,y:.84,width:.17,height:.13}],
    ['Rochas de arenito',2.6,{x:.23,y:.76,width:.57,height:.18}]
  ];
  for(const [index,[name,size,solidFootprint]] of pieces.entries()){
    V.sceneAssets.push({id:family+'-'+index,family,index,name,size,solid:true,solidFootprint,category:'Vila dos Guardas',layer:'object'});
  }
  const decor=(id,prop,x,y,size=pieces[prop][1],flip=false)=>
    [family,prop,x-size/2,y-size,size,true,{id:'rangers-'+id,flip}];
  const decorations=[
    decor('workshop',0,8.3,18.8),decor('shelter',1,24.9,24.6),
    decor('tank',2,3.8,18.1),decor('tank-shelter',2,30.1,24.9,2.2),
    decor('nursery-a',3,6.6,23.0),decor('nursery-b',3,9.6,23.0),
    decor('nursery-c',3,6.6,25.3),decor('nursery-d',3,9.6,25.3),
    decor('trail-board',4,19.6,24.5),decor('tools-workshop',5,11.3,18.9),decor('tools-nursery',5,11.8,25.5),
    decor('tree-west',6,3.5,11.7),decor('tree-north',6,17.2,7.0,4.8,true),
    decor('tree-east',6,30.4,19.4,4.1,true),decor('tree-southwest',6,3.8,29.0,3.7),
    decor('tree-southeast',6,30.1,29.4,4.3),decor('stones-north',7,13.2,5.7,2.4),
    decor('stones-east',7,31.3,22.5,2.1,true),decor('stones-west',7,2.9,21.7,2.2),
    decor('tree-northwest',6,6.2,6.4,3.8,true),decor('tree-northeast',6,28.7,7.1,4.7),
    decor('stones-northeast',7,24.5,4.8,2.2),decor('stones-southwest',7,8.2,29.7,1.8,true)
  ];
  const paths=[
    [2,14,30,2.7],[2,26,30,2.5],[15,7,4,22],
    [3,19.1,28,2.0],[12.0,20.6,2.1,5.7],[26.9,20.6,2.1,5.7],[22.1,23.1,5.1,3.0]
  ];
  const notes=[
    {id:'rangers-workshop-note',title:'Oficina dos guardas',text:'Aqui a equipe conserta ferramentas, placas e equipamentos de trilha. Sibusiso separa as peças que ainda podem ser reaproveitadas.',prop:0,x:7.4,y:18.9,hostDecor:'rangers-workshop'},
    {id:'rangers-nursery-note',title:'Viveiro da vila',text:'Nomsa acompanha as mudas antes de levá-las às áreas em recuperação. Os canteiros ajudam a comparar o crescimento e organizar a rega.',prop:3,x:7.6,y:23.5,hostDecor:'rangers-nursery-a'},
    {id:'rangers-trail-note',title:'Painel das trilhas',text:'O painel reúne os registros do turno. Confira com Karabo quais caminhos a equipe está usando e onde os visitantes podem observar a fauna.',prop:4,x:19.2,y:24.5,hostDecor:'rangers-trail-board'},
    {id:'rangers-water-note',title:'Água de chuva',text:'A água recolhida do telhado abastece a rega do viveiro. Leeto anota o nível do reservatório antes de cada turno.',prop:2,x:3.1,y:18.3,hostDecor:'rangers-tank'}
  ].map(note=>({kind:'notice',family,size:1,...note}));
  const lights=[[13.8,15.7],[20.7,19.4],[14.2,26.5],[24.9,25.4]].map(([x,y],i)=>({
    id:'rangers-light-'+i,type:'street',x:x*T,y:y*T,elevation:85,radius:168,
    color:'#ffe0a6',intensity:.52,enabled:true,schedule:'night'
  }));
  const anchors=[
    ['rangers-plant-care',8.4,24.4,'watering',15,1],
    ['rangers-equipment',10.5,19.2,'working',14,3],
    ['rangers-trail-reading',19.9,25.1,'reading',13,3],
    ['rangers-water-check',4.8,18.6,'observing',11,1],
    ['rangers-rest',24.1,25.1,'sitting',16,0]
  ];

  const neighbors=[
    {id:'nomsa',name:'Nomsa',row:0,role:'Viveirista',at:[9,24.3],
      en:'I check the soil before I water the seedlings. These plants will help restore the trail edges.',
      pt:'Confiro a terra antes de regar as mudas. Essas plantas vão ajudar a recuperar as bordas das trilhas.',
      words:['soil','water','plant','trail'],action:'Cuidando das mudas do viveiro'},
    {id:'sibusiso',name:'Sibusiso',row:1,role:'Técnico de manutenção',at:[10.9,19.7],
      en:'I repair trail signs and put the tools away before the next shift.',
      pt:'Conserto as placas da trilha e guardo as ferramentas antes do próximo turno.',
      words:['repair','trail','sign','tool'],action:'Revisando o equipamento da oficina'},
    {id:'karabo',name:'Karabo',row:2,role:'Guarda-parque',at:[20.6,25.8],
      en:'Look at the trail map before you leave. We can watch the animals from a safe distance.',
      pt:'Confira o mapa da trilha antes de sair. Podemos observar os animais a uma distância segura.',
      words:['map','trail','animal','observe'],action:'Conferindo o painel das trilhas'},
    {id:'leeto',name:'Leeto',row:3,role:'Assistente de campo',at:[5.1,18.6],
      en:'I record the water level every morning. The tank stores rainwater for the nursery.',
      pt:'Anoto o nível da água toda manhã. O reservatório guarda água da chuva para o viveiro.',
      words:['water','record','rain','plant'],action:'Anotando o nível do reservatório'}
  ].map(person=>({map,sheet:people,...person}));
  V.PlaceLife.people.push(...neighbors);

  const design=C.layouts[map];
  design.purpose='Vila da equipe de conservação, com oficina, viveiro e ponto de partida para as trilhas.';
  design.paths=copy(paths);
  design.decor.push(...copy(decorations));
  design.scenes.push(...copy(notes));
  design.anchors.push(...copy(anchors));
  design.adventure.lights.push(...copy(lights));
  design.guardVillageVersion=1;
  S.defaults[map]=copy(design);

  // Older editor exports retain their layout and gain the new village objects.
  function appendMissing(target,items,id){
    if(!Array.isArray(target))return;
    const existing=new Set(target.map(id));
    target.push(...copy(items.filter(item=>!existing.has(id(item)))));
  }
  const normalise=S.normalise.bind(S);
  S.normalise=function(doc){
    const village=doc?.maps?.[map];
    if(village&&typeof village==='object'&&!Array.isArray(village)&&!village.guardVillageVersion){
      doc=copy(doc);
      const draft=doc.maps[map];
      appendMissing(draft.decor,decorations,row=>row?.[6]?.id);
      appendMissing(draft.scenes,notes,entry=>entry?.id);
      appendMissing(draft.anchors,anchors,row=>row?.[0]);
      appendMissing(draft.adventure?.lights,lights,entry=>entry?.id);
      if(JSON.stringify(draft.paths)===JSON.stringify([[2,14,30,3],[2,26,30,3],[15,3,4,27]]))draft.paths=copy(paths);
      draft.guardVillageVersion=1;
    }
    return normalise(doc);
  };

  A.names.push(props,people,...Array.from(facades.values(),facade=>facade.key));
  const cell=A.cell.bind(A);
  A.cell=function(...args){
    const frame=cell(...args);
    if(frame.sheet===props)frame.rows=2;
    return frame;
  };
  const group=V.AssetLoader.group.bind(V.AssetLoader);
  V.AssetLoader.group=key=>key.startsWith('assets/nature/sanctuary-village-')?family:group(key);
  const groups=V.MapAssets.groups.bind(V.MapAssets);
  V.MapAssets.groups=function(m){
    const list=groups(m);
    if(m?.id===map||m?.decor?.some(o=>o.family===family))list.push(family);
    return [...new Set(list)];
  };
  const prop=C.prop.bind(C);
  C.prop=function(c,name,index,x,y,size,...args){
    if(name===family)return A.frame(c,props,Math.floor(index/4),index%4,x,y,size,size);
    return prop(c,name,index,x,y,size,...args);
  };

  const drawBuilding=C.drawBuilding.bind(C);
  C.drawBuilding=function(c,b,cam){
    const facade=facades.get(b.door),image=facade&&A.images[facade.key];
    if(!image?.naturalWidth)return drawBuilding(c,b,cam);
    const width=image.naturalWidth,height=image.naturalHeight;
    const entrance=facade.entrance*width;
    const scale=Math.min(b.w/(2*Math.max(entrance,width-entrance)),(b.h+56)/height);
    const x=b.x+b.w/2-cam.x,y=b.y+b.h-cam.y;
    c.save();c.imageSmoothingEnabled=false;
    c.drawImage(image,x-entrance*scale,y-height*scale,width*scale,height*scale);
    c.restore();
  };

  const ground=C.ground.bind(C),tiles=V.CapeVisuals;
  C.ground=function(m){
    if(m.id!==map)return ground(m);
    const canvas=V.GroundCache.create(m,m.width*T,m.height*T),c=canvas.getContext('2d');
    const width=V.GroundCache.width(canvas),height=V.GroundCache.height(canvas);
    tiles.fill(c,'grass',0,0,width,height);
    c.fillStyle='#c3a77438';c.fillRect(0,0,width,height);
    const grass=['#6c8d5d','#a5ae76','#c0ac71'];
    for(let y=24;y<height-20;y+=33)for(let x=19;x<width-20;x+=47){
      const n=(x*13+y*7)%61;
      if(n%5===0)continue;
      c.fillStyle=grass[n%grass.length];
      const dx=x+n%18,dy=y+n%14;
      c.fillRect(dx,dy,2,4);c.fillRect(dx+3,dy+3,2,3);
      if(n%4===0)c.fillRect(dx+6,dy-2,2,6);
    }
    const plots=[[4.8,21.1,6.5,4.8],[4.2,16.2,8.1,3.3],[22.3,21.8,5.3,3.1]];
    for(const [x,y,w,h] of plots){
      c.fillStyle='#726d4a';c.fillRect(x*T-3,y*T-3,w*T+6,h*T+6);
      tiles.fill(c,'path',x*T,y*T,w*T,h*T);
    }
    c.fillStyle='#526d48';
    for(const [x,y,w,h] of m.design.paths)c.fillRect(x*T-4,y*T-4,w*T+8,h*T+8);
    for(const [x,y,w,h] of m.design.paths)tiles.fill(c,'path',x*T,y*T,w*T,h*T);
    for(const building of m.buildings){
      const x=building.x+building.w/2-30,y=building.y+building.h;
      tiles.fill(c,'stone',x,y,60,54);
    }
    m.cache=canvas;
  };
});
