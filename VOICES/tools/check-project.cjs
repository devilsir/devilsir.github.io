'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict'), acorn = require('acorn'), { root, manifest, editorManifest } = require('./runtime-files.cjs');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8'), runtime = manifest(html);
const editor = fs.readFileSync(path.join(root, 'sprite-editor.html'), 'utf8');
const scripts = runtime.scripts.map(url => url.split('?')[0]);
const refs = [...scripts, runtime.bootstrap, ...editorManifest(editor).map(entry=>entry.src), ...runtime.styles, ...[...(html + editor).matchAll(/(?:src|href)="((?:js|css|assets)\/[^"?]+)(?:\?[^"]*)?"/g)].map(m => m[1])].map(url => url.split('?')[0]);
const graph=JSON.parse(fs.readFileSync(path.join(root,'data/module-graph.json'),'utf8'));
assert.deepEqual(runtime.modules,graph.game,'The embedded game catalog must match the declared dependency graph');
assert.deepEqual(editorManifest(editor),graph.editor,'The embedded editor catalog must match the declared dependency graph');
assert.equal(new Set(scripts).size, scripts.length, 'Duplicate runtime scripts');
for (const file of refs) assert(fs.existsSync(path.join(root, file)), 'Missing reference: ' + file);
const reachable = new Set(refs);
for (const folder of ['js', 'css']) for (const file of fs.readdirSync(path.join(root, folder))) {
  if (/\.(?:js|css)$/.test(file)) assert(reachable.has(folder + '/' + file), 'Unreferenced application file: ' + folder + '/' + file);
}
let checked = 0;
for (const folder of ['js', 'tools']) for (const file of fs.readdirSync(path.join(root, folder))) {
  if (!/\.(?:js|cjs)$/.test(file)) continue;
  new vm.Script(fs.readFileSync(path.join(root, folder, file), 'utf8'), { filename: folder + '/' + file }); checked++;
}
const walk = (node, visit) => { if (!node || typeof node !== 'object') return; if (node.type) visit(node); for (const value of Object.values(node)) { if (Array.isArray(value)) value.forEach(child => walk(child, visit)); else if (value && typeof value === 'object') walk(value, visit); } };
const memberPath = node => node?.type === 'Identifier' ? node.name : node?.type === 'MemberExpression' ? memberPath(node.object) + '.' + (node.computed ? node.property.value : node.property.name) : '';
for(const entry of [...runtime.modules,...editorManifest(editor)]){
  const tree=acorn.parse(fs.readFileSync(path.join(root,entry.src.split('?')[0]),'utf8'),{ecmaVersion:'latest'}),ids=[];
  walk(tree,node=>{if(node.type==='CallExpression'&&memberPath(node.callee)==='window.VoicesModules.define')ids.push(node.arguments[0]?.value);});
  assert.deepEqual(ids,[entry.id],'Module factory must match its declared ID: '+entry.src);
}
for (const file of scripts) {
  const source = fs.readFileSync(path.join(root, file), 'utf8'), tree = acorn.parse(source, { ecmaVersion: 'latest' });
  const owners = new Set(['V.Game']);
  walk(tree, node => { if (node.type === 'VariableDeclarator' && node.id.type === 'Identifier' && memberPath(node.init) === 'V.Game') owners.add(node.id.name); });
  walk(tree, node => {
    if (node.type !== 'AssignmentExpression' || node.left.type !== 'MemberExpression') return;
    const method = node.left.computed ? node.left.property.value : node.left.property.name;
    assert(!owners.has(memberPath(node.left.object)) || !['update', 'interact'].includes(method), 'Use named runtime hooks: ' + file);
  });
}
for (const folder of ['assets', 'data']) {
  const walk = dir => { for (const item of fs.readdirSync(dir, { withFileTypes: true })) { const file = path.join(dir, item.name); if (item.isDirectory()) { if (item.name !== 'fonts') walk(file); } else if (/manifest.*\.json$/.test(item.name)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.equal(data.license, 'MIT', file);
    assert.deepEqual(data.authors, ['Lucas Xavier Nardelli', 'Claudilene Alves Lopes'], file);
    assert.equal(path.resolve(path.dirname(file), data.licenseFile), path.join(root, 'LICENSE.txt'), file);
  } } };
  walk(path.join(root, folder));
}
console.log(JSON.stringify({ syntaxChecked: checked, referencesChecked: refs.length, runtimeScripts: scripts.length, namedExtensions: 'required' }));
