(function () {
  'use strict';
  function apply(settings) {
    const root = document.documentElement;
    root.classList.toggle('high-contrast', !!settings.highContrast);
    root.classList.toggle('reduced-motion', !!settings.reducedMotion);
    root.classList.toggle('large-text', !!settings.largeText);
    root.classList.toggle('dyslexia-friendly', !!settings.dyslexia);
    root.classList.toggle('projector-mode', !!window.LexiconStorage.state.teacher.projector);
    root.style.setProperty('--touch-opacity', String(settings.controlOpacity ?? .78));
    document.body?.classList.toggle('left-handed', !!settings.leftHanded);
  }
  function supportsTouch() { return matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0; }
  window.LexiconAccessibility = { apply, supportsTouch };
})();
