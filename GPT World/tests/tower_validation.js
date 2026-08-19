import { generateTowerFloor, validateTowerFloor, validateTowerSeeds } from "../js/tower_generator.js";
import { TOWER_ASSETS, TOWER_MANIFEST_META } from "../js/tower_manifest.js";
import { propCollisionBounds, propShadowSpec, propVisualBounds, rectangleOverlap } from "../js/prop_presentation.js";
import { validateTowerManifestVisuals, visualTerrainSignature } from "../js/tower_visual.js";

const stable=value=>JSON.stringify(value);

function presentationChecks(){
  const errors=[],classes=new Set(),groups=new Map();
  for(const asset of TOWER_ASSETS){
    classes.add(asset.scaleClass);const required=["groundAnchor","recommendedWorldHeight","minimumWorldHeight","maximumWorldHeight","shadowWidth","shadowHeight","collisionFootprint","visualFootprint"];
    for(const key of required)if(asset[key]===undefined||asset[key]===null)errors.push(`${asset.id}: ${key} ausente`);
    if(!Array.isArray(asset.groundAnchor)||asset.groundAnchor.length!==2)errors.push(`${asset.id}: groundAnchor inválida`);
    if(!(asset.minimumWorldHeight<=asset.recommendedWorldHeight&&asset.recommendedWorldHeight<=asset.maximumWorldHeight))errors.push(`${asset.id}: faixa de escala inválida`);
    const key=`${asset.theme}:${asset.variantGroup}:${asset.scaleClass}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(asset.recommendedWorldHeight);
  }
  for(const [key,values]of groups){const min=Math.min(...values),max=Math.max(...values);if(max/min>1.18)errors.push(`${key}: variantes incoerentes (${min}–${max})`);}
  return{valid:!errors.length,errors:errors.slice(0,100),classes:[...classes].sort(),assets:TOWER_ASSETS.length};
}

function floorPresentationChecks(floor){
  const errors=[];
  for(const prop of floor.props){
    const visual=propVisualBounds(prop),collision=propCollisionBounds(prop),shadow=propShadowSpec(prop),anchorY=visual.y+(prop.groundAnchor[1]-prop.sourceBounds[1])*visual.scale;
    if(Math.abs(anchorY-(prop.y+prop.anchorOffsetY))>.51)errors.push(`${prop.id}: contato com o chão divergente`);
    if(shadow.opacity&&Math.abs(shadow.y-prop.y)>Math.max(12,prop.height*.12))errors.push(`${prop.id}: sombra longe da base`);
    if(![visual.x,visual.y,visual.w,visual.h,collision.x,collision.y,collision.w,collision.h].every(Number.isFinite))errors.push(`${prop.id}: bounds não finitos`);
  }
  const solids=floor.props.filter(prop=>!["none","traversable"].includes(prop.collision)).map(prop=>({prop,box:propCollisionBounds(prop)}));
  for(let index=0;index<solids.length;index++)for(let other=index+1;other<solids.length;other++)if(rectangleOverlap(solids[index].box,solids[other].box,2))errors.push(`${solids[index].prop.id}/${solids[other].prop.id}: colisões sobrepostas`);
  return{valid:!errors.length,errors};
}

export function runTowerValidation(count=1000){
  const started=performance.now(),manifest=validateTowerManifestVisuals(),presentation=presentationChecks(),result=validateTowerSeeds(count,{maxFloor:250}),targeted=[];
  const overrides=[null,{familyId:"medula-congelada",grammarId:"arteria",mutationId:"ossificado"},{familyId:"cerebro-arcano",hybridId:"coracao-necrosado",grammarId:"plataformas-arcanas",mutationId:"nervoso"},{floorSeed:305419896,familyId:"pulmao-fungico"}];
  for(const floor of[1,5,10,12,20,25,30,50,99,120,200,250])for(const route of["lucas","timbo"])for(const override of overrides){const options={runSeed:`VISUAL-${floor}-${route}`,floor,difficulty:1.35,route,overrides:override},first=generateTowerFloor(options),second=generateTowerFloor(options),validation=validateTowerFloor(first),signature=visualTerrainSignature(first.visualPlan),repeatSignature=visualTerrainSignature(second.visualPlan),props=floorPresentationChecks(first),exactSeed=override?.floorSeed===undefined||first.floorSeed===(override.floorSeed>>>0);targeted.push({floor,route,override,family:first.family.id,hybrid:first.hybrid?.id||null,grammar:first.grammar.id,valid:validation.valid&&props.valid&&exactSeed,deterministic:signature===repeatSignature&&stable(first.props)===stable(second.props),signature,statistics:first.visualPlan.statistics,counts:validation.counts,errors:[...validation.errors,...props.errors,...(exactSeed?[]:["floor seed exato ignorado"])]});}
  const checks={manifest:manifest.valid,manifestV3:TOWER_MANIFEST_META.version>=3&&TOWER_MANIFEST_META.presentationVersion>=1,presentation:presentation.valid,bulk:result.valid,targeted:targeted.every(entry=>entry.valid&&entry.deterministic),allFamilies:result.families.length===10,hybrids:result.visualStats.hybridFloors>0,milestones:result.visualStats.milestoneFloors>0};
  return{valid:Object.values(checks).every(Boolean),checks,manifest,presentation,result,targeted,durationMs:Math.round(performance.now()-started)};
}

if(typeof document!=="undefined"){
  const output=document.querySelector("#result");
  try{const result=runTowerValidation(1000);output.textContent=JSON.stringify(result,null,2);if(!result.valid)output.classList.add("failure");}catch(error){output.classList.add("failure");output.textContent=String(error?.stack||error);}
}
