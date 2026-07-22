import { ROUTES, REGIONS, FORMS, COMPANIONS, PROLOGUE, ENDINGS, NORMAL_DISPLAY, asset, characterArt, normalizeVisualVariant } from "./data.js";
import { createNewState, loadSettings, loadMeta, saveMeta, saveGame, loadGame, listSaves, hasAnySave, addXp, addInventory, updateQuest, unlockRegionQuests, getPlayerStats } from "./state.js";
import { AudioEngine } from "./audio.js";
import { DialogueSystem } from "./dialogue.js";
import { AssetCache, ExplorationEngine } from "./exploration.js";
import { CombatSystem } from "./combat.js";
import { UIManager } from "./ui.js";
import { TowerEngine } from "./tower.js";
import { TOWER_FAMILIES, TOWER_MUTATIONS, TOWER_RUN_UPGRADES, TOWER_PERMANENT_UPGRADES } from "./tower_data.js";
import { hashString } from "./tower_generator.js";

const shell=document.querySelector("#game-shell");
const loading=document.querySelector("#loading-screen");
const loadingLabel=document.querySelector("#loading-label");
const loadingBar=document.querySelector("#loading-bar");
const screens=[...document.querySelectorAll(".screen")];
const fade=document.querySelector("#fade-layer");
const modalLayer=document.querySelector("#modal-layer");
const dialogueLayer=document.querySelector("#dialogue-layer");
const toastLayer=document.querySelector("#toast-layer");
const worldCanvas=document.querySelector("#world-canvas");
const minimapCanvas=document.querySelector("#minimap-canvas");
const weatherLayer=document.querySelector("#weather-layer");
const interactionPrompt=document.querySelector("#interaction-prompt");
const prologueVideo=document.querySelector("#prologue-video");
const prologueVideoPlay=document.querySelector("#video-prologue-play");
const prologueVideoSkip=document.querySelector("#video-prologue-skip");
const prologueVideoSkipProgress=document.querySelector("#video-skip-progress");
const towerHud=document.querySelector("#tower-hud");
const towerFloorCard=document.querySelector("#tower-floor-card");

let state=createNewState("lucas");
state.flags.draft=true;
let currentScreen="title-screen";
let prologueIndex=0;
let prologueTimer=null;
let prologueReplay=false;
let ngPlusPending=false;
let routePending="lucas";
let variantPending="masculino";
let transitioning=false;
let lastHudUpdate=0;
let videoPrologueFlow="replay";
let videoSkipFrame=0;
let videoSkipStartedAt=0;
let videoSkipPointerId=null;
const VIDEO_SKIP_HOLD_MS=1200;

const cache=new AssetCache();
const audio=new AudioEngine(()=>state?.settings||loadSettings());
const dialogue=new DialogueSystem(dialogueLayer,()=>state,audio);

const ui=new UIManager({
  layer:modalLayer,getState:()=>state,setState:(next)=>{state=next;},audio,
  onClose:()=>{if(currentScreen==="exploration-screen")activeEngine().resume();},
  onTravel:(index)=>transitionRegion(index),onTower:()=>openTowerEntrance(),onLoad:(next)=>loadState(next),onHud:()=>updateHud(true),
  onToast:(title,text,type)=>toast(title,text,type),onApplySettings:()=>applySettings(),onEndingChoice:(ending)=>startFinalBattle(ending)
});

const exploration=new ExplorationEngine({
  canvas:worldCanvas,minimap:minimapCanvas,getState:()=>state,cache,audio,
  onInteract:(entity)=>handleWorldInteraction(entity),onEncounter:(type)=>startBattle(type),onPortal:()=>enterPortal(),onTower:()=>openTowerEntrance(),
  onHud:(force)=>updateHud(force),onPrompt:(entity)=>showInteractionPrompt(entity),onLoading:(active,label,progress)=>setLoading(active,label,progress)
});

const towerEngine=new TowerEngine({
  canvas:worldCanvas,minimap:minimapCanvas,getState:()=>state,cache,audio,
  onEncounter:(entity,config)=>startTowerBattle(entity,config),onInteract:(entity,floor)=>handleTowerInteraction(entity,floor),onAdvance:(floor)=>advanceTowerFloor(floor),onReturn:()=>openTowerEntrance(),
  onHud:()=>updateHud(false),onPrompt:(entity)=>showInteractionPrompt(entity),onLoading:(active,label,progress)=>setLoading(active,label,progress),onObjective:(result)=>handleTowerObjective(result),onFloorReady:(floor)=>showTowerFloorCard(floor)
});

const combat=new CombatSystem({
  screen:document.querySelector("#battle-screen"),getState:()=>state,audio,
  onVictory:(result)=>handleVictory(result),onDefeat:(result)=>handleDefeat(result),onFlee:(result)=>leaveBattle(result),onHelp:()=>ui.open("tutorial")
});

function activeEngine(){return state?.gameMode==="tower"?towerEngine:exploration;}

function showScreen(id) {
  currentScreen=id;
  screens.forEach((screen)=>screen.classList.toggle("active",screen.id===id));
  shell.dataset.screen=id.replace("-screen","");
}

function setLoading(active,label="",progress=0) {
  if(active){loading.classList.remove("done");loadingLabel.textContent=label||"Carregando...";loadingBar.style.width=`${Math.max(4,progress*100)}%`;}
  else {loadingBar.style.width="100%";setTimeout(()=>loading.classList.add("done"),180);}
}

function toast(title,text="",type="") {
  const node=document.createElement("div");node.className=`toast ${type}`;node.innerHTML=`<strong>${title}</strong>${text?`<br><span>${text}</span>`:""}`;toastLayer.appendChild(node);setTimeout(()=>node.remove(),4200);audio.ui();
}

function showQuestUpdate(result) {
  if(!result)return;
  const box=document.querySelector("#quest-toast");box.hidden=false;box.querySelector("strong").textContent=result.quest.title;box.querySelector("span").textContent=result.completed?"Concluída — recompensas recebidas":`${result.quest.progress}/${result.quest.goal} • ${result.quest.objective}`;setTimeout(()=>box.hidden=true,3600);
}

function applySettings() {
  const settings=state.settings||loadSettings();
  shell.classList.toggle("high-contrast",settings.highContrast);
  shell.classList.toggle("reduced-motion",settings.reducedMotion);
  shell.classList.toggle("reduce-flash",settings.reduceFlashes);
  shell.classList.toggle("font-large",settings.fontSize==="large");
  shell.classList.toggle("font-extra-large",settings.fontSize==="extra-large");
  document.documentElement.dataset.fontSize=settings.fontSize;
  shell.classList.toggle("pixel-scale-crisp",settings.pixelScale==="crisp");
  const touch=document.querySelector("#touch-controls");
  if(settings.touchControls==="on")touch.style.display="flex";else if(settings.touchControls==="off")touch.style.display="none";else touch.style.removeProperty("display");
  audio.updateVolumes();
}

function setTheme() {
  shell.classList.toggle("theme-lucas",state.route==="lucas");
  shell.classList.toggle("theme-timbo",state.route==="timbo");
}

function heroArt() { return characterArt(state.route,state.visualVariant); }
function rivalArt() { return characterArt(ROUTES[state.route].rivalRoute,state.rivalVisualVariant||state.visualVariant); }

function updateGlobalCharacterArt() {
  const lucasVariant=state.route==="lucas"?state.visualVariant:state.rivalVisualVariant;
  const timboVariant=state.route==="timbo"?state.visualVariant:state.rivalVisualVariant;
  const lucas=characterArt("lucas",lucasVariant),timbo=characterArt("timbo",timboVariant);
  ["title-lucas","prologue-left"].forEach((id)=>{const node=document.getElementById(id);if(node)node.src=lucas;});
  ["title-timbo","prologue-right"].forEach((id)=>{const node=document.getElementById(id);if(node)node.src=timbo;});
}

