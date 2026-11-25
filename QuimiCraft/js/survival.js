(function(root){
  "use strict";

  const bufferArmor="buffer_armor",bufferSolution="buffer_solution";
  const gateMaterials=[
    ["WOOD","madeira",13,"#ae794a","PLANK","stick"],
    ["BAMBOO","bambu",58,"#9bad5d","BAMBOO","stick"],
    ["IRON","ferro",194,"#667983","iron_ingot","iron_ingot"]
  ];
  const headings=[[1,0],[0,1],[-1,0],[0,-1]];

  function register(blocks,defs){
    gateMaterials.forEach(([key,material,tex,icon],index)=>{
      const first=660+index*4;
      blocks["GATE_"+key]=first;
      for(let variant=0;variant<4;variant++){
        const open=variant>=2,axis=variant%2;
        defs[first+variant]={name:"Portão de "+material,solid:!open,barrier:!open,partial:true,hidden:variant!==0,
          detail:"gate",tex,icon,hard:key==="IRON"?1.6:.85,gate:{first,axis,open}};
      }
    });
    blocks.BED=680;
    for(let variant=0;variant<8;variant++){
      const head=variant>=4,heading=variant%4;
      defs[blocks.BED+variant]={name:"Cama",solid:true,partial:true,hidden:variant!==0,
        detail:"bed",tex:228,icon:"#a8374a",hard:.55,bed:{head,heading},collisionTop:.55};
    }
  }

  function recipes(blocks){
    return [
      ...gateMaterials.map(([key,material,,,stock,frame])=>({name:"Portão de "+material,desc:"Abre e fecha com E",
        need:stock===frame?[[frame,5]]:[[blocks[stock]??stock,3],[frame,2]],out:[blocks["GATE_"+key],1]})),
      {name:"Cama",desc:"Dorme até amanhecer e marca o ponto de retorno",
        need:[[blocks.PLANK,3],["wool",3]],out:[blocks.BED,1]}
    ];
  }

  function bedParts(blocks,{x,y,z},heading){
    const [dx,dz]=headings[heading];
    return [{x,y,z,id:blocks.BED+heading},
      {x:x+dx,y,z:z+dz,id:blocks.BED+heading+4}];
  }

  function bedAt(blocks,defs,read,{x,y,z,id}){
    const bed=defs[id]?.bed;
    if(!bed)return null;
    const [dx,dz]=headings[bed.heading];
    const parts=bedParts(blocks,{x:x-(bed.head?dx:0),y,z:z-(bed.head?dz:0)},bed.heading);
    return parts.every(part=>read(part.x,part.y,part.z)===part.id)?parts:null;
  }

  function gateBoxes({axis,open}){
    const boxes=[
      [.02,0,.39,.13,1.06,.22],[.85,0,.39,.13,1.06,.22],
      [.015,1.02,.375,.14,.06,.25],[.845,1.02,.375,.14,.06,.25]
    ];
    for(const y of [.36,.74]){
      if(open)boxes.push([.12,y,.48,.10,.115,.40],[.78,y,.48,.10,.115,.40]);
      else boxes.push([.145,y,.443,.71,.115,.114]);
    }
    if(open)boxes.push([.12,.36,.82,.10,.50,.08],[.78,.36,.82,.10,.50,.08]);
    else boxes.push([.27,.36,.435,.09,.49,.126],[.65,.36,.435,.09,.49,.126],[.47,.71,.407,.06,.15,.06,"metal"]);
    return axis?boxes.map(([x,y,z,w,h,d,material])=>[z,y,x,d,h,w,material]):boxes;
  }

  function bedBoxes({head,heading}){
    const boxes=[[.05,.15,head?0:.05,.9,.15,.95,"wood"],[.07,.30,head?0:.07,.86,.14,.93,"linen"],
      [.078,.40,head?0:.07,.844,.065,head?.40:.93,"blanket"]];
    for(const x of [.10,.77])boxes.push([x,0,head?.76:.11,.13,.16,.13,"wood"]);
    if(head){
      boxes.push([.045,.25,.90,.91,.30,.075,"wood"],[.16,.43,.54,.68,.10,.28,"linen"],
        [.10,.435,.37,.80,.032,.045,"linen"]);
    }else boxes.push([.095,.425,.11,.81,.041,.075,"blanket"]);
    return boxes.map(([x,y,z,w,h,d,material])=>[
      [z,y,x,d,h,w,material],[1-x-w,y,z,w,h,d,material],
      [1-z-d,y,1-x-w,d,h,w,material],[x,y,1-z-d,w,h,d,material]
    ][heading]);
  }

  function sleepIssue({night,storm,hostile}){
    if(!night&&!storm)return "Você só pode dormir à noite ou durante uma tempestade.";
    if(hostile)return "Há criaturas hostis perto demais para dormir.";
    return null;
  }

  function corrosionDamage(damage,charged){
    return damage*(charged?.25:1);
  }

  const api={bufferArmor,bufferSolution,headings,register,recipes,bedParts,bedAt,gateBoxes,bedBoxes,sleepIssue,corrosionDamage};
  root.QuimiCraftSurvival=api;
  if(typeof module==="object")module.exports=api;
})(globalThis);
