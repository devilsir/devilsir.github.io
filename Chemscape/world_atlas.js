(() => {
'use strict';
const E=window.CHEMSCAPE_ENGINE,V=window.CHEMSCAPE_V7;if(!E||!V)return;
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const worlds=()=>({...E.levels().worlds,...E.levels().rooms}),meta=window.CHEMSCAPE_ASSET_META,cache=new Map();
const regionNames={orchard:'Pomar Experimental',aion:'Complexo AION',city:'Nova Aurora',military:'Base Sentinela',forest:'Floresta Alterada',rupture:'Zona da Ruptura',frontier:'Fronteira do Conflito',human:'Ponteclara',goblin:'Liga do Cobre',lunar:'Bosque Lunargênteo',blood:'Academia Rubra',sanctuary:'Santuário de Maera',orc:'Vale da Forja',troll:'Aldeia das Marés',tauren:'Planícies de Âmbar',ruins:'Ruínas do Limiar'};
let selected='world1',zoom=1,cx=3360,cy=1920,drag=null,pin=null,hover=null,filter='',identity='',lastRender=0;
const options={npcs:true,drops:true,hostile:false,regions:true,services:true,resources:true,quests:true,portals:true};
let keyFocus=null,keyUntil=0;
const panel=$('maps');panel.classList.add('atlas-overlay');panel.innerHTML=[
 '<div class="atlas-panel"><header class="atlas-header"><div><div class="eyebrow">CADERNO DE ELIAS · CARTOGRAFIA</div><h2>Mapa da Convergência</h2></div><button id="atlas-close" class="atlas-close" aria-label="Fechar mapa">×</button></header>',
 '<div class="atlas-tabs"><button data-atlas-world="world1"><img src="'+E.assetPath(V.ui.science)+'" alt="">Terra · Nova Aurora</button><button data-atlas-world="alchemy"><img src="'+E.assetPath(V.ui.alchemy)+'" alt="">Vitrália · Duas Leis</button><select id="atlas-interior" aria-label="Mapas de interiores"><option value="">Interiores…</option></select><button id="atlas-current">Você está aqui</button></div>',
 '<div class="atlas-content"><div class="atlas-stage"><canvas id="atlas-canvas" width="960" height="540" aria-label="Mapa global explorável"></canvas><div class="atlas-compass"><img src="'+E.assetPath(V.ui.compass)+'" alt=""><span>N</span></div><div class="atlas-zoom"><button id="atlas-plus" aria-label="Aumentar zoom">+</button><button id="atlas-minus" aria-label="Diminuir zoom">−</button><button id="atlas-fit" aria-label="Mostrar mapa completo">⌖</button><span id="atlas-zoom-label">100%</span></div><canvas id="atlas-overview" width="146" height="84" aria-label="Visão geral do mapa"></canvas><div id="atlas-tooltip"></div></div><aside class="atlas-side"><div class="atlas-side-heading">LUGARES E TERRITÓRIOS</div><input id="atlas-search" placeholder="Lugar, NPC ou recurso…" aria-label="Buscar lugares, NPCs e recursos"><div id="atlas-regions"></div><div class="atlas-legend"><label><input data-atlas-option="npcs" type="checkbox" checked><i class="atlas-dot npc"></i>Habitantes e serviços</label><label><input data-atlas-option="drops" type="checkbox" checked><i class="atlas-dot drop"></i>Drops e colheitas</label><label><input data-atlas-option="hostile" type="checkbox"><i class="atlas-dot enemy"></i>Criaturas hostis</label><label><input data-atlas-option="regions" type="checkbox" checked> Nomes das regiões</label></div><button id="atlas-clear-pin">Remover marcador</button><div id="atlas-pin-text">Clique no mapa para marcar um destino.</div></aside></div>',
 '<footer class="atlas-footer"><span>Arraste para explorar · Roda: zoom · Clique: marcar destino</span><span id="atlas-world-label"></span></footer><div class="atlas-chapters"><span>CAPÍTULOS</span><button data-atlas-chapter="intro">00 · Laboratório AION</button><button data-atlas-chapter="world1">01 · O Véu</button><button data-atlas-chapter="alchemy">02 · Vitrália</button><span class="future-chapter">Arquipélago · Em breve</span><span class="future-chapter">Terras Desconhecidas · Em breve</span></div></div>'
].join('');
const canvas=$('atlas-canvas'),c=canvas.getContext('2d'),CW=960,CH=540;let pixelRatio=1,detailDraws=0;
function currentMap(){return worlds()[selected];}
const thumbs=new Map(),thumbQueue=[];let thumbPending=0;function pumpThumbs(){while(thumbPending<8&&thumbQueue.length){const r=thumbQueue.shift();thumbPending++;r.img.onload=()=>{r.ready=true;thumbPending--;pumpThumbs();};r.img.onerror=()=>{r.failed=true;thumbPending--;pumpThumbs();};r.img.src=E.assetPath(r.file);}}function image(file){if(!file)return null;if(!file.includes('/thumbnails/'))return E.image(file);let r=thumbs.get(file);if(!r){r={file,img:new Image(),ready:false,failed:false};thumbs.set(file,r);thumbQueue.push(r);pumpThumbs();while(thumbs.size>192){const key=[...thumbs].find(([k,v])=>v.ready&&k!==file)?.[0];if(!key)break;thumbs.delete(key);}}return r;}
function fit(){const l=currentMap();if(!l)return;zoom=1;cx=l.bounds[0]+l.bounds[2]/2;cy=l.bounds[1]+l.bounds[3]/2;}
function scale(){const l=currentMap();return l?Math.min((CW-44)/l.bounds[2],(CH-44)/l.bounds[3])*zoom:1;}
function project(x,y){const k=scale();return [CW/2+(x-cx)*k,CH/2+(y-cy)*k];}
function unproject(x,y){const k=scale();return [cx+(x-CW/2)/k,cy+(y-CH/2)/k];}
function setZoom(value,point=[CW/2,CH/2]){const p=unproject(...point);zoom=Math.max(1,Math.min(7,value));const k=scale();cx=p[0]-(point[0]-CW/2)/k;cy=p[1]-(point[1]-CH/2)/k;clampView();}
function clampView(){const l=currentMap();if(!l)return;const [x,y,w,h]=l.bounds,k=scale(),hx=CW/(2*k),hy=CH/(2*k);cx=w<=hx*2?x+w/2:Math.max(x+hx,Math.min(x+w-hx,cx));cy=h<=hy*2?y+h/2:Math.max(y+hy,Math.min(y+h-hy,cy));}
function resizeCanvas(){const r=canvas.getBoundingClientRect(),dpr=Math.min(2,Math.max(1,window.devicePixelRatio||1)),w=Math.max(960,Math.min(3840,Math.round(r.width*dpr))),h=Math.max(540,Math.min(2160,Math.round(r.height*dpr)));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}pixelRatio=Math.max(w/CW,h/CH);}
function repairGround(g,l){const patch=l.puzzleBridge?.groundRepair,file=patch&&l.floor?.files?.[patch.tile],r=file&&image(file);if(r?.ready)g.drawImage(r.img,...patch.source,...patch.bounds);}
function drawBridge(g,l){const b=l.puzzleBridge;if(!b||!b.decorative&&!E.atlasState().campaign.limiarPuzzle)return;const x=b.x-b.w/2,y=b.y-b.h/2;g.fillStyle='#624932';g.fillRect(x,y,b.w,b.h);for(let i=3;i<b.h-3;i+=16){g.fillStyle='#ae8750';g.fillRect(x+4,y+i,b.w-8,13);g.fillStyle='#c69d63';g.fillRect(x+5,y+i,b.w-10,2);}g.fillStyle='#513e2a';g.fillRect(x+3,y+2,7,b.h-4);g.fillRect(x+b.w-10,y+2,7,b.h-4);}
function drawDetail(g,l,k){
 const v={x:cx-CW/2/k,y:cy-CH/2/k,w:CW/k,h:CH/k},size=l.floor?.size||512;detailDraws=0;
 for(const [key,file]of Object.entries(l.floor?.files||{})){const [x,y]=key.split(',').map(n=>+n*size);if(x>v.x+v.w||y>v.y+v.h||x+size<v.x||y+size<v.y)continue;const r=image(file);if(r?.ready){g.drawImage(r.img,x,y,size,size);detailDraws++;}}
 repairGround(g,l);
 for(const [key,t]of Object.entries(l.paint?.tiles||{}).sort((a,b)=>(a[1].order||0)-(b[1].order||0))){const [size,x,y]=key.split(':').map(Number),r={x:x*size,y:y*size,w:size,h:size};if(r.x>v.x+v.w||r.y>v.y+v.h||r.x+r.w<v.x||r.y+r.h<v.y)continue;g.save();if(t.circle){g.beginPath();g.arc(...t.circle,0,Math.PI*2);g.clip();}if(t.texture)window.CHEMSCAPE_FLOOR_TEXTURES.draw(g,t.texture,r);else{g.fillStyle=t.color;g.fillRect(r.x,r.y,r.w,r.h);}g.restore();}
 drawBridge(g,l);
 for(const o of [...l.objects].sort((a,b)=>(a.depthY??a.y)-(b.depthY??b.y))){if(o.hidden||o.x<v.x-600||o.x>v.x+v.w+600||o.y<v.y-600||o.y>v.y+v.h+600)continue;const m=E.levels().sprites[o.sprite],r=m&&image(m.file);if(!r?.ready)continue;const f=m.sheet?.animations?.idle?.[0]||0,z=(m.scale||1)*(o.scale||1);g.save();g.translate(Math.round(o.x),Math.round(o.y));g.rotate((o.rotation||0)*Math.PI/180);g.scale(o.flipX?-z:z,o.flipY?-z:z);window.CHEMSCAPE_SPRITES.draw(g,r.img,m,f);g.restore();}
}
function base(l){
 const state=E.atlasState();let rec=cache.get(l.id);if(rec&&rec.level===l&&rec.revision===state.revision&&rec.complete&&rec.textureGeneration===(window.CHEMSCAPE_FLOOR_TEXTURES?.generation||0))return rec;
 const k=Math.min(2048/l.bounds[2],1400/l.bounds[3],1),im=document.createElement('canvas');im.width=Math.ceil(l.bounds[2]*k);im.height=Math.ceil(l.bounds[3]*k);
 const g=im.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle=l.world==='science'?'#6c8556':'#758c5b';g.fillRect(0,0,im.width,im.height);g.scale(k,k);g.translate(-l.bounds[0],-l.bounds[1]);let complete=true;
 const floor=image(l.floor?.overview);if(floor?.ready)g.drawImage(floor.img,...l.bounds);else if(floor&&!floor.failed)complete=false;
 repairGround(g,l);if(l.paint?.tiles)for(const [key,t]of Object.entries(l.paint.tiles).sort((a,b)=>(a[1].order||0)-(b[1].order||0))){const [s,x,y]=key.split(':').map(Number);g.save();if(t.circle){g.beginPath();g.arc(...t.circle,0,Math.PI*2);g.clip();}if(t.texture&&window.CHEMSCAPE_FLOOR_TEXTURES){if(!window.CHEMSCAPE_FLOOR_TEXTURES.draw(g,t.texture,{x:x*s,y:y*s,w:s,h:s}))complete=false;}else{g.fillStyle=t.color;g.fillRect(x*s,y*s,s,s);}g.restore();}
 for(const o of [...l.objects].sort((a,b)=>(a.depthY??a.y)-(b.depthY??b.y))){if(o.hidden||o.kind==='flower')continue;const m=E.levels().sprites[o.sprite],r=image(m?.file);if(!r?.ready){if(r&&!r.failed)complete=false;continue;}const sh=m.sheet,frame=sh?.animations?.idle?.[0]||0,cell=window.CHEMSCAPE_SPRITES.cell(m,frame),a=window.CHEMSCAPE_SPRITES.anchor(m,frame),z=(m.scale||1)*(o.scale||1);g.save();g.translate(o.x,o.y);g.rotate((o.rotation||0)*Math.PI/180);g.scale(o.flipX?-z:z,o.flipY?-z:z);window.CHEMSCAPE_SPRITES.draw(g,r.img,m,frame,a);g.restore();}
 drawBridge(g,l);
 rec={canvas:im,k,complete,level:l,revision:state.revision,textureGeneration:window.CHEMSCAPE_FLOOR_TEXTURES?.generation||0};if(cache.has(l.id))cache.get(l.id).canvas.width=0;cache.delete(l.id);cache.set(l.id,rec);
 while(cache.size>3){const key=cache.keys().next().value;cache.get(key).canvas.width=0;cache.delete(key);}return rec;
}
const kinds={
 npc:{name:'Habitantes',color:'#ffe26c',group:'npcs',glyph:'M -2 -2 H 2 V 2 H -2 Z'},
 enemy:{name:'Inimigos',color:'#fb7465',group:'hostile',glyph:'M -4 -4 L 4 4 M 4 -4 L -4 4'},
 drop:{name:'Itens no chão',color:'#f6f0d8',group:'drops',glyph:'M -3 -3 H 3 V 3 H -3 Z'},
 quest:{name:'Missões',color:'#ffd665',group:'quests',glyph:'M -3 -5 H 3 V 5 H -3 Z M 0 -3 V 1 M 0 3 V 4'},
 portal:{name:'Portais',color:'#c3a2ff',group:'portals',glyph:'M 0 -5 L 4 0 L 0 5 L -4 0 Z M 0 -2 V 2'},
 door:{name:'Entradas',color:'#e7c99d',group:'portals',glyph:'M -4 5 V -4 H 4 V 5 M 1 0 H 2'},
 shop:{name:'Loja e banco',color:'#f4c66c',group:'services',glyph:'M -4 -2 H 4 V 4 H -4 Z M -3 -4 H 3 M 0 -1 V 3'},
 clinic:{name:'Cuidados',color:'#eaaa9f',group:'services',glyph:'M 0 -5 V 5 M -5 0 H 5'},
 mining:{name:'Mineração',color:'#d5d5d0',group:'resources',glyph:'M -4 5 L 3 -3 M -4 -3 Q 0 -6 5 0'},
 herblore:{name:'Ervas',color:'#a6d37f',group:'resources',glyph:'M -3 4 Q -5 -4 4 -5 Q 6 2 -3 4 M -3 4 L 2 -2'},
 fishing:{name:'Pesca',color:'#a1d7ed',group:'resources',glyph:'M -5 0 Q 0 -6 4 0 Q 0 6 -5 0 Z M 4 0 L 6 -3 V 3 Z'},
 forge:{name:'Forja',color:'#cfcbc0',group:'services',glyph:'M -5 -4 H 5 L 2 -1 H -1 V 3 H 3 V 5 H -4 V 3 H -2 V -1 Z'},
 bench:{name:'Bancada',color:'#addae0',group:'services',glyph:'M -1 -5 H 2 M 0 -5 V -1 L -4 4 H 5 L 1 -1 V -5 M -2 2 H 3'},
 science:{name:'Investigação',color:'#96dbe0',group:'quests',glyph:'M -4 -5 H 3 V 5 H -4 Z M -2 -2 H 1 M -2 1 H 1'}
};
const glyphPaths=new Map();
function symbol(type){const d=kinds[type]||kinds.npc;return '<span class="rs-map-icon"><svg viewBox="-8 -8 16 16" aria-hidden="true"><path d="'+d.glyph+'" fill="none" stroke="'+d.color+'" stroke-width="1.7" stroke-linejoin="round"/></svg></span>';}
function diamond(g,x,y,size,color){g.fillStyle=color;g.beginPath();g.moveTo(x,y-size);g.lineTo(x+size,y);g.lineTo(x,y+size);g.lineTo(x-size,y);g.closePath();g.fill();}
function markers(l,all=false){
 const s=E.atlasState(),live=s.level?.id===l.id,items=[];
 const add=(o,type,label,destination)=>{const info=kinds[type]||kinds.npc;if(!all&&!options[info.group])return null;const m={x:o.x,y:o.y,type,label:label||info.name,color:info.color,destination,id:o.id||type+':'+o.x+':'+o.y};items.push(m);return m;};
 for(const n of (live?s.npcs:l.npcs)||[]){if(n.hidden||n.animal||n.companion)continue;const accepted=n.legendId&&s.campaign['legend-accepted-'+n.legendId],complete=n.legendId&&s.campaign['legend-complete-'+n.legendId];
  const type=n.legendId&&!complete?'quest':n.service==='shop'?'shop':n.service==='clinic'?'clinic':'npc',m=add(n,type,(n.name||'Habitante')+(n.legendId&&!complete?(accepted?' · missão em andamento':' · oferece uma missão'):n.service==='shop'?' · loja e banco':''));if(m&&accepted&&!complete)m.color='#a9d3ff';
 }
 for(const n of (live?s.enemies:l.mobs)||[])if(!n.hidden&&n.hostile&&n.hp!==0&&(n.respawn||0)<=0)add(n,'enemy',n.definition?.name||n.prettyName||n.name||window.CHEMSCAPE_RPG.data.monsters[n.definitionId]?.name||'Criatura hostil');
 for(const p of (live?s.pickups:l.pickups)||[])if(!p.done&&!p.hidden&&!(s.campaign.fieldItems||[]).includes(p.id))add(p,'drop',p.name||'Item no chão');
 for(const o of l.objects||[]){if(o.hidden)continue;
  if(o.skillNode)add(o,o.skillNode.skill,o.name);else if(o.skillStation)add(o,o.skillStation==='forge'?'forge':'bench',o.name);else if(o.expScan)add(o,'science',o.name);else if(o.harvest&&!(s.campaign.fieldItems||[]).includes('harvest:'+o.id))add(o,'herblore','Colher '+o.harvest.name);
  if(o.connection&&(!o.connection.requiresFlag||s.campaign[o.connection.requiresFlag]||E.editMode()))add(o,o.connection.type==='portal'?'portal':'door',(o.name||'Passagem')+' → '+(worlds()[o.connection.target]?.name||'Destino'),o.connection.target);
  else if(o.enter){const p=o.door||[o.x,o.y];add({...o,x:p[0],y:p[1]},'door',(o.name||'Entrada')+' → '+(worlds()[o.enter]?.name||'Interior'),o.enter);}
 }
 for(const p of (live?s.samples:l.samples)||[])if(!p.done&&(p.id.startsWith('sample')||s.campaign.maeraSpoken)&&!((p.id.startsWith('sample')?s.campaign.samples:s.campaign.anchors)||[]).includes(p.id))add(p,'quest',p.name);
 if(l.portal&&s.campaign.maeraSpoken)add({x:l.portal[0],y:l.portal[1]},'portal',l.world==='science'?'Portal para Vitrália':'Portal para o AION',l.world==='science'?'alchemy':'world1');
 if(l.labDoor)add({x:l.labDoor[0],y:l.labDoor[1]},'door','Laboratório AION');
 if(l.exit)add({x:l.exit[0],y:l.exit[1]},'door','Saída → '+(worlds()[l.parent]?.name||'Exterior'),l.parent);
 if(l.id==='world1'&&!s.campaign.crystalFound){const p=s.campaign.slimeDefeated?l.crystal:l.slime;if(p)add({x:p[0],y:p[1]},'quest',s.campaign.slimeDefeated?'Cristal de Limiar':'Criatura anômala');}
 return items;
}
function drawMark(g,p,size=7){
 const type=p.type,d=kinds[type]||kinds.npc;g.save();g.translate(Math.round(p.x),Math.round(p.y));
 if(['npc','enemy','drop'].includes(type)){g.fillStyle='#161710';g.fillRect(-size-1,-size-1,size*2+2,size*2+2);g.fillStyle=p.color||d.color;g.fillRect(-size,-size,size*2,size*2);g.restore();return;}
 if(keyFocus===d.group&&performance.now()<keyUntil&&Math.floor(performance.now()/220)%2===0){g.strokeStyle='#fff0a4';g.lineWidth=2;g.beginPath();g.arc(0,0,size+5,0,Math.PI*2);g.stroke();}
 g.fillStyle='#29251deb';g.fillRect(-size-2,-size-2,size*2+4,size*2+4);g.strokeStyle='#bfa377';g.lineWidth=1;g.strokeRect(-size-2,-size-2,size*2+4,size*2+4);g.scale(size/6,size/6);g.strokeStyle=p.color||d.color;g.lineWidth=1.7;g.lineJoin='round';
 if(!glyphPaths.has(type))glyphPaths.set(type,new Path2D(d.glyph));g.stroke(glyphPaths.get(type));g.restore();
}

function drawPlayer(g,x,y,heading,size=8){
 g.save();g.translate(x,y);g.rotate(heading);g.strokeStyle='#132d38';g.lineWidth=2;g.fillStyle='#fff5d2';g.beginPath();g.moveTo(size+2,0);g.lineTo(-size*.6,-size*.65);g.lineTo(-size*.3,0);g.lineTo(-size*.6,size*.65);g.closePath();g.fill();g.stroke();g.restore();
}
function regionLabel(r){return regionNames[r.id]||r.name.split('·')[0].trim();}
function renderRegions(){
 const l=currentMap();if(!l)return;const f=filter.toLocaleLowerCase(),entries=[];
 for(const r of l.regions||[])entries.push({map:l.id,x:r.center?.[0]??r.bounds[0]+r.bounds[2]/2,y:r.center?.[1]??r.bounds[1]+r.bounds[3]/2,label:regionLabel(r),kind:'region',detail:'Região · '+l.name,region:r});
 if(f)for(const map of Object.values(worlds()).filter(m=>E.allowedScene(m.id)||m.id===E.current()))for(const m of markers(map,true))entries.push({map:map.id,...m,kind:m.type,detail:kinds[m.type].name+' · '+map.name});
 const found=entries.filter(e=>(e.label+' '+e.detail).toLocaleLowerCase().includes(f)).slice(0,30);
 $('atlas-regions').innerHTML=found.length?found.map((e,i)=>'<button data-atlas-result="'+i+'">'+symbol(e.kind==='region'?'door':e.kind)+'<span>'+esc(e.label)+'<small>'+esc(e.detail)+'</small></span></button>').join(''):'<p class="cs-help">Nenhum lugar encontrado.</p>';
 for(const button of $('atlas-regions').querySelectorAll('[data-atlas-result]'))button.onclick=()=>{const e=found[Number(button.dataset.atlasResult)];selected=e.map;cx=e.x;cy=e.y;zoom=e.region?Math.max(1.5,Math.min(5,Math.min(l.bounds[2]/(e.region.bounds[2]*1.5),l.bounds[3]/(e.region.bounds[3]*1.5)))):3;pin={world:e.map,x:e.x,y:e.y,label:e.label};savePin();updateTabs();clampView();updatePin();render();};
}
function selectWorld(id){if(!worlds()[id])return;selected=id;fit();filter='';$('atlas-search').value='';renderRegions();updateTabs();}
function updateTabs(){
 for(const b of panel.querySelectorAll('[data-atlas-world]')){b.classList.toggle('active',b.dataset.atlasWorld===selected);b.disabled=!E.allowedScene(b.dataset.atlasWorld);}
 for(const b of panel.querySelectorAll('[data-atlas-chapter]'))b.disabled=!E.allowedScene(b.dataset.atlasChapter);
 $('atlas-interior').value=E.levels().rooms[selected]?selected:'';$('atlas-world-label').textContent=currentMap()?.name||'';
}
function open(){const s=E.atlasState();selectWorld(s.level?.id||'world1');refreshIdentity();const interiors=$('atlas-interior');interiors.innerHTML='<option value="">Interiores…</option>'+Object.entries(E.levels().rooms).filter(([id,l])=>E.allowedScene(id)).map(([id,l])=>'<option value="'+id+'">'+esc(l.name)+'</option>').join('');interiors.value=E.levels().rooms[selected]?selected:'';render();}
function refreshIdentity(){
 const s=E.atlasState(),kind=s.level?.world==='alchemy'?'alchemy':'science';if(kind!==identity){identity=kind;const portrait=document.querySelector('#hud .portrait img:not(.portraitBorder)');if(portrait)portrait.src=E.assetPath(kind==='alchemy'?V.portraitAlchemy:'ui/portraits/player/scientist.png');$('game-shell').dataset.realm=kind;}
 for(const [index,key]of V.skills.entries()){const button=document.querySelector('.skill[data-skill="'+['one','two','three','four','five','six','seven','eight','nine'][index]+'"]');if(button&&!button.querySelector('img')){const icon=button.querySelector('b');icon.textContent='';const im=document.createElement('img');im.src=E.assetPath(V.ui[key]);im.alt='';icon.append(im);button.setAttribute('aria-label',button.title);}}
 for(const [id,key]of Object.entries({btnAudio:'sound',btnJournal:'journal',btnMap:'map',btnPause:'pause',touchAttack:'attack',touchSkill:'catalysis'})){const button=$(id);if(!button||button.querySelector('img'))continue;button.textContent='';const im=document.createElement('img');im.src=E.assetPath(V.ui[key]);im.alt='';button.append(im);}
 const editor=$('btnEditor');if(editor&&!editor.querySelector('img')){const im=document.createElement('img');im.src=E.assetPath(V.ui.editor);im.alt='';editor.prepend(im);}
 for(const [i,b]of [...document.querySelectorAll('#skillGuide .guide-skill > b')].entries())if(V.skills[i]&&!b.querySelector('img')){b.textContent='';const im=document.createElement('img');im.src=E.assetPath(V.ui[V.skills[i]]);im.alt='';b.append(im);}
}
function render(){
 const l=currentMap();if(!l)return;resizeCanvas();const s=E.atlasState(),k=scale(),r=base(l);c.setTransform(canvas.width/CW,0,0,canvas.height/CH,0,0);c.clearRect(0,0,CW,CH);c.fillStyle='#101f27';c.fillRect(0,0,CW,CH);c.imageSmoothingEnabled=false;const labelBoxes=[],mapMarkers=markers(l);
 c.save();c.translate(CW/2,CH/2);c.scale(k,k);c.translate(-cx,-cy);c.drawImage(r.canvas,...l.bounds);if(k*pixelRatio>.4)drawDetail(c,l,k);else detailDraws=0;c.strokeStyle='#d2d3a7aa';c.lineWidth=2/k;c.strokeRect(...l.bounds);c.restore();
 if(options.regions)for(const reg of l.regions||[]){const x=reg.center?.[0]??reg.bounds[0]+reg.bounds[2]/2,y=reg.center?.[1]??reg.bounds[1]+reg.bounds[3]/2,[px,py]=project(x,y);if(px<-80||py<-30||px>CW+80||py>CH+30)continue;
  const text=regionLabel(reg).toUpperCase();c.font='bold 14px Arial';const w=c.measureText(text).width;
  let box=null;for(const shift of [-30,-58,8,-86,36]){const q={x:px-w/2-8,y:py+shift,w:w+16,h:22};if(q.y<4||q.y+q.h>CH-4)continue;if(labelBoxes.some(b=>q.x<b.x+b.w+5&&q.x+q.w+5>b.x&&q.y<b.y+b.h+4&&q.y+q.h+4>b.y))continue;if(mapMarkers.some(m=>{const p=project(m.x,m.y);return p[0]>=q.x-9&&p[0]<=q.x+q.w+9&&p[1]>=q.y-9&&p[1]<=q.y+q.h+9;}))continue;box=q;break;}if(!box)continue;
  labelBoxes.push(box);c.fillStyle='#2d281de8';c.beginPath();c.roundRect(box.x,box.y,box.w,box.h,4);c.fill();c.textAlign='center';c.fillStyle='#f4efd0';c.fillText(text,px,box.y+16);
 }
 for(const item of mapMarkers){const p=project(item.x,item.y);if(p[0]<-8||p[0]>CW+8||p[1]<-8||p[1]>CH+8)continue;drawMark(c,{...item,x:p[0],y:p[1]},['npc','enemy','drop'].includes(item.type)?3:7);}
 if(s.level?.id===l.id&&s.player){const p=project(s.player.x,s.player.y);c.strokeStyle='#faf4c54f';c.lineWidth=1.5;c.beginPath();c.arc(...p,13+Math.sin(performance.now()*.003)*2,0,Math.PI*2);c.stroke();drawPlayer(c,...p,s.player.heading||0);}
 if(pin?.world===l.id){const p=project(pin.x,pin.y);diamond(c,...p,8,'#ffe491');c.strokeStyle='#352c33';c.strokeRect(p[0]-2,p[1]-2,4,4);}
 renderOverview(l,r);$('atlas-zoom-label').textContent=Math.round(zoom*100)+'%';
 if(hover){const p=unproject(hover.x,hover.y);const nearest=markers(l).map(m=>({...m,d:Math.hypot(...project(m.x,m.y).map((v,i)=>v-[hover.x,hover.y][i]))})).filter(m=>m.d<13).sort((a,b)=>a.d-b.d)[0];$('atlas-tooltip').textContent=nearest?nearest.label+(nearest.destination?' · Duplo clique: ver destino':''):Math.round(p[0])+' · '+Math.round(p[1]);$('atlas-tooltip').style.display='block';}else $('atlas-tooltip').style.display='none';
}
function minimap(){
 const s=E.atlasState(),l=s.level;if(!l||!s.player)return;const mini=$('minimap'),g=mini.getContext('2d'),n=mini.width,mid=n/2,range=l.parent?1250:1500,k=n/range,r=base(l),radius=mid-5;
 g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,n,n);g.save();g.beginPath();g.arc(mid,mid,radius,0,Math.PI*2);g.clip();g.fillStyle='#293127';g.fillRect(0,0,n,n);g.imageSmoothingEnabled=false;
 g.save();g.translate(mid,mid);g.scale(k,k);g.translate(-s.player.x,-s.player.y);g.drawImage(r.canvas,...l.bounds);g.restore();
 const all=markers(l,true).sort((a,b)=>Number(['npc','drop','enemy'].includes(b.type))-Number(['npc','drop','enemy'].includes(a.type))),occupied=[];
 for(const item of all){const x=mid+(item.x-s.player.x)*k,y=mid+(item.y-s.player.y)*k;if(Math.hypot(x-mid,y-mid)>radius-10)continue;const actor=['npc','enemy','drop'].includes(item.type);if(!actor&&occupied.some(p=>Math.hypot(p.x-x,p.y-y)<14))continue;drawMark(g,{...item,x,y},actor?item.type==='enemy'?3:2:6);if(!actor)occupied.push({x,y});}
 if(pin?.world===l.id){let x=(pin.x-s.player.x)*k,y=(pin.y-s.player.y)*k;const d=Math.hypot(x,y);if(d>radius-13){x*=(radius-13)/d;y*=(radius-13)/d;}diamond(g,mid+x,mid+y,6,'#ffe397');}
 drawPlayer(g,mid,mid,s.player.heading||0,7);g.restore();g.strokeStyle='#b79a62';g.lineWidth=4;g.beginPath();g.arc(mid,mid,radius,0,Math.PI*2);g.stroke();g.fillStyle='#30281f';g.fillRect(mid-10,3,20,17);g.font='bold 13px Arial';g.fillStyle='#ffe3a2';g.textAlign='center';g.fillText('N',mid,16);
 const title=$('mini').querySelector('span');if(title)title.innerHTML='MAPA <kbd>M</kbd> · '+(l.world==='science'?'TERRA':'VITRÁLIA');
}
function savePin(){try{localStorage.setItem('chemscape-atlas-pin',JSON.stringify(pin));}catch{}}
function renderOverview(l,r){
 const mini=$('atlas-overview'),g=mini.getContext('2d'),w=mini.width,h=mini.height,k=Math.min(w/l.bounds[2],h/l.bounds[3]),ox=(w-l.bounds[2]*k)/2,oy=(h-l.bounds[3]*k)/2;
 g.clearRect(0,0,w,h);g.fillStyle='#30281f';g.fillRect(0,0,w,h);g.imageSmoothingEnabled=false;g.drawImage(r.canvas,ox,oy,l.bounds[2]*k,l.bounds[3]*k);
 g.strokeStyle='#ffe49b';g.lineWidth=2;g.strokeRect(ox+(cx-CW/2/scale()-l.bounds[0])*k,oy+(cy-CH/2/scale()-l.bounds[1])*k,CW/scale()*k,CH/scale()*k);
}
function updatePin(){const s=E.atlasState(),text=$('atlas-pin-text');if(!pin){text.textContent='Clique para marcar. Duplo clique nas entradas mostra o mapa conectado.';return;}const distance=s.level?.id===pin.world&&s.player?Math.round(Math.hypot(pin.x-s.player.x,pin.y-s.player.y)/32)+' m':'Outro mapa';text.textContent=(pin.label||'Destino')+': '+Math.round(pin.x)+' · '+Math.round(pin.y)+' — '+distance;}
const legend=panel.querySelector('.atlas-legend');legend.className='rs-map-key';legend.innerHTML=[['quests','quest','Missões e pesquisa'],['npcs','npc','Habitantes'],['services','shop','Lojas, bancos e oficinas'],['resources','mining','Mineração, ervas e pesca'],['portals','portal','Portais e entradas'],['drops','drop','Itens no chão'],['hostile','enemy','Inimigos'],['regions','door','Nomes das regiões']].map(([id,type,name])=>'<label><input data-atlas-option="'+id+'" type="checkbox" '+(options[id]?'checked':'')+'>'+symbol(type)+name+'</label>').join('');
$('atlas-overview').onclick=e=>{const l=currentMap(),r=$('atlas-overview').getBoundingClientRect(),k=Math.min(146/l.bounds[2],84/l.bounds[3]),ox=(146-l.bounds[2]*k)/2,oy=(84-l.bounds[3]*k)/2;cx=l.bounds[0]+((e.clientX-r.left)*146/r.width-ox)/k;cy=l.bounds[1]+((e.clientY-r.top)*84/r.height-oy)/k;clampView();render();};
canvas.addEventListener('dblclick',e=>{const p=mouse(e),m=markers(currentMap(),true).find(m=>m.destination&&Math.hypot(...project(m.x,m.y).map((v,i)=>v-[p.x,p.y][i]))<18);if(m&&worlds()[m.destination])selectWorld(m.destination);});
canvas.addEventListener('pointerdown',e=>{const p=mouse(e);drag={x:p.x,y:p.y,cx,cy,moved:false,id:e.pointerId};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{const p=mouse(e);hover=p;if(drag){const dx=p.x-drag.x,dy=p.y-drag.y;if(Math.hypot(dx,dy)>5)drag.moved=true;const k=scale();cx=drag.cx-dx/k;cy=drag.cy-dy/k;clampView();}});
canvas.addEventListener('pointerup',e=>{if(drag&&!drag.moved){const point=mouse(e),p=unproject(point.x,point.y),l=currentMap();if(p[0]>=l.bounds[0]&&p[1]>=l.bounds[1]&&p[0]<=l.bounds[0]+l.bounds[2]&&p[1]<=l.bounds[1]+l.bounds[3]){const marker=markers(l,true).find(m=>Math.hypot(...project(m.x,m.y).map((v,i)=>v-[point.x,point.y][i]))<14);pin={world:selected,x:p[0],y:p[1],label:marker?.label||''};try{localStorage.setItem('chemscape-atlas-pin',JSON.stringify(pin));}catch{}updatePin();}}drag=null;});
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
for(const box of panel.querySelectorAll('[data-atlas-option]'))box.onchange=()=>{options[box.dataset.atlasOption]=box.checked;keyFocus=box.dataset.atlasOption;keyUntil=performance.now()+2200;render();};
$('mini').setAttribute('role','button');$('mini').setAttribute('tabindex','0');$('mini').setAttribute('aria-label','Abrir mapa global');$('mini').onclick=()=>{if(E.atlasState().screen==='playing')E.openPanel('maps');};$('mini').onkeydown=e=>{if(e.code==='Enter'||e.code==='Space'){e.preventDefault();E.openPanel('maps');}};
try{const saved=JSON.parse(localStorage.getItem('chemscape-atlas-pin'));if(saved&&worlds()[saved.world]&&Number.isFinite(saved.x)&&Number.isFinite(saved.y))pin=saved;}catch{}
const typography=document.createElement('div');typography.className='interface-fonts';typography.innerHTML='<label for="interface-font">Fonte da interface</label><select id="interface-font"><option value="sans">Clara</option><option value="serif">Crônicas</option><option value="mono">Terminal</option></select>';$('journal').querySelector('.panel').append(typography);
function font(value){$('game-shell').dataset.font=['sans','serif','mono'].includes(value)?value:'sans';}
try{font(localStorage.getItem('chemscape-ui-font'));}catch{}$('interface-font').value=$('game-shell').dataset.font;$('interface-font').onchange=e=>{font(e.target.value);try{localStorage.setItem('chemscape-ui-font',e.target.value);}catch{}};
function loop(now){requestAnimationFrame(loop);if(now-lastRender<1000/20)return;lastRender=now;if(!panel.classList.contains('hidden')){render();updatePin();}if(E.atlasState().screen==='journal')refreshIdentity();}
window.CHEMSCAPE_ATLAS={open,minimap,refreshIdentity,render,selectWorld,setZoom,markers,kinds,drawMark,symbol,get state(){return {selected,zoom,cx,cy,pin:pin?{...pin}:null,cache:cache.size,thumbnails:thumbs.size,pendingThumbnails:thumbPending+thumbQueue.length,resolution:[canvas.width,canvas.height],detailTiles:detailDraws,pixelRatio};}};refreshIdentity();requestAnimationFrame(loop);
})();
