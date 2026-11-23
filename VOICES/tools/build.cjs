'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const esbuild = require('esbuild');
const { root, manifest, editorManifest } = require('./runtime-files.cjs');

const output = path.join(root, 'dist');
const embedResearch = process.argv.includes('--with-research-pdfs');
const hash = text => crypto.createHash('sha256').update(text).digest('hex').slice(0, 12);
const clean = url => url.split('?')[0];
const read = url => fs.readFile(path.join(root, clean(url)), 'utf8');

function publish(relative) {
  const file = relative.replaceAll(path.sep, '/');
  const beneath = base => file === base || file.startsWith(base + '/');
  return (embedResearch || !beneath('data/sources')) && !beneath('assets/characters/renewed/source');
}

async function prune(relative) {
  const directory = path.join(output, relative);
  if (!path.resolve(directory).startsWith(path.resolve(output) + path.sep)) throw new Error('Invalid build output path');
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) await prune(child);
    else if (entry.isFile()) {
      const sourceExists = await fs.access(path.join(root, child)).then(() => true, error => {
        if (error.code !== 'ENOENT') throw error;
        return false;
      });
      if (!sourceExists || !publish(child)) await fs.unlink(path.join(output, child));
    }
  }
}

async function main() {
  let html = await read('index.html');
  const runtime = manifest(html);
  const initialStyles = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map(match => match[1]);
  const files = new Map();
  async function bundle(name, urls, extension) {
    const contents = (await Promise.all(urls.map(read))).join(extension === 'js' ? '\n;\n' : '\n');
    const result = await esbuild.transform(contents, {
      loader: extension, target: 'es2022', minify: true, legalComments: 'inline'
    });
    const url = extension + '/' + name + '.' + hash(result.code) + '.' + extension;
    files.set(url, result.code);
    return { url, sourceBytes: Buffer.byteLength(contents), bytes: Buffer.byteLength(result.code) };
  }

  const core = await bundle('runtime', [runtime.bootstrap, ...runtime.scripts], 'js');
  const loader = await bundle('app-loader', ['js/app-loader.js'], 'js');
  const pwa = await bundle('pwa', ['js/pwa.js'], 'js');
  const title = await bundle('title', initialStyles, 'css');
  const styles = await bundle('runtime', runtime.styles, 'css');
  const bundles = {};
  for (const [name, feature] of Object.entries(runtime.features)) {
    const scripts = feature.scripts.length ? [await bundle('feature-' + name, feature.scripts, 'js')] : [];
    const css = feature.styles.length ? [await bundle('feature-' + name, feature.styles, 'css')] : [];
    bundles[name] = { modules: feature.modules, scripts: scripts.map(file => file.url), styles: css.map(file => file.url) };
  }

  const publicRuntime = { scripts: [core.url], styles: [styles.url], modules: runtime.modules, features: bundles, externalResearch: !embedResearch };
  html = html.replace(/<link rel="stylesheet" href="[^"]+">/g, '');
  html = html.replace('</head>', '<link rel="stylesheet" href="' + title.url + '">\n</head>');
  html = html.replace(/(<script type="application\/json" id="voices-runtime">)[\s\S]*?(<\/script>)/, (_, a, b) => a + JSON.stringify(publicRuntime) + b);
  html = html.replace('src="js/app-loader.js"', 'src="' + loader.url + '"').replace('src="js/pwa.js"', 'src="' + pwa.url + '"');

  const sw = await read('sw.js');
  const webmanifest = await read('manifest.webmanifest');
  const deployment = hash(html + sw + webmanifest);
  files.set('sw.js', sw.replace("const DEPLOYMENT = 'source';", "const DEPLOYMENT = '" + deployment + "';"));
  files.set('manifest.webmanifest', webmanifest);
  const editor = await read('sprite-editor.html');
  files.set('sprite-editor.html', editor);

  for (const relative of ['js', 'css']) await fs.mkdir(path.join(output, relative), { recursive: true });
  const editorFiles = new Set([
    ...editorManifest(editor).map(entry => clean(entry.src)),
    ...[...editor.matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)(?:\?[^"]*)?"/g)].map(match => match[1])
  ]);
  await Promise.all([
    ...[...files].map(([file, contents]) => fs.writeFile(path.join(output, file), contents)),
    ...[...editorFiles, 'LICENSE.txt', 'NOTICE.txt'].map(file => fs.copyFile(path.join(root, file), path.join(output, file))),
    ...['assets', 'data'].map(folder => fs.cp(path.join(root, folder), path.join(output, folder), {
      recursive: true,
      filter: source => publish(path.relative(root, source))
    }))
  ]);
  await fs.writeFile(path.join(output, 'index.html'), html);
  for (const folder of ['assets', 'data']) await prune(folder);
  for (const folder of ['js', 'css']) {
    for (const name of await fs.readdir(path.join(output, folder))) {
      if (/^(?:runtime|app-loader|pwa|title|feature-[a-z-]+)\.[a-f0-9]{12}\.(js|css)$/.test(name) && !files.has(folder + '/' + name)) {
        await fs.unlink(path.join(output, folder, name));
      }
    }
  }
  const report = {
    sourceScripts: runtime.scripts.length,
    productionRuntimeRequests: 1,
    sourceScriptBytes: core.sourceBytes,
    productionScriptBytes: core.bytes,
    initialStyles: styles.bytes,
    titleCSSBytes: title.bytes,
    loaderBytes: loader.bytes,
    moduleOrder: require('../js/module-loader.js').resolve(runtime.modules).map(entry => entry.id),
    files: { runtime: core.url, loader: loader.url, title: title.url, styles: styles.url, pwa: pwa.url },
    deferred: Object.fromEntries(Object.entries(bundles).map(([name, feature]) => [
      name, { ...feature, bytes: [...feature.scripts, ...feature.styles].reduce((total, file) => total + Buffer.byteLength(files.get(file)), 0) }
    ])),
    researchPDFs: embedResearch,
    deployment
  };
  await fs.writeFile(path.join(output, 'build-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
