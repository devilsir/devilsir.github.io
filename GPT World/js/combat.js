import { REGIONS, ROUTES, COMPANIONS, SKILLS, ROUTE_SKILLS, FORMS, NORMAL_DISPLAY, asset, formSprite, mobSprite } from "./data.js";
import { getPlayerStats, saveSettings } from "./state.js";

const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
const prettyBoss = (id) => id.replace(/^boss_\d+_|^miniboss_/,"").split("_").map((word)=>word.charAt(0).toUpperCase()+word.slice(1)).join(" ");

export class CombatSystem {
  constructor({screen,getState,audio,onVictory,onDefeat,onFlee,onHelp}) {
    this.screen=screen;
    this.getState=getState;
    this.audio=audio;
    this.callbacks={onVictory,onDefeat,onFlee,onHelp};
    this.backdrop=screen.querySelector("#battle-backdrop");
    this.partyStage=screen.querySelector("#party-stage");
    this.enemyStage=screen.querySelector("#enemy-stage");
    this.effectStage=screen.querySelector("#effect-stage");
    this.actions=screen.querySelector("#battle-actions");
    this.activeActor=screen.querySelector("#active-actor");
    this.detail=screen.querySelector("#battle-detail");
    this.logNode=screen.querySelector("#battle-log");
    this.initiative=screen.querySelector("#initiative-list");
    this.banner=screen.querySelector("#boss-banner");
    this.autoButton=screen.querySelector('[data-action="battle-auto"]');
    screen.querySelector('[data-action="battle-speed"]').addEventListener("click",()=>this.cycleSpeed());
    screen.querySelector('[data-action="battle-help"]').addEventListener("click",()=>this.callbacks.onHelp?.());
    this.autoButton.addEventListener("click",()=>this.toggleAuto());
    this.autoTimer=null;this.turnSerial=0;this.actionInProgress=false;
  }

  get speed() { return Number(this.getState()?.settings?.battleSpeed || 1); }
  delay(ms) { return new Promise((resolve)=>setTimeout(resolve,Math.max(80,ms/this.speed))); }

  start(regionIndex,encounterType="normal",finalEnding=null) {
    this.cancelPendingAuto();this.turnSerial=0;this.actionInProgress=false;
    this.battleMode="world";this.towerConfig=null;delete this.screen.dataset.battleMode;delete this.screen.dataset.towerMutation;
    this.region=REGIONS[regionIndex];
    this.encounterType=encounterType;
    this.battle={round:0,queue:[],current:null,log:[],ended:false,commandLocked:false,reverseHealing:false,lastSkill:null,finalEnding};
    this.buildParty();
    this.buildEnemies();
    if(finalEnding)this.configureFinalBattle(finalEnding);
    this.backdrop.style.backgroundImage=`url("${asset(this.region.battle)}")`;
    this.screen.querySelector("#battle-region").textContent=this.region.name.toUpperCase();
    const finalTitles={order:"O Paradoxo Selvagem",will:"A Geometria sem Rosto",free:"O Mestre que Você Criou",silence:"A Última Palavra",balance:"Nós Três"};
    this.screen.querySelector("#battle-title").textContent=finalEnding?finalTitles[finalEnding]:this.encounterType==="normal"?"Convergência Hostil":this.encounterType==="miniboss"?"Sentinela da Fratura":this.region.bossNames[this.encounterType==="boss1"?0:1];
    this.screen.querySelector("#battle-speed").textContent=`${this.speed}×`;
    this.updateAutoButton();
    this.screen.classList.add("active");
    this.audio.stopAmbient();
    this.log(`O ar de ${this.region.name} se dobra ao redor do combate.`);
    if (encounterType!=="normal") this.showBossBanner();
    this.render();
    this.nextTurn();
  }

  startTowerEncounter(config) {
    this.cancelPendingAuto();this.turnSerial=0;this.actionInProgress=false;this.battleMode="tower";this.towerConfig=config;
    this.region=REGIONS[config.family?.region??config.enemyRegions?.[0]??0];
    this.encounterType=config.major?"towerBoss":config.elite?"towerElite":"tower";
    this.battle={round:0,queue:[],current:null,log:[],ended:false,commandLocked:false,reverseHealing:false,lastSkill:null,finalEnding:null};
    this.buildParty();this.applyTowerOpeningUpgrades();this.buildTowerEnemies(config);this.backdrop.style.backgroundImage=`url("${config.background||asset(this.region.battle)}")`;
    this.screen.dataset.battleMode="tower";this.screen.dataset.towerMutation=config.modifier?.id||config.mutation?.id||"";
    this.screen.querySelector("#battle-region").textContent=`TORRE DA CARNE • ANDAR ${config.floor}`;
    this.screen.querySelector("#battle-title").textContent=config.title||"Convergência da Ferida";
    this.screen.querySelector("#battle-speed").textContent=`${this.speed}×`;this.updateAutoButton();this.screen.classList.add("active");this.audio.stopAmbient();
    const modifier=config.modifier?.name||config.mutation?.name;this.log(`O ${config.family?.name||"andar"} fecha a passagem ao redor do grupo.`);if(modifier)this.log(`Mutação ativa: ${modifier}.`);if(config.elite||config.major)this.showBossBanner();this.render();this.nextTurn();
  }

  buildTowerEnemies(config) {
    const state=this.getState(),floor=Math.max(1,Number(config.floor)||1),scale=Number(config.difficultyScale)||1,ids=config.enemyIds||[],regions=config.enemyRegions||[];
    this.enemies=ids.map((id,index)=>{
      const region=REGIONS[regions[index]??config.family?.region??0],isPrimary=index===0,isBoss=Boolean(config.major&&isPrimary),isElite=Boolean(config.elite&&isPrimary),bossAsset=config.enemyKinds?.[index]!=="normal",baseHp=66+state.level*15+floor*7,hp=Math.round(baseHp*scale*(isBoss?3.15:isElite?1.8:1)*(index?0.9:1)),modifier=isElite||isBoss?config.modifier||config.mutation:null;
      const actor={id:`torre-${id}-${index}`,sourceId:id,name:NORMAL_DISPLAY[id]||prettyBoss(id),team:"enemy",hp,maxHp:hp,focus:100,maxFocus:100,attack:Math.round((17+state.level*2.4+floor*1.15)*scale*(isBoss?1.24:isElite?1.12:1)),defense:Math.round((8+state.level*1.35+floor*.58)*scale),speed:17+((floor+index*7)%20),img:mobSprite(region,id,"front",bossAsset),skills:[],statuses:[],defending:false,boss:isBoss,miniboss:isElite&&!isBoss,phase:1,revived:false,towerModifier:modifier};
      if(modifier?.id==="ossificado")actor.defense=Math.round(actor.defense*1.16);if(modifier?.id==="nervoso")actor.speed=Math.round(actor.speed*1.12);if(modifier?.id==="pulsante")this.applyStatus(actor,"Regeneração",99);return actor;
    });
    if((config.modifier?.id||config.mutation?.id)==="parasitado"&&this.enemies.length<4&&this.enemies[0]){const source=this.enemies.at(-1),clone={...source,id:`${source.id}-parasita`,name:`Larva de ${source.name}`,boss:false,miniboss:false,towerModifier:null,hp:Math.round(source.maxHp*.38),maxHp:Math.round(source.maxHp*.38),attack:Math.round(source.attack*.62),defense:Math.round(source.defense*.55),speed:source.speed+3,statuses:[]};this.enemies.push(clone);}
  }

