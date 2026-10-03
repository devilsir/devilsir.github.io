#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const bundle=await readFile(path.join(root,"js/game.bundle.js"),"utf8");
function runtime(search="?dev=1"){
  const storage=new Map(),nodes=new Map(),noop=()=>{};
  const gradient={addColorStop:noop},ctx=new Proxy({imageSmoothingEnabled:false,createRadialGradient:()=>gradient,createLinearGradient:()=>gradient,createPattern:()=>({}),measureText:t=>({width:String(t).length*7}),getImageData:(x,y,w=1,h=1)=>({data:new Uint8ClampedArray(Math.max(1,w*h*4))})},{get:(t,k)=>k in t?t[k]:noop,set:(t,k,v)=>(t[k]=v,true)});
  const node=id=>{if(nodes.has(id))return nodes.get(id);const v={id,hidden:false,disabled:false,value:"1",checked:false,dataset:{},style:{setProperty:noop,removeProperty:noop},classList:{add:noop,remove:noop,toggle:()=>false,contains:()=>false},children:[],width:960,height:540,naturalWidth:64,naturalHeight:64,complete:true,paused:true,innerHTML:"",textContent:"",src:"",appendChild(c){c.parentElement=this;this.children.push(c);return c;},insertAdjacentHTML:noop,remove:noop,focus:noop,click:noop,select:noop,setAttribute:noop,removeAttribute:noop,addEventListener:noop,setPointerCapture:noop,releasePointerCapture:noop,hasPointerCapture:()=>false,getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}),getContext:()=>ctx,querySelector:s=>node(`${id} ${s}`),querySelectorAll:()=>[],play(){return Promise.resolve();},pause:noop};v.parentElement=v;nodes.set(id,v);return v;};
  const document={head:node("head"),body:node("body"),documentElement:node("html"),hidden:false,createElement:t=>node(`created-${t}-${nodes.size}`),createTextNode:t=>({textContent:t}),querySelector:s=>node(s),querySelectorAll:s=>s===".screen"?[node("title-screen"),node("exploration-screen"),node("battle-screen")]:[],getElementById:id=>node(id),addEventListener:noop,execCommand:()=>true};
  class ImageStub{constructor(){this.complete=false;this.naturalWidth=64;this.naturalHeight=96;}set src(v){this._src=v;queueMicrotask(()=>{this.complete=true;this.onload?.();});}get src(){return this._src;}}
  const location={search,protocol:"file:",hostname:"",href:`file:///jogo/index.html${search}`},performance={now:()=>Date.now()},navigator={getGamepads:()=>[],clipboard:{writeText:async()=>{}}},window={document,location,performance,navigator,addEventListener:noop,removeEventListener:noop,innerWidth:1280,innerHeight:720};
  const fakeMath=Object.create(Math);fakeMath.random=()=>0.1;
  const context={console,document,window,location,performance,navigator,Image:ImageStub,ResizeObserver:class{observe(){}disconnect(){}},MutationObserver:class{observe(){}disconnect(){}},requestAnimationFrame:()=>1,cancelAnimationFrame:noop,setTimeout:(cb)=>{queueMicrotask(cb);return 1;},clearTimeout:noop,setInterval:()=>1,clearInterval:noop,queueMicrotask,structuredClone,URLSearchParams,URL:{createObjectURL:()=>"blob:test",revokeObjectURL:noop},Blob,crypto:{getRandomValues:a=>(a.fill(7),a)},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)},getComputedStyle:()=>({position:"relative"}),Math:fakeMath,globalThis:null};
  context.globalThis=context;window.window=window;window.globalThis=context;window.getComputedStyle=context.getComputedStyle;return context;
}

