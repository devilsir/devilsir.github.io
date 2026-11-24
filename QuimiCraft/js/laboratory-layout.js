"use strict";

globalThis.QuimiCraftLaboratory = {
  floorBlock(layout,B,x,z){
    const dx=x-layout.cx,dz=z-layout.cz;
    if(Math.abs(dx)===layout.halfW||Math.abs(dz)===layout.halfD)return B.SLATE;
    if(dz===-2){
      if(dx>=2&&dx<=13&&B.LAB_GUIDE_GREEN!==undefined)return B.LAB_GUIDE_GREEN;
      if(dx<=-2&&dx>=-13&&B.LAB_GUIDE_GOLD!==undefined)return B.LAB_GUIDE_GOLD;
    }
    if(dz===3&&dx<=-2&&dx>=-12&&B.LAB_GUIDE_BLUE!==undefined)return B.LAB_GUIDE_BLUE;
    return (dx+dz)&1 ? B.MARBLE : B.ALCHEMY_BRICK;
  },
  createLayout({terrainHeight, VILLAGE, MAX_Y, WATER_LEVEL, LAB_PROTECTION_MARGIN, LAB_ENTRANCE_LENGTH, clamp, lerp}) {
    const LAB_LAYOUT={cx:-6,cz:-6,halfW:18,halfD:14,height:12};
    function determineLaboratoryElevation(layout){
      const heights=[];
      for(let x=layout.cx-layout.halfW-LAB_PROTECTION_MARGIN;x<=layout.cx+layout.halfW+LAB_PROTECTION_MARGIN;x++){
        for(let z=layout.cz-layout.halfD-LAB_PROTECTION_MARGIN;z<=layout.cz+layout.halfD+LAB_PROTECTION_MARGIN;z++)heights.push(terrainHeight(x,z))
      }
      heights.sort((a,b)=>a-b);
      const percentile=p=>heights[Math.min(heights.length-1,Math.max(0,Math.floor((heights.length-1)*p)))],minimum=heights[0],maximum=heights[heights.length-1],median=percentile(.5),upper=percentile(.75),maxBase=Math.min(MAX_Y,62)-layout.height-3;
      return {minimum,maximum,median,upper,base:Math.round(clamp(upper+1,WATER_LEVEL+4,maxBase)),sampleCount:heights.length}
    }
    LAB_LAYOUT.terrain=determineLaboratoryElevation(LAB_LAYOUT);
    LAB_LAYOUT.y=LAB_LAYOUT.terrain.base;
    LAB_LAYOUT.entranceSurfaces=new Map();
    {
      const front=LAB_LAYOUT.cz-LAB_LAYOUT.halfD,startSurface=LAB_LAYOUT.y-1,endZ=front-LAB_ENTRANCE_LENGTH,endSurface=clamp(terrainHeight(LAB_LAYOUT.cx,endZ),startSurface-8,startSurface+3);
      let previous=startSurface;
      for(let step=1;step<=LAB_ENTRANCE_LENGTH;step++){
        const z=front-step,target=Math.round(lerp(startSurface,endSurface,step/LAB_ENTRANCE_LENGTH)),surface=clamp(target,previous-1,previous+1);
        LAB_LAYOUT.entranceSurfaces.set(z,surface);previous=surface
      }
    }
    LAB_LAYOUT.villagePathSurfaces=new Map();
    {
      const front=LAB_LAYOUT.cz-LAB_LAYOUT.halfD,startZ=front-LAB_ENTRANCE_LENGTH,targetX=VILLAGE.x-27,targetZ=VILLAGE.z,centers=[];
      for(let x=LAB_LAYOUT.cx+1;x<=targetX;x++)centers.push({x,z:startZ,axis:"x"});
      const zDirection=Math.sign(targetZ-startZ)||1;for(let z=startZ+zDirection;z!==targetZ+zDirection;z+=zDirection)centers.push({x:targetX,z,axis:"z"});
      let previous=LAB_LAYOUT.entranceSurfaces.get(startZ)??LAB_LAYOUT.y-1;centers.forEach((center,index)=>{
        const target=Math.round(lerp(previous,VILLAGE.base,1/(centers.length-index))),surface=clamp(target,previous-1,previous+1),cross=center.axis==="x"?[[0,-1],[0,0],[0,1]]:[[-1,0],[0,0],[1,0]];
        for(const [dx,dz] of cross)LAB_LAYOUT.villagePathSurfaces.set(`${center.x+dx},${center.z+dz}`,surface);
        previous=surface
      })
    }
    return LAB_LAYOUT;
  },
  createWorld({LAB_LAYOUT,labDoor,labRepairOverrides,mods,key3,MAX_Y,BLOCK,LAB_ENTRANCE_LENGTH,LAB_PROTECTION_MARGIN,labBoundsContains}) {
    function labStructureBounds(pad=0){return {left:LAB_LAYOUT.cx-LAB_LAYOUT.halfW-pad,right:LAB_LAYOUT.cx+LAB_LAYOUT.halfW+pad,front:LAB_LAYOUT.cz-LAB_LAYOUT.halfD-pad,rear:LAB_LAYOUT.cz+LAB_LAYOUT.halfD+pad,bottom:0,top:LAB_LAYOUT.y+LAB_LAYOUT.height+2}}
    function inLabEntranceCorridor(x,z,pad=0){const front=LAB_LAYOUT.cz-LAB_LAYOUT.halfD;return x>=LAB_LAYOUT.cx-4-pad&&x<=LAB_LAYOUT.cx+3+pad&&z<=front-1+pad&&z>=front-LAB_ENTRANCE_LENGTH-pad}
    function labVillagePathSurface(x,z){const value=LAB_LAYOUT.villagePathSurfaces.get(`${Math.floor(x)},${Math.floor(z)}`);return value===undefined?null:value}
    function inLabVillagePath(x,z){return labVillagePathSurface(x,z)!==null}
    function laboratoryColumnAt(x,z){
      const core=labBoundsContains(x,z),protectedArea=labBoundsContains(x,z,LAB_PROTECTION_MARGIN),corridor=inLabEntranceCorridor(x,z),villagePathSurface=labVillagePathSurface(x,z);
      if(!core&&!protectedArea&&!corridor&&villagePathSurface===null)return null;
      return {core,corridor,villagePathSurface};
    }
    function laboratoryBlockAt(x,y,z,column){
      if(labRepairOverrides.size){
        const repair=labRepairOverrides.get(key3(x,y,z));if(repair!==undefined)return repair;
      }
      if(y<0||y>=MAX_Y)return null;
      if(column===undefined)column=laboratoryColumnAt(x,z);
      if(column===null)return null;
      const {core,corridor,villagePathSurface}=column;
      if(y===0)return BLOCK.BEDROCK;
      if(villagePathSurface!==null&&!corridor&&!core){
        if(y<villagePathSurface)return BLOCK.DEEPSTONE;if(y===villagePathSurface)return BLOCK.VILLAGE_BRICK;return BLOCK.AIR
      }
      if(corridor){
        const surface=LAB_LAYOUT.entranceSurfaces.get(z);if(surface===undefined)return null;
        if(y<surface)return BLOCK.DEEPSTONE;if(y===surface)return BLOCK.ALCHEMY_BRICK;return BLOCK.AIR
      }
      const {cx,cz,halfW,halfD,height}=LAB_LAYOUT,floorY=LAB_LAYOUT.y,roofY=floorY+height,left=cx-halfW,right=cx+halfW,front=cz-halfD,rear=cz+halfD;
      if(y<floorY-1)return BLOCK.DEEPSTONE;
      if(y===floorY-1){
        if(!core)return BLOCK.SLATE;
        return QuimiCraftLaboratory.floorBlock(LAB_LAYOUT,BLOCK,x,z);
      }
      if(!core)return BLOCK.AIR;
      if(y>roofY)return BLOCK.AIR;
      if(y===roofY){const skylight=Math.abs(x-cx)<=12&&[0,1,2].includes(Math.abs((z-cz)%5))&&Math.abs(z-cz)<halfD-1;return skylight?BLOCK.GLASS:BLOCK.SLATE}
      const level=y-floorY,onFront=z===front,onRear=z===rear,onSide=x===left||x===right;
      if(onFront||onRear){
        const doorCell=labDoor.isCell(x,y,z);
        if(doorCell){const stored=mods.get(key3(x,y,z));return stored===BLOCK.DOOR_OPEN?BLOCK.DOOR_OPEN:BLOCK.DOOR}
        const transom=onFront&&x>=labDoor.minX&&x<labDoor.maxX&&level===labDoor.height,frontWindow=onFront&&level>=3&&level<=8&&Math.abs(x-cx)>5&&Math.abs(x-cx)<halfW-1,backTable=onRear&&Math.abs(x-cx)<=11;
        return transom||frontWindow?BLOCK.GLASS:(backTable?BLOCK.SLATE:(level===0?BLOCK.SLATE:BLOCK.MARBLE))
      }
      if(onSide){const window=level>=2&&level<=8&&z>front+2&&z<rear-2&&((z-front)%4!==0);return window?BLOCK.GLASS:(level===0?BLOCK.SLATE:BLOCK.MARBLE)}
      return BLOCK.AIR
    }
    return {labStructureBounds,inLabEntranceCorridor,labVillagePathSurface,inLabVillagePath,laboratoryColumnAt,laboratoryBlockAt};
  }
};
