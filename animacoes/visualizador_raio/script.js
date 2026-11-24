(() => {
  const { compareRadii, describeSpecies, elementBySymbol, formatRadius, formatSigned, formatSpecies, formatIonContext, resolveIon } = radiusLab.chemistry;
  const { createAtomView, createPeriodicTable, createSpeciesPicker } = radiusLab;
  const { activities, examples, tutorialSteps } = radiusLab.experiments;

  const byId = id => document.getElementById(id);
  const icon = name => `<svg class="icon" aria-hidden="true"><use href="#icon-${name}"/></svg>`;
  const kindLabels = { neutral: 'Átomo neutro', cation: 'Cátion', anion: 'Ânion' };
  const sides = ['a', 'b'];
  const defaultExample = examples[0];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  function readPreference(key) {
    try {
      return localStorage.getItem('laboratorio-raios.' + key);
    } catch {
      return null;
    }
  }

  function savePreference(key, value) {
    try {
      localStorage.setItem('laboratorio-raios.' + key, String(value));
    } catch {
      // O laboratório também funciona com o armazenamento bloqueado.
    }
  }

  const state = {
    a: defaultExample.a,
    b: defaultExample.b,
    mode: defaultExample.mode,
    edit: 'b',
    sound: readPreference('som') === 'true',
    motion: readPreference('movimento'),
    activity: activities[0],
    activeResult: null,
  };

  const predictions = new Map();
  const cards = {};
  const panelButtons = document.querySelectorAll('[data-panel]');
  const modeButtons = document.querySelectorAll('[data-mode]');
  const editButtons = document.querySelectorAll('[data-edit]');
  const stages = byId('species-stages');
  const template = byId('species-template');
  const countInput = byId('electron-count');
  const addButton = byId('add-electron');
  const removeButton = byId('remove-electron');
  const ionButton = byId('common-ion');
  const resetButton = byId('reset-charge');
  const replayButton = byId('replay-ion');
  const replayLabel = byId('replay-label');
  const replayIcon = replayButton.querySelector('use');
  const prepareFormation = { morphDuration: 850, shellFade: 630, suppressTransfer: true, caption: 'Átomo neutro' };
  const transferFormation = { morphDuration: 1600, morphDelay: 140, shellFade: 900, transferDuration: 1720, transferStagger: 155 };
  let formation = null;
  let activePanel = 'lab';
  let savedBench;
  let tutorialIndex = 0;
  const soundButton = byId('sound-toggle');
  const motionButton = byId('motion-toggle');
  const activityOptions = byId('activity-options');
  const testActivityButton = byId('test-activity');
  const openPicker = createSpeciesPicker(applySpecies);

  for (const side of sides) {
    const card = template.content.firstElementChild.cloneNode(true);
    const fields = Object.fromEntries([...card.querySelectorAll('[data-field]')].map(field => [field.dataset.field, field]));
    fields.slot.textContent = side.toUpperCase();
    fields.pick.addEventListener('click', () => {
      if (cancelReplay()) paintLab();
      openPicker(side, describeSpecies(state[side]), state.mode, fields.pick);
    });
    const { paintAtom, stopAtom } = createAtomView(fields.scene, side);
    cards[side] = { card, fields, paintAtom, stopAtom };
    stages.append(card);
  }

  function describePair(example) {
    const { a, b } = example;
    const sameIon = a.symbol === b.symbol && a.charge === b.charge;
    return [a, b].map(selection => {
      const label = formatSpecies(selection.symbol, selection.charge);
      const reference = sameIon && resolveIon(selection);
      return reference ? label + ' · ' + formatIonContext(reference) : label;
    });
  }

  byId('quick-examples').innerHTML = examples.filter(example => example.mode === 'linked').map(example => {
    const [a, b] = describePair(example);
    const kind = describeSpecies(example.b).kind;
    return `<button type="button" class="example-tile" data-example="${example.id}" data-kind="${kind}" aria-pressed="false">
      <strong>${a} <span>→</span> ${b}</strong><small>${example.title}</small>
    </button>`;
  }).join('');

  function trendMarkup(example) {
    const [a, b] = describePair(example);
    return `<button type="button" class="trend-button" data-example="${example.id}" aria-pressed="false">
      <span><strong>${example.title}</strong><small>${a} × ${b}</small></span>${icon('right')}
    </button>`;
  }

  const freeExamples = examples.filter(example => example.mode === 'free');
  byId('trend-examples').innerHTML = freeExamples.filter(example => !example.extra).map(trendMarkup).join('');
  byId('extra-examples').innerHTML = freeExamples.filter(example => example.extra).map(trendMarkup).join('');

  byId('activity-nav').innerHTML = activities.map(activity => `
    <button type="button" class="activity-link" data-activity="${activity.id}">
      <span>${activity.title}</span>${icon('right')}
    </button>`).join('');

  const exampleButtons = document.querySelectorAll('[data-example]');
  const activityButtons = document.querySelectorAll('[data-activity]');
  const motionEnabled = () => state.motion === null ? !reducedMotion.matches : state.motion === 'true';

  function paintPreferences() {
    const motion = motionEnabled();
    document.body.dataset.motion = motion ? 'on' : 'off';
    motionButton.setAttribute('aria-pressed', String(motion));
    motionButton.title = motion ? 'Pausar animações' : 'Ativar animações';
    motionButton.innerHTML = icon(motion ? 'pause' : 'play');
    soundButton.setAttribute('aria-pressed', String(state.sound));
    soundButton.title = state.sound ? 'Desativar som' : 'Ativar som';
    soundButton.innerHTML = icon(state.sound ? 'sound-on' : 'sound-off');
  }

  function paintCard(side, species, animation) {
    const { card, fields, paintAtom } = cards[side];
    card.dataset.kind = species.kind;
    fields.kind.textContent = kindLabels[species.kind];
    fields.name.textContent = species.element.name;
    fields.pick.setAttribute('aria-label', `Escolher espécie ${side.toUpperCase()}: ${species.element.name}, ${species.label}`);
    fields.symbol.textContent = species.label;
    fields.protons.textContent = species.element.z;
    fields.electrons.textContent = species.electrons;
    fields.charge.textContent = formatSigned(species.charge);
    fields.radius.textContent = species.radius === null ? '—' : formatRadius(species.radius) + ' pm';
    fields.basis.textContent = species.basis;
    fields.referenceNote.textContent = species.note ?? '';
    fields.referenceNote.hidden = !species.note;
    fields.source.hidden = !species.source;
    if (species.source) {
      fields.source.textContent = species.source.label;
      fields.source.href = species.source.url;
    }
    fields.shells.textContent = species.shells?.join(' · ') || (species.electrons === 0 ? 'Nenhuma ocupada' : 'Sem dados');
    fields.empty.hidden = species.radius > 0;
    fields.emptyIcon.textContent = species.radius === null ? '?' : '−';
    fields.emptyLabel.textContent = species.radius === null ? 'Raio indisponível' : 'Valor da convenção cristalográfica';
    fields.formationCaption.hidden = !animation?.caption;
    fields.formationCaption.textContent = animation?.caption ?? '';
    paintAtom(species, motionEnabled(), animation);
  }

  function paintControls(species) {
    for (const button of modeButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode));
    }
    byId('edit-targets').hidden = state.mode === 'linked';
    for (const button of editButtons) {
      button.setAttribute('aria-pressed', String(button.dataset.edit === state.edit));
    }
    byId('edit-species').textContent = `Espécie ${state.edit.toUpperCase()} · ${species.label}`;
    const max = species.element.z + 5;
    const playing = Boolean(formation);
    countInput.max = max;
    countInput.value = species.electrons;
    countInput.disabled = playing;
    addButton.disabled = playing || species.electrons >= max;
    removeButton.disabled = playing || species.electrons <= 0;
    resetButton.disabled = playing || species.charge === 0;
    const reference = species.element.preferredIon;
    ionButton.disabled = playing || !reference || species.reference === reference;
    ionButton.textContent = reference ? 'Usar ' + formatSpecies(species.element.symbol, reference.charge) : 'Íon de referência';
    ionButton.title = reference ? 'Usar o íon de referência' : 'Este elemento não tem íon cadastrado';
    replayButton.hidden = state.mode !== 'linked';
    replayButton.disabled = !playing && ((species.reference ?? reference)?.radius == null || !motionEnabled());
    replayButton.dataset.playing = String(playing);
    replayLabel.textContent = playing ? 'Parar animação' : 'Animar formação';
    replayIcon.setAttribute('href', playing ? '#icon-pause' : '#icon-play');
  }

  function sameSpecies(left, right) {
    return left.symbol === right.symbol && left.charge === right.charge && resolveIon(left) === resolveIon(right);
  }

  function isCurrentExample(example) {
    return sameSpecies(example.a, state.a) && sameSpecies(example.b, state.b);
  }

  function explainComparison(a, b, difference) {
    if (difference === null) {
      return 'A diferença de tamanho fica disponível quando os dois registros têm uma medida de referência.';
    }
    const example = examples.find(isCurrentExample);
    if (example) return example.explanation;
    if (difference.percent === null) return 'Valores negativos seguem a convenção cristalográfica da fonte. A bancada mostra o valor publicado e a diferença numérica em picômetros.';
    if (sameSpecies(state.a, state.b)) return 'Os dois cartões mostram a mesma espécie e as mesmas condições. Escolha outra carga ou outro registro para comparar.';
    if (a.source.isolated !== b.source.isolated) {
      return 'Um raio foi calculado para um íon isolado. A diferença exibida também depende do método usado para definir cada raio.';
    }
    if (a.reference && b.reference && a.source !== b.source) {
      return 'Os dois raios vêm de publicações com métodos diferentes. A diferença numérica pode combinar efeitos da espécie, do ambiente e do método.';
    }
    if (a.element === b.element && a.charge === b.charge) {
      if (a.reference?.context && b.reference?.context) {
        return 'Os cartões mostram o mesmo íon em cristais diferentes. Os raios mínimos variam conforme os contatos com os átomos vizinhos em cada sal.';
      }
      return 'Os dois cartões mostram o mesmo íon em condições diferentes. Compare a coordenação, a geometria e o spin indicados em cada registro.';
    }
    if (a.element === b.element) {
      return `O número de prótons permanece ${a.element.z}. De A para B, o número de elétrons vai de ${a.electrons} para ${b.electrons}.`;
    }
    if (a.electrons === b.electrons) {
      return `As duas espécies têm ${a.electrons} elétrons. Compare o número de prótons e a definição de raio indicada em cada cartão.`;
    }
    return 'Use a régua para comparar os raios. As linhas abaixo de cada valor indicam o tipo de raio e as condições de referência.';
  }

  function paintLab() {
    const a = describeSpecies(state.a);
    const b = describeSpecies(formation?.neutral ?? state.b);
    const difference = compareRadii(a, b);
    paintCard('a', a);
    paintCard('b', b, formation?.animation);
    paintControls(state.edit === 'a' ? a : b);

    byId('difference-label').textContent = state.mode === 'linked' ? 'Variação do raio' : 'Variação de A para B';
    byId('difference-value').textContent = difference ? formatSigned(difference.delta) + ' pm' : 'Sem dados';
    const percentage = byId('difference-percent');
    const percent = difference?.percent;
    percentage.hidden = percent == null;
    percentage.textContent = percent == null ? '' : formatSigned(percent) + '%';
    byId('difference').dataset.direction = difference?.delta > 0 ? 'up' : difference?.delta < 0 ? 'down' : 'same';
    byId('comparison-explanation').textContent = explainComparison(a, b, difference);

    for (const button of exampleButtons) {
      const example = examples.find(entry => entry.id === button.dataset.example);
      button.setAttribute('aria-pressed', String(state.mode === example.mode && isCurrentExample(example)));
    }
    paintActivityResult();
  }

  function announceSpecies(side) {
    const species = describeSpecies(state[side]);
    const measure = species.source?.orbital ? 'Distância orbital' : 'Raio';
    const radius = species.radius === null ? 'Raio indisponível' : measure + ' de ' + formatRadius(species.radius) + ' picômetros';
    byId('announcement').textContent = `${species.label}, ${species.electrons} elétrons, carga ${formatSigned(species.charge)}. ${radius}. ${species.basis}.`;
  }

  function applySpecies(side, selection) {
    cancelReplay();
    if (state.mode === 'linked') {
      const element = elementBySymbol.get(selection.symbol);
      state.a = { symbol: element.symbol, charge: 0 };
      state.b = side === 'b' ? selection : { symbol: element.symbol, charge: element.preferredIon?.charge ?? 0 };
      state.edit = 'b';
    } else {
      state[side] = selection;
      state.edit = side;
    }
    paintLab();
    announceSpecies(state.edit);
  }

  function openPeriodicIon(side, selection) {
    showPanel('lab');
    state.mode = 'free';
    state.activeResult = null;
    applySpecies(side, selection);
  }

  function updateElectrons(requested, reference = null) {
    cancelReplay();
    const side = state.edit;
    const species = describeSpecies(state[side]);
    const electrons = Number.isFinite(requested)
      ? Math.max(0, Math.min(Math.round(requested), species.element.z + 5))
      : species.electrons;
    countInput.value = electrons;
    const changedElectrons = electrons !== species.electrons;
    if (!changedElectrons && (!reference || species.reference === reference)) return;
    const charge = species.element.z - electrons;
    const previous = species.reference;
    const matchingContext = previous && species.element.ions.find(ion =>
      ion.charge === charge && ion.number === previous.number && ion.geometry === previous.geometry
      && ion.spinCode === previous.spinCode && ion.source === previous.source
    );
    state[side] = { symbol: species.element.symbol, charge, reference: reference ?? matchingContext };
    paintLab();
    announceSpecies(side);
    if (changedElectrons) playSound(electrons > species.electrons);
  }

  function cancelReplay() {
    if (!formation) return false;
    window.clearTimeout(formation.timer);
    formation = null;
    cards.b.stopAtom();
    return true;
  }

  function replayIonFormation() {
    if (cancelReplay()) {
      paintLab();
      return;
    }

    const { element, charge, reference } = describeSpecies(state.b);
    const target = reference ?? element.preferredIon;
    if (target?.radius == null || !motionEnabled()) return;
    const neutral = { symbol: element.symbol, charge: 0 };
    const count = Math.abs(target.charge);
    const action = target.charge > 0 ? 'Perda' : 'Ganho';
    const electrons = count === 1 ? '1 elétron' : `${count} elétrons`;
    const replay = {
      neutral,
      animation: prepareFormation,
      timer: window.setTimeout(() => {
        if (formation !== replay) return;
        state.b = { symbol: element.symbol, charge: target.charge, reference: target };
        replay.neutral = null;
        replay.animation = { ...transferFormation, caption: `${action} de ${electrons}` };
        paintLab();
        playSound(target.charge < 0);

        const stagger = (Math.min(count, 3) - 1) * transferFormation.transferStagger;
        replay.timer = window.setTimeout(() => {
          if (formation !== replay) return;
          formation = null;
          paintLab();
          announceSpecies('b');
        }, transferFormation.transferDuration + stagger + 140);
      }, (charge === 0 ? 0 : prepareFormation.morphDuration) + 350),
    };
    formation = replay;
    paintLab();
  }

  function loadExample(example) {
    cancelReplay();
    state.a = example.a;
    state.b = example.b;
    state.mode = example.mode;
    state.edit = 'b';
    paintLab();
  }

  function showPanel(name) {
    const educational = name === 'education';
    const wasEducational = activePanel === 'education';
    const entering = educational && !wasEducational;
    const leaving = wasEducational && !educational;
    const interrupted = activePanel !== name && cancelReplay();
    activePanel = name;

    if (entering) {
      const { a, b, mode, edit, activeResult } = state;
      savedBench = { a, b, mode, edit, activeResult };
      state.activeResult = null;
    } else if (leaving) {
      Object.assign(state, savedBench);
      savedBench = null;
    }

    const lab = byId('lab');
    lab.hidden = name !== 'lab' && !educational;
    lab.classList.toggle('educational-mode', educational);
    lab.setAttribute('aria-labelledby', educational ? 'education-title' : 'lab-title');
    byId('lab-intro').hidden = educational;
    byId('education-intro').hidden = !educational;
    byId('education-guide').hidden = !educational;
    byId('lab-sidebar').hidden = educational;
    byId('periodic').hidden = name !== 'periodic';
    byId('activities').hidden = name !== 'activities';

    for (const button of panelButtons) {
      if (button.dataset.panel === name) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
    if (entering) paintTutorial();
    else if (leaving || interrupted) paintLab();

    byId(name + '-title').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function neighborDiagram(count) {
    const dots = Array.from({ length: count }, (_, index) => {
      const angle = index * 2 * Math.PI / count - Math.PI / 2;
      const x = 50 + 38 * Math.cos(angle);
      const y = 50 + 38 * Math.sin(angle);
      return `<span class="neighbor-dot" style="left:${x}%;top:${y}%"></span>`;
    }).join('');
    return `<figure><div class="neighbor-map" aria-hidden="true"><span class="neighbor-center">Mg²⁺</span>${dots}</div>
      <figcaption>NC ${count} · ${count} vizinhos</figcaption></figure>`;
  }

  function paintTutorial(focusStep = false) {
    const step = tutorialSteps[tutorialIndex];
    const example = examples.find(entry => entry.id === step.example);
    const heading = byId('tutorial-step-title');
    const current = tutorialIndex + 1;
    const progress = byId('tutorial-progress');
    const neighbors = byId('tutorial-neighbors');
    byId('tutorial-step-number').textContent = `Etapa ${current} de ${tutorialSteps.length}`;
    progress.max = tutorialSteps.length;
    progress.value = current;
    heading.textContent = step.title;
    byId('tutorial-copy').replaceChildren(...step.paragraphs.map(text => {
      const paragraph = document.createElement('p');
      paragraph.textContent = text;
      return paragraph;
    }));
    byId('tutorial-task').textContent = step.task;
    byId('tutorial-sources').replaceChildren(...step.sources.map(({ label, url }) => {
      const link = document.createElement('a');
      link.textContent = label;
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      return link;
    }));
    neighbors.hidden = !step.showNeighbors;
    neighbors.innerHTML = step.showNeighbors
      ? [example.a, example.b].map(({ reference }) => neighborDiagram(reference.number)).join('')
      : '';
    byId('tutorial-prev').disabled = tutorialIndex === 0;
    byId('tutorial-next').innerHTML = current === tutorialSteps.length ? 'Concluir' : 'Próximo ' + icon('right');
    loadExample(example);
    if (focusStep) heading.focus();
  }

  function paintActivity() {
    const activity = state.activity;
    byId('activity-title').textContent = activity.title;
    byId('activity-description').textContent = activity.description;
    byId('activity-question').textContent = activity.question;
    activityOptions.innerHTML = activity.options.map((option, index) => `
      <label><input type="radio" name="prediction" value="${index}"><span>${option}</span></label>`).join('');
    const prediction = predictions.get(activity.id);
    if (prediction !== undefined) activityOptions.querySelectorAll('input')[prediction].checked = true;
    testActivityButton.disabled = prediction === undefined;

    for (const button of activityButtons) {
      if (button.dataset.activity === activity.id) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    }
  }

  function paintActivityResult() {
    const activity = state.activeResult;
    const example = activity && examples.find(entry => entry.id === activity.id);
    const visible = Boolean(example && isCurrentExample(example));
    byId('activity-result').hidden = !visible;
    if (!visible) return;

    const prediction = predictions.get(activity.id);
    const match = prediction === activity.answer;
    byId('activity-feedback').textContent = match
      ? 'Sua previsão se confirmou.'
      : `Sua previsão foi “${activity.options[prediction]}”. O resultado mostra “${activity.options[activity.answer]}”.`;
    byId('activity-explanation').textContent = example.explanation;
  }

  let audio;

  async function playSound(increasing) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!state.sound || !Audio) return;
    try {
      audio ??= new Audio();
      if (audio.state === 'suspended') await audio.resume();
      if (!state.sound) return;
      const tone = audio.createOscillator();
      const gain = audio.createGain();
      const now = audio.currentTime;
      tone.type = 'sine';
      tone.frequency.setValueAtTime(increasing ? 375 : 520, now);
      tone.frequency.exponentialRampToValueAtTime(increasing ? 580 : 335, now + .15);
      gain.gain.setValueAtTime(.001, now);
      gain.gain.exponentialRampToValueAtTime(.065, now + .035);
      gain.gain.exponentialRampToValueAtTime(.001, now + .19);
      tone.connect(gain).connect(audio.destination);
      tone.start(now);
      tone.stop(now + .2);
    } catch {
      // Restrições de áudio do navegador não interrompem a interação.
    }
  }

  for (const button of panelButtons) {
    button.addEventListener('click', () => showPanel(button.dataset.panel));
  }

  for (const button of modeButtons) {
    button.addEventListener('click', () => {
      const mode = button.dataset.mode;
      if (mode === state.mode) return;
      cancelReplay();
      state.mode = mode;
      if (mode === 'linked') {
        const element = elementBySymbol.get(state.a.symbol);
        const b = state.b.symbol === element.symbol ? state.b : { symbol: element.symbol, charge: element.preferredIon?.charge ?? 0 };
        state.a = { symbol: element.symbol, charge: 0 };
        state.b = b;
        state.edit = 'b';
      }
      paintLab();
    });
  }

  for (const button of editButtons) {
    button.addEventListener('click', () => {
      state.edit = button.dataset.edit;
      paintControls(describeSpecies(state[state.edit]));
    });
  }

  for (const button of exampleButtons) {
    button.addEventListener('click', () => {
      state.activeResult = null;
      loadExample(examples.find(example => example.id === button.dataset.example));
      announceSpecies('b');
      if (matchMedia('(max-width: 900px)').matches) {
        byId('comparison-title').focus({ preventScroll: true });
        byId('comparison-title').scrollIntoView({ block: 'start', behavior: motionEnabled() ? 'smooth' : 'auto' });
      }
    });
  }

  for (const button of activityButtons) {
    button.addEventListener('click', () => {
      state.activity = activities.find(activity => activity.id === button.dataset.activity);
      paintActivity();
    });
  }

  addButton.addEventListener('click', () => updateElectrons(describeSpecies(state[state.edit]).electrons + 1));
  removeButton.addEventListener('click', () => updateElectrons(describeSpecies(state[state.edit]).electrons - 1));
  countInput.addEventListener('change', () => updateElectrons(countInput.valueAsNumber));
  countInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') updateElectrons(countInput.valueAsNumber);
  });
  ionButton.addEventListener('click', () => {
    const { element } = describeSpecies(state[state.edit]);
    const reference = element.preferredIon;
    if (reference) updateElectrons(element.z - reference.charge, reference);
  });
  resetButton.addEventListener('click', () => updateElectrons(describeSpecies(state[state.edit]).element.z));

  activityOptions.addEventListener('change', event => {
    predictions.set(state.activity.id, Number(event.target.value));
    testActivityButton.disabled = false;
  });
  testActivityButton.addEventListener('click', () => {
    state.activeResult = state.activity;
    loadExample(examples.find(example => example.id === state.activity.id));
    showPanel('lab');
    byId('announcement').textContent = byId('activity-feedback').textContent + ' ' + byId('activity-explanation').textContent;
  });
  byId('return-to-activity').addEventListener('click', () => {
    state.activity = state.activeResult;
    paintActivity();
    showPanel('activities');
  });
  byId('dismiss-activity').addEventListener('click', () => {
    state.activeResult = null;
    paintActivityResult();
    byId('comparison-title').focus();
  });

  byId('tutorial-prev').addEventListener('click', () => {
    if (tutorialIndex > 0) {
      tutorialIndex--;
      paintTutorial(true);
    }
  });
  byId('tutorial-next').addEventListener('click', () => {
    if (tutorialIndex === tutorialSteps.length - 1) {
      tutorialIndex = 0;
      showPanel('lab');
      return;
    }
    tutorialIndex++;
    paintTutorial(true);
  });
  byId('tutorial-reset').addEventListener('click', () => paintTutorial());

  replayButton.addEventListener('click', replayIonFormation);

  motionButton.addEventListener('click', () => {
    cancelReplay();
    state.motion = String(!motionEnabled());
    savePreference('movimento', state.motion);
    paintPreferences();
    paintLab();
  });
  soundButton.addEventListener('click', () => {
    state.sound = !state.sound;
    savePreference('som', state.sound);
    paintPreferences();
    if (state.sound) playSound(true);
  });
  reducedMotion.addEventListener('change', () => {
    if (!motionEnabled()) cancelReplay();
    paintPreferences();
    paintLab();
  });

  createPeriodicTable(openPeriodicIon);
  paintPreferences();
  paintLab();
  paintActivity();
})();
