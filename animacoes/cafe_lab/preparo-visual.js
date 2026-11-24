const criarVisualPreparo = canvas => {
  const ctx = canvas.getContext('2d');
  const largura = 500, altura = 366;
  const TAU = Math.PI * 2;
  const centro = 224;
  const topoFiltro = 112;
  const bicoFiltro = 204;
  const chao = 311;
  ctx.scale(canvas.width / largura, canvas.height / altura);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const misturar = (a, b, t) => a + (b - a) * t;
  const limite = (x, max = 1) => Math.max(0, Math.min(x, max));
  const misturaRGB = (a, b, t) => a.map((valor, i) => Math.round(misturar(valor, b[i], t)));
  const rgba = (cor, alfa) => 'rgba(' + cor.join(',') + ',' + alfa + ')';
  const intensidadeDoCalor = temperatura => limite((temperatura - 48) / 52);
  const ruido = (i, s) => {
    const n = Math.sin(i * s + s) * 43758.5453;
    return n - Math.floor(n);
  };

  function linear(x1, y1, x2, y2, cores, destino = ctx) {
    const tinta = destino.createLinearGradient(x1, y1, x2, y2);
    cores.forEach((cor, i) => tinta.addColorStop(i / (cores.length - 1), cor));
    return tinta;
  }

  function radial(x, y, raio, cores) {
    const tinta = ctx.createRadialGradient(x, y, 0, x, y, raio);
    cores.forEach((cor, i) => tinta.addColorStop(i / (cores.length - 1), cor));
    return tinta;
  }

  function elipse(x, y, rx, ry, cor, rotacao = 0, destino = ctx) {
    destino.beginPath();
    destino.ellipse(x, y, rx, ry, rotacao, 0, TAU);
    destino.fillStyle = cor;
    destino.fill();
  }

  function linha(pontos, cor, larguraTraco = 1, destino = ctx) {
    destino.beginPath();
    destino.moveTo(...pontos[0]);
    for (let i = 1; i < pontos.length; i++) destino.lineTo(...pontos[i]);
    destino.lineWidth = larguraTraco;
    destino.strokeStyle = cor;
    destino.stroke();
  }

  function sombra(x, y, rx, ry, opacidade) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    elipse(0, 0, rx, rx, radial(0, 0, rx, [
      'rgba(12,6,4,' + opacidade + ')', 'rgba(16,7,4,.25)', 'rgba(16,7,4,0)'
    ]));
    ctx.restore();
  }

  const fundo = document.createElement('canvas');
  fundo.width = largura;
  fundo.height = altura;
  ctx.fillStyle = radial(152, 108, 399, ['#5a3626', '#38241b', '#1d1512']);
  ctx.fillRect(0, 0, largura, altura);
  ctx.fillStyle = linear(20, chao, largura, altura, ['#654331', '#3b261e', '#2b1c17']);
  ctx.fillRect(0, chao, largura, altura - chao);
  ctx.fillStyle = radial(193, chao + 8, 249, ['#b77c492e', '#9d67441b', '#9d674400']);
  ctx.fillRect(0, chao, largura, altura - chao);
  linha([[0, chao], [largura, chao]], '#c18a553d');
  for (let i = 0; i < 88; i++) {
    const x = ruido(i, 17.14) * largura;
    const y = chao + ruido(i, 64.31) * 55;
    linha([[x, y], [x + 3 + ruido(i, 23.3) * 28, y + 0.3]], i % 3 ? '#e6ac7910' : '#19100e2e', 0.6);
  }
  fundo.getContext('2d').drawImage(canvas, 0, 0, largura, altura);
  // Inverte o volume de um tronco de cone para posicionar corretamente as graduações.
  function alturaDoVolume(volume, capacidade, raioBase) {
    const fracao = limite(volume / capacidade);
    return (Math.cbrt(raioBase ** 3 + (1 - raioBase ** 3) * fracao) - raioBase) / (1 - raioBase);
  }

  function chaleira(origem, agua, temperatura, ativa, posicao, tempo) {
    const quente = origem === 'quente';
    const transicao = posicao * posicao * (3 - 2 * posicao);
    const x = 389 - transicao * (quente ? 42 : 86);
    const y = (quente ? 30 : 129) - transicao * (quente ? 5 : 99)
      + transicao * Math.sin(tempo * 6) * 1.5;
    const cor = rgba(misturaRGB([183, 221, 239], [255, 208, 160], limite((temperatura - 20) / 70)), 1);
    sombra(x + 35, y + 69, 48, 13, 0.45);
    ctx.save();
    ctx.translate(x + 25, y + 39);
    const inclinacao = -0.17 * transicao;
    ctx.rotate(inclinacao);
    ctx.translate(-x - 25, -y - 39);
    ctx.beginPath();
    ctx.roundRect(x + 44, y + 27, 41, 34, 11);
    ctx.strokeStyle = '#72574a';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 11, y + 55);
    ctx.bezierCurveTo(x - 20, y + 55, x - 15, y + 15, x - 39, y + 15);
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#392b25';
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#9a7b69';
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(x, y + 13, 67, 53, [21, 21, 15, 15]);
    ctx.fillStyle = linear(x, y, x + 67, y, ['#a98972', '#75584b', '#44322d', '#806250']);
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = ativa ? cor : '#c29b83a0';
    ctx.stroke();
    elipse(x + 33, y + 15, 24, 5, '#b29781');
    elipse(x + 33, y + 9, 9, 4, '#402d24');
    elipse(x + 31, y + 8, 4, 1, '#a6917c');
    linha([[x + 10, y + 32], [x + 9, y + 46]], '#fbe2bd6b', 2);
    ctx.fillStyle = cor;
    ctx.textAlign = 'center';
    ctx.font = '700 13px system-ui';
    ctx.fillText(Math.round(agua) + ' mL', x + 35, y + 47);
    ctx.restore();
    const cosseno = Math.cos(inclinacao), seno = Math.sin(inclinacao);
    return { x: x + 25 - 64 * cosseno + 24 * seno, y: y + 39 - 64 * seno - 24 * cosseno };
  }

  function grao(x, y, tamanho, giro, tom, molhado, destino) {
    destino.save();
    destino.translate(x, y);
    destino.rotate(giro);
    destino.scale(tamanho, tamanho);
    elipse(0.5, 0.85, 7, 3.5, '#1c0f0bc2', 0, destino);
    destino.beginPath();
    destino.moveTo(-7, 0);
    destino.bezierCurveTo(-6.5, -5.2, 2.4, -5.7, 6, -2.4);
    destino.bezierCurveTo(10, 1.8, 3.5, 5.2, -3, 4);
    destino.quadraticCurveTo(-7.6, 3.4, -7, 0);
    destino.fillStyle = linear(-3, -5, 4, 5, molhado
      ? [tom > .45 ? '#a7704d' : '#875235', '#582d20', '#26120e']
      : [tom > .45 ? '#b47951' : '#965a37', '#713e28', '#492619'], destino);
    destino.fill();
    destino.lineWidth = 0.35;
    destino.strokeStyle = '#2a150fae';
    destino.stroke();
    destino.beginPath();
    destino.moveTo(-5.7, 0.4);
    destino.bezierCurveTo(-3.5, -2.2, -.4, .5, 1.9, .3);
    destino.quadraticCurveTo(4, .3, 6.2, -1.1);
    destino.lineWidth = .9;
    destino.strokeStyle = '#2c160fe0';
    destino.stroke();
    destino.beginPath();
    destino.moveTo(-5.7, 1.1);
    destino.bezierCurveTo(-3.5, -1.5, -.4, 1.2, 1.9, 1);
    destino.quadraticCurveTo(4, 1, 6.2, -.4);
    destino.strokeStyle = '#e5a5748a';
    destino.lineWidth = .45;
    destino.stroke();
    elipse(-2.1, -2.6, molhado ? 2.6 : 1.9, .45, molhado ? '#f8cfadbf' : '#dba5726b', -.15, destino);
    if (molhado) elipse(1.1, -2.82, .64, .27, '#ffe9ceaf', .04, destino);
    destino.restore();
  }

  const tonsCafe = {
    graos: { seco: ['#a86c46', '#75452f', '#3e2419'], usado: ['#754a33', '#44271b', '#25130e'] },
    triturado: { seco: ['#996749', '#653b27', '#371d15'], usado: ['#6c482e', '#3f271a', '#22130e'] },
    moido: { seco: ['#98664a', '#573324', '#301b14'], usado: ['#604232', '#39261b', '#21140f'] }
  };

  function particulaCafe(forma, x, y, tamanho, giro, tom, molhada, destino = ctx) {
    if (forma === 'graos') {
      grao(x, y, tamanho * 0.77, giro, tom, molhada, destino);
    } else if (forma === 'triturado') {
      const r = tamanho * 2.5;
      const ponta = r * (tom - .6);
      destino.save();
      destino.translate(x, y);
      destino.rotate(giro);
      destino.beginPath();
      destino.moveTo(-r * 1.38, r * .14);
      destino.lineTo(ponta, -r);
      destino.lineTo(r * 1.2, -r * tom * .46);
      destino.lineTo(r * .59, r * .76);
      destino.closePath();
      destino.fillStyle = tom > .55 ? (molhada ? '#805137' : '#a87754') : (molhada ? '#4a2b1e' : '#593726');
      destino.fill();
      destino.beginPath();
      destino.moveTo(ponta, -r);
      destino.lineTo(r * 1.2, -r * tom * .46);
      destino.lineTo(r * .27, r * .19);
      destino.closePath();
      destino.fillStyle = molhada ? '#d2966f69' : '#e5a97e54';
      destino.fill();
      linha([[-r * .98, 0], [ponta, -r * .9], [r * .78, -r * .25]], molhada ? '#e8c4a37e' : '#e8b78856', .55, destino);
      destino.restore();
    } else {
      const r = tamanho * (molhada ? .68 : 1);
      const cor = molhada
        ? (tom > .9 ? '#af805d' : tom > .46 ? '#724d39' : '#382319')
        : (tom > .72 ? '#d49d6f' : tom > .39 ? '#a16847' : '#583321');
      elipse(x, y + .25, r * 1.1, r * .62, '#25150e91', giro, destino);
      elipse(x, y, r * .95, r * .58, cor, giro, destino);
    }
  }

  function secaoFiltro(volume, escala) {
    const t = alturaDoVolume(volume, escala, .13);
    return { y: misturar(bicoFiltro - 7, topoFiltro, t), rx: misturar(11, 84, t), ry: misturar(3.4, 20, t) };
  }

  function paredeCamada(base, topo) {
    const p = new Path2D();
    p.moveTo(centro - topo.rx, topo.y);
    p.bezierCurveTo(centro - topo.rx, topo.y + topo.ry * 1.28,
      centro + topo.rx, topo.y + topo.ry * 1.28, centro + topo.rx, topo.y);
    p.lineTo(centro + base.rx, base.y);
    p.bezierCurveTo(centro + base.rx, base.y + base.ry * 1.28,
      centro - base.rx, base.y + base.ry * 1.28, centro - base.rx, base.y);
    p.closePath();
    return p;
  }

  function criarTextura(largura, altura, total, semente, desenhar) {
    const apoio = document.createElement('canvas');
    apoio.width = largura * 2;
    apoio.height = altura * 2;
    const desenho = apoio.getContext('2d');
    desenho.scale(2, 2);
    for (let i = 0; i < total; i++) {
      const n = semente + i;
      const x = ruido(n, 22.87) * largura;
      const y = ruido(n, 54.91) * altura;
      desenhar(x, y, .44 + ruido(n, 35.48) * .72, ruido(n, 79.12) * TAU, ruido(n, 64.79), desenho);
    }
    const padrao = ctx.createPattern(apoio, 'repeat');
    padrao.setTransform(new DOMMatrix().scale(.5));
    return padrao;
  }

  const texturasCafe = Object.fromEntries(Object.keys(tonsCafe).map((forma, i) => {
    const quantidade = { graos: 130, triturado: 470, moido: 1250 }[forma];
    const padroes = [false, true].map(molhado => criarTextura(108, 76, quantidade, 51 + i * 171,
      (x, y, tamanho, giro, tom, desenho) => particulaCafe(forma, x, y, tamanho, giro, tom, molhado, desenho)));
    return [forma, padroes];
  }));

  function acabamentoBorra(forma, topo) {
    const moido = forma === 'moido';
    elipse(centro, topo.y, topo.rx, topo.ry, radial(centro - topo.rx * .33, topo.y - topo.ry * .44, topo.rx * .92,
      [moido ? '#d9a17668' : '#eac49c1c', '#a271460f', '#a2714600']));
    if (!moido) return;
    const quantidade = Math.ceil(topo.rx / 3);
    for (let i = 0; i < quantidade; i++) {
      const giro = ruido(i, 39.38) * TAU;
      const distancia = Math.sqrt(ruido(i, 40.12)) * .85;
      const x = centro + topo.rx * distancia * Math.cos(giro);
      const y = topo.y + topo.ry * distancia * Math.sin(giro);
      const r = .55 + ruido(i, 18.53) * 1.12;
      elipse(x, y, r, r * .56, '#20120dd9');
      elipse(x + .1, y + r * .42, r * .79, r * .16, '#c3916c8c');
    }
  }

  function pintarCamada(forma, base, topo, parede, superficie, molhada) {
    const cores = tonsCafe[forma][molhada ? 'usado' : 'seco'];
    const textura = texturasCafe[forma][Number(molhada)];
    ctx.fillStyle = linear(centro - topo.rx * .7, topo.y, centro + topo.rx * .8, base.y + base.ry, cores);
    ctx.fill(parede);
    ctx.fillStyle = textura;
    ctx.fill(parede);
    if (!superficie) return;
    elipse(centro, topo.y, topo.rx, topo.ry, radial(centro - topo.rx * .34, topo.y - 5, topo.rx * 1.45,
      [cores[0], cores[1], cores[2]]));
    elipse(centro, topo.y, topo.rx, topo.ry, textura);
    if (molhada) acabamentoBorra(forma, topo);
  }

  function decorarCafe(camada, base, topo, superficie) {
    const { forma, umidade } = camada;
    const parede = paredeCamada(base, topo);
    if (umidade < 1) pintarCamada(forma, base, topo, parede, superficie, false);
    if (umidade > 0) {
      ctx.save();
      ctx.globalAlpha = umidade;
      pintarCamada(forma, base, topo, parede, superficie, true);
      ctx.restore();
    }
    if (!superficie) return;
    ctx.beginPath();
    ctx.ellipse(centro, topo.y, topo.rx, topo.ry, 0, .25, Math.PI - .22);
    ctx.strokeStyle = rgba([232, 163, 121], misturar(.46, .17, umidade));
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  const materiais = {
    papel: {
      corpo: ['#814e3d', '#dfaa83', '#bd8160', '#755043'],
      interior: ['#e5bf94', '#f2d9b0', '#a4785a'],
      borda: ['#eaad88', '#ffdeb5', '#b37861']
    },
    pano: {
      corpo: ['#6c6657', '#d9d3b2', '#a59b82', '#666150'],
      interior: ['#ccc5a3', '#eee7ce', '#989075'],
      borda: ['#aba68e', '#f8f0df', '#827d68']
    },
    duplo: {
      corpo: ['#6e4a35', '#e3ba91', '#bb9673', '#735239'],
      interior: ['#b79571', '#ffe6bf', '#be9069'],
      borda: ['#c89970', '#fff2d6', '#b08258']
    }
  };

  function bolhas(y, rx, ry, tempo, fluxo, temperatura) {
    if (fluxo <= 0) return;
    const calor = intensidadeDoCalor(temperatura);
    const forca = Math.sqrt(limite(fluxo * 2.2));
    const total = Math.ceil(3 + 12 * forca + 8 * calor);
    for (let i = 0; i < total; i++) {
      const fase = (ruido(i, 19.55) + tempo * (.55 + ruido(i, 24.8))) % 1;
      const alfa = Math.sin(fase * Math.PI) * forca * (.28 + .5 * calor);
      const x = centro + (ruido(i, 56.12) * 2 - 1) * rx * (.32 + fase * .57);
      const py = y + (ruido(i, 33.41) * 2 - 1) * ry;
      const r = (.9 + ruido(i, 67.3) * 2.6) * (.61 + fase * .66);
      elipse(x, py, r, r * .67, rgba([73, 41, 25], alfa * .55));
      ctx.beginPath();
      ctx.ellipse(x, py, r, r * .67, 0, 0, TAU);
      ctx.strokeStyle = rgba([250, 212, 159], alfa);
      ctx.lineWidth = .8;
      ctx.stroke();
      elipse(x - r * .33, py - r * .37, r * .22, r * .14, rgba([255, 245, 223], alfa));
    }
  }

  function desenharFiltro(preparo, dados, escala, tempo) {
    const y = topoFiltro;
    const tipo = preparo.receita.coador;
    const material = materiais[tipo] ?? materiais.papel;
    sombra(centro, chao + 8, 122, 23, .54);
    linha([[111, 209], [336, 209]], '#654b3f', 7);
    linha([[114, 207], [333, 207]], '#d5a88a', 1.7);
    linha([[120, 210], [120, 327]], '#80604e', 5);
    linha([[119, 214], [119, 324]], '#c89b7b85', 1.3);
    linha([[93, 327], [144, 327]], '#a7826d', 6);

    const corpo = new Path2D();
    corpo.moveTo(centro - 97, y);
    corpo.bezierCurveTo(centro - 97, y - 32, centro + 97, y - 32, centro + 97, y);
    corpo.lineTo(centro + 15, bicoFiltro - 2);
    corpo.quadraticCurveTo(centro, bicoFiltro + 7, centro - 15, bicoFiltro - 2);
    corpo.closePath();
    ctx.fillStyle = linear(centro - 88, y - 23, centro + 62, bicoFiltro, material.corpo);
    ctx.fill(corpo);

    ctx.save();
    ctx.clip(corpo);
    elipse(centro, y - 2, 89, 22, linear(centro - 88, y - 21, centro + 60, y + 26, material.interior));
    ctx.save();
    if (tipo === 'pano') ctx.setLineDash([2.5, 2]);
    for (let i = -8; i <= 8; i++) {
      const x = centro + i * 10.9;
      const py = y - 17 * Math.sqrt(1 - i * i / 100);
      linha([[x, py], [centro + i * 1.1, bicoFiltro - 3]], '#5a322b4f', 1.7);
      linha([[x + 2, py + 1], [centro + i * 1.1 + 1, bicoFiltro - 4]], '#ffe4bb59', 1);
    }
    ctx.restore();

    let volume = 0;
    let superficie = secaoFiltro(0, escala);
    dados.camadas.forEach((camada, i) => {
      const base = superficie;
      volume += camada.volume;
      superficie = secaoFiltro(volume, escala);
      decorarCafe(camada, base, superficie, i === dados.camadas.length - 1);
    });

    if (preparo.filtro > 0) {
      const nivel = secaoFiltro(volume + preparo.filtro, escala);
      ctx.fillStyle = linear(centro, nivel.y, centro, superficie.y + 12, ['#b77b4860', '#80502c83', '#5b351b47']);
      ctx.fill(paredeCamada(superficie, nivel));
      elipse(centro, nivel.y, nivel.rx, nivel.ry, '#d29c6b55');
      ctx.beginPath();
      ctx.ellipse(centro, nivel.y, nivel.rx - 1, nivel.ry - .8, 0, .24, 2.9);
      ctx.strokeStyle = '#ffddb6a0';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      bolhas(nivel.y, nivel.rx, nivel.ry * .75, tempo, preparo.fluxoChaleira + preparo.gotejo,
        Math.max(dados.temperaturaFiltro, preparo.temperaturaGota));
      superficie = nivel;
    }
    ctx.fillStyle = linear(centro - 96, y, centro + 96, y, ['#f4b38c46', '#f9cdab0c', '#ffffff00', '#5c2e2868']);
    ctx.fill(corpo);
    ctx.restore();

    ctx.lineWidth = 2;
    ctx.strokeStyle = linear(centro - 96, y, centro + 95, bicoFiltro, ['#f2b993', '#be8266', '#7f4f41']);
    ctx.stroke(corpo);
    ctx.beginPath();
    ctx.ellipse(centro, y, 96, 24, 0, .04, Math.PI - .04);
    ctx.lineWidth = 4.3;
    ctx.strokeStyle = linear(centro - 94, y, centro + 96, y, material.borda);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(centro, y - 1.2, 94, 22.5, 0, Math.PI + .12, TAU - .12);
    ctx.lineWidth = 1.7;
    ctx.strokeStyle = '#ffdfb7a6';
    ctx.stroke();
    if (tipo === 'pano' || tipo === 'duplo') {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(centro, y + 1.5, 91, 20, 0, .18, 3);
      if (tipo === 'pano') ctx.setLineDash([2.5, 2.8]);
      ctx.strokeStyle = tipo === 'pano' ? '#746e5e' : '#ffebca';
      ctx.lineWidth = tipo === 'pano' ? 1.7 : 2.6;
      ctx.stroke();
      ctx.restore();
    }
    elipse(centro, bicoFiltro + 1, 15, 4.3, '#a47761');
    elipse(centro, bicoFiltro + 2.1, 6, 1.8, '#2c1c15');
    return superficie.y;
  }

  function cristal(x, y, escala, fase, tom, destino = ctx) {
    destino.save();
    destino.translate(x, y);
    destino.rotate(fase);
    const r = escala * (1.25 + tom * .65), h = escala * (1.05 + .42 * (1 - tom));
    destino.beginPath();
    destino.moveTo(-r, -h*.23);
    destino.lineTo(-r*.37, -h);
    destino.lineTo(r*.65, -h*.84);
    destino.lineTo(r, h*.2);
    destino.lineTo(r*.29, h);
    destino.lineTo(-r*.64, h*.65);
    destino.closePath();
    destino.fillStyle = tom > .45 ? '#e5d9c4' : '#bdae96';
    destino.fill();
    destino.beginPath();
    destino.moveTo(-r, -h*.23);
    destino.lineTo(-r*.37, -h);
    destino.lineTo(r*.65, -h*.84);
    destino.lineTo(r*.13, h*.1);
    destino.closePath();
    destino.fillStyle = tom > .69 ? '#fff9ed' : '#f5ead8';
    destino.fill();
    destino.beginPath();
    destino.moveTo(r*.13, h*.1);
    destino.lineTo(r*.65, -h*.84);
    destino.lineTo(r, h*.2);
    destino.lineTo(r*.29, h);
    destino.closePath();
    destino.fillStyle = '#857d7992';
    destino.fill();
    destino.restore();
  }

  const texturaAcucar = criarTextura(92, 71, 410, 409, cristal);

  function desenharAcucar(base, topo) {
    const perfil = new Path2D();
    const altura = base - topo;
    const rx = Math.min(90, 46 + altura * .79);
    const ressalto = Math.min(10, altura * .2);
    perfil.moveTo(centro - rx, topo + ressalto * .48);
    perfil.bezierCurveTo(centro - rx * .6, topo + ressalto * .3, centro - 13, topo - ressalto * 1.25, centro + 11, topo - ressalto);
    perfil.quadraticCurveTo(centro + rx * .66, topo - ressalto * .62, centro + rx, topo + ressalto * .65);
    perfil.lineTo(centro + rx + 14, base + 3);
    perfil.lineTo(centro - rx - 14, base + 3);
    perfil.closePath();
    ctx.fillStyle = linear(centro - rx, topo - ressalto, centro + rx *.55, base, [
      '#fff0d6', '#e7d5b9', '#cbb49a', '#8b776a'
    ]);
    ctx.fill(perfil);
    ctx.fillStyle = texturaAcucar;
    ctx.fill(perfil);
  }

  function ingredienteCaindo(adicao, tempo, destino) {
    const { tipo, forma, massa, inicio, duracao } = adicao;
    const progresso = (tempo - inicio) / duracao;
    const cafe = tipo === 'cafe';
    const total = Math.min(64, Math.ceil(Math.sqrt(massa) * 5));
    const origemX = centro - 63;
    const origemY = Math.max(35, destino - (cafe ? 78 : 107));
    for (let i = 0; i < total; i++) {
      const t = progresso * 1.9 - ruido(i, 13.5) * .7;
      if (t < 0 || t > 1) continue;
      const x = misturar(origemX, centro + (ruido(i, 51.88) - .5) * 54, t);
      const y = misturar(origemY + ruido(i, 68.92) * 11, destino, .24 * t + .76 * t ** 2);
      const r = .38 + ruido(i, 19.16) * .7;
      const giro = ruido(i, 41.53) * TAU + 2 * t;
      if (cafe) particulaCafe(forma, x, y, r*.93, giro, ruido(i, 12.6), false);
      else cristal(x, y, r, giro, ruido(i, 12.6));
    }
  }

  function correntesDaAgitacao(x, superficie, profundidade, tempo, intensidade, cor, opacidade) {
    const contraste = intensidade * (1 - .35 * opacidade);
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const fracao = (i + .85) / 5;
      const y = superficie + profundidade * fracao;
      const rx = (65 - 37 * fracao) * (.68 + .32 * intensidade);
      const ry = Math.min(5.5 - 2 * fracao, profundidade * .17);
      const fase = tempo * (3.6 - i * .26) - i * 1.34;
      const abertura = 2.35;
      const alfa = contraste * (.54 - .21 * fracao);
      const brilho = fase + abertura * (.55 + .14 * Math.sin(tempo * 2 + i));
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, fase, fase + abertura);
      ctx.lineWidth = 3.1 - 1.4 * fracao;
      ctx.strokeStyle = linear(x + rx * Math.cos(fase), y + ry * Math.sin(fase),
        x + rx * Math.cos(fase + abertura), y + ry * Math.sin(fase + abertura),
        [rgba(cor, 0), rgba(cor, alfa), rgba(cor, alfa * .13)]);
      ctx.stroke();
      elipse(x + rx * Math.cos(brilho), y + ry * Math.sin(brilho), 2.2 - fracao, .72,
        rgba(cor, alfa * .95), -.15);
    }
    ctx.restore();
  }

  function ondasDaAgitacao(x, y, tempo, intensidade) {
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const fase = tempo * (3.3 - i * .36) + i * 1.65;
      const raio = (25 + i * 16) * (.55 + .45 * intensidade);
      ctx.beginPath();
      ctx.ellipse(x, y + 1 + i, raio, 2.5 + i * 1.05, 0, fase, fase + 1.85);
      ctx.lineWidth = 1.35 - i * .17;
      ctx.strokeStyle = rgba([249, 228, 188], (.78 - i * .18) * intensidade);
      ctx.stroke();
    }
    ctx.restore();
  }

  function xicara(preparo, dados, escala, y, tempo, fluxo, temperaturaDaQueda) {
    const xa = 139, xb = 309;
    const altura = volume => alturaDoVolume(volume, escala, .66) * 83;
    const superficie = y + 94 - altura(dados.nivelLiquido);
    const sedimentacao = y + 95 - altura(dados.volumeSolto);
    const carga = dados.concentracaoCafe;
    const pigmento = 1 - Math.exp(-carga / 22);
    const escuro = 1 - Math.exp(-carga / 300);
    // A fração de luz transmitida diminui exponencialmente com a carga de cor.
    const opacidade = .06 + .93 * (1 - Math.exp(-carga / 275));
    const ambar = misturaRGB([224, 172, 97], [28, 10, 5], escuro);
    const claro = misturaRGB([190, 229, 239], misturaRGB(ambar, [254, 209, 147], .25 - .15 * escuro), pigmento);
    const meio = misturaRGB([148, 193, 212], ambar, pigmento);
    const fundo = misturaRGB([112, 160, 184], misturaRGB(ambar, [23, 8, 4], .43 + .2 * escuro), pigmento);
    const agitacao = dados.agitandoAcucar ? limite(preparo.xicara / 30) : 0;
    const centroAgitacao = centro - 4 + Math.sin(tempo * 1.9) * 4;
    const profundidade = y + 94 - superficie;
    const depressao = Math.min(3.8, profundidade * .25);
    const movimento = tempo ? limite(preparo.impacto) * 2.9 + agitacao * 1.2 : 0;
    sombra(centro + 14, y + 101, 115, 16, .87);
    ctx.beginPath();
    ctx.ellipse(xb - 1, y + 43, 31, 24, .28, -1.7, 1.98);
    ctx.lineWidth = 7;
    ctx.strokeStyle = linear(xb, y + 22, xb + 20, y + 63, ['#d9ac87a8', '#8c685693', '#ebbaa680']);
    ctx.stroke();

    const corpo = new Path2D();
    corpo.moveTo(xa, y);
    corpo.bezierCurveTo(xa + 4, y + 29, xa + 10, y + 64, xa + 17, y + 81);
    corpo.quadraticCurveTo(xa + 22, y + 96, xa + 43, y + 97);
    corpo.lineTo(xb - 42, y + 97);
    corpo.quadraticCurveTo(xb - 22, y + 96, xb - 17, y + 80);
    corpo.bezierCurveTo(xb - 10, y + 66, xb - 4, y + 28, xb, y);
    const vidro = new Path2D(corpo);
    vidro.ellipse(centro, y, 85, 11, 0, 0, Math.PI);
    vidro.closePath();
    ctx.fillStyle = linear(xa, y, xb, y, ['#c49a7f45', '#ad8c7240', '#5044482b', '#f3c5a143']);
    ctx.fill(vidro);
    ctx.save();
    ctx.clip(vidro);
    linha([[xa + 30, y + 10], [xa + 41, y + 80]], '#efb78466', 2);
    linha([[xb - 19, y + 13], [xb - 34, y + 86]], '#281e1e71', 3);
    if (dados.excesso > .001) desenharAcucar(y + 98, sedimentacao);
    if (dados.bebida > 0) {
      const liquido = new Path2D();
      liquido.moveTo(xa - 3, superficie);
      for (let x = xa; x <= xb + 2; x += 2) {
        const onda = movimento * Math.sin((x - centro) * .075 + tempo * 9);
        const distancia = (x - centroAgitacao) / 21;
        const redemoinho = agitacao ? agitacao * depressao * Math.exp(-(distancia ** 2)) : 0;
        liquido.lineTo(x, superficie + onda + redemoinho);
      }
      liquido.lineTo(xb + 3, y + 100);
      liquido.lineTo(xa - 3, y + 100);
      liquido.closePath();
      ctx.fillStyle = linear(centro - 55, superficie, centro + 47, y + 103, [
        rgba(claro, opacidade * .83),
        rgba(meio, opacidade),
        rgba(fundo, limite(opacidade + .035 + .09 * escuro))
      ]);
      ctx.fill(liquido);
      if (agitacao) {
        ctx.save();
        ctx.clip(liquido);
        const corCorrentes = misturaRGB([211, 239, 249], [255, 202, 144], pigmento);
        correntesDaAgitacao(centroAgitacao, superficie, profundidade, tempo, agitacao, corCorrentes, opacidade);
        ctx.restore();
      }
      elipse(centro, superficie, 85, 4.6 + movimento * .55, rgba(claro, .16 + opacidade * .57));
      ctx.beginPath();
      ctx.ellipse(centro, superficie, 84, 5 + movimento * .5, 0, .34, 2.85);
      ctx.lineWidth = 1.1;
      ctx.strokeStyle = rgba(misturaRGB(claro, [255, 239, 216], .48), .38 + .16 * escuro);
      ctx.stroke();
      if (preparo.impacto > .06) {
        for (let i = 0; i < 3; i++) {
          const onda = tempo ? (tempo * 2.7 + i / 3) % 1 : i / 3;
          elipse(centro - 5, superficie + 2, 3 + onda * 14, 1 + onda * 2,
            rgba(claro, (.08 + .16 * (1 - onda)) * limite(preparo.impacto)));
        }
      }
      if (agitacao) ondasDaAgitacao(centroAgitacao, superficie, tempo, agitacao);
    }
    if (dados.bebida > 0) bolhas(superficie, 76, 5.2, tempo, fluxo, temperaturaDaQueda);
    linha([[xa + 9, y + 13], [xa + 19, y + 57]], '#ffe7cd81', 2.2);
    linha([[xb - 8, y + 20], [xb - 15, y + 55]], '#ffdbba60', 1.5);
    ctx.restore();
    ctx.lineWidth = 1.7;
    ctx.strokeStyle = '#dab9a397';
    ctx.stroke(corpo);
    ctx.beginPath();
    ctx.ellipse(centro, y, 85, 11, 0, 0, TAU);
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = '#f4cfb293';
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(centro, y - .25, 84, 11, 0, .31, 2.65);
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = '#fff4d7a0';
    ctx.stroke();
    for (let i = 1; i <= 4; i++) {
      const nivel = y + 94 - altura(escala * i / 4);
      linha([[centro + 26, nivel], [centro + (i % 2 ? 34 : 40), nivel]], '#f2d5bb91', 1.05);
    }
    return { superficie, sedimentacao, corGota: rgba(claro, .49 + opacidade * .48) };
  }

  function jato(bico, destino, quente, fluxo, tempo) {
    const meioX = misturar(bico.x, destino.x, .54);
    const meioY = Math.min(bico.y, destino.y) + (destino.y < bico.y ? -22 : 0);
    const oscilacao = Math.sin(tempo * 15) * (tempo ? 2.1 : 0);
    const tinta = linear(bico.x, bico.y, destino.x, destino.y, quente
      ? ['#ffdab8d6', '#fff2d78c', '#d79d6da3'] : ['#bae4f6df', '#effaff92', '#82b4d9b7']);
    ctx.beginPath();
    ctx.moveTo(bico.x, bico.y);
    ctx.quadraticCurveTo(meioX, meioY, destino.x + oscilacao, destino.y);
    ctx.lineWidth = 1.55 + limite(fluxo) * 2.35;
    ctx.strokeStyle = tinta;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bico.x, bico.y - .9);
    ctx.quadraticCurveTo(meioX, meioY - 1.2, destino.x + oscilacao, destino.y - .8);
    ctx.lineWidth = .8;
    ctx.strokeStyle = '#fff6eac3';
    ctx.stroke();
  }

  function gotas(gotejo, fim, cor, tempo) {
    const quantidade = gotejo > .72 ? 5 : 4;
    for (let i = 0; i < quantidade; i++) {
      const fase = (tempo * (2.1 + gotejo * .8) + i / quantidade) % 1;
      const y = misturar(bicoFiltro + 5, fim, .23 * fase + .77 * fase ** 2);
      const x = centro + Math.sin(i * 7 + fase * 1.8) * 1.8;
      elipse(x, y, 1.13 + fase * .63, 1.8 + fase * 1.85, cor);
      elipse(x - .48, y - .44, .38, .86, '#ffe5b792');
    }
  }

  // A textura de bordas difusas é reutilizada em todas as partículas.
  const texturaVapor = document.createElement('canvas');
  texturaVapor.width = 64;
  texturaVapor.height = 96;
  const ctxVapor = texturaVapor.getContext('2d');
  const corVapor = [255, 241, 225];
  for (const [x, y, raio, alfa] of [[38, 23, 20, .32], [32, 43, 27, .54], [24, 62, 19, .4], [32, 77, 13, .32]]) {
    const gradiente = ctxVapor.createRadialGradient(x, y, 0, x, y, raio);
    gradiente.addColorStop(0, rgba(corVapor, alfa));
    gradiente.addColorStop(.32, rgba(corVapor, alfa * .75));
    gradiente.addColorStop(.66, rgba(corVapor, alfa * .2));
    gradiente.addColorStop(1, rgba(corVapor, 0));
    ctxVapor.fillStyle = gradiente;
    ctxVapor.fillRect(x - raio, y - raio, 2 * raio, 2 * raio);
  }

  let preparoVisual;
  let emissores = [];

  function criarEmissor(alcance, abertura, semente) {
    return { alcance, abertura, semente, particulas: [], proxima: 0 };
  }

  function bruma(x, y, largura, altura, angulo, alfa) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angulo);
    ctx.globalAlpha = alfa;
    ctx.drawImage(texturaVapor, -largura / 2, -altura / 2, largura, altura);
    ctx.restore();
  }

  function vapor(emissor, y, tempo, calor, fluxo, semMovimento) {
    const intensidade = calor ** .8 * (.72 + .28 * Math.sqrt(limite(fluxo * 2)));
    if (semMovimento) {
      emissor.particulas.length = 0;
      emissor.proxima = tempo;
      if (intensidade) {
        bruma(centro - 11, y - emissor.alcance * .33, 28, 42, -.26, intensidade * .74);
        bruma(centro + 18, y - emissor.alcance * .53, 36, 58, .29, intensidade * .65);
        bruma(centro + 3, y - emissor.alcance * .72, 40, 56, .45, intensidade * .39);
      }
      return;
    }

    emissor.particulas = emissor.particulas.filter(particula => particula.fim > tempo);
    if (intensidade && tempo >= emissor.proxima) {
      const i = emissor.semente++;
      emissor.particulas.push({
        x: centro + emissor.abertura * (ruido(i, 8.32) - .5),
        y, inicio: tempo, fim: tempo + misturar(.91, 1.48, ruido(i, 23.79)),
        rumo: misturar(-34, 39, ruido(i, 49.24)),
        fase: TAU * ruido(i, 31.15),
        ascensao: emissor.alcance * misturar(.77, 1.13, ruido(i, 60.72)),
        tamanho: misturar(.82, 1.23, ruido(i, 53.6)),
        giro: misturar(-.66, .66, ruido(i, 17.35)),
        intensidade
      });
      emissor.proxima = tempo + misturar(.24, .095, intensidade) * misturar(.8, 1.17, ruido(i, 43.62));
    }

    for (const particula of emissor.particulas) {
      const t = (tempo - particula.inicio) / (particula.fim - particula.inicio);
      const x = particula.x + particula.rumo * t + Math.sin(t * 6 + particula.fase) * (6 + 12 * t) * t;
      const y = particula.y - 8 - particula.ascensao * t * (1.22 - .22 * t);
      const alfa = particula.intensidade * Math.sin(t * Math.PI) ** 1.1 * (.93 - .28 * t);
      bruma(x, y, (15 + 39 * t) * particula.tamanho, (24 + 45 * t) * particula.tamanho,
        particula.giro * (.7 + t) + .24 * Math.sin(t * 7 + particula.fase), alfa);
    }
  }

  function desenhar(preparo, dados, escalaXicara, escalaFiltro, semMovimento) {
    if (preparoVisual !== preparo) {
      preparoVisual = preparo;
      emissores = [criarEmissor(85, 45, 1), criarEmissor(121, 42, 41)];
    }
    const { receita, fila, gotejo, fluxoChaleira } = preparo;
    const doseAtiva = fluxoChaleira > 0 ? preparo.jato : fila[0];
    const despejando = doseAtiva?.origem;
    const cafe = dados.camadas.length > 0;
    const tempo = semMovimento ? 0 : preparo.tempo;
    const fluxoNaXicara = cafe ? gotejo : fluxoChaleira;
    const temperaturaDaQueda = cafe ? preparo.temperaturaGota : doseAtiva?.temperatura ?? dados.temperatura;
    ctx.drawImage(fundo, 0, 0);
    const y = 225;
    const bebida = xicara(preparo, dados, escalaXicara, y, tempo, fluxoNaXicara, temperaturaDaQueda);
    const superficieFiltro = cafe ? desenharFiltro(preparo, dados, escalaFiltro, tempo) : topoFiltro;
    const origens = despejando === 'quente' ? ['fria', 'quente'] : ['quente', 'fria'];
    for (const origem of origens) {
      const ativa = despejando === origem;
      const posicao = semMovimento ? Number(ativa) : preparo.chaleiras[origem];
      const naFila = ativa ? doseAtiva : fila.find(dose => dose.origem === origem);
      const agua = naFila?.volume ?? (posicao > 0 ? 0 : receita[origem]);
      const temperatura = naFila?.temperatura ?? dados.temperaturasReservatorios[origem];
      const bico = chaleira(origem, agua, temperatura, ativa, posicao, tempo);
      if (!ativa || fluxoChaleira <= 0 || (origem === 'fria' && cafe && posicao < .57)) continue;
      jato(bico, {
        x: centro,
        y: cafe ? superficieFiltro + 1 : Math.max(y + 8, Math.min(bebida.sedimentacao, bebida.superficie))
      }, temperatura >= 55, fluxoChaleira, tempo);
    }
    if (cafe && gotejo > 0) gotas(gotejo, bebida.superficie - 1, bebida.corGota, tempo);
    const [vaporFiltro, vaporXicara] = emissores;
    const fluxoNoFiltro = cafe ? fluxoChaleira + gotejo : 0;
    vapor(vaporFiltro, Math.min(superficieFiltro, topoFiltro + 16), preparo.tempo,
      dados.calorVapor.filtro, fluxoNoFiltro, semMovimento);
    vapor(vaporXicara, bebida.superficie, preparo.tempo, dados.calorVapor.xicara, fluxoNaXicara, semMovimento);
    if (!semMovimento) {
      for (const adicao of preparo.adicoes) {
        const destino = adicao.tipo === 'cafe' ? superficieFiltro : Math.min(bebida.superficie, bebida.sedimentacao);
        ingredienteCaindo(adicao, tempo, destino);
      }
    }
  }

  function temVapor(preparo) {
    return preparo === preparoVisual && emissores.some(emissor =>
      emissor.particulas.some(particula => particula.fim > preparo.tempo)
    );
  }

  return { desenhar, temVapor };
};
