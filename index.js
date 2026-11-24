(() => {
  const controls = document.querySelector('#controles');
  const search = document.querySelector('#search');
  const grid = document.querySelector('#projects');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const counter = document.querySelector('#count');
  const clear = document.querySelector('#clear');
  const empty = document.querySelector('#empty');
  const normalize = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const projects = [...grid.querySelectorAll('.project')].map((element) => ({
    element,
    button: element.querySelector('.project-info'),
    tooltip: element.querySelector('.project-tooltip'),
    text: normalize(`${element.textContent} ${element.dataset.search}`),
    topics: element.dataset.topics.split(' ')
  }));
  const saved = history.state?.centralProjetos;
  const requested = saved?.active ?? new URLSearchParams(location.search).get('tipo');
  let active = filters.some((filter) => filter.dataset.filter === requested) ? requested : 'todos';
  let openProject = null;
  if (typeof saved?.query === 'string') search.value = saved.query;

  function closeDetails() {
    if (!openProject) return;
    openProject.tooltip.hidden = true;
    openProject.button.setAttribute('aria-expanded', 'false');
    openProject = null;
  }

  function showDetails(project) {
    if (openProject === project) return;
    closeDetails();
    project.tooltip.hidden = false;
    project.button.setAttribute('aria-expanded', 'true');
    openProject = project;
  }

  function update() {
    const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
    const showingAll = active === 'todos' && terms.length === 0;
    let count = 0;

    for (const {element, topics, text} of projects) {
      const matchesFilter = topics.includes('restritos')
        ? active === 'restritos'
        : active === 'todos' || topics.includes(active);
      const visible = matchesFilter && terms.every((term) => text.includes(term));
      element.hidden = !visible;
      if (visible) count += 1;
    }
    if (openProject?.element.hidden) closeDetails();

    for (const filter of filters) filter.setAttribute('aria-pressed', String(filter.dataset.filter === active));
    grid.classList.toggle('projects--all', showingAll);
    counter.textContent = count === 1 ? '1 projeto' : `${count} projetos`;
    clear.hidden = showingAll;
    empty.hidden = count > 0;
  }

  for (const project of projects) {
    const {element, button} = project;
    button.hidden = false;

    element.addEventListener('focusout', (event) => {
      if (openProject === project && !element.contains(event.relatedTarget)) closeDetails();
    });
    button.addEventListener('click', () => {
      if (openProject === project) closeDetails();
      else showDetails(project);
    });
  }

  search.addEventListener('input', update);
  for (const filter of filters) {
    filter.addEventListener('click', () => {
      active = filter.dataset.filter;
      update();
    });
  }

  clear.addEventListener('click', () => {
    search.value = '';
    active = 'todos';
    search.focus();
    update();
  });

  grid.addEventListener('click', (event) => {
    if (!event.target.closest('.project-link')) return;
    history.replaceState({...history.state, centralProjetos: {query: search.value, active}}, '');
  });

  document.addEventListener('pointerdown', (event) => {
    if (openProject && !openProject.element.contains(event.target)) closeDetails();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const origin = openProject;
      const returnFocus = origin?.tooltip.contains(document.activeElement);
      closeDetails();
      if (returnFocus) origin.button.focus();
    }
    if (event.key !== '/' || event.ctrlKey || event.altKey || event.metaKey || event.defaultPrevented) return;
    if (event.target instanceof HTMLElement && event.target.closest('input, textarea, select, [contenteditable]')) return;
    event.preventDefault();
    search.focus();
  });

  window.addEventListener('pageshow', update);
  controls.hidden = false;
  update();
})();
