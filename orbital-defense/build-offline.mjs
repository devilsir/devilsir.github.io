import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root=path.dirname(fileURLToPath(import.meta.url))
const output=path.resolve(process.argv[2]||path.join(root,'ORBITAL-offline.html'))
const assets={}
for(const name of fs.readdirSync(path.join(root,'assets')).filter(name=>name.endsWith('.png')).sort())assets[name]='data:image/png;base64,'+fs.readFileSync(path.join(root,'assets',name)).toString('base64')
let html=fs.readFileSync(path.join(root,'index.html'),'utf8')
html=html.replace('<link rel="stylesheet" href="style.css">',()=>'<style>'+fs.readFileSync(path.join(root,'style.css'),'utf8')+'</style>')
html=html.replace(/src="assets\/([^\"]+)"/g,(_,name)=>{if(!assets[name])throw new Error('Asset ausente: '+name);return 'src="'+assets[name]+'"'})
html=html.replace(/<script src="([^\"]+)"><\/script>/g,(_,name)=>'<script>'+fs.readFileSync(path.join(root,name),'utf8').replace(/<\/script/gi,'<\\/script')+'</script>')
html=html.replace('<body>','<body><script>window.ORBITAL_ASSETS='+JSON.stringify(assets)+'</script>')
fs.mkdirSync(path.dirname(output),{recursive:true})
fs.writeFileSync(output,html)
console.log('HTML offline criado: '+output+' ('+fs.statSync(output).size+' bytes)')
