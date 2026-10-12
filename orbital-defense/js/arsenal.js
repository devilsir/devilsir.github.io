const Arsenal=(()=>{
 const catalog={
  flare:{name:'Erupção solar',icon:'☼',price:35,desc:'Dano solar em todos os inimigos.',tier:1},
  freeze:{name:'Congelamento orbital',icon:'❄',price:40,desc:'Interrompe o avanço inimigo por 6 segundos.',tier:1},
  shift:{name:'Manobra de órbita',icon:'⇄',price:30,desc:'Reposiciona uma construção durante a batalha.',tier:1},
  slingshot:{name:'Estilingue gravitacional',icon:'↗',price:45,desc:'Empurra um inimigo para longe do núcleo.',tier:2},
  eclipse:{name:'Eclipse tático',icon:'◐',price:55,desc:'Imobiliza os inimigos por 4 segundos.',tier:2},
  meteor:{name:'Chuva de meteoros',icon:'☄',price:70,desc:'Impactos cinéticos em múltiplos inimigos.',tier:2},
  repair:{name:'Restauro orbital',icon:'✚',price:60,desc:'Recupera 40% da vida das construções danificadas.',tier:1},
  surge:{name:'Reserva estelar',icon:'✦',price:55,desc:'Concede instantaneamente 185 de energia solar.',tier:1},
  storm:{name:'Tempestade elétrica',icon:'ϟ',price:85,desc:'Raio em cadeia especialmente forte contra escudos.',tier:2},
  guard:{name:'Escudo do núcleo',icon:'⬡',price:95,desc:'Repara até 2 pontos de vida do núcleo.',tier:3},
  supernova:{name:'Supernova',icon:'✹',price:140,desc:'Explosão perfurante contra todos os inimigos.',tier:3}
 };
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const initial=()=>({coins:0,inventory:{},ledger:[],claims:[]});
 function data(){const p=Progress.data;if(!p.arsenal||typeof p.arsenal!=='object')p.arsenal=initial();const a=p.arsenal;a.coins=Math.max(0,Math.min(999999,Math.floor(Number(a.coins)||0)));if(!a.inventory||typeof a.inventory!=='object')a.inventory={};for(const id of Object.keys(a.inventory)){if(!catalog[id])delete a.inventory[id];else a.inventory[id]=Math.max(0,Math.min(99,Math.floor(Number(a.inventory[id])||0)))}if(!Array.isArray(a.ledger))a.ledger=[];if(!Array.isArray(a.claims))a.claims=[];return a}
 function log(kind,detail={},delta=0){const a=data();a.ledger.push({date:new Date().toISOString(),kind,chapter:typeof waveIndex==='number'?waveIndex+1:0,delta,coins:a.coins,...detail});if(a.ledger.length>500)a.ledger.splice(0,a.ledger.length-500)}
 function stock(id){return Number(data().inventory[id])||0}
 function spend(id){if(!catalog[id]||!stock(id))return false;data().inventory[id]--;log('Usou poder',{item:id,quantity:-1});Progress.persist();return true}
 function add(id,source,claim=null){if(!catalog[id])return false;const a=data();if(claim&&a.claims.includes(claim))return false;if(claim){a.claims.push(claim);if(a.claims.length>2000)a.claims.splice(0,a.claims.length-2000)}a.inventory[id]=Math.min(99,stock(id)+1);log(source,{item:id,quantity:1});Progress.persist();return true}
 function purchase(id){const item=catalog[id],a=data();if(!item)return false;if(a.coins<item.price){showToast('Moedas insuficientes. Vença fases para juntar mais.');return false}if(stock(id)>=99){showToast('Estoque máximo deste poder.');return false}a.coins-=item.price;a.inventory[id]=stock(id)+1;log('Compra',{item:id,quantity:1},-item.price);Progress.persist();showToast(`Comprado: ${item.name} · −${item.price} moedas`);return true}
 function randomDrop(stage=0,isBoss=false){const ids=Object.keys(catalog).filter(id=>catalog[id].tier<=(isBoss?stage>=3?3:2:stage>=4?3:stage>=1?2:1));const weights=ids.map(id=>id==='supernova'?1:id==='guard'?2:id==='storm'?2:4);let n=Math.random()*weights.reduce((s,v)=>s+v,0);for(let i=0;i<ids.length;i++)if((n-=weights[i])<=0)return ids[i];return ids[0]}
 function bossDrop(enemy,runKey,stage,stats){if(!enemy||enemy.trainingJanus)return null;const claim=`boss:${runKey}:${enemy.id}`;if(data().claims.includes(claim))return null;const id=randomDrop(stage,true);if(!add(id,'Drop de boss',claim))return null;stats.drops=stats.drops||[];stats.drops.push({source:enemy.name||'Boss',item:id,name:catalog[id].name,chapter:stage+1});showToast(`CHEFE DERROTADO! +1 ${catalog[id].name} no estoque`);return id}
 function phaseRewards(stage,mode,perfect,healthRatio,first,runKey,stats){const id=randomDrop(stage,false);const claim=`phase:${runKey}`;let coins=Math.round((55+stage*14+Math.max(0,healthRatio)*22+Number(stats.correct||0)*7+(perfect?18:0))*(mode==='campaign'&&!first?.45:1));coins=Math.max(18,coins);const a=data();if(!a.claims.includes(claim)){
   a.claims.push(claim);a.coins=Math.min(999999,a.coins+coins);log('Vitória na fase',{stage:stage+1,mode,first:!!first},coins);stats.coinsEarned=coins;
   if(add(id,'Recompensa de fase',`gift:${runKey}`)){stats.drops=stats.drops||[];stats.drops.push({source:'Fase concluída',item:id,name:catalog[id].name,chapter:stage+1})}
   Progress.persist();return {coins,item:id}
  }return {coins:0,item:null}
 }
 function options(){return catalog}
 function restoreCosts(){return data().coins}
 let overlay=null,returnPaused=false;
 function open(){if(typeof Session!=='undefined'&&!Session.authenticated){showToast('Entre no seu perfil para acessar os poderes.');return}if(overlay){render();return}returnPaused=typeof paused!=='undefined'?paused:false;if(typeof running!=='undefined'&&running)paused=true;
  overlay=document.createElement('div');overlay.className='arsenal-overlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Loja e estoque de poderes');overlay.innerHTML='<section class="arsenal-window glass"><div class="arsenal-head"><div><span class="panel-kicker">CENTRAL DE PODERES</span><h2>Arsenal orbital</h2><p>Compre poderes com moedas das fases. Os poderes comprados ficam guardados até serem usados.</p></div><button type="button" id="arsenalClose" class="secondary-btn">✕ Fechar</button></div><div id="arsenalContents"></div></section>';document.body.appendChild(overlay);overlay.querySelector('#arsenalClose').onclick=close;overlay.addEventListener('click',e=>{if(e.target===overlay)close()});overlay.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close()}});render();overlay.querySelector('#arsenalClose')?.focus({preventScroll:true})}
 function render(){if(!overlay)return;const a=data();overlay.querySelector('#arsenalContents').innerHTML=`<div class="arsenal-summary"><div><small>MOEDAS DISPONÍVEIS</small><strong>◈ ${a.coins.toLocaleString('pt-BR')}</strong></div><div><small>PODERES NO ESTOQUE</small><strong>${Object.values(a.inventory).reduce((s,n)=>s+n,0)}</strong></div><div><small>COMO GANHAR</small><strong>Fases + Chefes</strong></div></div><div class="arsenal-grid">${Object.entries(catalog).map(([id,item])=>`<article class="arsenal-item"><span class="arsenal-item-icon">${item.icon}</span><div class="arsenal-item-text"><strong>${esc(item.name)}</strong><p>${esc(item.desc)}</p><small>Em estoque: <b>${stock(id)}</b></small></div><button data-buy="${id}" class="secondary-btn" ${a.coins<item.price||stock(id)>=99?'disabled':''}>◈ ${item.price} · Comprar</button></article>`).join('')}</div><p class="arsenal-footnote">Energia solar ✦ paga as construções. Moedas ◈ compram poderes e continuam no perfil ao trocar de capítulo. Cada poder comprado é consumido apenas quando utilizado.</p>`;
  overlay.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{if(purchase(b.dataset.buy)){render();if(typeof updateHud==='function')updateHud()}})}
 function close(){if(!overlay)return;overlay.remove();overlay=null;if(typeof running!=='undefined'&&running)paused=returnPaused;if(typeof updateHud==='function')updateHud()}
 function isOpen(){return !!overlay}
 return {catalog,options,data,stock,spend,purchase,add,bossDrop,phaseRewards,open,close,isOpen,restoreCosts};
})();