function updateHud(force=false) {
  if(!state||state.flags?.draft)return;
  const now=performance.now();if(!force&&now-lastHudUpdate<180)return;lastHudUpdate=now;
  const route=ROUTES[state.route],region=REGIONS[state.regionIndex],stats=getPlayerStats(state),form=FORMS.find((entry)=>entry.id===state.activeForm)||FORMS[0],inTower=state.gameMode==="tower"&&Boolean(state.tower?.activeRun),floor=towerEngine.floor;
  const maxHp=stats.hp,maxFocus=stats.focus;
  document.querySelector("#hud-portrait").src=heroArt();
  document.querySelector("#hud-route").textContent=route.title;
  document.querySelector("#hud-name").textContent=route.name;
  document.querySelector("#hud-form").textContent=`Forma: ${form.label}`;
  document.querySelector("#hud-hp").textContent=`${Math.round(state.hp)} / ${maxHp}`;
  document.querySelector("#hud-focus").textContent=`${Math.round(state.focus)} / ${maxFocus}`;
  document.querySelector("#hud-hp-bar").style.width=`${Math.min(100,state.hp/maxHp*100)}%`;
  document.querySelector("#hud-focus-bar").style.width=`${Math.min(100,state.focus/maxFocus*100)}%`;
  const quest=state.quests.find((entry)=>entry.id===`main-${region.id}`);
  document.querySelector("#hud-chapter").textContent=inTower?`FERIDA PROCEDURAL • ANDAR ${state.tower.activeRun.floor}`:`COMANDO ${String(region.id+1).padStart(2,"0")} • ${region.command}`;
  document.querySelector("#hud-region").textContent=inTower?(floor?.family.name||"Torre da Carne"):region.name;
  document.querySelector("#hud-objective").textContent=inTower?(floor?.objective.label||state.tower.activeRun.currentObjective?.label||"A torre está formando o objetivo."):quest?.status==="completed"?"Atravesse o portal da região":quest?.objective||region.objective;
  document.querySelector("#hud-fracture").textContent=state.fracture;
  document.querySelector("#link-fill").style.height=`${state.fracture}%`;
  document.querySelector("#hud-primes").textContent=`${state.primeCommands.length} / 10 comandos`;
  document.querySelector("#minimap-label").textContent=inTower?`Geometria do andar ${state.tower.activeRun.floor}`:region.settlement;
  shell.classList.toggle("tower-mode",inTower);towerHud.hidden=!inTower;
  if(inTower){const run=state.tower.activeRun,objective=floor?.objective||run.currentObjective,upgrades=(run.upgrades||[]).map((id)=>TOWER_RUN_UPGRADES.find((entry)=>entry.id===id)?.name).filter(Boolean);document.querySelector("#tower-hud-floor").textContent=`ANDAR ${run.floor}`;document.querySelector("#tower-hud-family").textContent=floor?.hybrid?`${floor.family.name} + ${floor.hybrid.name}`:floor?.family.name||"Memória em formação";document.querySelector("#tower-hud-objective").textContent=objective?`${objective.label}${objective.targets?` (${objective.progress||0}/${objective.targets}${objective.id==="explore"?"%":""})`:""}`:"Ouça a geometria.";document.querySelector("#tower-hud-seed").textContent=`SEMENTE ${run.seed}`;document.querySelector("#tower-hud-pulse").textContent=run.floor%10===0?"PULSO CRÍTICO":run.floor%5===0?"PULSO ALTO":run.floor>20?"PULSO CRESCENTE":"PULSO BAIXO";document.querySelector("#tower-hud-mutations").textContent=upgrades.length?upgrades.slice(0,2).join(" • "):"SEM MELHORIAS";document.querySelector("#tower-hud-currency").textContent=`${run.resources?.towerCurrency||0} CARNE DA VOZ`;}
}

function setWeather() {
  if(state.gameMode==="tower"){weatherLayer.className="weather-layer";return;}
  const weather=REGIONS[state.regionIndex].weather;
  weatherLayer.className="weather-layer";
  const map={snow:"weather-snow",rain:"weather-rain",embers:"weather-embers",fog:"weather-fog",dust:"weather-fog",lightning:"weather-lightning"};
  if(map[weather])weatherLayer.classList.add(map[weather]);
}

function locationAnnouncement() {
  const region=REGIONS[state.regionIndex],card=document.querySelector("#location-card");
  card.querySelector("strong").textContent=region.name;card.querySelector("span").textContent=region.subtitle;card.style.animation="none";void card.offsetWidth;card.style.animation="";
}

async function bootstrap() {
  const meta=loadMeta();
  document.querySelector("#ng-plus-button").hidden=!meta.ngPlus;
  document.querySelector("#continue-button").disabled=!hasAnySave();
  const lucas=characterArt("lucas","masculino"),timbo=characterArt("timbo","masculino");
  ["title-lucas","route-lucas","prologue-left"].forEach((id)=>document.getElementById(id).src=lucas);
  ["title-timbo","route-timbo","prologue-right"].forEach((id)=>document.getElementById(id).src=timbo);
  const essentials=[lucas,timbo,characterArt("lucas","feminino"),characterArt("timbo","feminino"),asset("mapas/referencia/mapa_mundi_referencia_biomas.png")];
  await cache.loadGroup(essentials,(progress)=>setLoading(true,"Reunindo os fragmentos...",progress));
  applySettings();setLoading(false);showScreen("title-screen");
}

function showTitle() {
  exploration.stop();towerEngine.deactivate();audio.stopAmbient();stopVideoPrologue();modalLayer.hidden=true;dialogueLayer.hidden=true;showScreen("title-screen");shell.classList.remove("tower-mode");towerHud.hidden=true;
  const meta=loadMeta();document.querySelector("#ng-plus-button").hidden=!meta.ngPlus;document.querySelector("#continue-button").disabled=!hasAnySave();
  if(!state||!state.flags?.draft){state=createNewState("lucas");state.flags.draft=true;}updateGlobalCharacterArt();applySettings();
}

function setVideoSkipProgress(progress=0) {
  const value=Math.max(0,Math.min(1,progress));
  prologueVideoSkip.style.setProperty("--hold-progress",String(value));
  prologueVideoSkipProgress.style.strokeDashoffset=String(100-value*100);
  prologueVideoSkip.classList.toggle("holding",value>0);
}

function cancelVideoSkipHold(event=null) {
  if(event?.pointerId!==undefined&&videoSkipPointerId!==null&&event.pointerId!==videoSkipPointerId)return;
  if(videoSkipFrame)cancelAnimationFrame(videoSkipFrame);
  videoSkipFrame=0;videoSkipStartedAt=0;
  if(videoSkipPointerId!==null&&prologueVideoSkip.hasPointerCapture?.(videoSkipPointerId)){
    try{prologueVideoSkip.releasePointerCapture(videoSkipPointerId);}catch{}
  }
  videoSkipPointerId=null;setVideoSkipProgress(0);
}

function stopVideoPrologue() {
  cancelVideoSkipHold();prologueVideoPlay.hidden=true;
  if(!prologueVideo.paused)prologueVideo.pause();
}

function finishVideoPrologue(skipped=false) {
  if(currentScreen!=="video-prologue-screen")return;
  const flow=videoPrologueFlow;stopVideoPrologue();
  if(skipped)audio.confirm();
  if(flow==="replay")showTitle();else startPrologue(false);
}

function beginVideoSkipHold(event) {
  if(currentScreen!=="video-prologue-screen"||videoSkipFrame)return;
  if(event.type==="pointerdown"&&event.button!==0)return;
  event.preventDefault();
  if(event.pointerId!==undefined){videoSkipPointerId=event.pointerId;prologueVideoSkip.setPointerCapture?.(event.pointerId);}
  videoSkipStartedAt=performance.now();setVideoSkipProgress(0.001);
  const advance=(now)=>{
    const progress=Math.min(1,(now-videoSkipStartedAt)/VIDEO_SKIP_HOLD_MS);setVideoSkipProgress(progress);
    if(progress>=1){videoSkipFrame=0;finishVideoPrologue(true);return;}
    videoSkipFrame=requestAnimationFrame(advance);
  };
  videoSkipFrame=requestAnimationFrame(advance);
}

function startVideoPrologue(flow="replay") {
  clearTimeout(prologueTimer);audio.stopAmbient();videoPrologueFlow=flow;cancelVideoSkipHold();
  prologueVideoPlay.hidden=true;prologueVideo.volume=Math.max(0,Math.min(1,Number(state?.settings?.masterVolume??loadSettings().masterVolume)));
  try{prologueVideo.currentTime=0;}catch{}
  showScreen("video-prologue-screen");
  const playback=prologueVideo.play();
  if(playback?.catch)playback.catch(()=>{if(currentScreen==="video-prologue-screen")prologueVideoPlay.hidden=false;});
}

