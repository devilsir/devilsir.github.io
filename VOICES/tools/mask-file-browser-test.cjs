'use strict';
// Exercise real file:// restrictions. Do not add --allow-file-access-from-files.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{spawn}=require('child_process'),{pathToFileURL}=require('url');
const root=path.resolve(__dirname,'..'),out=path.join(root,'.qa/review');fs.mkdirSync(out,{recursive:true});
const browser=spawn(process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',[
 '--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check',
 '--user-data-dir='+path.join(root,'.qa/mask-file-browser'),'--remote-debugging-pipe'
],{windowsHide:true,stdio:['ignore','ignore','pipe','pipe','pipe']});
let serial=0,buffer='',session,stderr='';const pending=new Map(),exceptions=[],results=[];
browser.stderr.on('data',chunk=>{stderr=(stderr+chunk).slice(-5000);});
function send(method,params={},sessionId=session){
 return new Promise((resolve,reject)=>{
  const id=++serial,timer=setTimeout(()=>{pending.delete(id);reject(new Error('CDP timeout: '+method+' '+stderr));},120000);
  pending.set(id,{resolve,reject,timer});browser.stdio[3].write(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})})+'\0');
 });
}
browser.stdio[4].on('data',chunk=>{
 buffer+=chunk.toString();let end;
 while((end=buffer.indexOf('\0'))>=0){
  const message=JSON.parse(buffer.slice(0,end));buffer=buffer.slice(end+1);
  if(message.id){const request=pending.get(message.id);if(!request)continue;clearTimeout(request.timer);pending.delete(message.id);message.error?request.reject(new Error(JSON.stringify(message.error))):request.resolve(message.result);}
  if(message.method==='Runtime.exceptionThrown')exceptions.push(message.params.exceptionDetails);
 }
});
browser.on('error',error=>{for(const request of pending.values()){clearTimeout(request.timer);request.reject(error);}pending.clear();});
async function evaluate(expression){
 const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
 if(result.exceptionDetails)throw new Error(JSON.stringify(result.exceptionDetails));return result.result.value;
}
async function until(expression){
 const deadline=Date.now()+120000;
 while(Date.now()<deadline){if(await evaluate(expression))return;await new Promise(resolve=>setTimeout(resolve,250));}
 throw new Error('Page condition timed out: '+expression+'\n'+await evaluate('JSON.stringify({screen:V.Game.screen,loading:document.querySelector("#loading").hidden,assets:V.AssetLoader.counts(),errors:V.Assets.errors})'));
}
async function click(expression){
 await until('!window.V?.MapAssets?.tasks.size');
 const point=await evaluate(`(()=>{const el=${expression};if(!el)throw new Error('Missing click target');el.scrollIntoView({block:'center'});const r=el.getBoundingClientRect();if(!r.width||!r.height)throw new Error('Hidden click target: '+el.outerHTML);return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
 await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
}
async function screenshot(name){const result=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(path.join(out,name+'.png'),Buffer.from(result.data,'base64'));}
async function check(name,fn){await fn();results.push({name,pass:true});console.log('PASS',name);}
async function start(duo){
 await evaluate(`(async()=>{const V=window.V;V.DuoPanels.closeAll();V.Game.toTitle();V.settings.playerCharacters=${JSON.stringify(duo?['nia','leo']:['nia'])};V.settings.challengePlayers=${duo?2:1};V.Game.newState({name:'Teste de arquivo local',character:'nia'});Object.assign(V.state.flags,{prologueDone:true,prologueStarted:true});V.Game.startGame();await V.MapAssets.whenReady();V.Onboarding.active=false;V.Onboarding.suspended=true;V.GuideOverlay.hide();V.UI.close();if(${duo}){V.DuoTutorial.finish(0,true);V.DuoTutorial.finish(1,true);V.DuoPanels.closeAll();}return true;})()`);
}
(async()=>{
 try{
  const target=await send('Target.createTarget',{url:'about:blank'},null);session=(await send('Target.attachToTarget',{targetId:target.targetId,flatten:true},null)).sessionId;
  await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:pathToFileURL(path.join(root,'index.html')).href});
  await until('!!(window.V?.Engine?.canvas&&V.World?.maps?.hub&&document.querySelector("#loading").hidden&&V.Game.screen==="title")');
  await check('local images really taint canvases under normal file URL restrictions',async()=>{
   const blocked=await evaluate(`(()=>{const c=document.createElement('canvas');c.getContext('2d').drawImage(V.AncestralMask.images.gallery,0,0);try{c.toDataURL();return false;}catch(error){return error.name==='SecurityError';}})()`);assert.equal(blocked,true);
  });
  await start(false);
  await check('solo player opens the selector and changes model and color using real clicks',async()=>{
   await click('document.querySelector("#historio-button")');
   await click('document.querySelector("[data-historio-change-mask]")');
   assert(await evaluate('document.querySelector(".historio-wardrobe").open'));
   await click('document.querySelector("[data-mask-model=hibisco]")');await click('document.querySelector("[data-mask-palette=rubi]")');
   assert(await evaluate('V.AncestralMask.ensureAnimation("hibisco",0,"rubi")'));
   assert.deepEqual(await evaluate('V.AncestralMask.appearance(0)'),{model:'hibisco',palette:'rubi'});
   assert(await evaluate('!!V.AncestralMask.selectedAnimation(0)'));await screenshot('mask-file-solo');
  });
  await start(true);
  await check('both duo selectors open and save independent animated colors using real clicks',async()=>{
   for(const [owner,model,palette] of [[0,'plumagem','turquesa'],[1,'caveira','violeta']]){
    await click(`document.querySelector('[data-world-menu="historio"][data-world-player="${owner}"]')`);
    await click(`V.DuoPanels.root(${owner}).querySelector('[data-historio-change-mask]')`);
    assert(await evaluate(`V.DuoPanels.root(${owner}).querySelector('.historio-wardrobe').open`));
    await click(`V.DuoPanels.root(${owner}).querySelector('[data-mask-model="${model}"]')`);
    await click(`V.DuoPanels.root(${owner}).querySelector('[data-mask-palette="${palette}"]')`);
    assert(await evaluate(`V.AncestralMask.ensureAnimation('${model}',${owner},'${palette}')`));
    assert.deepEqual(await evaluate(`V.AncestralMask.appearance(${owner})`),{model,palette});
   }
   assert.equal(await evaluate('document.querySelectorAll("[data-world-menu=mask]").length'),0);
   await screenshot('mask-file-duo');
  });
  await check('saved styles restore after a full local-page reload',async()=>{
   await evaluate('V.Save.save()');await send('Page.reload');
   await until('!!(window.V?.Engine?.canvas&&V.World?.maps?.hub&&document.querySelector("#loading").hidden&&V.Game.screen==="title")');
   await evaluate('(async()=>{V.Game.loadState(V.Save.load());await V.MapAssets.whenReady();await Promise.all([V.AncestralMask.ensureAnimation("plumagem",0,"turquesa"),V.AncestralMask.ensureAnimation("caveira",1,"violeta")]);return true;})()');
   for(const [owner,model,palette] of [[0,'plumagem','turquesa'],[1,'caveira','violeta']]){
    assert.deepEqual(await evaluate(`V.AncestralMask.appearance(${owner})`),{model,palette});assert(await evaluate(`!!V.AncestralMask.selectedAnimation(${owner})`));
   }
  });
  await check('there are no uncaught browser errors',()=>assert.deepEqual(exceptions,[]));
 }catch(error){results.push({name:'file browser validation',pass:false,error:error.stack,exceptions});console.error(error.stack);try{await screenshot('mask-file-failure');}catch{}process.exitCode=1;}
 finally{fs.writeFileSync(path.join(out,'mask-file-results.json'),JSON.stringify(results,null,2));try{await send('Browser.close',{},null);}catch{}browser.kill();}
})();
