const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));
const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
const pair=(value,fallback=[0,0])=>Array.isArray(value)&&value.length>=2?[finite(value[0],fallback[0]),finite(value[1],fallback[1])]:[...fallback];

/**
 * Turns manifest presentation metadata into one immutable runtime placement.
 * The random value must come from the floor's seeded RNG; this module never
 * uses Math.random so a prop keeps the same scale after a chunk is rebuilt.
 */
export function presentationFromAsset(asset,randomValue=.5){
  const bounds=pair(asset?.bounds?.slice?.(0,2),[0,0]).concat(pair(asset?.bounds?.slice?.(2),[1,1]));
  const recommended=finite(asset?.recommendedWorldHeight,Math.max(42,Math.min(asset?.building?248:168,bounds[3]||64)));
  const minimum=finite(asset?.minimumWorldHeight,recommended*.9),maximum=finite(asset?.maximumWorldHeight,recommended*1.1);
  const range=pair(asset?.randomScaleRange,[1,1]);
  const variation=asset?.allowsRandomScale===false?1:range[0]+clamp(randomValue,0,1)*(range[1]-range[0]);
  const height=clamp(recommended*variation,minimum,maximum),ratio=height/Math.max(1,recommended);
  const footprint=pair(asset?.visualFootprint,asset?.footprint||[0,0]);
  const collision=pair(asset?.collisionFootprint,asset?.footprint||[0,0]);
  return{
    height:Math.round(height*100)/100,
    scaleClass:asset?.scaleClass||"medium",
    sourceBounds:bounds,
    sourceSize:[finite(asset?.width,bounds[2]),finite(asset?.height,bounds[3])],
    groundAnchor:pair(asset?.groundAnchor,asset?.anchor||[bounds[0]+bounds[2]/2,bounds[1]+bounds[3]]),
    anchorOffsetX:finite(asset?.anchorOffsetX,0),anchorOffsetY:finite(asset?.anchorOffsetY,0),
    baselineOffset:finite(asset?.baselineOffset,0),sortOffsetY:finite(asset?.sortOffsetY,0),
    recommendedWorldHeight:recommended,minimumWorldHeight:minimum,maximumWorldHeight:maximum,
    allowsRandomScale:asset?.allowsRandomScale!==false,randomScaleRange:range,
    visualFootprint:[footprint[0]*ratio,footprint[1]*ratio],
    footprint:[collision[0]*ratio,collision[1]*ratio],
    collisionOffsetX:finite(asset?.collisionOffsetX,0)*ratio,collisionOffsetY:finite(asset?.collisionOffsetY,0)*ratio,
    shadowWidth:finite(asset?.shadowWidth,footprint[0]||collision[0]) * ratio,
    shadowHeight:finite(asset?.shadowHeight,Math.max(0,(footprint[1]||collision[1])*.32))*ratio,
    shadowOffsetY:finite(asset?.shadowOffsetY,1)*ratio,shadowOpacity:clamp(asset?.shadowOpacity??.22,0,.6),
    hasBuiltInShadow:Boolean(asset?.hasBuiltInShadow),shadowEnabled:asset?.shadowOpacity!==0,
    canRotate:Boolean(asset?.canRotate),canMirror:Boolean(asset?.canMirror),rotation:0,mirror:false,
    proportionalCollision:true,
  };
}

/** Backfills presentation fields for old generated floors and imported drafts. */
export function normalizePropPresentation(prop,asset=null){
  const defaults=presentationFromAsset(asset||{
    bounds:prop?.sourceBounds||[0,0,Math.max(1,prop?.footprint?.[0]||32),Math.max(1,prop?.height||64)],
    anchor:prop?.groundAnchor,recommendedWorldHeight:prop?.height,footprint:prop?.footprint,
  },.5);
  const normalized={...defaults,...prop};
  normalized.height=clamp(normalized.height||defaults.height,8,640);
  normalized.sourceBounds=pair(normalized.sourceBounds?.slice?.(0,2),defaults.sourceBounds.slice(0,2)).concat(pair(normalized.sourceBounds?.slice?.(2),defaults.sourceBounds.slice(2)));
  normalized.groundAnchor=pair(normalized.groundAnchor,defaults.groundAnchor);
  normalized.visualFootprint=pair(normalized.visualFootprint,defaults.visualFootprint);
  normalized.footprint=pair(normalized.footprint,defaults.footprint);
  for(const field of["anchorOffsetX","anchorOffsetY","baselineOffset","sortOffsetY","collisionOffsetX","collisionOffsetY","shadowWidth","shadowHeight","shadowOffsetY","shadowOpacity","recommendedWorldHeight"]){normalized[field]=finite(normalized[field],defaults[field]);}
  normalized.shadowEnabled=normalized.shadowEnabled!==false&&normalized.shadowOpacity>0;
  normalized.rotation=finite(normalized.rotation,0);
  normalized.mirror=Boolean(normalized.mirror&&normalized.canMirror!==false);
  normalized.proportionalCollision=normalized.proportionalCollision!==false;
  return normalized;
}

export function propCollisionBounds(prop){
  const [width,height]=pair(prop?.footprint,[0,0]),cx=finite(prop?.x)+finite(prop?.collisionOffsetX),cy=finite(prop?.y)+finite(prop?.collisionOffsetY);
  return{x:cx-width/2,y:cy-height/2,w:Math.max(0,width),h:Math.max(0,height),cx,cy};
}

export function propVisualBounds(prop){
  const bounds=Array.isArray(prop?.sourceBounds)&&prop.sourceBounds.length>=4?prop.sourceBounds:[0,0,1,Math.max(1,finite(prop?.height,1))];
  const anchor=pair(prop?.groundAnchor,[bounds[0]+bounds[2]/2,bounds[1]+bounds[3]]),scale=finite(prop?.height,1)/Math.max(1,bounds[3]);
  const x=finite(prop?.x)+finite(prop?.anchorOffsetX)-(anchor[0]-bounds[0])*scale;
  const y=finite(prop?.y)+finite(prop?.anchorOffsetY)-(anchor[1]-bounds[1])*scale;
  return{x,y,w:bounds[2]*scale,h:bounds[3]*scale,scale,anchorX:finite(prop?.x)+finite(prop?.anchorOffsetX),anchorY:finite(prop?.y)+finite(prop?.anchorOffsetY)};
}

export function propShadowSpec(prop){
  const collision=propCollisionBounds(prop),visual=pair(prop?.visualFootprint,[collision.w,collision.h]);
  return{x:finite(prop?.x)+finite(prop?.collisionOffsetX),y:finite(prop?.y)+finite(prop?.shadowOffsetY),width:Math.max(0,finite(prop?.shadowWidth,visual[0])),height:Math.max(0,finite(prop?.shadowHeight,visual[1]*.3)),opacity:prop?.shadowEnabled===false?0:clamp(prop?.shadowOpacity??.22,0,.6)};
}

export const propSortY=(prop)=>finite(prop?.y)+finite(prop?.sortOffsetY);

export function rectangleOverlap(a,b,padding=0){
  return a.x-padding<b.x+b.w&&a.x+a.w+padding>b.x&&a.y-padding<b.y+b.h&&a.y+a.h+padding>b.y;
}

export function propBlocksPoint(prop,x,y,radius=0){
  if(!prop||prop.collision==="none"||prop.collision==="traversable")return false;
  const box=propCollisionBounds(prop);
  return x+radius>box.x&&x-radius<box.x+box.w&&y+radius>box.y&&y-radius<box.y+box.h;
}