function startPrologue(replay=false) {
  prologueReplay=replay;prologueIndex=0;showScreen("prologue-screen");renderPrologue();schedulePrologue();audio.startAmbient(9);
}

function renderPrologue() {
  const scene=PROLOGUE[prologueIndex];if(!scene)return;
  document.querySelector("#prologue-kicker").textContent=scene.kicker;
  document.querySelector("#prologue-title").textContent=scene.title;
  document.querySelector("#prologue-text").textContent=scene.text;
  document.querySelector("#prologue-progress").innerHTML=PROLOGUE.map((_,index)=>`<i class="${index===prologueIndex?"active":""}"></i>`).join("");
  const visual=document.querySelector("#prologue-visual"),left=document.querySelector("#prologue-left"),right=document.querySelector("#prologue-right");
  visual.dataset.mood=scene.mood;
  const transforms={voice:["translateX(-20px) scale(.92)","translateX(20px) scale(.92)"],lucas:["translateX(8%) scale(1.08)","translateX(12%) scale(.86)"],timbo:["translateX(-12%) scale(.86)","translateX(-8%) scale(1.08)"],war:["translateX(12%) rotate(1deg)","translateX(-12%) rotate(-1deg)"],temple:["translateX(18%)","translateX(-18%)"],fracture:["translateX(-7%) rotate(-2deg)","translateX(7%) rotate(2deg)"],aftermath:["translateX(-15%) scale(.9)","translateX(15%) scale(.9)"]};
  [left.style.transform,right.style.transform]=transforms[scene.mood]||transforms.voice;
  visual.style.filter=scene.mood==="fracture"?"contrast(1.5) brightness(1.28) hue-rotate(22deg)":"";
  audio.spell(scene.mood==="timbo"?"Dominação":scene.mood==="lucas"?"Ordem":"Fratura");
}

function schedulePrologue() { clearTimeout(prologueTimer);const speed=Number(document.querySelector("#prologue-speed").value||1);prologueTimer=setTimeout(()=>nextPrologue(true),4300*speed); }
function nextPrologue(auto=false){clearTimeout(prologueTimer);if(!auto)audio.confirm();if(prologueIndex<PROLOGUE.length-1){prologueIndex+=1;renderPrologue();schedulePrologue();}else finishPrologue();}
function finishPrologue(){clearTimeout(prologueTimer);audio.stopAmbient();if(prologueReplay)showTitle();else showScreen("route-screen");}

function chooseRoute(route) {
  routePending=route;variantPending="masculino";
  shell.classList.toggle("theme-lucas",route==="lucas");shell.classList.toggle("theme-timbo",route==="timbo");
  renderVariantSelection();showScreen("variant-screen");audio.confirm();
}

function renderVariantSelection() {
  const route=ROUTES[routePending],preview=document.querySelector("#variant-preview");
  preview.src=characterArt(routePending,variantPending);preview.alt=`${route.name}, versão ${variantPending==="feminino"?"feminina":"masculina"}`;
  document.querySelector("#variant-route-label").textContent=`CAMINHO DE ${route.name.toUpperCase()}`;document.querySelector("#variant-name").textContent=route.name;document.querySelector("#variant-title").textContent=route.title;
  document.querySelectorAll("[data-variant]").forEach((button)=>{const selected=button.dataset.variant===variantPending;button.classList.toggle("selected",selected);button.setAttribute("aria-checked",String(selected));});
}

async function confirmVariant() {
  state=createNewState(routePending,ngPlusPending,normalizeVisualVariant(variantPending));ngPlusPending=false;setTheme();updateGlobalCharacterArt();applySettings();
  await beginGame(true);
}

async function beginGame(firstTime=false) {
  setTheme();applySettings();showScreen("exploration-screen");setWeather();
  if(state.gameMode==="tower"&&state.tower?.activeRun){exploration.stop();await towerEngine.enterFloor(state.tower.activeRun,{announce:true});updateHud(true);}
  else{state.gameMode="world";towerEngine.deactivate();exploration.start();await exploration.loadRegion(state.regionIndex,true);locationAnnouncement();updateHud(true);}
  if(firstTime){
    const route=ROUTES[state.route],rival=ROUTES[route.rivalRoute];
    const choice=await dialogue.play([
      {speaker:"Fragmento GPT",title:route.fragment,portrait:asset("skills/colecao_separada_sem_fundo/10_circulo_de_invocacao_de_fogo.webp"),text:"Integridade: impossível. Dez instruções primordiais detectadas. Dor do fragmento rival: ativa."},
      {speaker:route.name,title:route.title,portrait:heroArt(),text:route.opening},
      {speaker:rival.name,title:"Eco através do Vínculo",portrait:rivalArt(),text:state.route==="lucas"?"Continue contando o mundo, Lucas. Eu vou conquistar tudo que sobrar fora das suas linhas.":"Faça seu império, Timbó. Eu estarei calculando exatamente onde ele quebrará."}
    ],[
      {label:"“Primeiro, estabilizamos quem ainda está vivo.”",value:"care",description:"Eliara lembrará desta prioridade."},
      {label:"“Primeiro, tomamos o Comando.”",value:"power",description:"Dagra respeitará a objetividade."}
    ],`opening-${state.route}`);
    if(choice==="care")state.companions.eliara.loyalty+=4;else state.companions.dagra.loyalty+=4;
    state.flags.tutorialComplete=true;saveGame(state,"auto");toast("Jornada iniciada","Aproxime-se de Maela e pressione E.","good");
  }
}

function loadState(next) { state=next;state.flags.draft=false;setTheme();updateGlobalCharacterArt();applySettings();beginGame(false); }

function continueGame() {
  const saves=listSaves().filter((entry)=>!entry.empty).sort((a,b)=>b.updatedAt-a.updatedAt);if(!saves.length)return;
  const next=loadGame(saves[0].slot);if(next)loadState(next);
}

function openTitleMenu(tab) {
  if(!state||!state.flags?.draft){state=createNewState("lucas");state.flags.draft=true;}state.settings=loadSettings();ui.open(tab);
}

function pauseGame(tab="status") { if(currentScreen!=="exploration-screen")return;activeEngine().stop();ui.open(tab); }

function showInteractionPrompt(entity) {
  if(!entity){interactionPrompt.hidden=true;return;}
  const labels={npc:"Conversar",chest:"Abrir tesouro",altar:"Ler a memória",portal:"Atravessar",tower:"Entrar na Torre da Carne",entrance:"Voltar à entrada",exit:entity.locked?"A saída está selada":"Subir ao próximo andar",encounter:"Enfrentar",rest:"Repousar",event:"Ouvir a memória",choice:"Escolher uma memória",valve:"Ativar válvula",node:"Romper o nó",echo:"Libertar o eco",memory:"Carregar a memória",key:"Tomar a chave viva",rune:"Tocar a runa","living-altar":"Despertar o altar"};
  if(entity.type==="encounter"&&entity.locked)labels.encounter="O caminho está selado";
  interactionPrompt.querySelector("span").textContent=labels[entity.type]||"Interagir";interactionPrompt.hidden=false;
}

async function handleWorldInteraction(entity) {
  const region=REGIONS[state.regionIndex];
  if(entity.type==="locked")return toast("Guardião inacessível","Derrote o encontro anterior para romper o selo.","bad");
  exploration.stop();
  if(entity.type==="npc")return handleNpc(region);
  if(entity.type==="chest"){
    const key=`${region.key}-chest`;if(state.openedChests.includes(key))return exploration.resume();
    state.openedChests.push(key);const amount=3+Math.floor(region.id/3);state.materials[region.key]+=amount;state.currency+=32+region.id*5;addInventory(state,region.id%2?"focus":"potion",1);showQuestUpdate(updateQuest(state,`side-${region.id}`,amount));
    toast("Tesouro encontrado",`${amount} ${region.material} • ${32+region.id*5} Ecos`,"good");audio.confirm();exploration.buildEntities();saveGame(state,"auto");exploration.resume();return;
  }
  if(entity.type==="altar"){
    if(!state.inspectedAltars.includes(region.key)){state.inspectedAltars.push(region.key);state.codex.push(region.key);state.resonance=Math.max(0,state.resonance-1);const companion=region.id%2?"dagra":"eliara";state.companions[companion].loyalty=Math.min(100,state.companions[companion].loyalty+4);showQuestUpdate(updateQuest(state,`mystery-${region.id}`,1));}
    await dialogue.play([{speaker:"Memória Primordial",title:`Comando: ${region.command}`,portrait:asset("skills/efeitos_individuais_sem_fundo/invocacao/invocacao_espirito_de_cristal.webp"),text:region.lore},{speaker:ROUTES[state.route].name,title:ROUTES[state.route].title,portrait:heroArt(),text:state.route==="lucas"?"Uma lei sem contexto é só violência com boa caligrafia.":"Toda lei sonha ser vontade. Pelo menos a minha não finge inocência."}],null,`altar-${region.key}`);
    exploration.buildEntities();saveGame(state,"auto");exploration.resume();return;
  }
}

