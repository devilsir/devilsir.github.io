import fs from 'node:fs'
import vm from 'node:vm'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { Window } from 'happy-dom'
const require=createRequire(import.meta.url)
const { createCanvas,Image:NativeImage }=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas':'@napi-rs/canvas')
export const root=fileURLToPath(new URL('../',import.meta.url))
export function harness(save=null,htmlFile=null){
 const html=fs.readFileSync(htmlFile||path.join(root,'index.html'),'utf8')
 const window=new Window({url:'https://orbital.local/',settings:{disableCSSFileLoading:true,disableJavaScriptFileLoading:true,enableJavaScriptEvaluation:false,disableComputedStyleRendering:true}})
 window.document.write(html.replace(/<script[\s\S]*?<\/script>/gi,''))
 window.requestAnimationFrame=()=>1
 window.cancelAnimationFrame=()=>{}
 window.HTMLCanvasElement.prototype.getContext=function(){if(!this.native||this.native.width!==this.width||this.native.height!==this.height)this.native=createCanvas(this.width,this.height);return this.native.getContext('2d')}
 window.HTMLCanvasElement.prototype.toDataURL=function(){return this.native.toDataURL()}
 class Image extends NativeImage{
  set src(value){super.src=value.startsWith('data:')?Buffer.from(value.slice(value.indexOf(',')+1),'base64'):fs.readFileSync(path.join(root,value))}
  get src(){return super.src}
 }
 window.Image=Image
 if(save)window.localStorage.setItem('orbital-save-v2',JSON.stringify(save))
 const context=vm.createContext(window)
 const scripts=htmlFile?[...html.matchAll(/<script(?:\s[^>]*?)?>([\s\S]*?)<\/script>/gi)].map((match,i)=>[match[1],'inline-'+i]):['js/assets.js','js/progress.js','js/audio.js','js/physics.js','js/content.js','game.js','js/ui.js'].map(file=>[fs.readFileSync(path.join(root,file),'utf8'),file])
 for(const [code,filename] of scripts)vm.runInContext(code,context,{filename})
 return {window,doc:window.document,run:code=>vm.runInContext(code,context),canvas:()=>window.document.getElementById('gameCanvas').native,close:()=>window.happyDOM.abort()}
}
