'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const refs=[...html.matchAll(/(?:src|href)="([^"?]+\.(?:js|css))(?:\?[^"]*)?"/g)].map(m=>m[1]);
refs.push(...require('./runtime-files.cjs').manifest(html).scripts.map(url=>url.split('?')[0]),...require('./runtime-files.cjs').manifest(html).styles.map(url=>url.split('?')[0]));
const errors=[];
refs.push(require('./runtime-files.cjs').manifest(html).bootstrap);
for(const file of refs){const full=path.join(root,file);if(!fs.existsSync(full)){errors.push('Missing '+file);continue;}if(file.endsWith('.js'))try{new vm.Script(fs.readFileSync(full,'utf8'),{filename:file});}catch(e){errors.push(file+': '+e.message);}}
const report=JSON.parse(fs.readFileSync(path.join(root,'data/image-optimization-report.json'),'utf8'));
for(const file of report.files){assert(fs.existsSync(path.join(root,file.target)),file.target);assert(file.after<file.before);assert(file.width>0&&file.height>0);}
const context={window:{V:{}},URL,document:{baseURI:'https://example.org/VOICES/'}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'js/optimized-images.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'js/image-delivery-data.js'),'utf8'),context);
const formats=context.window.V.ImageFormats;
for(const file of report.files){assert.equal(formats.resolve(file.source),'https://example.org/VOICES/'+file.target);assert.equal(formats.canonical(file.target),formats.canonical(file.source));}
console.log(JSON.stringify({references:refs.length,errors,optimizedImages:report.images,savedBytes:report.before_bytes-report.after_bytes},null,2));
if(errors.length)process.exitCode=1;
