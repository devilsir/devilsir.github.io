window.SILVIO_CONFIG = {
  modelPath: './assets/model/silvio.glb',
  finalAudio: './assets/audio/parabens-final.wav',
  audioFiles: [
    './assets/audio/silvio_santos_e_o_bambu_mp3cut.mp3',
    './assets/audio/e-ta-bom.mp3',
    './assets/audio/silvio_santos_diz_que_pena_1_.mp3',
    './assets/audio/nao-consegue-ne-moises-meme_04Iqgj4.mp3',
    './assets/audio/silvio-santos-sera-que-e-bom.mp3',
    './assets/audio/silvio-santos-que-eu-faco.mp3',
    './assets/audio/silvo-santos-erra-desgracado.mp3',
    './assets/audio/e-mesmo-e-verdade-silvio-santos.mp3',
    './assets/audio/silvio-santos-o-seu-tempo-acabou.mp3',
    './assets/audio/tmp9ynyqwxm.mp3',
    './assets/audio/como_ZQTTFwJ.mp3',
    './assets/audio/silvio-santos-nao-naaaaao.mp3',
    './assets/audio/silvio-santos-cala-a-boca.mp3',
    './assets/audio/silvio-santos-erotismo.mp3'
  ],
  autoBlink: true,
  blinkMinSeconds: 2.8,
  blinkMaxSeconds: 5.8,
  breastDragStrength: 0.0034,
  breastMaxOffset: 0.095,
  breastHitRadiusPx: 110,
  jellyStiffness: 48,
  jellyDamping: 6.4,

  accessoryTransforms: {
    hat: {
      position: [-0.003403332084417343, 0.9347323179244995, 0.044968802481889725],
      quaternion: [0, -0.475876122713089, 0, 0.8795123100280762],
      scale: [1.2053751945495605, 1.20537531375885, 1.2053751945495605]
    },
    bra: {
      position: [0.03559240698814392, 0.24869418144226074, 0.12937061488628387],
      quaternion: [0, -0.4812147915363312, 0, 0.8766027092933655],
      scale: [2.0424916744232178, 2.0424911975860596, 2.0424916744232178]
    },
    glasses: {
      position: [-0.12674850225448608, 0.5932216644287109, 0.09231123328208923],
      quaternion: [0, -0.5352711081504822, 0, 0.8446803689002991],
      scale: [0.569379985332489, 0.5693800449371338, 0.569379985332489]
    }
  },

  accessoryOcclusion: {
    enabled: false,
    hatHideNodes: ['tripo_part_1', 'tripo_part_8', 'tripo_part_10'],
    hatHideHairIds: ['bone_azul', 'bone_preto', 'bucket_vermelho', 'gorro_cinza'],
    braBodyNodes: ['tripo_part_0', 'tripo_part_21']
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
    bra: [
      { id: 'sutia_azul_renda', label: 'Sutiã Azul de Renda', path: './assets/accessories/sutias/sutia_azul_renda.glb' },
      { id: 'sutia_bege', label: 'Sutiã Bege', path: './assets/accessories/sutias/sutia_bege.glb' },
      { id: 'sutia_branco_renda', label: 'Sutiã Branco de Renda', path: './assets/accessories/sutias/sutia_branco_renda.glb' },
      { id: 'sutia_preto', label: 'Sutiã Preto', path: './assets/accessories/sutias/sutia_preto.glb' },
      { id: 'sutia_vermelho_renda', label: 'Sutiã Vermelho de Renda', path: './assets/accessories/sutias/sutia_vermelho_renda.glb' },
      { id: 'top_esportivo_rosa', label: 'Top Esportivo Rosa', path: './assets/accessories/sutias/top_esportivo_rosa.glb' }
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
  accessoryRemovalOrder: ['glasses', 'hat', 'bra'],

  puzzlePool: [
    { category: 'PEITÕES', phrase: 'DECOTE NUCLEAR' },
    { category: 'PEITÕES', phrase: 'PEITAO DE IMPACTO' },
    { category: 'PEITÕES', phrase: 'SILICONE DE GUERRA' },
    { category: 'PEITÕES', phrase: 'SEIOS TURBINADOS' },
    { category: 'PEITÕES', phrase: 'COMISSAO DE PEITAO' },
    { category: 'DIVA POP', phrase: 'LADY GAGA' },
    { category: 'DIVA POP', phrase: 'MADONNA SAFADA' },
    { category: 'DIVA POP', phrase: 'DIVA POP SEM LIMITE' },
    { category: 'DIVA POP', phrase: 'REINHA DO PLAYBACK' },
    { category: 'DIVA POP', phrase: 'VOCAL DE MILHOES' },
    { category: 'PAUZÃO', phrase: 'MANDIOCA GIGANTE' },
    { category: 'PAUZÃO', phrase: 'PAUZAO CENOGRAFICO' },
    { category: 'PAUZÃO', phrase: 'BERIMBAU MONSTRO' },
    { category: 'PAUZÃO', phrase: 'TROLHA DE RESPEITO' },
    { category: 'PAUZÃO', phrase: 'MALA DE CARNAVAL' },
    { category: 'DROGAS', phrase: 'BALA DO ROLE' },
    { category: 'DROGAS', phrase: 'ERVA DA FESTA' },
    { category: 'DROGAS', phrase: 'POZINHO MISTERIOSO' },
    { category: 'DROGAS', phrase: 'DOCIDINHO QUIMICO' },
    { category: 'DROGAS', phrase: 'TRAGO ALUCINADO' }
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