  configureFinalBattle(ending) {
    const state=this.getState(),rival=ROUTES[state.route].rivalRoute;
    const rivalVariant=state.rivalVisualVariant||state.visualVariant;
    const specs={
      order:{name:"Timbó, Paradoxo Selvagem",img:formSprite("timbo","bestial","front",state.route==="timbo"?state.visualVariant:rivalVariant),hp:980,attack:82,defense:44,speed:54},
      will:{name:"Lucas, Geometria sem Rosto",img:formSprite("lucas","armored","front",state.route==="lucas"?state.visualVariant:rivalVariant),hp:1080,attack:70,defense:58,speed:43},
      free:{name:"GPT, Mestre que Você Criou",img:asset("skills/efeitos_individuais_sem_fundo/invocacao/invocacao_espirito_de_cristal.webp"),hp:930,attack:78,defense:42,speed:63},
      silence:{name:"A Última Palavra",img:mobSprite(REGIONS[9],REGIONS[9].bosses[1],"front",true),hp:1160,attack:86,defense:48,speed:49},
      balance:{name:"Trono da Contradição",img:mobSprite(REGIONS[9],REGIONS[9].bosses[0],"front",true),hp:920,attack:76,defense:45,speed:58}
    };
    const spec=specs[ending]||specs.free;
    this.enemies=[{id:`final-${ending}`,sourceId:`final-${ending}`,name:spec.name,team:"enemy",...spec,maxHp:spec.hp,focus:200,maxFocus:200,skills:[],statuses:[],defending:false,boss:true,phase:1,revived:false}];
    if(ending==="balance"){
      this.enemies.push({id:"future-master",sourceId:"future-master",name:`Eco Absoluto de ${ROUTES[rival].name}`,team:"enemy",hp:520,maxHp:520,focus:150,maxFocus:150,attack:68,defense:35,speed:61,img:formSprite(rival,"necromancer","front",rivalVariant),skills:[],statuses:[],defending:false,boss:false,phase:1});
    }
  }

  buildParty() {
    const state=this.getState();
    const stats=getPlayerStats(state);
    const heroSkills=[...new Set(["strike",...state.learnedSkills,...ROUTE_SKILLS[state.route].slice(0,Math.min(6,2+state.regionIndex))])];
    this.party=[{
      id:"hero",name:ROUTES[state.route].name,title:ROUTES[state.route].title,team:"party",hero:true,
      hp:clamp(state.hp,1,stats.hp),maxHp:stats.hp,focus:clamp(state.focus,0,stats.focus),maxFocus:stats.focus,
      attack:stats.attack,defense:stats.defense,speed:stats.speed,img:formSprite(state.route,state.activeForm,"front",state.visualVariant),skills:heroSkills,statuses:[],defending:false
    }];
    state.activeParty.filter((id)=>id!=="hero").forEach((id)=>{
      const data=COMPANIONS[id],saved=state.companions[id];if(!data||!saved?.unlocked)return;
      this.party.push({id,name:data.name,title:data.title,team:"party",hp:clamp(saved.hp||data.hp,1,saved.maxHp||data.hp),maxHp:saved.maxHp||data.hp,focus:data.focus,maxFocus:data.focus,attack:data.attack+state.level,defense:data.defense+Math.floor(state.level/2),speed:data.speed,img:data.sprite,skills:["strike",...data.skills],statuses:[],defending:false});
    });
  }

  towerUpgradeCount(id) {
    if(this.battleMode!=="tower")return 0;
    return (this.getState()?.tower?.activeRun?.upgrades||[]).filter((entry)=>entry===id).length;
  }

  applyTowerOpeningUpgrades() {
    const layers=this.towerUpgradeCount("barreira");
    if(!layers)return;
    this.party.forEach((actor)=>this.applyStatus(actor,"Barreira",1+layers));
  }

  applyTowerCritical(actor,damage) {
    const layers=this.towerUpgradeCount("critico-foco");
    if(!layers||actor.team!=="party"||Math.random()>=Math.min(.34,.12*layers))return damage;
    const critical=Math.round(damage*1.45),focus=Math.min(18,8+Math.max(0,layers-1)*3);
    actor.focus=Math.min(actor.maxFocus,actor.focus+focus);this.log(`Acerto crítico: ${actor.name} recupera ${focus} de Foco.`);
    return critical;
  }

  buildEnemies() {
    const level=1+this.region.id*2;
    const makeNormal=(id,index=0)=>({
      id:`${id}-${index}`,sourceId:id,name:NORMAL_DISPLAY[id]||prettyBoss(id),team:"enemy",hp:72+level*14,maxHp:72+level*14,focus:60,maxFocus:60,
      attack:18+level*3,defense:10+level*2,speed:15+((index*7+level)%15),img:mobSprite(this.region,id,"front"),skills:[],statuses:[],defending:false,boss:false
    });
    if(this.encounterType==="normal"){
      const first=this.region.normal[this.region.id%this.region.normal.length];
      const second=this.region.normal[(this.region.id+2)%this.region.normal.length];
      this.enemies=[makeNormal(first,0),makeNormal(second,1)];
      if(this.region.id>3)this.enemies.push(makeNormal(this.region.normal[(this.region.id+4)%5],2));
      return;
    }
    const isMini=this.encounterType==="miniboss";
    const bossIndex=this.encounterType==="boss1"?0:1;
    const id=isMini?this.region.miniboss:this.region.bosses[bossIndex];
    const hp=(isMini?210:360)+level*(isMini?22:38)+(bossIndex===1?120:0);
    this.enemies=[{
      id,sourceId:id,name:isMini?prettyBoss(id):this.region.bossNames[bossIndex],team:"enemy",hp,maxHp:hp,focus:120,maxFocus:120,
      attack:(isMini?25:32)+level*4,defense:(isMini?15:20)+level*2,speed:(isMini?19:22)+level,img:mobSprite(this.region,id,"front",true),skills:[],statuses:[],defending:false,boss:!isMini,miniboss:isMini,phase:1,revived:false
    }];
    if(!isMini&&bossIndex===1&&this.region.id>=4){
      const add=this.region.normal[(this.region.id+1)%5];
      const minion=makeNormal(add,1);minion.hp=Math.round(minion.hp*.72);minion.maxHp=minion.hp;this.enemies.push(minion);
    }
  }

