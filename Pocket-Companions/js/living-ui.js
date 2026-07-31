import {
  CONDITIONS, INGREDIENTS, RECIPES, GROOMING, COMMANDS, SKILL_PATHS, LIFE_STAGES, WALK_LOCATIONS, SECRETS,
  FURNITURE, ACCESSORIES, EVENTS, EVENT_MISSIONS, DREAMS, WEATHER_TYPES, SEASONS, SHAMPOOS
} from './living-systems.js';
import { PETS } from './config.js';
import { getLanguage } from './i18n.js';

const L = (en, pt) => getLanguage() === 'en' ? en : pt;
const loc = (value) => typeof value === 'string' ? value : (getLanguage() === 'en' ? value?.en : value?.pt) || value?.en || '';
const pct = (value) => `${Math.round(value)}%`;
const button = (label, onClick, { disabled = false, className = 'button button-secondary' } = {}) => {
  const item = document.createElement('button'); item.type = 'button'; item.className = className; item.textContent = label; item.disabled = disabled; item.addEventListener('click', onClick); return item;
};

const LIFE_GROUPS = [
  {
    id: 'companion',
    label: () => L('Companion', 'Companheiro'),
    features: [
      ['overview', () => L('Living profile', 'Perfil vivo')],
      ['personality', () => L('Personality & preferences', 'Personalidade e preferências')],
      ['social', () => L('Relationships & body language', 'Relações e linguagem corporal')]
    ]
  },
  {
    id: 'growth',
    label: () => L('Care & growth', 'Cuidado e evolução'),
    features: [
      ['health', () => L('Health & clinic', 'Saúde e clínica')],
      ['kitchen', () => L('Cooking', 'Culinária')],
      ['grooming', () => L('Grooming', 'Higiene')],
      ['training', () => L('Training', 'Treinamento')],
      ['skills', () => L('Skill tree', 'Árvore de habilidades')]
    ]
  },
  {
    id: 'world',
    label: () => L('World & discovery', 'Mundo e descobertas'),
    features: [
      ['walks', () => L('Walks, scents & secrets', 'Passeios, faro e segredos')],
      ['world', () => L('Weather & seasons', 'Clima e estações')],
      ['decor', () => L('Decoration', 'Decoração')],
      ['style', () => L('Accessories', 'Acessórios')]
    ]
  },
  {
    id: 'story',
    label: () => L('Story & memories', 'História e memórias'),
    features: [
      ['quest', () => L('Story quests', 'Missões de história')],
      ['memories', () => L('Memory album', 'Álbum de memórias')],
      ['dreams', () => L('Dreams', 'Sonhos')],
      ['events', () => L('Events & challenges', 'Eventos e desafios')]
    ]
  }
];

export class LivingUI {
  constructor({ systems, store, scene, toast, showDialogue, playSound, refreshMain, openGame }) {
    this.systems = systems; this.store = store; this.scene = scene; this.toast = toast; this.showDialogue = showDialogue;
    this.playSound = playSound; this.refreshMain = refreshMain; this.openGame = openGame; this.tab = 'overview'; this.container = null;
    this.groomChallenge = null; this.dreamScore = 0; this.memoryFilter = 'all'; this.memoryLimit = 16;
    this.scrollPositions = new Map();
    this.lastFeatureByGroup = new Map(LIFE_GROUPS.map((group) => [group.id, group.features[0][0]]));
  }

  groupFor(tab) {
    return LIFE_GROUPS.find((group) => group.features.some(([id]) => id === tab)) || LIFE_GROUPS[0];
  }

  featureLabel(tab) {
    for (const group of LIFE_GROUPS) {
      const feature = group.features.find(([id]) => id === tab);
      if (feature) return feature[1]();
    }
    return tab;
  }

  render(container, tab = this.tab, { preserveScroll = false, focusContent = false } = {}) {
    if (!container) return;
    const previousTab = this.tab;
    if (this.container === container && previousTab && container.dataset.lifeFeature === previousTab) this.scrollPositions.set(previousTab, container.scrollTop);
    this.container = container;
    this.tab = this.groupFor(tab).features.some(([id]) => id === tab) ? tab : 'overview';
    const group = this.groupFor(this.tab);
    this.lastFeatureByGroup.set(group.id, this.tab);
    this.systems.ensure();
    container.innerHTML = '';
    container.dataset.lifeFeature = this.tab;

    const navigation = document.createElement('nav');
    navigation.className = 'living-navigation';
    navigation.setAttribute('aria-label', L('Life navigation', 'Navegação de Vida'));

    const categoryRail = document.createElement('div');
    categoryRail.className = 'living-category-rail';
    categoryRail.setAttribute('role', 'tablist');
    LIFE_GROUPS.forEach((item) => {
      const selected = item.id === group.id;
      const control = button(item.label(), () => {
        const next = this.lastFeatureByGroup.get(item.id) || item.features[0][0];
        this.render(container, next, { focusContent: true });
      }, { className: `living-category ${selected ? 'is-active' : ''}` });
      control.setAttribute('role', 'tab');
      control.setAttribute('aria-selected', String(selected));
      control.dataset.group = item.id;
      categoryRail.append(control);
    });

    const featureRow = document.createElement('div');
    featureRow.className = 'living-feature-row';
    const featureLabel = document.createElement('label');
    featureLabel.className = 'living-feature-select-label';
    featureLabel.textContent = L('Current page', 'Página atual');
    const featureSelect = document.createElement('select');
    featureSelect.id = 'living-feature-select';
    featureSelect.name = 'livingFeature';
    featureSelect.className = 'living-feature-select';
    featureSelect.setAttribute('aria-label', L('Choose a Life page', 'Escolha uma página de Vida'));
    group.features.forEach(([id, label]) => {
      const option = document.createElement('option'); option.value = id; option.textContent = label(); option.selected = id === this.tab; featureSelect.append(option);
    });
    featureSelect.addEventListener('change', () => this.render(container, featureSelect.value, { focusContent: true }));
    featureLabel.append(featureSelect);

    const featureList = document.createElement('div');
    featureList.className = 'living-feature-list';
    featureList.setAttribute('role', 'tablist');
    group.features.forEach(([id, label]) => {
      const selected = id === this.tab;
      const control = button(label(), () => this.render(container, id, { focusContent: true }), { className: `living-feature ${selected ? 'is-active' : ''}` });
      control.setAttribute('role', 'tab');
      control.setAttribute('aria-selected', String(selected));
      featureList.append(control);
    });
    featureRow.append(featureLabel, featureList);
    navigation.append(categoryRail, featureRow);
    container.append(navigation);

    const body = document.createElement('div');
    body.className = 'living-body';
    body.id = `living-panel-${this.tab}`;
    body.setAttribute('role', 'tabpanel');
    body.setAttribute('aria-label', this.featureLabel(this.tab));
    body.tabIndex = -1;
    container.append(body);
    const renderer = this[`render_${this.tab}`] || this.render_overview;
    renderer.call(this, body);

    const targetScroll = preserveScroll
      ? (this.scrollPositions.get(this.tab) ?? container.scrollTop)
      : (this.scrollPositions.get(this.tab) ?? 0);
    requestAnimationFrame(() => {
      container.scrollTop = Math.min(targetScroll, Math.max(0, container.scrollHeight - container.clientHeight));
      if (focusContent) body.focus({ preventScroll: true });
    });
  }

