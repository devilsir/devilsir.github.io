(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const sceneIndex = Number(document.body.dataset.sceneIndex || 0);
  const lines = $$('.line');
  const lab = $('#lab');
  const playButton = $('#play');
  const pauseButton = $('#pause');
  const resetButton = $('#reset');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentLine = 0;
  let playing = false;
  let sceneMode = 'guided';
  let resizeTimer = null;
  let infoTimer = null;

  function post(type, payload = {}) {
    window.parent.postMessage({ source: 'marcha-scene', type, sceneIndex, ...payload }, '*');
  }

  function currentText(index = currentLine) {
    return (lines[index]?.textContent || '').trim().replace(/\s+/g, ' ');
  }

  function updatePoemState() {
    let activeIndex = lines.findIndex(line => line.classList.contains('active'));
    if (activeIndex < 0) activeIndex = currentLine;
    currentLine = Math.max(0, activeIndex);
    lines.forEach((line, index) => line.classList.toggle('completed', index < currentLine));
    const progress = $('.poem-progress span');
    if (progress) progress.style.width = `${lines.length <= 1 ? 0 : (currentLine / (lines.length - 1)) * 100}%`;
    const active = lines[currentLine];
    if (active && !reduceMotion) active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    const complete = lines.length > 0 && currentLine === lines.length - 1;
    post('step', { current: currentLine, total: lines.length || 1, text: currentText(), complete });
    if (complete) {
      playing = false;
      document.body.dataset.playing = 'false';
      post('playing', { playing: false });
      post('complete');
    }
  }

  function setPlaying(value) {
    playing = Boolean(value);
    document.body.dataset.playing = String(playing);
    post('playing', { playing });
  }

  function insertPoemProgress() {
    const poem = $('.poem');
    if (!poem || $('.poem-progress')) return;
    const progress = document.createElement('div');
    progress.className = 'poem-progress';
    progress.setAttribute('aria-hidden', 'true');
    progress.innerHTML = '<span></span>';
    poem.prepend(progress);

    const hint = document.createElement('div');
    hint.className = 'explore-hint';
    hint.textContent = 'Explore a bancada: selecione reagentes, tubos e precipitados para inspecionar cada observação.';
    poem.parentElement.insertBefore(hint, poem);
  }

  function markChemistryTerms() {
    const pattern = /(HCl|NH₃|H₂S|\(NH₄\)₂S|Pb²⁺|Ag⁺|Hg\(I\)|Bi|Cu|Au|Pt|Cd|Sb|Sn\(II\)|Sn\(IV\)|As|Cr|Al|Fe|Zn|Ni|Co|Mn|Sr|Ba|Ca|Mg|NH₄⁺|Na|K|Li)/g;
    lines.forEach(line => {
      const text = line.textContent;
      if (!pattern.test(text)) { pattern.lastIndex = 0; return; }
      pattern.lastIndex = 0;
      line.innerHTML = text.replace(pattern, '<span class="chem-term">$1</span>');
    });
  }

  function enhanceLines() {
    lines.forEach((line, index) => {
      line.tabIndex = 0;
      line.setAttribute('role', 'button');
      line.setAttribute('aria-label', `Ir para o verso ${index + 1}: ${line.textContent.trim()}`);
      line.title = 'Clique para sincronizar a reação com este verso';
      line.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          line.click();
        }
      });
      line.addEventListener('click', () => {
        currentLine = index;
        setPlaying(false);
        requestAnimationFrame(updatePoemState);
      });
    });
  }

  function addSvgEnhancements() {
    if (!lab) return;
    const ns = 'http://www.w3.org/2000/svg';
    let defs = $('defs', lab);
    if (!defs) {
      defs = document.createElementNS(ns, 'defs');
      lab.prepend(defs);
    }
    const unique = `s${sceneIndex}`;
    defs.insertAdjacentHTML('beforeend', `
      <linearGradient id="marchGlass" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#effaff" stop-opacity=".16"/>
        <stop offset=".28" stop-color="#8edfff" stop-opacity=".035"/>
        <stop offset=".7" stop-color="#ffffff" stop-opacity=".08"/>
        <stop offset="1" stop-color="#9bdfff" stop-opacity=".03"/>
      </linearGradient>
      <filter id="marchGlassShadow" x="-30%" y="-30%" width="160%" height="180%">
        <feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#000713" flood-opacity=".42"/>
      </filter>
      <filter id="marchReactionGlow" x="-60%" y="-100%" width="220%" height="260%">
        <feGaussianBlur stdDeviation="2.3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="marchDropGlow" x="-200%" y="-200%" width="500%" height="500%">
        <feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="marchFlameGlow" x="-120%" y="-120%" width="340%" height="340%">
        <feGaussianBlur stdDeviation="3.4" result="glow"/><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <pattern id="marchMicroGrid${unique}" width="26" height="26" patternUnits="userSpaceOnUse">
        <path d="M26 0H0V26" fill="none" stroke="#8edfff" stroke-opacity=".07" stroke-width="1"/>
      </pattern>`);

    const viewBox = lab.viewBox?.baseVal;
    if (viewBox?.width) {
      const bg = document.createElementNS(ns, 'rect');
      bg.setAttribute('x', String(viewBox.x)); bg.setAttribute('y', String(viewBox.y));
      bg.setAttribute('width', String(viewBox.width)); bg.setAttribute('height', String(viewBox.height));
      bg.setAttribute('fill', `url(#marchMicroGrid${unique})`); bg.setAttribute('pointer-events', 'none');
      lab.insertBefore(bg, lab.firstChild.nextSibling);
    }

    $$('.tube', lab).forEach(tube => {
      if ($('.measure-marks', tube)) return;
      const marks = document.createElementNS(ns, 'g');
      marks.setAttribute('class', 'measure-marks');
      [62, 92, 122, 152].forEach((y, index) => {
        const mark = document.createElementNS(ns, 'line');
        mark.setAttribute('class', 'measure-mark');
        mark.setAttribute('x1', '7'); mark.setAttribute('x2', index % 2 ? '16' : '20');
        mark.setAttribute('y1', String(y)); mark.setAttribute('y2', String(y));
        marks.appendChild(mark);
      });
      tube.appendChild(marks);
    });

    $$('[id^="liq"], #unknownLiquid, .liquid', lab).forEach(liquid => {
      if (liquid.tagName.toLowerCase() !== 'rect' || liquid.dataset.meniscusAdded) return;
      liquid.dataset.meniscusAdded = 'true';
      const x = Number(liquid.getAttribute('x') || 0);
      const y = Number(liquid.getAttribute('y') || 0);
      const width = Number(liquid.getAttribute('width') || 0);
      if (!width) return;
      const ellipse = document.createElementNS(ns, 'ellipse');
      ellipse.setAttribute('class', 'liquid-meniscus');
      ellipse.setAttribute('cx', String(x + width / 2)); ellipse.setAttribute('cy', String(y + 1));
      ellipse.setAttribute('rx', String(Math.max(3, width / 2 - 1))); ellipse.setAttribute('ry', '3');
      ellipse.setAttribute('fill', getComputedStyle(liquid).fill || liquid.getAttribute('fill') || '#8fdcff');
      liquid.parentNode.insertBefore(ellipse, liquid.nextSibling);
    });
  }

  function createInfoCard() {
    const labCard = lab?.closest('.card');
    if (!labCard || $('.chem-info', labCard)) return;
    const card = document.createElement('div');
    card.className = 'chem-info';
    card.setAttribute('role', 'status');
    card.innerHTML = '<button type="button" class="chem-info-close" aria-label="Fechar informação">×</button><span class="chem-info-kicker">Informação química</span><strong></strong><p></p>';
    card.querySelector('.chem-info-close').addEventListener('click', () => card.classList.remove('is-visible'));
    labCard.appendChild(card);

    const status = document.createElement('div');
    status.className = 'scene-status';
    status.innerHTML = '<i></i><span>Reação pronta</span>';
    labCard.appendChild(status);
  }

  function objectInfo(target) {
    const group = target.closest?.('.tube, .pipette, [id^="rack"], [id^="beaker"], [id^="b"], [id^="grp"]') || target;
    const labels = $$('text', group).map(text => text.textContent.trim()).filter(Boolean);
    const id = group.id || target.id || '';
    let name = labels[0] || id.replace(/^(ppt|liq|t|pip|b|grp)/, '') || 'Elemento da bancada';
    let detail = labels.slice(1).join(' — ');
    if (!detail) {
      if (/ppt|so4/i.test(id)) detail = 'Precipitado ou produto sólido associado à observação desta etapa.';
      else if (/liq/i.test(id)) detail = 'Solução presente no recipiente durante esta etapa.';
      else if (/pip/i.test(id)) detail = 'Reagente aplicado ao recipiente indicado pela sequência.';
      else detail = 'Selecione os versos para relacionar este elemento à reação correspondente.';
    }
    return { name, detail, group };
  }

  function showObjectInfo(target) {
    const card = $('.chem-info');
    if (!card) return;
    const { name, detail, group } = objectInfo(target);
    $$('[data-chem-interactive].chem-selected').forEach(item => item.classList.remove('chem-selected'));
    group.classList?.add('chem-selected');
    $('strong', card).textContent = name;
    $('p', card).textContent = detail;
    card.classList.add('is-visible');
    clearTimeout(infoTimer);
    infoTimer = setTimeout(() => card.classList.remove('is-visible'), 7000);
    post('sound', { kind: /pip/i.test(group.id) ? 'glass' : 'reaction' });
  }

  function enhanceInteractiveObjects() {
    if (!lab) return;
    const objects = $$('.tube, .pipette, [id^="ppt"], [id^="so4"], [id^="liq"], #unknownLiquid, .burner, [data-ion]', lab);
    objects.forEach(object => {
      object.dataset.chemInteractive = 'true';
      object.tabIndex = 0;
      object.setAttribute('role', 'button');
      object.setAttribute('aria-label', `Inspecionar ${objectInfo(object).name}`);
      object.addEventListener('click', event => {
        if (sceneMode !== 'explore') return;
        event.stopPropagation();
        showObjectInfo(object);
      });
      object.addEventListener('keydown', event => {
        if (sceneMode === 'explore' && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          showObjectInfo(object);
        }
      });
    });
  }

  function addReactionParticles(element, dissolving = false) {
    if (!lab || reduceMotion) return;
    const ns = 'http://www.w3.org/2000/svg';
    const parent = element.parentNode;
    const x = Number(element.getAttribute('x') || 0);
    const y = Number(element.getAttribute('y') || 0);
    const width = Number(element.getAttribute('width') || 50);
    const height = Number(element.getAttribute('height') || 14);
    const fill = getComputedStyle(element).fill || element.getAttribute('fill') || '#fff';
    const count = dissolving ? 12 : 16;
    for (let i = 0; i < count; i += 1) {
      const particle = document.createElementNS(ns, 'circle');
      particle.setAttribute('cx', String(x + 5 + Math.random() * Math.max(4, width - 10)));
      particle.setAttribute('cy', String(y + Math.random() * Math.max(5, height)));
      particle.setAttribute('r', String(1.1 + Math.random() * 1.8));
      particle.setAttribute('fill', fill);
      if (dissolving) {
        particle.setAttribute('class', 'dissolve-particle');
        particle.style.setProperty('--dx', `${-14 + Math.random() * 28}px`);
        particle.style.setProperty('--dy', `${-8 - Math.random() * 28}px`);
      } else {
        particle.setAttribute('class', 'reaction-particle');
        particle.style.setProperty('--particle-y', `${15 + Math.random() * 24}px`);
        particle.style.setProperty('--particle-delay', `${Math.random() * 180}ms`);
      }
      parent.appendChild(particle);
      setTimeout(() => particle.remove(), 1400);
    }
  }

  function addRipple(drop) {
    if (!lab || reduceMotion) return;
    const ns = 'http://www.w3.org/2000/svg';
    const cx = Number(drop.getAttribute('cx') || 0);
    const cy = Number(drop.getAttribute('cy') || 0) + 170;
    const ripple = document.createElementNS(ns, 'ellipse');
    ripple.setAttribute('class', 'reaction-ripple');
    ripple.setAttribute('cx', String(cx)); ripple.setAttribute('cy', String(cy));
    ripple.setAttribute('rx', '15'); ripple.setAttribute('ry', '4');
    drop.parentNode.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
  }

  function observeReactions() {
    $$('[id^="ppt"], [id^="so4"]', lab || document).forEach(element => {
      let visible = Number(getComputedStyle(element).opacity) > .2;
      const observer = new MutationObserver(() => {
        const nowVisible = Number(getComputedStyle(element).opacity) > .2;
        if (nowVisible && !visible) {
          element.classList.add('is-forming');
          addReactionParticles(element, false);
          post('sound', { kind: 'reaction' });
          setTimeout(() => element.classList.remove('is-forming'), 900);
        } else if (!nowVisible && visible) {
          addReactionParticles(element, true);
        }
        visible = nowVisible;
      });
      observer.observe(element, { attributes: true, attributeFilter: ['style', 'opacity', 'fill', 'height', 'y'] });
    });

    $$('.drop', lab || document).forEach(drop => {
      const observer = new MutationObserver(() => {
        if (drop.classList.contains('fall')) {
          post('sound', { kind: 'drop' });
          setTimeout(() => addRipple(drop), 680);
        }
      });
      observer.observe(drop, { attributes: true, attributeFilter: ['class'] });
    });
  }

  function sendHeight() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const height = Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
      post('height', { height });
    }, 60);
  }

  function play() {
    if (pauseButton?.textContent.includes('Retomar')) pauseButton.click();
    else playButton?.click();
    setPlaying(true);
  }

  function pause() {
    if (!playing) {
      setPlaying(false);
      return;
    }
    if (!pauseButton?.textContent.includes('Retomar')) pauseButton?.click();
    setPlaying(false);
  }

  function reset() {
    resetButton?.click();
    currentLine = 0;
    setPlaying(false);
    requestAnimationFrame(updatePoemState);
  }

  function jump(index) {
    const line = lines[Math.max(0, Math.min(lines.length - 1, Number(index) || 0))];
    line?.click();
    requestAnimationFrame(updatePoemState);
  }

  function replay() {
    const target = currentLine;
    if (target > 0) lines[target - 1]?.click();
    setTimeout(() => lines[target]?.click(), 90);
  }

  function setMode(mode) {
    sceneMode = mode === 'explore' ? 'explore' : 'guided';
    document.body.dataset.sceneMode = sceneMode;
    if (sceneMode === 'explore') pause();
  }

  function handleMessage(event) {
    const data = event.data;
    if (!data || data.source !== 'marcha-shell') return;
    if (data.command === 'init') {
      window.__marchSpeed = Number(data.speed) || 1;
      document.documentElement.style.setProperty('--scene-speed', String(window.__marchSpeed));
      setMode(data.mode);
      document.body.classList.toggle('scene-inactive', data.active === false);
      post('ready', { total: lines.length || 1, current: currentLine, text: currentText(), height: document.documentElement.scrollHeight });
    } else if (data.command === 'play') play();
    else if (data.command === 'pause') pause();
    else if (data.command === 'previous') jump(currentLine - 1);
    else if (data.command === 'next') jump(currentLine + 1);
    else if (data.command === 'replay') replay();
    else if (data.command === 'reset') reset();
    else if (data.command === 'jump') jump(data.index);
    else if (data.command === 'speed') {
      window.__marchSpeed = Number(data.speed) || 1;
      document.documentElement.style.setProperty('--scene-speed', String(window.__marchSpeed));
    } else if (data.command === 'mode') setMode(data.mode);
    else if (data.command === 'visibility') {
      document.body.classList.toggle('scene-inactive', data.active === false);
      if (data.active === false && playing) pause();
    } else if (data.command === 'progressReset') {
      lines.forEach(line => line.classList.remove('completed'));
    }
  }

  function initialize() {
    document.body.dataset.playing = 'false';
    insertPoemProgress();
    markChemistryTerms();
    enhanceLines();
    addSvgEnhancements();
    createInfoCard();
    enhanceInteractiveObjects();
    observeReactions();

    const activeObserver = new MutationObserver(updatePoemState);
    lines.forEach(line => activeObserver.observe(line, { attributes: true, attributeFilter: ['class'] }));

    playButton?.addEventListener('click', () => setTimeout(() => setPlaying(true), 0));
    pauseButton?.addEventListener('click', () => setTimeout(() => setPlaying(!pauseButton.textContent.includes('Retomar')), 0));
    resetButton?.addEventListener('click', () => setTimeout(() => { currentLine = 0; setPlaying(false); updatePoemState(); }, 0));

    const resizeObserver = new ResizeObserver(sendHeight);
    resizeObserver.observe(document.body);
    window.addEventListener('message', handleMessage);
    window.addEventListener('load', sendHeight, { once: true });
    updatePoemState();
    post('ready', { total: lines.length || 1, current: currentLine, text: currentText(), height: document.documentElement.scrollHeight });
  }

  initialize();
})();