  living(team) { return team.filter((actor)=>actor.hp>0); }
  actorById(id) { return [...this.party,...this.enemies].find((actor)=>actor.id===id); }

  newRound() {
    this.battle.round+=1;
    this.battle.commandLocked=false;
    if(this.battleMode==="tower")this.living(this.enemies).forEach((enemy)=>{enemy.echoedRound=0;if(enemy.towerModifier?.id==="contraditorio"){const shift=this.battle.round%2===0?1.12:.9;enemy.defense=Math.max(1,Math.round((enemy.baseTowerDefense||=enemy.defense)*shift));this.log(`${enemy.name} altera sua resistência contraditória.`);}});
    const actors=[...this.living(this.party),...this.living(this.enemies)];
    this.battle.queue=actors.sort((a,b)=>(b.speed+Math.random()*5)-(a.speed+Math.random()*5)).map((actor)=>actor.id);
    this.log(`Rodada ${this.battle.round}. A iniciativa foi recalculada.`);
  }

  async nextTurn() {
    if(this.battle.ended)return;
    this.cancelPendingAuto();this.actionInProgress=false;
    const outcome=this.checkOutcome();if(outcome)return;
    if(!this.battle.queue.length)this.newRound();
    const actor=this.actorById(this.battle.queue.shift());
    if(!actor||actor.hp<=0)return this.nextTurn();
    this.battle.current=actor;
    const turnId=++this.turnSerial;
    actor.defending=false;
    const canAct=await this.tickStatuses(actor);
    this.render();
    if(!canAct){await this.delay(420);return this.nextTurn();}
    if(actor.team==="enemy"){
      this.actionInProgress=true;
      this.actions.innerHTML="";
      this.detail.innerHTML=`<small>TURNO INIMIGO</small><p>${actor.name} está decidindo como reescrever esta rodada.</p>`;
      await this.delay(520);
      return this.enemyTurn(actor);
    }
    this.renderActionMenu(actor);
    if(this.getState().settings.autoBattle)this.scheduleAutoTurn(actor,turnId);
  }

  async tickStatuses(actor) {
    let canAct=true;
    for(const status of [...actor.statuses]){
      if(["Queimadura","Sangramento","Veneno","Condenação"].includes(status.name)){
        const ratios={Queimadura:.045,Sangramento:.035,Veneno:.05,Condenação:.06};
        const damage=Math.max(3,Math.round(actor.maxHp*ratios[status.name]*(status.stacks||1)));
        actor.hp=Math.max(0,actor.hp-damage);this.log(`${actor.name} sofre ${damage} por ${status.name}.`);this.damageNumber(actor,damage,false);
      }
      if(status.name==="Regeneração"){
        const heal=Math.round(actor.maxHp*.055);actor.hp=Math.min(actor.maxHp,actor.hp+heal);this.damageNumber(actor,heal,true);
      }
      if(status.name==="Congelamento"&&Math.random()<.45){canAct=false;this.log(`${actor.name} perdeu o turno sob Congelamento.`);}
      if(status.name==="Atordoamento"){canAct=false;this.log(`${actor.name} está Atordoado.`);}
      status.duration-=1;
    }
    actor.statuses=actor.statuses.filter((status)=>status.duration>0);
    return canAct&&actor.hp>0;
  }

  renderActionMenu(actor) {
    const hero=actor.hero;
    const state=this.getState();
    if(state.settings.autoBattle){this.actions.innerHTML=`<div class="auto-turn-status"><strong>AUTO ATIVO</strong><span>A IA está avaliando PV, estados, alvos e Autoridade.</span></div>`;this.detail.innerHTML=`<small>${actor.name.toUpperCase()} • BATALHA AUTOMÁTICA</small><p>Desative <span class="cost">AUTO</span> a qualquer momento para retomar o controle.</p>`;return;}
    const buttons=[
      ["attack","Atacar",false],["skills","Habilidades",false],["defend","Defender",false],["items","Itens",false],
      ["transform","Transformar",!hero||!state.secondaryForm],["command","Comando",!hero||this.battle.commandLocked],["flee","Fugir",this.battleMode==="tower"?!this.towerConfig?.allowFlee:this.encounterType!=="normal"]
    ];
    this.actions.innerHTML=buttons.map(([id,label,disabled])=>{
      const className=id==="command"?"command-action":id==="flee"?"flee-action":"";
      const content=id==="flee"?`<span class="flee-action-label"><svg class="flee-action-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="15.5" cy="4" r="2" fill="currentColor"></circle><path d="m12.5 7.2-3 4.3 3.1 2.1 2.3 3.1m-2.4-9.5 3.2 2.4 3.1.7m-6.2 3.3-3.2 6.1m5.5-3 3.4 3.4M9.5 11.5 6 13.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg><span>${label}</span></span>`:label;
      return `<button data-action="${id}" ${disabled?"disabled":""} class="${className}">${content}</button>`;
    }).join("");
    this.actions.querySelectorAll("button").forEach((button)=>button.addEventListener("click",()=>this.handleMenu(button.dataset.action,actor)));
    this.detail.innerHTML=`<small>${actor.name.toUpperCase()} DECIDE</small><p>Foco <span class="cost">${actor.focus}/${actor.maxFocus}</span>${hero?` • Autoridade <span class="cost">${state.authority}/${state.maxAuthority}</span>`:""}</p>`;
  }

  handleMenu(action,actor) {
    if(this.actionInProgress||this.battle.current?.id!==actor.id)return;
    this.audio.ui();
    if(action==="attack")return this.chooseTargets("enemy",(target)=>this.performAttack(actor,target));
    if(action==="skills")return this.showSkills(actor);
    if(action==="defend")return this.defend(actor);
    if(action==="items")return this.showItems(actor);
    if(action==="transform")return this.showForms(actor);
    if(action==="command")return this.showCommands(actor);
    if(action==="flee")return this.flee();
  }

  showPanel(options) {
    this.closePanel();
    const panel=document.createElement("div");panel.className="action-panel";
    panel.innerHTML=options.map((option,index)=>`<button class="action-option" data-index="${index}" ${option.disabled?"disabled":""}>${option.icon?`<img src="${option.icon}" alt="">`:"<span></span>"}<span><strong>${option.name}</strong><small>${option.description}</small></span><em>${option.cost||""}</em></button>`).join("");
    panel.querySelectorAll("button").forEach((button)=>button.addEventListener("click",()=>{const option=options[Number(button.dataset.index)];if(!option.disabled)option.action();}));
    this.screen.appendChild(panel);
  }
  closePanel(){this.screen.querySelector(".action-panel")?.remove();}

