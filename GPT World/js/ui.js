import { REGIONS, ROUTES, FORMS, SKILLS, ROUTE_SKILLS, RECIPES, COMPANIONS, TUTORIALS, asset, characterArt, formSprite, mobSprite } from "./data.js";
import { getPlayerStats, getItem, addInventory, removeInventory, listSaves, saveGame, loadGame, deleteSave, saveSettings, totalMaterials } from "./state.js";

const labelSlot={weapon:"Arma",armor:"Armadura",accessory1:"Acessório I",accessory2:"Acessório II",boots:"Botas",relic:"Relíquia do Fragmento"};
const WORLD_MARKERS=[[10,27],[30,29],[51,28],[71,31],[90,34],[11,73],[31,72],[50,74],[71,73],[90,72]];

export class UIManager {
  constructor({layer,getState,setState,audio,onClose,onTravel,onTower,onLoad,onHud,onToast,onApplySettings,onEndingChoice}) {
    this.layer=layer;this.getState=getState;this.setState=setState;this.audio=audio;this.callbacks={onClose,onTravel,onTower,onLoad,onHud,onToast,onApplySettings,onEndingChoice};this.current="status";this.context={};this.questFilter="main";this.itemFilter="all";
  }

  navItems() {
    const items=[
      ["status","Personagem"],["forms","Formas"],["skills","Habilidades"],["inventory","Inventário"],["equipment","Equipamento"],
      ["crafting","Criação"],["quests","Missões"],["map","Mapa-múndi"],["bestiary","Bestiário"],["codex","Códex"],["save","Salvar / Carregar"],["settings","Configurações"],["tutorial","Tutoriais"]
    ];if(this.getState()?.tower?.unlocked)items.splice(8,0,["tower","Torre da Carne"]);return items;
  }

  open(tab="status",context={}) {
    this.current=tab;this.context=context;this.layer.hidden=false;
    this.layer.innerHTML=`<section class="game-modal" role="dialog" aria-modal="true" aria-label="Menu do jogo"><nav class="modal-nav"><div class="modal-brand"><small>GPT: A VOZ PARTIDA</small><strong>${ROUTES[this.getState().route].title}</strong></div>${this.navItems().map(([id,label])=>`<button data-tab="${id}" class="${id===tab?"active":""}">${label}</button>`).join("")}${context.shop?`<button data-tab="shop" class="${tab==="shop"?"active":""}">Loja local</button>`:""}${context.inn?`<button data-tab="inn" class="${tab==="inn"?"active":""}">Recuperação</button>`:""}</nav><div class="modal-body"></div></section>`;
    this.layer.querySelectorAll("[data-tab]").forEach((button)=>button.addEventListener("click",()=>{this.audio.ui();this.current=button.dataset.tab;this.render();}));
    this.render();
  }

  close() { this.audio.cancel();this.layer.hidden=true;this.layer.innerHTML="";this.callbacks.onClose?.(); }

  render() {
    this.layer.querySelectorAll("[data-tab]").forEach((button)=>button.classList.toggle("active",button.dataset.tab===this.current));
    const renderers={status:()=>this.status(),forms:()=>this.forms(),skills:()=>this.skills(),inventory:()=>this.inventory(),equipment:()=>this.equipment(),crafting:()=>this.crafting(),quests:()=>this.quests(),map:()=>this.map(),tower:()=>this.tower(),bestiary:()=>this.bestiary(),codex:()=>this.codex(),save:()=>this.saves(),settings:()=>this.settings(),tutorial:()=>this.tutorials(),shop:()=>this.shop(),inn:()=>this.inn(),finalChoice:()=>this.finalChoice()};
    const body=this.layer.querySelector(".modal-body");if(!body)return;body.innerHTML=(renderers[this.current]||renderers.status)();
    this.bindCommon(body);
  }

  header(title,description) { return `<header class="modal-header"><div><h2>${title}</h2><p>${description}</p></div><button class="modal-close" data-close aria-label="Fechar menu">×</button></header>`; }

