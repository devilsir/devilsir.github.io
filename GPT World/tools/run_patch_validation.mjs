#!/usr/bin/env node
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const runtime=path.join(root,".validation-runtime");
const bundlePath=path.join(root,"js/game.bundle.js");
const count=Math.max(1,Number(process.argv[2])||1000);

function section(bundle,start,end){const from=bundle.indexOf(`  // js/${start}`),to=bundle.indexOf(`  // js/${end}`,from);if(from<0||to<0)throw new Error(`Módulo não encontrado no bundle: ${start}`);return bundle.slice(from+`  // js/${start}`.length,to).replace(/^  /gm,"").trim();}

async function prepareRuntime(){
  await rm(runtime,{recursive:true,force:true});await mkdir(path.join(runtime,"js"),{recursive:true});await mkdir(path.join(runtime,"tests"),{recursive:true});
  const bundle=await readFile(bundlePath,"utf8"),data=section(bundle,"data.js","tower_data.js"),towerData=section(bundle,"tower_data.js","state.js"),exploration=section(bundle,"exploration.js","combat.js");
  await writeFile(path.join(runtime,"js/data.js"),`${data}\nexport {FORMS, ROUTES, REGIONS, asset, characterArt, formSprite};\n`);
  await writeFile(path.join(runtime,"js/tower_data.js"),`import {REGIONS} from "./data.js";\n${towerData}\nexport {TOWER_CONFIG,TOWER_FAMILIES,TOWER_GRAMMARS,TOWER_MUTATIONS,TOWER_OBJECTIVES,TOWER_WHISPERS,towerBossName,towerEnemyPool};\n`);
  await writeFile(path.join(runtime,"js/exploration_runtime.js"),`${exploration}\nexport {AssetCache};\n`);
  for(const name of["tower_generator.js","tower_manifest.js","tower_visual.js","prop_presentation.js","map_overrides.js","editor_export.js","editor_history.js"])await cp(path.join(root,"js",name),path.join(runtime,"js",name));
  for(const name of["tower_validation.js","editor_validation.js"])await cp(path.join(root,"tests",name),path.join(runtime,"tests",name));
  return bundle;
}

async function run(){
  const bundle=await prepareRuntime(),url=name=>pathToFileURL(path.join(runtime,name)).href+`?v=${Date.now()}`;
  const [{runTowerValidation},{runEditorValidation},dataModule,explorationModule]=await Promise.all([import(url("tests/tower_validation.js")),import(url("tests/editor_validation.js")),import(url("js/data.js")),import(url("js/exploration_runtime.js"))]);
  const tower=runTowerValidation(count),editor=runEditorValidation(),matrix=[];
  const {FORMS,characterArt,formSprite}=dataModule,{AssetCache}=explorationModule;
  for(const route of["lucas","timbo"])for(const variant of["masculino","feminino"])for(const form of FORMS)for(const direction of["front","back","left","right"]){
    const exact=formSprite(route,form.id,direction,variant),fallback=characterArt(route,variant),cache=new AssetCache(),fallbackImage={complete:true,naturalWidth:128,naturalHeight:192};cache.images.set(fallback,{image:fallbackImage,valid:true,lastUsed:0,promise:Promise.resolve(fallbackImage)});cache.missing.add(exact);const duringSwap=cache.resolveFirst(exact,[fallback]),fallbackPath=cache.aliases.get(exact);const exactImage={complete:true,naturalWidth:96,naturalHeight:128};cache.images.set(exact,{image:exactImage,valid:true,lastUsed:0,promise:Promise.resolve(exactImage)});cache.missing.delete(exact);const afterDecode=cache.resolveFirst(exact,[fallback]),exactPath=cache.aliases.get(exact);matrix.push({route,variant,form:form.id,direction,exact,fallback,visibleDuringSwap:duringSwap===fallbackImage,fallbackPathCorrect:fallbackPath===fallback,usesExactAfterDecode:afterDecode===exactImage,exactPathCorrect:exactPath===exact});
  }
  const bundleChecks={syntaxFallbackWorld:bundle.includes("image = loadedImage || this.lastPlayerImage"),syntaxFallbackTower:bundle.includes("loadedImage||this.lastPlayerImage"),syntaxFallbackCombat:bundle.includes("actor.lastVisibleImg"),activeActorFallback:bundle.includes('src="${this.actorSprite(current)}"'),saveIsolation:bundle.includes("sanitizeState?.(state2)"),devDormantGate:bundle.includes("if(!this.accessAllowed||this.enabled)return"),editorIntegrated:bundle.includes("drawWorldMinimapOverlay"),noUnseededTowerRandom:!((await readFile(path.join(root,"js/tower_generator.js"),"utf8")).includes("Math.random"))};
  const visualSwap={valid:matrix.every(entry=>entry.visibleDuringSwap&&entry.fallbackPathCorrect&&entry.usesExactAfterDecode&&entry.exactPathCorrect),cases:matrix.length,failures:matrix.filter(entry=>!entry.visibleDuringSwap||!entry.fallbackPathCorrect||!entry.usesExactAfterDecode||!entry.exactPathCorrect)};
  const result={valid:tower.valid&&editor.valid&&visualSwap.valid&&Object.values(bundleChecks).every(Boolean),tower:{valid:tower.valid,checks:tower.checks,bulk:tower.result,targetedCases:tower.targeted.length,targetedFailures:tower.targeted.filter(entry=>!entry.valid||!entry.deterministic)},editor:{valid:editor.valid,checks:editor.checks,failures:editor.failures},visualSwap,bundleChecks};
  console.log(JSON.stringify(result,null,2));if(!result.valid)process.exitCode=1;
}

try{await run();}finally{await rm(runtime,{recursive:true,force:true});}
