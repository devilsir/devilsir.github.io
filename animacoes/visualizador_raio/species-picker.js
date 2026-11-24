radiusLab.createSpeciesPicker = function createSpeciesPicker(applySpecies) {
  const { describeSpecies, searchElements, exactElement, findIonQuery, elementBySymbol, formatRadius, formatSpecies, matchesIonFilter } = radiusLab.chemistry;
  const dialog = document.getElementById('species-dialog');
  const description = document.getElementById('picker-description');
  const search = document.getElementById('element-search');
  const elementList = document.getElementById('picker-elements');
  const speciesList = document.getElementById('picker-species');
  const speciesTitle = document.getElementById('picker-species-title');
  const chargeTools = document.getElementById('picker-charge-tools');
  const chargeFilter = document.getElementById('picker-charge-filter');
  const charges = document.getElementById('picker-charge-options');
  const layoutButtons = dialog.querySelectorAll('[data-picker-layout]');
  let target;
  let trigger;
  let activeSpecies;
  let selected;
  let neutralOnly;
  let layout;
  let matches = [];

  function paintElements() {
    const query = search.value.trim();
    const effectiveLayout = query ? 'list' : layout;
    matches = searchElements(query, { neutralOnly });
    for (const button of layoutButtons) {
      button.disabled = Boolean(query);
      button.setAttribute('aria-pressed', String(button.dataset.pickerLayout === effectiveLayout));
    }

    if (!matches.length) {
      const message = findIonQuery(query) ? 'Nenhum registro cadastrado para essa carga.' : 'Nenhum elemento encontrado.';
      elementList.innerHTML = `<p class="empty-search" role="status">${message}</p>`;
      return;
    }

    const table = effectiveLayout === 'table';
    const headers = table
      ? Array.from({ length: 18 }, (_, index) => `<span class="group-number" aria-hidden="true">${index + 1}</span>`).join('')
      : '';
    const series = table
      ? '<span class="picker-series" style="--period:9">Lantanídios</span><span class="picker-series" style="--period:10">Actinídios</span>'
      : '';
    const items = matches.map(element => `
      <button type="button" class="element-tile" data-element="${element.symbol}"
        aria-label="${element.name}, ${element.symbol}, número atômico ${element.z}"
        aria-pressed="${element === selected}"
        style="--group:${element.column};--period:${element.row + 1}">
        <small>${element.z}</small><strong>${element.symbol}</strong>
        ${table ? '' : `<span>${element.name}</span>`}
      </button>`).join('');

    elementList.innerHTML = `<div class="element-scroll"><div class="element-${effectiveLayout}">${headers}${series}${items}</div></div>`;
  }

  function paintReferences() {
    const symbol = selected.symbol;
    const filter = chargeFilter.value;
    const choices = [];
    if (filter === 'all' || filter === 'with-radius' || filter === '0') choices.push({ symbol, charge: 0 });
    for (const reference of selected.ions) {
      if (matchesIonFilter(reference, filter)) choices.push({ symbol, charge: reference.charge, reference });
    }
    charges.innerHTML = choices.map(choice => {
      const species = describeSpecies(choice);
      const pressed = species.element === activeSpecies.element && species.charge === activeSpecies.charge
        && species.reference === activeSpecies.reference;
      const data = species.radius === null ? 'Raio indisponível' : formatRadius(species.radius) + ' pm';
      const source = [species.source?.label, species.note].filter(Boolean).join(' · ');
      return `<button type="button" class="charge-option" data-charge="${species.charge}"
        data-ion-index="${species.reference?.index ?? ''}" data-kind="${species.kind}" aria-pressed="${pressed}">
        <strong>${species.label}</strong>
        <span>${data}<small>${species.basis}</small><small class="charge-source">${source}</small></span>
      </button>`;
    }).join('');
  }

  function paintCharges(filter) {
    speciesList.hidden = neutralOnly;
    if (neutralOnly) return;

    speciesTitle.textContent = selected.name + ' · espécies e medidas';
    const options = [...new Set(selected.ions.map(({ charge }) => charge))].sort((a, b) => a - b);
    chargeTools.hidden = options.length === 0;
    const hasMissingMeasure = selected.ions.some(ion => ion.radius === null);
    const byMeasure = hasMissingMeasure
      ? '<option value="with-radius">Com medida</option><option value="without-radius">Sem medida</option>'
      : '';
    chargeFilter.innerHTML = '<option value="all">Todos os registros</option>' + byMeasure + '<option value="0">Átomo neutro</option>'
      + options.map(charge => `<option value="${charge}">${formatSpecies(selected.symbol, charge)}</option>`).join('');
    chargeFilter.value = filter ?? (hasMissingMeasure ? 'with-radius' : 'all');
    paintReferences();
  }

  function chooseElement(element) {
    selected = element;
    if (neutralOnly) {
      applySpecies(target, { symbol: selected.symbol, charge: 0 });
      dialog.close();
      return;
    }
    paintElements();
    const ion = findIonQuery(search.value);
    paintCharges(ion?.element === element ? String(ion.charge) : undefined);
    (chargeTools.hidden ? charges.querySelector('button') : chargeFilter).focus();
  }

  search.addEventListener('input', paintElements);
  search.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    const element = exactElement(matches, search.value);
    if (element) {
      event.preventDefault();
      chooseElement(element);
    }
  });

  elementList.addEventListener('click', event => {
    const button = event.target.closest('[data-element]');
    if (button) chooseElement(elementBySymbol.get(button.dataset.element));
  });

  chargeFilter.addEventListener('change', paintReferences);
  charges.addEventListener('click', event => {
    const button = event.target.closest('[data-charge]');
    if (!button) return;
    const charge = Number(button.dataset.charge);
    const reference = charge ? selected.ions[Number(button.dataset.ionIndex)] : null;
    applySpecies(target, { symbol: selected.symbol, charge, reference });
    dialog.close();
  });

  for (const button of layoutButtons) {
    button.addEventListener('click', () => {
      layout = button.dataset.pickerLayout;
      paintElements();
    });
  }

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => trigger?.focus());

  return function openSpeciesPicker(side, species, mode, opener) {
    target = side;
    trigger = opener;
    activeSpecies = species;
    selected = species.element;
    neutralOnly = mode === 'linked' && side === 'a';
    layout = matchMedia('(max-width: 650px)').matches ? 'list' : 'table';
    description.textContent = neutralOnly
      ? 'Escolha o elemento para comparar com seu íon de referência.'
      : `Selecione um elemento e um registro para o lado ${side.toUpperCase()}.`;
    search.value = '';
    paintElements();
    paintCharges(species.reference && species.radius === null ? String(species.charge) : undefined);
    dialog.showModal();
  };
};
