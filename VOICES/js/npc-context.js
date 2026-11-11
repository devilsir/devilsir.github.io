/* Registered module: npc-context */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("npc-context", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
(function npcContext(){
'use strict';
const V=window.V,C=V.Cozy,personal=V.NpcDialogueData;
const N=V.NpcContext={line(character){const p=personal[character];if(!p)return null;const after=p.after,done=after&&(after.chapter?V.state.completed.includes(after.chapter):V.Progress.ensure().story.met);return {en:done?after.en:p.en,pt:done?after.pt:p.pt};}};
const service=C.service.bind(C);C.service=function(o){const line=N.line(o.character);if(!line)return service(o);V.Dialogue.start([{speaker:o.character,...line}]);};

V.Hooks.around(V.Game, 'interact', 'npc-context:interact:1', nextHook => function(o){if(o&&!V.modal&&!V.Dialogue.active&&o.type==='npc'&&(o.library||o.hub&&V.state.flags.prologueDone&&o.character!=='pix')){const line=N.line(o.character);if(line)return V.Dialogue.start([{speaker:o.character,...line}]);}return nextHook(o);});
})();

});
