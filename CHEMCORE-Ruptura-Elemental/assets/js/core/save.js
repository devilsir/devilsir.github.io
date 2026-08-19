(function(){
 const C=window.ChemCore=window.ChemCore||{},U=C.Utils;
 const KEY='chemcore-ruptura-save-v1';
 let memoryStore='';
 function readStore(){try{return localStorage.getItem(KEY)||''}catch(e){console.warn('Armazenamento persistente indisponível; usando memória da sessão.',e);return memoryStore}}
 function writeStore(text){try{localStorage.setItem(KEY,text);return true}catch(e){memoryStore=text;console.warn('Falha no armazenamento persistente; progresso mantido apenas nesta sessão.',e);return false}}
 const defaults=()=>({
  version:1,profile:{name:'Agente',createdAt:new Date().toISOString()},
  settings:{sound:true,music:true,dialogue:true,shake:true,reducedMotion:false,highContrast:false,colorblind:false,simplifiedEffects:false,guided:true,extendedTime:false,textScale:1,effectsVolume:.7,musicVolume:.35,dialogueVolume:.8,
   controls:{left:'KeyA',right:'KeyD',jump:'Space',dash:'ShiftLeft',fire:'KeyJ',interact:'KeyE',pause:'Escape',mode1:'Digit1',mode2:'Digit2',mode3:'Digit3',mode4:'Digit4',mode5:'Digit5'}},
  progress:{unlocked:['a1','t1','c1'],completed:{},mastery:{},researchPoints:0,notebookUnlocked:['matter','particle-model','transformations'],diagnostic:{},daily:{lastDate:null,streak:0,completed:0},enem:{best:0,attempts:0}},
  teacher:{codeHash:U.hash('3141'),unlockedMissions:[],playlist:[],timers:true,unlimitedAttempts:false,guided:true,sessionMode:'complete',studentName:'Agente'},
  reports:[]
 });
 function merge(base,loaded){if(!loaded||typeof loaded!=='object')return base;for(const k of Object.keys(loaded)){if(loaded[k]&&typeof loaded[k]==='object'&&!Array.isArray(loaded[k])&&base[k]&&typeof base[k]==='object'&&!Array.isArray(base[k]))merge(base[k],loaded[k]);else base[k]=loaded[k]}return base}
 class SaveSystem{
  constructor(){this.data=merge(defaults(),U.safeJSON(readStore(),{}));this.normalize();this.applySettings()}
  normalize(){const ids=(C.Data?.missions||[]).map(m=>m.id);this.data.progress.unlocked=this.data.progress.unlocked.filter(id=>ids.includes(id));['a1','t1','c1'].forEach(id=>{if(!this.data.progress.unlocked.includes(id))this.data.progress.unlocked.push(id)})}
  save(){return writeStore(JSON.stringify(this.data))}
  reset(){this.data=defaults();this.save();this.applySettings()}
  applySettings(){const s=this.data.settings;document.documentElement.style.setProperty('--text-scale',String(s.textScale||1));document.body.classList.toggle('high-contrast',!!s.highContrast);document.body.classList.toggle('colorblind',!!s.colorblind);document.body.classList.toggle('reduced-motion',!!s.reducedMotion);document.body.classList.toggle('large-focus',true)}
  updateSetting(key,value){this.data.settings[key]=value;this.save();this.applySettings();document.dispatchEvent(new CustomEvent('chemcore:settings',{detail:this.data.settings}))}
  isUnlocked(id){return this.data.progress.unlocked.includes(id)||this.data.teacher.unlockedMissions.includes(id)}
  unlock(id){if(!this.data.progress.unlocked.includes(id))this.data.progress.unlocked.push(id);this.save()}
  completeMission(mission,result){const prev=this.data.progress.completed[mission.id];const score={...result,completedAt:new Date().toISOString(),attempts:(prev?.attempts||0)+1,bestRank:betterRank(prev?.bestRank,result.rank),bestTime:prev?.bestTime?Math.min(prev.bestTime,result.time):result.time,bestCores:Math.max(prev?.bestCores||0,result.cores||0)};this.data.progress.completed[mission.id]=score;this.data.progress.researchPoints+=(result.researchPoints||0);if(mission.mastery)this.data.progress.mastery[mission.id]=true;const list=C.Data.missions.filter(m=>m.year===mission.year&&m.main);const idx=list.findIndex(m=>m.id===mission.id);if(idx>=0&&list[idx+1])this.unlock(list[idx+1].id);if(idx===list.length-1){const mastery=C.Data.missions.find(m=>m.year===mission.year&&m.mastery);if(mastery)this.unlock(mastery.id)}
   const unlockConcepts=C.Data.notebook.concepts.filter(x=>x.year===mission.year).slice(0,Math.min(32,(idx+1)*3+3)).map(x=>x.id);for(const id of unlockConcepts)if(!this.data.progress.notebookUnlocked.includes(id))this.data.progress.notebookUnlocked.push(id);
   const next=C.Data.missions.find(m=>m.year===mission.year&&m.main&&m.index===mission.index+1);const report={id:U.id('report'),missionId:mission.id,missionTitle:mission.title,year:mission.year,student:this.data.teacher.studentName||this.data.profile.name,date:new Date().toISOString(),...result,bncc:mission.bncc,crmg:mission.crmg,topic:mission.topic,learningObjective:mission.learningObjective,conceptsPracticed:[mission.topic],skillsDemonstrated:(result.accuracy>=.7?mission.bncc:[]),skillsToReview:(result.conceptErrors||result.hints?mission.bncc:[]),suggestedNextMissions:next?[next.id]:[]};this.data.reports.unshift(report);this.data.reports=this.data.reports.slice(0,100);this.save();return report}
  campaignProgress(year){const list=C.Data.missions.filter(m=>m.year===year&&m.main);const done=list.filter(m=>this.data.progress.completed[m.id]).length;return {done,total:list.length,percent:list.length?Math.round(done/list.length*100):0}}
  exportJSON(){U.download(`chemcore-progresso-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(this.data,null,2))}
  exportCSV(){const headers=['estudante','data','ano','missao','topico','rank','tempo_s','nucleos','tentativas','dicas','erros_conceituais','precisao','bncc','crmg'];const rows=this.data.reports.map(r=>[r.student,r.date,r.year,r.missionTitle,r.topic,r.rank,r.time,r.cores,r.attemptsUsed,r.hints,r.conceptErrors,r.accuracy,(r.bncc||[]).join(' '),r.crmg]);const csv=[headers,...rows].map(row=>row.map(U.csvCell).join(';')).join('\n');U.download(`chemcore-relatorios-${new Date().toISOString().slice(0,10)}.csv`,`\ufeff${csv}`,'text/csv;charset=utf-8')}
 }
 function betterRank(a,b){const order=['S','A','B','C','D'];if(!a)return b;return order.indexOf(b)<order.indexOf(a)?b:a}
 C.SaveSystem=SaveSystem;
})();
