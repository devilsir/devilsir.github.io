
"use strict";

globalThis.QuimiCraftSurfaceArt=(()=>{
  const tiles={plain:210,amber:211,cobalt:212,leaded:213,apparatus:214,iceTop:215,iceSide:216,blueIce:217,
    frostTop:218,frostSide:219,hoarfrost:220,basaltGlass:221,leaf:222,pigment:223,
    magma:225,bedrock:226,linen:227,blanket:228,pineEnd:252,cherryEnd:253,palmEnd:254};
  const treeTiles=new Map();
  const trees={
    WOOD:[[117,78,48],[174,121,69],2.4,"furrow"],
    PINE_LOG:[[92,67,49],[188,137,85],3.6,"furrow"],
    CHERRY_LOG:[[107,64,67],[193,129,104],1.1,"lenticular"],
    PALM_LOG:[[132,98,64],[183,143,87],2.3,"scars"],
    REDWOOD_LOG:[[126,64,47],[175,106,73],4.5,"furrow"],
    MANGROVE_LOG:[[96,73,55],[156,116,78],3.1,"furrow"],
    BIRCH_LOG:[[208,189,157],[191,153,105],.8,"lenticular"],
    ACACIA_LOG:[[117,91,70],[190,125,85],3.2,"furrow"],
    JACARANDA_LOG:[[103,76,82],[171,111,111],2.1,"furrow"]
  };
  const crowns={
    LEAVES:[[55,109,52],[102,156,67],"broad"],PINE_LEAVES:[[38,79,67],[82,129,89],"needle"],
    DRY_LEAVES:[[107,86,40],[170,128,57],"broad"],CHERRY_LEAVES:[[129,64,91],[229,153,169],"blossom"],
    PALM_LEAVES:[[47,102,59],[97,158,76],"needle"],REDWOOD_LEAF:[[49,88,65],[92,136,91],"needle"],
    MANGROVE_LEAF:[[46,96,63],[104,150,80],"broad"],BIRCH_LEAF:[[89,120,49],[153,172,74],"broad"],
    ACACIA_LEAF:[[67,99,45],[130,150,66],"broad"],JACARANDA_LEAF:[[86,62,111],[174,130,203],"blossom"]
  };
  const coalPieces=[[2,4,5.7,3.4,.36],[11,5,4.2,3.5,-.55],[23,5,6.2,3.6,.24],[5,14,4.7,3.9,-.43],
    [16,13,5.5,4.3,.47],[28,15,4.9,3.3,-.61],[7,24,6,4.2,.26],[20,24,5.9,4.3,-.48],[29,30,4.9,3.3,.62]];
  const swatch=new Map([
    [tiles.plain,[156,220,233]],[tiles.amber,[222,163,80]],[tiles.cobalt,[81,153,220]],
    [tiles.leaded,[153,204,215]],[tiles.apparatus,[128,218,231]],
    [tiles.iceTop,[177,223,239]],[tiles.iceSide,[133,190,212]],[tiles.blueIce,[69,150,203]],
    [tiles.frostTop,[186,208,212]],[tiles.frostSide,[135,153,152]],[tiles.hoarfrost,[206,226,234]],
    [tiles.basaltGlass,[77,87,107]],[tiles.leaf,[77,127,62]],[tiles.pigment,[216,210,204]],
    [tiles.magma,[104,65,51]],[tiles.bedrock,[64,67,73]],[tiles.linen,[225,215,191]],[tiles.blanket,[168,55,74]]
  ]);
  const transparentTiles=new Set([210,211,212,213,214,215,216,217]);
  const color=tile=>swatch.get(tile);
  const clamp=(n,l,h)=>Math.min(h,Math.max(l,n));
  function configure(B,defs){
    for(const [name,[bark,end,ridges,style]] of Object.entries(trees)){
      const def=defs[B[name]];
      if(!Array.isArray(def?.tex))continue;
      const [top,side]=def.tex;
      const cut={PINE_LOG:tiles.pineEnd,CHERRY_LOG:tiles.cherryEnd,PALM_LOG:tiles.palmEnd}[name]??top;
      def.tex=[cut,side,cut];
      treeTiles.set(side,{base:bark,ridges,style});
      treeTiles.set(cut,{base:end,style:"end",palm:name==="PALM_LOG"});
    }
    for(const [name,[base,light,style]] of Object.entries(crowns)){
      const def=defs[B[name]];
      if(def&&Number.isInteger(def.tex))treeTiles.set(def.tex,{base,light,style});
    }
    if(Number.isInteger(defs[B.COAL]?.tex))treeTiles.set(defs[B.COAL].tex,{style:"coal"});
    const skins={GLASS:tiles.plain,GLASS_AMBER:tiles.amber,GLASS_COBALT:tiles.cobalt,WINDOW_LEADED:tiles.leaded,
      ICE:[tiles.iceTop,tiles.iceSide,tiles.iceSide],BLUE_ICE_VEIN:[tiles.blueIce,tiles.blueIce,tiles.iceSide],
      FROSTED_SOIL:[tiles.frostTop,tiles.frostSide,2],FROST_CRUST:[tiles.hoarfrost,tiles.frostSide,tiles.frostSide],
      SNOW:[tiles.hoarfrost,209,8],BASALT_GLASS:tiles.basaltGlass};
    const translucent=new Set();
    for(const [name,tex] of Object.entries(skins)){
      const id=B[name];
      if(!defs[id])continue;
      defs[id].tex=tex;
      if(transparentTiles.has(Array.isArray(tex)?tex[0]:tex)){
        defs[id].alpha=true;
        translucent.add(id);
      }
    }
    return translucent;
  }
  const wrap=d=>d-32*Math.round(d/32);
  const tone=(base,n,a=255)=>[base[0]+n,base[1]+n,base[2]+n*.84,a];
  function woodPixel({base,ridges,style,palm},x,y,hash){
    const grain=(hash(x,y,118)-.5)*10+(hash(x>>1,y>>1,817)-.5)*7;
    if(style==="end"){
      const dx=x-14.5,dy=y-16.5,a=Math.atan2(dy,dx),r=Math.hypot(dx*.96,dy*1.03);
      const bands=r+Math.sin(a*3)*.66+Math.cos(a*5+r*.3)*.29;
      const split=r>6&&(Math.abs(dy-dx*.49)<.62&&dx>0||r>11&&Math.abs(dx+dy*.31)<.65&&dy<0);
      const fiber=palm?(hash(x,y,994)>.76?-24:6):(Math.cos(bands*2.23)>.59?-20:Math.sin(bands*2.23)*8);
      return tone(base,grain+fiber-(r>14.1+Math.sin(a*5)*.65?43:0)-(split?28:0));
    }
    if(style==="scars"){
      const lip=(y+Math.round(Math.sin(x*Math.PI/16)*1.9)+32)%8;
      return tone(base,grain+(lip===0?-31:lip===1?22:lip===7?-14:0)+Math.sin(x*.8)*5);
    }
    if(style==="lenticular"){
      const row=Math.floor(y/5),shift=Math.floor(hash(row,91,677)*32);
      const slot=wrap(x-shift),mark=Math.abs(slot)<3+hash(row,24,86)*6&&(y%5===0||y%5===1&&Math.abs(slot)<4);
      return tone(base,grain+Math.sin(y*.84+x*.14)*8-(mark?41:0));
    }
    const knotX=wrap(x-10),knotY=wrap(y-18),knot=Math.exp(-(knotX*knotX/36+knotY*knotY/18));
    const wave=Math.sin(y*Math.PI/16)*.70+Math.sin(y*Math.PI/8+x*Math.PI/16)*.28+knot*1.9;
    const channel=Math.sin(x*Math.PI/16*Math.round(ridges*2)+wave);
    return tone(base,grain+channel*13-(channel<-.71?21:0)+(channel>.77?13:0)-knot*18);
  }
  function crownPixel({base,light,style},x,y,hash){
    const grid=style==="needle"?7:8;
    let best=Infinity,tint=0,edge=0,vein=0;
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){
      const row=Math.floor(y/grid)+j,col=Math.floor(x/grid)+i;
      const n=hash((col+16)%Math.ceil(32/grid),(row+16)%Math.ceil(32/grid),3193);
      const dx=x-((col+.45+n*.27)*grid),dy=y-((row+.67-n*.42)*grid);
      const angle=n*Math.PI*2,u=dx*Math.cos(angle)+dy*Math.sin(angle),v=dy*Math.cos(angle)-dx*Math.sin(angle);
      const shape=style==="blossom"?Math.hypot(dx,dy)/(3.8+.60*Math.cos(Math.atan2(dy,dx)*5)):
        Math.abs(u)/(style==="needle"?6.7:5.8)+Math.abs(v)/(style==="needle"?2.5:4.35);
      if(shape>=best)continue;
      best=shape;tint=n;edge=u;
      vein=style==="blossom"?shape<.27:Math.abs(v)<.52||Math.abs(Math.abs(v)-Math.abs(u)*.36)<.29;
    }
    const grain=(hash(x,y,872)-.5)*11;
    if(best>1.11&&hash(x>>1,y>>1,463)>.40)return tone(base,-24,0);
    const shade=(.15+tint*.59)*(best>1?.48:1);
    const rgb=base.map((v,i)=>v+(light[i]-v)*shade);
    return tone(rgb,grain+(vein?style==="blossom"?27:12:0)+(best>.84?-16:edge<0?8:-5));
  }
  function coalPixel(x,y,hash){
    const grit=(hash(x,y,80)-.5)*16+(hash(x>>2,y>>2,918)-.5)*15;
    for(const [cx,cy,w,h,angle] of coalPieces){
      const dx=wrap(x-cx),dy=wrap(y-cy),u=(dx+dy*angle)/w,v=(dy-dx*angle)/h;
      const facet=Math.max(Math.abs(u),Math.abs(v),Math.abs(u*.71+v*.72)*1.08,Math.abs(u*.70-v*.61));
      if(facet>1)continue;
      const shine=v<-.48&&u>-.72&&facet<.92?34:Math.abs(v+u*.76)<.13?12:0;
      return tone([31,34,41],grit*.47+shine-(facet>.83?15:0)+(u<-.17?8:0));
    }
    return tone([100,104,103],grit+Math.sin(x*.41-y*.53)*8);
  }
  const distance=(x,y,[ax,ay,bx,by])=>{
    const u=bx-ax,v=by-ay,t=clamp(((x-ax)*u+(y-ay)*v)/(u*u+v*v),0,1);
    return Math.hypot(x-(ax+t*u),y-(ay+t*v));
  };
  const cracks=[[1,5,12,14],[12,14,21,10],[21,10,31,15],[12,14,7,26],[7,26,1,28],
    [12,14,20,23],[20,23,27,27],[20,23,18,31],[21,10,17,3]];
  const facets=[[5,5,11,19],[11,19,25,13],[25,13,29,26],[25,13,26,3],[11,19,6,27]];
  function pane(tile,x,y,grain){
    const edge=Math.min(x,y,31-x,31-y),clear=tile===tiles.plain,lead=tile===tiles.leaded,lab=tile===tiles.apparatus;
    const dx=x-15.5,dy=y-15.5,diamond=Math.abs(dx)+Math.abs(dy);
    const cross=lead&&(Math.abs(diamond-11.35)<.62||Math.abs(dx)<.58&&diamond>11||Math.abs(dy)<.58&&diamond>11);
    const frame=!lab&&edge<=(lead?2:1),rim=!lab&&edge===2;
    const bright=dx+dy>-12&&dx+dy<10&&Math.abs(x-y+8)<1.2||
      dx+dy>1&&dx+dy<16&&Math.abs(x-y-9)<.72;
    let [r,g,b]=swatch.get(tile),alpha=clear?23:lab?61:lead?81:71;
    if(lead&&diamond<11){
      r=dx*dy>0?111:167;g=dx*dy>0?184:205;b=dx*dy>0?210:223;
    }
    if(frame||cross){
      const shade=edge===1||cross&&dx<0?23:0;
      return lead?[46+shade,62+shade,72+shade,246]:
        [r*.61+shade,g*.62+shade,b*.66+shade,211];
    }
    if(rim){alpha+=54;r+=27;g+=25;b+=24}
    if(bright){alpha+=clear?39:37;r+=59;g+=53;b+=47}
    const wave=tile===tiles.amber?Math.sin(dx*.34+Math.sin(dy*.51)*1.7)*9:Math.cos(dx*.38+dy*.25)*5;
    return [r+grain+wave,g+grain+wave,b+grain+wave,alpha];
  }
  function ice(tile,x,y,grain,hash){
    const isBlue=tile===tiles.blueIce,side=tile===tiles.iceSide;
    const line=Math.min(...cracks.map(s=>distance(x,y,s)));
    const facet=Math.min(...facets.map(s=>distance(x,y,s)));
    const bands=side?Math.sin(y*1.19+x*.17+Math.sin(x*.54))*10:0;
    const frost=side&&(y<4+Math.cos(x*.42)*2||y>24)&&hash(x>>1,y>>1,527)>.36;
    const bubble=hash(x>>2,y>>2,2191)>.78&&Math.hypot(x%4-1.7,y%4-1.3)<1.43;
    let shade=grain+bands+Math.sin(x*.22-y*.19)*10,alpha=isBlue?186:side?132:109;
    if(line<.62){shade+=54;alpha+=72}
    else if(line<1.58){shade-=10;alpha+=23}
    if(facet<.75){shade+=19;alpha+=18}
    if(bubble){shade+=39;alpha+=25}
    if(frost){shade+=32;alpha+=43}
    return [...swatch.get(tile).map((value,i)=>value+shade*(i===2?.68:1)),clamp(alpha,36,245)];
  }
  function fracturedRock(tile,x,y,hash){
    const magma=tile===tiles.magma,columns=magma?4:8,cell=32/columns;
    const u=x+(magma?Math.sin(y*Math.PI/8)*1.4:Math.sin(y*Math.PI/16)*2.3),v=y+Math.sin(x*Math.PI/8)*(magma?.89:1.8);
    let near=Infinity,next=Infinity,variation=0;
    const wrap=n=>(n%columns+columns)%columns;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      const i=Math.floor(u/cell)+dx,j=Math.floor(v/cell)+dy,wx=wrap(i),wy=wrap(j);
      const ox=(i+.24+hash(wx,wy,tile)*.55)*cell,oy=(j+.24+hash(wy,wx,tile+111)*.55)*cell;
      const d=Math.hypot(u-ox,(v-oy)*(magma?1:1.38));
      if(d<near){next=near;near=d;variation=hash(wx,wy,tile+51)}
      else if(d<next)next=d;
    }
    const crack=next-near,grit=(hash(x,y,tile+83)-.5)*17;
    const strata=Math.sin((y+x*.5)*Math.PI/4+Math.sin(x*Math.PI/8)*.63);
    if(magma){
      const fracture=hash((x>>2),(y>>2),tile+51);
      if(crack<.54&&fracture>.17)return tone(fracture>.74?[237,120,43]:[182,72,28],grit);
      if(crack<1.40)return tone([91,46,35],grit+strata*9);
      const vesicle=hash(x,y,tile+31)>.91&&crack>3;
      return tone([68,50,49],grit+variation*26+strata*6-(vesicle?26:0));
    }
    const mineral=hash(x,y,tile+9)>.92;
    const ridge=crack<.67?(strata>.18?17:-19):0;
    return tone(variation>.74?[78,78,83]:variation<.25?[41,44,53]:[57,61,70],
      grit+strata*9+ridge+(mineral?21:0));
  }
  function paint(tile,x,y,hash){
    if(tile===tiles.magma||tile===tiles.bedrock)return fracturedRock(tile,x,y,hash);
    if(tile===tiles.linen||tile===tiles.blanket){
      const fold=tile===tiles.blanket&&y%16===1?-18:0;
      return tone(swatch.get(tile),(hash(x,y,tile)-.5)*8+(x%2?3:-3)+(y%2?3:-3)+fold);
    }
    const tree=treeTiles.get(tile);
    if(tree){
      if(tree.style==="coal")return coalPixel(x,y,hash);
      return tree.light?crownPixel(tree,x,y,hash):woodPixel(tree,x,y,hash);
    }
    const base=swatch.get(tile);
    if(!base)return null;
    const grain=(hash(x,y,tile)-.5)*(tile===tiles.pigment?9:15);
    if(tile<=tiles.apparatus)return pane(tile,x,y,grain);
    if(tile<=tiles.blueIce)return ice(tile,x,y,grain,hash);
    if(tile<=tiles.hoarfrost){
      const side=tile===tiles.frostSide,white=tile===tiles.hoarfrost;
      const line=7+Math.sin(x*.32)*2+Math.sin(x*.79)*1.8;
      const clusters=hash(x>>2,y>>2,tile+160),snow=white||side&&y<line||!side&&clusters>.35,
        iceCrystal=Math.min(...facets.map(s=>distance(x,y,s)))<.72&&clusters>.34;
      const colors=snow?[198,218,223]:side?[88,78,66]:[104,108,110];
      const shade=grain+(snow?clusters*22:clusters*24)+(iceCrystal?21:0);
      return [...colors.map((v,i)=>v+shade*(i===2?.66:1)),255];
    }
    if(tile===tiles.basaltGlass){
      const grainLarge=hash(x>>2,y>>2,601);
      const reflection=Math.abs(Math.sin(x*.28+y*.31+Math.sin(x*.215)*.32));
      const tint=reflection>.983?38:reflection>.87?12:grainLarge*22-13;
      return [base[0]+grain+tint,base[1]+grain+tint,base[2]+grain+tint,255];
    }
    if(tile===tiles.leaf){
      const center=15.5+Math.sin(y*.18)*1.08,side=Math.abs(x-center);
      const rib=Math.abs(Math.sin((y-side*.78)*Math.PI/5));
      const cell=(hash(x>>2,y>>2,610)-.5)*14;
      return tone(base,grain+cell+(side<1.1?27:rib>.92?13:0)-side*.82+(x<center?7:-3));
    }
    return [...base.map(v=>v+grain),255];
  }
  return {tiles,color,transparentTiles,configure,paint};
})();