const context=runtime();
vm.runInNewContext(bundle,context,{filename:"game.bundle.js",timeout:10000});
for(let i=0;i<16;i++)await Promise.resolve();
const dev=context.__VOZ_DEV__, combat=dev?.context?.combat, regions=dev?.context?.regions, skills=dev?.context?.skills;
const failures=[],checks={};
const assert=(name,value,detail="")=>{checks[name]=Boolean(value);if(!value)failures.push({name,detail});};
assert("combat exposed",combat&&regions?.length===10,"developer combat context unavailable");
if(combat&&regions?.length===10){
  const state=dev.context.getState();
  state.route="lucas";state.activeForm="base";state.regionIndex=0;state.hp=Math.max(1,state.hp||126);state.focus=Math.max(1,state.focus||88);state.learnedSkills=state.learnedSkills||["ice","life","order"];state.activeParty=["hero"];
  combat.audio={ui:noop,hit:noop,spell:noop,heal:noop,transform:noop,confirm:noop,stopAmbient:noop};
  combat.delay=async()=>{};combat.animateActor=()=>{};combat.damageNumber=()=>{};combat.effect=()=>{};combat.render=()=>{};combat.checkBossPhases=async()=>{};combat.nextTurn=()=>{};combat.endAction=function(){this.actionInProgress=false;this.battle.current=null;};
  let allEncounterBuilds=true,enemyTurns=true;
  for(let r=0;r<10;r++)for(const type of ["normal","miniboss","boss1","boss2"]){
    state.regionIndex=r;combat.region=regions[r];combat.encounterType=type;combat.battleMode="world";combat.battle={round:1,queue:[],current:null,log:[],ended:false,commandLocked:false,reverseHealing:false,lastSkill:null,finalEnding:null};combat.actionInProgress=false;
    try{combat.buildParty();combat.buildEnemies();if(!combat.enemies?.length||combat.enemies.some(e=>!(e.hp>0&&e.attack>0&&e.img)))allEncounterBuilds=false;
      const enemy=combat.enemies[0];combat.battle.current=enemy;combat.actionInProgress=true;await combat.enemyTurn(enemy);if(combat.actionInProgress)enemyTurns=false;
    }catch(error){allEncounterBuilds=false;enemyTurns=false;failures.push({name:`${r}:${type}`,detail:String(error?.stack||error)});}
  }
  assert("40 world encounter builds",allEncounterBuilds,"one or more region/type combinations failed");
  assert("enemy turns unlock",enemyTurns,"enemyTurn left actionInProgress locked");

  state.regionIndex=0;combat.region=regions[0];combat.encounterType="normal";combat.battleMode="world";combat.battle={round:1,queue:[],current:null,log:[],ended:false,commandLocked:false,reverseHealing:false,lastSkill:null,finalEnding:null};combat.buildParty();combat.buildEnemies();
  const hero=combat.party[0],enemy=combat.enemies[0];hero.focus=0;combat.battle.current=hero;combat.actionInProgress=false;
  const costly=Object.values(skills||{}).find(s=>Number(s.cost)>0&&["enemy","allEnemies"].includes(s.target));
  if(costly)await combat.resolveSkill(hero,costly,[enemy]);
  assert("insufficient focus never locks turn",combat.actionInProgress===false,"resolveSkill locked action on insufficient focus");

  let menuRestored=false;combat.enemies=[];combat.battle.current=hero;combat.actionInProgress=false;combat.checkOutcome=()=>false;combat.renderActionMenu=()=>{menuRestored=true;};combat.chooseTargets("enemy",()=>{});
  assert("empty target list recovers",menuRestored&&combat.actionInProgress===false,"chooseTargets did not recover from empty enemy list");

  let selectorSafe=true;try{combat.actorNode({id:'mob"odd\\id'});}catch(error){selectorSafe=false;failures.push({name:"selector fallback",detail:String(error)});}assert("actor selector fallback",selectorSafe,"actorNode depends on CSS.escape");
}
const valid=failures.length===0&&Object.values(checks).every(Boolean);console.log(JSON.stringify({valid,checks,failures},null,2));if(!valid)process.exitCode=1;
function noop(){}