  heading(root, eyebrow, title, copy = '') {
    const section = document.createElement('section'); section.className = 'drawer-section living-heading';
    section.innerHTML = `<p class="eyebrow">${eyebrow}</p><h3>${title}</h3>${copy ? `<p>${copy}</p>` : ''}`;
    root.append(section); return section;
  }

  card(title, copy = '') { const card = document.createElement('article'); card.className = 'living-card'; card.innerHTML = `<strong>${title}</strong>${copy ? `<p>${copy}</p>` : ''}`; return card; }
  grid(root) { const grid = document.createElement('div'); grid.className = 'living-grid'; root.append(grid); return grid; }
  refresh(message = null) {
    if (message) this.toast(message);
    this.store.persist();
    this.refreshMain?.();
    this.render(this.container, this.tab, { preserveScroll: true });
  }

  updateLiveData() {
    if (!this.container || !this.container.isConnected || this.container.dataset.lifeFeature !== this.tab) return;
    const state = this.systems.state;
    const summary = this.systems.profileSummary();
    const values = {
      emotion: summary.emotion,
      weather: this.worldName(summary.weather),
      season: this.seasonName(summary.season),
      stage: summary.stage,
      hydration: pct(state.hydration),
      memories: String(state.longTermMemories.length),
      skillPoints: String(state.skills.points),
      preferences: String(Object.values(state.preferences).filter((item) => item.status === 'confirmed').length)
    };
    this.container.querySelectorAll('[data-living-bind]').forEach((element) => {
      const value = values[element.dataset.livingBind];
      if (value !== undefined && element.textContent !== value) element.textContent = value;
    });
  }

  render_overview(root) {
    const slot = this.store.active, state = this.systems.state, summary = this.systems.profileSummary();
    this.heading(root, L('Living companion systems','Sistemas de pet vivo'), `${slot.petName} · ${summary.stage}`, L('Personality, memories, emotions and routines now influence one another.','Personalidade, memórias, emoções e rotina agora influenciam umas às outras.'));
    const hero = this.card(`<span data-living-bind="emotion">${summary.emotion}</span>`, state.emotion.hint || L('Behavior communicates the current emotional state.','O comportamento comunica o estado emocional atual.')); hero.classList.add('living-hero');
    hero.innerHTML += `<div class="living-pills"><span>${L('Weather','Clima')}: <span data-living-bind="weather">${this.worldName(summary.weather)}</span></span><span>${L('Season','Estação')}: <span data-living-bind="season">${this.seasonName(summary.season)}</span></span><span>${L('Stage','Fase')}: <span data-living-bind="stage">${summary.stage}</span></span></div>`; root.append(hero);
    const grid = this.grid(root);
    summary.topTraits.forEach(([trait,value]) => { const card=this.card(this.traitName(trait),pct(value)); card.innerHTML += `<div class="living-meter"><i style="width:${value}%"></i></div>`; grid.append(card); });
    const conditions = state.conditions.length ? state.conditions.map((c)=>loc(CONDITIONS[c.id]?.name)).join(', ') : L('No active condition','Nenhuma condição ativa');
    grid.append(this.card(L('Health status','Estado de saúde'),conditions),this.card(L('Hydration','Hidratação'),`<span data-living-bind="hydration">${pct(state.hydration)}</span>`),this.card(L('Confirmed preferences','Preferências confirmadas'),`<span data-living-bind="preferences">${Object.values(state.preferences).filter((p)=>p.status==='confirmed').length}</span>`),this.card(L('Long-term memories','Memórias de longo prazo'),`<span data-living-bind="memories">${state.longTermMemories.length}</span>`),this.card(L('Skill points','Pontos de habilidade'),`<span data-living-bind="skillPoints">${state.skills.points}</span>`));
    const actions = document.createElement('div'); actions.className='living-actions';
    actions.append(button(L('Ask for a thought','Ouvir um pensamento'),()=>{ const memory=state.longTermMemories.slice().sort((a,b)=>(b.salience*b.reinforcement)-(a.salience*a.reinforcement))[0]; this.showDialogue(memory?this.memoryThought(memory):L('I wonder what we will discover next.','O que será que vamos descobrir agora?'),2); }),button(L('Use a learned command','Usar um comando aprendido'),()=>this.render(this.container,'training')),button(L('Follow a scent','Seguir um cheiro'),()=>{const result=this.systems.scentSearch();this.refresh(result.found?L('A real navigable scent trail revealed a secret.','Uma trilha navegável revelou um segredo.'):L('No strong scent this time.','Nenhum cheiro forte desta vez.'));}));
    root.append(actions);
    this.renderWeekly(root);
    this.renderCalendar(root);
  }

  render_personality(root) {
    const state = this.systems.state;
    const traits = Object.entries(state.personality).sort((a, b) => b[1] - a[1]);
    const confirmed = Object.entries(state.preferences).filter(([, pref]) => pref.status === 'confirmed');
    this.heading(root, L('Evolving personality', 'Personalidade evolutiva'), L('A clear snapshot first', 'Um resumo claro primeiro'), L('Open the detailed lists only when you need them. Repeated care is damped to prevent button-spam exploitation.', 'Abra as listas detalhadas apenas quando precisar. Cuidados repetidos são amortecidos para evitar exploração por spam.'));

    const summary = this.card(L('Current personality signature', 'Assinatura atual da personalidade'), traits.slice(0, 3).map(([trait, value]) => `${this.traitName(trait)} ${pct(value)}`).join(' · '));
    summary.classList.add('living-summary-card');
    root.append(summary);

    const traitDetails = document.createElement('details');
    traitDetails.className = 'living-disclosure';
    traitDetails.innerHTML = `<summary>${L('View all personality traits', 'Ver todos os traços de personalidade')}</summary>`;
    const grid = this.grid(traitDetails);
    traits.forEach(([trait, value]) => { const card = this.card(this.traitName(trait), this.traitEffect(trait)); card.innerHTML += `<div class="living-meter"><i style="width:${value}%"></i></div><small>${pct(value)}</small>`; grid.append(card); });
    root.append(traitDetails);

    const preferenceSummary = this.card(L('Preferences', 'Preferências'), `${confirmed.length} ${L('confirmed', 'confirmadas')} · ${Object.values(state.preferences).filter((pref) => pref.status === 'suspected').length} ${L('suspected', 'suspeitas')}`);
    preferenceSummary.classList.add('living-summary-card');
    root.append(preferenceSummary);

    const preferenceDetails = document.createElement('details');
    preferenceDetails.className = 'living-disclosure';
    preferenceDetails.innerHTML = `<summary>${L('Explore preference details', 'Explorar detalhes das preferências')}</summary>`;
    const prefGrid = this.grid(preferenceDetails);
    Object.entries(state.preferences).forEach(([key, pref]) => { const status = pref.status === 'confirmed' ? L('Confirmed', 'Confirmada') : pref.status === 'suspected' ? L('Suspected', 'Suspeita') : L('Unknown', 'Desconhecida'); const value = pref.status === 'unknown' ? '???' : this.preferenceValue(pref.value); const card = this.card(this.preferenceName(key), `${status} · ${value}`); card.innerHTML += `<div class="living-meter"><i style="width:${pref.confidence}%"></i></div>`; prefGrid.append(card); });
    root.append(preferenceDetails);
  }

