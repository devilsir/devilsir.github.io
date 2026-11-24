'use strict';
/**
 * ui.js — Modais, notificações, conquistas, partículas de arquivo,
 * Manual de Perícia Hereditária e Prontuário de Patentes.
 */
const UI = (() => {
  const $ = (s, r = document) => r.querySelector(s);

  function initDust() {
    const layer = $('#dust-layer');
    if (!layer || layer.children.length > 0) return;
    for (let i = 0; i < 20; i++) {
      const mote = document.createElement('span');
      const size = (2 + Math.random() * 3.5).toFixed(1);
      mote.className = 'dust-mote';
      mote.style.width = `${size}px`;
      mote.style.height = `${size}px`;
      mote.style.left = `${(Math.random() * 100).toFixed(1)}%`;
      mote.style.top = `${(20 + Math.random() * 82).toFixed(1)}%`;
      mote.style.setProperty('--dx', `${(Math.random() * 70 - 35).toFixed(0)}px`);
      mote.style.setProperty('--dy', `${(-60 - Math.random() * 110).toFixed(0)}px`);
      mote.style.setProperty('--o', (0.14 + Math.random() * 0.22).toFixed(2));
      mote.style.animationDuration = `${(12 + Math.random() * 14).toFixed(1)}s`;
      mote.style.animationDelay = `${(-Math.random() * 16).toFixed(1)}s`;
      layer.appendChild(mote);
    }
  }

  let keyHandler = null;

  function openModal({ id = '', title = '', body = '', actions = [], cls = '', closable = true }) {
    const root = $('#modal-root');
    if (!root) return null;

    // Atualiza o modal existente no lugar (sem destruir o overlay nem piscar)
    if (id) {
      const existing = root.querySelector(`.modal[data-modal-id="${id}"]`);
      if (existing) {
        const titleEl = $('#modal-title', existing);
        if (titleEl && title) titleEl.innerHTML = title;
        const bodyEl = $('.modal-body', existing);
        if (bodyEl) bodyEl.innerHTML = body;
        return existing;
      }
    }

    closeModal();

    root.innerHTML = `<div class="modal-overlay">
      <div class="modal ${cls}" ${id ? `data-modal-id="${id}"` : ''} role="dialog" aria-modal="true" ${title ? 'aria-labelledby="modal-title"' : 'aria-label="Aviso"'}>
        ${closable ? '<button class="modal-close" aria-label="Fechar janela">✕</button>' : ''}
        ${title ? `<h2 id="modal-title">${title}</h2>` : ''}
        <div class="modal-body">${body}</div>
        ${actions.length ? `<div class="modal-actions">${actions.map((a, i) => `<button class="btn ${a.cls || ''}" data-mact="${i}">${a.label}</button>`).join('')}</div>` : ''}
      </div>
    </div>`;

    const overlay = root.firstElementChild;
    const modal = overlay.firstElementChild;

    if (closable) {
      $('.modal-close', modal).onclick = closeModal;
      overlay.addEventListener('mousedown', e => { if (e.target === overlay) closeModal(); });
      keyHandler = e => { if (e.key === 'Escape') closeModal(); };
      document.addEventListener('keydown', keyHandler);
    }

    actions.forEach((a, i) => {
      const btn = $(`[data-mact="${i}"]`, modal);
      if (btn) btn.onclick = () => (a.onClick ? a.onClick() : closeModal());
    });

    const focusTarget = $('.modal-actions .btn-crimson', modal) || $('.modal-actions .btn-primary', modal) || $('.modal-close', modal) || $('button', modal);
    if (focusTarget) setTimeout(() => focusTarget.focus({ preventScroll: true }), 25);
    return modal;
  }

  function closeModal() {
    const root = $('#modal-root');
    if (root) root.innerHTML = '';
    if (keyHandler) {
      document.removeEventListener('keydown', keyHandler);
      keyHandler = null;
    }
  }

  function toast(msg, type = '') {
    const root = $('#toast-root');
    if (!root) return;
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = msg;
    root.appendChild(t);
    setTimeout(() => t.classList.add('out'), 3000);
    setTimeout(() => t.remove(), 3500);
  }

  function showAchievement(def) {
    const root = $('#ach-toast-root');
    if (!root) return;
    if (typeof AudioEngine !== 'undefined') AudioEngine.achievement();
    const el = document.createElement('div');
    el.className = 'ach-toast';
    el.setAttribute('role', 'status');
    el.innerHTML = `<div class="ach-toast-ico">${UIArt.icon(def.iconKey || 'award', 22)}</div>
      <div class="ach-toast-body">
        <span class="ach-toast-kicker mono">CONDECORAÇÃO · +${def.xp} XP</span>
        <strong>${def.title}</strong>
        <small>${def.desc}</small>
      </div>`;
    root.appendChild(el);
    setTimeout(() => el.classList.add('out'), 4200);
    setTimeout(() => el.remove(), 4800);
  }

  function sparkle(anchor) {
    const fx = $('#fx-root');
    if (!fx || !anchor) return;
    const r = anchor.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const colors = ['#D8B16A', '#2FA37C', '#D95F48', '#F2EFE9', '#5A8FA8'];
    for (let i = 0; i < 22; i++) {
      const s = document.createElement('i');
      s.className = 'spark';
      const ang = (i / 22) * Math.PI * 2;
      const dist = 50 + Math.random() * 95;
      s.style.left = `${cx}px`;
      s.style.top = `${cy}px`;
      s.style.setProperty('--dx', `${Math.cos(ang) * dist}px`);
      s.style.setProperty('--dy', `${Math.sin(ang) * dist}px`);
      s.style.background = colors[i % colors.length];
      fx.appendChild(s);
      setTimeout(() => s.remove(), 900);
    }
  }

  function confetti() {
    const fx = $('#fx-root');
    if (!fx) return;
    const colors = ['#D8B16A', '#2FA37C', '#D95F48', '#F2EFE9', '#5A8FA8'];
    for (let i = 0; i < 72; i++) {
      const c = document.createElement('i');
      c.className = 'confetti';
      c.style.left = `${Math.random() * 100}vw`;
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = `${Math.random() * 0.5}s`;
      c.style.animationDuration = `${2.2 + Math.random() * 1.4}s`;
      c.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
      c.style.setProperty('--drift', `${Math.random() * 150 - 75}px`);
      fx.appendChild(c);
      setTimeout(() => c.remove(), 4200);
    }
  }

  /** Manual de Perícia Hereditária — 100% diegético, cobrindo os 5 mecanismos de herança */
  function showNotebook() {
    openModal({
      title: 'Manual de Perícia Hereditária',
      cls: 'modal-notebook',
      body: `<div class="nb-intro">
          <span class="stamp-tag mono">ARQUIVO DE REFERÊNCIA · DIVISÃO 46</span>
          <p>Guia de consulta rápida para interpretação de heredogramas, gametas, sorologia hemática e mecanismos de herança.</p>
        </div>

        <section class="nb-sec">
          <h4>1. Dominância Completa (Autossômica)</h4>
          <p class="small">Um único alelo dominante determina o fenótipo. Por isso, o heterozigoto (<span class="mono">Aa</span>) é visualmente idêntico ao homozigoto dominante (<span class="mono">AA</span>), ocultando o alelo recessivo (<span class="mono">a</span>). Quando dois pais dominantes têm um filho recessivo (<span class="mono">aa</span>), ambos os pais são obrigatoriamente heterozigotos (<span class="mono">Aa × Aa</span>).</p>
          <div class="nb-grid-tags small mono">
            <span>Lóbulo: FF/Ff Solto · ff Preso</span>
            <span>Linha: PP/Pp Pico · pp Reta</span>
            <span>Covinhas: CC/Cc Sim · cc Não</span>
            <span>Queixo: QQ/Qq Fendido · qq Liso</span>
            <span>Sardas: SS/Ss Sim · ss Não</span>
            <span>Sobrancelhas: WW/Ww Espessas · ww Finas</span>
            <span>Rh: RR/Rr Positivo (+) · rr Negativo (−)</span>
          </div>
        </section>

        <section class="nb-sec">
          <h4>2. Dominância Incompleta</h4>
          <p class="small">Nenhum alelo mascara o outro: o heterozigoto expressa um <b>fenótipo intermediário</b>, permitindo ler o genótipo diretamente a partir do fenótipo.</p>
          <div class="nb-grid-tags small mono">
            <span>Cabelo: TT Cacheado · Tt Ondulado · tt Liso</span>
            <span>Lábios: MM Largos · Mm Médios · mm Finos</span>
            <span>Estufa (Cor): RR Vermelha · Rr Rosa · rr Branca</span>
          </div>
        </section>

        <section class="nb-sec">
          <h4>3. Codominância e Alelos Múltiplos (Sistema ABO)</h4>
          <p class="small">Três alelos determinam os grupos sanguíneos: <span class="mono">Iᴬ</span> e <span class="mono">Iᴮ</span> são <b>codominantes</b> entre si e ambos dominam sobre <span class="mono">i</span>.</p>
          <div class="nb-grid-tags small mono">
            <span>Tipo A: IᴬIᴬ ou Iᴬi (reage anti-A)</span>
            <span>Tipo B: IᴮIᴮ ou Iᴮi (reage anti-B)</span>
            <span>Tipo AB: IᴬIᴮ (receptor universal)</span>
            <span>Tipo O: ii (doador universal)</span>
          </div>
        </section>

        <section class="nb-sec">
          <h4>4. Herança Ligada ao X e Herança Influenciada pelo Sexo</h4>
          <p class="small"><b>Daltonismo (Ligado ao X):</b> homens (<span class="mono">XY</span>) recebem o <b>Y do pai</b> e o único <b>X da mãe</b> — um pai jamais transmite daltonismo a um filho homem, mas transmite <span class="mono">Xᵈ</span> a todas as filhas! Mulheres (<span class="mono">XX</span>) podem ser <span class="mono">XᴰXᴰ</span>, portadoras (<span class="mono">XᴰXᵈ</span>) ou daltônicas (<span class="mono">XᵈXᵈ</span>).</p>
          <p class="small" style="margin-top:6px"><b>Calvície Hereditária (Influenciada pelo Sexo — B/b):</b> gene autossômico cuja expressão varia com os hormônios sexuais. Em <b>homens</b>, <span class="mono">BB</span> e <span class="mono">Bb</span> manifestam calvície (<span class="mono">bb</span> = cabelo denso). Em <b>mulheres</b>, apenas <span class="mono">BB</span> manifesta calvície (<span class="mono">Bb</span> e <span class="mono">bb</span> = cabelo denso).</p>
        </section>

        <section class="nb-sec">
          <h4>5. Interação Gênica, Poligenia e Epistasia Recessiva</h4>
          <p class="small"><b>Cor dos olhos (E/e e G/g):</b> <span class="mono">E_ __</span> = castanho; <span class="mono">ee G_</span> = verde; <span class="mono">ee gg</span> = azul.</p>
          <p class="small" style="margin-top:6px"><b>Cor do cabelo (H/h e U/u):</b> <span class="mono">H_ __</span> = escuro; <span class="mono">hh U_</span> = loiro; <span class="mono">hh uu</span> = ruivo.</p>
          <p class="small" style="margin-top:6px"><b>Tom de Pele Poligênico (K/k e N/n):</b> efeito aditivo pelo número de alelos dominantes (<span class="mono">K</span> ou <span class="mono">N</span>): <b>0</b> = Clara (<span class="mono">kk nn</span>), <b>1</b> = Morena clara, <b>2</b> = Morena média, <b>3</b> = Morena escura, <b>4</b> = Retinta (<span class="mono">KK NN</span>).</p>
          <p class="small" style="margin-top:6px"><b>Epistasia Recessiva (Albinismo — aa):</b> o par <span class="mono">aa</span> bloqueia a síntese de melanina e <b>mascara visualmente</b> sardas, cor dos cabelos e pigmento da íris — mesmo que o indivíduo carregue alelos como <span class="mono">Ss</span>!</p>
        </section>

        <section class="nb-sec">
          <h4>6. Quando marcar "Genótipo Indeterminado"?</h4>
          <p class="small">Na perícia real, nem sempre os registros permitem separar <span class="mono">AA</span> de <span class="mono">Aa</span> (por exemplo, um filho <span class="mono">Aa</span> com cônjuge <span class="mono">aa</span> é compatível tanto com pai <span class="mono">AA</span> quanto <span class="mono">Aa</span>). Nesses casos, o rigor científico exige registrar <b>Indeterminado</b>.</p>
        </section>`,
      actions: [{ label: 'Fechar Manual', cls: 'btn-crimson' }],
    });
  }

  /** Prontuário de Patente e Condecorações */
  function showProfile() {
    const s = GameState.get();
    const sum = GameState.getSummary();
    const rank = sum.rank;

    const medalsStrip = GameState.RANKS.map(r => {
      const achieved = rank.level >= r.level;
      const isCurr = rank.level === r.level;
      return `<div class="rank-step ${achieved ? 'achieved' : ''} ${isCurr ? 'current' : ''}">
        <div class="rs-medal">${UIArt.badge(r.badgeKey, 'badge-fit')}</div>
        <div class="rs-title">${r.title}</div>
        <div class="rs-xp mono">${r.minXp} XP</div>
      </div>`;
    }).join('');

    const achGrid = GameState.ACHIEVEMENTS.map(a => {
      const unlocked = !!s.achievements[a.id];
      return `<div class="ach-card ${unlocked ? 'unlocked' : 'locked'}">
        <div class="ac-ico">${unlocked ? UIArt.icon(a.iconKey || 'award', 20) : UIArt.icon('lock', 18)}</div>
        <div class="ac-info">
          <strong>${a.title}</strong>
          <p class="small muted">${a.desc}</p>
        </div>
        <span class="ac-xp mono">+${a.xp} XP</span>
      </div>`;
    }).join('');

    openModal({
      title: 'Prontuário do Perito & Condecorações',
      cls: 'modal-profile',
      body: `<div class="profile-hero">
          <div class="profile-medal">${UIArt.badge(rank.badgeKey, 'badge-fit')}</div>
          <div class="profile-meta">
            <span class="stamp-tag mono">PATENTE ${rank.level}/5 · ${rank.tier.toUpperCase()}</span>
            <h3>${rank.title}</h3>
            <div class="xp-line">
              <div class="progress-bar"><i style="width:${rank.pct}%"></i></div>
              <span class="mono small muted">${rank.xp} XP ${rank.next ? `/ ${rank.next.minXp} XP (${rank.next.title})` : '· Patente Máxima'}</span>
            </div>
            <div class="profile-kpis mono small">
              <span>Dossiê 46: <b>${sum.detSolved}/${sum.detTotal} (${sum.detStars}/${sum.detMaxStars} ★)</b></span>
              <span>Estufa: <b>${sum.ghSolved}/8 (${sum.ghStars}/${sum.ghMaxStars} ★)</b></span>
              <span>Herbário: <b>${sum.speciesCount}/12</b></span>
            </div>
          </div>
        </div>

        <h4 style="margin:14px 0 8px">Hierarquia da Divisão</h4>
        <div class="rank-strip">${medalsStrip}</div>

        <h4 style="margin:16px 0 8px">Condecorações (${sum.achCount}/${sum.achTotal})</h4>
        <div class="ach-grid">${achGrid}</div>`,
      actions: [
        {
          label: 'Apagar Registros Locais',
          cls: 'btn-ghost btn-small',
          onClick: () => {
            openModal({
              title: 'Apagar todos os registros?',
              body: '<p>Todos os casos resolvidos, patentes, estrelas, Herbário e condecorações salvos localmente serão reiniciados.</p>',
              actions: [
                { label: 'Cancelar', onClick: showProfile },
                {
                  label: 'Confirmar Reinício',
                  cls: 'btn-crimson',
                  onClick: () => {
                    GameState.resetAll();
                    closeModal();
                    toast('Registros reiniciados.');
                    if (typeof App !== 'undefined') App.navigate('hub');
                  },
                },
              ],
            });
          },
        },
        { label: 'Fechar', cls: 'btn-slate' },
      ],
    });
  }

  return {
    initDust,
    openModal,
    closeModal,
    toast,
    showAchievement,
    sparkle,
    confetti,
    showNotebook,
    showProfile,
  };
})();
