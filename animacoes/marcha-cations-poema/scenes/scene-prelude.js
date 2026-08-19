(() => {
  'use strict';
  const nativeTimeout = window.setTimeout.bind(window);
  const nativeInterval = window.setInterval.bind(window);
  window.__marchSpeed = 1;
  window.setTimeout = (callback, delay = 0, ...args) => {
    const speed = Math.max(.25, Number(window.__marchSpeed) || 1);
    const adjusted = Number(delay) >= 80 ? Number(delay) / speed : Number(delay);
    return nativeTimeout(callback, adjusted, ...args);
  };
  window.setInterval = (callback, delay = 0, ...args) => {
    const speed = Math.max(.25, Number(window.__marchSpeed) || 1);
    const adjusted = Number(delay) >= 80 ? Number(delay) / speed : Number(delay);
    return nativeInterval(callback, adjusted, ...args);
  };
})();
