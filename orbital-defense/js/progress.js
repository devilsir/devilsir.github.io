const Progress=(()=>{
 const key='orbital-save-v2'
 const profilesKey='orbital-profiles-v3'
 const curriculumVersion=5
 const unlockStage={miniSun:0,mercury:0,jupiter:0,belt:1,venus:1,mars:2,uranus:2,earth:3,neptune:3,saturn:4,gravity:4,moon:5,probe:5,pulsar:6,collector:6,neutron:7,janus:7}
 const defaults=()=>({version:2,curriculumVersion,unlocked:1,chapter:0,research:0,nodes:[],codex:[],scores:{},stars:{},phaseRecords:{},answerHistory:[],playerName:'',profileId:'',achievements:[],endlessBest:0,unlockTipsSeen:['miniSun','mercury'],settings:{difficulty:'standard',master:.65,music:.25,sfx:.65,shake:true,numbers:true,reduced:false,contrast:false,large:false},resume:null})
 const inferUnlockTips=d=>{
  const chapter=Math.max(0,Math.min(7,Number(d.chapter)||0)),seen=['miniSun','mercury']
  for(const [id,stage] of Object.entries(unlockStage))if(stage<chapter&&id!=='collector'&&!seen.includes(id))seen.push(id)
  if((d.achievements||[]).includes('tutorial')&&!seen.includes('jupiter'))seen.push('jupiter')
  return seen
 }
 let data=defaults(),available=true
 try{
  const raw=JSON.parse(localStorage.getItem(key)||localStorage.getItem('orbital-save')||'null')
  if(raw&&typeof raw==='object'){
   data={...data,...raw,version:2,settings:{...data.settings,...raw.settings}}
   for(const k of ['nodes','codex','achievements'])if(!Array.isArray(data[k]))data[k]=[]
   if((Number(raw.curriculumVersion)||0)<curriculumVersion){
    data.unlockTipsSeen=inferUnlockTips(data)
    data.curriculumVersion=curriculumVersion
   }else data.unlockTipsSeen=Array.isArray(raw.unlockTipsSeen)?[...new Set(raw.unlockTipsSeen.filter(v=>typeof v==='string'))]:inferUnlockTips(data)
   data.unlocked=Math.max(1,Math.min(8,Number(data.unlocked)||1))
   data.chapter=Math.max(0,Math.min(7,Number(data.chapter)||0))
   data.research=Math.max(0,Number(data.research)||0)
  }
 }catch(e){available=false}
 const normalize=(raw)=>{const d={...defaults(),...raw,settings:{...defaults().settings,...(raw.settings||{})}};for(const k of ['nodes','codex','achievements','answerHistory'])if(!Array.isArray(d[k]))d[k]=[];if(!d.phaseRecords||typeof d.phaseRecords!=='object')d.phaseRecords={};return d}
 const profiles=()=>{try{const list=JSON.parse(localStorage.getItem(profilesKey)||'{}');return list&&typeof list==='object'?list:{}}catch{return {}}}
 const persist=()=>{try{localStorage.setItem(key,JSON.stringify(data));if(data.profileId){const list=profiles();list[data.profileId]={name:data.playerName,chapter:data.chapter,updated:Date.now(),save:JSON.parse(JSON.stringify(data))};localStorage.setItem(profilesKey,JSON.stringify(list))}return true}catch(e){available=false;return false}}
 const makeProfile=(name)=>{name=String(name||'').trim().replace(/\s+/g,' ');if(name.length<2||name.length>48)throw Error('Informe um nome de 2 a 48 caracteres.');const configured=data.orbitalClass?{...data.orbitalClass,questions:[],results:[],history:[]}:null;data=defaults();data.playerName=name;data.profileId='orb'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);if(configured)data.orbitalClass=configured;persist();return data}
 const restoreProfile=(id)=>{const entry=profiles()[id];if(!entry||!entry.save||!entry.save.playerName)throw Error('Jogo salvo não encontrado.');data=normalize(entry.save);persist();return data}
 const claimLegacy=(name)=>{name=String(name||'').trim().replace(/\s+/g,' ');if(name.length<2||name.length>48)throw Error('Informe um nome de 2 a 48 caracteres.');data.playerName=name;data.profileId='orb'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);persist();return data}
 const forgetProfile=(id)=>{const list=profiles();delete list[id];try{localStorage.setItem(profilesKey,JSON.stringify(list));return true}catch{return false}}
 return {get data(){return data},get available(){return available},persist,profiles,makeProfile,restoreProfile,claimLegacy,forgetProfile,has:id=>data.nodes.includes(id),discover:id=>{if(!data.codex.includes(id)){data.codex.push(id);persist();return true}return false},earn:n=>{data.research+=n;persist()},reset:()=>{data=defaults();persist()},export:()=>JSON.stringify(data,null,2),import:text=>{const parsed=JSON.parse(text);if(parsed.version!==2||!Array.isArray(parsed.nodes)||!Array.isArray(parsed.codex)||typeof parsed.settings!=='object'||!Number.isFinite(parsed.research)||parsed.research<0)throw Error('Arquivo de progresso inválido.');data=normalize({...parsed,curriculumVersion});data.unlocked=Math.max(1,Math.min(8,Number(data.unlocked)||1));data.chapter=Math.max(0,Math.min(7,Number(data.chapter)||0));data.unlockTipsSeen=(Number(parsed.curriculumVersion)||0)<curriculumVersion?inferUnlockTips(data):Array.isArray(parsed.unlockTipsSeen)?[...new Set(parsed.unlockTipsSeen.filter(v=>typeof v==='string'))]:inferUnlockTips(data);persist()}}
})()
