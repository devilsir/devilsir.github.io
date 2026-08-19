(function(){
 const C=window.ChemCore=window.ChemCore||{};
 class AudioSystem{
  constructor(save){this.save=save;this.ctx=null;this.master=null;this.musicTimer=null;this.step=0;this.theme=1}
  ensure(){if(this.ctx)return;const A=window.AudioContext||window.webkitAudioContext;if(!A)return;this.ctx=new A();this.master=this.ctx.createGain();this.master.gain.value=.45;this.master.connect(this.ctx.destination)}
  resume(){this.ensure();if(this.ctx?.state==='suspended')this.ctx.resume()}
  tone(freq=440,duration=.08,type='sine',volume=.12,slide=0){if(!this.save.data.settings.sound)return;this.resume();if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,this.ctx.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),this.ctx.currentTime+duration);g.gain.setValueAtTime(0.001,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(volume*this.save.data.settings.effectsVolume,this.ctx.currentTime+.01);g.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+duration);o.connect(g);g.connect(this.master);o.start();o.stop(this.ctx.currentTime+duration+.02)}
  sfx(name){const map={jump:[430,.09,'square',.07,150],dash:[190,.16,'sawtooth',.12,500],fire:[520,.07,'square',.07,-130],hit:[90,.18,'sawtooth',.16,-50],core:[700,.26,'sine',.13,700],terminal:[330,.12,'triangle',.09,220],success:[520,.32,'sine',.12,520],error:[170,.22,'square',.09,-70],pause:[260,.08,'triangle',.06,0],boss:[80,.5,'sawtooth',.15,50]};this.tone(...(map[name]||[400,.08,'sine',.08,0]))}
  startMusic(theme=1){this.stopMusic();if(!this.save.data.settings.music)return;this.resume();this.theme=theme;const scales={1:[110,138.59,164.81,220,277.18],2:[82.41,110,123.47,164.81,196],3:[98,123.47,146.83,196,233.08]};const scale=scales[theme]||scales[1];this.musicTimer=setInterval(()=>{if(document.hidden||!this.save.data.settings.music)return;const f=scale[this.step%scale.length]*(this.step%8===7?2:1);this.musicTone(f,.26);this.step++},320)}
  musicTone(freq,duration){if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();o.type='triangle';o.frequency.value=freq;filter.type='lowpass';filter.frequency.value=900;g.gain.setValueAtTime(.001,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.055*this.save.data.settings.musicVolume,this.ctx.currentTime+.02);g.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+duration);o.connect(filter);filter.connect(g);g.connect(this.master);o.start();o.stop(this.ctx.currentTime+duration+.03)}
  stopMusic(){clearInterval(this.musicTimer);this.musicTimer=null}
  dialogue(){if(!this.save.data.settings.dialogue)return;this.tone(620,.045,'sine',.025,30)}
 }
 C.AudioSystem=AudioSystem;
})();
