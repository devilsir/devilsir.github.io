/* Registered module: adventure-combat */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("adventure-combat", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
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
 if(id>0)for(const [i,char]of (V.Team?.lineup(a)||[]).entries()){
 const s=V.Team.stats(char,stats);allies.push(this.actor('ally-'+i,V.content.characters[char]?.name||char,char,s,'ally'));}
const definition=D.cases[Math.max(0,id-1)],base=D.enemies.find(e=>e.id===(opts.custom?.enemy||(id?definition.enemy:'echo')))||D.enemies[0];
const key=opts.practice?'practice-'+id:opts.custom?.id||'chapter-'+id;
 const extra=Math.max(0,allies.length-3),enemies=[],make=(e,index,boss=false)=>{
const factor=.8+id*.16,hp=id===0?62:boss?145+id*34+a.level*5:Math.round(e.health*factor+a.level*2),s={health:opts.custom?.health&&boss?opts.custom.health:hp,focus:99,attack:opts.custom?.attack&&boss?opts.custom.attack:id===0?9:Math.round(e.attack*factor+id*1.5),defense:opts.custom?.defense&&boss?opts.custom.defense:Math.round(e.defense+id*.8),knowledge:12+id*3,agility:e.agility+id,resolve:9+id*2};
 if(extra){if(!opts.custom?.health||!boss)s.health=Math.round(s.health*(1+extra*.19));if(!opts.custom?.attack||!boss)s.attack=Math.round(s.attack*(1+extra*.08));}
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
skillList(actor=this.get(this.active?.actor)){return V.Team?.combatSkills(actor,this.active)||D.skills.filter(skill=>P.ensure().skills[skill.id]);},
skillRank(skill,actor=this.get(this.active?.actor)){
  if(!skill||!actor)return 0;
  if(V.Team?.skills.has(skill.id))return this.skillList(actor).includes(skill)?1:0;
  return actor.id==='player'||!V.Team?P.ensure().skills[skill.id]||0:0;
},
definition(action){
  if(action.type==='skill')return V.Team?.skills.get(action.id)||D.skills.find(skill=>skill.id===action.id);
  if(action.type==='item')return D.items[action.id];
  if(action.type==='supportAction')return D.support.find(support=>support.id===action.id);
},
availability(action,actor=this.get(this.active?.actor)){
  const a=this.active;
  if(!a||!actor||actor.side!=='ally'||actor.health<=0)return 'Aguarde o turno da equipe';
  const r=P.ensure(),definition=this.definition(action);
  switch(action.type){
    case 'skill': {
      const rank=this.skillRank(definition,actor);
      if(!rank)return actor.id==='player'&&!V.Team?.skills.has(action.id)?'Habilidade ainda não aprendida':'Habilidade de outro integrante';
      if(actor.cooldowns[action.id]>0)return 'Recarga '+actor.cooldowns[action.id]+' turno(s)';
      if(definition.effect==='ultimate'&&r.resonance<60)return 'Exige 60 de ressonância';
      const cost=this.skillCost(definition,rank);
      return actor.focus<cost?'Exige '+cost+' de foco':'';
    }
    case 'supportAction':
      if(!definition)return 'Apoio indisponível';
      if(definition.chapter&&!V.state.completed.includes(definition.chapter))return 'Após o capítulo '+definition.chapter;
      if(a.supportCooldown>0)return 'Recarga '+a.supportCooldown+' turno(s)';
      return a.supportCharges<definition.cost?'Sem cargas de apoio suficientes':'';
    case 'item':
      return definition?.category==='consumable'&&r.inventory[action.id]>0?'':'Item indisponível';
    case 'context':
      if(!r.story.interpreted.includes(a.id))return 'Compare as fontes com a máscara';
      if(!a.enemies[0]?.health)return 'A manifestação principal caiu';
      if(a.allies.length>3&&a.contextRound===a.round)return 'As fontes já foram apresentadas nesta rodada';
      return a.enemies[0].shield>0?'Desfaça a barreira primeiro':'';
    case 'retreat':
      return a.canRetreat?'':'Recuo indisponível neste confronto';
    case 'attack':
    case 'defend':
      return '';
    default:
      return 'Ação indisponível';
  }
},
choose(type,id=null){
  const a=this.active;
  if(!a||a.phase!=='command')return false;
  if(['skills','items','support'].includes(type)){
    if(a.auto)this.setAuto(false,false);
    a.menu=a.menu===type?'main':type;
    this.ui();
    return true;
  }
  const action={type,id};
  if(this.availability(action))return false;
  if(a.auto)this.setAuto(false,false);
  if(['defend','retreat','context'].includes(type))return this.commit(action,null);
  const targets=this.targets(action),definition=this.definition(action);
  if(!targets.length)return false;
  const aimed=targets.find(target=>target.id===a.aimTarget);
  const group=definition?.target==='allies'||definition?.target==='enemies'||type==='supportAction'&&id==='light';
  if(targets.length===1||group||aimed)return this.commit(action,(aimed||targets[0]).id);
  a.selectedAction=action;
  a.phase='target';
  a.selectedTarget=targets[0].id;
  this.ui();
  return true;
},
targets(action){
  const a=this.active;
  if(!a||!action)return [];
  if(action.type==='item')return D.items[action.id]?.effect==='resonance'?[this.get(a.actor)]:a.allies;
  const definition=this.definition(action);
  if(definition?.target==='ally'||definition?.target==='allies')return V.Team?.skills.has(definition.id)?a.allies.filter(ally=>ally.health>0):a.allies;
  return a.enemies.filter(enemy=>enemy.health>0);
},
commit(action,targetId){
const a=this.active;if(!a||!['command','target'].includes(a.phase))return false;
const actor=this.get(a.actor);if(this.availability(action,actor))return false;
let target=targetId?this.get(targetId):null;
if(['attack','skill','item','supportAction'].includes(action.type)&&!this.targets(action).some(x=>x.id===targetId))return false;
 const skill=action.type==='skill'?this.definition(action):null,rank=this.skillRank(skill,actor);
const support=action.type==='supportAction'?this.definition(action):null;
a.phase='resolving';a.selectedAction=null;a.selectedTarget=null;a.menu='main';
if(action.type==='retreat'){this.result('retreat');return true;}
if(action.type==='attack'){this.damage(actor,target,8);actor.focus=Math.min(actor.stats.focus,actor.focus+6);P.ensure().resonance=Math.min(100,P.ensure().resonance+7);}
if(action.type==='defend'){this.status(actor,'guard',2);actor.focus=Math.min(actor.stats.focus,actor.focus+13);P.ensure().overload=Math.max(0,P.ensure().overload-8);this.log(actor.name+' se protege e recupera 13 de foco. Próximo impacto −55%.');this.effect(actor,'Defesa','#c3e1de');}
if(action.type==='skill'){
actor.focus-=this.skillCost(skill,rank);actor.cooldowns[skill.id]=skill.cooldown+1;
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
 a.contextRound=a.round;
const boss=a.enemies[0];boss.integrity--;this.log(actor.name+' apresenta as fontes comparadas com a equipe. Sustentação da rasura: '+boss.integrity+'/3.');this.effect(boss,'Contexto −1','#addec5');if(boss.integrity<=0){a.contextualized=true;a.enemies.forEach(e=>e.health=0);}
}
this.endTurn(actor);this.afterAction();return true;
},
applySkill(actor,target,skill,rank){
const a=this.active,power=skill.power*(1+.2*(rank-1)),duration=skill.duration+(rank===3?1:0),r=P.ensure();this.log(actor.name+' usa '+skill.name+' · grau '+rank+'.');
switch(skill.effect){
case'strike':this.damage(actor,target,power);break;
case'knowledgeStrike':this.damage(actor,target,power,'knowledge');break;
case'strikeMark':this.damage(actor,target,power);if(target.health>0)this.status(target,'marked',duration);break;
case'strikeAll':a.enemies.filter(e=>e.health>0).forEach(e=>this.damage(actor,e,power,'knowledge'));break;
case'shieldAll':a.allies.filter(t=>t.health>0).forEach(t=>this.shield(actor,t,power,duration));break;
case'healAll':a.allies.filter(t=>t.health>0).forEach(t=>this.heal(actor,t,power));break;
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
a.phase=type;a.menu='main';a.auto=false;a.selectedAction=null;a.selectedTarget=null;a.aimTarget=null;a.timer=0;
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
statusText(actor){return actor.statuses.map(status=>(statusNames[status.id]||status.id)+' · '+status.turns).join(', ');},
drawManifestation(ctx,o,cam){const id=o.chapter||o.encounter?.chapter||1,definition=D.cases[id-1],enemy=D.enemies.find(e=>e.id===definition.enemy),img=V.Assets.images['rasura-enemies'];if(!img)return;const won=V.state.completed.includes(id)&&o.type==='boss';ctx.save();ctx.globalAlpha=won?.5:1;ctx.drawImage(img,0,enemy.row*144,128,144,Math.round(o.x-cam.x-48),Math.round(o.y-cam.y-94),96,108);if(V.World.nearest?.id===o.id||!won)V.Living.marker(ctx,o.x-cam.x,o.y-cam.y,won?'✓':V.Quests.ready(id)?'!':'◇','#d5a882');ctx.restore();},
pointer(){return false;}
};
})();

});
