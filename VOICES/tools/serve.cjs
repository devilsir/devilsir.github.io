'use strict';
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const workspace = path.resolve(__dirname, '..'), root = process.argv.includes('--dist') ? path.join(workspace, 'dist') : workspace;
const port = Number(process.env.PORT || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.wav': 'audio/wav', '.woff': 'font/woff', '.pdf': 'application/pdf' };
const server = http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end(); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) || /(?:^|[\\/])(?:\.|node_modules|tools|docs)[^\\/]*(?:[\\/]|$)/.test(path.relative(root, file))) { response.writeHead(403).end(); return; }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(file).pipe(response);
  });
});
server.listen(port, '127.0.0.1', () => console.log('Local: http://127.0.0.1:' + port + (root.endsWith('dist') ? ' (dist)' : '')));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
