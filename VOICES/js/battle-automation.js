/* Registered module: battle-automation */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define('battle-automation', initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
  'use strict';
  const V=window.V,B=V.Combat;
  const terminal=new Set(['victory','defeat','retreat','returned']);
  const impairment=new Set(['confused','corruption','obscured','delay']);
  const life=actor=>actor.health/actor.stats.health;
  const wounded=actor=>actor.stats.health-actor.health;
  const impaired=actor=>actor.statuses.some(status=>impairment.has(status.id));

  B.setAuto=function(enabled,refresh=true){
    const a=this.active;
    if(!a||terminal.has(a.phase))return false;
    a.auto=!!enabled;
    a.autoDelay=.52;
    if(a.phase==='target'){
      a.phase='command';
      a.selectedAction=null;
      a.selectedTarget=null;
    }
    a.menu='main';
    if(refresh){this.persist();this.ui();}
    return true;
  };

  B.suggestion=function(){
    const a=this.active,actor=this.get(a?.actor);
    if(a?.phase!=='command'||actor?.side!=='ally')return null;
    const enemies=a.enemies.filter(enemy=>enemy.health>0)
      .sort((left,right)=>left.health+left.shield-right.health-right.shield);
    if(!enemies.length)return null;
    const allies=[...a.allies].sort((left,right)=>life(left)-life(right));
    const frail=allies[0],shielded=enemies.find(enemy=>enemy.shield>0);
    const danger=enemies.some(enemy=>enemy.plan?.target===frail.id||enemy.plan?.type==='wave');
    const trouble=allies.filter(impaired);
    const option=(type,id,target,why)=>{
      const action={type,id};
      if(this.availability(action,actor))return null;
      if(target&&!this.targets(action).some(candidate=>candidate.id===target.id))return null;
      return {action,target:target?.id??null,why};
    };
    const skill=(id,target,why)=>option('skill',id,target,why);
    const support=(id,target,why)=>option('supportAction',id,target,why);
    const skills=this.skillList(actor);
    const roleSkill=(effects,target,why)=>{
      if(!target)return null;
      for(const entry of skills)if(effects.includes(entry.effect)){
        const move=skill(entry.id,target,why);
        if(move)return move;
      }
      return null;
    };
    const standing=allies.filter(ally=>ally.health>0),weak=standing[0];

    if(wounded(frail)>=22&&(life(frail)<.35||danger&&life(frail)<.49)){
      const recovery=skill('restore',frail,'Recuperar vida')||(weak&&wounded(weak)>16&&roleSkill(['heal','healAll','cleanse'],weak,'Recuperar vida'))||support('safe',frail,'Recuperar a equipe');
      if(recovery)return recovery;
      if(frail.shield===0&&frail.health>0){
        const protection=roleSkill(['shield','shieldAll'],frail,'Proteger quem está em risco')||support('watch',frail,'Proteger quem está em risco');
        if(protection)return protection;
      }
    }
    if(trouble.length){
      const removal=(trouble.length>1&&support('safe',frail,'Remover efeitos da equipe'))||roleSkill(['cleanse'],trouble.find(o=>o.health>0),'Remover efeito');
      if(removal)return removal;
    }
    if(shielded){
      const counter=roleSkill(['break'],shielded,'Desfazer barreira')||support('light',shielded,'Desfazer barreiras');
      if(counter)return counter;
    }
    const context=option('context',null,null,'Apresentar fontes comparadas');
    if(context)return context;
    if(enemies.length>1||enemies[0].health>=55){
      const convergence=skill('convergence',enemies[0],'Usar a ressonância da máscara');
      if(convergence)return convergence;
    }
    if(actor.focus<7&&danger&&frail===actor&&life(actor)<.56&&!this.has(actor,'guard')){
      return option('defend',null,null,'Proteger e recuperar foco');
    }
    const enemy=enemies[0];
    const threatened=standing.find(ally=>!ally.shield&&life(ally)<.69&&enemies.some(e=>e.plan?.target===ally.id||e.plan?.type==='wave'));
    if(threatened){
      const protection=roleSkill(['shield','shieldAll'],threatened,'Proteger a formação');
      if(protection)return protection;
    }
    if(standing.length>1&&!standing.some(ally=>this.has(ally,'chorus'))){
      const boost=roleSkill(['chorus'],actor,'Fortalecer a equipe');
      if(boost)return boost;
    }
    return (enemy.health>19&&skill('compare',enemy,'Atacar com as fontes'))
      || (enemy.mechanic==='credito'&&this.has(enemy,'power')&&skill('credit',enemy,'Reduzir a força inimiga'))
      || (enemy.health>18&&skill('timeline',enemy,'Atacar e atrasar o inimigo'))
      || (enemies.length>1&&roleSkill(['strikeAll','link'],enemy,'Atingir a formação adversária'))
      || (enemy.health>20&&roleSkill(['strike','knowledgeStrike','strikeMark','delay','credit'],enemy,'Usar a técnica do integrante'))
      || (standing.length>1&&enemy.health>30&&!this.has(enemy,'marked')&&roleSkill(['mark'],enemy,'Expor uma fraqueza'))
      || option('attack',null,enemy,'Atacar e recuperar foco');
  };

  B.useSuggestion=function(){
    const move=this.suggestion();
    if(!move)return false;
    if(this.active.auto)this.setAuto(false,false);
    return this.commit(move.action,move.target);
  };

  const update=B.update.bind(B);
  B.update=function(dt){
    const a=this.active,waiting=a?.phase==='command';
    if(!a||V.modal||V.Dialogue.active||V.Game.mode!=='combat'||document.hidden)return;
    update(dt);
    if(!waiting||a!==this.active||!a.auto||a.phase!=='command')return;
    const speed=V.settings.battleSpeed||1;
    a.autoDelay=Math.max(0,(a.autoDelay??.52)-dt*speed);
    if(a.autoDelay>0)return;
    a.autoDelay=.52;
    const move=this.suggestion();
    if(move)this.commit(move.action,move.target);
  };

  const resume=B.resume.bind(B);
  B.resume=function(snapshot){
    if(!snapshot)return false;
    return resume({...snapshot,auto:false,autoDelay:0,aimTarget:null});
  };
});
