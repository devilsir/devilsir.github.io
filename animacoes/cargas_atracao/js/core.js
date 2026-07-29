(function(){
  'use strict';
  const C = window.Cargas = window.Cargas || {};

  C.VERSION = 3;
  C.CONSTANTS = Object.freeze({
    WIDTH:900, HEIGHT:540, FIXED_DT:1/120, MAX_FRAME:0.08,
    COULOMB_K:78000, SOFTENING:34, MAX_FORCE:2400, MAX_SPEED:480,
    TEST_RADIUS:13, CHARGE_RADIUS:18, TARGET_RADIUS:24
  });

  C.util = {
    clamp:(v,min,max)=>Math.max(min,Math.min(max,v)),
    lerp:(a,b,t)=>a+(b-a)*t,
    distance:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),
    dist2:(a,b)=>(a.x-b.x)**2+(a.y-b.y)**2,
    uid:(()=>{let id=0;return(prefix='obj')=>`${prefix}-${Date.now().toString(36)}-${(++id).toString(36)}`;})(),
    deepClone:value=>JSON.parse(JSON.stringify(value)),
    formatNumber:(value,digits=2)=>Number.isFinite(value)?new Intl.NumberFormat('pt-BR',{maximumFractionDigits:digits,minimumFractionDigits:digits}).format(value):'0,00',
    formatTime:seconds=>{const s=Math.max(0,Math.floor(seconds));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;},
    dateKey:(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`,
    seededRandom(seed){let h=2166136261>>>0;for(const ch of String(seed)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};},
    shuffle(array,random=Math.random){const a=array.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;},
    directionLabel(x,y){if(Math.hypot(x,y)<0.001)return 'equilíbrio';const angle=Math.atan2(y,x);const dirs=['→','↘','↓','↙','←','↖','↑','↗'];return dirs[Math.round(((angle+Math.PI*2)%(Math.PI*2))/(Math.PI/4))%8];},
    safeFilename(name){return String(name||'experimento').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9_-]+/gi,'-').replace(/^-|-$/g,'').toLowerCase()||'experimento';}
  };

  const defaultData = ()=>({
    version:C.VERSION,
    settings:{volume:.6,sfx:true,reducedMotion:false,highContrast:false,textScale:1,layers:{resultant:true,individual:false,components:false,field:false,lines:false,heatmap:false,trajectories:true,velocity:false,distance:false,grid:true,labels:true,values:false}},
    tutorialComplete:false,
    campaign:{levels:{},totalStars:0},
    quiz:{answered:0,correct:0,bestStreak:0,topics:{}},
    minigames:{},
    daily:{days:{},currentStreak:0,longestStreak:0,lastCompleted:null},
    achievements:{},
    experimentsCompleted:{},
    savedExperiments:[],
    stats:{timeLab:0,timeCampaign:0,timeQuiz:0,timeMinigames:0,objectsPlaced:0,frictionTransfers:0}
  });

  C.storage = {
    key:'cargas-lab-save-v3', data:defaultData(), available:true,
    load(){
      try{
        const raw=localStorage.getItem(this.key) || localStorage.getItem('cargas-lab-save-v2') || localStorage.getItem('cargas-lab-save');
        if(!raw){this.data=defaultData();return this.data;}
        const parsed=JSON.parse(raw);
        this.data=this.migrate(parsed);
      }catch(error){console.warn('Save inválido; usando dados seguros.',error);this.available=false;this.data=defaultData();}
      return this.data;
    },
    migrate(input){
      const base=defaultData();
      if(!input||typeof input!=='object')return base;
      const merge=(target,source)=>{for(const [key,value] of Object.entries(source||{})){if(value&&typeof value==='object'&&!Array.isArray(value)&&target[key]&&typeof target[key]==='object'&&!Array.isArray(target[key]))merge(target[key],value);else target[key]=value;}return target;};
      const migrated=merge(base,input);migrated.version=C.VERSION;
      if(!Array.isArray(migrated.savedExperiments))migrated.savedExperiments=[];
      return migrated;
    },
    save(){try{localStorage.setItem(this.key,JSON.stringify(this.data));this.available=true;return true;}catch(error){this.available=false;console.warn('Não foi possível salvar.',error);return false;}},
    update(mutator){mutator(this.data);this.save();C.events.emit('save:changed',this.data);},
    reset(){this.data=defaultData();this.save();C.events.emit('save:changed',this.data);},
    export(){return JSON.stringify(this.data,null,2);},
    import(raw){const parsed=JSON.parse(raw);if(!parsed||typeof parsed!=='object'||(!parsed.version&& !parsed.settings))throw new Error('Estrutura de dados inválida.');this.data=this.migrate(parsed);this.save();C.events.emit('save:changed',this.data);return this.data;}
  };

  C.events = {
    listeners:new Map(),
    on(name,fn){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(fn);return()=>this.listeners.get(name)?.delete(fn);},
    emit(name,payload){this.listeners.get(name)?.forEach(fn=>{try{fn(payload);}catch(error){console.error(error);}});}
  };

  C.ui = {
    toast(title,message='',type='info',duration=3400){const region=document.getElementById('toast-region');if(!region)return;const node=document.createElement('div');node.className=`toast ${type}`;node.innerHTML=`<b>${this.escape(title)}</b>${message?`<span>${this.escape(message)}</span>`:''}`;region.append(node);setTimeout(()=>node.remove(),duration);document.getElementById('sr-status').textContent=`${title}. ${message}`;},
    escape(text){const div=document.createElement('div');div.textContent=String(text??'');return div.innerHTML;},
    open(dialog){if(dialog&&!dialog.open)dialog.showModal();},
    close(dialog){if(dialog?.open)dialog.close();},
    confirm(text,title='Confirmar ação'){return new Promise(resolve=>{const dialog=document.getElementById('confirm-dialog');document.getElementById('confirm-title').textContent=title;document.getElementById('confirm-text').textContent=text;const ok=document.getElementById('confirm-ok');const cancel=document.getElementById('confirm-cancel');const finish=value=>{ok.onclick=null;cancel.onclick=null;dialog.oncancel=null;dialog.close();resolve(value);};ok.onclick=()=>finish(true);cancel.onclick=()=>finish(false);dialog.oncancel=event=>{event.preventDefault();finish(false);};dialog.showModal();});},
    result({kicker='Resultado',title,description='',icon='★',details=[],primary='Continuar',secondary='Voltar',onPrimary,onSecondary}){const d=document.getElementById('result-dialog');document.getElementById('result-kicker').textContent=kicker;document.getElementById('result-title').textContent=title;document.getElementById('result-description').textContent=description;document.getElementById('result-burst').textContent=icon;document.getElementById('result-details').innerHTML=details.map(item=>`<div><small>${this.escape(item.label)}</small><strong>${this.escape(item.value)}</strong></div>`).join('');const p=document.getElementById('result-primary-btn'),s=document.getElementById('result-secondary-btn');p.textContent=primary;s.textContent=secondary;p.onclick=()=>{d.close();onPrimary?.();};s.onclick=()=>{d.close();onSecondary?.();};d.showModal();}
  };

  C.audio = {
    context:null, master:null, unlocked:false,
    unlock(){if(this.unlocked||!C.storage.data.settings.sfx)return;try{const AC=window.AudioContext||window.webkitAudioContext;this.context=this.context||new AC();this.master=this.master||this.context.createGain();this.master.connect(this.context.destination);this.master.gain.value=C.storage.data.settings.volume;if(this.context.state==='suspended')this.context.resume();this.unlocked=true;}catch(error){console.warn('Web Audio indisponível.',error);}},
    setVolume(v){if(this.master)this.master.gain.value=v;},
    tone(type='button'){
      if(!this.unlocked||!C.storage.data.settings.sfx||!this.context)return;
      const presets={button:[420,.045,'sine'],place:[260,.08,'triangle'],pulse:[150,.12,'sine'],spark:[880,.09,'sawtooth'],success:[660,.18,'sine'],error:[150,.18,'square'],achievement:[520,.32,'triangle']};
      const [freq,dur,wave]=presets[type]||presets.button;const now=this.context.currentTime;const osc=this.context.createOscillator(),gain=this.context.createGain();osc.type=wave;osc.frequency.setValueAtTime(freq,now);if(type==='success'||type==='achievement')osc.frequency.exponentialRampToValueAtTime(freq*1.7,now+dur);gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.13,now+.012);gain.gain.exponentialRampToValueAtTime(.0001,now+dur);osc.connect(gain);gain.connect(this.master);osc.start(now);osc.stop(now+dur+.02);
    }
  };

  C.CanvasStage = class{
    constructor(canvas,width=C.CONSTANTS.WIDTH,height=C.CONSTANTS.HEIGHT){this.canvas=canvas;this.logicalWidth=width;this.logicalHeight=height;this.ctx=canvas.getContext('2d',{alpha:false});this.dpr=1;this.cssWidth=width;this.cssHeight=height;this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas);this.resize();}
    resize(){const rect=this.canvas.getBoundingClientRect();if(rect.width<2)return;this.dpr=Math.min(window.devicePixelRatio||1,2);this.cssWidth=rect.width;this.cssHeight=rect.width*(this.logicalHeight/this.logicalWidth);const w=Math.max(1,Math.round(this.cssWidth*this.dpr)),h=Math.max(1,Math.round(this.cssHeight*this.dpr));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}this.ctx.setTransform(w/this.logicalWidth,0,0,h/this.logicalHeight,0,0);}
    begin(){this.resize();this.ctx.setTransform(this.canvas.width/this.logicalWidth,0,0,this.canvas.height/this.logicalHeight,0,0);}
    point(event){const rect=this.canvas.getBoundingClientRect();return{x:C.util.clamp((event.clientX-rect.left)/rect.width*this.logicalWidth,0,this.logicalWidth),y:C.util.clamp((event.clientY-rect.top)/rect.height*this.logicalHeight,0,this.logicalHeight)};}
  };

  C.downloadText=(filename,text,type='application/json')=>{const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);};
})();
