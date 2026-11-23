window.VoicesModules.define('world-assembly', function () {
  'use strict';
  const V = window.V;
  const world = V.World;
  V.Hooks.around(world, 'init', 'world-assembly:vocabulary', next => function (...args) {
    const result = next(...args);
    V.PixCollection.seed();
    V.PixWorldVocabulary.seed();
    return result;
  });
});
