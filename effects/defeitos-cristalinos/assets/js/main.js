import { SceneController } from './scene.js';
import { UIController } from './ui.js';

const viewer = document.getElementById('viewer');
const ui = document.getElementById('ui');

if (!viewer || !ui) {
  throw new Error('Estrutura base da página não encontrada.');
}

new SceneController(viewer);
new UIController(ui);
