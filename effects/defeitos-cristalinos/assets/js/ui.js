import { clipOptions, latticeOptions, modeConfig } from './config.js';
import { getCounts, resetAppearance, resetLattice, setAtomScale, setBackgroundColor, setClipPlane, setLatticeType, setLightColor, setMode, subscribe } from './state.js';

export class UIController {
  constructor(container) {
    this.container = container;
    subscribe((snapshot) => this.render(snapshot));
  }

  render(snapshot) {
    const counts = getCounts(snapshot);
    const active = modeConfig[snapshot.mode];
    this.container.innerHTML = `
      <div class="stats-panel" aria-live="polite">
        <div class="stat"><span class="stat-title">Átomos Totais</span><span class="stat-value">${counts.atoms}</span></div>
        <div class="divider"></div>
        <div class="stat"><span class="stat-title">Lacunas</span><span class="stat-value red">${counts.vacancies}</span></div>
        <div class="divider"></div>
        <div class="stat"><span class="stat-title">Impurezas</span><span class="stat-value red">${counts.impurities}</span></div>
      </div>
      <aside class="sidebar">
        <h1 class="panel-title">Defeitos em Sólidos</h1>
        <p class="panel-copy">Manipulação acadêmica de falhas em estruturas cristalinas para Física do Estado Sólido e Ciência dos Materiais.</p>
        <div class="control-group">
          <div class="control-title"><span>▦</span><span>Estrutura Cristalina</span></div>
          <div class="option-list">
            ${latticeOptions.map((option) => `<button class="control-btn ${snapshot.latticeType === option.value ? 'active' : ''}" data-lattice="${option.value}">${option.label}</button>`).join('')}
          </div>
        </div>
        <div class="control-group">
          <div class="control-title"><span>◫</span><span>Plano de Corte</span></div>
          <div class="option-list">
            ${clipOptions.map((option) => `<button class="control-btn ${snapshot.clipPlane === option.value ? 'active' : ''}" data-clip="${option.value}">${option.label}</button>`).join('')}
          </div>
        </div>
        <div class="control-group">
          <div class="range-row">
            <div class="control-title"><span>●</span><span>Tamanho do Átomo</span></div>
            <span class="scale-value">${Number(snapshot.atomScale).toFixed(1)}x</span>
          </div>
          <input data-scale type="range" min="0.2" max="2.5" step="0.1" value="${snapshot.atomScale}" aria-label="Tamanho do átomo">
        </div>
        <div class="control-group">
          <div class="control-title"><span>◐</span><span>Aparência da Cena</span></div>
          <div class="color-control-list">
            <label class="color-control">
              <span class="color-label">Cor do fundo</span>
              <span class="color-value">${snapshot.backgroundColor}</span>
              <input data-background-color type="color" value="${snapshot.backgroundColor}" aria-label="Cor do fundo">
            </label>
            <label class="color-control">
              <span class="color-label">Cor das luzes</span>
              <span class="color-value">${snapshot.lightColor}</span>
              <input data-light-color type="color" value="${snapshot.lightColor}" aria-label="Cor das luzes">
            </label>
            <button class="mini-reset-btn" data-reset-appearance>Restaurar cores padrão</button>
          </div>
        </div>
        <div class="control-group">
          <div class="control-title"><span>✦</span><span>Tipos de Defeitos (0D)</span></div>
          <div class="mode-list">
            ${Object.keys(modeConfig).map((mode) => `<button class="mode-btn ${snapshot.mode === mode ? 'active' : ''}" data-mode="${mode}"><span class="mode-icon">${modeConfig[mode].icon}</span><span>${modeConfig[mode].title}</span></button>`).join('')}
          </div>
        </div>
        <div class="reset-wrap">
          <button class="reset-btn" data-reset><span>↺</span><span>Restaurar Cristal</span></button>
        </div>
      </aside>
      <aside class="info-panel">
        <header class="info-head">
          <span class="info-icon">${active.icon}</span>
          <h2 class="info-title">${active.title}</h2>
        </header>
        <section class="info-block">
          <span class="info-label">Descrição</span>
          <p class="info-text">${active.description}</p>
        </section>
        <section class="info-block callout">
          <span class="info-label">Implicações Físico-Químicas</span>
          <p class="info-text">${active.implications}</p>
        </section>
        ${active.instructions ? `<section class="info-block action-box"><span class="info-label">Ação Interativa</span><p class="info-text">${active.instructions}</p></section>` : ''}
        <section class="energy-box">
          <span class="info-label">Energia de Formação Relativa</span>
          <div class="energy-bar"><div class="energy-fill" style="width:${active.energyLevel}%"></div></div>
          <div class="energy-scale"><span>0 eV</span><span>Alta Energia</span></div>
          <p class="info-text">${active.energyText}</p>
        </section>
      </aside>
      <div class="mobile-hint">No celular, arraste o fundo para girar a rede e role a tela para acessar todos os controles.</div>
    `;
    this.bindEvents();
  }

  bindEvents() {
    this.container.querySelectorAll('[data-lattice]').forEach((button) => {
      button.addEventListener('click', () => setLatticeType(button.dataset.lattice));
    });
    this.container.querySelectorAll('[data-clip]').forEach((button) => {
      button.addEventListener('click', () => setClipPlane(button.dataset.clip));
    });
    this.container.querySelectorAll('[data-mode]').forEach((button) => {
      button.addEventListener('click', () => setMode(button.dataset.mode));
    });
    const range = this.container.querySelector('[data-scale]');
    if (range) range.addEventListener('input', (event) => setAtomScale(event.target.value));
    const backgroundColor = this.container.querySelector('[data-background-color]');
    if (backgroundColor) backgroundColor.addEventListener('input', (event) => setBackgroundColor(event.target.value));
    const lightColor = this.container.querySelector('[data-light-color]');
    if (lightColor) lightColor.addEventListener('input', (event) => setLightColor(event.target.value));
    const resetAppearanceButton = this.container.querySelector('[data-reset-appearance]');
    if (resetAppearanceButton) resetAppearanceButton.addEventListener('click', () => resetAppearance());
    const reset = this.container.querySelector('[data-reset]');
    if (reset) reset.addEventListener('click', () => resetLattice());
  }
}
