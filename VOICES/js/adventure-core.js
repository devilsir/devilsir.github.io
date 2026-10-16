(function(){
'use strict';
const V=window.V,D=V.AdventureData,esc=V.escape,copy=x=>JSON.parse(JSON.stringify(x));
const labels={health:'Vida',focus:'Foco',attack:'Ataque',defense:'Defesa',knowledge:'Conhecimento',agility:'Agilidade',resolve:'Determinação'};
const P=V.Progress={
migrated:new WeakSet(),
threshold(level){return 40*level*(level-1);},
migrate(s){
if(!s)return null;
if(this.migrated.has(s))return s.adventure;
const old=s.adventure||{},legacy=!old.schema;
const completed=s.completed||[];
const baseline=completed.reduce((n,id)=>n+260+id*90,0)+(s.evidence||[]).length*40;
const a=s.adventure=Object.assign({schema:3,xp:legacy?baseline:0,level:1,attributes:{},attributePoints:0,skillPoints:5,skills:{critical:1,restore:1,shield:1},passives:{},inventory:{water:6,tea:5,kit:3,lantern:1,notebook:1,coat:1},questItems:{historiograph:1,letter:1},storage:{},equipped:{device:'historiograph',tool:'lantern',clothing:'coat',accessory:'notebook'},health:null,focus:null,resonance:0,overload:0,lanternOn:true,ledger:{},party:[],companions:[],clock:{hour:17.8,day:1,cycleMinutes:24,speed:1,paused:false,daylight:false},weather:{type:'clear',target:'clear',intensity:.55,remaining:240,wind:.25,seed:971},story:{stage:'museum',traces:{},interpreted:[],choices:{},visited:[],pulseClues:[],ending:null},battle:null,tracked:null,routeEnabled:true,routePattern:false,routeOpacity:.8,scenarios:null},old);
a.schema=3;
for(const key of ['attributes','skills','passives','inventory','questItems','equipped','ledger','storage'])if(!a[key]||typeof a[key]!=='object'||Array.isArray(a[key]))a[key]={};
a.skills={critical:1,restore:1,shield:1,...a.skills};
a.questItems.historiograph=1;
a.equipped.device='historiograph';
a.story=Object.assign({stage:'museum',traces:{},interpreted:[],choices:{},visited:[],pulseClues:[],ending:null},a.story);
a.clock=Object.assign({hour:17.8,day:1,cycleMinutes:24,speed:1,paused:false,daylight:false},a.clock);
a.weather=Object.assign({type:'clear',target:'clear',intensity:.55,remaining:240,wind:.25,seed:971},a.weather);
if(legacy){
for(const id of completed){a.ledger['battle-chapter-'+id]=true;a.ledger['chapter-'+id]=true;a.story.interpreted.push(id);a.story.traces[id]=[0,1,2];}
for(const id of s.evidence||[])a.ledger['clue-'+id]=true;
for(const id of s.talked||[])a.ledger['talk-'+id]=true;
if(completed.length){a.story.stage='awake';a.story.met=true;a.companions=['sol','leo','librarian'].filter(x=>x!==s.character);a.party=a.companions.slice(0,2);}
if(s.finished){a.story.ending='shared';a.story.stage='epilogue';}
}
let level=1;while(level<20&&a.xp>=this.threshold(level+1))level++;
if(legacy){a.level=level;a.skillPoints+=Math.max(0,level-1)*2;a.attributePoints+=level-1;}
a.level=V.clamp(Math.floor(Number(a.level)||level),1,20);
a.xp=Math.max(0,Number(a.xp)||0);
a.clock.hour=((Number(a.clock.hour)||0)%24+24)%24;
a.clock.cycleMinutes=V.clamp(Number(a.clock.cycleMinutes)||24,2,240);
this.migrated.add(s);
return a;
},
ensure(){return V.state?this.migrate(V.state):null;},
bonus(stat,a=this.ensure()){return D.passives.reduce((n,p)=>n+(p.stat===stat?(a.passives[p.id]||0)*p.value:0),0);},
stats(a=this.ensure()){
if(!a)return{};
const l=a.level-1,b={health:110+13*l,focus:70+5*l,attack:16+2.2*l,defense:8+1.2*l,knowledge:14+2*l,agility:10+l,resolve:12+l};
for(const k of Object.keys(b))b[k]+=(a.attributes[k]||0)*(k==='health'?10:k==='focus'?6:k==='attack'||k==='knowledge'?3:2)+this.bonus(k,a);
for(const id of Object.values(a.equipped))for(const[k,n]of Object.entries(D.items[id]?.stats||{}))b[k]=(b[k]||0)+n;
return Object.fromEntries(Object.entries(b).map(([k,n])=>[k,Math.round(n)]));
},
reward(key,xp,items={}){
const a=this.ensure();if(!a||a.ledger[key])return false;
a.ledger[key]=true;
a.xp+=Math.max(0,Math.round(xp));
for(const[id,n]of Object.entries(items))this.add(id,n);
let levels=0;while(a.level<20&&a.xp>=this.threshold(a.level+1)){a.level++;a.attributePoints++;a.skillPoints+=2;levels++;}
if(levels){const s=this.stats();a.health=s.health;a.focus=s.focus;V.UI.toast('Nível '+a.level+'! +'+levels+' ponto(s) de atributo e +'+levels*2+' de habilidade.');V.Audio.sfx('victory');}
V.Events.emit('adventure:reward',{key,xp,levels});
return true;
},
slots(a=this.ensure()){return Object.entries(a.inventory).reduce((n,[id,q])=>n+Math.ceil(q/(D.items[id]?.stack||1)),0);},
add(id,n=1){
const a=this.ensure(),item=D.items[id];if(!a||!item||!Number.isFinite(n)||n<1)return false;
n=Math.floor(n);
if(item.unique){a.questItems[id]=1;return true;}
const before=a.inventory[id]||0;a.inventory[id]=before+n;
if(this.slots(a)>24){a.inventory[id]=before;if(!before)delete a.inventory[id];a.storage[id]=(a.storage[id]||0)+n;V.UI.toast('Mochila cheia: '+item.name+' ficou guardado no depósito da recepção.');return false;}
return true;
},
remove(id,n=1){const a=this.ensure();if(!a||D.items[id]?.unique||(a.inventory[id]||0)<n)return false;a.inventory[id]-=n;if(!a.inventory[id])delete a.inventory[id];return true;},
equip(id){
if(V.Game.mode==='combat'){V.UI.toast('Troque o equipamento antes do confronto.');return false;}
const a=this.ensure(),item=D.items[id];if(!item?.slot||!a.inventory[id]&&!a.questItems[id])return false;
a.equipped[item.slot]=id;const stats=this.stats();a.health=Math.min(a.health??stats.health,stats.health);a.focus=Math.min(a.focus??stats.focus,stats.focus);V.Save.save();return true;
},
consume(id){
if(V.Game.mode==='combat'){V.UI.toast('Use os consumíveis no comando Itens: cada uso ocupa um turno.');return false;}
const a=this.ensure(),d=D.items[id],s=this.stats();if(d?.category!=='consumable'||!a.inventory[id])return false;
if(d.effect==='heal')a.health=Math.min(s.health,(a.health??s.health)+d.power);
if(d.effect==='focus')a.focus=Math.min(s.focus,(a.focus??s.focus)+d.power);
if(d.effect==='cleanse')a.health=Math.min(s.health,(a.health??s.health)+d.power);
if(d.effect==='resonance'){a.resonance=Math.min(100,a.resonance+d.power);a.overload=Math.max(0,a.overload-15);}
this.remove(id);V.Save.save();return true;
},
learn(id,passive=false){
const a=this.ensure(),d=(passive?D.passives:D.skills).find(s=>s.id===id),bag=passive?a.passives:a.skills;
if(!d||V.Game.mode==='combat'||a.skillPoints<1||a.level<d.level||d.requires&&!bag[d.requires]||(bag[id]||0)>=3)return false;
bag[id]=(bag[id]||0)+1;a.skillPoints--;V.Save.save();return true;
},
respec(){
const a=this.ensure();if(V.Game.mode==='combat')return false;
const spent=Object.values(a.skills).reduce((n,q)=>n+q,0)+Object.values(a.passives).reduce((n,q)=>n+q,0)-3;
a.skillPoints+=Math.max(0,spent);a.skills={critical:1,restore:1,shield:1};a.passives={};V.Save.save();return true;
},
icon(id,size=40){const name=D.items[id]?.icon||id;return `<img class="adv-icon" src="assets/adventure/icons/${esc(name)}.png" alt="" width="${size}" height="${size}">`;},
character(tab='stats'){
const a=this.ensure();if(!a)return;const stats=this.stats();
let body=`<nav class="tabs">${[['stats','Atributos'],['skills','Habilidades'],['party','Equipe']].map(([t,n])=>`<button data-character-tab="${t}" class="${t===tab?'active':''}">${n}</button>`).join('')}</nav>`;
if(tab==='stats')body+=`<div class="adv-profile"><div>${V.UI.portrait(V.state.character,0,96)}<strong>${esc(V.state.name)} · o Forasteiro</strong><span>Nível ${a.level} / 20</span></div><div><progress max="${a.level===20?1:this.threshold(a.level+1)-this.threshold(a.level)}" value="${a.level===20?1:a.xp-this.threshold(a.level)}"></progress><p>${a.xp} XP ${a.level<20?'· próximo nível em '+(this.threshold(a.level+1)-a.xp)+' XP':'· nível máximo'}</p><p>${a.attributePoints} ponto(s) de atributo · ${a.skillPoints} ponto(s) de habilidade</p></div></div><div class="adv-stat-grid">${Object.entries(stats).map(([k,n])=>`<article><small>${labels[k]}</small><b>${n}</b><span>Investidos: ${a.attributes[k]||0}</span><button class="secondary" data-stat="${k}" ${!a.attributePoints||V.Game.mode==='combat'?'disabled':''}>+ ${k==='health'?10:k==='focus'?6:k==='attack'||k==='knowledge'?3:2}</button></article>`).join('')}</div><div class="note">Dano = poder + 0,9 × atributo ofensivo − 0,55 × defesa − 0,12 × determinação; mínimo 2. Defesa reduz o próximo impacto em 55%. Cura = poder + 0,8 × conhecimento. Iniciativa: agilidade, sem sorteio. Conhecimento é um atributo de RPG; o seu registro educativo está no Arquivo.</div>`;
if(tab==='skills')body+=`<div class="row between"><p>${a.skillPoints} ponto(s) disponíveis · graus 1 a 3</p><button id="adv-respec" class="secondary" ${V.Game.mode==='combat'?'disabled':''}>Redistribuir pontos</button></div><div class="adv-skill-columns">${['Pesquisa','Memória','Vigília'].map(branch=>`<section><h3>${branch}</h3>${D.skills.filter(s=>s.branch===branch).map(s=>this.skillCard(s,a,false)).join('')}<h4>Passivas</h4>${D.passives.filter(s=>s.branch===branch).map(s=>this.skillCard(s,a,true)).join('')}</section>`).join('')}</div>`;
if(tab==='party')body+=`<p>Até três participantes: você e dois parceiros. Zambeto oferece apoios limitados; não ocupa uma vaga e não recebe dano.</p><div class="three-cols">${a.companions.map(id=>`<article class="card">${V.UI.portrait(id,0,80)}<h3>${esc(V.content.characters[id]?.name||id)}</h3><p>${esc(V.content.characters[id]?.role||'Parceiro de investigação')}</p><button data-party="${id}" class="secondary" ${V.Game.mode==='combat'?'disabled':''}>${a.party.includes(id)?'Retirar da equipe':'Incluir na equipe'}</button></article>`).join('')||'<div class="note">Os parceiros entram ao longo da investigação. Encontre o guardião na primeira noite.</div>'}</div>`;
V.UI.modal('Personagem e habilidades','FORASTEIRO · '+V.state.grade+'º ANO',body,'',true);V.UI.paintPortraits();
V.$$('[data-character-tab]').forEach(b=>b.onclick=()=>this.character(b.dataset.characterTab));
V.$$('[data-stat]').forEach(b=>b.onclick=()=>{if(a.attributePoints>0){a.attributes[b.dataset.stat]=(a.attributes[b.dataset.stat]||0)+1;a.attributePoints--;V.Save.save();this.character();}});
V.$$('[data-learn-skill]').forEach(b=>b.onclick=()=>{this.learn(b.dataset.learnSkill,b.dataset.passive==='true');this.character('skills');});
V.$('#adv-respec')?.addEventListener('click',()=>V.UI.confirm('Redistribuir habilidades?','Todos os pontos investidos retornam. As três habilidades iniciais permanecem disponíveis.',()=>{this.respec();this.character('skills');}));
V.$$('[data-party]').forEach(b=>b.onclick=()=>{const id=b.dataset.party;if(a.party.includes(id))a.party=a.party.filter(x=>x!==id);else if(a.party.length<2)a.party.push(id);else V.UI.toast('A equipe já tem três participantes. Retire alguém primeiro.');V.Save.save();this.character('party');});
},
skillCard(s,a,passive){
const bag=passive?a.passives:a.skills,rank=bag[s.id]||0,req=s.requires&&(passive?D.passives:D.skills).find(x=>x.id===s.requires),can=a.skillPoints>0&&a.level>=s.level&&(!s.requires||bag[s.requires])&&rank<3&&V.Game.mode!=='combat';
return `<article class="adv-skill ${rank?'learned':''}">${this.icon(s.id,32)}<div><strong>${s.name}</strong><small>${passive?'Passiva':s.cost+' foco · recarga '+s.cooldown+' · duração '+s.duration} · grau ${rank}/3</small><p>${esc(s.description)}</p><small>Nível ${s.level}${req?' · requer '+req.name:''}. ${rank<3?'Próximo grau: '+(passive?'bônus acumulativo.':'poder +20%, duração +1 no grau 3; custo +2.'):''}</small><button class="secondary" data-learn-skill="${s.id}" data-passive="${passive}" ${can?'':'disabled'}>${rank===3?'Máximo':rank?'Melhorar · 1 ponto':'Aprender · 1 ponto'}</button></div></article>`;
},
inventory(category='all'){
const a=this.ensure();if(!a)return;
const cats=[['all','Tudo'],['equipment','Equipamento'],['consumable','Consumíveis'],['quest','Missão'],['material','Materiais'],['records','Registros'],['storage','Depósito']];
const entries=category==='quest'?Object.entries(a.questItems):category==='storage'?Object.entries(a.storage):Object.entries(a.inventory).filter(([id])=>category==='all'||D.items[id]?.category===category);
let body=`<div class="adv-inventory-head"><span>${this.slots(a)} / 24 espaços comuns · objetos de missão sem limite</span><button id="adv-character" class="secondary">Atributos e habilidades</button></div><nav class="tabs">${cats.map(([id,n])=>`<button data-inv-tab="${id}" class="${id===category?'active':''}">${n}</button>`).join('')}</nav>`;
if(category!=='records')body+=`<div class="adv-equipment">${[['device','Historiógrafo'],['tool','Ferramenta'],['clothing','Vestuário'],['accessory','Acessório']].map(([id,n])=>`<div><small>${n}</small><b>${esc(D.items[a.equipped[id]]?.name||'Sem equipamento')}</b>${id!=='device'&&a.equipped[id]?`<button data-unequip="${id}" class="quiet" ${V.Game.mode==='combat'?'disabled':''}>Remover</button>`:''}</div>`).join('')}</div><div class="adv-item-grid">${entries.map(([id,q])=>{const d=D.items[id];if(!d)return'';return `<article class="adv-item">${this.icon(id,48)}<div><h3>${esc(d.name)} ${q>1?'×'+q:''}</h3><p>${esc(d.description)}</p><small>${Object.entries(d.stats||{}).map(([s,n])=>'+'+n+' '+labels[s]).join(' · ')}</small><div>${category==='storage'?'<button data-withdraw="'+id+'" class="secondary">Retirar 1</button>':d.slot&&d.category!=='quest'?'<button class="secondary" data-equip="'+id+'" '+(V.Game.mode==='combat'?'disabled':'')+'>'+ (Object.values(a.equipped).includes(id)?'Equipado':'Equipar')+'</button>':d.category==='consumable'?'<button class="secondary" data-consume="'+id+'" '+(V.Game.mode==='combat'?'disabled':'')+'>Usar</button>':id==='historiograph'?'<button class="secondary" id="adv-device-inv">Abrir dispositivo</button>':''}</div></div></article>`;}).join('')||'<p class="note">Nenhum item nesta categoria.</p>'}</div>`;
else body+=`<p>As leituras e fichas continuam acessíveis após o uso em uma missão.</p><button id="adv-records" class="primary">Abrir o Arquivo de descobertas</button><div class="stack">${V.state.tools.map((t,i)=>`<button data-old-tool="${i}" class="secondary">${esc(t)}</button>`).join('')}</div>`;
V.UI.modal('Mochila de exploração','OBJETOS · EQUIPAMENTO · REGISTROS',body,'',true);
V.$$('[data-inv-tab]').forEach(b=>b.onclick=()=>this.inventory(b.dataset.invTab));
V.$('#adv-character').onclick=()=>this.character();V.$('#adv-device-inv')?.addEventListener('click',()=>V.Story.device());V.$('#adv-records')?.addEventListener('click',()=>V.Game.gallery());
V.$$('[data-old-tool]').forEach(b=>b.onclick=()=>V.Game.useTool(+b.dataset.oldTool));
V.$$('[data-equip]').forEach(b=>b.onclick=()=>{this.equip(b.dataset.equip);this.inventory(category);});
V.$$('[data-unequip]').forEach(b=>b.onclick=()=>{if(V.Game.mode!=='combat'){delete a.equipped[b.dataset.unequip];const stats=this.stats();a.health=Math.min(a.health??stats.health,stats.health);a.focus=Math.min(a.focus??stats.focus,stats.focus);V.Save.save();this.inventory(category);}});
V.$$('[data-consume]').forEach(b=>b.onclick=()=>{this.consume(b.dataset.consume);this.inventory(category);});
V.$$('[data-withdraw]').forEach(b=>b.onclick=()=>{const id=b.dataset.withdraw,before=a.inventory[id]||0;this.add(id,1);if((a.inventory[id]||0)>before){a.storage[id]--;if(!a.storage[id])delete a.storage[id];}else a.storage[id]--;V.Save.save();this.inventory(category);});
},
rest(){if(V.Game.mode==='combat')return;const a=this.ensure(),s=this.stats();a.health=s.health;a.focus=s.focus;a.overload=Math.max(0,a.overload-30);V.Save.save();V.UI.toast('Uma pausa com a equipe: vida e foco recuperados, Sobrecarga reduzida.');},
hud(){const a=this.ensure();if(!a)return;const s=this.stats();let el=V.$('#adv-status');if(!el){el=document.createElement('button');el.id='adv-status';el.className='adv-status';el.onclick=()=>this.character();V.$('#stage').appendChild(el);}el.innerHTML=`<b>Nv. ${a.level}</b><span>${a.health??s.health}/${s.health} vida</span><span>${a.focus??s.focus}/${s.focus} foco</span>`;el.hidden=V.Game.mode!=='explore';},
observe(){
if(!V.state)return;const a=this.ensure();
for(const id of V.state.evidence||[])if(!a.ledger['clue-'+id])this.reward('clue-'+id,40+this.bonus('investigation'),{fragments:1});
for(const id of V.state.talked||[])if(!a.ledger['talk-'+id])this.reward('talk-'+id,25);
for(const id of V.state.minis||[])if(!a.ledger['mini-'+id])this.reward('mini-'+id,120,{tea:1});
for(const id of V.state.readings||[])if(!a.ledger['reading-'+id])this.reward('reading-'+id,30+this.bonus('investigation'));
for(const id of V.state.bonus||[])if(!a.ledger['bonus-'+id])this.reward('bonus-'+id,25);
for(const q of Object.values(V.state.sideQuests||{}))if(q.done&&q.id&&!a.ledger['side-'+q.id])this.reward('side-'+q.id,80);
}
};
Object.assign(V.defaultSettings,{minimumBrightness:.28,reducedFlash:true,weatherIntensity:.7,lightingQuality:'medium',battleSpeed:1,routePattern:false});
})();