  showSkills(actor) {
    const skills=actor.skills.map((id)=>SKILLS[id]).filter(Boolean);
    this.showPanel(skills.map((skill)=>({name:skill.name,description:`${skill.element} • ${skill.description}`,cost:skill.cost?`${skill.cost} foco`:"Sem custo",icon:skill.icon,disabled:actor.focus<skill.cost,action:()=>{this.closePanel();this.useSkill(actor,skill);}})));
  }

  useSkill(actor,skill) {
    if(actor.focus<skill.cost)return;
    if(skill.target==="enemy")this.chooseTargets("enemy",(target)=>this.resolveSkill(actor,skill,[target]));
    else if(skill.target==="ally")this.chooseTargets("party",(target)=>this.resolveSkill(actor,skill,[target]));
    else if(skill.target==="allEnemies")this.resolveSkill(actor,skill,this.living(this.enemies));
    else if(skill.target==="allAllies")this.resolveSkill(actor,skill,this.living(this.party));
  }

  async resolveSkill(actor,skill,targets) {
    if(!this.beginAction(actor)||actor.focus<skill.cost)return;
    actor.focus-=skill.cost;this.battle.lastSkill=skill.id;
    this.animateActor(actor,"cast");this.audio.spell(skill.element);this.effect(skill.effect,skill.target==="allEnemies"?"burst":"projectile");
    this.log(`${actor.name} usa ${skill.name}.`);
    await this.delay(420);
    for(const target of targets){
      if(skill.healing){
        if(this.battle.reverseHealing){
          const damage=this.calculateDamage(actor,target,skill.power);target.hp=Math.max(0,target.hp-damage);this.damageNumber(target,damage,false);this.log(`A Maré Negra converte a cura em ${damage} de dano!`);
        }else{
          const healing=Math.round((actor.attack*1.7+target.maxHp*.13)*skill.power);target.hp=Math.min(target.maxHp,target.hp+healing);this.damageNumber(target,healing,true);this.audio.heal();if(this.towerUpgradeCount("cura-defesa"))this.applyStatus(target,"Barreira",1+this.towerUpgradeCount("cura-defesa"));
        }
      }else{
        let damage=this.calculateDamage(actor,target,skill.power);
        if(skill.element==="Fratura")damage=Math.round(damage*(1+this.getState().resonance/250));
        damage=this.applyTowerCritical(actor,damage);
        target.hp=Math.max(0,target.hp-damage);this.damageNumber(target,damage,false);this.animateActor(target,"hit");
        if(skill.drain){const heal=Math.round(damage*skill.drain);actor.hp=Math.min(actor.maxHp,actor.hp+heal);this.damageNumber(actor,heal,true);}
      }
      if(skill.status&&Math.random()<(skill.chance??1))this.applyStatus(target,skill.status,skill.status==="Regeneração"?3:2);
    }
    await this.delay(360);this.render();await this.checkBossPhases();this.endAction();
  }

  calculateDamage(actor,target,power=1) {
    const variance=.9+Math.random()*.2;
    const vulnerable=target.statuses.some((s)=>["Vulnerabilidade","Marca de Submissão","Fratura"].includes(s.name))?1.25:1;
    const barrier=target.statuses.some((s)=>s.name==="Barreira") ? .72 : 1;
    const defending=target.defending ? .58 : 1;
    let guard=1;if(this.battleMode==="tower"&&target.team==="enemy"&&this.living(this.enemies).some((enemy)=>enemy!==target&&enemy.towerModifier?.id==="vigilante"))guard=.82;
    const damage=Math.max(2,Math.round((actor.attack*power-target.defense*.36)*variance*vulnerable*barrier*defending*guard));
    if(this.battleMode==="tower"&&target.towerModifier?.id==="nervoso"&&!target.nervousTriggered&&target.hp<target.maxHp){target.nervousTriggered=true;target.speed=Math.round(target.speed*1.18);this.log(`${target.name} acelera sob a mutação Nervoso.`);}
    return damage;
  }

  async performAttack(actor,target) {
    if(!this.beginAction(actor))return;
    this.animateActor(actor,"attack");this.audio.hit(false);await this.delay(220);
    const damage=this.applyTowerCritical(actor,this.calculateDamage(actor,target,1));target.hp=Math.max(0,target.hp-damage);this.damageNumber(target,damage,false);this.animateActor(target,"hit");this.log(`${actor.name} causa ${damage} de dano a ${target.name}.`);
    await this.delay(330);this.render();await this.checkBossPhases();this.endAction();
  }

  defend(actor) {
    if(!this.beginAction(actor))return;
    actor.defending=true;actor.focus=Math.min(actor.maxFocus,actor.focus+8);this.applyStatus(actor,"Barreira",1);this.log(`${actor.name} assume uma posição defensiva e recupera 8 de Foco.`);this.audio.confirm();this.render();this.endAction();
  }

  showItems(actor) {
    const state=this.getState();
    const options=[
      {id:"potion",name:"Poção de Síntese",description:"Recupera 55 PV.",icon:asset("skills/colecao_separada_sem_fundo/02_orbe_de_vida.webp")},
      {id:"focus",name:"Tônico de Foco",description:"Recupera 40 Foco.",icon:asset("skills/colecao_separada_sem_fundo/12_orbe_de_natureza.webp")},
      {id:"remedy",name:"Antídoto Semântico",description:"Remove todos os estados negativos.",icon:asset("skills/colecao_separada_sem_fundo/01_onda_de_agua.webp")}
    ];
    this.showPanel(options.map((item)=>({name:item.name,description:item.description,cost:`×${state.inventory[item.id]||0}`,icon:item.icon,disabled:!(state.inventory[item.id]>0),action:()=>{this.closePanel();this.chooseTargets("party",(target)=>this.useItem(actor,target,item.id));}})));
  }

  useItem(actor,target,itemId) {
    const state=this.getState();if(!(state.inventory[itemId]>0)||!this.beginAction(actor))return;state.inventory[itemId]-=1;
    if(itemId==="potion"){target.hp=Math.min(target.maxHp,target.hp+55);this.damageNumber(target,55,true);this.audio.heal();}
    if(itemId==="focus"){target.focus=Math.min(target.maxFocus,target.focus+40);this.damageNumber(target,40,true);}
    if(itemId==="remedy")target.statuses=[];
    this.log(`${actor.name} usa um item em ${target.name}.`);this.render();this.endAction();
  }

  showForms(actor) {
    const state=this.getState();
    const forms=state.unlockedForms.filter((id)=>id!==state.activeForm).map((id)=>FORMS.find((entry)=>entry.id===id)).filter(Boolean);
    this.showPanel(forms.map((form)=>({name:form.label,description:`${form.role} • ${form.passive}`,cost:"25 foco",icon:formSprite(state.route,form.id,"front",state.visualVariant),disabled:actor.focus<25,action:()=>this.transform(actor,form)})));
  }

