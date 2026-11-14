/* Registered module: cooking-world */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("cooking-world", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';
const V=window.V,K=V.Cooking,D=V.CookingData,A=V.CookingArt,W=V.World,C=V.Cozy,S=V.SceneDesign,F=V.FastTravel,M=V.Markets,T=48,esc=V.escape,copy=x=>JSON.parse(JSON.stringify(x));
const kitchen=M.kitchen.bind(M);
K.book=function(filter='all'){
 const records=V.Playground.ensure().stageRecords[D.id]||{},items=D.recipes.map((recipe,index)=>({recipe,index})).filter(({recipe})=>filter==='all'||filter==='br'&&/Brasil/.test(recipe.region)||filter==='africa'&&!/Brasil/.test(recipe.region));
 V.UI.modal('Cozinha dos Saberes',D.recipes.length+' RECEITAS · CADA GESTO TRANSFORMA O PRATO',`<p>A oficina fornece os ingredientes para praticar. Ao concluir a receita, você recebe uma porção na mochila. São adaptações para jogar: as durações e medidas na tela pertencem ao desafio.</p><nav class="market-filters" aria-label="Receitas"><button class="secondary" data-cook-filter="all" aria-pressed="${filter==='all'}">Todas</button><button class="secondary" data-cook-filter="br" aria-pressed="${filter==='br'}">Brasil</button><button class="secondary" data-cook-filter="africa" aria-pressed="${filter==='africa'}">Regiões africanas</button></nav><div class="cooking-recipes">${items.map(({recipe:r,index:i})=>`<article class="cooking-recipe">${V.Progress.icon(r.output,76)}<div><small>${esc(r.region)} ${records[i]?.completed?'· ✓ Preparada':''}</small><h3>${esc(r.name)}</h3><p>${esc(r.context)}</p><details><summary>${r.steps.length} etapas · ingredientes e preparo</summary><p>${esc(r.ingredients)}</p><ol>${r.steps.map(s=>`<li>${esc(s.title)}</li>`).join('')}</ol></details><button class="primary" data-cook-recipe="${i}">Preparar ${esc(r.name)}</button></div></article>`).join('')}</div>`,`<button id="cooking-references" class="secondary">Histórias e referências</button><button id="cooking-inventory-recipes" class="secondary">Usar ingredientes da mochila</button>`,true);
 V.$$('[data-cook-recipe]').forEach(b=>b.onclick=()=>K.entry(+b.dataset.cookRecipe));V.$$('[data-cook-filter]').forEach(b=>b.onclick=()=>K.book(b.dataset.cookFilter));V.$('#cooking-references').onclick=()=>K.references();V.$('#cooking-inventory-recipes').onclick=()=>kitchen();
};
K.references=function(){V.UI.modal('Saberes à mesa','PRATOS, PESSOAS E LUGARES',`<p>A universidade e os vendedores de New Harmony são ficcionais. Os pratos têm contextos regionais e familiares próprios. Esta oficina adapta os preparos a gestos e tempos de jogo.</p><p>A inspiração de interação vem dos movimentos de cortar, mexer, amassar e cozinhar dos jogos de cozinha. As ilustrações, os cenários e os controles desta oficina são próprios do VOICES.</p><div class="stack">${[...D.sources,...V.MarketData.sources.filter(s=>!D.sources.some(o=>o.url===s.url))].map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>`).join('')}</div>`,'<button id="cooking-ref-back" class="primary">Voltar às receitas</button>',true);V.$('#cooking-ref-back').onclick=()=>K.book();};
M.kitchen=()=>K.book();
K.deliver=function(key,index){const a=V.Progress.ensure(),ledger=a.cookingRewards||={};if(ledger[key]||V.ProfessorStudio?.freePlay)return false;const recipe=D.recipes[index];if(!recipe)return false;ledger[key]={recipe:recipe.id,at:new Date().toISOString()};const bag=V.Progress.add(recipe.output,1);V.Save.save();V.UI.toast(recipe.name+(bag?' pronto · uma porção na mochila.':' pronto · uma porção guardada na recepção.'));return true;};
const finish=V.Playground.finish.bind(V.Playground);V.Playground.finish=function(){const r=this.active;if(r?.game===D.id&&!r.training&&r.data.done&&!V.DuoChallenges.isChild)K.deliver(r.id+':'+(r.arcade?.leg||0),r.data.stage);return finish();};
if(V.DuoSessions){const receive=V.DuoSessions.receive.bind(V.DuoSessions);V.DuoSessions.receive=function(e){const out=receive(e),m=e.data;if(m?.type!=='snapshot'||!m.checkpoint?.finished)return out;const session=[...this.sessions.values()].find(s=>s.token===m.voicesDuo&&s.frame.contentWindow===e.source&&s.state===V.state);if(!session||session.key!=='play:'+D.id)return out;const r=m.state?.playground?.runs?.[m.checkpoint.runKey];if(!r||r.game!==D.id||!r.finished||r.training||!r.data?.done||!Number.isInteger(r.data.stage)||!D.recipes[r.data.stage]||r.data.results?.length!==D.recipes[r.data.stage].steps.length)return out;V.DuoPanels.withOwner(session.player,()=>K.deliver(session.record.id+':'+session.player+':'+r.id,r.data.stage));return out;};
 const invite=V.DuoSessions.invite.bind(V.DuoSessions);V.DuoSessions.invite=function(from,key,options){const out=invite(from,key,options),p=this.pending;if(out&&p?.key==='play:'+D.id){const recipe=D.recipes[p.options.stage||0];p.notice.querySelector('p').textContent='Cozinha dos Saberes · '+recipe.name;p.sender.querySelector('strong').textContent='Convite enviado · '+recipe.name;}return out;};
}
const places={
 restaurant:{name:'Restaurante',width:34,height:25,spawn:[17,19],floor:'stone',purpose:'Restaurante dos Saberes · pratos afro-brasileiros e de cozinhas africanas.'},
 kitchen:{name:'Cozinha',width:32,height:23,spawn:[16,17],floor:'stone',purpose:'Cozinha de ensino com bancadas e receitas interativas.'},
 university:{name:'Universidade',width:40,height:29,spawn:[20,23],floor:'stone',purpose:'Universidade das Vozes · memória alimentar, pesquisa e aulas abertas.'}
};
const U=V.CulinaryWorld={places,
 // Opaque sprite bounds inside the cooking atlas. Fit against the bottom of the entrance.
 facadeFrames:{1:[264,24,240,224],2:[520,59,240,189]},
 facadeSize(prop){const [,,sw,sh]=this.facadeFrames[prop];const scale=Math.min(224/sw,186/sh);return {w:Math.round(sw*scale),h:Math.round(sh*scale)};},
 setup(){for(const[id,data]of Object.entries(places)){const d={...data,palette:['#d5c39c','#785d3f','#376756'],paths:[],decor:[],scenes:[],positions:{},routines:{},anchors:[],meeting:[data.width/2,12],adventure:{version:3,architecture:{walls:[],windows:[],mounts:[],signs:[]},environment:{indoor:true,sky:'automatic',weather:false,ambient:'#e6d7b5'},lights:[],regions:[],encounters:[],triggers:[]}};C.layouts[id]=copy(d);S.defaults[id]=copy(d);S.objectRegistry[id]||={};S.raw[id]||=W.base(id,'community',d.width,d.height);F.names[id]=data.name;}},
 link(m,id,x,y,to,label,prop){const o={id,type:'travel',x:x*T,y:y*T,to,label,culinaryLink:true,culinaryProp:prop,interactionRange:110};m.objects.push(o);return o;},
 npc(m,id,name,sprite,x,y,role){const o={id,type:'cooking-npc',name,character:sprite,x:x*T,y:y*T,role,label:'Conversar com '+name,interactionRange:105,stationary:true};C.preparePerson(m,o);o.stationary=true;m.objects.push(o);},
 station(m,id,x,y,role,label){const o={id,type:'cooking-station',x:x*T,y:y*T,role,label,interactionRange:115};m.objects.push(o);m.solids.push({x:o.x-76,y:o.y-28,w:152,h:35,owner:id});},
 build(id,design=C.layouts[id]){const m=W.base(id,'community',design.width,design.height);Object.assign(m,{name:design.name,design,culinary:true,ambientTime:0,decor:[],zones:[],chats:[],anchors:new Map(),reservations:new Map(),bubbleBudget:0,archWalls:[],archSolids:[],mounts:[],lifeAnimals:[],geometryRevision:1});m.solids.push({x:0,y:0,w:m.width*T,h:3*T},{x:0,y:0,w:T,h:m.height*T},{x:(m.width-1)*T,y:0,w:T,h:m.height*T},{x:0,y:(m.height-1)*T,w:m.width*T,h:T});
  if(id==='restaurant'){
   this.link(m,'restaurant-exit',17,22,'hub','Sair para a Praça das Vozes');this.link(m,'restaurant-kitchen',28,5,'kitchen','Entrar na Cozinha',3);
   this.npc(m,'restaurant-lia','Lia','viviane',17,18,'restaurant-shop');this.npc(m,'restaurant-chef','Bento','bento',28,8,'book');this.station(m,'restaurant-counter',17,16,'book','Balcão · receitas da cozinha');
   for(const[x,y]of [[7,9],[17,13],[27,13],[7,17],[25,19]]){m.objects.push({id:'restaurant-table-'+x+'-'+y,type:'cooking-table',x:x*T,y:y*T});m.solids.push({x:x*T-66,y:y*T-32,w:132,h:48});for(const dx of [-2,2])C.addScene(m,{id:'restaurant-seat-'+x+'-'+y+'-'+dx,kind:'seat',family:'cozy',prop:3,x:x+dx-.5,y:y-.4,size:1.1,title:'Sentar à mesa',text:'Uma pausa para conversar e descansar.',dir:dx<0?1:3});}
  }else if(id==='kitchen'){
   this.link(m,'kitchen-restaurant',16,20,'restaurant','Voltar ao Restaurante');this.link(m,'kitchen-university',27,20,'university','Ir para a Universidade');
   for(const[x,y,role,label]of [[7,7,'book','Bancada de preparo · escolher receita'],[23,7,'book','Fogão da oficina · receitas'],[7,14,'book','Mesa de massas e temperos'],[23,14,'water','Bebedouro · água filtrada']])this.station(m,'kitchen-work-'+x+'-'+y,x,y,role,label);
   this.npc(m,'kitchen-chef','Dandara','elder',16,16,'book');m.objects.push({id:'kitchen-board',type:'cooking-board',x:16*T,y:4*T,role:'references',label:'Consultar as receitas e referências'});this.station(m,'kitchen-welcome',16,14,'book','Bancada central · preparar um prato');
  }else{
   this.link(m,'university-exit',20,26,'hub','Voltar à Praça das Vozes');this.link(m,'university-kitchen',32,23,'kitchen','Entrar na Cozinha de ensino',3);
   this.npc(m,'university-professor','Professora Jamila','jamila',12,9,'class');this.npc(m,'university-researcher','Inês','ines',29,9,'references');this.npc(m,'university-guide','Aline','aline',20,22,'class');
   for(const[x,y]of [[9,13],[16,13],[9,18],[16,18],[28,16],[33,16]]){m.objects.push({id:'university-desk-'+x+'-'+y,type:'cooking-table',x:x*T,y:y*T,desk:true});m.solids.push({x:x*T-60,y:y*T-28,w:120,h:42});}
   for(const x of [6,12,28,34])m.objects.push({id:'university-book-'+x,type:'cooking-bookshelf',x:x*T,y:4.2*T,role:'references',label:'Ler sobre pratos e territórios'});
   m.objects.push({id:'university-board',type:'cooking-board',x:20*T,y:5*T,role:'class',label:'Aula aberta · sabores e contextos'});
  }
  for(let y=6;y<m.height-3;y+=5)for(const x of [2.5,m.width-2.5])m.objects.push({id:id+'-plant-'+x+'-'+y,type:'cooking-plant',x:x*T,y:y*T});
  if(id==='kitchen')for(const x of [4,10,22,28])m.objects.push({id:'kitchen-pantry-'+x,type:'cooking-pantry',x:x*T,y:4.6*T});return m;
 },
 free(m,x,y){const box={x:x-105,y:y-145,w:210,h:145};return !V.Living.blocked(m,x,y+25,16)&&!m.solids.some(s=>box.x<s.x+s.w&&box.x+box.w>s.x&&box.y<s.y+s.h&&box.y+box.h>s.y)&&!m.objects.some(o=>Math.hypot(o.x-x,o.y-y)<190);},
 entrance(m,id,to,fx,fy,prop){if(m.objects.some(o=>o.id===id))return;let p=null;const x=m.width*T*fx,y=m.height*T*fy;for(let ring=0;ring<12&&!p;ring++)for(let dy=-ring;dy<=ring&&!p;dy++)for(let dx=-ring;dx<=ring;dx++){if(ring&&Math.max(Math.abs(dx),Math.abs(dy))!==ring)continue;const tx=x+dx*T,ty=y+dy*T;if(tx<T*3||ty<T*5||tx>(m.width-3)*T||ty>(m.height-3)*T)continue;if(this.free(m,tx,ty)){p={x:tx,y:ty};break;}}if(!p){const safe=V.Rooms.safe(m,{x,y},16);p={x:safe.x,y:safe.y};}return this.link(m,id,p.x/T,p.y/T,to,'Entrar: '+places[to].name,prop);},
 seed(){this.setup();for(const id of Object.keys(places))W.maps[id]=this.build(id);this.entrance(W.maps.hub,'city-restaurant','restaurant',.25,.78,1);this.entrance(W.maps.hub,'city-university','university',.78,.78,2);const market=W.maps.market;if(market)this.entrance(market,'market-restaurant','restaurant',.82,.85,1);for(const id of Object.keys(places))F.point(id);V.ObjectiveGuide.invalidate();V.Atlas.cache.clear();},
 ground(m){const canvas=V.GroundCache.create(m, m.width*T, m.height*T);;;const c=canvas.getContext('2d'),college=m.id==='university';c.imageSmoothingEnabled=false;c.fillStyle=college?'#cdbb91':m.id==='kitchen'?'#b7bca5':'#b88d63';c.fillRect(0,0,V.GroundCache.width(canvas),V.GroundCache.height(canvas));
  for(let y=3*T;y<(m.height-1)*T;y+=T/2)for(let x=T;x<(m.width-1)*T;x+=T){c.fillStyle=(x/T+y/T*2)%3===0?(college?'#ddd0ad':m.id==='kitchen'?'#d3d7bb':'#cca97a'):(college?'#d4c59e':m.id==='kitchen'?'#c4c9b0':'#bf9a6e');c.fillRect(x+(y%T?T/2:0),y,T-3,T/2-3);}
  if(m.id==='restaurant'||college){const cx=m.width*T/2;c.fillStyle=college?'#769183':'#5c7c5d';c.fillRect(cx-82,5*T,164,(m.height-8)*T);c.fillStyle='#ccb889';c.fillRect(cx-77,5*T+5,154,(m.height-8)*T-10);for(let y=5*T+16;y<(m.height-3)*T;y+=T){c.fillStyle=college?'#65867a':'#ae7956';c.fillRect(cx-65,y,130,6);for(const dx of [-48,48]){c.fillRect(cx+dx-5,y+15,10,10);}}}
  if(m.id==='restaurant')for(const o of m.objects.filter(o=>o.type==='cooking-table')){c.fillStyle='#4e7861';c.fillRect(o.x-130,o.y-82,260,145);c.fillStyle='#d8c195';c.fillRect(o.x-121,o.y-73,242,127);c.strokeStyle='#aa7952';c.lineWidth=3;c.strokeRect(o.x-113,o.y-65,226,111);}
  c.fillStyle='#365b49';c.fillRect(0,0,V.GroundCache.width(canvas),3*T);c.fillStyle='#c4b48b';c.fillRect(T,3*T-30,V.GroundCache.width(canvas)-2*T,22);for(let x=3*T;x<(m.width-3)*T;x+=6*T){c.fillStyle='#ddc899';c.fillRect(x,30,3*T,72);c.fillStyle='#a6c7ba';c.fillRect(x+8,38,3*T-16,54);c.fillStyle='#416457';c.fillRect(x+1.5*T-3,38,6,54);}
  c.fillStyle='#254d3e';c.fillRect(T,3*T,12,(m.height-4)*T);c.fillRect((m.width-1)*T-12,3*T,12,(m.height-4)*T);V.Engine.text(c,m.name.toUpperCase()+' · SABERES EM MOVIMENTO',V.GroundCache.width(canvas)/2,3*T-5,'#2b4839',17,'center');
  const words=m.id==='kitchen'?['PREPARAR','COZINHAR','COMPARTILHAR']:college?['MEMÓRIA ALIMENTAR','PESQUISA','AULAS ABERTAS']:['RESTAURANTE DOS SABERES','COMIDA E CONVERSA'];words.forEach((s,i)=>{const x=(i+.5)*V.GroundCache.width(canvas)/words.length;c.fillStyle='#335a47';c.fillRect(x-120,3.6*T,240,29);V.Engine.text(c,s,x,3.6*T+21,'#f4dfac',14,'center');});m.cache=canvas;
 },
 draw(c,o,cam){const x=o.x-cam.x,y=o.y-cam.y;
  if(o.marketKitchen){A.frame(c,'world',0,0,x-77,y-136,154,154);return true;}
  if(o.marketWater||o.type==='cooking-station'&&o.role==='water'){const f=V.settings.reducedMotion?1:1+Math.floor(V.Engine.time*5)%3;A.frame(c,'world',1,f,x-40,y-112,80,112);return true;}
  if(o.culinaryLink){if(o.culinaryProp!==undefined&&!o.interiorDoor&&!W.current?.culinary){
   const im=A.images.world;
   if(im?.naturalWidth&&this.facadeFrames[o.culinaryProp]){
    const {w,h}=this.facadeSize(o.culinaryProp);
    c.save();c.imageSmoothingEnabled=false;
    c.drawImage(im,...this.facadeFrames[o.culinaryProp],Math.round(x-w/2),Math.round(y-h),w,h);
    c.restore();
   }
   if(W.nearest?.id===o.id)V.Living.marker(c,x,y+16,'E','#ead8aa');
   return true;
  }
  if(o.culinaryProp!==undefined)A.frame(c,'world',0,o.culinaryProp,x-112,y-185,224,190);else{c.fillStyle='#7a6043';c.fillRect(x-44,y-25,88,25);c.fillStyle='#a9c1a1';c.fillRect(x-40,y-21,80,3);}V.Maritime.label(c,places[o.to]?.name||'Praça das Vozes',x,y-13,W.nearest?.id===o.id);return true;}
  if(o.type==='cooking-station'){A.frame(c,'world',0,3,x-110,y-118,220,130);return true;}
  if(o.type==='cooking-npc'){V.SceneShadows?.character(c,o.character,x,y,66,0,0,true);V.Assets.sprite(c,o.character,x,y,0,0,66);if(W.nearest?.id===o.id)V.Maritime.label(c,o.name,x,y-77,true);return true;}
  if(o.type==='cooking-table'){C.prop(c,'home',18,x-80,y-106,160);if(!o.desk)A.frame(c,'dishes',0,0,x+16,y-48,43,32);else{c.fillStyle='#3b6d60';c.fillRect(x+12,y-43,35,22);c.fillStyle='#e9dbb9';c.fillRect(x+17,y-40,25,16);}return true;}
  if(o.type==='cooking-plant'){C.prop(c,'home',23,x-39,y-81,78);return true;}
  if(o.type==='cooking-pantry'){C.prop(c,'home',21,x-60,y-102,120);return true;}
  if(o.type==='cooking-board'){c.fillStyle='#a18352';c.fillRect(x-92,y-104,184,96);c.fillStyle='#214a3c';c.fillRect(x-86,y-98,172,84);V.Engine.text(c,'SABERES À MESA',x,y-65,'#efe3bc',13,'center');V.Engine.text(c,'Cozinha · pessoas · lugares',x,y-43,'#b5cda8',10,'center');return true;}
  if(o.type==='cooking-bookshelf'){c.fillStyle='#775739';c.fillRect(x-72,y-76,144,84);for(let row=0;row<2;row++)for(let i=0;i<11;i++){c.fillStyle=['#456f5c','#bb8e5a','#884f40','#e0c996'][i%4];c.fillRect(x-64+i*12,y-68+row*37,9,30);}return true;}return false;
 },
 render(c){const m=W.current,cam=W.camera;if(!m.cache)this.ground(m);c.save();c.imageSmoothingEnabled=false;V.GroundCache.draw(c, m.cache, -Math.round(cam.x), -Math.round(cam.y));const all=[...V.RenderView.objects(c,m,cam).map(o=>({y:o.y,o})),{y:V.Player.data.y,player:true}];for(const row of all.sort((a,b)=>a.y-b.y)){if(row.player)V.Player.render(c);else if(!this.draw(c,row.o,cam))C.drawObject(c,row.o,cam);}if(V.PixPresence.following())V.PixPresence.draw(c,V.Player.data,cam);if(W.transition>0){c.globalAlpha=W.transition;c.fillStyle='#284a41';c.fillRect(0,0,c.canvas.width,c.canvas.height);}c.restore();W.drawMiniMap();},
 shop(){return{id:'restaurant-lia',map:'restaurant',name:'Lia',shop:'Restaurante dos Saberes',sprite:'viviane',text:'Nosso cardápio reúne pratos com histórias e lugares próprios. Visite a cozinha ao fundo para aprender as etapas.',stock:D.recipes.map(r=>r.output).filter((id,i,list)=>list.indexOf(id)===i).concat(['market-coco','market-rooibos','market-flask-water'])};},
 classroom(){V.UI.modal('Aula aberta · sabores e contextos','UNIVERSIDADE DAS VOZES',`<p>A professora Jamila propõe comparar ingredientes, técnicas e territórios. Escolha uma oficina ou responda às perguntas de hoje.</p><div class="stack"><p><b>Acarajé e abará:</b> ambos levam feijão-fradinho; o primeiro é frito, o segundo cozinha na folha.</p><p><b>Umngqusho:</b> usa samp, milho quebrado, junto do feijão. Pap usa farinha de milho.</p><p><b>Koesister do Cabo:</b> doce oval com especiarias, calda e coco, ligado à comunidade Cape Malay.</p></div>`,'<button id="university-recipes" class="primary">Aula prática de cozinha</button><button id="university-quiz" class="secondary">Conferir o que aprendi</button><button id="university-sources" class="secondary">Consultar referências</button>');V.$('#university-recipes').onclick=()=>K.book();V.$('#university-quiz').onclick=()=>this.quiz();V.$('#university-sources').onclick=()=>K.references();},
 quiz(index=0,hits=0){const qs=[['Qual dos dois é cozido na folha?',['Acarajé','Abará'],1],['Qual grão é usado no umngqusho?',['Samp · milho quebrado','Farinha de milho'],0],['Qual doce é oval e coberto de coco?',['Koesister do Cabo','Koeksister trançado'],0]];if(index>=qs.length){if(hits===qs.length)V.Progress.reward('university-food-class',20);V.UI.modal('Aula concluída','UNIVERSIDADE DAS VOZES',`<p>${hits}/${qs.length} respostas. ${hits===qs.length?'Você relacionou os pratos às suas técnicas e contextos.':'Releia as comparações na aula e experimente outra vez.'}</p>`,'<button id="university-again" class="primary">Voltar à aula</button>');V.$('#university-again').onclick=()=>this.classroom();return;}const[q,answers,correct]=qs[index];V.UI.modal('Conferir o que aprendi','PERGUNTA '+(index+1)+'/3',`<p>${q}</p><div class="stack">${answers.map((a,i)=>`<button class="secondary" data-university-answer="${i}">${a}</button>`).join('')}</div>`);V.$$('[data-university-answer]').forEach(b=>b.onclick=()=>this.quiz(index+1,hits+(+b.dataset.universityAnswer===correct?1:0)));}
};
U.setup();
const install=M.install.bind(M);M.install=function(m){const out=install(m);for(const o of m?.objects||[])if(o.marketKitchen){const solid=m.solids.find(s=>s.owner===o.id);if(solid)Object.assign(solid,{x:o.x-53,y:o.y-30,w:106,h:28});o.label='Barraquinha · Cozinha dos Saberes';}return out;};
const marketDraw=M.draw.bind(M);M.draw=function(c,o,cam){return U.draw(c,o,cam)||marketDraw(c,o,cam);};
const init=W.init.bind(W);W.init=function(...args){const out=init(...args);U.seed();return out;};
const preview=S.preview.bind(S);S.preview=function(id,d){return places[id]?U.build(id,d):preview(id,d);};
const load=W.load.bind(W);W.load=function(id,pos){if(places[id]&&!pos){const s=C.layouts[id].spawn;pos={x:s[0]*T,y:s[1]*T};}return load(id,pos);};
const ground=C.ground.bind(C);C.ground=function(m){return m.culinary?U.ground(m):ground(m);};
const render=C.render.bind(C);C.render=function(c){return W.current?.culinary?U.render(c):render(c);};
for(const owner of [C,V.Maritime,V.CapeRegion]){const draw=owner.drawObject.bind(owner);owner.drawObject=function(c,o,cam,...args){if(U.draw(c,o,cam))return;return draw(c,o,cam,...args);};}
const person=C.person.bind(C);C.person=function(o){return o?.type==='cooking-npc'||person(o);};
const landmark=V.Atlas.landmark.bind(V.Atlas);V.Atlas.landmark=function(c,o,m){return U.draw(c,o,{x:0,y:0})||landmark(c,o,m);};
const mapGroups=V.MapAssets.groups.bind(V.MapAssets);V.MapAssets.groups=function(m){const out=mapGroups(m);if(m?.culinary||m?.objects.some(o=>o.marketKitchen||o.marketWater||o.culinaryLink))out.push('cooking-world');return [...new Set(out)];};
const category=F.category.bind(F);F.category=function(id){return id==='restaurant'?'shop':places[id]?'culture':category(id);};
const root=F.root.bind(F);F.root=function(id){return places[id]?'hub':root(id);};
V.Hooks.around(V.Game, 'interact', 'cooking-world:interact:1', nextHook => function(o){if(!V.modal&&!V.Dialogue.active&&V.Game.mode==='explore'){if(o?.culinaryLink)return W.load(o.to);if(o?.role==='restaurant-shop')return M.shop(U.shop());if(o?.role==='book')return K.book();if(o?.role==='water'&&o.type==='cooking-station')return M.water();if(o?.role==='references')return K.references();if(o?.role==='class')return U.classroom();}return nextHook(o);});
})();

});
