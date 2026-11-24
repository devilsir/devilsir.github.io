
"use strict";

globalThis.QuimiCraftNPCLooks=(()=>{
  const palettes={
    field:[0x6d8656,0xb66c43,0x858149,0x477b83,0xa68052],
    forest:[0x537758,0x795647,0x496956,0x876d39,0x6a5a76],
    snow:[0x436379,0x76668c,0xb16b48,0x617b8f,0x83605c],
    coast:[0x3d8387,0xc78152,0x6e8da9,0x875773,0x7d915c],
    dry:[0x9c6940,0x85764f,0x6f8279,0xc8825b,0x8b5b64],
    volcanic:[0x6a5362,0x995e49,0x5b7070,0xa3794e,0x746176]
  };
  const bodies=[[.87,1.0,.89],[.99,1,1],[1.14,.98,1.08],[1.25,.94,1.16],[.94,1.075,.97]];
  const faces=[[.92,1.04,1.03],[1.08,.96,.96],[.98,1.08,1.12],[1.05,1.01,1.03],[.94,.94,1.01]];
  function hash(seed,value){
    let n=(2166136261^seed)>>>0;
    for(const c of String(value))n=Math.imul(n^c.charCodeAt(0),16777619);
    return n>>>0;
  }
  function describe(seed,id,opts={}){
    const marker=hash(seed,id);
    let state=marker;
    const next=()=>{
      state=(Math.imul(state,1664525)+1013904223)>>>0;
      return state/4294967296;
    };
    const choose=list=>list[Math.floor(next()*list.length)];
    let [width,height,depth]=choose(bodies);
    const [faceW,faceH,faceD]=choose(faces);
    const child=opts.age==="child";
    if(child){width*=.94;depth*=.94}
    const tone=choose(palettes[opts.culture]||palettes.field);
    const coat=opts.uniform?opts.color:tone;
    const attire=child?choose(["hoodie","overalls","vest"]):opts.uniform?"uniform":
      opts.culture==="snow"?choose(["coat","coat","vest"]):opts.culture==="dry"?choose(["tunic","scarf","vest"]):
      choose(["vest","overalls","tunic","coat","scarf"]);
    const scale=opts.scale??(child?.59+next()*.10:.88+next()*.21);
    return {marker,child,scale,width,height,depth,coat,attire,faceW:faceW*(child?1.03:1),faceH:faceH*(child?1.04:1),faceD,
      eye:choose([0x4d3028,0x98642d,0x476953,0x435888,0x594826]),spacing:1+(next()-.5)*.19,
      nose:.79+next()*.42,hair:choose(["crop","parted","curls","braid","bob","bun","waves","shaved"]),
      brows:(next()-.5)*.32,beard:!child&&!opts.uniform&&next()<.22?choose(["stubble","short","goatee"]):"",
      freckles:next()<.38,shoe:choose([0x443330,0x5b4335,0x3c5055,0x4d455f]),detail:next()};
  }
  function create(T,paint,beam){
    const material=new Map();
    function mat(color){
      if(!material.has(color))material.set(color,new T.MeshLambertMaterial({color}));
      return material.get(color);
    }
    const box=(parent,color,xyz,size,rotation)=>paint(parent,mat(color),xyz,size,rotation);
    function hair(head,p,hair,cap){
      if(p.hair==="shaved")return;
      const crown=cap?.257:.236,side=p.marker%2===0?-1:1;
      paint(head,hair,[0,crown,.024],[.454,cap?.071:.106,.453]);
      for(let i=0;i<4;i++){
        const x=(i-1.5)*.104;
        const bang=p.hair==="parted"||p.hair==="waves"||p.hair==="bob";
        if(p.hair==="curls"){
          paint(head,hair,[x,crown+.045,-.091-Math.abs(x)*.41],[.12,.103,.20],[.18,0,x*.7]);
        }else if(bang)paint(head,hair,[x,.206-Math.abs(x)*.12,-.207],[.12,.076+i*.016,.07],[0,0,side*.26]);
      }
      if(p.hair==="bob"||p.hair==="braid"||p.hair==="waves")for(const sx of [-1,1]){
        paint(head,hair,[sx*.201,.023,.083],[.085,.322,.324],[.14,0,sx*.053]);
      }
      if((p.hair==="braid"||p.hair==="bun")&&!cap){
        paint(head,hair,[side*.139,.162,.253],[.16,.158,.131]);
        if(p.hair==="braid")for(let i=0;i<4;i++){
          paint(head,hair,[side*(.171+i*.019),.100-i*.087,.262+i*.019],[.095-i*.01,.101,.098],[.12,0,side*-.19]);
        }
      }
    }
    function face(head,p,skin,tone,hairMat,brightEye,{cap=false,hideHair=false}={}){
      head.scale.set(p.faceW,p.faceH,p.faceD);
      paint(head,skin,[0,0,0],[.423,.434,.426]);
      paint(head,tone,[0,-.176,-.055],[.327,.131,.327],[.05,0,0]);
      for(const side of [-1,1]){
        const x=side*.096*p.spacing;
        paint(head,tone,[side*.225,-.012,.017],[.065,.12,.106],[0,0,side*.13]);
        brightEye(head,x,.05,-.218,p.child?.061:.051,mat(p.eye));
        paint(head,hairMat,[x,.119,-.223],[.092,.023,.018],[0,0,side*p.brows]);
        if(p.child){
          const blush=tone.color.clone().lerp(new T.Color(0xc16f6b),.38);
          box(head,blush.getHex(),[side*.141,-.059,-.215],[.072,.029,.022],[0,0,side*.12]);
        }
        if(p.freckles)for(let i=0;i<3;i++)box(head,0x885e47,[side*(.073+i*.026),-.039+(i%2)*.014,-.218],[.010,.010,.012]);
      }
      paint(head,tone,[0,-.018,-.223],[.068*p.nose,p.child?.065:.087,.057*p.nose]);
      paint(head,skin,[0,-.117,-.225],[.121,.038,.026]);
      box(head,0x67433d,[0,-.117,-.243],[p.child?.077:.107,.013,.011],[0,0,(p.detail-.5)*.17]);
      if(p.beard)paint(head,hairMat,[0,-.161,-.183],[p.beard==="goatee"?.122:.291,p.beard==="stubble"?.061:.108,.113]);
      if(!hideHair)hair(head,p,hairMat,cap);
    }
    function dress(group,rig,p,cloth,accent,accessory){
      if(p.attire==="uniform")return;
      const contrast=new T.Color(p.coat).offsetHSL(.033,.11,p.detail>.5?.13:-.12);
      const panel=mat(contrast.getHex()),strap=mat(p.detail>.48?0x82533d:0x454a55);
      if(p.attire==="overalls"){
        paint(group,panel,[0,1.027,-.179],[.38,.36,.054]);
        for(const side of [-1,1]){
          beam(group,strap,[side*.15,1.012,-.218],[side*.19,1.452,-.181],.051,.025);
          paint(group,accent,[side*.14,1.116,-.219],[.053,.058,.028]);
        }
      }else if(p.attire==="scarf"||p.attire==="hoodie"){
        paint(group,accent,[0,1.47,0],[.456,.136,.396]);
        paint(group,panel,[p.detail>.5?.125:-.125,1.267,-.183],[.124,.32,.042],[0,0,p.detail>.5?.18:-.18]);
        if(p.attire==="hoodie")paint(group,panel,[0,1.433,.207],[.354,.248,.142]);
      }else{
        paint(group,panel,[0,.925,-.172],[.502,.14,.039]);
        for(const side of [-1,1]){
          paint(group,panel,[side*.166,1.191,-.177],[.194,.461,.045],[0,0,side*.035]);
          const pockets=p.attire==="vest"||p.attire==="coat";
          if(pockets)paint(group,accent,[side*.157,1.029,-.196],[.116,.075,.025]);
        }
      }
      if(p.child){
        paint(group,panel,[0,1.135,.239],[.395,.43,.187]);
        paint(group,accent,[0,1.234,.335],[.29,.152,.038]);
      }else if(accessory!=="book"&&p.detail>.55)paint(group,strap,[.225,.835,.132],[.159,.185,.192]);
      for(const leg of rig.legs){
        const foot=leg.userData.lower?.children.at(-1);
        if(foot)foot.material=mat(p.shoe);
      }
    }
    return {face,dress};
  }
  return {describe,create};
})();

