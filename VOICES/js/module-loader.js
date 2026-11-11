/* Dependency resolution is independent of catalog and script arrival order. */
(function (root, create) {
  'use strict';
  if (typeof module === 'object' && module.exports) module.exports = create();
  else { root.V = root.V || {}; root.VoicesModules = create(); }
})(typeof window === 'object' ? window : globalThis, function () {
  'use strict';
  const definitions = new Map(), initialized = new Set();
  let signature = null, failure = null;
  function resolve(catalog) {
    if (!Array.isArray(catalog)) throw new TypeError('Module catalog must be an array');
    const nodes = new Map();
    for (const entry of catalog) {
      if (!entry || typeof entry.id !== 'string' || !/^[a-z0-9-]+$/.test(entry.id) || typeof entry.src !== 'string' || !Array.isArray(entry.requires)) throw new Error('Invalid module declaration');
      if (nodes.has(entry.id)) throw new Error('Duplicate module: ' + entry.id);
      nodes.set(entry.id, entry);
    }
    for (const entry of nodes.values()) for (const dependency of entry.requires) {
      if (dependency === entry.id) throw new Error('Module depends on itself: ' + entry.id);
      if (!nodes.has(dependency)) throw new Error('Missing dependency ' + dependency + ' required by ' + entry.id);
    }
    const result = [], visiting = new Set(), visited = new Set();
    function visit(id, trail) {
      if (visiting.has(id)) throw new Error('Module dependency cycle: ' + [...trail, id].join(' -> '));
      if (visited.has(id)) return;
      visiting.add(id);
      for (const dependency of [...nodes.get(id).requires].sort()) visit(dependency, [...trail, id]);
      visiting.delete(id); visited.add(id); result.push(nodes.get(id));
    }
    for (const id of [...nodes.keys()].sort()) visit(id, []);
    return result;
  }
  return {
    resolve,
    define(id, factory) {
      if (signature || failure) throw new Error('Cannot register modules after startup');
      if (definitions.has(id)) throw new Error('Duplicate module factory: ' + id);
      if (typeof factory !== 'function') throw new TypeError('Invalid module factory: ' + id);
      definitions.set(id, factory);
    },
    start(catalog) {
      if (failure) throw failure;
      const ordered = resolve(catalog), nextSignature = JSON.stringify(ordered.map(entry => [entry.id, entry.src, [...entry.requires].sort()]));
      if (signature && signature !== nextSignature) throw new Error('Module graph changed after startup');
      for (const entry of ordered) if (!definitions.has(entry.id)) throw new Error('Module script was not loaded: ' + entry.id);
      const expected = new Set(ordered.map(entry => entry.id));
      for (const id of definitions.keys()) if (!expected.has(id)) throw new Error('Undeclared module factory: ' + id);
      for (const entry of ordered) {
        if (initialized.has(entry.id)) continue;
        try { definitions.get(entry.id)(); initialized.add(entry.id); }
        catch (cause) { failure = new Error('Could not initialize module ' + entry.id + ': ' + cause.message, { cause }); throw failure; }
      }
      signature = nextSignature;
      return ordered.map(entry => entry.id);
    },
    status() { return { registered: [...definitions.keys()].sort(), initialized: [...initialized].sort(), failed: failure?.message || null }; }
  };
});