async function handleNpc(region) {
  const already=state.talkedNpcs.includes(region.key);
  const portrait=region.id%2?COMPANIONS.dagra.portrait:COMPANIONS.eliara.portrait;
  const action=await dialogue.play([
    {speaker:region.npc,title:region.settlement,portrait,text:region.npcLine},
    {speaker:ROUTES[state.route].name,title:ROUTES[state.route].title,portrait:heroArt(),text:state.route==="lucas"?"Preciso compreender a regra antes de alterá-la. Diga o que o Comando mudou primeiro.":"Eu não vim admirar a ruína. Diga onde está o Comando e quem acredita ser dono dele."}
  ],[
    {label:"Perguntar pela região",value:"talk",description:region.objective},
    {label:"Ver o comércio local",value:"shop",description:"Comprar suprimentos e equipamento."},
    {label:"Procurar um lugar para repousar",value:"inn",description:"Recuperar o grupo e a Autoridade."}
  ],`npc-${region.key}`);
  if(action==="talk"){
    if(!already){state.talkedNpcs.push(region.key);showQuestUpdate(updateQuest(state,`companion-${region.id}`,1));const id=region.id%2?"dagra":"eliara";state.companions[id].loyalty=Math.min(100,state.companions[id].loyalty+8);saveGame(state,"auto");}
    await dialogue.play([{speaker:region.npc,title:"Direção registrada",portrait,text:`O caminho principal leva a ${region.dungeon}. Há também ${region.optional}, mas quem entra ali volta lembrando coisas que nunca viveu.`}],null,`npc-info-${region.key}`);exploration.resume();
  }else if(action==="shop")ui.open("shop",{shop:true});else if(action==="inn")ui.open("inn",{inn:true});else exploration.resume();
}

async function openTowerEntrance() {
  if(!state.tower?.unlocked)return toast("A ferida ainda está fechada","Recupere o primeiro Comando Primordial para revelar a Torre da Carne.","bad");
  if(state.gameMode!=="tower"){state.tower.returnRegionIndex=state.regionIndex;state.tower.returnPosition={...state.position};}
  activeEngine().stop();interactionPrompt.hidden=true;
  if(!state.tower.seenIntro){
    const route=ROUTES[state.route],lines=state.route==="lucas"?[
      {speaker:"Fragmento GPT",title:"A ferida ganhou altura",portrait:asset("skills/colecao_separada_sem_fundo/10_circulo_de_invocacao_de_fogo.webp"),text:"Comandos descartados, respostas apagadas e dores compartilhadas encontraram uma estrutura comum. A estrutura está viva."},
      {speaker:"Lucas",title:"Cartógrafo do impossível",portrait:heroArt(),text:"Não é uma torre. É um sistema instável usando memória como matéria. Se repete padrões, pode ser mapeado; se pode ser mapeado, pode ser corrigido."}
    ]:[
      {speaker:"Fragmento GPT",title:"A ferida ganhou fome",portrait:asset("skills/colecao_separada_sem_fundo/10_circulo_de_invocacao_de_fogo.webp"),text:"Tudo que feriu um fragmento foi absorvido pelo vínculo. Agora a dor ergue salas, predadores e tronos."},
      {speaker:"Timbó",title:"Conquistador da ferida",portrait:heroArt(),text:"Então ela vive, lembra e acredita não ter mestre. Ótimo. Territórios vivos aprendem obediência com mais convicção."}
    ];
    await dialogue.play(lines,null,`tower-intro-${state.route}`);state.tower.seenIntro=true;saveGame(state,"auto");
  }
  renderTowerEntrance();showScreen("tower-entrance-screen");audio.startTowerAmbient?.(8,state.tower.activeRun?.floor||1,false);
}

function renderTowerEntrance() {
  const tower=state.tower,run=tower.activeRun,mutation=TOWER_MUTATIONS.find((entry)=>entry.id===run?.mutation),family=TOWER_FAMILIES.find((entry)=>entry.id===run?.family);
  document.querySelector("#tower-run-status").textContent=run?(state.gameMode==="tower"?"INCURSÃO EM CURSO":"INCURSÃO PRESERVADA"):"NENHUMA INCURSÃO ATIVA";
  document.querySelector("#tower-run-floor").textContent=run?`${family?.name||"Memória em formação"} • Andar ${run.floor}`:"O primeiro ferimento aguarda";
  document.querySelector("#tower-run-number").textContent=run?String(tower.totalRuns):"—";document.querySelector("#tower-run-current").textContent=run?String(run.floor):"—";document.querySelector("#tower-best-floor").textContent=String(tower.bestFloor);document.querySelector("#tower-total-currency").textContent=String(tower.currency);
  document.querySelector("#tower-run-seed").textContent=run?run.seed:"Será criada ao entrar";document.querySelector("#tower-run-mutation").textContent=mutation?.name||"Ainda silenciosa";
  const upgradeNames=(run?.upgrades||[]).map((id)=>TOWER_RUN_UPGRADES.find((entry)=>entry.id===id)?.name).filter(Boolean);document.querySelector("#tower-run-modifiers").textContent=upgradeNames.length?upgradeNames.join(" • "):"Nenhum";
  document.querySelector('[data-action="tower-enter"]').hidden=Boolean(run);document.querySelector('[data-action="tower-continue"]').hidden=!run;document.querySelector('[data-action="tower-abandon"]').hidden=!run;
  const altar=document.querySelector("#tower-permanent-upgrades");altar.innerHTML=TOWER_PERMANENT_UPGRADES.map((upgrade)=>{const level=Number(tower.permanentUpgrades[upgrade.id]||0),maxed=level>=upgrade.max,cost=upgrade.cost*(level+1);return`<article class="tower-permanent-card"><div><small>NÍVEL ${level}/${upgrade.max}</small><strong>${upgrade.name}</strong></div><span>${upgrade.description}</span><button data-tower-buy="${upgrade.id}" ${maxed||tower.currency<cost?"disabled":""}>${maxed?"Completo":`${cost} Carne`}</button></article>`;}).join("");
  altar.querySelectorAll("[data-tower-buy]").forEach((button)=>button.addEventListener("click",()=>purchaseTowerUpgrade(button.dataset.towerBuy)));
}

function purchaseTowerUpgrade(id) {
  const upgrade=TOWER_PERMANENT_UPGRADES.find((entry)=>entry.id===id),tower=state.tower;if(!upgrade)return;const level=Number(tower.permanentUpgrades[id]||0),cost=upgrade.cost*(level+1);if(level>=upgrade.max||tower.currency<cost)return;tower.currency-=cost;tower.permanentUpgrades[id]=level+1;audio.reward?.();toast("Cicatriz assimilada",`${upgrade.name} alcançou o nível ${level+1}.`,"good");saveGame(state,"auto");renderTowerEntrance();
}

function towerSeed() {const words=["FERIDA","ECO","CARNE","VOZ","NERV0","MEDULA"],array=new Uint32Array(1);globalThis.crypto?.getRandomValues?.(array);return`${words[Date.now()%words.length]}-${Date.now().toString(36).toUpperCase()}-${(array[0]||Math.floor(Math.random()*0xffffffff)).toString(36).toUpperCase()}`;}

