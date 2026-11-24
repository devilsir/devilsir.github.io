export function node(tag, properties = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(properties)) {
    if (key.startsWith('on')) element.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key in element && key !== 'style') element[key] = value;
    else element.setAttribute(key, value);
  }
  element.append(...children);
  return element;
}

export function button(label, action, properties = {}) {
  return node('button', { type: 'button', onClick: action, ...properties }, label);
}

export function toggle(label, initial, change) {
  let value = initial;
  const control = button(label, () => {
    value = !value;
    control.setAttribute('aria-pressed', value);
    change(value);
  }, { 'aria-pressed': initial });
  return control;
}

export function select(label, values, initial, change) {
  const children = [];
  for (const [key, entry] of Object.entries(values)) {
    if (entry && typeof entry === 'object') {
      children.push(node('optgroup', { label: key },
        ...Object.entries(entry).map(([value, title]) => node('option', { value }, title))));
    } else {
      children.push(node('option', { value: key }, entry));
    }
  }
  const input = node('select', { onChange: event => change(event.target.value) }, ...children);
  input.value = initial;
  return { element: node('label', { className: 'field' }, label, input), input };
}

export function range(label, min, max, step, value, change, format = String, { wheel = false, reset = null } = {}) {
  const output = node('output', {}, format(value));
  const input = node('input', {
    type: 'range', min, max, step, value, 'aria-label': label,
    onInput: event => {
      const next = Number(event.target.value);
      syncTrack(next);
      output.textContent = format(next);
      change(next);
    }
  });
  function syncTrack(val) {
    const lo = Number(input.min);
    const hi = Number(input.max);
    const span = Math.max(1e-6, hi - lo);
    const pct = Math.max(0, Math.min(100, ((val - lo) / span) * 100));
    if (lo < 0 && hi > 0) {
      const zero = ((0 - lo) / span) * 100;
      input.style.setProperty('--fill-start', `${Math.min(zero, pct).toFixed(2)}%`);
      input.style.setProperty('--fill-end', `${Math.max(zero, pct).toFixed(2)}%`);
    } else {
      input.style.setProperty('--fill-start', '0%');
      input.style.setProperty('--fill-end', `${pct.toFixed(2)}%`);
    }
  }
  syncTrack(Number(value));
  const wrapper = node('label', { className: 'field' },
    node('span', { className: 'field-title' }, label, output), input);
  if (reset !== null) {
    wrapper.title = 'Duplo clique para restaurar padrão';
    input.addEventListener('dblclick', () => {
      input.value = reset;
      syncTrack(reset);
      output.textContent = format(reset);
      change(reset);
    });
  }
  if (wheel) {
    wrapper.addEventListener('wheel', event => {
      event.preventDefault();
      const lo = Number(input.min);
      const hi = Number(input.max);
      const st = Number(input.step) || step || 1;
      const dir = event.deltaY < 0 ? 1 : -1;
      const mult = event.shiftKey ? 5 : 1;
      const next = Math.max(lo, Math.min(hi, Number(input.value) + dir * st * mult));
      const rounded = Number(next.toFixed(4));
      if (rounded !== Number(input.value)) {
        input.value = rounded;
        syncTrack(rounded);
        output.textContent = format(rounded);
        change(rounded);
      }
    }, { passive: false });
  }
  return {
    element: wrapper,
    input,
    set(next) {
      input.value = next;
      syncTrack(Number(next));
      output.textContent = format(next);
    }
  };
}

export const row = (...children) => node('div', { className: 'row' }, ...children);
export const card = (title, content) => node('section', { className: 'card' }, node('h3', {}, title),
  typeof content === 'string' ? node('p', {}, content) : content);
export const note = message => node('div', { className: 'note' }, message);
export const heading = title => node('h2', {}, title);
export const legend = entries => node('div', { className: 'legend' }, ...entries.map(([color, label]) =>
  node('span', {}, node('i', { style: 'background:' + color }), label)));
export const formatNumber = (value, digits = 0) => value.toLocaleString('pt-BR', { maximumFractionDigits: digits });

export function metric(label, value) {
  const strong = node('strong', {}, value);
  return { element: node('div', { className: 'metric' }, node('span', {}, label), strong), value: strong };
}

// Smart viewport-clamped 3D hover tooltip with zero jitter
export function showTooltip(tooltip, viewport, clientX, clientY, title, subtitle = '', color = null) {
  if (tooltip.dataset.title !== title || tooltip.dataset.sub !== subtitle || tooltip.dataset.color !== (color || '')) {
    tooltip.dataset.title = title;
    tooltip.dataset.sub = subtitle;
    tooltip.dataset.color = color || '';
    const dot = node('span', { className: 'tooltip-dot', style: color ? `background:${color};color:${color}` : '' });
    const textWrap = node('span', { className: 'tooltip-text' },
      node('span', {}, title),
      ...(subtitle ? [node('span', { className: 'tooltip-sub' }, subtitle)] : [])
    );
    tooltip.replaceChildren(dot, textWrap);
  }
  tooltip.hidden = false;
  viewport.classList.add('is-hovering');
  const bounds = viewport.getBoundingClientRect();
  const tw = tooltip.offsetWidth || 140;
  const th = tooltip.offsetHeight || 34;
  let x = clientX - bounds.left + 14;
  let y = clientY - bounds.top - th - 12;
  if (x + tw > bounds.width - 10) x = clientX - bounds.left - tw - 14;
  if (x < 8) x = 8;
  if (y < 8) y = clientY - bounds.top + 18;
  if (y + th > bounds.height - 8) y = bounds.height - th - 8;
  tooltip.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
}

export function hideTooltip(tooltip, viewport) {
  tooltip.hidden = true;
  viewport.classList.remove('is-hovering');
}
