// ===== Utilitários =====
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const log10=(x)=>Math.log(x)/Math.log(10);
const Kw=1e-14;

// ===== Dados =====
const ACIDS=[
 {key:"hcl",name:"Ácido clorídrico",formula:"HCl (aq)",strength:"forte",nH:1,anion:{sym:"Cl⁻",charge:-1,salt:(cat)=>`${cat}Cl`}},
 {key:"hno3",name:"Ácido nítrico",formula:"HNO₃ (aq)",strength:"forte",nH:1,anion:{sym:"NO₃⁻",charge:-1,salt:(cat)=>`${cat}NO₃`}},
 {key:"h2so4",name:"Ácido sulfúrico",formula:"H₂SO₄ (aq)",strength:"forte",nH:2,anion:{sym:"SO₄²⁻",charge:-2,salt:(cat)=>`${cat}₂SO₄`}},
 {key:"ch3cooh",name:"Ácido acético",formula:"CH₃COOH (aq)",strength:"fraco",nH:1,pKa:4.76,anion:{sym:"CH₃COO⁻",charge:-1,salt:(cat)=>`${cat}CH₃COO`}},
];
const BASES=[
 {key:"naoh",name:"Hidróxido de sódio",formula:"NaOH (aq)",strength:"forte",nOH:1,cation:{sym:"Na⁺",saltCat:"Na"}},
 {key:"koh",name:"Hidróxido de potássio",formula:"KOH (aq)",strength:"forte",nOH:1,cation:{sym:"K⁺",saltCat:"K"}},
 {key:"baoh2",name:"Hidróxido de bário",formula:"Ba(OH)₂ (aq)",strength:"forte",nOH:2,cation:{sym:"Ba²⁺",saltCat:"Ba"}},
 {key:"nh3",name:"Amônia (aq)",formula:"NH₃ (aq)",strength:"fraco",nOH:1,pKb:4.74,cation:{sym:"—",saltCat:"NH₄"}},
 {key:"na2co3",name:"Carbonato de sódio",formula:"Na₂CO₃ (aq)",strength:"base-carbonato",nOH:2,carbonate:true,cation:{sym:"Na⁺",saltCat:"Na"}},
 {key:"nahco3",name:"Bicarbonato de sódio",formula:"NaHCO₃ (aq)",strength:"base-bicarbonato",nOH:1,bicarbonate:true,cation:{sym:"Na⁺",saltCat:"Na"}},
];
const INDICATORS=[
 {key:"btb",name:"Azul de bromotimol",ranges:[{max:6.0,color:"#f2d14b"},{max:7.6,color:"#2ea44f"},{max:15,color:"#1e88e5"}]},
 {key:"pph",name:"Fenolftaleína",ranges:[{max:8.2,color:"#f5f5f5"},{max:10.0,color:"#ff7eb6"},{max:15,color:"#d81b60"}]},
 {key:"vm",name:"Vermelho de metila",ranges:[{max:4.4,color:"#e53935"},{max:6.2,color:"#fb8c00"},{max:15,color:"#f4d03f"}]},
];

function saltName(acid,base){const cat=base.cation?.saltCat||"M";const anion=acid.anion; if(!anion) return "sal"; if(anion.charge===-2 && (cat==="Na"||cat==="K")) return `${cat}₂SO₄`; return anion.salt(cat);}
function reactionSummary(acid,base){const A=acid.key,B=base.key; if(A==="hcl"&&B==="naoh") return "HCl (aq) + NaOH (aq) → NaCl (aq) + H₂O (l)"; if(A==="hno3"&&B==="nh3")return"HNO₃ (aq) + NH₃ (aq) → NH₄NO₃ (aq)"; if(A==="ch3cooh"&&B==="naoh")return"CH₃COOH (aq) + NaOH (aq) → CH₃COONa (aq) + H₂O (l)"; if(A==="h2so4"&&B==="baoh2")return"H₂SO₄ (aq) + Ba(OH)₂ (aq) → BaSO₄ (s) + 2 H₂O (l)"; if(B==="nahco3"&&A==="hcl")return"HCl (aq) + NaHCO₃ (aq) → NaCl (aq) + CO₂ (g) + H₂O (l)"; if(B==="na2co3"&&A==="hcl")return"2 HCl (aq) + Na₂CO₃ (aq) → 2 NaCl (aq) + CO₂ (g) + H₂O (l)"; if(B==="nahco3"&&A==="ch3cooh")return"CH₃COOH (aq) + NaHCO₃ (aq) → CH₃COONa (aq) + CO₂ (g) + H₂O (l)"; if(B==="na2co3"&&A==="ch3cooh")return"2 CH₃COOH (aq) + Na₂CO₃ (aq) → 2 CH₃COONa (aq) + CO₂ (g) + H₂O (l)"; return `${acid.formula} + ${base.formula} → ${saltName(acid,base)} + H₂O (l)`;}
function indicatorColor(pH,key){const f=INDICATORS.find(i=>i.key===key)||INDICATORS[0]; for(const r of f.ranges){if(pH<=r.max) return r.color;} return f.ranges.at(-1).color;}

