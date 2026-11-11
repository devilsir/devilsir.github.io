'use strict';
const fs = require('node:fs'), path = require('node:path');
const modules = require('../js/module-loader.js');
const root = path.resolve(__dirname, '..');
function manifest(html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')) {
  const match = html.match(/<script type="application\/json" id="voices-runtime">([\s\S]*?)<\/script>/);
  if (!match) throw new Error('Runtime manifest is missing from index.html');
  const data = JSON.parse(match[1]);
  if (data.modules) {
    modules.resolve(data.modules);
    if (!data.scripts) data.scripts = data.modules.map(entry => entry.src);
  }
  return data;
}
function editorManifest(html = fs.readFileSync(path.join(root, 'sprite-editor.html'), 'utf8')) {
  const match = html.match(/<script type="application\/json" id="voices-editor-modules">([\s\S]*?)<\/script>/);
  if (!match) throw new Error('Editor module catalog is missing');
  const catalog = JSON.parse(match[1]); modules.resolve(catalog); return catalog;
}
module.exports = { root, manifest, editorManifest };