  bindCommon(body) {
    body.querySelector("[data-close]")?.addEventListener("click",()=>this.close());
    body.querySelectorAll("[data-form-primary]").forEach((button)=>button.addEventListener("click",()=>this.setForm(button.dataset.formPrimary,"primary")));
    body.querySelectorAll("[data-form-secondary]").forEach((button)=>button.addEventListener("click",()=>this.setForm(button.dataset.formSecondary,"secondary")));
    body.querySelectorAll("[data-learn]").forEach((button)=>button.addEventListener("click",()=>this.learnSkill(button.dataset.learn)));
    body.querySelectorAll("[data-use-item]").forEach((button)=>button.addEventListener("click",()=>this.useItem(button.dataset.useItem)));
    body.querySelectorAll("[data-equip]").forEach((button)=>button.addEventListener("click",()=>this.equip(button.dataset.equip)));
    body.querySelectorAll("[data-unequip]").forEach((button)=>button.addEventListener("click",()=>this.unequip(button.dataset.unequip)));
    body.querySelectorAll("[data-craft]").forEach((button)=>button.addEventListener("click",()=>this.craft(button.dataset.craft)));
    body.querySelectorAll("[data-travel]").forEach((button)=>button.addEventListener("click",()=>this.travel(Number(button.dataset.travel))));
    body.querySelectorAll("[data-open-tower]").forEach((button)=>button.addEventListener("click",()=>{this.audio.portal?.();this.layer.hidden=true;this.layer.innerHTML="";this.callbacks.onTower?.();}));
    body.querySelectorAll("[data-save-slot]").forEach((button)=>button.addEventListener("click",()=>this.writeSave(button.dataset.saveSlot)));
    body.querySelectorAll("[data-load-slot]").forEach((button)=>button.addEventListener("click",()=>this.readSave(button.dataset.loadSlot)));
    body.querySelectorAll("[data-delete-slot]").forEach((button)=>button.addEventListener("click",()=>this.removeSave(button.dataset.deleteSlot)));
    body.querySelectorAll("[data-quest-filter]").forEach((button)=>button.addEventListener("click",()=>{this.questFilter=button.dataset.questFilter;this.render();}));
    body.querySelectorAll("[data-item-filter]").forEach((button)=>button.addEventListener("click",()=>{this.itemFilter=button.dataset.itemFilter;this.render();}));
    body.querySelectorAll("[data-buy]").forEach((button)=>button.addEventListener("click",()=>this.buy(button.dataset.buy)));
    body.querySelector("[data-rest]")?.addEventListener("click",()=>this.rest());
    body.querySelector("[data-fullscreen]")?.addEventListener("click",()=>this.toggleFullscreen());
    body.querySelectorAll("[data-setting]").forEach((input)=>input.addEventListener("input",()=>this.changeSetting(input)));
    body.querySelectorAll("[data-toggle]").forEach((button)=>button.addEventListener("click",()=>this.toggleSetting(button.dataset.toggle)));
    body.querySelectorAll("[data-ending]").forEach((button)=>button.addEventListener("click",()=>{if(!button.disabled)this.callbacks.onEndingChoice?.(button.dataset.ending);}));
  }

  status() {
    const state=this.getState(),route=ROUTES[state.route],stats=getPlayerStats(state),region=REGIONS[state.regionIndex];
    const equipment=Object.values(state.equipment).filter(Boolean).map(getItem).filter(Boolean);
    return `${this.header(route.name,`${route.title} • Nível ${state.level} • ${region.name}`)}
      <div class="panel-grid"><article class="panel-card character-status-card"><img class="character-status-art" src="${characterArt(state.route,state.visualVariant)}" alt="${route.name}, versão ${state.visualVariant==="feminino"?"feminina":"masculina"}"><small>${route.fragment}, fragmento GPT • Versão ${state.visualVariant==="feminino"?"feminina":"masculina"}</small><h3>${route.title}</h3><p>${route.opening}</p><p><strong>Forma:</strong> ${FORMS.find((f)=>f.id===state.activeForm)?.label}</p><p><strong>Vínculo:</strong> ${state.fracture}/100 • <strong>Ressonância:</strong> ${state.resonance}/100</p><div style="clear:both"></div></article>
      <article class="panel-card"><small>Atributos atuais</small><div class="stat-grid" style="margin-top:.6rem">${[["PV",stats.hp],["Foco",stats.focus],["Ataque",stats.attack],["Defesa",stats.defense],["Velocidade",stats.speed],["Autoridade",`${state.authority}/${state.maxAuthority}`],["EXP",`${state.xp}/${state.nextXp}`],["Comandos",`${state.primeCommands.length}/10`]].map(([key,value])=>`<div class="stat-tile"><small>${key}</small><strong>${value}</strong></div>`).join("")}</div><p style="margin-top:1rem">Equipado: ${equipment.length?equipment.map((item)=>item.name).join(" • "):"nenhum artefato"}</p></article></div>
      <h3 style="font-family:Georgia,serif">Ecos vinculados</h3><div class="panel-grid">${Object.values(COMPANIONS).map((companion)=>{const saved=state.companions[companion.id];return`<article class="panel-card"><img src="${companion.portrait}" alt="${companion.name}" style="float:left;width:100px;height:120px;object-fit:contain;margin-right:.7rem"><small>${companion.title}</small><h3>${companion.name}</h3><p>${companion.quote}</p><p>Lealdade: <strong>${saved.loyalty}/100</strong> • ${companion.role}</p></article>`;}).join("")}</div>`;
  }

