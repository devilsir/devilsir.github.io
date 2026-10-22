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
 {title:'Confrontos também têm orientação',text:'Aqui as manifestações da Rasura são enfrentadas por turnos. Leia e escolha com calma: não há limite de tempo para decidir.',target:'#battle-start',event:'start'},
 {title:'Veja vida e foco da equipe',text:'Vida mostra quanto cada integrante suporta. Foco paga habilidades. Quando uma pessoa cai, as outras ainda podem agir; o confronto oferece nova tentativa quando necessário.',target:'.battle-party'},
 {title:'Leia a intenção da manifestação',text:'O nome no alto mostra quem tem a vez. A intenção inimiga antecipa a ação: use essa informação para atacar, proteger ou preparar uma habilidade.',target:'.battle-heading'},
 {title:'Escolha Atacar',text:'Atacar é uma ação básica e recupera foco. Escolher a ação ainda não executa o golpe: falta selecionar quem será atingido.',target:'[data-battle-command="attack"]',event:'attack'},
 {title:'Agora escolha o alvo',text:'Cada ação apresenta alvos válidos. Clique no nome da manifestação ou use setas e Enter. Cancelar volta à escolha de comandos antes de gastar o turno.',target:'[data-battle-target]',event:'target'},
 {title:'Uma ação ocupa um turno',text:'Observe a vida, o foco e o registro do que aconteceu. Ao continuar, a resolução da ação e os próximos turnos serão retomados.',target:'.battle-log'},
 {title:'Defender também ajuda a preparar',text:'Defender reduz o próximo impacto e recupera foco. Habilidades têm custo e podem ter recarga. Itens consomem uma unidade do estoque e também usam um turno.',target:'.battle-command-panel'},
 {title:'Conhecimento muda o confronto',text:'Consultar registros não usa turno. Restituir contexto fica disponível depois de comparar os vestígios da investigação; certas manifestações precisam perder o escudo antes. Apoio da companhia tem cargas limitadas.',target:'#battle-review'},
 {title:'Continue no seu ritmo',text:'A partir daqui você escolhe a estratégia. Leia o feedback, confira o próximo integrante e reveja as orientações em Como jogar. Recuar aparece nos confrontos que permitem a ação.',target:'.battle-heading',finish:true}
];
const B=V.BattleCoach={active:false,
 record(){const l=T.ensure();if(!l)return null;return l.battleGuide||=( {step:0,ack:false,completed:false,skipped:false});},
 render(){const a=C.active,r=this.record();if(!a||!r||r.completed||r.skipped||V.Game.screen!=='game'){this.active=false;O.hide('battle');return;}if(V.modal||T.active||G.active||V.ProfessorStudio?.active){O.hide('battle');return;}this.active=true;const s=steps[r.step];if(!s)return;O.show('battle',{...s,key:'battle:'+r.step,counter:'PRIMEIRO CONFRONTO · '+(r.step+1)+'/'+steps.length,index:r.step,total:steps.length,ack:r.ack,instruction:s.event?'Experimente o comando destacado para continuar.':'A resolução do confronto está pausada enquanto você lê.',after:'Comando registrado. Confira o painel e continue.',next:()=>this.next(),skip:()=>{r.skipped=true;this.active=false;O.hide('battle');V.Save.save();},recover:()=>C.ui()});},
 event(name){if(!C.active)return;const r=this.record(),s=steps[r.step];if(!s||s.event!==name||r.ack)return;r.ack=true;V.Save.save();this.render();},
 next(){const r=this.record(),s=steps[r.step];if(s.event&&!r.ack)return false;r.step++;r.ack=false;if(r.step>=steps.length){r.completed=true;this.active=false;O.hide('battle');}else this.render();V.Save.save();return true;},
 paused(){const r=this.record();return this.active&&!V.modal&&!V.ProfessorStudio?.active&&(!steps[r.step]?.event||r.ack);}
};
const ui=C.ui.bind(C);C.ui=function(...args){const result=ui(...args);if(C.active)B.render();return result;};
const advance=C.advance.bind(C);C.advance=function(...args){const result=advance(...args);B.event('start');return result;};
const choose=C.choose.bind(C);C.choose=function(type,...args){const result=choose(type,...args);if(type==='attack'&&C.active?.phase==='target')B.event('attack');return result;};
const commit=C.commit.bind(C);C.commit=function(action,...args){const result=commit(action,...args);if(action?.type==='attack'&&C.active?.phase==='resolving')B.event('target');return result;};
const update=V.Game.update.bind(V.Game);V.Game.update=function(dt){if(!B.paused())update(dt);B.tick=(B.tick||0)+dt;if(C.active&&B.tick>.25){B.tick=0;B.render();}if(B.active&&!C.active){B.active=false;O.hide('battle');}};
const start=V.Game.startGame.bind(V.Game);V.Game.startGame=function(...args){const result=start(...args),state=V.state;setTimeout(()=>{const key=T.ensure()?.currentLesson;if(V.state===state&&key&&!G.active&&!T.active&&!V.modal&&V.Game.mode==='explore'&&T.record(key)?.running)T.open(key);},150);return result;};
const title=V.Game.toTitle.bind(V.Game);V.Game.toTitle=function(...args){B.active=false;O.hide();return title(...args);};
})();
