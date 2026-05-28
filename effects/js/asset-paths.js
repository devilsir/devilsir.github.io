window.ASSET_PATHS = {
  modelCatalog: [
    {
      key: 'lucas',
      label: 'Lucas',
      path: './assets/models/lucas.glb',
      character: 'lucas'
    },
    {
      key: 'devilsir_wow',
      label: 'Devilsir (World of Warcraft)',
      path: './assets/models/devilsir_world_of_warcraft.glb',
      character: 'devilsir',
      variant: 'world_of_warcraft'
    },
    {
      key: 'devilsir_runescape',
      label: 'Devilsir (Runescape)',
      path: './assets/models/devilsir_runescape.glb',
      character: 'devilsir',
      variant: 'runescape',
      fitBounds: 'skeleton',
      fitTargetHeight: 1.0,
      runescapeStaffRoot: 'root_51',
      runescapeStaffHandAnchor: 'root_151',
      animationLabels: {
        'Runescape - Animação original': 'Runescape - Animação original',
        'Runescape - Walk curto': 'Runescape - Walk curto',
        'Runescape - Run curto': 'Runescape - Run curto',
        'Runescape - Run rápido': 'Runescape - Run rápido'
      },
      animationSources: [
        {
          path: './assets/models/devilsir_runescape_walk.glb',
          label: 'Runescape - Walk',
          clipLabels: [null, 'Runescape - Walk curto'],
          skipClipIndexes: [0],
          protectRunescapeStaff: true
        },
        {
          path: './assets/models/devilsir_runescape_run.glb',
          label: 'Runescape - Run',
          clipLabels: [null, 'Runescape - Run curto', 'Runescape - Run rápido'],
          skipClipIndexes: [0],
          protectRunescapeStaff: true
        }
      ]
    }
  ],
  petCatalog: [
    {
      key: 'none',
      label: 'Sem pet',
      pets: []
    },
    {
      key: 'apollo',
      label: 'Apollo',
      pets: ['apollo']
    },
    {
      key: 'lilith',
      label: 'Lilith',
      pets: ['lilith']
    },
    {
      key: 'apollo_lilith',
      label: 'Apollo + Lilith',
      pets: ['apollo', 'lilith']
    }
  ],
  pets: {
    apollo: {
      label: 'Apollo',
      path: './assets/models/pet_apollo.glb',
      side: 'left',
      placement: 'nearModel',
      gap: 0.024,
      targetHeight: 0.34,
      position: { y: 0, z: 0 },
      rotationY: 0
    },
    lilith: {
      label: 'Lilith',
      path: './assets/models/pet_lilith.glb',
      side: 'right',
      placement: 'nearModel',
      gap: 0.024,
      targetHeight: 0.31,
      position: { y: 0, z: 0 },
      rotationY: 0
    }
  },
  models: {
    lucas: './assets/models/lucas.glb',
    devilsir_wow: './assets/models/devilsir_world_of_warcraft.glb',
    devilsir_runescape: './assets/models/devilsir_runescape.glb',
    devilsir_runescape_walk: './assets/models/devilsir_runescape_walk.glb',
    devilsir_runescape_run: './assets/models/devilsir_runescape_run.glb',
    devilsir: './assets/models/devilsir_world_of_warcraft.glb',
    sword: './assets/models/sword.glb'
  },
  textures: {
    lava: './assets/lava_texture.png'
  }
};