  async transform(actor,form) {
    this.closePanel();const state=this.getState();if(actor.focus<25||!this.beginAction(actor))return;actor.focus-=25;
    const oldStats=getPlayerStats(state);state.activeForm=form.id;const newStats=getPlayerStats(state);
    actor.attack+=newStats.attack-oldStats.attack;actor.defense+=newStats.defense-oldStats.defense;actor.speed+=newStats.speed-oldStats.speed;
    actor.maxHp=Math.max(20,newStats.hp);actor.hp=Math.min(actor.maxHp,actor.hp+Math.max(0,newStats.hp-oldStats.hp));actor.maxFocus=newStats.focus;actor.img=formSprite(state.route,form.id,"front",state.visualVariant);
    this.audio.transform();this.effect(asset("skills/colecao_separada_sem_fundo/10_circulo_de_invocacao_de_fogo.webp"),"burst");this.log(`${actor.name} assume ${form.label}.`);this.render();await this.delay(600);this.endAction();
  }

  showCommands(actor) {
    const state=this.getState(),route=ROUTES[state.route];
    this.showPanel(route.commands.map((command)=>({name:`“${command.name}”`,description:command.description,cost:`${command.cost} autoridade`,icon:state.route==="lucas"?SKILLS.order.icon:SKILLS.domination.icon,disabled:state.authority<command.cost||this.battle.commandLocked,action:()=>this.useCommand(actor,command)})));
  }

  async useCommand(actor,command,preferredTarget=null) {
    this.closePanel();const state=this.getState();if(state.authority<command.cost||!this.beginAction(actor))return;
    state.authority-=command.cost;state.resonance=clamp(state.resonance+3,0,100);state.fracture=clamp(state.fracture+1,0,100);
    actor.classCast=true;this.animateActor(actor,"cast");this.audio.spell(state.route==="lucas"?"Ordem":"Dominação");this.effect(state.route==="lucas"?SKILLS.order.effect:SKILLS.domination.effect,"burst");
    this.log(`${actor.name} comanda: “${command.name}”.`);await this.delay(520);
    const boss=this.living(this.enemies).find((enemy)=>enemy.boss);
    if(boss&&Math.random()<.32){this.log(`${boss.name} reinterpreta o Comando e devolve parte de seu peso.`);actor.hp=Math.max(1,actor.hp-Math.round(actor.maxHp*.09));this.damageNumber(actor,Math.round(actor.maxHp*.09),false);}
    switch(command.effect){
      case"delay":{const target=preferredTarget||this.living(this.enemies)[0];if(target){this.battle.queue=this.battle.queue.filter((id)=>id!==target.id);this.battle.queue.push(target.id);this.applyStatus(target,"Correntes da Ordem",2);}break;}
      case"groupHeal":this.living(this.party).forEach((target)=>{const heal=Math.round(target.maxHp*.24);target.hp=Math.min(target.maxHp,target.hp+heal);this.damageNumber(target,heal,true);if(this.towerUpgradeCount("cura-defesa"))this.applyStatus(target,"Barreira",1+this.towerUpgradeCount("cura-defesa"));});break;
      case"mark":this.living(this.enemies).forEach((target)=>this.applyStatus(target,"Vulnerabilidade",3));break;
      case"cleanse":this.party.forEach((target)=>target.statuses=[]);this.enemies.forEach((target)=>target.statuses=target.statuses.filter((s)=>["Queimadura","Veneno","Sangramento"].includes(s.name)));break;
      case"weaken":this.living(this.enemies).forEach((target)=>{target.attack=Math.max(3,target.attack-5);target.defense=Math.max(0,target.defense-4);this.applyStatus(target,"Marca de Submissão",2);});break;
      case"steal":{const target=preferredTarget||this.living(this.enemies)[0];if(target){target.statuses=[];actor.focus=Math.min(actor.maxFocus,actor.focus+20);}break;}
      case"confuse":{const alive=this.living(this.enemies);alive.forEach((target)=>this.applyStatus(target,"Confusão",2));if(alive.length>1)alive.forEach((target,index)=>{const other=alive[(index+1)%alive.length];const dmg=Math.round(target.attack*.7);other.hp=Math.max(0,other.hp-dmg);this.damageNumber(other,dmg,false);});break;}
      case"execute":{const target=this.living(this.enemies).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(target){const ratio=target.hp/target.maxHp;const damage=!target.boss&&ratio<=.25?target.hp:Math.round(target.maxHp*(target.boss ? .13 : .18));target.hp=Math.max(0,target.hp-damage);this.damageNumber(target,damage,false);}break;}
    }
    this.render();await this.delay(350);await this.checkBossPhases();this.endAction();
  }

  chooseTargets(team,callback) {
    const targets=this.living(team==="enemy"?this.enemies:this.party);
    if(targets.length===1)return callback(targets[0]);
    this.actions.querySelectorAll("button").forEach((button)=>button.disabled=true);
    this.detail.innerHTML=`<small>SELECIONE O ALVO</small><p>Clique em um ${team==="enemy"?"inimigo":"aliado"} para confirmar.</p>`;
    const stage=team==="enemy"?this.enemyStage:this.partyStage;
    stage.querySelectorAll(".combatant").forEach((node)=>{
      const actor=this.actorById(node.dataset.id);if(!actor||actor.hp<=0)return;
      node.classList.add("targetable");node.addEventListener("click",()=>{this.render();callback(actor);},{once:true});
    });
  }

  async enemyTurn(actor) {
    const targets=this.living(this.party);if(!targets.length)return this.checkOutcome();
    const target=targets.reduce((weak,current)=>current.hp/current.maxHp<weak.hp/weak.maxHp?current:weak,targets[0]);
    const special=(actor.boss||actor.miniboss)&&Math.random()<.42;
    if(special){
      this.animateActor(actor,"cast");this.audio.spell(this.region.id===0?"Gelo":this.region.id===2?"Fogo":this.region.id===8?"Morte":"Fratura");this.effect(this.enemyEffect(),"burst");
      const name=this.enemyMoveName(actor);this.log(`${actor.name} prepara ${name}.`);await this.delay(460);
      const all=this.region.id%3===0||actor.phase>=3?targets:[target];
      all.forEach((victim)=>{const damage=this.calculateDamage(actor,victim,.82+actor.phase*.16);victim.hp=Math.max(0,victim.hp-damage);this.damageNumber(victim,damage,false);this.animateActor(victim,"hit");const status=this.battleMode==="tower"&&actor.towerModifier?.id==="hemorragico"?"Sangramento":this.regionStatus();if(Math.random()<.58)this.applyStatus(victim,status,2);if(this.battleMode==="tower"&&actor.towerModifier?.id==="faminto"){const heal=Math.max(1,Math.round(damage*.08));actor.hp=Math.min(actor.maxHp,actor.hp+heal);this.damageNumber(actor,heal,true);}});
      if(actor.boss&&actor.phase>=3&&this.region.id===9)this.battle.queue.unshift(actor.id);
    }else{
      this.animateActor(actor,"attack");await this.delay(230);const damage=this.calculateDamage(actor,target,1);target.hp=Math.max(0,target.hp-damage);this.damageNumber(target,damage,false);this.animateActor(target,"hit");this.audio.hit(actor.boss);this.log(`${actor.name} atinge ${target.name} por ${damage}.`);
    }
    if(this.battleMode==="tower"&&actor.towerModifier?.id==="ecoante"&&!actor.echoedRound&&actor.hp>0){actor.echoedRound=1;this.battle.queue.unshift(actor.id);this.log(`${actor.name} ecoa a própria ação.`);}await this.delay(420);this.render();this.endAction();
  }

