'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),fixture=fs.mkdtempSync(path.join(root,'.qa/test-runner-fixture-'));
for(const folder of ['tools','js','.qa'])fs.mkdirSync(path.join(fixture,folder),{recursive:true});
for(const file of ['test.cjs','test-provenance.cjs'])fs.copyFileSync(path.join(__dirname,file),path.join(fixture,'tools',file));
fs.writeFileSync(path.join(fixture,'package.json'),'{}');fs.writeFileSync(path.join(fixture,'index.html'),'fixture');fs.writeFileSync(path.join(fixture,'js/logic.js'),'version-one');
fs.writeFileSync(path.join(fixture,'tools/a-test.cjs'),`const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');fs.appendFileSync(path.join(root,'.qa/calls.txt'),'a\\n');if(fs.existsSync(path.join(root,'.qa/mutate')))fs.writeFileSync(path.join(root,'js/logic.js'),'changed-during-run');`);
fs.writeFileSync(path.join(fixture,'tools/b-test.cjs'),`const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'..');fs.appendFileSync(path.join(root,'.qa/calls.txt'),'b\\n');if(fs.existsSync(path.join(root,'.qa/fail-b')))process.exit(1);`);
const flag=name=>path.join(fixture,'.qa',name),read=()=>JSON.parse(fs.readFileSync(flag('test-results.json'),'utf8'));
function run(args,expected){const child=spawnSync(process.execPath,[path.join(fixture,'tools/test.cjs'),...args],{cwd:fixture,encoding:'utf8',timeout:30000});assert.equal(child.status,expected,child.stderr+'\n'+child.stdout);return read();}
fs.writeFileSync(flag('fail-b'),'1');const first=run(['--all'],1);assert.equal(first.schemaVersion,2);assert.equal(first.summary.executed,2);assert.match(first.source.id,/^[a-f0-9]{64}$/);assert(Date.parse(first.run.startedAt));assert.equal(first.run.environment.node,process.version);assert(fs.existsSync(path.join(fixture,first.source.manifest)));assert(fs.existsSync(flag('test-runs/'+first.run.id+'.json')));
fs.unlinkSync(flag('fail-b'));const same=run(['--failed'],0);assert.equal(same.source.id,first.source.id);assert.equal(same.summary.executed,1);assert.equal(same.summary.reused,1);assert.equal(same.results.find(row=>row.file==='a-test.cjs').runId,first.run.id);assert.equal(same.summary.passed,2);
console.log('PASS test reports identify source content, execution time, environment and the origin of reused results');
fs.writeFileSync(path.join(fixture,'js/logic.js'),'version-two');const changed=run(['--failed'],0);assert.notEqual(changed.source.id,same.source.id);assert.equal(changed.summary.executed,2);assert.equal(changed.summary.reused,0);
fs.writeFileSync(flag('test-results.json'),JSON.stringify([{file:'a-test.cjs',pass:true,code:0}]));const legacy=run(['--failed'],0);assert.equal(legacy.summary.executed,2);assert.equal(legacy.schemaVersion,2);
console.log('PASS changed sources and legacy reports force a fresh complete verification instead of inheriting approvals');
fs.writeFileSync(flag('mutate'),'1');const invalid=run(['--all'],1);assert.equal(invalid.summary.status,'invalidated');assert.equal(invalid.verification.sourceUnchanged,false);assert(invalid.verification.changedFiles.includes('js/logic.js'));assert(invalid.results.every(row=>!row.verified));
console.log('PASS changes during a run invalidate its approvals and record the changed files');
