const params=new URLSearchParams(location.search);
const forcedMode=params.get("mode");
const userAgent=navigator.userAgent||"";
const ipadDesktopUA=/Macintosh/i.test(userAgent)&&(navigator.maxTouchPoints||0)>1;
const uaMobile=Boolean(navigator.userAgentData?.mobile)||ipadDesktopUA||/Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(userAgent);
const coarsePointer=matchMedia("(pointer: coarse)").matches;
const compactViewport=matchMedia("(max-width: 900px)").matches;
const touchTablet=coarsePointer&&matchMedia("(max-width: 1180px)").matches;

export const MOBILE_MODE=forcedMode==="mobile"||(forcedMode!=="desktop"&&(uaMobile||compactViewport||touchTablet));

const dpr=Math.max(1,window.devicePixelRatio||1);
export const MOBILE_CONFIG={
  pixelRatio:Math.min(1,dpr),
  maxFps:30,
  discoFps:20,
  partyLightCount:16,
  fallingSombreros:2,
  fallingGuaranas:2,
  fallingGordins:1
};

document.documentElement.classList.toggle("mobile-mode",MOBILE_MODE);
document.documentElement.dataset.renderMode=MOBILE_MODE?"mobile":"desktop";
