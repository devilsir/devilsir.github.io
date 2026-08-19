const cloneValue=(value)=>typeof structuredClone==="function"?structuredClone(value):JSON.parse(JSON.stringify(value));

export class EditorHistory{
  constructor(limit=80,onChange=()=>{}){this.limit=Math.max(10,Number(limit)||80);this.onChange=onChange;this.undoStack=[];this.redoStack=[];this.locked=false;}
  push({label="Edição",before,after,apply}){
    if(this.locked||typeof apply!=="function")return false;
    this.undoStack.push({label,before:cloneValue(before),after:cloneValue(after),apply});
    if(this.undoStack.length>this.limit)this.undoStack.shift();
    this.redoStack.length=0;this.onChange(this.status());return true;
  }
  transaction(label,capture,mutate,apply){const before=capture();mutate();const after=capture();if(JSON.stringify(before)===JSON.stringify(after))return false;return this.push({label,before,after,apply});}
  undo(){const command=this.undoStack.pop();if(!command)return false;this.locked=true;try{command.apply(cloneValue(command.before));}finally{this.locked=false;}this.redoStack.push(command);this.onChange(this.status());return true;}
  redo(){const command=this.redoStack.pop();if(!command)return false;this.locked=true;try{command.apply(cloneValue(command.after));}finally{this.locked=false;}this.undoStack.push(command);this.onChange(this.status());return true;}
  clear(){this.undoStack.length=0;this.redoStack.length=0;this.onChange(this.status());}
  status(){return{canUndo:this.undoStack.length>0,canRedo:this.redoStack.length>0,undoLabel:this.undoStack.at(-1)?.label||null,redoLabel:this.redoStack.at(-1)?.label||null,count:this.undoStack.length};}
}

export {cloneValue as cloneEditorValue};
