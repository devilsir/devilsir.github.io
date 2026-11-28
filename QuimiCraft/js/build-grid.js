"use strict";

globalThis.QuimiCraftBuildGrid=(()=>{
  const maxCells=512,maxSpan=24;
  const modes=[
    ["line","Linha"],["wall","Parede"],["floor","Piso"],
    ["volume","Volume"],["shell","Caixa vazada"],["ring","Anel"]
  ];
  const key=({x,y,z})=>x+"|"+y+"|"+z;

  function line(a,b,emit){
    const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,length=Math.max(Math.abs(dx),Math.abs(dy),Math.abs(dz));
    for(let i=0;i<=length;i++){
      const t=length?i/length:0;
      emit(a.x+Math.round(dx*t),a.y+Math.round(dy*t),a.z+Math.round(dz*t));
    }
  }

  function cells(a,b,{mode,mirror,repeats,axis,gap}){
    const axes=["x","y","z"],low={},high={};
    for(const dimension of axes){
      low[dimension]=Math.min(a[dimension],b[dimension]);
      high[dimension]=Math.max(a[dimension],b[dimension]);
      if(high[dimension]-low[dimension]>=maxSpan)return {issue:"Cada lado da seleção pode ter até "+maxSpan+" blocos."};
    }
    const base=[];
    const emit=(x,y,z)=>base.push({x,y,z});
    if(mode==="line")line(a,b,emit);
    else if(mode==="wall"){
      line({...a,y:0},{...b,y:0},(x,_,z)=>{
        for(let y=low.y;y<=high.y;y++)emit(x,y,z);
      });
    }else if(mode==="ring"){
      const cx=(low.x+high.x)/2,cz=(low.z+high.z)/2,rx=high.x-cx+.5,rz=high.z-cz+.5;
      const inside=(x,z)=>((x-cx)/rx)**2+((z-cz)/rz)**2<=1;
      for(let z=low.z;z<=high.z;z++)for(let x=low.x;x<=high.x;x++){
        if(inside(x,z)&&!(inside(x-1,z)&&inside(x+1,z)&&inside(x,z-1)&&inside(x,z+1)))emit(x,a.y,z);
      }
    }else{
      const from=mode==="floor"?a.y:low.y,to=mode==="floor"?a.y:high.y;
      for(let z=low.z;z<=high.z;z++)for(let y=from;y<=to;y++)for(let x=low.x;x<=high.x;x++){
        if(mode==="shell"&&x>low.x&&x<high.x&&y>from&&y<to&&z>low.z&&z<high.z)continue;
        emit(x,y,z);
        if(base.length>maxCells)return {issue:"Limite de "+maxCells+" blocos por construção."};
      }
    }

    const pattern=new Map();
    for(const cell of base){
      pattern.set(key(cell),cell);
      if(mirror==="x"||mirror==="z"){
        const reflected={...cell,[mirror]:2*a[mirror]-cell[mirror]};
        pattern.set(key(reflected),reflected);
      }
    }
    const step=Math.max(...[...pattern.values()].map(p=>p[axis]))-Math.min(...[...pattern.values()].map(p=>p[axis]))+1+gap;
    const result=new Map(pattern);
    for(let i=1;i<repeats;i++)for(const cell of pattern.values()){
      const copy={...cell,[axis]:cell[axis]+i*step};
      result.set(key(copy),copy);
    }
    if(result.size>maxCells)return {issue:"Limite de "+maxCells+" blocos por construção."};
    return {cells:[...result.values()]};
  }

  function create({THREE,scene,document,blockId,blockName,canUse,target,inspect,stock,apply,openAllowed,onMenu,notify}){
    const $=id=>document.getElementById(id);
    const modal=$("gridBuildModal"),status=$("gridBuildStatus"),feedback=$("gridBuildFeedback");
    const modeLabel=new Map(modes);
    const geometry=new THREE.BoxGeometry(1.015,1.015,1.015);
    function preview(color){
      const material=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.37,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
      const group=new THREE.InstancedMesh(geometry,material,maxCells);
      group.count=0;group.frustumCulled=false;group.renderOrder=6;scene.add(group);
      return group;
    }
    const valid=preview(0x51f4b4),invalid=preview(0xff783f),matrix=new THREE.Matrix4();
    let active=false,opened=false,anchor=null,anchorId=null,elapsed=0;
    const undo=[],redo=[];
    $("gridShape").innerHTML=modes.map(([value,label])=>`<option value="${value}">${label}</option>`).join("");

    function options(){
      return {mode:$("gridShape").value,mirror:$("gridMirror").value,repeats:+$("gridRepeats").value,
        axis:$("gridAxis").value,gap:Math.max(0,Math.min(12,Math.floor(Number($("gridGap").value)||0)))};
    }
    function indicator(text,error=false){
      if(status.textContent!==text)status.textContent=text;
      status.hidden=!text;status.dataset.invalid=String(error);
    }
    function resetPreview(){valid.count=invalid.count=0}
    function cancel(){
      if(!anchor)return false;
      anchor=null;anchorId=null;resetPreview();
      return true;
    }
    function evaluate(end,id){
      const pattern=cells(anchor||end,end,anchor?options():{mode:"line",mirror:"off",repeats:1,axis:"x",gap:0});
      if(pattern.issue)return pattern;
      const checked=pattern.cells.map(cell=>({...cell,...inspect(cell,id)}));
      const blocked=checked.find(cell=>cell.issue);
      const available=stock(id);
      const issue=blocked?.issue||(available<checked.length?`Faltam ${checked.length-available} blocos de ${blockName(id)}.`:null);
      return {checked,issue};
    }
    function update(dt){
      if(!active||!canUse()){
        resetPreview();indicator("");
        return;
      }
      if((elapsed-=dt)>0)return;
      elapsed=.075;
      const end=target(),id=blockId(),label=modeLabel.get(options().mode);
      if(anchor&&anchorId!==id)cancel();
      resetPreview();
      if(!id||!end){indicator(label+(id?" · Mire numa face do terreno.":" · Selecione um bloco inteiro."));return}
      const plan=evaluate(end,id);
      for(const cell of plan.checked||[]){
        const pool=cell.issue?invalid:valid;
        pool.setMatrixAt(pool.count++,matrix.makeTranslation(cell.x+.5,cell.y+.5,cell.z+.5));
        pool.instanceMatrix.needsUpdate=true;
      }
      indicator(plan.issue?label+" · "+plan.issue:anchor?
        `${label} · ${plan.checked.length} blocos · confirme com Q ou botão direito`:
        label+" · Marque o início com Q ou botão direito",!!plan.issue);
    }
    function use(){
      const id=blockId(),end=target();
      if(!id||!end){notify("Selecione um bloco inteiro e mire numa face do terreno.");return false}
      if(anchor&&anchorId!==id)cancel();
      const plan=evaluate(end,id);
      if(plan.issue){notify(plan.issue);return false}
      if(!anchor){
        anchor=end;anchorId=id;elapsed=0;
        notify("Início marcado. Mire no segundo ponto e confirme.");
        return true;
      }
      const edits=plan.checked.map(({x,y,z,before})=>({x,y,z,before}));
      const result=apply({id,edits,action:"place"});
      if(result.issue){notify(result.issue);return false}
      undo.push({id,edits,paid:result.paid});
      if(undo.length>15)undo.shift();
      redo.length=0;
      cancel();
      notify(`${edits.length} blocos colocados. Ctrl+Z desfaz.`);
      return true;
    }
    function syncMenu(){
      $("gridToggleBtn").textContent=active?"Desativar grade":"Ativar grade";
      $("gridUndoBtn").disabled=!undo.length;
      $("gridRedoBtn").disabled=!redo.length;
      $("gridHudBtn").setAttribute("aria-pressed",String(active));
    }
    function history(action){
      const from=action==="undo"?undo:redo,to=action==="undo"?redo:undo;
      const job=from.at(-1);
      if(!job)return;
      const result=apply({...job,action});
      if(!result.issue){
        from.pop();
        to.push(action==="redo"?{...job,paid:result.paid}:job);
        cancel();
      }
      const message=result.issue||`${job.edits.length} blocos ${action==="undo"?"desfeitos":"refeitos"}.`;
      feedback.textContent=message;
      notify(message);
      syncMenu();
    }
    function close(resume=true){
      if(!opened)return false;
      opened=false;
      modal.classList.remove("open");modal.setAttribute("aria-hidden","true");onMenu(false,resume);
      return true;
    }
    function open(){
      if(opened)return close();
      if(!openAllowed())return;
      opened=true;feedback.textContent="Ctrl+Z desfaz, Ctrl+Y refaz e Esc cancela a seleção.";
      syncMenu();resetPreview();indicator("");
      onMenu(true);modal.classList.add("open");modal.setAttribute("aria-hidden","false");
      $("gridShape").focus();
    }
    $("gridHudBtn").onclick=open;
    $("gridCloseBtn").onclick=()=>close();
    $("gridToggleBtn").onclick=()=>{
      active=!active;
      if(!active)cancel();
      syncMenu();close();
    };
    $("gridUndoBtn").onclick=()=>history("undo");
    $("gridRedoBtn").onclick=()=>history("redo");
    return {open,close,cancel,update,use,history,active:()=>active,
      reset(){cancel();undo.length=redo.length=0;active=false;syncMenu();indicator("")}};
  }

  return {modes,maxCells,cells,create};
})();