function compute({acidKey,baseKey,cA,cB,vAml,vBml}){
  const acid=ACIDS.find(a=>a.key===acidKey)||ACIDS[0];
  const base=BASES.find(b=>b.key===baseKey)||BASES[0];
  const VA=vAml/1000, VB=vBml/1000, Vt=Math.max(1e-9,VA+VB);
  const nAcidMol=cA*VA, nBaseMol=cB*VB;
  const acidEq=nAcidMol*(acid.nH||1); const baseEq=nBaseMol*(base.nOH||1);
  // CO2
  let nCO2=0; if(base.carbonate){const nCO3=nBaseMol; const maxFromAcid=acidEq/2; nCO2=Math.max(0,Math.min(nCO3,maxFromAcid));}
  else if(base.bicarbonate){const nHCO3=nBaseMol; nCO2=Math.max(0,Math.min(nHCO3,acidEq));}
  // BaSO4
  let nPrecip=0; if(acid.key==="h2so4"&&base.key==="baoh2"){const nBa2p=nBaseMol, nSO4=nAcidMol; nPrecip=Math.max(0,Math.min(nBa2p,nSO4));}
  // neutralização
  const eqReact=Math.min(acidEq,baseEq);
  let excessAcidEq=Math.max(0,acidEq-eqReact); let excessBaseEq=Math.max(0,baseEq-eqReact);
  let pH=7, regime="neutro";
  const strongAcid=acid.strength==="forte"; const strongBase=base.strength==="forte"||base.carbonate||base.bicarbonate;
  if(excessAcidEq>0&&strongAcid){const H=excessAcidEq/Vt; pH=-log10(clamp(H,1e-14,10)); regime="ácido (excesso ácido forte)";}
  else if(excessBaseEq>0&&strongBase){const OH=excessBaseEq/Vt; const pOH=-log10(clamp(OH,1e-14,10)); pH=14-pOH; regime="básico (excesso base forte)";}
  else if(acid.strength==="fraco"&&strongBase){const pKa=acid.pKa??5; const nAminus=eqReact; const nHA=Math.max(0,nAcidMol-eqReact); if(nHA>0&&nAminus>0){pH=pKa+log10(clamp(nAminus/nHA,1e-9,1e9)); regime="tampão (ácido fraco + base forte)";} else if(nHA===0&&nAminus>0){const Ka=10**(-pKa); const Kb=Kw/Ka; const C=nAminus/Vt; const OH=Math.sqrt(Math.max(0,Kb*C)); const pOH=-log10(clamp(OH,1e-14,10)); pH=14-pOH; regime="sal básico (A⁻)";} else {const Ka=10**(-pKa); const C=Math.max(1e-12,nAcidMol/Vt); const H=Math.sqrt(Ka*C); pH=-log10(clamp(H,1e-14,10)); regime="ácido fraco em água";}}
  else if(base.key==="nh3"){const pKb=base.pKb??4.74; const Kb=10**(-pKb); const pKa=-log10(Kw/Kb); const nBHplus=eqReact; const nB=Math.max(0,nBaseMol-eqReact); if(nB>0&&nBHplus>0){pH=pKa+log10(clamp(nB/nBHplus,1e-9,1e9)); regime="tampão (NH₃/NH₄⁺)";} else if(nB===0&&nBHplus>0){const Ka=Kw/Kb; const C=nBHplus/Vt; const H=Math.sqrt(Math.max(0,Ka*C)); pH=-log10(clamp(H,1e-14,10)); regime="sal ácido (NH₄⁺)";} else {const C=Math.max(1e-12,nBaseMol/Vt); const OH=Math.sqrt(Math.max(0,Kb*C)); const pOH=-log10(clamp(OH,1e-14,10)); pH=14-pOH; regime="base fraca em água";}}
  else {pH=7; regime="neutro (aprox.)";}
  pH=clamp(Number.isFinite(pH)?pH:7,0,14);
  const gas=nCO2>1e-6, precip=nPrecip>1e-9;
  const produtos=[]; if(gas)produtos.push("CO₂ (g)"); if(precip)produtos.push("BaSO₄ (s)"); const sal=saltName(acid,base); if(sal&&!/BaSO₄/.test(sal))produtos.push(`${sal} (aq)`); produtos.push("H₂O (l)");
  return {acid,base,Vt:pRound((VA+VB)*1000,0),pH,regime,gasCO2mol:nCO2,precipMol:nPrecip,produtos,eqText:reactionSummary(acid,base),excessAcidEq,excessBaseEq};
}
function pRound(v,dec=0){const m=10**dec;return Math.round(v*m)/m}