  render_health(root) {
    const state=this.systems.state; this.heading(root,L('Pocket veterinary clinic','Clínica veterinária de bolso'),L('Observe, diagnose, care','Observe, diagnostique e cuide'),L('This is simplified fictional game information, never real veterinary advice.','Este conteúdo é fictício e simplificado, nunca orientação veterinária real.'));
    const clinic=this.card(L('Reception and health history','Recepção e histórico de saúde'),`${L('Visits','Consultas')}: ${state.clinic.visits} · ${L('Hydration','Hidratação')}: <span data-living-bind="hydration">${pct(state.hydration)}</span>. ${L('The clinic records diagnoses and recoveries without pet death or irreversible punishment.','A clínica registra diagnósticos e recuperações sem morte ou punição irreversível.')}`);
    const clinicActions=document.createElement('div');clinicActions.className='living-actions';
    clinicActions.append(button(L('Visit clinic','Visitar clínica'),async()=>{await this.systems.visitClinic();this.refresh(L('Arrived at the procedural veterinary clinic.','Chegou à clínica veterinária procedural.'));}),button(L('Return home','Voltar para casa'),()=>{this.systems.returnHome();this.refresh();}),button(L('Start diagnostic minigame','Iniciar minijogo de diagnóstico'),()=>this.renderDiagnosis(clinic)));
    clinic.append(clinicActions); root.append(clinic);
    const preventive=this.card(L('Preventive care','Cuidado preventivo'),L('A gentle fictional check-up costs 28 coins and has a three-day cooldown.','Um check-up fictício e gentil custa 28 moedas e tem intervalo de três dias.'));
    preventive.append(button(L('Weight check','Verificar peso'),()=>{const result=this.systems.weightCheck();this.refresh(`${L('Weight tendency','Tendência de peso')}: ${result.tendency}/100`);}),button(L('Preventive appointment','Consulta preventiva'),()=>{const result=this.systems.preventiveCare();this.refresh(result.ok?L('Preventive care completed.','Cuidado preventivo concluído.'):result.reason==='coins'?L('Not enough coins.','Moedas insuficientes.'):L('This check-up is still on cooldown.','Este check-up ainda está em intervalo.'));}));root.append(preventive);
    const grid=this.grid(root);
    if(!state.conditions.length) grid.append(this.card(L('Comfortable today','Confortável hoje'),L('Preventive care and rest still help.','Cuidados preventivos e descanso continuam ajudando.')));
    state.conditions.forEach((condition)=>{const data=CONDITIONS[condition.id];const card=this.card(loc(data.name),`${loc(data.symptoms)} · ${L('Severity','Gravidade')} ${Math.round(condition.severity)}%`);card.innerHTML+=`<div class="living-meter danger"><i style="width:${condition.severity}%"></i></div>`;grid.append(card);});
    const history=this.card(L('Health history','Histórico de saúde'),state.healthHistory.length?state.healthHistory.slice(-5).map((entry)=>loc(CONDITIONS[entry.id]?.name)||({preventive:L('Preventive care','Cuidado preventivo')}[entry.id])||entry.id).join(' · '):L('No recorded visits yet.','Nenhuma consulta registrada.'));root.append(history);
  }

  renderDiagnosis(card) {
    const result=this.systems.diagnose(); card.querySelector('.diagnostic-game')?.remove(); const game=document.createElement('div');game.className='diagnostic-game';
    if(result.healthy){game.innerHTML=`<p>${result.text}</p>`;card.append(game);return;}
    game.innerHTML=`<p><strong>${result.name}</strong></p><p>${result.symptoms}</p><p>${L('Choose the most appropriate gentle care:','Escolha o cuidado gentil mais adequado:')}</p>`;
    const options=['rest','water','bath','brush','balanced-meal','paw-clean','calm-affection','medicine']; const controls=document.createElement('div');controls.className='living-actions';
    options.forEach((care)=>controls.append(button(this.careName(care),()=>{const effective=this.systems.treatCondition(care);this.refresh(effective?L('The care matched the clues and recovery progressed.','O cuidado combinou com as pistas e a recuperação avançou.'):L('That did not match the main clues. Try a gentler alternative.','Isso não combinou com as pistas principais. Tente outra opção.'));}))); game.append(controls);card.append(game);
  }

  render_kitchen(root) {
    const state=this.systems.state; this.heading(root,L('Ingredients and cooking','Ingredientes e culinária'),L('Prepare safe fictional meals','Prepare refeições fictícias seguras'),L('Recipes affect hunger, energy, health, bond and preference discovery.','Receitas afetam fome, energia, saúde, vínculo e descoberta de preferências.'));
    const inventory=this.grid(root);Object.entries(INGREDIENTS).forEach(([id,item])=>{const card=this.card(loc(item.name),`${state.ingredients[id]||0} ${L('owned','no inventário')} · ${item.cost} ${L('coins','moedas')}`);card.append(button(L('Buy ingredient','Comprar ingrediente'),()=>{const ok=this.systems.buyIngredient(id);this.refresh(ok?L('Ingredient added.','Ingrediente adicionado.'):L('Not enough coins.','Moedas insuficientes.'));},{disabled:this.store.active.currency<item.cost}));inventory.append(card);});
    this.heading(root,L('Recipe book','Livro de receitas'),L('Mix, prepare and serve','Misture, prepare e sirva'));
    const recipes=this.grid(root);Object.entries(RECIPES).forEach(([id,recipe])=>{const unlocked=state.recipesUnlocked.includes(id),prepared=state.preparedMeals[id]||0;const needs=Object.entries(recipe.ingredients).map(([ingredient,count])=>`${loc(INGREDIENTS[ingredient].name)} ×${count}`).join(', ');const card=this.card(unlocked?loc(recipe.name):L('Unknown recipe','Receita desconhecida'),unlocked?`${needs} · ${L('Prepared','Prontas')}: ${prepared}`:L('Discover it by cooking and exploring.','Descubra cozinhando e explorando.'));
      if(unlocked){const portion=document.createElement('select');portion.id=`living-portion-${id}`;portion.name=`portion-${id}`;portion.setAttribute('aria-label',L('Portion size','Tamanho da porção'));portion.innerHTML=`<option value="small">${L('Small portion','Porção pequena')}</option><option value="normal" selected>${L('Normal portion','Porção normal')}</option><option value="large">${L('Large portion','Porção grande')}</option>`;card.append(portion,button(L('Cook meal','Preparar refeição'),()=>{const result=this.systems.cook(id);this.refresh(result.ok?L('Meal prepared with no item duplication.','Refeição preparada sem duplicação de itens.'):L('Missing an ingredient.','Falta um ingrediente.'));}),button(L('Serve','Servir'),()=>{const ok=this.systems.serveMeal(id,portion.value);this.refresh(ok?L('Meal served. Portion and reaction were recorded.','Refeição servida. Porção e reação foram registradas.'):L('Prepare this meal first.','Prepare esta refeição primeiro.'));},{disabled:prepared<=0}));} recipes.append(card);});
  }

