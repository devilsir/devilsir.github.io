(function(){
'use strict';
const V=window.V,W=V.World,C=V.Cozy,I=V.CulinaryInteriors,S=V.SceneDesign,T=48,copy=x=>JSON.parse(JSON.stringify(x));
const definitions={
 'university-biology':{name:'Universidade · Laboratório de Biologia',width:34,height:26,kind:'biology',purpose:'Microscopia, botânica e observação de amostras.'},
 'university-physics':{name:'Universidade · Laboratório de Química e Física',width:38,height:28,kind:'physics',purpose:'Bancadas de química, óptica, movimento e segurança de laboratório.'},
 'university-sports':{name:'Universidade · Ginásio e quadra poliesportiva',width:62,height:44,kind:'sports',purpose:'Quadra ampla de basquete e futsal, arquibancadas e equipe de torcida.'},
 'university-pool':{name:'Universidade · Centro Aquático',width:48,height:36,kind:'pool',purpose:'Piscina com seis raias, natação e área de convivência.'}
};
const A=V.CampusRenewal={definitions,images:{},
 load(){return Promise.all(['campus-props','campus-activities'].map(name=>new Promise(resolve=>{const image=V.Assets.image();this.images[name]=image;image.onload=image.onerror=resolve;image.src='assets/expansion/'+name+'.webp?v=20261102-campus2';V.AssetLoader.register(image,resolve);})));},
 art(c,name,index,x,y,w,h=w){const image=this.images[name];if(!image?.naturalWidth)return false;const cell=image.naturalWidth/4;c.save();c.imageSmoothingEnabled=true;c.drawImage(image,index%4*cell,Math.floor(index/4)*cell,cell,cell,Math.round(x),Math.round(y),w,h);c.restore();return true;},
 setup(){for(const[id,meta]of Object.entries(definitions)){const d={...meta,spawn:[meta.width/2,meta.height-4],floor:'tile',palette:['#c5d0bd','#607e6c','#e4d8b7'],paths:[],decor:[],scenes:[],positions:{},routines:{},anchors:[],rugs:[],zones:[],meeting:[meta.width/2,meta.height-5],buildings:[],adventure:{version:3,architecture:{walls:[],mounts:[],windows:[],signs:[]},environment:{indoor:true,sky:'day',weather:false},lights:[],regions:[],encounters:[],triggers:[]}};C.layouts[id]||=copy(d);S.defaults[id]=copy(d);S.raw[id]||=W.base(id,'room',meta.width,meta.height);V.FastTravel.names[id]=meta.name;S.objectRegistry[id]||={};}},
 link(m,id,to,x,y,label){const o={id,type:'travel',x:x*T,y:y*T,to,label,campusLink:true,interactionRange:100};m.objects.push(o);return o;},
 prop(m,key,index,x,y,size=100,solid=true){const o={id:m.id+'-'+key,type:'campus-equipment',campusProp:index,x:x*T,y:y*T,size,label:['Biologia · observar amostras','Química · materiais e segurança','Física · luz e movimento'][index-4]||'Material do campus',interactionRange:100};m.objects.push(o);if(solid)m.solids.push({x:o.x-size*.34,y:o.y-17,w:size*.68,h:28,owner:o.id});return o;},
 actor(m,key,row,x,y,activity){const o={id:m.id+'-'+key,type:'campus-actor',x:x*T,y:y*T,home:{x:x*T,y:y*T},row,activity,collectionOnly:activity==='swim',phase:m.objects.length*.7,label:activity==='swim'?'Natação nas raias':activity==='cheer'?'Equipe de torcida':'Treino de basquete',interactionRange:85};m.objects.push(o);return o;},
 build(id,d=C.layouts[id]){const meta=definitions[id],m=W.base(id,'room',d.width,d.height);Object.assign(m,{name:meta.name,design:d,campusRenewal:true,campusKind:meta.kind,ambientTime:0,decor:[],zones:[],chats:[],anchors:new Map(),reservations:new Map(),archWalls:[],archSolids:[],mounts:[],lifeAnimals:[],geometryRevision:1});
  for(const[x,y,w,h]of [[0,0,d.width,1],[0,0,1,d.height],[d.width-1,0,1,d.height],[0,d.height-1,d.width,1]])m.solids.push({x:x*T,y:y*T,w:w*T,h:h*T});this.link(m,id+'-exit','university',d.width/2,d.height-2,'Voltar à Universidade');
  if(meta.kind==='biology'||meta.kind==='physics'){
   const bio=meta.kind==='biology';for(const[x,y]of [[8,9],[18,9],[8,16],[18,16]]){this.prop(m,'bench-'+x+'-'+y,bio?4:x===8?5:6,x,y,104);this.prop(m,'chair-'+x+'-'+y,0,x,y+1.65,56);}
   this.prop(m,'supplies',7,d.width-5,6,108);this.prop(m,'safety',13,d.width-5,13,90);this.prop(m,'cart',15,d.width-5,19,86);if(bio)for(const x of [6,14,22])this.prop(m,'botany-'+x,14,x,4.3,90);
   V.CulinaryWorld.npc(m,id+'-mentor',bio?'Professora Inês':'Professor André',bio?'ines':'andre',d.width-8,18,'class');m.objects.at(-1).campusMentor=true;
   for(const[x,y]of [[10.5,9],[20.5,9],[10.5,16],[20.5,16]])this.prop(m,'work-'+x+'-'+y,bio?4:6,x,y,104);
   for(const[x,y,index,size]of [[6,3.7,2,110],[15,3.7,6,156],[26,3.7,8,100],[3,21,12,100]])m.objects.push({id:id+'-interior-'+x,campusOriginal:index,type:'campus-decoration',x:x*T,y:y*T,size});
   for(let i=0;i<4;i++)m.objects.push({id:id+'-student-'+i,type:'campus-spectator',character:['student','taina','leo','sol'][i],x:(i%2?19:9)*T,y:(i<2?10.6:17.6)*T});
  }else if(meta.kind==='sports'){
   m.court={x:8*T,y:7*T,w:46*T,h:26*T};this.prop(m,'hoop-west',8,9,21,116,false);this.prop(m,'hoop-east',8,53,21,116,false);this.prop(m,'goal-west',9,8,28,140,false);this.prop(m,'goal-east',9,54,28,140,false);
   for(const x of [14,25,36,47])this.prop(m,'bleachers-'+x,10,x,4.8,150);for(let i=0;i<8;i++)this.actor(m,'player-'+i,2+i%2,17+i%4*8,14+Math.floor(i/4)*12,'basketball');for(let i=0;i<8;i++)this.actor(m,'cheer-'+i,4+i%2,16+i*4.3,36.5,'cheer');
   for(let i=0;i<10;i++)m.objects.push({id:id+'-audience-'+i,type:'campus-spectator',character:['nia','leo','taina','sol','student'][i%5],x:(12+i*4)*T,y:4.3*T});
  }else{
   m.pool={x:7*T,y:7*T,w:34*T,h:18*T};m.solids.push({...m.pool,owner:id+'-water'});for(let lane=0;lane<6;lane++){const swimmer=this.actor(m,'swimmer-'+lane,lane%2,11+lane*3,8.5+lane*3,'swim');swimmer.phase=lane*9.5;}
   this.prop(m,'lifeguard',11,44,15,115);for(const x of [10,19,28,37])this.prop(m,'seating-'+x,10,x,29,105);this.link(m,id+'-sports','university-sports',40,32,'Ir ao ginásio');
  }
  this.positions(m);return m;
 },
 positions(m){for(const o of m.objects){const p=m.design.positions?.[o.id];if(p){o.x=(p[0]+.5)*T;o.y=(p[1]+.5)*T;if(o.home)o.home={x:o.x,y:o.y};}S.objectRegistry[m.id][o.id]={type:o.type};}},
 university(m){if(m.campusUpgraded)return;m.campusUpgraded=true;for(const o of m.objects){if(o.id.startsWith('university-chair-')){o.campusProp=0;o.size=58;o.label='Cadeira · voltada para o quadro';}if(o.id.startsWith('university-reading-chair-')){o.campusProp=2;o.size=58;}if(o.id.startsWith('university-desk-'))o.size=104;if(o.interiorArt!==undefined&&o.size>140)o.size=Math.round(o.size*.78);const f=m.solids.find(f=>f.owner===o.id);if(f&&o.size)Object.assign(f,{x:o.x-o.size*.33,w:o.size*.66});}
  const links=[['biology',5,20.3,'Biologia'],['physics',11.5,20.3,'Química e Física'],['sports',26,20.3,'Ginásio e quadras'],['pool',33,20.3,'Centro Aquático']];for(const[k,x,y,label]of links)this.link(m,'university-'+k+'-entry','university-'+k,x,y,label);
 },
 ground(m){const c=document.createElement('canvas');c.width=m.width*T;c.height=m.height*T;const x=c.getContext('2d'),sports=m.campusKind==='sports',pool=m.campusKind==='pool';x.fillStyle=sports?'#d9c49a':'#d4ddce';x.fillRect(0,0,c.width,c.height);for(let y=0;y<c.height;y+=sports?24:48)for(let xx=0;xx<c.width;xx+=sports?144:48){x.strokeStyle=sports?'#bfa37166':'#9eb4a155';x.strokeRect(xx,y,sports?144:48,sports?24:48);}x.fillStyle='#486956';x.fillRect(0,0,c.width,120);
  if(sports){const b=m.court;x.fillStyle='#b97e52';x.fillRect(b.x,b.y,b.w,b.h);x.fillStyle='#668b76';x.fillRect(b.x+8,b.y+8,b.w/2-12,b.h-16);x.fillStyle='#6e9680';x.fillRect(b.x+b.w/2+4,b.y+8,b.w/2-12,b.h-16);x.strokeStyle='#f7efd5';x.lineWidth=5;x.strokeRect(b.x,b.y,b.w,b.h);x.beginPath();x.moveTo(b.x+b.w/2,b.y);x.lineTo(b.x+b.w/2,b.y+b.h);x.stroke();x.beginPath();x.arc(b.x+b.w/2,b.y+b.h/2,145,0,Math.PI*2);x.stroke();for(const edge of [0,1]){const xx=b.x+edge*b.w,dir=edge?-1:1;x.strokeRect(xx+(edge?-260:0),b.y+b.h/2-190,260,380);x.beginPath();x.arc(xx+dir*90,b.y+b.h/2,290,edge?Math.PI/2:-Math.PI/2,edge?Math.PI*1.5:Math.PI/2);x.stroke();}}
  if(pool){const b=m.pool;x.fillStyle='#f2e8ce';x.fillRect(b.x-26,b.y-26,b.w+52,b.h+52);x.fillStyle='#519ba6';x.fillRect(b.x,b.y,b.w,b.h);x.strokeStyle='#dae9d1';x.lineWidth=4;for(let lane=1;lane<6;lane++){const y=b.y+lane*b.h/6;for(let xx=b.x;xx<b.x+b.w;xx+=28){x.fillStyle=Math.floor(xx/28)%2?'#ead48b':'#f3eee0';x.fillRect(xx,y-4,20,8);}}for(let lane=0;lane<6;lane++){x.strokeStyle='#376d7f';x.lineWidth=5;x.beginPath();const y=b.y+(lane+.5)*b.h/6;x.moveTo(b.x+80,y);x.lineTo(b.x+b.w-80,y);x.stroke();}}
  if(m.campusKind==='biology'||m.campusKind==='physics'){x.strokeStyle='#798f793d';x.lineWidth=3;x.strokeRect(4*T,5.5*T,19*T,13.8*T);x.fillStyle='#758e7640';x.fillRect(4*T,20*T,25*T,3);for(const yy of [7.5,14.5]){x.fillStyle='#afbea04d';x.fillRect(5.5*T,yy*T,17*T,2.5*T);}}x.strokeStyle='#54715c';x.lineWidth=12;x.strokeRect(25,110,c.width-50,c.height-137);m.cache=c;
 },
 draw(c,o,cam){const x=o.x-cam.x,y=o.y-cam.y;if(o.campusLink){V.WorldSigns?.draw(c,o.label,x,y-32,{arrow:true,active:W.nearest?.id===o.id,maxWidth:190});return true;}
  if(o.campusOriginal!==undefined){V.SceneShadows.contact(c,x,y,25,6,.13);I.art(c,'campus-interiors',o.campusOriginal,x-o.size/2,y-o.size+8,o.size);return true;}
  if(o.campusProp!==undefined){const size=o.size||100;V.SceneShadows.contact(c,x,y+3,size*.32,7,.18);this.art(c,'campus-props',o.campusProp,x-size/2,y-size+8,size);return true;}
  if(o.type==='campus-spectator'){V.SceneShadows.character(c,o.character,x,y,60,0,0,true);V.Assets.sprite(c,o.character,x,y,0,0,60);return true;}
  if(o.type==='campus-actor'){const t=V.settings.reducedMotion?0:V.Engine.time,phase=t+o.phase,swim=o.activity==='swim',cheer=o.activity==='cheer',size=swim?78:66,frame=V.settings.reducedMotion?0:Math.floor(phase*(swim?4:cheer?2.6:5))%4;let px=x,py=y,flip=false;
   if(swim){const b=W.current.pool,u=(phase*.035)%2,at=u>1?2-u:u;px=b.x-cam.x+65+at*(b.w-130);py=o.home.y-cam.y;flip=u>1;c.save();c.beginPath();c.rect(b.x-cam.x,b.y-cam.y,b.w,b.h);c.clip();c.translate(px,py);if(flip)c.scale(-1,1);this.art(c,'campus-activities',o.row*4+frame,-size/2,-size*.53,size);c.restore();c.save();c.strokeStyle='#d5eeec99';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.ellipse(px-25+i*15,py+12,10+i*3,3,0,0,Math.PI);c.stroke();}c.restore();}
   else{if(!cheer){px+=Math.sin(phase*.55)*110;py+=Math.cos(phase*.8)*40;}V.SceneShadows.contact(c,px,py+3,20,6,.19);this.art(c,'campus-activities',o.row*4+frame,px-size/2,py-size+8,size);}return true;}
  return false;
 },
 render(c){const m=W.current,cam=W.camera;if(!m.cache)this.ground(m);c.save();c.fillStyle='#385846';c.fillRect(0,0,c.canvas.width,c.canvas.height);c.drawImage(m.cache,-cam.x,-cam.y);for(const row of [...m.objects.map(o=>({y:o.y,o})),{y:V.Player.data.y,player:true}].sort((a,b)=>a.y-b.y)){if(row.player)V.Player.render(c);else if(!this.draw(c,row.o,cam))C.drawObject(c,row.o,cam);}V.WorldSigns?.draw(c,m.name.replace('Universidade · ',''),m.width*T/2-cam.x,69-cam.y,{maxWidth:480});c.restore();W.drawMiniMap();}
};
A.setup();
const load=V.Assets.load.bind(V.Assets);V.Assets.load=async function(...args){await load(...args);await A.load();};
const group=V.AssetLoader.group.bind(V.AssetLoader);V.AssetLoader.group=key=>/assets\/expansion\/campus-(props|activities)\./.test(key)?'campus-renewal':group(key);
const groups=V.MapAssets.groups.bind(V.MapAssets);V.MapAssets.groups=function(m){const out=groups(m);if(m?.campusRenewal||m?.id==='university')out.push('campus-renewal');if(m?.campusRenewal)out.push('culinary-campus');return[...new Set(out)];};
const init=W.init.bind(W);W.init=function(...args){const out=init(...args);for(const id of Object.keys(definitions))W.maps[id]=A.build(id);if(W.maps.university)A.university(W.maps.university);V.ObjectiveGuide.invalidate();V.Atlas.cache.clear();return out;};
const preview=S.preview.bind(S);S.preview=function(id,d){if(definitions[id])return A.build(id,d);const m=preview(id,d);if(id==='university')A.university(m);return m;};
const draw=V.CulinaryWorld.draw.bind(V.CulinaryWorld);V.CulinaryWorld.draw=(c,o,cam)=>A.draw(c,o,cam)||draw(c,o,cam);
const ground=C.ground.bind(C);C.ground=m=>m.campusRenewal?A.ground(m):ground(m);
const render=C.render.bind(C);C.render=c=>W.current?.campusRenewal?A.render(c):render(c);
const drawObject=C.drawObject.bind(C);C.drawObject=function(c,o,cam,...args){if(A.draw(c,o,cam))return;return drawObject(c,o,cam,...args);};
const landmark=V.Atlas.landmark.bind(V.Atlas);V.Atlas.landmark=function(c,o,m){return A.draw(c,o,{x:0,y:0})||landmark(c,o,m);};
const worldLoad=W.load.bind(W);W.load=function(id,pos){if(definitions[id]&&!pos){const s=C.layouts[id].spawn;pos={x:s[0]*T,y:s[1]*T};}return worldLoad(id,pos);};
const category=V.FastTravel.category.bind(V.FastTravel);V.FastTravel.category=id=>definitions[id]?'culture':category(id);
const root=V.FastTravel.root.bind(V.FastTravel);V.FastTravel.root=id=>definitions[id]?'university':root(id);
const interact=V.Game.interact.bind(V.Game);V.Game.interact=function(o){if(o&&!V.modal&&!V.Dialogue.active&&this.mode==='explore'){if(o.campusLink)return W.load(o.to);if(o.type==='campus-equipment'||o.type==='campus-actor'||o.campusMentor){const bio=W.current.campusKind==='biology',text=bio?'Observe o microscópio, compare as folhas e registre as características das amostras. As bancadas reúnem botânica e observação da vida.':'Compare os materiais nas bancadas de química e explore luz e movimento na bancada de física. O pêndulo e o conjunto de óptica ajudam a observar diferentes fenômenos.';V.UI.modal(o.campusMentor?o.name:o.label,'UNIVERSIDADE DAS VOZES','<p>'+V.escape(definitions[W.current.id]?.purpose||'Observe, compare e compartilhe descobertas no campus.')+'</p><p>'+V.escape(['biology','physics'].includes(W.current.campusKind)?text:'A equipe acompanha os treinos e compartilha o espaço com quem pratica e com quem assiste.')+'</p>');V.PixWorldVocabulary?.strip((bio?['microscope','plant','observe','research']:['light','research','observe','water']).filter(word=>V.PixVocabulary.entry(word)),'Universidade · '+(o.name||o.label));return;}}return interact(o);};
const objects=W.interactables.bind(W);W.interactables=function(...args){const list=objects(...args),seen=new Set(list);for(const o of this.current?.objects||[])if((o.campusLink||o.type==='campus-equipment')&&!seen.has(o))list.push(o);return list;};
})();
