(function(){
'use strict';
const V=window.V,K=V.JourneyCare;
const icon=(id)=>'<img src="assets/ui/'+(id==='meat'?'renewed/':'interface/')+'care-'+id+'.svg" width="25" height="25" alt="" aria-hidden="true">';
const values=(coins,food,water,energy)=>[['coin','Tostões de ouro',coins],['meat','Alimentação',food+'%'],['water','Água',water+'%'],['sleep','Descanso',energy+'%']];
function paint(root,list){if(!root)return;root.classList.add('care-icons');const signature=list.map(v=>v[2]).join(':');if(root.dataset.careValues===signature&&root.querySelector('.care-stat'))return;root.dataset.careValues=signature;root.innerHTML=list.map(([id,name,value])=>'<span class="care-stat" title="'+name+'"><span class="care-icon">'+icon(id)+'</span><b>'+value+'</b><span class="sr-only"> '+name+'</span></span>').join('');root.setAttribute('aria-label',list.map(v=>v[1]+': '+v[2]).join(' · '));}
const hud=K.hud.bind(K);K.hud=function(){hud();if(!V.state)return;const life=V.state.adventure?.life;if(!life)return;if(K.duo()){V.DuoWorld.root?.querySelectorAll('.care-player-hud').forEach((root,i)=>{const own=life.carePlayers?.[i]||life;paint(root,values(life.coins,Math.ceil(own.food??100),Math.ceil(own.water??100),Math.ceil(own.energy??100)));});}else paint(V.$('#life-hud'),values(life.coins,Math.ceil(life.food),Math.ceil(life.water),Math.ceil(life.energy)));};
const shop=V.Markets.shop.bind(V.Markets);V.Markets.shop=function(...args){const out=shop(...args),wallet=V.$('[data-market-wallet]');if(wallet){wallet.classList.add('cooking-wallet');wallet.insertAdjacentHTML('afterbegin',icon('coin'));}return out;};
})();