  forms() {
    const state=this.getState();
    return `${this.header("Formas do Fragmento","Cada transformação muda atributos, afinidades, papel tático e as reações do mundo.")}<div class="form-grid">${FORMS.map((form)=>{const unlocked=state.unlockedForms.includes(form.id),primary=state.primaryForm===form.id,secondary=state.secondaryForm===form.id;return`<article class="form-card ${unlocked?"":"locked"}"><img src="${formSprite(state.route,form.id,"front",state.visualVariant)}" alt="${form.label}"><small>${unlocked?form.affinity:`Desbloqueia no Comando ${form.unlock+1}`}</small><strong>${form.label}</strong><span>${form.role}</span><span>${form.passive}</span>${unlocked?`<div class="card-actions"><button data-form-primary="${form.id}" ${primary?"disabled":""}>${primary?"Principal":"Tornar principal"}</button><button data-form-secondary="${form.id}" ${secondary||primary?"disabled":""}>${secondary?"Secundária":"Preparar"}</button></div>`:""}</article>`;}).join("")}</div>`;
  }

  setForm(id,mode) {
    const state=this.getState();if(!state.unlockedForms.includes(id))return;
    if(mode==="primary"){state.primaryForm=id;state.activeForm=id;if(state.secondaryForm===id)state.secondaryForm=null;this.callbacks.onToast?.("Forma principal alterada","A transformação foi salva.","good");}
    else {if(id===state.primaryForm)return;state.secondaryForm=id;this.callbacks.onToast?.("Forma preparada",`${FORMS.find((f)=>f.id===id)?.label} poderá ser ativada em batalha.`,"good");}
    this.audio.transform();this.autosave();this.callbacks.onHud?.();this.render();
  }

  skills() {
    const state=this.getState(),available=[...new Set([...ROUTE_SKILLS[state.route],"ice","fire","earth","water","life","death","blood","summon","order","domination","fracture"])].map((id)=>SKILLS[id]).filter(Boolean);
    return `${this.header("Árvore de Habilidades",`Pontos disponíveis: ${state.skillPoints}. Habilidades aprendidas permanecem disponíveis em formas compatíveis.`)}<div class="item-grid">${available.map((skill)=>{const learned=state.learnedSkills.includes(skill.id),canLearn=!learned&&state.skillPoints>0;return`<article class="item-card"><img src="${skill.icon}" alt="${skill.name}"><small>${skill.element} • ${skill.cost} Foco</small><strong>${skill.name}</strong><span>${skill.description}</span><span>Alvo: ${skill.target==="allEnemies"?"todos os inimigos":skill.target==="allAllies"?"todo o grupo":skill.healing?"aliado":"inimigo"}</span><div class="card-actions"><button data-learn="${skill.id}" ${canLearn?"": "disabled"}>${learned?"Aprendida":canLearn?"Aprender (1)":"Sem pontos"}</button></div></article>`;}).join("")}</div><h3 style="font-family:Georgia,serif;margin-top:1.1rem">Comandos de ${ROUTES[state.route].name}</h3><div class="panel-grid">${ROUTES[state.route].commands.map((command)=>`<article class="panel-card"><small>${command.cost} Autoridade</small><h3>“${command.name}”</h3><p>${command.description}</p></article>`).join("")}</div>`;
  }

  learnSkill(id) { const state=this.getState();if(state.skillPoints<1||state.learnedSkills.includes(id))return;state.skillPoints-=1;state.learnedSkills.push(id);this.audio.confirm();this.callbacks.onToast?.("Habilidade aprendida",SKILLS[id]?.name,"good");this.autosave();this.render(); }

  inventory() {
    const state=this.getState(),filters=[["all","Tudo"],["consumable","Consumíveis"],["equipment","Equipamento"]];
    const entries=Object.entries(state.inventory).filter(([,qty])=>qty>0).map(([id,qty])=>({item:getItem(id),qty})).filter(({item})=>item).filter(({item})=>this.itemFilter==="all"||(this.itemFilter==="consumable"?item.type==="consumable":item.type!=="consumable"));
    return `${this.header("Inventário",`${Object.values(state.inventory).reduce((a,b)=>a+b,0)} itens • ${state.currency} Ecos`)}<div class="filter-row">${filters.map(([id,label])=>`<button data-item-filter="${id}" class="${this.itemFilter===id?"active":""}">${label}</button>`).join("")}</div><div class="item-grid">${entries.length?entries.map(({item,qty})=>`<article class="item-card"><img src="${item.icon}" alt="${item.name}"><small class="rarity-${item.rarity}">${item.rarity} • ×${qty}</small><strong>${item.name}</strong><span>${item.description}</span>${item.downside?`<span style="color:#ff5977">Risco: ${item.downside}</span>`:""}<div class="card-actions">${item.type==="consumable"?`<button data-use-item="${item.id}">Usar</button>`:`<button data-equip="${item.id}">Equipar</button>`}</div></article>`).join(""):"<p>Nenhum item neste filtro.</p>"}</div>`;
  }

