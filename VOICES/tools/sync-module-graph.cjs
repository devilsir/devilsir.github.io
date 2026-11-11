'use strict';
const fs=require('node:fs'),path=require('node:path'),{root,manifest}=require('./runtime-files.cjs'),modules=require('../js/module-loader.js');
const graph=JSON.parse(fs.readFileSync(path.join(root,'data/module-graph.json'),'utf8'));
for(const key of ['game','editor']){
 modules.resolve(graph[key]);
 for(const entry of graph[key]){
  if(!/^js\/[a-z0-9-]+\.js(?:\?[a-zA-Z0-9_.=&%+-]+)?$/.test(entry.src))throw new Error('Invalid module source: '+entry.src);
  if(!fs.existsSync(path.join(root,entry.src.split('?')[0])))throw new Error('Module file is missing: '+entry.src);
 }
 graph[key].sort((a,b)=>a.id.localeCompare(b.id,'en'));
}
fs.writeFileSync(path.join(root,'data/module-graph.json'),JSON.stringify(graph,null,2)+'\n');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),runtime=manifest(html);delete runtime.scripts;runtime.modules=graph.game;
fs.writeFileSync(path.join(root,'index.html'),html.replace(/(<script type="application\/json" id="voices-runtime">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(runtime)+b));
const editor=fs.readFileSync(path.join(root,'sprite-editor.html'),'utf8');fs.writeFileSync(path.join(root,'sprite-editor.html'),editor.replace(/(<script type="application\/json" id="voices-editor-modules">)[\s\S]*?(<\/script>)/,(_,a,b)=>a+JSON.stringify(graph.editor)+b));
console.log('Synchronized explicit dependency catalogs for game and sprite editor.');