  render_grooming(root) {
    this.heading(root,L('Expanded grooming','Higiene expandida'),L('Short interactive care','Cuidados interativos curtos'),L('Tolerance, cooldowns, health prevention, personality and memory are connected.','Tolerância, intervalos, prevenção, personalidade e memória estão conectados.'));
    const shampooCard=this.card(L('Shampoo choice','Escolha de shampoo'),L('Each formula slightly changes tolerance, prevention or happiness.','Cada fórmula altera levemente tolerância, prevenção ou felicidade.'));const shampooSelect=document.createElement('select');shampooSelect.id='living-shampoo-select';shampooSelect.name='shampoo';shampooSelect.setAttribute('aria-label',L('Shampoo choice','Escolha de shampoo'));Object.entries(SHAMPOOS).forEach(([id,item])=>{const option=document.createElement('option');option.value=id;option.textContent=loc(item.name);shampooSelect.append(option);});shampooSelect.value=this.systems.state.grooming.shampoo;shampooSelect.addEventListener('change',()=>{this.systems.setShampoo(shampooSelect.value);this.refresh();});shampooCard.append(shampooSelect);root.append(shampooCard);
    const challenge=document.createElement('section');challenge.className='drawer-section grooming-challenge';root.append(challenge);
    if(this.groomChallenge){challenge.innerHTML=`<h3>${loc(GROOMING[this.groomChallenge.action].name)}</h3><p>${L('Complete the gentle sequence:','Complete a sequência delicada:')} ${this.groomChallenge.step+1}/3</p>`;const labels=[L('Approach gently','Aproximar com calma'),L('Keep a steady rhythm','Manter o ritmo'),L('Finish and reward','Finalizar e recompensar')];challenge.append(button(labels[this.groomChallenge.step],()=>{this.groomChallenge.step+=1;if(this.groomChallenge.step>=3){const result=this.systems.groom(this.groomChallenge.action);this.groomChallenge=null;this.refresh(result.ok?(result.success?L('Grooming completed calmly.','Cuidado concluído com calma.'):L('The pet hesitated, but the experience was remembered.','O pet hesitou, mas a experiência foi lembrada.')):L('This action is still on cooldown.','Este cuidado ainda está em intervalo.'));}else this.render(this.container,'grooming');},{className:'button button-primary'}));}
    else challenge.innerHTML=`<p>${L('Choose an action below to begin its three-step interaction.','Escolha uma ação abaixo para iniciar a interação em três etapas.')}</p>`;
    const grid=this.grid(root);Object.entries(GROOMING).forEach(([id,item])=>{const last=this.systems.state.grooming.actions[id]||0;const remaining=Math.max(0,item.cooldown-(Date.now()-last));const card=this.card(loc(item.name),remaining?`${L('Available in','Disponível em')} ${Math.ceil(remaining/60000)} min`:L('Ready','Pronto'));card.append(button(L('Start','Começar'),()=>{this.groomChallenge={action:id,step:0};this.render(this.container,'grooming');},{disabled:remaining>0}));grid.append(card);});
  }

  render_training(root) {
    const state=this.systems.state;this.heading(root,L('Commands and training','Comandos e treinamento'),L('Every pet uses its real animation capability map','Cada pet usa seu mapa real de animações'),L('Missing clips use the closest safe existing animation without changing rigs.','Clipes ausentes usam o fallback seguro mais próximo sem alterar rigs.'));
    const grid=this.grid(root);Object.entries(COMMANDS).forEach(([id,command])=>{const progress=state.commands[id];const level=this.systems.commandLevel(progress.mastery);const animation=this.systems.commandAnimation(id);const card=this.card(loc(command.name),`${L(level,this.commandLevelPt(level))} · ${Math.round(progress.mastery)}% · ${L('clip','clipe')}: ${animation}`);card.innerHTML+=`<div class="living-meter"><i style="width:${progress.mastery}%"></i></div>`;card.append(button(L('Practice','Praticar'),async()=>{const result=await this.systems.train(id);this.refresh(!result.ok?L('More energy is needed.','É preciso mais energia.'):result.success?L('Successful repetition.','Repetição bem-sucedida.'):L('Not yet, but mastery still progressed a little.','Ainda não, mas o domínio avançou um pouco.'));}),button(L('Use now','Usar agora'),()=>{const ok=this.systems.useCommand(id);this.refresh(ok?L('Command used in the room.','Comando usado no ambiente.'):L('Practice until the command reaches Learning.','Pratique até o comando chegar a Aprendendo.'));},{disabled:progress.mastery<28}));grid.append(card);});
  }

  render_skills(root) {
    const state=this.systems.state;this.heading(root,L('Skill tree','Árvore de habilidades'),`${L('Available points','Pontos disponíveis')}: <span data-living-bind="skillPoints">${state.skills.points}</span>`,L('Companion, Athlete and Explorer bonuses change measurable systems.','Bônus de Companheiro, Atleta e Explorador mudam sistemas mensuráveis.'));
    Object.entries(SKILL_PATHS).forEach(([path,skills])=>{const section=this.card(this.skillPathName(path),L('Unlock in order with earned skill points.','Desbloqueie em ordem com pontos conquistados.'));const row=document.createElement('div');row.className='skill-path';skills.forEach((skill,index)=>{const unlocked=state.skills.unlocked.includes(skill.id);const previousOk=index===0||state.skills.unlocked.includes(skills[index-1].id);const node=button(`${unlocked?'✓ ':''}${loc(skill.name)}`,()=>{const ok=this.systems.unlockSkill(skill.id);this.refresh(ok?L('Skill unlocked.','Habilidade desbloqueada.'):L('You need a point and the previous node.','Você precisa de um ponto e do nó anterior.'));},{disabled:unlocked||state.skills.points<=0||!previousOk,className:`skill-node ${unlocked?'is-unlocked':''}`});row.append(node);});section.append(row);root.append(section);});
    root.append(button(`${L('Reset tree','Redefinir árvore')} (${state.skills.freeResets?L('free','grátis'):'60'})`,()=>{const ok=this.systems.resetSkills();this.refresh(ok?L('Skill points were returned.','Os pontos foram devolvidos.'):L('Not enough coins.','Moedas insuficientes.'));}));
  }

