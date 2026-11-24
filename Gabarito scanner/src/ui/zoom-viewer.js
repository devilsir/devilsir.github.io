import { clamp } from '../utils/math.js';

export class ZoomPanViewer {
  constructor({ viewport, stage, onTap, onZoomChange }) {
    this.viewport = viewport;
    this.stage = stage;
    this.onTap = onTap;
    this.onZoomChange = onZoomChange;
    this.contentWidth = 1;
    this.contentHeight = 1;
    this.scale = 1;
    this.fitScale = 1;
    this.translateX = 0;
    this.translateY = 0;
    this.pointers = new Map();
    this.gesture = null;

    this.resizeObserver = new ResizeObserver(() => this.fit());
    this.resizeObserver.observe(viewport);
    this.#bindEvents();
  }

  setContent(width, height) {
    this.contentWidth = Math.max(1, width);
    this.contentHeight = Math.max(1, height);
    this.stage.style.width = `${this.contentWidth}px`;
    this.stage.style.height = `${this.contentHeight}px`;
    this.fit();
  }

  fit() {
    if (!this.viewport.clientWidth || !this.viewport.clientHeight) return;
    this.fitScale = Math.min(
      (this.viewport.clientWidth - 24) / this.contentWidth,
      (this.viewport.clientHeight - 24) / this.contentHeight
    );
    this.scale = Math.max(0.025, this.fitScale);
    this.translateX = (this.viewport.clientWidth - this.contentWidth * this.scale) / 2;
    this.translateY = (this.viewport.clientHeight - this.contentHeight * this.scale) / 2;
    this.#apply('fit');
  }

  reset100() {
    this.scale = 1;
    this.translateX = (this.viewport.clientWidth - this.contentWidth) / 2;
    this.translateY = (this.viewport.clientHeight - this.contentHeight) / 2;
    this.#apply('100%');
  }

  zoomIn() {
    this.zoomAt(1.24, this.viewport.clientWidth / 2, this.viewport.clientHeight / 2);
  }

  zoomOut() {
    this.zoomAt(1 / 1.24, this.viewport.clientWidth / 2, this.viewport.clientHeight / 2);
  }

  zoomAt(factor, pivotX, pivotY) {
    const prevScale = this.scale;
    const minScale = Math.max(0.02, this.fitScale * 0.72);
    const nextScale = clamp(prevScale * factor, minScale, 6);
    const imgX = (pivotX - this.translateX) / prevScale;
    const imgY = (pivotY - this.translateY) / prevScale;
    this.scale = nextScale;
    this.translateX = pivotX - imgX * nextScale;
    this.translateY = pivotY - imgY * nextScale;
    this.#constrain();
    this.#apply();
  }

  focusRect(rect, padding = 80) {
    if (!rect) return;
    const targetScale = Math.min(
      4,
      Math.max(
        this.fitScale,
        Math.min(
          (this.viewport.clientWidth - padding) / Math.max(1, rect.width),
          (this.viewport.clientHeight - padding) / Math.max(1, rect.height)
        )
      )
    );
    this.scale = targetScale;
    this.translateX = this.viewport.clientWidth / 2 - (rect.x + rect.width / 2) * targetScale;
    this.translateY = this.viewport.clientHeight / 2 - (rect.y + rect.height / 2) * targetScale;
    this.#constrain();
    this.#apply();
  }

  screenToImage(clientX, clientY) {
    const rect = this.viewport.getBoundingClientRect();
    return {
      x: (clientX - rect.left - this.translateX) / this.scale,
      y: (clientY - rect.top - this.translateY) / this.scale
    };
  }

  destroy() {
    this.resizeObserver.disconnect();
  }