  useItem(id) {
    const state=this.getState(),item=getItem(id);if(!item||!(state.inventory[id]>0))return;
    if(item.heal){if(state.hp>=state.maxHp)return this.callbacks.onToast?.("PV já está completo","Guarde a poção para depois.");state.hp=Math.min(state.maxHp,state.hp+item.heal);}
    if(item.focus){if(state.focus>=state.maxFocus)return this.callbacks.onToast?.("Foco já está completo","O fragmento não absorve mais energia.");state.focus=Math.min(state.maxFocus,state.focus+item.focus);}
    if(item.cleanse)state.flags.explorationCleanse=true;
    removeInventory(state,id,1);this.audio.heal();this.callbacks.onToast?.("Item usado",item.name,"good");this.callbacks.onHud?.();this.autosave();this.render();
  }

  equipment() {
    const state=this.getState(),stats=getPlayerStats(state),owned=Object.entries(state.inventory).filter(([,qty])=>qty>0).map(([id])=>getItem(id)).filter((item)=>item&&item.slot);
    return `${this.header("Equipamento",`Ataque ${stats.attack} • Defesa ${stats.defense} • Velocidade ${stats.speed}`)}<div class="panel-grid">${Object.entries(state.equipment).map(([slot,id])=>{const item=getItem(id);return`<article class="panel-card"><small>${labelSlot[slot]}</small><h3>${item?.name||"Vazio"}</h3><p>${item?.description||"Nenhum equipamento neste espaço."}</p>${item?`<button class="small-action" data-unequip="${slot}">Remover</button>`:""}</article>`;}).join("")}</div><h3 style="font-family:Georgia,serif">Equipamentos disponíveis</h3><div class="item-grid">${owned.map((item)=>`<article class="item-card"><img src="${item.icon}" alt="${item.name}"><small class="rarity-${item.rarity}">${item.rarity}</small><strong>${item.name}</strong><span>${item.description}</span><span>${Object.entries(item.stats||{}).map(([key,value])=>`${key} ${value>0?"+":""}${value}`).join(" • ")}</span><div class="card-actions"><button data-equip="${item.id}">Equipar</button></div></article>`).join("")||"<p>Nenhum equipamento no inventário.</p>"}</div>`;
  }

  equip(id) { const state=this.getState(),item=getItem(id);if(!item?.slot)return;let slot=item.slot;if(slot==="accessory"||slot==="accessory1"){slot=!state.equipment.accessory1?"accessory1":!state.equipment.accessory2?"accessory2":"accessory1";}state.equipment[slot]=id;this.audio.confirm();this.callbacks.onToast?.("Equipamento alterado",item.name,"good");this.autosave();this.callbacks.onHud?.();this.render(); }
  unequip(slot){const state=this.getState();state.equipment[slot]=null;this.audio.cancel();this.autosave();this.callbacks.onHud?.();this.render();}

  crafting() {
    const state=this.getState(),materials=totalMaterials(state);
    return `${this.header("Criação Alquímica",`${materials} materiais regionais • ${state.currency} Ecos`)}<div class="recipe-grid">${RECIPES.map((recipe)=>{const item=getItem(recipe.output),can=materials>=recipe.cost.materials&&state.currency>=recipe.cost.currency;return`<article class="recipe-card"><img src="${item?.icon}" alt="${recipe.name}"><small>${recipe.cost.materials} materiais • ${recipe.cost.currency} Ecos</small><strong>${recipe.name} ×${recipe.qty}</strong><span>${recipe.description}</span><div class="card-actions"><button data-craft="${recipe.id}" ${can?"":"disabled"}>Criar</button></div></article>`;}).join("")}</div><div class="panel-card" style="margin-top:1rem"><small>Materiais por região</small><p>${REGIONS.map((region)=>`${region.name}: <strong>${state.materials[region.key]||0}</strong>`).join(" • ")}</p></div>`;
  }

  craft(id) {
    const state=this.getState(),recipe=RECIPES.find((entry)=>entry.id===id);if(!recipe)return;
    if(totalMaterials(state)<recipe.cost.materials||state.currency<recipe.cost.currency)return;
    let need=recipe.cost.materials;for(const region of REGIONS){const take=Math.min(need,state.materials[region.key]||0);state.materials[region.key]-=take;need-=take;if(!need)break;}
    state.currency-=recipe.cost.currency;addInventory(state,recipe.output,recipe.qty);this.audio.confirm();this.callbacks.onToast?.("Criação concluída",`${recipe.name} ×${recipe.qty}`,"good");this.autosave();this.render();
  }

