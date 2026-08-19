(function(){
  window.EQ = window.EQ || {};
  const KEY='englishQuestLostSignal.v1';
  const BACKUP_KEY='englishQuestLostSignal.backup';
  const VERSION=1;
  const now=()=>new Date().toISOString();
  const clone=v=>JSON.parse(JSON.stringify(v));
  const defaults=()=>({
    version:VERSION,
    createdAt:now(),updatedAt:now(),
    teacher:{name:'Professor(a)',localPin:'',classCode:'ECHO-26'},
    classes:[{id:'class-demo',name:'Turma Demo',grade:6,trimester:2,code:'ECHO-26',students:[
      {id:'s1',nickname:'Lia 01',supportLevel:0},{id:'s2',nickname:'Kai 02',supportLevel:2},{id:'s3',nickname:'Nova 03',supportLevel:1}
    ],teams:[
      {id:'t-fire',name:'Fire Team',energy:0,color:'#ff7b6b',members:['s1']},
      {id:'t-water',name:'Water Team',energy:0,color:'#58b8ff',members:['s2']},
      {id:'t-earth',name:'Earth Team',energy:0,color:'#72d28b',members:['s3']},
      {id:'t-air',name:'Air Team',energy:0,color:'#d3b5ff',members:[]}
    ]}],
    profiles:[{id:'demo-student',nickname:'Explorer',classId:'class-demo',grade:6,avatar:'◉',xp:0,energy:0,completed:[],badges:[],supportLevel:0}],
    activeProfileId:'demo-student',activeClassId:'class-demo',
    sessions:[],participation:[],customQuestions:[],
    settings:{sound:true,music:false,volume:.45,portugueseSupport:false,supportLevel:0,fontScale:1,contrast:'standard',dyslexia:false,reducedMotion:false,reducedSound:false,interfaceDensity:'comfortable',largeTargets:false,projector:false,focusMode:false,timers:true,playMode:'individual'},
    unlocks:{worlds:[6,7,8,9],missions:[],cosmetics:['Signal Scout'],classEnergy:0},
    recoveryLog:[]
  });
  function merge(base, saved){
    if(!saved || typeof saved!=='object') return base;
    Object.keys(saved).forEach(k=>{
      if(saved[k] && typeof saved[k]==='object' && !Array.isArray(saved[k]) && base[k] && typeof base[k]==='object' && !Array.isArray(base[k])) base[k]=merge(base[k],saved[k]);
      else base[k]=saved[k];
    });
    return base;
  }
  function validate(d){
    if(!d || typeof d!=='object') throw new Error('Formato de dados inválido.');
    if(!Array.isArray(d.classes)||!Array.isArray(d.profiles)||!Array.isArray(d.sessions)) throw new Error('Estrutura principal incompleta.');
    return d;
  }
  function load(){
    const fresh=defaults();
    try{
      const raw=localStorage.getItem(KEY);
      if(!raw) return fresh;
      const parsed=validate(JSON.parse(raw));
      return merge(fresh,parsed);
    }catch(err){
      try{
        const backup=localStorage.getItem(BACKUP_KEY);
        if(backup){
          const recovered=merge(fresh,validate(JSON.parse(backup)));
          recovered.recoveryLog.push({at:now(),message:'Dados principais inválidos; backup automático restaurado.'});
          return recovered;
        }
      }catch(ignore){}
      fresh.recoveryLog.push({at:now(),message:'Não foi possível ler o save anterior. Um novo save seguro foi iniciado.'});
      return fresh;
    }
  }
  let data=load();
  let listeners=[];
  let saveTimer=null;
  function save(immediate){
    data.updatedAt=now();
    const write=()=>{
      try{
        const current=localStorage.getItem(KEY);
        if(current) localStorage.setItem(BACKUP_KEY,current);
        localStorage.setItem(KEY,JSON.stringify(data));
        listeners.forEach(fn=>fn(data));
      }catch(err){ console.error('Save error',err); }
    };
    clearTimeout(saveTimer);
    if(immediate) write(); else saveTimer=setTimeout(write,120);
  }
  function update(mutator, immediate){
    mutator(data); save(!!immediate); return data;
  }
  function activeProfile(){ return data.profiles.find(p=>p.id===data.activeProfileId)||data.profiles[0]; }
  function activeClass(){ return data.classes.find(c=>c.id===data.activeClassId)||data.classes[0]; }
  function recordAnswer(payload){
    const session=data.sessions.find(s=>s.id===payload.sessionId);
    if(!session) return;
    session.answers.push(Object.assign({at:now()},payload));
    session.correct=session.answers.filter(a=>a.correct).length;
    session.attempts=session.answers.length;
    save();
  }
  function startSession(meta){
    const session=Object.assign({id:'sess-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),startedAt:now(),endedAt:null,answers:[],correct:0,attempts:0,score:0,exitTicket:null},meta);
    data.sessions.push(session); save(true); return session;
  }
  function finishSession(id, summary){
    const s=data.sessions.find(x=>x.id===id); if(!s) return;
    Object.assign(s,summary,{endedAt:now()});
    const p=activeProfile();
    if(p && s.missionId){
      if(!p.completed.includes(s.missionId)) p.completed.push(s.missionId);
      p.xp=(p.xp||0)+(s.score||0);
      p.energy=(p.energy||0)+Math.round((s.accuracy||0)*2);
    }
    data.unlocks.classEnergy=(data.unlocks.classEnergy||0)+Math.round((s.accuracy||0)*1.5);
    save(true);
  }
  function reset(){ data=defaults(); save(true); return data; }
  function exportJSON(){
    return JSON.stringify({exportedAt:now(),app:'English Quest: The Lost Signal',payload:data},null,2);
  }
  function importJSON(text){
    const parsed=JSON.parse(text);
    const payload=validate(parsed.payload||parsed);
    localStorage.setItem(BACKUP_KEY,JSON.stringify(data));
    data=merge(defaults(),payload); save(true); return data;
  }
  function downloadBackup(){
    const blob=new Blob([exportJSON()],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='english-quest-backup-'+new Date().toISOString().slice(0,10)+'.json'; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  EQ.Store={get:()=>data,clone:()=>clone(data),update,save,reset,activeProfile,activeClass,startSession,recordAnswer,finishSession,exportJSON,importJSON,downloadBackup,onChange(fn){listeners.push(fn);return()=>listeners=listeners.filter(x=>x!==fn)},KEY};
})();