  render_quest(root) {
    const quest=this.systems.questData(),state=this.systems.state.quest;this.heading(root,L('Individual story quest','Missão de história individual'),loc(quest.title),L('Choices change reactions and rewards, but never ruin the save.','Escolhas alteram reações e recompensas, mas nunca estragam o save.'));
    const timeline=document.createElement('div');timeline.className='quest-steps';quest.steps.forEach((step,index)=>{const item=this.card(`${index<state.step?'✓':index===state.step?'→':'○'} ${loc(step)}`,index<state.step?L('Completed','Concluída'):index===state.step?L('Current objective','Objetivo atual'):L('Locked by story progress','Bloqueada pela história'));timeline.append(item);});root.append(timeline);
    if(!state.completed&&state.ready){const choices=document.createElement('div');choices.className='living-actions';choices.append(button(L('Respond gently','Responder com carinho'),()=>{this.systems.advanceQuest('gentle');this.refresh(L('The story advanced and a memory was created.','A história avançou e uma memória foi criada.'));},{className:'button button-primary'}),button(L('Respond playfully','Responder brincando'),()=>{this.systems.advanceQuest('playful');this.refresh(L('The story advanced with a playful reaction.','A história avançou com uma reação brincalhona.'));}));root.append(choices);}else if(!state.completed)root.append(this.card(L('Objective in progress','Objetivo em andamento'),L('Complete the highlighted action in normal gameplay. The story will recognize it automatically.','Complete a ação destacada no jogo normal. A história reconhecerá automaticamente.')));else root.append(this.card(L('Quest complete','Missão concluída'),L('The conclusion is preserved in long-term memory and the timeline.','A conclusão foi preservada na memória de longo prazo e na linha do tempo.')));
  }

  render_walks(root) {
    const state=this.systems.state;this.heading(root,L('Walks and explorable locations','Passeios e locais exploráveis'),L('Only one efficient procedural location loads at a time','Apenas um local procedural eficiente carrega por vez'),L('Every walk uses bounds, collision, pathfinding, ambience, weather, rewards and discoveries.','Cada passeio usa limites, colisão, pathfinding, ambiente, clima, recompensas e descobertas.'));
    const grid=this.grid(root);Object.entries(WALK_LOCATIONS).forEach(([id,location])=>{const visited=state.walks.visited.includes(id);const card=this.card(loc(location.name),`${visited?L('Visited','Visitado'):L('New','Novo')} · -${location.energy} ${L('energy','energia')} · ${L('weather','clima')}: ${this.worldName(this.systems.currentWeather())}`);card.append(button(L('Travel','Viajar'),async()=>{const result=await this.systems.takeWalk(id);this.refresh(result.ok?`${L('Found','Encontrou')}: ${this.preferenceValue(result.rewardId)}`:L('More energy is needed.','É preciso mais energia.'));},{disabled:this.store.active.stats.energy<location.energy}));grid.append(card);});
    root.append(button(L('Return to current home room','Voltar ao ambiente da casa'),()=>{this.systems.returnHome();this.refresh(L('Returned home.','Voltou para casa.'));}));
    const scent=this.card(L('Scent and clue tracking','Faro e rastreamento de pistas'),`${L('Level','Nível')} ${state.scent.level} · ${state.scent.experience}/${state.scent.level*40}`);scent.append(button(L('Search this area','Investigar esta área'),()=>{const result=this.systems.scentSearch();this.refresh(result.found?L('A secret was found through a valid path.','Um segredo foi encontrado por um caminho válido.'):L('The trail faded safely.','A trilha desapareceu com segurança.'));}));root.append(scent);
    const secrets=this.grid(root);Object.entries(SECRETS).forEach(([id,secret])=>secrets.append(this.card(state.secrets[id]?`✓ ${loc(secret.name)}`:'???',state.secrets[id]?L('Discovered and remembered','Descoberto e lembrado'):L('No permanent glowing marker reveals it.','Nenhum marcador brilhante permanente entrega o segredo.'))));
  }

  render_world(root) {
    const state=this.systems.state;this.heading(root,L('Dynamic weather and seasons','Clima dinâmico e estações'),`<span data-living-bind="weather">${this.worldName(this.systems.currentWeather())}</span> · <span data-living-bind="season">${this.seasonName(this.systems.currentSeason())}</span>`,L('The simulation is seeded, offline and does not use an external weather API.','A simulação é baseada em seed, funciona offline e não usa API externa de clima.'));
    const weather=this.card(L('Weather mode','Modo de clima'));const weatherSelect=document.createElement('select');weatherSelect.id='living-weather-select';weatherSelect.name='weatherMode';weatherSelect.setAttribute('aria-label',L('Weather mode','Modo de clima'));weatherSelect.innerHTML=`<option value="dynamic">${L('Dynamic simulation','Simulação dinâmica')}</option>`+WEATHER_TYPES.map((id)=>`<option value="${id}">${this.worldName(id)}</option>`).join('');weatherSelect.value=state.world.fixedWeather||'dynamic';weatherSelect.addEventListener('change',()=>{this.systems.setWeather(weatherSelect.value);this.refresh();});weather.append(weatherSelect);root.append(weather);
    const season=this.card(L('Season mode','Modo de estação'));const seasonSelect=document.createElement('select');seasonSelect.id='living-season-select';seasonSelect.name='seasonMode';seasonSelect.setAttribute('aria-label',L('Season mode','Modo de estação'));seasonSelect.innerHTML=`<option value="automatic">${L('Automatic cycle','Ciclo automático')}</option>`+SEASONS.map((id)=>`<option value="${id}">${this.seasonName(id)}</option>`).join('');seasonSelect.value=state.world.fixedSeason||'automatic';seasonSelect.addEventListener('change',()=>{this.systems.setSeason(seasonSelect.value);this.refresh();});season.append(seasonSelect);root.append(season);
    const effect=this.card(L('Gameplay effects','Efeitos no jogo'),L('Lighting, sky, particles, audio context, fears, secrets, walks, photos and autonomous choices react to the world state.','Iluminação, céu, partículas, áudio, medos, segredos, passeios, fotos e escolhas autônomas reagem ao mundo.'));root.append(effect);
  }

