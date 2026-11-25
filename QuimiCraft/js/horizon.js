
"use strict";

globalThis.QuimiCraftHorizon=(()=>{
  const limits=Object.freeze({min:8,max:16});
  const presetRange=Object.freeze({low:8,medium:9,high:12,cinematic:15});
  function normalizeRange(value,fallback=presetRange.high){
    const numeric=Number(value);
    const candidate=Number.isFinite(numeric)&&numeric>0?numeric:fallback;
    return Math.max(limits.min,Math.min(limits.max,Math.round(candidate)));
  }
  const minimumRadius=5;
  const preloadRadius=range=>Math.min(6,Math.max(minimumRadius,Math.floor(range*.43)));
  const streamRadius=range=>range+2;
  function fogRange(range,chunkSize,weather,clarity=null,waterSeconds=0,waterVisibility=1){
    const far=(range+.52)*chunkSize;
    if(clarity!==null){
      const adapted=.58+.42*(1-Math.exp(-waterSeconds/7));
      const waterFar=Math.min(far,(33+clarity*23)*waterVisibility*adapted);
      // A névoa já colore objetos próximos e engrossa com a distância.
      return {near:-waterFar*.32,far:waterFar};
    }
    const edge=range*chunkSize;
    const onset={clear:1,rain:.84,snow:.85,storm:.72}[weather]??1;
    return {near:edge*onset,far};
  }
  function disk(cx,cz,radius){
    const out=[],limit=(radius+.37)**2;
    for(let dz=-radius;dz<=radius;dz++){
      for(let dx=-radius;dx<=radius;dx++){
        const d=dx*dx+dz*dz;
        if(d>limit)continue;
        const x=cx+dx,z=cz+dz;
        out.push({cx:x,cz:z,k:x+","+z,d});
      }
    }
    return out;
  }
  const coreOffsets=disk(0,0,minimumRadius);
  const coreSize=coreOffsets.length;
  function coreReady(cx,cz,hasChunk){
    return coreOffsets.every(q=>hasChunk(cx+q.cx,cz+q.cz));
  }
  function movementDirection(dx,dz){
    const length=Math.hypot(dx,dz);
    return {x:Math.abs(dx)>length*.29?Math.sign(dx):0,
      z:Math.abs(dz)>length*.29?Math.sign(dz):0};
  }
  function nextCenters(x,z,direction){
    const centers=[];
    if(direction.x)centers.push({x:x+direction.x,z});
    if(direction.z)centers.push({x,z:z+direction.z});
    if(direction.x&&direction.z)centers.push({x:x+direction.x,z:z+direction.z});
    return centers;
  }
  function edgeAt(offset,size,previous){
    const border=size*.31,release=size*.43;
    if(offset<=border||(previous===-1&&offset<=release))return -1;
    if(offset>=size-border||(previous===1&&offset>=size-release))return 1;
    return 0;
  }
  function streamCenter(position,size,previous){
    const x=Math.floor(position.x/size),z=Math.floor(position.z/size);
    return {x,z,aheadX:edgeAt(position.x-x*size,size,previous?.x===x?previous.aheadX:0),
      aheadZ:edgeAt(position.z-z*size,size,previous?.z===z?previous.aheadZ:0)};
  }
  function streamWindow({x,z,aheadX,aheadZ},range){
    const radius=streamRadius(range),limit=(radius+.37)**2,out=[];
    const shifts=[[0,0]];
    if(aheadX)shifts.push([aheadX,0]);
    if(aheadZ)shifts.push([0,aheadZ]);
    if(aheadX&&aheadZ)shifts.push([aheadX,aheadZ]);
    for(let dz=-radius+Math.min(aheadZ,0);dz<=radius+Math.max(aheadZ,0);dz++){
      for(let dx=-radius+Math.min(aheadX,0);dx<=radius+Math.max(aheadX,0);dx++){
        if(!shifts.some(([sx,sz])=>(dx-sx)**2+(dz-sz)**2<=limit))continue;
        const cx=x+dx,cz=z+dz,d=(dx-aheadX*.75)**2+(dz-aheadZ*.75)**2;
        out.push({cx,cz,k:cx+","+cz,d});
      }
    }
    return out;
  }
  function retainChunk(cx,cz,center,range){
    return (cx-center.x)**2+(cz-center.z)**2<=(streamRadius(range)+1.8)**2;
  }
  function loadedRange(position,range,size,hasChunk){
    const cx=Math.floor(position.x/size),cz=Math.floor(position.z/size);
    const search=streamRadius(range),max=(range+.52)*size;
    let clear=max;
    for(let z=cz-search;z<=cz+search;z++){
      const dz=Math.max(z*size-position.z,position.z-(z+1)*size,0);
      if(dz>clear)continue;
      for(let x=cx-search;x<=cx+search;x++){
        const dx=Math.max(x*size-position.x,position.x-(x+1)*size,0);
        if(dx*dx+dz*dz>=clear*clear||hasChunk(x,z))continue;
        clear=Math.hypot(dx,dz);
      }
    }
    return clear===max?range:Math.min(range,Math.max(.25,(clear-2.5)/size-.52));
  }
  function overFootprint(pos,x,z,radius=.29){
    return x+1>pos.x-radius&&x<pos.x+radius&&z+1>pos.z-radius&&z<pos.z+radius;
  }
  function overlapsPlayer(pos,height,x,y,z){
    return overFootprint(pos,x,z)&&y+1>pos.y+.012&&y<pos.y+height-.014;
  }
  function canBufferUnderfoot(pos,x,y,z,vertical){
    return vertical>0&&overFootprint(pos,x,z,.17)&&y+.01<=pos.y&&pos.y<y+.99;
  }
  return {limits,presetRange,minimumRadius,coreSize,coreReady,movementDirection,nextCenters,normalizeRange,preloadRadius,streamRadius,fogRange,disk,streamCenter,streamWindow,retainChunk,loadedRange,overFootprint,overlapsPlayer,canBufferUnderfoot};
})();
