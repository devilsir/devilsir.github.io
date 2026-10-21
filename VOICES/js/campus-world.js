(function(){'use strict';
const V=window.V,C=V.Cozy,L=V.Living,W=V.World,D=V.SceneDesign,E=V.SceneEditor,T=48,data=V.campusContent,copy=x=>JSON.parse(JSON.stringify(x));
const prior={load:V.Assets.load.bind(V.Assets),prop:C.prop.bind(C),districts:L.newDistricts.bind(L),compose:C.compose.bind(C),ground:C.ground.bind(C),interact:C.interact.bind(C),music:C.music.bind(C),regions:V.Atlas.regions.bind(V.Atlas),document:D.document.bind(D),normalise:D.normalise.bind(D),place:E.place.bind(E),scale:E.scale.bind(E),tick:E.tick.bind(E)};
V.sceneAssets.push(...data.assets,...data.fountains);
V.sceneAssets.push(...data.portraits.map(p=>({family:'portrait-display',index:p.index,name:'Retrato em painel · '+p.name,category:'museu',layer:'object',solid:true,solidFootprint:{x:.08,y:.65,width:.84,height:.28},interaction:'read',size:2.8})));
for(const r of data.residents)V.content.characters[r.character]={name:r.name,role:r.role,quote:r.lines[0].pt,accent:'#c8bc91'};
for(const p of data.portraits){const a=D.asset('cultural-pack',p.index);if(a){a.path=p.path;a.layer='object';a.solid=false;a.size=2;a.interaction='read';a.representation='educational-portrait';}}
for(const group of data.conversations)if(!V.cozyContent.conversations.some(x=>x.map===group.map))V.cozyContent.conversations.push(group);
for(const[id,d]of Object.entries(data.maps)){C.layouts[id]=copy(d);V.regionalContent[id]=copy(d);}
function subtractRect(rect,cut){const[x,y,w,h]=rect,[cx,cy,cw,ch]=cut,ix=Math.max(x,cx),iy=Math.max(y,cy),ex=Math.min(x+w,cx+cw),ey=Math.min(y+h,cy+ch);if(ix>=ex||iy>=ey)return[rect];return[[x,y,w,iy-y],[x,ey,w,y+h-ey],[x,iy,ix-x,ey-iy],[ex,iy,x+w-ex,ey-iy]].filter(r=>r[2]>.01&&r[3]>.01);}
function upgradeSquare(d){
 if(!d)return;
 d.surfaces=(d.surfaces||[]).filter(s=>!s.polygon.some(p=>p[0]===13&&p[1]===10));
 d.paths=(d.paths||[]).flatMap(r=>subtractRect(r,[12,10,13,8]));
 d.campusRevision=10;
 if((d.removedObjects||[]).includes('fountain'))return;
 if(!d.decor.some(r=>r[6]?.id==='square-fountain-furniture')){
  const p=d.positions?.fountain||[18.5,14],size=4,x=p[0]+.5-size/2,y=p[1]+.5-size*.88;
  const sid='square-fountain-water';
  d.decor.push(['fountain',12,x,y,size,true,{id:'square-fountain-furniture',layer:'object',sceneIds:[sid]}]);
  d.scenes.push({id:sid,kind:'notice',family:'fountain',prop:12,x:x+size/2-.5,y:y+size*.93-.5,size:3,title:'Fonte da Praça das Vozes',text:"Fountain é uma fonte de água; source é uma fonte de informação. O contexto distingue os sentidos de “fonte”. Na praça, deixe livre a passagem até os bancos e o bebedouro.",hostDecor:'square-fountain-furniture'});
 }
}
upgradeSquare(C.layouts.hub);
function addInstrument(map,index,x,y,size){const d=C.layouts[map],id='campus-music-'+map+'-'+index,a=data.assets[index];if(d.decor.some(r=>r[6]?.id===id))return;d.decor.push(['campus',index,x,y,size,true,{id,layer:'object',sceneIds:[id+'-play']}]);d.scenes.push({id:id+'-play',kind:'instrument',family:'campus',prop:index,x:x+size/2-.5,y:y+size*.9-.5,size,title:a.name,text:'Instrumentoteca: compare como o som começa e experimente uma frase musical original.',hostDecor:id});}
addInstrument('chapter-1',2,30,17,2.6);
addInstrument('chapter-1',3,25,20,1.9);
addInstrument('room-1',4,4,10.4,1.7);
addInstrument('room-1',9,18.5,13,1.8);
addInstrument('park',5,21,21,1.8);
D.defaults=copy(C.layouts);
const shimmerCache=new Map();
function fountainShimmer(index,frame){
 const key=index+':'+frame;if(shimmerCache.has(key))return shimmerCache.get(key);
 const c=document.createElement('canvas');c.width=c.height=96;const ctx=c.getContext('2d'),pixels=ctx.createImageData(96,96),p=pixels.data;
 for(const [at,r,g,b,a]of V.campusWaterPixels?.[index]||[]){const x=at%96,y=Math.floor(at/96);if((x*3+y+frame*2)%19>=3)continue;const i=at*4;p[i]=Math.min(255,r+25);p[i+1]=Math.min(255,g+32);p[i+2]=Math.min(255,b+28);p[i+3]=a;}
 ctx.putImageData(pixels,0,0);shimmerCache.set(key,c);return c;
}
V.Assets.load=async function(){
 const entries=[...data.assets.map(a=>['campus-'+a.index,a.path]),...data.fountains.map(a=>['campus-fountain-'+a.index,a.path]),...data.portraits.map(a=>['campus-portrait-'+a.index,a.path])];
 await Promise.all([prior.load(),...entries.map(([key,path])=>new Promise(resolve=>{const img=new Image();img.onload=()=>{this.images[key]=img;resolve();};img.onerror=()=>{this.errors.push(path);resolve();};img.src=path;}))]);
 for(const r of data.residents){this.images[r.character]=this.images[r.sourceCharacter];this.images[r.character+'-portrait']=this.images[r.sourceCharacter+'-portrait'];}
 shimmerCache.clear();return this.errors;
};
C.prop=function(ctx,family,index,x,y,size=T,materials=null){
 if(family==='portrait-display'){
  const img=V.Assets.images['campus-portrait-'+index],frame=V.Assets.images['campus-31'],p=data.portraits.find(p=>p.index===index);
  if(!img||!frame)return;ctx.imageSmoothingEnabled=false;ctx.drawImage(frame,6,37,84,53,x+size*.03,y+size*.03,size*.94,size*.94);
  ctx.fillStyle='#e4d6b5';ctx.fillRect(x+size*.14,y+size*.12,size*.72,size*.69);ctx.drawImage(img,x+size*.15,y+size*.10,size*.70,size*.70);
  if(p){let label=p.name;ctx.font='600 '+Math.max(7,size*.065)+'px "VOICES Sans",sans-serif';while(ctx.measureText(label).width>size*.80&&label.length>6)label=label.slice(0,-2)+'…';ctx.fillStyle='#f2e3bc';ctx.textAlign='center';ctx.fillText(label,x+size/2,y+size*.91);ctx.textAlign='left';}return;
 }
 if(family==='furnishings'&&(index===0||index===4)){family='campus';index=index===0?0:1;}
 let key;
 if(family==='campus')key='campus-'+index;
 else if(family==='fountain'&&index>=12)key='campus-fountain-'+index;
 else if(family==='cultural-pack'&&index>=136)key='campus-portrait-'+index;
 if(!key)return prior.prop(ctx,family,index,x,y,size,materials);
 const img=V.Assets.images[key];if(!img)return;ctx.imageSmoothingEnabled=false;ctx.drawImage(img,Math.round(x),Math.round(y),size,size);
 if(family==='fountain'&&!V.settings?.reducedMotion){const time=E.active?E.animationClock||0:V.Engine.time,frame=Math.floor(time*7)%8;ctx.drawImage(fountainShimmer(index,frame),Math.round(x),Math.round(y),size,size);}
};
C.fountain=function(){};
W.drawFountain=function(){};
const connections=[['hub','school',8.5,21.5,'Visitar a Escola Aberta'],['hub','museum',29.5,22.5,'Visitar o Museu das Vozes'],['chapter-5','school',36,9,'Entrar na Escola Aberta'],['chapter-2','museum',18,8.5,'Entrar no Museu das Vozes']];
for(const[from,to,x,y]of connections){C.layouts[from].positions['campus-travel-'+from+'-'+to]=[x,y];D.defaults[from].positions['campus-travel-'+from+'-'+to]=[x,y];}
L.newDistricts=function(){
 prior.districts();
 for(const[id,d]of Object.entries(data.maps)){
  const m=W.base(id,'room',d.width,d.height);m.name=d.name;m.biome=id;
  W.object(m,'exit',id+'-exit-plaza',d.width/2-.5,d.height-2.6,'Voltar à Praça das Vozes',{to:'hub'});
  W.object(m,'travel',id+'-exit-district',id==='school'?17:19,d.height-2.6,id==='school'?'Ir ao campus comunitário':'Ir ao pátio do museu',{to:id==='school'?'chapter-5':'chapter-2'});
  for(const r of data.residents.filter(r=>r.map===id)){const resident={...r,repeat:r.lines[0]};W.object(m,'resident','resident-'+r.id,r.x,r.y,'Conversar com '+r.name,{character:r.character,resident,homeMap:id});}
  W.maps[id]=m;
 }
 for(const[from,to,x,y,label]of connections)if(!W.maps[from].objects.some(o=>o.id==='campus-travel-'+from+'-'+to))W.object(W.maps[from],'travel','campus-travel-'+from+'-'+to,x,y,label,{to});
 const schoolDoor=W.maps['chapter-5'].objects.find(o=>o.id==='door-room-5-1');if(schoolDoor){schoolDoor.to='school';schoolDoor.label='Entrar na Escola Aberta';}
};
C.compose=function(m){
 prior.compose(m);
 if(m.id==='chapter-5'){const door=m.objects.find(o=>o.id==='door-room-5-1');if(door){door.to='school';door.label='Entrar na Escola Aberta';}}
 if(m.id==='chapter-2'){const door=m.objects.find(o=>o.id==='door-room-2-1');if(door){door.to='museum';door.label='Entrar no Museu das Vozes';}}
 if(m.id==='hub'){
  m.objects=m.objects.filter(o=>o.type!=='fountain');
  m.decor=m.decor.filter(o=>o.linked!=='fountain');
  m.solids=m.solids.filter(f=>f.owner!=='fountain'&&f.owner!=='host-fountain'&&!(f.x===14*T&&f.y===9*T&&f.w===4*T));
  const o=m.objects.find(o=>o.scene?.id==='square-fountain-water');
  if(o){const p=C.safe(m,o.x/T-.5,o.y/T+.5);C.addAnchor(m,'observe-water',p.x*T+24,p.y*T+24,'observing',15,3,o);}
  else m.anchors.delete('observe-water');
  for(const p of m.objects.filter(C.person.bind(C))){p.tasks=(p.tasks||[]).filter(id=>m.anchors.has(id));p.waypoints=p.tasks.map(id=>m.anchors.get(id));}
 }
 m.cache=null;
};
C.ground=function(m){
 prior.ground(m);
 if(!data.maps[m.id]||!m.cache)return;
 const ctx=m.cache.getContext('2d');
 for(const[label,x,y,w]of m.design.zones||[]){ctx.fillStyle='#2a433d';ctx.fillRect((x+.3)*T,(y+.1)*T,(w-.6)*T,19);V.Engine.text(ctx,label.toUpperCase(),(x+w/2)*T,(y+.1)*T+14,'#f0e3c6',12,'center');}
};
const instrumentInfo={
 2:['Percussão: baquetas e pedais fazem vibrar peles e pratos.','drums'],
 3:['Sopro: uma palheta simples vibra quando o ar passa pelo bocal.','sawtooth'],
 4:['Cordas: a vibração das cordas é captada e amplificada.','triangle'],
 5:['Cordas: o corpo do violão ajuda a projetar sua vibração.','triangle'],
 6:['Teclas: pequenos martelos fazem vibrar as cordas do piano.','sine'],
 7:['Eletrônico: as teclas controlam sons produzidos por circuitos.','sine'],
 8:['Sopro: os lábios vibram no bocal do trompete.','sawtooth'],
 9:['Cordas: o contrabaixo constrói linhas graves no conjunto.','triangle']
};
C.music=function(o){
 const s=o.scene,info=s.family==='campus'&&instrumentInfo[s.prop];if(!info)return prior.music(o);
 const notes=s.prop===9?[36,43,40,43]:[60,64,67,64],description=info[0],wave=info[1];
 V.UI.modal(s.title,'INSTRUMENTOTECA · EXPERIMENTE',`<figure class="culture-piece"><img src="${data.assets[s.prop].path}" width="192" height="192" style="image-rendering:pixelated" alt="${V.escape(s.title)}"></figure><p>${V.escape(description)}</p><p>${V.escape(s.text)}</p><p class="note">O áudio é uma simulação sintética original para comparar ritmo e altura.</p><div id="campus-music-feedback" aria-live="polite"></div>`,`<button id="campus-play" class="primary">Ativar som e ouvir</button><button id="campus-keep" class="secondary">Guardar experiência</button>`);
 V.$('#campus-play').onclick=async()=>{
  V.settings.muted=false;V.Save.applySettings();await V.Audio.unlock();
  if(wave==='drums'){for(let i=0;i<8;i++)setTimeout(()=>V.Audio.drum(i%4===0?'kick':i%4===2?'snare':'hat'),i*210);}
  else notes.forEach((n,i)=>V.Audio.note(n,.30,wave,.25,'sfx',i*.30));
  V.$('#campus-music-feedback').textContent=wave==='drums'?'Padrão original: bumbo, chimbal e caixa.':'Frase original: dó, mi, sol, mi.';
 };
 V.$('#campus-keep').onclick=()=>{C.ensure();V.state.cozy.music[o.id]={timbre:wave,notes};V.Save.save();V.UI.close();V.UI.toast('Experiência guardada no caderno.');};
};
V.Campus={
 profile(index){
 const p=data.portraits.find(p=>p.index===index);if(!p)return;
 const esc=V.escape,refs=(p.sourceIds||[]).map(id=>V.content.sources.find(s=>s.id===id)).filter(Boolean);
 V.UI.modal(p.name,'RETRATO EDUCATIVO · TRAJETÓRIA E CONTEXTO',`<figure class="culture-piece"><img src="${esc(p.path)}" width="192" height="192" style="image-rendering:pixelated" alt="Interpretação artística de ${esc(p.name)}"></figure><p>${esc(p.biography)}</p><p>${esc(p.context)}</p><aside class="reader-english"><strong>English connection</strong><p>${esc(p.en)}</p>${V.settings.translation?'<'+'small>'+esc(p.pt)+'</small>':''}</aside><details open><summary>Fontes desta trajetória</summary>${refs.map(s=>'<p class="reader-origin"><a href="'+esc(s.url)+'" target="_blank" rel="noopener noreferrer">'+esc(s.name)+' ↗</a></p>').join('')}</details>`, '<button id="campus-full-profile" class="primary">Ler e registrar no caderno</button>');
 V.$('#campus-full-profile').onclick=()=>L.read(p.readingId,0,()=>this.profile(index));
}
};
C.interact=function(o){if(['cultural-pack','portrait-display'].includes(o?.scene?.family)&&o.scene.prop>=136){V.Campus.profile(o.scene.prop);return true;}return prior.interact(o);};
E.place=function(x,y){
 const a=V.sceneAssets[this.asset];prior.place(x,y);
 if(!a||!['campus','portrait-display'].includes(a.family)&&!(a.family==='fountain'&&a.index>=12)&&!(a.family==='cultural-pack'&&a.index>=136))return;
 const ref=this.find();if(!ref)return;
 if(ref.kind==='decor'){
  const row=this.design().decor[ref.index];row[4]=a.size||2;
  row[2]=Math.max(1,Math.min(row[2],this.preview.width-1-row[4]));row[3]=Math.max(2,Math.min(row[3],this.preview.height-1-row[4]));
 }else if(ref.kind==='scene'){
  const s=this.design().scenes.find(s=>s.id===ref.id);if(s){s.size=a.size||2;if(instrumentInfo[a.index]&&a.family==='campus'){s.kind='instrument';s.title=a.name;s.text='Compare como o som começa e experimente uma frase musical original.';}if(['cultural-pack','portrait-display'].includes(a.family)){s.kind='notice';s.title=a.name;s.text=V.culturalPackBios[a.name]||s.text;}}
 }
 const h=this.history.at(-1);if(h)h.after=this.capture();this.saveDraft();this.refresh();
};
E.scale=function(value,relative=false){
 const ref=this.find(),row=ref?.kind==='decor'?this.design().decor[ref.index]:null;
 const managed=row&&(['campus','portrait-display'].includes(row[0])||row[0]==='fountain'&&row[1]>=12);
 const oldSize=row?.[4],points=managed?(row[6]?.sceneIds||[]).map(id=>this.design().scenes.find(s=>s.id===id)).filter(Boolean).map(s=>({id:s.id,x:s.x,y:s.y})):[];
 prior.scale(value,relative);if(!managed||row[4]===oldSize)return;
 const ratio=row[4]/oldSize;for(const p of points){const s=this.design().scenes.find(s=>s.id===p.id);if(s){s.x=row[2]+(p.x+.5-row[2])*ratio-.5;s.y=row[3]+(p.y+.5-row[3])*ratio-.5;s.size=Math.min(3,row[4]);}}
 const h=this.history.at(-1);if(h)h.after=this.capture();this.saveDraft();this.refresh();
};
E.tick=function(dt){prior.tick(dt);if(!this.active||this.walk||!this.preview?.decor.some(o=>o.family==='fountain'&&o.prop>=12)||V.settings?.reducedMotion)return;const frame=Math.floor((this.animationClock||0)*7);if(frame!==this.campusWaterFrame){this.campusWaterFrame=frame;this.image=this.renderWorld();this.paint();}};
V.Atlas.regions=function(){
 prior.regions();const target=V.$('.atlas-neighbors');if(!target)return;
 for(const[id,d]of Object.entries(data.maps)){const button=document.createElement('button');button.className='map-card';button.dataset.localRegion=id;button.innerHTML=`<canvas class="map-preview" data-map-preview="${id}" width="384" height="240" aria-hidden="true"></canvas><b>${V.escape(d.name.split(' · ')[0])}</b><small>${V.escape(d.purpose)}</small><span class="map-card-action">Visitar →</span>`;target.appendChild(button);V.Atlas.paint(button.querySelector('canvas'),W.maps[id]);button.onclick=()=>{V.UI.close();W.load(id);};}
};
D.document=function(maps){return{...prior.document(maps),revision:10};};
D.normalise=function(doc){
 const input=copy(doc);
 if(input?.maps&&(input.revision||0)<10){for(const[id,d]of Object.entries(data.maps))if(!input.maps[id])input.maps[id]=copy(D.defaults[id]);if(input.maps.hub)upgradeSquare(input.maps.hub);for(const id of ['chapter-1','room-1','park']){const target=input.maps[id];if(!target)continue;for(const row of D.defaults[id].decor.filter(r=>r[6]?.id?.startsWith('campus-music-')))if(!target.decor.some(r=>r[6]?.id===row[6].id))target.decor.push(copy(row));for(const s of D.defaults[id].scenes.filter(s=>s.id.startsWith('campus-music-')))if(!target.scenes.some(x=>x.id===s.id))target.scenes.push(copy(s));}}
 return prior.normalise(input);
};
})();