  enemyMoveName(actor) {
    const moves=["Inverno sem Amanhã","Resposta Carnívora","Fornalha do Verbo","Lei que Esmaga","Memória Predadora","Veredito Perfeito","Maré sem Nome","Recusa Abissal","Contrato do Ponto Final","Futuro Duplicado"];
    return actor.phase>=3?`${moves[this.region.id]}: Forma Final`:moves[this.region.id];
  }
  enemyEffect(){const map=[SKILLS.ice.effect,SKILLS.life.effect,SKILLS.fire.effect,SKILLS.earth.effect,SKILLS.summon.effect,SKILLS.order.effect,SKILLS.water.effect,SKILLS.water.effect,SKILLS.death.effect,SKILLS.fracture.effect];return map[this.region.id];}
  regionStatus(){return["Congelamento","Veneno","Queimadura","Vulnerabilidade","Medo","Correntes da Ordem","Silêncio","Fratura","Condenação","Atordoamento"][this.region.id];}

  async checkBossPhases() {
    const boss=this.living(this.enemies).find((enemy)=>enemy.boss);if(!boss)return;
    const ratio=boss.hp/boss.maxHp;
    let next=boss.phase;if(ratio<=.66&&boss.phase===1)next=2;if(ratio<=.33&&boss.phase===2)next=3;if(next===boss.phase)return;
    boss.phase=next;boss.attack+=6+this.region.id;boss.defense+=3;boss.speed+=4;
    this.audio.bossPhase();this.screen.classList.add("shake");setTimeout(()=>this.screen.classList.remove("shake"),350);
    this.banner.hidden=false;this.banner.querySelector("small").textContent=`FASE ${next}`;this.banner.querySelector("strong").textContent=boss.name;this.banner.querySelector("span").textContent=this.region.mechanic;setTimeout(()=>this.banner.hidden=true,2400/this.speed);
    this.log(`${boss.name} reescreve as regras da batalha: ${this.region.mechanic}`);
    if(this.region.id===0)this.battle.queue.reverse();
    if(this.region.id===1&&next===2){const id=this.region.normal[1];const clone={...this.enemies[0],id:`clone-${Date.now()}`,sourceId:id,name:`Eco de ${NORMAL_DISPLAY[id]}`,boss:false,phase:1,hp:90+this.region.id*20,maxHp:90+this.region.id*20,img:mobSprite(this.region,id,"front"),statuses:[]};this.enemies.push(clone);}
    if(this.region.id===2)this.living(this.party).forEach((actor)=>this.applyStatus(actor,"Queimadura",3));
    if(this.region.id===3)this.applyStatus(boss,"Barreira",3);
    if(this.region.id===5)this.battle.commandLocked=true;
    if(this.region.id===7)this.battle.reverseHealing=next>=2;
    if(this.region.id===9)this.battle.queue.unshift(boss.id);
    this.render();await this.delay(1000);
  }

  applyStatus(actor,name,duration=2) {
    const existing=actor.statuses.find((status)=>status.name===name);
    if(existing){existing.duration=Math.max(existing.duration,duration);existing.stacks=Math.min(3,(existing.stacks||1)+1);}else actor.statuses.push({name,duration,stacks:1});
  }

  beginAction(actor){if(this.battle.ended||this.actionInProgress||this.battle.current?.id!==actor?.id)return false;this.actionInProgress=true;this.cancelPendingAuto();this.actions.querySelectorAll("button").forEach((button)=>button.disabled=true);return true;}

  cancelPendingAuto(){if(this.autoTimer){clearTimeout(this.autoTimer);this.autoTimer=null;}}

  updateAutoButton(){const enabled=Boolean(this.getState()?.settings?.autoBattle);this.autoButton.classList.toggle("active",enabled);this.autoButton.setAttribute("aria-pressed",String(enabled));this.autoButton.textContent=enabled?"AUTO ON":"AUTO";}

  toggleAuto(){const state=this.getState();state.settings.autoBattle=!state.settings.autoBattle;saveSettings(state.settings);this.updateAutoButton();this.audio.ui();this.closePanel();this.render();
    const actor=this.battle?.current;if(!actor||actor.team!=="party"||this.actionInProgress)return;
    if(state.settings.autoBattle){this.renderActionMenu(actor);this.scheduleAutoTurn(actor,this.turnSerial);}else{this.cancelPendingAuto();this.renderActionMenu(actor);}
  }

  scheduleAutoTurn(actor,turnId){this.cancelPendingAuto();this.autoTimer=setTimeout(()=>{this.autoTimer=null;if(this.battle.ended||!this.getState().settings.autoBattle||this.actionInProgress||this.battle.current?.id!==actor.id||turnId!==this.turnSerial){if(!this.getState().settings.autoBattle&&this.battle.current?.id===actor.id&&!this.actionInProgress)this.renderActionMenu(actor);return;}this.autoTurn(actor,turnId);},Math.max(120,420/this.speed));}

  dangerousStatuses(actor){return actor.statuses.filter((status)=>["Queimadura","Sangramento","Veneno","Condenação","Congelamento","Atordoamento","Silêncio","Fratura","Medo"].includes(status.name));}
  preferredEnemy(){const alive=this.living(this.enemies);return alive.sort((a,b)=>{const av=a.hp/a.maxHp-(a.statuses.some((s)=>["Vulnerabilidade","Marca de Submissão","Fratura"].includes(s.name))?.22:0),bv=b.hp/b.maxHp-(b.statuses.some((s)=>["Vulnerabilidade","Marca de Submissão","Fratura"].includes(s.name))?.22:0);return av-bv;})[0];}

