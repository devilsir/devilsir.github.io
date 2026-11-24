radiusLab.createAtomView = (() => {
  const BASE_CIRCLE = 90;
  const largestRadius = Math.max(...radiusLab.chemistry.elements.flatMap(({ radius, ions }) =>
    [radius, ...ions.map(ion => ion.radius)]
  ));
  const UNITS_PER_PM = 94 / largestRadius;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function shellGraphics(shells) {
    return shells.map((count, index) => {
      const outer = index === shells.length - 1;
      const radius = 15 + 67 * (index + 1) / shells.length;
      const dots = Array.from({ length: count }, (_, electron) => {
        const angle = electron * 2 * Math.PI / count - 0.9 + index * 0.7;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        const size = outer ? 3.1 : 2.2;
        return `<circle class="electron" cx="${x}" cy="${y}" r="${size}"/>`;
      }).join('');

      return `
        <circle class="shell-ring${outer ? ' valence-ring' : ''}" r="${radius}"/>
        <g class="electron-orbit${outer ? ' valence-orbit' : ''}" style="--orbit-duration:${24 + 8 * index}s">
          <circle r="${radius + 4}" fill="transparent"/>
          ${dots}
        </g>`;
    }).join('');
  }

  function createAtomView(scene, id) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '18 0 264 222');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('atom-svg');
    svg.innerHTML = `
      <defs>
        <radialGradient id="aura-${id}">
          <stop offset="10%" class="plasma-stop" stop-opacity=".27"/>
          <stop offset="62%" class="plasma-stop" stop-opacity=".1"/>
          <stop offset="100%" class="plasma-stop" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="cloud-${id}" cx="34%" cy="26%" r="79%">
          <stop offset="0%" class="plasma-stop" stop-opacity=".52"/>
          <stop offset="38%" class="plasma-stop" stop-opacity=".23"/>
          <stop offset="74%" stop-color="#0b1424" stop-opacity=".76"/>
          <stop offset="95%" class="plasma-stop" stop-opacity=".25"/>
          <stop offset="100%" class="plasma-stop" stop-opacity=".48"/>
        </radialGradient>
        <radialGradient id="reflection-${id}" cx="31%" cy="15%" r="65%">
          <stop offset="0%" stop-color="#fff" stop-opacity=".48"/>
          <stop offset="41%" class="plasma-stop" stop-opacity=".13"/>
          <stop offset="83%" class="plasma-stop" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="core-${id}" cx="34%" cy="28%" r="72%">
          <stop offset="0%" stop-color="#fff"/>
          <stop offset="31%" class="light-stop"/>
          <stop offset="72%" class="plasma-stop"/>
          <stop offset="100%" class="plasma-stop" stop-opacity=".26"/>
        </radialGradient>
        <linearGradient id="rim-${id}" x1="0%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" class="light-stop" stop-opacity=".95"/>
          <stop offset="52%" class="plasma-stop" stop-opacity=".44"/>
          <stop offset="100%" class="plasma-stop" stop-opacity=".83"/>
        </linearGradient>
      </defs>
      <g transform="translate(150 103)">
        <path class="scene-axis" d="M-125 0H125 M0-97V97"/>
        <path class="scene-cross" d="M-127 0h8m-4-4v8M119 0h8m-4-4v8M-4-95h8m-4-4v8M-4 95h8m-4-4v8"/>
        <g class="atom-size">
          <circle r="123" fill="url(#aura-${id})"/>
          <circle class="plasma-halo" r="${BASE_CIRCLE}"/>
          <circle r="${BASE_CIRCLE}" fill="url(#cloud-${id})"/>
          <circle r="${BASE_CIRCLE}" fill="url(#reflection-${id})"/>
          <circle class="plasma-rim" r="${BASE_CIRCLE}" stroke="url(#rim-${id})"/>
          <g class="atom-shells"></g>
          <path class="radius-line" d="M0 0H90m0-4v8"/>
          <g class="atom-core">
            <circle class="core-aura" r="20" fill="url(#aura-${id})"/>
            <circle cx="-4" cy="2" r="6.5" fill="url(#core-${id})"/>
            <circle cx="5" cy="3" r="6" fill="url(#core-${id})"/>
            <circle cx="1" cy="-4" r="7" fill="url(#core-${id})"/>
            <circle cx="0" cy="-5" r="2" fill="#fff" opacity=".82"/>
          </g>
        </g>
        <circle class="transfer-flash" r="35" fill="url(#aura-${id})"/>
        <g class="transfers"></g>
      </g>
      <g class="ruler" transform="translate(21 202)">
        <path d="M0-3v6m0-3h${100 * UNITS_PER_PM}m0-3v6"/>
        <text x="${100 * UNITS_PER_PM + 7}" y="3.3">100 pm</text>
      </g>`;

    scene.prepend(svg);
    const size = svg.querySelector('.atom-size');
    const rings = svg.querySelector('.atom-shells');
    const flash = svg.querySelector('.transfer-flash');
    const transfers = svg.querySelector('.transfers');
    let shownShells = '';
    let previous;
    let fadingShells;

    function clearShellFade() {
      fadingShells?.remove();
      fadingShells = null;
      rings.getAnimations().forEach(animation => animation.cancel());
    }

    function clearTransfer() {
      flash.getAnimations().forEach(animation => animation.cancel());
      for (const particle of transfers.children) {
        particle.getAnimations().forEach(animation => animation.cancel());
      }
      transfers.replaceChildren();
    }

    function stopAtom() {
      size.getAnimations().forEach(animation => animation.cancel());
      clearShellFade();
      clearTransfer();
      previous = null;
    }

    function paintAtom(species, motion, options = {}) {
      const known = species.radius > 0;
      const scale = (known ? species.radius : 0) * UNITS_PER_PM / BASE_CIRCLE;
      size.style.setProperty('--radius-duration', (options.morphDuration ?? 600) + 'ms');
      size.style.setProperty('--radius-delay', (options.morphDelay ?? 0) + 'ms');
      size.style.transform = `scale(${scale})`;
      scene.dataset.known = String(known);

      const shells = species.shells ?? [];
      const shellKey = shells.join('/');
      if (known && shellKey !== shownShells) {
        clearShellFade();
        const fadeDuration = motion && previous?.radius > 0 ? options.shellFade : 0;
        if (fadeDuration && rings.childElementCount) {
          const outgoing = rings.cloneNode(true);
          fadingShells = outgoing;
          rings.after(outgoing);
          const fadeOut = outgoing.animate([{ opacity: 1 }, { opacity: 0 }], { duration: fadeDuration, easing: 'ease-in-out' });
          fadeOut.addEventListener('finish', () => outgoing.remove(), { once: true });
        }
        rings.innerHTML = shellGraphics(shells);
        if (fadeDuration && shells.length) {
          rings.animate([{ opacity: 0 }, { opacity: 1 }], { duration: fadeDuration, easing: 'ease-in-out' });
        }
        shownShells = shellKey;
      }

      const delta = previous?.element === species.element ? species.electrons - previous.electrons : 0;
      if (!motion || options.suppressTransfer) {
        clearTransfer();
      } else if (delta) {
        const orderedRadii = delta > 0 ? [species.radius, previous.radius] : [previous.radius, species.radius];
        const edge = [...orderedRadii, species.element.radius].find(radius => radius > 0);
        if (edge) animateTransfer(transfers, flash, delta, edge * UNITS_PER_PM, options);
      }
      previous = species;
    }

    return { paintAtom, stopAtom };
  }

  function animateTransfer(layer, flash, delta, radius, options) {
    const incoming = delta > 0;
    const duration = options.transferDuration ?? 610;
    const stagger = options.transferStagger ?? 85;
    if (layer.childElementCount >= 9) layer.replaceChildren();
    flash.getAnimations().forEach(animation => animation.cancel());
    flash.animate([
      { opacity: 0, transform: 'scale(.45)' },
      { opacity: .7, transform: 'scale(1.05)', offset: incoming ? .62 : .35 },
      { opacity: 0, transform: 'scale(2.45)' },
    ], { duration, easing: 'ease-in-out' });

    for (let index = 0; index < Math.min(Math.abs(delta), 3); index++) {
      const angle = -0.72 + index * 0.52;
      const near = Math.min(radius * .88, 92);
      const far = 138;
      const from = incoming ? far : near;
      const to = incoming ? near : far;
      const point = (distance, bend = 0) => {
        const direction = angle + bend;
        return `translate(${Math.cos(direction) * distance}px, ${Math.sin(direction) * distance}px)`;
      };
      const particle = document.createElementNS(SVG_NS, 'g');
      particle.classList.add('transfer-particle');
      particle.innerHTML = '<path d="M-18 0H0"/><circle r="3.7"/>';
      particle.firstElementChild.setAttribute('transform', `rotate(${angle * 180 / Math.PI + (incoming ? 180 : 0)})`);
      layer.append(particle);

      const animation = particle.animate([
        { transform: point(from), opacity: 0 },
        { transform: point(from + (to - from) * .16, -.09), opacity: .9, offset: .2 },
        { transform: point(from + (to - from) * .68, -.13), opacity: 1, offset: .7 },
        { transform: point(to), opacity: 0 },
      ], { duration, delay: stagger * index, fill: 'both', easing: 'cubic-bezier(.33,.1,.25,1)' });
      animation.addEventListener('finish', () => particle.remove(), { once: true });
    }
  }

  return createAtomView;
})();
