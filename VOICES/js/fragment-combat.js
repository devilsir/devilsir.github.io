/* Registered module: fragment-combat */
(function(init){if(window.VoicesModules)window.VoicesModules.define('fragment-combat',init);else init();})(function(){
  'use strict';
  const V=window.V,B=V.Combat,P=V.Progress,D=V.FragmentData;
  const negatives=new Set(['corruption','confused','obscured','delay','poison','shock','stun','freeze','burn','weak','slow','vulnerable','marked']);
  const controls=new Set(['stun','freeze']);
  const attackEffects=new Set(['poison','shock','stun','freeze','burn','slow','weaken']);
  const living=units=>units.filter(unit=>unit.health>0);
  const cleanse=actor=>{actor.statuses=actor.statuses.filter(status=>!negatives.has(status.id));};
  const maskOf=actor=>actor.maskBonus;
  const mask=()=>D.masks[V.AncestralMask.appearance().model]||D.masks.default;
  const durationFor=(actor,effect,turns)=>turns+(actor.id===B.active.actor&&!controls.has(effect)?1:0);
  function focus(actor,amount){
    const before=actor.focus;
    actor.focus=V.clamp(before+amount,0,actor.stats.focus);
    if(actor.focus!==before)B.effect(actor,'Foco '+(amount>0?'+':'')+(actor.focus-before),'#c2d8fb');
  }
  function tickLife(actor,amount,id){
    const taken=Math.min(actor.health,amount);
    actor.health-=taken;
    B.effect(actor,'−'+taken+' '+D.conditions[id][0].toLowerCase(),'#f1be9c');
    B.log(actor.name+' perdeu '+taken+' de vida · '+D.conditions[id][0]+'.');
  }
  V.AdventureData.support.push(...D.spirits);
  V.FragmentCombat={
    mask,cleanse,
    prepare(a){
      if(a.intro)return;
      const r=P.ensure(),hero=a.allies[0],key=V.AncestralMask.appearance().model;
      if(r.story.awakened)hero.maskBonus=D.masks[key]?key:'default';
      switch(hero.maskBonus){
        case 'default':r.resonance=Math.min(100,r.resonance+8);break;
        case 'chifres':{
          const extra=Math.round(hero.stats.health*.18);
          hero.stats.health+=extra;hero.health+=extra;break;
        }
        case 'totem':hero.shield+=12;B.status(hero,'shield',3,12);break;
      }
      a.spirit=V.FragmentForest?.spirit()?.id||null;
      if(a.spirit)a.supportCharges=Math.max(2,a.supportCharges);
    },
    foes(encounter,allies,level){
      const scale=1+Math.min(.6,Math.max(0,level-1)*.055)+Math.max(0,allies.length-1)*.11;
      return encounter.foes.map((key,index)=>{
        const e=encounter.infinity?V.InfinityTrailRooms.lookup(key):D.enemies[key],boss=key==='archivist'||!!e.boss;
        const s=encounter.infinity?V.InfinityTrailRooms.strength(e,encounter.infinity,allies,level):{health:Math.round(e.health*scale),attack:Math.round(e.attack*(.8+scale*.2)),defense:e.defense,agility:e.agility,focus:30,knowledge:e.attack,resolve:9};
        return Object.assign(B.actor('enemy-'+index,e.name,null,s,'enemy'),{
          enemy:e.id,fragmentArt:e.art,fragmentSheet:e.sheet,move:e.move,spell:e.spell,tip:e.tip,boss,phase:1,plan:null,intent:'Observe a trilha.'
        });
      });
    },
    immune(actor,id){
      const key=maskOf(actor);
      if(id==='burn'&&key==='coroa-solar'||id==='stun'&&key==='chifres'||id==='confused'&&key==='mosaico'||id==='poison'&&key==='caveira')return true;
      return negatives.has(id)&&!!B.has(actor,'ward');
    },
    beforeTurn(actor){
      const control=B.has(actor,'stun')||B.has(actor,'freeze');
      if(!control)return false;
      actor.plan=null;
      B.log(actor.name+' perde a ação · '+D.conditions[control.id][0]+'.');
      B.effect(actor,D.conditions[control.id][0],'#c8e2ff');
      B.endTurn(actor);B.afterAction();
      return true;
    },
    endTurn(actor){
      const resist=maskOf(actor)==='caveira'?.75:1;
      for(const id of ['poison','burn','shock']){
        const s=B.has(actor,id);
        if(!s||actor.health<=0)continue;
        tickLife(actor,Math.max(1,Math.round(s.power*resist)),id);
        if(id==='shock')focus(actor,-4);
      }
      const regen=B.has(actor,'renew');
      if(regen&&actor.health>0){
        const value=Math.min(regen.power,actor.stats.health-actor.health);
        actor.health+=value;
        if(value)B.effect(actor,'+'+value+' regeneração','#ade2b4');
      }
    },
    use(actor,target,skill,power=skill.power,duration=skill.duration){
      const {effect}=skill,a=B.active;
      const targets=skill.target==='allies'?living(a.allies):skill.target==='enemies'?living(a.enemies):[target];
      if(attackEffects.has(effect)){
        const id=effect==='weaken'?'weak':effect,physical=['poison','stun'].includes(effect);
        for(const unit of targets){
          if(actor.health<=0)break;
          B.damage(actor,unit,power,physical?'attack':'knowledge');
          if(unit.health<=0||effect==='stun'&&unit!==(target||targets[0]))continue;
          B.status(unit,id,duration,{poison:7,burn:9,shock:4,slow:.32,weak:.24}[id]||1);
        }
        return true;
      }
      const apply=(unit,id,value=power)=>B.status(unit,id,durationFor(unit,id,duration),value);
      switch(effect){
        case 'bulwark':
          for(const unit of targets)B.shield(actor,unit,power,durationFor(unit,'shield',duration));
          apply(actor,'taunt',1);break;
        case 'counter':apply(target,'counter');break;
        case 'renew':
          for(const unit of targets){B.heal(actor,unit,power);B.status(unit,'renew',duration,power);}break;
        case 'wardShield':
        case 'ward':
          for(const unit of targets){
            if(effect==='wardShield')B.shield(actor,unit,power,durationFor(unit,'shield',duration));
            apply(unit,'ward',1);
          }
          break;
        case 'fortify':
          B.shield(actor,target,power,durationFor(target,'shield',duration));apply(target,'fortify',.27);break;
        case 'haste':for(const unit of targets)apply(unit,'haste');break;
        case 'focusAll':for(const unit of targets)focus(unit,power);break;
        case 'cleanseAll':for(const unit of targets){cleanse(unit);B.heal(actor,unit,power);}break;
        default:return false;
      }
      return true;
    },
    plan(enemy){
      const {allies,round}=B.active,targets=living(allies);
      if(!targets.length)return;
      const turn=round+Number(enemy.id.slice(-1));
      const target=targets.find(unit=>B.has(unit,'taunt'))||targets[turn%targets.length];
      const type=enemy.boss&&enemy.phase===2&&turn%3===0?'wave':turn%3!==0?enemy.move:'attack';
      const labels={barrier:'Ergue a carapaça',wave:'Onda elétrica em toda a equipe',attack:'Investida',poison:'Mordida venenosa',
        shock:'Choque de arquivo',stun:'Golpe atordoante',freeze:'Sopro de gelo',burn:'Jato de brasas'};
      enemy.plan={type,target:target.id};
      enemy.intent=labels[type]+(['barrier','wave'].includes(type)?'':' · '+target.name);
    },
    enemyAction(actor,plan,target){
      const type=plan.type;
      if(type==='barrier'){B.shield(actor,actor,16,3);return;}
      if(type==='attack'){B.damage(actor,target,7);return;}
      const move=type==='wave'?'shock':type;
      this.use(actor,target,{effect:move,target:type==='wave'?'allies':'ally',power:type==='wave'?4:6,duration:controls.has(move)?1:2});
    }
  };

  const status=B.status.bind(B);
  B.status=function(actor,id,...args){
    if(V.FragmentCombat.immune(actor,id)){
      B.log(actor.name+' resistiu a '+(D.conditions[id]?.[0]||id).toLowerCase()+'.');
      return;
    }
    if(id==='burn'&&B.has(actor,'freeze')){
      actor.statuses=actor.statuses.filter(s=>s.id!=='freeze');
      B.log('O fogo descongelou '+actor.name+'.');
    }
    if(id==='freeze'&&B.has(actor,'burn')){
      actor.statuses=actor.statuses.filter(s=>s.id!=='burn');
      B.log('A geada apagou as chamas de '+actor.name+'.');
      return;
    }
    return status(actor,id,...args);
  };
  const stat=B.stat.bind(B);
  B.stat=function(actor,key){
    let value=stat(actor,key);
    const mask=maskOf(actor);
    if(key==='agility'){
      if(mask==='plumagem')value*=1.2;
      value*=1+(B.has(actor,'haste')?.power||0);
      value*=1-(B.has(actor,'slow')?.power||0);
      if(B.has(actor,'shock'))value*=.76;
    }
    if(key==='defense'&&mask==='totem')value*=1.2;
    if(key==='knowledge'&&mask==='mosaico')value*=1.18;
    if(key==='attack'){
      if(B.has(actor,'burn'))value*=.82;
      if(mask==='felino')value*=B.active.round<=1?1.22:1.08;
    }
    return value;
  };
  const damage=B.damage.bind(B);
  B.damage=function(source,target,power,kind='attack',multiplier=1){
    if(maskOf(source)==='coroa-solar')multiplier*=1.15;
    multiplier*=1-(B.has(source,'weak')?.power||0);
    multiplier*=1-(B.has(target,'fortify')?.power||0);
    const n=damage(source,target,power,kind,multiplier),counter=B.has(target,'counter');
    if(n>0&&counter&&target.health>0&&source.health>0){
      const hit=Math.max(1,Math.round(n*counter.power)),blocked=Math.min(source.shield,hit);
      source.shield-=blocked;source.health=Math.max(0,source.health-(hit-blocked));
      B.effect(source,'−'+(hit-blocked)+' contra-ataque','#fdcda4');
    }
    return n;
  };
});