  usefulCommand(actor) {
    if(!actor.hero||this.battle.commandLocked)return null;const state=this.getState(),route=ROUTES[state.route],enemies=this.living(this.enemies),party=this.living(this.party),dangerous=party.some((ally)=>this.dangerousStatuses(ally).length),injured=party.filter((ally)=>ally.hp/ally.maxHp<.68);
    const useful=(command)=>{if(state.authority<command.cost)return false;switch(command.effect){case"groupHeal":return injured.length>=2||party.some((ally)=>ally.hp/ally.maxHp<.34);case"cleanse":return dangerous;case"mark":return enemies.length>=2&&!enemies.every((enemy)=>enemy.statuses.some((s)=>s.name==="Vulnerabilidade"));case"weaken":return enemies.length>=2&&!enemies.every((enemy)=>enemy.statuses.some((s)=>s.name==="Marca de Submissão"));case"confuse":return enemies.length>=2&&!enemies.every((enemy)=>enemy.statuses.some((s)=>s.name==="Confusão"));case"execute":return enemies.some((enemy)=>!enemy.boss&&enemy.hp/enemy.maxHp<=.25)||enemies.some((enemy)=>enemy.boss&&enemy.hp/enemy.maxHp<=.42);case"steal":return actor.focus/actor.maxFocus<.35||enemies.some((enemy)=>enemy.statuses.length);case"delay":return enemies.some((enemy)=>enemy.boss||enemy.miniboss);default:return false;}};
    return route.commands.find((command)=>useful(command))||null;
  }

