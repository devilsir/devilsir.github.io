(() => {
  'use strict';
  let lastX = 50;
  let lastPlayer = null;
  let raf = 0;

  const updateSceneMotion = () => {
    const stage = document.querySelector('.exploration-stage');
    const player = stage && stage.querySelector('.player-character');
    if (stage && player) {
      const x = Number.parseFloat(player.style.left) || 50;
      const far = (50 - x) * 0.14;
      const mid = (50 - x) * 0.28;
      const near = (50 - x) * 0.42;
      const region = stage.closest('.region-screen');
      const targets = region ? [stage, region] : [stage];
      for (const target of targets) {
        target.style.setProperty('--runner-progress', String((x - 50) / 50));
        target.style.setProperty('--parallax-far', `${far.toFixed(2)}px`);
        target.style.setProperty('--parallax-mid', `${mid.toFixed(2)}px`);
        target.style.setProperty('--parallax-near', `${near.toFixed(2)}px`);
      }
      if (player !== lastPlayer) {
        lastPlayer = player;
        lastX = x;
      }
      if (Math.abs(x - lastX) > 0.015) {
        player.classList.toggle('facing-left', x < lastX);
        lastX = x;
      }
      player.classList.toggle('near-interaction', Boolean(stage.querySelector('.interact-prompt')));
    } else {
      lastPlayer = null;
      lastX = 50;
    }
    raf = window.requestAnimationFrame(updateSceneMotion);
  };

  const syncVisibility = () => {
    document.documentElement.classList.toggle('ec-tab-hidden', document.hidden);
  };
  document.addEventListener('visibilitychange', syncVisibility, {passive:true});
  syncVisibility();
  raf = window.requestAnimationFrame(updateSceneMotion);
  window.addEventListener('pagehide', () => window.cancelAnimationFrame(raf), {once:true});
})();
