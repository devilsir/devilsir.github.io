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
    const entries = new Map(data.modules.map(entry => [entry.id, entry]));
    const deferred = new Set();
    for (const feature of Object.values(data.features || {})) {
      for (const id of feature.modules) {
        if (!entries.has(id) || deferred.has(id)) throw new Error('Invalid deferred module: ' + id);
        deferred.add(id);
      }
      if (!feature.scripts) feature.scripts = feature.modules.map(id => entries.get(id).src);
    }
    for (const entry of data.modules) {
      if (!deferred.has(entry.id) && entry.requires.some(id => deferred.has(id))) throw new Error('Core module depends on deferred code: ' + entry.id);
    }
    if (!data.scripts) data.scripts = data.modules.filter(entry => !deferred.has(entry.id)).map(entry => entry.src);
  }
  return data;
}
function editorManifest(html = fs.readFileSync(path.join(root, 'sprite-editor.html'), 'utf8')) {
  const match = html.match(/<script type="application\/json" id="voices-editor-modules">([\s\S]*?)<\/script>/);
  if (!match) throw new Error('Editor module catalog is missing');
  const catalog = JSON.parse(match[1]); modules.resolve(catalog); return catalog;
}
module.exports = { root, manifest, editorManifest };