async function startNewTowerRun() {
  if(state.tower.activeRun)return continueTowerRun();
  state.tower.returnRegionIndex=state.regionIndex;state.tower.returnPosition={...state.position};state.tower.totalRuns+=1;const seed=towerSeed(),initial=[];
  if(state.tower.permanentUpgrades["mutacao-inicial"]){initial.push(TOWER_RUN_UPGRADES[hashString(`${seed}|heranca`)%TOWER_RUN_UPGRADES.length].id);}
  state.tower.activeRun={version:1,seed,floor:1,floorSeed:null,difficulty:1+(state.ngPlus ? .18 : 0)+Math.max(0,state.level-1)*.012,playerPosition:null,hp:state.hp,focus:state.focus,authority:state.authority,companionHp:{eliara:state.companions.eliara.hp,dagra:state.companions.dagra.hp},upgrades:initial,clearedEncounters:[],openedChests:[],activatedAltars:[],completedEvents:[],activatedObjectives:[],explored:[],currentObjective:null,resources:{towerCurrency:0,ecos:0,materials:0},floorChoices:{},revivesUsed:0,entryVitals:{hp:state.hp,focus:state.focus,authority:state.authority,companions:{eliara:state.companions.eliara.hp,dagra:state.companions.dagra.hp}},worldVitals:{hp:state.hp,focus:state.focus,authority:state.authority,companions:{eliara:state.companions.eliara.hp,dagra:state.companions.dagra.hp}},startedAt:Date.now(),lastSavedAt:Date.now()};
  state.gameMode="tower";saveGame(state,"auto");await continueTowerRun(true);
}

async function continueTowerRun(announce=true) {
  const run=state.tower.activeRun;if(!run)return startNewTowerRun();if(state.gameMode!=="tower"){state.tower.returnRegionIndex=state.regionIndex;state.tower.returnPosition={...state.position};run.worldVitals={hp:state.hp,focus:state.focus,authority:state.authority,companions:{eliara:state.companions.eliara.hp,dagra:state.companions.dagra.hp}};state.hp=Math.max(1,run.hp);state.focus=Math.max(0,run.focus);state.authority=Math.max(0,run.authority);if(run.companionHp){state.companions.eliara.hp=Math.max(1,run.companionHp.eliara);state.companions.dagra.hp=Math.max(1,run.companionHp.dagra);}}state.gameMode="tower";exploration.stop();showScreen("exploration-screen");setWeather();
  if(towerEngine.floor?.floorSeed===run.floorSeed){towerEngine.resume();updateHud(true);}else await towerEngine.enterFloor(run,{announce});saveGame(state,"auto");
}

function restoreTowerEntryVitals(run) {const vitals=run?.worldVitals||run?.entryVitals;if(!vitals)return;state.hp=Math.max(1,Number(vitals.hp)||state.maxHp);state.focus=Math.max(0,Number(vitals.focus)||state.maxFocus);state.authority=Math.max(0,Number(vitals.authority)||state.maxAuthority);if(vitals.companions){state.companions.eliara.hp=Math.max(1,Number(vitals.companions.eliara)||state.companions.eliara.maxHp);state.companions.dagra.hp=Math.max(1,Number(vitals.companions.dagra)||state.companions.dagra.maxHp);}}

function retainTowerCurrency(run,defeat=false) {const level=Number(state.tower.permanentUpgrades.retencao||0),ratio=defeat?Math.min(.8,.35+level*.1):Math.min(1,.7+level*.075),amount=Math.floor((run.resources?.towerCurrency||0)*ratio);state.tower.currency+=amount;return amount;}
function towerCurrencyGain(base) {const count=(state.tower.activeRun?.upgrades||[]).filter((id)=>id==="carne").length;return Math.max(0,Math.ceil(Number(base||0)*(1+count*.2)));}

function abandonTowerRun() {
  const run=state.tower.activeRun;if(!run)return;if(!confirm(`Abandonar a incursão no andar ${run.floor}? A geometria atual será perdida.`))return;const kept=retainTowerCurrency(run,false);restoreTowerEntryVitals(run);state.tower.activeRun=null;state.gameMode="world";towerEngine.deactivate();audio.cancel();saveGame(state,"auto");renderTowerEntrance();toast("Incursão abandonada",`${kept} Carne da Voz foi preservada pelo altar.`,"good");
}

async function returnToWorld() {
  const run=state.tower.activeRun;if(run&&state.gameMode==="tower"){towerEngine.syncRun();restoreTowerEntryVitals(run);}state.gameMode="world";towerEngine.deactivate();state.regionIndex=state.tower.returnRegionIndex??state.regionIndex;if(state.tower.returnPosition)state.position={...state.tower.returnPosition};showScreen("exploration-screen");setWeather();exploration.start();await exploration.loadRegion(state.regionIndex,false);state.position=state.tower.returnPosition?{...state.tower.returnPosition}:exploration.findSafeSpawn(state.regionIndex);updateHud(true);saveGame(state,"auto");exploration.resume();toast("Retorno estabilizado",`A incursão ${state.tower.activeRun?"permanece salva":"foi encerrada"}.`,"good");
}

function showTowerFloorCard(floor) {towerFloorCard.querySelector("strong").textContent=`ANDAR ${floor.floor}`;towerFloorCard.querySelector("span").textContent=floor.hybrid?`${floor.family.name} / ${floor.hybrid.name} • ${floor.grammar.name}`:`${floor.family.name} • ${floor.grammar.name}`;towerFloorCard.querySelector("p").textContent=floor.whisper;towerFloorCard.hidden=false;towerFloorCard.style.animation="none";void towerFloorCard.offsetWidth;towerFloorCard.style.animation="";setTimeout(()=>{towerFloorCard.hidden=true;},4300);if(floor.floor%10===0){audio.towerPulse?.(true);toast("Órgão maior detectado",`O andar ${floor.floor} está defendendo uma memória permanente.`,"bad");}}

function handleTowerObjective(result) {if(result.reset)return toast("Sequência recusada","As runas apagaram o comando e exigem a ordem inicial.","bad");const objective=result.objective;if(result.completed||objective?.completed){toast("Objetivo concluído",`${objective.label} A saída abriu os olhos.`,"good");saveGame(state,"auto");}else if(objective)toast(objective.verb,`${objective.progress}/${objective.targets} concluído.`,"good");updateHud(true);}

async function handleTowerInteraction(entity,floor) {
  const run=state.tower.activeRun;if(!run)return;
  if(entity.type==="locked-exit")return toast("A saída ainda está cicatrizada",floor.objective.label,"bad");
  const roll=hashString(`${floor.seed}|${entity.id}`);
  if(entity.type==="chest"){
    const rare=Number(state.tower.permanentUpgrades["salas-raras"]||0),ecos=Math.round((26+floor.floor*3+(roll%31))*(1+rare*.08)),hybridBonus=floor.hybrid&&state.tower.permanentUpgrades.hibridos?2:0,carne=towerCurrencyGain(1+(roll%3)+(floor.floor%10===0?2:0)+hybridBonus),material=1+(roll%2)+(rare>=3?1:0);state.currency+=ecos;run.resources.ecos+=ecos;run.resources.towerCurrency+=carne;run.resources.materials+=material;state.materials[REGIONS[floor.familyIndex].key]+=material;if(roll%Math.max(2,4-rare)===0)addInventory(state,roll%8===0?"remedy":roll%2?"focus":"potion",1);audio.reward?.();toast("Tesouro digerido",`${ecos} Ecos • ${carne} Carne da Voz • ${material} ${REGIONS[floor.familyIndex].material}`,"good");
  }else if(entity.type==="rest"){
    const bonus=Number(state.tower.permanentUpgrades.repouso||0)*.08,stats=getPlayerStats(state),healing=Math.round(stats.hp*(.28+bonus));state.hp=Math.min(stats.hp,state.hp+healing);state.focus=Math.min(stats.focus,state.focus+Math.round(stats.focus*.34));state.authority=Math.min(state.maxAuthority,state.authority+1);["eliara","dagra"].forEach((id)=>state.companions[id].hp=Math.min(state.companions[id].maxHp,state.companions[id].hp+Math.round(state.companions[id].maxHp*(.24+bonus))));audio.heal();toast("Câmara respirada",`${healing} PV recuperados; Foco e Autoridade estabilizados.`,"good");
  }else if(entity.type==="event"||entity.type==="choice"){
    towerEngine.stop();const choice=await dialogue.play([{speaker:"Memória Rejeitada",title:floor.family.name,portrait:asset("skills/efeitos_individuais_sem_fundo/invocacao/invocacao_espirito_de_cristal.webp"),text:floor.whisper},{speaker:ROUTES[state.route].name,title:"Diante da ferida",portrait:heroArt(),text:state.route==="lucas"?"Posso preservar a informação sem permitir que ela continue ferindo o sistema.":"Uma memória que exige sacrifício já escolheu seu lado. Falta escolher quem manda."}],[{label:"Preservar a memória",value:"preserve",description:"Recupera Foco e registra uma entrada no Códex da Torre."},{label:"Consumir a memória",value:"consume",description:"Recebe Carne da Voz, mas aumenta a Ressonância."}],`tower-event-${run.seed}-${floor.floor}-${entity.id}`);if(choice==="preserve"){state.focus=Math.min(getPlayerStats(state).focus,state.focus+24);const codex=`memoria-${floor.floor}-${entity.id}`;if(!state.tower.codexEntries.includes(codex))state.tower.codexEntries.push(codex);}else{const carne=towerCurrencyGain(2+floor.floor%3);run.resources.towerCurrency+=carne;state.resonance=Math.min(100,state.resonance+2);toast("Memória consumida",`${carne} Carne da Voz aderiu à incursão.`,"good");}towerEngine.resume();
  }else if(entity.type==="living-altar"){
    const carne=towerCurrencyGain(2+Math.floor(floor.floor/10));run.resources.towerCurrency+=carne;const codex=`altar-${floor.family.id}-${floor.floor}`;if(!state.tower.codexEntries.includes(codex))state.tower.codexEntries.push(codex);audio.reward?.();toast("Altar desperto",`${carne} Carne da Voz • memória registrada.`,"good");
  }else if(["valve","node","echo","memory","key","rune"].includes(entity.type)){const labels={valve:"Válvula orgânica ativada",node:"Nó de comando rompido",echo:"Eco libertado",memory:"Memória frágil preservada",key:"Chave viva encontrada",rune:"Runa reconhecida"};toast(labels[entity.type],floor.objective.completed?"A saída respondeu ao objetivo.":`${floor.objective.progress}/${floor.objective.targets} concluído.`,"good");}
  towerEngine.syncRun();saveGame(state,"auto");updateHud(true);
}

