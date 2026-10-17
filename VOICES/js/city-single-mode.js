(function(){
'use strict';
const V=window.V,T=V.Translation;
const toast=V.UI.toast.bind(V.UI);V.UI.toast=function(...args){toast(...args);const root=V.$('#toast-root');while(root.children.length>3)root.firstElementChild.remove();};
V.lang=(s,grade=7)=>typeof s==='object'&&s?String(s[grade]??s[7]??s[6]??Object.values(s)[0]??''):String(s??'');
V.defaultSettings.grade=7;
const literals={
'Whose story is missing?':'De quem é a história que está faltando?',
'Another name. Another memory. I want to know more.':'Outro nome. Outra memória. Quero saber mais.',
'If I kept every record, could I decide every story?':'Se eu guardasse todos os registros, poderia decidir todas as histórias?',
'A trace is a beginning, not the whole story.':'Um vestígio é um começo, não a história inteira.',
'We restored the records together.':'Restauramos os registros juntos.',
'Knowledge grows when it can be questioned.':'O conhecimento cresce quando pode ser questionado.',
'I have questions of my own.':'Tenho minhas próprias perguntas.',
'Let’s compare the sources.':'Vamos comparar as fontes.',
'Keep both versions. We need to understand the change.':'Guarde as duas versões. Precisamos entender a mudança.',
'A trace is not a source.':'Um vestígio não é uma fonte.',
'Protection is not possession.':'Proteção não é posse.',
'We are restoring the festival credits.':'Estamos restaurando os créditos do festival.',
'I can watch the path. You must listen to the people.':'Posso vigiar o caminho. Você precisa escutar as pessoas.',
'We observe, write and compare.':'Observamos, escrevemos e comparamos.',
'There are books beside the music room.':'Há livros ao lado da sala de música.',
'Choose a gallery and read the captions.':'Escolha uma galeria e leia as legendas.',
'I write the source beside my notes.':'Anoto a fonte ao lado das minhas observações.',
'A person has more than one story.':'Uma pessoa tem mais de uma história.',
'There is a place for you here.':'Há um lugar para você aqui.',
'We can share our ideas.':'Podemos compartilhar nossas ideias.',
'Let’s continue together.':'Vamos continuar juntos.',
'Let’s listen and learn together.':'Vamos escutar e aprender juntos.'
};
for(const[en,pt]of Object.entries(literals))T.pairs.set(T.key(en),pt);
const line=T.line.bind(T);T.line=function(input){const out=line(input);out.pt=this.text(out.en,out.pt,out.ptByGrade);out.ptByGrade=undefined;return out;};
const init=V.Living.initContent.bind(V.Living);V.Living.initContent=function(){init();const seen=new Set(),walk=o=>{if(!o||typeof o!=='object'||seen.has(o))return;seen.add(o);if(o.en&&o.pt)Object.assign(o,T.line(o));for(const v of Object.values(o))walk(v);};for(const root of [V.content,V.learning,V.cozyContent,V.campusContent,V.campus,V.neighborsContent])walk(root);};
const start=V.Dialogue.start.bind(V.Dialogue);V.Dialogue.start=function(lines,...rest){return start(lines.map(l=>T.line(l)),...rest);};
const show=V.Dialogue.show.bind(V.Dialogue);V.Dialogue.show=function(){show();const l=this.lines[this.index],root=V.$('.dialogue-en')?.parentElement;if(!l||!root)return;const pt=V.$('#dialogue-pt');if(pt&&l.hint){const hint=document.createElement('p');hint.className='dialogue-context';hint.innerHTML='<b>Contexto da missão</b> '+V.escape(l.hint);pt.after(hint);}const log=V.state.dialogueHistory?.at(-1);if(log)log.pt=T.text(l.en,l.pt);};
const translate=V.Dialogue.translate.bind(V.Dialogue);V.Dialogue.translate=function(){translate();const l=this.lines[this.index],pt=V.$('#dialogue-pt');if(l&&pt)pt.textContent=V.settings.translation&&V.settings.subtitles?T.text(l.en,l.pt):'';};
const migrate=V.Progress.migrate.bind(V.Progress);V.Progress.migrate=function(s){if(s)s.grade=7;return migrate(s);};
const hud=V.Game.updateHUD.bind(V.Game);V.Game.updateHUD=function(){hud();if(V.state)V.$('#player-grade').textContent='Forasteiro · nível '+V.Progress.ensure().level;};
const settings=V.Save.applySettings.bind(V.Save);V.Save.applySettings=function(){V.settings.grade=7;return settings();};
const pause=V.Game.pause.bind(V.Game);V.Game.pause=function(...args){pause(...args);if(this.mode==='explore'&&!V.$('#pause-scene-editor')){const root=V.$('.modal-body .stack')||V.$('.modal-body'),button=document.createElement('button');button.id='pause-scene-editor';button.className='secondary';button.textContent='Editar cenários';button.onclick=()=>V.SceneEditor.open();root?.appendChild(button);}};
const open=V.SceneEditor.open.bind(V.SceneEditor);V.SceneEditor.open=function(...args){if(V.Game.screen==='game'&&!V.modal){V.UI.toast('Abra o menu de pausa para editar os cenários.');return;}return open(...args);};
})();