  render_decor(root) {
    const state=this.systems.state;this.heading(root,L('Free environment decoration','Decoração livre do ambiente'),L('Snapping presets with collision preview','Posições de encaixe com prévia de colisão'),L('Placed furniture updates obstacles and navigation immediately.','Móveis posicionados atualizam obstáculos e navegação imediatamente.'));
    const positions=[[-2.5,1.7],[0,1.8],[2.5,1.6],[-1.8,0.4],[1.8,0.4]];const grid=this.grid(root);Object.entries(FURNITURE).forEach(([id,item])=>{const owned=state.furnitureInventory[id]||0;const card=this.card(loc(item.name),`${owned?`${owned} ${L('stored','guardado')}`:`${item.cost} ${L('coins','moedas')}`} · +${item.comfort} ${L('comfort','conforto')}`);const select=document.createElement('select');select.id=`living-furniture-position-${id}`;select.name=`furniturePosition-${id}`;select.setAttribute('aria-label',`${L('Position','Posição')}: ${loc(item.name)}`);positions.forEach(([x,z],index)=>{const option=document.createElement('option');option.value=`${x},${z}`;option.textContent=`${L('Position','Posição')} ${index+1} (${x}, ${z})`;select.append(option);});card.append(select,button(owned?L('Place stored item','Posicionar item guardado'):L('Buy and place','Comprar e posicionar'),()=>{const [x,z]=select.value.split(',').map(Number);const ok=this.systems.buyAndPlaceFurniture(id,x,z,0);this.refresh(ok?L('Furniture placed and navigation rebuilt.','Móvel posicionado e navegação reconstruída.'):L('Invalid placement or insufficient coins.','Posição inválida ou moedas insuficientes.'));},{disabled:owned<=0&&this.store.active.currency<item.cost}));grid.append(card);});
    this.heading(root,L('Placed in this room','Posicionados neste ambiente'),L('Move, rotate, store or sell','Mover, girar, guardar ou vender'));
    const placed=this.grid(root);state.decorations.filter((entry)=>entry.room===this.store.active.activeRoom).forEach((entry)=>{const card=this.card(loc(FURNITURE[entry.item]?.name),`x ${entry.x.toFixed(1)} · z ${entry.z.toFixed(1)}`);card.append(button(L('Rotate','Girar'),()=>{this.systems.moveDecoration(entry.id,entry.x,entry.z,(entry.rotation||0)+Math.PI/2);this.refresh();}),button(L('Store','Guardar'),()=>{this.systems.storeDecoration(entry.id);this.refresh(L('Furniture returned to storage.','Móvel devolvido ao inventário.'));}),button(L('Sell','Vender'),()=>{this.systems.sellDecoration(entry.id);this.refresh(L('Furniture sold for a safe partial refund.','Móvel vendido por um reembolso parcial seguro.'));}));placed.append(card);});
    root.append(button(L('Reset this room','Redefinir este ambiente'),()=>{this.systems.resetRoomDecorations();this.refresh(L('Placed furniture was stored away.','Os móveis posicionados foram guardados.'));}));
  }

  render_style(root) {
    const state=this.systems.state;this.heading(root,L('Pet accessories','Acessórios do pet'),L('Procedural local accessories with safe anchors','Acessórios procedurais locais com pontos seguros'),L('They follow the pet root or a compatible head, neck or spine bone and appear in photo mode.','Eles acompanham a raiz ou um osso compatível de cabeça, pescoço ou coluna e aparecem no modo foto.'));
    const grid=this.grid(root);Object.entries(ACCESSORIES).forEach(([id,item])=>{const owned=state.accessories.owned.includes(id),equipped=state.accessories.equipped===id;const card=this.card(`${equipped?'✓ ':''}${loc(item.name)}`,owned?L('Owned','No inventário'):`${item.cost} ${L('coins','moedas')}`);if(!owned)card.append(button(L('Buy','Comprar'),()=>{const ok=this.systems.buyAccessory(id);this.refresh(ok?L('Accessory unlocked.','Acessório desbloqueado.'):L('Not enough coins.','Moedas insuficientes.'));}));else card.append(button(equipped?L('Remove','Remover'):L('Equip','Equipar'),()=>{this.systems.equipAccessory(equipped?null:id);this.refresh();}));grid.append(card);});
  }

  render_social(root) {
    const state=this.systems.state;this.heading(root,L('Two pets in one environment','Dois pets no mesmo ambiente'),L('Independent lightweight controllers and local avoidance','Controladores independentes leves e desvio local'),L('The second pet is optional and can be disabled for performance without losing relationship progress.','O segundo pet é opcional e pode ser desativado por desempenho sem perder o progresso da relação.'));
    const ownedIds=[...new Set(this.store.data.slots.filter(Boolean).map((slot)=>slot.companionId))].filter((id)=>id!==this.store.active.companionId);
    const select=document.createElement('select');select.id='living-secondary-pet-select';select.name='secondaryPet';select.setAttribute('aria-label',L('Second companion pet','Segundo pet companheiro'));select.innerHTML=`<option value="">${L('No companion pet','Sem segundo pet')}</option>`+ownedIds.map((id)=>`<option value="${id}">${PETS[id]?.name||id}</option>`).join('');select.value=state.secondaryPetId||'';select.addEventListener('change',async()=>{await this.systems.setSecondaryPet(select.value||null);this.refresh();});root.append(select);
    if(state.secondaryPetId){const relation=this.systems.relationship();const grid=this.grid(root);Object.entries(relation).filter(([,value])=>typeof value==='number'&&value<=100).forEach(([key,value])=>{const card=this.card(this.relationshipName(key),pct(value));card.innerHTML+=`<div class="living-meter"><i style="width:${value}%"></i></div>`;grid.append(card);});const actions=document.createElement('div');actions.className='living-actions';[['play',L('Play together','Brincar juntos')],['share',L('Share a toy','Compartilhar brinquedo')],['rest',L('Rest together','Descansar juntos')],['compete',L('Friendly competition','Competição amigável')]].forEach(([kind,label])=>actions.append(button(label,()=>{this.systems.socialInteraction(kind);this.refresh(L('The relationship changed and was remembered.','A relação mudou e foi lembrada.'));})));root.append(actions);}
    this.heading(root,L('Body language observation','Observação da linguagem corporal'),this.systems.state.bodyLanguage.last,this.systems.state.emotion.hint);const quiz=document.createElement('div');quiz.className='living-actions';['excited','curious','frightened','content'].forEach((answer)=>quiz.append(button(this.emotionName(answer),()=>{const correct=this.systems.playObservation(answer);this.refresh(correct?L('Correct reading.','Leitura correta.'):L('Look at posture, movement and distance again.','Observe postura, movimento e distância novamente.'));})));root.append(quiz);
  }

  render_dreams(root) {
    const state=this.systems.state;this.heading(root,L('Playable dreams','Sonhos jogáveis'),L('Optional, skippable and influenced by memories','Opcionais, puláveis e influenciados por memórias'),L('Tap dream objects to collect them. Rare scores create memories and cosmetic rewards.','Toque nos objetos do sonho para coletá-los. Pontuações raras criam memórias e recompensas cosméticas.'));
    const sleeping=this.store.active.isSleeping,eligible=this.systems.dreamEligible();const themes=this.grid(root);Object.entries(DREAMS).forEach(([id,item])=>{const card=this.card(loc(item.name),state.dreams.rare.includes(id)?L('Rare memory unlocked','Memória rara desbloqueada'):eligible?L('Available dream theme','Tema de sonho disponível'):sleeping?L('Dreams return after a calm rest interval.','Os sonhos voltam após um intervalo de descanso.'):L('Your companion needs to be sleeping.','Seu pet precisa estar dormindo.'));card.append(button(L('Enter dream','Entrar no sonho'),()=>this.startDreamGame(root,id),{disabled:!eligible}));themes.append(card);});
    root.append(button(L('Skip / leave dream','Pular / sair do sonho'),()=>{this.scene.endDream?.();this.refresh(L('The dream ended safely.','O sonho terminou com segurança.'));}));
  }

