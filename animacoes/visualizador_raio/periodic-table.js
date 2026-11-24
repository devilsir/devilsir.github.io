radiusLab.createPeriodicTable = function createPeriodicTable(openInComparator) {
  const { elements, searchElements, exactElement, findIonQuery, formatRadius, formatSpecies, formatIonContext, describeSpecies, matchesIonFilter } = radiusLab.chemistry;
  const sourceFlags = {
    '*': 'Dados estruturais com variação de até 1 pm',
    A: 'Valor de Ahrens (1952)',
    C: 'Calculado por relações de comprimento e força de ligação',
    E: 'Estimado por correlações na publicação',
    M: 'Derivado de óxidos metálicos',
    P: 'Valor de Pauling (1960)',
    R: 'Derivado de curvas de raio e volume',
  };
  const availabilityLabels = {
    cation: 'Com cátions',
    anion: 'Com ânions',
    both: 'Com cátions e ânions',
    none: 'Só raio covalente',
  };
  const kindMarks = { cation: '+', anion: '−', both: '±', none: '·' };

  const bySymbol = new Map(elements.map(element => {
    const positive = element.ions.some(({ charge }) => charge > 0);
    const negative = element.ions.some(({ charge }) => charge < 0);
    const availability = positive && negative ? 'both' : positive ? 'cation' : negative ? 'anion' : 'none';
    return [element.symbol, { ...element, availability }];
  }));
  const section = document.getElementById('periodic');
  const search = document.getElementById('periodic-search');
  const grid = document.getElementById('periodic-grid');
  const heading = document.getElementById('ion-detail-title');
  const detail = heading.closest('.periodic-detail');
  const neutral = document.getElementById('atomic-radius-record');
  const detailSymbol = document.getElementById('ion-detail-symbol');
  const location = document.getElementById('ion-detail-location');
  const chargeFilter = document.getElementById('periodic-charge-filter');
  const chargeFilterBox = document.getElementById('periodic-charge-tools');
  const resultCount = document.getElementById('ion-record-count');
  const results = document.getElementById('ion-radius-table');
  const rows = results.querySelector('tbody');
  const notice = document.getElementById('ion-radius-empty');
  const layoutButtons = [...section.querySelectorAll('[data-periodic-layout]')];
  const layoutMedia = matchMedia('(max-width: 650px)');
  let chosenLayout;
  let selected = bySymbol.get('O');
  let currentElements;

  function elementTile(element, layout) {
    const { symbol, name, z, availability, row, column } = element;
    const description = availabilityLabels[availability];
    const position = layout === 'table' ? ` style="--element-column:${column};--element-row:${row + 1}"` : '';
    const expandedName = layout === 'list' ? `<span class="periodic-tile-name">${name}</span>` : '';
    return `<button type="button" class="periodic-tile" data-periodic-symbol="${symbol}" data-availability="${availability}"${position}
      aria-label="${name}, ${symbol}, número atômico ${z}. ${description}" aria-pressed="${symbol === selected.symbol}"
      title="${name} · ${description}">
      <span class="periodic-tile-number">${z}</span><strong>${symbol}</strong>
      <span class="periodic-tile-mark" aria-hidden="true">${kindMarks[availability]}</span>
      ${expandedName}
    </button>`;
  }

  function renderElements() {
    const query = search.value.trim();
    const preferredLayout = chosenLayout ?? (layoutMedia.matches ? 'list' : 'table');
    const layout = query ? 'list' : preferredLayout;
    for (const button of layoutButtons) {
      button.disabled = Boolean(query);
      button.setAttribute('aria-pressed', String(button.dataset.periodicLayout === layout));
    }

    currentElements = searchElements(query);
    if (currentElements.length === 0) {
      const message = findIonQuery(query) ? 'Nenhum registro cadastrado para essa carga.' : 'Nenhum elemento encontrado.';
      grid.innerHTML = `<p class="empty-search" role="status">${message}</p>`;
      return;
    }

    let labels = '';
    if (layout === 'table') {
      const groups = Array.from({ length: 18 }, (_, index) => `<span class="group-number">${index + 1}</span>`).join('');
      labels = `<div class="periodic-group-numbers" aria-hidden="true">${groups}</div>
        <span class="periodic-series-marker" style="--element-row:7" aria-hidden="true">57–71</span>
        <span class="periodic-series-marker" style="--element-row:8" aria-hidden="true">89–103</span>
        <span class="periodic-series-label" style="--element-row:9">Lantanídios</span>
        <span class="periodic-series-label" style="--element-row:10">Actinídios</span>`;
    }

    grid.innerHTML = `<div class="periodic-${layout}">${labels}${currentElements.map(({ symbol }) => elementTile(bySymbol.get(symbol), layout)).join('')}</div>`;
  }

  function formatCoordination({ number, geometry, source }) {
    if (number === null) {
      const title = source.isolated ? 'NC não se aplica a um íon isolado' : 'Número de coordenação não atribuído';
      return '<span title="' + title + '">—</span>';
    }
    return geometry ? `${number}<small class="coordination-shape">${geometry}</small>` : String(number);
  }

  function comparisonButtons(label, index = '') {
    return `<div class="ion-compare-actions">${['A', 'B'].map(side => `
      <button type="button" class="ion-open-button" data-compare-side="${side.toLowerCase()}" data-ion-index="${index}"
        aria-label="Abrir ${label} no lado ${side} do comparador" title="Abrir no lado ${side}">${side}</button>`
    ).join('')}</div>`;
  }

  function sourceLink(source) {
    return `<a class="table-radius-source" href="${source.url}" target="_blank" rel="noopener noreferrer"
      title="${source.method}">${source.label}</a>`;
  }

  function renderNeutral() {
    const { label, basis, radius, source, note } = describeSpecies({ symbol: selected.symbol, charge: 0 });
    const value = formatRadius(radius) + ' pm';
    neutral.innerHTML = `<div>
        <h3>Átomo neutro</h3>
        <p><strong>${value}</strong> <span>${basis}</span></p>
        ${sourceLink(source)}
        ${note ? `<small class="table-radius-note">${note}</small>` : ''}
      </div>
      ${comparisonButtons(label + ' neutro, ' + value)}`;
  }

  function matchingRecords() {
    const filter = chargeFilter.value;
    return selected.ions.filter(ion => matchesIonFilter(ion, filter)).sort((a, b) => a.charge - b.charge || (a.number ?? Infinity) - (b.number ?? Infinity));
  }

  function renderRecords() {
    const recordSet = matchingRecords();
    results.parentElement.hidden = recordSet.length === 0;
    notice.hidden = recordSet.length > 0;
    const total = selected.ions.length;
    const shown = recordSet.length === total ? String(total) : `${recordSet.length} de ${total}`;
    resultCount.textContent = shown + (shown === '1' ? ' registro iônico' : ' registros iônicos');
    rows.innerHTML = recordSet.map(ion => {
      const { charge, spin, radius, flags, source } = ion;
      const label = formatSpecies(selected.symbol, charge);
      const kind = charge > 0 ? 'cation' : 'anion';
      const notes = [...flags].map(code => sourceFlags[code]).filter(Boolean).join(' · ');
      const flagMarkup = notes ? `<abbr class="radius-marker" title="${notes}">${flags}</abbr>` : '';
      const radiusText = radius === null ? 'Raio indisponível' : formatRadius(radius);
      const radiusLabel = radius === null ? radiusText : radiusText + ' pm';
      const labelWithContext = [label, formatIonContext(ion), radiusLabel, source.label]
        .filter(Boolean).join(', ');
      return `<tr>
        <th scope="row"><span class="ion-label" data-kind="${kind}">${label}</span></th>
        <td>${formatCoordination(ion)}</td>
        <td>${spin ? spin[0].toUpperCase() + spin.slice(1) : '—'}</td>
        <td class="radius-cell">
          <strong>${radiusText}</strong> ${flagMarkup}
          ${sourceLink(source)}
          ${source.orbital ? `<small class="table-radius-context">${source.method}</small>` : ''}
          ${ion.context ? `<small class="table-radius-context">${ion.context}</small>` : ''}
          ${source.note ? `<small class="table-radius-note">${source.note}</small>` : ''}
        </td>
        <td>${comparisonButtons(labelWithContext, ion.index)}</td>
      </tr>`;
    }).join('');
  }

  function selectElement(symbol, moveFocus = false) {
    selected = bySymbol.get(symbol);
    for (const button of grid.querySelectorAll('[data-periodic-symbol]')) {
      button.setAttribute('aria-pressed', String(button.dataset.periodicSymbol === selected.symbol));
    }

    heading.textContent = selected.name;
    detailSymbol.textContent = selected.symbol;
    detailSymbol.dataset.availability = selected.availability;
    const series = selected.row === 8 ? 'Lantanídios' : selected.row === 9 ? 'Actinídios' : 'Grupo ' + selected.column;
    const period = selected.row === 8 ? 6 : selected.row === 9 ? 7 : selected.row;
    location.textContent = `Z = ${selected.z} · ${series} · Período ${period}`;

    renderNeutral();
    const charges = [...new Set(selected.ions.map(({ charge }) => charge))].sort((a, b) => a - b);
    const hasMissingMeasure = selected.ions.some(ion => ion.radius === null);
    chargeFilterBox.hidden = charges.length < 2 && !hasMissingMeasure;
    const byKind = selected.availability === 'both'
      ? '<option value="cation">Só cátions</option><option value="anion">Só ânions</option>'
      : '';
    const byMeasure = hasMissingMeasure
      ? '<option value="with-radius">Com medida</option><option value="without-radius">Sem medida</option>'
      : '';
    chargeFilter.innerHTML = '<option value="all">Todos os registros</option>' + byMeasure + byKind
      + charges.map(charge => `<option value="${charge}">${formatSpecies(selected.symbol, charge)}</option>`).join('');
    const ion = findIonQuery(search.value);
    if (ion?.element.symbol === symbol && selected.defaultReferences.has(ion.charge)) {
      chargeFilter.value = String(ion.charge);
    } else if (hasMissingMeasure) {
      chargeFilter.value = 'with-radius';
    }
    renderRecords();

    if (moveFocus && matchMedia('(max-width: 900px)').matches) {
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start' });
    }
  }

  search.addEventListener('input', renderElements);
  search.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    const element = exactElement(currentElements, search.value);
    if (element) {
      event.preventDefault();
      selectElement(element.symbol, true);
    }
  });

  grid.addEventListener('click', event => {
    const tile = event.target.closest('[data-periodic-symbol]');
    if (tile) selectElement(tile.dataset.periodicSymbol, true);
  });

  detail.addEventListener('click', event => {
    const button = event.target.closest('[data-compare-side]');
    if (!button) return;
    const reference = button.dataset.ionIndex === '' ? null : selected.ions[Number(button.dataset.ionIndex)];
    openInComparator(button.dataset.compareSide, { symbol: selected.symbol, charge: reference?.charge ?? 0, reference });
  });

  chargeFilter.addEventListener('change', renderRecords);
  for (const button of layoutButtons) {
    button.addEventListener('click', () => {
      chosenLayout = button.dataset.periodicLayout;
      renderElements();
    });
  }
  layoutMedia.addEventListener('change', renderElements);
  renderElements();
  selectElement(selected.symbol);
};
