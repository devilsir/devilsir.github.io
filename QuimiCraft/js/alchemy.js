"use strict";

globalThis.QuimiCraftAlchemy = (() => {
  const potion = (name, color, effect, seconds, study, ingredients, help) => ({name,color,effect,seconds,study,ingredients,help});
  const potions = {
    potion_ember:potion("Brasa de Bolso","#fca262","warmth",65,"thermal",[["sulfur",1]],"Ajuda o personagem a manter a temperatura em regiões frias."),
    potion_mend:potion("Âmbar Restaurador","#f2789c","heal",8,"pigment",[["honey",1]],"Recupera até 32 pontos de vida ao longo de 8 segundos."),
    potion_lantern:potion("Gota de Lucerna","#f4df83","light",75,"cell",[["glow_solution",1]],"Ilumina o caminho com uma luz que acompanha o personagem."),
    potion_mist:potion("Névoa de Fuga","#c4baf5","mist",12,"crystal",[["sodium_chloride",1]],"Arremesse o frasco para reduzir temporariamente a percepção das criaturas hostis."),
    potion_gills:potion("Sopro do Delta","#62daca","air",50,"water",[["water",1]],"Mantém a reserva de ar debaixo d’água enquanto o efeito durar."),
    potion_survey:potion("Olho de Minério","#7dbaef","survey",45,"alloy",[["crystal_shard",1]],"Marca superfícies de minérios expostas nas proximidades."),
  };
  const specialties = {
    pigment:{title:"Estufa de Pigmentos",person:"Lia Vidral",color:"#ad67a5",skin:0x9c6148,hair:0x2d2024,accessory:"flowers",sample:"Extrato vegetal selado",studies:["pigment"],props:["ALCHEMY_VIAL_RACK","GARDEN_BOX","ALCHEMY_BALANCE"],talk:"Anote a cor e a faixa de pH. Uma medida ajuda a interpretar a outra.",scale:.94},
    crystal:{title:"Casa de Cristalização",person:"Nilo Salfer",color:"#d4a362",skin:0xbc815d,hair:0x46312d,accessory:"vials",sample:"Amostra de salmoura",studies:["crystal","yield"],props:["ALCHEMY_CRYSTAL_TRAY","ALCHEMY_BALANCE","ALCHEMY_VIAL_RACK"],talk:"Pese o soluto e acompanhe a água que se perde por evaporação. Quero saber de onde veio cada cristal.",scale:1},
    alloy:{title:"Forja das Ligas",person:"Brás da Liga",color:"#db8048",skin:0x704330,hair:0x262029,accessory:"apron",sample:"Amostra de cobre e estanho",studies:["alloy","cell"],props:["ALCHEMY_MOLD","ALCHEMY_CELL","ALCHEMY_BALANCE"],talk:"A balança resolve metade dos problemas da forja. Na outra bancada, preciso de um circuito que feche.",scale:1.07},
    water:{title:"Oficina das Águas",person:"Tami do Delta",color:"#4fbbad",skin:0x8f543a,hair:0x20232b,accessory:"goggles",sample:"Água turva e salobra",studies:["water"],props:["ALCHEMY_FILTER","ALCHEMY_STILL","ALCHEMY_VIAL_RACK"],talk:"A água do poço tem dois problemas. Olhe para o sedimento e para o que continua dissolvido depois da filtração.",scale:.96},
    thermal:{title:"Observatório Térmico",person:"Aya da Geada",color:"#80c4e5",skin:0xe0a988,hair:0x453954,accessory:"sash",sample:"Cápsulas térmicas de teste",studies:["thermal"],props:["ALCHEMY_CALORIMETER","ALCHEMY_BALANCE","ALCHEMY_VIAL_RACK"],talk:"Compare a temperatura final com a do controle. O termômetro vai mostrar a direção da troca de calor.",scale:.92},
  };
  const options = (...values) => values.map(value=>[value,value]);
  const select = (label, ...values) => ({label,options:options(...values),value:values[0]});
  const slider = (label,min,max,value,step=1) => ({label,min,max,value,step});
  const number = (v, digits=1) => Number(v.toFixed(digits));
  const stageOptions = ["Nenhum","Decantar","Filtrar","Destilar"];
  const studies = {
    water:{
      specialty:"water",title:"O Poço da Vila",objective:"Reduza o sedimento e o sal. Recupere pelo menos 80 g de água no destilado.",
      controls:[select("Primeira etapa",...stageOptions),select("Segunda etapa",...stageOptions)],
      reward:[["distilled_water",2],["potion_gills",1]],procedure:"Separação de misturas",
      test([first,second]){
        let water=100,salt=10,sediment=5,brine=0,residue=0,lostWater=0,distillate=0;
        for(const step of [first,second]){
          if(step==="Decantar"){residue+=sediment*.8;sediment*=.2}
          if(step==="Filtrar"){residue+=sediment;sediment=0}
          if(step==="Destilar"){
            distillate=water*.92;
            lostWater+=water-distillate;
            brine+=salt;residue+=sediment;
            water=distillate;salt=0;sediment=0;
          }
        }
        const treated=first==="Filtrar"&&second==="Destilar" || first==="Decantar"&&second==="Destilar";
        return {ok:treated&&distillate>=80,metrics:[["Água recuperada",number(water)+" g"],["Sal na amostra",number(salt)+" g"],["Sedimento na amostra",number(sediment)+" g"],["Sal retido no balão",number(brine)+" g"],["Sedimento separado",number(residue)+" g"],["Água retida no balão",number(lostWater)+" g"]],
          conclusion:treated?"A primeira etapa separou partículas. Na destilação, a água condensou em outro recipiente. Os sais ficaram no balão.":"A filtração clarifica a água, mas os íons dissolvidos passam pelo filtro. Remova o sedimento antes de destilar."};
      },
    },
    pigment:{
      specialty:"pigment",title:"As Cores da Estufa",objective:"Use o indicador para ajustar a amostra ácida para uma faixa entre pH 6 e 8.",
      controls:[slider("Volume de base adicionada (mL)",0,20,3,.5),select("Indicador","Extrato de antocianinas","Amostra sem indicador")],
      reward:[["indicator",2],["potion_mend",1]],procedure:"Indicadores e neutralização",
      test([base,indicator]){
        const excess=(10-base)*.01/(10+base);
        const ph=excess===0?7:excess>0?-Math.log10(excess):14+Math.log10(-excess);
        const color=indicator==="Extrato de antocianinas"?(ph<6?"Rosa · ácida":ph<=8?"Violeta · aproximadamente neutra":"Azul esverdeado · básica"):"Sem mudança de cor observável";
        return {ok:ph>=6&&ph<=8&&indicator==="Extrato de antocianinas",color:indicator==="Extrato de antocianinas"?(ph<6?"#f28ba8":ph<=8?"#bd9bed":"#69c8ca"):null,
          metrics:[["pH calculado",number(ph,2)],["Cor indicativa",color],["Volume final",number(10+base)+" mL"]],
          conclusion:ph<6?"Ainda há ácido em excesso. Adicione um pouco mais de base e compare.":ph>8?"Há base em excesso. Use um volume menor na próxima tentativa.":"As quantidades de ácido e base fortes se igualaram no modelo. O indicador revela uma faixa de pH."};
      },
    },
    crystal:{
      specialty:"crystal",title:"Cristais da Salina",objective:"Recupere pelo menos 8 g de cristais e preserve ao menos 25 g de água no recipiente.",
      controls:[slider("Água adicionada (g)",0,60,10,5),slider("Água evaporada (g)",0,65,20,5),slider("Temperatura final (°C)",10,80,55,5)],
      reward:[["sodium_chloride",3],["potion_mist",1]],procedure:"Saturação e cristalização",
      test([added,evaporated,temp]){
        const water=80+added-evaporated,limit=.28+.001*temp;
        const dissolved=Math.min(28,water*limit),crystals=28-dissolved;
        return {ok:crystals>=8&&water>=25,metrics:[["Água restante",water+" g"],["Soluto dissolvido",number(dissolved)+" g"],["Cristais recuperados",number(crystals)+" g"],["Limite do soluto-modelo",number(limit*100)+" g / 100 g de água"]],
          conclusion:crystals>0?"A quantidade de soluto ultrapassou o limite de solubilidade. O excesso aparece como cristais.":"A solução ainda comporta todo o soluto. Evapore mais água, dilua para comparar ou reduza a temperatura."};
      },
    },
    yield:{
      specialty:"crystal",title:"O Lote que Rendeu Menos",objective:"Produza ao menos 7,5 mmol de produto coletado. Use no máximo 6 mmol de HCl em excesso.",
      controls:[slider("Carbonato de cálcio (mmol)",2,14,10),slider("Ácido do modelo (mmol)",2,36,9),slider("Eficiência da coleta (%)",50,100,70,5)],
      reward:[["ph_kit",1],["gold_nugget",2]],procedure:"Reagente limitante e rendimento",
      test([carbonate,acid,efficiency]){
        const theoretical=Math.min(carbonate,acid/2),actual=theoretical*efficiency/100;
        const leftoverAcid=acid-theoretical*2,leftoverCarbonate=carbonate-theoretical;
        return {ok:actual>=7.5&&leftoverAcid<=6,metrics:[["Equação do modelo","CaCO₃ + 2 HCl → CaCl₂ + CO₂ + H₂O"],["Limitante",leftoverAcid>0?"Carbonato":leftoverCarbonate>0?"Ácido":"Proporção estequiométrica"],["CaCl₂ teórico",number(theoretical)+" mmol"],["CaCl₂ coletado",number(actual)+" mmol"],["CaCl₂ no resíduo",number(theoretical-actual)+" mmol"],["Reagentes em excesso",number(leftoverCarbonate)+" mmol CaCO₃ · "+number(leftoverAcid)+" mmol HCl"],["Massa dos reagentes",number(carbonate*100.09+acid*36.46,2)+" mg"]],
          conclusion:"Cada quantidade de carbonato demanda o dobro de HCl em mol. Parte do produto ficou no resíduo da coleta. O CO₂ liberado também entra no balanço de massa."};
      },
    },
    alloy:{
      specialty:"alloy",title:"A Liga da Ponte",objective:"Faça uma liga de 8–16% de estanho em massa, com o molde aquecido na faixa de trabalho do jogo.",
      controls:[slider("Estanho em 100 g de liga (g)",0,30,4),slider("Aquecimento da forja (unidades do jogo)",0,100,45,5)],
      reward:[["bronze_ingot",2],["potion_survey",1]],procedure:"Composição e propriedades dos materiais",
      test([tin,heat]){
        const melted=heat>=65&&heat<=90,hardness=number(40+tin*1.8),ductility=number(85-tin*2.2);
        return {ok:melted&&tin>=8&&tin<=16,metrics:[["Cobre / estanho",(100-tin)+" g / "+tin+" g"],["Estado do lote",melted?"Liga moldada":"Aquecimento fora da faixa da forja"],["Índice de dureza do jogo",melted?hardness:"—"],["Índice de ductilidade do jogo",melted?ductility:"—"]],
          conclusion:melted?"Neste modelo, mais estanho aumenta a dureza e reduz a ductilidade. Compare ligas antes de escolher um material.":"O lote precisa da faixa de 65 a 90 unidades da estação para entrar no molde."};
      },
    },
    cell:{
      specialty:"alloy",title:"Luz no Ateliê",objective:"Monte uma pilha de zinco e cobre com ponte salina e feche o circuito da lâmpada.",
      controls:[select("Eletrodos","Cobre e cobre","Zinco e cobre"),select("Ponte entre as soluções","Ausente","Ponte salina"),select("Fio da lâmpada","Aberto","Fechado")],
      reward:[["voltaic_cell",1],["potion_lantern",1]],procedure:"Oxirredução e circuito elétrico",
      test([electrodes,bridge,circuit]){
        const potential=electrodes==="Zinco e cobre"?1.10:0;
        const powered=potential>0&&bridge==="Ponte salina"&&circuit==="Fechado";
        return {ok:powered,metrics:[["Potencial padrão do par",number(potential,2)+" V"],["Ponte iônica",bridge],["Lâmpada da bancada",powered?"Acesa":"Apagada"]],
          conclusion:powered?"O zinco é oxidado e os íons de cobre são reduzidos. Os elétrons passam pelo fio e os íons da ponte mantêm a neutralidade das soluções.":"Confira se há dois pares diferentes, um caminho para os íons e um circuito externo fechado."};
      },
    },
    thermal:{
      specialty:"thermal",title:"Calor para a Travessia",objective:"Selecione um processo exotérmico e obtenha temperatura pelo menos 4 °C acima do controle.",
      controls:[select("Cápsula do experimento","Controle","Processo que absorve calor","Processo que libera calor"),slider("Quantidade da cápsula (g)",5,20,10,5),select("Recipiente","Aberto","Isolado")],
      reward:[["potion_ember",2],["gold_nugget",1]],procedure:"Trocas de calor e controle experimental",
      test([capsule,mass,vessel]){
        const direction=capsule==="Controle"?0:capsule==="Processo que absorve calor"?-1:1;
        const delta=direction*mass*(vessel==="Isolado"?.48:.19);
        return {ok:delta>=4,metrics:[["Controle","20 °C"],["Temperatura final",number(20+delta)+" °C"],["Diferença",number(delta)+" °C"]],
          conclusion:delta>0?"O processo liberou calor para o entorno do sistema. O recipiente isolado reduziu a perda para o ambiente.":delta<0?"O processo absorveu calor do entorno, reduzindo a temperatura medida.":"Sem transformação na cápsula de controle, a temperatura do modelo permaneceu igual."};
      },
    },
  };
  const itemData = {
    ...Object.fromEntries(Object.entries(potions).map(([id,p])=>[id,[p.name,p.color]])),
    ...Object.fromEntries(Object.entries(specialties).map(([id,p])=>["alchemy_sample_"+id,[p.sample,p.color]])),
    potion_vial:["Frasco de alquimia","#a9c8d2"]
  };
  const sampleId = key => "alchemy_sample_"+key;

  function runStudy(id,input) {
    const study=studies[id];
    if(!study||!Array.isArray(input)||input.length!==study.controls.length)return null;
    const values=study.controls.map((control,i)=>{
      if(control.options)return control.options.some(([v])=>v===input[i])?input[i]:control.value;
      const parsed=Number(input[i]);
      return Number.isFinite(parsed)?Math.min(control.max,Math.max(control.min,control.min+Math.round((parsed-control.min)/control.step)*control.step)):control.value;
    });
    return {...study.test(values),values};
  }

  function createProgress({restore,exchange,count,observe,discover,save,sitePositions,legacyOrigin}) {
    const stored=restore?.version===1?restore:{};
    const state={version:1,visits:{...stored.visits},missions:{...stored.missions},trials:{...stored.trials},effects:{...stored.effects},expedition:{...stored.expedition},keepers:{...stored.keepers},sites:sitePositions,legacyOrigin};
    const snapshot=()=>JSON.parse(JSON.stringify(state));
    const persist=()=>save(snapshot());
    const missionStatus=id=>state.missions[id]||"available";
    const completed=id=>missionStatus(id)==="complete";
    const completedCount=()=>Object.keys(studies).filter(completed).length;
    const activeEffect=key=>Number.isFinite(state.effects[key])&&state.effects[key]>0;
    let consumeDelay=0;

    function visit(site) {
      if(state.visits[site.key])return;
      state.visits[site.key]=true;
      discover("shops","alchemy-"+site.key,{name:site.config.title,source:site.region,researchProgress:30,silent:true});
      persist();
    }
    function accept(id) {
      if(!studies[id]||missionStatus(id)!=="available")return false;
      state.missions[id]="active";
      persist();
      return true;
    }
    function collect(key) {
      if(!specialties[key])return {ok:false,message:"Amostra desconhecida."};
      if(count(sampleId(key)))return {ok:false,message:"Você já levou uma amostra deste tipo."};
      return exchange([],[[sampleId(key),1]]);
    }
    function experiment(id,inputs,hypothesis) {
      const study=studies[id];
      if(!study||!count(sampleId(study.specialty)))return {ok:false,message:"Pegue a amostra da oficina no posto de coleta."};
      const prediction=String(hypothesis??"").trim().slice(0,140);
      if(!prediction)return {ok:false,message:"Anote sua hipótese antes de iniciar."};
      const result=runStudy(id,inputs);
      if(!result)return {ok:false,message:"Confira as condições da bancada."};
      state.trials[id]=[...(state.trials[id]||[]).slice(-1),{...result,prediction}];
      if(result.ok&&missionStatus(id)==="active")state.missions[id]="ready";
      const procedure=study.controls.map((control,i)=>control.label+" = "+result.values[i]).join(", ");
      observe("Hipótese — "+prediction+". Procedimento — "+procedure+".", "alchemy");
      observe("Observação — "+result.metrics.map(([key,value])=>key+" = "+value).join(", ")+".", "alchemy");
      observe("Conclusão — "+result.conclusion, "alchemy");
      persist();
      return {ok:true,result};
    }
    function claim(id) {
      if(missionStatus(id)!=="ready")return {ok:false,message:"Conclua a investigação primeiro."};
      const study=studies[id];
      const result=exchange([[sampleId(study.specialty),1]],study.reward);
      if(!result.ok)return result;
      state.missions[id]="complete";
      persist();
      discover("missions","alchemy-"+id,{name:study.title,source:specialties[study.specialty].title,researchProgress:100});
      discover("experiments","alchemy-"+id,{name:study.procedure,source:specialties[study.specialty].title,note:study.objective,researchProgress:100});
      for(const [potionId,p] of Object.entries(potions))if(p.study===id)
        discover("recipes",potionId,{name:p.name,source:specialties[study.specialty].title,note:"Poção de efeito fictício. "+p.help,researchProgress:100});
      return {ok:true};
    }
    function formula(id) {
      const p=potions[id];
      const solvent=count("purified_water")||!count("distilled_water")?"purified_water":"distilled_water";
      return p&&[["potion_vial",1],[solvent,1],...p.ingredients];
    }
    function brew(id) {
      if(!potions[id]||!completed(potions[id].study))return {ok:false,message:"Conclua a missão secundária que ensina a receita."};
      return exchange(formula(id),[[id,1]]);
    }
    function use(id) {
      const p=potions[id];
      if(!p)return {ok:false};
      if(consumeDelay>0||activeEffect(p.effect))return {ok:false,message:"Espere o efeito atual antes de usar outro frasco."};
      const result=exchange([[id,1]],[["potion_vial",1]]);
      if(!result.ok)return result;
      consumeDelay=1.15;
      if(p.effect!=="mist")state.effects[p.effect]=p.seconds;
      persist();
      return {ok:true,potion:p};
    }
    function startEffect(effect,duration) {
      state.effects[effect]=duration;
      persist();
    }
    function tick(dt) {
      consumeDelay=Math.max(0,consumeDelay-dt);
      for(const key of Object.keys(state.effects)){
        state.effects[key]-=dt;
        if(state.effects[key]<=0)delete state.effects[key];
      }
    }
    function startExpedition() {
      if(completedCount()<3||state.expedition.status)return false;
      state.expedition={status:"active"};
      persist();
      return true;
    }
    function fieldTest(effect) {
      if(state.expedition.status!=="active"||state.expedition[effect]||!["air","warmth","survey"].includes(effect))return false;
      state.expedition[effect]=true;
      if(state.expedition.air&&state.expedition.warmth&&state.expedition.survey)state.expedition.status="ready";
      persist();
      return true;
    }
    function finishExpedition() {
      if(state.expedition.status!=="ready")return {ok:false,message:"Registre os três testes de campo."};
      const result=exchange([], [["gold_nugget",4],["crystal_shard",2]]);
      if(!result.ok)return result;
      state.expedition.status="complete";
      persist();
      discover("missions","alchemy-expedition",{name:"Expedição de Três Frascos",source:"Oficinas alquímicas",researchProgress:100});
      return {ok:true};
    }
    return {state,accept,activeEffect,brew,claim,collect,completedCount,experiment,fieldTest,finishExpedition,formula,missionStatus,persist,startEffect,startExpedition,tick,use,visit};
  }

  return {potions,specialties,studies,itemData,sampleId,runStudy,createProgress};
})();