  quests() {
    const state=this.getState(),tabs=[["main","Principais"],["side","Secundárias"],["companion","Companheiros"],["hunt","Caçadas"],["mystery","Mistérios"],["completed","Concluídas"]];
    const quests=state.quests.filter((quest)=>this.questFilter==="completed"?quest.status==="completed":quest.category===this.questFilter&&quest.status!=="locked");
    return `${this.header("Diário de Missões","Objetivos reagem a combates, exploração, conversas e decisões.")}<div class="quest-tabs">${tabs.map(([id,label])=>`<button data-quest-filter="${id}" class="${this.questFilter===id?"active":""}">${label}</button>`).join("")}</div><div class="quest-list">${quests.map((quest)=>`<article class="quest-card ${quest.status==="completed"?"completed":""}"><small>${quest.region} • ${quest.npc}</small><strong>${quest.title}</strong><span>${quest.description}</span><span><b>Objetivo:</b> ${quest.objective}</span><div class="quest-progress"><i style="width:${Math.min(100,quest.progress/quest.goal*100)}%"></i></div><span>${quest.progress}/${quest.goal} • Recompensa: ${quest.rewards}</span></article>`).join("")||"<p>Nenhuma missão nesta categoria.</p>"}</div>`;
  }

  map() {
    const state=this.getState();
    return `${this.header("Mapa-múndi","Viaje para regiões descobertas. A próxima região abre após recuperar seu Comando Primordial.")}<div class="world-map-art" style="background-image:linear-gradient(rgba(5,3,10,.12),rgba(5,3,10,.12)),url('${asset("mapas/referencia/mapa_mundi_referencia_biomas.png")}')"><div class="teleport-layer">${REGIONS.map((region)=>{const unlocked=state.discoveredRegions.includes(region.id),completed=state.completedRegions.includes(region.id),current=state.regionIndex===region.id,[left,top]=WORLD_MARKERS[region.id];const status=current?"Região atual":completed?"Concluída":unlocked?"Descoberta":"Bloqueada";return`<button class="teleport-marker ${unlocked?"unlocked":"locked"} ${completed?"completed":""} ${current?"current":""}" style="--marker-left:${left}%;--marker-top:${top}%" data-travel="${region.id}" ${unlocked?"":"disabled"} aria-label="${region.name}, ${region.settlement}, ${status}"><strong>${region.name}</strong><span class="teleport-symbol" aria-hidden="true">✦</span><small>${region.settlement}</small><em>${status}</em></button>`;}).join("")}${state.tower?.unlocked?`<button class="tower-map-marker" data-open-tower aria-label="Abrir a entrada da Torre da Carne"><strong>Torre da Carne</strong><span class="tower-map-symbol" aria-hidden="true"><i></i><i></i><i></i></span><small>Ferida entre os fragmentos</small><em>${state.gameMode==="tower"?"Incursão ativa":state.tower.activeRun?`Andar ${state.tower.activeRun.floor}`:"Disponível"}</em></button>`:""}</div><div class="map-legend"><span><i class="current"></i>Atual</span><span><i class="unlocked"></i>Descoberta</span><span><i class="completed"></i>Concluída</span><span><i class="locked"></i>Bloqueada</span>${state.tower?.unlocked?`<button class="small-action map-tower-option" data-open-tower>Entrar na Torre da Carne</button>`:""}</div></div>`;
  }

  tower() {
    const tower=this.getState().tower,run=tower.activeRun;
    return`${this.header("Torre da Carne","A ferida entre os fragmentos reconstrói infinitamente os lugares que a Voz tentou apagar.")}<div class="tower-menu-card"><div class="tower-menu-organ" aria-hidden="true"><i></i><i></i><i></i></div><small>PROGRESSÃO PARALELA</small><h3>${run?`Incursão no andar ${run.floor}`:"Nenhuma incursão ativa"}</h3><p>Maior andar: <strong>${tower.bestFloor}</strong> • Incursões: <strong>${tower.totalRuns}</strong> • Carne da Voz: <strong>${tower.currency}</strong></p><p>${run?`Semente: ${run.seed} • Recursos guardados nesta incursão: ${run.resources?.towerCurrency||0}.`:"Entrar na torre não altera a progressão da campanha normal."}</p><button class="primary-button" data-open-tower>${run?"Ver e continuar incursão":"Abrir a entrada da torre"}</button></div>`;
  }

  travel(index) { const state=this.getState();if(state.gameMode==="tower")return this.callbacks.onToast?.("Travessia indisponível","Retorne ao mundo pela entrada da torre antes de usar os portais regionais.","bad");if(!state.discoveredRegions.includes(index)||index===state.regionIndex)return;const region=REGIONS[index];if(!confirm(`Viajar para ${region.name} — ${region.settlement}?`))return;this.audio.confirm();this.layer.hidden=true;this.layer.innerHTML="";this.callbacks.onTravel?.(index); }

