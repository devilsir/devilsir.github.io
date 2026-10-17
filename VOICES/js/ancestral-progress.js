(function ancestralProgress(){
'use strict';const V=window.V,M=V.AchievementProgress,D=V.AncestralData;
for(const g of D.activities)M.rules.set('roots-activity-'+g.id,{get:()=>Number(V.AncestralActivities.done(g.id)),target:1,unit:'atividade'});
for(const[target,id]of [[3,'roots-companions-3'],[10,'roots-companions-10'],[17,'roots-companions-all']])M.rules.set(id,{get:()=>V.Companions.ensure().unlocked.length,target,unit:'vínculos'});
for(const id of ['interior-umbanda','interior-candomble','interior-botica'])M.rules.set('roots-visit-'+id,{get:()=>Number(V.Life.ensure().visits.includes(id)),target:1,unit:'lugar'});
for(const[kind,id]of [['potion','roots-first-potion'],['food','roots-first-food']])M.rules.set(id,{get:()=>Number(D.recipes.some(r=>r.kind===kind&&V.Ancestral.ensure().crafted[r.id])),target:1,unit:'preparo'});
M.rules.set('roots-all-recipes',{get:()=>D.recipes.filter(r=>V.Ancestral.ensure().crafted[r.id]).length,target:6,unit:'receitas'});
})();