  startDreamGame(root,theme) {
    const result=this.systems.playDream(theme);if(!result.ok){this.refresh(result.reason==='cooldown'?L('This dream is still settling. Try again after the rest interval.','Este sonho ainda está assentando. Tente novamente após o intervalo de descanso.'):L('Let your companion sleep before entering a dream.','Deixe seu pet dormir antes de entrar em um sonho.'));return;}this.dreamScore=0;this.render(this.container,'dreams');const arena=document.createElement('div');arena.className='dream-arena';arena.innerHTML=`<strong>${result.name}</strong><p>${L('Collect ten dream sparks.','Colete dez faíscas de sonho.')}</p>`;for(let i=0;i<10;i++){const spark=button('✦',()=>{if(spark.disabled)return;spark.disabled=true;spark.classList.add('is-collected');this.dreamScore+=1;if(this.dreamScore>=8){const rare=this.systems.completeDream(this.dreamScore);this.refresh(rare?L('Rare dream memory unlocked.','Memória de sonho raro desbloqueada.'):L('Dream complete.','Sonho concluído.'));}},{className:'dream-spark'});arena.append(spark);}this.container.querySelector('.living-body').prepend(arena);
  }

  render_memories(root) {
    const state = this.systems.state;
    this.heading(root, L('Expanded memory album', 'Álbum de memórias expandido'), L('Chronological and progressively revealed', 'Cronológico e revelado aos poucos'), L('Meaningful milestones store pet, date, room, weather, season and related values.', 'Marcos importantes guardam pet, data, ambiente, clima, estação e valores relacionados.'));
    const filters = document.createElement('div'); filters.className = 'living-actions living-filter-row';
    ['all', 'feed', 'walk', 'training-success', 'quest', 'secret', 'dream', 'health'].forEach((filter) => filters.append(button(this.memoryTypeName(filter), () => { this.memoryFilter = filter; this.memoryLimit = 16; this.render(this.container, 'memories'); }, { className: `living-filter ${this.memoryFilter === filter ? 'is-active' : ''}` })));
    root.append(filters);
    const timeline = document.createElement('div'); timeline.className = 'memory-timeline';
    const entries = state.timeline.slice().reverse().filter((entry) => this.memoryFilter === 'all' || entry.type === this.memoryFilter);
    entries.slice(0, this.memoryLimit).forEach((entry) => { const favorite = state.memoryCosmetics.favoritePhotoId === entry.id; const card = this.card(`${favorite ? '★ ' : ''}${this.memoryTypeName(entry.type)}`, `${new Date(entry.at).toLocaleString()} · ${entry.room} · ${this.worldName(entry.weather)} · ${this.seasonName(entry.season)}`); card.innerHTML += `<small>${this.memoryDetail(entry)}</small>`; if (entry.type === 'photo') card.append(button(favorite ? L('Favorite photo', 'Foto favorita') : L('Mark favorite', 'Marcar favorita'), () => { this.systems.setFavoritePhoto(entry.id); this.refresh(); }, { disabled: favorite })); timeline.append(card); });
    if (!entries.length) timeline.append(this.card(L('No memories in this filter', 'Nenhuma memória neste filtro'), L('Meaningful play will add entries here.', 'Interações importantes criarão registros aqui.')));
    root.append(timeline);
    if (entries.length > this.memoryLimit) root.append(button(L('Show more memories', 'Mostrar mais memórias'), () => { this.memoryLimit += 16; this.render(this.container, 'memories', { preserveScroll: true }); }, { className: 'button button-secondary living-load-more' }));
    this.heading(root, L('Long-term reaction memory', 'Memória de reação de longo prazo'), L('Salience, recency, valence and reinforcement', 'Saliência, recência, valência e reforço'));
    const long = this.grid(root); state.longTermMemories.slice().sort((a, b) => (b.salience * b.reinforcement) - (a.salience * a.reinforcement)).slice(0, 12).forEach((memory) => long.append(this.card(this.memoryTypeName(memory.type), `${L('Salience', 'Saliência')} ${pct(memory.salience * 100)} · ×${memory.reinforcement}`)));
  }

  render_events(root) {
    const state=this.systems.state,event=this.systems.eventAvailable();this.heading(root,L('Seasonal events and weekly play','Eventos sazonais e jogo semanal'),L('Replayable without permanent date locks','Rejogáveis sem bloqueio permanente por data'),L('Events use original procedural decoration, missions, rewards, recipes and accessories.','Eventos usam decoração procedural original, missões, recompensas, receitas e acessórios.'));
    const active=this.card(state.activeEvent?loc(EVENTS.find((e)=>e.id===state.activeEvent.id)?.name):loc(event.name),state.activeEvent?L('Complete these missions through real gameplay actions.','Complete estas missões por ações reais de jogo.'):L('Ready to start or replay.','Pronto para iniciar ou rejogar.'));if(!state.activeEvent)active.append(button(L('Start event','Iniciar evento'),()=>{this.systems.startEvent(event.id);this.refresh();}));else{const missions=document.createElement('div');missions.className='event-missions';state.activeEvent.missions.forEach((mission)=>{const row=this.card(`${mission.complete?'✓':'○'} ${loc(mission.label)}`,`${mission.progress||0}/${mission.target}`);row.innerHTML+=`<div class="living-meter"><i style="width:${Math.min(100,(mission.progress||0)/mission.target*100)}%"></i></div>`;missions.append(row);});active.append(missions);}root.append(active);
    const archive=this.grid(root);EVENTS.forEach((item)=>{const completed=state.eventArchive.some((entry)=>entry.id===item.id);const card=this.card(loc(item.name),completed?L('Unlocked in archive','Desbloqueado no arquivo'):L('Can be experienced through rotation','Pode ser vivido pela rotação'));if(completed)card.append(button(L('Replay','Rejogar'),()=>{this.systems.replayEvent(item.id);this.refresh();}));archive.append(card);});
    this.renderWeekly(root);this.renderCalendar(root);
  }

