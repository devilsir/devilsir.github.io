/* Current map inventory, using the same runtime as the maintained tests. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const { environment } = require('./runtime-upgrade-test.cjs');
(async () => {
 const e = await environment(), { V } = e;
 try {
  await V.Game.init();
  const maps = Object.values(V.World.maps).map(m => ({id:m.id,name:m.name,width:m.width,height:m.height,objects:m.objects.length,decor:m.decor.length,links:m.objects.filter(o=>o.to||o.door?.to).map(o=>({id:o.id,to:o.to||o.door.to.map}))}));
  const output = path.resolve(__dirname, '../.qa/world-audit.json');
  fs.mkdirSync(path.dirname(output), {recursive:true});fs.writeFileSync(output, JSON.stringify(maps,null,2));
  console.log(JSON.stringify({maps:maps.length,objects:maps.reduce((n,m)=>n+m.objects,0),output}));
 } finally {V.MapAssets.cancel();e.dom.window.close();}
 process.exit(0);
})().catch(error=>{console.error(error.stack);process.exit(1);});
