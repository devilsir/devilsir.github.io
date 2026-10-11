(function () {
  'use strict';
  const V=window.V;
  // Original score, effects and local CC0 soundscapes.
  const themes={menu:[57,60,64,67,64,60,55,60],hub:[60,64,67,72,67,64,62,67],rhythm:[48,55,60,63,55,60,67,63],museum:[50,57,62,65,62,57,53,60],lab:[60,67,74,72,69,67,64,62],network:[45,52,57,60,57,52,48,55],community:[60,65,69,72,69,65,67,64],final:[45,48,52,57,55,52,48,45],boss:[45,45,52,48,45,55,52,48],victory:[60,64,67,72,76,72,79,84]};
  const files={plaza:'plaza',library:'library',park:'park',market:'market',garden:'garden',studio:'studio',lab:'lab',archive:'archive',newsroom:'newsroom'};
  V.Audio={
    ctx:null,musicGain:null,sfxGain:null,unlocked:false,theme:'menu',beat:0,timer:null,
    ambient:null,ambientTracks:[],fadeTime:1,fadeDuration:.9,mixerTimer:null,environment:'plaza',ambientError:false,stepTime:0,visibilityBound:false,
    init(){
      if(!this.visibilityBound){this.visibilityBound=true;document.addEventListener('visibilitychange',()=>this.apply());}
      if(this.ctx)return;
      try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();this.musicGain=this.ctx.createGain();this.sfxGain=this.ctx.createGain();this.musicGain.connect(this.ctx.destination);this.sfxGain.connect(this.ctx.destination);this.apply();}catch(e){console.warn('Áudio sintético indisponível:',e.message);}
    },
    async unlock(){
      this.init();if(this.ctx){try{await this.ctx.resume();}catch(e){console.warn('Ative o som com um clique:',e.message);}}
      this.unlocked=true;this.apply();if(this.ctx&&!this.timer)this.timer=setInterval(()=>this.tick(),240);
      if(!this.mixerTimer){let last=Date.now();this.mixerTimer=setInterval(()=>{const now=Date.now();this.mix((now-last)/1000);last=now;},50);}
    },
    apply(){
      const s=V.settings||{},silent=s.muted||document.hidden;
      if(this.ctx){this.musicGain.gain.value=silent?0:(s.music??.35)*.22;this.sfxGain.gain.value=silent?0:(s.effects??.65)*.28;}
      if(this.unlocked&&!this.ambient)this.loadAmbient();
      for(const track of this.ambientTracks){const el=track.el;el.volume=V.clamp(silent?0:(s.ambience??.55)*(this.theme==='boss'?.4:.85)*track.gain,0,1);if(silent||!this.unlocked)el.pause();else if(el.paused){const playing=el.play();playing?.catch(()=>{this.ambientError=true;});}}
    },
    loadAmbient(){
      if(typeof window.Audio!=='function')return;
      const el=this.createAmbient();if(!el)return;this.ambient=el;this.ambientTracks=[{el,gain:1,start:1,target:1}];
    },
    createAmbient(){
      if(typeof window.Audio!=='function')return null;
      const el=new window.Audio('assets/audio/'+(files[this.environment]||'plaza')+'.wav');el.loop=true;el.preload='auto';el.volume=0;
      el.onerror=()=>{this.ambientError=true;console.warn('Ambiente local não carregado. Extraia todos os arquivos de áudio.');};return el;
    },
    mix(dt){
      if(this.fadeTime>=this.fadeDuration)return;this.fadeTime=Math.min(this.fadeDuration,this.fadeTime+V.clamp(dt,0,.25));
      const t=this.fadeTime/this.fadeDuration;for(const track of this.ambientTracks)track.gain=track.start+(track.target-track.start)*t;
      if(t===1){this.ambientTracks=this.ambientTracks.filter(track=>{if(track.target===0){track.el.pause();return false;}return true;});}this.apply();
    },
    setEnvironment(map){
      const next=map.id==='library'?'library':map.id==='park'?'park':map.id==='market'?'market':map.id==='garden'?'garden':map.theme==='room'?map.chapter===1?'studio':map.chapter===3?'lab':map.chapter===4?'newsroom':map.chapter===2||map.chapter===6?'archive':'library':map.chapter===1?'studio':map.chapter===3?'lab':map.chapter===4?'newsroom':map.chapter===6?'archive':map.chapter===5?'park':'plaza';
      if(next===this.environment){this.apply();return;}this.environment=next;
      if(this.ambient){const el=this.createAmbient();if(el){for(const track of this.ambientTracks){track.start=track.gain;track.target=0;}this.ambient=el;this.ambientTracks.push({el,gain:0,start:0,target:1});while(this.ambientTracks.length>3)this.ambientTracks.shift().el.pause();this.fadeTime=0;}}this.apply();
    },
    setTheme(name){if(name==='room')name=['hub','rhythm','museum','lab','network','community','final'][V.World?.current?.chapter||0];if(this.theme!==name){this.theme=name;this.beat=0;}this.apply();},
    note(midi,duration=.2,type='sine',vol=.2,target='sfx',delay=0){
      if(!this.ctx||!this.unlocked)return;const at=this.ctx.currentTime+delay,osc=this.ctx.createOscillator(),gain=this.ctx.createGain();osc.type=type;osc.frequency.value=440*Math.pow(2,(midi-69)/12);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(vol,at+.009);gain.gain.exponentialRampToValueAtTime(.0001,at+duration);osc.connect(gain);gain.connect(target==='music'?this.musicGain:this.sfxGain);osc.start(at);osc.stop(at+duration+.03);
    },
    tick(){if(!this.unlocked||V.settings?.muted||document.hidden)return;const seq=themes[this.theme]||themes.hub,b=this.beat++;if(b%2===0)this.note(seq[Math.floor(b/2)%seq.length],.42,this.theme==='network'?'triangle':'sine',.4,'music');if(b%4===0)this.note(seq[Math.floor(b/2)%seq.length]-12,.7,'triangle',.22,'music');if(this.theme==='rhythm'||this.theme==='boss')this.drum(b%2===0?'kick':'hat','music');},
    drum(kind='kick',target='sfx'){
      if(!this.ctx||!this.unlocked)return;const at=this.ctx.currentTime,gain=this.ctx.createGain();gain.connect(target==='music'?this.musicGain:this.sfxGain);
      if(kind==='kick'){const o=this.ctx.createOscillator();o.frequency.setValueAtTime(140,at);o.frequency.exponentialRampToValueAtTime(42,at+.17);gain.gain.setValueAtTime(.6,at);gain.gain.exponentialRampToValueAtTime(.001,at+.2);o.connect(gain);o.start();o.stop(at+.21);}else{const buffer=this.ctx.createBuffer(1,Math.floor(this.ctx.sampleRate*.09),this.ctx.sampleRate),d=buffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);const source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter();source.buffer=buffer;filter.type='highpass';filter.frequency.value=kind==='hat'?7000:1800;source.connect(filter);filter.connect(gain);gain.gain.value=.19;source.start();}
    },
    footsteps(dt){if(!V.Player?.data?.moving){this.stepTime=0;return;}this.stepTime+=dt;if(this.stepTime<.34)return;this.stepTime=0;this.note(V.World.current.theme==='room'?36:31,.045,'triangle',.055);},
    sfx(type){if(type==='step')return;const cues={menu:[67],talk:[74],collect:[72,76,79],correct:[67,72,76],wrong:[50,47],shield:[65,77],hit:[43,39],portal:[60,67,72,79],victory:[60,64,67,72,79],glitch:[45,46,40],beat:[60],observe:[72,79],water:[67,71,74]};(cues[type]||[67]).forEach((n,i)=>this.note(n,type==='talk'?.05:.22,'triangle',type==='talk'?.07:.38,'sfx',i*.07));}
  };
})();
