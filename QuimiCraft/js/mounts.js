
"use strict";

globalThis.QuimiCraftMounts=(()=>{
  const treeBody={height:8.7,width:1.45,seat:5.75,groundSpeed:6.1,climbSpeed:3.7};
  const guard=(hp,walk,run,sense,damage,loot,color,secondary)=>({
    hp,walk,run,sense,temperament:"hostile",roam:12,loot,color,secondary,
    strike:{kind:"slam",damage,range:2.45,windup:.64,cooldown:2.12}
  });
  const trees={
    living_tree:{name:"Guardião de Casca",aspect:"oak",bark:0x574135,inner:0x967250,leaves:0x567341,lit:0xb8da78,line:"O bosque nos acolhe. Com um pouco de mel, posso te levar pelas encostas."},
    living_tree_warden:{name:"Vigia do Musgo",aspect:"moss",bark:0x414b3a,inner:0x827f56,leaves:0x3e7458,lit:0x94dfac,line:"Caminhe entre as raízes. Se ferirem uma árvore aqui, todas ouviremos."},
    living_tree_elder:{name:"Anciã da Copa",aspect:"elder",bark:0x504047,inner:0xa3755a,leaves:0x88664e,lit:0xffc87a,
      hp:390,scale:[1.14,1.16,1.12],duty:"Liderança",line:"Já ouvi as montanhas crescerem. Segure firme quando subirmos pela parede."},
    living_tree_pine:{name:"Arvoroso Pinheiro",aspect:"pine",bark:0x574238,inner:0x8b7459,leaves:0x336d58,lit:0x9affdd,
      habitat:"Taiga e florestas frias",line:"Minha copa agarra a neve. Minhas raízes aguentam a subida."},
    living_tree_cherry:{name:"Arvorosa Cerejeira",aspect:"cherry",bark:0x663a46,inner:0xb48378,leaves:0x93685e,lit:0xffb2d5,
      habitat:"Bosques de cerejeiras e lilases",line:"O vento leva as pétalas. Vamos ver onde elas caem?"},
    living_tree_willow:{name:"Arvoroso Salgueiro",aspect:"willow",bark:0x625b42,inner:0xa08b62,leaves:0x638b43,lit:0xd8f880,
      habitat:"Matas úmidas e margens",line:"Minhas folhas tocam a água quando descanso."},
    living_tree_mangrove:{name:"Arvoroso do Mangue",aspect:"mangrove",bark:0x584645,inner:0x8d6955,leaves:0x486e43,lit:0xa9f695,
      habitat:"Manguezais e deltas",line:"O barro não me prende. Minhas raízes sabem por onde passar."},
    living_tree_sapling:{name:"Broto das Copas",aspect:"sapling",bark:0x7e512c,inner:0xc2925c,leaves:0x75a948,lit:0xf1e398,
      hp:65,scale:[.68,.47,.66],mountable:false,duty:"Viveiros",habitat:"Viveiros e oficinas da aldeia",
      line:"Estou aprendendo a cuidar das sementes que chegam da mata.",story:"Os Brotos das Copas passam os primeiros ciclos aprendendo a cultivar outras plantas.",
      curiosity:"Entrenós curtos mantêm os ramos compactos nas primeiras fases de crescimento."},
    living_tree_amber:{name:"Couraçado de Âmbar",aspect:"amber",bark:0x66503a,inner:0xc68640,leaves:0x5d633c,lit:0xffb731,
      hp:255,scale:[1.25,.89,1.17],duty:"Prensa de seiva",habitat:"Oficinas e portões da aldeia",
      line:"Levo resina à prensa. Deixe as placas do meu ombro endurecerem ao sol.",story:"Os Couraçados endurecem a seiva que escorre sobre a pele para revestir os ombros.",
      curiosity:"Canais largos de resina abastecem as placas que engrossam depois de cada rachadura."},
    living_tree_bloom:{name:"Tecelã de Ipê",aspect:"bloom",bark:0x604637,inner:0xa48a61,leaves:0xb0933a,lit:0xffda66,
      hp:123,scale:[.76,.80,.74],duty:"Tecelagem",habitat:"Alojamentos das Copas e clareiras ensolaradas",
      line:"As pétalas que caem hoje vão tingir a lã da próxima colheita.",story:"As Tecelãs colhem as próprias flores caídas para tingir mantas e roupas.",
      curiosity:"As gemas florais se abrem em ondas, deixando alguns ramos floridos por várias semanas."},
    living_tree_fig:{name:"Figueira de Raízes Aéreas",aspect:"fig",bark:0x514539,inner:0xa68b63,leaves:0x44785a,lit:0xa9ebac,
      hp:210,scale:[1.32,1.03,1.22],duty:"Guarda dos caminhos",habitat:"Entradas e bosques úmidos",
      line:"Seguro as pontes quando o rio sobe. Cada raiz sabe onde buscar apoio.",story:"As Figueiras sustentam as primeiras travessias do Conselho com raízes que crescem a partir da copa.",
      curiosity:"Ramos pendentes podem enraizar depois de tocar solo úmido e formar escoras adicionais."}
  };
  const denWarden=(name,aspect,hp,damage,item,color,secondary,alloy)=>({
    name,aspect,territory:"den",alloy,...guard(hp,1.17,3.52,11,damage,[[item,1,2]],color,secondary)
  });
  const wardens={
    den_sentinel:{name:"Vigia de Basalto",aspect:"basalt",territory:"den",...guard(42,1.23,3.48,10,9,[["crystal_shard",1,2]],0x534955,0xe78d68)},
    sapphire_sentinel:denWarden("Vigia de Safira","gem",61,12,"SAPPHIRE_ORE",0x34476c,0x76ceff),
    ruby_sentinel:denWarden("Vigia de Rubi","gem",66,14,"RUBY_ORE",0x583043,0xff5273),
    emerald_sentinel:denWarden("Vigia de Esmeralda","gem",58,11,"EMERALD_ORE",0x284f48,0x70f5a3),
    opal_sentinel:denWarden("Vigia de Opala","gem",62,13,"OPAL_ORE",0x48625f,0xf2b8ff),
    amethyst_sentinel:denWarden("Vigia de Ametista","gem",72,14,"AMETHYST",0x4f395f,0xc28fff),
    silver_sentinel:denWarden("Vigia de Prata","metal",69,13,"silver_ingot",0x809daf,0x8ffbf4,0xd0e6ec),
    gold_sentinel:denWarden("Vigia de Ouro","metal",76,15,"gold_nugget",0xa6703c,0xffed99,0xf1bb64),
    dune_sentinel:{name:"Sentinela das Dunas",aspect:"dune",territory:"temple",...guard(49,1.34,3.64,11,11,[["gold_nugget",1,2]],0xb48a53,0xf0c67b)},
    lab_sentinel:{name:"Autômato de Contenção",aspect:"lab",territory:"lab",...guard(59,1.22,3.8,12,12,[["copper_ingot",1,2]],0x42636b,0x83e4cb)}
  };
  const treeStrike={kind:"slam",damage:19,range:4.2,windup:.76,cooldown:2.65,vertical:4.5};
  function treeDimensions(tree){
    const [x,y,z]=tree.scale??[1,1,1];
    return {radius:treeBody.width*Math.max(x,z),height:treeBody.height*y,seat:treeBody.seat*y};
  }
  function treeProfile(tree){
    const compact=tree.aspect==="sapling",elder=tree.aspect==="elder",armored=tree.aspect==="amber";
    const strike={...treeStrike,range:compact?2.65:armored||elder?4.85:treeStrike.range,
      damage:compact?9:elder?34:armored?27:treeStrike.damage,vertical:compact?2.4:treeStrike.vertical};
    return {hp:tree.hp??155,walk:compact?1.48:1.71,run:armored?3.4:4.05,sense:22,temperament:"neutral",roam:12,
      strike,loot:elder?[["canopy_sigil",1,1],["honey",4,8]]:armored?[["charcoal",1,2,.45],["honey",1,2,.5]]:[]};
  }
  const meat=["raw_beef","raw_venison","raw_mutton","raw_pork","raw_chicken","raw_rabbit","raw_game"];
  function diet(type,isDragon){
    if(trees[type])return trees[type].mountable===false?null:{food:["honey"],required:1};
    if(type==="nature_dragon"||type==="emerald_drake"||type==="aspect_dream")return {food:["honey","berries","apple"],required:3};
    return isDragon?{food:meat,required:3}:null;
  }
  function riderVector(yaw,forward,side){
    const length=Math.max(1,Math.hypot(forward,side)),sin=Math.sin(yaw),cos=Math.cos(yaw);
    return {x:(-sin*forward+cos*side)/length,z:(-cos*forward-sin*side)/length};
  }
  function motion(actor,dt,input,{clear,ground,ceiling,kind,speed}){
    const {x,z}=riderVector(input.yaw,input.throttle,input.side);
    const fromX=actor.x,fromZ=actor.z;
    const dx=x*speed*dt,dz=z*speed*dt;
    const dragon=kind==="dragon";
    actor.climbing=false;
    const support=ground(actor,actor.x,actor.z,actor.y+.13,actor.y-.5);
    actor.onGround=support!=null&&Math.abs(actor.y-support)<.13;
    if(dragon){
      const lift=Number(input.up)-Number(input.down);
      const glide=!lift&&actor.onGround?0:lift*(lift>0?5.55:5.1);
      let altitude=Math.min(ceiling,Math.max(1,actor.y+glide*dt));
      if(lift<0){
        const floor=ground(actor,actor.x,actor.z,actor.y+.10,altitude-.08);
        if(floor!=null&&floor>=altitude-.03)altitude=floor;
      }
      if(clear(actor,actor.x,altitude,actor.z))actor.y=altitude;
    }
    if(Math.abs(dx)+Math.abs(dz)>1e-5){
      const nx=actor.x+dx,nz=actor.z+dz;
      if(clear(actor,nx,actor.y,nz))Object.assign(actor,{x:nx,z:nz});
      else if(!dragon&&input.up&&clear(actor,actor.x,actor.y+treeBody.climbSpeed*dt,actor.z)){
        actor.y+=treeBody.climbSpeed*dt;actor.climbing=true;actor.vy=0;
        if(clear(actor,nx,actor.y,nz))Object.assign(actor,{x:nx,z:nz});
      }else if(!dragon&&actor.onGround&&clear(actor,nx,actor.y+1.025,nz)){
        const floor=ground(actor,nx,nz,actor.y+1.04,actor.y+.25);
        if(floor!=null&&clear(actor,nx,floor,nz))Object.assign(actor,{x:nx,y:floor,z:nz});
      }else{
        if(clear(actor,nx,actor.y,actor.z))actor.x=nx;
        if(clear(actor,actor.x,actor.y,nz))actor.z=nz;
      }
    }
    if(!dragon&&!actor.climbing){
      actor.vy=Math.max(-12,(actor.vy||0)-16*dt);
      const next=actor.y+actor.vy*dt;
      const floor=ground(actor,actor.x,actor.z,actor.y+.12,next-.08);
      if(floor!=null&&floor>=next-.03){actor.y=floor;actor.vy=0}
      else if(clear(actor,actor.x,next,actor.z))actor.y=next;
    }
    const floor=ground(actor,actor.x,actor.z,actor.y+.14,actor.y-.55);
    actor.onGround=floor!=null&&Math.abs(actor.y-floor)<.14;
    return {dx:actor.x-fromX,dz:actor.z-fromZ};
  }
  return {trees,wardens,treeBody,treeProfile,treeDimensions,treeStrike,diet,motion};
})();

