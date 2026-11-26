import { Engine } from './core/engine.js?v=25';
import { SceneManager, afterPaint, keepLoaderVisible } from './core/sceneManager.js?v=26';
import { state } from './core/state.js?v=13';
import { audio } from './core/audio.js';
import { button, node } from './core/ui.js?v=9';
import { glossaries } from './data/glossary.js?v=14';

const modules = {
  citologia: ['Citologia', 'Célula e organelas', 'Explore o interior celular, membrana, citoplasma e organelas em etapas com micro-zoom.', () => import('./modules/cell3d.js?v=31').then(module => module.cell3d), 'Montando modelos 3D celulares, membrana e organelas...'],
  bioenergetica: ['Bioenergética', 'Metabolismo energético', 'Compare catabolismo (respiração e fermentação) e anabolismo (fotossíntese no cloroplasto).', () => import('./modules/respiration3d.js?v=23').then(module => module.respiration3d), 'Preparando mitocôndria, cadeia respiratória e cloroplasto 3D...'],
  dogma: ['DNA e RNA', 'Replicação e dogma central', 'Acompanhe replicação semiconservativa, transcrição, tradução e teste o efeito de mutações.', () => import('./modules/centralDogma3d.js?v=23').then(module => module.centralDogma3d), 'Construindo dupla-hélice, RNA polimerase e ribossomo 80S...'],
  divisao: ['Divisão Celular', 'Mitose, meiose e ciclo celular', 'Explore interfase (G1, S, G2), divisão equacional, meiose I/II e crossing-over em 3D.', () => import('./modules/cellDivision3d.js?v=23').then(module => module.cellDivision3d), 'Preparando cromossomos, fuso mitótico e quiasmas...'],
  histotecnica: ['Histotécnica', 'Preparação de lâminas', 'Processe o tecido, faça o corte no Leica RM2255 e escolha uma coloração na bancada virtual.', () => import('./modules/histologyLab.js?v=40').then(module => module.histologyLab), 'Montando estereomicroscópio, micrótomo Leica RM2255 e banhos...'],
  microscopio: ['Óptico', 'Microscopia óptica binocular', 'Ajuste aumento até 1000×, iluminação e foco para explorar suas lâminas na ocular.', () => import('./modules/microscope3d.js?v=27').then(module => module.microscope3d), 'Calibrando microscópio óptico binocular e ocular até 1000×...'],
  eletronico: ['Eletrônico', 'Microscopia eletrônica (Hitachi HT7800 · EDS)', 'Opere o TEM/SEM até 600.000× e explore o mapeamento químico EDS com o Shimadzu Rayny EDX-720.', () => import('./modules/electronMicroscope3d.js?v=26').then(module => module.electronMicroscope3d), 'Inicializando coluna Hitachi HT7800, detector EDS e micrografias...']
};

const byId = id => document.getElementById(id);
const workspace = byId('workspace');
const bottomDock = byId('bottom-dock');
const experiment = bottomDock.parentElement;
const guidePanel = byId('guide');
const panelButton = byId('open-panel');
const soundButton = byId('sound');
const labelsButton = byId('toggle-labels');
let panelOpen = true;

function syncLabelsButton(visible) {
  labelsButton.textContent = visible ? 'Ocultar rótulos' : 'Mostrar rótulos';
  labelsButton.setAttribute('aria-pressed', String(!visible));
}

function showPanel(show) {
  panelOpen = show;
  workspace.classList.toggle('collapsed', !show);
  guidePanel.setAttribute('aria-hidden', String(!show));
  if ('inert' in guidePanel) guidePanel.inert = !show;
  panelButton.textContent = show ? 'Recolher painel' : 'Abrir painel';
  panelButton.setAttribute('aria-expanded', String(show));
  audio.play('click');
}

