(()=>{
'use strict';
const $=id=>document.getElementById(id),E=()=>window.CHEMSCAPE_ENGINE,C=()=>window.CHEMSCAPE_EDITOR,R=()=>window.CHEMSCAPE_RPG;
const clone=v=>JSON.parse(JSON.stringify(v)),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const maps=()=>({...window.CHEMSCAPE_LEVELS.worlds,...window.CHEMSCAPE_LEVELS.rooms});
const shapes={rectangle:'Retângulo',square:'Quadrado',ellipse:'Oval / circular',hexagon:'Hexágono',l:'Formato L',t:'Formato T',u:'Formato U',cross:'Cruz'};
const materials={tile:['Ladrilho AION','#9eafb1'],metal:['Metal industrial','#637a87'],stone:['Pedra','#8c9996'],wood:['Madeira','#a78155'],grass:['Grama','#718b50'],sand:['Areia','#c7b17a'],crystal:['Cristal','#8d7ea4']};
let pending=null,search='',connectionDraft=null,unitFilter='all';
const patterns=new Map();
function polygon(type,w,h){
 const x=24,y=24,a=w-48,b=h-48;
 let points;
 if(type==='ellipse')points=Array.from({length:64},(_,i)=>[.5+Math.cos(i*Math.PI/32)*.5,.5+Math.sin(i*Math.PI/32)*.5]);
 else if(type==='hexagon')points=[[.25,0],[.75,0],[1,.5],[.75,1],[.25,1],[0,.5]];
 else if(type==='l')points=[[0,0],[.4,0],[.4,.6],[1,.6],[1,1],[0,1]];
 else if(type==='t')points=[[0,0],[1,0],[1,.35],[.65,.35],[.65,1],[.35,1],[.35,.35],[0,.35]];
 else if(type==='u')points=[[0,0],[.3,0],[.3,.65],[.7,.65],[.7,0],[1,0],[1,1],[0,1]];
 else if(type==='cross')points=[[.35,0],[.65,0],[.65,.35],[1,.35],[1,.65],[.65,.65],[.65,1],[.35,1],[.35,.65],[0,.65],[0,.35],[.35,.35]];
 else points=[[0,0],[1,0],[1,1],[0,1]];
 return points.map(p=>[x+p[0]*a,y+p[1]*b]);
}
function contains(l,x,y,r=0){
 const p=l.geometry?.polygon;if(!p)return x>=r&&y>=r&&x<=l.bounds[2]-r&&y<=l.bounds[3]-r;
 let inside=false;
 for(let i=0,j=p.length-1;i<p.length;j=i++){
  const a=p[j],b=p[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));
  if(Math.hypot(x-a[0]-dx*t,y-a[1]-dy*t)<Math.max(r,.001))return false;
  if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside;
}
function freePoint(l,point,r=32){
 if(contains(l,...point,r))return point;
 for(let radius=16;radius<=Math.max(l.bounds[2],l.bounds[3]);radius+=16)for(let i=0;i<24;i++){const x=point[0]+Math.cos(i*Math.PI/12)*radius,y=point[1]+Math.sin(i*Math.PI/12)*radius;if(contains(l,x,y,r))return [Math.round(x),Math.round(y)];}
 for(let y=64;y<l.bounds[3];y+=32)for(let x=64;x<l.bounds[2];x+=32)if(contains(l,x,y,r))return [x,y];
 throw Error('O formato não possui uma área livre para entrada.');
}
function awayPoint(l,point,distance,start=-Math.PI/2){for(let i=0;i<24;i++){const angle=start+i*Math.PI/12,x=point[0]+Math.cos(angle)*distance,y=point[1]+Math.sin(angle)*distance;if(contains(l,x,y,24))return [Math.round(x),Math.round(y)];}throw Error('O raio é grande para esta entrada. Reduza o raio ou afaste a chegada da borda.');}
function trace(ctx,l){ctx.beginPath();l.geometry.polygon.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
function drawFloor(ctx,l,full=false){
 trace(ctx,l);ctx.fillStyle=l.geometry.color;ctx.fill();ctx.strokeStyle=l.environment==='indoor'?'#243945':'#263d2d';ctx.lineWidth=16;ctx.stroke();ctx.clip();
 const key=l.geometry.material+'|'+l.geometry.color;let pattern=patterns.get(key);
 if(!pattern){const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d');g.fillStyle=l.geometry.color;g.fillRect(0,0,32,32);g.fillStyle='#10202a24';
  if(['tile','metal','stone'].includes(l.geometry.material)){g.fillRect(0,0,32,1);g.fillRect(0,0,1,32);g.fillRect(30,29,2,3);g.fillStyle='#ffffff18';g.fillRect(2,2,28,1);}
  else if(l.geometry.material==='wood'){g.fillRect(0,0,32,2);g.fillRect(17,0,1,16);g.fillRect(5,16,1,16);g.fillRect(2,10,12,1);g.fillStyle='#ffffff16';g.fillRect(0,2,32,1);g.fillRect(0,16,32,1);}
  else{g.fillRect(4,4,2,2);g.fillRect(24,17,3,2);g.fillRect(13,25,2,3);g.fillStyle='#ffffff20';g.fillRect(8,18,2,1);g.fillRect(27,6,2,1);}
  pattern=ctx.createPattern(c,'repeat');patterns.set(key,pattern);
 }
 const v=E().view(),x=full?0:Math.max(0,v.x-640/v.zoom),y=full?0:Math.max(0,v.y-360/v.zoom);
 ctx.fillStyle=pattern;ctx.fillRect(x,y,full?l.bounds[2]:Math.min(l.bounds[2]-x,1280/v.zoom),full?l.bounds[3]:Math.min(l.bounds[3]-y,720/v.zoom));
}
function validateMap(l,id,doc){
 if(!l||!/^custom-[\w-]{1,90}$/.test(id)||l.id!==id||l.custom!==true||!['science','alchemy'].includes(l.world)||!['indoor','outdoor'].includes(l.environment)||!doc[l.parent])throw Error('Cenário criado inválido: '+id);
 const seen=new Set([id]);let p=l.parent;
 while(doc[p]?.parent){if(seen.has(p))throw Error('Ciclo entre cenários.');seen.add(p);p=doc[p].parent;}
 if(!doc[p])throw Error('Mundo de origem inexistente.');
 const g=l.geometry;
 if(!g||!shapes[g.type]||!materials[g.material]||!/^#[a-f\d]{6}$/i.test(g.color)||!Array.isArray(g.polygon)||JSON.stringify(g.polygon)!==JSON.stringify(polygon(g.type,l.bounds?.[2],l.bounds?.[3])))throw Error('Formato de cenário inválido.');
 if(!Array.isArray(l.spawn)||l.spawn.length!==2||!contains(l,...l.spawn,16))throw Error('Entrada fora do formato do cenário.');
}
function validateConnection(o,l,doc){
 const c=o.connection,d=doc[c.target],p=c.spawn;
 if(!d||!['door','portal'].includes(c.type)||!['walk','interact'].includes(c.activation)||!Number.isFinite(c.radius)||c.radius<16||c.radius>160||!Array.isArray(p)||p.length!==2||!p.every(Number.isFinite)||!contains(d,...p,16))throw Error('Destino ou entrada da porta/portal inválido.');
 if(!contains(l,o.x,o.y,16))throw Error('Porta fora da área do cenário.');
 if(c.pairId){const pair=(d.objects||[]).find(v=>v.id===c.pairId);if(!pair||pair.connection?.target!==l.id||pair.connection?.pairId!==o.id)throw Error('Conexão de retorno inválida.');}
}
function option(values,value){return Object.entries(values).map(([id,name])=>`<option value="${esc(id)}" ${String(id)===String(value)?'selected':''}>${esc(name)}</option>`).join('');}
function input(id,label,value,type='text',attrs=''){return `<label for="${id}">${label}</label><input id="${id}" type="${type}" value="${esc(value)}" ${attrs}>`;}
function notice(message){C().status(message);const n=$('cb-message');if(n)n.textContent=message;}
function mutate(fn){const doc=C().exportDocument();fn(doc.maps);C().importDocument(doc);}
function makeMap(config,doc=maps()){
 const w=Number(config.width),h=Number(config.height),type=config.shape||'rectangle',material=config.material||'tile';
 if(!Number.isInteger(w)||!Number.isInteger(h)||w<256||h<256||w>12000||h>12000||!shapes[type]||type==='square'&&w!==h)throw Error('Use dimensões de 256 a 12000 px; o quadrado precisa de lados iguais.');
 const parent=config.parent||E().current();if(!doc[parent])throw Error('Escolha um cenário de origem.');if(Object.keys(doc).length>=128)throw Error('Limite de 128 cenários atingido.');
 const world=config.world||doc[parent].world,name=String(config.name||'Novo cenário').trim().slice(0,120);if(!name||!['science','alchemy'].includes(world)||!materials[material])throw Error('Nome, mundo ou piso inválido.');
 const stem=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,50)||'cenario';let n=1,id;do{id='custom-'+stem+'-'+n++;}while(doc[id]);
 const l={id,name,custom:true,world,parent,environment:config.environment||'indoor',bounds:[0,0,w,h],zoom:1,floor:{size:512,files:{}},geometry:{type,material,color:materials[material][1],polygon:polygon(type,w,h)},spawn:[Math.round(w/2),Math.round(h*.78)],objects:[],npcs:[],mobs:[],pickups:[],samples:[],obstacles:[],editorBlocks:[],regions:[]};
 l.spawn=freePoint(l,l.spawn);return l;
}
function createMap(config){let id;mutate(doc=>{const l=makeMap(config,doc);doc[l.id]=l;id=l.id;});C().switchScene(id);C().showTab('builder');notice('Cenário criado. Adicione pisos, objetos, unidades e conexões nas abas do editor.');return id;}
function mapForm(prefix='cb'){
 return input(prefix+'-name','Nome do novo cenário','Novo laboratório')+`<div class="ce-pair"><div><label for="${prefix}-world">Mundo</label><select id="${prefix}-world">${option({science:'Científico · AION',alchemy:'Alquímico · Vitrália'},E().level().world)}</select></div><div><label for="${prefix}-environment">Ambiente</label><select id="${prefix}-environment">${option({indoor:'Interior',outdoor:'Exterior'},'indoor')}</select></div></div><label for="${prefix}-shape">Formato</label><select id="${prefix}-shape">${option(shapes,'rectangle')}</select><div class="ce-pair"><div><label for="${prefix}-preset">Tamanho</label><select id="${prefix}-preset">${option({small:'Pequeno · 640 × 480',medium:'Médio · 1280 × 960',large:'Grande · 2560 × 1920',huge:'Amplo · 5120 × 3840',corridor:'Corredor · 1536 × 384',custom:'Personalizado'},'medium')}</select></div><div><label for="${prefix}-material">Piso inicial</label><select id="${prefix}-material">${option(Object.fromEntries(Object.entries(materials).map(([k,v])=>[k,v[0]])),'tile')}</select></div></div><div class="ce-pair"><div>${input(prefix+'-width','Largura · px',1280,'number','min="256" max="12000" step="1"')}</div><div>${input(prefix+'-height','Altura · px',960,'number','min="256" max="12000" step="1"')}</div></div><canvas id="${prefix}-preview" class="cb-preview" width="304" height="150" aria-label="Prévia do formato do cenário"></canvas>`;
}
function readMapForm(prefix){return {name:$(prefix+'-name').value,world:$(prefix+'-world').value,environment:$(prefix+'-environment').value,shape:$(prefix+'-shape').value,material:$(prefix+'-material').value,width:+$(prefix+'-width').value,height:+$(prefix+'-height').value};}
function preview(prefix){const c=$(prefix+'-preview');if(!c)return;const w=+$(prefix+'-width').value,h=+$(prefix+'-height').value;if(!(w>=256&&h>=256))return;const ctx=c.getContext('2d'),k=Math.min(280/w,118/h),p=polygon($(prefix+'-shape').value,w,h);ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#0c1b24';ctx.fillRect(0,0,c.width,c.height);ctx.save();ctx.translate((304-w*k)/2,(140-h*k)/2);ctx.scale(k,k);ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=materials[$(prefix+'-material').value][1];ctx.fill();ctx.strokeStyle='#98ecd3';ctx.lineWidth=2/k;ctx.stroke();ctx.restore();ctx.fillStyle='#b5ccc9';ctx.font='11px system-ui';ctx.textAlign='center';ctx.fillText(w+' × '+h+' px',152,142);}
function bindMapForm(prefix){
 const sizes={small:[640,480],medium:[1280,960],large:[2560,1920],huge:[5120,3840],corridor:[1536,384]};
 $(prefix+'-preset').onchange=()=>{const size=sizes[$(prefix+'-preset').value];if(size){$(prefix+'-width').value=size[0];$(prefix+'-height').value=$(prefix+'-shape').value==='square'?size[0]:size[1];}preview(prefix);};
 for(const key of ['shape','width','height','material'])$(prefix+'-'+key).oninput=()=>{if($(prefix+'-shape').value==='square'){if(key==='height')$(prefix+'-width').value=$(prefix+'-height').value;else $(prefix+'-height').value=$(prefix+'-width').value;}preview(prefix);};preview(prefix);
}
function scenePanel(){const l=E().level();return `<h3>Criador de cenários</h3><p>Crie um mapa com tamanho e formato próprios. As bordas bloqueiam a passagem; o piso continua editável na aba Pisos.</p>${mapForm()}<button id="cb-create" class="primary cb-wide">Criar cenário e abrir</button><div class="ce-divider"></div><h3>${esc(l.name)}</h3><p>${l.bounds[2]} × ${l.bounds[3]} px · ${l.custom?esc(shapes[l.geometry.type]):'Cenário original'} · ${l.npcs?.length||0} unidades · ${l.mobs?.length||0} criaturas</p>${l.custom?`<label for="cb-existing-name">Nome deste cenário</label><input id="cb-existing-name" value="${esc(l.name)}"><button id="cb-rename" class="cb-wide">Renomear cenário</button>`:''}<p>Para ligar este cenário a outro, use Portas & Portais. Todos os novos mapas entram na lista superior, no salvamento e na exportação.</p><button id="cb-go-connections" class="cb-wide">Adicionar porta / portal</button><div id="cb-message" role="status"></div>`;}
function defaultConnection(){const l=E().level(),target=Object.keys(maps()).find(id=>id!==l.id)||l.id;return {type:'door',target,name:'Porta de passagem',activation:'interact',radius:48,spawn:clone(maps()[target].spawn),twoWay:true};}
function connectionPanel(){
 const l=E().level(),selected=C().selection[0],o=selected?.group==='objects'?(l.objects||[]).find(v=>v.id===selected.id):null;
 if(o?.connection&&!pending&&connectionDraft?.id!==o.id)connectionDraft=null;
 if(!connectionDraft)connectionDraft=o?.connection?{...clone(o.connection),id:o.id,name:o.name,twoWay:!!o.connection.pairId}:defaultConnection();
 const d=connectionDraft,list=(l.objects||[]).filter(o=>o.connection),targets=Object.fromEntries(Object.values(maps()).map(l=>[l.id,l.name]));
 return `<h3>Portas & Portais</h3><p>Escolha um destino existente ou crie um cenário agora e conecte os dois. Use F ou atravesse por proximidade.</p><div class="ce-pair"><div><label for="cb-link-type">Tipo</label><select id="cb-link-type">${option({door:'Porta',portal:'Portal'},d.type)}</select></div><div><label for="cb-link-activation">Ativação</label><select id="cb-link-activation">${option({interact:'Interagir com F',walk:'Ao atravessar'},d.activation)}</select></div></div>${input('cb-link-name','Nome',d.name)}<label for="cb-link-target">Cenário de destino</label><select id="cb-link-target">${option({...targets,__new:'＋ Criar cenário e conectar'},d.target)}</select><div id="cb-new-destination" ${d.target==='__new'?'':'hidden'}><h3>Novo destino</h3>${mapForm('cb-dest')}</div><div id="cb-arrival" ${d.target==='__new'?'hidden':''}><div class="ce-pair"><div>${input('cb-link-x','Chegada X',d.spawn?.[0]||0,'number','min="0" step="1"')}</div><div>${input('cb-link-y','Chegada Y',d.spawn?.[1]||0,'number','min="0" step="1"')}</div></div><button id="cb-pick-arrival" class="cb-wide">Marcar chegada no mapa de destino</button></div><div class="ce-pair"><div>${input('cb-link-radius','Raio de ativação · px',d.radius||48,'number','min="16" max="160"')}</div><div><label for="cb-link-two-way">Conexão</label><select id="cb-link-two-way">${option({yes:'Ida e volta',no:'Somente ida'},d.twoWay?'yes':'no')}</select></div></div><button id="cb-place-link" class="primary cb-wide">${d.id?'Reposicionar / aplicar conexão':'Clique para posicionar no mapa'}</button><button id="cb-new-link" class="cb-wide">Nova conexão</button>${d.id?'<button id="cb-remove-link" class="danger cb-wide">Remover conexão e retorno</button>':''}<div id="cb-message" role="status">${pending?'Clique no mapa para marcar o ponto. Esc cancela.':''}</div><h3>Conexões deste cenário · ${list.length}</h3><div class="cb-unit-list">${list.map(o=>`<button data-cb-link="${esc(o.id)}"><b>${esc(o.name)}</b><small>${esc(maps()[o.connection.target]?.name||o.connection.target)} · ${o.connection.activation==='walk'?'atravessar':'tecla F'}</small></button>`).join('')||'<p>Nenhuma conexão criada.</p>'}</div>`;
}
function readConnection(){const prev=connectionDraft||{};return {...prev,type:$('cb-link-type').value,activation:$('cb-link-activation').value,name:$('cb-link-name').value.trim().slice(0,120)||'Passagem',target:$('cb-link-target').value,spawn:[+$('cb-link-x').value,+$('cb-link-y').value],radius:+$('cb-link-radius').value,twoWay:$('cb-link-two-way').value==='yes',newMap:$('cb-link-target').value==='__new'?readMapForm('cb-dest'):null};}
function uniqueObject(l,prefix){const ids=new Set(['objects','npcs','mobs','pickups'].flatMap(k=>(l[k]||[]).map(o=>o.id)));let n=1,id;do{id=prefix+'-'+n++;}while(ids.has(id));return id;}
function removePair(doc,l,o){const pairId=o.connection?.pairId,target=doc[o.connection?.target];if(pairId&&target)target.objects=target.objects.filter(v=>v.id!==pairId);}
function connect(config,sourcePoint,sourceId=E().current()){
 let placedId;
 mutate(doc=>{
  const l=doc[sourceId];if(!l)throw Error('Origem inexistente.');
  let d=config.target==='__new'?makeMap({...config.newMap,parent:sourceId},doc):doc[config.target];if(!d)throw Error('Destino inexistente.');if(config.target==='__new')doc[d.id]=d;
  if(!contains(l,...sourcePoint,20))throw Error('Posicione a entrada dentro da área do cenário.');
  const arrival=config.target==='__new'?clone(d.spawn):config.spawn;
  if(!Array.isArray(arrival)||!arrival.every(Number.isFinite)||!contains(d,...arrival,24))throw Error('A chegada precisa ficar dentro do cenário de destino.');
  if(!Number.isFinite(config.radius)||config.radius<16||config.radius>160)throw Error('Use raio entre 16 e 160 px.');
  const old=l.objects.find(v=>v.id===config.id);if(old)removePair(doc,l,old);
  const id=old?.id||uniqueObject(l,'connection'),o={...(old||{}),id,sprite:config.type==='door'?'builder_door_'+l.world:l.world==='science'?'v7_portal_aion':'v7_portal_vitralia',name:config.name||'Passagem',kind:'connection',x:sourcePoint[0],y:sourcePoint[1],scale:old?.scale||1,connection:{type:config.type,target:d.id,spawn:arrival,activation:config.activation||'interact',radius:config.radius||48}};
  delete o.solid;
  if(config.twoWay){
   const clearance=Math.max(96,config.radius+40),point=awayPoint(d,arrival,clearance),back=awayPoint(l,[o.x,o.y],clearance,Math.PI/2);if(Math.hypot(point[0]-arrival[0],point[1]-arrival[1])<config.radius+20||Math.hypot(back[0]-o.x,back[1]-o.y)<config.radius+20)throw Error('O raio é grande para esta entrada. Reduza o raio ou afaste a chegada da borda.');const pairId=uniqueObject(d,'connection-back'),pair={id:pairId,sprite:config.type==='door'?'builder_door_'+d.world:d.world==='science'?'v7_portal_aion':'v7_portal_vitralia',name:'Voltar · '+l.name,kind:'connection',x:point[0],y:point[1],scale:1,connection:{type:config.type,target:sourceId,spawn:back,activation:config.activation||'interact',radius:config.radius||48,pairId:id}};
   if(d.id===l.id&&Math.hypot(o.x-pair.x,o.y-pair.y)<config.radius*2+32)throw Error('Afaste a chegada da origem para criar uma conexão no mesmo mapa.');
   d.objects.push(pair);o.connection.pairId=pairId;
  }
  if(old)l.objects[l.objects.findIndex(v=>v.id===id)]=o;else l.objects.push(o);placedId=id;
 });
 C().select(placedId,'objects');connectionDraft=null;C().showTab('connections');notice('Conexão criada. Use Testar para atravessar; Esc cancela o posicionamento.');return placedId;
}
function unitsPanel(){
 const l=E().level(),q=search.toLowerCase(),list=['npcs','mobs'].flatMap(group=>(l[group]||[]).map(o=>({group,o})));
 if(l.id==='world1'&&!list.some(v=>v.o.id==='opening-slime')&&l.slime)list.unshift({group:'mobs',o:{id:'opening-slime',name:'Slime inicial',definitionId:'opening-slime',sprite:l.slimeSprite||'slime_blue',x:l.slime[0],y:l.slime[1]},story:true});
 const selected=C().selection[0],item=list.find(v=>v.group===selected?.group&&v.o.id===selected.id),o=item?.o,d=item?.group==='mobs'?R().monster(o,l.world):null;
 return `<h3>Unidades individuais</h3><p>Selecione uma unidade pelo nome ou clicando nela no mapa. Cada cópia pode ter nível, atributos, comportamento e recompensas próprios.</p><input id="cb-unit-search" type="search" aria-label="Buscar unidade" placeholder="Buscar nome, ID ou nível…" value="${esc(search)}"><label for="cb-unit-filter">Mostrar</label><select id="cb-unit-filter">${option({all:'Todas as unidades',mobs:'Criaturas / mobs',npcs:'NPCs'},unitFilter)}</select><div class="cb-unit-list">${list.filter(v=>(unitFilter==='all'||v.group===unitFilter)&&(!q||(v.o.id+' '+(v.o.name||v.o.kind||'')+' '+(v.group==='mobs'?R().monster(v.o,l.world).level:v.o.level||1)).toLowerCase().includes(q))).map(({group,o,story})=>{const d=group==='mobs'?R().monster(o,l.world):o;return `<button data-cb-unit="${esc(o.id)}" data-group="${group}" data-story="${!!story}" class="${o.id===selected?.id?'active':''}"><b>${esc(d.name||o.name||o.id)} <span>Nv. ${d.level||1}</span></b><small>${group==='mobs'?'Criatura':'NPC'} · ${esc(o.id)} · ${Math.round(o.x)}, ${Math.round(o.y)}</small></button>`;}).join('')||'<p>Nenhuma unidade encontrada.</p>'}</div>${o?`<div class="cb-unit-card"><h3>${esc(d?.name||o.name||o.id)}</h3><p>ID: ${esc(o.id)} · somente esta unidade</p>${input('cb-unit-name','Nome individual',d?.name||o.name||o.kind||'Unidade')}<div class="ce-pair"><div>${input('cb-unit-level','Nível individual',d?.level||o.level||1,'number','min="1" max="100" step="1"')}</div><div>${input('cb-unit-scale','Escala',d?.scale||o.scale||1,'number','min=".1" max="8" step=".05"')}</div></div><div class="ce-pair"><div>${input('cb-unit-x','X',o.x,'number','step="1"')}</div><div>${input('cb-unit-y','Y',o.y,'number','step="1"')}</div></div>${d?`<div class="ce-pair"><div>${input('cb-unit-hp','Vida máxima',d.stats.maxHP,'number','min="1" max="1000000"')}</div><div>${input('cb-unit-xp','XP por derrota',d.xp,'number','min="0" max="10000000" step="1"')}</div></div><label for="cb-unit-aggression">Comportamento individual</label><select id="cb-unit-aggression">${option({passive:'Passivo',neutral:'Neutro',aggressive:'Agressivo',guard:'Guarda'},d.behavior.aggression)}</select>`:`<label for="cb-unit-sprite">Aparência</label><select id="cb-unit-sprite">${option(Object.fromEntries(Object.keys(E().levels().sprites).map(k=>[k,window.CHEMSCAPE_ASSET_META[k]?.label||k])),o.sprite)}</select>${input('cb-unit-speed','Velocidade de caminhada · px/s',o.speed??36,'number','min="0" max="1000"')}<label for="cb-unit-activity">Atividade</label><select id="cb-unit-activity">${option({idle:'Repouso',guard:'Patrulha',work:'Trabalho',training:'Treinamento'},o.activity||'idle')}</select><label for="cb-unit-lines">Falas · uma por linha</label><textarea id="cb-unit-lines" rows="4">${esc((o.lines||E().dialogue(o.id)||[]).join('\n'))}</textarea><label for="cb-unit-path">Rota · X,Y por linha</label><textarea id="cb-unit-path" rows="3">${esc((o.path||[]).map(v=>v.join(',')).join('\n'))}</textarea>`}<button id="cb-apply-unit" class="primary cb-wide">Aplicar só nesta unidade</button>${d?'<button id="cb-advanced-unit" class="cb-wide">Atributos, habilidades, loot e respawn individuais</button>':''}<div class="ce-actions"><button id="cb-focus-unit">Centralizar</button><button id="cb-duplicate-unit">Duplicar unidade</button></div></div>`:''}<div id="cb-message" role="status"></div>`;
}
function ensureStory(){const l=E().level();if(l.id!=='world1'||l.mobs.some(v=>v.id==='opening-slime'))return;mutate(doc=>{const m=doc.world1;m.mobs.push({id:'opening-slime',definitionId:'opening-slime',sprite:m.slimeSprite||'slime_blue',kind:'Slime inicial',x:m.slime[0],y:m.slime[1],overrides:{}});});}
function applyUnit(){
 const s=C().selection[0],l=E().level(),o=(l[s.group]||[]).find(v=>v.id===s.id);if(!o)throw Error('Selecione uma unidade.');
 const level=+$('cb-unit-level').value,scale=+$('cb-unit-scale').value,x=+$('cb-unit-x').value,y=+$('cb-unit-y').value,name=$('cb-unit-name').value.trim().slice(0,120);
 if(!Number.isInteger(level)||level<1||level>100||!Number.isFinite(scale)||scale<.1||scale>8||!contains(l,x,y,16)||!name)throw Error('Confira nome, nível (1–100), escala e posição dentro do mapa.');
 const patch={name,level,scale,x,y};
 if(s.group==='mobs'){
  const d=R().monster(o,l.world),hp=+$('cb-unit-hp').value,xp=+$('cb-unit-xp').value;
  const adjusted=R().scaleMonster(d,level);patch.overrides={...clone(o.overrides||{}),name,level,scale,stats:{...adjusted.stats,maxHP:hp===d.stats.maxHP?adjusted.stats.maxHP:hp},xp:xp===d.xp?adjusted.xp:xp,behavior:{...d.behavior,aggression:$('cb-unit-aggression').value}};
  const def={...d,...patch.overrides},doc=clone(R().data);doc.monsters[def.id]=def;R().validateDefinitions(doc);
 }else{
  const lines=$('cb-unit-lines').value.split('\n').map(v=>v.trim()).filter(Boolean),path=$('cb-unit-path').value.split('\n').filter(v=>v.trim()).map(v=>v.split(',').map(Number)),speed=+$('cb-unit-speed').value;
  if(lines.length>64||lines.some(v=>v.length>4000)||path.length>128||path.some(v=>v.length!==2||!v.every(Number.isFinite)||!contains(l,...v,16))||!Number.isFinite(speed)||speed<0||speed>1000)throw Error('Confira as falas, a velocidade e os pontos X,Y da rota.');
  Object.assign(patch,{lines:lines.length?lines:['...'],path,speed,activity:$('cb-unit-activity').value,sprite:$('cb-unit-sprite').value,dialogueCustom:true});
 }
 C().updateEntity(s.group,o.id,patch);notice('Alterações aplicadas somente em '+name+'. Outras unidades mantêm seus valores.');
}
function guarded(fn){return ()=>{try{fn();}catch(error){notice(error.message);}};}
function bindPanel(tab){
 if(tab==='builder'){
  bindMapForm('cb');$('cb-create').onclick=guarded(()=>createMap(readMapForm('cb')));$('cb-go-connections').onclick=()=>{connectionDraft=null;C().showTab('connections');};
  if($('cb-rename'))$('cb-rename').onclick=guarded(()=>{const name=$('cb-existing-name').value.trim().slice(0,120);if(!name)throw Error('Informe o nome do cenário.');mutate(doc=>doc[E().current()].name=name);C().showTab('builder');});
 }else if(tab==='connections'){
  bindMapForm('cb-dest');
  $('cb-link-target').onchange=()=>{const target=$('cb-link-target').value;connectionDraft=readConnection();if(target!=='__new')connectionDraft.spawn=clone(maps()[target].spawn);C().showTab('connections');};
  $('cb-place-link').onclick=guarded(()=>{connectionDraft=readConnection();pending={type:'connection',source:E().current(),draft:clone(connectionDraft)};notice('Clique no mapa para posicionar a entrada. Esc cancela.');});
  $('cb-pick-arrival').onclick=guarded(()=>{connectionDraft=readConnection();pending={type:'arrival',source:E().current(),draft:clone(connectionDraft)};C().switchScene(connectionDraft.target);C().showTab('connections');notice('Clique no destino para marcar a chegada. Você voltará à origem.');});
  $('cb-new-link').onclick=()=>{pending=null;connectionDraft=defaultConnection();C().select('');C().showTab('connections');};
  if($('cb-remove-link'))$('cb-remove-link').onclick=guarded(()=>{const id=connectionDraft.id;mutate(doc=>{const l=doc[E().current()],o=l.objects.find(o=>o.id===id);if(o){removePair(doc,l,o);l.objects=l.objects.filter(o=>o.id!==id);}});connectionDraft=null;C().showTab('connections');});
  for(const b of document.querySelectorAll('[data-cb-link]'))b.onclick=()=>{pending=null;connectionDraft=null;C().select(b.dataset.cbLink,'objects');C().showTab('connections');const o=E().level().objects.find(v=>v.id===b.dataset.cbLink);E().setView({x:o.x,y:o.y});};
 }else if(tab==='units'){
  $('cb-unit-search').oninput=e=>{search=e.target.value;C().showTab('units');const f=$('cb-unit-search');f.focus();};$('cb-unit-filter').onchange=e=>{unitFilter=e.target.value;C().showTab('units');};
  for(const b of document.querySelectorAll('[data-cb-unit]'))b.onclick=guarded(()=>{if(b.dataset.story==='true')ensureStory();C().select(b.dataset.cbUnit,b.dataset.group);});
  if($('cb-apply-unit'))$('cb-apply-unit').onclick=guarded(applyUnit);
  if($('cb-advanced-unit'))$('cb-advanced-unit').onclick=()=>{const s=C().selection[0],o=E().level().mobs.find(v=>v.id===s.id);window.CHEMSCAPE_DEF_EDITOR.open('monsters',o.definitionId,{object:o,group:'mobs'});};
  if($('cb-focus-unit'))$('cb-focus-unit').onclick=()=>{const s=C().selection[0],o=E().level()[s.group].find(v=>v.id===s.id);E().setView({x:o.x,y:o.y});};
  if($('cb-duplicate-unit'))$('cb-duplicate-unit').onclick=guarded(()=>{const s=C().selection[0];let id;mutate(doc=>{const l=doc[E().current()],o=clone(l[s.group].find(v=>v.id===s.id));o.id=uniqueObject(l,'copy-'+s.id);id=o.id;const [x,y]=freePoint(l,[o.x+64,o.y+64]),dx=x-o.x,dy=y-o.y;o.x=x;o.y=y;if(o.path)o.path=o.path.map(p=>freePoint(l,[p[0]+dx,p[1]+dy],16));l[s.group].push(o);});C().select(id,s.group);});
 }
}
function pointer(p,tab){
 if(!pending)return false;
 try{
  if(pending.type==='arrival'){
   if(!contains(E().level(),p.x,p.y,24))throw Error('Escolha uma área livre dentro do formato.');
   const source=pending.source;connectionDraft={...pending.draft,spawn:[Math.round(p.x),Math.round(p.y)]};pending=null;C().switchScene(source);C().showTab('connections');notice('Chegada marcada. Agora posicione a entrada na origem.');
  }else{const task=pending;pending=null;connect(task.draft,[Math.round(p.x),Math.round(p.y)],task.source);}
 }catch(e){pending=null;notice(e.message);}return true;
}
function cancel(){const old=pending;pending=null;if(old?.type==='arrival'){connectionDraft=old.draft;C().switchScene(old.source);} }
function overlay(ctx,l,v){
 ctx.save();ctx.lineWidth=2/v.zoom;ctx.font=11/v.zoom+'px system-ui';
 for(const o of l.objects||[])if(o.connection&&!o.hidden){
  ctx.strokeStyle=o.connection.type==='portal'?'#bd9fff':'#e7be7c';ctx.fillStyle='#0f2429dd';ctx.setLineDash([5/v.zoom,4/v.zoom]);ctx.beginPath();ctx.arc(o.x,o.y,o.connection.radius,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.fillRect(o.x-70/v.zoom,o.y+12/v.zoom,140/v.zoom,18/v.zoom);ctx.fillStyle='#f2ead1';ctx.textAlign='center';ctx.fillText('→ '+(maps()[o.connection.target]?.name||'Destino').slice(0,24),o.x,o.y+25/v.zoom);
 }
 if(pending){ctx.fillStyle='#b1ffe4';ctx.textAlign='center';ctx.fillText(pending.type==='arrival'?'CLIQUE PARA MARCAR A CHEGADA':'CLIQUE PARA POSICIONAR A CONEXÃO',v.x,v.y-270/v.zoom);}
 ctx.restore();
}
window.CHEMSCAPE_BUILDER={contains,polygon,drawFloor,validateMap,validateConnection,panel:tab=>tab==='builder'?scenePanel():tab==='connections'?connectionPanel():unitsPanel(),bindPanel,pointer,cancel,resetDraft:()=>{cancel();connectionDraft=null;},overlay,createMap,connect,makeMap};
for(const world of ['science','alchemy']){
 const id='builder_door_'+world;
 window.CHEMSCAPE_LEVELS.sprites[id]={file:'rebuilt/'+id+'.svg',w:64,h:96,anchor:[32,90],scale:1};
 window.CHEMSCAPE_ASSET_META[id]={thumb:'rebuilt/'+id+'.svg',label:world==='science'?'Porta AION':'Porta de Vitrália',world,kind:'prop',category:'Portas',tags:['porta','interior','passagem']};
}
window.addEventListener('DOMContentLoaded',()=>{
 const nav=$('ce-tabs');for(const [id,label]of [['builder','Criar cenário'],['connections','Portas & Portais'],['units','Unidades']]){const b=document.createElement('button');b.dataset.tab=id;b.textContent=label;nav.append(b);}
 nav.addEventListener('click',e=>{if(e.target.closest('[data-tab]')){cancel();connectionDraft=null;}},true);
});
})();
