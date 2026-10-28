(function(){
'use strict';
const V=window.V,P=V.Playground,now=()=>performance.now();
const phrases=[
{text:'Great!',translation:'Mandou bem!',color:'#ffd566',accent:'#ff9c46'},
{text:'Awesome!',translation:'Muito bom!',color:'#72f4c6',accent:'#1ab6a1'},
{text:'Nailed it!',translation:'Acertou em cheio!',color:'#91e8ff',accent:'#4d8bff'},
{text:'Wonderful!',translation:'Maravilha!',color:'#f5a7ff',accent:'#aa72ff'},
{text:'Brilliant!',translation:'Brilhou!',color:'#fff0a1',accent:'#ffb64c'},
{text:'Fantastic!',translation:'Sensacional!',color:'#ffbdb3',accent:'#f075ad'},
{text:'Keep it up!',translation:'Segue assim!',color:'#bbf384',accent:'#58ba89'},
{text:'You rock!',translation:'Você arrasou!',color:'#bdb5ff',accent:'#789bff'}
];
const F=V.MinigamePraise={serial:0,lastAt:-10000,lastText:'',lastWrong:-10000,timer:null,pending:null,lastKey:'',priority:0,history:[],
root(){let el=document.getElementById('minigame-praise');if(el)return el;el=document.createElement('aside');el.id='minigame-praise';el.hidden=true;el.setAttribute('aria-live','polite');el.setAttribute('aria-atomic','true');el.innerHTML='<div class="praise-light" aria-hidden="true"></div><div class="praise-orbit" aria-hidden="true"></div><div class="praise-particles" aria-hidden="true"></div><div class="praise-card"><span class="praise-kicker"></span><strong lang="en" class="praise-title"></strong><span class="praise-detail"></span></div>';document.body.append(el);return el;},
isReduced(){return V.settings?.reducedMotion===true||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;},
position(root){const scene=P.active&&V.$('#pg-scene'),modal=V.$('.modal'),area=(scene||modal||V.$('#stage'))?.getBoundingClientRect();if(!area)return;const compact=innerHeight<520,kind=P.active?.game;let x=area.left+area.width*(kind==='rhythm'?.15:kind==='capoeira'?.79:.77),y=area.top+Math.min(compact?38:64,area.height*.16);if(!scene&&modal){x=area.left+area.width*.72;y=area.top+Math.min(150,area.height*.35);}x=Math.max(112,Math.min(innerWidth-112,x));y=Math.max(58,Math.min(innerHeight-90,y));root.style.left=Math.round(x)+'px';root.style.top=Math.round(y)+'px';root.dataset.compact=String(compact);},
emit(kind='hit',info={}){if(!V.state||V.Game.screen!=='game')return false;const at=now(),priority={hit:1,combo:2,stage:3,win:4}[kind]||1;if(kind==='hit'&&Number.isFinite(info.points)&&info.points<55)return false;const key=info.key||'';if(key&&key===this.lastKey)return false;if(priority<this.priority&&at-this.lastAt<1000)return false;if(priority<3&&at-this.lastAt<520)return false;if(priority<3&&at-this.lastWrong<180)return false;let phrase;
if(kind==='win')phrase={text:'You did it!',translation:'Desafio concluído!',color:'#ffe2a0',accent:'#ed88eb'};
else if(kind==='stage')phrase={text:'Stage clear!',translation:'Etapa concluída!',color:'#9cffe1',accent:'#57c7ff'};
else if((info.combo||0)>=15)phrase={text:'Legendary!',translation:'Sequência incrível!',color:'#edb3ff',accent:'#8e7fff'};
else if((info.combo||0)>=8)phrase={text:'On fire!',translation:'Você está voando!',color:'#ffc180',accent:'#ff7d75'};
else{phrase=phrases[this.serial++%phrases.length];if(phrase.text===this.lastText)phrase=phrases[this.serial++%phrases.length];}
const el=this.root();clearTimeout(this.timer);el.hidden=true;el.style.setProperty('--praise-color',phrase.color);el.style.setProperty('--praise-accent',phrase.accent);el.dataset.kind=kind;el.dataset.reduce=String(this.isReduced());el.querySelector('.praise-title').textContent=phrase.text;el.querySelector('.praise-kicker').textContent=kind==='win'?'CONCLUÍDO':kind==='stage'?'NOVA ETAPA':info.combo>=3?'COMBO ×'+info.combo:'BOM JOGO';el.querySelector('.praise-detail').textContent=info.detail||((info.combo||0)>=3?'Combo ×'+info.combo+' · ':'')+((P.active?.translations===false)?'':phrase.translation);el.querySelector('.praise-particles').innerHTML=this.isReduced()?'':Array.from({length:priority>=3?12:8},(_,i)=>{const angle=i*Math.PI*2/(priority>=3?12:8),distance=priority>=3?88:64;return'<i style="--dx:'+Math.round(Math.cos(angle)*distance)+'px;--dy:'+Math.round(Math.sin(angle)*distance*.65)+'px;--turn:'+(i*41)+'deg;--delay:'+(i%3)*35+'ms"></i>';}).join('');this.position(el);void el.offsetWidth;el.hidden=false;this.lastAt=at;this.priority=priority;this.lastText=phrase.text;this.lastKey=key;this.history.push({kind,text:phrase.text,at,combo:info.combo||0});this.history=this.history.slice(-24);this.timer=setTimeout(()=>{el.hidden=true;el.querySelector('.praise-particles')?.replaceChildren();},kind==='win'?1800:kind==='stage'?1450:1100);return true;},
wrong(){this.lastWrong=now();this.clear();},
clear(){clearTimeout(this.timer);const el=document.getElementById('minigame-praise');if(el){el.hidden=true;el.querySelector('.praise-particles')?.replaceChildren();}},
wrap(object,name,after){if(!object||typeof object[name]!=='function')return;const previous=object[name];object[name]=function(...args){const state={run:P.active,finished:P.active?.finished,stage:P.active?.data?.stage};const result=previous.apply(this,args);after.call(this,args,result,state);return result;};}
};
F.wrap(P,'hit',function([points=100]){if(this.active&&!this.active.finished)F.emit(this.active.combo>=3?'combo':'hit',{points,combo:this.active.combo});});
F.wrap(P,'feedback',function([message,wrong]){if(wrong)F.wrong();});
F.wrap(P,'stageClear',function([r,stage]){if(r&&!r.training&&!r.finished)F.emit('stage',{key:r.id+':stage:'+stage,detail:'Etapa '+(stage+1)+' concluída'});});
F.wrap(P,'finish',function(args,result,before){if(before.run&&!before.finished&&before.run.finished)F.emit('win',{key:before.run.id+':win',detail:before.run.score+' pontos · '+before.run.bestCombo+' na melhor sequência'});});
F.wrap(P,'detach',()=>F.clear());F.wrap(P,'pause',()=>F.clear());F.wrap(P,'attach',()=>{F.clear();F.lastAt=-10000;F.lastWrong=-10000;F.lastKey='';F.priority=0;});
const culture=V.CultureChallenges;
F.wrap(culture,'commit',function(){const r=this.run();if(!r)return;const stamp=r.id+':'+r.stage+':'+r.moves+':'+(r.data.woven?.length||0)+':'+Object.keys(r.data.placements||{}).length+':'+(r.data.last?.gain||0);if((/^✓/.test(r.feedback||'')||this.ready(r)||r.data.last?.gain>0)&&!r.finished)F.emit('hit',{key:stamp,combo:r.data.woven?.length||0});});
F.wrap(culture,'advance',function(args,result){const r=this.run();if(r&&!r.finished&&result)F.emit('stage',{key:r.id+':culture-stage:'+r.stage});});
F.wrap(culture,'finish',function(args,result){const r=this.run();if(result&&r?.finished)F.emit('win',{key:r.id+':culture-win'});});
const roots=V.AncestralActivities;
F.wrap(roots,'pair',function(args,result){if(result)F.emit('hit',{key:this.run()?.id+':pair:'+this.run()?.matches?.length});});
F.wrap(roots,'finish',function(args,result){if(result&&this.run()?.finished)F.emit('win',{key:this.run().id+':roots-win'});});
const arcade=V.LearningArcade;
for(const name of ['checkRoom','nextMosaic'])F.wrap(arcade,name,function(args,result){const r=this.ensure().run;if(result&&r&&!r.finished)F.emit('stage',{key:r.id+':arcade:'+r.stage});});
F.wrap(arcade,'finish',function(args,result){if(result)F.emit('win',{key:'arcade:'+this.ensure().completed.at(-1)?.id});});
const quiz=V.Life,endQuiz=quiz.finishQuiz;quiz.finishQuiz=function(...args){const q=this.ensure()?.quiz,result=endQuiz.apply(this,args);if(q&&!this.ensure()?.quiz&&q.index>=q.deck.length)F.emit('win',{key:'quiz:'+q.id});return result;};
const fishing=V.Activities;
F.wrap(fishing,'reel',function(args,result){if(result===true)F.emit('hit',{detail:'Boa puxada!'});});
F.wrap(V.Game,'toTitle',()=>F.clear());
window.addEventListener('resize',()=>{const el=document.getElementById('minigame-praise');if(el&&!el.hidden)F.position(el);});document.addEventListener('visibilitychange',()=>{if(document.hidden)F.clear();});
})();
