(function(){
'use strict';
const V=window.V,A=V.Appearance,X=V.SalonCultureData,S=V.Salon;
const B=V.SalonCollection={pending:null,
draft(id){const preset=X.presets[id];if(!preset)return null;const draft=A.look();draft.enabled=true;for(const key of ['outfit','hair','headwear','facepaint'])if(preset[key]!==undefined)draft[key]=preset[key];Object.assign(draft.colors,preset.colors||{});Object.assign(draft.accessories,preset.accessories||{});return A.normalise(draft);},
visit(tab='hair',draft=null){if(!V.state)return false;this.pending={profile:V.state.profileId,tab,draft};if(V.World.current?.salon){this.arrived();return true;}const result=V.FastTravel.travel(S.id);if(!result){this.pending=null;return false;}queueMicrotask(()=>this.arrived());const cancel=V.$('#sea-voyage-cancel');if(cancel){for(const button of [cancel,V.$('.close-modal')].filter(Boolean)){const previous=button.onclick;button.onclick=(...args)=>{this.pending=null;return previous?.(...args);};}}return result;},
tryOn(id){const preset=X.presets[id],draft=this.draft(id);if(!preset||!draft)return false;return this.visit(preset.tab,draft);},
arrived(){const p=this.pending;if(!p)return;if(p.profile!==V.state?.profileId){this.pending=null;return;}if(V.World.current?.salon&&V.Game.mode==='explore'){this.pending=null;A.open(p.tab,p.draft?{draft:p.draft}:{});}},
button(id,label,click){let footer=V.$('.modal-footer');if(V.$('#'+id))return;if(!footer){const modal=V.$('.modal');if(!modal)return;footer=document.createElement('footer');footer.className='modal-footer';modal.append(footer);}const button=document.createElement('button');button.id=id;button.className='secondary';button.textContent=label;button.onclick=click;footer.prepend(button);}
};
const detail=V.Culture.detail.bind(V.Culture);V.Culture.detail=function(id,...args){const r=detail(id,...args);if(X.presets[id])B.button('culture-wearable-try','Experimentar no salão',()=>B.tryOn(id));return r;};
const open=V.Culture.open.bind(V.Culture);V.Culture.open=function(topic='all',...args){const r=open(topic,...args);if(['hair','wrap','clothes','faceart','all'].includes(topic))B.button('culture-salon-open','Abrir o Salão Íris',()=>B.visit(({hair:'hair',wrap:'accessories',clothes:'outfit',faceart:'paint'})[topic]||'hair'));return r;};
const journal=V.Culture.journal.bind(V.Culture);V.Culture.journal=function(...args){const r=journal(...args);B.button('culture-journal-salon','Visitar o Salão Íris',()=>B.visit());return r;};
const load=V.World.load.bind(V.World);V.World.load=function(...args){const r=load(...args);if(B.pending)queueMicrotask(()=>B.arrived());return r;};
const key=V.Game.onKey.bind(V.Game);V.Game.onKey=function(k,...args){if(k==='escape'&&B.pending&&V.$('#sea-voyage-cancel'))B.pending=null;return key(k,...args);};
const title=V.Game.toTitle.bind(V.Game);V.Game.toTitle=function(...args){B.pending=null;return title(...args);};
})();