  #constrain() {
    const vw = this.viewport.clientWidth;
    const vh = this.viewport.clientHeight;
    const scaledW = this.contentWidth * this.scale;
    const scaledH = this.contentHeight * this.scale;
    this.translateX = scaledW <= vw ? (vw - scaledW) / 2 : clamp(this.translateX, vw - scaledW - 90, 90);
    this.translateY = scaledH <= vh ? (vh - scaledH) / 2 : clamp(this.translateY, vh - scaledH - 90, 90);
  }

  #apply(label) {
    this.stage.style.transform = `translate3d(${this.translateX}px, ${this.translateY}px, 0) scale(${this.scale})`;
    const percent = Math.round(this.scale * 100);
    this.onZoomChange?.({
      scale: this.scale,
      percent,
      label: label || `${percent}%`,
      isFit: Math.abs(this.scale - this.fitScale) < 0.001
    });
  }

  #bindEvents() {
    this.viewport.addEventListener(
      'wheel',
      (event) => {
        event.preventDefault();
        const rect = this.viewport.getBoundingClientRect();
        const factor = Math.exp(-event.deltaY * 0.00135);
        this.zoomAt(factor, event.clientX - rect.left, event.clientY - rect.top);
      },
      { passive: false }
    );

    this.viewport.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      this.viewport.setPointerCapture(event.pointerId);
      this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      this.viewport.classList.add('is-panning');

      if (this.pointers.size === 1) {
        this.gesture = {
          type: 'pan',
          startX: event.clientX,
          startY: event.clientY,
          originX: this.translateX,
          originY: this.translateY,
          moved: false
        };
      } else if (this.pointers.size === 2) {
        const [p1, p2] = [...this.pointers.values()];
        const rect = this.viewport.getBoundingClientRect();
        const midX = (p1.x + p2.x) / 2 - rect.left;
        const midY = (p1.y + p2.y) / 2 - rect.top;
        this.gesture = {
          type: 'pinch',
          initialDistance: Math.hypot(p1.x - p2.x, p1.y - p2.y),
          initialScale: this.scale,
          imageX: (midX - this.translateX) / this.scale,
          imageY: (midY - this.translateY) / this.scale,
          moved: true
        };
      }
    });

    this.viewport.addEventListener('pointermove', (event) => {
      if (!this.pointers.has(event.pointerId)) return;
      event.preventDefault();
      this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (this.pointers.size === 2) {
        const [p1, p2] = [...this.pointers.values()];
        const rect = this.viewport.getBoundingClientRect();
        if (this.gesture?.type !== 'pinch') {
          this.gesture = {
            type: 'pinch',
            initialDistance: Math.hypot(p1.x - p2.x, p1.y - p2.y),
            initialScale: this.scale,
            imageX: ((p1.x + p2.x) / 2 - rect.left - this.translateX) / this.scale,
            imageY: ((p1.y + p2.y) / 2 - rect.top - this.translateY) / this.scale,
            moved: true
          };
        }
        const dist = Math.max(1, Math.hypot(p1.x - p2.x, p1.y - p2.y));
        const midX = (p1.x + p2.x) / 2 - rect.left;
        const midY = (p1.y + p2.y) / 2 - rect.top;
        this.scale = clamp(
          this.gesture.initialScale * (dist / Math.max(1, this.gesture.initialDistance)),
          Math.max(0.02, this.fitScale * 0.72),
          6
        );
        this.translateX = midX - this.gesture.imageX * this.scale;
        this.translateY = midY - this.gesture.imageY * this.scale;
        this.#constrain();
        this.#apply();
      } else if (this.pointers.size === 1 && this.gesture?.type === 'pan') {
        const dx = event.clientX - this.gesture.startX;
        const dy = event.clientY - this.gesture.startY;
        if (Math.hypot(dx, dy) > 5) this.gesture.moved = true;
        this.translateX = this.gesture.originX + dx;
        this.translateY = this.gesture.originY + dy;
        this.#constrain();
        this.#apply();
      }
    });

    const release = (event) => {
      if (!this.pointers.has(event.pointerId)) return;
      const wasTap = this.pointers.size === 1 && this.gesture?.type === 'pan' && !this.gesture.moved;
      this.pointers.delete(event.pointerId);
      this.viewport.releasePointerCapture?.(event.pointerId);
      if (wasTap) {
        this.onTap?.(this.screenToImage(event.clientX, event.clientY), event);
      }
      if (!this.pointers.size) {
        this.viewport.classList.remove('is-panning');
        this.gesture = null;
      } else {
        const remaining = [...this.pointers.values()][0];
        this.gesture = {
          type: 'pan',
          startX: remaining.x,
          startY: remaining.y,
          originX: this.translateX,
          originY: this.translateY,
          moved: true
        };
      }
    };

    this.viewport.addEventListener('pointerup', release);
    this.viewport.addEventListener('pointercancel', release);
  }
}
