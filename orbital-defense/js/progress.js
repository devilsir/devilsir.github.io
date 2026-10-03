const Progress=(()=>{
 const key='orbital-save-v2'
 const defaults=()=>({version:2,unlocked:1,chapter:0,research:0,nodes:[],codex:[],scores:{},stars:{},achievements:[],endlessBest:0,settings:{difficulty:'standard',master:.65,music:.25,sfx:.65,shake:true,numbers:true,reduced:false,contrast:false,large:false},resume:null})
 let data=defaults(),available=true
 try{
  const raw=JSON.parse(localStorage.getItem(key)||localStorage.getItem('orbital-save')||'null')
  if(raw&&typeof raw==='object'){
   data={...data,...raw,version:2,settings:{...data.settings,...raw.settings}}
   for(const k of ['nodes','codex','achievements'])if(!Array.isArray(data[k]))data[k]=[]
   data.unlocked=Math.max(1,Math.min(8,Number(data.unlocked)||1))
   data.chapter=Math.max(0,Math.min(7,Number(data.chapter)||0))
   data.research=Math.max(0,Number(data.research)||0)
  }
 }catch(e){available=false}
 const persist=()=>{try{localStorage.setItem(key,JSON.stringify(data));return true}catch(e){available=false;return false}}
 return {get data(){return data},get available(){return available},persist,has:id=>data.nodes.includes(id),discover:id=>{if(!data.codex.includes(id)){data.codex.push(id);persist();return true}return false},earn:n=>{data.research+=n;persist()},reset:()=>{data=defaults();persist()},export:()=>JSON.stringify(data,null,2),import:text=>{const parsed=JSON.parse(text);if(parsed.version!==2||!Array.isArray(parsed.nodes)||!Array.isArray(parsed.codex)||typeof parsed.settings!=='object'||!Number.isFinite(parsed.research)||parsed.research<0)throw Error('Arquivo de progresso inválido.');data={...defaults(),...parsed,settings:{...defaults().settings,...parsed.settings}};data.unlocked=Math.max(1,Math.min(8,Number(data.unlocked)||1));data.chapter=Math.max(0,Math.min(7,Number(data.chapter)||0));persist()}}
})()
