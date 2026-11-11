/* Registered module: interface-polish */
(function(initialize){if(window.VoicesModules)window.VoicesModules.define('interface-polish',initialize);else initialize();})(function(){
  'use strict';
  const V=window.V,W=V.World,activities=V.Activities;
  const interactables=W.interactables.bind(W);
  W.interactables=function(...args){
    return interactables(...args).filter(o=>o.type!=='ambient'&&o.type!=='community-conversation'&&o.scene?.kind!=='conversation');
  };

  const render=V.Game.render.bind(V.Game);
  V.Game.render=function(c){const result=render(c);activities.paint();return result;};

  const character=V.Progress.character.bind(V.Progress);
  V.Progress.character=function(...args){
    const result=character(...args),bar=V.$('.character-shortcuts');
    if(bar)for(const id of ['daily-activities','player-appearance','.city-emotes']){
      const action=V.$(id.startsWith('.')?id:'#'+id);
      if(action)bar.append(action);
    }
    return result;
  };
});