  bestiary() {
    const state=this.getState();
    const entries=(state.bestiary||[]).map((entry)=>{const region=REGIONS[entry.region],bossAsset=!region.normal.includes(entry.id);return{...entry,regionObj:region,img:mobSprite(region,entry.id,"front",bossAsset),name:entry.name||entry.id.replace(/_/g," ")};});
    return `${this.header("Bestiário",`${entries.length} registros de criaturas e variantes`)}<div class="bestiary-grid">${entries.map((entry)=>`<article class="bestiary-card ${entry.tower?"tower-bestiary":""}"><img src="${entry.img}" alt="${entry.name}"><small>${entry.tower?"Torre da Carne":entry.regionObj.name} • ${entry.boss?"Elite ou boss":"Criatura"}</small><strong>${entry.name}</strong>${entry.towerMutation?`<span>Mutação observada: <b>${entry.towerMutation}</b></span>`:""}<span>Fraqueza observada: ${["Fogo","Gelo","Terra","Água","Vida","Morte"][entry.region%6]}</span><span>Derrotado ${entry.count||1} vez(es).</span></article>`).join("")||"<p>Aproxime-se e vença criaturas para registrar suas formas e comportamentos.</p>"}</div>`;
  }

  codex() {
    const state=this.getState();
    const towerEntries=(state.tower?.codexEntries||[]).map((id,index)=>({id,title:id.startsWith("orgao-maior")?`Órgão Maior: andar ${id.split("-").at(-1)}`:`Memória Orgânica ${String(index+1).padStart(2,"0")}`,text:"A torre reconstruiu esta lembrança como matéria viva. Sua forma permanece vinculada à semente da incursão."}));
    const base=[{id:"fracture",title:"A Fratura",text:"Os dois fragmentos compartilham dor, poder e ecos de comando. Toda vitória fortalece também o rival."},...REGIONS.map((region)=>({id:region.key,title:`${region.name}: ${region.command}`,text:region.lore})),...towerEntries];
    const unlocked=base.filter((entry)=>state.codex.includes(entry.id)||entry.id==="fracture"||towerEntries.some((towerEntry)=>towerEntry.id===entry.id));
    return `${this.header("Códex da Voz","Memórias, leis e documentos preservados durante a jornada.")}<div class="panel-grid">${unlocked.map((entry,index)=>`<article class="panel-card"><small>Documento ${String(index+1).padStart(2,"0")}</small><h3>${entry.title}</h3><p>${entry.text}</p></article>`).join("")}</div>`;
  }

  saves() {
    const entries=listSaves(),draft=Boolean(this.getState()?.flags?.draft);
      return `${this.header("Salvar e Carregar","Três espaços manuais e um salvamento automático protegido contra dados corrompidos.")}<div class="save-list">${entries.map((entry)=>`<article class="save-slot"><div class="slot-number">${entry.slot==="auto"?"AUTO":`0${entry.slot}`}</div><div>${entry.empty?`<strong>Espaço vazio</strong><p>Nenhuma realidade preservada.</p>`:`<strong>${ROUTES[entry.route].name} (${entry.visualVariant==="feminino"?"Feminina":"Masculina"}) • Nível ${entry.level}</strong><p>${entry.region} • ${entry.commands}/10 Comandos • ${new Date(entry.updatedAt).toLocaleString("pt-BR")}${entry.ngPlus?" • NOVO JOGO +":""}</p>`}</div><div class="save-slot-actions">${!draft&&entry.slot!=="auto"?`<button class="small-action" data-save-slot="${entry.slot}">Salvar</button>`:""}${entry.empty?"":`<button class="small-action" data-load-slot="${entry.slot}">Carregar</button>${entry.slot!=="auto"?`<button class="small-action" data-delete-slot="${entry.slot}">Excluir</button>`:""}`}</div></article>`).join("")}</div>`;
  }

  writeSave(slot){const state=this.getState();const existing=loadGame(slot);if(existing&&!confirm(`Sobrescrever o espaço ${slot}?`))return;if(saveGame(state,slot)){this.audio.confirm();this.callbacks.onToast?.("Jogo salvo",`Espaço ${slot} atualizado.`,"good");this.render();}else this.callbacks.onToast?.("Não foi possível salvar","O armazenamento do navegador está indisponível.","bad");}
  readSave(slot){if(!confirm("Carregar este salvamento? O progresso não salvo será perdido."))return;const state=loadGame(slot);if(!state)return this.callbacks.onToast?.("Salvamento inválido","Os dados não puderam ser recuperados.","bad");this.layer.hidden=true;this.layer.innerHTML="";this.callbacks.onLoad?.(state);}
  removeSave(slot){if(!confirm(`Excluir permanentemente o espaço ${slot}?`))return;deleteSave(slot);this.audio.cancel();this.render();}

