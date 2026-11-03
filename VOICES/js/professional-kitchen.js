(function(){
'use strict';
const V=window.V,I=V.CulinaryInteriors,U=V.CulinaryWorld,W=V.World,T=48;
const uniforms={
 'chef-dandara':{base:'elder',name:'Dandara',role:'Chef da cozinha de ensino'},
 'chef-bento':{base:'bento',name:'Bento',role:'Chef do restaurante'},
 'chef-lia':{base:'viviane',name:'Lia',role:'Atendimento e serviço de cozinha'}
};
const aliases={'people':'people-game','sanctuary-staff':'sanctuary-team-game'};
const P=V.ProfessionalKitchen={images:{},uniforms,washing:new Map(),
 load(){if(this.ready)return this.ready;const names=['industrial-kitchen','industrial-utilities','kitchen-fittings','campus-interiors',...Object.keys(uniforms)];this.ready=Promise.all(names.map(key=>new Promise(resolve=>{const image=V.Assets.image();this.images[key]=image;if(uniforms[key])V.Assets.images[key]=image;else I.images[key]=image;image.onload=image.onerror=resolve;image.src='assets/cooking/'+key+'.webp?v='+(key==='campus-interiors'?'20261102-rooms1':'20261102-professional1');V.AssetLoader.register(image,resolve);})));I.images['kitchen-interiors']=this.images['industrial-kitchen'];for(const[key,meta]of Object.entries(uniforms)){V.content.characters[key]={...V.content.characters[meta.base],name:meta.name,role:meta.role};V.Assets.images[key+'-portrait']=V.Assets.images[meta.base+'-portrait'];}return this.ready;},
 setArt(m,o,sheet,index,size=o.size){if(!o)return;o.interiorSheet=sheet;o.interiorArt=index;o.size=size;const solid=m.solids.find(s=>s.owner===o.id);if(solid)Object.assign(solid,{x:o.x-size*.325,y:o.y-18,w:size*.65,h:29});},
 decorate(m){if(!m?.culinary||m.professionalKitchen)return m;m.professionalKitchen=true;
  for(const o of m.objects){const key={'kitchen-chef':'chef-dandara','restaurant-chef':'chef-bento','restaurant-lia':'chef-lia'}[o.id];if(key)o.uniformSprite=key;}
  if(m.id==='kitchen'){
   for(const zone of m.design.interiorZones||[])if(zone.floor==='wood')zone.floor='tile';for(const o of m.objects)if(o.interiorSheet==='kitchen-interiors')o.interiorSheet='industrial-kitchen';for(const window of V.Architecture.geometry(m.design).windows)if(window.interiorSheet==='kitchen-interiors')window.interiorSheet='industrial-kitchen';
   const sink=m.objects.find(o=>o.id==='kitchen-sink');Object.assign(sink,{role:'wash',label:'Pia industrial · higienizar mãos e utensílios'});
   const water=m.objects.find(o=>o.id==='kitchen-work-23-14');this.setArt(m,water,'industrial-utilities',7,110);water.label='Dispensador de água filtrada · encher a garrafa';
   const extra=(key,index,x,y,size,options={})=>I.prop(m,'kitchen-industrial-'+key,index,x,y,size,{sheet:'industrial-utilities',...options});
   extra('handwash',0,3.3,9.7,108,{role:'wash',label:'Lavatório · lavar as mãos',solid:false,onWall:'kitchen-interior-washroom'});
   extra('mixer',2,2.9,13.4,112,{role:'book',label:'Batedeira profissional · massas e receitas'});
   extra('oven',3,28.9,16.3,132,{role:'book',label:'Forno de convecção · escolher receita'});
   extra('aprons',4,9,9.7,126,{role:'uniforms',label:'Aventais, dólmãs e toucas da equipe',solid:false,onWall:'kitchen-interior-washroom'});
   extra('tools',5,19.4,9.7,124,{role:'book',label:'Utensílios · facas, conchas e batedores',solid:false,onWall:'kitchen-interior-washroom'});
   extra('trays',6,28.7,8.3,124,{role:'book',label:'Carrinho de assadeiras · preparo e serviço'});
   this.fitKitchen(m);
  }else if(m.id==='restaurant'){
   const counter=m.objects.find(o=>o.id==='restaurant-counter');counter.y=16.5*T;this.setArt(m,counter,'industrial-utilities',1,108);counter.label='Balcão de inox · receitas e serviço';const door=m.objects.find(o=>o.id==='restaurant-kitchen');if(door)door.industrialDoor=true;
  }
  return m;
 },
 fitKitchen(m){
  const sizes={'kitchen-pantry-left':104,'kitchen-pantry-right':104,'kitchen-fridge':100,'kitchen-pots':76,'kitchen-sink':88,'kitchen-drying':86,'kitchen-recycling':54,'kitchen-herbs':82,'kitchen-work-23-7':90,'kitchen-second-stove':90,'kitchen-hood':90,'kitchen-safety':44,'kitchen-clean-dishes':84,'kitchen-work-7-7':94,'kitchen-work-7-14':94,'kitchen-spices':90,'kitchen-serving':80,'kitchen-welcome':94,'kitchen-work-23-14':74,'kitchen-industrial-handwash':68,'kitchen-industrial-mixer':90,'kitchen-industrial-oven':88,'kitchen-industrial-aprons':80,'kitchen-industrial-tools':76,'kitchen-industrial-trays':90};
  for(const o of m.objects)if(sizes[o.id])this.setArt(m,o,o.interiorSheet,o.interiorArt,sizes[o.id]);
  const replace=(id,index)=>{const o=m.objects.find(o=>o.id===id);if(o)this.setArt(m,o,'kitchen-fittings',index);};
  replace('kitchen-industrial-mixer',2);replace('kitchen-spices',3);replace('kitchen-herbs',3);replace('kitchen-serving',4);replace('kitchen-industrial-oven',5);replace('kitchen-industrial-tools',6);replace('kitchen-pots',7);
  // Additional prep surfaces are real furniture with their own floor footprint.
  for(const[key,x,y,index]of [['prep-west',9.2,13.7,0],['prep-east',18.1,13.7,0],['pastry',12.8,13.7,1],['service',25.9,15.6,0]])I.prop(m,'kitchen-counter-'+key,index,x,y,92,{sheet:'kitchen-fittings',role:'book',label:'Bancada livre · preparo e apoio'});
  // Wall-mounted pots and tools use wall depth, separate from floor equipment.
  for(const id of ['kitchen-pots','kitchen-industrial-tools']){const o=m.objects.find(o=>o.id===id);o.solid=false;}
 },
 drawUniform(c,o,cam){if(!o.uniformSprite)return false;if(!V.Assets.ready(this.images[o.uniformSprite]))return true;const id=o.uniformSprite,x=o.x-cam.x,y=o.y-cam.y,walking=o.walking&&!V.settings.reducedMotion,row=o.action==='greeting'?5:V.clamp(o.dir||0,0,3),frame=V.settings.reducedMotion?0:walking?Math.floor((o.walkClock||V.Engine.time)*6)%4:0;V.SceneShadows?.character(c,id,x,y,66,row,frame,true);V.Assets.sprite(c,id,x,y,row,frame,66);if(W.nearest?.id===o.id)V.Maritime.label(c,o.name+' · '+uniforms[o.uniformSprite].role,x,y-79,true);return true;},
 drawDoor(c,o,cam){if(!o.industrialDoor)return false;const x=o.x-cam.x,y=o.y-cam.y;I.art(c,'industrial-kitchen',12,x-68,y-130,136);V.Maritime.label(c,'Cozinha profissional',x,y+14,W.nearest?.id===o.id);return true;},
 drawWater(c,o,cam){const until=this.washing.get(o.id);if(o.role!=='wash'||!until||until<=V.Engine.time)return;const x=o.x-cam.x,y=o.y-cam.y,size=o.size||110,t=V.settings.reducedMotion?0:V.Engine.time;c.save();c.strokeStyle='#d0f0ef';c.lineWidth=2;c.beginPath();c.moveTo(x+3,y-size*.46);c.lineTo(x+3,y-size*.3);c.stroke();c.strokeStyle='#8fcdd4';for(let i=0;i<3;i++){const a=(t*1.8+i/3)%1;c.beginPath();c.ellipse(x+3,y-size*.27,4+a*13,2+a*4,0,0,Math.PI*2);c.stroke();}c.restore();},
 wash(o){this.washing.set(o.id,V.Engine.time+2.8);V.Audio.sfx('menu');V.UI.toast('Mãos e utensílios higienizados. A bancada está pronta para o próximo preparo.');},
 uniformPanel(){V.UI.modal('Uniformes de cozinha','DÓLMÃ · AVENTAL · TOUCA',`<div class="nature-ranger-intro"><canvas width="160" height="160" id="kitchen-uniform-rack" aria-label="Dólmã, avental e touca"></canvas><div><p>A equipe usa dólmã, avental e touca durante o preparo. Os cabelos ficam protegidos e os utensílios são higienizados entre as etapas.</p><p>Escolha uma receita nas bancadas para começar a oficina.</p></div></div>`,'<button id="kitchen-uniform-recipes" class="primary">Consultar receitas</button>',true);const canvas=V.$('#kitchen-uniform-rack');I.art(canvas.getContext('2d'),'industrial-utilities',4,0,0,160);V.$('#kitchen-uniform-recipes').onclick=()=>V.Cooking.book();if(V.DuoPanels?.enabled()){const owner=V.DuoWorld.context>=0?V.DuoWorld.context:V.DuoPanels.owner(true);if(owner>=0)V.DuoPanels.bind(V.DuoPanels.root(owner),owner);}},
 groups(m,out){if(m?.id==='kitchen')out=out.filter(group=>group!=='culinary-kitchen');if(m?.professionalKitchen&&['kitchen','restaurant'].includes(m.id))out.push('industrial-kitchen');for(const o of m?.objects||[])if(o.uniformSprite)out.push('culinary-uniform:'+o.uniformSprite);return[...new Set(out)];}
};
// The existing interior loader is requested by Assets.load. Keep its public
// aliases while replacing the retired domestic kitchen sheet with steel assets.
I.load=()=>P.load();
const build=U.build.bind(U);U.build=function(...args){return P.decorate(build(...args));};
const draw=U.draw.bind(U);U.draw=function(c,o,cam){if(P.drawUniform(c,o,cam)||P.drawDoor(c,o,cam))return true;const out=draw(c,o,cam);P.drawWater(c,o,cam);return out;};
const shop=U.shop.bind(U);U.shop=function(...args){return{...shop(...args),sprite:'chef-lia'};};
const interact=V.Game.interact.bind(V.Game);V.Game.interact=function(o){if(o&&!V.modal&&!V.Dialogue.active&&this.mode==='explore'){if(o.role==='wash')return P.wash(o);if(o.role==='uniforms')return P.uniformPanel();}return interact(o);};
const group=V.AssetLoader.group.bind(V.AssetLoader);V.AssetLoader.group=function(key){const uniform=/assets\/cooking\/(chef-(?:dandara|bento|lia))\./.exec(key);if(uniform)return'culinary-uniform:'+uniform[1];if(/assets\/cooking\/(?:industrial-(?:kitchen|utilities)|kitchen-fittings)\./.test(key))return'industrial-kitchen';if(/assets\/nature\/sanctuary-team-game\./.test(key))return'sanctuary';return group(key);};
const groups=V.MapAssets.groups.bind(V.MapAssets);V.MapAssets.groups=m=>P.groups(m,groups(m));
const A=V.NatureArt;A.names=[...new Set(A.names.map(name=>aliases[name]||name))];
const cell=A.cell.bind(A);A.cell=function(sheet,...args){return cell(aliases[sheet]||sheet,...args);};
const natureLoad=A.load.bind(A);A.load=function(...args){const result=natureLoad(...args);for(const[from,to]of Object.entries(aliases))this.images[from]=this.images[to];return result;};
const frame=A.frame.bind(A);A.frame=function(c,sheet,row,col,x,y,w,h){if((sheet==='people'||sheet==='people-game')&&row<3||sheet==='sanctuary-staff'||sheet==='sanctuary-team-game'){const size=Math.min(w,h);return frame(c,sheet,row,col,x+(w-size)/2,y+h-size,size,size);}return frame(c,sheet,row,col,x,y,w,h);};
// New human sheets use a front-facing idle pose and three side-walking poses.
const staff=V.SanctuaryNeighbors,staffDraw=staff.draw.bind(staff);staff.draw=function(c,o,cam){if(!o.sanctuaryStaff)return staffDraw(c,o,cam);const s=this.staff.find(s=>s.id===o.sanctuaryStaff),x=o.x-cam.x,y=o.y-cam.y,walking=o.walking&&!V.settings.reducedMotion,col=walking?1+Math.floor((o.walkClock||V.Engine.time)*6)%3:0;c.save();if(walking&&o.dir===1){c.translate(x*2,0);c.scale(-1,1);}A.frame(c,s.row===null?'people':'sanctuary-staff',s.row===null?(s.id==='lindiwe'?1:0):s.row,col,x-32,y-64,64,64);c.restore();if(o.action==='sleeping')V.Engine.text(c,'Z z z',x,y-73,'#dfe9cb',12,'center');if(W.nearest?.id===o.id)V.Maritime.label(c,s.name+' · '+s.role,x,y-78,true);return true;};
})();
