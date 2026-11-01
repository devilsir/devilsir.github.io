(function(){
'use strict';
const V=window.V,L=V.AssetLoader,M=V.MapAssets;
const group=L.group.bind(L);
L.group=function(key){
 const actor=key.match(/^assets\/(?:city|homestead)\/(nia|leo|taina|sol|librarian|zambeto)-(?:motion|actions|daily|music|percussion)\.(?:png|webp)$/);
 if(actor)return'actor:'+actor[1];
 if(/^assets\/city\/battle-/.test(key)||/\/battle-archive\./.test(key)||/\/rasura-enemies\./.test(key)||/\/combat-fx\./.test(key))return'combat';
 if(key==='assets/adventure/atlas-paper.png'||key==='assets/adventure/atlas-paper.webp')return'atlas-paper';
 if(/^assets\/community\//.test(key))return'community';
 if(/^assets\/homestead\/home-collection\./.test(key))return'home-collection';
 return group(key);
};
const groups=M.groups.bind(M);M.groups=function(m){
 const out=groups(m),actors=new Set((m?.objects||[]).map(o=>o.character).filter(Boolean));if(V.state?.character)actors.add(V.state.character);
 for(const actor of actors)if(['nia','leo','taina','sol','librarian','zambeto'].includes(actor))out.push('actor:'+actor);
 const families=[...(m?.decor||[]).map(o=>o.family),...(m?.objects||[]).map(o=>o.scene?.family)].filter(Boolean),id=m?.id||'';
 if(families.some(f=>/community|collection|botica|umbanda|candomble|apartment/.test(f))||/interior-(umbanda|candomble|botica)|ancestral/.test(id))out.push('community');
 if(families.some(f=>f==='home-collection')||m?.design?.construction?.rooms?.length||id.startsWith('interior-'))out.push('home-collection');
 return [...new Set(out)];
};
const attach=V.Playground.attach.bind(V.Playground);V.Playground.attach=function(r){const out=attach(r);M.ensure(['actor:'+V.state.character],this.game(r.game)?.title||'Preparando o desafio');return out;};
// Open heavy battle art and parchment only when their interfaces are requested.
for(const owner of [V.Combat,V.AdventureCombat])if(owner?.start){const start=owner.start.bind(owner);owner.start=function(...args){const result=start(...args);M.ensure(['combat','actor:'+V.state.character],'Preparando o confronto');return result;};}
const atlas=V.WorldAtlas?.open?.bind(V.WorldAtlas);if(atlas)V.WorldAtlas.open=function(...args){return M.ensure(['atlas-paper'],'Preparando o atlas',()=>atlas(...args));};
// Browser-created thumbnails are also lazy; images in the active dialogue stay eager.
const lazy=root=>{for(const img of root.querySelectorAll?.('img')||[]){if(img.closest('.dialogue-box,.player-chip,.duo-sidebar'))continue;img.loading='lazy';img.decoding='async';const original=img.getAttribute('src');if(original&&!img.dataset.deliveryResolved){img.dataset.deliveryResolved='true';const optimized=V.ImageFormats.resolve(original);if(optimized!==img.src){img.addEventListener('error',()=>{img.src=original;},{once:true});img.src=optimized;}}}};
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)lazy(node);}).observe(V.$('#modal-root'),{childList:true,subtree:true});
})();
