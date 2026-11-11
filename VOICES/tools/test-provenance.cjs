'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const inputs = ['index.html', 'sprite-editor.html', 'package.json', 'package-lock.json', 'LICENSE.txt', 'NOTICE.txt', '.gitignore', 'js', 'css', 'assets', 'data', 'tools'];
function snapshot(root, entries = inputs) {
  const files = [];
  function walk(relative) {
    const absolute = path.join(root, relative);
    if (!fs.existsSync(absolute)) return;
    const stat = fs.lstatSync(absolute);
    if (stat.isDirectory()) { for (const name of fs.readdirSync(absolute).sort()) walk(path.join(relative, name)); return; }
    if (!stat.isFile()) throw new Error('Test input must be a regular file: ' + relative);
    const data = fs.readFileSync(absolute);
    files.push({ path: relative.split(path.sep).join('/'), bytes: data.length, sha256: digest(data) });
  }
  for (const entry of entries) walk(entry);
  files.sort((a, b) => a.path.localeCompare(b.path, 'en'));
  return { algorithm: 'sha256', id: digest(JSON.stringify(files)), fileCount: files.length, bytes: files.reduce((n, file) => n + file.bytes, 0), files };
}
function saveSnapshot(root, value) {
  const relative = '.qa/test-inputs/' + value.id + '.json';
  const absolute = path.join(root, relative);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  if (!fs.existsSync(absolute)) fs.writeFileSync(absolute, JSON.stringify(value, null, 2));
  const { files, ...identity } = value;
  return { ...identity, manifest: relative };
}
function changedFiles(before, after) {
  const a = new Map(before.files.map(file => [file.path, file.sha256])), b = new Map(after.files.map(file => [file.path, file.sha256]));
  return [...new Set([...a.keys(), ...b.keys()])].filter(file => a.get(file) !== b.get(file)).sort();
}
module.exports = { snapshot, saveSnapshot, changedFiles };
