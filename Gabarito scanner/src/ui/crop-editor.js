import { clampPoint, defaultQuad, orderQuad } from '../utils/math.js';

export class CropEditor {
  constructor({ imageCanvas, overlayCanvas, stack, viewport, onChange }) {
    this.imageCanvas = imageCanvas;
    this.overlayCanvas = overlayCanvas;
    this.stack = stack;
    this.viewport = viewport;
    this.onChange = onChange;
    this.points = [];
    this.initialPoints = [];
    this.source = null;
    this.dragIndex = -1;
    this.activePointer = null;

    this.resizeObserver = new ResizeObserver(() => this.#fitStack());
    this.resizeObserver.observe(viewport);
    this.#bindEvents();
  }

  setImage(sourceCanvas, quadPoints) {
    this.source = sourceCanvas;
    this.imageCanvas.width = sourceCanvas.width;
    this.imageCanvas.height = sourceCanvas.height;
    this.overlayCanvas.width = sourceCanvas.width;
    this.overlayCanvas.height = sourceCanvas.height;
    this.imageCanvas.getContext('2d', { alpha: false }).drawImage(sourceCanvas, 0, 0);
    this.points = (quadPoints?.length === 4 ? orderQuad(quadPoints) : defaultQuad(sourceCanvas.width, sourceCanvas.height)).map(
      (p) => ({ ...p })
    );
    this.initialPoints = this.points.map((p) => ({ ...p }));
    this.#fitStack();
  }

  setPoints(points, { remember = true } = {}) {
    if (!this.source) return;
    this.points = orderQuad(points).map((p) => clampPoint(p, this.source.width - 1, this.source.height - 1));
    if (remember) this.initialPoints = this.points.map((p) => ({ ...p }));
    this.draw();
  }

  reset() {
    this.points = this.initialPoints.map((p) => ({ ...p }));
    this.draw();
    this.onChange?.(this.getPoints(), { manual: false, reset: true });
  }

  getPoints() {
    return orderQuad(this.points).map((p) => ({ ...p }));
  }

  destroy() {
    this.resizeObserver.disconnect();
  }

  draw() {
    if (!this.source || this.points.length !== 4) return;
    const ctx = this.overlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);

    const pxScale = this.overlayCanvas.width / Math.max(1, this.overlayCanvas.getBoundingClientRect().width);
    const lineWidth = Math.max(2, pxScale * 2.2);
    const innerR = Math.max(11, pxScale * 14);
    const outerR = innerR + pxScale * 6;

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    this.#traceQuad(ctx, this.points);
    ctx.fillStyle = 'rgba(4, 7, 10, 0.58)';
    ctx.fill('evenodd');

    ctx.beginPath();
    this.#traceQuad(ctx, this.points);
    ctx.closePath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#bbff38';
    ctx.shadowColor = 'rgba(187,255,56,.35)';
    ctx.shadowBlur = pxScale * 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    this.points.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, outerR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(11, 14, 19, .9)';
      ctx.fill();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = '#bbff38';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, innerR * 0.42, 0, Math.PI * 2);
      ctx.fillStyle = '#bbff38';
      ctx.fill();

      ctx.fillStyle = '#10150b';
      ctx.font = `${Math.max(9, innerR * 0.7)}px DM Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(idx + 1), pt.x, pt.y + innerR * 0.02);
    });
    ctx.restore();
  }

  #fitStack() {
    if (!this.source) return;
    const availW = Math.max(120, this.viewport.clientWidth - 24);
    const availH = Math.max(120, this.viewport.clientHeight - 24);
    const scale = Math.min(availW / this.source.width, availH / this.source.height);
    this.stack.style.width = `${Math.round(this.source.width * scale)}px`;
    this.stack.style.height = `${Math.round(this.source.height * scale)}px`;
    this.imageCanvas.style.width = '100%';
    this.imageCanvas.style.height = '100%';
    this.overlayCanvas.style.width = '100%';
    this.overlayCanvas.style.height = '100%';
    this.draw();
  }

  #traceQuad(ctx, pts) {
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i += 1) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
  }

  #eventToCanvas(event) {
    const rect = this.overlayCanvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * this.overlayCanvas.width,
      y: ((event.clientY - rect.top) / rect.height) * this.overlayCanvas.height
    };
  }

  #hitRadius() {
    const rect = this.overlayCanvas.getBoundingClientRect();
    return Math.max(14, (30 / Math.max(1, rect.width)) * this.overlayCanvas.width);
  }

  #bindEvents() {
    this.overlayCanvas.addEventListener('pointerdown', (event) => {
      if (!this.source || this.activePointer != null) return;
      const pt = this.#eventToCanvas(event);
      const radius = this.#hitRadius();
      let bestIdx = -1;
      let bestDist = Infinity;
      this.points.forEach((corner, idx) => {
        const d = Math.hypot(corner.x - pt.x, corner.y - pt.y);
        if (d <= radius && d < bestDist) {
          bestIdx = idx;
          bestDist = d;
        }
      });
      if (bestIdx < 0) return;
      event.preventDefault();
      this.dragIndex = bestIdx;
      this.activePointer = event.pointerId;
      this.overlayCanvas.setPointerCapture(event.pointerId);
    });

    this.overlayCanvas.addEventListener('pointermove', (event) => {
      if (event.pointerId !== this.activePointer || this.dragIndex < 0) return;
      event.preventDefault();
      const clamped = clampPoint(
        this.#eventToCanvas(event),
        this.overlayCanvas.width - 1,
        this.overlayCanvas.height - 1
      );
      this.points[this.dragIndex] = clamped;
      this.draw();
      this.onChange?.(this.getPoints(), { manual: true, dragging: true });
    });

    const release = (event) => {
      if (event.pointerId !== this.activePointer) return;
      this.overlayCanvas.releasePointerCapture?.(event.pointerId);
      this.activePointer = null;
      this.dragIndex = -1;
      this.points = orderQuad(this.points);
      this.draw();
      this.onChange?.(this.getPoints(), { manual: true, dragging: false });
    };

    this.overlayCanvas.addEventListener('pointerup', release);
    this.overlayCanvas.addEventListener('pointercancel', release);
  }
}
