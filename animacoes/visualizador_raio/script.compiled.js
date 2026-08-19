// 🇧🇷 Visualize raios atômicos e iônicos, com animações, sons e exemplos prontos.
// Controle de número de elétrons (carga ajustável). Valores revisados.
const { useEffect, useRef, useState } = React;
// ---- Helpers puros (facilitam teste) ----
const GLOBAL_REF_PM = 203; // K como referência grande entre exemplos
const CLAMP_MIN_FACTOR = 0.35; // limites didáticos p/ raio relativo ao neutro
const CLAMP_MAX_FACTOR = 2.5;
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function visualPxPure(pmValue, pmRef, exaggeration = 1.0) {
    const base = 140; // tamanho base em px para referência
    const ratio = Math.max(pmValue, 1) / Math.max(pmRef, 1);
    const expo = 0.85 * exaggeration; // Exponente < 1 comprime diferenças
    return base * Math.pow(ratio, expo);
}
function mkEl(e) { return e; }
function superscriptNumber(nAbs) {
    const map = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
    return String(nAbs).split('').map(ch => map[ch] || ch).join('');
}
function formatIonLabel(symbol, charge) {
    if (!charge)
        return symbol;
    const sign = charge > 0 ? '⁺' : '⁻';
    const mag = Math.abs(charge);
    return symbol + (mag === 1 ? sign : superscriptNumber(mag) + sign);
}
// Capacidades por camada (2n^2) e distribuição eletrônica simples (didática)
function shellCapacity(n) { return 2 * n * n; }
function electronDistribution(totalE, maxShells = 7) {
    const dist = [];
    let remaining = Math.max(0, Math.floor(totalE));
    for (let n = 1; n <= maxShells && remaining > 0; n++) {
        const cap = shellCapacity(n);
        const take = Math.min(cap, remaining);
        dist.push(take);
        remaining -= take;
    }
    return dist;
}
function shellsNeededForElectrons(totalE) { return electronDistribution(totalE).length; }
// Usa um ponto conhecido (raio iônico mais comum) para calibrar variação por unidade de carga
// e extrapola heuristicamente para outras cargas (didático, não rigoroso):
//  - Mesmo sinal do ponto conhecido: progressão geométrica com base = (r_ion/r_neutro)^(1/|q_known|)
//  - Sinal oposto: fatores genéricos (≈0.83 p/ +1; ≈1.30 p/ -1)
function approxRadius(pmNeutral, knownCharge, knownIonicPm, targetCharge) {
    if (targetCharge === 0)
        return pmNeutral;
    if (knownCharge && targetCharge === knownCharge && knownIonicPm)
        return knownIonicPm;
    const signT = Math.sign(targetCharge);
    const signK = Math.sign(knownCharge || 0);
    if (knownCharge && signT && signK && signT === signK && knownIonicPm) {
        const base = Math.pow(knownIonicPm / pmNeutral, 1 / Math.abs(knownCharge));
        const scale = Math.pow(base, Math.abs(targetCharge));
        return clamp(pmNeutral * scale, pmNeutral * CLAMP_MIN_FACTOR, pmNeutral * CLAMP_MAX_FACTOR);
    }
    const baseOpp = signT > 0 ? 0.83 : 1.30; // heurística didática
    const scale = Math.pow(baseOpp, Math.abs(targetCharge));
    return clamp(pmNeutral * scale, pmNeutral * CLAMP_MIN_FACTOR, pmNeutral * CLAMP_MAX_FACTOR);
}
// ---- Dados (pm = picômetros) ----
// **Atenção**: valores alterados apenas para as espécies que você enviou; demais foram mantidas.
const ELEMENTS = [
    mkEl({ symbol: 'Na', name: 'Sódio', Z: 11, period: 3, atomicRadius: 186, ion: { label: 'Na⁺', charge: +1, ionicRadius: 102 } }),
    mkEl({ symbol: 'Cl', name: 'Cloro', Z: 17, period: 3, atomicRadius: 99, ion: { label: 'Cl⁻', charge: -1, ionicRadius: 181 } }),
    mkEl({ symbol: 'Mg', name: 'Magnésio', Z: 12, period: 3, atomicRadius: 160, ion: { label: 'Mg²⁺', charge: +2, ionicRadius: 72 } }),
    mkEl({ symbol: 'O', name: 'Oxigênio', Z: 8, period: 2, atomicRadius: 66, ion: { label: 'O²⁻', charge: -2, ionicRadius: 140 } }),
    mkEl({ symbol: 'K', name: 'Potássio', Z: 19, period: 4, atomicRadius: 227, ion: { label: 'K⁺', charge: +1, ionicRadius: 138 } }),
    mkEl({ symbol: 'Ca', name: 'Cálcio', Z: 20, period: 4, atomicRadius: 197, ion: { label: 'Ca²⁺', charge: +2, ionicRadius: 100 } }),
    mkEl({ symbol: 'Al', name: 'Alumínio', Z: 13, period: 3, atomicRadius: 121, ion: { label: 'Al³⁺', charge: +3, ionicRadius: 54 } }),
    mkEl({ symbol: 'F', name: 'Flúor', Z: 9, period: 2, atomicRadius: 64, ion: { label: 'F⁻', charge: -1, ionicRadius: 133 } }),
    mkEl({ symbol: 'Br', name: 'Bromo', Z: 35, period: 4, atomicRadius: 114, ion: { label: 'Br⁻', charge: -1, ionicRadius: 196 } }),
    mkEl({ symbol: 'Li', name: 'Lítio', Z: 3, period: 2, atomicRadius: 152, ion: { label: 'Li⁺', charge: +1, ionicRadius: 76 } }),
    mkEl({ symbol: 'S', name: 'Enxofre', Z: 16, period: 3, atomicRadius: 104, ion: { label: 'S²⁻', charge: -2, ionicRadius: 184 } }),
    mkEl({ symbol: 'N', name: 'Nitrogênio', Z: 7, period: 2, atomicRadius: 75, ion: { label: 'N³⁻', charge: -3, ionicRadius: 146 } }),
    mkEl({ symbol: 'Rb', name: 'Rubídio', Z: 37, period: 5, atomicRadius: 248, ion: { label: 'Rb⁺', charge: +1, ionicRadius: 152 } }),
    mkEl({ symbol: 'Cs', name: 'Césio', Z: 55, period: 6, atomicRadius: 265, ion: { label: 'Cs⁺', charge: +1, ionicRadius: 167 } }),
    mkEl({ symbol: 'Sr', name: 'Estrôncio', Z: 38, period: 5, atomicRadius: 195, ion: { label: 'Sr²⁺', charge: +2, ionicRadius: 118 } }),
    mkEl({ symbol: 'Ba', name: 'Bário', Z: 56, period: 6, atomicRadius: 222, ion: { label: 'Ba²⁺', charge: +2, ionicRadius: 135 } }),
    mkEl({ symbol: 'I', name: 'Iodo', Z: 53, period: 5, atomicRadius: 139, ion: { label: 'I⁻', charge: -1, ionicRadius: 220 } }),
    // Metais de transição (com multi-estado quando enviado)
    mkEl({ symbol: 'Cu', name: 'Cobre', Z: 29, period: 4, atomicRadius: 128, ion: { label: 'Cu²⁺', charge: +2, ionicRadius: 73 }, ionOptions: [{ label: 'Cu²⁺', charge: +2, ionicRadius: 73 }, { label: 'Cu⁺', charge: +1, ionicRadius: 77 }] }),
    mkEl({ symbol: 'Zn', name: 'Zinco', Z: 30, period: 4, atomicRadius: 134, ion: { label: 'Zn²⁺', charge: +2, ionicRadius: 74 } }),
    mkEl({ symbol: 'Fe', name: 'Ferro', Z: 26, period: 4, atomicRadius: 126, ion: { label: 'Fe²⁺', charge: +2, ionicRadius: 78 }, ionOptions: [{ label: 'Fe²⁺', charge: +2, ionicRadius: 78 }, { label: 'Fe³⁺', charge: +3, ionicRadius: 64.5 }] }),
    mkEl({ symbol: 'Co', name: 'Cobalto', Z: 27, period: 4, atomicRadius: 125, ion: { label: 'Co²⁺', charge: +2, ionicRadius: 74.5 }, ionOptions: [{ label: 'Co²⁺', charge: +2, ionicRadius: 74.5 }, { label: 'Co³⁺', charge: +3, ionicRadius: 61 }] }),
    mkEl({ symbol: 'Ni', name: 'Níquel', Z: 28, period: 4, atomicRadius: 124, ion: { label: 'Ni²⁺', charge: +2, ionicRadius: 69 } }),
    mkEl({ symbol: 'Mn', name: 'Manganês', Z: 25, period: 4, atomicRadius: 127, ion: { label: 'Mn²⁺', charge: +2, ionicRadius: 83 }, ionOptions: [{ label: 'Mn²⁺', charge: +2, ionicRadius: 83 }, { label: 'Mn³⁺', charge: +3, ionicRadius: 64.5 }] }),
    mkEl({ symbol: 'Ag', name: 'Prata', Z: 47, period: 5, atomicRadius: 144, ion: { label: 'Ag⁺', charge: +1, ionicRadius: 115 } }),
    mkEl({ symbol: 'Pb', name: 'Chumbo', Z: 82, period: 6, atomicRadius: 175, ion: { label: 'Pb²⁺', charge: +2, ionicRadius: 119 }, ionOptions: [{ label: 'Pb²⁺', charge: +2, ionicRadius: 119 }, { label: 'Pb⁴⁺', charge: +4, ionicRadius: 77.5 }] }),
];
// ---- App principal ----
function AtomicIonicRadiusApp() {
    // Estado
    const [selected, setSelected] = useState(ELEMENTS[0]);
    const [view, setView] = useState('compare'); // 'neutral' | 'ion' | 'compare'
    const [absoluteScale, setAbsoluteScale] = useState(false);
    const [animMs, setAnimMs] = useState(800);
    const [soundOn, setSoundOn] = useState(true);
    const [ionIndex, setIonIndex] = useState(0);
    // Número de elétrons ajustável (por elemento)
    const [electronCount, setElectronCount] = useState(selected.Z); // começa neutro
    // manter o valor coerente quando troca de elemento
    useEffect(() => {
        setElectronCount(selected.Z); // reset para neutro ao trocar elemento
        setIonIndex(0); // reset íon de referência
    }, [selected]);
    const currentCharge = selected.Z - electronCount; // + => cátion, - => ânion
    const currentIon = (selected.ionOptions && selected.ionOptions[ionIndex]) || selected.ion;
    // WebAudio (sons)
    const audioRef = useRef(null);
    useEffect(() => {
        const onAnyClick = () => {
            if (!audioRef.current) {
                try {
                    audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
                }
                catch {
                    audioRef.current = null;
                }
            }
            window.removeEventListener('pointerdown', onAnyClick);
        };
        window.addEventListener('pointerdown', onAnyClick);
        return () => window.removeEventListener('pointerdown', onAnyClick);
    }, []);
    function playTone(type = 'click', opts = {}) {
        if (!soundOn || !audioRef.current)
            return;
        const ctx = audioRef.current;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        // Encadeamento
        o.connect(g);
        g.connect(f);
        if (p) {
            f.connect(p);
            p.connect(ctx.destination);
        }
        else {
            f.connect(ctx.destination);
        }
        // Timbres por evento
        const timbres = {
            click: { type: 'sine', f1: 440, f2: 440, dur: 0.10, q: 2.0, pan: 0 },
            select: { type: 'triangle', f1: 520, f2: 340, dur: 0.14, q: 4.0, pan: -0.1 },
            toggle: { type: 'square', f1: 420, f2: 420, dur: 0.10, q: 6.0, pan: 0 },
            cation: { type: 'square', f1: 620, f2: 320, dur: 0.18, q: 8.0, pan: 0.15 },
            anion: { type: 'sine', f1: 300, f2: 540, dur: 0.22, q: 8.0, pan: -0.15 },
            neutral: { type: 'triangle', f1: 480, f2: 480, dur: 0.12, q: 3.0, pan: 0 },
            success: { type: 'sine', f1: 660, f2: 880, dur: 0.20, q: 5.0, pan: 0 },
        };
        const t = timbres[type] || timbres.click;
        o.type = t.type;
        const now = ctx.currentTime;
        const dur = Math.max(0.06, t.dur + (opts.durOffset || 0));
        // Sweep de frequência
        o.frequency.setValueAtTime(t.f1, now);
        o.frequency.exponentialRampToValueAtTime(Math.max(80, t.f2), now + dur);
        // Envelope
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.35, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        // Filtro e panorama
        f.type = 'lowpass';
        f.Q.value = t.q;
        f.frequency.setValueAtTime(1200, now);
        f.frequency.exponentialRampToValueAtTime(800, now + dur);
        if (p)
            p.pan.setValueAtTime(t.pan, now);
        o.start(now);
        o.stop(now + dur + 0.02);
    }
    // Handlers UI
    function onSelectSymbol(sym) {
        const el = ELEMENTS.find(e => e.symbol === sym) || ELEMENTS[0];
        setSelected(el);
        playTone('select');
    }
    function onToggleView(newView) {
        setView(newView);
        if (newView === 'neutral')
            playTone('neutral');
        else if (newView === 'ion')
            playTone(currentCharge > 0 ? 'cation' : currentCharge < 0 ? 'anion' : 'neutral');
        else
            playTone('toggle');
    }
    function nudgeElectrons(delta) {
        const minE = 0;
        const maxE = selected.Z + 5; // permite formar ânions típicos
        setElectronCount(e => {
            const next = clamp(e + delta, minE, maxE);
            if (next !== e)
                playTone(delta < 0 ? 'cation' : 'anion');
            return next;
        });
    }
    // Visual helpers (escala)
    function visualPx(pmValue, pmRef) { return visualPxPure(pmValue, pmRef, 1.0); }
    // Raio atual considerando o número de elétrons escolhido
    function currentRadiusPm() {
        return approxRadius(selected.atomicRadius, ((selected.ionOptions && selected.ionOptions[ionIndex]) || selected.ion).charge, ((selected.ionOptions && selected.ionOptions[ionIndex]) || selected.ion).ionicRadius, currentCharge);
    }
    function AtomView({ mode }) {
        const isIon = mode === 'ion';
        const pmNeutral = selected.atomicRadius;
        const currentIon = (selected.ionOptions && selected.ionOptions[ionIndex]) || selected.ion;
        const pmVar = isIon ? currentRadiusPm() : pmNeutral;
        const ref = absoluteScale ? GLOBAL_REF_PM : pmNeutral; // relativo: normaliza pelo neutro do próprio elemento
        const rPx = visualPx(pmVar, ref);
        const color = isIon
            ? (currentCharge > 0 ? '#f59e0b' : currentCharge < 0 ? '#10b981' : '#3b82f6')
            : '#3b82f6';
        const border = isIon
            ? (currentCharge > 0 ? '#fbbf24' : currentCharge < 0 ? '#34d399' : '#93c5fd')
            : '#93c5fd';
        const shadow = isIon
            ? (currentCharge > 0 ? '0 0 40px rgba(255,200,50,.3)' : currentCharge < 0 ? '0 0 40px rgba(52,211,153,.3)' : '0 0 40px rgba(59,130,246,.25)')
            : '0 0 40px rgba(59,130,246,.25)';
        const eCount = isIon ? electronCount : selected.Z;
        const dist = electronDistribution(eCount);
        const nShells = Math.max(selected.period, dist.length);
        const lbl = isIon ? formatIonLabel(selected.symbol, currentCharge) : selected.symbol;
        const svgSize = Math.ceil(rPx * 2 + 30);
        return (React.createElement("div", { className: "flex flex-col items-center gap-2" },
            React.createElement("div", { className: "text-sm text-white/80" },
                lbl,
                " ",
                React.createElement("span", { className: "text-white/50" },
                    "(",
                    Math.round(pmVar),
                    " pm)")),
            React.createElement("div", { style: { width: svgSize, height: svgSize }, className: "flex items-center justify-center" },
                React.createElement("svg", { width: svgSize, height: svgSize, viewBox: `${-svgSize / 2} ${-svgSize / 2} ${svgSize} ${svgSize}`, style: { transition: `all ${animMs}ms cubic-bezier(.2,.8,.2,1)` } },
                    [...Array(nShells)].map((_, i) => {
                        const idx = i + 1;
                        const frac = idx / (nShells + 0.6);
                        const rr = rPx * 0.92 * frac;
                        const eOnShell = dist[i] || 0;
                        const speed = Math.max(6, 16 - idx * 1.6);
                        const dir = idx % 2 === 0 ? 'normal' : 'reverse';
                        return (React.createElement("g", { key: `shell-${idx}`, className: "shellGroup" },
                            React.createElement("circle", { cx: 0, cy: 0, r: rr, fill: "none", stroke: "rgba(255,255,255,0.6)", strokeDasharray: "4 6", strokeWidth: 1, className: "ring", style: { animationDuration: `${3 + idx * 0.5}s` } }),
                            eOnShell > 0 && (React.createElement("g", { className: "orbit", style: { animation: `spin ${speed}s linear infinite`, animationDirection: dir, transformOrigin: 'center', transformBox: 'fill-box' } }, Array.from({ length: eOnShell }).map((__, k) => {
                                const ang = (k / eOnShell) * Math.PI * 2;
                                const x = rr * Math.cos(ang);
                                const y = rr * Math.sin(ang);
                                const er = Math.max(2, rPx * 0.025);
                                return React.createElement("circle", { key: `e-${idx}-${k}-${eCount}`, cx: x, cy: y, r: er, className: "electron" });
                            })))));
                    }),
                    React.createElement("g", { className: "nucleus", style: { animation: 'pulse 4.5s ease-in-out infinite', transformOrigin: 'center', transformBox: 'fill-box' } },
                        React.createElement("circle", { cx: 0, cy: 0, r: Math.max(6, rPx * 0.10), fill: "#ffffff", opacity: 0.9 })),
                    React.createElement("g", { className: "atomBody", style: { animation: 'pulse 6s ease-in-out infinite', transformOrigin: 'center', transformBox: 'fill-box' } },
                        React.createElement("circle", { cx: 0, cy: 0, r: rPx, fill: color, opacity: 0.8, stroke: border, strokeWidth: 4, style: { filter: `drop-shadow(${shadow})` } })))),
            React.createElement("div", { className: "text-[11px] text-white/60" }, isIon
                ? (currentCharge > 0 ? 'Cátion: tende a diminuir' : currentCharge < 0 ? 'Ânion: tende a aumentar' : 'Neutro')
                : 'Raio atômico base')));
    }
    function ComparePanel() {
        return (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
            React.createElement(AtomView, { mode: "neutral" }),
            React.createElement(AtomView, { mode: "ion" })));
    }
    const QUICK = ['Na', 'Cl', 'Mg', 'O'];
    return (React.createElement("div", { className: "min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-4 md:p-8" },
        React.createElement("header", { className: "flex flex-col md:flex-row md:items-end gap-4 md:gap-8 mb-6" },
            React.createElement("div", { className: "flex-1" },
                React.createElement("h1", { className: "text-2xl md:text-3xl font-bold tracking-tight" },
                    "Laborat\u00F3rio de Raios: ",
                    React.createElement("span", { className: "text-sky-300" }, "At\u00F4mico"),
                    " & ",
                    React.createElement("span", { className: "text-emerald-300" }, "I\u00F4nico")),
                React.createElement("p", { className: "text-white/70 text-sm md:text-base mt-1" }, "Visualize como o raio muda quando o \u00E1tomo vira \u00EDon. Controle o n\u00FAmero de el\u00E9trons e ou\u00E7a feedback sonoro. \u2728")),
            React.createElement("div", { className: "flex items-center gap-3" },
                React.createElement("button", { onClick: () => setSoundOn(s => !s), className: `px-3 py-2 rounded-xl text-sm font-medium border ${soundOn ? 'bg-white/10 border-white/30' : 'bg-black/30 border-white/10'} hover:bg-white/15 transition` }, soundOn ? 'Som: ligado' : 'Som: desligado'),
                React.createElement("button", { onClick: () => onToggleView(view === 'compare' ? 'neutral' : view === 'neutral' ? 'ion' : 'compare'), className: "px-3 py-2 rounded-xl text-sm font-medium border bg-white/10 border-white/30 hover:bg-white/15 transition" },
                    "Modo: ",
                    view === 'compare' ? 'Comparar' : view === 'neutral' ? 'Neutro' : 'Íon'))),
        React.createElement("section", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
            React.createElement("div", { className: "lg:col-span-2" },
                React.createElement("div", { className: "rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl" },
                    React.createElement("div", { className: "flex flex-col md:flex-row md:items-end gap-4 mb-5" },
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("label", { className: "block text-xs uppercase tracking-wider text-white/60 mb-1" }, "Elemento"),
                            React.createElement("div", { className: "flex flex-wrap gap-2" }, ELEMENTS.map(el => (React.createElement("button", { key: el.symbol, onClick: () => onSelectSymbol(el.symbol), className: `px-3 py-2 rounded-xl text-sm border transition ${selected.symbol === el.symbol ? 'bg-sky-500/20 border-sky-300/40' : 'bg-white/5 border-white/10 hover:bg-white/10'}` }, el.symbol)))),
                            React.createElement("div", { className: "mt-2 text-white/70 text-sm" },
                                "Selecionado: ",
                                React.createElement("span", { className: "font-semibold" },
                                    selected.name,
                                    " (",
                                    selected.symbol,
                                    ")"),
                                " \u2014 Per\u00EDodo ",
                                selected.period,
                                ", Z = ",
                                selected.Z)),
                        React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-xs uppercase tracking-wider text-white/60 mb-1" }, "Escala"),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("input", { id: "absScale", type: "checkbox", className: "accent-sky-400", checked: absoluteScale, onChange: e => { setAbsoluteScale(e.target.checked); playTone('toggle'); } }),
                                    React.createElement("label", { htmlFor: "absScale", className: "text-sm text-white/80" }, "Absoluta (comparar elementos)"))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "block text-xs uppercase tracking-wider text-white/60 mb-1" }, "Velocidade"),
                                React.createElement("input", { type: "range", min: 300, max: 1600, step: 50, value: animMs, onChange: e => setAnimMs(Number(e.target.value)), className: "w-full" }),
                                React.createElement("div", { className: "text-xs text-white/60" },
                                    animMs,
                                    " ms")))),
                    React.createElement("div", { className: "mb-6 p-3 rounded-xl bg-white/5 border border-white/10" },
                        React.createElement("div", { className: "flex items-end justify-between gap-4 flex-wrap" },
                            React.createElement("div", { className: "min-w-[220px]" },
                                React.createElement("div", { className: "text-xs uppercase tracking-wider text-white/60 mb-1" }, "El\u00E9trons (e\u207B)"),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("button", { className: "px-3 py-2 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15", onClick: () => nudgeElectrons(-1) }, "-"),
                                    React.createElement("input", { type: "number", className: "w-24 text-black rounded-lg px-2 py-1", value: electronCount, min: 0, max: selected.Z + 5, onChange: e => setElectronCount(clamp(Number(e.target.value || 0), 0, selected.Z + 5)) }),
                                    React.createElement("button", { className: "px-3 py-2 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15", onClick: () => nudgeElectrons(+1) }, "+")),
                                React.createElement("input", { type: "range", className: "w-full mt-2", min: 0, max: selected.Z + 5, step: 1, value: electronCount, onChange: e => setElectronCount(Number(e.target.value)) })),
                            React.createElement("div", { className: "flex-1 grid grid-cols-2 gap-4 min-w-[240px]" },
                                React.createElement("div", { className: "p-2 rounded-lg bg-white/5 border border-white/10 text-sm" },
                                    React.createElement("div", { className: "text-white/60" }, "Carga (Z \u2212 e\u207B)"),
                                    React.createElement("div", { className: "text-white text-lg font-semibold" }, currentCharge === 0 ? '0 (neutro)' : (currentCharge > 0 ? `+${currentCharge}` : `${currentCharge}`)),
                                    React.createElement("div", { className: "text-white/60 text-xs" },
                                        "R\u00F3tulo: ",
                                        React.createElement("span", { className: "text-white/80 font-semibold" }, formatIonLabel(selected.symbol, currentCharge))),
                                    selected.ionOptions && selected.ionOptions.length > 1 && (React.createElement("div", { className: "mt-2 flex items-center gap-2" },
                                        React.createElement("span", { className: "text-white/60 text-xs" }, "\u00CDon de refer\u00EAncia:"),
                                        React.createElement("select", { className: "text-black rounded px-2 py-1", value: ionIndex, onChange: e => { setIonIndex(Number(e.target.value)); playTone('toggle'); } }, selected.ionOptions.map((io, idx) => (React.createElement("option", { key: io.label, value: idx },
                                            io.label,
                                            " (",
                                            io.ionicRadius,
                                            " pm)"))))))),
                                React.createElement("div", { className: "p-2 rounded-lg bg-white/5 border border-white/10 text-sm" },
                                    React.createElement("div", { className: "text-white/60" }, "Raio atual"),
                                    React.createElement("div", { className: "text-white text-lg font-semibold" },
                                        Math.round(currentRadiusPm()),
                                        " pm"))),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement("button", { className: "px-3 py-2 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15", onClick: () => { setElectronCount(selected.Z); playTone('neutral'); } }, "Neutro"),
                                React.createElement("button", { className: "px-3 py-2 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15", onClick: () => { const ion = (selected.ionOptions && selected.ionOptions[ionIndex]) || selected.ion; setElectronCount(selected.Z - ion.charge); playTone('success'); } }, "\u00CDon comum")))),
                    React.createElement("div", { className: "mt-2" }, view === 'compare' ? React.createElement(ComparePanel, null) : React.createElement(AtomView, { mode: view })),
                    React.createElement("div", { className: "mt-6 grid grid-cols-1 md:grid-cols-1 gap-4 text-sm text-white/80" },
                        React.createElement("div", { className: "p-3 rounded-xl bg-white/5 border border-white/10" },
                            React.createElement("div", { className: "font-semibold mb-1" }, "Tend\u00EAncias peri\u00F3dicas"),
                            React.createElement("ul", { className: "list-disc pl-5 space-y-1 text-white/70" },
                                React.createElement("li", null,
                                    "Descendo um grupo: raio ",
                                    React.createElement("span", { className: "text-emerald-300" }, "aumenta"),
                                    "."),
                                React.createElement("li", null,
                                    "Da esquerda para a direita: raio ",
                                    React.createElement("span", { className: "text-rose-300" }, "diminui"),
                                    "."),
                                React.createElement("li", null,
                                    "C\u00E1tion (perde el\u00E9trons): raio ",
                                    React.createElement("span", { className: "text-rose-300" }, "menor"),
                                    "."),
                                React.createElement("li", null,
                                    "\u00C2nion (ganha el\u00E9trons): raio ",
                                    React.createElement("span", { className: "text-emerald-300" }, "maior"),
                                    ".")))))),
            React.createElement("aside", { className: "space-y-6" },
                React.createElement("div", { className: "rounded-2xl p-5 border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl" },
                    React.createElement("div", { className: "text-sm uppercase tracking-wider text-white/60 mb-3" }, "Exemplos r\u00E1pidos"),
                    React.createElement("div", { className: "grid grid-cols-2 gap-3" }, QUICK.map(sym => (React.createElement("button", { key: sym, onClick: () => { const el = ELEMENTS.find(e => e.symbol === sym); const firstIon = ((el === null || el === void 0 ? void 0 : el.ionOptions) && el.ionOptions[0]) || (el === null || el === void 0 ? void 0 : el.ion); onSelectSymbol(sym); setView('compare'); setElectronCount(((el === null || el === void 0 ? void 0 : el.Z) || 0) - ((firstIon === null || firstIon === void 0 ? void 0 : firstIon.charge) || 0)); }, className: "text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition" },
                        React.createElement("div", { className: "text-base font-semibold" }, sym),
                        React.createElement("div", { className: "text-xs text-white/60" }, (() => { const el = ELEMENTS.find(e => e.symbol === sym); const firstIon = ((el === null || el === void 0 ? void 0 : el.ionOptions) && el.ionOptions[0]) || (el === null || el === void 0 ? void 0 : el.ion); return `${sym} → ${(firstIon === null || firstIon === void 0 ? void 0 : firstIon.label) || ''}`; })()))))),
                    React.createElement("div", { className: "mt-4 text-xs text-white/60" }, "Clique para carregar, ajustar para o \u00EDon comum e comparar ao neutro.")))),
        React.createElement("footer", { className: "mt-8 text-center text-xs text-white/50" }, "Feito com \u2665 para aulas de Qu\u00EDmica. Valores aproximados para fins educacionais."),
        React.createElement("style", null, `
              * { box-sizing: border-box; }
              input[type="range"] { accent-color: #38bdf8; }
              /* Animações melhoradas */
              @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
              @keyframes popIn { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
              @keyframes ringGlow { 0%,100% { opacity: .45; } 50% { opacity: .85; } }
              .electron { fill: #fff; opacity: .95; filter: drop-shadow(0 0 6px rgba(255,255,255,.6)); animation: popIn .5s ease-out both; }
              .ring { animation: ringGlow 4s ease-in-out infinite; }
            `)));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(AtomicIonicRadiusApp, null));
