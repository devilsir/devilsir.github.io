(() => {
  'use strict';
  const source = document.currentScript;
  const profiles = {
    timbo: {
      heading: 'Acesso ao projeto',
      salt: '86fb9ffe4d4cf2069eb5800f1a065070',
      hash: 'db106d3c24e4362ac06194c60304bbe3e1f392dc7e5f20062dd00bd064edcfe7'
    },
    albums: {
      heading: 'Acesso ao álbum',
      salt: '32d51ad6b4ede43b924489e8f755e85f',
      hash: 'e2d181d0dd2f3d91c28984813f4aecc6bedb10e6850c89eb50c9db03c21620c6'
    }
  };
  const profile = source.dataset.accessProfile;
  const spec = profiles[profile];
  if (!spec) return;
  const root = document.documentElement;
  const storageKey = 'portfolio:access:v1:' + profile;
  root.classList.add('access-locked');

  function unlock() {
    root.classList.remove('access-locked');
    document.querySelector('#access-gate')?.remove();
  }
  try {
    if (sessionStorage.getItem(storageKey) === spec.hash) { unlock(); return; }
  } catch (_) {}

  const fromHex = hex => new Uint8Array(hex.match(/../g).map(chunk => parseInt(chunk, 16)));
  async function checkPassword(value) {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(value.normalize('NFC')), 'PBKDF2', false, ['deriveBits']);
    const bytes = new Uint8Array(await crypto.subtle.deriveBits({
      name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(spec.salt), iterations: 420000
    }, key, 256));
    const expected = fromHex(spec.hash);
    let mismatch = 0;
    for (let i = 0; i < expected.length; i++) mismatch |= bytes[i] ^ expected[i];
    return mismatch === 0;
  }

  function showGate() {
    if (!root.classList.contains('access-locked')) return;
    const gate = document.createElement('div');
    gate.id = 'access-gate';
    gate.innerHTML = [
      '<main class="access-panel" role="dialog" aria-modal="true" aria-labelledby="access-title">',
      '<div class="access-emblem" aria-hidden="true">✦</div>',
      '<div class="access-eyebrow">ÁREA COM SENHA</div>',
      '<h1 id="access-title"></h1>',
      '<p class="access-description">Digite a senha para continuar.</p>',
      '<form id="access-form">',
      '<label for="access-password">Senha</label>',
      '<div class="access-input-wrap">',
      '<input id="access-password" type="password" required autocomplete="current-password" placeholder="Digite a senha" aria-describedby="access-error">',
      '<button id="access-toggle" type="button" aria-label="Mostrar senha">Mostrar</button>',
      '</div>',
      '<p id="access-error" role="status" aria-live="polite"></p>',
      '<button class="access-submit" type="submit">Desbloquear <span aria-hidden="true">↗</span></button>',
      '</form>',
      '<a class="access-back" id="access-back" href="../">← Voltar aos projetos</a>',
      '<small class="access-note">O código de acesso é verificado localmente neste navegador.</small>',
      '</main>'
    ].join('');
    document.body.appendChild(gate);
    gate.querySelector('#access-title').textContent = spec.heading;
    gate.querySelector('#access-back').href = source.dataset.accessReturn || '../';
    const form = gate.querySelector('#access-form');
    const field = gate.querySelector('#access-password');
    const feedback = gate.querySelector('#access-error');
    const button = gate.querySelector('.access-submit');
    const toggle = gate.querySelector('#access-toggle');
    let busy = false;
    let failures = 0;
    let blockedUntil = 0;
    toggle.addEventListener('click', () => {
      const show = field.type === 'password';
      field.type = show ? 'text' : 'password';
      toggle.textContent = show ? 'Ocultar' : 'Mostrar';
      toggle.setAttribute('aria-label', show ? 'Ocultar senha' : 'Mostrar senha');
    });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (busy) return;
      if (blockedUntil > Date.now()) {
        feedback.textContent = 'Aguarde alguns segundos antes de tentar novamente.';
        return;
      }
      if (!window.crypto?.subtle) {
        feedback.textContent = 'Verificação indisponível. Abra a página por HTTPS em um navegador atualizado.';
        return;
      }
      busy = true;
      button.disabled = true;
      button.textContent = 'Verificando…';
      feedback.textContent = '';
      try {
        if (await checkPassword(field.value)) {
          try { sessionStorage.setItem(storageKey, spec.hash); } catch (_) {}
          field.value = '';
          unlock();
          return;
        }
        failures++;
        if (failures >= 3) blockedUntil = Date.now() + Math.min(30000, 2000 * (failures - 2) ** 2);
        feedback.textContent = 'Senha incorreta. Tente novamente.';
        field.value = '';
        field.focus();
      } catch (_) {
        feedback.textContent = 'Falha na verificação. Tente novamente.';
      } finally {
        busy = false;
        button.disabled = false;
        button.innerHTML = 'Desbloquear <span aria-hidden="true">↗</span>';
      }
    });
    field.focus({ preventScroll: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showGate, { once: true });
  else showGate();
})();