// ===== DOM refs =====
const acidSel=document.getElementById('acidSel');
const baseSel=document.getElementById('baseSel');
const cA=document.getElementById('cA');
const cB=document.getElementById('cB');
const vA=document.getElementById('vA');
const vB=document.getElementById('vB');
const indicatorBtns=document.getElementById('indicatorBtns');
const phFill=document.getElementById('phFill');
const phVal=document.getElementById('phVal');
const regimeTxt=document.getElementById('regime');
const prodList=document.getElementById('prodList');
const eqText=document.getElementById('eqText');
const phenos=document.getElementById('phenos');
const vtxt=document.getElementById('vtxt');
const examples=document.getElementById('examples');
const liquid=document.getElementById('liquid');
const liquidTint=document.getElementById('liquidTint');
const rising=document.getElementById('rising');
const surface=document.getElementById('surface');
const sediment=document.getElementById('sediment');

let state={acidKey:'hcl',baseKey:'naoh',cA:1,cB:1,vAml:25,vBml:25,indicator:'btb'};
let last={precipMol:0};
let timers={bubble:null};
let targetSediment=0; // quantos grãos queremos no fundo

function fillSelect(sel,arr){sel.innerHTML=arr.map((x)=>`<option value="${x.key}">${x.name} — ${x.formula}</option>`).join('');}
fillSelect(acidSel,ACIDS); fillSelect(baseSel,BASES);
acidSel.value=state.acidKey; baseSel.value=state.baseKey;

INDICATORS.forEach(ind=>{
  const b=document.createElement('button'); b.className='btn'; b.textContent=ind.name; b.onclick=()=>{state.indicator=ind.key; render();}; indicatorBtns.appendChild(b);
});

function setExample(id){
  if(id===1){Object.assign(state,{acidKey:'hcl',baseKey:'naoh',cA:1,cB:1,vAml:25,vBml:25,indicator:'btb'});} 
  if(id===2){Object.assign(state,{acidKey:'ch3cooh',baseKey:'naoh',cA:0.1,cB:0.1,vAml:25,vBml:25,indicator:'pph'});} 
  if(id===3){Object.assign(state,{acidKey:'hcl',baseKey:'nahco3',cA:1,cB:1,vAml:20,vBml:20,indicator:'btb'});} 
  if(id===4){Object.assign(state,{acidKey:'h2so4',baseKey:'baoh2',cA:0.5,cB:0.5,vAml:30,vBml:30,indicator:'btb'});} 
  if(id===5){Object.assign(state,{acidKey:'hcl',baseKey:'koh',cA:0.5,cB:0.5,vAml:30,vBml:30,indicator:'vm'});} 
  if(id===6){Object.assign(state,{acidKey:'hno3',baseKey:'nh3',cA:0.2,cB:0.2,vAml:25,vBml:25,indicator:'btb'});} 
  if(id===7){Object.assign(state,{acidKey:'ch3cooh',baseKey:'nahco3',cA:1,cB:1,vAml:20,vBml:20,indicator:'btb'});} 
  if(id===8){Object.assign(state,{acidKey:'ch3cooh',baseKey:'na2co3',cA:1,cB:0.5,vAml:40,vBml:20,indicator:'btb'});} 
  render(true);
}
[
  'HCl + NaOH (neutro)', 'CH₃COOH + NaOH (fenolftaleína)', 'HCl + NaHCO₃ (CO₂)', 'H₂SO₄ + Ba(OH)₂ (precip.)',
  'HCl + KOH (neutro)', 'HNO₃ + NH₃ (tampão)', 'CH₃COOH + NaHCO₃ (CO₂)', '2 CH₃COOH + Na₂CO₃ (CO₂)'
].forEach((txt,i)=>{
  const b=document.createElement('button'); b.className='btn'; b.style.textAlign='left'; b.textContent=txt; b.onclick=()=>setExample(i+1); examples.appendChild(b);
});

// Inputs
acidSel.onchange=()=>{state.acidKey=acidSel.value; render(true)};
baseSel.onchange=()=>{state.baseKey=baseSel.value; render(true)};
['cA','cB','vA','vB'].forEach(id=>{
  document.getElementById(id).addEventListener('input',()=>{
    state.cA=+cA.value||0; state.cB=+cB.value||0; state.vAml=+vA.value||0; state.vBml=+vB.value||0; render();
  });
});

document.getElementById('resetBtn').onclick=()=>{state={acidKey:'hcl',baseKey:'naoh',cA:1,cB:1,vAml:25,vBml:25,indicator:'btb'}; clearEffects(); render(true)};
document.getElementById('mixBtn').onclick=()=>{spawnBurst();};

