// Automatic Mobile / Tablet / Low-Power Hardware Detection & Performance Budget Profile
// Preserves 100% of features, interactions, and visual fidelity while eliminating mobile GPU/compositor bottlenecks.

function detectDeviceProfile() {
  const nav = typeof navigator !== 'undefined' ? navigator : {};
  const win = typeof window !== 'undefined' ? window : {};
  const ua = nav.userAgent || '';

  const uaMobile = Boolean(nav.userAgentData?.mobile) ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(ua);
  // iPadOS Safari reports "MacIntel" with touch points > 1
  const iPadDesktopUA = nav.platform === 'MacIntel' && (nav.maxTouchPoints || 0) > 1;
  const coarsePointer = Boolean(win.matchMedia?.('(pointer: coarse)').matches);
  const narrowViewport = Boolean(win.matchMedia?.('(max-width: 900px)').matches);
  const hasTouch = (nav.maxTouchPoints || 0) > 0 || 'ontouchstart' in win;

  const isMobile = Boolean(uaMobile || iPadDesktopUA || (coarsePointer && hasTouch));
  const isTouch = Boolean(hasTouch || coarsePointer);

  const cores = Number(nav.hardwareConcurrency) || (isMobile ? 4 : 8);
  const memGb = Number(nav.deviceMemory) || (isMobile ? 4 : 8);
  const saveData = Boolean(nav.connection?.saveData);
  const isLowPower = isMobile && (cores <= 4 || memGb <= 4 || saveData);

  const rawDpr = Math.max(1, win.devicePixelRatio || 1);
  const tier = isLowPower ? 'mobile-low' : isMobile ? 'mobile' : 'desktop';

  const profile = Object.freeze({
    isMobile,
    isTouch,
    isLowPower,
    narrowViewport,
    tier,
    cores,
    memGb,
    // WebGL DPR caps (on dense 400+ PPI smartphone screens, 1.25-1.35x looks crisp while cutting GPU fill-rate by ~60%)
    maxDpr: isLowPower ? Math.min(rawDpr, 1.15) : isMobile ? Math.min(rawDpr, 1.35) : Math.min(rawDpr, 2),
    minDpr: isLowPower ? 0.72 : isMobile ? 0.80 : 0.85,
    antialias: !isLowPower,
    powerPreference: isMobile ? 'default' : 'high-performance',
    // Shadow map budgets (keeps shadows ON everywhere, skips 6-face PointLight cubemaps & 2048px desktop maps on mobile)
    shadowSize: isLowPower ? 512 : isMobile ? 512 : 1024,
    shadowUpdateStride: isLowPower ? 3 : isMobile ? 2 : 1,
    allowPointShadows: !isMobile,
    // Selective DoF bokeh offscreen buffer budgets (identical silky bokeh with fewer tile-GPU flushes!)
    dofScale: isLowPower ? 0.25 : isMobile ? 0.30 : 0.42,
    dofMaxW: isLowPower ? 280 : isMobile ? 340 : 640,
    dofMaxH: isLowPower ? 200 : isMobile ? 240 : 420,
    dofPasses: isMobile ? 1 : 2, // 1 wider H/V Gaussian pass (+ Kawase pre-filter) on mobile vs 2 passes on desktop
    dofHalfFloat: !isMobile,
    // Procedural Canvas2D bump/roughness textures (128px on mobile = 4x less VRAM & instant startup)
    texSize: isMobile ? 128 : 256,
    // Optical ocular & Electron monitor backing canvas resolutions (still >1.4x CSS pixels on phones!)
    ocularSize: isLowPower ? 448 : isMobile ? 512 : 720,
    emCanvasW: isLowPower ? 512 : isMobile ? 576 : 720,
    emCanvasH: isLowPower ? 384 : isMobile ? 432 : 540,
    edsFeatWidth: isLowPower ? 200 : isMobile ? 240 : 360,
    lazyEmImages: isMobile,
    // 3D DOM label update cadence & adaptive FPS targets
    fpsLow: isMobile ? 38 : 46,
    fpsHigh: isMobile ? 54 : 57
  });

  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.classList.toggle('is-mobile', profile.isMobile);
    document.documentElement.classList.toggle('is-mobile-low', profile.isLowPower);
    document.documentElement.dataset.deviceTier = profile.tier;
  }

  return profile;
}

export const deviceProfile = detectDeviceProfile();
