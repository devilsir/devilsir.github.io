/* Registered module: world-finalize */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("world-finalize", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
/* Run layout validation after every expansion has contributed its entrances. */
(function () {
  'use strict';
  const V = window.V;
  V.Hooks.around(V.World, 'init', 'world-finalize:entrances', nextHook => function (...args) {
    const result = nextHook(...args);
    V.PortalSpacing.all();
    return result;
  });
})();

});
