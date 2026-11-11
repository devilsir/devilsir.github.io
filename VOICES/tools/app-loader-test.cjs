'use strict';
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { JSDOM, VirtualConsole } = require('jsdom'), { root } = require('./runtime-files.cjs');
const source = fs.readFileSync(path.join(root, 'js/app-loader.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function environment(fail = false, child = false) {
  const dom = new JSDOM(html, { url: 'http://voices.local/' + (child ? '?voices-duo=test' : ''), runScripts: 'outside-only', virtualConsole: new VirtualConsole() });
  const w = dom.window, requested = [], state = { initialized: 0, clicked: 0 };
  for (const host of [w.document.head, w.document.body]) {
    const append = host.append.bind(host);
    host.append = (...nodes) => { append(...nodes); for (const node of nodes) {
      if (!['SCRIPT', 'LINK'].includes(node.tagName)) continue;
      requested.push(node.src || node.href);
      queueMicrotask(() => fail ? node.onerror() : node.onload());
    } };
  }
  w.VoicesModules={start(catalog){state.startedModules=catalog.length;return require('../js/module-loader.js').resolve(catalog);}};
  w.V = { Game: { async init() { assert(state.startedModules>0);state.initialized++; w.document.getElementById('loading').hidden = true; w.document.getElementById('new-game').onclick = () => state.clicked++; } } };
  w.eval(source);
  return { dom, w, requested, state };
}
(async () => {
  const e = environment();
  assert.equal(e.requested.length, 0); assert.equal(e.state.initialized, 0);
  assert(e.w.document.getElementById('loading').hidden);
  e.w.document.getElementById('new-game').click(); e.w.document.getElementById('new-game').click();
  await e.w.VoicesApp.ready(); await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(e.state.initialized, 1); assert.equal(e.state.clicked, 1);
  assert(e.w.VoicesApp.loaded); assert.equal(new Set(e.requested).size, e.requested.length);
  const scripts = [...e.w.document.querySelectorAll('script[src]')].filter(n => !n.src.endsWith('app-loader.js'));
  assert(scripts.every(n => n.async === true));
  await e.w.VoicesApp.ready(); assert.equal(e.state.initialized, 1); e.dom.window.close();
  console.log('PASS the title opens without the runtime, first actions replay once and the dependency graph starts before the game');
  const failed = environment(true);
  await assert.rejects(failed.w.VoicesApp.ready());
  assert.equal(failed.state.initialized, 0); assert(failed.w.document.querySelector('[role=alertdialog]'));
  assert.equal(failed.w.document.activeElement.textContent, 'Tentar novamente'); failed.dom.window.close();
  console.log('PASS resource failures offer a focused retry and do not start an incomplete runtime');
  const child = environment(false, true); await child.w.VoicesApp.ready(); assert.equal(child.state.initialized, 1); child.dom.window.close();
  console.log('PASS duo child views prepare automatically');
})().catch(error => { console.error(error); process.exitCode = 1; });
