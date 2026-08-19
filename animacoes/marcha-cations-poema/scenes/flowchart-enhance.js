(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const parentPost = (type, payload = {}) => window.parent.postMessage({ source: 'marcha-scene', type, sceneIndex: 4, ...payload }, '*');
  const header = document.querySelector('header');
  const side = document.getElementById('side');
  const canvasEl = document.getElementById('canvas');
  const presentationSequence = ['start', 'soluvel', 'hcl', 'h2s', 'nh4_2s', 'earth', 'alkali', 'fim'];
  const nodeSceneMap = { hcl: 0, hcl_precip: 0, h2s: 1, nh4_2s: 2, earth: 3, alkali: 3 };
  const parentMap = {
    start: null,
    soluvel: 'start',
    insol: 'soluvel',
    hcl: 'soluvel',
    hcl_precip: 'hcl',
    h2s: 'hcl',
    nh4_2s: 'h2s',
    earth: 'nh4_2s',
    alkali: 'earth',
    fim: 'alkali'
  };

  let flowMode = 'presentation';
  let showComplete = false;
  let currentPresentationIndex = 0;
  let activeNodeIds = new Set(['start']);
  let activeEdgeKeys = new Set();
  let discoveredIds = new Set(['start']);
  let animationOffset = 0;
  let animationFrame = null;
  let lastAnimationTime = 0;
  let history = [];
  let future = [];
  let historyLocked = false;
  let touchState = null;

  const originalDrawNode = window.drawNode;
  const originalDrawEdge = window.drawEdge;
  const originalSelectNode = window.selectNode;
  const originalImportLayout = window.importLayout;

  function edgeKey(edge) { return `${edge.from}->${edge.to}`; }

  function readDiscovered() {
    try {
      const progress = JSON.parse(localStorage.getItem('marcha-cations-progress-v2') || '{}');
      const completed = new Set(Array.isArray(progress.completed) ? progress.completed : []);
      if (completed.has(0)) ['start', 'soluvel', 'hcl', 'hcl_precip'].forEach(id => discoveredIds.add(id));
      if (completed.has(1)) discoveredIds.add('h2s');
      if (completed.has(2)) discoveredIds.add('nh4_2s');
      if (completed.has(3)) ['earth', 'alkali'].forEach(id => discoveredIds.add(id));
      if (completed.has(4)) discoveredIds.add('fim');
    } catch (_) {}
  }

  function buildPathTo(nodeId) {
    const ids = [];
    let current = nodeId;
    const guard = new Set();
    while (current && !guard.has(current)) {
      guard.add(current);
      ids.unshift(current);
      current = parentMap[current];
    }
    if (nodeId === 'fim' && currentPresentationIndex < presentationSequence.length - 1) {
      return presentationSequence.slice(0, currentPresentationIndex + 1);
    }
    return ids;
  }

  function setActivePath(nodeId) {
    const path = showComplete ? nodes.map(node => node.id) : buildPathTo(nodeId);
    activeNodeIds = new Set(path);
    activeEdgeKeys = new Set();
    for (let index = 0; index < path.length - 1; index += 1) activeEdgeKeys.add(`${path[index]}->${path[index + 1]}`);
    if (nodeId === 'hcl_precip') activeEdgeKeys.add('hcl_precip->fim');
    updatePathStatus(nodeId);
  }

  function updatePathStatus(nodeId) {
    const node = nodes.find(item => item.id === nodeId);
    const status = document.querySelector('.path-status');
    if (status) status.textContent = showComplete ? 'Caminho completo' : (node?.title || 'Etapa inicial');
  }

  function installDrawOverrides() {
    window.drawNode = function enhancedDrawNode(node) {
      const relevant = flowMode === 'editing' || showComplete || activeNodeIds.has(node.id) || discoveredIds.has(node.id);
      ctx.save();
      if (flowMode === 'presentation' && !relevant) ctx.globalAlpha = .68;
      originalDrawNode(node);
      ctx.restore();

      const point = worldToScreen(node.x, node.y);
      const width = node.w * scale;
      const height = node.h * scale;
      const isCurrent = activeNodeIds.has(node.id) && [...activeNodeIds].at(-1) === node.id;

      if (discoveredIds.has(node.id)) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(point.x + width - 10, point.y + 10, Math.max(5, 7 * Math.min(scale, 1)), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(8,28,35,.9)';
        ctx.fill();
        ctx.strokeStyle = '#71e6ac';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#71e6ac';
        ctx.font = `${Math.max(8, 10 * Math.min(scale, 1))}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', point.x + width - 10, point.y + 10.5);
        ctx.restore();
      }

      if (flowMode === 'presentation' && isCurrent) {
        ctx.save();
        roundRect(ctx, point.x - 4, point.y - 4, width + 8, height + 8, Math.max(10, node.r * scale + 4));
        ctx.strokeStyle = '#68e6ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#68e6ff';
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.restore();
      }
    };

    window.drawEdge = function enhancedDrawEdge(edge) {
      const active = activeEdgeKeys.has(edgeKey(edge));
      const relevant = flowMode === 'editing' || showComplete || active || (discoveredIds.has(edge.from) && discoveredIds.has(edge.to));
      ctx.save();
      if (flowMode === 'presentation' && !relevant) ctx.globalAlpha = .48;
      originalDrawEdge(edge);
      ctx.restore();

      if (flowMode === 'presentation' && (active || (showComplete && relevant))) {
        const geometry = getEdgeGeom(edge);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(geometry.A.x, geometry.A.y);
        ctx.bezierCurveTo(geometry.A.x, geometry.ctrlY, geometry.B.x, geometry.ctrlY, geometry.B.x, geometry.BgapY);
        ctx.strokeStyle = active ? 'rgba(104,230,255,.95)' : 'rgba(167,139,250,.55)';
        ctx.lineWidth = active ? 3 : 2;
        ctx.setLineDash(active ? [9, 8] : [5, 10]);
        ctx.lineDashOffset = -animationOffset;
        ctx.shadowColor = active ? '#68e6ff' : '#a78bfa';
        ctx.shadowBlur = active ? 10 : 5;
        ctx.stroke();
        ctx.restore();
      }
    };
  }

  function installSelectionOverride() {
    window.selectNode = function enhancedSelectNode(node) {
      originalSelectNode(node);
      if (flowMode === 'presentation') {
        const sequenceIndex = presentationSequence.indexOf(node.id);
        if (sequenceIndex >= 0) currentPresentationIndex = sequenceIndex;
        setActivePath(node.id);
        addReplayButton(node);
        discoveredIds.add(node.id);
        draw();
      }
    };
  }

  function addReplayButton(node) {
    document.querySelector('.side-replay')?.remove();
    const sceneIndex = nodeSceneMap[node.id];
    if (!Number.isInteger(sceneIndex)) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn side-replay presentation-only';
    button.textContent = '↗ Abrir experimento relacionado';
    button.addEventListener('click', () => parentPost('navigate', { index: sceneIndex }));
    const anchor = side.querySelector('.aside-buttons');
    side.insertBefore(button, anchor || side.children[4] || null);
  }

  function createToolbar() {
    const h1 = header.querySelector('h1');
    h1.textContent = 'Marcha dos Cátions — Fluxograma';

    const modeSwitch = document.createElement('div');
    modeSwitch.className = 'flow-mode-switch';
    modeSwitch.setAttribute('role', 'group');
    modeSwitch.setAttribute('aria-label', 'Modo do fluxograma');
    modeSwitch.innerHTML = `
      <button type="button" class="flow-mode-button is-active" data-flow-mode="presentation" aria-pressed="true">Apresentação</button>
      <button type="button" class="flow-mode-button" data-flow-mode="editing" aria-pressed="false">Edição</button>`;
    h1.after(modeSwitch);

    const separator = document.createElement('span');
    separator.className = 'flow-separator';
    modeSwitch.after(separator);

    const viewTools = document.createElement('div');
    viewTools.className = 'view-tools';
    viewTools.innerHTML = `
      <button type="button" class="btn" id="fitFlowBtn">Ajustar à tela</button>
      <button type="button" class="btn" id="readPositionsBtn">Ler posições</button>`;
    separator.after(viewTools);

    const editorTools = document.createElement('div');
    editorTools.className = 'editor-tools editor-only';
    ['exportPngBtn', 'exportLayoutBtn', 'showPositionsBtn', 'addNodeBtn', 'addEdgeBtn'].forEach(id => {
      const element = document.getElementById(id);
      if (element) editorTools.appendChild(element);
    });
    const undoButton = document.createElement('button');
    undoButton.type = 'button'; undoButton.className = 'btn'; undoButton.id = 'undoBtn'; undoButton.textContent = 'Desfazer';
    const redoButton = document.createElement('button');
    redoButton.type = 'button'; redoButton.className = 'btn'; redoButton.id = 'redoBtn'; redoButton.textContent = 'Refazer';
    editorTools.prepend(redoButton); editorTools.prepend(undoButton);
    viewTools.after(editorTools);

    const importButton = document.getElementById('showPositionsBtn');
    if (importButton) importButton.textContent = 'Importar JSON';
    document.querySelector('.switch')?.classList.add('editor-only');
    document.getElementById('resetBtn')?.classList.add('editor-only');
    ['nodeEditor', 'edgeEditor', 'addEdgePanel', 'groupLegendPanel', 'posDetails'].forEach(id => document.getElementById(id)?.classList.add('editor-only'));
    side.querySelector('.aside-buttons')?.classList.add('editor-only');
    document.querySelector('footer')?.classList.add('editor-only');

    const sideToggle = document.createElement('button');
    sideToggle.type = 'button'; sideToggle.className = 'btn side-toggle'; sideToggle.setAttribute('aria-label', 'Recolher painel lateral'); sideToggle.textContent = '›';
    document.body.appendChild(sideToggle);

    const zoomBadge = document.createElement('div');
    zoomBadge.className = 'zoom-badge'; zoomBadge.textContent = 'Zoom 100%';
    document.body.appendChild(zoomBadge);

    const presentationControls = document.createElement('div');
    presentationControls.className = 'presentation-controls presentation-only';
    presentationControls.innerHTML = `
      <button type="button" class="btn" id="presentationPrev" aria-label="Etapa anterior">← Anterior</button>
      <span class="path-status" aria-live="polite">Etapa inicial</span>
      <button type="button" class="btn" id="presentationNext" aria-label="Próxima etapa">Próxima →</button>
      <button type="button" class="btn" id="showCompletePath">Mostrar caminho completo</button>`;
    document.body.appendChild(presentationControls);

    const modeNote = document.createElement('p');
    modeNote.className = 'mode-note presentation-only';
    modeNote.textContent = 'Modo apresentação: os caminhos relevantes ganham destaque. Selecione um bloco para abrir seus versos e a explicação da reação.';
    side.insertBefore(modeNote, side.firstChild);

    modeSwitch.querySelectorAll('button').forEach(button => button.addEventListener('click', () => setFlowMode(button.dataset.flowMode)));
    document.getElementById('fitFlowBtn').addEventListener('click', fitToScreen);
    document.getElementById('readPositionsBtn').addEventListener('click', () => { updatePositionsPanel(); document.body.classList.remove('side-collapsed'); });
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);
    document.getElementById('presentationPrev').addEventListener('click', () => movePresentation(-1));
    document.getElementById('presentationNext').addEventListener('click', () => movePresentation(1));
    document.getElementById('showCompletePath').addEventListener('click', toggleCompletePath);
    sideToggle.addEventListener('click', () => {
      document.body.classList.toggle('side-collapsed');
      const collapsed = document.body.classList.contains('side-collapsed');
      sideToggle.textContent = collapsed ? '‹' : '›';
      sideToggle.setAttribute('aria-label', collapsed ? 'Abrir painel lateral' : 'Recolher painel lateral');
      setTimeout(resizeCanvas, 360);
    });

    canvasEl.addEventListener('wheel', () => updateZoomBadge(), { passive: true });
  }

  function setFlowMode(mode) {
    flowMode = mode === 'editing' ? 'editing' : 'presentation';
    document.body.dataset.flowMode = flowMode;
    document.querySelectorAll('.flow-mode-button').forEach(button => {
      const active = button.dataset.flowMode === flowMode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (flowMode === 'presentation') {
      nodes.forEach(node => { node.edit = false; });
      edges.forEach(edge => { edge.edit = false; });
      clearSelection();
      focusPresentationNode(currentPresentationIndex, false);
      parentPost('toast', { message: 'Modo apresentação ativado.', level: 'info' });
    } else {
      showComplete = true;
      activeNodeIds = new Set(nodes.map(node => node.id));
      activeEdgeKeys = new Set(edges.map(edgeKey));
      parentPost('toast', { message: 'Modo edição ativado. Desfazer e refazer estão disponíveis.', level: 'info' });
    }
    draw();
  }


  function getViewportMetrics() {
    const compact = window.innerWidth < 720;
    return {
      pad: compact ? 56 : 72,
      safeTop: compact ? 176 : 214,
      safeBottom: compact ? 28 : 40,
      sidebarSpace: document.body.classList.contains('side-collapsed') ? 0 : Math.min(compact ? 360 : 410, window.innerWidth * (compact ? .78 : .38))
    };
  }

  function fitToScreen() {
    if (!nodes.length) return;
    const minX = Math.min(...nodes.map(node => node.x));
    const minY = Math.min(...nodes.map(node => node.y));
    const maxX = Math.max(...nodes.map(node => node.x + node.w));
    const maxY = Math.max(...nodes.map(node => node.y + node.h));
    const { pad, safeTop, safeBottom, sidebarSpace } = getViewportMetrics();
    const availableWidth = Math.max(240, canvasEl.clientWidth - sidebarSpace - pad * 2 - 120);
    const availableHeight = Math.max(250, canvasEl.clientHeight - safeTop - safeBottom);
    const targetScale = clamp(Math.min(availableWidth / (maxX - minX), availableHeight / (maxY - minY)), .18, 1.05);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const targetPanX = pad + availableWidth / 2 - centerX * targetScale;
    const targetPanY = safeTop + availableHeight / 2 - centerY * targetScale;
    animateCamera(targetScale, targetPanX, targetPanY);
  }

  function animateCamera(targetScale, targetPanX, targetPanY) {
    if (reduceMotion) {
      scale = targetScale; panX = targetPanX; panY = targetPanY; draw(); updateZoomBadge(); return;
    }
    const startScale = scale, startPanX = panX, startPanY = panY, start = performance.now(), duration = 420;
    const step = now => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      scale = startScale + (targetScale - startScale) * eased;
      panX = startPanX + (targetPanX - startPanX) * eased;
      panY = startPanY + (targetPanY - startPanY) * eased;
      draw(); updateZoomBadge();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function focusNode(node) {
    const { pad, safeTop, safeBottom, sidebarSpace } = getViewportMetrics();
    const availableWidth = Math.max(240, canvasEl.clientWidth - sidebarSpace - pad * 2 - 96);
    const availableHeight = Math.max(220, canvasEl.clientHeight - safeTop - safeBottom);
    const targetScale = clamp(Math.max(scale, .68), .5, 1.05);
    const targetPanX = pad + availableWidth / 2 - (node.x + node.w / 2) * targetScale;
    const targetPanY = safeTop + availableHeight / 2 - (node.y + node.h / 2) * targetScale;
    animateCamera(targetScale, targetPanX, targetPanY);
  }

  function focusPresentationNode(index, moveCamera = true) {
    currentPresentationIndex = Math.max(0, Math.min(presentationSequence.length - 1, index));
    const node = nodes.find(item => item.id === presentationSequence[currentPresentationIndex]);
    if (!node) return;
    showComplete = false;
    const completeButton = document.getElementById('showCompletePath');
    if (completeButton) completeButton.textContent = 'Mostrar caminho completo';
    selectNode(node);
    if (moveCamera) focusNode(node);
    if (currentPresentationIndex === presentationSequence.length - 1) parentPost('flowComplete');
  }

  function movePresentation(direction) {
    focusPresentationNode(currentPresentationIndex + direction, true);
  }

  function toggleCompletePath() {
    showComplete = !showComplete;
    const button = document.getElementById('showCompletePath');
    button.textContent = showComplete ? 'Voltar ao caminho atual' : 'Mostrar caminho completo';
    if (showComplete) {
      activeNodeIds = new Set(nodes.map(node => node.id));
      activeEdgeKeys = new Set(edges.map(edgeKey));
      updatePathStatus('');
      fitToScreen();
    } else focusPresentationNode(currentPresentationIndex, false);
    draw();
  }

  function snapshot() {
    return JSON.stringify(serializeLayout());
  }

  function pushHistory() {
    if (historyLocked) return;
    const current = snapshot();
    if (history[history.length - 1] !== current) history.push(current);
    if (history.length > 60) history.shift();
    future = [];
    updateHistoryButtons();
  }

  function undo() {
    if (!history.length) return flowToast('Nada para desfazer.');
    const current = snapshot();
    const previous = history.pop();
    future.push(current);
    const selectedId = selectedNode?.id || null;
    historyLocked = true;
    originalImportLayout(JSON.parse(previous));
    historyLocked = false;
    if (selectedId) {
      const restored = nodes.find(node => node.id === selectedId);
      if (restored) selectNode(restored);
    }
    updateHistoryButtons();
    flowToast('Alteração desfeita.');
  }

  function redo() {
    if (!future.length) return flowToast('Nada para refazer.');
    const current = snapshot();
    const next = future.pop();
    history.push(current);
    const selectedId = selectedNode?.id || null;
    historyLocked = true;
    originalImportLayout(JSON.parse(next));
    historyLocked = false;
    if (selectedId) {
      const restored = nodes.find(node => node.id === selectedId);
      if (restored) selectNode(restored);
    }
    updateHistoryButtons();
    flowToast('Alteração refeita.');
  }

  function updateHistoryButtons() {
    const undoButton = document.getElementById('undoBtn');
    const redoButton = document.getElementById('redoBtn');
    if (undoButton) undoButton.disabled = history.length === 0;
    if (redoButton) redoButton.disabled = future.length === 0;
  }

  function installHistoryCapture() {
    const mutationIds = new Set(['applyNodeBtn', 'applyEdgeBtn', 'addNodeBtn', 'createEdgeBtn', 'addGroupBtn']);
    document.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || flowMode !== 'editing') return;
      if (mutationIds.has(button.id) || button.textContent.trim() === 'Remover') pushHistory();
    }, true);

    canvasEl.addEventListener('mousedown', event => {
      if (flowMode !== 'editing') return;
      const world = screenToWorld(event.clientX, event.clientY);
      const node = hitTestNode(world.x, world.y);
      const edge = hitTestEdgeHandle(event.clientX, event.clientY)?.edge;
      if ((node && node.edit) || (edge && edge.edit)) pushHistory();
    }, true);

    document.getElementById('fileLayoutIn')?.addEventListener('change', () => pushHistory(), true);
    window.addEventListener('keydown', event => {
      if (flowMode !== 'editing' || !(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
      if (event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
    });
  }

  function installPresentationGuards() {
    canvasEl.addEventListener('dblclick', event => {
      if (flowMode === 'presentation') { event.preventDefault(); event.stopImmediatePropagation(); }
    }, true);
  }

  function installTouchSupport() {
    canvasEl.addEventListener('touchstart', event => {
      if (!event.touches.length) return;
      event.preventDefault();
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        const world = screenToWorld(touch.clientX, touch.clientY);
        const node = hitTestNode(world.x, world.y);
        touchState = { type: 'pan', x: touch.clientX, y: touch.clientY, startX: touch.clientX, startY: touch.clientY, node };
      } else if (event.touches.length === 2) {
        const [a, b] = event.touches;
        const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const centerX = (a.clientX + b.clientX) / 2;
        const centerY = (a.clientY + b.clientY) / 2;
        touchState = { type: 'pinch', distance, scale, centerX, centerY, world: screenToWorld(centerX, centerY) };
      }
    }, { passive: false });

    canvasEl.addEventListener('touchmove', event => {
      if (!touchState) return;
      event.preventDefault();
      if (touchState.type === 'pan' && event.touches.length === 1) {
        const touch = event.touches[0];
        panX += touch.clientX - touchState.x;
        panY += touch.clientY - touchState.y;
        touchState.x = touch.clientX; touchState.y = touch.clientY;
        draw();
      } else if (touchState.type === 'pinch' && event.touches.length === 2) {
        const [a, b] = event.touches;
        const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const ratio = distance / Math.max(1, touchState.distance);
        scale = clamp(touchState.scale * ratio, .35, 3);
        panX = touchState.centerX - touchState.world.x * scale;
        panY = touchState.centerY - touchState.world.y * scale;
        draw(); updateZoomBadge();
      }
    }, { passive: false });

    canvasEl.addEventListener('touchend', event => {
      if (touchState?.type === 'pan' && touchState.node) {
        const moved = Math.hypot(touchState.x - touchState.startX, touchState.y - touchState.startY);
        if (moved < 10) selectNode(touchState.node);
      }
      if (!event.touches.length) touchState = null;
    }, { passive: true });
  }

  function updateZoomBadge() {
    const badge = document.querySelector('.zoom-badge');
    if (badge) badge.textContent = `Zoom ${Math.round(scale * 100)}%`;
  }

  function flowToast(message) {
    document.querySelector('.flow-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'flow-toast'; toast.setAttribute('role', 'status'); toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }

  function animatePaths(time) {
    if (!document.hidden && flowMode === 'presentation' && !reduceMotion && time - lastAnimationTime > 45) {
      animationOffset = (animationOffset + 1.15) % 200;
      draw();
      lastAnimationTime = time;
    }
    animationFrame = requestAnimationFrame(animatePaths);
  }

  function handleParentMessage(event) {
    const data = event.data;
    if (!data || data.source !== 'marcha-shell') return;
    if (data.command === 'init') {
      discoveredIds = new Set(['start']);
      const completed = new Set(data.completed || []);
      if (completed.has(0)) ['start', 'soluvel', 'hcl', 'hcl_precip'].forEach(id => discoveredIds.add(id));
      if (completed.has(1)) discoveredIds.add('h2s');
      if (completed.has(2)) discoveredIds.add('nh4_2s');
      if (completed.has(3)) ['earth', 'alkali'].forEach(id => discoveredIds.add(id));
      if (completed.has(4)) discoveredIds.add('fim');
      draw();
      parentPost('ready', { total: presentationSequence.length, current: currentPresentationIndex, text: 'Fluxograma pronto', height: document.documentElement.scrollHeight });
    } else if (data.command === 'progressReset') {
      discoveredIds = new Set(['start']); draw();
    } else if (data.command === 'visibility') {
      if (data.active) {
        resizeCanvas();
        setTimeout(() => {
          if (flowMode === 'presentation') focusPresentationNode(currentPresentationIndex, true);
          else fitToScreen();
        }, 60);
      }
      // Continuous drawing is automatically throttled while the iframe is hidden.
    }
  }

  function installFeedback() {
    window.alert = message => parentPost('toast', { message: String(message), level: 'error' });
    document.getElementById('exportPngBtn')?.addEventListener('click', () => parentPost('toast', { message: 'PNG do fluxograma exportado.', level: 'success' }));
    document.getElementById('exportLayoutBtn')?.addEventListener('click', () => parentPost('toast', { message: 'Layout JSON exportado.', level: 'success' }));
    document.getElementById('fileLayoutIn')?.addEventListener('change', event => {
      if (event.target.files?.length) setTimeout(() => parentPost('toast', { message: 'Layout JSON importado.', level: 'success' }), 150);
    });
  }

  function initialize() {
    document.body.dataset.flowMode = flowMode;
    readDiscovered();
    createToolbar();
    installDrawOverrides();
    installSelectionOverride();
    installHistoryCapture();
    installPresentationGuards();
    installTouchSupport();
    installFeedback();
    setActivePath('start');
    fitToScreen();
    updateHistoryButtons();
    window.addEventListener('message', handleParentMessage);
    window.addEventListener('resize', updateZoomBadge, { passive: true });
    animationFrame = requestAnimationFrame(animatePaths);
    parentPost('ready', { total: presentationSequence.length, current: 0, text: 'Fluxograma pronto', height: document.documentElement.scrollHeight });
  }

  initialize();
})();
