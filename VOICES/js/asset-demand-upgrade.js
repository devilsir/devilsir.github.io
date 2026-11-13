/* Registered module: asset-demand-upgrade */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("asset-demand-upgrade", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function(){
'use strict';
const V=window.V,L=V.AssetLoader,M=V.MapAssets;
const actorsWithArt=new Set([...V.PlayableCharacters,'librarian','zambeto']);
const campusGroups=new Map([
 ...V.campusContent.assets.map(a=>[a.path,'campus-prop:'+a.index]),
 ...V.campusContent.fountains.map(a=>[a.path,'campus-fountain:'+a.index]),
 ...V.campusContent.portraits.map(a=>[a.path,'campus-portrait:'+a.index])
]);
const characterGroup=id=>'character:'+id;
const characterArt=key=>key.match(/^assets\/characters\/([a-z0-9-]+?)\.(?:png|webp)$/)?.[1];
const sharedCharacters=new Set(['animals','coast-animals','neighbors-animals','town-animal-motion','character-previews','pix','pix-portrait']);
const combatGroup=key=>/^assets\/characters\/boss-/.test(key)||/^assets\/adventure\/turn-interface\/(?:arena|team-effects)\./.test(key);
const group=L.group.bind(L);
L.group=function(key){
 const campus=campusGroups.get(key);
 if(campus)return campus;
 if(/^assets\/(?:tilesets\/(?!voices-cultural-items\/)|expansion\/town-animals\.)/.test(key)){
  const existing=group(key);
  if(existing)return existing;
  return'world-art';
 }
 if(/^assets\/adventure\/historiograph-mask-(?:p2-)?atlas\./.test(key))return key.includes('-p2-')?'mask-motion:1':'mask-motion:0';
 if(key==='assets/adventure/fragment/trail-companion-motion.webp')return'trail-companion';
 if(/^assets\/adventure\/mask-styles\/(?:gallery\.|portraits\/)/.test(key))return'mask-previews';
 if(/^assets\/city\/home-appliances\./.test(key))return'home-appliances';
 if(key.endsWith('/museum-facade.png')||key.endsWith('/salon-facade.png'))return'world-art';
 const character=characterArt(key);
 if(combatGroup(key))return'combat';
 if(character&&!sharedCharacters.has(character))return characterGroup(character);
 if(key.startsWith('assets/culture/'))return'culture-design';
 if(/^assets\/adventure\/fragment\/(?:clearing|trail-arena|ally-battle|spells)\./.test(key))return'fragment-combat';
 if(key==='assets/adventure/fragment/allies.webp')return'fragment-allies';
 if(/^assets\/adventure\/fragment\/(?:woods|ground|creatures|trail-props|trail-mobs)\./.test(key))return'fragment-world';
 const actor=key.match(/^assets\/(?:city|homestead)\/([a-z]+)-(?:motion|actions|daily|music|percussion)\.(?:png|webp)$/);
 if(actor&&actorsWithArt.has(actor[1]))return'actor:'+actor[1];
 if(/^assets\/city\/battle-/.test(key)||/\/battle-archive\./.test(key)||/\/rasura-enemies\./.test(key)||/\/combat-fx\./.test(key))return'combat';
 if(key==='assets/adventure/atlas-paper.png'||key==='assets/adventure/atlas-paper.webp')return'atlas-paper';
 if(/^assets\/community\//.test(key))return'community';
 if(/^assets\/homestead\/home-collection\./.test(key))return'home-collection';
 return group(key);
};
const groups=M.groups.bind(M);M.groups=function(m){
 const out=groups(m),objects=m?.objects||[],actors=new Set();
 if(m)out.push('world-art');
 for(const o of objects)for(const id of [o.character,o.profile?.character,o.recruit,o.figure?.character])if(id)actors.add(id);
 const player=V.state?.character;
 if(player)actors.add(player);
 for(const id of actors){
  const image=V.Assets.images[id],record=L.byImage.get(image);
  if(record?.group?.startsWith('character:'))out.push(record.group);
 }
 if(player)out.push(characterGroup(player+'-portrait'));
 if(objects.some(o=>o.type==='zambeto'&&V.Story?.visible(o)))out.push('actor:zambeto');
 if(V.FragmentForest?.spirit())out.push('trail-companion');
 if(V.state&&V.Progress.ensure()?.questItems?.historiograph){
  const variant=V.AncestralMask?.variant()||0,mask=V.AncestralMask;
  out.push('mask-motion:'+variant);
  const appearance=mask?.appearance(variant);
  if(appearance&&appearance.model!=='default')
   out.push('mask-style:'+appearance.model+(appearance.palette==='original'?'':'-'+appearance.palette));
 }
 if(m?.id==='fragment-forest'||m?.infinity)out.push('fragment-world');
 if(objects.some(o=>o.type==='team-contact'&&V.Team?.kits[o.recruit]?.fragmentArt!=null))out.push('fragment-allies');
 for(const item of [...(m?.decor||[]),...objects.flatMap(o=>o.scene?[o.scene]:[])]){
  const index=item.index??item.prop;
  if(item.family==='campus')out.push('campus-prop:'+index);
  if(item.family==='home')out.push('home-appliances');
  if(item.family==='fountain'&&index>=12)out.push('campus-fountain:'+index);
  if(item.family==='portrait-display'||item.family==='cultural-pack'&&index>=136)out.push('campus-portrait:'+index,'campus-prop:31');
  if(item.family==='history'){
   const history=V.heritageContent?.figures?.[index]?.character;
   if(history)out.push(characterGroup(history));
  }
 }
 for(const item of m?.design?.adventure?.architecture?.mounts||[])
  if(item.portrait!=null)out.push('campus-portrait:'+item.portrait);
 const families=[...(m?.decor||[]).map(o=>o.family),...(m?.objects||[]).map(o=>o.scene?.family)].filter(Boolean),id=m?.id||'';
 if(families.some(f=>/community|collection|botica|umbanda|candomble|apartment/.test(f))||/interior-(umbanda|candomble|botica)|ancestral/.test(id))out.push('community');
 if(families.some(f=>f==='home-collection')||m?.design?.construction?.rooms?.length||id.startsWith('interior-'))out.push('home-collection');
 return [...new Set(out)];
};
const attach=V.Playground.attach.bind(V.Playground);V.Playground.attach=function(r){const out=attach(r);M.ensure(['actor:'+V.state.character],this.game(r.game)?.title||'Preparando o desafio');return out;};
// All encounter entry points share activation, including practice and saved battles.
const activate=V.Combat.activate.bind(V.Combat);V.Combat.activate=function(){
 const result=activate();
 const actors=this.active.allies.flatMap(({character})=>['actor:'+character,characterGroup(character),characterGroup(character+'-portrait')]);
 const extra=this.active.expedition?['fragment-world','fragment-combat','fragment-allies']:[];
 if(V.FragmentForest?.spirit())extra.push('fragment-world','trail-companion','fragment-combat');
 M.ensure(['combat',...new Set([...actors,...extra])],'Preparando o confronto');
 return result;
};
if(V.AdventureCombat?.start&&V.AdventureCombat!==V.Combat){
 const start=V.AdventureCombat.start.bind(V.AdventureCombat);V.AdventureCombat.start=function(...args){
  const result=start(...args);
  M.ensure(['combat','actor:'+V.state.character],'Preparando o confronto');
  return result;
 };
}
const atlas=V.WorldAtlas?.open?.bind(V.WorldAtlas);
if(atlas)V.WorldAtlas.open=function(view='world',selected=V.World.current?.id){
 const map=view==='local'&&V.World.maps[selected];
 const required=map?['atlas-paper',...M.groups(map)]:['atlas-paper'];
 return M.ensure(required,'Preparando o atlas',()=>atlas(view,selected));
};
// Browser-created thumbnails are also lazy; images in the active dialogue stay eager.
const lazy=root=>{for(const img of root.querySelectorAll?.('img')||[]){if(img.closest('.dialogue-box,.player-chip,.duo-sidebar'))continue;img.loading='lazy';img.decoding='async';const original=img.getAttribute('src');if(original&&!img.dataset.deliveryResolved){img.dataset.deliveryResolved='true';const optimized=V.ImageFormats.resolve(original);if(optimized!==img.src){img.addEventListener('error',()=>{img.src=original;},{once:true});img.src=optimized;}}}};
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)lazy(node);}).observe(V.$('#modal-root'),{childList:true,subtree:true});
})();

});
