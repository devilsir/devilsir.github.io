'use strict';
/**
 * main.js — Portal inicial simples e limpo,
 * navegação fluida entre a Floricultura e o Dossiê 46.
 */
const App = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  let currentView = 'hub'; // 'hub' | 'shop' | 'dossie'
  let lastFloatView = null;
  let d46Initialized = false;

  function syncFloatControls() {
    const left = $('#float-left');
    if (left && lastFloatView !== currentView) {
      lastFloatView = currentView;
      if (currentView === 'hub') {
        left.innerHTML = '';
      } else {
        const other = currentView === 'shop'
          ? { id: 'dossie', icon: 'folder', label: 'Dossiê 46' }
          : { id: 'shop', icon: 'shop', label: 'Floricultura' };
        left.innerHTML = `
          <button class="float-pill-btn" id="float-go-hub" title="Voltar ao Início">
            ${UIArt.icon('arrowLeft', 15)} <span>Início</span>
          </button>
          <button class="float-pill-btn alt" id="float-go-other" data-switch="${other.id}" title="Alternar para ${other.label}">
            ${UIArt.icon(other.icon, 14)} <span>${other.label}</span>
          </button>`;
        const back = $('#float-go-hub', left);
        if (back) back.onclick = () => navigate('hub');
        const sw = $('#float-go-other', left);
        if (sw) sw.onclick = () => navigate(sw.dataset.switch);
      }
    }

    const nbBtn = $('#btn-notebook');
    if (nbBtn && !nbBtn.firstElementChild) nbBtn.innerHTML = UIArt.icon('manual', 16);

    const sfxBtn = $('#btn-sfx');
    if (sfxBtn) {
      const on = AudioEngine.isSfxEnabled();
      if (sfxBtn.dataset.state !== String(on)) {
        sfxBtn.dataset.state = String(on);
        sfxBtn.classList.toggle('on', on);
        sfxBtn.setAttribute('aria-pressed', on);
        sfxBtn.innerHTML = UIArt.icon(on ? 'soundOn' : 'soundOff', 16);
      }
    }

    const ambBtn = $('#btn-ambient');
    if (ambBtn) {
      const on = AudioEngine.isAmbientEnabled();
      if (ambBtn.dataset.state !== String(on)) {
        ambBtn.dataset.state = String(on);
        ambBtn.classList.toggle('on', on);
        ambBtn.setAttribute('aria-pressed', on);
        ambBtn.innerHTML = UIArt.icon(on ? 'musicOn' : 'musicOff', 16);
      }
    }

    const settings = GameState.get().settings;
    document.body.classList.toggle('xray', !!settings.xray);
  }

  function renderHub(el) {
    const sum = GameState.getSummary();

    el.innerHTML = `<section class="portal-stage sheet-anim">
      <div class="portal-grid">
        <article class="portal-card featured-shop glass-panel rgb-edge" data-go="shop" role="button" tabindex="0">
          <div class="pc-visual">
            <img class="op-art-img" src="assets/floricultura/card-floricultura.jpg" alt="Vitrine da Floricultura">
          </div>
          <div class="pc-body">
            <div class="pc-eyebrow mono">LOJA &amp; ESTUFA DE CRUZAMENTOS</div>
            <h2>Floricultura</h2>
            <p>Você é o dono da loja: crie, cruze e venda plantas do seu estoque no balcão para atender aos pedidos dos clientes — estudando as leis de Mendel de forma simples e lúdica.</p>
            <div class="pc-foot">
              <div class="pc-meta mono small">
                <span>Caixa: <b>¤ ${sum.shopCredits}</b></span>
                <span>Catálogo: <b>${sum.multiSpeciesCount}/${sum.totalCatalog}</b></span>
              </div>
              <span class="btn btn-glow-prism">Abrir Floricultura ${UIArt.icon('arrowRight', 15)}</span>
            </div>
          </div>
        </article>

        <article class="portal-card forensic-card glass-panel rgb-edge-soft" data-go="dossie" role="button" tabindex="0">
          <div class="pc-visual">
            ${UIArt.art('arquivo', 'op-art-svg')}
          </div>
          <div class="pc-body">
            <div class="pc-eyebrow mono">PERÍCIA HEREDITÁRIA</div>
            <h2>Dossiê 46</h2>
            <p>Combine as leis de Mendel em heredogramas clássicos com notação de alelos, laudos ABO e Rh, herança ligada e influenciada pelo sexo, poligenia e epistasia para montar o retrato do investigado.</p>
            <div class="pc-foot">
              <div class="pc-meta mono small">
                <span>Resolvidos: <b>${sum.detSolved}/${sum.detTotal}</b></span>
                <span>Estrelas: <b>${sum.detStars}/${sum.detMaxStars} ★</b></span>
              </div>
              <span class="btn btn-glow-rose">Abrir Dossiê ${UIArt.icon('arrowRight', 15)}</span>
            </div>
          </div>
        </article>
      </div>
    </section>`;

    $$('[data-go]', el).forEach(node => {
      const target = node.dataset.go;
      const go = () => navigate(target);
      node.addEventListener('click', go);
      if (node.tagName !== 'BUTTON') {
        node.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
        });
      }
    });
  }

  function navigate(view, skipCover = false) {
    // Mapeia rotas antigas direto para a Floricultura integrada
    if (view === 'greenhouse') {
      view = 'shop';
    } else if (view === 'herbarium') {
      Floricultura.openTab('herbario');
      view = 'shop';
    } else if (view === 'sandbox') {
      Floricultura.openTab('bancada');
      view = 'shop';
    }

    currentView = view;
    UI.closeModal();
    syncFloatControls();
    const main = $('#app-main');
    if (!main) return;
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (view === 'hub') {
      renderHub(main);
    } else if (view === 'shop') {
      GeneticShop.render(main);
    } else if (view === 'dossie') {
      if (!d46Initialized) {
        d46Initialized = true;
        const unlockedIdx = Math.min(Dossie46.CASES.length - 1, Math.max(0, GameState.get().detective.unlocked - 1));
        Dossie46.render(main);
        Dossie46.openCase(unlockedIdx, skipCover);
      } else {
        if (skipCover && Dossie46.session.phase === 'cover') {
          Dossie46.session.phase = 'investigating';
        }
        Dossie46.render(main);
      }
    }
  }

  function toggleXray() {
    const next = !GameState.get().settings.xray;
    GameState.setSetting('xray', next);
    AudioEngine.toggle(next);
    syncFloatControls();
    if (typeof Greenhouse !== 'undefined') Greenhouse.onXrayChanged(next);
    UI.toast(next
      ? 'Raio-X Genético ativado: genótipos visíveis.'
      : 'Raio-X Genético desativado.');
  }

  function bindGlobalEvents() {
    document.addEventListener('pointerdown', () => AudioEngine.unlock(), { once: true });
    document.addEventListener('click', e => {
      const btn = e.target.closest('button:not([disabled])');
      if (btn && !btn.dataset.pickPheno && !btn.dataset.pickGeno && !btn.dataset.plantId && !btn.dataset.invPlant) {
        AudioEngine.click();
      }
    }, true);

    const nbBtn = $('#btn-notebook');
    if (nbBtn) nbBtn.addEventListener('click', () => UI.showNotebook());

    const sfxBtn = $('#btn-sfx');
    if (sfxBtn) {
      sfxBtn.addEventListener('click', () => {
        AudioEngine.setSfx(!AudioEngine.isSfxEnabled());
        syncFloatControls();
      });
    }

    const ambBtn = $('#btn-ambient');
    if (ambBtn) {
      ambBtn.addEventListener('click', () => {
        const next = !AudioEngine.isAmbientEnabled();
        AudioEngine.setAmbient(next);
        syncFloatControls();
        UI.toast(next ? 'Trilha ambiente ativada.' : 'Trilha ambiente silenciada.');
      });
    }

    GameState.subscribe(() => syncFloatControls());
  }

  function init() {
    UI.initDust();
    bindGlobalEvents();
    syncFloatControls();
    navigate('hub');
  }

  document.addEventListener('DOMContentLoaded', init);

  return { navigate, toggleXray, getView: () => currentView };
})();

window.App = App;
