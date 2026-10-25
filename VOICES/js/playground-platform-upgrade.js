/* Palavras em Movimento: authored routes, responsive camera and input parity. */
(function wordsInMotionEdition() {
'use strict';
const V=window.V,P=V.Playground,D=V.PlaygroundData,C=P.controllers.platform,clamp=V.clamp;
const colors={ink:'#173d3c',paper:'#f5e5c3',gold:'#f2cc7d',mint:'#94c9aa',coral:'#e6a087'};
const scenes=[
 {title:'Praça das palavras',art:'square',phrase:['Read','a','book'],pt:'Leia um livro.',length:2220,heights:[405,365,395],soil:'#698a71',edge:'#9cba83'},
 {title:'Jardins suspensos',art:'garden',phrase:['Water','the','garden'],pt:'Regue o jardim.',length:2380,heights:[398,349,382],soil:'#618771',edge:'#a4bd7c'},
 {title:'Mercado da cidade',art:'market',phrase:['Walk','with','friends'],pt:'Caminhe com amigos.',length:2480,heights:[400,354,388],soil:'#9b8366',edge:'#d7b880',boss:true},
 {title:'Caminhos do arquivo',art:'archive',phrase:['Keep','our','stories'],pt:'Preserve nossas histórias.',length:2420,heights:[392,345,376],soil:'#648a83',edge:'#a4b99a'},
 {title:'Telhados ao luar',art:'rooftops',phrase:['Listen','to','music'],pt:'Ouça música.',length:2600,heights:[400,349,378],soil:'#526b78',edge:'#91ada6'},
 {title:'Festival das vozes',art:'festival',phrase:['Share','our','knowledge'],pt:'Compartilhe nosso conhecimento.',length:2820,heights:[392,344,380],soil:'#537d78',edge:'#abd0a2',boss:true}
];
const art={};
for(const name of [...scenes.map(s=>s.art),'sentry','wisp','boss','book','coin']){
 const img=new Image();img.src='assets/challenges/platform/'+name+'.svg?v=20261024-platform2';art[name]=img;
}
function box(c,x,y,w,h,fill,outline){
 c.fillStyle=fill;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
 if(outline){c.strokeStyle=outline;c.lineWidth=2;c.strokeRect(Math.round(x)+1,Math.round(y)+1,Math.round(w)-2,Math.round(h)-2);}
}
function label(c,value,x,y,size=14,color=colors.paper,maxWidth=400){
 c.save();c.font='700 '+size+'px system-ui,sans-serif';
 const width=c.measureText(value).width;if(width>maxWidth)c.font='700 '+Math.max(9,Math.floor(size*maxWidth/width))+'px system-ui,sans-serif';
 c.textAlign='center';c.textBaseline='middle';c.fillStyle=color;c.fillText(value,x,y);c.restore();
}
function image(c,id,x,y,w,h){const img=art[id];if(img?.width){c.drawImage(img,Math.round(x),Math.round(y),w,h);return true;}return false;}
function makeStage(training,stage=0){
 stage=clamp(stage,0,5);const cfg=scenes[stage],wordX=training?[350]:[370,1040,1740];
 const platforms=training?[{x:265,y:405,w:190},{x:730,y:390,w:180}]:[
  {x:275,y:cfg.heights[0],w:190},{x:735,y:410,w:145},{x:945,y:cfg.heights[1],w:190},
  {x:1420,y:414,w:142},{x:1645,y:cfg.heights[2],w:190},{x:1930,y:402,w:138}
 ];
 const phrase=training?['book']:cfg.phrase;
 const notes=phrase.map((word,i)=>({word,x:wordX[i],y:(training?405:cfg.heights[i])-48}));
 const checkpoints=training?[]:[{x:810,y:455,name:'Praça segura'},{x:1510,y:455,name:'Ponto de encontro'}];
 const coins=[];
 for(const p of platforms)for(let j=0;j<3;j++)coins.push({x:p.x+25+j*48,y:p.y-25});
 for(const x of [180,580,660,1230,1300,2020,2120])if(x<(training?1080:cfg.length)-150)coins.push({x,y:425});
 const enemies=training?[]:[
  {home:650,x:650,y:428,hp:1,alive:true,phase:.2,type:'sentry'},
  ...(stage>0?[{home:1280,x:1280,y:365,hp:stage>3?2:1,alive:true,phase:1.1,type:'wisp'}]:[]),
  ...(stage>1?[{home:1950,x:1950,y:428,hp:stage>3?2:1,alive:true,phase:2,type:'sentry'}]:[])
 ];
 const boss=!training&&cfg.boss?{x:cfg.length-270,y:418,hp:stage===5?9:6,max:stage===5?9:6,alive:true,phase:0,shotClock:0,warning:false,hitCooldown:0}:null;
 return {pmVersion:2,stage,title:cfg.title,length:training?1080:cfg.length,x:80,y:455,vx:0,vy:0,cam:0,facing:2,grounded:true,coyote:.12,
  platforms,notes,required:phrase.length,wordIndex:[],coins:[],coinItems:coins,enemies,boss,bolts:[],enemyBolts:[],
  hazards:training?[]:stage===0?[600]:stage===1?[610,1320]:[600,1320,stage>3?2180:1910],
  checkpoints,checkpoint:80,checkpointIndex:-1,hearts:3,power:100,invuln:0,respawns:0,defeated:0,
  attackCooldown:0,dashCooldown:0,dash:0,airJumps:0,finishWait:0,elapsed:0,fx:[],jumpBuffer:0,dropTimer:0};
}
function ready(r){
 const d=r.data;if(d.pmVersion!==2){
  const fresh=makeStage(r.training,d.stage||0),done=Array.isArray(d.wordIndex)?Math.min(d.wordIndex.length,fresh.required):0;
  fresh.wordIndex=Array.from({length:done},(_,i)=>i);
  fresh.x=clamp((Number(d.x)||80)/Math.max(1,Number(d.length)||fresh.length)*fresh.length,45,fresh.length-100);
  fresh.hearts=clamp(Number(d.hearts)||3,1,3);fresh.power=clamp(Number(d.power)??100,0,100);
  if(!Number.isFinite(fresh.power))fresh.power=100;
  fresh.respawns=d.respawns||0;fresh.coins=Array.isArray(d.coins)?d.coins.filter(i=>i<fresh.coinItems.length):[];
  if(fresh.boss&&d.boss){fresh.boss.alive=d.boss.alive;fresh.boss.hp=clamp(d.boss.hp,0,fresh.boss.max);}
  for(let i=0;i<fresh.checkpoints.length;i++)if(fresh.checkpoints[i].x<=fresh.x){fresh.checkpointIndex=i;fresh.checkpoint=fresh.checkpoints[i].x;}
  Object.assign(d,fresh);d.cam=clamp(d.x-310,0,Math.max(0,d.length-(P.platformView?.width||960)));
 }
 d.fx||=[];d.coinItems||=[];d.bolts||=[];d.enemyBolts||=[];return d;
}
function burst(d,x,y,color=colors.gold,count=8){
 if(V.settings.reducedMotion)count=3;
 for(let i=0;i<count;i++)d.fx.push({x,y,vx:(i%5-2)*35,vy:-60-i%3*25,t:.5,max:.5,color});
 d.fx=d.fx.slice(-55);
}
function floating(d,value,x,y,color=colors.paper){d.fx.push({x,y,t:.9,max:.9,vy:-34,vx:0,text:value,color});}
function awardWord(r,d,index){
 d.wordIndex.push(index);P.hit(100);const word=d.notes[index].word;
 if(!r.training)V.PixCollection.collect(word.toLowerCase(),'Palavras em Movimento');
 P.feedback('✓ '+word+' · '+d.wordIndex.length+'/'+d.required+' palavras');
 burst(d,d.notes[index].x,d.notes[index].y);floating(d,word,d.notes[index].x,d.notes[index].y-30);
 P.event('platform-word');
}
const input=P.platformInput={x:0,jump:false,attack:false,pointers:new Map()};
const resetInput=()=>{input.x=0;input.jump=false;input.attack=false;input.pointers.clear();};
window.addEventListener('blur',resetInput);
window.addEventListener('pointerup',e=>{if(input.pointers.has(e.pointerId)){input.pointers.delete(e.pointerId);input.x=[...input.pointers.values()].at(-1)||0;}});
window.addEventListener('pointercancel',resetInput);

const info=D.games.find(g=>g.id==='platform');
info.description='Monte frases coletando palavras em seis percursos. Salte, use impulso e derrote os guardiões do arquivo.';
info.goal='Complete seis rotas e recupere as seis frases.';
info.keys='← → / A D · espaço salta (duplo no ar) · ↓ desce · J lança energia · K dá impulso';
D.guides.platform=[
 {title:'Você controla o percurso',text:'Setas ou A/D movem a personagem. No celular, segure um dos direcionais.',instruction:'Caminhe para a direita.',event:'platform-walk',focus:'game'},
 {title:'Um salto, muitas possibilidades',text:'Espaço ou Saltar faz o salto. Segure para ganhar altura; um segundo toque no ar dá um salto extra.',instruction:'Faça um salto.',event:'platform-jump',focus:'action'},
 {title:'Palavras são colecionáveis',text:'O livro com uma palavra está acima da plataforma. Aproxime-se e salte para recolher. Na partida, três palavras formam uma frase.',instruction:'Recolha a palavra book.',event:'platform-word',focus:'game'},
 {title:'Abra espaço com energia',text:'J ou Energia lança um pulso na direção para a qual você está olhando. O alvo à frente é só para praticar.',instruction:'Olhe para o alvo e acerte-o com Energia.',event:'platform-attack',focus:'game'},
 {title:'Um impulso no momento certo',text:'K ou Impulso dá uma arrancada curta. Você pode atravessar sinais e acertar guardiões durante esse movimento.',instruction:'Use o impulso uma vez.',event:'platform-dash',focus:'game'},
 {title:'Também dá para descer',text:'Nesta plataforma, ↓, S ou Descer permite voltar ao chão. Você mantém todas as palavras coletadas.',instruction:'Desça desta plataforma.',event:'platform-drop',focus:'game'},
 {title:'O portal fecha a rota',text:'Com as palavras coletadas, o portal fica verde. Nas fases 3 e 6, derrote também o guardião antes de sair.',instruction:'Caminhe até o portal verde.',event:'platform-exit',focus:'game',after:'Pronto! O jogo salva as palavras e os checkpoints. Você pode pedir uma dica ou pausar a qualquer momento.'}
];
C.create=(training,start=0)=>makeStage(training,start);
C.guideStep=function(r){
 const d=ready(r);
 if(r.step===2&&d.wordIndex.length){d.wordIndex=[];d.notes[0].x=Math.max(350,d.x+110);d.notes[0].y=357;}
 if(r.step===3){d.x=530;d.y=455;d.vx=0;d.vy=0;d.grounded=true;d.trainingTarget={home:670,x:670,y:428,hp:1,alive:true,phase:0,type:'sentry'};d.enemies=[d.trainingTarget];d.facing=2;d.power=100;}
 if(r.step===5){d.x=815;d.y=390;d.vx=0;d.vy=0;d.grounded=true;d.airJumps=0;d.cam=clamp(d.x-310,0,Math.max(0,d.length-(P.platformView?.width||960)));}
};
C.model=function(r){
 const d=ready(r),cfg=scenes[d.stage],missing=d.notes.find((n,i)=>!d.wordIndex.includes(i));
 return {request:(r.training?'Treino com PIX':'Fase '+(d.stage+1)+'/6')+' · '+cfg.title,
  support:r.translations?(r.training?'Aprenda os movimentos dentro do percurso.':cfg.pt):'Recolha os livros com palavras para abrir o portal.',
  progress:d.wordIndex.length,total:d.required,action:'Saltar · espaço',
  hint:missing?'Próxima palavra: '+missing.word+'. Use o salto para alcançar a plataforma.':d.boss?.alive?'Frase recuperada! Derrote o guardião para liberar o portal.':'Portal aberto! Siga até a saída.'};
};
C.hud=function(r){
 const root=V.$('#playground-root');if(!root)return;const d=ready(r);root.classList.add('pm-playing');
 let host=V.$('#pm-dashboard');
 if(!host){host=document.createElement('div');host.id='pm-dashboard';host.innerHTML='<div id="pm-phrase" aria-label="Palavras da frase"></div><div class="pm-status"><span id="pm-health"></span><span class="pm-energy-label">Energia</span><meter id="pm-energy" min="0" max="100" value="100" aria-label="Energia disponível"></meter><span id="pm-energy-value"></span></div>';V.$('.pg-mission').append(host);}
 const key=d.stage+':'+r.training+':'+d.wordIndex.join(',')+':'+d.notes.map(n=>n.word).join(',');
 const phrase=V.$('#pm-phrase');
 if(phrase.dataset.key!==key){phrase.dataset.key=key;phrase.innerHTML=d.notes.map((n,i)=>'<span class="'+(d.wordIndex.includes(i)?'collected':'')+'"><i aria-hidden="true">'+(d.wordIndex.includes(i)?'✓':String(i+1))+'</i>'+V.escape(n.word)+'</span>').join('');}
 const hearts=V.$('#pm-health');hearts.textContent='♥'.repeat(d.hearts)+'♡'.repeat(3-d.hearts);hearts.setAttribute('aria-label',d.hearts+' de 3 vidas');
 V.$('#pm-energy').value=d.power;V.$('#pm-energy-value').textContent=Math.round(d.power)+'%';
 const attack=V.$('#pg-attack'),dash=V.$('#pg-dash');if(attack){attack.disabled=d.power<6;attack.setAttribute('aria-label','Lançar energia com J');}
 if(dash){dash.disabled=d.power<25||d.dashCooldown>0;dash.setAttribute('aria-label','Dar impulso com K');}
};
function capture(button,e){e.preventDefault();V.Audio.unlock();try{button.setPointerCapture(e.pointerId);}catch(_){}}
C.controls=function(r,host){
 resetInput();
 const arrows=document.createElement('div');arrows.className='pm-direction';
 for(const [id,dir,label]of [['left',-1,'←'],['right',1,'→']]){
  const b=P.button('pg-'+id,label,()=>{});b.setAttribute('aria-label',dir<0?'Caminhar à esquerda':'Caminhar à direita');
  b.onpointerdown=e=>{capture(b,e);input.pointers.set(e.pointerId,dir);input.x=dir;};
  const release=e=>{input.pointers.delete(e.pointerId);input.x=[...input.pointers.values()].at(-1)||0;};
  b.onpointerup=b.onpointercancel=b.onlostpointercapture=release;arrows.append(b);
 }
 const jump=P.button('pg-action','Saltar · espaço',()=>{},'primary');
 jump.onclick=null;jump.onpointerdown=e=>{capture(jump,e);input.jump=true;P.action('jump');};
 jump.onpointerup=jump.onpointercancel=jump.onlostpointercapture=()=>{input.jump=false;};
 const attack=P.button('pg-attack','Energia · J',()=>{});
 attack.onclick=null;attack.onpointerdown=e=>{capture(attack,e);input.attack=true;P.action('attack');};
 attack.onpointerup=attack.onpointercancel=attack.onlostpointercapture=()=>{input.attack=false;};
 host.append(arrows,jump,P.button('pg-drop','↓ Descer',()=>P.action('drop')),attack,P.button('pg-dash','Impulso · K',()=>P.action('dash')));
};
C.key=function(r,k){
 if(['arrowleft','arrowright','a','d'].includes(k))return true;
 if([' ','w','arrowup'].includes(k)){P.action('jump');return true;}
 if(['s','arrowdown'].includes(k)){P.action('drop');return true;}
 if(['j','x'].includes(k)){P.action('attack');return true;}
 if(['k','shift','z'].includes(k)){P.action('dash');return true;}return false;
};
C.action=function(r,name){
 const d=ready(r);
 if(name==='jump'){
  if(d.grounded||d.coyote>0){d.vy=-520;d.grounded=false;d.coyote=0;d.airJumps=0;}
  else if(d.airJumps<1){d.airJumps++;d.vy=-470;burst(d,d.x,d.y-5,colors.mint,6);}
  else {d.jumpBuffer=.14;return;}
  d.jumpHeld=true;d.jumpAge=0;d.jumpBuffer=0;r.moves++;P.event('platform-jump');V.Audio.sfx('menu');return;
 }
 if(name==='drop'){if(d.grounded&&d.y<450){d.dropTimer=.28;d.y+=9;d.vy=100;d.grounded=false;d.coyote=0;r.moves++;P.event('platform-drop');}return;}
 if(name==='attack'){
  if(d.attackCooldown>0||d.power<6)return;
  d.attackCooldown=.23;d.power-=6;d.attackPose=.16;r.moves++;
  d.bolts.push({x:d.x+(d.facing===1?-24:24),y:d.y-35,dir:d.facing===1?-1:1,life:.95});V.Audio.sfx('menu');return;
 }
 if(name==='dash'){
  if(d.dashCooldown>0||d.power<25)return;
  d.power-=25;d.dash=.2;d.dashDir=d.facing===1?-1:1;d.invuln=Math.max(d.invuln,.32);d.dashCooldown=.85;r.moves++;burst(d,d.x,d.y-25,colors.mint);P.event('platform-dash');
 }
};
function hurt(r,d,message){
 if(r.training||d.invuln>0)return;
 d.hearts--;d.invuln=1.45;d.vy=-220;d.vx=d.facing===1?125:-125;d.x=clamp(d.x+(d.facing===1?25:-25),28,d.length-30);d.respawns++;P.feedback(message,true);burst(d,d.x,d.y-30,colors.coral);
 if(d.hearts<=0){d.hearts=3;d.x=d.checkpoint;d.y=455;d.vx=0;d.vy=0;d.enemyBolts=[];d.cam=clamp(d.x-310,0,Math.max(0,d.length-(P.platformView?.width||960)));P.feedback('De volta ao checkpoint. Suas palavras e moedas estão guardadas.');}
}
function defeat(r,d,e){
 e.alive=false;d.defeated++;d.power=Math.min(100,d.power+18);P.hit(70);burst(d,e.x,e.y-10,colors.mint);floating(d,'+18 energia',e.x,e.y-35,colors.mint);
 if(r.training)P.event('platform-attack');
}
C.update=function(r,dt){
 const d=ready(r),difficulty=P.difficulty(r);d.elapsed+=dt;
 for(const k of ['invuln','attackCooldown','dashCooldown','attackPose','dropTimer','finishWait','jumpBuffer','hintTime'])d[k]=Math.max(0,(d[k]||0)-dt);
 d.fx.forEach(f=>{f.x+=f.vx*dt;f.y+=f.vy*dt;if(!f.text)f.vy+=100*dt;f.t-=dt;});d.fx=d.fx.filter(f=>f.t>0);
 d.power=Math.min(100,d.power+15*dt);d.jumpAge=(d.jumpAge||0)+dt;
 const axis=clamp(V.Input.axis().x+input.x,-1,1),speed=[245,275,300][difficulty],beforeY=d.y;
 if(axis){d.facing=axis<0?1:2;P.event('platform-walk');}
 if(r.training&&r.ack)return;
 const targetSpeed=axis*speed,accel=d.grounded?1800:1300;
 d.vx+=(targetSpeed-d.vx)*Math.min(1,dt*accel/speed);
 if(!axis&&Math.abs(d.vx)<5)d.vx=0;
 if(d.dash>0){d.x+=d.dashDir*700*dt;d.dash=Math.max(0,d.dash-dt);}
 else d.x+=d.vx*dt;
 d.x=clamp(d.x,28,d.length-28);
 const heldJump=input.jump||V.Input.down(' ')||V.Input.down('w')||V.Input.down('arrowup');
 if(d.jumpHeld&&!heldJump&&d.jumpAge>.09&&d.vy< -300)d.vy=-300;
 if(!heldJump)d.jumpHeld=false;
 d.vy=clamp(d.vy+1120*dt,-650,720);d.y+=d.vy*dt;d.grounded=false;
 const surfaces=[{x:0,y:455,w:d.length},...(d.dropTimer>0?[]:d.platforms)].filter(p=>d.x>=p.x-10&&d.x<=p.x+p.w+10&&d.vy>=0&&beforeY<=p.y+4&&d.y>=p.y).sort((a,b)=>a.y-b.y);
 if(surfaces.length){
  d.y=surfaces[0].y;d.vy=0;d.grounded=true;d.coyote=.12;d.airJumps=0;
  if(d.jumpBuffer>0)this.action(r,'jump');
 }else d.coyote=Math.max(0,d.coyote-dt);
 if(d.y>560){d.y=455;d.x=d.checkpoint;d.vy=0;hurt(r,d,'Checkpoint recuperado. Tente o próximo salto.');}
 for(const [i,n]of d.notes.entries())if(!d.wordIndex.includes(i)&&Math.abs(d.x-n.x)<40&&Math.abs(d.y-29-n.y)<39)awardWord(r,d,i);
 for(const [i,coin]of d.coinItems.entries())if(!d.coins.includes(i)&&Math.hypot(d.x-coin.x,d.y-28-coin.y)<31){d.coins.push(i);d.power=Math.min(100,d.power+5);P.hit(15);burst(d,coin.x,coin.y,colors.gold,3);}
 for(const [i,cp]of d.checkpoints.entries())if(i>d.checkpointIndex&&d.x>=cp.x&&d.grounded){
  d.checkpointIndex=i;d.checkpoint=cp.x;P.feedback('✓ Checkpoint ativado. Palavras e moedas preservadas.');floating(d,'CHECKPOINT',cp.x,390,colors.mint);P.save();
 }
 if(d.hazards.some(x=>Math.abs(x-d.x)<24&&d.y>419))hurt(r,d,'Salte sobre os espinhos ou use o impulso.');
 for(const e of d.enemies){
  if(!e.alive)continue;e.phase+=dt*(.85+d.stage*.07);
  e.x=e.home+(r.training?0:Math.sin(e.phase)*36);
  const ey=e.y+(e.type==='wisp'?Math.sin(e.phase*1.5)*13:0);e.drawY=ey;
  if(Math.abs(d.x-e.x)<30&&Math.abs(d.y-30-ey)<35){
   if(d.dash>0){e.hp=0;defeat(r,d,e);}
   else if(d.vy>65&&beforeY<ey-10){e.hp--;d.vy=-350;d.airJumps=0;if(e.hp<=0)defeat(r,d,e);}
   else hurt(r,d,'Guardião no caminho! Salte por cima, lance energia ou use o impulso.');
  }
 }
 if(input.attack||V.Input.down('j')||V.Input.down('x'))this.action(r,'attack');
 if(d.boss?.alive){
  const b=d.boss;b.phase+=dt;b.hitCooldown=Math.max(0,b.hitCooldown-dt);b.shotClock+=dt;
  const interval=[3.7,3.1,2.7][difficulty];b.warning=b.shotClock>=interval-.7;
  if(b.shotClock>=interval){
   b.shotClock=0;b.warning=false;
   const dx=d.x-b.x,dy=d.y-28-(b.y-20),len=Math.max(1,Math.hypot(dx,dy)),speed=[155,185,215][difficulty];
   for(const spread of d.stage===5?[-.11,.11]:[0]){const angle=Math.atan2(dy,dx)+spread;d.enemyBolts.push({x:b.x,y:b.y-20,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,life:5});}
  }
  if(Math.abs(d.x-b.x)<50&&Math.abs(d.y-31-b.y)<52){
   if(d.vy>70&&beforeY<b.y-26&&b.hitCooldown<=0){b.hp--;b.hitCooldown=.35;d.vy=-400;d.airJumps=0;burst(d,b.x,b.y-20);}
   else hurt(r,d,'Afaste-se do guardião e observe o sinal antes do ataque.');
  }
 }
 for(const b of d.bolts){
  b.x+=b.dir*660*dt;b.life-=dt;if(b.life<=0)continue;
  const e=d.enemies.find(e=>e.alive&&Math.abs(e.x-b.x)<28&&Math.abs((e.drawY||e.y)-b.y)<37);
  if(e){e.hp--;b.life=0;burst(d,b.x,b.y);if(e.hp<=0)defeat(r,d,e);continue;}
  if(d.boss?.alive&&Math.abs(d.boss.x-b.x)<48&&Math.abs(d.boss.y-12-b.y)<53){d.boss.hp--;b.life=0;burst(d,b.x,b.y);}
 }
 if(d.boss?.alive&&d.boss.hp<=0){d.boss.alive=false;d.enemyBolts=[];d.power=100;P.hit(450);burst(d,d.boss.x,d.boss.y-35,colors.gold,18);P.feedback('✓ Guardião vencido! Recupere a frase e siga para o portal.');}
 for(const b of d.enemyBolts){b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(Math.hypot(d.x-b.x,d.y-28-b.y)<25){hurt(r,d,'Sinal de energia! Salte ou use o impulso para desviar.');b.life=0;}}
 d.bolts=d.bolts.filter(b=>b.life>0&&b.x>0&&b.x<d.length);d.enemyBolts=d.enemyBolts.filter(b=>b.life>0);
 const viewWidth=P.platformView?.width||960,desired=clamp(d.x-viewWidth*.31,0,Math.max(0,d.length-viewWidth));
 d.cam+=(desired-d.cam)*Math.min(1,dt*7);
 if(d.x>=d.length-83){
  if(d.wordIndex.length<d.required||d.boss?.alive){if(!d.finishWait){P.feedback(d.boss?.alive?'O guardião ainda protege este portal.':'Faltam palavras da frase. Use Dica para encontrar a próxima.');d.finishWait=1.8;}}
  else if(r.training)P.event('platform-exit');
  else{
   P.hit(300);P.stageClear(r,d.stage);
   if(d.stage>=5)P.finish();
   else{r.data=makeStage(false,d.stage+1);P.feedback('✓ '+scenes[d.stage].phrase.join(' ')+'. Próxima rota liberada!');resetInput();}
  }
 }
};

// The camera fits the available playfield, including landscape mobile.
const baseLayout=P.layout.bind(P);
P.layout=function(){
 if(this.active?.game!=='platform')return baseLayout();
 const area=this.sceneBounds(),height=area.w/Math.max(1,area.h)>3.25?344:406,top=518-height;
 const width=clamp(Math.round(Math.max(1,area.w-8)/Math.max(1,area.h-8)*height),760,2100),scale=Math.max(.01,Math.min((area.w-8)/width,(area.h-8)/height));
 this.platformView={width,height,scale};return{scale,x:area.x+(area.w-width*scale)/2,y:area.y+(area.h-height*scale)/2-top*scale};
};
function platformPaint(c,p,cam,theme){
 const x=p.x-cam;
 box(c,x,p.y,p.w,12,theme.edge,colors.paper);box(c,x+5,p.y+12,p.w-10,12,'#466b59');
 for(let i=0;i<p.w/23;i++){box(c,x+7+i*23,p.y+5,14,2,'#f3e5b066');box(c,x+9+i*23,p.y+15,11,4,'#789076');}
 box(c,x+17,p.y+23,8,12,'#37594d');box(c,x+p.w-25,p.y+23,8,12,'#37594d');
 if(p.y<380){for(let i=0;i<3;i++){box(c,x+18,p.y+26+i*8,3,10,'#658c67');box(c,x+16+(i%2)*4,p.y+31+i*8,8,4,'#87a272');}}
}
function portal(c,x,y,open,time,guarded){
 box(c,x-28,y-100,68,102,'#31585a',colors.paper);box(c,x-20,y-92,52,94,open?'#4d9c83':'#4d636b',open?colors.mint:'#8ca6a0');
 box(c,x-15,y-88,42,86,open?'#285d58':'#354b54');box(c,x-33,y-8,78,10,'#bfa779',colors.paper);
 for(let i=0;i<4;i++)box(c,x-8+i*10,y-79+(i%2)*8,4,4,open?colors.mint:'#889b91');
 label(c,open?'SAÍDA':guarded?'GUARDIÃO':'PALAVRAS',x+6,y-116,12,open?colors.mint:colors.paper);
 if(open){c.save();c.globalAlpha=.23;box(c,x-11,y-75,34,70,colors.mint);c.restore();label(c,'✓',x+6,y-48,25,colors.paper);}
 else{box(c,x-3,y-58,18,20,'#a7b6a4');box(c,x+1,y-65,10,11,'#a7b6a4');box(c,x+4,y-53,4,9,'#3a5554');}
}
C.draw=function(c,r){
 const d=ready(r),cfg=scenes[d.stage],w=P.platformView?.width||960,cam=d.cam,time=V.settings.reducedMotion?0:r.elapsed;
 box(c,0,0,w,540,d.stage>3?'#33485f':'#accbbb');
 const offset=(cam*.24)%1600;
 if(art[cfg.art]?.width)for(let x=-offset;x<w;x+=1600)image(c,cfg.art,x,0,1600,540);
 else{box(c,0,320,w,140,'#7faaa0');for(let i=0;i<w/140;i++)box(c,i*140-cam*.1%140,290,100,165,'#709b8b');}
 box(c,0,455,w,85,cfg.soil);box(c,0,455,w,10,cfg.edge);box(c,0,465,w,3,'#365f51');
 for(let i=0;i<w/34+2;i++){const x=i*34-cam%34;box(c,x,484+(i%3)*13,11,4,i%2?'#284b4b44':'#d3c18a44');box(c,x+15,478+(i%2)*23,4,3,'#d7c49544');}
 for(const p of d.platforms)if(p.x-cam<w+30&&p.x+p.w-cam>-30)platformPaint(c,p,cam,cfg);
 for(const [i,coin]of d.coinItems.entries()){
  if(d.coins.includes(i)||coin.x-cam< -30||coin.x-cam>w+30)continue;
  image(c,'coin',coin.x-cam-12,coin.y-12,24,24);
 }
 const next=d.notes.findIndex((n,i)=>!d.wordIndex.includes(i));
 for(const [i,n]of d.notes.entries()){
  if(d.wordIndex.includes(i)||n.x-cam< -100||n.x-cam>w+100)continue;
  const x=n.x-cam,y=n.y+(V.settings.reducedMotion?0:Math.sin(time*2.8+i)*2);
  image(c,'book',x-20,y-26,40,40);
  const cardFont=Math.max(14,10/(P.platformView?.scale||1));
  c.save();c.font='700 '+cardFont+'px system-ui,sans-serif';const tw=clamp(c.measureText(n.word).width+24,62,152);c.restore();
  box(c,x-tw/2,y-49,tw,26,i===next?colors.gold:colors.paper,'#436d60');label(c,n.word,x,y-36,cardFont,colors.ink,tw-10);
  if(d.hintTime>0&&i===next){c.save();c.strokeStyle=colors.mint;c.lineWidth=3;c.setLineDash([5,4]);c.strokeRect(x-40,y-54,80,75);c.restore();}
 }
 for(const cp of d.checkpoints){
  const x=cp.x-cam;if(x< -50||x>w+50)continue;
  box(c,x-2,395,4,60,'#34594c');box(c,x+2,397,27,17,d.checkpoint>=cp.x?colors.mint:colors.paper,'#34594c');box(c,x+8,402,13,3,d.checkpoint>=cp.x?'#417761':'#c7b78b');
 }
 for(const hx of d.hazards){const x=hx-cam;if(x< -45||x>w+45)continue;
  box(c,x-25,447,50,8,'#8f5b58');c.fillStyle='#d7a38a';for(let j=0;j<4;j++){c.beginPath();c.moveTo(x-24+j*13,448);c.lineTo(x-18+j*13,426);c.lineTo(x-11+j*13,448);c.fill();}
  box(c,x-25,453,50,3,colors.coral);
 }
 for(const e of d.enemies){
  if(!e.alive||e.x-cam< -70||e.x-cam>w+70)continue;
  const x=e.x-cam,y=e.drawY||e.y;image(c,e.type==='wisp'?'wisp':'sentry',x-30,y-39,60,60);
  if(e.hp>1){box(c,x-15,y-47,30,4,'#365254');box(c,x-15,y-47,15*e.hp,4,colors.coral);}
 }
 if(d.boss?.alive){
  const b=d.boss,x=b.x-cam;
  image(c,'boss',x-57,b.y-87,114,114);
  box(c,x-62,b.y-120,124,10,'#294551',colors.paper);box(c,x-59,b.y-117,118*Math.max(0,b.hp)/b.max,4,colors.coral);
  label(c,b.warning?'ATENÇÃO: SALTE!':'GUARDIÃO DO ARQUIVO',x,b.y-136,12,b.warning?colors.gold:colors.paper,220);
  if(b.warning){c.save();c.strokeStyle=colors.gold;c.lineWidth=2;c.strokeRect(x-61,b.y-90,122,117);c.restore();}
 }
 const open=d.wordIndex.length>=d.required&&!d.boss?.alive;portal(c,d.length-57-cam,455,open,time,!!d.boss?.alive);
 for(const b of d.bolts){const x=b.x-cam;box(c,x-9,b.y-5,18,10,colors.gold,colors.paper);box(c,x-(b.dir>0?18:-12),b.y-2,9,4,'#d0b582');}
 for(const b of d.enemyBolts){const x=b.x-cam;box(c,x-8,b.y-8,16,16,colors.coral,colors.paper);box(c,x-3,b.y-3,6,6,colors.gold);}
 if(d.dash>0&&!V.settings.reducedMotion){c.save();c.globalAlpha=.3;for(let i=1;i<4;i++)box(c,d.x-cam-d.dashDir*i*16-12,d.y-53,24,45,colors.mint);c.restore();}
 P.person(c,d.x-cam,d.y+2,Math.abs(d.vx)>15&&d.grounded,d.facing,66);
 if(d.invuln>0){c.save();c.strokeStyle=colors.gold;c.lineWidth=2;c.beginPath();c.ellipse(d.x-cam,d.y-26,27,35,0,0,Math.PI*2);c.stroke();c.restore();}
 if(d.attackPose>0){box(c,d.x-cam+(d.facing===1?-35:23),d.y-37,12,6,colors.gold);}
 for(const f of d.fx){c.save();c.globalAlpha=Math.min(1,f.t*3);if(f.text)label(c,f.text,f.x-cam,f.y,12,f.color);else box(c,f.x-cam,f.y,4,4,f.color);c.restore();}
 // A route strip communicates distance without hiding scenery or repeating life meters.
 const left=24,right=w-24,y=502;
 box(c,left,y,right-left,3,'#284e4b');
 for(const [i,n]of d.notes.entries()){const x=left+n.x/d.length*(right-left);box(c,x-4,y-3,8,9,d.wordIndex.includes(i)?colors.mint:colors.paper);}
 box(c,left+clamp(d.x/d.length,0,1)*(right-left)-3,y-6,6,14,colors.gold);
 label(c,'INÍCIO',left+10,y+10,9,colors.paper);label(c,'PORTAL',right-14,y+10,9,colors.paper);
};
C.hint=function(r){
 const d=ready(r),n=d.notes.find((n,i)=>!d.wordIndex.includes(i));d.hintTime=5;
 if(n)P.feedback('Procure '+n.word+' '+(n.x<d.x?'à esquerda':'à direita')+'. Salte até o livro acima da plataforma.');
 else P.feedback(d.boss?.alive?'Use J para lançar energia; salte quando o guardião anunciar o ataque.':'Todas as palavras estão com você. Siga à direita até o portal verde.');
};
C.spot=function(r){
 const d=ready(r),w=P.platformView?.width||960;
 let target=r.step===2?d.notes.find((n,i)=>!d.wordIndex.includes(i)):r.step===3?d.enemies.find(e=>e.alive):r.step===6?{x:d.length-55,y:410}:null;
 return{x:clamp((target?.x??d.x)-d.cam,50,w-50),y:target?.y??d.y-28,w:135,h:130};
};
})();
