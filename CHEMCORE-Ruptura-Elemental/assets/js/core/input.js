(function(){
 const C=window.ChemCore=window.ChemCore||{};
 const FALLBACKS={
  left:['ArrowLeft'],right:['ArrowRight'],jump:['Space','ArrowUp','KeyW'],
  dash:['ShiftLeft','ShiftRight'],fire:['KeyJ','KeyK','KeyF','ControlLeft','ControlRight'],
  interact:['KeyE'],pause:['Escape'],modeCycle:['KeyQ']
 };
 class InputSystem{
  constructor(save){
   this.save=save;this.keys=new Set();this.pressed=new Set();this.released=new Set();
   this.virtual=new Set();this.virtualPressed=new Set();this.virtualReleased=new Set();
   this.gamepadState={};this.gamepadPressed=new Set();this.gamepadReleased=new Set();
   this.pointer={x:0,y:0,down:false};this.enabled=true;this.handlers=[];this.bind();
  }
  bind(){
   const down=e=>{
    if(!this.enabled)return;
    const code=e.code;
    if(this.codesForAction().has(code))e.preventDefault();
    if(!this.keys.has(code))this.pressed.add(code);
    this.keys.add(code);
   };
   const up=e=>{this.keys.delete(e.code);this.released.add(e.code)};
   const blur=()=>{for(const code of this.keys)this.released.add(code);this.keys.clear();for(const name of this.virtual)this.virtualReleased.add(name);this.virtual.clear()};
   window.addEventListener('keydown',down,{passive:false});
   window.addEventListener('keyup',up);
   window.addEventListener('blur',blur);
   this.handlers.push(['keydown',down],['keyup',up],['blur',blur]);
  }
  codesForAction(){
   const codes=new Set(Object.values(this.save.data.settings.controls||{}));
   Object.values(FALLBACKS).flat().forEach(code=>codes.add(code));
   return codes;
  }
  codes(name){
   const configured=this.save.data.settings.controls?.[name];
   return [configured,...(FALLBACKS[name]||[])].filter(Boolean);
  }
  action(name){return this.codes(name).some(code=>this.keys.has(code))||this.virtual.has(name)||!!this.gamepadState[name]}
  just(name){return this.codes(name).some(code=>this.pressed.has(code))||this.virtualPressed.has(name)||this.gamepadPressed.has(name)}
  releasedAction(name){return this.codes(name).some(code=>this.released.has(code))||this.virtualReleased.has(name)||this.gamepadReleased.has(name)}
  setVirtual(name,on){
   if(on){if(!this.virtual.has(name))this.virtualPressed.add(name);this.virtual.add(name)}
   else{if(this.virtual.has(name))this.virtualReleased.add(name);this.virtual.delete(name)}
  }
  update(){
   const gp=navigator.getGamepads?.()[0],axis=gp?.axes||[],b=gp?.buttons||[];
   const next={
    left:(axis[0]||0)<-.35,right:(axis[0]||0)>.35,jump:!!b[0]?.pressed,dash:!!b[1]?.pressed,
    fire:!!b[2]?.pressed,interact:!!b[3]?.pressed,pause:!!b[9]?.pressed,
    mode1:!!b[4]?.pressed,mode2:!!b[5]?.pressed,modeCycle:!!b[6]?.pressed
   };
   const names=new Set([...Object.keys(this.gamepadState),...Object.keys(next)]);
   for(const name of names){
    if(next[name]&&!this.gamepadState[name])this.gamepadPressed.add(name);
    if(!next[name]&&this.gamepadState[name])this.gamepadReleased.add(name);
   }
   this.gamepadState=next;
  }
  endFrame(){
   this.pressed.clear();this.released.clear();this.virtualPressed.clear();this.virtualReleased.clear();
   this.gamepadPressed.clear();this.gamepadReleased.clear();
  }
  destroy(){for(const [t,h] of this.handlers)window.removeEventListener(t,h)}
 }
 C.InputSystem=InputSystem;
})();
