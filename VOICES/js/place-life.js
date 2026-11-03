(function(){
'use strict';
const V=window.V,W=V.World,C=V.Cozy,T=48,esc=V.escape;
const people=[
 {id:'lia',name:'Lia',row:0,role:'Botânica de campo',map:'nature-cerrado',at:[35,40],en:'Look closely at the leaves. Every plant has a story.',pt:'Observe as folhas com atenção. Cada planta tem uma história.',words:['plant','leaf','observe','research'],action:'Anotando as plantas'},
 {id:'caio',name:'Caio',row:1,role:'Guia das trilhas',map:'nature-cerrado',at:[20,30],en:'Stay on the trail. We can watch the animals from here.',pt:'Siga pela trilha. Podemos observar os animais daqui.',words:['trail','animal','observe','nature'],action:'Observando a fauna'},
 {id:'thandi',name:'Thandi',row:2,role:'Guarda-parque',map:'nature-savanna',at:[33,38],en:'Welcome to the savanna. Give the wildlife plenty of space.',pt:'Boas-vindas à savana. Deixe bastante espaço para os animais.',words:['savanna','wildlife','nature','observe'],action:'Acompanhando a trilha'},
 {id:'sipho',name:'Sipho',row:3,role:'Pesquisador de campo',map:'nature-savanna',at:[41,24],en:'I am recording what we see near the water.',pt:'Estou registrando o que vemos perto da água.',words:['water','research','observe','record'],action:'Registrando observações'},
 {id:'yasmin',name:'Yasmin',row:4,role:'Pesquisadora de biologia',map:'university-biology',at:[14,13],en:'Let us compare these samples under the microscope.',pt:'Vamos comparar estas amostras ao microscópio.',words:['microscope','research','plant','observe'],action:'Comparando amostras'},
 {id:'rafael',name:'Rafael',row:5,role:'Pesquisador de física',map:'university-physics',at:[14,13],en:'Observe the light, then write down what changes.',pt:'Observe a luz e depois anote o que muda.',words:['light','research','observe','notebook'],action:'Conferindo o experimento'},
 {id:'dalva',name:'Dalva',row:6,role:'Bibliotecária',map:'library',at:[13,12],en:'Choose a book. We can discover a new story together.',pt:'Escolha um livro. Podemos descobrir uma nova história juntos.',words:['book','story','library','read'],action:'Consultando um livro'},
 {id:'mateus',name:'Mateus',row:7,role:'Trabalhador do porto',map:'harbor',at:[16,18],en:'Check the route before you board the boat.',pt:'Confira a rota antes de embarcar no barco.',words:['boat','harbor','travel','route'],action:'Conferindo as rotas'}
];
// Other public spaces gain visitors using the existing directional characters.
const visitors=[
 ['hub','visitante-praca','Helena','nia',.42,.72,'Conhecendo a praça'],
 ['park','visitante-parque','Bia','taina',.46,.65,'Observando o parque'],
 ['garden','visitante-horta','Daniel','leo',.55,.67,'Visitando a horta'],
 ['market','visitante-feira','Luísa','sol',.43,.73,'Visitando as bancas'],
 ['university','visitante-campus','Davi','student',.51,.65,'Conhecendo o campus'],
 ['university-sports','visitante-ginasio','Renata','taina',.86,.84,'Acompanhando o treino'],
 ['university-pool','visitante-piscina','Aline','nia',.45,.82,'Conversando no centro aquático'],
 ['cape-town','visitante-cabo','Naledi','sol',.55,.72,'Visitando a cidade']
];
const P=V.PlaceLife={people,image:null,
 load(){return new Promise(resolve=>{const im=V.Assets.image();this.image=im;im.onload=im.onerror=resolve;im.src='assets/expansion/place-npcs.webp?v=20261102-living3';V.AssetLoader.register(im,resolve);});},
 clear(m,x,y){return x>60&&y>100&&x<(m.width-1)*T&&y<(m.height-1)*T&&!V.Living.blocked(m,x,y,12);},
 segment(m,a,b){const steps=Math.max(1,Math.ceil(V.dist(a,b)/9));for(let i=1;i<=steps;i++)if(!this.clear(m,a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps))return false;return true;},
 spot(m,wish){const flood=V.SceneDesign.flood(m);return flood.filter(p=>this.clear(m,p.x,p.y)&&!m.objects.some(o=>o.type!=='nature-prop'&&V.dist(o,p)<42)).sort((a,b)=>V.dist(a,wish)-V.dist(b,wish))[0]||null;},
 add(m,profile){const id='place-life-'+profile.id;if(m.objects.some(o=>o.id===id))return;const p=this.spot(m,{x:profile.at[0]*T,y:profile.at[1]*T});if(!p)return;const o={id,type:'place-life',person:profile.id,character:profile.character,x:p.x,y:p.y,home:{x:p.x,y:p.y},label:'Conversar com '+profile.name,interactionRange:92,profile,walkClock:profile.row||0,walking:false,wait:.5,routeIndex:1,dir:1,frame:0};
  const saved=m.design?.positions?.[id];if(saved&&this.clear(m,(saved[0]+.5)*T,(saved[1]+.5)*T)){o.x=(saved[0]+.5)*T;o.y=(saved[1]+.5)*T;o.home={x:o.x,y:o.y};}
  o.patrol=[{x:o.x,y:o.y}];for(const[dx,dy]of [[104,0],[84,65],[-75,50],[-90,-28],[0,-85]]){const q={x:o.home.x+dx,y:o.home.y+dy},last=o.patrol.at(-1);if(this.segment(m,last,q)&&this.segment(m,q,o.home))o.patrol.push(q);}m.objects.push(o);V.SceneDesign.objectRegistry[m.id]||={};V.SceneDesign.objectRegistry[m.id][id]={type:o.type};return o;
 },
 populate(m){if(!m)return m;for(const p of people.filter(p=>p.map===m.id))this.add(m,p);for(const[map,id,name,character,fx,fy,action]of visitors.filter(p=>p[0]===m.id))this.add(m,{id,name,character,role:'Visitante',at:[m.width*fx,m.height*fy],en:'There is always something new to discover here.',pt:'Sempre há algo novo para descobrir por aqui.',words:['discover','place','story'],action});return m;},
 update(m,dt){if(!m||m.placeLifeTick===V.Engine.time)return;m.placeLifeTick=V.Engine.time;dt=V.clamp(dt,0,.08);for(const o of m.objects.filter(o=>o.type==='place-life')){o.walking=false;if(V.settings.reducedMotion||V.settings.npcMovement===false){o.frame=0;continue;}o.walkClock+=dt;if(V.World.nearest?.id===o.id&&V.Player.data&&V.dist(o,V.Player.data)<100){o.wait=Math.max(o.wait,1.2);o.frame=0;continue;}if(o.wait>0){o.wait-=dt;o.frame=0;continue;}const target=o.patrol[o.routeIndex%o.patrol.length],dx=target.x-o.x,dy=target.y-o.y,d=Math.hypot(dx,dy);if(d<2){o.routeIndex=(o.routeIndex+1)%o.patrol.length;o.wait=2+(o.routeIndex+o.walkClock)%4;o.frame=0;continue;}const step=Math.min(d,25*dt),x=o.x+dx/d*step,y=o.y+dy/d*step;if(!this.clear(m,x,y)){o.routeIndex=0;o.wait=1.5;continue;}const player=V.Player.data;if(player&&V.dist({x,y},player)<29){o.wait=.6;continue;}o.x=x;o.y=y;o.dir=dx<-.1?-1:dx>.1?1:o.dir;o.walking=true;o.frame=Math.floor(o.walkClock*6)%4;o.spriteRow=Math.abs(dy)>Math.abs(dx)?dy<0?3:0:dx<0?1:2; }},
 draw(c,o,cam){if(o.type!=='place-life')return false;const x=o.x-cam.x,y=o.y-cam.y;if(Math.abs(c.getTransform().a)>=.99&&(x<-80||x>c.canvas.width+80||y<-20||y>c.canvas.height+90))return true;const p=o.profile,size=64;V.SceneShadows.contact(c,x,y+2,17,5,.2);if(p.character){V.Assets.sprite(c,p.character,x,y,o.walking?o.spriteRow||0:0,o.frame,62);}else if(this.image?.naturalWidth){const cell=this.image.naturalWidth/4;c.save();c.imageSmoothingEnabled=true;c.translate(x,y);if(o.dir<0)c.scale(-1,1);c.drawImage(this.image,o.frame*cell,p.row*cell,cell,cell,-size/2,-size+4,size,size);c.restore();}
  if(o.id&&W.nearest?.id===o.id)V.WorldSigns.draw(c,p.name+' · '+p.role,x,y-77,{active:true,maxWidth:235});else if(!o.walking&&!V.settings.reducedMotion){const t=o.walkClock%12;if(t<2.2){c.save();c.fillStyle='#f2e8cc';c.strokeStyle='#607457';c.lineWidth=1.2;c.beginPath();c.roundRect(x+13,y-72,24,20,6);c.fill();c.stroke();c.fillStyle='#49624e';c.font='12px Georgia';c.textAlign='center';c.fillText(p.row===6?'…':p.row===0||p.row===4?'✎':'•',x+25,y-58);c.restore();}}return true;
 },
 talk(o){const p=o.profile;o.wait=4;V.UI.modal(p.name,p.role.toUpperCase(),'<div class="place-person"><canvas id="place-person-portrait" width="112" height="112" aria-hidden="true"></canvas><div><p lang="en"><strong>'+esc(p.en)+'</strong></p><p>'+esc(p.pt)+'</p></div></div><p class="note">'+esc(p.action)+'. Explore o lugar e converse com as pessoas para encontrar novas palavras.</p>',(W.current.nature?'<button id="place-fauna" class="secondary">Abrir caderno da fauna</button>':'')+'<button id="place-person-close" class="primary">Continuar explorando</button>');const c=V.$('#place-person-portrait').getContext('2d');this.draw(c,{...o,x:56,y:105,frame:0,walking:false},{x:0,y:0});const words=p.words.filter(word=>V.PixVocabulary?.entry(word));if(words.length)V.PixWorldVocabulary?.strip(words,p.name+' · '+p.role);V.$('#place-person-close').onclick=()=>V.UI.close();if(V.$('#place-fauna'))V.$('#place-fauna').onclick=()=>V.NatureWorld.fieldGuide();V.state.talked||=[];if(!V.state.talked.includes(o.id)){V.state.talked.push(o.id);V.Save.save();}}
};
const load=V.Assets.load.bind(V.Assets);V.Assets.load=async function(...args){await load(...args);await P.load();};
const group=V.AssetLoader.group.bind(V.AssetLoader);V.AssetLoader.group=key=>key.includes('/place-npcs.')?'place-life':group(key);
const groups=V.MapAssets.groups.bind(V.MapAssets);V.MapAssets.groups=function(m){const out=groups(m);if(m?.objects.some(o=>o.type==='place-life'))out.push('place-life');return [...new Set(out)];};
const relevant=V.PixWorldVocabulary.relevant.bind(V.PixWorldVocabulary);V.PixWorldVocabulary.relevant=m=>m?.objects.some(o=>o.type==='place-life')||relevant(m);
const describe=V.PixWorldVocabulary.describe.bind(V.PixWorldVocabulary);V.PixWorldVocabulary.describe=function(m,o){if(o?.type==='place-life')return{words:this.words(o.profile.words),only:false,priority:2,label:o.profile.name+' · '+o.profile.role};return describe(m,o);};
const init=W.init.bind(W);W.init=function(...args){const out=init(...args);for(const m of Object.values(W.maps))P.populate(m);V.PixWorldVocabulary.seed();V.ObjectiveGuide.invalidate();V.Atlas.cache.clear();return out;};
const preview=V.SceneDesign.preview.bind(V.SceneDesign);V.SceneDesign.preview=function(...args){return P.populate(preview(...args));};
const update=C.update.bind(C);C.update=function(dt){const out=update(dt);if(V.Game.screen==='game'&&V.Game.mode==='explore'&&!V.modal&&!V.Dialogue.active)P.update(W.current,dt);return out;};
for(const[owner,key]of [[C,'drawObject'],[V.NatureWorld,'draw'],[V.Maritime,'drawObject'],[V.CapeRegion,'drawObject'],[V.CulinaryWorld,'draw']]){const draw=owner[key].bind(owner);owner[key]=function(c,o,cam,...args){if(P.draw(c,o,cam))return true;return draw(c,o,cam,...args);};}
const landmark=V.Atlas.landmark.bind(V.Atlas);V.Atlas.landmark=function(c,o,m){return P.draw(c,o,{x:0,y:0})||landmark(c,o,m);};
const interact=V.Game.interact.bind(V.Game);V.Game.interact=function(o){if(o?.type==='place-life'&&!V.modal&&!V.Dialogue.active&&this.mode==='explore')return P.talk(o);return interact(o);};
})();
