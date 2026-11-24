const formatarCientifico = (() => {
  const formatador = new Intl.NumberFormat('pt-BR', { notation: 'scientific', maximumFractionDigits: 3 });
  const digitosSobrescritos = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  return valor => {
    if (valor === 0) return '0';
    const [mantissa, expoente] = formatador.format(valor).split('E');
    const sobrescrito = expoente.replace(/[-−]/g, '⁻').replace(/\d/g, digito => digitosSobrescritos[Number(digito)]);
    return mantissa + ' × 10' + sobrescrito;
  };
})();
const formatarMols = n => formatarCientifico(n) + ' mol';

(() => {
  // Densidades a granel aproximadas. As vazões e as curvas de extração são didáticas.
  // Densidades medidas: DOI 10.1590/1807-1929/agriambi.v20n7p666-671 e 10.1590/0001-3765201920180191.
  const perfis = {
    graos: { descricao: 'Grãos inteiros, passagem rápida e pouca extração.', densidade: 0.38, vazao: 76, limite: 0.14, taxaRelativa: 0.12 },
    triturado: { descricao: 'Pedaços grossos, com extração intermediária.', densidade: 0.35, vazao: 56, limite: 0.70, taxaRelativa: 0.45 },
    moido: { descricao: 'Pó fino, passagem mais lenta e maior extração.', densidade: 0.33, vazao: 39, limite: 0.95, taxaRelativa: 1 }
  };
  const temperaturaAmbiente = 20;
  const temperaturasPadrao = { quente: 100, fria: 20 };
  const origens = Object.keys(temperaturasPadrao);
  const campoTemperatura = { quente: 'temperaturaQuente', fria: 'temperaturaFria' };
  const coadores = { pano: 1.6, papel: 1, duplo: 0.62 };
  // Água líquida, 10 a 100 °C em passos de 10 °C. Densidade (g/mL), entalpia (J/g)
  // e viscosidade dinâmica (mPa·s), das tabelas NISTIR 5078 e ASHRAE/IAPWS.
  const agua = [
    [0.99965, 42.02, 1.306], [0.99816, 83.91, 1.002], [0.99561, 125.73, 0.7972],
    [0.99218, 167.53, 0.6527], [0.98800, 209.34, 0.5465], [0.98316, 251.18, 0.4660],
    [0.97773, 293.07, 0.4035], [0.97177, 335.01, 0.3540], [0.96530, 377.04, 0.3142],
    [0.95835, 419.17, 0.2816]
  ];
  const entalpiaAmbiente = agua[1][1]; // Água a 20 °C, em J/g.
  // Herzfeld (NBS Circular 440), em g/100 g de água, na mesma faixa.
  const sacarose = [190.5, 203.9, 219.5, 238.1, 260.4, 287.3, 320.5, 362.1, 415.7, 487.2];
  // Tempos aproximados do gráfico do NPL, de 10 a 50 °C, em s.
  const temposNpl = [62, 40, 29, 20, 15];
  const toleranciaAcucar = 0.01;
  const fatorSemAgitacao = 0.25; // Aproximação didática da transferência sem mexer.
  const fatorTempo = 20;
  // Arábica torrado, valor de referência arredondado. DOI 10.1016/j.heliyon.2023.e19580.
  const cafeinaPorGrama = 8;
  // Escala cinética de uma infusão de arábica moído, DOI 10.23435/jkcc.2026.12.2.161.
  const taxaCafeina90 = 1.432 / 60; // s⁻¹ a 90 °C
  const energiaAtivacaoCafeina = 44500; // J/mol
  const constanteGases = 8.314462618; // J/(mol·K)
  // Massas molares em g/mol, NIST Chemistry WebBook, CAS 58-08-2 e 57-50-1.
  const massasMolares = { cafeina: 194.1906, sacarose: 342.2965 };
  const capacidadeFiltro = 110;
  const vazaoChaleira = 145;
  const densidadeAcucarSolto = 0.845; // Estimada de 200 g por xícara americana (USDA).
  const densidadeCristal = 1.587; // Densidade do cristal de sacarose, em g/mL.
  const volumeAcucarDissolvido = 0.632; // Volume específico aparente aproximado (Tinjacá et al., 2018).
  const duracaoAdicao = 0.75;
  // Constantes de tempo ilustrativas em segundos simulados.
  const resfriamento = { filtro: 180, xicara: 900, borra: 110 };
  const limiarVapor = 48;
  const interpolar = (a, b, t) => a + (b - a) * t;
  const formatadores = [0, 1, 2, 3, 4].map(maximumFractionDigits =>
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits })
  );
  const formato = (valor, unidade, casas = 0) => formatadores[casas].format(valor) + ' ' + unidade;
  const decimalQuimico = new Intl.NumberFormat('pt-BR', { maximumSignificantDigits: 5 });
  const cientifico = new Intl.NumberFormat('pt-BR', { notation: 'scientific', maximumSignificantDigits: 5 });
  const numeroQuimico = valor => (valor > 0 && (valor < 0.00001 || valor >= 100000) ? cientifico : decimalQuimico).format(valor);
  const expressarMols = n => (n ? 'n ≈ ' : 'n = ') + formatarMols(n);

  function indiceTemperatura(temperatura, tamanho) {
    const passo = Math.max(0, Math.min(tamanho - 1, (temperatura - 10) / 10));
    const indice = Math.min(Math.floor(passo), tamanho - 2);
    return [indice, passo - indice];
  }

  function propriedadesAgua(temperatura) {
    const [i, t] = indiceTemperatura(temperatura, agua.length);
    const [densidade, entalpia, viscosidade] = agua[i];
    const [densidadeSeguinte, entalpiaSeguinte, viscosidadeSeguinte] = agua[i + 1];
    return {
      densidade: interpolar(densidade, densidadeSeguinte, t),
      entalpia: interpolar(entalpia, entalpiaSeguinte, t),
      viscosidade: viscosidade * (viscosidadeSeguinte / viscosidade) ** t
    };
  }

  function temperaturaDaMistura(massa, entalpia) {
    if (!massa) return temperaturaAmbiente;
    const especifica = entalpia / massa;
    if (especifica <= agua[0][1]) return 10;
    const superior = agua.findIndex(linha => linha[1] >= especifica);
    if (superior < 0) return 100;
    const h0 = agua[superior - 1][1];
    return 10 * (superior + (especifica - h0) / (agua[superior][1] - h0));
  }

  function trocarCalorAmbiente(massa, entalpia, segundos, constante) {
    const equilibrio = massa * entalpiaAmbiente;
    const diferenca = (entalpia - equilibrio) * Math.exp(-segundos / constante);
    return Math.abs(diferenca) <= massa * .2 ? equilibrio : equilibrio + diferenca;
  }

  function temperaturaDaDose(receita, origem) {
    return receita.temperaturaLivre ? receita[campoTemperatura[origem]] : temperaturasPadrao[origem];
  }

  function difusaoRelativa(temperatura, viscosidade, referencia, viscosidadeRef) {
    return (temperatura + 273.15) * viscosidadeRef / ((referencia + 273.15) * viscosidade);
  }

  function capacidadeDeSacarose(massaAgua, temperatura) {
    const [i, t] = indiceTemperatura(temperatura, sacarose.length);
    return interpolar(sacarose[i], sacarose[i + 1], t) * massaAgua / 100;
  }

  function taxaDoAcucar(temperatura, saturacao, alvo, agitacao) {
    const [i, t] = indiceTemperatura(temperatura, temposNpl.length);
    const tempoRef = interpolar(temposNpl[i], temposNpl[i + 1], t);
    const difusao = temperatura > 50
      ? difusaoRelativa(temperatura, propriedadesAgua(temperatura).viscosidade, 50, agua[4][2])
      : 1;
    const atenuacao = 1 - 0.75 * alvo / saturacao;
    const fatorAgitacao = agitacao === 'sem' ? fatorSemAgitacao : 1;
    return Math.log(4.5 / toleranciaAcucar) * difusao * atenuacao * fatorAgitacao / tempoRef;
  }

  function novoPreparo(receita) {
    return {
      receita, iniciado: false, fila: [], camadas: [],
      volumeCafe: 0, resistenciaFiltro: 0, acucar: 0, acucarDissolvido: 0,
      filtro: 0, massaAguaFiltro: 0, entalpiaFiltro: 0,
      xicara: 0, massaAguaXicara: 0, entalpiaXicara: 0,
      cafeinaFiltro: 0, cafeinaXicara: 0,
      gotejo: 0, temperaturaGota: temperaturaAmbiente, fluxoChaleira: 0, jato: null,
      impacto: 0, tempo: 0, tempoCoagem: 0, tempoAcucar: 0,
      ultimaAguaFiltro: -Infinity,
      chaleiras: { quente: 0, fria: 0 }, adicoes: []
    };
  }

  function criarCamada(forma, massa) {
    const perfil = perfis[forma];
    return {
      forma, massa, volume: massa / perfil.densidade, umidade: 0,
      cafeinaDisponivel: massa * cafeinaPorGrama * perfil.limite
    };
  }

  function depositarCafe(preparo, forma, massa) {
    if (!massa) return;
    const camada = criarCamada(forma, massa);
    preparo.camadas.push(camada);
    preparo.volumeCafe += camada.volume;
    preparo.resistenciaFiltro += camada.volume / perfis[forma].vazao;
  }

  function enfileirarAgua(preparo, fontes) {
    const doses = fontes.filter(origem => preparo.receita[origem] > 0);
    if (!doses.length) return;
    if (!preparo.iniciado) {
      const { forma, cafe, acucar } = preparo.receita;
      depositarCafe(preparo, forma, cafe);
      preparo.acucar = acucar;
      preparo.iniciado = true;
    }
    for (const origem of doses) {
      const temperatura = temperaturaDaDose(preparo.receita, origem);
      const { densidade, entalpia } = propriedadesAgua(temperatura);
      const nome = preparo.receita.temperaturaLivre ? (origem === 'quente' ? 'A' : 'B') : origem;
      preparo.fila.push({ origem, nome, volume: preparo.receita[origem], temperatura, densidade, entalpia });
    }
  }

  function adicionarIngrediente(preparo, tipo) {
    const massa = preparo.receita[tipo];
    if (!preparo.iniciado || !massa) return;
    const { forma } = preparo.receita;
    if (tipo === 'cafe') depositarCafe(preparo, forma, massa);
    else {
      preparo.acucar += massa;
      preparo.tempoAcucar = 0;
    }
    // Os efeitos se sobrepõem por um instante. As doses sempre entram no balanço.
    preparo.adicoes = preparo.adicoes.slice(-3);
    preparo.adicoes.push({ tipo, forma, massa, inicio: preparo.tempo, duracao: duracaoAdicao });
    rodar();
  }

  function alvoAcucar(preparo) {
    const t = temperaturaDaMistura(preparo.massaAguaXicara, preparo.entalpiaXicara);
    return Math.min(preparo.acucar, capacidadeDeSacarose(preparo.massaAguaXicara, t));
  }

  function cineticaDoAcucar(preparo, temperatura) {
    const saturacao = capacidadeDeSacarose(preparo.massaAguaXicara, temperatura);
    const alvo = Math.min(preparo.acucar, saturacao);
    const diferenca = alvo - preparo.acucarDissolvido;
    const agitacao = diferenca > 0 ? preparo.receita.agitacaoAcucar : undefined;
    const taxa = saturacao && diferenca ? taxaDoAcucar(temperatura, saturacao, alvo, agitacao) : 0;
    return { alvo, diferenca, taxa };
  }

  // Cada transferência leva a massa, a entalpia e os solutos da água coletada.
  function transferir(preparo, volume, massa, entalpiaEspecifica, cafeina = 0) {
    preparo.xicara += volume;
    preparo.massaAguaXicara += massa;
    preparo.entalpiaXicara += massa * entalpiaEspecifica;
    preparo.cafeinaXicara += cafeina;
  }

  function taxaDaCafeina(temperatura) {
    const inversoT = 1 / (temperatura + 273.15);
    return taxaCafeina90 * Math.exp(energiaAtivacaoCafeina / constanteGases * (1 / 363.15 - inversoT));
  }

  function liberarCafeina(preparo, temperatura, contato, volumeDrenado) {
    const taxa = taxaDaCafeina(temperatura);
    for (const camada of preparo.camadas) {
      const aguaParaMolhar = Math.max(1, camada.massa * 1.25);
      const parteEmContato = Math.min(1, camada.umidade + preparo.filtro / aguaParaMolhar);
      const taxaDaCamada = taxa * perfis[camada.forma].taxaRelativa * parteEmContato;
      const liberada = camada.cafeinaDisponivel * -Math.expm1(-taxaDaCamada * contato);
      camada.cafeinaDisponivel -= liberada;
      preparo.cafeinaFiltro += liberada;
      camada.umidade = Math.min(1, camada.umidade + volumeDrenado / aguaParaMolhar);
    }
  }

  function avancar(preparo, dt) {
    const passaNoFiltro = preparo.camadas.length > 0;
    const dose = preparo.fila[0];
    const segundos = dt * fatorTempo;
    preparo.tempo += dt;
    preparo.entalpiaFiltro = trocarCalorAmbiente(preparo.massaAguaFiltro, preparo.entalpiaFiltro, segundos, resfriamento.filtro);
    preparo.entalpiaXicara = trocarCalorAmbiente(preparo.massaAguaXicara, preparo.entalpiaXicara, segundos, resfriamento.xicara);
    preparo.adicoes = preparo.adicoes.filter(adicao => preparo.tempo - adicao.inicio < adicao.duracao);
    for (const fonte of origens) {
      const posicao = preparo.chaleiras[fonte];
      preparo.chaleiras[fonte] = fonte === dose?.origem
        ? Math.min(1, posicao + dt * 4.5) : Math.max(0, posicao - dt * 3.8);
    }
    preparo.fluxoChaleira = 0;
    preparo.jato = dose ?? null;
    preparo.gotejo = 0;

    if (dose) {
      const espaco = passaNoFiltro ? Math.max(0, capacidadeFiltro - preparo.filtro) : Infinity;
      const volume = Math.min(dose.volume, vazaoChaleira * dt, espaco);
      const { densidade, entalpia } = dose;
      const massa = volume * densidade;
      preparo.fluxoChaleira = volume / (vazaoChaleira * dt);
      dose.volume -= volume;
      if (passaNoFiltro) {
        preparo.filtro += volume;
        preparo.massaAguaFiltro += massa;
        preparo.entalpiaFiltro += massa * entalpia;
      } else {
        transferir(preparo, volume, massa, entalpia);
      }
      if (dose.volume <= 1e-8) preparo.fila.shift();
    }

    if (passaNoFiltro && preparo.filtro > 0) {
      const entalpia = preparo.entalpiaFiltro / preparo.massaAguaFiltro;
      const temperatura = temperaturaDaMistura(preparo.massaAguaFiltro, preparo.entalpiaFiltro);
      const { densidade, viscosidade } = propriedadesAgua(temperatura);
      const [densidadeRef, , viscosidadeRef] = agua.at(-1);
      const fluidez = (densidade / viscosidade) / (densidadeRef / viscosidadeRef);
      const ganhoCoador = coadores[preparo.receita.coador] ?? coadores.papel;
      const resistencia = 1 + Math.max(0, preparo.volumeCafe - 45) / 480;
      const vazao = ganhoCoador * fluidez * preparo.volumeCafe / (preparo.resistenciaFiltro * resistencia)
        * Math.sqrt(0.55 + preparo.filtro / capacidadeFiltro);
      const volume = Math.min(preparo.filtro, vazao * dt);
      const parte = volume / preparo.filtro;
      const massa = preparo.massaAguaFiltro * parte;
      const contato = Math.min(dt, volume / vazao) * fatorTempo;
      preparo.tempoCoagem += contato;
      liberarCafeina(preparo, temperatura, contato, volume);
      const cafeina = preparo.cafeinaFiltro * parte;
      preparo.cafeinaFiltro *= 1 - parte;
      preparo.gotejo = volume / (76 * dt);
      preparo.temperaturaGota = temperatura;
      preparo.ultimaAguaFiltro = preparo.tempo;
      preparo.filtro -= volume;
      preparo.massaAguaFiltro *= 1 - parte;
      preparo.entalpiaFiltro *= 1 - parte;
      transferir(preparo, volume, massa, entalpia, cafeina);
    }
    const fluxoNaXicara = passaNoFiltro ? preparo.gotejo : preparo.fluxoChaleira;
    preparo.impacto = Math.max(fluxoNaXicara, preparo.impacto * Math.exp(-5 * dt));

    if (preparo.massaAguaXicara && preparo.acucar) {
      const temperatura = temperaturaDaMistura(preparo.massaAguaXicara, preparo.entalpiaXicara);
      const { alvo, diferenca, taxa } = cineticaDoAcucar(preparo, temperatura);
      if (diferenca === 0) return;
      if (diferenca > 0) preparo.tempoAcucar += segundos;
      const restante = diferenca * Math.exp(-taxa * segundos);
      preparo.acucarDissolvido = Math.abs(restante) <= toleranciaAcucar ? alvo : alvo - restante;
    }
  }

  function duracaoTexto(segundos) {
    const valor = Math.round(segundos);
    const minutos = Math.floor(valor / 60);
    const resto = valor % 60;
    return minutos ? minutos + ' min ' + resto + ' s' : resto + ' s';
  }

  function velocidadeTexto(velocidade) {
    if (velocidade === 0) return '0 g/s';
    return velocidade < .001 ? '< 0,001 g/s' : '≈ ' + formato(velocidade, 'g/s', 3);
  }

  function tempoAcucarTexto(preparo, dados) {
    if (!dados.acucar) return '—';
    if (dados.acucar - dados.massaAcucar <= toleranciaAcucar) {
      return duracaoTexto(preparo.tempoAcucar) + ' decorridos';
    }

    let massa = preparo.massaAguaXicara + preparo.massaAguaFiltro;
    let entalpia = preparo.entalpiaXicara + preparo.entalpiaFiltro;
    if (preparo.iniciado) {
      for (const dose of preparo.fila) {
        const massaDose = dose.volume * dose.densidade;
        massa += massaDose;
        entalpia += massaDose * dose.entalpia;
      }
    } else {
      for (const origem of origens) {
        const agua = propriedadesAgua(temperaturaDaDose(preparo.receita, origem));
        const massaDose = preparo.receita[origem] * agua.densidade;
        massa += massaDose;
        entalpia += massaDose * agua.entalpia;
      }
    }
    if (!massa) return 'Precisa de água';
    const temperatura = temperaturaDaMistura(massa, entalpia);
    const saturacao = capacidadeDeSacarose(massa, temperatura);
    if (dados.acucar > saturacao + toleranciaAcucar) return 'Satura com esse volume';
    const alvo = Math.min(dados.acucar, saturacao);
    const falta = Math.max(toleranciaAcucar, alvo - dados.massaAcucar);
    const taxa = taxaDoAcucar(temperatura, saturacao, alvo, preparo.receita.agitacaoAcucar);
    const segundos = Math.log(falta / toleranciaAcucar) / taxa;
    const faltaChegarAgua = preparo.iniciado && (preparo.fila.length || preparo.filtro > 0);
    const sufixo = faltaChegarAgua ? ' no volume final' : preparo.xicara ? ' restantes' : '';
    return '≈ ' + duracaoTexto(segundos) + sufixo;
  }

  function calcularSoluto(massaEmGramas, massaMolar, volumeLitros) {
    const n = massaEmGramas / massaMolar;
    return { massaEmGramas, massaMolar, n, molaridade: volumeLitros ? n / volumeLitros : null };
  }

  function temperaturaDoCoador(preparo) {
    if (preparo.massaAguaFiltro) return temperaturaDaMistura(preparo.massaAguaFiltro, preparo.entalpiaFiltro);
    const espera = (preparo.tempo - preparo.ultimaAguaFiltro) * fatorTempo;
    return temperaturaAmbiente + (preparo.temperaturaGota - temperaturaAmbiente) * Math.exp(-espera / resfriamento.borra);
  }

  function calorParaVapor(temperatura) {
    return Math.max(0, (temperatura - limiarVapor) / (100 - limiarVapor));
  }

  function aindaEmiteVapor(preparo) {
    return temperaturaDaMistura(preparo.massaAguaXicara, preparo.entalpiaXicara) > limiarVapor
      || temperaturaDoCoador(preparo) > limiarVapor;
  }

  function estaAgitando(preparo) {
    return preparo.receita.agitacaoAcucar === 'com' && preparo.xicara > 0 && preparo.acucar > 0;
  }

  function calcularResultado(preparo) {
    const { receita, iniciado, xicara } = preparo;
    const camadas = iniciado ? preparo.camadas : receita.cafe ? [criarCamada(receita.forma, receita.cafe)] : [];
    const acucar = iniciado ? preparo.acucar : receita.acucar;
    const massaAcucar = preparo.acucarDissolvido;
    const excesso = acucar - massaAcucar;
    const bebida = xicara + massaAcucar * volumeAcucarDissolvido;
    const volumeSolto = excesso / densidadeAcucarSolto;
    const volumeCristais = excesso / densidadeCristal;
    const espacoNosCristais = volumeSolto - volumeCristais;
    const nivelLiquido = bebida >= espacoNosCristais
      ? bebida + volumeCristais
      : bebida * volumeSolto / espacoNosCristais;
    const cafeNoFiltro = camadas.reduce((massa, camada) => massa + camada.massa, 0);
    const volumeCafe = iniciado ? preparo.volumeCafe : camadas[0]?.volume ?? 0;
    const massaCafe = preparo.cafeinaXicara;
    const volumeLitros = bebida / 1000;
    const cafeina = calcularSoluto(massaCafe / 1000, massasMolares.cafeina, volumeLitros);
    const sacarose = calcularSoluto(massaAcucar, massasMolares.sacarose, volumeLitros);
    const temperatura = temperaturaDaMistura(preparo.massaAguaXicara, preparo.entalpiaXicara);
    const temperaturaFiltro = temperaturaDoCoador(preparo);
    const { diferenca, taxa } = cineticaDoAcucar(preparo, temperatura);
    return {
      temperatura, temperaturaFiltro,
      velocidadeAcucar: Math.max(0, diferenca) * taxa,
      agitandoAcucar: estaAgitando(preparo),
      calorVapor: { filtro: calorParaVapor(temperaturaFiltro), xicara: calorParaVapor(temperatura) },
      temperaturasReservatorios: {
        quente: temperaturaDaDose(receita, 'quente'), fria: temperaturaDaDose(receita, 'fria')
      },
      bebida, camadas, volumeCafe, cafeNoFiltro, acucar,
      massaCafe, massaAcucar, excesso, volumeSolto, nivelLiquido, volumeLitros, cafeina, sacarose,
      razaoMolar: cafeina.n ? sacarose.n / cafeina.n : null,
      fracao: cafeNoFiltro ? massaCafe / (cafeNoFiltro * cafeinaPorGrama) : 0,
      concentracaoCafe: bebida ? massaCafe * 1000 / bebida : 0,
      concentracaoAcucar: bebida ? massaAcucar * 1000 / bebida : 0
    };
  }

  const porId = id => document.getElementById(id);
  const concentracao = porId('concentracao');
  const receitas = porId('receitas');
  const acoes = porId('acoes-comparacao');
  const botaoAmbos = porId('despejar-ambos');
  const reduzirMovimento = matchMedia('(prefers-reduced-motion: reduce)');
  const janelaEstreita = matchMedia('(max-width: 1040px)');
  let comparando = false;
  let ultimoQuadro = 0;
  let ultimoDesenho = 0;
  let animacao = 0;

  function montarReceita(letra, fria) {
    const artigo = porId('modelo-receita').content.firstElementChild.cloneNode(true);
    const elementos = atributo => Object.fromEntries([...artigo.querySelectorAll('[data-' + atributo + ']')]
      .map(elemento => [elemento.getAttribute('data-' + atributo), elemento]));
    const painel = {
      artigo, leituras: elementos('reading'), rotulos: elementos('label'), campos: elementos('field'),
      exatos: elementos('exact'), botoes: elementos('pour'), adicionar: elementos('add'), doses: elementos('dose-row'),
      temperaturas: elementos('temperature'),
      reset: artigo.querySelector('[data-reset]'), figura: artigo.querySelector('figure'),
      calculos: artigo.querySelector('[data-calculos]')
    };
    const { leituras, rotulos, campos, exatos, botoes, reset, figura } = painel;
    const receita = {
      forma: 'moido', coador: 'papel', cafe: 13, acucar: 0, quente: fria ? 0 : 250, fria: fria ? 250 : 0,
      agitacaoAcucar: 'com',
      temperaturaLivre: false, temperaturaQuente: temperaturasPadrao.quente, temperaturaFria: temperaturasPadrao.fria
    };
    painel.visual = criarVisualPreparo(figura.querySelector('canvas'));
    painel.preparo = novoPreparo(receita);
    leituras.titulo.id = 'receita-' + letra;
    leituras.titulo.textContent = 'Receita ' + letra;
    artigo.setAttribute('aria-labelledby', leituras.titulo.id);
    artigo.hidden = fria;
    for (const [nome, campo] of Object.entries(campos)) {
      campo.id = letra + '-' + nome;
      rotulos[nome].htmlFor = campo.id;
      if (leituras[nome]) leituras[nome].setAttribute('for', campo.id);
      if (campo.type === 'checkbox') campo.checked = receita[nome];
      else campo.value = receita[nome];
      campo.addEventListener('input', () => {
        if (campo.type === 'checkbox') painel.preparo.receita[nome] = campo.checked;
        else painel.preparo.receita[nome] = campo.tagName === 'SELECT' ? campo.value : Number(campo.value);
        if (exatos[nome]) exatos[nome].value = campo.value;
        if (nome === 'agitacaoAcucar') rodar();
        else atualizar();
      });
    }
    for (const [nome, entrada] of Object.entries(exatos)) {
      const faixa = campos[nome];
      const molsDaDose = leituras['molsDose-' + nome].closest('output');
      entrada.id = faixa.id + '-gramas';
      molsDaDose.id = faixa.id + '-mols';
      molsDaDose.setAttribute('for', faixa.id + ' ' + entrada.id);
      faixa.setAttribute('aria-describedby', molsDaDose.id);
      entrada.setAttribute('aria-describedby', molsDaDose.id);
      entrada.min = faixa.min;
      entrada.max = faixa.max;
      entrada.step = faixa.step;
      entrada.value = faixa.value;
      entrada.addEventListener('input', () => {
        if (entrada.value && entrada.validity.valid) {
          faixa.value = entrada.value;
          painel.preparo.receita[nome] = Number(faixa.value);
          atualizar();
        }
      });
      entrada.addEventListener('blur', () => {
        if (Number.isFinite(entrada.valueAsNumber)) {
          faixa.value = String(Math.min(Number(entrada.max), Math.max(Number(entrada.min), Math.round(entrada.valueAsNumber))));
          painel.preparo.receita[nome] = Number(faixa.value);
        }
        entrada.value = faixa.value;
        atualizar();
      });
      painel.adicionar[nome].addEventListener('click', evento => {
        adicionarIngrediente(painel.preparo, nome);
        if (evento.detail > 0) mostrarCena(figura);
      });
    }
    for (const origem of origens) {
      botoes[origem].title = botoes[origem].getAttribute('aria-label');
      botoes[origem].addEventListener('click', evento => {
        enfileirarAgua(painel.preparo, [origem]);
        rodar();
        if (evento.detail > 0 && painel.preparo.fila.length === 1) mostrarCena(figura);
      });
    }
    reset.addEventListener('click', () => {
      painel.preparo = novoPreparo(painel.preparo.receita);
      atualizar();
    });
    painel.calculos.addEventListener('toggle', () => {
      if (painel.calculos.open) atualizarCalculos(leituras, calcularResultado(painel.preparo));
    });
    receitas.append(artigo);
    return painel;
  }

  const paineis = [montarReceita('A', false), montarReceita('B', true)];
  const visiveis = () => comparando ? paineis : paineis.slice(0, 1);
  const podeSincronizar = preparo => !preparo.fila.length && origens.some(origem => preparo.receita[origem] > 0);
  const emMovimento = ({ artigo, preparo, visual }) => preparo.fila.length || preparo.filtro > 0 || preparo.impacto > 0.012
    || preparo.adicoes.length || Math.abs(alvoAcucar(preparo) - preparo.acucarDissolvido) > .05
    || origens.some(origem => preparo.chaleiras[origem] > 0)
    || aindaEmiteVapor(preparo)
    || (!reduzirMovimento.matches && (visual.temVapor(preparo)
      || (!concentracao.hidden && !artigo.hidden && estaAgitando(preparo))));

  function emCurso(painel) {
    const { preparo } = painel;
    return emMovimento(painel) || preparo.entalpiaXicara !== preparo.massaAguaXicara * entalpiaAmbiente
      || preparo.acucarDissolvido !== alvoAcucar(preparo);
  }

  function texto(elemento, valor) {
    if (elemento.textContent !== valor) elemento.textContent = valor;
  }

  function atualizarCalculos(leituras, resultado) {
    const litros = numeroQuimico(resultado.volumeLitros) + ' L';
    texto(leituras.volumeCalculo, 'V = ' + numeroQuimico(resultado.bebida) + ' mL = ' + litros);
    for (const nome of ['cafeina', 'sacarose']) {
      const { massaEmGramas, massaMolar, n, molaridade } = resultado[nome];
      const mols = formatarMols(n);
      texto(leituras['n-' + nome], 'n = ' + numeroQuimico(massaEmGramas) + ' g ÷ ('
        + formato(massaMolar, 'g/mol', 4) + ') ≈ ' + mols);
      texto(leituras['c-' + nome], molaridade === null ? 'C — sem bebida'
        : 'C = ' + mols + ' ÷ ' + litros + ' ≈ ' + numeroQuimico(molaridade) + ' mol/L');
    }
    const { cafeina, sacarose, razaoMolar } = resultado;
    texto(leituras.razaoCalculo, razaoMolar === null ? '' : 'n(sacarose) ÷ n(cafeína) = '
      + '(' + formatarMols(sacarose.n) + ') ÷ (' + formatarMols(cafeina.n) + ') ≈ ' + numeroQuimico(razaoMolar));
  }

  function atualizarPainel(painel, resultado) {
    const { preparo, leituras, rotulos, campos, botoes, reset, adicionar, doses } = painel;
    const { receita, iniciado, fila, filtro, xicara } = preparo;
    const { cafeina, sacarose, razaoMolar } = resultado;
    for (const [indice, origem] of origens.entries()) {
      const botao = botoes[origem];
      const temperatura = resultado.temperaturasReservatorios[origem];
      const designacao = receita.temperaturaLivre ? (indice === 0 ? 'A' : 'B') : origem;
      const nome = 'Água ' + designacao;
      const textoBotao = receita.temperaturaLivre ? nome : indice === 0 ? 'Quente' : 'Fria';
      const nomeAcao = 'Despejar água ' + designacao;
      botao.disabled = receita[origem] === 0;
      botao.classList.toggle('cold-button', temperatura < 55);
      if (botao.title !== nomeAcao) {
        botao.setAttribute('aria-label', nomeAcao);
        botao.title = nomeAcao;
      }
      texto(botao, textoBotao);
      texto(leituras['nome-' + origem], nome);
      texto(leituras['temp-' + origem], formato(temperatura, '°C'));
      painel.temperaturas[origem].hidden = !receita.temperaturaLivre;
    }
    reset.disabled = !iniciado;
    doses.cafe.hidden = doses.acucar.hidden = !iniciado;
    adicionar.cafe.disabled = !receita.cafe;
    adicionar.acucar.disabled = !receita.acucar;
    texto(rotulos.cafe, iniciado ? 'Dose de café' : 'Café inicial');
    texto(rotulos.acucar, iniciado ? 'Dose de açúcar' : 'Açúcar inicial');
    for (const nome of ['cafe', 'acucar', ...origens, ...Object.values(campoTemperatura)]) {
      const unidade = nome.startsWith('temperatura') ? '°C' : origens.includes(nome) ? 'mL' : 'g';
      const valor = formato(receita[nome], unidade);
      if (campos[nome].getAttribute('aria-valuetext') !== valor) campos[nome].setAttribute('aria-valuetext', valor);
      texto(leituras[nome], valor);
    }
    texto(leituras['molsDose-cafe'], expressarMols(receita.cafe * cafeinaPorGrama / 1000 / massasMolares.cafeina));
    texto(leituras['molsDose-acucar'], expressarMols(receita.acucar / massasMolares.sacarose));
    texto(leituras.moagem, perfis[receita.forma].descricao);
    texto(leituras.totalCafe, formato(resultado.cafeNoFiltro, 'g') + ' no filtro');
    texto(leituras.totalAcucar, formato(resultado.acucar, 'g') + ' adicionados');
    texto(leituras.aparelho, resultado.cafeNoFiltro ? 'Filtração' : 'Dissolução');
    const outrasDoses = fila.length - 1;
    const avisoFila = outrasDoses > 0 ? ' · ' + outrasDoses + ' na fila' : '';
    const diferenca = alvoAcucar(preparo) - preparo.acucarDissolvido;
    texto(leituras.estado, fila.length ? 'Despejando água ' + fila[0].nome + avisoFila
      : filtro > 0 ? 'Filtro em drenagem'
      : diferenca > .05 ? 'Açúcar dissolvendo'
      : diferenca < -.05 ? 'Açúcar cristalizando'
      : iniciado ? 'Pronto para outra dose' : 'Pronto para começar');
    texto(leituras.filtro, formato(filtro, 'mL'));
    texto(leituras.xicara, formato(xicara, 'mL'));
    texto(leituras.bebida, formato(resultado.bebida, 'mL'));
    texto(leituras.temperatura, xicara ? formato(resultado.temperatura, '°C', 1) : '—');
    texto(leituras.tempoCoagem, preparo.tempoCoagem ? duracaoTexto(preparo.tempoCoagem) : '—');
    texto(leituras.tempoAcucar, tempoAcucarTexto(preparo, resultado));
    const velocidade = resultado.velocidadeAcucar;
    leituras.velocidadeAcucar.hidden = !xicara || !resultado.acucar;
    texto(leituras.velocidadeAcucar, 'Velocidade atual ' + velocidadeTexto(velocidade));
    leituras.velocidadeAlternativa.hidden = velocidade === 0;
    if (velocidade > 0) {
      const semAgitacao = receita.agitacaoAcucar === 'sem';
      const alternativa = semAgitacao ? velocidade / fatorSemAgitacao : velocidade * fatorSemAgitacao;
      texto(leituras.velocidadeAlternativa, (semAgitacao ? 'Se agitar agora, ' : 'Se parar de mexer, ') + velocidadeTexto(alternativa));
    }
    texto(leituras.concentracaoCafe, xicara ? formato(resultado.concentracaoCafe, 'mg/L', 1) : '—');
    texto(leituras.molaridadeCafeina, cafeina.molaridade === null ? '—' : numeroQuimico(cafeina.molaridade) + ' mol/L');
    texto(leituras.massaCafe, formato(resultado.massaCafe, 'mg', 2));
    texto(leituras.molsCafeina, expressarMols(cafeina.n));
    texto(leituras.fracao, xicara && resultado.cafeNoFiltro ? formato(resultado.fracao * 100, '%', 1) : '—');
    texto(leituras.concentracaoAcucar, xicara ? formato(resultado.concentracaoAcucar, 'g/L', 1) : '—');
    texto(leituras.molaridadeSacarose, sacarose.molaridade === null ? '—' : numeroQuimico(sacarose.molaridade) + ' mol/L');
    texto(leituras.massaAcucar, formato(resultado.massaAcucar, 'g', 2));
    texto(leituras.molsSacarose, expressarMols(sacarose.n));
    texto(leituras.excesso, formato(resultado.excesso, 'g', 2));
    texto(leituras.razaoMolar, razaoMolar === null ? (sacarose.n ? 'Sem cafeína' : '—') : numeroQuimico(razaoMolar) + ' : 1');
    if (painel.calculos.open) atualizarCalculos(leituras, resultado);
  }

  function atualizar() {
    const abertas = visiveis().map(painel => ({ painel, resultado: calcularResultado(painel.preparo) }));
    let maiorOcupacao = 0;
    let maiorFiltro = 0;
    for (const { resultado } of abertas) {
      maiorOcupacao = Math.max(maiorOcupacao, resultado.volumeSolto, resultado.nivelLiquido);
      maiorFiltro = Math.max(maiorFiltro, resultado.volumeCafe + capacidadeFiltro);
    }
    // Escala contínua com folga na borda, baseada nos sólidos e líquidos desenhados.
    const escalaXicara = Math.max(300, maiorOcupacao + 50, maiorOcupacao / 0.93);
    // Reserva espaço abaixo da borda e evita um salto visual ao adicionar café.
    const escalaFiltro = Math.max(420, maiorFiltro / 0.92);
    for (const { painel, resultado } of abertas) {
      atualizarPainel(painel, resultado);
      if (!concentracao.hidden) {
        painel.visual.desenhar(painel.preparo, resultado, escalaXicara, escalaFiltro, reduzirMovimento.matches);
      }
    }
    botaoAmbos.disabled = !paineis.every(({ preparo }) => podeSincronizar(preparo));
  }

  function mostrarCena(figura) {
    if (!janelaEstreita.matches) return;
    const { top, bottom } = figura.getBoundingClientRect();
    if (top < 0 || bottom > innerHeight) {
      figura.scrollIntoView({ block: 'center', behavior: reduzirMovimento.matches ? 'auto' : 'smooth' });
    }
  }

  function rodar() {
    atualizar();
    if (!animacao) {
      ultimoQuadro = performance.now();
      animacao = requestAnimationFrame(animar);
    }
  }

  function animar(agora) {
    const dt = Math.min((agora - ultimoQuadro) / 1000, 0.05);
    ultimoQuadro = agora;
    const movimento = paineis.some(emMovimento);
    for (const painel of paineis) {
      if (dt > 0 && emCurso(painel)) avancar(painel.preparo, dt);
    }
    const continua = paineis.some(emCurso);
    if (movimento || !continua || agora - ultimoDesenho >= 200) {
      atualizar();
      ultimoDesenho = agora;
    }
    animacao = continua ? requestAnimationFrame(animar) : 0;
  }

  document.querySelectorAll('input[name=modo]').forEach(opcao => {
    opcao.addEventListener('change', () => {
      comparando = opcao.value === 'comparativo';
      paineis[0].leituras.titulo.hidden = !comparando;
      paineis[1].artigo.hidden = !comparando;
      acoes.hidden = !comparando;
      receitas.classList.toggle('comparing', comparando);
      rodar();
    });
  });
  botaoAmbos.addEventListener('click', evento => {
    if (botaoAmbos.disabled) return;
    for (const { preparo } of paineis) enfileirarAgua(preparo, origens);
    rodar();
    if (evento.detail > 0) mostrarCena(paineis[0].figura);
  });
  document.querySelector('[data-tab="0"]').addEventListener('click', () => requestAnimationFrame(rodar));
  reduzirMovimento.addEventListener('change', rodar);
  paineis[0].leituras.titulo.hidden = true;
  atualizar();
})();
