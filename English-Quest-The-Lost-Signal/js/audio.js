(function(){
  window.EQ=window.EQ||{};
  let ctx=null;
  let ambient=[];
  function context(){
    if(!ctx){ const AC=window.AudioContext||window.webkitAudioContext; if(AC) ctx=new AC(); }
    if(ctx && ctx.state==='suspended') ctx.resume();
    return ctx;
  }
  function canPlay(){ const s=EQ.Store.get().settings; return s.sound && !s.reducedSound; }
  function tone(freq,duration,type,gain,delay){
    if(!canPlay()) return;
    const c=context(); if(!c) return;
    const o=c.createOscillator(),g=c.createGain();
    o.type=type||'sine'; o.frequency.value=freq; g.gain.setValueAtTime(0,c.currentTime+(delay||0));
    const volume=(EQ.Store.get().settings.volume||.45)*(gain||.08);
    g.gain.linearRampToValueAtTime(volume,c.currentTime+(delay||0)+.015);
    g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+(delay||0)+duration);
    o.connect(g).connect(c.destination); o.start(c.currentTime+(delay||0)); o.stop(c.currentTime+(delay||0)+duration+.02);
  }
  function correct(){tone(523,.18,'sine',.11);tone(659,.22,'sine',.1,.08);tone(784,.28,'triangle',.09,.16)}
  function softError(){tone(210,.16,'sine',.07);tone(175,.23,'triangle',.05,.1)}
  function click(){tone(410,.06,'sine',.035)}
  function unlock(){tone(392,.18,'triangle',.08);tone(523,.22,'triangle',.08,.12);tone(698,.36,'sine',.08,.24)}
  function speak(text,slow){
    if(!('speechSynthesis' in window)) return;
    speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang='en-US'; u.rate=slow?.65:.9; u.pitch=1; u.volume=EQ.Store.get().settings.volume||.45; speechSynthesis.speak(u);
  }
  function stopAmbient(){ambient.forEach(n=>{try{n.stop()}catch(e){}});ambient=[]}
  function syncAmbient(grade){
    const settings=EQ.Store.get().settings;
    if(!settings.music||settings.reducedSound){stopAmbient();return}
    if(ambient.length)return;
    const c=context();if(!c)return;
    const roots={6:[130.81,196],7:[146.83,220],8:[164.81,246.94],9:[110,164.81]}[grade]||[130.81,196];
    roots.forEach((freq,i)=>{const o=c.createOscillator(),g=c.createGain();o.type=i?'sine':'triangle';o.frequency.value=freq;g.gain.value=(settings.volume||.45)*.008;o.connect(g).connect(c.destination);o.start();ambient.push(o)});
  }
  EQ.Audio={correct,softError,click,unlock,speak,syncAmbient,stopAmbient,stop(){if('speechSynthesis'in window)speechSynthesis.cancel();stopAmbient()}};
})();
