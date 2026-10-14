(() => {
'use strict';
const E=window.CHEMSCAPE_ENGINE,V=window.CHEMSCAPE_V7;if(!E||!V)return;
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const worlds=()=>({...E.levels().worlds,...E.levels().rooms}),meta=window.CHEMSCAPE_ASSET_META,cache=new Map();
const regionNames={orchard:'Pomar Experimental',aion:'Complexo AION',city:'Nova Aurora',military:'Base Sentinela',forest:'Floresta Alterada',rupture:'Zona da Ruptura',frontier:'Fronteira do Conflito',human:'Ponteclara',goblin:'Liga do Cobre',lunar:'Bosque Lunargênteo',blood:'Academia Rubra',sanctuary:'Santuário de Maera',orc:'Vale da Forja',troll:'Aldeia das Marés',tauren:'Planícies de Âmbar',ruins:'Ruínas do Limiar'};
let selected='world1',zoom=1,cx=3360,cy=1920,drag=null,pin=null,hover=null,filter='',identity='',lastRender=0;
const options={npcs:true,drops:true,hostile:false,regions:true};
const panel=$('maps');panel.classList.add('atlas-overlay');panel.innerHTML=[
 '<div class="atlas-panel"><header class="atlas-header"><div><div class="eyebrow">CADERNO DE ELIAS · CARTOGRAFIA</div><h2>Atlas da Convergência</h2></div><button id="atlas-close" class="atlas-close" aria-label="Fechar mapa">×</button></header>',
 '<div class="atlas-tabs"><button data-atlas-world="world1"><img src="'+E.assetPath(V.ui.science)+'" alt="">Terra · Nova Aurora</button><button data-atlas-world="alchemy"><img src="'+E.assetPath(V.ui.alchemy)+'" alt="">Vitrália · Duas Leis</button><select id="atlas-interior" aria-label="Mapas de interiores"><option value="">Interiores…</option></select><button id="atlas-current">Você está aqui</button></div>',
 '<div class="atlas-content"><div class="atlas-stage"><canvas id="atlas-canvas" width="960" height="540" aria-label="Mapa global explorável"></canvas><div class="atlas-compass"><img src="'+E.assetPath(V.ui.compass)+'" alt=""><span>N</span></div><div class="atlas-zoom"><button id="atlas-plus" aria-label="Aumentar zoom">+</button><button id="atlas-minus" aria-label="Diminuir zoom">−</button><button id="atlas-fit" aria-label="Mostrar mapa completo">⌖</button></div><div id="atlas-tooltip"></div></div><aside class="atlas-side"><div class="atlas-side-heading">LUGARES E TERRITÓRIOS</div><input id="atlas-search" placeholder="Buscar região…" aria-label="Buscar região"><div id="atlas-regions"></div><div class="atlas-legend"><label><input data-atlas-option="npcs" type="checkbox" checked><i class="atlas-dot npc"></i>Habitantes e serviços</label><label><input data-atlas-option="drops" type="checkbox" checked><i class="atlas-dot drop"></i>Drops e colheitas</label><label><input data-atlas-option="hostile" type="checkbox"><i class="atlas-dot enemy"></i>Criaturas hostis</label><label><input data-atlas-option="regions" type="checkbox" checked> Nomes das regiões</label></div><button id="atlas-clear-pin">Remover marcador</button><div id="atlas-pin-text">Clique no mapa para marcar um destino.</div></aside></div>',
 '<footer class="atlas-footer"><span>Arraste para explorar · Roda: zoom · Clique: marcar destino</span><span id="atlas-world-label"></span></footer><div class="atlas-chapters"><span>CAPÍTULOS</span><button data-atlas-chapter="intro">00 · Laboratório AION</button><button data-atlas-chapter="world1">01 · O Véu</button><button data-atlas-chapter="alchemy">02 · Vitrália</button><span class="future-chapter">Arquipélago · Em breve</span><span class="future-chapter">Terras Desconhecidas · Em breve</span></div></div>'
].join('');
const canvas=$('atlas-canvas'),c=canvas.getContext('2d'),CW=960,CH=540;
function currentMap(){return worlds()[selected];}
const thumbs=new Map(),thumbQueue=[];let thumbPending=0;function pumpThumbs(){while(thumbPending<8&&thumbQueue.length){const r=thumbQueue.shift();thumbPending++;r.img.onload=()=>{r.ready=true;thumbPending--;pumpThumbs();};r.img.onerror=()=>{r.failed=true;thumbPending--;pumpThumbs();};r.img.src=E.assetPath(r.file);}}function image(file){if(!file)return null;if(!file.includes('/thumbs/'))return E.image(file);let r=thumbs.get(file);if(!r){r={file,img:new Image(),ready:false,failed:false};thumbs.set(file,r);thumbQueue.push(r);pumpThumbs();while(thumbs.size>192){const key=[...thumbs].find(([k,v])=>v.ready&&k!==file)?.[0];if(!key)break;thumbs.delete(key);}}return r;}
function fit(){const l=currentMap();if(!l)return;zoom=1;cx=l.bounds[0]+l.bounds[2]/2;cy=l.bounds[1]+l.bounds[3]/2;}
function scale(){const l=currentMap();return l?Math.min((CW-44)/l.bounds[2],(CH-44)/l.bounds[3])*zoom:1;}
function project(x,y){const k=scale();return [CW/2+(x-cx)*k,CH/2+(y-cy)*k];}
function unproject(x,y){const k=scale();return [cx+(x-CW/2)/k,cy+(y-CH/2)/k];}
function setZoom(value,point=[CW/2,CH/2]){const p=unproject(...point);zoom=Math.max(1,Math.min(7,value));const k=scale();cx=p[0]-(point[0]-CW/2)/k;cy=p[1]-(point[1]-CH/2)/k;clampView();}
function clampView(){const l=currentMap();if(!l)return;cx=Math.max(l.bounds[0],Math.min(l.bounds[0]+l.bounds[2],cx));cy=Math.max(l.bounds[1],Math.min(l.bounds[1]+l.bounds[3],cy));}
function base(l){
 const state=E.atlasState();let rec=cache.get(l.id);if(rec&&rec.level===l&&rec.revision===state.revision&&rec.complete&&rec.textureGeneration===(window.CHEMSCAPE_FLOOR_TEXTURES?.generation||0))return rec;
 const k=Math.min(1024/l.bounds[2],700/l.bounds[3]),im=document.createElement('canvas');im.width=Math.ceil(l.bounds[2]*k);im.height=Math.ceil(l.bounds[3]*k);
 const g=im.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle=l.world==='science'?'#6c8556':'#758c5b';g.fillRect(0,0,im.width,im.height);g.scale(k,k);g.translate(-l.bounds[0],-l.bounds[1]);let complete=true;
 const floor=image(l.floor?.overview);if(floor?.ready)g.drawImage(floor.img,...l.bounds);else if(floor&&!floor.failed)complete=false;
 if(l.paint?.tiles)for(const [key,t]of Object.entries(l.paint.tiles).sort((a,b)=>(a[1].order||0)-(b[1].order||0))){const [s,x,y]=key.split(':').map(Number);g.save();if(t.circle){g.beginPath();g.arc(...t.circle,0,Math.PI*2);g.clip();}if(t.texture&&window.CHEMSCAPE_FLOOR_TEXTURES){if(!window.CHEMSCAPE_FLOOR_TEXTURES.draw(g,t.texture,{x:x*s,y:y*s,w:s,h:s}))complete=false;}else{g.fillStyle=t.color;g.fillRect(x*s,y*s,s,s);}g.restore();}
 for(const o of [...l.objects].sort((a,b)=>(a.depthY??a.y)-(b.depthY??b.y))){if(o.hidden||o.kind==='flower')continue;const m=meta[o.sprite],r=image(m?.thumb);if(!r?.ready){if(r&&!r.failed)complete=false;continue;}const b=E.spriteBox(o),side=Math.max(b.w,b.h)*1.07;g.drawImage(r.img,b.x+b.w/2-side/2,b.y+b.h/2-side/2,side,side);}
 if(state.campaign.limiarPuzzle&&l.puzzleBridge){const b=l.puzzleBridge;g.fillStyle='#bf985b';g.fillRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);}
 rec={canvas:im,k,complete,level:l,revision:state.revision,textureGeneration:window.CHEMSCAPE_FLOOR_TEXTURES?.generation||0};if(cache.has(l.id))cache.get(l.id).canvas.width=0;cache.delete(l.id);cache.set(l.id,rec);
 while(cache.size>3){const key=cache.keys().next().value;cache.get(key).canvas.width=0;cache.delete(key);}return rec;
}
function diamond(g,x,y,size,color){g.fillStyle=color;g.beginPath();g.moveTo(x,y-size);g.lineTo(x+size,y);g.lineTo(x,y+size);g.lineTo(x-size,y);g.closePath();g.fill();}
function markers(l){
 const s=E.atlasState(),live=s.level?.id===l.id,items=[];
 const npc=live?s.npcs:l.npcs||[];if(options.npcs)for(const n of npc)if(!n.hidden)items.push({x:n.x,y:n.y,type:'npc',label:n.name||'Habitante',color:'#ffe9a9'});
 if(options.hostile)for(const n of live?s.enemies:l.mobs||[])if(!n.hidden&&n.hostile&&n.hp!==0)items.push({x:n.x,y:n.y,type:'enemy',label:n.prettyName||n.kind||'Criatura',color:'#f38588'});
 if(options.drops){for(const p of live?s.pickups:l.pickups||[])if(!p.done&&!(s.campaign.fieldItems||[]).includes(p.id))items.push({x:p.x,y:p.y,type:'drop',label:p.name||'Coleta',color:'#e6c071'});
  for(const o of l.objects)if(o.harvest&&!o.hidden&&!(s.campaign.fieldItems||[]).includes('harvest:'+o.id))items.push({x:o.x,y:o.y,type:'harvest',label:'Colher '+o.harvest.name,color:'#add68b'});
 }
 for(const p of live?s.samples:l.samples||[])if(!p.done&&(p.id.startsWith('sample')||s.campaign.maeraSpoken)&&!((p.id.startsWith('sample')?s.campaign.samples:s.campaign.anchors)||[]).includes(p.id))items.push({x:p.x,y:p.y,type:'quest',label:p.name,color:p.color||'#c9a3ff'});
 if(l.portal&&s.campaign.maeraSpoken)items.push({x:l.portal[0],y:l.portal[1],type:'portal',label:l.world==='science'?'Portal para Vitrália':'Portal para o AION',color:'#bfa2f1'});
 if(l.labDoor)items.push({x:l.labDoor[0],y:l.labDoor[1],type:'door',label:'Laboratório AION',color:'#8ae2dd'});
 for(const o of l.objects)if(o.enter&&!o.hidden){const p=o.door||[o.x,o.y];items.push({x:p[0],y:p[1],type:'door',label:o.name||'Entrada',color:'#8ae2dd'});}
 if(l.exit)items.push({x:l.exit[0],y:l.exit[1],type:'door',label:'Saída para o exterior',color:'#8ae2dd'});
 if(l.id==='world1'&&!s.campaign.crystalFound){const point=s.campaign.slimeDefeated?l.crystal:l.slime;if(point)items.push({x:point[0],y:point[1],type:'quest',label:s.campaign.slimeDefeated?'Cristal de Limiar':'Criatura anômala',color:'#dfafff'});}
 return items;
}
function drawMark(g,p,size=3){
 g.save();g.lineWidth=1.3;g.strokeStyle='#132d38';
 if(p.type==='portal'){g.strokeStyle=p.color;g.lineWidth=2;g.beginPath();g.arc(p.x,p.y,size+2,0,Math.PI*2);g.stroke();}
 else if(p.type==='quest'||p.type==='drop')diamond(g,p.x,p.y,p.type==='quest'?size+1:size,p.color);
 else if(p.type==='door'){g.fillStyle=p.color;g.fillRect(p.x-size,p.y-size,size*2,size*2);g.strokeRect(p.x-size,p.y-size,size*2,size*2);}
 else{g.fillStyle=p.color;g.beginPath();g.arc(p.x,p.y,size,0,Math.PI*2);g.fill();g.stroke();}g.restore();
}
function drawPlayer(g,x,y,heading,size=8){
 g.save();g.translate(x,y);g.rotate(heading);g.strokeStyle='#132d38';g.lineWidth=2;g.fillStyle='#fff5d2';g.beginPath();g.moveTo(size+2,0);g.lineTo(-size*.6,-size*.65);g.lineTo(-size*.3,0);g.lineTo(-size*.6,size*.65);g.closePath();g.fill();g.stroke();g.restore();
}
function regionLabel(r){return regionNames[r.id]||r.name.split('·')[0].trim();}
function renderRegions(){
 const l=currentMap(),f=filter.toLocaleLowerCase();$('atlas-regions').innerHTML=(l?.regions||[]).filter(r=>regionLabel(r).toLocaleLowerCase().includes(f)).map((r,i)=>{
  const faction=V.factions[r.id],im=faction?'<img src="'+E.assetPath(faction.emblem)+'" alt="">':'<span class="region-circle">'+(l.world==='science'?'Cs':'◈')+'</span>';
  return '<button data-atlas-region="'+esc(r.id||r.name)+'">'+im+'<span>'+esc(regionLabel(r))+'<small>'+esc(r.id==='ruins'?'Exploração e ressonância':r.id==='frontier'?'Fronteira e checkpoints':r.id==='aion'?'Pesquisa e acesso ao laboratório':r.id==='city'?'Comércio, hospital e residências':'Território e pontos de interesse')+'</small></span></button>';
 }).join('');
 for(const button of $('atlas-regions').querySelectorAll('button'))button.onclick=()=>{const r=l.regions.find(r=>(r.id||r.name)===button.dataset.atlasRegion);cx=r.center?.[0]??r.bounds[0]+r.bounds[2]/2;cy=r.center?.[1]??r.bounds[1]+r.bounds[3]/2;zoom=Math.max(1.5,Math.min(5,Math.min(l.bounds[2]/(r.bounds[2]*1.5),l.bounds[3]/(r.bounds[3]*1.5))));};
}
function selectWorld(id){if(!worlds()[id])return;selected=id;fit();filter='';$('atlas-search').value='';renderRegions();updateTabs();}
function updateTabs(){
 for(const b of panel.querySelectorAll('[data-atlas-world]')){b.classList.toggle('active',b.dataset.atlasWorld===selected);b.disabled=!E.allowedScene(b.dataset.atlasWorld);}
 for(const b of panel.querySelectorAll('[data-atlas-chapter]'))b.disabled=!E.allowedScene(b.dataset.atlasChapter);
 $('atlas-interior').value=E.levels().rooms[selected]?selected:'';$('atlas-world-label').textContent=currentMap()?.name||'';
}
function open(){const s=E.atlasState();selectWorld(s.level?.id||'world1');refreshIdentity();const interiors=$('atlas-interior');interiors.innerHTML='<option value="">Interiores…</option>'+Object.entries(E.levels().rooms).filter(([id,l])=>E.allowedScene(l.parent)).map(([id,l])=>'<option value="'+id+'">'+esc(l.name)+'</option>').join('');interiors.value=E.levels().rooms[selected]?selected:'';render();}
function refreshIdentity(){
 const s=E.atlasState(),kind=s.level?.world==='alchemy'?'alchemy':'science';if(kind!==identity){identity=kind;const portrait=document.querySelector('#hud .portrait img:not(.portraitBorder)');if(portrait)portrait.src=E.assetPath(kind==='alchemy'?V.portraitAlchemy:'SPRITES/Cientista/portrait scientist.png');$('game-shell').dataset.realm=kind;}
 for(const [index,key]of V.skills.entries()){const button=document.querySelector('.skill[data-skill="'+['one','two','three','four','five','six','seven','eight','nine'][index]+'"]');if(button&&!button.querySelector('img')){const icon=button.querySelector('b');icon.textContent='';const im=document.createElement('img');im.src=E.assetPath(V.ui[key]);im.alt='';icon.append(im);button.setAttribute('aria-label',button.title);}}
 for(const [id,key]of Object.entries({btnAudio:'sound',btnJournal:'journal',btnMap:'map',btnPause:'pause',touchAttack:'attack',touchSkill:'catalysis'})){const button=$(id);if(!button||button.querySelector('img'))continue;button.textContent='';const im=document.createElement('img');im.src=E.assetPath(V.ui[key]);im.alt='';button.append(im);}
 const editor=$('btnEditor');if(editor&&!editor.querySelector('img')){const im=document.createElement('img');im.src=E.assetPath(V.ui.editor);im.alt='';editor.prepend(im);}
 for(const [i,b]of [...document.querySelectorAll('#skillGuide .guide-skill > b')].entries())if(V.skills[i]&&!b.querySelector('img')){b.textContent='';const im=document.createElement('img');im.src=E.assetPath(V.ui[V.skills[i]]);im.alt='';b.append(im);}
}
function render(){
 const l=currentMap();if(!l)return;const s=E.atlasState(),k=scale(),r=base(l);c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,CW,CH);c.fillStyle='#101f27';c.fillRect(0,0,CW,CH);c.imageSmoothingEnabled=false;
 c.save();c.translate(CW/2,CH/2);c.scale(k,k);c.translate(-cx,-cy);c.drawImage(r.canvas,...l.bounds);c.strokeStyle='#d2d3a7aa';c.lineWidth=2/k;c.strokeRect(...l.bounds);c.restore();
 if(options.regions)for(const reg of l.regions||[]){const x=reg.center?.[0]??reg.bounds[0]+reg.bounds[2]/2,y=reg.center?.[1]??reg.bounds[1]+reg.bounds[3]/2,[px,py]=project(x,y);if(px<-80||py<-30||px>CW+80||py>CH+30)continue;
  const text=regionLabel(reg).toUpperCase();c.font='bold 11px system-ui';const w=c.measureText(text).width;c.fillStyle='#10252bdc';c.beginPath();c.roundRect(px-w/2-8,py-22,w+16,22,5);c.fill();c.textAlign='center';c.fillStyle='#f4efd0';c.fillText(text,px,py-7);
 }
 for(const item of markers(l)){const p=project(item.x,item.y);if(p[0]<-8||p[0]>CW+8||p[1]<-8||p[1]>CH+8)continue;drawMark(c,{...item,x:p[0],y:p[1]},zoom>2?4:2.5);}
 if(s.level?.id===l.id&&s.player){const p=project(s.player.x,s.player.y);c.strokeStyle='#faf4c54f';c.lineWidth=1.5;c.beginPath();c.arc(...p,13+Math.sin(performance.now()*.003)*2,0,Math.PI*2);c.stroke();drawPlayer(c,...p,s.player.heading||0);}
 if(pin?.world===l.id){const p=project(pin.x,pin.y);diamond(c,...p,8,'#ffe491');c.strokeStyle='#352c33';c.strokeRect(p[0]-2,p[1]-2,4,4);}
 if(hover){const p=unproject(hover.x,hover.y);const nearest=markers(l).map(m=>({...m,d:Math.hypot(...project(m.x,m.y).map((v,i)=>v-[hover.x,hover.y][i]))})).filter(m=>m.d<13).sort((a,b)=>a.d-b.d)[0];$('atlas-tooltip').textContent=nearest?.label||Math.round(p[0])+' · '+Math.round(p[1]);$('atlas-tooltip').style.display='block';}else $('atlas-tooltip').style.display='none';
}
function minimap(){
 const s=E.atlasState(),l=s.level;if(!l||!s.player)return;const mini=$('minimap'),g=mini.getContext('2d'),n=mini.width,mid=n/2,range=l.parent?1450:1900,k=n/range,r=base(l);
 g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,n,n);g.fillStyle='#132c35';g.fillRect(0,0,n,n);g.save();g.beginPath();g.roundRect(3,3,n-6,n-6,11);g.clip();g.save();g.translate(mid,mid);g.scale(k,k);g.translate(-s.player.x,-s.player.y);g.drawImage(r.canvas,...l.bounds);g.restore();
 for(const item of markers(l)){const x=mid+(item.x-s.player.x)*k,y=mid+(item.y-s.player.y)*k;if(x<6||y<6||x>n-6||y>n-6)continue;drawMark(g,{...item,x,y},item.type==='quest'?3:2);}
 for(const e of s.enemies)if(e.hostile&&e.hp>0&&e.respawn<=0){const x=mid+(e.x-s.player.x)*k,y=mid+(e.y-s.player.y)*k;if(x>6&&y>6&&x<n-6&&y<n-6)drawMark(g,{x,y,type:'enemy',color:'#ef8788'},2);}
 if(pin?.world===l.id){const x=mid+(pin.x-s.player.x)*k,y=mid+(pin.y-s.player.y)*k;diamond(g,Math.max(8,Math.min(n-8,x)),Math.max(8,Math.min(n-8,y)),4,'#ffe397');}
 g.strokeStyle='#f5f0c62f';g.beginPath();g.arc(mid,mid,n*.3,0,Math.PI*2);g.stroke();drawPlayer(g,mid,mid,s.player.heading||0,6);g.restore();
 g.strokeStyle=l.world==='science'?'#81d4c28f':'#b4a1da9f';g.lineWidth=2;g.beginPath();g.roundRect(3,3,n-6,n-6,11);g.stroke();g.font='bold 10px system-ui';g.fillStyle='#f4efd1';g.textAlign='center';g.fillText('N',mid,16);
 const title=$('mini').querySelector('span');if(title)title.innerHTML='ATLAS <kbd>M</kbd> · '+(l.world==='science'?'TERRA':'VITRÁLIA');
}
function updatePin(){const s=E.atlasState(),text=$('atlas-pin-text');if(!pin){text.textContent='Clique no mapa para marcar um destino.';return;}const distance=s.level?.id===pin.world&&s.player?Math.round(Math.hypot(pin.x-s.player.x,pin.y-s.player.y)/32)+' m':'Outro mapa';text.textContent='Destino: '+Math.round(pin.x)+' · '+Math.round(pin.y)+' — '+distance;}
canvas.addEventListener('pointerdown',e=>{const p=mouse(e);drag={x:p.x,y:p.y,cx,cy,moved:false,id:e.pointerId};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{const p=mouse(e);hover=p;if(drag){const dx=p.x-drag.x,dy=p.y-drag.y;if(Math.hypot(dx,dy)>5)drag.moved=true;const k=scale();cx=drag.cx-dx/k;cy=drag.cy-dy/k;clampView();}});
canvas.addEventListener('pointerup',e=>{if(drag&&!drag.moved){const p=unproject(...Object.values(mouse(e))),l=currentMap();if(p[0]>=l.bounds[0]&&p[1]>=l.bounds[1]&&p[0]<=l.bounds[0]+l.bounds[2]&&p[1]<=l.bounds[1]+l.bounds[3]){pin={world:selected,x:p[0],y:p[1]};try{localStorage.setItem('chemscape-atlas-pin',JSON.stringify(pin));}catch{}updatePin();}}drag=null;});
canvas.addEventListener('pointercancel',()=>drag=null);canvas.addEventListener('pointerleave',()=>hover=null);
canvas.addEventListener('wheel',e=>{e.preventDefault();const p=mouse(e);setZoom(zoom*Math.exp(-e.deltaY*.0015),[p.x,p.y]);},{passive:false});
function mouse(e){const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*CW/r.width,y:(e.clientY-r.top)*CH/r.height};}
$('atlas-close').onclick=()=>E.openPanel(null);$('atlas-plus').onclick=()=>setZoom(zoom*1.35);$('atlas-minus').onclick=()=>setZoom(zoom/1.35);$('atlas-fit').onclick=fit;
$('atlas-fit').textContent='';{const im=document.createElement('img');im.src=E.assetPath(V.ui.map);im.alt='';im.style.cssText='width:19px;height:19px;object-fit:contain;image-rendering:pixelated';$('atlas-fit').append(im);}
$('atlas-current').onclick=()=>{const s=E.atlasState();selectWorld(s.level?.id||'world1');if(s.player){cx=s.player.x;cy=s.player.y;zoom=2.5;clampView();}};
$('atlas-clear-pin').onclick=()=>{pin=null;try{localStorage.removeItem('chemscape-atlas-pin');}catch{}updatePin();};
$('atlas-search').oninput=e=>{filter=e.target.value;renderRegions();};$('atlas-interior').onchange=e=>{if(e.target.value)selectWorld(e.target.value);};
for(const b of panel.querySelectorAll('[data-atlas-world]'))b.onclick=()=>selectWorld(b.dataset.atlasWorld);
for(const b of panel.querySelectorAll('[data-atlas-chapter]'))b.onclick=()=>E.navigateWorld(b.dataset.atlasChapter);
for(const box of panel.querySelectorAll('[data-atlas-option]'))box.onchange=()=>options[box.dataset.atlasOption]=box.checked;
$('mini').setAttribute('role','button');$('mini').setAttribute('tabindex','0');$('mini').setAttribute('aria-label','Abrir mapa global');$('mini').onclick=()=>{if(E.atlasState().screen==='playing')E.openPanel('maps');};$('mini').onkeydown=e=>{if(e.code==='Enter'||e.code==='Space'){e.preventDefault();E.openPanel('maps');}};
try{const saved=JSON.parse(localStorage.getItem('chemscape-atlas-pin'));if(saved&&worlds()[saved.world]&&Number.isFinite(saved.x)&&Number.isFinite(saved.y))pin=saved;}catch{}
const typography=document.createElement('div');typography.className='interface-fonts';typography.innerHTML='<label for="interface-font">Fonte da interface</label><select id="interface-font"><option value="sans">Clara</option><option value="serif">Crônicas</option><option value="mono">Terminal</option></select>';$('journal').querySelector('.panel').append(typography);
function font(value){$('game-shell').dataset.font=['sans','serif','mono'].includes(value)?value:'sans';}
try{font(localStorage.getItem('chemscape-ui-font'));}catch{}$('interface-font').value=$('game-shell').dataset.font;$('interface-font').onchange=e=>{font(e.target.value);try{localStorage.setItem('chemscape-ui-font',e.target.value);}catch{}};
function loop(now){requestAnimationFrame(loop);if(now-lastRender<1000/20)return;lastRender=now;if(!panel.classList.contains('hidden')){render();updatePin();}if(E.atlasState().screen==='journal')refreshIdentity();}
window.CHEMSCAPE_ATLAS={open,minimap,refreshIdentity,render,selectWorld,get state(){return {selected,zoom,cx,cy,pin:pin?{...pin}:null,cache:cache.size,thumbnails:thumbs.size,pendingThumbnails:thumbPending+thumbQueue.length};}};refreshIdentity();requestAnimationFrame(loop);
})();
