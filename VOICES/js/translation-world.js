(function(){'use strict';
const V=window.V,data=V.translationContent,C=V.Cozy;
const key=s=>String(s||'').normalize('NFC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/\s+/g,' ').trim();
const pairs=new Map(),conversations=new Map(Object.entries(data.conversationEnglish));
for(const r of data.records){if(typeof r.en==='object'){for(const grade of [6,7,8])if(r.en[grade])pairs.set(key(r.en[grade]),r.ptByGrade?.[grade]||r.pt);}else pairs.set(key(r.en),r.pt);}
for(const r of V.neighborsContent.residents)for(const line of r.lines)pairs.set(key(line.en),line.pt);
V.Translation={pairs,key,version:data.version,
 text(en,pt='',ptByGrade=null){if(ptByGrade)return V.lang(ptByGrade);return V.lang(pt)||pairs.get(key(V.lang(en)))||'';},
 line(input){const line={...input};if(line.en&&typeof line.en==='object'){line.ptByGrade={};for(const grade of [6,7,8])line.ptByGrade[grade]=input.ptByGrade?.[grade]??pairs.get(key(line.en[grade]))??V.lang(input.pt);}
  line.pt=this.text(line.en,line.pt,line.ptByGrade);return line;},
 apply(){const seen=new Set(),visit=o=>{if(!o||typeof o!=='object'||seen.has(o))return;seen.add(o);if(o.en&&o.pt){const line=this.line(o);o.pt=line.pt;if(line.ptByGrade)o.ptByGrade=line.ptByGrade;}for(const child of Object.values(o))visit(child);};
  for(const root of [V.content,V.learning,V.cozyContent,V.culturalContent,V.heritageContent,V.wardrobeContent,V.coastContent,V.neighborsContent])visit(root);
  for(const w of V.content.glossary)w.examplePt=this.text(w.example,w.examplePt);
 },
 history(){if(!V.state)return;for(const line of V.state.dialogueHistory||[])line.pt=this.text(line.en,line.pt);},
 chats(m){for(const g of m.chats||[]){g.enLines=g.lines.map((pt,i)=>conversations.get(pt)||g.enLines[i]);for(const o of g.members||[])if(o.chat)o.chat.enLines=g.enLines;}}
};
const editorial=V.Editorial.line.bind(V.Editorial),init=V.Living.initContent.bind(V.Living),compose=C.compose.bind(C),ensure=C.ensure.bind(C),history=V.Dialogue.history.bind(V.Dialogue);
V.Editorial.line=function(input){return V.Translation.line(editorial(input));};
V.Living.initContent=function(){init();V.Translation.apply();};
C.compose=function(m){compose(m);V.Translation.chats(m);};
C.ensure=function(){ensure();V.Translation.history();};
V.Dialogue.history=function(){V.Translation.history();return history();};
})();
