(function () {
  'use strict';
  const V = window.V, D = V.CommunityStoriesData, W = V.World, C = V.Cozy, L = V.Living, esc = V.escape;
  const originalInteract = V.Game.interact.bind(V.Game);
  const special = new Set(['market-merchant','cooking-npc','food-museum-curator','animal-museum-curator','sea-person','cape-person','nature-ranger','story-person']);
  L.missions.push(...D.missions.filter(q => !L.missions.some(old => old.id === q.id)));
  const S = V.CommunityStories = {
    data:D,
    owner() { return V.PixWorldVocabulary.owner(); },
    owned(i, fn) { return V.PixWorldVocabulary.owned(i, fn); },
    state(id) { L.ensure(); return V.state.sideQuests[id]; },
    mission(id) { return D.missions.find(q => q.id === id); },
    step(q) { const s = this.state(q.id); return s?.started && !s.done ? q.steps[s.step] : null; },
    located(id) { return V.CityMenus.locate(o => o.id === id); },
    quests(o) { return D.missions.filter(q => q.owner === o.id); },
    tasks(o) { return D.missions.filter(q => this.step(q)?.targets.includes(o.id)); },
    available(o) { return this.quests(o).filter(q => !this.state(q.id)?.done); },
    sources(q) { return (q.sources || []).map(id => D.sources[id]).filter(Boolean).map(([name,url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(name)} ↗</a>`).join(''); },
    describe(o) {
      const merchant = o.marketVendor && V.Markets.vendor(o.marketVendor), sea = o.person && (o.type === 'sea-person' ? V.MaritimeData.people : V.CapeRegionData.people).find(p => p.id === o.person), staff = o.sanctuaryStaff && V.SanctuaryNeighbors.staff.find(s => s.id === o.sanctuaryStaff);
      const roles = {
        'kitchen-chef':['Dandara','Chef e educadora','Each recipe has a place and people behind it. Let us prepare the kitchen and learn together.','Cada receita tem um lugar e pessoas por trás dela. Vamos preparar a cozinha e aprender juntos.'],
        'restaurant-chef':['Bento','Chef do restaurante','I check the utensils and prepare the next service. Ask me about the recipe you want to try.','Confiro os utensílios e preparo o próximo serviço. Pode perguntar sobre a receita que você quer experimentar.'],
        'restaurant-lia':['Lia','Atendimento e cozinha','The tables are ready. I can help you choose a dish or find the teaching kitchen.','As mesas estão prontas. Posso ajudar a escolher um prato ou encontrar a cozinha de ensino.'],
        'university-professor':['Professora Jamila','Educação e patrimônio alimentar','We compare sources and listen to the people who share their knowledge. Research begins with a good question.','Comparamos fontes e escutamos quem compartilha seus saberes. A pesquisa começa com uma boa pergunta.'],
        'university-researcher':['Inês','Pesquisa e documentação','I am comparing the history of each dish with the history of its name. Our notes keep the sources together.','Estou comparando a história de cada prato com a história do nome dele. Nossas notas mantêm as fontes por perto.'],
        'university-guide':['Aline','Mediação da universidade','There is an open lesson and a kitchen workshop here. We make room for questions and different experiences.','Aqui há uma aula aberta e uma oficina de cozinha. Damos espaço para perguntas e experiências diferentes.'],
        'food-museum-curator':['Curadora Celina','Museu da Comida','A display case holds a dish. A good label also introduces the people, techniques and places connected to it.','Uma vitrine guarda um prato. Uma boa legenda também apresenta as pessoas, técnicas e lugares ligados a ele.'],
        'story-mediator-ivo':['Ivo','Mediador da roda','We are preparing the next circle. Listen to the music before joining the game.','Estamos preparando a próxima roda. Escute a música antes de entrar no jogo.'],
        'story-mediator-ines':['Inês','Mediação do Museu das Palavras','Words travel between people and places. We look for the language, the context and the source of each record.','Palavras viajam entre pessoas e lugares. Procuramos a língua, o contexto e a fonte de cada registro.']
      };
      const r = roles[o.id], base = V.content.characters[o.character] || {};
      return {name:r?.[0] || merchant?.name || sea?.name || staff?.name || o.name || o.resident?.name || base.name || 'Morador da comunidade',role:r?.[1] || sea?.role || staff?.role || (merchant ? 'Comércio e saberes da feira' : base.role || 'Vizinhança'), en:r?.[2] || sea?.en || staff?.line?.[0] || 'I am getting things ready for the next visitors. We can share what we know about this place.',pt:r?.[3] || merchant?.text || sea?.pt || staff?.line?.[1] || 'Estou preparando as coisas para as próximas visitas. Podemos compartilhar o que sabemos deste lugar.'};
    },
    speaker(o, person) {
      const id = 'community-speaker-' + o.id, base = o.uniformSprite || o.character || 'jamila';
      V.content.characters[id] = {...V.content.characters[base],name:person.name,role:person.role};
      for (const suffix of ['', '-portrait']) if (V.Assets.images[base + suffix]) V.Assets.images[id + suffix] = V.Assets.images[base + suffix];
      return id;
    },
    talk(o) {
      const i=this.owner(); if(V.DuoPanels?.enabled()&&V.DuoPanels.context!==i)return this.owned(i,()=>this.talk(o));
      const owner = this.owner(), person = this.describe(o), task = this.tasks(o).map(q => ({q,step:this.step(q)})).find(x => x.step.kind === 'story-talk'), line = task?.step || person;
      if (o.group) { const g = W.current.chats.find(g => g.id === o.group); if (g) C.endChat(W.current,g); }
      o.responding = 4; o.greeting = 12;
      V.Dialogue.start([{speaker:this.speaker(o,person),en:line.en,pt:line.pt}], () => this.owned(owner, () => {
        L.event('story-talk',o.id);
        V.PixWorldVocabulary.learn(task?.q.words || ['listen','share'], 'Conversa · ' + person.name);
        V.Save.log('conversa da comunidade',person.name); V.Save.save();
      }));
    },
    offer(o) {
      const i=this.owner(); if(V.DuoPanels?.enabled()&&V.DuoPanels.context!==i)return this.owned(i,()=>this.offer(o));
      o.responding=12;
      const owner = this.owner(), person = this.describe(o), quests = this.quests(o), tasks = this.tasks(o), business = !o.storyPerson;
      V.UI.modal(person.name,person.role,`<p>${esc(person.pt)}</p>${tasks.filter(q => q.owner !== o.id).map(q => `<p class="story-current">${esc(q.title)} · ${esc(this.step(q).label)}</p>`).join('')}<div class="story-offers">${quests.map(q => { const s = this.state(q.id), step = this.step(q); return `<article><span class="story-blue-icon" aria-hidden="true">${s?.done?'✓':'!'}</span><div><small>${s?.done?'HISTÓRIA REGISTRADA':s?.started?'MISSÃO EM ANDAMENTO':'MISSÃO SECUNDÁRIA'}</small><h3>${esc(q.title)}</h3><p>${esc(q.brief)}</p>${step?`<p class="story-current">${esc(step.label)}</p>`:''}<button class="${step?.kind==='story-report'?'primary':'secondary'}" data-story-open="${q.id}">${s?.done?'Ler registro':step?.kind==='story-report'?'Contar o que descobri':s?.started?'Acompanhar missão':'Ouvir a proposta'}</button></div></article>`; }).join('')}</div>`,`<button class="primary" id="story-talk">Conversar</button>${business?'<button class="secondary" id="story-service">'+(o.marketVendor?'Visitar a banca':o.type==='sea-person'?'Atendimento do porto':o.type.includes('curator')?'Consultar o museu':'Ver atividades')+'</button>':''}`);
      V.$$('[data-story-open]').forEach(b => b.onclick = () => this.owned(owner, () => this.step(this.mission(b.dataset.storyOpen))?.kind === 'story-report' ? this.report(b.dataset.storyOpen) : this.show(b.dataset.storyOpen)));
      V.$('#story-talk').onclick = () => this.owned(owner, () => this.talk(o));
      V.$('#story-service')?.addEventListener('click', () => this.owned(owner, () => { V.UI.close(); originalInteract(o); }));
      this.bind(owner);
      if(o.pixContext)V.PixWorldVocabulary.strip(o.pixContext.words,'Conversa · '+person.name);
    },
    bind(owner) { if (V.DuoPanels?.enabled()) V.DuoPanels.bind(V.DuoPanels.root(owner),owner); },
    show(id) {
      const i=this.owner(); if(V.DuoPanels?.enabled()&&V.DuoPanels.context!==i)return this.owned(i,()=>this.show(id));
      const q = this.mission(id); if (!q) return;
      const owner = this.owner(), s = this.state(id), step = this.step(q);
      V.UI.modal(q.title,'HISTÓRIAS DA COMUNIDADE · ' + V.Living.location(q.map),`<p class="story-brief">${esc(q.brief)}</p><aside class="story-context"><strong>Cultura e contexto</strong><p>${esc(q.context)}</p></aside><ol class="mission-steps">${q.steps.map((item,i) => `<li class="${s && i<s.step?'checked':''}">${s && i<s.step?'✓ ':''}${esc(item.label)}${s && i===s.step && s.progress.length?` <small>(${s.progress.length}/${item.targets.length})</small>`:''}</li>`).join('')}</ol><p class="note">${esc(q.reward)}. Progresso salvo no caderno.</p>${s?.done?`<p class="story-resolution">${esc(q.steps.at(-1).explanation)}</p>`:''}${q.sources.length?`<details class="story-sources"><summary>Fontes desta história</summary>${this.sources(q)}<small>Personagens e enredo são ficcionais.</small></details>`:''}`,`<button id="story-journal" class="secondary">Caderno</button>${s?.done?'':`<button id="story-accept" class="primary">${step?.kind==='story-report'?'Contar o que descobri':s?.started?'Rastrear próxima etapa':'Aceitar missão'}</button>`}`);
      V.$('#story-journal').onclick = () => this.owned(owner, () => V.CityMenus.board('community'));
      V.$('#story-accept')?.addEventListener('click', () => this.owned(owner, () => { if (step?.kind==='story-report') return this.report(id); V.CityMenus.track('community',id); }));
      this.bind(owner); V.PixWorldVocabulary.strip(q.words,'Missão · ' + q.title);
    },
    canReport(q) {
      const found = this.located(q.owner);
      return this.step(q)?.kind === 'story-report' && found?.map === W.current.id && V.dist(V.Player.data,found.object) < (found.object.interactionRange || 100) + 35;
    },
    report(id) {
      const i=this.owner(); if(V.DuoPanels?.enabled()&&V.DuoPanels.context!==i)return this.owned(i,()=>this.report(id));
      const q = this.mission(id), owner = this.owner();
      if (!q || !this.canReport(q)) { if(q) { V.CityMenus.track('community',id); V.UI.toast('Converse com a pessoa que propôs a missão para entregar suas descobertas.'); } return; }
      const step = this.step(q);
      V.UI.modal(q.title,'COMPARTILHAR DESCOBERTAS',`<p>${esc(step.prompt)}</p><div class="story-answers">${step.answers.map((answer,i) => `<button class="secondary" data-story-answer="${i}">${esc(answer)}</button>`).join('')}</div><p class="story-answer-feedback" id="story-answer-feedback" role="status"></p>`, '<button id="story-report-back" class="quiet">Pensar mais um pouco</button>');
      V.$$('[data-story-answer]').forEach(b => b.onclick = () => this.owned(owner, () => {
        if (!this.canReport(q)) return;
        if (+b.dataset.storyAnswer !== step.correct) { V.$('#story-answer-feedback').textContent = 'Releia suas descobertas: ' + q.context; return; }
        L.event('story-report',q.owner); V.Audio.sfx('collect');
        this.show(id);
      }));
      V.$('#story-report-back').onclick = () => this.owned(owner, () => this.show(id)); this.bind(owner);
    },
    inspect(o) {
      if (!o || V.Game.mode !== 'explore') return;
      // Food fiches advance when registered, rather than merely opened.
      if (o.foodEntry) { if(V.FoodMuseum.ensure().readers[this.owner()].includes(o.foodEntry))L.event('story-inspect','food-panel-'+o.foodEntry); return; }
      L.event('story-inspect',o.id);
      const clue = o.id==='market-stall-zola' ? 'Shweshwe · confira a procedência do tecido e os créditos de quem produziu e costurou. A produção registrada pela Da Gama tem ligação com o Cabo Oriental, na África do Sul.' : o.id==='market-stall-solange' ? 'Ficha da banca coletiva: nome de quem criou, material, uso indicado pela pessoa e forma de contato escolhida por ela. Solange combina o texto com cada participante.' : '';
      if (clue && V.modal) { const p = document.createElement('p'); p.className = 'story-context'; p.textContent = clue; V.$('.modal-body')?.prepend(p); }
    },
    seed() {
      const add = (map,id,name,character,at,plaque,title,text) => {
        const m = W.maps[map]; if (!m || m.objects.some(o => o.id === id)) return;
        const p = C.safe(m,at[0],at[1],m.objects.filter(o => C.person(o))), o = {id,type:'story-person',storyPerson:true,name,character,x:p.x*48+24,y:p.y*48+24,label:'Conversar com '+name,interactionRange:100};
        C.preparePerson(m,o); m.objects.push(o);
        const a = C.safe(m,p.x+2,p.y,m.objects.filter(o => C.person(o)));
        m.objects.push({id:plaque,type:'story-plaque',x:a.x*48+24,y:a.y*48+24,label:'Ler: '+title,title,text,interactionRange:110});
      };
      add('capoeira-courtyard','story-mediator-ivo','Ivo','percussionist',[11,12],'story-roda-plaque','A roda e seus saberes',D.missions.find(q => q.id==='story-roda').context);
      add('african-words','story-mediator-ines','Inês','ines',[20,32],'story-language-plaque','Língua, contexto e fonte',D.missions.find(q => q.id==='story-museum-voices').context);
      V.ObjectiveGuide.invalidate(); V.Atlas.cache.clear();
    },
    markers(c,m,cam) {
      if (V.SceneEditor.active || !V.state) return;
      for (const o of m.objects) {
        const offers = this.available(o); if (!offers.length) continue;
        const x = Math.round(o.x-cam.x), y = Math.round(o.y-cam.y-91);
        if (x < -25 || x > c.canvas.width+25 || y < -25 || y > c.canvas.height+25) continue;
        const ready = offers.some(q => this.step(q)?.kind==='story-report'), active = offers.every(q => this.state(q.id)?.started);
        c.save(); c.shadowColor='#102f42'; c.shadowBlur=4; c.fillStyle=active&&!ready?'#d8eff9':'#2084d6'; c.strokeStyle='#e1f5ff'; c.lineWidth=2;
        c.beginPath(); c.arc(x,y,13,0,Math.PI*2); c.fill(); c.stroke(); c.shadowBlur=0;
        c.fillStyle=active&&!ready?'#1765a5':'#ffffff'; c.font='900 19px "VOICES Sans",sans-serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(ready?'✓':'!',x,y+1); c.restore();
      }
    }
  };
  const person = C.person.bind(C); C.person = o => o?.storyPerson || person(o);
  const init = W.init.bind(W); W.init = function (...args) { const out = init(...args); S.seed(); return out; };
  const show = L.showMission.bind(L); L.showMission = id => S.mission(id) ? S.show(id) : show(id);
  const event = L.event.bind(L); L.event = function (...args) {
    const out = event(...args);
    for (const q of D.missions) if (S.state(q.id)?.done) { V.Life.award('side-'+q.id,40); V.Progress.reward('story-xp:'+q.id,20); }
    V.Game.updateHUD(); V.ObjectiveGuide.invalidate(); return out;
  };
  const resolve = V.CityMenus.resolve.bind(V.CityMenus); V.CityMenus.resolve = function (t) {
    const q = t?.kind==='community' && S.mission(t.id), step = q && S.step(q);
    if (step?.guideTarget) { const found = S.located(step.guideTarget); if(found) return {...found,key:'task-community-'+q.id+'-'+S.state(q.id).step,label:step.label,title:q.title,task:t,progress:S.state(q.id).step,total:q.steps.length}; }
    return resolve(t);
  };
  const register = V.FoodMuseum.register.bind(V.FoodMuseum); V.FoodMuseum.register = function (id) { const out = register(id); L.event('story-inspect','food-panel-'+id); return out; };
  const deliver = V.Cooking.deliver.bind(V.Cooking); V.Cooking.deliver = function (...args) { const out = deliver(...args); if(out) L.event('story-cook','kitchen-welcome'); return out; };
  V.Game.interact = function (o) {
    if (!o || V.modal || V.Dialogue.active || this.mode!=='explore') return originalInteract(o);
    if (o.type==='story-plaque') { V.UI.modal(o.title,'SABERES DA COMUNIDADE',`<p>${esc(o.text)}</p>`); S.inspect(o); return; }
    if (special.has(o.type) || o.sanctuaryStaff || S.quests(o).length) return S.offer(o);
    const out = originalInteract(o); S.inspect(o); return out;
  };
  const draw = C.drawObject.bind(C); C.drawObject = function (c,o,cam,...args) {
    if (o.type==='story-plaque') { const x=o.x-cam.x,y=o.y-cam.y; c.fillStyle='#796246';c.fillRect(x-3,y-43,6,45);c.fillStyle='#b69b64';c.fillRect(x-30,y-76,60,38);c.fillStyle='#efe4c6';c.fillRect(x-26,y-72,52,30);V.Engine.text(c,'i',x,y-50,'#247aab',20,'center'); return; }
    return draw(c,o,cam,...args);
  };
  const render = C.render.bind(C); C.render = function (c) { const out = render(c); if(W.current) S.markers(c,W.current,W.camera); return out; };
})();
