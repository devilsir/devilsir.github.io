import {harness} from './harness.mjs'
const h=harness();h.run('startStage(0);tutorialDone=true;for(const [type,lane,col] of [["miniSun",0,0],["mercury",0,1],["mercury",2,1],["belt",0,4],["belt",2,4]]){selected=type;placeAt({x:gridX[col],y:curveY(lane,gridX[col])})}startWave()');for(let i=0;i<15000&&!h.run('phaseCompletePending||gameOver');i++){
 h.run('for(let j=energyOrbs.length-1;j>=0;j--)collectOrb(j)')
 if(h.run('checkpointInProgress'))h.run('answerCheckpoint(questions[waveIndex][checkpointIndex].kind==="choice"?questions[waveIndex][checkpointIndex].correct:true);closeCheckpoint()')
 if(h.run('energy>=70&&defenders.some(d=>d.type==="mercury"&&d.level===1)'))h.run('showTowerPanel(defenders.find(d=>d.type==="mercury"&&d.level===1));upgradeSelectedTower();hideTowerPanel()')
 if(h.run('checkpointIndex>=1&&energy>=175&&defenders.filter(d=>d.type==="jupiter").length<2'))h.run('for(const lane of [0,2])if(!defenders.some(d=>d.lane===lane&&d.col===5)){selected="jupiter";placeAt({x:850,y:curveY(lane,850)});break}')
 h.run('update(.025)')
}console.log(h.run('({complete:phaseCompletePending,gameOver,health,time:simTime,kills:runStats.kills,checkpointIndex,energy,defenders:defenders.map(d=>d.type+" Lv"+d.level)})'));await h.close()
