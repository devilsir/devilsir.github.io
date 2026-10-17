(function(){
'use strict';
const V=window.V,D=V.AdventureData,P=V.Progress,esc=V.escape,copy=x=>JSON.parse(JSON.stringify(x));
const statusNames={marked:'Fraqueza exposta',delay:'Iniciativa reduzida',vulnerable:'Vulnerável',chorus:'Vozes em Coro',shield:'Escudo',corruption:'Corrupção',confused:'Confusão',obscured:'Obscurecimento',link:'Vínculo',credit:'Crédito restituído',seal:'Proveniência',guard:'Defendendo',power:'Acúmulo de poder'};
const B=V.Combat={active:null,
start(id){
if(this.active)return;
if(!V.Quests.ready(id)){V.UI.modal('Preparar o confronto',V.content.chapters[id-1].name,`<p>Reúna os três registros, converse com os dois moradores, compare os vestígios no Historiógrafo e restaure o sistema do capítulo.</p><div class="note">A preparação revela contramedidas. Você pode consultar o material antes de agir.</div>`,`<button id="battle-prep-guide" class="primary">Rastrear o próximo passo</button><button id="battle-prep-records" class="secondary">Rever o Historiógrafo</button>`);V.$('#battle-prep-guide').onclick=()=>{V.ObjectiveGuide.track(id);V.UI.close();};V.$('#battle-prep-records').onclick=()=>V.Story.device();return;}
this.begin(id,V.settings.assist);
},
actor(id,name,character,stats,side){return{id,name,character,stats:copy(stats),health:stats.health,focus:stats.focus,shield:0,statuses:[],cooldowns:{},side};},
begin(id,assist=false,opts={}){
if(this.active)return false;
V.UI.close();const a=P.ensure(),stats=P.stats(),player=this.actor('player',V.state.name,V.state.character,stats,'ally');
player.health=Math.max(1,Math.min(stats.health,a.health??stats.health));player.focus=Math.min(stats.focus,a.focus??stats.focus);
const allies=[player];
if(id>0)for(const [i,char]of a.party.filter(x=>x!==V.state.character).slice(0,2).entries()){
const s={...stats,health:Math.round(stats.health*.85),focus:Math.round(stats.focus*.8),attack:Math.round(stats.attack*(char==='sol'?1.02:.86)),knowledge:Math.round(stats.knowledge*(char==='librarian'?1.15:.85)),agility:stats.agility+(char==='leo'?3:-1)};allies.push(this.actor('ally-'+i,V.content.characters[char]?.name||char,char,s,'ally'));}
const definition=D.cases[Math.max(0,id-1)],base=D.enemies.find(e=>e.id===(opts.custom?.enemy||(id?definition.enemy:'echo')))||D.enemies[0];
const key=opts.practice?'practice-'+id:opts.custom?.id||'chapter-'+id;
const enemies=[],make=(e,index,boss=false)=>{
const factor=.8+id*.16,hp=id===0?62:boss?145+id*34+a.level*5:Math.round(e.health*factor+a.level*2),s={health:opts.custom?.health&&boss?opts.custom.health:hp,focus:99,attack:opts.custom?.attack&&boss?opts.custom.attack:id===0?9:Math.round(e.attack*factor+id*1.5),defense:opts.custom?.defense&&boss?opts.custom.defense:Math.round(e.defense+id*.8),knowledge:12+id*3,agility:e.agility+id,resolve:9+id*2};
const actor=this.actor('enemy-'+index,boss&&id?V.content.chapters[id-1].boss.name:e.name,null,s,'enemy');Object.assign(actor,{enemy:e.id,row:e.row,boss,phase:1,mechanic:e.mechanic,tip:e.tip,integrity:3,plan:null,intent:'Observe a manifestação.'});return actor;};
enemies.push(make(base,0,id>0));if(id>0)enemies.push(make(D.enemies[id===1?0:id===2?1:id===3?3:id===4?2:id===5?5:1],1,false));if(id===6)enemies.push(make(D.enemies[5],2,false));
this.active={schema:3,key,id,assist,practice:!!opts.practice,custom:!!opts.custom,customDefinition:opts.custom?copy(opts.custom):null,intro:id===0,phase:'intro',round:0,turnIndex:-1,turnNumber:0,order:[],allies,enemies,actor:null,menu:'main',selectedTarget:null,selectedAction:null,timer:0,clock:0,log:[id===0?'Uma manifestação tenta apagar as fichas. Observe a intenção e teste ataque, defesa e habilidades.':'A Ordem sustenta uma rasura. Os registros reunidos podem ajudar a desfazê-la.'],effects:[],supportCharges:id===0?2:(a.story.met||V.Companions?.selected()?3:0),supportCooldown:0,canRetreat:id!==6,rewarded:false,returned:false,origin:{map:V.World.current.id,x:V.Player.data.x,y:V.Player.data.y}};
a.resonance=Math.min(100,a.resonance+P.bonus('resonance'));this.activate();this.persist();return true;
},
activate(){V.Game.mode='combat';V.Game.setWorldHUD(false);V.$('#arcade-hud').hidden=true;V.Input.clear();V.Audio.setTheme('boss');let root=V.$('#battle-root');if(!root){root=document.createElement('div');root.id='battle-root';root.className='adv-battle-root';V.$('#stage').appendChild(root);}this.ui();P.hud();V.Environment.hud();V.$('#adv-route-info')?.setAttribute('hidden','');},
all(){const a=this.active;return a?[...a.allies,...a.enemies]:[];},
get(id){return this.all().find(o=>o.id===id);},
has(actor,id){return actor.statuses.find(s=>s.id===id);},
status(actor,id,turns,power=1){if(['corruption','confused','obscured'].includes(id)&&this.has(actor,'seal')){this.log(actor.name+' resistiu com o Selo de Proveniência.');return;}const old=this.has(actor,id);if(old){old.turns=Math.max(old.turns,turns);old.power=Math.max(old.power,power);}else actor.statuses.push({id,turns,power});},
stat(actor,k){let n=actor.stats[k];if(['attack','knowledge'].includes(k)&&this.has(actor,'chorus'))n*=1+this.has(actor,'chorus').power;if(k==='attack'&&this.has(actor,'credit'))n*=.7;if(k==='attack'&&this.has(actor,'power'))n*=1.25;if(k==='agility'&&this.has(actor,'delay'))n*=.4;return n;},
log(text){const a=this.active;if(!a)return;a.log.push(text);a.log=a.log.slice(-9);},
damage(source,target,power,kind='attack',multiplier=1){
let n=Math.max(2,Math.round((power+.9*this.stat(source,kind)-.55*target.stats.defense-.12*target.stats.resolve)*multiplier));
if(this.has(source,'confused'))n=Math.round(n*.7);if(this.has(source,'obscured'))n=Math.round(n*.8);
if(this.has(target,'marked'))n=Math.round(n*1.25);if(this.has(target,'vulnerable'))n=Math.round(n*1.2);if(this.has(target,'guard'))n=Math.round(n*.45);
if(this.active.assist&&target.side==='ally')n=Math.round(n*.65);
const blocked=Math.min(target.shield,n);target.shield-=blocked;n-=blocked;target.health=Math.max(0,target.health-n);this.effect(target,n?'−'+n:'Protegido',n?'#ffc3bb':'#b0e4da');this.log(source.name+' → '+target.name+': '+n+' de dano'+(blocked?' · '+blocked+' absorvido':'')+'.');
if(this.has(target,'link')){const other=this.active.enemies.find(e=>e!==target&&e.health>0);if(other){const linked=Math.max(1,Math.round(n*.35));other.health=Math.max(0,other.health-linked);this.effect(other,'−'+linked,'#b6e3d2');}}
return n;
},
heal(source,target,power){const extra=P.bonus('healing'),value=Math.max(0,Math.round(power+this.stat(source,'knowledge')*.8+extra)),n=Math.min(value,target.stats.health-target.health);target.health+=n;this.effect(target,'+'+n,'#ade2b4');this.log(target.name+' recuperou '+n+' de vida.');},
shield(source,target,power,duration=3){const n=Math.round(power+this.stat(source,'knowledge')*.5+P.bonus('healing'));target.shield+=n;this.status(target,'shield',duration,n);this.effect(target,'Escudo +'+n,'#b4e7e2');},
effect(actor,text,color){this.active.effects.push({target:actor.id,text,color,life:1.3});},
initiative(){const a=this.active;a.round++;a.order=this.all().filter(o=>o.health>0).sort((x,y)=>this.stat(y,'agility')-this.stat(x,'agility')||x.id.localeCompare(y.id)).map(o=>o.id);a.turnIndex=-1;this.log('Rodada '+a.round+' · ordem por agilidade.');},
advance(){
const a=this.active;if(!a||this.checkResult())return;
if(!a.order.length||a.turnIndex>=a.order.length-1)this.initiative();
let actor;for(let i=0;i<20;i++){a.turnIndex++;if(a.turnIndex>=a.order.length){this.initiative();a.turnIndex=0;}actor=this.get(a.order[a.turnIndex]);if(actor?.health>0)break;}
if(!actor||actor.health<=0)return;
a.actor=actor.id;a.turnNumber++;a.selectedAction=null;a.selectedTarget=null;a.menu='main';
if(actor.side==='ally'){
const regen=actor.id==='player'?3+P.bonus('focusRegen'):3;actor.focus=Math.min(actor.stats.focus,actor.focus+regen);
if(actor.id==='player'&&P.ensure().overload>=85)this.status(actor,'corruption',2,4);
a.phase='command';
}else{a.phase='enemy';a.timer=V.settings.reducedMotion?.12:.8;this.plan(actor);}
for(const e of a.enemies.filter(e=>e.health>0))if(!e.plan)this.plan(e);
this.persist();this.ui();
},
plan(enemy){
const a=this.active,targets=a.allies.filter(o=>o.health>0),target=targets[(a.round+Number(enemy.id.slice(-1)))%Math.max(1,targets.length)];if(!target)return;
const alternate=(a.round+Number(enemy.id.slice(-1)))%3;
let type='attack',label='Pressão sobre '+target.name;
if(enemy.mechanic==='barreira'&&alternate===1){type='barrier';label='Erguer barreira e sustentar a rasura';}
if(enemy.mechanic==='apoio'&&a.enemies.some(e=>e!==enemy&&e.health<e.stats.health)){type='heal';label='Reparar o aliado mais ferido';}
if(enemy.mechanic==='confusao'&&alternate!==0){type=alternate===1?'obscure':'confuse';label=alternate===1?'Obscurecer a leitura de '+target.name:'Confundir a leitura de '+target.name;}
if(enemy.mechanic==='atraso'&&alternate===1){type='delay';label='Reduzir a iniciativa de '+target.name;}
if(enemy.mechanic==='credito'&&alternate===1){type='steal';label='Acumular poder com créditos roubados';}
if(enemy.mechanic==='furto'&&alternate===1){type='focus';label='Dispersar o foco de '+target.name;}
if(enemy.boss&&enemy.phase===2&&alternate===0){type='wave';label='Onda de rasura em todo o grupo';}
enemy.plan={type,target:target.id};enemy.intent=label;
},
enemyAction(){
const a=this.active,actor=this.get(a.actor);if(!a||!actor||actor.side!=='enemy')return;
const p=actor.plan||{type:'attack',target:a.allies.find(x=>x.health>0)?.id};let target=this.get(p.target);if(!target||target.health<=0)target=a.allies.find(x=>x.health>0);
a.phase='resolving';if(!target){this.checkResult();return;}
switch(p.type){
case'barrier':actor.shield+=25+8*a.id;this.status(actor,'shield',3,actor.shield);this.effect(actor,'Barreira +'+(25+8*a.id),'#c6c0e6');this.log(actor.name+' ergueu uma barreira. Contraprova pode removê-la.');break;
case'heal':{const ally=a.enemies.filter(e=>e.health>0).sort((x,y)=>x.health/x.stats.health-y.health/y.stats.health)[0];this.heal(actor,ally,12+a.id*3);break;}
case'wave':a.allies.filter(x=>x.health>0).forEach(t=>this.damage(actor,t,6,'knowledge',.78));break;
default:this.damage(actor,target,p.type==='attack'?10:6,p.type==='attack'?'attack':'knowledge');
if(p.type==='obscure')this.status(target,'obscured',2);if(p.type==='confuse')this.status(target,'confused',2);if(p.type==='delay')this.status(target,'delay',2);if(p.type==='steal')this.status(actor,'power',3);if(p.type==='focus'){const n=this.has(target,'guard')?3:9;target.focus=Math.max(0,target.focus-n);this.log(target.name+' perdeu '+n+' de foco.');}
}
actor.plan=null;this.endTurn(actor);this.afterAction();
},
skillCost(skill,rank){return skill.cost+Math.max(0,rank-1)*2+(P.ensure().overload>=60?4:0);},
choose(type,id=null){
const a=this.active;if(!a||a.phase!=='command')return false;
const actor=this.get(a.actor);if(type==='skills'||type==='items'||type==='support'){a.menu=type;this.ui();return true;}
if(type==='defend'||type==='retreat'||type==='context')return this.commit({type},null);
if(type==='skill'){
const skill=D.skills.find(s=>s.id===id),rank=P.ensure().skills[id]||0;if(!skill||!rank||actor.focus<this.skillCost(skill,rank)||(actor.cooldowns[id]||0)>0||skill.effect==='ultimate'&&P.ensure().resonance<60)return false;
a.selectedAction={type,id};a.phase='target';
}else if(type==='item'){if(!P.ensure().inventory[id]||D.items[id]?.category!=='consumable')return false;a.selectedAction={type,id};a.phase='target';}
else if(type==='supportAction'){
const s=D.support.find(s=>s.id===id);if(!s||a.supportCharges<s.cost||a.supportCooldown>0||s.chapter&&!V.state.completed.includes(s.chapter))return false;a.selectedAction={type,id};a.phase='target';
}else if(type==='attack'){a.selectedAction={type};a.phase='target';}else return false;
const targets=this.targets(a.selectedAction);a.selectedTarget=targets[0]?.id;this.ui();return true;
},
targets(action){const a=this.active;if(!a)return[];if(action.type==='attack')return a.enemies.filter(e=>e.health>0);if(action.type==='item')return D.items[action.id]?.effect==='resonance'?[this.get(a.actor)]:a.allies;
const d=action.type==='skill'?D.skills.find(x=>x.id===action.id):D.support.find(x=>x.id===action.id);return d?.target==='ally'||d?.target==='allies'?a.allies:a.enemies.filter(e=>e.health>0);},
commit(action,targetId){
const a=this.active;if(!a||!['command','target'].includes(a.phase))return false;
const actor=this.get(a.actor);if(!actor||actor.side!=='ally'||actor.health<=0)return false;
let target=targetId?this.get(targetId):null;
if(['attack','skill','item','supportAction'].includes(action.type)&&!this.targets(action).some(x=>x.id===targetId))return false;
if(action.type==='retreat'&&!a.canRetreat)return false;
if(action.type==='context'&&(!P.ensure().story.interpreted.includes(a.id)||a.enemies[0]?.shield>0))return false;
let skill,rank,cost;if(action.type==='skill'){
skill=D.skills.find(x=>x.id===action.id);rank=P.ensure().skills[skill?.id]||0;cost=skill?this.skillCost(skill,rank):Infinity;
if(!skill||!rank||actor.focus<cost||(actor.cooldowns[skill.id]||0)>0||skill.effect==='ultimate'&&P.ensure().resonance<60)return false;
}
if(action.type==='item'&&(!P.ensure().inventory[action.id]||D.items[action.id]?.category!=='consumable'))return false;
let support;if(action.type==='supportAction'){support=D.support.find(x=>x.id===action.id);if(!support||a.supportCharges<support.cost||a.supportCooldown>0)return false;}
a.phase='resolving';a.selectedAction=null;a.menu='main';
if(action.type==='retreat'){this.result('retreat');return true;}
if(action.type==='attack'){this.damage(actor,target,8);actor.focus=Math.min(actor.stats.focus,actor.focus+6);P.ensure().resonance=Math.min(100,P.ensure().resonance+7);}
if(action.type==='defend'){this.status(actor,'guard',2);actor.focus=Math.min(actor.stats.focus,actor.focus+13);P.ensure().overload=Math.max(0,P.ensure().overload-8);this.log(actor.name+' se protege e recupera 13 de foco. Próximo impacto −55%.');this.effect(actor,'Defesa','#c3e1de');}
if(action.type==='skill'){
actor.focus-=cost;actor.cooldowns[skill.id]=skill.cooldown+1;
this.applySkill(actor,target,skill,rank);
P.ensure().resonance=Math.min(100,P.ensure().resonance+(skill.effect==='ultimate'?0:8));P.ensure().overload=Math.min(100,P.ensure().overload+Math.max(0,(skill.effect==='ultimate'?20:skill.branch==='Vigília'?3:1)-P.bonus('overload')));
}
if(action.type==='item'){
const d=D.items[action.id];P.remove(action.id,1);
if(d.effect==='heal'){const n=Math.min(d.power,target.stats.health-target.health);target.health+=n;this.effect(target,'+'+n,'#9ce3b3');}
if(d.effect==='focus'){const n=Math.min(d.power,target.stats.focus-target.focus);target.focus+=n;this.effect(target,'Foco +'+n,'#b2d8eb');}
if(d.effect==='cleanse'){target.statuses=target.statuses.filter(s=>!['corruption','confused','obscured','delay'].includes(s.id));target.health=Math.min(target.stats.health,target.health+d.power);this.effect(target,'Efeito removido','#a5e0cb');}
if(d.effect==='resonance'){const r=P.ensure();r.resonance=Math.min(100,r.resonance+25);r.overload=Math.max(0,r.overload-15);}
this.log(actor.name+' usou '+d.name+'.');
}
if(action.type==='supportAction'){
a.supportCharges-=support.cost;a.supportCooldown=3;
if(support.id==='watch')this.shield(actor,target,38);
if(support.id==='light'){for(const e of a.enemies){e.shield=0;e.statuses=e.statuses.filter(s=>s.id!=='shield');}for(const ally of a.allies)ally.statuses=ally.statuses.filter(s=>s.id!=='obscured');}
if(support.id==='safe'){for(const ally of a.allies){ally.statuses=ally.statuses.filter(s=>!['confused','corruption','obscured','delay'].includes(s.id));ally.health=Math.min(ally.stats.health,ally.health+20);}}
if(support.id==='guardian'){const r=P.ensure();r.resonance=Math.min(100,r.resonance+30);r.overload=Math.max(0,r.overload-20);for(const ally of a.allies)this.shield(actor,ally,25);}
this.log((V.Companions?.name()||'Zambeto')+' oferece '+support.name+'.');a.guardianEffect=1.4;
}
if(action.type==='context'){
const boss=a.enemies[0];boss.integrity--;this.log(actor.name+' apresenta as fontes comparadas com a equipe. Sustentação da rasura: '+boss.integrity+'/3.');this.effect(boss,'Contexto −1','#addec5');if(boss.integrity<=0){a.contextualized=true;a.enemies.forEach(e=>e.health=0);}
}
this.endTurn(actor);this.afterAction();return true;
},
applySkill(actor,target,skill,rank){
const a=this.active,power=skill.power*(1+.2*(rank-1)),duration=skill.duration+(rank===3?1:0),r=P.ensure();this.log(actor.name+' usa '+skill.name+' · grau '+rank+'.');
switch(skill.effect){
case'mark':this.status(target,'marked',duration);target.revealed=true;this.plan(target);this.effect(target,'Fraqueza revelada','#eddf9b');break;
case'delay':this.damage(actor,target,power,'knowledge');this.status(target,'delay',duration);break;
case'break':target.shield=0;target.statuses=target.statuses.filter(s=>s.id!=='shield');this.status(target,'vulnerable',duration);this.damage(actor,target,power,'knowledge');break;
case'chorus':a.allies.forEach(t=>this.status(t,'chorus',duration,power));this.effect(actor,'Vozes em Coro','#d8c5f1');break;
case'shield':this.shield(actor,target,power,duration);break;
case'heal':this.heal(actor,target,power);break;
case'cleanse':target.statuses=target.statuses.filter(s=>!['corruption','confused','obscured','delay'].includes(s.id));this.heal(actor,target,power*.4);break;
case'link':a.enemies.filter(e=>e.health>0).forEach(e=>{this.status(e,'link',duration);e.revealed=true;});this.damage(actor,target,power,'knowledge');break;
case'credit':target.statuses=target.statuses.filter(s=>s.id!=='power');this.status(target,'credit',duration);this.damage(actor,target,power,'knowledge',target.enemy==='attribution'?1.35:1);break;
case'double':{const evidence=V.Quests.status(a.id||1).clues;this.damage(actor,target,power+evidence*2,'knowledge');if(target.health>0)this.damage(actor,target,power+evidence*2,'knowledge');break;}
case'seal':a.allies.forEach(t=>this.status(t,'seal',duration));break;
case'ultimate':r.resonance-=60;for(const e of a.enemies.filter(e=>e.health>0))this.damage(actor,e,power,'knowledge');for(const ally of a.allies)ally.health=Math.min(ally.stats.health,ally.health+15);a.ultimateEffect=1.5;break;
}
},
endTurn(actor){
const a=this.active;if(this.has(actor,'corruption')){const value=Math.max(1,Math.round(8-this.stat(actor,'resolve')*.12));actor.health=Math.max(0,actor.health-value);this.effect(actor,'−'+value+' corrupção','#ccb8e7');}
for(const s of actor.statuses)s.turns--;
if(actor.statuses.some(s=>s.id==='shield'&&s.turns<=0))actor.shield=0;
actor.statuses=actor.statuses.filter(s=>s.turns>0);
for(const id of Object.keys(actor.cooldowns))actor.cooldowns[id]=Math.max(0,actor.cooldowns[id]-1);
if(actor.id==='player'&&a.supportCooldown>0)a.supportCooldown--;
for(const e of a.enemies)if(e.boss&&e.health>0&&e.health<=e.stats.health*.5&&e.phase===1){e.phase=2;e.shield+=18+a.id*4;e.plan=null;this.log(e.name+' muda de padrão: ondas no grupo e uma barreira temporária. Use fontes, proteção e contramedidas.');}
const main=a.allies[0],r=P.ensure();r.health=main.health;r.focus=main.focus;
},
afterAction(){const a=this.active;if(this.checkResult())return;a.phase='resolving';a.timer=V.settings.reducedMotion?.08:.6;this.persist();this.ui();},
checkResult(){const a=this.active;if(!a||['victory','defeat','retreat','returned'].includes(a.phase))return true;if(a.enemies.every(x=>x.health<=0)){this.result('victory');return true;}if(a.allies.every(x=>x.health<=0)){this.result('defeat');return true;}return false;},
result(type){
const a=this.active;if(!a||['victory','defeat','retreat','returned'].includes(a.phase))return;
a.phase=type;a.menu='main';a.selectedAction=null;a.timer=0;
if(type==='victory'&&!a.rewarded){a.rewarded=true;const xp=a.practice?0:a.id===0?80:220+a.id*75;if(!a.practice)P.reward('battle-'+a.key,xp,{water:2,tea:1,...(a.id===3?{lens:1}:{})});a.rewardXP=xp;P.ensure().overload=Math.max(0,P.ensure().overload-12);V.Audio.sfx('victory');}
if(type==='defeat')this.log('A equipe recua. Nenhum registro, equipamento ou ponto de experiência foi perdido. Uma pausa permite reorganizar as habilidades.');
this.persist();this.ui();
},
finish(){
const a=this.active;if(!a||a.returned||!['victory','defeat','retreat'].includes(a.phase))return;
a.returned=true;const won=a.phase==='victory',id=a.id,practice=a.practice,custom=a.custom,r=P.ensure();r.health=Math.max(Math.round(P.stats().health*.35),a.allies[0].health);r.focus=Math.max(15,a.allies[0].focus);r.battle=null;this.active=null;V.$('#battle-root')?.remove();V.Game.mode='explore';V.Game.setWorldHUD(true);V.Audio.setTheme(V.World.current.theme);P.hud();V.Environment.hud();V.Save.save();
if(won&&!practice&&!custom)V.Story.onVictory(id);else if(won)V.UI.toast('Manifestação resolvida. A campanha continua no seu ritmo.');
},
retry(){const a=this.active;if(!a||a.phase!=='defeat')return;const id=a.id,practice=a.practice;this.active=null;V.$('#battle-root')?.remove();V.Game.mode='explore';P.rest();this.begin(id,a.assist,{practice,custom:a.customDefinition});},
cancel(){if(!this.active)return;const a=this.active;if(a.canRetreat)this.result('retreat');else V.UI.toast('Este confronto final permite preparar e tentar novamente após a derrota.');},
persist(){
const a=this.active;if(!a||!V.state)return;const snapshot=copy(a);snapshot.effects=[];
if(snapshot.phase==='resolving'){snapshot.phase='next';snapshot.timer=.05;}
P.ensure().battle=snapshot;V.Save.save();
},
resume(snapshot){if(!snapshot||snapshot.schema!==3||!Array.isArray(snapshot.allies)||!Array.isArray(snapshot.enemies))return false;this.active=copy(snapshot);this.active.effects=[];if(this.active.phase==='target'){this.active.phase='command';this.active.menu='main';}if(this.active.phase==='resolving')this.active.phase='next';this.activate();return true;},
update(dt){const a=this.active;if(!a)return;a.clock+=dt;const speed=V.settings.battleSpeed||1;a.effects=a.effects.filter(e=>{e.life-=dt*speed;return e.life>0;});a.guardianEffect=Math.max(0,(a.guardianEffect||0)-dt);a.ultimateEffect=Math.max(0,(a.ultimateEffect||0)-dt);if(['next','resolving','enemy'].includes(a.phase)){a.timer-=dt*speed;if(a.timer<=0){if(a.phase==='enemy')this.enemyAction();else this.advance();}}},
back(){const a=this.active;if(!a)return;if(a.phase==='target'){a.phase='command';a.selectedAction=null;a.selectedTarget=null;}else if(a.phase==='command')a.menu='main';this.ui();},
key(k,e){
const a=this.active;if(!a||V.modal)return false;
if(k==='escape'&&(a.phase==='target'||a.menu!=='main')){e.preventDefault?.();this.back();return true;}
if(a.phase==='target'){
const targets=this.targets(a.selectedAction),at=targets.findIndex(x=>x.id===a.selectedTarget);
if(['arrowleft','arrowup','arrowright','arrowdown'].includes(k)){e.preventDefault?.();const direction=['arrowleft','arrowup'].includes(k)?-1:1;a.selectedTarget=targets[(at+direction+targets.length)%targets.length]?.id;this.ui();return true;}
if(['enter','e'].includes(k)){e.preventDefault?.();this.commit(a.selectedAction,a.selectedTarget);return true;}
}
if(a.phase==='command'&&/^[1-6]$/.test(k)){const buttons=Array.from(V.$$('#battle-root .battle-commands button'));buttons[+k-1]?.click();return true;}return false;
},
ui(){
const a=this.active,root=V.$('#battle-root');if(!a||!root)return;const actor=this.get(a.actor),r=P.ensure();
const header=`<div class="battle-heading"><span>CONFRONTO POR TURNOS · ${a.intro?'PRIMEIRA VIGÍLIA':'CAPÍTULO '+a.id} · RODADA ${a.round||1}</span><b>${a.phase==='command'||a.phase==='target'?'Vez de '+esc(actor?.name||''):a.phase==='enemy'?'Intenção de '+esc(actor?.name||''):a.phase==='resolving'?'Ação em resolução':a.phase==='victory'?'Rasura desfeita':a.phase==='defeat'?'Uma nova tentativa é possível':a.phase==='retreat'?'Equipe em segurança':'Observar, proteger, contextualizar'}</b><small>Ressonância ${Math.round(r.resonance)} · Sobrecarga ${Math.round(r.overload)} · Apoios ${a.supportCharges}</small></div>`;
const party=`<div class="battle-party">${a.allies.map(x=>`<button class="battle-actor ${x.id===a.actor?'active':''} ${x.health<=0?'fallen':''}" data-ally-target="${x.id}" ${a.phase==='target'&&this.targets(a.selectedAction).some(t=>t.id===x.id)?'':'disabled'}><img src="assets/characters/${x.character}-portrait.png" alt=""><span><b>${esc(x.name)}</b><small>Vida ${x.health}/${x.stats.health} · Foco ${x.focus}/${x.stats.focus}${x.shield?' · Escudo '+x.shield:''}</small><progress max="${x.stats.health}" value="${x.health}"></progress><small>${x.statuses.map(s=>statusNames[s.id]+' '+s.turns).join(' · ')||'Sem efeitos'}</small></span></button>`).join('')}</div>`;
let commands='';
if(a.phase==='intro')commands=`<div class="battle-intro"><p>${esc(a.enemies[0].tip)}</p><p>Sem limite para decidir. Ataque não usa foco. Defesa recupera foco. Habilidades e itens ocupam um turno. Consultar registros não gasta turnos.</p><button id="battle-start" class="primary">Iniciar confronto</button></div>`;
else if(['victory','defeat','retreat'].includes(a.phase))commands=`<div class="battle-result"><h3>${a.phase==='victory'?(a.contextualized?'O contexto desfez a sustentação da rasura.':'A manifestação perdeu sua força.') :a.phase==='defeat'?'A equipe preservou os registros e recuou.':'É possível voltar e preparar outra abordagem.'}</h3><p>${a.phase==='victory'?'+'+a.rewardXP+' XP · recompensas registradas uma única vez.':'Revise a intenção inimiga. Contraprova desfaz barreiras; Selo impede efeitos; Defesa reduz o próximo impacto.'}</p><div class="row">${a.phase==='defeat'?'<button id="battle-retry" class="primary">Recuperar e tentar novamente</button>':''}<button id="battle-finish" class="${a.phase==='victory'?'primary':'secondary'}">${a.phase==='victory'?'Continuar a investigação':'Voltar à exploração'}</button></div></div>`;
else if(a.phase==='target'){
const action=a.selectedAction,name=action.type==='skill'?D.skills.find(s=>s.id===action.id)?.name:action.type==='item'?D.items[action.id]?.name:action.type==='supportAction'?D.support.find(s=>s.id===action.id)?.name:'Ataque';
commands=`<div class="battle-target-prompt"><strong>${esc(name)} · escolha um alvo</strong><div class="battle-target-list">${this.targets(action).map(t=>`<button data-battle-target="${t.id}" class="${t.id===a.selectedTarget?'primary':'secondary'}">${esc(t.name)} · ${t.health}/${t.stats.health}</button>`).join('')}</div><small>Setas selecionam · E / Enter confirma · Esc cancela</small><button id="battle-back" class="quiet">Cancelar escolha</button></div>`;
}else if(a.phase==='command'){
if(a.menu==='main')commands=`<div class="battle-commands">${[['attack','Atacar','Sem custo · recupera 6 foco'],['defend','Defender','−55% no próximo impacto · +13 foco'],['skills','Habilidades','Pesquisa · Memória · Vigília'],['items','Itens','Consumíveis · usa um turno'],['support','Apoio de '+(V.Companions?.name()||'Zambeto'),a.supportCharges+' apoios restantes'],['context','Restituir contexto',r.story.interpreted.includes(a.id)?'3 apresentações desfazem a rasura':'Compare primeiro as evidências']].map(([id,n,tip],i)=>`<button class="${id==='attack'?'primary':'secondary'}" data-battle-command="${id}" ${id==='support'&&(!a.supportCharges||a.supportCooldown>0)||id==='context'&&(!r.story.interpreted.includes(a.id)||a.enemies[0]?.shield>0)?'disabled':''}><b>${i+1} · ${n}</b><small>${esc(tip)}</small></button>`).join('')}</div>`;
if(a.menu==='skills')commands=`<div class="battle-skill-list">${D.skills.filter(s=>r.skills[s.id]).map(s=>{const rank=r.skills[s.id],cost=this.skillCost(s,rank),cd=actor.cooldowns[s.id]||0,disabled=actor.focus<cost||cd||s.effect==='ultimate'&&r.resonance<60;return `<button data-battle-skill="${s.id}" class="secondary" title="${esc(s.description)}" ${disabled?'disabled':''}>${P.icon(s.id,30)}<span><b>${s.name} · ${rank}</b><small>${cost} foco${cd?' · recarga '+cd:''}${s.effect==='ultimate'?' · 60 ressonância':''}</small></span></button>`;}).join('')}</div><button id="battle-back" class="quiet">Voltar aos comandos</button>`;
if(a.menu==='items')commands=`<div class="battle-skill-list">${Object.entries(r.inventory).filter(([id])=>D.items[id]?.category==='consumable').map(([id,n])=>`<button data-battle-item="${id}" class="secondary" title="${esc(D.items[id].description)}">${P.icon(id,30)}<span><b>${D.items[id].name} ×${n}</b><small>${esc(D.items[id].description)}</small></span></button>`).join('')||'<p>Sem consumíveis. Ataque e Defesa continuam disponíveis.</p>'}</div><button id="battle-back" class="quiet">Voltar aos comandos</button>`;
if(a.menu==='support')commands=`<div class="battle-skill-list">${D.support.map(s=>`<button data-battle-support="${s.id}" class="secondary" title="${esc(s.description)}" ${a.supportCharges<s.cost||a.supportCooldown>0||s.chapter&&!V.state.completed.includes(s.chapter)?'disabled':''}><span><b>${s.name}</b><small>${s.cost} apoio(s) · ${s.chapter&&!V.state.completed.includes(s.chapter)?'Após capítulo '+s.chapter:esc(s.description)}</small></span></button>`).join('')}</div><button id="battle-back" class="quiet">Voltar aos comandos</button>`;
}else commands='<p class="battle-wait" role="status">Aguarde a resolução desta ação.</p>';
root.innerHTML=header+`<div class="battle-order">${a.order.map(id=>this.get(id)).filter(x=>x?.health>0).map(x=>`<span class="${x.id===a.actor?'active':''}">${esc(x.name)}</span>`).join('')}</div><div class="battle-bottom">${party}<div class="battle-command-panel">${commands}</div><div class="battle-log" aria-live="polite">${a.log.slice(-2).map(s=>`<p>${esc(s)}</p>`).join('')}</div><div class="battle-options"><button id="battle-review" class="quiet">Consultar registros · sem turno</button>${a.canRetreat&&a.phase==='command'?'<button id="battle-retreat" class="quiet">Recuar</button>':''}<button id="battle-speed" class="quiet">Animação: ${V.settings.battleSpeed||1}×</button></div></div>`;
V.$('#battle-start')?.addEventListener('click',()=>{if(this.active?.phase!=='intro')return;a.phase='initiative';this.advance();});
if(a.enemies.some(e=>e.revealed)){const button=document.createElement('button');button.className='quiet';button.textContent='Análise revelada · sem turno';button.onclick=()=>this.analysis();V.$('#battle-root .battle-options').prepend(button);}
V.$$('[data-battle-command]').forEach(b=>b.onclick=()=>this.choose(b.dataset.battleCommand));V.$$('[data-battle-skill]').forEach(b=>b.onclick=()=>this.choose('skill',b.dataset.battleSkill));V.$$('[data-battle-item]').forEach(b=>b.onclick=()=>this.choose('item',b.dataset.battleItem));V.$$('[data-battle-support]').forEach(b=>b.onclick=()=>this.choose('supportAction',b.dataset.battleSupport));
V.$$('[data-battle-target],[data-ally-target]').forEach(b=>b.onclick=()=>{if(a.phase==='target')this.commit(a.selectedAction,b.dataset.battleTarget||b.dataset.allyTarget);});
V.$('#battle-back')?.addEventListener('click',()=>this.back());V.$('#battle-finish')?.addEventListener('click',()=>this.finish());V.$('#battle-retry')?.addEventListener('click',()=>this.retry());V.$('#battle-retreat')?.addEventListener('click',()=>this.commit({type:'retreat'}));V.$('#battle-review')?.addEventListener('click',()=>V.Game.gallery());V.$('#battle-speed')?.addEventListener('click',()=>{V.settings.battleSpeed=({1:2,2:3,3:1})[V.settings.battleSpeed||1];V.Save.applySettings();this.ui();});
},
analysis(){const a=this.active;if(!a)return;V.UI.modal('Análise das manifestações','LEITURA CRÍTICA · MAPA DE VÍNCULOS',a.enemies.filter(e=>e.revealed).map(e=>`<article class="card"><h3>${esc(e.name)}</h3><p>Intenção: ${esc(e.intent)}</p><p>${esc(e.tip)}</p><small>Ataque ${Math.round(this.stat(e,'attack'))} · Defesa ${e.stats.defense} · Agilidade ${Math.round(this.stat(e,'agility'))} · Determinação ${e.stats.resolve}</small><p>${e.statuses.map(s=>esc(statusNames[s.id]||s.id)+' · '+s.turns+' turno(s)').join(' / ')||'Sem efeitos ativos.'}</p></article>`).join('')+'<p class="note">Consultar esta análise não usa turnos. Os atributos pertencem às manifestações ficcionais da aventura.</p>','<button id="battle-analysis-close" class="primary">Retomar confronto</button>');V.$('#battle-analysis-close').onclick=()=>V.UI.close();},
position(actor){const a=this.active,index=(actor.side==='ally'?a.allies:a.enemies).indexOf(actor),canvas=this.surface||V.Engine.canvas,width=canvas.width,height=canvas.height;if(height<440)return{x:width*(actor.side==='ally'?.18+index*.12:.58+index*.16),y:height*.46};return actor.side==='ally'?{x:width*(.18+index*.065),y:height*(.40+index*.105)}:{x:width*(.67+index*.115),y:height*(.32+index*.10)};},
render(ctx){
const a=this.active;if(!a)return;ctx.imageSmoothingEnabled=false;const stage=V.$('#stage'),width=stage.clientWidth||ctx.canvas.width,height=stage.clientHeight||ctx.canvas.height,compact=height<440,unit=compact?.64:1,background=V.Assets.images['battle-archive'];this.surface={width,height};ctx.save();ctx.scale(ctx.canvas.width/width,ctx.canvas.height/height);
if(a.id===6&&background)ctx.drawImage(background,0,0,width,height);else{const m=V.World.maps[a.origin.map],snapshot=m?V.Atlas.snapshot(m):null;if(snapshot)ctx.drawImage(snapshot,0,0,snapshot.width,snapshot.height,0,0,width,height);else{ctx.fillStyle='#2d4243';ctx.fillRect(0,0,width,height);}ctx.fillStyle='#14213599';ctx.fillRect(0,0,width,height);}
const gradient=ctx.createLinearGradient(0,0,0,height);gradient.addColorStop(0,'#13182b66');gradient.addColorStop(.5,'#151c2b22');gradient.addColorStop(1,'#0c152be8');ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);
for(const actor of this.all()){
const p=this.position(actor),x=p.x,y=p.y;if(actor.health<=0&&actor.side==='enemy')continue;
ctx.fillStyle='#07142055';ctx.beginPath();ctx.ellipse(x,y+5,actor.side==='enemy'?43:23,10,0,0,Math.PI*2);ctx.fill();
if(actor.side==='ally'){ctx.globalAlpha=actor.health<=0?.45:1;V.Assets.sprite(ctx,actor.character,x,y,actor.id===a.actor&&a.phase==='resolving'?4:2,Math.floor(a.clock*2)%4,96*unit);ctx.globalAlpha=1;}
else{const img=V.Assets.images['rasura-enemies'],size=(actor.boss?150:115)*unit,frame=actor.health<actor.stats.health*.2?3:actor.id===a.actor&&a.phase==='resolving'?2:Math.floor(a.clock*1.3)%2;if(img)ctx.drawImage(img,frame*128,actor.row*144,128,144,Math.round(x-size/2),Math.round(y-size+12),size,size);}
if(actor.side==='enemy'){
const nameY=y-(actor.boss?149:115)*unit,barWidth=compact?112:142,limit=compact?19:24;ctx.fillStyle='#172235e8';ctx.fillRect(x-barWidth/2-5,nameY-14,barWidth+10,49);V.Engine.text(ctx,actor.name.length>limit?actor.name.slice(0,limit-1)+'…':actor.name,x,nameY,'#f1dfbc',compact?9:12,'center');ctx.fillStyle='#4d3b4a';ctx.fillRect(x-barWidth/2,nameY+8,barWidth,8);ctx.fillStyle='#db967d';ctx.fillRect(x-barWidth/2,nameY+8,barWidth*actor.health/actor.stats.health,8);V.Engine.text(ctx,actor.health+'/'+actor.stats.health+(actor.shield?' · escudo '+actor.shield:''),x,nameY+30,'#e8dfcf',compact?8:10,'center');
V.Engine.text(ctx,(actor.phase===2?'Padrão II · ':'')+actor.intent.slice(0,compact?24:42),x,y+(compact?18:29),'#e6d6ac',compact?8:10,'center');
if(actor.statuses.length)V.Engine.text(ctx,actor.statuses.map(s=>(statusNames[s.id]||s.id)+' '+s.turns).join(' · ').slice(0,compact?25:52),x,y+(compact?29:44),'#9bddce',compact?8:10,'center');
}
if(a.selectedTarget===actor.id||a.actor===actor.id){ctx.strokeStyle=a.selectedTarget===actor.id?'#f5cc74':'#76d5c5';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y+7,actor.side==='enemy'?48:31,14,0,0,Math.PI*2);ctx.stroke();}
}
if(P.ensure().story.met||a.id===0){const img=V.Assets.images.zambeto,x=width*.075,y=height*.48;if(img)ctx.drawImage(img,(a.guardianEffect?2:0)*128,(a.guardianEffect?4:0)*144,128,144,x-44*unit,y-105*unit,88*unit,99*unit);V.Engine.text(ctx,'Vigília · '+a.supportCharges,x,y+8,'#dfc58b',compact?8:10,'center');}
for(const effect of a.effects){const actor=this.get(effect.target);if(!actor)continue;const p=this.position(actor);V.Engine.text(ctx,effect.text,p.x,p.y-90-(1.3-effect.life)*17,effect.color,20,'center');}
if(a.ultimateEffect>0){ctx.save();ctx.globalAlpha=Math.min(.45,a.ultimateEffect*.25);ctx.strokeStyle='#9bf0de';ctx.lineWidth=5;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(width*.5,height*.42,(1.5-a.ultimateEffect)*210+i*90,50+i*20,0,0,Math.PI*2);ctx.stroke();}ctx.restore();}
ctx.restore();
},
drawManifestation(ctx,o,cam){const id=o.chapter||o.encounter?.chapter||1,definition=D.cases[id-1],enemy=D.enemies.find(e=>e.id===definition.enemy),img=V.Assets.images['rasura-enemies'];if(!img)return;const won=V.state.completed.includes(id)&&o.type==='boss';ctx.save();ctx.globalAlpha=won?.5:1;ctx.drawImage(img,0,enemy.row*144,128,144,Math.round(o.x-cam.x-48),Math.round(o.y-cam.y-94),96,108);if(V.World.nearest?.id===o.id||!won)V.Living.marker(ctx,o.x-cam.x,o.y-cam.y,won?'✓':V.Quests.ready(id)?'!':'◇','#d5a882');ctx.restore();},
pointer(){return false;}
};
})();
