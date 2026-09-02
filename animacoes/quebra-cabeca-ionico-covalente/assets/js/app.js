const frameIons = document.getElementById('frame-ions');
const frameCov = document.getElementById('frame-cov');
const tabs = [...document.querySelectorAll('.tab')];

const views = {
  ions: 'views/ions.html',
  cov: 'views/covalente.html'
};

function ensureLoaded(frame, src){
  const normalized = new URL(src, window.location.href).href;
  if(frame.dataset.loaded !== normalized){
    frame.src = src;
    frame.dataset.loaded = normalized;
  }
}

function setView(view){
  tabs.forEach(tab => {
    const active = tab.dataset.view === view;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active ? 'true' : 'false');
    tab.tabIndex = active ? 0 : -1;
  });
  const ionsActive = view === 'ions';
  frameIons.classList.toggle('active', ionsActive);
  frameCov.classList.toggle('active', !ionsActive);
  frameIons.hidden = !ionsActive;
  frameCov.hidden = ionsActive;
  frameIons.setAttribute('aria-hidden', ionsActive ? 'false' : 'true');
  frameCov.setAttribute('aria-hidden', ionsActive ? 'true' : 'false');
  if('inert' in frameIons){
    frameIons.inert = !ionsActive;
    frameCov.inert = ionsActive;
  }

  if(view === 'ions') ensureLoaded(frameIons, views.ions);
  if(view === 'cov') ensureLoaded(frameCov, views.cov);
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => setView(tab.dataset.view));
  tab.addEventListener('keydown', event => {
    let next = index;
    if(event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
    else if(event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
    else if(event.key === 'Home') next = 0;
    else if(event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].focus();
    setView(tabs[next].dataset.view);
  });
});
setView('ions');
