'use strict';
const fs = require('node:fs'), path = require('node:path'), { spawn } = require('node:child_process'), { randomUUID } = require('node:crypto');
const { snapshot, saveSnapshot, changedFiles } = require('./test-provenance.cjs');
const root = path.resolve(__dirname, '..');
const smoke = ['module-loader','test-runner','runtime-hooks','app-loader','runtime-upgrade','mobile-performance','loading-progress','duo-runtime','duo-world','duo-navigation','duo-tutorial','community-stories','daily-world','seasons','cooking','cooking-workshop','challenge-economy','words-respect','credits'].map(name => name + '-test.cjs');
const browser = new Set(['mask-file-browser-test.cjs']);
const all = fs.readdirSync(__dirname).filter(name => name.endsWith('-test.cjs') && !browser.has(name)).sort();
const args = process.argv.slice(2), requested = args.filter(arg => !arg.startsWith('--'));
const failedOnly = args.includes('--failed'), bundled = args.includes('--bundle');
const targetFile = bundled ? 'distribution-test-results.json' : requested.length ? 'focused-test-results.json' : 'test-results.json';
const latest = path.join(root, '.qa', targetFile);
const priorPath = path.join(root, '.qa/test-results.json');
function readPrior() { try { return JSON.parse(fs.readFileSync(priorPath, 'utf8')); } catch (error) { if (error.code === 'ENOENT' || error instanceof SyntaxError) return null; throw error; } }
function writeReport(file,value,runId){fs.mkdirSync(path.dirname(file),{recursive:true});const temporary=file+'.tmp-'+runId;fs.writeFileSync(temporary,JSON.stringify(value,null,2));fs.renameSync(temporary,file);}
function runSuite(file, sourceId, runId) {
  return new Promise(resolve => {
    const startedAt = new Date().toISOString(), started = performance.now();
    const child = spawn(process.execPath, [path.join(__dirname, file), ...(bundled ? ['--bundle'] : [])], { cwd: root, stdio: ['ignore','pipe','pipe'] });
    let settled = false, timedOut = false;
    const finish = value => { if (settled) return; settled = true; clearTimeout(timer); resolve({ file, ...value, sourceId, runId, reused:false, verified:true, startedAt, finishedAt:new Date().toISOString(), durationMs:Math.round(performance.now()-started) }); };
    const record = chunk => process.stdout.write(chunk.toString());
    child.stdout.on('data',record);child.stderr.on('data',record);
    const timer = setTimeout(() => { timedOut = true; child.kill(); },180000);
    child.on('error',error=>finish({pass:false,code:null,error:error.message}));
    child.on('close',code=>finish({pass:code===0&&!timedOut,code,timedOut}));
  });
}
(async () => {
  const startedAt = new Date().toISOString(), started = performance.now(), runId = randomUUID();
  const before = snapshot(root), source = saveSnapshot(root,before);
  const artifactBefore = bundled ? snapshot(root,['dist']) : null;
  if (bundled && !artifactBefore.fileCount) throw new Error('Build the distribution before testing it.');
  const prior = failedOnly ? readPrior() : null;
  const currentPrior = prior?.schemaVersion===2 && prior.source?.id===before.id && prior.verification?.sourceUnchanged===true && prior.verification?.artifactUnchanged!==false;
  let selectionReason = 'requested', selected;
  if (failedOnly && !currentPrior) {
    selected = all;selectionReason = prior ? 'source-changed-or-legacy-report' : 'no-previous-report';
    console.log('No verified results for this source version. Running all current suites.');
  } else if (failedOnly) {
    selected = [...new Set([...(prior.selection?.suites || prior.results.map(row=>row.file)), ...(prior.selection?.mode==='all'?all:[])])].filter(file=>!prior.results.some(row=>row.file===file&&row.pass&&row.verified&&row.sourceId===before.id));
    selectionReason = 'failed-or-unverified-only';
  } else selected = requested.length ? requested.map(name=>name.endsWith('.cjs')?name:name+'-test.cjs') : args.includes('--all')?all:smoke;
  const results = [];
  console.log('Source version: sha256:' + before.id + '\nRun: ' + runId);
  for (const file of selected) {
    if(path.basename(file)!==file||!fs.existsSync(path.join(__dirname,file)))throw new Error('Unknown suite: '+file);
    console.log('\n'+file);results.push(await runSuite(file,before.id,runId));
  }
  const after = snapshot(root), artifactAfter = bundled ? snapshot(root,['dist']) : null;
  const sourceUnchanged = before.id===after.id, artifactUnchanged = !bundled||artifactBefore.id===artifactAfter.id;
  let combined = currentPrior ? prior.results.map(old=>results.find(row=>row.file===old.file)||{...old,reused:true}) : [];
  for(const row of results)if(!combined.some(old=>old.file===row.file))combined.push(row);
  if(!sourceUnchanged||!artifactUnchanged)combined=combined.map(row=>({...row,verified:false}));
  const summary={passed:combined.filter(row=>row.pass&&row.verified).length,failed:combined.filter(row=>!row.pass).length,executed:results.length,reused:combined.filter(row=>row.reused).length,total:combined.length,invalidated:combined.filter(row=>!row.verified).length};
  summary.status=summary.invalidated?'invalidated':summary.failed?'failed':'passed';
  const report={schemaVersion:2,run:{id:runId,startedAt,finishedAt:new Date().toISOString(),durationMs:Math.round(performance.now()-started),command:[process.execPath,...process.argv.slice(1)],environment:{node:process.version,platform:process.platform,arch:process.arch}},source,artifact:artifactBefore?saveSnapshot(root,artifactBefore):null,selection:{mode:failedOnly&&currentPrior?prior.selection.mode:requested.length?'focused':failedOnly||args.includes('--all')?'all':'smoke',suites:combined.map(row=>row.file),reason:selectionReason},verification:{sourceUnchanged,sourceIdAtEnd:after.id,changedFiles:changedFiles(before,after),artifactUnchanged,artifactIdAtEnd:artifactAfter?.id||null},results:combined,summary};
  fs.mkdirSync(path.join(root,'.qa/test-runs'),{recursive:true});
  writeReport(path.join(root,'.qa/test-runs',runId+'.json'),report,runId);
  writeReport(latest,report,runId);
  console.log('\n'+summary.passed+'/'+summary.total+' verified suites passed; '+summary.executed+' executed, '+summary.reused+' reused.');
  if(summary.status!=='passed'){if(!sourceUnchanged||!artifactUnchanged)console.error('Inputs changed during the run. Results are not verified for a single version.');process.exitCode=1;}
})().catch(error=>{console.error(error);process.exitCode=1;});
