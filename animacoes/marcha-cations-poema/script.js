(() => {
  'use strict';

  const sections = [
    {
      label: 'Estrofes 1 e 2',
      title: 'Grupo dos cloretos',
      description: 'Observe a formação do precipitado branco e sua resposta à amônia.',
      ready: 'Pronto para iniciar a sequência dos cloretos.'
    },
    {
      label: 'Estrofe 3',
      title: 'Sulfetos em meio ácido',
      description: 'Acompanhe o H₂S, as cores dos sulfetos e a dissolução seletiva.',
      ready: 'Pronto para borbulhar H₂S e comparar os sulfetos.'
    },
    {
      label: 'Estrofe 4',
      title: 'Sulfeto de amônio',
      description: 'Compare os precipitados de Fe, Ni, Co, Al, Zn, Cr e Mn.',
      ready: 'Pronto para observar o sobrenadante neutralizado.'
    },
    {
      label: 'Estrofes 5 e 6',
      title: 'Chama e reagentes seletivos',
      description: 'Identifique alcalino-terrosos, alcalinos e amônio por suas respostas características.',
      ready: 'Pronto para iniciar os testes de chama e seletividade.'
    },
    {
      label: 'Fluxograma',
      title: 'Síntese da marcha analítica',
      description: 'Explore, apresente ou edite o caminho completo da identificação dos cátions.',
      ready: 'Fluxograma carregado. Selecione um bloco para ver a explicação.'
    }
  ];

  const questions = [
    {
      question: 'O que acontece com o AgCl ao receber NH₃?',
      answers: ['Permanece sem alteração', 'Dissolve, formando o complexo de prata', 'Libera uma chama lilás', 'Fica amarelo'],
      correct: 1,
      explanation: 'O AgCl dissolve em amônia, formando o complexo [Ag(NH₃)₂]⁺.'
    },
    {
      question: 'Qual observação identifica o sulfeto de cádmio nesta cena?',
      answers: ['Precipitado amarelo', 'Precipitado verde-maçã', 'Escurecimento instantâneo', 'Ausência de precipitado'],
      correct: 0,
      explanation: 'Na cena, o Cd aparece com precipitado amarelo, em contraste com os sulfetos negros e alaranjados.'
    },
    {
      question: 'Qual cor é associada ao precipitado de Cr nesta etapa?',
      answers: ['Rosa', 'Branco', 'Verde-maçã', 'Preto'],
      correct: 2,
      explanation: 'O cromo é apresentado com precipitado verde-maçã; Mn é róseo, Al/Zn são brancos e Fe/Ni/Co são pretos.'
    },
    {
      question: 'Qual é a cor característica da chama do potássio?',
      answers: ['Amarela', 'Lilás', 'Verde', 'Alaranjada'],
      correct: 1,
      explanation: 'O potássio é reconhecido pela chama lilás; o sódio aparece com chama amarela.'
    }
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const storageKey = 'marcha-cations-progress-v2';

  const frames = $$('.scene-frame');
  const navSteps = $$('.nav-step');
  const modeButtons = $$('.mode-button');
  const state = {
    activeIndex: 0,
    mode: 'guided',
    speed: 1,
    sound: false,
    playing: false,
    completed: new Set(),
    scenes: frames.map(() => ({ ready: false, current: 0, total: 1, text: '', height: 760 }))
  };

  const refs = {
    intro: $('#intro'),
    skipIntro: $('#skipIntro'),
    currentSectionLabel: $('#currentSectionLabel'),
    globalProgressText: $('#globalProgressText'),
    globalProgressBar: $('#globalProgressBar'),
    globalProgressFill: $('#globalProgressFill'),
    navProgressLine: $('#navProgressLine'),
    playPause: $('#playPause'),
    previousStep: $('#previousStep'),
    nextStep: $('#nextStep'),
    replayStep: $('#replayStep'),
    resetScene: $('#resetScene'),
    speedSelect: $('#speedSelect'),
    modeLabel: $('#modeLabel'),
    stepDescription: $('#stepDescription'),
    stepScrubber: $('#stepScrubber'),
    scrubberProgress: $('#scrubberProgress'),
    stepCounter: $('#stepCounter'),
    frameStage: $('#frameStage'),
    frameLoader: $('#frameLoader'),
    footerSectionTitle: $('#footerSectionTitle'),
    footerSectionText: $('#footerSectionText'),
    resetProgress: $('#resetProgress'),
    soundToggle: $('#soundToggle'),
    aboutButton: $('#aboutButton'),
    aboutDialog: $('#aboutDialog'),
    legendButton: $('#legendButton'),
    legendDialog: $('#legendDialog'),
    knowledgeButton: $('#knowledgeButton'),
    knowledgeDialog: $('#knowledgeDialog'),
    knowledgeQuestion: $('#knowledgeQuestion'),
    knowledgeAnswers: $('#knowledgeAnswers'),
    knowledgeFeedback: $('#knowledgeFeedback'),
    retryKnowledge: $('#retryKnowledge'),
    toastRegion: $('#toastRegion'),
    screenReaderStatus: $('#screenReaderStatus')
  };

  let audioContext = null;
  let transitionTimer = null;
  let introTimer = null;

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (Number.isInteger(saved.activeIndex)) state.activeIndex = Math.max(0, Math.min(4, saved.activeIndex));
      if (Array.isArray(saved.completed)) state.completed = new Set(saved.completed.filter(i => Number.isInteger(i) && i >= 0 && i < 5));
      if (saved.mode === 'guided' || saved.mode === 'explore') state.mode = saved.mode;
      if ([0.75, 1, 1.25, 1.5].includes(Number(saved.speed))) state.speed = Number(saved.speed);
    } catch (error) {
      console.warn('Não foi possível ler o progresso salvo.', error);
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        activeIndex: state.activeIndex,
        completed: [...state.completed],
        mode: state.mode,
        speed: state.speed
      }));
    } catch (error) {
      console.warn('Não foi possível salvar o progresso.', error);
    }
  }

  function createParticles() {
    if (reduceMotion) return;
    const count = window.innerWidth < 700 ? 12 : 28;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i += 1) {
      const particle = document.createElement('i');
      particle.style.setProperty('--x', `${Math.random() * 100}%`);
      particle.style.setProperty('--dur', `${10 + Math.random() * 17}s`);
      particle.style.setProperty('--delay', `${-Math.random() * 18}s`);
      const size = 1 + Math.random() * 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      fragment.appendChild(particle);
    }
    $('#ambientParticles').appendChild(fragment);
  }

  function closeIntro() {
    if (!refs.intro || refs.intro.classList.contains('is-hidden')) return;
    clearTimeout(introTimer);
    refs.intro.classList.add('is-hidden');
    document.body.classList.remove('is-intro');
    setTimeout(() => refs.intro.setAttribute('aria-hidden', 'true'), reduceMotion ? 20 : 600);
  }

  function showDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  function toast(message, type = 'info', options = {}) {
    const item = document.createElement('div');
    item.className = `toast ${type}`;
    item.setAttribute('role', type === 'error' ? 'alert' : 'status');
    const text = document.createElement('span');
    text.textContent = message;
    item.appendChild(text);
    if (options.actionLabel && typeof options.onAction === 'function') {
      const action = document.createElement('button');
      action.type = 'button';
      action.className = 'text-button';
      action.textContent = options.actionLabel;
      action.addEventListener('click', () => {
        options.onAction();
        removeToast(item);
      });
      item.appendChild(action);
    }
    refs.toastRegion.appendChild(item);
    const lifetime = options.duration || (options.actionLabel ? 7000 : 3600);
    setTimeout(() => removeToast(item), lifetime);
  }

  function removeToast(item) {
    if (!item?.isConnected || item.classList.contains('is-out')) return;
    item.classList.add('is-out');
    setTimeout(() => item.remove(), 280);
  }

  function announce(message) {
    refs.screenReaderStatus.textContent = '';
    requestAnimationFrame(() => { refs.screenReaderStatus.textContent = message; });
  }

  function confirmInApp({ title, message, confirmLabel = 'Confirmar', danger = false }) {
    return new Promise(resolve => {
      const dialog = document.createElement('dialog');
      dialog.className = 'glass-dialog';
      dialog.innerHTML = `
        <form method="dialog" class="dialog-shell">
          <div class="dialog-header">
            <div><span class="dialog-kicker">Confirmação</span><h2>${escapeHtml(title)}</h2></div>
            <button class="dialog-close" value="cancel" aria-label="Fechar">×</button>
          </div>
          <div class="dialog-content">
            <p>${escapeHtml(message)}</p>
            <div class="dialog-actions">
              <button class="text-button" value="cancel">Cancelar</button>
              <button class="secondary-action" value="confirm" ${danger ? 'style="border-color:rgba(255,139,147,.55);color:#ffd4d7"' : ''}>${escapeHtml(confirmLabel)}</button>
            </div>
          </div>
        </form>`;
      document.body.appendChild(dialog);
      dialog.addEventListener('close', () => {
        resolve(dialog.returnValue === 'confirm');
        dialog.remove();
      }, { once: true });
      showDialog(dialog);
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  }

  function frameForIndex(index = state.activeIndex) {
    return frames[index];
  }

  function postToScene(command, payload = {}, index = state.activeIndex) {
    const frame = frameForIndex(index);
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage({ source: 'marcha-shell', command, ...payload }, '*');
  }

  function syncSceneSettings(index = state.activeIndex) {
    postToScene('init', {
      index,
      mode: state.mode,
      speed: state.speed,
      active: index === state.activeIndex,
      completed: [...state.completed]
    }, index);
  }

  function setPlaying(value) {
    state.playing = Boolean(value);
    refs.playPause.classList.toggle('is-playing', state.playing);
    refs.playPause.setAttribute('aria-label', state.playing ? 'Pausar experiência' : 'Reproduzir experiência');
    refs.playPause.title = state.playing ? 'Pausar' : 'Reproduzir';
  }

  function updateSceneReadout() {
    const scene = state.scenes[state.activeIndex];
    const total = Math.max(1, scene.total || 1);
    const current = Math.max(0, Math.min(total - 1, scene.current || 0));
    refs.stepScrubber.max = String(total - 1);
    refs.stepScrubber.value = String(current);
    refs.stepCounter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    const percent = total <= 1 ? 0 : (current / (total - 1)) * 100;
    refs.scrubberProgress.style.width = `${percent}%`;
    refs.stepDescription.textContent = scene.text || sections[state.activeIndex].ready;
  }

  function updateGlobalProgress() {
    const scene = state.scenes[state.activeIndex];
    const partial = state.activeIndex < 4 && !state.completed.has(state.activeIndex)
      ? Math.max(0, Math.min(1, (scene.current + 1) / Math.max(scene.total, 1)))
      : 0;
    const raw = (state.completed.size + partial) / sections.length;
    const percent = Math.round(Math.min(1, raw) * 100);
    refs.globalProgressText.textContent = `${percent}%`;
    refs.globalProgressFill.style.width = `${percent}%`;
    refs.globalProgressBar.setAttribute('aria-valuenow', String(percent));

    navSteps.forEach((step, index) => step.classList.toggle('is-complete', state.completed.has(index)));
    const navPercent = state.activeIndex === 0 ? 0 : (state.activeIndex / (sections.length - 1)) * 100;
    refs.navProgressLine.style.width = `${navPercent}%`;
  }

  function updateModeUI() {
    document.body.dataset.mode = state.mode;
    modeButtons.forEach(button => {
      const active = button.dataset.mode === state.mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    refs.modeLabel.textContent = state.mode === 'guided' ? 'Modo guiado' : 'Modo exploração';
    postToScene('mode', { mode: state.mode });
  }

  function updateSectionUI() {
    const section = sections[state.activeIndex];
    document.body.dataset.activeScene = String(state.activeIndex);
    refs.currentSectionLabel.textContent = section.label;
    refs.footerSectionTitle.textContent = section.title;
    refs.footerSectionText.textContent = section.description;
    navSteps.forEach((step, index) => {
      const active = index === state.activeIndex;
      step.classList.toggle('is-active', active);
      if (active) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    updateSceneReadout();
    updateGlobalProgress();
  }

  function setFrameHeight(index, requestedHeight) {
    const frame = frameForIndex(index);
    if (!frame || index === 4) return;
    const min = window.innerWidth < 560 ? 720 : window.innerWidth < 820 ? 650 : 560;
    const max = window.innerWidth < 560 ? 1250 : 1150;
    const height = Math.max(min, Math.min(max, Number(requestedHeight) || 760));
    state.scenes[index].height = height;
    frame.style.height = `${height}px`;
    if (index === state.activeIndex) refs.frameStage.style.minHeight = `${height}px`;
  }

  function switchScene(index, options = {}) {
    index = Number(index);
    if (!Number.isInteger(index) || index < 0 || index >= frames.length || index === state.activeIndex) return;
    const oldIndex = state.activeIndex;
    const outgoing = frameForIndex(oldIndex);
    const incoming = frameForIndex(index);
    clearTimeout(transitionTimer);
    setPlaying(false);
    postToScene('visibility', { active: false }, oldIndex);

    state.activeIndex = index;
    saveProgress();
    refs.frameLoader.classList.add('is-visible');

    incoming.hidden = false;
    incoming.classList.remove('is-leaving');
    requestAnimationFrame(() => {
      outgoing.classList.add('is-leaving');
      outgoing.classList.remove('is-active');
      incoming.classList.add('is-active');
      syncSceneSettings(index);
      postToScene('visibility', { active: true }, index);
      updateSectionUI();
      if (index !== 4) setFrameHeight(index, state.scenes[index].height);
      else refs.frameStage.style.minHeight = `${Math.max(620, Math.min(820, window.innerHeight * .76))}px`;
      navSteps[index].scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
      announce(`${sections[index].label}: ${sections[index].title}`);
      playSound('navigation');
    });

    transitionTimer = setTimeout(() => {
      outgoing.hidden = true;
      outgoing.classList.remove('is-leaving');
      refs.frameLoader.classList.remove('is-visible');
    }, reduceMotion ? 30 : 480);

    if (options.focus) refs.frameStage.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function completeScene(index) {
    if (state.completed.has(index)) return;
    state.completed.add(index);
    saveProgress();
    updateGlobalProgress();
    toast(`${sections[index].title} concluído.`, 'success');
    playSound('success');
    announce(`Etapa concluída: ${sections[index].title}`);
  }

  function setupKnowledgeCheck() {
    if (state.activeIndex >= questions.length) return;
    const item = questions[state.activeIndex];
    refs.knowledgeQuestion.textContent = item.question;
    refs.knowledgeAnswers.innerHTML = '';
    refs.knowledgeFeedback.textContent = '';
    refs.knowledgeFeedback.className = 'knowledge-feedback';
    refs.retryKnowledge.hidden = true;

    item.answers.forEach((answer, answerIndex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer-button';
      button.textContent = answer;
      button.addEventListener('click', () => answerKnowledge(button, answerIndex, item));
      refs.knowledgeAnswers.appendChild(button);
    });
    showDialog(refs.knowledgeDialog);
  }

  function answerKnowledge(button, answerIndex, item) {
    const buttons = $$('.answer-button', refs.knowledgeAnswers);
    buttons.forEach(answerButton => { answerButton.disabled = true; });
    const correctButton = buttons[item.correct];
    correctButton.classList.add('is-correct');
    if (answerIndex === item.correct) {
      refs.knowledgeFeedback.textContent = `Correto. ${item.explanation}`;
      refs.knowledgeFeedback.classList.add('success');
      playSound('success');
    } else {
      button.classList.add('is-wrong');
      refs.knowledgeFeedback.textContent = `Ainda não. ${item.explanation}`;
      refs.knowledgeFeedback.classList.add('error');
      refs.retryKnowledge.hidden = false;
      playSound('error');
    }
  }

  function playSound(kind) {
    if (!state.sound) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      const now = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filters = {
        navigation: [330, 520, .045, 'sine'],
        drop: [620, 290, .07, 'sine'],
        reaction: [180, 260, .12, 'triangle'],
        flame: [110, 520, .18, 'sawtooth'],
        success: [440, 740, .13, 'sine'],
        error: [180, 125, .12, 'triangle'],
        glass: [880, 620, .04, 'sine']
      };
      const [start, end, duration, wave] = filters[kind] || filters.reaction;
      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(start, now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, end), now + duration);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.035, now + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + .02);
    } catch (error) {
      console.warn('Som sintetizado indisponível.', error);
    }
  }

  function handleSceneMessage(event) {
    const frameIndex = frames.findIndex(frame => frame.contentWindow === event.source);
    if (frameIndex < 0 || !event.data || event.data.source !== 'marcha-scene') return;
    const data = event.data;
    const scene = state.scenes[frameIndex];

    if (data.type === 'ready') {
      scene.ready = true;
      scene.total = Math.max(1, Number(data.total) || scene.total);
      scene.current = Math.max(0, Number(data.current) || 0);
      scene.text = data.text || scene.text;
      if (data.height) setFrameHeight(frameIndex, data.height);
      syncSceneSettings(frameIndex);
      if (frameIndex === state.activeIndex) refs.frameLoader.classList.remove('is-visible');
    }

    if (data.type === 'height' && data.height) setFrameHeight(frameIndex, data.height);

    if (data.type === 'step') {
      scene.current = Math.max(0, Number(data.current) || 0);
      scene.total = Math.max(1, Number(data.total) || scene.total);
      scene.text = data.text || '';
      if (frameIndex === state.activeIndex) {
        updateSceneReadout();
        updateGlobalProgress();
      }
      if (data.complete) completeScene(frameIndex);
    }

    if (data.type === 'playing' && frameIndex === state.activeIndex) setPlaying(data.playing);
    if (data.type === 'complete') completeScene(frameIndex);
    if (data.type === 'sound') playSound(data.kind);
    if (data.type === 'toast') toast(data.message || 'Ação concluída.', data.level || 'info');
    if (data.type === 'navigate' && Number.isInteger(data.index)) switchScene(data.index, { focus: true });
    if (data.type === 'flowComplete') completeScene(4);
  }

  function bindEvents() {
    refs.skipIntro.addEventListener('click', closeIntro);
    refs.aboutButton.addEventListener('click', () => showDialog(refs.aboutDialog));
    refs.legendButton.addEventListener('click', () => showDialog(refs.legendDialog));
    refs.knowledgeButton.addEventListener('click', setupKnowledgeCheck);
    refs.retryKnowledge.addEventListener('click', setupKnowledgeCheck);

    [refs.aboutDialog, refs.legendDialog, refs.knowledgeDialog].forEach(dialog => {
      dialog.addEventListener('click', event => {
        if (event.target === dialog) closeDialog(dialog);
      });
    });

    navSteps.forEach(step => step.addEventListener('click', () => {
      const index = Number(step.dataset.index);
      switchScene(index, { focus: index === 4 });
    }));

    modeButtons.forEach(button => button.addEventListener('click', () => {
      state.mode = button.dataset.mode;
      setPlaying(false);
      updateModeUI();
      saveProgress();
      toast(state.mode === 'guided' ? 'Modo guiado ativado.' : 'Modo exploração ativado. Clique nos versos e nos materiais.', 'info');
    }));

    refs.playPause.addEventListener('click', () => {
      if (state.activeIndex === 4) return;
      const command = state.playing ? 'pause' : 'play';
      postToScene(command);
      if (command === 'play') playSound('glass');
    });
    refs.previousStep.addEventListener('click', () => postToScene('previous'));
    refs.nextStep.addEventListener('click', () => postToScene('next'));
    refs.replayStep.addEventListener('click', () => postToScene('replay'));
    refs.resetScene.addEventListener('click', async () => {
      const scene = state.scenes[state.activeIndex];
      if (scene.current > 1) {
        const confirmed = await confirmInApp({
          title: 'Reiniciar esta bancada?',
          message: 'A cena voltará ao primeiro verso, mas o progresso global continuará salvo.',
          confirmLabel: 'Reiniciar cena'
        });
        if (!confirmed) return;
      }
      postToScene('reset');
      setPlaying(false);
      toast('Cena reiniciada.', 'info');
    });

    refs.speedSelect.addEventListener('change', () => {
      state.speed = Number(refs.speedSelect.value) || 1;
      postToScene('speed', { speed: state.speed });
      saveProgress();
      toast(`Velocidade ajustada para ${String(state.speed).replace('.', ',')}×.`, 'info');
    });

    refs.stepScrubber.addEventListener('input', () => {
      const value = Number(refs.stepScrubber.value);
      refs.scrubberProgress.style.width = `${value / Math.max(1, Number(refs.stepScrubber.max)) * 100}%`;
    });
    refs.stepScrubber.addEventListener('change', () => postToScene('jump', { index: Number(refs.stepScrubber.value) }));

    refs.soundToggle.addEventListener('click', () => {
      state.sound = !state.sound;
      refs.soundToggle.setAttribute('aria-pressed', String(state.sound));
      refs.soundToggle.setAttribute('aria-label', state.sound ? 'Desativar sons sutis' : 'Ativar sons sutis');
      refs.soundToggle.title = state.sound ? 'Som: ativado' : 'Som: desativado';
      if (state.sound) {
        playSound('success');
        toast('Som sutil ativado.', 'success');
      } else toast('Som desativado.', 'info');
    });

    refs.resetProgress.addEventListener('click', async () => {
      const confirmed = await confirmInApp({
        title: 'Reiniciar todo o progresso?',
        message: 'As etapas concluídas e os caminhos descobertos serão apagados. O conteúdo e o fluxograma editável não serão removidos.',
        confirmLabel: 'Apagar progresso',
        danger: true
      });
      if (!confirmed) return;
      state.completed.clear();
      try { localStorage.removeItem(storageKey); localStorage.removeItem('marcha-flow-discovered'); } catch (_) {}
      frames.forEach((_, index) => postToScene('progressReset', {}, index));
      updateGlobalProgress();
      toast('Progresso reiniciado.', 'success');
    });

    frames.forEach((frame, index) => {
      frame.addEventListener('load', () => {
        state.scenes[index].ready = true;
        syncSceneSettings(index);
        if (index === state.activeIndex) refs.frameLoader.classList.remove('is-visible');
      });
    });

    window.addEventListener('message', handleSceneMessage);
    window.addEventListener('resize', () => {
      if (state.activeIndex !== 4) setFrameHeight(state.activeIndex, state.scenes[state.activeIndex].height);
    }, { passive: true });

    document.addEventListener('keydown', event => {
      const tag = event.target?.tagName?.toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || event.target?.isContentEditable;
      if (typing) return;
      if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault();
        switchScene(Math.min(4, state.activeIndex + 1), { focus: true });
      } else if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        switchScene(Math.max(0, state.activeIndex - 1), { focus: true });
      } else if (event.code === 'Space' && state.activeIndex < 4) {
        event.preventDefault();
        postToScene(state.playing ? 'pause' : 'play');
      }
    });

    document.addEventListener('visibilitychange', () => postToScene('visibility', { active: !document.hidden }));
  }

  function initialize() {
    loadProgress();
    createParticles();
    refs.speedSelect.value = String(state.speed);
    updateModeUI();

    frames.forEach((frame, index) => {
      const active = index === state.activeIndex;
      frame.hidden = !active;
      frame.classList.toggle('is-active', active);
    });
    updateSectionUI();
    refs.frameLoader.classList.add('is-visible');
    bindEvents();
    introTimer = setTimeout(closeIntro, reduceMotion ? 300 : 1450);
  }

  initialize();
})();
