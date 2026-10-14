(()=>{
'use strict';
const R=window.CHEMSCAPE_RPG,defaults={health:'item-pocao-de-restauracao',mana:'item-pocao-de-energia'};
function kind(item){if(!item||item.category!=='consumable'||!/poção|potion/i.test(item.name))return '';return item.use.hp>0&&item.use.mp===0?'health':item.use.mp>0&&item.use.hp===0?'mana':'';}
function info(type){const s=R.state();if(!s)return null;const r=s.save.rpg,id=r.potionSlots?.[type]||defaults[type],item=R.data.items[id];if(!item)return null;const stacks=s.save.items.filter(v=>v?.itemId===id),count=stacks.reduce((n,v)=>n+v.count,0),until=Math.max(r.potionCooldowns?.[type]||0,r.itemCooldowns[id]||0);return {id,item,count,remaining:Math.max(0,until-r.time),amount:type==='health'?item.use.hp:item.use.mp,key:type==='health'?'Q':'E'};}
function use(type){const E=window.CHEMSCAPE_ENGINE,s=R.state();if(!s?.player||s.player.dead||s.screen!=='playing'||E.editMode())return false;const q=info(type);if(!q?.count){window.CHEMSCAPE_UI?.report(type==='health'?'Sem poção de vida.':'Sem poção de mana.');return false;}const index=s.save.items.findIndex(v=>v?.itemId===q.id),error=R.use(index);if(error)window.CHEMSCAPE_UI?.report(error);else{E.rpg.save();update();}return !error;}
function assign(type,id){const s=R.state(),item=R.data.items[id];if(kind(item)!==type)return 'Escolha uma poção compatível.';s.save.rpg.potionSlots={...s.save.rpg.potionSlots,[type]:id};R.changed('inventory');update();return '';}
function update(){const s=R.state();if(!s?.player)return;let tray=document.getElementById('potion-tray');if(!tray){tray=document.createElement('div');tray.id='potion-tray';tray.setAttribute('aria-label','Poções rápidas');document.getElementById('game-shell').append(tray);for(const type of ['health','mana']){const b=document.createElement('button');b.dataset.potion=type;b.onclick=()=>use(type);tray.append(b);}}
 tray.classList.toggle('hidden',s.screen!=='playing'&&s.screen!=='paused'||window.CHEMSCAPE_ENGINE.editMode());
 for(const b of tray.children){const q=info(b.dataset.potion);if(!q)continue;const signature=[q.id,q.count,Math.ceil(q.remaining),s.screen].join('|');if(b.dataset.signature===signature)continue;b.dataset.signature=signature;b.innerHTML='<img src="'+window.CHEMSCAPE_ENGINE.assetPath(q.item.icon)+'" alt=""><kbd>'+q.key+'</kbd><span>×'+q.count+'</span>'+(q.remaining?'<b>'+Math.ceil(q.remaining)+'</b>':'');b.classList.toggle('empty',!q.count);b.title=q.item.name+' · +'+q.amount+' · '+q.key;b.setAttribute('aria-label',b.title+' · '+q.count+' unidades');}
}
window.CHEMSCAPE_POTIONS={kind,info,use,assign,update,defaults};
window.addEventListener('DOMContentLoaded',()=>{update();setInterval(update,180);});
})();
