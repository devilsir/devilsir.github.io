import * as T from 'three';
import { v, group, labelSprite } from '../core/geometry.js';
import {
  makeSculptedChromatid, makeSculptedCentrosome, makeSculptedCellShell,
  makeSpindleBundlePool, makeContractileRing, makeChiasmaComplex
} from './cellDivisionModels.js?v=14';
import { node, select, range, button, heading, card, note, row, legend, metric, showTooltip, hideTooltip } from '../core/ui.js?v=9';

const modes = {
  mitosis: 'Mitose · Divisão equacional (2n → 2 × 2n)',
  meiosis: 'Meiose · Reducional + equacional (2n → 4 × n)'
};

const mitosisStages = [
  { name: 'Interfase (G1 · S · G2)', badge: 'PREPARO · DUPLICAÇÃO DO DNA', duration: 6.5, cells: '1 célula', ploidy: '2n (Diploide)',
    text: 'G1: intensa síntese de RNA, proteínas e crescimento. S: duplicação semiconservativa do DNA — anéis proteicos de Coesina unem as duas cromátides-irmãs recém-formadas. G2: maturação dos centrossomos (centríolos 9×3) e preparo energético.' },
  { name: 'Prófase', badge: 'CONDENSAÇÃO, COESINA E FUSO', duration: 5.5, cells: '1 célula', ploidy: '2n (duplicado)',
    text: 'As condensinas e histonas compactam a cromatina em fibras superenroladas. O envelope nuclear (com poros nucleares NPC) se fragmenta e os centrossomos migram aos polos irradiando microtúbulos do áster e do fuso.' },
  { name: 'Metáfase', badge: 'PLACA EQUATORIAL · CINETÓCOROS', duration: 5.5, cells: '1 célula', ploidy: '2n (alinhado)',
    text: 'Condensação máxima: os complexos proteicos do cinetócoro (NDC80/CENP-A) ancoram-se aos microtúbulos do fuso, alinhando todos os cromossomos na placa equatorial sob tensão equilibrada.' },
  { name: 'Anáfase', badge: 'CLIVAGEM DA COESINA · SEPARAÇÃO', duration: 5.5, cells: '1 célula', ploidy: '2n → 2n + 2n',
    text: 'A enzima Separase cliva os anéis de Coesina! Proteínas motoras (Dineína e Cinesina) e o encurtamento dos microtúbulos tracionam as cromátides-irmãs em formato de V para polos opostos.' },
  { name: 'Telófase e Citocinese', badge: 'ANEL DE ACTINA-MIOSINA II', duration: 5.5, cells: '1 → 2 células', ploidy: '2 × 2n',
    text: 'Novos envelopes nucleares com poros nucleares se reorganizam enquanto o anel contrátil de Actina-Miosina II estrangula o citoplasma no sulco de clivagem.' },
  { name: 'Resultado · 2 células 2n', badge: 'CLONES SOMÁTICOS', duration: 5.0, cells: '2 células-filhas', ploidy: '2n (Diploides idênticas)',
    text: 'A mitose (divisão equacional) ocorre em células somáticas, gerando duas células-filhas diploides (2n) geneticamente idênticas à célula-mãe para crescimento e regeneração.' }
];

const meiosisStages = [
  { name: 'Interfase (G1 · S · G2)', badge: 'CÉLULA GERMINATIVA 2n', duration: 5.5, cells: '1 célula', ploidy: '2n (Diploide)',
    text: 'Precede a meiose: ocorre duplicação do DNA na fase S em células germinativas, formando pares de cromossomos homólogos (azul = materno, coral = paterno) com cromátides-irmãs abraçadas por anéis de Coesina.' },
  { name: 'Prófase I · Crossing-Over', badge: 'LEPTÓTENO → ZIGÓTENO → PAQUÍTENO → DIPLÓTENO → DIACINESE', duration: 8.5, cells: '1 célula', ploidy: '2n (tétrades)',
    text: 'Os cromossomos homólogos se emparelham formando tétrades. No paquíteno, o nódulo de recombinação (enzimas Rad51/Spo11) promove o CROSSING-OVER nos quiasmas: troca física de segmentos entre cromátides não-irmãs, gerando variabilidade genética.' },
  { name: 'Metáfase I', badge: 'TERMINALIZAÇÃO DOS QUIASMAS', duration: 5.0, cells: '1 célula', ploidy: '2n (pares homólogos)',
    text: 'Os pares de cromossomos homólogos já recombinados alinham-se lado a lado na placa equatorial, conectados ao fuso por seus cinetócoros proteicos.' },
  { name: 'Anáfase I (Reducional)', badge: 'SEPARAÇÃO DOS HOMÓLOGOS', duration: 5.5, cells: '1 célula', ploidy: '2n → n + n',
    text: 'Etapa reducional: a coesina dos braços é clivada, mas a coesina centromérica permanece intacta (protegida por Shugoshin), puxando homólogos inteiros duplicados para polos opostos.' },
  { name: 'Telófase I e Intercinese', badge: 'FIM DA MEIOSE I · 2 CÉLULAS n', duration: 5.5, cells: '2 células', ploidy: '2 × n (duplicados)',
    text: 'O anel de Actina-Miosina II conclui a citocinese I originando 2 células haploides (n). Na intercinese, os centríolos 9×3 se duplicam sem nova replicação de DNA.' },
  { name: 'Prófase II', badge: 'INÍCIO DA MEIOSE II (EQUACIONAL)', duration: 4.5, cells: '2 células', ploidy: '2 × n',
    text: 'Os cromossomos recombinados condensam-se novamente e novos fusos de microtúbulos se organizam simultaneamente nas duas células geradas na Meiose I.' },
  { name: 'Metáfase II', badge: 'ALINHAMENTO EQUATORIAL II', duration: 4.5, cells: '2 células', ploidy: '2 × n',
    text: 'Os cromossomos alinham-se individualmente no plano equatorial de cada célula, ligados ao fuso pelos complexos do cinetócoro.' },
  { name: 'Anáfase II (Equacional)', badge: 'SEPARAÇÃO DE CROMÁTIDES-IRMÃS', duration: 5.0, cells: '2 → 4 núcleos', ploidy: '4 × n',
    text: 'Etapa equacional: a coesina centromérica é finalmente clivada e as proteínas motoras separam as cromátides-irmãs (recombinadas pelo crossing-over!) para polos opostos.' },
  { name: 'Telófase II · 4 células n', badge: 'GAMETAS HAPLOIDES DIVERSOS', duration: 5.5, cells: '4 células-filhas', ploidy: '4 × n (Haploides diversas)',
    text: 'A citocinese II finaliza a meiose gerando 4 células haploides (n) geneticamente distintas (ABC, ABc, abC, abc), essenciais para a reprodução sexuada e hereditariedade.' }
];