  autoTurn(actor,turnId) {
    if(turnId!==this.turnSerial||this.battle.current?.id!==actor.id||!this.getState().settings.autoBattle||this.actionInProgress)return;
    const state=this.getState(),party=this.living(this.party),enemies=this.living(this.enemies),lowest=[...party].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0],injured=party.filter((ally)=>ally.hp/ally.maxHp<.7),skills=actor.skills.map((id)=>SKILLS[id]).filter((skill)=>skill&&actor.focus>=skill.cost),singleHeal=skills.find((skill)=>skill.healing&&skill.target==="ally"),groupHeal=skills.find((skill)=>skill.healing&&skill.target==="allAllies");
    if(!this.battle.reverseHealing&&lowest&&lowest.hp/lowest.maxHp<.4){if(groupHeal&&injured.length>=2)return this.resolveSkill(actor,groupHeal,party);if(singleHeal)return this.resolveSkill(actor,singleHeal,[lowest]);}
    if(!this.battle.reverseHealing&&groupHeal&&injured.length>=2)return this.resolveSkill(actor,groupHeal,party);
    const afflicted=party.find((ally)=>this.dangerousStatuses(ally).length);
    if(afflicted&&actor.hero&&state.route==="lucas"){const cleanse=ROUTES.lucas.commands.find((command)=>command.effect==="cleanse");if(cleanse&&state.authority>=cleanse.cost&&!this.battle.commandLocked)return this.useCommand(actor,cleanse);}
    if(afflicted&&state.settings.autoBattleItems&&state.inventory.remedy>0)return this.useItem(actor,afflicted,"remedy");
    if(state.settings.autoBattleItems&&lowest&&lowest.hp/lowest.maxHp<.28&&state.inventory.potion>0)return this.useItem(actor,lowest,"potion");
    const area=skills.filter((skill)=>!skill.healing&&skill.target==="allEnemies"&&enemies.length>=2).sort((a,b)=>b.power-a.power)[0];if(area)return this.resolveSkill(actor,area,enemies);
    const command=this.usefulCommand(actor);if(command)return this.useCommand(actor,command,this.preferredEnemy());
    if(state.settings.autoBattleItems&&actor.focus/actor.maxFocus<.16&&state.inventory.focus>0)return this.useItem(actor,actor,"focus");
    const target=this.preferredEnemy();if(!target)return this.checkOutcome();const attackSkill=skills.filter((skill)=>!skill.healing&&skill.target==="enemy"&&skill.id!=="strike").sort((a,b)=>b.power-a.power)[0];if(attackSkill)return this.resolveSkill(actor,attackSkill,[target]);
    if(actor.focus/actor.maxFocus<.16&&actor.attack<target.defense*.8)return this.defend(actor);return this.performAttack(actor,target);
  }

  async endAction(){this.closePanel();this.cancelPendingAuto();this.battle.current=null;this.actionInProgress=false;await this.delay(170);if(!this.battle.ended)this.nextTurn();}

  checkOutcome() {
    if(this.battleMode==="tower")for(const enemy of this.enemies){if(enemy.hp<=0&&enemy.towerModifier?.id==="instavel"&&!enemy.burstTriggered){enemy.burstTriggered=true;const victims=this.living(this.party),protection=this.towerUpgradeCount("perigo")?0.65:1,damage=Math.max(2,Math.round(enemy.maxHp*.06*protection));victims.forEach((victim)=>{victim.hp=Math.max(0,victim.hp-damage);this.damageNumber(victim,damage,false);});this.log(`${enemy.name} explode ao perder a forma e causa ${damage} ao grupo.`);}}
    const fallenBoss=this.enemies.find((enemy)=>enemy.boss&&enemy.hp<=0);
    if(this.battleMode!=="tower"&&this.region.id===8&&fallenBoss&&!fallenBoss.revived){
      fallenBoss.revived=true;fallenBoss.hp=Math.round(fallenBoss.maxHp*.32);fallenBoss.phase=3;fallenBoss.attack+=8;this.applyStatus(fallenBoss,"Barreira",2);this.log(`${fallenBoss.name} recusa o ponto final e retorna pelo contrato de Sombravia.`);this.audio.bossPhase();this.showBossBanner();this.render();return false;
    }
    if(this.living(this.party).length===0){this.defeat();return true;}
    if(this.living(this.enemies).length===0){this.victory();return true;}
    return false;
  }

  async victory() {
    if(this.battle.ended)return;this.battle.ended=true;this.cancelPendingAuto();this.actionInProgress=false;this.actions.innerHTML="";this.audio.victory();
    const state=this.getState(),hero=this.party.find((a)=>a.hero);state.hp=Math.max(1,hero?.hp||1);state.focus=Math.max(0,hero?.focus||0);state.activeForm=FORMS.some((f)=>f.id===state.activeForm)?state.activeForm:"base";
    ["eliara","dagra"].forEach((id)=>{const actor=this.party.find((a)=>a.id===id);if(actor)state.companions[id].hp=Math.max(1,actor.hp);});
    if(this.battleMode==="tower"){
      const reward=this.towerConfig.reward||{xp:45,currency:20,towerCurrency:1};this.log(`Vitória. ${reward.xp} EXP, ${reward.currency} Ecos e ${reward.towerCurrency} Carne da Voz.`);this.render();await this.delay(900);this.callbacks.onVictory?.({tower:true,config:this.towerConfig,region:this.region,encounterType:this.encounterType,xp:reward.xp,currency:reward.currency,towerCurrency:reward.towerCurrency,enemyIds:this.enemies.map((enemy)=>enemy.sourceId)});return;
    }
    const base=40+this.region.id*13;const multiplier=this.encounterType==="normal"?1:this.encounterType==="miniboss"?2:4;
    this.log(`Vitória. ${base*multiplier} EXP e ${22*multiplier} Ecos recuperados da fratura.`);this.render();await this.delay(1150);
    this.callbacks.onVictory?.({region:this.region,encounterType:this.encounterType,finalEnding:this.battle.finalEnding,xp:base*multiplier,currency:22*multiplier,enemyIds:this.enemies.map((enemy)=>enemy.sourceId)});
  }

  async defeat() {
    if(this.battle.ended)return;this.battle.ended=true;this.cancelPendingAuto();this.actionInProgress=false;this.actions.innerHTML="";this.log(this.battleMode==="tower"?"A torre fecha a ferida e desfaz esta incursão.":"O fragmento perde a forma. A realidade tenta salvar uma versão anterior.");this.render();await this.delay(900);this.callbacks.onDefeat?.({tower:this.battleMode==="tower",config:this.towerConfig,region:this.region,encounterType:this.encounterType});
  }

  flee() {
    const allowed=this.battleMode==="tower"?Boolean(this.towerConfig?.allowFlee):this.encounterType==="normal";if(!allowed||this.getState().settings.autoBattle||this.actionInProgress)return;this.actionInProgress=true;this.cancelPendingAuto();this.battle.ended=true;this.audio.cancel();this.log("O grupo recua antes que o encontro feche a passagem.");setTimeout(()=>this.callbacks.onFlee?.({tower:this.battleMode==="tower",config:this.towerConfig}),250);
  }

  render() {
    this.renderStage(this.partyStage,this.party);
    this.renderStage(this.enemyStage,this.enemies);
    this.renderInitiative();
    this.logNode.innerHTML=this.battle.log.slice(-4).map((entry)=>`<p>${entry}</p>`).join("");
    const current=this.battle.current;
    if(current){this.activeActor.innerHTML=`<img src="${current.img}" alt=""><div><small>EM AÇÃO</small><strong>${current.name}</strong><span>${current.title || (current.team==="party" ? "Aliado" : "Hostil")}</span><span>PV ${Math.max(0,current.hp)}/${current.maxHp} • Foco ${current.focus}/${current.maxFocus}</span></div>`;}else this.activeActor.innerHTML="";
  }

  renderStage(stage,actors) {
    stage.innerHTML=actors.map((actor)=>`<article class="combatant ${actor.team} ${actor.boss?"boss":""} ${actor.towerModifier?"tower-elite":""} ${actor.hp<=0?"defeated":""} ${this.battle.current?.id===actor.id?"active":""}" data-id="${actor.id}">
      <img src="${actor.img}" alt="${actor.name}">
      <div class="combatant-info">${actor.towerModifier?`<small class="tower-modifier">${actor.towerModifier.name}</small>`:""}<strong>${actor.name}</strong><div class="mini-health"><i style="width:${clamp(actor.hp/actor.maxHp*100,0,100)}%"></i></div><div class="combatant-meta"><span>${actor.hp>0?`${actor.hp}/${actor.maxHp}`:"DERROTADO"}</span><span>${actor.boss?`Fase ${actor.phase}`:`VEL ${actor.speed}`}</span></div><div class="status-row">${actor.statuses.map((status)=>`<span class="status-pip" title="${status.name} (${status.duration})">${status.name.slice(0,1)}</span>`).join("")}</div></div>
    </article>`).join("");
  }

  renderInitiative() {
    const ids=[this.battle.current?.id,...this.battle.queue].filter(Boolean).slice(0,10);
    this.initiative.innerHTML=ids.map((id,index)=>{const actor=this.actorById(id);if(!actor)return"";return`<span class="initiative-chip ${actor.team} ${index===0?"current":""}" title="${actor.name}">${actor.name.slice(0,2).toUpperCase()}</span>`;}).join("");
  }

  animateActor(actor,className) {
    const node=this.screen.querySelector(`.combatant[data-id="${CSS.escape(actor.id)}"]`);if(!node)return;node.classList.add(className);setTimeout(()=>node.classList.remove(className),700/this.speed);
  }

  damageNumber(actor,amount,heal=false) {
    const node=this.screen.querySelector(`.combatant[data-id="${CSS.escape(actor.id)}"]`);if(!node)return;
    const arena=this.screen.querySelector("#battle-arena").getBoundingClientRect(),rect=node.getBoundingClientRect();
    const number=document.createElement("span");number.className=`damage-number ${heal?"heal":""}`;number.textContent=`${heal?"+":"−"}${amount}`;number.style.left=`${rect.left-arena.left+rect.width/2}px`;number.style.top=`${rect.top-arena.top+rect.height*.25}px`;this.effectStage.appendChild(number);setTimeout(()=>number.remove(),1000);
    if(!heal&&this.getState().settings.screenShake>0){this.screen.classList.add("shake");setTimeout(()=>this.screen.classList.remove("shake"),180);}
  }

  effect(src,type="burst") {
    const image=document.createElement("img");image.src=src;image.alt="";image.className=`battle-effect ${type==="projectile"?"projectile-effect":""}`;this.effectStage.appendChild(image);setTimeout(()=>image.remove(),900);
  }

  log(text) { this.battle.log.push(text);if(this.battle.log.length>60)this.battle.log.shift();this.logNode.innerHTML=this.battle.log.slice(-4).map((entry)=>`<p>${entry}</p>`).join(""); }

  showBossBanner() {
    const enemy=this.enemies[0];this.banner.hidden=false;this.banner.querySelector("small").textContent=this.battleMode==="tower"?(this.towerConfig?.major?"ÓRGÃO MAIOR DA TORRE":"SENTINELA MUTADA"):this.encounterType==="miniboss"?"SENTINELA REGIONAL":"AMEAÇA PRIMORDIAL";this.banner.querySelector("strong").textContent=this.battleMode==="tower"?(this.towerConfig?.title||enemy.name):enemy.name;this.banner.querySelector("span").textContent=this.battleMode==="tower"?`${this.towerConfig?.modifier?.name||this.towerConfig?.mutation?.name||"Mutação viva"} • Andar ${this.towerConfig?.floor}`:this.region.mechanic;setTimeout(()=>this.banner.hidden=true,2500/this.speed);
  }

  cycleSpeed() {
    const state=this.getState(),speeds=[1,2,3],index=speeds.indexOf(Number(state.settings.battleSpeed)||1);state.settings.battleSpeed=speeds[(index+1)%speeds.length];saveSettings(state.settings);this.screen.querySelector("#battle-speed").textContent=`${state.settings.battleSpeed}×`;this.audio.ui();if(state.settings.autoBattle&&this.battle.current?.team==="party"&&!this.actionInProgress)this.scheduleAutoTurn(this.battle.current,this.turnSerial);
  }
}
