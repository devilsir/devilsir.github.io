window.SILVIO_CONFIG = {
  modelPath: './assets/model/lucas.glb',
  characters: [
    { id: 'lucas', label: 'Lucas', path: './assets/model/lucas.glb' },
    { id: 'alexandre', label: 'Alexandre', path: './assets/model/alexandre.glb' }
  ],
  finalAudio: '',
  audioFiles: [],
  autoBlink: false,
  blinkMinSeconds: 2.8,
  blinkMaxSeconds: 5.8,
  breastDragStrength: 0.0,
  breastMaxOffset: 0.0,
  breastHitRadiusPx: 0,
  jellyStiffness: 48,
  jellyDamping: 6.4,

  accessoryTransforms: {
    hat: {
      position: [-0.003403332084417343, 0.9347323179244995, 0.044968802481889725],
      quaternion: [0, -0.475876122713089, 0, 0.8795123100280762],
      scale: [1.2053751945495605, 1.20537531375885, 1.2053751945495605]
    },
    shirt: {
      position: [0.018, 0.235, 0.082],
      quaternion: [0, -0.4812147915363312, 0, 0.8766027092933655],
      scale: [1.78, 1.78, 1.78]
    },
    glasses: {
      position: [-0.12674850225448608, 0.5932216644287109, 0.09231123328208923],
      quaternion: [0, -0.5352711081504822, 0, 0.8446803689002991],
      scale: [0.569379985332489, 0.5693800449371338, 0.569379985332489]
    }
  },

  accessoryOcclusion: {
    enabled: false,
    hatHideNodes: [],
    hatHideHairIds: [],
    shirtBodyNodes: []
  },

  accessories: {
    hat: [
      { id: 'bone_azul', label: 'Boné Azul', path: './assets/accessories/chapeus/bone_azul.glb' },
      { id: 'bone_preto', label: 'Boné Preto', path: './assets/accessories/chapeus/bone_preto.glb' },
      { id: 'bucket_vermelho', label: 'Bucket Vermelho', path: './assets/accessories/chapeus/chapeu_bucket_vermelho.glb' },
      { id: 'cowboy_marrom', label: 'Cowboy Marrom', path: './assets/accessories/chapeus/chapeu_cowboy_marrom.glb' },
      { id: 'palha_dourado', label: 'Chapéu de Palha', path: './assets/accessories/chapeus/chapeu_palha_dourado.glb' },
      { id: 'gorro_cinza', label: 'Gorro Cinza', path: './assets/accessories/chapeus/gorro_cinza.glb' }
    ],
    shirt: [
      { id: 'camisa_estampada_vermelha', label: 'Camisa Estampada Vermelha', path: './assets/accessories/camisas/camisa_estampada_vermelha_manga_curta.glb' },
      { id: 'camisa_jeans_azul', label: 'Camisa Jeans Azul', path: './assets/accessories/camisas/camisa_jeans_azul_manga_longa.glb' },
      { id: 'camisa_polo_azul_marinho', label: 'Camisa Polo Azul Marinho', path: './assets/accessories/camisas/camisa_polo_azul_marinho.glb' },
      { id: 'camisa_social_branca', label: 'Camisa Social Branca', path: './assets/accessories/camisas/camisa_social_branca_manga_longa.glb' },
      { id: 'camisa_social_rosa', label: 'Camisa Social Rosa', path: './assets/accessories/camisas/camisa_social_rosa_manga_longa.glb' },
      { id: 'camisa_xadrez_amarela_preta', label: 'Camisa Xadrez Amarela e Preta', path: './assets/accessories/camisas/camisa_xadrez_amarela_preta_manga_longa.glb' }
    ],
    glasses: [
      { id: 'aviador_dourado', label: 'Aviador Dourado', path: './assets/accessories/oculos/oculos_aviador_dourado.glb' },
      { id: 'esportivo_preto', label: 'Esportivo Preto', path: './assets/accessories/oculos/oculos_esportivo_preto.glb' },
      { id: 'quadrado_preto', label: 'Quadrado Preto', path: './assets/accessories/oculos/oculos_quadrado_preto.glb' },
      { id: 'redondo_dourado', label: 'Redondo Dourado', path: './assets/accessories/oculos/oculos_redondo_dourado.glb' },
      { id: 'tartaruga_marrom', label: 'Tartaruga Marrom', path: './assets/accessories/oculos/oculos_tartaruga_marrom.glb' },
      { id: 'transparente_verde', label: 'Transparente Verde', path: './assets/accessories/oculos/oculos_transparente_verde.glb' }
    ]
  },
  accessoryRemovalOrder: ['glasses', 'hat', 'shirt'],

  puzzlePool: [
    { category: 'NATUREZA', phrase: 'CACHOEIRA GELADA' },
    { category: 'NATUREZA', phrase: 'TRILHA NA MATA' },
    { category: 'NATUREZA', phrase: 'PRAIA AO AMANHECER' },
    { category: 'NATUREZA', phrase: 'JARDIM FLORIDO' },
    { category: 'NATUREZA', phrase: 'CHUVA DE VERAO' },
    { category: 'COTIDIANO', phrase: 'MERCADO DO BAIRRO' },
    { category: 'COTIDIANO', phrase: 'CAFE DA MANHA' },
    { category: 'COTIDIANO', phrase: 'PONTO DE ONIBUS' },
    { category: 'COTIDIANO', phrase: 'ROUPA NO VARAL' },
    { category: 'COTIDIANO', phrase: 'ALMOCO EM FAMILIA' },
    { category: 'CASA', phrase: 'SOFA DA SALA' },
    { category: 'CASA', phrase: 'QUARTO ARRUMADO' },
    { category: 'CASA', phrase: 'CHEIRO DE BOLO' },
    { category: 'CASA', phrase: 'MESA DA COZINHA' },
    { category: 'CASA', phrase: 'JANELA ABERTA' },
    { category: 'LAZER', phrase: 'PASSEIO NO PARQUE' },
    { category: 'LAZER', phrase: 'FILME NO DOMINGO' },
    { category: 'LAZER', phrase: 'PIQUENIQUE NO GRAMADO' },
    { category: 'LAZER', phrase: 'BICICLETA NA CICLOVIA' },
    { category: 'LAZER', phrase: 'FOTO DO POR DO SOL' }
  ],
  wheelSegments: [
    { label: '100', value: 100, color: '#ef404a' },
    { label: '500', value: 500, color: '#ffd234' },
    { label: '200', value: 200, color: '#34c96f' },
    { label: '800', value: 800, color: '#f16932' },
    { label: '300', value: 300, color: '#efdf46' },
    { label: 'PASSA', type: 'loseTurn', color: '#ececec' },
    { label: '400', value: 400, color: '#ef404a' },
    { label: '1000', value: 1000, color: '#37c66a' },
    { label: '600', value: 600, color: '#f9ce36' },
    { label: 'PERDE TUDO', type: 'bankrupt', color: '#171717' },
    { label: '250', value: 250, color: '#f56a34' },
    { label: '700', value: 700, color: '#34bf65' },
    { label: '150', value: 150, color: '#f0d63f' },
    { label: '900', value: 900, color: '#ef3f48' },
    { label: '350', value: 350, color: '#f56a34' },
    { label: 'PASSA', type: 'loseTurn', color: '#ececec' },
    { label: '450', value: 450, color: '#37c66a' },
    { label: '750', value: 750, color: '#ffd234' }
  ]
};
