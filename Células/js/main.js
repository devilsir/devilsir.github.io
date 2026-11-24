import { Engine } from './core/engine.js?v=8';
import { SceneManager } from './core/sceneManager.js?v=7';
import { state } from './core/state.js?v=10';
import { audio } from './core/audio.js';
import { button, node } from './core/ui.js?v=9';
import { glossaries } from './data/glossary.js?v=14';
import { cell3d } from './modules/cell3d.js?v=19';
import { respiration3d } from './modules/respiration3d.js?v=22';
import { centralDogma3d } from './modules/centralDogma3d.js?v=18';
import { cellDivision3d } from './modules/cellDivision3d.js?v=14';
import { histologyLab } from './modules/histologyLab.js?v=22';
import { microscope3d } from './modules/microscope3d.js?v=22';
import { electronMicroscope3d } from './modules/electronMicroscope3d.js?v=22';

const modules = {
  citologia: ['Citologia', 'Célula e organelas', 'Explore o interior celular, membrana, citoplasma e organelas em etapas com micro-zoom.', cell3d],
  bioenergetica: ['Bioenergética', 'Metabolismo energético', 'Compare catabolismo (respiração e fermentação) e anabolismo (fotossíntese no cloroplasto).', respiration3d],
  dogma: ['DNA e RNA', 'Replicação e dogma central', 'Acompanhe replicação semiconservativa, transcrição, tradução e teste o efeito de mutações.', centralDogma3d],
  divisao: ['Divisão Celular', 'Mitose, meiose e ciclo celular', 'Explore interfase (G1, S, G2), divisão equacional, meiose I/II e crossing-over em 3D.', cellDivision3d],
  histotecnica: ['Histotécnica', 'Preparação de lâminas', 'Processe o tecido, faça o corte no Leica RM2255 e escolha uma coloração na bancada virtual.', histologyLab],
  microscopio: ['Óptico', 'Microscopia óptica binocular', 'Ajuste aumento até 1000×, iluminação e foco para explorar suas lâminas na ocular.', microscope3d],
  eletronico: ['Eletrônico', 'Microscopia eletrônica (Hitachi HT7800 · EDS)', 'Opere o TEM/SEM até 600.000× e explore o mapeamento químico EDS com o Shimadzu Rayny EDX-720.', electronMicroscope3d]
};

const byId = id => document.getElementById(id);
const workspace = byId('workspace');
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

let manager, active;
const buttons = {};
for (const [id, [name]] of Object.entries(modules)) {
  buttons[id] = button(name, () => navigate(id), { 'data-module': id });
  byId('navigation').append(buttons[id]);
}

function navigate(id) {
  if (!Object.hasOwn(modules, id) || active === id) return;
  if (location.hash !== '#' + id) history.pushState(null, '', '#' + id);
  const firstLoad = !active;
  active = id;
  if (!firstLoad) audio.play('click');
  const [name, title, subtitle, module] = modules[id];
  for (const [key, control] of Object.entries(buttons)) {
    if (key === id) control.setAttribute('aria-current', 'page');
    else control.removeAttribute('aria-current');
  }
  byId('scene-title').textContent = title;
  byId('scene-kicker').textContent = name.toLocaleUpperCase('pt-BR');
  byId('scene-subtitle').textContent = subtitle;
  byId('viewport').dataset.module = id;
  manager?.mount(module, ok => {
    if (ok && active === id) {
      byId('guide-body').append(node('details', { className: 'card glossary' },
        node('summary', {}, 'Glossário do módulo'),
        node('dl', {}, ...Object.entries(glossaries[id]).flatMap(([term, description]) =>
          [node('dt', {}, term), node('dd', {}, description)]))));
    }
  });
}

function route() {
  const key = location.hash.slice(1);
  navigate(Object.hasOwn(modules, key) ? key : 'citologia');
}

try {
  const engine = new Engine(byId('stage'));
  manager = new SceneManager(engine, {
    viewport: byId('viewport'), projection: byId('projection'), overlay: byId('overlay'),
    guide: byId('guide-body'), toolbar: byId('toolbar'), tooltip: byId('tooltip'),
    error: byId('scene-error'), help: byId('view-help')
  }, state, navigate);
  manager.labelListeners.add(syncLabelsButton);
  syncLabelsButton(manager.labelsVisible);
} catch {
  byId('scene-error').hidden = false;
  byId('scene-error').textContent = 'O navegador não conseguiu iniciar a visualização 3D. Use um navegador atualizado com aceleração de hardware ativada.';
}

window.addEventListener('popstate', route);
window.addEventListener('hashchange', route);
route();