  renderWeekly(root) {const weekly=this.systems.state.weekly;this.heading(root,L('Weekly challenges','Desafios semanais'),weekly.claimed?L('Reward claimed','Recompensa recebida'):L('Varied meaningful goals','Metas variadas e significativas'));const grid=this.grid(root);weekly.challenges.forEach((challenge)=>{const card=this.card(loc(challenge.label),`${challenge.progress}/${challenge.target}`);card.innerHTML+=`<div class="living-meter"><i style="width:${challenge.progress/challenge.target*100}%"></i></div>`;grid.append(card);});}
  renderCalendar(root) {const days=this.systems.state.bondCalendar.days;this.heading(root,L('Bond calendar','Calendário de vínculo'),L('Variety instead of login pressure','Variedade em vez de pressão por login'));const calendar=document.createElement('div');calendar.className='bond-calendar';for(let offset=13;offset>=0;offset--){const date=new Date(Date.now()-offset*86400000);const key=date.toISOString().slice(0,10);const day=days[key];const cell=document.createElement('div');cell.className=`bond-day ${day?.complete?'is-complete':day?.actions?.length?'is-partial':''}`;cell.innerHTML=`<strong>${date.getDate()}</strong><small>${day?.actions?.length||0}</small>`;cell.title=(day?.actions||[]).join(', ');calendar.append(cell);}root.append(calendar);}

  traitName(id){return {playful:L('Playful','Brincalhão'),lazy:L('Lazy','Preguiçoso'),affectionate:L('Affectionate','Carinhoso'),brave:L('Brave','Corajoso'),stubborn:L('Stubborn','Teimoso'),foodMotivated:L('Food-motivated','Motivado por comida'),sociable:L('Sociable','Sociável'),independent:L('Independent','Independente'),curious:L('Curious','Curioso'),calm:L('Calm','Calmo')}[id]||id;}
  traitEffect(id){return {playful:L('More play requests and energetic choices.','Mais pedidos de brincadeira e escolhas energéticas.'),lazy:L('Longer rest and slower routines.','Descanso mais longo e rotina mais lenta.'),affectionate:L('Stronger reactions to gentle attention.','Reações mais fortes ao carinho.'),brave:L('More confidence in storms and exploration.','Mais confiança em tempestades e exploração.'),stubborn:L('Training needs better timing and motivation.','Treinamento exige melhor timing e motivação.'),foodMotivated:L('Food has stronger emotional meaning.','Comida tem significado emocional maior.'),sociable:L('More positive two-pet interaction.','Mais interação positiva entre pets.'),independent:L('More solo play and less frequent requests.','Mais brincadeira sozinho e menos pedidos.'),curious:L('More secrets, exploration and investigation.','Mais segredos, exploração e investigação.'),calm:L('Smoother emotions and grooming tolerance.','Emoções mais suaves e tolerância à higiene.')}[id]||'';}
  preferenceName(id){return {favoriteFood:L('Favorite food','Comida favorita'),dislikedFood:L('Disliked food','Comida rejeitada'),favoriteTreat:L('Favorite treat','Petisco favorito'),favoriteToy:L('Favorite toy','Brinquedo favorito'),favoriteEnvironment:L('Favorite place','Lugar favorito'),favoriteSleepingLocation:L('Sleeping spot','Lugar de dormir'),favoriteMinigame:L('Favorite minigame','Minijogo favorito'),favoriteAffection:L('Favorite affection','Carinho favorito'),activePeriod:L('Active period','Período ativo'),weather:L('Weather preference','Clima preferido'),social:L('Social preference','Preferência social'),groomingTolerance:L('Grooming tolerance','Tolerância à higiene'),fear:L('Specific fear','Medo específico')}[id]||id;}
  preferenceValue(value){return INGREDIENTS[value]?loc(INGREDIENTS[value].name):RECIPES[value]?loc(RECIPES[value].name):PETS[value]?.name||String(value).replaceAll('-',' ');}
  careName(id){return {rest:L('Rest','Descanso'),water:L('Fresh water','Água fresca'),bath:L('Bath','Banho'),brush:L('Brushing','Escovação'),'balanced-meal':L('Balanced meal','Refeição equilibrada'),'paw-clean':L('Paw cleaning','Limpeza das patas'),'calm-affection':L('Calm affection','Carinho calmo'),medicine:L('Medicine','Remédio')}[id]||id;}
  skillPathName(id){return {companion:L('Companion','Companheiro'),athlete:L('Athlete','Atleta'),explorer:L('Explorer','Explorador')}[id]||id;}
  commandLevelPt(level){return {Unknown:'Desconhecido',Learning:'Aprendendo',Familiar:'Familiar',Mastered:'Dominado'}[level]||level;}
  relationshipName(id){return {familiarity:L('Familiarity','Familiaridade'),trust:L('Trust','Confiança'),playfulness:L('Playfulness','Brincadeira'),comfort:L('Comfort','Conforto'),rivalry:L('Rivalry','Rivalidade'),attachment:L('Attachment','Apego'),interactions:L('Interactions','Interações')}[id]||id;}
  emotionName(id){return {excited:L('Excited','Animado'),curious:L('Curious','Curioso'),frightened:L('Frightened','Assustado'),content:L('Content','Contente')}[id]||id;}
  worldName(id){return {clear:L('Clear','Céu limpo'),rain:L('Rain','Chuva'),thunderstorm:L('Thunderstorm','Tempestade'),snow:L('Snow','Neve'),fog:L('Fog','Névoa'),wind:L('Wind','Vento'),sunshine:L('Strong sunshine','Sol forte'),rainbow:L('Rainbow','Arco-íris')}[id]||id;}
  seasonName(id){return {spring:L('Spring','Primavera'),summer:L('Summer','Verão'),autumn:L('Autumn','Outono'),winter:L('Winter','Inverno')}[id]||id;}
  memoryTypeName(id){return {all:L('All','Todas'),feed:L('Meal','Refeição'),walk:L('Walk','Passeio'),'training-success':L('Training success','Sucesso no treino'),quest:L('Story step','Etapa da história'),secret:L('Secret','Segredo'),dream:L('Dream','Sonho'),photo:L('Photo','Foto'),health:L('Health','Saúde'),preference:L('Preference discovery','Descoberta de preferência'),'life-stage':L('Life stage','Fase da vida'),'quest-complete':L('Quest conclusion','Conclusão da missão'),'rare-dream':L('Rare dream','Sonho raro'),'pet-relationship':L('Pet relationship','Relação entre pets'),'memorable-walk':L('Memorable walk','Passeio memorável'),recovery:L('Recovery','Recuperação'),'health-condition':L('Health experience','Experiência de saúde'),recipe:L('Recipe discovery','Descoberta de receita'),'gentle-grooming':L('Gentle grooming','Higiene gentil'),'event-complete':L('Event complete','Evento concluído'),season:L('Season change','Mudança de estação')}[id]||id.replaceAll('-',' ');}
  memoryDetail(entry){return Object.entries(entry.detail||{}).map(([key,value])=>`${key}: ${this.preferenceValue(value)}`).join(' · ')||L('A meaningful moment together.','Um momento importante juntos.');}
  memoryThought(memory){const detail=Object.values(memory.detail||{})[0];return getLanguage()==='en'?`I still remember ${this.preferenceValue(detail||memory.type)}.`:`Eu ainda me lembro de ${this.preferenceValue(detail||memory.type)}.`;}
}