panelButton.addEventListener('click', () => showPanel(!panelOpen));
const sceneHeadingToggle = byId('toggle-scene-heading');
const sceneHeadingContent = byId('scene-heading-content');
sceneHeadingToggle.addEventListener('click', () => {
  const expand = sceneHeadingContent.hidden;
  const wording = expand ? 'Recolher texto da cena' : 'Mostrar texto da cena';
  sceneHeadingContent.hidden = !expand;
  sceneHeadingToggle.parentElement.classList.toggle('is-collapsed', !expand);
  sceneHeadingToggle.setAttribute('aria-expanded', String(expand));
  sceneHeadingToggle.setAttribute('aria-label', wording);
  sceneHeadingToggle.title = wording;
  sceneHeadingToggle.textContent = expand ? '−' : '+';
});
labelsButton.addEventListener('click', () => {
  if (!manager) return;
  manager.setLabelsVisible(!manager.labelsVisible);
  audio.play('click');
});
soundButton.addEventListener('click', () => {
  audio.setMuted(!audio.muted);
  soundButton.textContent = audio.muted ? 'Som desligado' : 'Som ligado';
  soundButton.setAttribute('aria-pressed', String(audio.muted));
});

const bootLoader = byId('boot-loader');
const bootStatus = byId('boot-status');
let bootDismissed = false;
await afterPaint();
const bootVisibleAt = performance.now();

async function dismissBootLoader() {
  if (bootDismissed || !bootLoader) return;
  bootDismissed = true;
  await keepLoaderVisible(bootVisibleAt);
  bootLoader.classList.add('is-done');
  setTimeout(() => bootLoader.remove(), 360);
}

let manager, active;
const buttons = {};
for (const [id, [name]] of Object.entries(modules)) {
  buttons[id] = button(name, () => navigate(id), { 'data-module': id });
  byId('navigation').append(buttons[id]);
}

function navigate(id) {
  if (!Object.hasOwn(modules, id) || active === id) return;
  if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
  const booting = !bootDismissed;
  active = id;
  if (!booting) audio.play('click');
  const [name, title, subtitle, loadFactory, hint] = modules[id];
  if (booting && bootStatus) {
    bootStatus.textContent = `Carregando módulo ${name}...`;
  }
  for (const [key, control] of Object.entries(buttons)) {
    if (key === id) control.setAttribute('aria-current', 'page');
    else control.removeAttribute('aria-current');
  }
  byId('scene-title').textContent = title;
  byId('scene-kicker').textContent = name.toLocaleUpperCase('pt-BR');
  byId('scene-subtitle').textContent = subtitle;
  byId('viewport').dataset.module = id;
  if (id === 'eletronico') {
    guidePanel.before(bottomDock);
  } else if (bottomDock.parentElement !== experiment) {
    experiment.append(bottomDock);
  }
  manager?.mount(loadFactory, ok => {
    if (ok && active === id) {
      byId('guide-body').append(node('details', { className: 'card glossary' },
        node('summary', {}, 'Glossário do módulo'),
        node('dl', {}, ...Object.entries(glossaries[id]).flatMap(([term, description]) =>
          [node('dt', {}, term), node('dd', {}, description)]))));
    }
    if (!ok && active === id) active = null;
    dismissBootLoader();
  }, { name, hint, booting });
}

function route() {
  const key = location.hash.slice(1);
  navigate(Object.hasOwn(modules, key) ? key : 'citologia');
}

try {
  if (bootStatus) bootStatus.textContent = 'Inicializando motor gráfico WebGL 3D...';
  const engine = new Engine(byId('stage'));
  manager = new SceneManager(engine, {
    workspace, viewport: byId('viewport'), projection: byId('projection'), overlay: byId('overlay'),
    guide: byId('guide-body'), toolbar: byId('toolbar'), tooltip: byId('tooltip'),
    error: byId('scene-error'), help: byId('view-help')
  }, state, navigate);
  manager.labelListeners.add(syncLabelsButton);
  syncLabelsButton(manager.labelsVisible);
} catch {
  dismissBootLoader();
  byId('scene-error').hidden = false;
  byId('scene-error').textContent = 'O navegador não conseguiu iniciar a visualização 3D. Use um navegador atualizado com aceleração de hardware ativada.';
}

window.addEventListener('popstate', route);
window.addEventListener('hashchange', route);
route();