function clearEffects(){
  rising.innerHTML=''; surface.innerHTML=''; sediment.innerHTML=''; targetSediment=0;
}

function render(changedSystem=false){
  const out=compute(state);
  vtxt.textContent=out.Vt.toFixed(0);
  phVal.textContent=out.pH.toFixed(2);
  regimeTxt.textContent=out.regime;
  phFill.style.width=(out.pH/14*100).toFixed(1)+'%';
  eqText.textContent=out.eqText;
  prodList.innerHTML=out.produtos.map(x=>`<li>${x}</li>`).join('');
  phenos.innerHTML='';
  if(out.gasCO2mol>0){const s=document.createElement('span');s.className='badge';s.textContent='Gás CO₂';phenos.appendChild(s)}
  if(out.precipMol>0){const s=document.createElement('span');s.className='badge';s.textContent='Precipitado BaSO₄';phenos.appendChild(s)}
  if(out.excessAcidEq>0){const s=document.createElement('span');s.className='badge';s.textContent='Excesso ácido';phenos.appendChild(s)}
  if(out.excessBaseEq>0){const s=document.createElement('span');s.className='badge';s.textContent='Excesso base';phenos.appendChild(s)}

  // Cor do líquido pelo indicador
  const col=indicatorColor(out.pH,state.indicator);
  liquidTint.style.background=`radial-gradient(60% 60% at 50% 20%, ${col}cc, ${col}aa 40%, ${col}99 60%, ${col}ff)`;

  // Efeitos
  const gasIntensity=clamp(out.gasCO2mol/0.002,0,1); // até ~2 mmol
  const precipIntensity=clamp(out.precipMol/0.0005,0,1); // escala

  // Bolhas: gerar continuamente quando há CO₂
  manageBubbleTimer(gasIntensity);

  // Precipitado: alvo de grãos proporcional (MAIOR quantidade pedida)
  const target=Math.min(1400, Math.round(precipIntensity*7000));
  if(changedSystem){ // se mudou a reação, recalcula do zero
    sediment.innerHTML='';
    targetSediment=0;
  }
  if(target>targetSediment){
    addSediment(target-targetSediment);
    targetSediment=target;
  } else if(target===0){
    sediment.innerHTML='';
    targetSediment=0;
  }
}

function manageBubbleTimer(intensity){
  if(timers.bubble) clearInterval(timers.bubble);
  if(intensity<=0){return}
  const baseRate=250; // ms
  timers.bubble=setInterval(()=>{
    const count=Math.max(1, Math.round(3 + intensity*10));
    for(let i=0;i<count;i++) spawnBubble();
  }, baseRate);
}

function spawnBurst(){
  for(let i=0;i<30;i++) setTimeout(spawnBubble, i*20);
}

function spawnBubble(){
  const b=document.createElement('span'); b.className='bubble';
  const size=4+Math.random()*12; b.style.width=b.style.height=size+'px';
  b.style.left=(5+Math.random()*90)+'%';
  const dur=(2.2+Math.random()*3.2).toFixed(2)+'s';
  b.style.animation=`riseOnce ${dur} ease-out forwards`;
  rising.appendChild(b);
  b.addEventListener('animationend',()=>{
    // Encosta na superfície e PERMANECE
    b.remove();
    const s=document.createElement('span'); s.className='surface-bubble';
    s.style.width=s.style.height=size+'px';
    s.style.left=(5+Math.random()*90)+'%';
    s.style.animation='surfaceWobble '+(3+Math.random()*4).toFixed(2)+'s ease-in-out infinite';
    surface.appendChild(s);
    // Limita número de bolhas de superfície para evitar excesso
    const maxSurf=160; while(surface.childElementCount>maxSurf){surface.removeChild(surface.firstChild)}
  });
}

function addSediment(n){
  for(let i=0;i<n;i++){
    const g=document.createElement('span'); g.className='grain';
    const size=2+Math.random()*3; g.style.width=g.style.height=size+'px';
    g.style.left=(5+Math.random()*90)+'%';
    const dur=(1.2+Math.random()*1.8).toFixed(2)+'s';
    g.style.animation=`sinkOnce ${dur} linear forwards`;
    rising.appendChild(g);
    g.addEventListener('animationend',()=>{
      g.remove();
      const s=document.createElement('span'); s.className='sediment';
      s.style.width=s.style.height=size+'px';
      s.style.left=(5+Math.random()*90)+'%';
      sediment.appendChild(s);
      // Para deixar um "manto" denso no fundo, não remover automaticamente
      const maxSed=5000; if(sediment.childElementCount>maxSed){ sediment.removeChild(sediment.firstChild); }
    });
  }
}

// Inicialização
render(true);