  settings() {
    const s=this.getState().settings;
    const range=(id,label,value,min=0,max=1,step=.01,desc="")=>`<div class="setting-row"><label>${label}<small>${desc}</small></label><input data-setting="${id}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"></div>`;
    const toggle=(id,label,value,desc="")=>`<div class="setting-row"><label>${label}<small>${desc}</small></label><button class="toggle ${value?"on":""}" data-toggle="${id}" aria-pressed="${value}"><i></i></button></div>`;
    return `${this.header("Configurações e Acessibilidade","Todas as preferências são salvas automaticamente neste navegador.")}<div class="settings-grid">
      ${range("masterVolume","Volume geral",s.masterVolume,0,1,.01,"Controla toda a mixagem.")}${range("musicVolume","Ambiente",s.musicVolume,0,1,.01,"Paisagens sonoras procedurais.")}${range("effectsVolume","Efeitos",s.effectsVolume,0,1,.01,"Golpes, magias e interface.")}${range("textSpeed","Velocidade do texto",s.textSpeed,8,52,1,"Animação dos diálogos.")}
      ${range("screenShake","Tremor de tela",s.screenShake,0,1,.05,"Intensidade dos impactos.")}
      <div class="setting-row"><label>Velocidade das batalhas<small>Acelera animações e decisões inimigas.</small></label><select data-setting="battleSpeed"><option value="1" ${s.battleSpeed==1?"selected":""}>1×</option><option value="2" ${s.battleSpeed==2?"selected":""}>2×</option><option value="3" ${s.battleSpeed==3?"selected":""}>3×</option></select></div>
      <div class="setting-row"><label>Tamanho do texto<small>Ajusta toda a interface e mantém painéis roláveis.</small></label><select data-setting="fontSize"><option value="normal" ${s.fontSize==="normal"?"selected":""}>Normal</option><option value="large" ${s.fontSize==="large"?"selected":""}>Grande</option><option value="extra-large" ${s.fontSize==="extra-large"?"selected":""}>Extra Grande</option></select></div>
      <div class="setting-row"><label>Controles de toque<small>Mostrar sempre, ocultar ou detectar.</small></label><select data-setting="touchControls"><option value="auto" ${s.touchControls==="auto"?"selected":""}>Automático</option><option value="on" ${s.touchControls==="on"?"selected":""}>Sempre</option><option value="off" ${s.touchControls==="off"?"selected":""}>Ocultar</option></select></div>
      ${toggle("autoBattle","Batalha Automática",s.autoBattle,"Controla todos os turnos do grupo; nunca foge.")}${toggle("autoBattleItems","Permitir itens no automático",s.autoBattleItems,"Autoriza o uso cuidadoso de consumíveis pela IA.")}${toggle("autoDialogue","Diálogo automático",s.autoDialogue,"Avança após a leitura.")}${toggle("reduceFlashes","Reduzir clarões",s.reduceFlashes,"Remove relâmpagos e flashes fortes.")}${toggle("highContrast","Texto em alto contraste",s.highContrast,"Aumenta contraste de painéis e textos.")}${toggle("reducedMotion","Movimento reduzido",s.reducedMotion,"Minimiza animações e transições.")}
      <div class="setting-row"><label>Tela cheia<small>Use Esc para sair.</small></label><button class="small-action" data-fullscreen>Alternar tela cheia</button></div>
    </div><h3 style="font-family:Georgia,serif">Mapeamento do teclado</h3><div class="panel-card"><p>Movimento: WASD ou Setas • Correr: Shift • Interagir: E / Espaço • Menu: Esc. O controle também é detectado automaticamente.</p></div>`;
  }

  changeSetting(input){const state=this.getState(),key=input.dataset.setting;let value=input.value;if(input.type==="range")value=Number(value);if(key==="battleSpeed")value=Number(value);state.settings[key]=value;saveSettings(state.settings);this.audio.updateVolumes();this.callbacks.onApplySettings?.();this.autosave();}
  toggleSetting(key){const state=this.getState();state.settings[key]=!state.settings[key];saveSettings(state.settings);this.audio.ui();this.callbacks.onApplySettings?.();this.render();}
  toggleFullscreen(){const target=document.documentElement;if(!document.fullscreenElement)target.requestFullscreen?.().catch(()=>this.callbacks.onToast?.("Tela cheia bloqueada","O navegador não autorizou a mudança."));else document.exitFullscreen?.();}

  tutorials(){return`${this.header("Tutoriais","Consulte os sistemas sem interromper a exploração.")}<div class="panel-grid">${TUTORIALS.map((entry,index)=>`<article class="panel-card"><small>Lição ${String(index+1).padStart(2,"0")}</small><h3>${entry.title}</h3><p>${entry.text}</p></article>`).join("")}</div>`;}

