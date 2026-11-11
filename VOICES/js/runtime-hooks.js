/* Registered module: runtime-hooks */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("runtime-hooks", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
/* Named extension points. Each registration receives the previous implementation. */
(function () {
  'use strict';
  const V = window.V, targets = new WeakMap();
  V.Hooks = {
    around(target, method, name, factory) {
      if (typeof target?.[method] !== 'function') throw new TypeError('Unknown hook: ' + method);
      let methods = targets.get(target);
      if (!methods) targets.set(target, methods = new Map());
      let entries = methods.get(method);
      if (!entries) methods.set(method, entries = new Map());
      if (entries.has(name)) throw new Error('Duplicate hook: ' + name);
      const previous = target[method].bind(target), implementation = factory(previous);
      if (typeof implementation !== 'function') throw new TypeError('Invalid hook: ' + name);
      entries.set(name, { previous, implementation });
      target[method] = implementation;
      return implementation;
    },
    list(target, method) {
      const methods = targets.get(target);
      if (method) return [...(methods?.get(method)?.keys() || [])];
      return Object.fromEntries([...(methods || [])].map(([key, entries]) => [key, [...entries.keys()]]));
    }
  };
})();

});
