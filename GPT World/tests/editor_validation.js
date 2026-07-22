import { buildTowerDelta, buildWorldExport, stableStringify } from "../js/editor_export.js";
import { EditorHistory } from "../js/editor_history.js";
import { applyTowerFloorOverride } from "../js/map_overrides.js";
import { normalizePropPresentation, propBlocksPoint, propCollisionBounds, propShadowSpec, propVisualBounds } from "../js/prop_presentation.js";

const clone=value=>JSON.parse(JSON.stringify(value));

export function runEditorValidation(){
  const failures=[],checks={};
  const assert=(condition,message)=>{if(!condition)failures.push(message);return condition;};

  const prop=normalizePropPresentation({id:"tree",path:"tree.webp",x:320,y:448,height:168,recommendedWorldHeight:168,sourceBounds:[4,4,80,120],groundAnchor:[44,124],visualFootprint:[72,22],footprint:[42,24],collision:"footprint",collisionOffsetX:3,collisionOffsetY:-2,shadowWidth:68,shadowHeight:10,shadowOffsetY:1,shadowOpacity:.18});
  const visual=propVisualBounds(prop),collision=propCollisionBounds(prop),shadow=propShadowSpec(prop),contact=visual.y+(prop.groundAnchor[1]-prop.sourceBounds[1])*visual.scale;
  checks.presentation=assert(Math.abs(contact-prop.y)<.01,"ground anchor não coincide com a linha do chão")&&assert(propBlocksPoint(prop,collision.cx,collision.cy,1),"colisão sólida não bloqueia a base")&&assert(Math.abs(shadow.y-prop.y)<=2,"sombra não acompanha a base");

  let historyValue=0;const history=new EditorHistory(8);history.push({label:"paint",before:0,after:1,apply:value=>historyValue=value});historyValue=1;history.undo();const undo=historyValue===0;history.redo();checks.history=assert(undo&&historyValue===1,"undo/redo não reproduz o comando");

  const base={version:1,seed:"RUN|andar:7",floor:7,floorSeed:777,size:3,grid:[[1,1,0],[1,1,1],[0,1,1]],pathCells:[[0,0],[1,0]],bridgeCells:[],props:[{id:"p1",x:10,y:10}],entities:[{id:"entrada",type:"entrance",x:0,y:0},{id:"saida",type:"exit",x:2,y:2}],spawn:{x:0,y:0},objective:{id:"reach",progress:0}};
  const edited=clone(base);edited.grid[0][2]=1;edited.pathCells.push([2,0]);edited.bridgeCells.push([2,0]);edited.props[0].x=12;edited.props.push({id:"p2",x:20,y:20});edited.entities[1].x=1;edited.spawn={x:1,y:0};
  const delta=buildTowerDelta(base,edited),reproduced=applyTowerFloorOverride(clone(base),delta);
  checks.towerDelta=assert(stableStringify(reproduced.grid)===stableStringify(edited.grid),"delta não reproduz a grid")&&assert(stableStringify(reproduced.pathCells)===stableStringify(edited.pathCells),"delta não reproduz paths")&&assert(stableStringify(reproduced.bridgeCells)===stableStringify(edited.bridgeCells),"delta não reproduz bridges")&&assert(stableStringify(reproduced.props)===stableStringify(edited.props),"delta não reproduz props")&&assert(reproduced.spawn.x===1,"delta não reproduz spawn");

  const worldA=buildWorldExport({regionId:2,world:{w:2896,h:2172},layout:{spawn:{x:100,y:200},obstacles:[]},navigation:new Map([["2,3","blocked"],["1,1","walkable"]]),props:[{id:"b",x:2},{id:"a",x:1}],entities:[{id:"npc",x:4}]});
  const worldB=buildWorldExport({regionId:2,world:{w:2896,h:2172},layout:{spawn:{x:100,y:200},obstacles:[]},navigation:new Map([["1,1","walkable"],["2,3","blocked"]]),props:[{id:"a",x:1},{id:"b",x:2}],entities:[{id:"npc",x:4}]});
  checks.deterministicExport=assert(stableStringify(worldA)===stableStringify(worldB),"exportação muda com a ordem de inserção");

  checks.saveIsolationContract=assert(!Object.keys(worldA).some(key=>key.startsWith("__")),"export contém dados temporários");
  return{valid:!failures.length,checks,failures,details:{visual,collision,shadow,delta,world:worldA}};
}

if(typeof document!=="undefined"){
  const output=document.querySelector("#result");
  try{const result=runEditorValidation();output.textContent=JSON.stringify(result,null,2);if(!result.valid)output.classList.add("failure");}catch(error){output.classList.add("failure");output.textContent=String(error?.stack||error);}
}
