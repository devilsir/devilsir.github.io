(function(){
'use strict';
const V=window.V,P=V.Playground,esc=V.escape;
const rates={runner:[12,10],rhythm:[12,10],room:[14,12],courier:[18,14],garden:[20,16],bridges:[16,14],memory:[22,18],museum:[22,18],platform:[48,40],radio:[18,14],moto:[24,20],'guarda-biodiversidade':[36,30]};
const E=V.ChallengeEconomy={
 ensure(){const a=V.Progress.ensure();return a.challengeEconomy||={version:1,receipts:{},discoveries:{}};},
 // One receipt per run, phase and circuit leg. Reopening a result never pays again.
 pay(r,phase,kind='play',rate){if(!r||r.training||V.ProfessorStudio?.freePlay||V.Tutorials.active&&V.Tutorials.record(V.Tutorials.active)?.practice===r)return{coins:0,xp:0,practice:true};const e=this.ensure(),key=kind+':'+r.id+':'+(r.arcade?.leg||0)+':'+phase;if(e.receipts[key])return e.receipts[key];
  const discovery=kind+':'+r.game+':'+phase,first=!e.discoveries[discovery],base=rate||rates[r.game]||[18,14],mistakes=Math.max(0,(r.mistakes||0)-(r.rewardMistakes||0)),hints=Math.max(0,(r.hints||0)-(r.rewardHints||0)),bonus=mistakes===0&&hints===0?4:mistakes<=2?2:0;
  const reward={coins:base[0]+bonus,xp:base[1]+(first?6:0),first,phase};e.receipts[key]=reward;e.discoveries[discovery]=true;r.rewardMistakes=r.mistakes||0;r.rewardHints=r.hints||0;
  V.Life.award('challenge-'+key,reward.coins);V.Progress.reward('challenge-'+key,reward.xp);r.rewards||={coins:0,xp:0};r.rewards.coins+=reward.coins;r.rewards.xp+=reward.xp;return reward;
 },
 art(){return '<img class="phase-reward-art" src="assets/ui/phase-reward.svg" width="112" height="76" alt="">';},
 body(reward,total){return this.art()+'<h3>+'+reward.coins+' moedas · +'+reward.xp+' XP</h3><p>'+(reward.first?'Inclui +6 XP pela primeira conclusão desta fase.':'Repetir fases também rende moedas e XP.')+'</p><p>Guardado nesta partida: <strong>'+total.coins+' moedas · '+total.xp+' XP</strong></p><p>Suas recompensas já estão na carteira. Quer continuar ou sair?</p>';},
 stop(r){P.ensure().current=null;V.UI.onClose=null;V.UI.close();P.detach();P.save();},
 nextData(r,stage){const savedId=r.id,oldSerial=P.ensure().serial,fresh=P.make(r.game,r.key,{...r.context,stage,...(r.arcade?{arcadeLevel:stage}:{})});P.ensure().runs[r.key]=r;P.ensure().serial=oldSerial;r.data=fresh.data;r.startStage=stage;r.context.stage=stage;r.id=savedId;r.combo=0;r.stageMistakes=r.mistakes;r.stageHints=r.hints;P.banner=null;P.controls();P.hud();},
 checkpoint(r){if(!r?.phaseReward||r.finished||r.training)return;const q=r.phaseReward;if(r.arcade&&!q.prepared){if(!r.arcade.free&&r.arcade.leg>=5)return P.finish();r.arcade.leg++;this.nextData(r,(q.stage+1)%(P.game(r.game).stages||1));q.prepared=true;P.save();}P.banner=null;V.Input.clear();P.held={x:0,y:0};P.drag=null;
  V.UI.modal('Fase concluída',P.game(r.game).title+' · '+q.label,'<div class="pg-result phase-result">'+this.body(q.reward,r.rewards)+'</div>','<button id="phase-continue" class="primary">Continuar para a próxima fase</button><button id="phase-exit" class="secondary">Guardar e sair</button>');
  const leave=()=>{r.phaseReward=null;P.save();this.stop(r);};V.UI.onClose=leave;V.$('#phase-exit').onclick=leave;V.$('#phase-continue').onclick=()=>{r.phaseReward=null;V.UI.onClose=null;V.UI.close();P.banner=null;P.save();if(r.game==='platform'&&r.data.storyStatus==='intro')V.PlatformJourney.story(r);V.$('#world-canvas')?.focus();};
 },
 flush(){const r=P.active;if(r?.phaseReward&&!r.finished&&!V.modal)this.checkpoint(r);}
};
P.stageClear=function(r,stage){if(!r||r.training||r.finished)return;const s=this.ensure(),list=s.stageRecords[r.game]||={},old=list[stage];r.phaseReceipts||={};const key=(r.arcade?.leg||0)+':'+stage;if(r.phaseReceipts[key])return;r.phaseReceipts[key]=true;
 const mistakes=Math.max(0,r.mistakes-(r.stageMistakes||0)),hints=Math.max(0,r.hints-(r.stageHints||0)),stars=mistakes===0&&hints===0?3:mistakes<=3?2:1;r.stageMistakes=r.mistakes;r.stageHints=r.hints;list[stage]={stars:Math.max(stars,old?.stars||0),score:Math.max(r.score,old?.score||0),completed:true};
 const reward=E.pay(r,stage);r.phaseReward={stage,label:'Fase '+(stage+1),reward};if(r.arcade){r.arcade.earned+=reward.coins;r.arcade.lastCoins=reward.coins;}
 const max=this.game(r.game).stages||1;if(Array.from({length:max},(_,i)=>list[i]?.completed).every(Boolean)&&!s.badges.includes(r.game)){s.badges.push(r.game);V.Quests.achieve('play-all-'+r.game);}this.save();
};
// Controllers finish their state transition before opening the interval. This
// keeps the saved position at the beginning of the next phase, including reloads.
for(const name of ['action','update','pointer','key']){const run=P[name].bind(P);P[name]=function(...args){const out=run(...args);E.flush();return out;};}
const attach=P.attach.bind(P);P.attach=function(r){const out=attach(r);E.flush();return out;};
const story=V.PlatformJourney.story.bind(V.PlatformJourney);V.PlatformJourney.story=function(r){if(r.phaseReward)return;return story(r);};
P.finish=function(){const r=this.active;if(!r||r.training||r.finished)return;
 const q=r.phaseReward,max=this.game(r.game).stages||1;
 if(r.game===V.CookingData.id&&r.data.done&&!V.DuoChallenges.isChild)V.Cooking.deliver(r.id+':'+(r.arcade?.leg||0)+':'+r.data.stage,r.data.stage);
 if(q&&r.arcade&&(r.arcade.free||r.arcade.leg<5)){r.arcade.leg++;E.nextData(r,(q.stage+1)%max);q.prepared=true;this.save();return;}
 if(q&&!r.arcade&&q.stage<max-1){E.nextData(r,q.stage+1);this.save();return;}
 r.finished=true;r.phaseReward=null;r.stars=r.mistakes===0&&r.hints===0?3:r.mistakes<5?2:1;
 const s=this.ensure(),previous=s.records[r.game],total=r.rewards||{coins:0,xp:0};s.ledger[r.id]={...total,at:new Date().toISOString()};s.records[r.game]={score:Math.max(previous?.score||0,r.score),stars:Math.max(previous?.stars||0,r.stars),count:(previous?.count||0)+1};
 if(r.arcade){r.arcade.closed=true;V.ArcadeExpansion.record(r);}if(this.game(r.game).playCulture)V.PlayMuseum?.recordPlay(r.game);this.completeContext?.(r);s.current={key:r.key};this.save();this.result(r);
};
// Currency comes from completed phases; points and pickups remain score items.
V.ArcadeExpansion.pay=()=>false;
const hit=P.hit.bind(P);P.hit=function(...args){const r=this.active,a=r?.arcade,free=a?.free;if(a)a.free=false;try{return hit(...args);}finally{if(a)a.free=free;}};
const result=P.result.bind(P);P.result=function(r){const out=result(r),box=V.$('.pg-result');if(box){const line=document.createElement('p');line.textContent='As recompensas foram pagas por fase. Não há cobrança nem perda ao sair.';box.append(line);}return out;};

// Cooking rewards its actual preparation steps instead of paying only at plating.
const advance=V.Cooking.advance.bind(V.Cooking);V.Cooking.advance=function(r){if(!r||r.training||r.data.phase!=='done')return advance(r);const recipe=r.data.stage,step=r.data.step,reward=E.pay(r,recipe+'-step-'+step,'cooking',[6,5]);
 const clear=P.stageClear;P.stageClear=(run,stage)=>{const s=P.ensure(),list=s.stageRecords[run.game]||={};list[stage]={completed:true,stars:3,score:run.score};};
 try{advance(r);}finally{P.stageClear=clear;}
 if(!r.finished)r.phaseReward={stage:recipe,label:'Etapa '+(step+1)+' da receita',reward};E.flush();P.save();};

// Cultural workshops share the same phase economy and a saved interval.
const K=V.CultureChallenges;
const cultureAdvance=K.advance.bind(K);
K.advance=function(){if(V.Tutorials.active==='culture:'+this.active)return cultureAdvance();const r=this.run(),g=this.game(r?.game);if(!r||!this.ready(r)||r.interval)return false;const stage=r.stage,reward=E.pay(r,stage,'culture',[18,14]);if(!r.passed.includes(stage))r.passed.push(stage);
 if(stage===g.stages.length-1)return this.finish();r.stage++;this.setup(r);r.interval={reward,label:g.stages[stage].title};V.Save.save();this.show();return true;};
const show=K.show.bind(K);K.show=function(id=this.active){const r=this.run(id);if(!r?.interval)return show(id);this.active=id;const q=r.interval;V.UI.modal('Etapa concluída',this.game(id).title+' · '+q.label,'<div class="pg-result phase-result">'+E.body(q.reward,r.rewards)+'</div>','<button id="culture-phase-next" class="primary">Continuar</button><button id="culture-phase-exit" class="secondary">Guardar e sair</button>',true);V.$('#culture-phase-next').onclick=()=>{r.interval=null;V.Save.save();this.show(id);};V.$('#culture-phase-exit').onclick=()=>{V.Save.save();V.UI.close();};return true;};
const cultureFinish=K.finish.bind(K);K.finish=function(){if(V.Tutorials.active==='culture:'+this.active)return cultureFinish();const r=this.run(),g=this.game(r?.game);if(!r||r.finished||!this.ready(r)||r.passed.length!==g.stages.length)return false;
 // Keep achievements, vocabulary and source presentation without a second payout.
 const coins=g.coins,xp=g.xp;g.coins=0;g.xp=0;let out;try{out=cultureFinish();}finally{g.coins=coins;g.xp=xp;}const total=r.rewards||{coins:0,xp:0},line=V.$('.culture-result>strong');if(line)line.textContent=total.coins+' moedas · '+total.xp+' XP guardados por etapa';return out;};
const open=K.open.bind(K);K.open=function(...args){const out=open(...args),line=V.$('.culture-reward');if(line)line.textContent='Por etapa: 18–22 moedas · 14 XP (+6 XP na primeira conclusão). Continue ou saia entre etapas.';return out;};

// Older workshops: each successful room, delivery or restored portrait is a phase.
const A=V.LearningArcade;
for(const [method,count]of [['checkRoom',r=>r.cleared?.length||0],['courierInteract',r=>r.delivered?.length||0],['nextMosaic',r=>r.restored?.length||0]]){const run=A[method].bind(A);A[method]=function(...args){const r=this.ensure().run;if(!r||r.interval)return false;const before=count(r),out=run(...args),after=count(r);if(after>before&&!r.finished){const reward=E.pay(r,before,'legacy',[18,14]);r.interval={reward};V.Save.save();this.resume();}return out;};}
const resume=A.resume.bind(A);A.resume=function(){const r=this.ensure().run;if(!r?.interval)return resume();V.UI.modal('Fase concluída','OFICINA DO BAIRRO','<div class="pg-result phase-result">'+E.body(r.interval.reward,r.rewards)+'</div>','<button id="legacy-phase-next" class="primary">Continuar</button><button id="legacy-phase-exit" class="secondary">Guardar e sair</button>',true);V.$('#legacy-phase-next').onclick=()=>{r.interval=null;V.Save.save();this.resume();};V.$('#legacy-phase-exit').onclick=()=>{V.Save.save();V.UI.close();};};
const legacyFinish=A.finish.bind(A);A.finish=function(){if(V.Tutorials.active?.startsWith('arcade:'))return legacyFinish();const r=this.ensure().run;if(!r||r.finished||!this.validFinish(r))return false;const phase=r.game==='timeline'?0:r.game==='furniture'?3:r.game==='courier'?r.tasks.length-1:r.deck.length-1;E.pay(r,phase,'legacy',[18,14]);
 // Preserve the legacy completion bookkeeping but replace its one-time reward.
 const award=V.Life.award,reward=V.Progress.reward;V.Life.award=function(key,...args){return key==='arcade-complete-'+r.game?false:award.call(this,key,...args);};V.Progress.reward=function(key,...args){return key==='arcade-complete-'+r.game?false:reward.call(this,key,...args);};let out;try{out=legacyFinish();}finally{V.Life.award=award;V.Progress.reward=reward;}const total=r.rewards,line=V.$('.arcade-result>strong'),xp=V.$('.arcade-result>span');if(line)line.textContent=total.coins+' moedas guardadas por fase';if(xp)xp.textContent=total.xp+' XP · '+r.moves+' movimentos';return out;};

const detail=V.ChallengeCatalog.detail.bind(V.ChallengeCatalog);V.ChallengeCatalog.detail=function(...args){const out=detail(...args),note=V.$('#challenge-mode-note');if(note){const update=()=>{if(V.$('input[name="challenge-mode"]:checked')?.value!=='training')note.textContent='Cada fase paga moedas e XP. Entre fases, escolha continuar ou guardar e sair. A conclusão não paga novamente.';};V.$$('input[name="challenge-mode"]').forEach(el=>el.addEventListener('change',update));update();}return out;};

// The boat challenge has three phases of two catches each.
const F=V.FishingChallenge,capture=F.capture.bind(F),fishFinish=F.finish.bind(F);
F.phasePay=function(r){r.game='fishing-'+r.habitat;r.mistakes=r.misses;return E.pay(r,r.catches.length/2-1,'fishing',[12,10]);};
F.capture=function(){const r=this.run,before=r?.catches.length||0,result=capture();if(!r||r.catches.length===before||r.finished||r.catches.length%2)return result;const reward=this.phasePay(r);r.paused=true;r.economyInterval=true;r.pad=null;V.Input.clear();V.UI.onClose=null;
 V.UI.modal('Fase da pescaria concluída','ETAPA '+r.catches.length/2+(r.free?' · MODO LIVRE':' / '+(r.goalCount||6)/2),'<div class="pg-result phase-result">'+E.body(reward,r.rewards)+'</div>','<button id="fish-phase-next" class="primary">Continuar pescando</button><button id="fish-phase-exit" class="secondary">Guardar e sair</button>',true);V.UI.onClose=()=>this.cancel();V.$('#fish-phase-exit').onclick=()=>V.UI.close();V.$('#fish-phase-next').onclick=()=>{V.UI.onClose=null;r.paused=false;r.economyInterval=false;this.panel();};V.Save.save();return result;};
const fishUpdate=F.update.bind(F);F.update=function(dt){if(this.run?.economyInterval)return;return fishUpdate(dt);};
F.finish=function(){const r=this.run;if(!r||r.finished)return;if(r.catches.length>0&&r.catches.length%2===0)this.phasePay(r);const result=fishFinish(),box=V.$('.fish-result');if(box&&r.rewards){const line=document.createElement('p');line.textContent=r.rewards.coins+' moedas · '+r.rewards.xp+' XP guardados por fase';box.append(line);}return result;};

// Keep first-discovery bonuses consistent when returning from private viewers.
for(const owner of [V.DuoSessions,V.DuoChallenges])if(owner?.receive){const receive=owner.receive.bind(owner);owner.receive=function(event){const m=event.data,session=m?.type==='snapshot'&&(owner===V.DuoSessions?owner.enabled()&&[...owner.sessions.values()].some(s=>s.token===m.voicesDuo&&s.frame.contentWindow===event.source&&s.state===V.state):owner.active&&m.voicesDuo===owner.session?.id&&owner.frames?.some(f=>f?.contentWindow===event.source));const out=receive(event);if(session&&m.state?.adventure?.challengeEconomy?.discoveries){const discoveries=E.ensure().discoveries;let changed=false;for(const key of Object.keys(m.state.adventure.challengeEconomy.discoveries))if(!discoveries[key]){discoveries[key]=true;changed=true;}if(changed)V.Save.save();}return out;};}
})();
