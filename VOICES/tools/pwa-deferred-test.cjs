'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { root, manifest } = require('./runtime-files.cjs');

const deployed = process.argv.includes('--bundle') ? root + '/dist' : root;
const html = fs.readFileSync(deployed + '/index.html', 'utf8');
const runtime = manifest(html);
const bootstrap = manifest().bootstrap;
const pwaScript = [...html.matchAll(/<script src="([^"]+)"/g)].map(match => match[1]).find(url => url.startsWith('js/pwa'));
const assetOrigin = 'https://example.test/portfolio/VOICES/';
const appPath = new URL(assetOrigin).pathname;

async function serviceWorker() {
  const stores = new Map(), handlers = new Map(), claimed = [], errors = [];
  let offline = false;
  const key = input => typeof input === 'string' ? input : input.url;
  const response = (text, ok = true) => ({
    ok, status: ok ? 200 : 404, type: 'basic', text: async () => text,
    clone: () => response(text, ok)
  });
  function fetch(input) {
    if (offline) return Promise.reject(new Error('offline'));
    const url = new URL(key(input));
    if (url.origin !== new URL(assetOrigin).origin || !url.pathname.startsWith(appPath)) errors.push(url.href);
    const relative = decodeURIComponent(url.pathname.slice(appPath.length));
    return Promise.resolve(fs.existsSync(deployed + '/' + relative)
      ? response(relative === 'index.html' ? html : relative) : response('missing ' + relative, false));
  }
  const caches = {
    async open(name) {
      if (!stores.has(name)) {
        const data = new Map();
        stores.set(name, {
          async addAll(urls) {
            assert.equal(new Set(urls).size, urls.length);
            for (const url of urls) {
              const result = await fetch(url);
              assert(result.ok, url);
              data.set(url, result);
            }
          },
          async put(input, result) { data.set(key(input), result); },
          async match(input) { return data.get(key(input)); },
          async keys() { return [...data.keys()]; },
          async delete(input) { return data.delete(key(input)); }
        });
      }
      return stores.get(name);
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); }
  };
  const self = {
    registration: { scope: assetOrigin }, clients: { async claim() { claimed.push(true); } },
    addEventListener(type, callback) { handlers.set(type, callback); }
  };
  vm.runInNewContext(fs.readFileSync(deployed + '/sw.js', 'utf8'), { self, URL, caches, fetch, Response });
  await new Promise(resolve => handlers.get('install')({ waitUntil: task => resolve(task) }));
  await new Promise(resolve => handlers.get('activate')({ waitUntil: task => resolve(task) }));
  assert.equal(claimed.length, 1);
  const request = (path, mode, destination) => {
    const input = { url: new URL(path, assetOrigin).href, method: 'GET', mode, destination, headers: new Headers() };
    let response;
    handlers.get('fetch')({ request: input, respondWith: task => { response = task; } });
    assert(response, 'Service worker did not respond to ' + input.url);
    return response;
  };
  const core = runtime.scripts[0], biography = runtime.features['museum-biographies'].scripts[0];
  assert((await request(core, 'same-origin', 'script')).ok);
  assert((await request(biography, 'same-origin', 'script')).ok);
  offline = true;
  assert.equal(await (await request('?voices-duo=local', 'navigate', '')).text(), html);
  assert((await request('manifest.webmanifest', 'same-origin', '')).ok);
  assert((await request(pwaScript, 'same-origin', 'script')).ok);
  assert((await request(biography, 'same-origin', 'script')).ok);
  assert.equal((await request('sprite-editor.html', 'navigate', '')).type, 'error');
  assert.deepEqual(errors, []);
  if (deployed !== root) {
    assert(runtime.externalResearch);
    assert(!fs.existsSync(deployed + '/data/sources/catalogo-brincadeiras.pdf'));
    assert(!fs.existsSync(deployed + '/assets/characters/renewed/source/nia-actions.png'));
    for (const feature of Object.values(runtime.features)) {
      for (const url of [...feature.scripts, ...feature.styles]) assert(fs.existsSync(deployed + '/' + url), url);
    }
  }
}

async function loader() {
  const graph = [
    { id: 'base', src: 'js/base.js', requires: [] },
    { id: 'late', src: 'js/late.js', requires: ['base'] }
  ];
  const config = { styles: [], bootstrap, modules: graph,
    features: { game: { modules: ['late'], scripts: ['js/late.js'], styles: ['css/late.css'] } } };
  const requested = [], actions = [], events = [];
  let fail = true;
  const element = () => ({ focus() {}, setAttribute() {}, append() {}, remove() {} });
  const nodes = {
    'voices-runtime': { textContent: JSON.stringify(config) }, 'loading': element(),
    'modal-root': { ...element(), replaceChildren() {} }
  };
  const document = {
    getElementById(id) { return nodes[id] || null; },
    createElement: element, addEventListener() {}, dispatchEvent(event) { events.push(event); },
    body: { append: load }, head: { append: load }
  };
  const context = vm.createContext({ document, location: new URL(assetOrigin), URLSearchParams, Event, CustomEvent, console });
  context.window = context;
  context.V = { Game: { init: async () => actions.push('game') } };
  function load(node) {
    const url = node.src || node.href;
    requested.push(url);
    queueMicrotask(() => {
      if (url === bootstrap) vm.runInContext(fs.readFileSync(root + '/' + url, 'utf8'), context);
      if (url === 'js/base.js') context.VoicesModules.define('base', () => actions.push('base'));
      if (url === 'js/late.js' && fail) { fail = false; node.onerror(); return; }
      if (url === 'js/late.js') context.VoicesModules.define('late', () => actions.push('late'));
      node.onload();
    });
  }
  vm.runInContext(fs.readFileSync(root + '/js/app-loader.js', 'utf8'), context);
  await context.VoicesApp.ready();
  assert.deepEqual(requested, [bootstrap, 'js/base.js']);
  assert.deepEqual(actions, ['base', 'game']);
  const first = context.VoicesApp.loadFeature('game');
  assert.equal(first, context.VoicesApp.loadFeature('game'));
  await assert.rejects(first);
  assert(!context.VoicesApp.featureReady('game'));
  await context.VoicesApp.loadFeature('game');
  await context.VoicesApp.loadFeature('game');
  assert.deepEqual(requested.slice(2), ['css/late.css', 'js/late.js', 'js/late.js']);
  assert.deepEqual(actions, ['base', 'game', 'late']);
  assert.equal(events.filter(event => event.type === 'voices:resources').length, 2);
}

(async () => {
  await serviceWorker();
  await loader();
  console.log('PASS offline shell, scoped cache, deferred startup and resource retry');
})().catch(error => { console.error(error); process.exitCode = 1; });