const MATERNAL_HEX = '#4c94eb';
const PATERNAL_HEX = '#e8626e';
const cMat = new T.Color(MATERNAL_HEX);
const cPat = new T.Color(PATERNAL_HEX);
const cMat2 = new T.Color('#61b6f5');
const cPat2 = new T.Color('#f28c6b');

export function cellDivision3d({ scene, lights, engine, label, toolbar, guide, viewport, tooltip, signal, audio, help }) {
  // Rich 3-point bio-studio lighting with crisp shadows & luminous cellular rim!
  lights.rim.color.set('#6ae8fa');
  lights.rim.intensity = 2.15;
  scene.fog.density = 0.0072;

  const divKeyLight = new T.PointLight('#fff4de', 2.2, 26, 1.4);
  divKeyLight.position.set(4.5, 6.2, 7.8);
  divKeyLight.castShadow = true;
  const divRimLight = new T.PointLight('#52d8ff', 1.65, 22, 1.5);
  divRimLight.position.set(-6.2, -3.5, -4.8);
  const divBioFill = new T.PointLight('#c084fc', 1.15, 20, 1.6);
  divBioFill.position.set(0.0, -5.2, 4.5);
  scene.add(divKeyLight, divRimLight, divBioFill);

  let mode = 'mitosis';
  let playing = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let time = 0, speed = 1, stage = 0, clock = 0, hoveredKey = null;

  const currentStages = () => (mode === 'mitosis' ? mitosisStages : meiosisStages);
  const totalTime = () => currentStages().reduce((s, item) => s + item.duration, 0);
  const stageStarts = () => {
    const list = currentStages();
    let acc = 0;
    return list.map(item => { const start = acc; acc += item.duration; return start; });
  };

  // Sculpted reusable 3D biological actors
  const cells = Array.from({ length: 4 }, (_, i) => makeSculptedCellShell(scene, 2.55, i + 1));
  const centrosomes = Array.from({ length: 4 }, () => makeSculptedCentrosome(scene));
  const spindles = makeSpindleBundlePool(scene, 24);

  const chrSpecs = [
    { pair: 0, origin: 'maternal', color: MATERNAL_HEX, len: 1.48, swapB: true },
    { pair: 0, origin: 'paternal', color: PATERNAL_HEX, len: 1.48, swapA: true },
    { pair: 1, origin: 'maternal', color: '#61b6f5', len: 1.06, swapB: true },
    { pair: 1, origin: 'paternal', color: '#f28c6b', len: 1.06, swapA: true }
  ];
  const chromatids = chrSpecs.map((spec, idx) => ({
    spec,
    a: makeSculptedChromatid(scene, spec.color, spec.len, 'chromosome', idx * 2 + 1),
    b: makeSculptedChromatid(scene, spec.color, spec.len, 'chromosome', idx * 2 + 2)
  }));

  // Sculpted RecA/Rad51 Recombination Nodule & Chiasma Complex
  const chiasma = makeChiasmaComplex(scene);
  chiasma.group.visible = false;

  // Sculpted Actomyosin Contractile Cleavage Furrow Rings (F-Actin + Myosin-II motor heads!)
  const cleaveMid = makeContractileRing(scene, 2.42);
  cleaveMid.rotation.y = Math.PI / 2;
  cleaveMid.visible = false;
  const cleaveL = makeContractileRing(scene, 1.92);
  cleaveL.position.set(-3.25, 0, 0);
  cleaveL.rotation.x = Math.PI / 2;
  cleaveL.visible = false;
  const cleaveR = makeContractileRing(scene, 1.92);
  cleaveR.position.set(3.25, 0, 0);
  cleaveR.rotation.x = Math.PI / 2;
  cleaveR.visible = false;

  // Cached 3D allele micro-tags for Pair 0 Crossing-Over
  const alleleGroup = group(scene);
  const mkAllele = (txt, border, color) => {
    const sp = labelSprite(txt, { scale: 0.21, border, color, font: '700 28px Consolas, monospace' });
    alleleGroup.add(sp);
    return sp;
  };
  const tagMatA = mkAllele('A·B·C', MATERNAL_HEX, '#d6ebff');
  const tagMatBPre = mkAllele('A·B·C', MATERNAL_HEX, '#d6ebff');
  const tagMatBPost = mkAllele('A·B·c', '#ffca57', '#fff2c2');
  const tagPatAPre = mkAllele('a·b·c', PATERNAL_HEX, '#ffd9de');
  const tagPatAPost = mkAllele('a·b·C', '#ffca57', '#fff2c2');
  const tagPatB = mkAllele('a·b·c', PATERNAL_HEX, '#ffd9de');
  alleleGroup.visible = false;

  // Projected 3D labels
  const chiasmaLabel = label('Quiasma · Nódulo Rad51 (Crossing-Over)', chiasma.group, v(0, -0.56, 0.24));
  chiasmaLabel.item.classList.add('step-pin');
  chiasmaLabel.enabled = false;
  const centLabel = label('Cinetócoro (NDC80) & Coesina', chromatids[0].a.root, v(-0.62, -0.04, 0.24));
  const teloLabel = label('Telômero (Shelterin)', chromatids[0].a.root, v(-0.56, -0.74, 0.24));
  const fusoLabel = label('Centríolos 9×3 & Fuso (Tubulina)', centrosomes[0], v(0.24, 0.64, 0.24));
  const ringLabel = label('Anel contrátil (Actina-Miosina II)', cleaveMid, v(0, -1.65, 0.25));
  ringLabel.enabled = false;
  const cellLabels = [0, 1, 2, 3].map(i => label('', cells[i].root, v(0, 1.66, 0.24)));

  // Hover tooltips covering sculpted proteins & organelles
  const interactives = new Map([
    ['chromosome', { title: 'Cromossomo (Cromatina superenrolada)', subtitle: 'Fibra solenoide compactada por histonas e condensinas · Telômeros Shelterin nas pontas', color: '#4c94eb' }],
    ['kinetochore', { title: 'Complexo do Cinetócoro (CENP-A / NDC80)', subtitle: 'Placa proteica trilaminar que ancora os microtúbulos do fuso ao centrômero', color: '#68f0ff' }],
    ['cohesin', { title: 'Anéis Proteicos de Coesina (SMC1/SMC3)', subtitle: 'Mantêm as cromátides-irmãs unidas até serem clivados pela enzima Separase na Anáfase', color: '#ff9f43' }],
    ['motor', { title: 'Proteínas Motoras (Cinesina / Dineína)', subtitle: 'Dímeros proteicos movidos a ATP que deslizam sobre microtúbulos tracionando os cromossomos', color: '#5ef2b0' }],
    ['centrosome', { title: 'Centrossomo (Centríolos 9×3 + PCM)', subtitle: 'Par ortogonal de 9 tripletos de microtúbulos irradiando fibras do áster e do fuso', color: '#f4b459' }],
    ['actomyosin', { title: 'Anel Contrátil de Actina–Miosina II', subtitle: 'Filamentos de F-actina tracionados por cabeças motoras de miosina II no sulco de clivagem', color: '#ff8c69' }],
    ['chiasma', { title: 'Quiasma · Nódulo de Recombinação (Rad51)', subtitle: 'Enzimas de recombinação mediando a troca física de segmentos homólogos (A·B·c ↔ a·b·C)', color: '#ffca57' }]
  ]);

  const ray = new T.Raycaster(), pointer = new T.Vector2();
  const canvas = engine.renderer.domElement;
  const pickRoots = [...chromatids.flatMap(c => [c.a.root, c.b.root]), ...centrosomes, chiasma.group, cleaveMid, cleaveL, cleaveR];

  canvas.addEventListener('pointermove', event => {
    if (event.buttons || event.pointerType === 'touch') { hideTooltip(tooltip, viewport); return; }
    const bounds = canvas.getBoundingClientRect();
    pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, 1 - (event.clientY - bounds.top) / bounds.height * 2);
    ray.setFromCamera(pointer, engine.camera);
    let found = null;
    for (const hit of ray.intersectObjects(pickRoots, true)) {
      let obj = hit.object;
      while (obj && !obj.userData.pickKey) obj = obj.parent;
      if (obj?.userData.pickKey) { found = obj.userData.pickKey; break; }
    }
    hoveredKey = found;
    if (found) {
      const info = interactives.get(found);
      showTooltip(tooltip, viewport, event.clientX, event.clientY, info.title, info.subtitle, info.color);
    } else hideTooltip(tooltip, viewport);
  }, { signal });
  canvas.addEventListener('pointerleave', () => { hoveredKey = null; hideTooltip(tooltip, viewport); }, { signal });

  // UI elements
  const stageBadge = node('p', { className: 'pill' });
  const stageTitle = heading('');
  const stageText = node('p');
  const cellMetric = metric('CÉLULAS', '1 célula');
  const ploidyMetric = metric('PLOIDIA', '2n (Diploide)');
  const divTypeMetric = metric('TIPO DE DIVISÃO', 'Equacional');
  const varMetric = metric('VARIABILIDADE', 'Células idênticas');

  let zoomedChiasma = false;
  const timeBar = range('Linha do tempo', 0, totalTime(), 0.05, 0, val => seek(val),
    val => val.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' s', { wheel: true, reset: 0 });
  const playBtn = button(playing ? 'Pausar' : 'Reproduzir', () => {
    if (!playing && time >= totalTime()) seek(0);
    playing = !playing;
    playBtn.textContent = playing ? 'Pausar' : 'Reproduzir';
    audio.play('click');
  });
  const stageNavRow = row();
  const crossingZoomBtn = button('Zoom: Crossing-Over', () => {
    if (mode !== 'meiosis') switchMode('meiosis');
    playing = false;
    playBtn.textContent = 'Reproduzir';
    const starts = stageStarts();
    seek(starts[1] + meiosisStages[1].duration * 0.58);
    zoomedChiasma = true;
    engine.view([0.08, 0.92, 5.1], [0, 0.82, 0.06]);
    engine.setFocusFilter([chromatids[0].a.root, chromatids[0].b.root, chromatids[1].a.root, chromatids[1].b.root, chiasma.group], 0.85);
    audio.play('click');
  });

  function rebuildStageButtons() {
    const list = currentStages();
    const starts = stageStarts();
    stageNavRow.replaceChildren(...list.map((st, idx) =>
      button(st.name.split(' · ')[0].replace(' e Citocinese', '').replace(' e Intercinese', ''), () => {
        seek(starts[idx] + 0.05);
        audio.play('click');
      }, { 'aria-pressed': String(idx === stage) })
    ));
  }

  function updateStageUI() {
    const list = currentStages();
    const st = list[stage];
    stageBadge.textContent = st.badge;
    stageTitle.textContent = st.name;
    stageText.textContent = st.text;
    cellMetric.value.textContent = st.cells;
    ploidyMetric.value.textContent = st.ploidy;
    divTypeMetric.value.textContent = mode === 'mitosis' ? 'Equacional (2n→2n)' : stage <= 4 ? 'Meiose I · Reducional' : 'Meiose II · Equacional';
    varMetric.value.textContent = mode === 'mitosis' ? 'Clones idênticos' : stage >= 1 ? 'Alta (Crossing-Over)' : 'Aguardando Prófase I';
    Array.from(stageNavRow.children).forEach((btn, i) => btn.setAttribute('aria-pressed', String(i === stage)));
  }

  function seek(next) {
    const tot = totalTime();
    time = Math.max(0, Math.min(tot, next));
    timeBar.input.max = tot;
    timeBar.set(time);
    const starts = stageStarts();
    const nextStage = starts.findLastIndex(s => time >= s);
    if (nextStage !== stage && nextStage >= 0) {
      stage = nextStage;
      updateStageUI();
      if (zoomedChiasma && (mode !== 'meiosis' || stage !== 1)) {
        zoomedChiasma = false;
        defaultCamera(false);
      }
    }
  }

  function defaultCamera(instant = false) {
    zoomedChiasma = false;
    engine.clearFocusFilter(instant);
    engine.view(mode === 'meiosis' ? [0, 1.3, 15.2] : [0, 1.2, 13.8], [0, 0, 0], instant);
  }

  function switchMode(nextMode) {
    mode = nextMode;
    modeSelect.input.value = mode;
    stage = 0;
    time = 0;
    timeBar.input.max = totalTime();
    timeBar.set(0);
    rebuildStageButtons();
    updateStageUI();
    defaultCamera(false);
    audio.play('click');
  }

  const modeSelect = select('Processo', modes, mode, value => switchMode(value));
  toolbar.append(
    modeSelect.element,
    playBtn,
    timeBar.element,
    range('Velocidade', 0.5, 2, 0.25, 1, val => { speed = val; }, val => val.toLocaleString('pt-BR') + '×', { wheel: true }).element,
    row(
      button('← Fase', () => { const s = stageStarts(); seek(s[Math.max(0, stage - 1)] + 0.05); audio.play('click'); }),
      button('Fase →', () => { const s = stageStarts(); seek(s[Math.min(s.length - 1, stage + 1)] + 0.05); audio.play('click'); }, { className: 'primary' }),
      crossingZoomBtn,
      button('Resetar câmera', () => { audio.play('click'); defaultCamera(); })
    ),
    stageNavRow
  );

  guide.append(
    stageBadge, stageTitle, stageText,
    node('div', { className: 'metrics' }, cellMetric.element, ploidyMetric.element, divTypeMetric.element, varMetric.element),
    legend([
      [MATERNAL_HEX, 'Homólogo materno'],
      [PATERNAL_HEX, 'Homólogo paterno'],
      ['#ff9f43', 'Anel de Coesina'],
      ['#68f0ff', 'Cinetócoro (NDC80)'],
      ['#5ef2b0', 'Proteína motora'],
      ['#ff8c69', 'Actina–Miosina II']
    ]),
    card('Maquinaria proteica da divisão',
      'Coesinas (laranja) mantêm as cromátides-irmãs unidas até serem clivadas pela Separase na Anáfase. Cinetócoros (ciano) ancoram cada centrômero aos microtúbulos de tubulina, enquanto proteínas motoras (Cinesina/Dineína, verde) e o anel contrátil de Actina-Miosina II movem cromossomos e estrangulam o citoplasma.'),
    card('Cromossomos homólogos e Crossing-Over',
      'Homólogos carregam genes para as mesmas características (alelos A/B/C maternos e a/b/c paternos). Na Meiose I (paquíteno), o nódulo de recombinação Rad51 troca segmentos entre cromátides não-irmãs gerando gametas recombinantes (A·B·c e a·b·C).'),
    card('Mitose × Meiose',
      'Mitose: células somáticas, divisão equacional, 1 célula 2n → 2 células-filhas 2n idênticas. Meiose: células germinativas, Meiose I reducional + Meiose II equacional, 1 célula 2n → 4 gametas haploides (n) geneticamente diversos.'),
    note('Passe o cursor sobre os cromossomos, anéis de coesina, centríolos 9×3 ou anel contrátil para inspecionar cada complexo proteico, ou clique em “Zoom: Crossing-Over”.')
  );
  help.textContent = 'Arraste para orbitar · Passe o cursor sobre proteínas e organelas · Use “Zoom: Crossing-Over”';

  rebuildStageButtons();
  updateStageUI();
  defaultCamera(true);

  const smooth = x => { const c = Math.max(0, Math.min(1, x)); return c * c * (3 - 2 * c); };

  function setChromatid(ch, x, y, z, rz, scale = 1, visible = true, vBend = 0, lowExtra = 0, cohesinOpacity = 0.9) {
    ch.root.visible = visible;
    ch.root.position.set(x, y, z);
    ch.root.rotation.set(0, 0, rz);
    ch.root.scale.setScalar(scale);
    ch.upperPivot.rotation.z = -vBend;
    ch.lowerPivot.rotation.z = vBend + lowExtra;
    ch.cohesinRing.visible = cohesinOpacity > 0.04;
    ch.cohesinMat.opacity = cohesinOpacity;
  }

  function applyCrossingOverTint(fraction) {
    const pairs = [
      [chromatids[0], chromatids[1], cMat, cPat],
      [chromatids[2], chromatids[3], cMat2, cPat2]
    ];
    for (const [matChr, patChr, colM, colP] of pairs) {
      matChr.a.tipMat.color.copy(colM);
      patChr.b.tipMat.color.copy(colP);
      matChr.b.tipMat.color.copy(colM).lerp(colP, fraction);
      patChr.a.tipMat.color.copy(colP).lerp(colM, fraction);
      const glowSwap = fraction > 0.05 && fraction < 0.96 ? 0.45 : 0.10;
      matChr.b.tipMat.emissive.copy(matChr.b.tipMat.color);
      patChr.a.tipMat.emissive.copy(patChr.a.tipMat.color);
      matChr.b.tipMat.emissiveIntensity = glowSwap;
      patChr.a.tipMat.emissiveIntensity = glowSwap;
      const seamOn = fraction > 0.04 ? 0.92 : 0.22;
      matChr.b.seamMat.emissiveIntensity = seamOn;
      patChr.a.seamMat.emissiveIntensity = seamOn;
      matChr.a.seamMat.emissiveIntensity = 0.14;
      patChr.b.seamMat.emissiveIntensity = 0.14;
    }
  }

  function setNuclearOpacity(cell, visible, opacity) {
    cell.nuc.visible = visible && opacity > 0.02;
    cell.nucMat.opacity = opacity;
    cell.npcMat.opacity = Math.min(0.85, opacity * 2.4);
  }

  function setRingState(ring, visible, pinchScale, opacity) {
    ring.visible = visible;
    if (!visible) return;
    ring.scale.setScalar(pinchScale);
    ring.rotation.x += 0; // preserve orientation
    for (const m of ring.userData.mats) m.opacity = opacity;
  }

  function updateMitosis(stIdx, p) {
    const sp = smooth(p);
    applyCrossingOverTint(0);
    chiasma.group.visible = false;
    chiasmaLabel.enabled = false;
    alleleGroup.visible = false;
    cleaveL.visible = cleaveR.visible = false;
    cells[2].root.visible = cells[3].root.visible = false;
    centrosomes[2].visible = centrosomes[3].visible = false;
    cellLabels[2].enabled = cellLabels[3].enabled = false;

    const ys = [1.22, 0.41, -0.41, -1.22];
    const sepCell = stIdx === 4 ? sp * 2.55 : stIdx === 5 ? 2.85 : 0;

    // Sculpted Actomyosin Contractile Cleavage Ring tightening during Cytokinesis (stage 4)
    const showMidRing = stIdx === 4 && p < 0.92;
    setRingState(cleaveMid, showMidRing, Math.max(0.14, 1 - sp * 0.86), (1 - sp * 0.72) * 0.92);
    if (showMidRing) cleaveMid.position.set(0, 0, 0);
    ringLabel.enabled = showMidRing && p > 0.12 && p < 0.82;

    if (stIdx <= 3) {
      cells[0].root.visible = true;
      cells[1].root.visible = false;
      const stretchX = stIdx === 3 ? 1 + sp * 0.28 : 1;
      cells[0].root.position.set(0, 0, 0);
      cells[0].root.scale.set(stretchX, 1 - (stretchX - 1) * 0.24, 1);
      setNuclearOpacity(cells[0], stIdx <= 1, stIdx === 0 ? 0.36 : (1 - sp) * 0.36);
      cellLabels[0].enabled = true;
      cellLabels[0].item.textContent = stIdx === 0 ? 'Célula-mãe (2n)' : stIdx === 2 ? 'Placa equatorial' : 'Mitose (2n)';
      cellLabels[1].enabled = false;
    } else {
      cells[0].root.visible = cells[1].root.visible = true;
      const sc = stIdx === 4 ? 0.86 - sp * 0.08 : 0.78;
      cells[0].root.position.set(-sepCell, 0, 0);
      cells[1].root.position.set(sepCell, 0, 0);
      cells[0].root.scale.setScalar(sc);
      cells[1].root.scale.setScalar(sc);
      const nOp = stIdx === 4 ? sp * 0.34 : 0.34;
      setNuclearOpacity(cells[0], true, nOp);
      setNuclearOpacity(cells[1], true, nOp);
      cellLabels[0].enabled = cellLabels[1].enabled = true;
      cellLabels[0].item.textContent = 'Célula-filha 1 (2n)';
      cellLabels[1].item.textContent = 'Célula-filha 2 (2n)';
    }

    // Centrosomes (9x3 centrioles + radiating 3D aster rays!)
    centrosomes[0].visible = centrosomes[1].visible = true;
    const poleX = stIdx === 0 ? 0.38 + sp * 0.45 : stIdx === 1 ? 0.83 + sp * 1.34 : stIdx === 2 ? 2.17 : stIdx === 3 ? 2.17 + sp * 0.45 : sepCell + 1.15;
    const poleY = stIdx === 0 ? 1.55 : stIdx === 1 ? 1.55 * (1 - sp) : 0;
    centrosomes[0].position.set(-poleX, poleY, 0);
    centrosomes[1].position.set(poleX, poleY, 0);
    const asterScale = stIdx === 0 ? 0.45 + sp * 0.35 : stIdx <= 3 ? 1.05 : 0.58;
    centrosomes[0].userData.aster.scale.setScalar(asterScale);
    centrosomes[1].userData.aster.scale.setScalar(asterScale);
    fusoLabel.enabled = stIdx >= 1 && stIdx <= 3;

    // Cohesin rings hold chromatids through Metaphase, then CLEAVE cleanly right at start of Anaphase!
    const cohesinOp = stIdx <= 2 ? 0.92 : stIdx === 3 ? Math.max(0, 1 - sp * 3.8) : 0;

    for (let i = 0; i < 4; i++) {
      const ch = chromatids[i];
      const iy = ys[i];
      if (stIdx === 0) {
        const dup = smooth((p - 0.25) / 0.55);
        const cx = (i % 2 === 0 ? -0.45 : 0.45);
        const cy = (i < 2 ? 0.45 : -0.45);
        setChromatid(ch.a, cx - dup * 0.045, cy, 0.08 * i, 0, 0.65 + dup * 0.15, true, -0.14 * dup, 0, dup * 0.88);
        setChromatid(ch.b, cx + dup * 0.045, cy, 0.08 * i + 0.01, 0, 0.65 + dup * 0.15, dup > 0.05, 0.14 * dup, 0, dup * 0.88);
      } else if (stIdx === 1) {
        const cx = (i % 2 === 0 ? -0.45 : 0.45) * (1 - sp * 0.65);
        const cy = T.MathUtils.lerp(i < 2 ? 0.45 : -0.45, iy, sp);
        setChromatid(ch.a, cx - 0.056, cy, 0.06 * (i - 1.5), 0, 0.82 + sp * 0.16, true, -0.2, 0, cohesinOp);
        setChromatid(ch.b, cx + 0.056, cy, 0.06 * (i - 1.5), 0, 0.82 + sp * 0.16, true, 0.2, 0, cohesinOp);
        spindles.add(-poleX, poleY, 0, cx - 0.09, cy, 0.06 * (i - 1.5), clock, true);
        spindles.add(poleX, poleY, 0, cx + 0.09, cy, 0.06 * (i - 1.5), clock, true);
      } else if (stIdx === 2) {
        setChromatid(ch.a, -0.058, iy, 0.05, 0, 0.96, true, -0.21, 0, cohesinOp);
        setChromatid(ch.b, 0.058, iy, 0.05, 0, 0.96, true, 0.21, 0, cohesinOp);
        spindles.add(-poleX, 0, 0, -0.11, iy, 0.05, clock, true);
        spindles.add(poleX, 0, 0, 0.11, iy, 0.05, clock, true);
      } else if (stIdx === 3) {
        const dist = 0.06 + sp * 1.72;
        const vPull = 0.15 + Math.sin(sp * Math.PI * 0.85) * 0.44;
        const curY = iy * (1 - sp * 0.25);
        setChromatid(ch.a, -dist, curY, 0.05, 0, 0.94, true, vPull, 0, cohesinOp);
        setChromatid(ch.b, dist, curY, 0.05, 0, 0.94, true, -vPull, 0, cohesinOp);
        spindles.add(-poleX, 0, 0, -dist - 0.07, curY, 0.05, clock, true);
        spindles.add(poleX, 0, 0, dist + 0.07, curY, 0.05, clock, true);
      } else {
        const cx = stIdx === 4 ? T.MathUtils.lerp(1.78, sepCell, sp) : sepCell;
        const spreadY = iy * 0.56;
        const spreadX = (i % 2 === 0 ? -0.26 : 0.26);
        const relax = stIdx === 4 ? (1 - sp) * 0.36 : 0.04;
        setChromatid(ch.a, -cx + spreadX, spreadY, 0.05, 0.08, 0.72, true, relax, 0, 0);
        setChromatid(ch.b, cx + spreadX, spreadY, 0.05, -0.08, 0.72, true, -relax, 0, 0);
      }
    }

    // Interpolar spindle fibers pushing poles apart during Metaphase & Anaphase!
    if (stIdx === 2 || stIdx === 3) {
      spindles.add(-poleX, 0, -0.28, poleX, 0, -0.28, clock, true);
      spindles.add(-poleX, 0.88, -0.18, poleX, 0.88, -0.18, clock, false);
      spindles.add(-poleX, -0.88, -0.18, poleX, -0.88, -0.18, clock, false);
    }

    centLabel.enabled = stIdx === 1 || stIdx === 2;
    teloLabel.enabled = stIdx === 1 || stIdx === 2;
  }

  function updateMeiosis(stIdx, p) {
    const sp = smooth(p);
    const swapFrac = stIdx < 1 ? 0 : stIdx === 1 ? smooth((p - 0.38) / 0.28) : 1;
    applyCrossingOverTint(swapFrac);

    if (stIdx === 1) {
      const subBadge = p < 0.18 ? '1/5 LEPTÓTENO · Condensação inicial'
        : p < 0.38 ? '2/5 ZIGÓTENO · Sinapse (pareamento de homólogos)'
        : p < 0.68 ? '3/5 PAQUÍTENO · Crossing-Over (nódulo Rad51!)'
        : p < 0.86 ? '4/5 DIPLÓTENO · Quiasmas visíveis'
        : '5/5 DIACINESE · Terminalização dos quiasmas';
      if (stageBadge.textContent !== subBadge) stageBadge.textContent = subBadge;
    }

    const isChiasma = stIdx === 1 && p > 0.28 && p < 0.92;
    chiasma.group.visible = isChiasma;
    chiasmaLabel.enabled = isChiasma;
    alleleGroup.visible = stIdx === 1 && p > 0.15;

    const pairY = [0.8, -0.96];
    if (isChiasma) {
      chiasma.group.position.set(0, pairY[0] - 0.48, 0.10);
      chiasma.ring.scale.setScalar(0.88 + Math.sin(clock * 6.5) * 0.14);
      chiasma.nodule.rotation.z = clock * 1.4;
      chiasmaLabel.item.textContent = swapFrac > 0.55
        ? 'Quiasma · Alelos recombinados (A·B·c ↔ a·b·C)'
        : 'Quiasma · Nódulo Rad51 (Crossing-Over)';
    }

    // Sculpted Actomyosin Contractile Cleavage Rings for Cytokinesis I & II
    const showMid = stIdx === 4 && p < 0.9;
    setRingState(cleaveMid, showMid, Math.max(0.14, 1 - sp * 0.86), (1 - sp * 0.72) * 0.92);
    if (showMid) cleaveMid.position.set(0, 0, 0);
    ringLabel.enabled = showMid && p > 0.12 && p < 0.82;

    const showM2 = stIdx === 8 && p < 0.88;
    const pinch2 = Math.max(0.14, 1 - sp * 0.86);
    setRingState(cleaveL, showM2, pinch2, (1 - sp * 0.74) * 0.92);
    setRingState(cleaveR, showM2, pinch2, (1 - sp * 0.74) * 0.92);

    if (stIdx <= 3) {
      cells[0].root.visible = true;
      cells[1].root.visible = cells[2].root.visible = cells[3].root.visible = false;
      const sx = stIdx === 3 ? 1 + sp * 0.32 : 1;
      cells[0].root.position.set(0, 0, 0);
      cells[0].root.scale.set(sx, 1 - (sx - 1) * 0.2, 1);
      setNuclearOpacity(cells[0], stIdx <= 1, stIdx === 0 ? 0.36 : (1 - sp) * 0.32);
      cellLabels[0].enabled = !(stIdx === 1 && alleleGroup.visible);
      cellLabels[0].item.textContent = stIdx === 1 ? 'Prófase I (Tétrades 2n)' : 'Célula germinativa (2n)';
      cellLabels[1].enabled = cellLabels[2].enabled = cellLabels[3].enabled = false;
    } else if (stIdx <= 7) {
      const xOff = stIdx === 4 ? sp * 3.1 : 3.1;
      const stretchY = stIdx === 7 ? 1 + sp * 0.28 : 1;
      cells[0].root.visible = cells[1].root.visible = true;
      cells[2].root.visible = cells[3].root.visible = false;
      cells[0].root.position.set(-xOff, 0, 0);
      cells[1].root.position.set(xOff, 0, 0);
      cells[0].root.scale.set(0.84, 0.84 * stretchY, 0.84);
      cells[1].root.scale.set(0.84, 0.84 * stretchY, 0.84);
      const nOp = stIdx === 4 ? sp * 0.3 : stIdx === 5 ? (1 - sp) * 0.3 : 0;
      setNuclearOpacity(cells[0], stIdx === 4 || stIdx === 5, nOp);
      setNuclearOpacity(cells[1], stIdx === 4 || stIdx === 5, nOp);
      cellLabels[0].enabled = cellLabels[1].enabled = true;
      cellLabels[0].item.textContent = 'Célula Meiose II · A (n)';
      cellLabels[1].item.textContent = 'Célula Meiose II · B (n)';
      cellLabels[2].enabled = cellLabels[3].enabled = false;
    } else {
      const yOff = 0.4 + sp * 1.75;
      const coords = [[-3.25, yOff], [-3.25, -yOff], [3.25, yOff], [3.25, -yOff]];
      const names = ['Gameta 1 (n · ABC)', 'Gameta 2 (n · ABc)', 'Gameta 3 (n · abC)', 'Gameta 4 (n · abc)'];
      for (let i = 0; i < 4; i++) {
        cells[i].root.visible = true;
        cells[i].root.position.set(coords[i][0], coords[i][1], 0);
        cells[i].root.scale.setScalar(0.62);
        setNuclearOpacity(cells[i], true, sp * 0.34);
        cellLabels[i].enabled = true;
        cellLabels[i].item.textContent = names[i];
      }
    }

    if (stIdx <= 4) {
      centrosomes[0].visible = centrosomes[1].visible = true;
      centrosomes[2].visible = centrosomes[3].visible = false;
      const px = stIdx === 0 ? 0.5 : stIdx === 1 ? 0.5 + sp * 1.7 : stIdx === 4 ? 2.2 + sp * 1.9 : 2.25;
      centrosomes[0].position.set(-px, 0, 0);
      centrosomes[1].position.set(px, 0, 0);
      fusoLabel.enabled = stIdx >= 2 && stIdx <= 3;
    } else {
      for (let i = 0; i < 4; i++) centrosomes[i].visible = true;
      const py = stIdx === 5 ? 0.6 + sp * 1.25 : 1.85;
      centrosomes[0].position.set(-3.1, py, 0);
      centrosomes[1].position.set(-3.1, -py, 0);
      centrosomes[2].position.set(3.1, py, 0);
      centrosomes[3].position.set(3.1, -py, 0);
      fusoLabel.enabled = stIdx === 6 || stIdx === 7;
    }

    // Cohesin persists through Meiosis I (protecting sister chromatids!) and cleaves ONLY in Anaphase II!
    const cohesinOp = stIdx <= 6 ? 0.90 : stIdx === 7 ? Math.max(0, 1 - sp * 3.8) : 0;

    for (let i = 0; i < 4; i++) {
      const ch = chromatids[i];
      const isMat = i % 2 === 0;
      const pIdx = i < 2 ? 0 : 1;
      const py = pairY[pIdx];
      const side = isMat ? -1 : 1;

      if (stIdx === 0) {
        const dup = smooth((p - 0.2) / 0.55);
        const cx = side * 0.7;
        setChromatid(ch.a, cx - dup * 0.045, py * 0.72, 0.06, 0, 0.68 + dup * 0.14, true, -0.14 * dup, 0, dup * 0.88);
        setChromatid(ch.b, cx + dup * 0.045, py * 0.72, 0.07, 0, 0.68 + dup * 0.14, dup > 0.05, 0.14 * dup, 0, dup * 0.88);
      } else if (stIdx === 1) {
        const approach = smooth((p - 0.12) / 0.26);
        const repel = smooth((p - 0.68) / 0.32);
        const dist = T.MathUtils.lerp(0.76, 0.37, approach) + repel * 0.16;
        const cx = side * dist;
        const crossAmt = approach * (1 - repel * 0.55);
        const innerBend = crossAmt * (pIdx === 0 ? 0.44 : 0.48);
        if (isMat) {
          setChromatid(ch.a, cx - 0.058, py, 0.05, 0, 0.94, true, -0.18, 0, cohesinOp);
          setChromatid(ch.b, cx + 0.058, py, 0.08, 0, 0.94, true, 0.16, innerBend, cohesinOp);
        } else {
          setChromatid(ch.a, cx - 0.058, py, 0.02, 0, 0.94, true, -0.16, -innerBend, cohesinOp);
          setChromatid(ch.b, cx + 0.058, py, 0.05, 0, 0.94, true, 0.18, 0, cohesinOp);
        }
        if (pIdx === 0 && alleleGroup.visible) {
          const topY = py + 0.78;
          const swapped = swapFrac > 0.52;
          if (isMat) {
            tagMatA.position.set(cx - 0.36, topY - 0.06, 0.14);
            tagMatBPre.position.set(cx + 0.14, topY + 0.14, 0.14);
            tagMatBPost.position.set(cx + 0.14, topY + 0.14, 0.14);
            tagMatBPre.visible = !swapped;
            tagMatBPost.visible = swapped;
          } else {
            tagPatAPre.position.set(cx - 0.14, topY + 0.14, 0.14);
            tagPatAPost.position.set(cx - 0.14, topY + 0.14, 0.14);
            tagPatAPre.visible = !swapped;
            tagPatAPost.visible = swapped;
            tagPatB.position.set(cx + 0.36, topY - 0.06, 0.14);
          }
        }
      } else if (stIdx === 2) {
        const cx = side * 0.46;
        setChromatid(ch.a, cx - 0.058, py, 0.05, 0, 0.94, true, -0.2, 0, cohesinOp);
        setChromatid(ch.b, cx + 0.058, py, 0.05, 0, 0.94, true, 0.2, 0, cohesinOp);
        spindles.add(side * 2.25, 0, 0, cx + side * 0.08, py, 0.05, clock, true);
      } else if (stIdx === 3) {
        const cx = side * (0.46 + sp * 1.44);
        const drag = -side * Math.sin(sp * Math.PI * 0.85) * 0.24;
        const curY = py * (1 - sp * 0.16);
        setChromatid(ch.a, cx - 0.055, curY, 0.05, 0, 0.92, true, -0.18 + drag, 0, cohesinOp);
        setChromatid(ch.b, cx + 0.055, curY, 0.05, 0, 0.92, true, 0.18 + drag, 0, cohesinOp);
        spindles.add(side * 2.25, 0, 0, cx + side * 0.08, curY, 0.05, clock, true);
      } else if (stIdx === 4 || stIdx === 5) {
        const baseCellX = side * (stIdx === 4 ? T.MathUtils.lerp(1.9, 3.1, sp) : 3.1);
        const cx = baseCellX + (pIdx === 0 ? -0.48 : 0.48);
        setChromatid(ch.a, cx - 0.052, 0, 0.05, 0, 0.82, true, -0.18, 0, cohesinOp);
        setChromatid(ch.b, cx + 0.052, 0, 0.05, 0, 0.82, true, 0.18, 0, cohesinOp);
      } else if (stIdx === 6) {
        const cx = side * 3.1 + (pIdx === 0 ? -0.52 : 0.52);
        setChromatid(ch.a, cx, 0.055, 0.05, Math.PI / 2, 0.84, true, 0.2, 0, cohesinOp);
        setChromatid(ch.b, cx, -0.055, 0.05, Math.PI / 2, 0.84, true, -0.2, 0, cohesinOp);
        const topPole = isMat ? centrosomes[0].position : centrosomes[2].position;
        const botPole = isMat ? centrosomes[1].position : centrosomes[3].position;
        spindles.add(topPole.x, topPole.y, 0, cx, 0.09, 0.05, clock, true);
        spindles.add(botPole.x, botPole.y, 0, cx, -0.09, 0.05, clock, true);
      } else if (stIdx === 7) {
        const cx = side * 3.1 + (pIdx === 0 ? -0.45 : 0.45);
        const dy = 0.06 + sp * 1.34;
        const vPull = 0.14 + Math.sin(sp * Math.PI * 0.85) * 0.42;
        setChromatid(ch.a, cx, dy, 0.05, Math.PI / 2, 0.8, true, -vPull, 0, cohesinOp);
        setChromatid(ch.b, cx, -dy, 0.05, Math.PI / 2, 0.8, true, vPull, 0, cohesinOp);
        const topPole = isMat ? centrosomes[0].position : centrosomes[2].position;
        const botPole = isMat ? centrosomes[1].position : centrosomes[3].position;
        spindles.add(topPole.x, topPole.y, 0, cx, dy + 0.06, 0.05, clock, true);
        spindles.add(botPole.x, botPole.y, 0, cx, -dy - 0.06, 0.05, clock, true);
      } else {
        const yOff = 0.4 + sp * 1.75;
        const cx = side * 3.25 + (pIdx === 0 ? -0.32 : 0.32);
        const relax = (1 - sp) * 0.25;
        setChromatid(ch.a, cx, yOff, 0.05, 0.12, 0.68, true, -relax, 0, 0);
        setChromatid(ch.b, cx, -yOff, 0.05, -0.12, 0.68, true, relax, 0, 0);
      }
    }

    centLabel.enabled = stIdx === 1 || stIdx === 2;
    teloLabel.enabled = stIdx === 1;
  }

  return {
    update(dt) {
      clock += dt;
      if (playing) {
        const tot = totalTime();
        seek(time + dt * speed);
        if (time >= tot) {
          playing = false;
          playBtn.textContent = 'Reproduzir';
        }
      }

      // Gentle living biological sway on translucent vesicles & centrosomes
      for (let i = 0; i < cells.length; i++) {
        if (cells[i].root.visible) cells[i].vesGroup.rotation.y = clock * 0.14 * (i % 2 ? -1 : 1);
      }
      for (let i = 0; i < centrosomes.length; i++) {
        if (centrosomes[i].visible) centrosomes[i].rotation.z = Math.sin(clock * 1.2 + i) * 0.12;
      }

      const starts = stageStarts();
      const list = currentStages();
      const progress = Math.max(0, Math.min(1, (time - starts[stage]) / list[stage].duration));

      spindles.reset();
      if (mode === 'mitosis') updateMitosis(stage, progress);
      else updateMeiosis(stage, progress);
      spindles.commit();
    }
  };
}