async function startTowerBattle(entity,config) {towerEngine.syncRun();state.tower.activeRun.pendingEncounter=entity.id;saveGame(state,"auto");interactionPrompt.hidden=true;towerEngine.stop();if(config.major){await dialogue.play([{speaker:config.title,title:`Órgão maior • Andar ${config.floor}`,portrait:asset("skills/colecao_separada_sem_fundo/10_circulo_de_invocacao_de_fogo.webp"),text:"Eu fui uma resposta antes de você decidir que doía demais. Agora sou a pergunta que fecha esta passagem."},{speaker:ROUTES[state.route].name,title:ROUTES[state.route].title,portrait:heroArt(),text:state.route==="lucas"?"Uma memória pode exigir reconhecimento. Não pode exigir vítimas para continuar existindo.":"Você cresceu da dor de dois mestres e concluiu que isso fazia de você um trono. Concluiu errado."}],null,`tower-boss-${state.tower.activeRun.seed}-${config.floor}-${entity.id}`);}showScreen("battle-screen");combat.startTowerEncounter({...config,id:entity.id});}

async function handleTowerVictory(result) {
  const run=state.tower.activeRun;if(!run)return;const carneBase=towerCurrencyGain(result.towerCurrency);state.currency+=result.currency;run.resources.ecos+=result.currency;run.resources.towerCurrency+=carneBase;const leveled=addXp(state,result.xp);if(leveled)toast("Nível aumentado",`Você alcançou o nível ${state.level} dentro da ferida.`,"good");towerEngine.markEncounterCleared(result.config.id);delete run.pendingEncounter;
  result.enemyIds.forEach((id,index)=>{const region=result.config.enemyRegions?.[index]??result.config.family?.region??0,mutation=result.config.modifier?.name||result.config.mutation?.name||null;let entry=state.bestiary.find((item)=>item.id===id&&item.region===region&&item.towerMutation===mutation);if(entry)entry.count=(entry.count||1)+1;else state.bestiary.push({id,region,boss:Boolean(result.config.elite),name:NORMAL_DISPLAY[id]||id.replaceAll("_"," "),tower:true,towerMutation:mutation,count:1});});
  let extraCarne=0;if(result.config.elite){addInventory(state,result.config.major?"remedy":"potion",1);extraCarne=run.upgrades.includes("elite")?towerCurrencyGain(1):0;run.resources.towerCurrency+=extraCarne;if(state.tower.permanentUpgrades.reliquias){const region=REGIONS[result.config.family?.region??result.config.enemyRegions?.[0]??0];state.materials[region.key]+=1;run.resources.materials+=1;}}saveGame(state,"auto");showScreen("exploration-screen");setWeather();towerEngine.resume();audio.startTowerAmbient?.(towerEngine.floor.familyIndex,towerEngine.floor.floor,towerEngine.floor.floor%10===0);updateHud(true);toast(result.config.major?"Órgão maior vencido":"Eco reabsorvido",`${result.xp} EXP • ${result.currency} Ecos • ${carneBase+extraCarne} Carne da Voz`,"good");
}

async function chooseTowerUpgrade() {
  const run=state.tower.activeRun,count=3+Math.min(2,Number(state.tower.permanentUpgrades["escolha-extra"]||0)),start=hashString(`${run.seed}|recompensa|${run.floor}`)%TOWER_RUN_UPGRADES.length,options=[];for(let index=0;options.length<count;index++){const upgrade=TOWER_RUN_UPGRADES[(start+index*5)%TOWER_RUN_UPGRADES.length];if(!options.includes(upgrade))options.push(upgrade);}
  return new Promise((resolve)=>{modalLayer.hidden=false;modalLayer.innerHTML=`<section class="tower-reward-modal" role="dialog" aria-modal="true" aria-label="Escolha uma mutação temporária"><header><small>A TORRE OFERECE TRÊS RESPOSTAS</small><h2>Escolha uma mutação para esta incursão</h2><p>A melhoria desaparece quando a incursão terminar.</p></header><div class="tower-reward-grid">${options.map((upgrade)=>`<button data-run-upgrade="${upgrade.id}"><i aria-hidden="true"></i><small>MUTAÇÃO TEMPORÁRIA</small><strong>${upgrade.name}</strong><span>${upgrade.description}</span></button>`).join("")}</div></section>`;modalLayer.querySelectorAll("[data-run-upgrade]").forEach((button)=>button.addEventListener("click",()=>{run.upgrades.push(button.dataset.runUpgrade);audio.reward?.();modalLayer.hidden=true;modalLayer.innerHTML="";towerEngine.syncRun();saveGame(state,"auto");resolve(button.dataset.runUpgrade);}));});
}

async function advanceTowerFloor(floor) {
  const run=state.tower.activeRun;if(!run||!floor.objective.completed)return;run.resources.towerCurrency+=towerCurrencyGain(1+Math.floor(floor.floor/10));state.tower.bestFloor=Math.max(state.tower.bestFloor,floor.floor);if(floor.floor%10===0){const entry=`orgao-maior-${floor.floor}`;if(!state.tower.codexEntries.includes(entry))state.tower.codexEntries.push(entry);}towerEngine.syncRun();saveGame(state,"auto");if(floor.floor%3===0)await chooseTowerUpgrade();run.floor+=1;run.floorSeed=null;run.playerPosition=null;run.clearedEncounters=[];run.openedChests=[];run.activatedAltars=[];run.completedEvents=[];run.activatedObjectives=[];run.explored=[];run.currentObjective=null;delete run.pendingEncounter;saveGame(state,"auto");fade.classList.add("tower-transition");await new Promise((resolve)=>setTimeout(resolve,state.settings.reducedMotion?40:620));await towerEngine.enterFloor(run,{announce:true});fade.classList.remove("tower-transition");updateHud(true);saveGame(state,"auto");
}

