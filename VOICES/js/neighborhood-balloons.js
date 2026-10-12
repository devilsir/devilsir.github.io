(function(){'use strict';
const V=window.V,C=V.Cozy,W=V.World;
const types=['greeting','question','attention','reply','surprise','thought','shout','practical','conversation'];
const themes={greeting:['#fff3de','#55715c'],question:['#f7f3df','#526e69'],attention:['#fff1cb','#887043'],reply:['#f6f1e3','#5c7166'],surprise:['#fff1dc','#91674e'],thought:['#edf1e4','#647569'],shout:['#fff0d3','#6b513f'],practical:['#f0ebd7','#526f67'],conversation:['#fff6df','#57715b']};
const hash=s=>Array.from(s||'').reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);
V.Balloons={types,themes,
 kind(o,text){if(types.includes(o.bubbleKind))return o.bubbleKind;if(o.bubbleRemark?.bubbleKind)return o.bubbleRemark.bubbleKind;
  if(/black lives matter|vidas negras importam|respeito e igualdade/i.test(text||''))return 'shout';
  if(!text){if([4,6,7].includes(o.icon))return 'thought';if(o.icon===3)return 'greeting';if(o.icon===0)return 'surprise';return 'reply';}
  if(/\?$/.test(text))return 'question';if(/^(certo|sim|não|combinado|pronto|boa)[!.]?$/i.test(text))return 'reply';
  if(/^(oi|olá|bom te ver|obrigad|guardei um lugar)/i.test(text))return 'greeting';
  if(/confira|antes de publicar|precisa de data|falta.*data|passagem.*livre|atenção/i.test(text))return 'attention';
  if(/[!]$/.test(text))return 'surprise';if(/será|estou pensando|vou pensar|vou reler/i.test(text))return 'thought';
  if(/organizo|organizei|guard|ferramentas|etiquetas|costur|ajust/i.test(text))return 'practical';return 'conversation';},
 wrap(ctx,text,max){const result=[];let line='';for(const word of String(text).split(/\s+/)){if(!word)continue;const candidate=line?line+' '+word:word;if(ctx.measureText(candidate).width<=max){line=candidate;continue;}if(line){result.push(line);line='';}if(ctx.measureText(word).width<=max){line=word;continue;}for(const char of word){if(line&&ctx.measureText(line+char).width>max){result.push(line);line='';}line+=char;}}if(line)result.push(line);return result;},
 layout(ctx,o,cam={x:0,y:0},text='',kind=null){kind=kind||this.kind(o,text);const scale=o.visualScale||1,anchor={x:Math.round(o.x-(cam.x||0)),y:Math.round(o.y-(cam.y||0)-52*scale)},padding=['shout','surprise','thought'].includes(kind)?23:14,max=Math.min(258,Math.max(140,ctx.canvas.width-24)),fontSize=Math.max(13,Math.min(17,Math.round((V.settings.fontSize||17)*.75))),lineHeight=fontSize+5;ctx.font='600 '+fontSize+'px "VOICES Sans", sans-serif';
  const lines=text?this.wrap(ctx,text,max-padding*2):[],widest=lines.length?Math.max(...lines.map(s=>ctx.measureText(s).width)):24;
  let width=Math.ceil(Math.max(text?68:52,widest+padding*2)),height=lines.length?lines.length*lineHeight+padding*2:48;if(kind==='reply'){width=Math.max(width,height);height=width;}
  const tailLength=kind==='attention'?28:kind==='thought'?24:12,offset=kind==='conversation'?-Math.min(24,width*.12):0,x=Math.round(anchor.x-width/2+offset),bottom=anchor.y-tailLength,y=bottom-height;
  return{kind,anchor,x,y,width,height,bottom,tailLength,lines,padding,fontSize,lineHeight,tailX:anchor.x-x};},
 outline(ctx,b){const{x,y,width:w,height:h,tailX:tx,tailLength:t,kind}=b,points=[];
  const add=(a,c)=>points.push([x+a,y+c]),tail=()=>{add(tx+7,h);add(tx,h+t);add(tx-7,h);};
  if(['question','reply','thought','shout','surprise'].includes(kind)){
   const n=kind==='thought'?64:kind==='shout'||kind==='surprise'?32:40;
   for(let i=0;i<=n;i++){const a=-Math.PI/2+i/n*Math.PI*2,rad=kind==='shout'?(i%2?.81:1):kind==='surprise'?(i%2?.89:1):1;
    const cloud=kind==='thought'?.92+.08*Math.cos(a*6):1;
    if(i===n/2&&kind!=='thought'){tail();continue;}
    add(w/2+Math.cos(a)*w/2*rad*cloud,h/2+Math.sin(a)*h/2*rad*cloud);
   }
  }else{
   const cut=kind==='practical'?10:kind==='greeting'?12:8;
   add(cut,kind==='greeting'?3:0);add(w-8,0);add(w,kind==='greeting'?12:8);add(w-cut,h-8);add(w-cut-4,h);
   if(kind==='attention'){add(tx+17,h);add(tx+5,h+9);add(tx+13,h+9);add(tx,h+t);add(tx-4,h+13);add(tx-12,h+13);add(tx-7,h);}else tail();
   add(7,h);add(0,h-8);add(kind==='practical'?cut:0,8);
  }
  ctx.beginPath();points.forEach(([px,py],i)=>i?ctx.lineTo(Math.round(px),Math.round(py)):ctx.moveTo(Math.round(px),Math.round(py)));ctx.closePath();return points;},
 paint(ctx,b,text='',icon=null){const colors=themes[b.kind],contrast=V.settings.highContrast;ctx.save();ctx.lineJoin='round';ctx.lineWidth=2;ctx.translate(2,3);this.outline(ctx,b);ctx.fillStyle='#17352b38';ctx.fill();ctx.translate(-2,-3);this.outline(ctx,b);ctx.fillStyle=contrast?'#fff9e5':colors[0];ctx.fill();ctx.strokeStyle=contrast?'#172d23':colors[1];ctx.stroke();
  if(b.kind==='thought')for(const[dx,dy,r]of [[6,7,4],[2,17,2],[0,b.tailLength,1]]){ctx.beginPath();ctx.arc(b.anchor.x+dx,b.bottom+dy,r,0,Math.PI*2);ctx.fill();ctx.stroke();}
  if(text){ctx.font='600 '+b.fontSize+'px "VOICES Sans", sans-serif';ctx.fillStyle='#263e33';ctx.textAlign='left';const top=b.y+(b.height-b.lines.length*b.lineHeight)/2+b.fontSize+1;for(let i=0;i<b.lines.length;i++)ctx.fillText(b.lines[i],b.x+b.padding,Math.round(top+i*b.lineHeight));}
  else{const img=V.Assets.images['cozy-icons'];if(img&&Number.isInteger(icon))ctx.drawImage(img,icon*32,0,32,32,b.x+(b.width-24)/2,b.y+(b.height-24)/2,24,24);else V.Engine.text(ctx,'…',b.x+b.width/2,b.y+b.height/2+5,'#52705c',16,'center');}
  ctx.restore();},
 draw(ctx,o,cam={x:0,y:0}){if(V.settings.npcChats===false||cam.noBubbles)return null;const remark=o.bubbleRemark&&o.remarkTime>0?o.bubbleRemark:null,spoken=V.settings.subtitles&&(o.chatSpeaking&&o.bubble||remark?.pt),icon=!spoken&&o.iconTime>0&&o.icon!==null;if(!spoken&&!icon)return null;
  const text=spoken?String(o.chatSpeaking?o.bubble:remark.pt):'',kind=this.kind(o,text),b=this.layout(ctx,o,cam,text,kind);
  const footX=o.x-(cam.x||0),footY=o.y-(cam.y||0);if(footX<0||footX>ctx.canvas.width||footY<0||footY>ctx.canvas.height)return null;
  ctx.save();ctx.globalAlpha=spoken||V.settings.reducedMotion?1:Math.min(1,o.iconTime/.3);this.paint(ctx,b,text,o.icon);ctx.restore();return b;}
};
const B=V.Balloons,previous={compose:C.compose.bind(C),update:C.update.bind(C),load:C.onLoad.bind(C),interact:C.interact.bind(C)};
C.bubble=(ctx,o,cam)=>B.draw(ctx,o,cam);
C.compose=function(m){previous.compose(m);for(const o of m.objects.filter(o=>C.person(o))){o.bubbleRemark=null;o.remarkTime=0;o.remarkIndex=0;o.nextRemark=24+hash(o.id)%31;}};
C.update=function(dt){dt=V.clamp(dt,0,.08);previous.update(dt);const m=W.current;if(!m)return;for(const o of m.objects){if(o.remarkTime>0){o.remarkTime=Math.max(0,o.remarkTime-dt);if(!o.remarkTime)o.bubbleRemark=null;}if(Number.isFinite(o.nextRemark))o.nextRemark-=dt;}
 if(m.objects.some(o=>o.chatSpeaking))for(const o of m.objects)if(o.bubbleRemark){o.bubbleRemark=null;o.remarkTime=0;o.iconTime=0;}
 if(V.settings.npcChats===false||V.settings.subtitles===false||V.Dialogue.active||V.modal||V.SceneEditor.active||m.protestChantVisible||m.objects.some(o=>o.chatSpeaking||o.iconTime>0))return;
 const cam=W.camera,cw=V.Engine.canvas?.width||960,ch=V.Engine.canvas?.height||540;
 const o=m.objects.find(o=>o.resident?.id.startsWith('atelier-')&&o.nextRemark<=0&&!o.responding&&!o.walking&&o.action!=='conversing'&&o.x-cam.x>20&&o.x-cam.x<cw-20&&o.y-cam.y>100&&o.y-cam.y<ch-20);
 if(o){const lines=o.resident.lines.filter(l=>!l.requiresCompleted||V.state.completed.includes(l.requiresCompleted)),line=lines[(o.remarkIndex++)%lines.length];o.bubbleRemark=line;o.remarkTime=4.8;o.iconTime=4.8;o.icon=4;o.nextRemark=48+hash(o.id)%29;}}
C.onLoad=function(){if(B.currentMap&&B.currentMap!==W.current)for(const o of B.currentMap.objects){o.bubbleRemark=null;o.remarkTime=0;}previous.load();B.currentMap=W.current;for(const o of W.current?.objects||[]){o.bubbleRemark=null;o.remarkTime=0;}};
C.interact=function(o){if(o){o.bubbleRemark=null;o.remarkTime=0;}return previous.interact(o);};
})();
