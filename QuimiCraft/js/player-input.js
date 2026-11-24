"use strict";

globalThis.QuimiCraftInput = (() => {
  function create({canvas, document, touch, canPlay, isPlaying, onPlay, onPause, onFallback, look, attack, use}) {
    let mode = touch ? "touch" : "lock";
    let pending = false;
    let token = 0;
    let timeout = 0;
    let drag = null;
    const held = () => document.pointerLockElement === canvas;

    function activateFallback(announce = false) {
      token++;
      clearTimeout(timeout);
      pending = false;
      mode = "drag";
      if (held()) document.exitPointerLock?.();
      if (canPlay()) onPlay(mode);
      if (announce) onFallback();
    }

    function request({notify = false} = {}) {
      if (!canPlay()) return false;
      if (mode !== "lock" || held()) {
        onPlay(mode);
        return true;
      }
      if (pending) return true;
      pending = true;
      const attempt = ++token;
      const fail = () => {
        if (pending && attempt === token) activateFallback(notify || canPlay());
      };
      try {
        const requestLock = canvas.requestPointerLock;
        if (!requestLock) fail();
        else {
          requestLock.call(canvas)?.catch(fail);
          timeout = setTimeout(fail, 1000);
        }
      } catch {
        fail();
      }
      return true;
    }

    document.addEventListener("pointerlockerror", () => {
      if (pending) activateFallback(true);
    });
    document.addEventListener("pointerlockchange", () => {
      if (mode !== "lock") {
        if (held()) document.exitPointerLock?.();
        return;
      }
      clearTimeout(timeout);
      pending = false;
      if (held()) {
        if (canPlay()) onPlay(mode);
        else document.exitPointerLock?.();
      } else if (isPlaying()) onPause();
    });
    document.addEventListener("mousemove", event => {
      if (mode === "lock" && held() && isPlaying()) look(event.movementX, event.movementY, .00155);
    });
    canvas.addEventListener("pointerdown", event => {
      if (mode === "lock" || !isPlaying() || drag || event.button !== 0) return;
      drag = {id: event.pointerId, x: event.clientX, y: event.clientY, distance: 0};
      canvas.setPointerCapture?.(event.pointerId);
    });
    canvas.addEventListener("pointermove", event => {
      if (!drag || drag.id !== event.pointerId || !isPlaying()) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      drag.distance += Math.hypot(dx, dy);
      drag.x = event.clientX;
      drag.y = event.clientY;
      look(dx, dy, .0042);
    });
    canvas.addEventListener("pointerup", event => {
      if (drag?.id !== event.pointerId) return;
      const click = drag.distance < 4 && mode === "drag" && isPlaying();
      drag = null;
      if (click) attack();
    });
    for (const name of ["pointercancel", "lostpointercapture"]) {
      canvas.addEventListener(name, event => {
        if (drag?.id === event.pointerId) drag = null;
      });
    }
    canvas.addEventListener("mousedown", event => {
      if (!isPlaying() || event.sourceCapabilities?.firesTouchEvents) return;
      if (event.button === 2) use();
      if (event.button === 0 && mode === "lock") attack(true);
    });
    canvas.addEventListener("contextmenu", event => event.preventDefault());

    function turn(keys, dt) {
      if (mode !== "drag") return;
      const dx = (Number(!!keys.ArrowRight) - Number(!!keys.ArrowLeft)) * dt * 640;
      const dy = (Number(!!keys.ArrowDown) - Number(!!keys.ArrowUp)) * dt * 640;
      if (dx || dy) look(dx, dy, .0042);
    }

    return {request, turn, clear: () => { drag = null; }, useDrag: activateFallback,
      retryLock() { mode = "lock"; request({notify: true}); },
      get mode() { return mode; }};
  }

  return {create};
})();