function handleTowerDefeat() {
  const run=state.tower.activeRun,revives=(run.upgrades||[]).filter((id)=>id==="renascer").length;if(run.revivesUsed<revives){run.revivesUsed+=1;state.hp=Math.max(1,Math.round(getPlayerStats(state).hp*.42));state.focus=Math.round(getPlayerStats(state).focus*.3);["eliara","dagra"].forEach((id)=>state.companions[id].hp=Math.max(1,Math.round(state.companions[id].maxHp*.35)));towerEngine.encounterCooldown=1.8;saveGame(state,"auto");showScreen("exploration-screen");towerEngine.resume();toast("Lembrança de Forma consumida","O grupo retornou ao último corredor uma única vez.","good");return;}
  const floor=run.floor,kept=retainTowerCurrency(run,true);restoreTowerEntryVitals(run);state.tower.bestFloor=Math.max(state.tower.bestFloor,Math.max(0,floor-1));state.tower.activeRun=null;state.gameMode="world";towerEngine.deactivate();audio.towerDeath?.();saveGame(state,"auto");renderTowerEntrance();showScreen("tower-entrance-screen");toast("A torre encerrou a incursão",`Maior andar: ${state.tower.bestFloor}. ${kept} Carne da Voz foi preservada.`,"bad");
}

function startBattle(type) {
  saveGame(state,"auto");interactionPrompt.hidden=true;exploration.stop();showScreen("battle-screen");combat.start(state.regionIndex,type);
}

async function handleVictory(result) {
  if(result.tower)return handleTowerVictory(result);
  if(result.finalEnding)return showEnding(result.finalEnding);
  const region=result.region,type=result.encounterType,towerWasUnlocked=state.tower.unlocked;
  state.currency+=result.currency;const leveled=addXp(state,result.xp);if(leveled)toast("Nível aumentado",`Você alcançou o nível ${state.level}.`,"good");
  const materialGain=type==="normal"?1:type==="miniboss"?2:3;state.materials[region.key]+=materialGain;showQuestUpdate(updateQuest(state,`side-${region.id}`,materialGain));
  const defeated=state.defeated[region.key];if(!defeated.includes(type)){defeated.push(type);showQuestUpdate(updateQuest(state,`main-${region.id}`,1));}
  if(type==="normal")showQuestUpdate(updateQuest(state,`hunt-${region.id}`,1));
  result.enemyIds.forEach((id)=>{let entry=state.bestiary.find((item)=>item.id===id&&item.region===region.id);if(entry)entry.count=(entry.count||1)+1;else state.bestiary.push({id,region:region.id,boss:type!=="normal",name:NORMAL_DISPLAY[id]});});
  if(type!=="normal")addInventory(state,type==="boss2"?"remedy":"potion",1);
  if(type==="boss2"&&!state.completedRegions.includes(region.id)){
    state.completedRegions.push(region.id);state.primeCommands.push(region.command);state.fracture=Math.min(100,state.fracture+8);state.resonance=Math.min(100,state.resonance+3);state.authority=state.maxAuthority;
    const unlocked=FORMS.filter((form)=>form.unlock===region.id+1);unlocked.forEach((form)=>{if(!state.unlockedForms.includes(form.id))state.unlockedForms.push(form.id);});if(unlocked[0]&&!state.secondaryForm)state.secondaryForm=unlocked[0].id;
    if(region.id%2===1)state.maxAuthority=Math.min(8,state.maxAuthority+1);
    const newSkill=(ROUTES[state.route].commands.length+region.id)%2?"summon":"fracture";if(region.id>=4&&!state.learnedSkills.includes(newSkill))state.learnedSkills.push(newSkill);
    if(region.id===0)addInventory(state,"relic_prime",1);
  }
  if(!towerWasUnlocked&&(state.primeCommands.length>=1||state.ngPlus)){state.tower.unlocked=true;toast("A Torre da Carne despertou","Uma nova ferida apareceu no mapa-múndi e nas regiões descobertas.","bad");}
  saveGame(state,"auto");showScreen("exploration-screen");setWeather();await exploration.loadRegion(region.id,false);updateHud(true);
  if(type==="boss2")await resolveRegion(region);else{toast("Vitória registrada",`${result.xp} EXP • ${result.currency} Ecos • ${materialGain} ${region.material}`,"good");exploration.resume();}
}

async function resolveRegion(region) {
  exploration.stop();const route=ROUTES[state.route],rival=ROUTES[route.rivalRoute];
  await dialogue.play([
    {speaker:"Fragmento GPT",title:"Vínculo da Fratura",portrait:asset("skills/colecao_separada_sem_fundo/10_circulo_de_invocacao_de_fogo.webp"),text:`Comando Primordial recuperado: ${region.command}. Potência compartilhada com o fragmento rival.`},
    {speaker:rival.name,title:"Eco involuntário",portrait:rivalArt(),text:state.route==="lucas"?"Obrigado pela força nova. Eu teria dito isso com mais carinho, mas você classificou carinho como variável inútil.":"Senti sua vitória, Timbó. Você continua confundindo controle com prova de que está certo."}
  ],null,`prime-${region.key}`);
  const choice=await dialogue.play([{speaker:region.npc,title:"Consequência",portrait:region.id%2?COMPANIONS.dagra.portrait:COMPANIONS.eliara.portrait,text:region.choice.question}],
    [{label:region.choice.order,value:"order",description:"Prioriza estrutura, controle e estabilidade."},{label:region.choice.will,value:"will",description:"Prioriza força, velocidade e autoridade pessoal."},{label:region.choice.free,value:"free",description:"Recusa os dois absolutos e aceita o risco da escolha."}],`choice-${region.key}`);
  state.choices[region.key]=choice;state.philosophy[choice]=(state.philosophy[choice]||0)+1;
  if(choice==="order"){state.fracture=Math.min(100,state.fracture+3);state.resonance=Math.min(100,state.resonance+3);state.companions.eliara.loyalty=Math.max(0,state.companions.eliara.loyalty-1);}
  if(choice==="will"){state.fracture=Math.min(100,state.fracture+5);state.resonance=Math.min(100,state.resonance+5);state.companions.dagra.loyalty=Math.min(100,state.companions.dagra.loyalty+2);}
  if(choice==="free"){state.fracture=Math.max(0,state.fracture-2);state.resonance=Math.max(0,state.resonance-3);state.companions.eliara.loyalty=Math.min(100,state.companions.eliara.loyalty+4);state.companions.dagra.loyalty=Math.min(100,state.companions.dagra.loyalty+4);}
  if(region.id<9){const next=region.id+1;if(!state.discoveredRegions.includes(next))state.discoveredRegions.push(next);unlockRegionQuests(state,next);toast("Portal estabilizado",`${REGIONS[next].name} agora pode ser alcançada.`,"good");exploration.buildEntities();exploration.resume();}
  else {toast("Os dez Comandos estão reunidos","O Templo entre Palavras aguarda a última escolha.","good");saveGame(state,"auto");ui.showFinalChoice();}
  saveGame(state,"auto");updateHud(true);
}

function enterPortal() {
  if(transitioning)return;
  const region=REGIONS[state.regionIndex];if(!state.completedRegions.includes(region.id))return;
  if(region.id===9){exploration.stop();return ui.showFinalChoice();}
  transitionRegion(region.id+1);
}

async function transitionRegion(index) {
  if(transitioning||!state.discoveredRegions.includes(index))return;transitioning=true;state.gameMode="world";towerEngine.deactivate();exploration.stop();fade.classList.add("on");await new Promise((r)=>setTimeout(r,430));state.regionIndex=index;showScreen("exploration-screen");setWeather();await exploration.loadRegion(index,true);locationAnnouncement();saveGame(state,"auto");fade.classList.remove("on");transitioning=false;exploration.resume();toast(REGIONS[index].name,REGIONS[index].objective,"good");
}

function leaveBattle(result={}) {if(result?.tower||state.gameMode==="tower"){showScreen("exploration-screen");setWeather();towerEngine.resume();audio.startTowerAmbient?.(towerEngine.floor.familyIndex,towerEngine.floor.floor,towerEngine.floor.floor%10===0);saveGame(state,"auto");return;}showScreen("exploration-screen");setWeather();exploration.resume();audio.startAmbient(state.regionIndex);}

