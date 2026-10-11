const AudioSystem=(()=>{
 let context=null,master=null,music=null,sfx=null,next=0,step=0
 const settings=()=>Progress.data.settings
 function unlock(){
  try{
   if(!context){context=new (window.AudioContext||window.webkitAudioContext)();master=context.createGain();music=context.createGain();sfx=context.createGain();music.connect(master);sfx.connect(master);master.connect(context.destination);volumes()}
   if(context.state==='suspended')context.resume()
  }catch(e){}
 }
 function volumes(){if(!context)return;master.gain.setTargetAtTime(settings().master,context.currentTime,.03);music.gain.setTargetAtTime(settings().music,context.currentTime,.03);sfx.gain.setTargetAtTime(settings().sfx,context.currentTime,.03)}
 function tone(freq,duration=.1,type='sine',volume=.08,destination=sfx,delay=0,end=null){
  if(!context||context.state!=='running')return
  const t=context.currentTime+delay,o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(end)o.frequency.exponentialRampToValueAtTime(end,t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(destination);o.start(t);o.stop(t+duration+.03);o.onended=()=>{o.disconnect();g.disconnect()}
 }
 function play(name){
  const bank={shot:[340,.07,'triangle',.035,90],impact:[95,.13,'triangle',.06,40],collect:[880,.18,'sine',.09,1320],upgrade:[440,.32,'sine',.09,880],correct:[660,.4,'sine',.1,1320],wrong:[160,.5,'sawtooth',.045,60],boss:[75,.9,'sawtooth',.06,35],victory:[523,.8,'sine',.1,1046],defeat:[220,.8,'triangle',.1,55],power:[200,.6,'sine',.12,1200],place:[300,.15,'sine',.08,600],combo:[610,.24,'triangle',.07,980],event:[160,.42,'sawtooth',.04,100],perk:[530,.33,'sine',.09,780],undo:[390,.18,'sine',.06,260]}
  const b=bank[name];if(!b)return;tone(b[0],b[1],b[2],b[3],sfx,0,b[4]);if(['correct','victory','upgrade'].includes(name))tone(b[0]*1.5,b[1],'sine',b[3]*.55,sfx,.12)
 }
 function tick(active){
  if(!context||!active||context.state!=='running'||settings().music<=0)return
  if(context.currentTime<next)return
  next=context.currentTime+.9
  const notes=[130.81,196,261.63,196,146.83,220,293.66,220]
  tone(notes[step++%notes.length],1.8,'sine',.07,music);if(step%4===0)tone(65.4,3.2,'sine',.1,music)
 }
 document.addEventListener('pointerdown',unlock,{once:true})
 document.addEventListener('keydown',unlock,{once:true})
 return {unlock,play,tick,volumes}
})()