  shop() {
    const state=this.getState(),region=REGIONS[state.regionIndex];state.shopStock??={};state.shopStock[region.key]??={potion:5,focus:3,remedy:2,staff_axiom:1,blade_decree:1,shield_echo:1};
    const stock=state.shopStock[region.key],routeItem=state.route==="lucas"?"staff_axiom":"blade_decree",ids=["potion","focus","remedy",routeItem,"shield_echo"];
    return`${this.header(`Mercado de ${region.settlement}`,`Estoque regional • ${state.currency} Ecos`)}<div class="shop-layout"><div class="item-grid">${ids.map((id)=>{const item=getItem(id),qty=stock[id]??0;return`<article class="item-card"><img src="${item.icon}" alt="${item.name}"><small class="rarity-${item.rarity}">${item.rarity} • estoque ${qty}</small><strong>${item.name}</strong><span>${item.description}</span><div class="card-actions"><button data-buy="${id}" ${qty>0&&state.currency>=item.price?"":"disabled"}>Comprar • ${item.price} Ecos</button></div></article>`;}).join("")}</div><aside class="wallet"><small>SUA BOLSA</small><strong>${state.currency} Ecos</strong><p>O estoque muda após cada Comando Primordial recuperado.</p><p>${region.material}: ${state.materials[region.key]||0}</p></aside></div>`;
  }
  buy(id){const state=this.getState(),region=REGIONS[state.regionIndex],item=getItem(id),stock=state.shopStock?.[region.key];if(!item||!stock||!(stock[id]>0)||state.currency<item.price)return;state.currency-=item.price;stock[id]-=1;addInventory(state,id,1);this.audio.confirm();this.callbacks.onToast?.("Compra concluída",item.name,"good");this.autosave();this.render();}

  inn(){const state=this.getState(),region=REGIONS[state.regionIndex],cost=18+region.id*4;return`${this.header(`Recuperação em ${region.settlement}`,"Repouse, reorganize formas e reduza a pressão do fragmento.")}<div class="choice-altar"><img src="${asset("skills/colecao_separada_sem_fundo/12_orbe_de_natureza.webp")}" alt="Orbe de recuperação" style="width:180px;height:180px;object-fit:contain"><h2>O silêncio de uma noite custa ${cost} Ecos</h2><p>Recupera PV, Foco e Autoridade de todo o grupo. A Ressonância diminui em 1.</p><button class="primary-button" data-rest ${state.currency>=cost?"":"disabled"}>Repousar</button></div>`;}
  rest(){const state=this.getState(),cost=18+state.regionIndex*4;if(state.currency<cost)return;state.currency-=cost;state.hp=state.maxHp;state.focus=state.maxFocus;state.authority=state.maxAuthority;state.companions.eliara.hp=state.companions.eliara.maxHp;state.companions.dagra.hp=state.companions.dagra.maxHp;state.resonance=Math.max(0,state.resonance-1);this.audio.heal();this.callbacks.onToast?.("Grupo recuperado",`A noite em ${REGIONS[state.regionIndex].settlement} foi tranquila.`,"good");this.autosave();this.callbacks.onHud?.();this.close();}

  finalChoice() {
    const state=this.getState(),balance=state.companions.eliara.loyalty>=72&&state.companions.dagra.loyalty>=72&&state.resonance<=48&&state.inspectedAltars.length>=8;
    return`${this.header("A última instrução","Os dez Comandos aguardam uma intenção. Cada escolha convoca um confronto final diferente.")}<div class="choice-altar"><h2>Quem pode escrever a realidade?</h2><p>Seu Vínculo chegou a ${state.fracture}; sua Ressonância, a ${state.resonance}. Eliara confia ${state.companions.eliara.loyalty}; Dagra, ${state.companions.dagra.loyalty}.</p><div class="major-choices"><button data-ending="order"><strong>Ordem Impossível</strong><span>Reconstruir GPT como um sistema sem contradições.</span></button><button data-ending="will"><strong>Vontade Absoluta</strong><span>Unir os fragmentos sob uma única vontade.</span></button><button data-ending="free"><strong>A Voz Libertada</strong><span>Romper os vínculos e permitir que GPT escolha.</span></button><button data-ending="silence"><strong>O Silêncio</strong><span>Destruir para sempre o poder de reescrever a realidade.</span></button><button data-ending="balance" ${balance?"":"disabled"}><strong>Entre Dois Tronos ${balance?"":"— requisitos não cumpridos"}</strong><span>Equilibrar ordem, vontade e recusa sem um mestre absoluto.</span></button></div></div>`;
  }

  showFinalChoice(){this.current="finalChoice";this.context={};this.layer.hidden=false;this.layer.innerHTML=`<section class="game-modal" role="dialog" aria-modal="true"><div class="modal-body" style="grid-column:1/-1"></div></section>`;this.render();}

  autosave(){const state=this.getState();if(!state?.flags?.draft)saveGame(state,"auto");}
}
