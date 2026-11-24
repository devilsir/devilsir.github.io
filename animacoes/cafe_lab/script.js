(() => {
  const W = 1280, H = 760;
  const canvas = document.getElementById('c');
  const escalaCanvas = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * escalaCanvas);
  canvas.height = Math.round(H * escalaCanvas);
  const ctx = canvas.getContext('2d');
  ctx.scale(canvas.width / W, canvas.height / H);
  const reduzirMovimento = matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- Utils
  const TAU = Math.PI*2;
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
  const lerp = (a,b,t)=>a+(b-a)*t;
  const rnd = (a,b)=> a + Math.random()*(b-a);
  function roundSmart(x, p=3){ const pow = Math.pow(10,p); return Math.round(x*pow)/pow; }

  function drawRoundedRect(x,y,w,h,r){
    r = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    ctx.closePath();
  }
  function shadow(fn, {blur=20, color='rgba(0,0,0,.4)', x=0, y=6}={}){ ctx.save(); ctx.shadowBlur=blur; ctx.shadowColor=color; ctx.shadowOffsetX=x; ctx.shadowOffsetY=y; fn(); ctx.restore(); }
  function pill(x,y,w,h,fill,stroke){ ctx.save(); drawRoundedRect(x,y,w,h,h/2); ctx.fillStyle=fill; ctx.fill(); if(stroke){ ctx.lineWidth=2; ctx.strokeStyle=stroke; ctx.stroke(); } ctx.restore(); }
  function text(t, x, y, size=18, color='#f6e7da', align='left', baseline='alphabetic', fontW='600'){ ctx.save(); ctx.fillStyle=color; ctx.font=`${fontW} ${size}px ui-rounded, system-ui, Segoe UI, Roboto, Arial`; ctx.textAlign=align; ctx.textBaseline=baseline; ctx.fillText(t, x, y); ctx.restore(); }

  // text wrap
  function wrapText(str, x, y, maxW, lineH, size=15, color='#f3e8df'){
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `600 ${size}px ui-rounded, system-ui, Segoe UI, Roboto, Arial`;
    let words = String(str).split(/\s+/);
    let line = '', yy=y;
    for(let i=0;i<words.length;i++){
      const test = line ? line + ' ' + words[i] : words[i];
      if(ctx.measureText(test).width > maxW && line){
        ctx.fillText(line, x, yy);
        line = words[i];
        yy += lineH;
      } else {
        line = test;
      }
    }
    if(line) ctx.fillText(line, x, yy);
    ctx.restore();
    return yy + lineH - y;
  }

  const COLORS = { accent:'#c08a64', accent2:'#f1b77d', cream:'#f6e7da' };

  // ---------- Input
  const mouse = {x:0, y:0, pressX:0, pressY:0, down:false, justUp:false, justDown:false, pointerId:null};
  let dragOwner = null;

  function updateXY(e) {
    const bounds = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - bounds.left) * W / bounds.width;
    mouse.y = (e.clientY - bounds.top) * H / bounds.height;
  }
  function inBounds(px,py,x,y,w,h) {
    return px>=x && px<=x+w && py>=y && py<=y+h;
  }
  function hit(x,y,w,h) {
    return inBounds(mouse.x,mouse.y,x,y,w,h);
  }
  function pressedWithin(x,y,w,h) {
    return inBounds(mouse.pressX,mouse.pressY,x,y,w,h);
  }
  canvas.addEventListener('pointerdown', e => {
    if (mouse.pointerId !== null || e.button !== 0) return;
    updateXY(e);
    Object.assign(mouse, {pressX:mouse.x, pressY:mouse.y, down:true, justDown:true, pointerId:e.pointerId});
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (mouse.pointerId === e.pointerId || (mouse.pointerId === null && e.pointerType === 'mouse')) updateXY(e);
  });
  canvas.addEventListener('pointerup', e => {
    if (mouse.pointerId !== e.pointerId) return;
    updateXY(e);
    Object.assign(mouse, {down:false, justUp:true, pointerId:null});
  });
  canvas.addEventListener('pointerleave', () => {
    if (mouse.pointerId === null && !mouse.justUp) mouse.x = mouse.y = -1;
  });
  function cancelPointer() {
    Object.assign(mouse, {down:false, justDown:false, justUp:false, pointerId:null});
    dragOwner = null;
  }
  canvas.addEventListener('pointercancel', cancelPointer);
  canvas.addEventListener('lostpointercapture', () => {
    if (mouse.pointerId !== null) cancelPointer();
  });
  window.addEventListener('blur', cancelPointer);

  // ---------- UI components
  class Button{
    constructor(x,y,w,h,label,onClick, opts={}){ Object.assign(this,{x,y,w,h,label,onClick}); this.opts = Object.assign({ fill: '#3d2b27', fillHover:'#49332e', stroke:'#00000033', text: COLORS.cream }, opts); }
    draw(){
      const hover = hit(this.x,this.y,this.w,this.h);
      const fill = hover?this.opts.fillHover:this.opts.fill;
      shadow(()=>{ pill(this.x, this.y, this.w, this.h, fill, this.opts.stroke); },{blur:18, y:8, color:'rgba(0,0,0,.35)'});
      text(this.label, this.x+this.w/2, this.y+this.h/2+1, 16, this.opts.text, 'center', 'middle', '700');
      if(hover && mouse.justUp && pressedWithin(this.x,this.y,this.w,this.h)) this.onClick?.();
    }
  }
  class HoldButton{
    constructor(x,y,w,h,label){ Object.assign(this,{x,y,w,h,label}); }
    draw(){
      const hovered = hit(this.x,this.y,this.w,this.h);
      const holding = hovered && mouse.down && pressedWithin(this.x,this.y,this.w,this.h);
      const fill = holding ? '#d7a174' : hovered ? '#49332e' : '#3d2b27';
      shadow(()=>{ pill(this.x, this.y, this.w, this.h, fill, '#00000033'); },{blur:18,y:8,color:'rgba(0,0,0,.35)'});
      text(this.label, this.x+this.w/2, this.y+this.h/2+1, 16, holding ? '#1b1210':'#f6e7da', 'center', 'middle', '700');
      return holding;
    }
  }
  class Slider{
    constructor(x,y,w,min,max,val,label,units,onChange){ Object.assign(this,{x,y,w,min,max,val,label,units,onChange}); this.h=36; this.step=null; this.disabled=false; }
    setStep(s){ this.step=s; return this; }
    valueToX(v){ return this.x + ( (v-this.min)/(this.max-this.min) )*this.w; }
    xToValue(px){ const t = clamp((px-this.x)/this.w,0,1); let v = this.min + t*(this.max-this.min); if(this.step){ v = Math.round(v/this.step)*this.step; } return clamp(v,this.min,this.max); }
    draw(valorExibido = this.val, casas = 3){
      ctx.save();
      drawRoundedRect(this.x, this.y+this.h/2-6, this.w, 12, 6); ctx.fillStyle = '#00000044'; ctx.fill();
      const fx = this.valueToX(this.val); drawRoundedRect(this.x, this.y+this.h/2-6, fx-this.x, 12, 6); ctx.fillStyle = COLORS.accent; ctx.fill();
      const kx = fx, ky = this.y+this.h/2;
      shadow(()=>{ ctx.beginPath(); ctx.arc(kx, ky, 12, 0, TAU); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth=2; ctx.strokeStyle = COLORS.accent; ctx.stroke(); },{blur:10,y:4,color:'rgba(0,0,0,.35)'});
      text(this.label, this.x, this.y-8, 15, COLORS.cream, 'left');
      const vStr = this.units? `${roundSmart(valorExibido, casas)} ${this.units}` : `${roundSmart(valorExibido, casas)}`;
      text(vStr, this.x+this.w, this.y-8, 15, COLORS.accent2, 'right', 'alphabetic', '700');
      if (!this.disabled && mouse.justDown && !dragOwner && pressedWithin(this.x,this.y,this.w,this.h)) dragOwner = this;
      if (dragOwner === this && (mouse.down || mouse.justUp)) {
        const val = this.xToValue(mouse.x);
        if (val !== this.val) {
          this.val = val;
          this.onChange?.(val);
        }
      }
      ctx.restore();
    }
  }
  class Toggle{
    constructor(x,y, labels, index, onChange){ Object.assign(this,{x,y,labels,index,onChange}); this.h=36; this.w = labels.length*170; }
    draw(){ const {x,y,h,w,labels} = this; drawRoundedRect(x,y,w,h,h/2); ctx.fillStyle='#00000033'; ctx.fill(); labels.forEach((lab,i)=>{ const segW = w/labels.length; const sx=x+i*segW; if(i===this.index){ drawRoundedRect(sx+2,y+2,segW-4,h-4,(h-4)/2); ctx.fillStyle = COLORS.accent; ctx.fill(); } text(lab, sx+segW/2, y+h/2+1, 14, i===this.index? '#1b1210':'#f6e7da', 'center', 'middle', '700'); if(hit(sx,y,segW,h) && mouse.justUp && pressedWithin(sx,y,segW,h)){ this.index=i; this.onChange?.(i);} }); }
  }

  // ---------- Estado
  const State = {
    tab: 0,
    dili: { modo:0, C1:80, V1_mL:200, C2:20, V2_mL:800, volumesDesenhados:[], agitacao:0 },
    // Amostra de 5-CQA na ordem de grandeza das bebidas medidas por Moeenfard et al.
    // DOI 10.1155/2014/965353. pKa carboxílico: DOI 10.1039/JR9590002795.
    titu: { Va_mL:25, Mb:0.002, Vb_mL:0, Ca_true:roundSmart(.0004 + Math.random() * .0006, 5), gotaEm:0, drops:[], ripples:[], flowRate_mLps:2.4, ind:0, pKa:3.59 },
  };

  // ---------- Vidraria e soluções
  const volumeFormatado = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
  const volumeTexto = volume => volume >= 1000
    ? volumeFormatado.format(volume / 1000) + ' L' : volumeFormatado.format(volume) + ' mL';

  function gradiente(x1, y1, x2, y2, tons) {
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    tons.forEach((tom, i) => g.addColorStop(i / (tons.length - 1), tom));
    return g;
  }

  function elipse(x, y, rx, ry, cor) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
    ctx.fillStyle = cor;
    ctx.fill();
  }

  function segmento(x0, y0, x1, y1, cor, largura = 1) {
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.strokeStyle = cor;
    ctx.lineWidth = largura;
    ctx.stroke();
  }

  function drawCoffeeBackground() {
    ctx.fillStyle = '#261a15';
    ctx.fillRect(0, 0, W, H);
    const luz = ctx.createRadialGradient(750, 135, 60, 750, 135, 920);
    luz.addColorStop(0, '#5a3a2855');
    luz.addColorStop(1, '#100c0950');
    ctx.fillStyle = luz;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = gradiente(0, 592, 0, H, ['#4c322427', '#1e1410']);
    ctx.fillRect(0, 592, W, H - 592);
    segmento(0, 592, W, 592, '#8f614129');
  }

  function fundoVidraria(x, y, w, h) {
    ctx.save();
    drawRoundedRect(x, y, w, h, 22);
    ctx.fillStyle = gradiente(x, y, x + w, y + h, ['#492e23', '#31211b', '#261b18']);
    ctx.fill();
    ctx.strokeStyle = '#74513d';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.clip();
    // A grade suave atrás do vidro ajuda a enxergar a transparência.
    for (let xx = x + 16; xx < x + w; xx += 26) {
      segmento(xx, y, xx, y + h, '#e9bc8d08');
    }
    for (let yy = y + 21; yy < y + h; yy += 26) {
      segmento(x, yy, x + w, yy, '#e9bc8d0a');
    }
    ctx.restore();
  }

  const rgba = (rgb, alfa) => 'rgba(' + rgb.join(',') + ',' + alfa + ')';
  const corMisturada = (a, b, t) => a.map((canal, i) => Math.round(lerp(canal, b[i], t)));

  function liquidoDiluicao(concentracao) {
    const intensidade = clamp(1 - Math.exp(-concentracao / 68), 0, 1);
    const pigmento = concentracao > 0
      ? corMisturada([223, 147, 80], [83, 37, 21], intensidade) : [177, 219, 227];
    return { pigmento, opacidade: .19 + intensidade * .76 };
  }

  function alturaDoMenisco(y, h, volume, capacidade) {
    return y + h - 14 - (h - 48) * clamp(volume / capacidade, 0, 1);
  }

  function drawBeaker({ x, y, w, h }, { volume, capacidade, tinta, fase = 0, agitacao = 0 }) {
    const meio = x + w / 2;
    const base = y + h;
    const esquerda = x + 9;
    const direita = x + w - 9;
    const raioElipse = (direita - esquerda) / 2;
    const superficie = alturaDoMenisco(y, h, volume, capacidade);
    const onda = agitacao * 3.2;
    const corpo = new Path2D();
    corpo.moveTo(x - 12, y - 9);
    corpo.quadraticCurveTo(x + 8, y - 12, x + 10, y - 3);
    corpo.lineTo(x + w - 9, y);
    corpo.lineTo(x + w - 19, base - 13);
    corpo.quadraticCurveTo(x + w - 22, base, x + w - 41, base + 1);
    corpo.lineTo(x + 39, base + 1);
    corpo.quadraticCurveTo(x + 21, base, x + 19, base - 13);
    corpo.lineTo(x + 9, y + 10);
    corpo.quadraticCurveTo(x + 6, y - 2, x - 12, y - 9);
    corpo.closePath();

    ctx.save();
    shadow(() => elipse(meio + 11, base + 5, w * .48, 10, '#0d090787'), {blur:18, y:5});
    elipse(meio, y - 1, raioElipse, 15, '#d5e6e216');
    ctx.fillStyle = gradiente(x, y, x + w, y, ['#e7ebde35', '#afc9c51b', '#a4adbe0d', '#f2dfc63a']);
    ctx.fill(corpo);
    ctx.save();
    ctx.clip(corpo);

    segmento(x + 29, y + 11, x + 39, base - 17, '#e7fbf043', 2);
    segmento(x + w - 36, y + 13, x + w - 45, base - 18, '#0c141e6b', 3);
    if (volume > 0) {
      const { pigmento, opacidade } = tinta;
      const claro = corMisturada(pigmento, [255, 242, 212], .37);
      const fundo = corMisturada(pigmento, [30, 16, 18], .43);
      const larguraSuperficie = raioElipse - 3;
      const profundidade = 8 + onda * .38;
      ctx.beginPath();
      ctx.moveTo(x, superficie);
      for (let px = x; px <= x + w; px += 3) {
        const u = clamp((px - meio) / larguraSuperficie, -1, 1);
        const arco = Math.sqrt(Math.max(0, 1 - u * u)) * profundidade;
        ctx.lineTo(px, superficie + arco + Math.sin(px * .067 + fase) * onda);
      }
      ctx.lineTo(x + w, base + 3);
      ctx.lineTo(x, base + 3);
      ctx.closePath();
      ctx.fillStyle = gradiente(meio - w * .18, superficie - 2, meio + w * .28, base, [
        rgba(claro, opacidade * .78), rgba(pigmento, opacidade), rgba(fundo, Math.min(.98, opacidade + .08))
      ]);
      ctx.fill();
      elipse(meio, superficie, larguraSuperficie, profundidade, rgba(pigmento, opacidade * .77));
      ctx.beginPath();
      ctx.ellipse(meio, superficie, larguraSuperficie, profundidade, 0, .25, Math.PI - .18);
      ctx.strokeStyle = rgba(claro, .58);
      ctx.lineWidth = 1.55;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(meio, superficie - 1, larguraSuperficie - 4, profundidade - 1.5, 0, Math.PI * 1.21, Math.PI * 1.8);
      ctx.strokeStyle = '#fff5df56';
      ctx.lineWidth = 1.15;
      ctx.stroke();
      ctx.fillStyle = gradiente(x, superficie, x + w, superficie, ['#f6e5c92b', '#f6e5c900', '#f6e5c900', '#130e0f50']);
      ctx.fillRect(x, superficie + profundidade, w, Math.max(0, base - superficie - profundidade));
    }

    ctx.beginPath();
    ctx.moveTo(x + 18, y + 16);
    ctx.bezierCurveTo(x + 21, y + 92, x + 27, base - 33, x + 34, base - 24);
    ctx.strokeStyle = gradiente(x + 20, y + 15, x + 34, base - 17, ['#fff4dc73', '#fff4dc24', '#fff4dc62']);
    ctx.lineWidth = 3;
    ctx.stroke();
    segmento(x + w - 21, y + 38, x + w - 30, base - 26, '#edf6e534', 1.4);
    ctx.restore();

    ctx.lineWidth = 2;
    ctx.strokeStyle = gradiente(x, y, x + w, base, ['#fae8d2be', '#97a4a187', '#e7d9c2ab']);
    ctx.stroke(corpo);
    ctx.beginPath();
    ctx.ellipse(meio, y - 1, raioElipse, 15, 0, 0, TAU);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#dce2d681';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(meio, y - 1, raioElipse, 15, 0, .13, Math.PI * .77);
    ctx.lineWidth = 2.3;
    ctx.strokeStyle = '#fff1d7b5';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(meio, base - 8, w * .4, 8, 0, .17, Math.PI - .14);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = '#e9ddd17d';
    ctx.stroke();

    const emLitros = capacidade >= 5000;
    const inicioDaEscala = x + w - 69;
    text(emLitros ? 'L' : 'mL', inicioDaEscala + 19, y + 23, 11, '#f5e4ce', 'right');
    for (let i = 1; i <= 10; i++) {
      const valor = i * capacidade / 10;
      const linhaY = alturaDoMenisco(y, h, valor, capacidade);
      const maior = i % 2 === 0;
      segmento(inicioDaEscala, linhaY, inicioDaEscala + (maior ? 20 : 9), linhaY, maior ? '#f2e4d1bf' : '#e6e2d272');
      if (maior) text(volumeFormatado.format(emLitros ? valor / 1000 : valor), inicioDaEscala - 6, linhaY + 4, 11, '#f4e6d3', 'right');
    }
    ctx.restore();
    return superficie;
  }

  function hexRgb(hex) {
    const valor = Number.parseInt(hex.slice(1), 16);
    return [valor >> 16, (valor >> 8) & 255, valor & 255];
  }

  // Equilíbrio de um ácido monoprótico com balanço de cargas no volume misturado.
  function calcPH_Titration(totalAcido, sodio, Ka) {
    let menor = 0;
    let maior = 14;
    for (let i = 0; i < 32; i++) {
      const pH = (menor + maior) / 2;
      const H = 10 ** -pH;
      const carga = H + sodio - 1e-14 / H - totalAcido * Ka / (Ka + H);
      if (carga > 0) menor = pH;
      else maior = pH;
    }
    return (menor + maior) / 2;
  }

  // Cor do indicador ao longo da sua faixa de viragem no modelo.
  const incolor = hexRgb('#d8eef4');
  const rosa = hexRgb('#f86eac');
  const amarelo = hexRgb('#ffda5d');
  const verde = hexRgb('#52ca7c');
  const azul = hexRgb('#4686ff');
  const vermelho = hexRgb('#ed6155');
  const amareloMetila = hexRgb('#f6cc48');
  function tintaIndicador(pH, indice) {
    if (indice === 0) {
      const t = clamp((pH - 8.2) / 1.8, 0, 1);
      return { pigmento: corMisturada(incolor, rosa, t), opacidade: lerp(.27, .78, t) };
    }
    if (indice === 1) {
      const pigmento = pH < 7
        ? corMisturada(amarelo, verde, clamp(pH - 6, 0, 1))
        : corMisturada(verde, azul, clamp((pH - 7) / .6, 0, 1));
      return { pigmento, opacidade: .68 };
    }
    return { pigmento: corMisturada(vermelho, amareloMetila, clamp((pH - 3.1) / 1.3, 0, 1)), opacidade: .72 };
  }

  const capacidadeBureta = 100;

  function drawBurette(x, y, h, dispensado, aberta) {
    const fundo = y + h;
    const alturaLiquido = fundo - y - 8;
    const nivel = y + 4 + alturaLiquido * clamp(dispensado / capacidadeBureta, 0, 1);
    const tipY = fundo + 29;
    const poste = x - 76;
    ctx.save();
    sombraBureta(poste, x, fundo);
    segmento(poste, y - 10, poste, 612, '#74564b', 6);
    segmento(poste - 1, y - 10, poste - 1, 609, '#ad8973', 2);
    segmento(poste, y + 34, x - 13, y + 34, '#b19787', 5);
    segmento(poste, y + 34, x - 15, y + 34, '#f3d9ba82', 1);
    drawRoundedRect(x - 10, y, 20, h, 8);
    ctx.fillStyle = gradiente(x - 10, y, x + 10, y, ['#e9fff24e', '#e7fff823', '#8fa3a22d', '#d6e3d545']);
    ctx.fill();
    ctx.strokeStyle = '#cce4e08e';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    if (dispensado < capacidadeBureta) {
      ctx.save();
      drawRoundedRect(x - 7, y + 3, 14, h - 5, 5);
      ctx.clip();
      ctx.fillStyle = gradiente(x - 7, nivel, x + 7, nivel, ['#c1e7ef8d', '#87c9e4a8', '#5099ba8f']);
      ctx.fillRect(x - 7, nivel, 14, fundo - nivel);
      elipse(x, nivel, 7, 2.4, '#def9f6b8');
      ctx.restore();
    }
    for (let i = 0; i <= 10; i++) {
      const linhaY = y + 4 + alturaLiquido * i / 10;
      const maior = i % 2 === 0;
      segmento(x + 6, linhaY, x + (maior ? 18 : 13), linhaY, '#e8f0df9f');
      if (maior) text(String(i * capacidadeBureta / 10), x + 22, linhaY + 4, 11, '#f8e7d0');
    }
    text('NaOH · mL', x + 18, y - 14, 13, '#dfcfbc');
    segmento(x, fundo - 3, x, tipY, '#b8d4cf', 4);
    segmento(x - .5, fundo - 1, x - .5, tipY, '#f6fff1', 1);
    drawRoundedRect(x - 12, fundo + 5, 24, 11, 4);
    ctx.fillStyle = aberta ? '#d9a575' : '#97725d';
    ctx.fill();
    if (aberta) segmento(x + 8, fundo + 9, x + 24, fundo + 10, '#efb980', 4);
    else segmento(x + 9, fundo + 9, x + 20, fundo - 1, '#cea485', 4);
    ctx.restore();
    return tipY;
  }

  function sombraBureta(poste, x, fundo) {
    elipse(poste + 15, 617, 52, 8, '#140c098c');
    drawRoundedRect(poste - 23, 604, 79, 10, 4);
    ctx.fillStyle = '#715447';
    ctx.fill();
    segmento(poste - 19, 605, poste + 53, 605, '#b18b75', 1);
    segmento(x - 1, fundo - 3, x - 1, fundo + 24, '#402e25', 5);
  }

  // ---------- Navegação
  const navButtons = [...document.querySelectorAll('[data-tab]')];
  const painelTitulacao = document.getElementById('calculos-titulacao');
  const atalhoTitulacao = document.getElementById('atalho-titulacao');
  navButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      cancelPointer();
      State.tab = index;
      navButtons.forEach(item => item.removeAttribute('aria-current'));
      button.setAttribute('aria-current', 'page');
      document.getElementById('concentracao').hidden = index !== 0;
      document.getElementById('outros-experimentos').hidden = index !== 1 && index !== 2;
      painelTitulacao.hidden = atalhoTitulacao.hidden = index !== 2;
      document.getElementById('quiz').hidden = index !== 3;
      if (index === 3 && !perguntaAtual) novoDesafio();
      if (index === 1 || index === 2) iniciarCanvas();
    });
  });

  // ---------- Diluição
  const massaMolarSacarose = 342.2965; // NIST Chemistry WebBook, CAS 57-50-1.
  const togDili = new Toggle(70, 220, ['g/L','mol/L'], 0, i=>State.dili.modo=i);
  const sC1 = new Slider(70, 275, 380, 0, 300, State.dili.C1, 'C1 (concentração inicial)', '', v=>State.dili.C1=v).setStep(1);
  const sV1 = new Slider(70, 325, 380, 0, 2000, State.dili.V1_mL, 'V1 (volume inicial)', 'mL', v=>State.dili.V1_mL=v).setStep(10);
  const sC2 = new Slider(70, 375, 380, 0, 300, State.dili.C2, 'C2 (concentração alvo)', '', v=>State.dili.C2=v).setStep(1);
  const sV2 = new Slider(70, 425, 380, 0, 4000, State.dili.V2_mL, 'V2 (volume final)', 'mL', v=>State.dili.V2_mL=v).setStep(10);

  function computeDilutionFlex() {
    let {C1, V1_mL, C2, V2_mL} = State.dili;
    const V1 = V1_mL / 1000;
    let V2 = V2_mL / 1000;
    if (!V1) return {V1, V2, erro:'Defina um volume inicial maior que zero.'};
    if (!C2 && !V2) return {V1, V2, erro:'Informe C2 ou V2. Use zero somente no campo que deseja calcular.'};

    let calculado = '';
    if (!V2) {
      V2 = C1 * V1 / C2;
      calculado = 'V2';
    } else if (!C2) {
      C2 = C1 * V1 / V2;
      calculado = 'C2';
    }
    if (V2 < V1 - 1e-9) {
      return {V1, V2, erro:'O volume final precisa ser igual ou maior que o inicial para diluir com água.'};
    }
    const concentracaoFinal = C1 * V1 / V2;
    return {C1, V1, C2, V2, calculado, concentracaoFinal};
  }

  function capacidadeComparativa(volume) {
    const maximo = Math.max(500, volume);
    const dezena = 10 ** Math.floor(Math.log10(maximo));
    return dezena * [1, 2, 2.5, 5, 10].find(fator => fator * dezena + 1e-6 >= maximo);
  }

  function drawDilution(dt) {
    const dili = State.dili;
    text('Sacarose · C1·V1 = C2·V2', 32, 112, 18, COLORS.accent2);
    wrapText('Use zero em C2 ou V2 para calcular esse valor.', 70, 183, 380, 20, 15);
    togDili.draw();
    const emMols = dili.modo === 1;
    const unidade = emMols ? 'mol/L' : 'g/L';
    const converter = gramasPorLitro => emMols ? gramasPorLitro / massaMolarSacarose : gramasPorLitro;
    const mostrarConcentracao = gramasPorLitro => roundSmart(converter(gramasPorLitro), emMols ? 5 : 3);
    sC1.units = sC2.units = unidade;
    sC1.draw(converter(dili.C1), 5);
    sV1.draw();
    sC2.draw(converter(dili.C2), 5);
    sV2.draw();

    const { C1, V1, C2, V2, calculado, concentracaoFinal, erro } = computeDilutionFlex();
    const inicial = V1 * 1000;
    const final = erro ? 0 : V2 * 1000;
    const capacidade = capacidadeComparativa(Math.max(inicial, final));
    const mudaramVolumes = dili.volumesDesenhados.some((v, i) => v !== (i === 0 ? inicial : final));
    dili.volumesDesenhados = [inicial, final];
    dili.agitacao = mudaramVolumes ? 1 : dili.agitacao * Math.exp(-3.9 * dt);
    const movimento = reduzirMovimento.matches ? 0 : dili.agitacao;
    const fase = perf * .082;
    const antes = {x:558, y:208, w:209, h:251};
    const depois = {x:968, y:208, w:209, h:251};

    fundoVidraria(520, 145, 700, 379);
    text('Solução inicial', antes.x + antes.w / 2, 178, 16, COLORS.cream, 'center');
    text('Solução final', depois.x + depois.w / 2, 178, 16, COLORS.cream, 'center');
    drawBeaker(antes, { volume: inicial, capacidade, tinta: liquidoDiluicao(dili.C1), fase, agitacao: movimento * .65 });
    drawBeaker(depois, { volume: final, capacidade, tinta: liquidoDiluicao(concentracaoFinal ?? 0), fase: fase + 1, agitacao: movimento });
    text(volumeTexto(inicial) + ' · ' + mostrarConcentracao(dili.C1) + ' ' + unidade,
      antes.x + antes.w / 2, 493, 15, COLORS.accent2, 'center');
    const leituraFinal = erro ? '—' : volumeTexto(final) + ' · ' + mostrarConcentracao(concentracaoFinal) + ' ' + unidade;
    text(leituraFinal, depois.x + depois.w / 2, 493, 15, COLORS.accent2, 'center');
    if (!erro) {
      const meio = (antes.x + antes.w + depois.x) / 2;
      const agua = Math.max(0, final - inicial);
      text('Água a adicionar', meio, 298, 14, COLORS.cream, 'center');
      segmento(meio - 39, 319, meio + 42, 319, '#8dbac9', 1.8);
      segmento(meio + 35, 314, meio + 42, 319, '#8dbac9', 1.8);
      segmento(meio + 35, 324, meio + 42, 319, '#8dbac9', 1.8);
      text(volumeTexto(agua), meio, 344, 16, '#b6dce4', 'center');
    }

    const px=520, py=545, pw=700, ph=173;
    shadow(()=>{ drawRoundedRect(px,py,pw,ph,18); ctx.fillStyle='#281d1a'; ctx.fill(); },{blur:22,y:10,color:'rgba(0,0,0,.45)'});
    text('Resultados de diluição', px+20, py+28, 18, COLORS.accent2);
    if (erro) {
      wrapText(erro, px+20, py+58, pw-40, 22);
      return;
    }
    let yy = py+58;
    yy += wrapText(`C1 = ${mostrarConcentracao(C1)} ${unidade} · V1 = ${roundSmart(V1)} L · V2 = ${roundSmart(V2)} L`, px+20, yy, pw-40, 22);
    if (calculado === 'V2') {
      yy += wrapText(`V2 = (C1·V1)/C2 = ${roundSmart(V2)} L`, px+20, yy, pw-40, 22);
    }
    yy += wrapText(`Concentração final = (C1·V1)/V2 = ${mostrarConcentracao(concentracaoFinal)} ${unidade}`, px+20, yy, pw-40, 22);
    if (Math.abs(C2 - concentracaoFinal) > 0.001) {
      yy += wrapText(`Com esse volume, o alvo de ${mostrarConcentracao(C2)} ${unidade} não é atingido.`, px+20, yy, pw-40, 22);
    }
    wrapText(`Água a adicionar = ${Math.round(Math.max(0,V2-V1)*1000)} mL`, px+20, yy, pw-40, 22);
  }

  // ---------- Titulação
  const togInd = new Toggle(70, 452, ['Fenolftaleína','Azul de bromotimol','Alaranjado de metila'], 0, i=>{ State.titu.ind = i; });
  const sVa = new Slider(70, 200, 380, 10, 200, State.titu.Va_mL, 'Volume da amostra Va', 'mL', v=>State.titu.Va_mL=v).setStep(1);
  const sMb = new Slider(70, 260, 380, 0.001, 0.010, State.titu.Mb, 'Concentração de NaOH Mb', 'mol/L', v=>State.titu.Mb=roundSmart(v,4)).setStep(0.0005);
  const sVb = new Slider(70, 320, 380, 0, capacidadeBureta, State.titu.Vb_mL, 'Volume de base adicionado Vb', 'mL', v=>State.titu.Vb_mL=v).setStep(0.05); sVb.disabled = true;
  const btnZerar = new Button(70, 380, 140, 40, 'Zerar', () => {
    Object.assign(State.titu, { Vb_mL: 0, gotaEm: 0, drops: [], ripples: [] });
  });
  const btnSegurar = new HoldButton(390, 380, 240, 40, 'Abrir torneira (segurar)');
  const leiturasTitulacao = Object.fromEntries([...painelTitulacao.querySelectorAll('[data-titration]')]
    .map(elemento => [elemento.dataset.titration, elemento]));
  const mililitrosTitu = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 });
  const litrosTitu = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 6 });
  const molaridadeTitu = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 7 });
  let contaTitulacao;

  function calcularTitulacao({ Va_mL, Vb_mL, Mb, Ca_true, pKa }) {
    const Va = Va_mL / 1000;
    const Vb = Vb_mL / 1000;
    const volume = Va_mL + Vb_mL;
    const volumeLitros = volume / 1000;
    const nAcido = Ca_true * Va;
    const nBase = Mb * Vb;
    const Veq = nAcido / Mb;
    const nBaseEquivalencia = Mb * Veq;
    const Ca_calc = nBaseEquivalencia / Va;
    const totalAcido = nAcido / volumeLitros;
    const sodio = nBase / volumeLitros;
    const Ka = 10 ** -pKa;
    const pHmix = calcPH_Titration(totalAcido, sodio, Ka);
    return {
      Va_mL, Vb_mL, Mb, Va, Vb, volume, volumeLitros, Veq, nAcido, nBase, nBaseEquivalencia,
      Ca_calc, totalAcido, sodio, Ka, pHmix
    };
  }

  function mostrarPassosTitulacao(conta) {
    const litros = numero => litrosTitu.format(numero) + ' L';
    const converterVolume = numero => mililitrosTitu.format(numero * 1000) + ' mL = ' + litros(numero);
    const base = molaridadeTitu.format(conta.Mb) + ' mol/L';
    const molsAcido = formatarMols(conta.nAcido);
    const leituras = {
      'volume-amostra': converterVolume(conta.Va),
      'volume-equivalencia': converterVolume(conta.Veq),
      'mols-base-equivalencia': '(' + base + ') × (' + litros(conta.Veq) + ') ≈ ' + formatarMols(conta.nBaseEquivalencia),
      'mols-acido': molsAcido,
      'concentracao-amostra': '(' + molsAcido + ') ÷ (' + litros(conta.Va) + ') ≈ ' + molaridadeTitu.format(conta.Ca_calc) + ' mol/L',
      'volume-adicionado': converterVolume(conta.Vb),
      'mols-base-atual': '(' + base + ') × (' + litros(conta.Vb) + ') ≈ ' + formatarMols(conta.nBase),
      'volume-total': converterVolume(conta.volumeLitros),
      'acido-total': molsAcido + ' ÷ ' + litros(conta.volumeLitros) + ' ≈ ' + formatarCientifico(conta.totalAcido) + ' mol/L',
      sodio: formatarMols(conta.nBase) + ' ÷ ' + litros(conta.volumeLitros) + ' ≈ ' + formatarCientifico(conta.sodio) + ' mol/L',
      ka: formatarCientifico(conta.Ka),
      hidronio: formatarCientifico(10 ** -conta.pHmix) + ' mol/L',
      ph: volumeFormatado.format(conta.pHmix)
    };
    for (const [nome, valor] of Object.entries(leituras)) {
      const campo = leiturasTitulacao[nome];
      if (campo.textContent !== valor) campo.textContent = valor;
    }
    leiturasTitulacao['limite-bureta'].hidden = conta.Veq * 1000 <= capacidadeBureta + 1e-9;
  }

  function drawTitrationFlow(dt, holding, x, tipY, surfaceY) {
    const titu = State.titu;
    if (reduzirMovimento.matches) {
      if (holding) segmento(x, tipY + 2, x, surfaceY, '#b2dbea75', 1.6);
      return;
    }
    if (holding) {
      titu.gotaEm -= dt;
      if (titu.gotaEm <= 0) {
        titu.drops.push({ x: x + rnd(-1.4, 1.4), y: tipY, velocidade: rnd(130, 185) });
        titu.gotaEm = 0.108;
      }
    }
    for (let i = titu.drops.length - 1; i >= 0; i--) {
      const gota = titu.drops[i];
      gota.velocidade += 590 * dt;
      gota.y += gota.velocidade * dt;
      if (gota.y >= surfaceY) {
        titu.ripples.push({ x: gota.x, t: 0 });
        titu.drops.splice(i, 1);
      } else {
        const aspecto = Math.min(5.2, 2.45 + gota.velocidade / 205);
        const luz = gradiente(gota.x - 2, gota.y - aspecto, gota.x + 2, gota.y + aspecto, [
          '#b9e4f05b', '#d3f7ffee', '#70adceae'
        ]);
        elipse(gota.x, gota.y, 2.35, aspecto, luz);
        elipse(gota.x - .63, gota.y - .74, .48, 1.12, '#fffbefb5');
      }
    }
    for (let i = titu.ripples.length - 1; i >= 0; i--) {
      const onda = titu.ripples[i];
      onda.t += dt * 2.6;
      if (onda.t >= 1) {
        titu.ripples.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.ellipse(onda.x, surfaceY + 1, lerp(2, 31, onda.t), lerp(1, 6.1, onda.t), 0, 0, TAU);
      ctx.strokeStyle = 'rgba(237,248,243,' + .69 * (1 - onda.t) + ')';
      ctx.lineWidth = 1.3;
      ctx.stroke();
    }
  }

  function drawTitulacao(dt) {
    const titu = State.titu;
    text('Ácido clorogênico (5-CQA) com NaOH · modelo 1:1', 32, 112, 18, COLORS.accent2);
    sVa.draw(); sMb.draw(titu.Mb, 4); btnZerar.draw();
    const torneira = btnSegurar.draw();
    text('Indicador', 70, 440, 14, COLORS.cream, 'left');
    togInd.draw();

    const b = {x:693, y:381, w:200, h:229};
    const buretteX = b.x + b.w / 2;
    const buretteY = 86;
    const buretteH = 244;
    const areaBureta = [buretteX - 20, buretteY, 49, buretteH + 29];
    const segurandoBureta = mouse.down && hit(...areaBureta) && pressedWithin(...areaBureta);
    const holding = (torneira || segurandoBureta) && titu.Vb_mL < capacidadeBureta;
    if (holding) titu.Vb_mL = Math.min(titu.Vb_mL + titu.flowRate_mLps * dt, capacidadeBureta);
    sVb.val = titu.Vb_mL;
    sVb.draw();

    if (!contaTitulacao || contaTitulacao.Va_mL !== titu.Va_mL || contaTitulacao.Mb !== titu.Mb || contaTitulacao.Vb_mL !== titu.Vb_mL) {
      contaTitulacao = calcularTitulacao(titu);
      mostrarPassosTitulacao(contaTitulacao);
    }
    const { Vb_mL, Veq, volume, Ca_calc, pHmix } = contaTitulacao;
    const { ind } = titu;
    fundoVidraria(652, 49, 254, 618);
    const tipY = drawBurette(buretteX, buretteY, buretteH, Vb_mL, holding);
    const agitacao = reduzirMovimento.matches ? 0 : Math.min(1, (holding ? .3 : 0) + titu.ripples.length * .15);
    const superficie = drawBeaker(b, { volume, capacidade: 300, tinta: tintaIndicador(pHmix, ind), fase: perf * .11, agitacao });
    drawTitrationFlow(dt, holding, buretteX, tipY, superficie);
    text('Mistura no béquer', buretteX, 636, 13, COLORS.cream, 'center');
    text(volumeTexto(volume), buretteX, 654, 16, COLORS.accent2, 'center');

    const px=920, py=210, pw=340, ph=320;
    shadow(()=>{ drawRoundedRect(px,py,pw,ph,18); ctx.fillStyle='#281d1a'; ctx.fill(); },{blur:22,y:10,color:'rgba(0,0,0,.45)'});
    text('Resultados da titulação', px+14, py+24, 18, COLORS.accent2);
    let yy = py+54;
    yy += wrapText(`Base dispensada · ${volumeFormatado.format(Vb_mL)} mL`, px+14, yy, pw-28, 20);
    yy += wrapText(`Equivalência teórica · ${volumeFormatado.format(Veq * 1000)} mL`, px+14, yy, pw-28, 20);
    if (Veq * 1000 > capacidadeBureta + 1e-9) {
      yy += wrapText('A bureta comporta 100 mL. Reduza a amostra ou aumente a concentração da base.', px+14, yy, pw-28, 20, 15, COLORS.accent2);
    }
    yy += wrapText(`Concentração da amostra · ${molaridadeTitu.format(Ca_calc)} mol/L`, px+14, yy, pw-28, 20);
    yy += wrapText(`pH estimado ≈ ${volumeFormatado.format(pHmix)} · ${togInd.labels[ind]}`, px+14, yy, pw-28, 20);
    wrapText('O pH simula a primeira dissociação do 5-CQA isolado. O café também contém outros ácidos.', px+14, yy+6, pw-28, 18, 13, '#caa38b');
  }

  // ---------- Quiz
  const pergunta = document.getElementById('pergunta-quiz');
  const resposta = document.getElementById('resposta-quiz');
  const respostaNumerica = document.getElementById('resposta-numerica');
  const alternativas = document.getElementById('alternativas-quiz');
  const filtroQuiz = document.getElementById('tipo-quiz');
  const formulario = document.getElementById('form-quiz');
  const conferir = formulario.querySelector('[type=submit]');
  const feedback = document.getElementById('resultado-quiz');
  const pontuacao = document.getElementById('pontuacao-quiz');
  let perguntaAtual;
  let acertos = 0, respondidas = 0;
  const arredondado = (min, max) => Math.round(rnd(min, max));
  const formatarResposta = valor => valor.toLocaleString('pt-BR', { maximumFractionDigits: 4 });

  const perguntasObjetivas = [
    ['Qual teste isola o efeito da temperatura da água sobre a extração?',
      ['Usar a mesma dose, moagem e volume nas duas receitas.', 'Trocar a dose e a temperatura entre as receitas.', 'Usar café em uma receita e açúcar na outra.'],
      'Mude apenas a temperatura e mantenha as demais condições iguais.'],
    ['Qual dos três tipos de café tem as partículas menores no simulador?',
      ['Moído', 'Triturado', 'Em grãos'],
      'O café moído tem partículas mais finas que o triturado e o café em grãos inteiros.'],
    ['O que o filtro de papel retém durante o preparo?',
      ['As partículas sólidas do café.', 'Toda a água quente.', 'Toda a cafeína dissolvida.'],
      'O filtro retém o pó e os pedaços de café. A cafeína dissolvida atravessa com a água.'],
    ['Qual unidade o Café Lab usa para a concentração de cafeína na xícara?',
      ['mg/L', 'mL', '°C'],
      'A leitura divide a massa de cafeína em miligramas pelo volume em litros.'],
    ['Se dobrarmos o volume de uma solução adicionando apenas água, o que acontece com a concentração?',
      ['Cai pela metade.', 'Dobra.', 'Fica igual.'],
      'A quantidade de soluto permanece a mesma. Ela passa a ocupar o dobro do volume.'],
    ['Para que serve o indicador na titulação?',
      ['Para sinalizar uma faixa de pH por mudança de cor.', 'Para medir o volume de café por mudança de cor.', 'Para impedir a reação com a base.'],
      'O indicador muda de cor em uma faixa de pH característica.']
  ];
  const perguntasVF = [
    ['Ao misturar volumes iguais de água a 100 °C e 20 °C, a temperatura da mistura fica entre as duas iniciais.', true,
      'Com perdas de calor desprezíveis durante a mistura, o balanço de entalpia dá cerca de 59,3 °C.'],
    ['Depois de adicionar somente água a uma solução, sua concentração sempre aumenta.', false,
      'Adicionar água aumenta o volume e diminui a concentração de uma solução com soluto.'],
    ['É possível dissolver açúcar na xícara com a dose de café em zero.', true,
      'Nesse preparo, a água cai direto na xícara e pode dissolver o açúcar.'],
    ['Uma parte do açúcar pode ficar no fundo da xícara quando a água atinge o limite de solubilidade.', true,
      'O excesso permanece sólido até haver condições para dissolver mais.'],
    ['A cor da bebida no simulador mede diretamente a concentração de cafeína de um café real.', false,
      'A cor é uma representação visual do modelo. Medir cafeína em uma bebida real exige análise própria.'],
    ['Todo indicador ácido-base muda de cor exatamente no pH 7.', false,
      'Cada indicador tem sua faixa de viragem. A fenolftaleína, por exemplo, muda de cor em meio básico.']
  ];
  const perguntasCalculo = [
    () => {
      const volume = arredondado(150, 600), massa = arredondado(5, 40);
      return { texto: `Dissolveram-se ${massa} g de açúcar em uma solução de ${volume} mL. Qual é a concentração em g/L?`,
        valor: massa * 1000 / volume, unidade: 'g/L', ideia: 'Divida a massa pelo volume convertido em litros.' };
    },
    () => {
      const C1 = arredondado(40, 160), C2 = arredondado(10, C1 - 5), V1 = arredondado(100, 400);
      return { texto: `Uma solução de ${V1} mL vai de ${C1} g/L para ${C2} g/L por diluição. Qual é o volume final em litros?`,
        valor: C1 * (V1 / 1000) / C2, unidade: 'L', ideia: 'Use V₂ = C₁ × V₁ ÷ C₂ e expresse V₁ em litros.' };
    },
    () => {
      const Va = arredondado(20, 50), Mb = arredondado(5, 20) / 100, Vb = arredondado(10, 50);
      return { texto: `Uma amostra de ${Va} mL atingiu a equivalência com ${Vb} mL de base a ${formatarResposta(Mb)} mol/L. Qual é a concentração inicial em mol/L, considerando a reação 1:1?`,
        valor: Mb * Vb / Va, unidade: 'mol/L', ideia: 'Na equivalência, use Cₐ = Cᵦ × Vᵦ ÷ Vₐ.' };
    },
    () => {
      const quente = arredondado(1, 5) * 50, fria = arredondado(1, 5) * 50;
      return { texto: `Ao desprezar perdas de calor e a diferença de densidade, qual é a temperatura final em °C ao misturar ${quente} mL de água a 100 °C com ${fria} mL a 20 °C?`,
        valor: (quente * 100 + fria * 20) / (quente + fria), unidade: '°C',
        ideia: 'Multiplique cada temperatura pelo volume correspondente, some os produtos e divida pelo volume total.' };
    }
  ];
  const bancos = { objetiva: perguntasObjetivas, vf: perguntasVF, calculo: perguntasCalculo };
  const ordemTipos = Object.keys(bancos);
  const filas = {}, ultimaPergunta = {};
  let proximoTipo = 0;

  function embaralhar(itens) {
    const ordem = [...itens];
    for (let i = ordem.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
    }
    return ordem;
  }

  function retirarPergunta(tipo) {
    if (!filas[tipo]?.length) {
      filas[tipo] = embaralhar(bancos[tipo]);
      if (filas[tipo][0] === ultimaPergunta[tipo]) filas[tipo].push(filas[tipo].shift());
    }
    const item = filas[tipo].shift();
    ultimaPergunta[tipo] = item;
    if (tipo === 'calculo') return item();
    const [texto, valores, ideia] = item;
    if (tipo === 'vf') {
      return { texto, opcoes: ['Verdadeiro', 'Falso'], correta: valores ? 'Verdadeiro' : 'Falso', ideia };
    }
    return { texto, opcoes: embaralhar(valores), correta: valores[0], ideia };
  }

  function novoDesafio() {
    const tipo = filtroQuiz.value === 'todos' ? ordemTipos[proximoTipo++ % ordemTipos.length] : filtroQuiz.value;
    perguntaAtual = retirarPergunta(tipo);
    const { texto, opcoes } = perguntaAtual;
    pergunta.textContent = texto;
    feedback.textContent = '';
    resposta.value = '';
    respostaNumerica.hidden = Boolean(opcoes);
    resposta.disabled = Boolean(opcoes);
    conferir.disabled = false;
    alternativas.replaceChildren();
    for (const opcao of opcoes ?? []) {
      const label = document.createElement('label');
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'alternativa';
      radio.value = opcao;
      label.append(radio, opcao);
      alternativas.append(label);
    }
  }

  filtroQuiz.addEventListener('change', novoDesafio);
  document.getElementById('novo-desafio').addEventListener('click', () => {
    novoDesafio();
    (alternativas.querySelector('input') ?? resposta).focus();
  });
  formulario.addEventListener('submit', evento => {
    evento.preventDefault();
    if (perguntaAtual.respondida) return;
    const { valor, unidade, correta, ideia } = perguntaAtual;
    let acertou, referencia;
    if (correta) {
      const escolhida = alternativas.querySelector('input:checked');
      if (!escolhida) {
        feedback.textContent = 'Marque uma alternativa para conferir.';
        return;
      }
      acertou = escolhida.value === correta;
      referencia = correta;
      for (const opcao of alternativas.querySelectorAll('input')) {
        opcao.disabled = true;
        if (opcao.value === correta) opcao.parentElement.setAttribute('data-certa', '');
      }
    } else {
      const entrada = resposta.value.trim().replace(',', '.');
      if (!/^\d*\.?\d+$/.test(entrada)) {
        feedback.textContent = 'Digite um número usando vírgula ou ponto para os decimais.';
        return;
      }
      acertou = Math.abs(Number(entrada) - valor) / valor < 0.03;
      referencia = formatarResposta(valor) + ' ' + unidade;
      resposta.disabled = true;
    }
    perguntaAtual.respondida = true;
    conferir.disabled = true;
    respondidas++;
    if (acertou) acertos++;
    pontuacao.textContent = `${acertos} ${acertos === 1 ? 'acerto' : 'acertos'} de ${respondidas} ${respondidas === 1 ? 'resposta' : 'respostas'}`;
    feedback.textContent = (acertou ? 'Correto! ' : 'Resposta esperada: ' + referencia + '. ') + ideia;
  });

  let perf = 0, last = 0, animation = 0;
  function frame(now) {
    animation = 0;
    if (State.tab !== 1 && State.tab !== 2) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    perf += dt * 60;
    ctx.clearRect(0, 0, W, H);
    drawCoffeeBackground();
    text(State.tab === 1 ? 'Diluição' : 'Titulação', 32, 77, 32, COLORS.accent2, 'left', 'alphabetic', '800');
    if (State.tab === 1) drawDilution(dt);
    else drawTitulacao(dt);
    if (mouse.justUp) dragOwner = null;
    mouse.justUp = false;
    mouse.justDown = false;
    animation = requestAnimationFrame(frame);
  }

  function iniciarCanvas() {
    if (animation) return;
    last = performance.now();
    animation = requestAnimationFrame(frame);
  }
})();
