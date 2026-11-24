"use strict";

globalThis.QuimiCraftTerrain = {
  create({WORLD_SEED, VILLAGE, BLOCK, MAX_Y, WATER_LEVEL, inVillage, ckey, hash, clamp, lerp, smooth, settleSurface, depths}) {
    const heightCache = new Map(), biomeCache = new Map();
    const scaleAt=(x,z)=>VILLAGE.version===3||Math.hypot(x,z)>580 ? 10 : 1;
    class Perlin{
      constructor(seed=1337){
        const p=[...Array(256).keys()];let s=seed>>>0;
        for(let i=255;i>0;i--){s=(s*1664525+1013904223)>>>0;const j=s%(i+1);[p[i],p[j]]=[p[j],p[i]]}
        this.p=new Uint16Array(512);for(let i=0;i<512;i++)this.p[i]=p[i&255];
      }
      fade(t){return t*t*t*(t*(t*6-15)+10)}
      grad(h,x,y,z){const q=h&15,u=q<8?x:y,v=q<4?y:q===12||q===14?x:z;return((q&1)?-u:u)+((q&2)?-v:v)}
      n3(x,y,z){const X=Math.floor(x)&255,Y=Math.floor(y)&255,Z=Math.floor(z)&255;x-=Math.floor(x);y-=Math.floor(y);z-=Math.floor(z);const u=this.fade(x),v=this.fade(y),w=this.fade(z),p=this.p,A=p[X]+Y,AA=p[A]+Z,AB=p[A+1]+Z,B=p[X+1]+Y,BA=p[B]+Z,BB=p[B+1]+Z;return lerp(lerp(lerp(this.grad(p[AA],x,y,z),this.grad(p[BA],x-1,y,z),u),lerp(this.grad(p[AB],x,y-1,z),this.grad(p[BB],x-1,y-1,z),u),v),lerp(lerp(this.grad(p[AA+1],x,y,z-1),this.grad(p[BA+1],x-1,y,z-1),u),lerp(this.grad(p[AB+1],x,y-1,z-1),this.grad(p[BB+1],x-1,y-1,z-1),u),v),w)}
      n2(x,z){return this.n3(x,0,z)}
      fbm2(x,z,oct=5){let a=.5,f=1,n=0,d=0;for(let i=0;i<oct;i++){n+=this.n2(x*f,z*f)*a;d+=a;a*=.5;f*=2.03}return n/d}
      fbm3(x,y,z,oct=3){let a=.55,f=1,n=0,d=0;for(let i=0;i<oct;i++){n+=this.n3(x*f,y*f,z*f)*a;d+=a;a*=.5;f*=2.01}return n/d}
    }

    const noise=new Perlin(WORLD_SEED);
    function lakeInfluence(x,z){if(inVillage(x,z,8)||Math.hypot(x+14,z+18)<24)return 0;const size=82,cx=Math.floor(x/size),cz=Math.floor(z/size);let best=0;for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const gx=cx+dx,gz=cz+dz,px=(gx+.18+hash(gx,gz,WORLD_SEED%521)*.64)*size,pz=(gz+.18+hash(gx+71,gz-43,WORLD_SEED%733)*.64)*size,r=13+hash(gx-27,gz+59,WORLD_SEED%887)*17,d=Math.hypot(x-px,z-pz),shape=clamp(1-d/r,0,1);best=Math.max(best,shape)}return smooth(best)}

    const EXPANDED_REGION=640, EXPANSION_START=240;
    const remoteSites=new Map();
    function worldExpansionFactor(x,z){return smooth(clamp((Math.hypot(x,z)-EXPANSION_START)/340,0,1))}
    function remoteSiteForCell(cx,cz){
      const k=ckey(cx,cz);if(remoteSites.has(k))return remoteSites.get(k);
      const x=Math.floor((cx+.31+hash(cx+71,cz-19,WORLD_SEED%999)*.38)*EXPANDED_REGION);
      const z=Math.floor((cz+.31+hash(cx-43,cz+37,WORLD_SEED%787)*.38)*EXPANDED_REGION);
      const s=Math.hypot(x,z)>500?{x,z,kind:Math.floor(hash(cx+97,cz+13,WORLD_SEED%557)*3),y:null}:null;
      if(remoteSites.size>256)remoteSites.clear();remoteSites.set(k,s);return s;
    }
    function remoteSiteAt(x,z){
      if(Math.abs(x)<180&&Math.abs(z)<180)return null;
      const s=remoteSiteForCell(Math.floor(x/EXPANDED_REGION),Math.floor(z/EXPANDED_REGION));
      return s&&Math.abs(x-s.x)<=22&&Math.abs(z-s.z)<=22?s:null;
    }
    function grandLakeInfluence(x,z){
      const size=512,cx=Math.floor(x/size),cz=Math.floor(z/size);
      const px=Math.floor((cx+.26+hash(cx+13,cz+91,WORLD_SEED%903)*.48)*size);
      const pz=Math.floor((cz+.26+hash(cx-53,cz+28,WORLD_SEED%661)*.48)*size);
      const radius=60+hash(cx-7,cz+67,WORLD_SEED%837)*42;
      const dx=(x-px)/(radius*(.85+hash(cx+19,cz+3,44)*.4));
      const dz=(z-pz)/(radius*(.85+hash(cx+47,cz-11,45)*.4));
      const d=Math.hypot(dx,dz);return smooth(clamp((1-d)*2.4,0,1));
    }
    function remoteStructureBlock(x,y,z){
      const s=remoteSiteAt(x,z);if(!s)return BLOCK.AIR;
      if(s.y===null)s.y=Math.min(MAX_Y-13,Math.max(WATER_LEVEL+4,baseTerrainHeight(s.x,s.z)));
      const dx=x-s.x,dz=z-s.z,a=Math.abs(dx),b=Math.abs(dz),r=Math.max(a,b),h=y-s.y;
      if(h<0||h>10||r>9)return BLOCK.AIR;
      const floor=[BLOCK.MARBLE,BLOCK.PLANK,BLOCK.ALCHEMY_BRICK][s.kind];
      if(h===0&&r<=8)return r===8?BLOCK.SLATE:floor;
      if(s.kind===0){
        const corner=a===6&&b===6;
        if(h>=1&&h<=7&&corner)return BLOCK.SLATE;
        if(h===8&&r===6&&(a===6||b===6))return BLOCK.MARBLE;
        if(h>=1&&h<=4&&dx===0&&dz===0)return h===4?BLOCK.AMETHYST:BLOCK.MARBLE;
        if(h===9&&corner)return BLOCK.GLOWSTONE;
      }else if(s.kind===1){
        if(h>=1&&h<=4&&r===6){
          if(dz===-6&&a<=1&&h<=2)return BLOCK.AIR;
          if(h===2&&(a===6&&b%3===0||b===6&&a%3===0))return BLOCK.GLASS;
          return h===1?BLOCK.STONE:BLOCK.PLANK;
        }
        if(h===5&&r<=7)return r===7?BLOCK.WOOD:BLOCK.PINE_LEAVES;
        if(h===1&&dx===2&&dz===2)return BLOCK.LAB;
        if(h===2&&dx===2&&dz===2)return BLOCK.SPECTRAL;
        if(h===1&&dx===-2&&dz===3)return BLOCK.FURNACE;
      }else{
        if(h>=1&&h<=5&&a===6&&b===6)return h===5?BLOCK.GLOWSTONE:BLOCK.BASALT;
        if(h===1&&r===7&&(a===7||b===7)&&hash(x,z,451)>.46)return BLOCK.MARBLE;
        if(h>=1&&h<=3&&dz===4&&a>=3&&a<=4)return BLOCK.ALCHEMY_BRICK;
        if(h>=1&&h<=6&&dx===0&&dz===0)return h===6?BLOCK.CRYSTAL:BLOCK.OBSIDIAN;
        if(h===2&&a===2&&b===2)return BLOCK.AMETHYST;
      }
      return BLOCK.AIR;
    }
    const expedition=["floresta de sequoias","manguezal","chapadas ocres","fiordes glaciais","campina de aurora","caldeira vítrea","delta salobro","termas minerais","bosque lilás"];
    function farBiome(x,z,base,scale){
      if(Math.hypot(x,z)<255/Math.sqrt(scale))return base;
      x/=scale;z/=scale;
      const dx=x+noise.n2(x*.004+44,z*.004)*49,dz=z+noise.n2(x*.004-74,z*.004)*49;
      const ix=Math.floor(dx/176),iz=Math.floor(dz/176);
      const option=Math.floor(hash(ix,iz,700+WORLD_SEED%449)*(scale===1?8:expedition.length+3));
      if(scale===1&&option>=6)return base;
      return expedition[option]||base;
    }
    function biomeAt(x,z){
      x=Math.floor(x);z=Math.floor(z);const k=`${x},${z}`;if(biomeCache.has(k))return biomeCache.get(k);const scale=scaleAt(x,z),u=x/scale,v=z/scale;const temp=noise.fbm2(u*.0035+90,v*.0035-40,3),moist=noise.fbm2(u*.0042-180,v*.0042+80,3),weird=noise.fbm2(u*.0027+310,v*.0027-220,3),ridge=Math.abs(noise.fbm2(u*.003+10,v*.003+7,3));let b;
      if(weird>.34&&temp>.01)b="vulcânico";else if(weird<-.34&&moist<.09)b="bosque de cristais";else if(temp<-.31)b=moist<-.03?"tundra":"taiga";else if(temp>.27&&moist>.19)b="selva tropical";else if(temp>.24&&moist<-.12)b="deserto";else if(moist>.27&&temp>-.05)b="pântano";else if(weird<-.17&&moist<-.08&&temp>.02)b="salinas";else if(weird<-.08&&moist<.04&&temp<.16)b="cânion calcário";else if(moist>.15&&weird>.11&&temp>.01)b="bosque de cerejeiras";else if(ridge<.13&&temp<.05)b="prado alpino";else if(temp>.13&&moist<.03)b=weird>.05?"badlands":"savana";else if(ridge<.17&&weird>.04)b="montanha";else if(moist>.13)b="floresta";else if(moist>.02)b="planície florida";else b="planície";
      b=farBiome(x,z,b,scale);if(biomeCache.size>220000)biomeCache.clear();biomeCache.set(k,b);return b;
    }
    function baseTerrainHeight(x,z){
      x=Math.floor(x);z=Math.floor(z);const b=biomeAt(x,z),broad=noise.fbm2(x*.006,z*.006,4),detail=noise.fbm2(x*.025+50,z*.025-20,2),ridge=1-Math.abs(noise.fbm2(x*.004-30,z*.004+40,4));let h=17+broad*7+detail*2;
      const mountain=smooth(clamp((ridge-.56)/.3,0,1));h+=mountain*mountain*(b==="vulcânico"?32:27);const lakeD=Math.hypot((x-32)/1.2,z-9),lake=smooth(clamp(1-lakeD/31,0,1)),lakes=lakeInfluence(x,z);h=lerp(h,10+lakeD*.085,lake*.93);h=lerp(h,9.2+noise.fbm2(x*.035,z*.035,2)*1.15,lakes*.96);
      if(b==="deserto"||b==="savana"||b==="salinas")h=lerp(h,17+noise.fbm2(x*.012,z*.012,3)*3,.58);else if(b==="pântano")h=lerp(h,15+noise.fbm2(x*.015,z*.015,2)*1.6,.78);else if(b==="tundra")h=lerp(h,18+noise.fbm2(x*.011,z*.011,3)*4,.54);else if(b==="selva tropical")h+=noise.fbm2(x*.018+180,z*.018-90,3)*3.4;else if(b==="badlands")h=17+Math.floor((broad+1)*3)*2+detail;else if(b==="cânion calcário")h=19+Math.floor((broad+1.1)*2.4)*2+detail*.7;else if(b==="prado alpino")h+=mountain*9+noise.fbm2(x*.017,z*.017,2)*2;else if(b==="bosque de cristais")h+=noise.fbm2(x*.014-10,z*.014+40,2)*4;else if(b==="vulcânico")h+=Math.max(0,noise.fbm2(x*.009+400,z*.009-330,3))*8;
      const edge=VILLAGE.version===3?Infinity:Math.max(Math.abs(x-VILLAGE.x)-27,Math.abs(z-VILLAGE.z)-27),villageBlend=clamp(1-edge/8,0,1);if(villageBlend>0)h=lerp(h,VILLAGE.base,smooth(villageBlend));
      const expansion=worldExpansionFactor(x,z);
      if(expansion>0){
        const continent=noise.fbm2(x*.00165+124,z*.00165-258,4);
        const hills=noise.fbm2(x*.0074-91,z*.0074+63,3);
        const farRidge=1-Math.abs(noise.fbm2(x*.0037+130,z*.0037-230,3));
        h+=expansion*(continent*19+hills*5+smooth(clamp((farRidge-.72)/.25,0,1))*22);
        const lake=grandLakeInfluence(x,z);
        if(lake>0)h=lerp(h,9.5+noise.fbm2(x*.032,z*.032,2)*1.4,lake*expansion*.98);
      }
      if(b==="manguezal"||b==="delta salobro")h=lerp(h,13.5+noise.fbm2(x*.019,z*.019,2)*3.7,.85);
      else if(b==="fiordes glaciais"){
        const channel=Math.abs(noise.fbm2(x*.005+301,z*.005,3));
        h=lerp(h,12.2,Math.max(0,1-channel/.21));
        h+=Math.max(0,channel-.22)*40;
      }else if(b==="chapadas ocres")h=23+Math.floor((h+noise.n2(x*.016,z*.016)*7-20)/4)*3;
      else if(b==="caldeira vítrea")h+=Math.max(0,ridge-.51)*22;
      else if(b==="bosque lilás")h=lerp(h,21+noise.fbm2(x*.017,z*.017,3)*6,.56);
      else if(b==="termas minerais")h=lerp(h,17.8+noise.fbm2(x*.027,z*.027,3)*11,.61);
      else if(b==="floresta de sequoias")h=lerp(h,22+noise.fbm2(x*.012,z*.012,3)*7,.42);
      const blend=clamp(1-edge/8,0,1);
      if(blend>0)h=lerp(h,VILLAGE.base,smooth(blend));
      return clamp(Math.floor(h),3,MAX_Y-2);
    }
    function terrainHeight(x,z){
      x=Math.floor(x);z=Math.floor(z);const k=`${x},${z}`;
      if(heightCache.has(k))return heightCache.get(k);
      let h=baseTerrainHeight(x,z);
      const site=remoteSiteAt(x,z);
      if(site&&!inVillage(x,z,3)){
        if(site.y===null)site.y=Math.min(MAX_Y-13,Math.max(WATER_LEVEL+4,baseTerrainHeight(site.x,site.z)));
        const dist=Math.max(Math.abs(x-site.x),Math.abs(z-site.z));
        h=Math.floor(lerp(h,site.y,smooth(clamp((21-dist)/11,0,1))));
      }
      const lake=depths&&!site&&!inVillage(x,z,11)?depths.lakeAt(x,z):null;
      if(lake)h=Math.floor(depths.lakeHeight(h,lake,x,z,noise.n2(x*.076,z*.076)*1.18));
      if(settleSurface)h=settleSurface(x,z,h);
      if(heightCache.size>220000)heightCache.clear();heightCache.set(k,h);return h;
    }
    return {noise, biomeAt, terrainHeight, remoteSiteAt, remoteStructureBlock};
  }
};