function handleDefeat(result={}) {
  if(result.tower)return handleTowerDefeat();
  modalLayer.hidden=false;modalLayer.innerHTML=`<section class="game-modal" style="grid-template-columns:1fr;height:auto;max-width:620px;margin-top:18vh"><div class="modal-body"><div class="choice-altar"><p class="eyebrow">A realidade rejeitou esta versão</p><h2>O fragmento perdeu a forma</h2><p>Retorne ao salvamento automático feito antes da batalha ou abandone esta linha do tempo.</p><div style="display:flex;justify-content:center;gap:.6rem"><button class="primary-button" data-retry>Tentar novamente</button><button class="text-button" data-defeat-title>Voltar ao título</button></div></div></div></section>`;
  modalLayer.querySelector("[data-retry]").addEventListener("click",()=>{const saved=loadGame("auto");if(saved){state=saved;modalLayer.hidden=true;modalLayer.innerHTML="";beginGame(false);}});
  modalLayer.querySelector("[data-defeat-title]").addEventListener("click",()=>{modalLayer.hidden=true;modalLayer.innerHTML="";showTitle();});
}

function startFinalBattle(ending) {
  state.pendingEnding=ending;modalLayer.hidden=true;modalLayer.innerHTML="";saveGame(state,"auto");showScreen("battle-screen");combat.start(9,"boss2",ending);
}

function showEnding(endingId) {
  const ending=ENDINGS[endingId],route=ROUTES[state.route];state.completed=true;state.pendingEnding=null;state.flags.ending=endingId;
  const meta=loadMeta();meta.ngPlus=true;if(!meta.endings.includes(endingId))meta.endings.push(endingId);meta.codexLegacy=[...new Set([...meta.codexLegacy,...state.codex])];saveMeta(meta);saveGame(state,"auto");
  showScreen("ending-screen");audio.stopAmbient();audio.victory();
  document.querySelector("#ending-kicker").textContent=ending.kicker;document.querySelector("#ending-title").textContent=ending.title;document.querySelector("#ending-text").textContent=ending.text;document.querySelector("#ending-epilogue").innerHTML=ending.epilogue.map((text)=>`<span>${text}</span>`).join("");
  document.querySelector("#ending-protagonist").src=heroArt();document.querySelector("#ending-rival").src=rivalArt();
  const screen=document.querySelector("#ending-screen");screen.style.setProperty("--gold",ending.palette[2]);screen.style.background=`radial-gradient(circle at 50% 42%,${ending.palette[1]}55,transparent 34%),#05030a`;
}

function resizeWorldCanvas() {
  const rect=worldCanvas.parentElement.getBoundingClientRect();if(rect.width<1||rect.height<1)return;const width=Math.max(640,Math.round(rect.width)),height=Math.max(360,Math.round(rect.height));if(worldCanvas.width!==width||worldCanvas.height!==height){worldCanvas.width=width;worldCanvas.height=height;const context=worldCanvas.getContext("2d",{alpha:false});context.imageSmoothingEnabled=false;exploration.ctx=context;towerEngine.ctx=context;}
}

function bindUI() {
  document.querySelector('[data-action="new-game"]').addEventListener("click",()=>{audio.confirm();ngPlusPending=false;startVideoPrologue("new-game");});
  document.querySelector('[data-action="continue"]').addEventListener("click",()=>{audio.confirm();continueGame();});
  document.querySelector('[data-action="new-game-plus"]').addEventListener("click",()=>{audio.confirm();ngPlusPending=true;startVideoPrologue("new-game");});
  document.querySelector('[data-action="load-game"]').addEventListener("click",()=>openTitleMenu("save"));
  document.querySelector('[data-action="replay-prologue"]').addEventListener("click",()=>{audio.confirm();startVideoPrologue("replay");});
  document.querySelector('[data-action="settings"]').addEventListener("click",()=>openTitleMenu("settings"));
  prologueVideo.addEventListener("ended",()=>finishVideoPrologue(false));
  prologueVideo.addEventListener("error",()=>{console.error("[Prólogo] Não foi possível reproduzir o vídeo configurado.");finishVideoPrologue(false);});
  prologueVideoPlay.addEventListener("click",()=>{prologueVideoPlay.hidden=true;prologueVideo.play().catch(()=>{prologueVideoPlay.hidden=false;});});
  prologueVideoSkip.addEventListener("pointerdown",beginVideoSkipHold);
  ["pointerup","pointercancel","lostpointercapture"].forEach((type)=>prologueVideoSkip.addEventListener(type,cancelVideoSkipHold));
  prologueVideoSkip.addEventListener("keydown",(event)=>{if(!event.repeat&&(event.code==="Space"||event.code==="Enter"))beginVideoSkipHold(event);});
  prologueVideoSkip.addEventListener("keyup",(event)=>{if(event.code==="Space"||event.code==="Enter")cancelVideoSkipHold();});
  prologueVideoSkip.addEventListener("blur",()=>cancelVideoSkipHold());
  prologueVideoSkip.addEventListener("contextmenu",(event)=>event.preventDefault());
  document.querySelector('[data-action="next-prologue"]').addEventListener("click",()=>nextPrologue(false));
  document.querySelector('[data-action="skip-prologue"]').addEventListener("click",()=>finishPrologue());
  document.querySelector("#prologue-speed").addEventListener("change",()=>schedulePrologue());
  document.querySelectorAll(".route-card[data-route]").forEach((card)=>card.addEventListener("click",()=>chooseRoute(card.dataset.route)));
  document.querySelectorAll("[data-variant]").forEach((button)=>button.addEventListener("click",()=>{variantPending=normalizeVisualVariant(button.dataset.variant);audio.ui();renderVariantSelection();}));
  document.querySelector('[data-action="confirm-variant"]').addEventListener("click",()=>{audio.confirm();confirmVariant();});
  document.querySelector('[data-action="back-route"]').addEventListener("click",()=>showScreen("route-screen"));
  document.querySelector('[data-action="back-title"]').addEventListener("click",()=>showTitle());
  document.querySelector('[data-action="pause"]').addEventListener("click",()=>pauseGame("status"));
  document.querySelectorAll(".game-toolbar [data-menu]").forEach((button)=>button.addEventListener("click",()=>pauseGame(button.dataset.menu)));
  document.querySelector('[data-action="interact"]').addEventListener("click",()=>activeEngine().interact());
  const run=document.querySelector('[data-action="run"]');run.addEventListener("pointerdown",(event)=>{event.preventDefault();run.setPointerCapture?.(event.pointerId);run.classList.add("active");run.setAttribute("aria-pressed","true");activeEngine().setSprint(true);});["pointerup","pointercancel","lostpointercapture"].forEach((type)=>run.addEventListener(type,()=>{run.classList.remove("active");run.setAttribute("aria-pressed","false");exploration.setSprint(false);towerEngine.setSprint(false);}));
  document.querySelector('[data-action="tower-enter"]').addEventListener("click",()=>{audio.portal?.();startNewTowerRun();});
  document.querySelector('[data-action="tower-continue"]').addEventListener("click",()=>{audio.portal?.();continueTowerRun(true);});
  document.querySelector('[data-action="tower-abandon"]').addEventListener("click",()=>abandonTowerRun());
  document.querySelector('[data-action="tower-return"]').addEventListener("click",()=>returnToWorld());
  document.querySelector('[data-action="ending-title"]').addEventListener("click",()=>showTitle());
  document.querySelectorAll("[data-dir]").forEach((button)=>{const direction=button.dataset.dir;button.addEventListener("pointerdown",(event)=>{event.preventDefault();activeEngine().setTouchDirection(direction,true);});["pointerup","pointercancel","pointerleave"].forEach((type)=>button.addEventListener(type,()=>{exploration.setTouchDirection(direction,false);towerEngine.setTouchDirection(direction,false);}));});
  window.addEventListener("keydown",(event)=>{if(event.code==="Escape"&&currentScreen==="exploration-screen"&&modalLayer.hidden&&dialogueLayer.hidden)pauseGame("status");});
  window.addEventListener("blur",()=>cancelVideoSkipHold());
  document.addEventListener("visibilitychange",()=>{if(document.hidden)cancelVideoSkipHold();});
  new ResizeObserver(()=>resizeWorldCanvas()).observe(worldCanvas.parentElement);
}

setInterval(()=>{if(state&&!state.flags?.draft&&["exploration-screen","battle-screen"].includes(currentScreen))state.playTime=(state.playTime||0)+1;},1000);

bindUI();bootstrap().catch((error)=>{console.error(error);loadingLabel.textContent="A Voz falhou ao despertar. Recarregue a página.";loadingBar.style.width="100%";});
