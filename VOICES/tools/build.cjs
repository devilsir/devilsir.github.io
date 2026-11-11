'use strict';
const fs = require('node:fs/promises'), path = require('node:path'), crypto = require('node:crypto');
const esbuild = require('esbuild'), { root, manifest, editorManifest } = require('./runtime-files.cjs');
const output = path.join(root, 'dist');
const hash = text => crypto.createHash('sha256').update(text).digest('hex').slice(0, 12);
async function main() {
  let html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  const runtime = manifest(html), initial = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(m => m[1]);
  const read = url => fs.readFile(path.join(root, url.split('?')[0]), 'utf8');
  // Files register factories; the same dependency graph controls source and bundle startup.
  const script = await read(runtime.bootstrap) + '\n;\n' + (await Promise.all(runtime.scripts.map(read))).join('\n;\n');
  const bundled = await esbuild.transform(script, { loader: 'js', target: 'es2022', minify: true, legalComments: 'inline' });
  const loader = await esbuild.transform(await read('js/app-loader.js'), { loader: 'js', target: 'es2022', minify: true });
  const css = async urls => (await esbuild.transform((await Promise.all(urls.map(read))).join('\n'), { loader: 'css', minify: true })).code;
  const titleCSS = await css(initial), runtimeCSS = await css(runtime.styles);
  const names = { runtime: 'js/runtime.' + hash(bundled.code) + '.js', loader: 'js/app-loader.' + hash(loader.code) + '.js', title: 'css/title.' + hash(titleCSS) + '.css', styles: 'css/runtime.' + hash(runtimeCSS) + '.css' };
  await fs.mkdir(path.join(output, 'js'), { recursive: true });
  await fs.mkdir(path.join(output, 'css'), { recursive: true });
  // Only remove our previous generated bundles, never user-authored assets.
  for (const folder of ['js', 'css']) for (const name of await fs.readdir(path.join(output, folder))) {
    if (/^(runtime|app-loader|title)\.[a-f0-9]{12}\.(js|css)$/.test(name)) await fs.unlink(path.join(output, folder, name));
  }
  // Synchronize removed source data without recursively deleting a directory.
  const pruneData = async relative => {
    const directory = path.join(output, relative);
    let entries; try { entries = await fs.readdir(directory, { withFileTypes: true }); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
    for (const entry of entries) {
      const name = path.join(relative, entry.name);
      if (entry.isDirectory()) await pruneData(name);
      else if (entry.isFile()) { try { await fs.access(path.join(root, name)); } catch (error) { if (error.code !== 'ENOENT') throw error; await fs.unlink(path.join(output, name)); } }
    }
  };
  await pruneData('data');
  await Promise.all([
    fs.writeFile(path.join(output, names.runtime), bundled.code), fs.writeFile(path.join(output, names.loader), loader.code),
    fs.writeFile(path.join(output, names.title), titleCSS), fs.writeFile(path.join(output, names.styles), runtimeCSS),
    fs.cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true }),
    fs.cp(path.join(root, 'data'), path.join(output, 'data'), { recursive: true }),
    ...['LICENSE.txt', 'NOTICE.txt'].map(file => fs.copyFile(path.join(root, file), path.join(output, file)))
  ]);
  html = html.replace(/<link rel="stylesheet" href="[^"]+">/g, '');
  html = html.replace('</head>', '<link rel="stylesheet" href="' + names.title + '">\n</head>');
  html = html.replace(/(<script type="application\/json" id="voices-runtime">)[\s\S]*?(<\/script>)/, (_, a, b) => a + JSON.stringify({ scripts: [names.runtime], styles: [names.styles], modules: runtime.modules }) + b);
  html = html.replace('src="js/app-loader.js"', 'src="' + names.loader + '"');
  await fs.writeFile(path.join(output, 'index.html'), html);
  // Keep the standalone sprite editor available in the distributable.
  const editor = await fs.readFile(path.join(root, 'sprite-editor.html'), 'utf8');
  await fs.writeFile(path.join(output, 'sprite-editor.html'), editor);
  const editorFiles=new Set([...editorManifest(editor).map(entry=>entry.src.split('?')[0]),...[...editor.matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)(?:\?[^"]*)?"/g)].map(match=>match[1])]);
  for (const file of editorFiles) await fs.copyFile(path.join(root,file),path.join(output,file));
  const report = { sourceScripts: runtime.scripts.length, productionRuntimeRequests: 1, moduleOrder:require('../js/module-loader.js').resolve(runtime.modules).map(entry=>entry.id), sourceScriptBytes: Buffer.byteLength(script), productionScriptBytes: Buffer.byteLength(bundled.code), titleCSSBytes: Buffer.byteLength(titleCSS), loaderBytes: Buffer.byteLength(loader.code), files: names };
  await fs.writeFile(path.join(output, 'build-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
