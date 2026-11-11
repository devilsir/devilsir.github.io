/* Registered module: onboarding-lessons */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("onboarding-lessons", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function onboardingLessons(){
'use strict';const V=window.V,T=V.Tutorials,G=V.Onboarding,O=V.GuideOverlay;
const decorate=T.decorate.bind(T);T.decorate=function(){decorate();const key=this.active,d=this.definitions[key],r=this.record(key),s=d?.steps[r?.step],host=V.$('#lesson-panel');if(!key||!s||!host||V.ProfessorStudio?.active){O.hide('lesson');return;}host.classList.add('guided-lesson-hidden');
 O.show('lesson',{key:key+':'+r.step,counter:'TREINO · '+G.lessonName(key)+' · '+(r.step+1)+'/'+d.steps.length,title:s.title,text:s.text,instruction:s.event?'Faça a ação destacada. Depois, confira o resultado e continue.':'Observe a explicação antes de continuar.',after:s.after,event:s.event,target:s.target||s.allow,ack:r.ack,index:r.step,total:d.steps.length,finish:r.step===d.steps.length-1,next:()=>this.next(),skip:()=>this.skip(),skipLabel:'Sair do treino',recover:()=>this.render()});};
T.gate=function(key,start){const r=this.record(key);if(!r||r.running&&!r.completed&&!r.skipped){this.open(key);return true;}start();return false;};
const leave=T.leave.bind(T);T.leave=function(){const key=this.active;this.ensure().currentLesson=null;O.hide('lesson');if(G.active&&G.record().waitingLesson===key){this.active=null;G.record().waitingLesson=null;G.helpLessonKey=null;G.suspended=false;V.UI.close();G.ack('challenge-practice');G.render();V.Save.save();return;}if(G.helpLessonKey===key){this.active=null;G.helpLessonKey=null;G.help();return;}return leave();};
const pause=T.pause.bind(T);T.pause=function(){const key=this.active;this.ensure().currentLesson=null;O.hide('lesson');const result=pause();if(key&&G.active&&G.record().waitingLesson===key){G.record().waitingLesson=null;G.helpLessonKey=null;G.suspended=false;G.ack('challenge-practice');}return result;};
// Help can open any workshop directly, even before its first scored session.
const open=T.open.bind(T);T.open=function(key,...args){const d=this.definitions[key];if(!d)return false;this.ensure().currentLesson=key;
 if(d.family==='classic'){V.Minigames.opts||={};V.Minigames.classicType=d.id;V.Minigames.classicKey='classic:'+d.id+':free';V.Minigames.done||=()=>{};}
 return open(key,...args);};
const trap=V.UI.focusTrap.bind(V.UI);V.UI.focusTrap=function(e){if(e.key!=='Tab'||!O.owner)return trap(e);const guide=V.$('#guided-overlay'),root=V.$('.modal')||V.$('.dialogue-box'),all=[...(root?[...root.querySelectorAll('button,input,select,textarea,a[href]')]:[]),...guide.querySelectorAll('button')].filter(el=>!el.disabled&&O.visible(el));if(!all.length)return;const i=all.indexOf(document.activeElement);if(i<0||e.shiftKey&&i===0||!e.shiftKey&&i===all.length-1){e.preventDefault();(e.shiftKey?all.at(-1):all[0]).focus();}};
// The combat lesson waits for the same real commands as a normal turn.
const C=V.Combat,steps=[
 {title:'Confrontos também têm orientação',text:'Iniciar confronto abre a prática guiada. Iniciar automático delega as ações à equipe. Você pode retomar o controle durante a luta.',target:'#battle-start',event:'start'},
 {title:'Veja vida e foco da equipe',text:'Vida mostra quanto cada integrante suporta. Foco paga habilidades. Quando uma pessoa cai, as outras ainda podem agir.',target:'.turn-team'},
 {title:'Leia a intenção da manifestação',text:'A fila indica quem tem a vez. Intenções mostra o que as manifestações estão preparando para os próximos turnos.',target:'#battle-intents'},
 {title:'Escolha Atacar',text:'Atacar recupera 6 de foco. Com um único alvo disponível, o golpe é imediato.',target:'[data-battle-command="attack"]',event:'attack'},
 {title:'Escolha um alvo',text:'Toque no alvo na arena ou no painel. Você também pode selecionar com as setas e confirmar com Enter.',target:'[data-battle-target]',event:'target'},
 {title:'Uma ação ocupa um turno',text:'Observe a vida, o foco e o registro da ação. Os próximos turnos serão retomados quando você continuar.',target:'.turn-log-line'},
 {title:'Defender também ajuda a preparar',text:'Defender reduz o próximo impacto e recupera foco. Habilidades gastam foco. Itens gastam uma unidade da mochila e usam um turno.',target:'.turn-work'},
 {title:'Conhecimento muda o confronto',text:'A máscara abre as fontes da investigação durante a luta. Comparar fontes libera Contexto em confrontos que permitem essa ação.',target:'#battle-mask'},
 {title:'Continue no seu ritmo',text:'Automático joga os turnos da equipe e guarda seus consumíveis. Use o mesmo botão para voltar ao controle manual.',target:'#battle-auto',finish:true}
];
const B=V.BattleCoach={active:false,
 record(){const l=T.ensure();if(!l)return null;return l.battleGuide||=( {step:0,ack:false,completed:false,skipped:false});},
 step(r,a){
   if(r.step===4&&a.phase!=='target'&&!r.ack){
     return {title:'O golpe encontrou seu alvo',text:'Com mais de um alvo, você pode tocar no personagem na arena ou escolher seu nome no painel.',target:'.turn-log-line'};
   }
   return steps[r.step];
 },
 skip(){
   const r=this.record();
   if(!r||r.completed||r.skipped)return;
   r.skipped=true;
   this.active=false;
   O.hide('battle');
   V.Save.save();
 },
 render(){
   const a=C.active,r=this.record();
   if(!a||a.practice||a.auto||!r||r.completed||r.skipped||V.Game.screen!=='game'||V.modal||T.active||G.active||V.ProfessorStudio?.active){
     this.active=false;
     O.hide('battle');
     return;
   }
   if(['victory','defeat','retreat','returned'].includes(a.phase)){
     r.completed=true;
     this.active=false;
     O.hide('battle');
     V.Save.save();
     return;
   }
   const step=this.step(r,a);
   if(!step)return;
   this.active=true;
   const waiting=!r.ack&&(r.step===3||r.step===5)&&a.phase!=='command';
   const view=waiting?{
     title:r.step===3?'Aguarde a vez da equipe':'Observe o resultado da ação',
     text:'Os comandos voltam a aparecer quando chegar a vez da sua equipe.',
     target:r.step===3?'.turn-heading':'.turn-log-line',
     event:'waiting'
   }:step;
   O.show('battle',{...view,key:'battle:'+r.step+':'+(waiting?'waiting':step.event||'read'),counter:'PRIMEIRO CONFRONTO · '+(r.step+1)+'/'+steps.length,index:r.step,total:steps.length,ack:r.ack,
     instruction:waiting?'Acompanhe a ação. A próxima orientação aparece automaticamente.':step.event?'Experimente o comando destacado para continuar.':'O confronto fica pausado enquanto você lê.',
     after:'Comando registrado. Confira o painel e continue.',next:()=>this.next(),skip:()=>this.skip(),recover:()=>C.ui()});
 },
 event(name){
   if(!this.active||!C.active)return;
   const r=this.record();
   if(steps[r.step]?.event!==name||r.ack)return;
   r.ack=true;
   V.Save.save();
   this.render();
 },
 next(){
   const r=this.record(),a=C.active;
   if(!a||this.step(r,a)?.event&&!r.ack||r.step===5&&a.phase!=='command')return false;
   r.step++;
   r.ack=false;
   if(r.step>=steps.length){r.completed=true;this.active=false;O.hide('battle');}
   else this.render();
   V.Save.save();
   return true;
 },
 paused(){
   const r=this.record();
   if(!this.active||V.modal||V.ProfessorStudio?.active)return false;
   if(r.step===3)return !!r.ack;
   if(r.step===5)return C.active?.phase==='command';
   return true;
 }
};
const ui=C.ui.bind(C);C.ui=function(...args){const result=ui(...args);if(C.active)B.render();return result;};
const advance=C.advance.bind(C);C.advance=function(...args){const result=advance(...args);B.event('start');return result;};
const choose=C.choose.bind(C);C.choose=function(type,...args){
 if(B.active&&(B.record().step!==3||B.record().ack||type!=='attack'))return false;
 const result=choose(type,...args);
 if(result&&type==='attack')B.event('attack');
 return result;
};
const commit=C.commit.bind(C);C.commit=function(action,...args){
 if(B.active){
   const r=B.record();
   if(r.ack||![3,4].includes(r.step)||action.type!=='attack')return false;
 }
 const result=commit(action,...args);
 if(result&&action.type==='attack')B.event('target');
 return result;
};
const setAuto=C.setAuto.bind(C);C.setAuto=function(enabled,...args){
 if(enabled&&B.active)B.skip();
 return setAuto(enabled,...args);
};
V.Hooks.around(V.Game, 'update', 'onboarding-lessons:update:1', nextHook => function(dt){if(!B.paused())nextHook(dt);B.tick=(B.tick||0)+dt;if(C.active&&B.tick>.25){B.tick=0;B.render();}if(B.active&&!C.active){B.active=false;O.hide('battle');}});
const start=V.Game.startGame.bind(V.Game);V.Game.startGame=function(...args){const result=start(...args),state=V.state;setTimeout(()=>{const key=T.ensure()?.currentLesson;if(V.state===state&&key&&!G.active&&!T.active&&!V.modal&&V.Game.mode==='explore'&&T.record(key)?.running)T.open(key);},150);return result;};
const title=V.Game.toTitle.bind(V.Game);V.Game.toTitle=function(...args){B.active=false;O.hide();return title(...args);};
})();

});
