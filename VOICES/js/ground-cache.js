/* Registered module: ground-cache */
(function (initialize) {
  if (window.VoicesModules) window.VoicesModules.define("ground-cache", initialize);
  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');
  else initialize();
})(function () {
/* Backgrounds retain world coordinates while their bitmap has a bounded size. */
(function () {
  'use strict';
  const V = window.V, sizes = new WeakMap();
  V.GroundCache = {
    create(map, width, height) {
      const canvas = document.createElement('canvas'), p = V.Performance;
      const budget = p?.mobile ? p.groundBudget / Math.max(2, p.groundCount) : Infinity;
      const scale = Math.min(1, Math.sqrt(budget / (width * height * 4)));
      canvas.width = Math.max(1, Math.floor(width * scale));
      canvas.height = Math.max(1, Math.floor(height * scale));
      sizes.set(canvas, { width, height });
      const context = canvas.getContext('2d');
      context.scale(canvas.width / width, canvas.height / height);
      context.imageSmoothingEnabled = false;
      return canvas;
    },
    width(canvas) { return sizes.get(canvas)?.width || canvas.width; },
    height(canvas) { return sizes.get(canvas)?.height || canvas.height; },
    draw(context, canvas, x, y) {
      context.drawImage(canvas, 0, 0, canvas.width, canvas.height, x, y, this.width(canvas), this.height(canvas));
    },
    sample(context, canvas, sx, sy, sw, sh, ...destination) {
      const x = canvas.width / this.width(canvas), y = canvas.height / this.height(canvas);
      context.drawImage(canvas, sx * x, sy * y, sw * x, sh * y, ...destination);
    }
  };
})();

});
