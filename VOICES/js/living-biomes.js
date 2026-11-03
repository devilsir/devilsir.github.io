(function(){
'use strict';
const V=window.V,N=V.NatureWorld,D=V.NatureData,W=V.World,C=V.Cozy,S=V.SceneDesign,A=V.NatureArt,T=48;
const SAV='nature-savanna',CER='nature-cerrado',copy=x=>JSON.parse(JSON.stringify(x));
Object.assign(D.sources,{
 cerradoBirds:{title:'Embrapa · Fauna do Cerrado',url:'https://www.embrapa.br/en/web/agencia-de-informacao-tecnologica/tematicas/bioma-cerrado/fauna/mamiferos'},
 savannaCounts:{title:'SANParks · Fauna e tendências do Kruger',url:'https://www.sanparks.org/wp-content/uploads/2025/03/KNP-wildlife-trends.pdf'},
 savannaBirds:{title:'SANParks · Aves do Kruger',url:'https://www.sanparks.org/parks/kruger/explore/fauna-flora/birds/checklist'}
});
const additions=[
 ['rhea','Ema','Rhea americana','cerrado-fauna',0,CER,'cerradoBirds',100,'Ave de grande porte dos campos do Cerrado. Observe suas pernas compridas e a plumagem acinzentada.','Uma ave dos campos que se desloca em terra.'],
 ['seriema','Seriema','Cariama cristata','cerrado-fauna',1,CER,'cerradoBirds',74,'Ave terrestre do Cerrado, representada aqui com pernas avermelhadas, bico alaranjado e pequena crista.','Compare sua silhueta mais esguia com a da ema.'],
 ['pampas-deer','Veado-campeiro','Ozotoceros bezoarticus','cerrado-fauna',2,CER,'cerradoBirds',100,'Cervo dos ambientes abertos do Cerrado. O macho está representado com galhadas curtas.','Os campos naturais também precisam de proteção.'],
 ['collared-peccary','Cateto','Dicotyles tajacu','cerrado-fauna',3,CER,'cerradoBirds',82,'Mamífero nativo do Cerrado, representado com pelagem escura e um colar claro nos ombros.','Compare o colar claro e o corpo compacto com os do facóquero da savana africana.'],
 ['impala','Impala','Aepyceros melampus','savanna-fauna',0,SAV,'savannaCounts',108,'Antílope presente na fauna do Kruger. O macho do desenho tem chifres curvados e pelagem castanha.','Observe o contraste entre o ventre claro e o dorso castanho.'],
 ['greater-kudu','Cudo-maior','Tragelaphus strepsiceros','savanna-fauna',1,SAV,'savannaCounts',130,'Antílope sul-africano representado com listras claras no corpo e grandes chifres espiralados no macho.','Compare seus chifres espiralados com os chifres do impala.'],
 ['warthog','Facóquero','Phacochoerus africanus','savanna-fauna',2,SAV,'savannaCounts',95,'Mamífero da savana sul-africana, representado com presas curvas, crina e cauda fina.','O facóquero africano e o cateto brasileiro são animais diferentes.'],
 ['ostrich','Avestruz','Struthio camelus','savanna-fauna',3,SAV,'savannaBirds',132,'Grande ave terrestre presente na lista de aves do Kruger. O macho tem plumagem preta e branca.','Compare sua plumagem com a plumagem cinza da ema do Cerrado.']
];
for(const[id,name,scientific,sheet,row,map,source,size,description,curiosity]of additions){
 D.species.push({id,name,scientific,sheet,row,maps:[map],source,size,motion:'land',terrestrialBird:['rhea','seriema','ostrich'].includes(id),description,curiosity,country:map===CER?'Brasil':'África do Sul',location:map===CER?'Campos e formações abertas do Cerrado brasileiro.':'Savana sul-africana, com referência na fauna do Kruger.'});
 const place=D.maps.find(p=>p.id===map);place.species=[...new Set([...place.species,id])];
}
A.names.push('cerrado-fauna','savanna-fauna');
const english=['greater rhea','red-legged seriema','pampas deer','collared peccary','impala','greater kudu','warthog','ostrich'];
for(let i=0;i<additions.length;i++){const[id,pt]=additions[i],en=english[i],entry={en,pt,example:'Observe the '+en+' from the trail.',examplePt:'Observe '+(i===0||i===1?'a ':'o ')+pt.toLocaleLowerCase('pt-BR')+' a partir da trilha.',category:'wildlife',starter:false};if(!V.PixVocabulary.entry(en))V.EnglishVocabulary.entries.push(entry);V.PixWorldVocabularyData.animals[id]=[en,pt,/^[aeiou]/.test(en)?'an':'a'];V.PixWorldVocabulary.contextWords.add(en);}
V.PixVocabulary.register();
const speciesWords=V.PixWorldVocabulary.speciesWords.bind(V.PixWorldVocabulary);V.PixWorldVocabulary.speciesWords=function(id){const s=D.species.find(s=>s.id===id);return s?.terrestrialBird?this.words([V.PixWorldVocabularyData.animals[id][0],'species','wing','beak','feather','habitat']):speciesWords(id);};
// The museum builds its live collection from this same species registry.
V.AnimalSanctuary.setup();
const describe=V.PixWorldVocabulary.describe.bind(V.PixWorldVocabulary);V.PixWorldVocabulary.describe=function(m,o){if(o?.biomeAtlas||o?.cerradoArt!==undefined){const index=o.biomeCell??o.cerradoArt,tree=index<4,words=this.words(tree?['tree','leaf','root','habitat']:index===10&&o.cerradoArt!==undefined?['shelter','ranger']:['plant','soil','habitat','conservation']);return{words,only:true,priority:1,label:o.label||'Vegetação nativa'};}return describe(m,o);};
const labels={
 'savanna-landscape':['Acácia-de-copa-aberta','Marula','Mopane','Árvore espinhosa','Capins da savana','Arbusto da savana','Vegetação da margem','Rochas da savana','Cupinzeiro','Abrigo de observação','Tronco caído','Flores e gramíneas'],
 'cerrado-understory':['Pau-terra','Ipê-rosa','Cagaita','Caliandra','Sempre-vivas','Canela-de-ema florida','Flores do campo','Capins nativos','Afloramento rochoso','Tronco caído','Vegetação da vereda','Bromélias']
};
const B=V.LivingBiomes={images:{},
 random(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};},
 load(){return Promise.all(Object.keys(labels).map(name=>new Promise(resolve=>{const im=V.Assets.image();this.images[name]=im;im.onload=im.onerror=resolve;im.src='assets/expansion/'+name+'.webp?v=20261102-living3';V.AssetLoader.register(im,resolve); })));},
 setup(){const d=C.layouts[SAV];if(!d)return;Object.assign(d,{width:68,height:48,spawn:[34,43],purpose:'Savana sul-africana com campos, bosques, lagoas, trilhas e postos de observação.'});S.defaults[SAV]=copy(d);S.raw[SAV]=W.base(SAV,'community',68,48);},
 prop(m,sheet,index,x,y,size,solid=false){const o={id:m.id+'-living-prop-'+m.objects.length,type:'nature-prop',biomeAtlas:sheet,biomeCell:index,x:x*T,y:y*T,w:size,h:size,label:labels[sheet][index]};m.objects.push(o);if(solid)m.solids.push({x:o.x-17,y:o.y-12,w:34,h:24,owner:o.id});return o;},
 clear(m,predicate){const ids=new Set(m.objects.filter(predicate).map(o=>o.id));m.objects=m.objects.filter(o=>!ids.has(o.id));m.solids=m.solids.filter(b=>!ids.has(b.owner));},
 paths(m){return m.id===CER?[
  [[36,49],[36,44],[37,39],[32,35],[25,33],[17,29],[14,22],[13,15],[16,8]],
  [[37,39],[45,38],[54,39],[60,35],[58,28],[59,22],[61,15],[58,8]],
  [[16,29],[23,27],[33,28],[42,27.5],[49,27.5],[56,26]],
  [[7,48],[16,46],[26,47],[36,46],[47,47],[56,46],[65,48]]
 ]:[
  [[34,46],[34,41],[33,36],[25,32],[17,31],[11,26],[10,19],[14,13],[17,7]],
  [[34,41],[44,39],[51,40],[59,41],[63,43]],
  [[33,36],[39,29],[44,24],[49,19],[53,12],[58,7]],
  [[17,31],[23,27],[32,24],[38,20],[40,14],[36,8]]
 ];},
 distance(m,x,y){let best=Infinity;for(const path of m.biomePaths)for(let i=1;i<path.length;i++){const[a,b]=[path[i-1],path[i]],dx=b[0]-a[0],dy=b[1]-a[1],u=V.clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy),0,1);best=Math.min(best,Math.hypot(x-a[0]-u*dx,y-a[1]-u*dy));}return best;},
 water(m){m.solids=m.solids.filter(b=>!String(b.owner).includes('-water-'));m.natureWater=[];m.natureBridges=[];m.biomeWaterShapes=[];
  if(m.id===CER){for(const[from,to]of [[7,26],[29,36]]){const left=[],right=[];for(let y=from;y<=to;y+=.5){const x=44+Math.sin(y*.21)*1.2,w=3.2+Math.sin(y*.39)*.45;left.push([x*T,y*T]);right.unshift([(x+w)*T,y*T]);if(y<to)N.water(m,x,y,w,.5);}m.biomeWaterShapes.push([...left,...right]);}m.natureBridges.push({x:42*T,y:26*T,w:7*T,h:3*T});}
  else{for(const[cx,cy,rx,ry]of [[28,12,6,4],[51,30,4,3]]){const points=[];for(let i=0;i<96;i++){const angle=i*Math.PI/48,edge=1+Math.sin(angle*3)*.025;points.push([(cx+Math.cos(angle)*rx*edge)*T,(cy+Math.sin(angle)*ry*edge)*T]);}m.biomeWaterShapes.push(points);for(let y=-ry;y<ry;y+=.5){const width=rx*Math.sqrt(Math.max(.025,1-((y+.25)/ry)**2));N.water(m,cx-width,cy+y,width*2,.5);}}}
 },
 animal(m,id,x,y,w=5,h=3){const at=V.Rooms.safe(m,{x:x*T,y:y*T},18)||{x:x*T,y:y*T},o=N.animal(m,id,at.x/T,at.y/T,[at.x/T-w/2,at.y/T-h/2,w,h]);o.walking=true;o.wait=1.5+m.objects.length%4;return o;},
 savanna(m){this.clear(m,o=>o.type==='nature-prop'||o.type==='nature-animal'||o.type==='nature-observation');
  const r=m.objects.find(o=>o.type==='nature-ranger');if(r)Object.assign(r,{x:34*T,y:41*T,home:{x:34*T,y:41*T}});const board=m.objects.find(o=>o.type==='nature-board');if(board)Object.assign(board,{x:39*T,y:42*T});
  for(const o of m.objects.filter(o=>o.natureLink)){o.x=(o.to==='cape-town'?34:63)*T;o.y=(o.to==='cape-town'?46:43)*T;}
  this.prop(m,'savanna-landscape',9,28,42,170,true);
  for(const[x,y]of [[12,28],[41,22],[58,38]]){this.prop(m,'savanna-landscape',9,x,y,125,true);m.objects.push({id:m.id+'-living-watch-'+x,type:'nature-observation',x:x*T,y:(y+1)*T,watch:D.maps.find(p=>p.id===SAV).species.slice(),label:'Mirante · observar a fauna da savana',interactionRange:115});}
  const animals=[['lion',55,9],['lion',58,10],['elephant',18,18],['elephant',21,17],['giraffe',47,14],['giraffe',49,16],['zebra',17,36],['zebra',20,35],['zebra',23,36],['white-rhino',10,12],['buffalo',39,13],['buffalo',42,12],['spotted-hyena',59,22],['wild-dog',8,34],['meerkat',6,40],['meerkat',8,41],['puff-adder',60,30],['impala',35,20],['impala',32,19],['impala',34,21],['greater-kudu',53,23],['greater-kudu',57,24],['warthog',45,34],['warthog',43,33],['ostrich',23,7],['ostrich',19,8]];
  for(const[id,x,y]of animals)this.animal(m,id,x,y);
 },
 cerrado(m){this.clear(m,o=>o.cerradoArt!==undefined&&o.cerradoArt<8);for(const o of m.objects.filter(o=>o.type==='nature-observation')){const at=o.x<24*T?[12,30]:[56,25];o.x=at[0]*T;o.y=at[1]*T;o.watch=D.maps.find(p=>p.id===CER).species.slice();}
  for(const[id,x,y]of [['rhea',24,12],['rhea',27,13],['rhea',25,15],['seriema',57,35],['seriema',60,34],['pampas-deer',30,21],['pampas-deer',33,19],['pampas-deer',31,22],['collared-peccary',17,37],['collared-peccary',20,36],['collared-peccary',18,39]])this.animal(m,id,x,y);
 },
 vegetation(m){const cerrado=m.id===CER,rng=this.random(cerrado?75212:94521),clusters=cerrado?[[8,10],[24,8],[33,16],[9,36],[24,39],[56,8],[62,24],[56,40],[36,9]]:[[8,8],[18,22],[57,7],[60,25],[40,8],[43,35],[9,39]],nearWater=(x,y,r)=>m.natureWater.some(b=>x*T>b.x-r*T&&x*T<b.x+b.w+r*T&&y*T>b.y-r*T&&y*T<b.y+b.h+r*T);
  for(let i=0;i<(cerrado?156:118);i++){const k=clusters[i%clusters.length],angle=rng()*Math.PI*2,radius=Math.sqrt(rng())*(cerrado?7.5:8.5),x=k[0]+Math.cos(angle)*radius,y=k[1]+Math.sin(angle)*radius;if(x<3||y<5||x>m.width-3||y>m.height-7||this.distance(m,x,y)<2.3||nearWater(x,y,.7)||N.blocked(m,x*T,y*T,65)||m.objects.some(o=>Math.hypot(o.x-x*T,o.y-y*T)<98))continue;
   if(cerrado){if(i%4===0)this.prop(m,'cerrado-understory',i%3,x,y,118+rng()*40,true);else V.CerradoRenewal.prop(m,[0,0,1,2,4][i%5],x,y,110+rng()*52,true);}
   else this.prop(m,'savanna-landscape',i%4,x,y,130+rng()*62,true);
  }
  for(let i=0;i<(cerrado?330:280);i++){const x=2+rng()*(m.width-4),y=4+rng()*(m.height-9);if(this.distance(m,x,y)<1.35||nearWater(x,y,.2)||N.blocked(m,x*T,y*T,18))continue;if(cerrado&&i%3===0)V.CerradoRenewal.prop(m,i%6===0?7:6,x,y,32+rng()*20,false);else this.prop(m,cerrado?'cerrado-understory':'savanna-landscape',cerrado?3+i%9:[4,4,5,7,8,10,11][i%7],x,y,30+rng()*(i%7===0?58:30),false);}
  if(cerrado){for(const[x,y]of [[23,10],[53,36],[8,24]])V.CerradoRenewal.prop(m,5,x,y,64,false);for(const y of [9,14,19,24,32,35]){for(const x of [41,50]){if(!N.blocked(m,x*T,y*T,28))V.CerradoRenewal.prop(m,3,x+(rng()-.5),y,145+rng()*24,true);this.prop(m,'cerrado-understory',10,x+1.4,y+1,56,false);}}}
  else for(const[x,y]of [[23,12],[34,14],[48,29],[54,32]])this.prop(m,'savanna-landscape',6,x,y,72,false);
 },
 positions(m){for(const o of m.objects){const p=m.design.positions?.[o.id];if(!p)continue;const dx=(p[0]+.5)*T-o.x,dy=(p[1]+.5)*T-o.y;o.x+=dx;o.y+=dy;const solid=m.solids.find(b=>b.owner===o.id);if(solid){solid.x+=dx;solid.y+=dy;}if(o.home)o.home={x:o.x,y:o.y};if(o.bounds){o.bounds.x+=dx;o.bounds.y+=dy;}}},
 build(m){if(![CER,SAV].includes(m.id))return m;m.livingBiome=true;m.biomePaths=this.paths(m);this.water(m);if(m.id===SAV)this.savanna(m);else this.cerrado(m);this.vegetation(m);this.positions(m);m.cache=null;return m;},
 trace(c,path){c.beginPath();c.moveTo(path[0][0]*T,path[0][1]*T);for(let i=1;i<path.length-1;i++){const a=path[i],b=path[i+1];c.quadraticCurveTo(a[0]*T,a[1]*T,(a[0]+b[0])*T/2,(a[1]+b[1])*T/2);}const last=path[path.length-1];c.lineTo(last[0]*T,last[1]*T);},
 ground(m){const canvas=document.createElement('canvas');canvas.width=m.width*T;canvas.height=m.height*T;const c=canvas.getContext('2d'),cer=m.id===CER,rng=this.random(cer?1652:9856);c.fillStyle=cer?'#a9b17b':'#bdaf70';c.fillRect(0,0,canvas.width,canvas.height);
  // Low-contrast irregular patches replace the old chessboard ground.
  for(let i=0;i<660;i++){c.fillStyle=(cer?['#8a9a59','#c3bc83','#a2ab71','#bac48a']:['#c8ba7e','#a4a364','#d3be84','#b2a668'])[i%4];c.globalAlpha=.12+rng()*.15;c.beginPath();c.ellipse(rng()*canvas.width,rng()*canvas.height,35+rng()*140,25+rng()*85,rng()*3,0,Math.PI*2);c.fill();}c.globalAlpha=1;
  for(let i=0;i<5000;i++){const x=rng()*canvas.width,y=rng()*canvas.height;c.strokeStyle=cer?'#6f884744':'#897a4240';c.lineWidth=1;c.beginPath();c.moveTo(x,y);c.lineTo(x-2,y-3-rng()*5);c.moveTo(x,y);c.lineTo(x+3,y-4-rng()*4);c.stroke();}
  c.lineJoin=c.lineCap='round';for(const width of [93,77]){c.lineWidth=width;c.strokeStyle=width===93?(cer?'#9e9869':'#aa9460'):(cer?'#d0bf8f':'#dcc28d');for(const path of m.biomePaths){this.trace(c,path);c.stroke();}}
  for(const shape of m.biomeWaterShapes){c.beginPath();c.moveTo((shape.at(-1)[0]+shape[0][0])/2,(shape.at(-1)[1]+shape[0][1])/2);for(let i=0;i<shape.length;i++){const p=shape[i],q=shape[(i+1)%shape.length];c.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2);}c.closePath();c.fillStyle=cer?'#609d98':'#719c94';c.strokeStyle=cer?'#7b9f76':'#94a170';c.lineWidth=30;c.stroke();c.fill();c.save();c.clip();c.strokeStyle='#c8e2c247';c.lineWidth=1.5;for(let i=0;i<85;i++){const x=(cer?42:20)*T+rng()*34*T,y=6*T+rng()*31*T;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+20,y+3,x+40+rng()*30,y);c.stroke();}c.restore();}
  for(const b of m.natureBridges){c.fillStyle='#76543b';c.fillRect(b.x,b.y,b.w,b.h);for(let x=b.x+4;x<b.x+b.w;x+=17){c.fillStyle='#d8b782';c.fillRect(x,b.y+5,13,b.h-10);}c.fillStyle='#594c35';c.fillRect(b.x,b.y, b.w,5);c.fillRect(b.x,b.y+b.h-5,b.w,5);}
  c.fillStyle=cer?'#657e4e':'#8a8c53';c.fillRect(0,0,canvas.width,T);c.fillRect(0,canvas.height-T,canvas.width,T);c.fillRect(0,0,T,canvas.height);c.fillRect(canvas.width-T,0,T,canvas.height);m.cache=canvas;
 },
 draw(c,o,cam){if(!o.biomeAtlas)return false;const im=this.images[o.biomeAtlas];if(!im?.naturalWidth)return true;const size=o.w,x=o.x-cam.x,y=o.y-cam.y,cell=im.naturalWidth/4;if(Math.abs(c.getTransform().a)>=.99&&(x<-size||x>c.canvas.width+size||y<-20||y>c.canvas.height+size))return true;V.SceneShadows.cast(c,im,x,y+4,size,size,{frame:[o.biomeCell%4*cell,Math.floor(o.biomeCell/4)*cell,cell,cell],alpha:size>100?.16:.1});c.save();c.imageSmoothingEnabled=true;c.drawImage(im,o.biomeCell%4*cell,Math.floor(o.biomeCell/4)*cell,cell,cell,x-size/2,y-size+10,size,size);c.restore();return true;}
};
const setup=N.setup.bind(N);N.setup=function(...args){const saved=S.saved?.[SAV]?.positions||C.layouts[SAV]?.positions;setup(...args);if(saved)C.layouts[SAV].positions=copy(saved);B.setup();};B.setup();
const build=N.build.bind(N);N.build=function(...args){return B.build(build(...args));};
const ground=N.ground.bind(N);N.ground=m=>m.livingBiome?B.ground(m):ground(m);
const draw=N.draw.bind(N);N.draw=(c,o,cam)=>B.draw(c,o,cam)||draw(c,o,cam);
const load=V.Assets.load.bind(V.Assets);V.Assets.load=async function(...args){await load(...args);await B.load();};
const group=V.AssetLoader.group.bind(V.AssetLoader);V.AssetLoader.group=key=>/\/(cerrado-fauna|savanna-fauna|cerrado-understory|savanna-landscape)\./.test(key)?'living-biomes':group(key);
const groups=V.MapAssets.groups.bind(V.MapAssets);V.MapAssets.groups=function(m){const out=groups(m);if(m?.livingBiome||m?.animalMuseum)out.push('living-biomes');return [...new Set(out)];};
// The animated atlas is also used in the field guide, not only on the map.
const wildlifeDraw=V.Wildlife.drawAnimal.bind(V.Wildlife);V.Wildlife.drawAnimal=function(c,s,...args){if(s.sheet==='cerrado-fauna'||s.sheet==='savanna-fauna'){c.save();c.imageSmoothingEnabled=true;const out=wildlifeDraw(c,s,...args);c.restore();return out;}return wildlifeDraw(c,s,...args);};
})();
