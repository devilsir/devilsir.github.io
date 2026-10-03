const Progress=(()=>{
 const key='orbital-save-v2'
 const defaults=()=>({version:2,unlocked:1,chapter:0,research:0,nodes:[],codex:[],scores:{},stars:{},achievements:[],endlessBest:0,unlockTipsSeen:['miniSun','mercury','belt'],settings:{difficulty:'standard',master:.65,music:.25,sfx:.65,shake:true,numbers:true,reduced:false,contrast:false,large:false},resume:null})
 let data=defaults(),available=true
 const inferUnlockTips=d=>{const seen=['miniSun','mercury','belt'];if((d.unlocked||1)>1)seen.push('venus','mars','earth','uranus','neptune','jupiter','saturn','gravity','probe');if((d.unlocked||1)>=3||(d.nodes||[]).includes('moon'))seen.push('moon');if((d.unlocked||1)>=5||(d.nodes||[]).includes('pulsar'))seen.push('pulsar');if((d.unlocked||1)>=7||(d.nodes||[]).includes('neutron'))seen.push('neutron');return [...new Set(seen)]}
 try{
  const raw=JSON.parse(localStorage.getItem(key)||localStorage.getItem('orbital-save')||'null')
  if(raw&&typeof raw==='object'){
   data={...data,...raw,version:2,settings:{...data.settings,...raw.settings}}
   for(const k of ['nodes','codex','achievements'])if(!Array.isArray(data[k]))data[k]=[]
   data.unlockTipsSeen=Array.isArray(raw.unlockTipsSeen)?[...new Set(raw.unlockTipsSeen.filter(v=>typeof v==='string'))]:inferUnlockTips(data)
   data.unlocked=Math.max(1,Math.min(8,Number(data.unlocked)||1))
   data.chapter=Math.max(0,Math.min(7,Number(data.chapter)||0))
   data.research=Math.max(0,Number(data.research)||0)
  }
 }catch(e){available=false}
 const persist=()=>{try{localStorage.setItem(key,JSON.stringify(data));return true}catch(e){available=false;return false}}
 return {get data(){return data},get available(){return available},persist,has:id=>data.nodes.includes(id),discover:id=>{if(!data.codex.includes(id)){data.codex.push(id);persist();return true}return false},earn:n=>{data.research+=n;persist()},reset:()=>{data=defaults();persist()},export:()=>JSON.stringify(data,null,2),import:text=>{const parsed=JSON.parse(text);if(parsed.version!==2||!Array.isArray(parsed.nodes)||!Array.isArray(parsed.codex)||typeof parsed.settings!=='object'||!Number.isFinite(parsed.research)||parsed.research<0)throw Error('Arquivo de progresso inválido.');data={...defaults(),...parsed,settings:{...defaults().settings,...parsed.settings}};data.unlocked=Math.max(1,Math.min(8,Number(data.unlocked)||1));data.chapter=Math.max(0,Math.min(7,Number(data.chapter)||0));data.unlockTipsSeen=Array.isArray(parsed.unlockTipsSeen)?[...new Set(parsed.unlockTipsSeen.filter(v=>typeof v==='string'))]:inferUnlockTips(data);persist()}}
})()
