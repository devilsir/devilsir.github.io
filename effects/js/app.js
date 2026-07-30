const app = document.getElementById('app')
const loading = document.getElementById('loading')
const modelSelect = document.getElementById('modelSelect')
const animationSelect = document.getElementById('animationSelect')
const searchInput = document.getElementById('search')
const playBtn = document.getElementById('playBtn')
const prevBtn = document.getElementById('prevBtn')
const nextBtn = document.getElementById('nextBtn')
const fxOnlyBtn = document.getElementById('fxOnlyBtn')
const resetCamBtn = document.getElementById('resetCamBtn')
const fxModeSelect = document.getElementById('fxMode')
const handItemModeSelect = document.getElementById('handItemMode')
const petModeSelect = document.getElementById('petMode')
const petAnimationModeSelect = document.getElementById('petAnimationMode')
const qualityModeSelect = document.getElementById('qualityMode')
const sceneModeSelect = document.getElementById('sceneMode')
const lightingModeSelect = document.getElementById('lightingMode')
const ambienceModeSelect = document.getElementById('ambienceMode')
const speedRange = document.getElementById('speedRange')
const currentAnimBadge = document.getElementById('currentAnimBadge')
const currentFxBadge = document.getElementById('currentFxBadge')

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
if ('outputEncoding' in renderer && THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding
if ('toneMapping' in renderer && THREE.ACESFilmicToneMapping) renderer.toneMapping = THREE.ACESFilmicToneMapping
if ('toneMappingExposure' in renderer) renderer.toneMappingExposure = 0.84
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
app.appendChild(renderer.domElement)

const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0x09101a, 5.5, 19)

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.01, 100)
const cameraControl = {
  target: new THREE.Vector3(0, 1.0, 0),
  yaw: 0.35,
  pitch: 0.12,
  distance: 3.5,
  targetYaw: 0.35,
  targetPitch: 0.12,
  targetDistance: 3.5,
  dragging: false,
  lastX: 0,
  lastY: 0
}

function updateCameraController(force = false) {
  const lerp = force ? 1 : 0.12
  cameraControl.yaw += (cameraControl.targetYaw - cameraControl.yaw) * lerp
  cameraControl.pitch += (cameraControl.targetPitch - cameraControl.pitch) * lerp
  cameraControl.distance += (cameraControl.targetDistance - cameraControl.distance) * lerp
  const cp = Math.cos(cameraControl.pitch)
  camera.position.set(
    cameraControl.target.x + Math.sin(cameraControl.yaw) * cp * cameraControl.distance,
    cameraControl.target.y + Math.sin(cameraControl.pitch) * cameraControl.distance,
    cameraControl.target.z + Math.cos(cameraControl.yaw) * cp * cameraControl.distance
  )
  camera.lookAt(cameraControl.target)
}

function resetCameraView() {
  cameraControl.targetYaw = 0.35
  cameraControl.targetPitch = 0.12
  cameraControl.targetDistance = 3.5
  updateCameraController(true)
}

function applyQualityMode(mode) {
  performanceMode = mode === 'performance'
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, performanceMode ? 0.85 : 2))
  renderer.shadowMap.enabled = !performanceMode
  key.castShadow = !performanceMode
  if (!performanceMode) {
    key.shadow.mapSize.width = 1024
    key.shadow.mapSize.height = 1024
  } else {
    key.shadow.mapSize.width = 512
    key.shadow.mapSize.height = 512
  }
  platformGlow.visible = !performanceMode
  refreshEnvironmentLighting(true)
  refreshAmbientDetailDensity()
}

function pickCenterBone(root) {
  const priority = ['Hips', 'hips', 'mixamorigHips', 'pelvis', 'Pelvis', 'Root', 'root', 'Spine', 'spine']
  let fallback = null
  root.traverse(obj => {
    if (!obj.isBone) return
    if (!fallback) fallback = obj
    const name = obj.name || ''
    for (let i = 0; i < priority.length; i++) {
      if (name === priority[i] || name.includes(priority[i])) {
        fallback = obj
        return
      }
    }
  })
  return fallback
}

function stabilizeCharacterOnPlatform() {
  if (!modelPivot || !centerBone) return
  centerBone.getWorldPosition(tmpVecA)
  modelPivot.position.x -= tmpVecA.x
  modelPivot.position.z -= tmpVecA.z
}

renderer.domElement.addEventListener('pointerdown', event => {
  cameraControl.dragging = true
  cameraControl.lastX = event.clientX
  cameraControl.lastY = event.clientY
  renderer.domElement.setPointerCapture(event.pointerId)
})
renderer.domElement.addEventListener('pointermove', event => {
  if (!cameraControl.dragging) return
  const dx = event.clientX - cameraControl.lastX
  const dy = event.clientY - cameraControl.lastY
  cameraControl.lastX = event.clientX
  cameraControl.lastY = event.clientY
  cameraControl.targetYaw -= dx * 0.006
  cameraControl.targetPitch -= dy * 0.0046
  cameraControl.targetPitch = Math.max(-0.52, Math.min(0.78, cameraControl.targetPitch))
})
renderer.domElement.addEventListener('pointerup', event => {
  cameraControl.dragging = false
  try { renderer.domElement.releasePointerCapture(event.pointerId) } catch (e) {}
})
renderer.domElement.addEventListener('wheel', event => {
  event.preventDefault()
  cameraControl.targetDistance += event.deltaY * 0.0021
  cameraControl.targetDistance = Math.max(1.25, Math.min(7.8, cameraControl.targetDistance))
}, { passive: false })

const hemi = new THREE.HemisphereLight(0xcce1ff, 0x161a21, 1.35)
scene.add(hemi)
const key = new THREE.DirectionalLight(0xffffff, 2.4)
key.position.set(2.8, 4.2, 3.2)
key.castShadow = true
key.shadow.mapSize.width = 1024
key.shadow.mapSize.height = 1024
key.shadow.camera.near = 0.1
key.shadow.camera.far = 16
scene.add(key)
const fill = new THREE.DirectionalLight(0x7db1ff, 1.25)
fill.position.set(-2.4, 2.2, -2.2)
scene.add(fill)
const platformAmbient = new THREE.PointLight(0x5c78ff, 0.5, 6)
platformAmbient.position.set(0, 0.6, 0)
scene.add(platformAmbient)

const platformGroup = new THREE.Group()
scene.add(platformGroup)
const environmentRoot = new THREE.Group()
environmentRoot.name = 'EnvironmentRoot'
scene.add(environmentRoot)
const platformBase = new THREE.Mesh(
  new THREE.CylinderGeometry(1.28, 1.38, 0.16, 64, 1, false),
  new THREE.MeshStandardMaterial({ color: 0x111a28, roughness: 0.78, metalness: 0.2 })
)
platformBase.receiveShadow = true
platformBase.position.y = 0.08
platformGroup.add(platformBase)
const platformTop = new THREE.Mesh(
  new THREE.CylinderGeometry(1.2, 1.24, 0.03, 64),
  new THREE.MeshStandardMaterial({ color: 0x1d2a42, emissive: 0x152238, emissiveIntensity: 0.55, roughness: 0.45, metalness: 0.28 })
)
platformTop.position.y = 0.165
platformTop.receiveShadow = true
platformGroup.add(platformTop)
const platformGlow = new THREE.Mesh(
  new THREE.TorusGeometry(1.1, 0.028, 18, 72),
  new THREE.MeshBasicMaterial({ color: 0x6ca6ff, transparent: true, opacity: 0.55 })
)
platformGlow.rotation.x = Math.PI / 2
platformGlow.position.y = 0.181
platformGroup.add(platformGlow)

let modelPivot = null
let modelRoot = null
let mixer = null
let centerBone = null
let lavaUpdateAccumulator = 0
let activeAction = null
let activeClip = null
let animations = []
let allAnimationNames = []
let filteredAnimationNames = []
let hands = { left: null, right: null, rightForearm: null }
let headBone = null
let leftEyeNode = null
let rightEyeNode = null
let lucasEyeMaterials = []
let lucasActiveEyeColor = 0xffffff
let swordOffsetQuat = new THREE.Quaternion()
let currentFxType = 'none'
let handAccessoryState = { current: 'none', swordWrapper: null, swordLoaded: false, swordLoading: false }
let petState = {
  current: 'none',
  group: null,
  token: 0,
  instances: [],
  animationMode: 'auto',
  autoStep: 0,
  autoTimer: 0
}
let environmentState = {
  currentScene: 'studio',
  lightingMode: 'auto',
  ambienceMode: 'full',
  groups: {},
  swayItems: [],
  ambientParticles: [],
  ambientParticleGroup: null,
  characterFootprints: [],
  petFootprints: [],
  dustPuffs: [],
  cycleTime: 0,
  charStepTimer: 0,
  petStepTimer: 0,
  charFootSide: 1,
  petFootSide: 1,
  groundY: 0.185
}
let performanceMode = false
let currentModelKey = 'lucas'
let devilsirSwordMeshes = []
let devilsirShoulderReplacements = []
let runescapeStaffMeshes = []
let runescapeStaffReplacements = []
let runescapeStaffOffsetState = null
let runescapeStaffAnchorState = null
let autoFxMap = {}
let playState = true
let fxOnlyMode = false
let effectClock = 0
let lastEffectBurst = 0
const clock = new THREE.Clock()

const effectGroups = {
  fire: new THREE.Group(),
  ice: new THREE.Group(),
  lightning: new THREE.Group(),
  wind: new THREE.Group(),
  lava: new THREE.Group(),
  earth: new THREE.Group(),
  water: new THREE.Group(),
  shadow: new THREE.Group(),
  light: new THREE.Group(),
  crystal: new THREE.Group(),
  void: new THREE.Group()
}
Object.values(effectGroups).forEach(group => scene.add(group))

const fireProjectiles = []
const iceProjectiles = []
const lightningBursts = []
const windBursts = []
const lavaPool = { initialized: false, projectileItems: [], puddleItems: [], dripItems: [], nextProjectile: 0, nextPuddle: 0, nextDrip: 0 }
const earthProjectiles = []
const waterProjectiles = []
const shadowProjectiles = []
const lightProjectiles = []
const crystalProjectiles = []
const voidBursts = []
const trailParticles = []
const fxLights = []

const tmpVecA = new THREE.Vector3()
const tmpVecB = new THREE.Vector3()
const tmpVecC = new THREE.Vector3()
const tmpQuat = new THREE.Quaternion()

function createCanvasTexture(drawFn, size = 128) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  drawFn(ctx, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  texture.flipY = false
  return texture
}

const environmentTextures = {
  softShadow: createCanvasTexture((ctx, size) => {
    const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size * 0.48)
    g.addColorStop(0, 'rgba(0,0,0,0.46)')
    g.addColorStop(0.55, 'rgba(0,0,0,0.18)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }),
  dust: createCanvasTexture((ctx, size) => {
    const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.05, size / 2, size / 2, size * 0.45)
    g.addColorStop(0, 'rgba(255,255,255,0.85)')
    g.addColorStop(0.4, 'rgba(255,255,255,0.28)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
  }),
  footprint: createCanvasTexture((ctx, size) => {
    ctx.clearRect(0, 0, size, size)
    ctx.fillStyle = 'rgba(55, 44, 36, 0.88)'
    ctx.translate(size / 2, size / 2)
    ctx.rotate(-0.18)
    ctx.beginPath()
    ctx.ellipse(-16, 8, 14, 34, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(16, -8, 14, 34, 0, 0, Math.PI * 2)
    ctx.fill()
  }),
  paw: createCanvasTexture((ctx, size) => {
    ctx.clearRect(0, 0, size, size)
    ctx.fillStyle = 'rgba(55, 44, 36, 0.9)'
    const pads = [
      [64, 74, 18, 14],
      [42, 42, 9, 12],
      [58, 30, 9, 12],
      [74, 30, 9, 12],
      [90, 42, 9, 12]
    ]
    pads.forEach(([x, y, rx, ry]) => {
      ctx.beginPath()
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
      ctx.fill()
    })
  })
}

function createStandardMaterial(color, roughness = 0.88, metalness = 0.08, emissive = 0x000000, emissiveIntensity = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity })
}

function createGroundCircle(color, radius = 5, y = 0.18, segments = 56, roughness = 0.96) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, segments),
    new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.03 })
  )
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = y
  mesh.receiveShadow = true
  return mesh
}

function createSoftShadowMesh(scaleX = 1.15, scaleZ = 0.68, opacity = 0.34) {
  const material = new THREE.MeshBasicMaterial({
    map: environmentTextures.softShadow,
    transparent: true,
    opacity,
    depthWrite: false,
    color: 0x000000
  })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(scaleX, scaleZ), material)
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = 0.182
  mesh.renderOrder = 2
  return mesh
}

function createPetShadowMesh(scale = 0.34, opacity = 0.25) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(scale, scale * 0.72),
    new THREE.MeshBasicMaterial({ map: environmentTextures.softShadow, transparent: true, opacity, depthWrite: false, color: 0x000000 })
  )
  mesh.rotation.x = -Math.PI / 2
  mesh.position.y = 0.184
  mesh.renderOrder = 2
  return mesh
}

function createGrassBlade(color = 0x73ba61, width = 0.06, height = 0.24) {
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, width * 0.2),
    createStandardMaterial(color, 0.96, 0.02)
  )
  blade.position.y = height * 0.5
  blade.castShadow = true
  blade.receiveShadow = true
  return blade
}

function createGrassClump(color = 0x73ba61, detail = 1) {
  const group = new THREE.Group()
  const bladeCount = detail > 0.7 ? 4 : 3
  for (let i = 0; i < bladeCount; i++) {
    const blade = createGrassBlade(color, 0.05 + Math.random() * 0.03, 0.18 + Math.random() * 0.11)
    blade.rotation.y = (Math.PI / bladeCount) * i + Math.random() * 0.6
    blade.position.x = (Math.random() - 0.5) * 0.05
    blade.position.z = (Math.random() - 0.5) * 0.05
    group.add(blade)
  }
  return group
}

function createFlower(color = 0xffe071, petal = 0xff8fd0) {
  const group = new THREE.Group()
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.16, 5), createStandardMaterial(0x5ea14b, 0.98, 0.02))
  stem.position.y = 0.08
  group.add(stem)
  const center = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 10), createStandardMaterial(color, 0.88, 0.02, color, 0.1))
  center.position.y = 0.165
  group.add(center)
  for (let i = 0; i < 5; i++) {
    const petalMesh = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 8), createStandardMaterial(petal, 0.9, 0.02))
    const angle = (Math.PI * 2 * i) / 5
    petalMesh.scale.set(1.2, 0.7, 1.2)
    petalMesh.position.set(Math.cos(angle) * 0.035, 0.165, Math.sin(angle) * 0.035)
    group.add(petalMesh)
  }
  return group
}

function registerSway(item, axis = 'z', amplitude = 0.06, speed = 1.1) {
  environmentState.swayItems.push({ item, axis, amplitude, speed, phase: Math.random() * Math.PI * 2, baseRotation: item.rotation[axis] })
}

function createTree(options = {}) {
  const trunkColor = options.trunkColor || 0x7b5536
  const leafColor = options.leafColor || 0x6ab562
  const scale = options.scale || 1
  const group = new THREE.Group()
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * scale, 0.14 * scale, 1.05 * scale, 6), createStandardMaterial(trunkColor, 0.96, 0.03))
  trunk.position.y = 0.18 + 0.52 * scale
  trunk.castShadow = true
  trunk.receiveShadow = true
  group.add(trunk)
  const foliageHolder = new THREE.Group()
  foliageHolder.position.y = 0.18 + 1.02 * scale
  const foliageA = new THREE.Mesh(new THREE.ConeGeometry(0.68 * scale, 0.78 * scale, 7), createStandardMaterial(leafColor, 0.94, 0.02))
  foliageA.position.y = 0.22 * scale
  foliageA.castShadow = true
  foliageA.receiveShadow = true
  foliageHolder.add(foliageA)
  const foliageB = new THREE.Mesh(new THREE.ConeGeometry(0.48 * scale, 0.58 * scale, 7), createStandardMaterial(leafColor, 0.94, 0.02))
  foliageB.position.y = 0.62 * scale
  foliageB.castShadow = true
  foliageB.receiveShadow = true
  foliageHolder.add(foliageB)
  group.add(foliageHolder)
  registerSway(foliageHolder, 'z', 0.035 * scale, 0.9 + Math.random() * 0.4)
  return group
}

function createRock(color = 0x7f8791, scale = 1) {
  const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.17 * scale, 0), createStandardMaterial(color, 1, 0.02))
  mesh.scale.set(1.2, 0.8, 0.95)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function scatterGroundDecor(group, options = {}) {
  const radius = options.radius || 3.8
  const grassCount = options.grassCount || 26
  const flowerCount = options.flowerCount || 8
  const rockCount = options.rockCount || 5
  for (let i = 0; i < grassCount; i++) {
    const clump = createGrassClump(options.grassColor || 0x73ba61, options.detail || 1)
    const angle = Math.random() * Math.PI * 2
    const dist = 0.8 + Math.random() * radius
    clump.position.set(Math.cos(angle) * dist, 0.18, Math.sin(angle) * dist)
    clump.rotation.y = Math.random() * Math.PI
    registerSway(clump, 'z', 0.07, 1 + Math.random() * 0.7)
    group.add(clump)
  }
  for (let i = 0; i < flowerCount; i++) {
    const flower = createFlower(i % 2 ? 0xffec78 : 0xffffff, i % 2 ? 0xff8fd0 : 0x94b8ff)
    const angle = Math.random() * Math.PI * 2
    const dist = 0.95 + Math.random() * radius * 0.85
    flower.position.set(Math.cos(angle) * dist, 0.18, Math.sin(angle) * dist)
    flower.rotation.y = Math.random() * Math.PI
    registerSway(flower, 'z', 0.03, 1.4 + Math.random() * 0.4)
    group.add(flower)
  }
  for (let i = 0; i < rockCount; i++) {
    const rock = createRock(options.rockColor || 0x7f8791, 0.8 + Math.random() * 0.9)
    const angle = Math.random() * Math.PI * 2
    const dist = 1.2 + Math.random() * radius * 0.88
    rock.position.set(Math.cos(angle) * dist, 0.28, Math.sin(angle) * dist)
    rock.rotation.set(Math.random() * 0.2, Math.random() * Math.PI, Math.random() * 0.2)
    group.add(rock)
  }
}

function createGardenScene() {
  const group = new THREE.Group()
  group.name = 'GardenScene'
  const ground = createGroundCircle(0x6ea85b, 5.6)
  group.add(ground)
  const grassTint = new THREE.Mesh(new THREE.RingGeometry(0.95, 5.1, 48), new THREE.MeshStandardMaterial({ color: 0x5f954f, roughness: 1, metalness: 0 }))
  grassTint.rotation.x = -Math.PI / 2
  grassTint.position.y = 0.181
  grassTint.receiveShadow = true
  group.add(grassTint)
  const path = new THREE.Mesh(new THREE.RingGeometry(1.55, 2.4, 42), new THREE.MeshStandardMaterial({ color: 0xb49468, roughness: 1, metalness: 0 }))
  path.rotation.x = -Math.PI / 2
  path.position.y = 0.182
  path.receiveShadow = true
  group.add(path)
  scatterGroundDecor(group, { radius: 4.2, grassCount: 34, flowerCount: 12, rockCount: 5, detail: 1, grassColor: 0x6cb45a, rockColor: 0x77818b })
  const treePositions = [[-2.9, -2.0], [3.2, -1.6], [-3.4, 2.4], [2.6, 2.5]]
  treePositions.forEach(([x, z], index) => {
    const tree = createTree({ scale: 0.85 + index * 0.05, leafColor: index % 2 ? 0x5ea15b : 0x75bb67, trunkColor: 0x7b5536 })
    tree.position.set(x, 0, z)
    tree.rotation.y = Math.random() * Math.PI
    group.add(tree)
  })
  return group
}

function createForestScene() {
  const group = new THREE.Group()
  group.name = 'ForestScene'
  const ground = createGroundCircle(0x405f3d, 6.3)
  group.add(ground)
  const moss = new THREE.Mesh(new THREE.RingGeometry(2.0, 5.5, 64), new THREE.MeshStandardMaterial({ color: 0x314f36, roughness: 1, metalness: 0 }))
  moss.rotation.x = -Math.PI / 2
  moss.position.y = 0.181
  moss.receiveShadow = true
  group.add(moss)
  scatterGroundDecor(group, { radius: 4.9, grassCount: 42, flowerCount: 6, rockCount: 9, grassColor: 0x4d8e49, rockColor: 0x555f68, detail: 1 })
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8 + (i % 2) * 0.12
    const dist = 4.1 + (i % 3) * 0.55
    const tree = createTree({ scale: 0.9 + Math.random() * 0.2, leafColor: i % 2 ? 0x446d43 : 0x5a8a52, trunkColor: 0x6b482a })
    tree.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist)
    tree.rotation.y = Math.random() * Math.PI
    group.add(tree)
  }
  return group
}

function createRoomScene() {
  const group = new THREE.Group()
  group.name = 'RoomScene'
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd3c4b4, roughness: 1, metalness: 0 })
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 0.08, 48), new THREE.MeshStandardMaterial({ color: 0x685243, roughness: 0.98, metalness: 0.02 }))
  floor.position.y = 0.14
  floor.receiveShadow = true
  group.add(floor)
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.02, 40), new THREE.MeshStandardMaterial({ color: 0xb08263, roughness: 0.95, metalness: 0 }))
  rug.position.y = 0.19
  rug.receiveShadow = true
  group.add(rug)
  const rugCenter = new THREE.Mesh(new THREE.CylinderGeometry(1.28, 1.28, 0.012, 36), new THREE.MeshStandardMaterial({ color: 0xe7d8c5, roughness: 0.96, metalness: 0 }))
  rugCenter.position.y = 0.201
  rugCenter.receiveShadow = true
  group.add(rugCenter)
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(8.4, 3.4, 0.16), wallMat)
  backWall.position.set(0, 1.88, -3.95)
  backWall.receiveShadow = true
  group.add(backWall)
  const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.16, 3.4, 7.6), wallMat)
  sideWall.position.set(-4.12, 1.88, 0)
  sideWall.receiveShadow = true
  group.add(sideWall)

  const windowFrame = new THREE.Group()
  windowFrame.position.set(-4.02, 2.0, 0.25)
  const frameOuter = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.12, 1.82), createStandardMaterial(0xf0eadf, 0.9, 0.02))
  const frameH = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 1.82), createStandardMaterial(0xf0eadf, 0.9, 0.02))
  const frameMid = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.12, 0.08), createStandardMaterial(0xf0eadf, 0.9, 0.02))
  const glassTop = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.48, 0.84), new THREE.MeshStandardMaterial({ color: 0xb6d2ea, roughness: 0.08, metalness: 0.02, transparent: true, opacity: 0.38 }))
  const glassBottom = glassTop.clone()
  glassTop.position.set(0, 0.28, -0.01)
  glassBottom.position.set(0, -0.28, -0.01)
  windowFrame.add(frameOuter, frameH, frameMid, glassTop, glassBottom)
  group.add(windowFrame)

  const bed = new THREE.Group()
  bed.position.set(-2.55, 0.18, 1.7)
  const bedBase = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.38, 2.55), createStandardMaterial(0x8a6548, 0.92, 0.04))
  bedBase.position.y = 0.19
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.24, 2.35), createStandardMaterial(0xf1e8dc, 0.98, 0.01))
  mattress.position.y = 0.46
  const blanket = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.12, 1.44), createStandardMaterial(0x7e95b8, 0.96, 0.02))
  blanket.position.set(0, 0.57, 0.42)
  const pillowA = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.13, 0.38), createStandardMaterial(0xffffff, 0.96, 0.01))
  const pillowB = pillowA.clone()
  pillowA.position.set(-0.38, 0.58, -0.78)
  pillowB.position.set(0.38, 0.58, -0.78)
  const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.9, 0.14), createStandardMaterial(0x6b4b34, 0.9, 0.04))
  headboard.position.set(0, 0.66, -1.18)
  bed.add(bedBase, mattress, blanket, pillowA, pillowB, headboard)
  group.add(bed)

  const bedside = new THREE.Group()
  bedside.position.set(-1.28, 0.18, 1.62)
  const bedsideBox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.56, 0.42), createStandardMaterial(0x8b6648, 0.92, 0.04))
  bedsideBox.position.y = 0.28
  const bedsideLampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.28, 8), createStandardMaterial(0x94806d, 0.72, 0.08))
  bedsideLampStem.position.set(0, 0.72, 0)
  const bedsideLampShade = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 16, 1, true), createStandardMaterial(0xf1dfc4, 0.88, 0.02, 0xf5cd84, 0.1))
  bedsideLampShade.position.set(0, 0.9, 0)
  bedsideLampShade.rotation.x = Math.PI
  bedside.add(bedsideBox, bedsideLampStem, bedsideLampShade)
  group.add(bedside)

  const desk = new THREE.Group()
  desk.position.set(-1.1, 0.18, -3.18)
  const deskTop = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.09, 0.7), createStandardMaterial(0x916943, 0.9, 0.05))
  deskTop.position.y = 0.74
  desk.add(deskTop)
  ;[[-0.72,-0.25],[0.72,-0.25],[-0.72,0.25],[0.72,0.25]].forEach(([x,z]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.08), createStandardMaterial(0x765439, 0.9, 0.05))
    leg.position.set(x, 0.36, z)
    desk.add(leg)
  })
  const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.4, 0.05), createStandardMaterial(0x1d2430, 0.62, 0.2, 0x9db7ff, 0.12))
  monitor.position.set(0.18, 1.01, -0.12)
  const monitorStem = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.06), createStandardMaterial(0x5b6471, 0.7, 0.15))
  monitorStem.position.set(0.18, 0.82, -0.12)
  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.03, 0.18), createStandardMaterial(0xd6d9df, 0.72, 0.06))
  keyboard.position.set(0.18, 0.785, 0.14)
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12), createStandardMaterial(0xd7c6b2, 0.88, 0.03))
  mug.position.set(-0.48, 0.82, -0.08)
  const deskBooks = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.18), createStandardMaterial(0x7b9d5c, 0.92, 0.02))
  deskBooks.position.set(-0.25, 0.79, 0.08)
  desk.add(monitor, monitorStem, keyboard, mug, deskBooks)
  group.add(desk)

  const chair = new THREE.Group()
  chair.position.set(-1.08, 0.18, -2.25)
  chair.rotation.y = Math.PI
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.08, 0.54), createStandardMaterial(0x6a80a8, 0.95, 0.02))
  seat.position.y = 0.48
  const backRest = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.58, 0.08), createStandardMaterial(0x61779f, 0.95, 0.02))
  backRest.position.set(0, 0.78, -0.23)
  const chairBase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.44, 8), createStandardMaterial(0x5f6672, 0.72, 0.12))
  chairBase.position.y = 0.24
  const chairFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.05, 0.04, 5), createStandardMaterial(0x5a6270, 0.72, 0.12))
  chairFoot.position.y = 0.02
  chair.add(seat, backRest, chairBase, chairFoot)
  group.add(chair)

  const shelf = new THREE.Group()
  shelf.position.set(2.95, 0.18, -3.1)
  for (let i = 0; i < 4; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.34), createStandardMaterial(0x916743, 0.93, 0.04))
    plank.position.set(0, 0.45 + i * 0.42, 0)
    plank.castShadow = true
    plank.receiveShadow = true
    shelf.add(plank)
  }
  const sideA = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.92, 0.24), createStandardMaterial(0x7e5c3c, 0.93, 0.04))
  const sideB = sideA.clone()
  sideA.position.set(-0.61, 0.98, 0)
  sideB.position.set(0.61, 0.98, 0)
  shelf.add(sideA, sideB)
  for (let i = 0; i < 14; i++) {
    const book = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22 + Math.random() * 0.08, 0.22), createStandardMaterial([0x5e88c6, 0xc26e5a, 0x7b9d5c, 0xd0b063, 0x8f68b7][i % 5], 0.92, 0.02))
    book.position.set(-0.48 + (i % 6) * 0.19, 0.6 + Math.floor(i / 6) * 0.42, 0.02)
    book.rotation.z = (Math.random() - 0.5) * 0.12
    shelf.add(book)
  }
  group.add(shelf)

  const dresser = new THREE.Group()
  dresser.position.set(3.15, 0.18, 2.7)
  dresser.rotation.y = -Math.PI / 2
  const dresserBody = new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.05, 0.44), createStandardMaterial(0x8f6646, 0.92, 0.04))
  dresserBody.position.y = 0.52
  dresser.add(dresserBody)
  for (let i = 0; i < 3; i++) {
    const gap = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.46), createStandardMaterial(0x735138, 0.95, 0.04))
    gap.position.set(0, 0.33 + i * 0.28, 0)
    dresser.add(gap)
    const handleA = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.03), createStandardMaterial(0xd8c4a3, 0.45, 0.2))
    const handleB = handleA.clone()
    handleA.position.set(-0.18, 0.25 + i * 0.28, 0.24)
    handleB.position.set(0.18, 0.25 + i * 0.28, 0.24)
    dresser.add(handleA, handleB)
  }
  const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.98, 0.07), createStandardMaterial(0xe7dbc8, 0.9, 0.02))
  mirrorFrame.position.set(0, 1.6, -0.01)
  const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.76, 0.03), new THREE.MeshStandardMaterial({ color: 0xc8d7e6, roughness: 0.18, metalness: 0.04 }))
  mirror.position.set(0, 1.6, 0.02)
  dresser.add(mirrorFrame, mirror)
  group.add(dresser)

  const sofa = new THREE.Group()
  sofa.position.set(2.2, 0.18, 0.55)
  sofa.rotation.y = Math.PI
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.46, 0.9), createStandardMaterial(0x5f7197, 0.95, 0.02))
  base.position.y = 0.23
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.72, 0.24), createStandardMaterial(0x54668c, 0.95, 0.02))
  back.position.set(0, 0.58, -0.33)
  const armA = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.44, 0.82), createStandardMaterial(0x4c5e83, 0.95, 0.02))
  const armB = armA.clone()
  armA.position.set(-0.78, 0.22, 0)
  armB.position.set(0.78, 0.22, 0)
  const cushionA = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.18, 0.5), createStandardMaterial(0xe9dccb, 0.95, 0.01))
  const cushionB = cushionA.clone()
  cushionA.position.set(-0.42, 0.43, 0.02)
  cushionB.position.set(0.42, 0.43, 0.02)
  sofa.add(base, back, armA, armB, cushionA, cushionB)
  group.add(sofa)

  const coffeeTable = new THREE.Group()
  coffeeTable.position.set(2.2, 0.18, 1.8)
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.08, 0.62), createStandardMaterial(0x8a6648, 0.9, 0.05))
  tableTop.position.y = 0.42
  coffeeTable.add(tableTop)
  ;[[-0.42,-0.22],[0.42,-0.22],[-0.42,0.22],[0.42,0.22]].forEach(([x,z]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.08), createStandardMaterial(0x6f5037, 0.9, 0.05))
    leg.position.set(x, 0.2, z)
    coffeeTable.add(leg)
  })
  const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.08, 14), createStandardMaterial(0xd8ceb9, 0.9, 0.02))
  bowl.position.set(0.1, 0.5, 0)
  coffeeTable.add(bowl)
  group.add(coffeeTable)

  const lampStand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.45, 8), createStandardMaterial(0x9d8161, 0.7, 0.15))
  lampStand.position.set(0.75, 0.9, 2.95)
  const lampShade = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.42, 18, 1, true), createStandardMaterial(0xf7ead0, 0.82, 0.02, 0xf5ce85, 0.08))
  lampShade.position.set(0.75, 1.72, 2.95)
  lampShade.rotation.x = Math.PI
  group.add(lampStand, lampShade)

  const potted = new THREE.Group()
  potted.position.set(-3.1, 0.18, -2.65)
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.34, 10), createStandardMaterial(0xc08d5f, 0.9, 0.02))
  pot.position.y = 0.17
  potted.add(pot)
  for (let i = 0; i < 8; i++) {
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.36, 0.11), createStandardMaterial(i % 2 ? 0x5ea14a : 0x79bf6a, 0.95, 0.02))
    leaf.position.set(Math.cos((Math.PI * 2 * i) / 8) * 0.15, 0.45 + (i % 2) * 0.06, Math.sin((Math.PI * 2 * i) / 8) * 0.15)
    leaf.rotation.z = (Math.random() - 0.5) * 0.5
    leaf.rotation.x = (Math.random() - 0.5) * 0.5
    potted.add(leaf)
    registerSway(leaf, 'z', 0.04, 1 + Math.random() * 0.5)
  }
  group.add(potted)

  const wallArtA = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.54, 0.05), createStandardMaterial(0xf0e6d9, 0.9, 0.02))
  wallArtA.position.set(1.0, 2.15, -3.86)
  const artInnerA = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.36, 0.03), createStandardMaterial(0x8eb7cf, 0.9, 0.02))
  artInnerA.position.set(1.0, 2.15, -3.82)
  const wallArtB = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.48, 0.05), createStandardMaterial(0xf0e6d9, 0.9, 0.02))
  wallArtB.position.set(-2.95, 2.1, -3.86)
  const artInnerB = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.03), createStandardMaterial(0xd7b37c, 0.9, 0.02))
  artInnerB.position.set(-2.95, 2.1, -3.82)
  group.add(wallArtA, artInnerA, wallArtB, artInnerB)
  return group
}
function createStudioScene() {
  const group = new THREE.Group()
  group.name = 'StudioScene'
  const haloRing = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.05, 18, 72), new THREE.MeshBasicMaterial({ color: 0x7fb2ff, transparent: true, opacity: 0.18 }))
  haloRing.rotation.x = Math.PI / 2
  haloRing.position.y = 0.19
  group.add(haloRing)
  for (let i = 0; i < 5; i++) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4 + i * 0.2, 0.12), new THREE.MeshStandardMaterial({ color: 0x32455f, emissive: 0x2c4f95, emissiveIntensity: 0.45, roughness: 0.35, metalness: 0.45 }))
    const angle = (Math.PI * 2 * i) / 5
    beam.position.set(Math.cos(angle) * 2.6, 1.25, Math.sin(angle) * 2.6)
    beam.castShadow = true
    group.add(beam)
  }
  return group
}

function createStarsScene() {
  const group = new THREE.Group()
  group.name = 'StarsScene'

  const skyDome = new THREE.Mesh(
    new THREE.SphereGeometry(20, 40, 24),
    new THREE.MeshBasicMaterial({ color: 0x040915, side: THREE.BackSide, fog: false })
  )
  skyDome.position.y = 2.6
  group.add(skyDome)

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.68, 18, 18),
    new THREE.MeshBasicMaterial({ color: 0xf4f2eb, fog: false })
  )
  moon.position.set(4.3, 7.2, -8.2)
  group.add(moon)

  const moonGlow = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xbfd7ff, transparent: true, opacity: 0.16, fog: false })
  )
  moonGlow.position.copy(moon.position)
  group.add(moonGlow)

  const nebulaColors = [0x1e3a74, 0x3f236e, 0x154a5c]
  for (let i = 0; i < 6; i++) {
    const nebula = new THREE.Mesh(
      new THREE.CircleGeometry(1.2 + Math.random() * 1.5, 24),
      new THREE.MeshBasicMaterial({ color: nebulaColors[i % nebulaColors.length], transparent: true, opacity: 0.11 + Math.random() * 0.05, side: THREE.DoubleSide, fog: false })
    )
    nebula.position.set((Math.random() - 0.5) * 11, 4.5 + Math.random() * 4.5, -6 - Math.random() * 6)
    nebula.rotation.y = Math.random() * Math.PI * 2
    nebula.rotation.z = Math.random() * Math.PI * 2
    group.add(nebula)
  }

  const starField = new THREE.Group()
  for (let i = 0; i < 420; i++) {
    const size = Math.random() > 0.94 ? 0.09 : 0.018 + Math.random() * 0.03
    const star = new THREE.Mesh(
      new THREE.SphereGeometry(size, 6, 6),
      new THREE.MeshBasicMaterial({ color: Math.random() > 0.85 ? 0xa9c5ff : Math.random() > 0.7 ? 0xcdb8ff : 0xffffff, transparent: true, opacity: 0.62 + Math.random() * 0.34, fog: false })
    )
    const theta = Math.random() * Math.PI * 2
    const phi = 0.12 + Math.random() * 1.16
    const radius = 12 + Math.random() * 7.2
    star.position.set(
      Math.cos(theta) * Math.sin(phi) * radius,
      Math.cos(phi) * radius + 4.8,
      Math.sin(theta) * Math.sin(phi) * radius
    )
    starField.add(star)
  }
  group.add(starField)

  const horizonRing = new THREE.Mesh(
    new THREE.TorusGeometry(6.9, 0.18, 24, 120),
    new THREE.MeshBasicMaterial({ color: 0x182946, transparent: true, opacity: 0.22, fog: false })
  )
  horizonRing.rotation.x = Math.PI / 2
  horizonRing.position.y = 2.1
  group.add(horizonRing)

  const mountainBand = new THREE.Group()
  for (let i = 0; i < 14; i++) {
    const peak = new THREE.Mesh(
      new THREE.ConeGeometry(0.65 + Math.random() * 0.9, 1.3 + Math.random() * 1.1, 4),
      createStandardMaterial(i % 2 ? 0x172338 : 0x111b2d, 1, 0.02)
    )
    const angle = (Math.PI * 2 * i) / 14
    const dist = 5.3 + Math.random() * 1.3
    peak.position.set(Math.cos(angle) * dist, 0.75, Math.sin(angle) * dist)
    peak.rotation.y = Math.random() * Math.PI
    peak.castShadow = true
    peak.receiveShadow = true
    mountainBand.add(peak)
  }
  group.add(mountainBand)

  const ground = createGroundCircle(0x0d1624, 5.8)
  group.add(ground)
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.95, 4.9, 64),
    new THREE.MeshStandardMaterial({ color: 0x142135, roughness: 0.96, metalness: 0.08, emissive: 0x16284a, emissiveIntensity: 0.24 })
  )
  ring.rotation.x = -Math.PI / 2
  ring.position.y = 0.181
  ring.receiveShadow = true
  group.add(ring)

  for (let i = 0; i < 18; i++) {
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.1 + (i % 4) * 0.04),
      createStandardMaterial(i % 2 ? 0x76a7ff : 0xc896ff, 0.32, 0.05, i % 2 ? 0x4d76e4 : 0x8a53dd, 0.5)
    )
    const angle = Math.random() * Math.PI * 2
    const dist = 2.15 + Math.random() * 2.95
    crystal.position.set(Math.cos(angle) * dist, 0.3 + Math.random() * 0.3, Math.sin(angle) * dist)
    crystal.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2)
    crystal.castShadow = true
    crystal.receiveShadow = true
    group.add(crystal)
  }

  const fireflyConstellation = new THREE.Group()
  for (let i = 0; i < 24; i++) {
    const point = new THREE.Mesh(
      new THREE.SphereGeometry(0.035 + (i % 3) * 0.01, 6, 6),
      new THREE.MeshBasicMaterial({ color: i % 4 ? 0xd8e6ff : 0xa7c5ff, transparent: true, opacity: 0.9, fog: false })
    )
    const curveX = -2.6 + i * 0.18
    point.position.set(curveX, 5.4 + Math.sin(i * 0.48) * 0.35, -4.8 + Math.cos(i * 0.3) * 0.25)
    fireflyConstellation.add(point)
  }
  group.add(fireflyConstellation)
  return group
}
function createSnowScene() {
  const group = new THREE.Group()
  group.name = 'SnowScene'
  const ground = createGroundCircle(0xe8eef4, 5.9)
  group.add(ground)
  const shadowRing = new THREE.Mesh(new THREE.RingGeometry(1.8, 5.2, 64), new THREE.MeshStandardMaterial({ color: 0xd5dfe9, roughness: 1, metalness: 0 }))
  shadowRing.rotation.x = -Math.PI / 2
  shadowRing.position.y = 0.181
  shadowRing.receiveShadow = true
  group.add(shadowRing)
  const icyPond = new THREE.Mesh(new THREE.CircleGeometry(0.85, 28), new THREE.MeshStandardMaterial({ color: 0xb6d5eb, roughness: 0.14, metalness: 0.04, transparent: true, opacity: 0.85 }))
  icyPond.rotation.x = -Math.PI / 2
  icyPond.position.set(1.7, 0.184, -1.25)
  icyPond.receiveShadow = true
  group.add(icyPond)

  const mountainBand = new THREE.Group()
  for (let i = 0; i < 12; i++) {
    const peak = new THREE.Mesh(new THREE.ConeGeometry(0.72 + Math.random() * 0.85, 1.5 + Math.random() * 1.4, 4), createStandardMaterial(i % 2 ? 0xcfd9e6 : 0xb8c7d8, 1, 0.02))
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.34 + Math.random() * 0.18, 0.48 + Math.random() * 0.18, 4), createStandardMaterial(0xffffff, 1, 0))
    cap.position.y = 0.55
    peak.add(cap)
    const angle = (Math.PI * 2 * i) / 12
    const dist = 5.4 + Math.random() * 1.2
    peak.position.set(Math.cos(angle) * dist, 0.88, Math.sin(angle) * dist)
    peak.rotation.y = Math.random() * Math.PI
    peak.castShadow = true
    peak.receiveShadow = true
    mountainBand.add(peak)
  }
  group.add(mountainBand)

  function createSnowPine(scale = 1) {
    const tree = new THREE.Group()
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.11 * scale, 0.72 * scale, 6), createStandardMaterial(0x7a5738, 0.96, 0.02))
    trunk.position.y = 0.18 + 0.36 * scale
    trunk.castShadow = true
    trunk.receiveShadow = true
    tree.add(trunk)
    const coneHolder = new THREE.Group()
    coneHolder.position.y = 0.18 + 0.6 * scale
    for (let i = 0; i < 3; i++) {
      const cone = new THREE.Mesh(new THREE.ConeGeometry((0.48 - i * 0.09) * scale, 0.58 * scale, 7), createStandardMaterial(0x7a8f8e, 0.98, 0.02))
      cone.position.y = i * 0.28 * scale
      cone.castShadow = true
      cone.receiveShadow = true
      coneHolder.add(cone)
      const snowCap = new THREE.Mesh(new THREE.ConeGeometry((0.34 - i * 0.07) * scale, 0.22 * scale, 7), createStandardMaterial(0xffffff, 1, 0))
      snowCap.position.y = cone.position.y + 0.15 * scale
      coneHolder.add(snowCap)
    }
    registerSway(coneHolder, 'z', 0.018 * scale, 0.8 + Math.random() * 0.3)
    tree.add(coneHolder)
    return tree
  }

  const treePositions = [[-3.4, -2.1], [3.25, -2.3], [-3.2, 2.35], [3.55, 2.15], [0.1, -3.65]]
  treePositions.forEach(([x, z], index) => {
    const tree = createSnowPine(0.9 + index * 0.04)
    tree.position.set(x, 0, z)
    tree.rotation.y = Math.random() * Math.PI
    group.add(tree)
  })

  for (let i = 0; i < 8; i++) {
    const snowRock = createRock(i % 2 ? 0xd4dde7 : 0xc0cbd8, 0.9 + Math.random() * 0.8)
    const angle = Math.random() * Math.PI * 2
    const dist = 1.5 + Math.random() * 3.6
    snowRock.position.set(Math.cos(angle) * dist, 0.28, Math.sin(angle) * dist)
    snowRock.rotation.set(Math.random() * 0.2, Math.random() * Math.PI, Math.random() * 0.2)
    group.add(snowRock)
  }

  for (let i = 0; i < 16; i++) {
    const drift = new THREE.Mesh(new THREE.SphereGeometry(0.18 + Math.random() * 0.16, 10, 10), createStandardMaterial(0xf6f9fc, 1, 0))
    const angle = Math.random() * Math.PI * 2
    const dist = 0.9 + Math.random() * 4.2
    drift.position.set(Math.cos(angle) * dist, 0.21, Math.sin(angle) * dist)
    drift.scale.y = 0.45
    drift.receiveShadow = true
    group.add(drift)
  }
  return group
}

function buildEnvironmentScenes() {
  environmentState.groups = {
    studio: createStudioScene(),
    garden: createGardenScene(),
    room: createRoomScene(),
    forest: createForestScene(),
    stars: createStarsScene(),
    snow: createSnowScene()
  }
  Object.entries(environmentState.groups).forEach(([key, group]) => {
    group.visible = key === environmentState.currentScene
    environmentRoot.add(group)
  })
}

function createAmbientParticlePool() {
  if (environmentState.ambientParticleGroup) return
  environmentState.ambientParticleGroup = new THREE.Group()
  environmentState.ambientParticleGroup.name = 'AmbientParticleGroup'
  environmentRoot.add(environmentState.ambientParticleGroup)
  const total = 42
  for (let i = 0; i < total; i++) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.03 + (i % 3) * 0.01, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false }))
    mesh.visible = false
    environmentState.ambientParticleGroup.add(mesh)
    environmentState.ambientParticles.push({ mesh, velocity: new THREE.Vector3(), drift: new THREE.Vector3(), life: 0, maxLife: 1, radius: 0, angle: 0, elevation: 0 })
  }
}

function resetAmbientParticle(item, immediate = false) {
  const sceneKey = environmentState.currentScene
  const mesh = item.mesh
  const radius = sceneKey === 'room' ? 3.5 : sceneKey === 'studio' ? 2.7 : sceneKey === 'stars' ? 5.8 : sceneKey === 'snow' ? 5.4 : 5.0
  item.radius = 0.5 + Math.random() * radius
  item.angle = Math.random() * Math.PI * 2
  item.elevation = sceneKey === 'stars' ? 0.5 + Math.random() * 3.8 : sceneKey === 'snow' ? 1.4 + Math.random() * 3.0 : 0.45 + Math.random() * (sceneKey === 'room' ? 1.7 : 2.3)
  mesh.position.set(Math.cos(item.angle) * item.radius, item.elevation, Math.sin(item.angle) * item.radius)
  item.velocity.set((Math.random() - 0.5) * (sceneKey === 'stars' ? 0.03 : sceneKey === 'snow' ? 0.04 : 0.08), sceneKey === 'stars' ? 0.004 + Math.random() * 0.018 : sceneKey === 'snow' ? -(0.16 + Math.random() * 0.12) : 0.03 + Math.random() * 0.06, (Math.random() - 0.5) * (sceneKey === 'stars' ? 0.03 : sceneKey === 'snow' ? 0.04 : 0.08))
  item.drift.set((Math.random() - 0.5) * (sceneKey === 'stars' ? 0.08 : sceneKey === 'snow' ? 0.12 : 0.18), 0, (Math.random() - 0.5) * (sceneKey === 'stars' ? 0.08 : sceneKey === 'snow' ? 0.12 : 0.18))
  item.maxLife = sceneKey === 'stars' ? 9 + Math.random() * 9 : sceneKey === 'snow' ? 8 + Math.random() * 6 : 5 + Math.random() * 7
  item.life = immediate ? Math.random() * item.maxLife : item.maxLife
  mesh.scale.setScalar(sceneKey === 'stars' ? 0.9 + Math.random() * 0.8 : sceneKey === 'snow' ? 0.55 + Math.random() * 0.45 : 0.7 + Math.random() * 0.6)
  const material = mesh.material
  if (sceneKey === 'snow') {
    material.color.setHex(Math.random() > 0.85 ? 0xd9ecff : 0xffffff)
  } else if (sceneKey === 'stars' || environmentState.activeLightPreset === 'night') {
    material.color.setHex(Math.random() > 0.6 ? 0xffffff : Math.random() > 0.5 ? 0x8db7ff : 0xcba2ff)
  } else if (sceneKey === 'garden' || sceneKey === 'forest') {
    material.color.setHex(Math.random() > 0.65 ? 0xfff0a8 : 0xc8f3b0)
  } else if (sceneKey === 'room') {
    material.color.setHex(0xffe0bf)
  } else {
    material.color.setHex(0xb9d3ff)
  }
  material.opacity = 0
  mesh.visible = environmentState.ambienceMode !== 'none'
}

function createTrailPools() {
  if (!environmentState.characterFootprints.length) {
    for (let i = 0; i < 18; i++) {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.32), new THREE.MeshBasicMaterial({ map: environmentTextures.footprint, transparent: true, opacity: 0, color: 0x523f31, depthWrite: false }))
      mesh.rotation.x = -Math.PI / 2
      mesh.visible = false
      mesh.renderOrder = 3
      scene.add(mesh)
      environmentState.characterFootprints.push({ mesh, life: 0, maxLife: 1 })
    }
  }
  if (!environmentState.petFootprints.length) {
    for (let i = 0; i < 24; i++) {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.17), new THREE.MeshBasicMaterial({ map: environmentTextures.paw, transparent: true, opacity: 0, color: 0x534236, depthWrite: false }))
      mesh.rotation.x = -Math.PI / 2
      mesh.visible = false
      mesh.renderOrder = 3
      scene.add(mesh)
      environmentState.petFootprints.push({ mesh, life: 0, maxLife: 1 })
    }
  }
  if (!environmentState.dustPuffs.length) {
    for (let i = 0; i < 26; i++) {
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.35), new THREE.MeshBasicMaterial({ map: environmentTextures.dust, transparent: true, opacity: 0, color: 0xffffff, depthWrite: false }))
      mesh.rotation.x = -Math.PI / 2
      mesh.visible = false
      mesh.renderOrder = 4
      scene.add(mesh)
      environmentState.dustPuffs.push({ mesh, velocity: new THREE.Vector3(), life: 0, maxLife: 1, growth: 1 })
    }
  }
}

function refreshAmbientDetailDensity() {
  const level = environmentState.ambienceMode === 'none' ? 0 : environmentState.ambienceMode === 'soft' ? 0.45 : 1
  environmentState.swayItems.forEach(item => {
    if (!item || !item.item) return
    item.item.visible = true
  })
  environmentState.ambientParticles.forEach((item, index) => {
    const activeCount = Math.floor(environmentState.ambientParticles.length * level)
    item.mesh.visible = index < activeCount && environmentState.ambienceMode !== 'none'
    if (item.mesh.visible && item.life <= 0) resetAmbientParticle(item, true)
  })
}

function getDefaultLightingForScene(sceneKey) {
  if (sceneKey === 'garden') return 'morning'
  if (sceneKey === 'room') return 'sunset'
  if (sceneKey === 'forest') return 'morning'
  if (sceneKey === 'stars') return 'night'
  if (sceneKey === 'snow') return 'morning'
  return 'studio'
}

function getLightingConfig(preset) {
  const configs = {
    morning: {
      background: 0xbdd3ea,
      fog: 0xb8cce3,
      fogNear: 6,
      fogFar: 22,
      hemiSky: 0xd7e6f4,
      hemiGround: 0x768765,
      hemiIntensity: 0.86,
      keyColor: 0xfff0d0,
      keyIntensity: 1.34,
      keyPosition: [3.2, 4.1, 2.4],
      fillColor: 0xb7d3ff,
      fillIntensity: 0.52,
      fillPosition: [-2.8, 2.3, -2.4],
      accentColor: 0x96d6a0,
      accentIntensity: 0.14,
      exposure: 0.72
    },
    sunset: {
      background: 0xe2bf98,
      fog: 0xd6a77f,
      fogNear: 5.5,
      fogFar: 20,
      hemiSky: 0xf2d1b3,
      hemiGround: 0x866652,
      hemiIntensity: 0.82,
      keyColor: 0xffc48a,
      keyIntensity: 1.42,
      keyPosition: [-3.4, 3.5, 2.2],
      fillColor: 0xff9bc1,
      fillIntensity: 0.46,
      fillPosition: [2.2, 1.8, -2.4],
      accentColor: 0xf6b367,
      accentIntensity: 0.16,
      exposure: 0.74
    },
    night: {
      background: 0x040b14,
      fog: 0x08111d,
      fogNear: 4.5,
      fogFar: 17,
      hemiSky: 0x3f5c80,
      hemiGround: 0x0a1018,
      hemiIntensity: 0.58,
      keyColor: 0xb7ceff,
      keyIntensity: 1.04,
      keyPosition: [2.8, 4.5, 1.5],
      fillColor: 0x5d7fd9,
      fillIntensity: 0.34,
      fillPosition: [-2.4, 2.1, -2.6],
      accentColor: 0x6f8dff,
      accentIntensity: 0.24,
      exposure: 0.62
    },
    studio: {
      background: 0x091019,
      fog: 0x09111c,
      fogNear: 5.5,
      fogFar: 19,
      hemiSky: 0xc8dbf1,
      hemiGround: 0x161c26,
      hemiIntensity: 0.96,
      keyColor: 0xffffff,
      keyIntensity: 1.58,
      keyPosition: [2.8, 4.2, 3.2],
      fillColor: 0x7db1ff,
      fillIntensity: 0.66,
      fillPosition: [-2.4, 2.2, -2.2],
      accentColor: 0x5c78ff,
      accentIntensity: 0.16,
      exposure: 0.74
    }
  }
  return configs[preset] || configs.studio
}

function getSceneLightingScale() {
  if (environmentState.currentScene === 'stars') return 0.58
  if (environmentState.currentScene === 'garden' || environmentState.currentScene === 'forest') return 0.72
  if (environmentState.currentScene === 'room') return 0.68
  if (environmentState.currentScene === 'snow') return 0.84
  return 1
}

function applyLightingConfig(config) {
  const qualityScale = (performanceMode ? 0.88 : 1) * getSceneLightingScale()
  if (scene.background) scene.background.setHex(config.background)
  else scene.background = new THREE.Color(config.background)
  scene.fog.color.setHex(config.fog)
  scene.fog.near = config.fogNear
  scene.fog.far = performanceMode ? Math.max(config.fogNear + 4, config.fogFar * 0.82) : config.fogFar
  hemi.color.setHex(config.hemiSky)
  hemi.groundColor.setHex(config.hemiGround)
  hemi.intensity = config.hemiIntensity * qualityScale
  key.color.setHex(config.keyColor)
  key.intensity = config.keyIntensity * qualityScale
  key.position.set(config.keyPosition[0], config.keyPosition[1], config.keyPosition[2])
  fill.color.setHex(config.fillColor)
  fill.intensity = config.fillIntensity * qualityScale
  fill.position.set(config.fillPosition[0], config.fillPosition[1], config.fillPosition[2])
  platformAmbient.color.setHex(config.accentColor)
  platformAmbient.intensity = config.accentIntensity * (performanceMode ? 0.72 : 1)
  if ('toneMappingExposure' in renderer) renderer.toneMappingExposure = config.exposure || 1
  environmentState.activeLightPreset = environmentState.lightingMode === 'auto' ? getDefaultLightingForScene(environmentState.currentScene) : environmentState.lightingMode
}

function lerpNumber(a, b, t) { return a + (b - a) * t }
function lerpHexColor(a, b, t) {
  const color = new THREE.Color(a)
  color.lerp(new THREE.Color(b), t)
  return color
}

function applyLightingBlend(configA, configB, t) {
  const qualityScale = (performanceMode ? 0.88 : 1) * getSceneLightingScale()
  const bg = lerpHexColor(configA.background, configB.background, t)
  const fogColor = lerpHexColor(configA.fog, configB.fog, t)
  scene.background = bg
  scene.fog.color.copy(fogColor)
  scene.fog.near = lerpNumber(configA.fogNear, configB.fogNear, t)
  const baseFogFar = lerpNumber(configA.fogFar, configB.fogFar, t)
  scene.fog.far = performanceMode ? Math.max(scene.fog.near + 4, baseFogFar * 0.82) : baseFogFar
  hemi.color.copy(lerpHexColor(configA.hemiSky, configB.hemiSky, t))
  hemi.groundColor.copy(lerpHexColor(configA.hemiGround, configB.hemiGround, t))
  hemi.intensity = lerpNumber(configA.hemiIntensity, configB.hemiIntensity, t) * qualityScale
  key.color.copy(lerpHexColor(configA.keyColor, configB.keyColor, t))
  key.intensity = lerpNumber(configA.keyIntensity, configB.keyIntensity, t) * qualityScale
  key.position.set(
    lerpNumber(configA.keyPosition[0], configB.keyPosition[0], t),
    lerpNumber(configA.keyPosition[1], configB.keyPosition[1], t),
    lerpNumber(configA.keyPosition[2], configB.keyPosition[2], t)
  )
  fill.color.copy(lerpHexColor(configA.fillColor, configB.fillColor, t))
  fill.intensity = lerpNumber(configA.fillIntensity, configB.fillIntensity, t) * qualityScale
  fill.position.set(
    lerpNumber(configA.fillPosition[0], configB.fillPosition[0], t),
    lerpNumber(configA.fillPosition[1], configB.fillPosition[1], t),
    lerpNumber(configA.fillPosition[2], configB.fillPosition[2], t)
  )
  platformAmbient.color.copy(lerpHexColor(configA.accentColor, configB.accentColor, t))
  platformAmbient.intensity = lerpNumber(configA.accentIntensity, configB.accentIntensity, t) * (performanceMode ? 0.72 : 1)
  if ('toneMappingExposure' in renderer) renderer.toneMappingExposure = lerpNumber(configA.exposure || 1, configB.exposure || 1, t)
}

function refreshEnvironmentLighting(forceImmediate = false) {
  if (environmentState.lightingMode === 'cycle' && !forceImmediate) return
  const targetPreset = environmentState.lightingMode === 'auto' ? getDefaultLightingForScene(environmentState.currentScene) : environmentState.lightingMode
  applyLightingConfig(getLightingConfig(targetPreset))
}

function updateLightingCycle(dt) {
  if (environmentState.lightingMode !== 'cycle') return
  environmentState.cycleTime += dt * 0.12
  const order = ['morning', 'sunset', 'night', 'studio']
  const totalSegments = order.length
  const progress = environmentState.cycleTime % totalSegments
  const index = Math.floor(progress)
  const t = progress - index
  const current = getLightingConfig(order[index])
  const next = getLightingConfig(order[(index + 1) % totalSegments])
  applyLightingBlend(current, next, t)
  environmentState.activeLightPreset = 'cycle'
}

function applyEnvironmentScene(sceneKey) {
  environmentState.currentScene = sceneKey || 'studio'
  Object.entries(environmentState.groups).forEach(([key, group]) => {
    group.visible = key === environmentState.currentScene
  })
  platformGroup.visible = environmentState.currentScene === 'studio'
  if (sceneModeSelect && sceneModeSelect.value !== environmentState.currentScene) sceneModeSelect.value = environmentState.currentScene
  refreshEnvironmentLighting(true)
  environmentState.ambientParticles.forEach(item => resetAmbientParticle(item, true))
  refreshAmbientDetailDensity()
}

function applyLightingMode(mode) {
  environmentState.lightingMode = mode || 'auto'
  if (lightingModeSelect && lightingModeSelect.value !== environmentState.lightingMode) lightingModeSelect.value = environmentState.lightingMode
  if (environmentState.lightingMode !== 'cycle') {
    refreshEnvironmentLighting(true)
  }
}

function applyAmbienceMode(mode) {
  environmentState.ambienceMode = mode || 'full'
  if (ambienceModeSelect && ambienceModeSelect.value !== environmentState.ambienceMode) ambienceModeSelect.value = environmentState.ambienceMode
  refreshAmbientDetailDensity()
}

function initializeEnvironmentSystem() {
  buildEnvironmentScenes()
  createAmbientParticlePool()
  createTrailPools()
  environmentState.ambientParticles.forEach(item => resetAmbientParticle(item, true))
}

function attachCharacterShadow() {
  if (!modelPivot) return
  const old = modelPivot.getObjectByName('CharacterSoftShadow')
  if (old && old.parent) old.parent.remove(old)
  const shadow = createSoftShadowMesh()
  shadow.name = 'CharacterSoftShadow'
  modelPivot.add(shadow)
}

function attachPetShadows() {
  if (!petState.group) return
  for (const wrapper of petState.group.children) {
    if (!wrapper || !wrapper.userData) continue
    const existing = wrapper.getObjectByName('PetSoftShadow')
    if (existing && existing.parent) existing.parent.remove(existing)
    const root = wrapper.userData.petRoot
    let size = 0.28
    if (root && root.userData && root.userData.petPlacementSize) size = Math.max(0.25, root.userData.petPlacementSize.x * 0.9)
    const shadow = createPetShadowMesh(size)
    shadow.name = 'PetSoftShadow'
    wrapper.add(shadow)
  }
}

function shouldShowEnvironmentalTrails() {
  return environmentState.ambienceMode !== 'none' && environmentState.currentScene !== 'studio'
}

function getAvailableFootprintPool(list) {
  return list.find(item => item.life <= 0) || list[0]
}

function spawnFootprint(type, worldPosition, rotationY = 0, scale = 1) {
  if (!shouldShowEnvironmentalTrails() || !worldPosition) return
  const pool = type === 'pet' ? environmentState.petFootprints : environmentState.characterFootprints
  const item = getAvailableFootprintPool(pool)
  if (!item) return
  item.life = item.maxLife = type === 'pet' ? 2.2 : 2.8
  item.mesh.visible = true
  item.mesh.position.set(worldPosition.x, environmentState.groundY + 0.004, worldPosition.z)
  item.mesh.rotation.set(-Math.PI / 2, 0, rotationY)
  item.mesh.scale.setScalar(scale)
  item.mesh.material.opacity = type === 'pet' ? 0.38 : 0.32
}

function spawnDustPuff(worldPosition, color = 0xded3bf, scale = 1) {
  if (!shouldShowEnvironmentalTrails() || !worldPosition) return
  const item = getAvailableFootprintPool(environmentState.dustPuffs)
  if (!item) return
  item.life = item.maxLife = 0.75 + Math.random() * 0.4
  item.growth = 1 + Math.random() * 1.1
  item.velocity.set((Math.random() - 0.5) * 0.08, 0.22 + Math.random() * 0.08, (Math.random() - 0.5) * 0.08)
  item.mesh.visible = true
  item.mesh.position.set(worldPosition.x, environmentState.groundY + 0.01, worldPosition.z)
  item.mesh.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI)
  item.mesh.scale.setScalar(0.55 * scale)
  item.mesh.material.opacity = 0.34
  item.mesh.material.color.setHex(color)
}

function getCharacterTrailPosition() {
  if (!modelPivot) return null
  const side = environmentState.charFootSide > 0 ? 1 : -1
  const local = new THREE.Vector3(0.16 * side, 0, 0.08)
  const world = modelPivot.localToWorld(local)
  environmentState.charFootSide *= -1
  return world
}

function getPetTrailPosition(instance, index = 0) {
  if (!instance || !instance.wrapper) return null
  const base = instance.wrapper.getWorldPosition(new THREE.Vector3())
  const side = environmentState.petFootSide > 0 ? 1 : -1
  base.x += 0.06 * side
  base.z += (index % 2 ? -0.02 : 0.02)
  environmentState.petFootSide *= -1
  return base
}

function isLocomotionClip(name) {
  const n = normalizeName(name)
  return n.includes('walk') || n.includes('run')
}

function isRunClip(name) {
  return normalizeName(name).includes('run')
}

function updateEnvironmentDetails(dt) {
  updateLightingCycle(dt)
  const ambienceScale = environmentState.ambienceMode === 'full' ? 1 : environmentState.ambienceMode === 'soft' ? 0.45 : 0
  environmentState.swayItems.forEach(item => {
    if (!item || !item.item) return
    item.item.rotation[item.axis] = item.baseRotation + Math.sin(clock.elapsedTime * item.speed + item.phase) * item.amplitude * ambienceScale
  })
  for (const item of environmentState.ambientParticles) {
    if (!item.mesh.visible) continue
    item.life -= dt
    if (item.life <= 0 || (environmentState.currentScene === 'snow' ? item.mesh.position.y < 0.2 : item.mesh.position.y > 3.4)) {
      resetAmbientParticle(item)
      continue
    }
    item.mesh.position.addScaledVector(item.velocity, dt)
    item.mesh.position.x += Math.sin(clock.elapsedTime * 0.8 + item.angle) * item.drift.x * dt
    item.mesh.position.z += Math.cos(clock.elapsedTime * 0.75 + item.angle) * item.drift.z * dt
    item.mesh.material.opacity = Math.min(0.42, Math.max(0.08, (item.life / item.maxLife) * 0.45)) * ambienceScale
  }
  for (const item of environmentState.characterFootprints) {
    if (item.life <= 0) { item.mesh.visible = false; continue }
    item.life -= dt
    item.mesh.material.opacity = Math.max(0, item.life / item.maxLife) * 0.34
    if (item.life <= 0) item.mesh.visible = false
  }
  for (const item of environmentState.petFootprints) {
    if (item.life <= 0) { item.mesh.visible = false; continue }
    item.life -= dt
    item.mesh.material.opacity = Math.max(0, item.life / item.maxLife) * 0.38
    if (item.life <= 0) item.mesh.visible = false
  }
  for (const item of environmentState.dustPuffs) {
    if (item.life <= 0) { item.mesh.visible = false; continue }
    item.life -= dt
    item.mesh.position.addScaledVector(item.velocity, dt)
    item.mesh.scale.multiplyScalar(1 + dt * item.growth)
    item.mesh.material.opacity = Math.max(0, item.life / item.maxLife) * 0.32
    if (item.life <= 0) item.mesh.visible = false
  }
  if (!playState || !ambienceScale) return
  if (activeClip && isLocomotionClip(activeClip.name)) {
    environmentState.charStepTimer -= dt * parseFloat(speedRange.value)
    if (environmentState.charStepTimer <= 0) {
      const pos = getCharacterTrailPosition()
      spawnFootprint('character', pos, Math.random() * 0.16 - 0.08, isRunClip(activeClip.name) ? 1.05 : 0.95)
      if (isRunClip(activeClip.name) || environmentState.currentScene === 'room') spawnDustPuff(pos, environmentState.currentScene === 'room' ? 0xf1d9c1 : 0xd8cfba, isRunClip(activeClip.name) ? 1.1 : 0.8)
      environmentState.charStepTimer = isRunClip(activeClip.name) ? 0.16 : 0.3
    }
  } else {
    environmentState.charStepTimer = 0
  }
  const movingPets = petState.instances.filter(instance => instance && instance.clipName && isLocomotionClip(instance.clipName))
  if (movingPets.length) {
    environmentState.petStepTimer -= dt * parseFloat(speedRange.value)
    if (environmentState.petStepTimer <= 0) {
      movingPets.forEach((instance, index) => {
        const pos = getPetTrailPosition(instance, index)
        spawnFootprint('pet', pos, Math.random() * 0.25 - 0.12, 0.82)
        if (isRunClip(instance.clipName)) spawnDustPuff(pos, 0xe0d6c4, 0.65)
      })
      environmentState.petStepTimer = movingPets.some(instance => isRunClip(instance.clipName)) ? 0.18 : 0.36
    }
  } else {
    environmentState.petStepTimer = 0
  }
}


const swordReferenceLocal = {
  position: new THREE.Vector3(0.001631, 0.064917, 0.029423),
  quaternion: new THREE.Quaternion(0.46954117, -0.60502649, 0.39466846, 0.50765228),
  scale: new THREE.Vector3(0.45, 0.45, 0.45)
}

function normalizeName(name) {
  return (name || '').toLowerCase()
}

function fxCount(normalCount, performanceCount = 1) {
  return performanceMode ? performanceCount : normalCount
}

function canSpawnFx(list, normalLimit, performanceLimit) {
  return list.length < (performanceMode ? performanceLimit : normalLimit)
}

function countActiveLavaProjectiles() {
  if (!lavaPool.initialized) return 0
  let count = 0
  for (let i = 0; i < lavaPool.projectileItems.length; i++) if (lavaPool.projectileItems[i].active) count++
  return count
}

function countActiveLavaPuddles() {
  if (!lavaPool.initialized) return 0
  let count = 0
  for (let i = 0; i < lavaPool.puddleItems.length; i++) if (lavaPool.puddleItems[i].active) count++
  return count
}

function getModelCatalog() {
  const catalog = window.ASSET_PATHS && Array.isArray(window.ASSET_PATHS.modelCatalog) ? window.ASSET_PATHS.modelCatalog : []
  if (catalog.length) return catalog
  const paths = window.ASSET_PATHS && window.ASSET_PATHS.models ? window.ASSET_PATHS.models : {}
  return Object.keys(paths)
    .filter(key => key !== 'sword')
    .map(key => ({ key, label: key, path: paths[key], character: key.startsWith('devilsir') ? 'devilsir' : key }))
}

function getModelEntry(modelKey) {
  const catalog = getModelCatalog()
  const entry = catalog.find(item => item.key === modelKey)
  if (entry) return entry
  return catalog.find(item => item.key === 'lucas') || catalog[0] || null
}

function getModelFitEntry(modelKey) {
  return getModelEntry(modelKey) || {}
}

function getModelFitBox(root, fitEntry) {
  root.updateWorldMatrix(true, true)
  if (fitEntry && fitEntry.fitBounds === 'skeleton') {
    const skeletonBox = new THREE.Box3()
    let hasBone = false
    root.traverse(obj => {
      if (!obj.isBone) return
      obj.getWorldPosition(tmpVecA)
      skeletonBox.expandByPoint(tmpVecA)
      hasBone = true
    })
    if (hasBone && !skeletonBox.isEmpty()) return skeletonBox
  }
  return new THREE.Box3().setFromObject(root)
}

function getFitTargetHeight(fitEntry) {
  const value = fitEntry && Number(fitEntry.fitTargetHeight)
  return Number.isFinite(value) && value > 0 ? value : 1.0
}

function getModelPath(modelKey) {
  const paths = window.ASSET_PATHS && window.ASSET_PATHS.models ? window.ASSET_PATHS.models : {}
  const entry = getModelEntry(modelKey)
  return (entry && entry.path) || paths[modelKey] || paths.lucas
}

function getModelAnimationSources(modelKey) {
  const entry = getModelEntry(modelKey)
  return entry && Array.isArray(entry.animationSources) ? entry.animationSources : []
}

function getPetCatalog() {
  const catalog = window.ASSET_PATHS && Array.isArray(window.ASSET_PATHS.petCatalog) ? window.ASSET_PATHS.petCatalog : []
  if (catalog.length) return catalog
  return [{ key: 'none', label: 'Sem pet', pets: [] }]
}

function getPetModeEntry(mode) {
  const catalog = getPetCatalog()
  return catalog.find(item => item.key === mode) || catalog[0] || { key: 'none', label: 'Sem pet', pets: [] }
}

function getPetEntry(key) {
  const pets = window.ASSET_PATHS && window.ASSET_PATHS.pets ? window.ASSET_PATHS.pets : {}
  return pets[key] || null
}

function populatePetSelect() {
  if (!petModeSelect) return
  const catalog = getPetCatalog()
  const previousValue = petModeSelect.value || 'none'
  petModeSelect.innerHTML = ''
  for (const entry of catalog) {
    const option = document.createElement('option')
    option.value = entry.key
    option.textContent = entry.label || entry.key
    petModeSelect.appendChild(option)
  }
  if ([...petModeSelect.options].some(option => option.value === previousValue)) {
    petModeSelect.value = previousValue
  } else if ([...petModeSelect.options].some(option => option.value === 'none')) {
    petModeSelect.value = 'none'
  }
}

function clearPets() {
  petState.token++
  for (const instance of petState.instances) {
    if (!instance) continue
    if (instance.action) instance.action.stop()
    if (instance.mixer) {
      instance.mixer.stopAllAction()
      if (instance.root) instance.mixer.uncacheRoot(instance.root)
    }
  }
  petState.instances = []
  if (petState.group && petState.group.parent) petState.group.parent.remove(petState.group)
  petState.group = null
}

function stylePetRoot(petRoot, entry) {
  if (!petRoot) return
  const targetHeightValue = entry && Number(entry.targetHeight)
  const targetHeight = Number.isFinite(targetHeightValue) && targetHeightValue > 0 ? targetHeightValue : 0.32
  petRoot.updateWorldMatrix(true, true)
  let box = new THREE.Box3().setFromObject(petRoot)
  let size = box.getSize(new THREE.Vector3())
  if (size.y > 0) {
    const scale = targetHeight / size.y
    petRoot.scale.multiplyScalar(scale)
    petRoot.updateWorldMatrix(true, true)
    box = new THREE.Box3().setFromObject(petRoot)
    size = box.getSize(new THREE.Vector3())
  }
  const center = box.getCenter(new THREE.Vector3())
  petRoot.userData.petPlacementSize = size.clone()
  petRoot.position.x -= center.x
  petRoot.position.z -= center.z
  petRoot.position.y += 0.18 - box.min.y
  petRoot.rotation.y += entry && Number.isFinite(Number(entry.rotationY)) ? Number(entry.rotationY) : 0
  petRoot.traverse(obj => {
    if (!obj.isMesh) return
    obj.castShadow = true
    obj.receiveShadow = true
    obj.frustumCulled = false
    if (!obj.material) return
    const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
    for (const mat of materials) {
      if (!mat) continue
      if ('envMapIntensity' in mat) mat.envMapIntensity = 0.9
      mat.side = THREE.DoubleSide
      mat.needsUpdate = true
    }
  })
}

function getPetCharacterCenterWorld() {
  if (centerBone) {
    const center = new THREE.Vector3()
    centerBone.getWorldPosition(center)
    return center
  }
  if (modelRoot && modelRoot.userData && modelRoot.userData.petPlacementCenterLocal) {
    return modelRoot.localToWorld(modelRoot.userData.petPlacementCenterLocal.clone())
  }
  if (modelRoot) return modelRoot.getWorldPosition(new THREE.Vector3())
  return new THREE.Vector3(0, 0, 0)
}

function getNearModelPetPlacement(petRoot, entry, fallbackPosition) {
  const fallback = fallbackPosition || new THREE.Vector3(0, 0, 0)
  if (!petRoot || !entry || entry.placement !== 'nearModel') return fallback
  if (!modelRoot || !modelPivot || !camera) return fallback
  modelPivot.updateWorldMatrix(true, true)
  camera.updateMatrixWorld(true)

  const characterSize = modelRoot.userData && modelRoot.userData.petPlacementSize
    ? modelRoot.userData.petPlacementSize.clone()
    : new THREE.Box3().setFromObject(modelRoot).getSize(new THREE.Vector3())
  const petSize = petRoot.userData && petRoot.userData.petPlacementSize
    ? petRoot.userData.petPlacementSize.clone()
    : new THREE.Box3().setFromObject(petRoot).getSize(new THREE.Vector3())
  const characterCenterWorld = getPetCharacterCenterWorld()
  const gapValue = Number(entry.gap)
  const gap = Number.isFinite(gapValue) && gapValue >= 0 ? gapValue : 0.035

  const cameraRight = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0)
  cameraRight.y = 0
  if (cameraRight.lengthSq() < 0.0001) cameraRight.set(1, 0, 0)
  cameraRight.normalize()

  const towardCamera = camera.position.clone().sub(characterCenterWorld)
  towardCamera.y = 0
  if (towardCamera.lengthSq() < 0.0001) towardCamera.set(0, 0, 1)
  towardCamera.normalize()

  let desiredWorld
  if (entry.side === 'center') {
    const characterHalfDepth = Math.max(characterSize.z * 0.5, 0.08)
    const petHalfDepth = Math.max(petSize.z * 0.5, 0.04)
    desiredWorld = characterCenterWorld.clone().add(towardCamera.clone().multiplyScalar(characterHalfDepth + petHalfDepth + gap))
  } else {
    const sideSign = entry.side === 'right' ? 1 : -1
    const characterHalfWidth = Math.max(characterSize.x * 0.5, 0.08)
    const petHalfWidth = Math.max(petSize.x * 0.5, 0.04)
    desiredWorld = characterCenterWorld.clone().add(cameraRight.clone().multiplyScalar(sideSign * (characterHalfWidth + petHalfWidth + gap)))
  }

  const lateralOffset = Number(entry.lateralOffset)
  if (Number.isFinite(lateralOffset) && lateralOffset !== 0) desiredWorld.add(cameraRight.clone().multiplyScalar(lateralOffset))
  const forwardOffset = Number(entry.forwardOffset)
  if (Number.isFinite(forwardOffset) && forwardOffset !== 0) desiredWorld.add(towardCamera.clone().multiplyScalar(forwardOffset))

  const desiredLocal = modelPivot.worldToLocal(desiredWorld)
  desiredLocal.y = Number.isFinite(Number(fallback.y)) ? Number(fallback.y) : 0
  return desiredLocal
}

function findPetClip(instance, requestedName) {
  if (!instance || !instance.clips || !instance.clips.length) return null
  const requested = String(requestedName || 'idle').toLowerCase()
  return instance.clips.find(clip => String(clip.name || '').toLowerCase() === requested)
    || instance.clips.find(clip => String(clip.name || '').toLowerCase().includes(requested))
    || instance.clips.find(clip => String(clip.name || '').toLowerCase().includes('idle'))
    || instance.clips[0]
}

function playPetAnimationInstance(instance, requestedName, fadeDuration = 0.2) {
  if (!instance || !instance.mixer) return
  const clip = findPetClip(instance, requestedName)
  if (!clip) return
  const nextAction = instance.mixer.clipAction(clip)
  if (instance.action === nextAction && instance.clipName === clip.name) {
    nextAction.paused = !playState
    nextAction.timeScale = parseFloat(speedRange.value)
    return
  }
  if (instance.action) instance.action.fadeOut(fadeDuration)
  const normalizedClipName = String(clip.name || '').toLowerCase()
  const oneShot = normalizedClipName === 'jump_start' || normalizedClipName === 'jump_fall' || normalizedClipName === 'jump_end'
  nextAction.reset()
  nextAction.enabled = true
  nextAction.setLoop(oneShot ? THREE.LoopOnce : THREE.LoopRepeat, oneShot ? 1 : Infinity)
  nextAction.clampWhenFinished = oneShot
  nextAction.timeScale = parseFloat(speedRange.value)
  nextAction.fadeIn(fadeDuration)
  nextAction.play()
  nextAction.paused = !playState
  instance.action = nextAction
  instance.clipName = clip.name
}

const PET_AUTO_SEQUENCE = [
  { clip: 'idle', duration: 4.05 },
  { clip: 'walk', duration: 2.05 },
  { clip: 'idle', duration: 2.8 },
  { clip: 'run', duration: 1.3 },
  { clip: 'idle', duration: 2.4 },
  { clip: 'jump_start', duration: 0.32 },
  { clip: 'jump', duration: 1.38 },
  { clip: 'jump_fall', duration: 1.38 },
  { clip: 'jump_end', duration: 1.15 },
  { clip: 'idle', duration: 3.2 }
]

function getCurrentPetAutoStep() {
  return PET_AUTO_SEQUENCE[petState.autoStep % PET_AUTO_SEQUENCE.length]
}

function applyPetAnimationMode(mode) {
  petState.animationMode = mode || 'auto'
  petState.autoStep = 0
  const autoStep = getCurrentPetAutoStep()
  petState.autoTimer = autoStep.duration
  const clipName = petState.animationMode === 'auto' ? autoStep.clip : petState.animationMode
  for (const instance of petState.instances) playPetAnimationInstance(instance, clipName, 0.18)
  if (petAnimationModeSelect && petAnimationModeSelect.value !== petState.animationMode) {
    petAnimationModeSelect.value = petState.animationMode
  }
}

function updatePetAnimations(dt) {
  if (!playState) return
  for (const instance of petState.instances) {
    if (instance && instance.mixer) instance.mixer.update(dt)
  }
  if (petState.animationMode !== 'auto' || !petState.instances.length) return
  petState.autoTimer -= dt * parseFloat(speedRange.value)
  if (petState.autoTimer > 0) return
  petState.autoStep = (petState.autoStep + 1) % PET_AUTO_SEQUENCE.length
  const step = getCurrentPetAutoStep()
  petState.autoTimer = step.duration
  for (const instance of petState.instances) playPetAnimationInstance(instance, step.clip, 0.22)
}

function addPetToGroup(gltf, entry, group) {
  if (!gltf || !gltf.scene || !entry || !group) return
  const petRoot = gltf.scene
  const wrapper = new THREE.Group()
  wrapper.name = 'Pet_' + (entry.label || 'Modelo')
  wrapper.add(petRoot)
  stylePetRoot(petRoot, entry)
  const pos = entry.position || {}
  const fallbackPosition = new THREE.Vector3(
    Number.isFinite(Number(pos.x)) ? Number(pos.x) : (entry.side === 'right' ? 0.58 : entry.side === 'center' ? 0 : -0.58),
    Number.isFinite(Number(pos.y)) ? Number(pos.y) : 0,
    Number.isFinite(Number(pos.z)) ? Number(pos.z) : 0
  )
  wrapper.userData.petRoot = petRoot
  wrapper.userData.petEntry = entry
  wrapper.userData.fallbackPosition = fallbackPosition
  const placement = getNearModelPetPlacement(petRoot, entry, fallbackPosition)
  wrapper.position.copy(placement)
  group.add(wrapper)

  const clips = Array.isArray(gltf.animations) ? gltf.animations : []
  if (clips.length) {
    const instance = {
      root: petRoot,
      wrapper,
      mixer: new THREE.AnimationMixer(petRoot),
      clips,
      action: null,
      clipName: null
    }
    petState.instances.push(instance)
    attachPetShadows()
    const currentAuto = getCurrentPetAutoStep()
    const initialClip = petState.animationMode === 'auto' ? currentAuto.clip : petState.animationMode
    playPetAnimationInstance(instance, initialClip, 0)
  } else {
    console.warn('Pet sem animações disponíveis:', entry.label || entry.path)
  }
}

function updatePetPlacements() {
  if (!petState.group || !modelPivot || !camera) return
  for (const wrapper of petState.group.children) {
    const petRoot = wrapper && wrapper.userData ? wrapper.userData.petRoot : null
    const entry = wrapper && wrapper.userData ? wrapper.userData.petEntry : null
    const fallbackPosition = wrapper && wrapper.userData ? wrapper.userData.fallbackPosition : null
    if (!petRoot || !entry) continue
    wrapper.position.copy(getNearModelPetPlacement(petRoot, entry, fallbackPosition))
  }
}

function applyPetMode(mode) {
  petState.current = mode || 'none'
  clearPets()
  if (!modelPivot) return
  const modeEntry = getPetModeEntry(petState.current)
  const petKeys = modeEntry && Array.isArray(modeEntry.pets) ? modeEntry.pets : []
  if (!petKeys.length) return
  const token = petState.token
  if (petState.animationMode === 'auto') {
    petState.autoStep = 0
    petState.autoTimer = getCurrentPetAutoStep().duration
  }
  const group = new THREE.Group()
  group.name = 'PetGroup'
  petState.group = group
  modelPivot.add(group)
  const loader = new THREE.GLTFLoader()
  petKeys.forEach(key => {
    const entry = getPetEntry(key)
    if (!entry || !entry.path) return
    loader.load(entry.path, gltf => {
      if (token !== petState.token || group !== petState.group) return
      addPetToGroup(gltf, entry, group)
    }, undefined, err => {
      console.warn('Falha ao carregar pet', entry.path, err)
    })
  })
}

function getRunescapeStaffOffset(modelKey) {
  const entry = getModelEntry(modelKey)
  const offset = entry && entry.runescapeStaffOffset ? entry.runescapeStaffOffset : null
  return {
    x: offset && Number.isFinite(Number(offset.x)) ? Number(offset.x) : 0,
    y: offset && Number.isFinite(Number(offset.y)) ? Number(offset.y) : 0,
    z: offset && Number.isFinite(Number(offset.z)) ? Number(offset.z) : 0
  }
}


function findRunescapeNodeByName(name) {
  if (!modelRoot || !name) return null
  let found = null
  const target = normalizeName(name)
  modelRoot.traverse(obj => {
    if (!found && normalizeName(obj.name) === target) found = obj
  })
  return found
}

function getRunescapeStaffAnchorConfig(modelKey) {
  const entry = getModelEntry(modelKey) || {}
  return {
    handAnchor: entry.runescapeStaffHandAnchor || 'root_151',
    staffRoot: entry.runescapeStaffRoot || 'root_51'
  }
}

function prepareRunescapeStaffAnchor(modelKey) {
  runescapeStaffAnchorState = null
  if (!modelRoot || !isRunescapeModel(modelKey)) return
  const config = getRunescapeStaffAnchorConfig(modelKey)
  const handAnchor = findRunescapeNodeByName(config.handAnchor)
  const staffRoot = findRunescapeNodeByName(config.staffRoot)
  if (!handAnchor || !staffRoot) return
  modelRoot.updateWorldMatrix(true, true)
  handAnchor.updateWorldMatrix(true, false)
  staffRoot.updateWorldMatrix(true, false)
  const offsetMatrix = new THREE.Matrix4().copy(handAnchor.matrixWorld).invert().multiply(staffRoot.matrixWorld)
  runescapeStaffAnchorState = {
    handAnchor,
    staffRoot,
    offsetMatrix,
    targetWorld: new THREE.Matrix4(),
    localMatrix: new THREE.Matrix4(),
    inverseParentWorld: new THREE.Matrix4(),
    position: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
    scale: new THREE.Vector3()
  }
}

function isRunescapeExternalMoveClip() {
  if (!activeClip || !isRunescapeModel(currentModelKey)) return false
  const name = normalizeName(activeClip.name)
  return name.includes('runescape - walk') || name.includes('runescape - run')
}

function enforceRunescapeStaffAnchor() {
  if (!runescapeStaffAnchorState || !isRunescapeExternalMoveClip()) return
  const state = runescapeStaffAnchorState
  if (!state.handAnchor || !state.staffRoot || !state.staffRoot.parent) return
  state.handAnchor.updateWorldMatrix(true, false)
  state.staffRoot.parent.updateWorldMatrix(true, false)
  state.targetWorld.copy(state.handAnchor.matrixWorld).multiply(state.offsetMatrix)
  state.inverseParentWorld.copy(state.staffRoot.parent.matrixWorld).invert()
  state.localMatrix.copy(state.inverseParentWorld).multiply(state.targetWorld)
  state.localMatrix.decompose(state.position, state.quaternion, state.scale)
  state.staffRoot.position.copy(state.position)
  state.staffRoot.quaternion.copy(state.quaternion)
  state.staffRoot.scale.copy(state.scale)
  state.staffRoot.updateMatrixWorld(true)
}

function prepareRunescapeStaffOffset(modelKey) {
  runescapeStaffOffsetState = null
  if (!modelRoot || !isRunescapeModel(modelKey)) return
  const offset = getRunescapeStaffOffset(modelKey)
  if (!offset.x && !offset.y && !offset.z) return
  let staffRoot = null
  modelRoot.traverse(obj => {
    if (!staffRoot && normalizeName(obj.name) === 'root_51') staffRoot = obj
  })
  if (!staffRoot) return
  runescapeStaffOffsetState = {
    root: staffRoot,
    base: staffRoot.position.clone(),
    offset: new THREE.Vector3(offset.x, offset.y, offset.z)
  }
  enforceRunescapeStaffOffset()
}

function enforceRunescapeStaffOffset() {
  if (!runescapeStaffOffsetState || !runescapeStaffOffsetState.root) return
  runescapeStaffOffsetState.root.position.copy(runescapeStaffOffsetState.base).add(runescapeStaffOffsetState.offset)
  runescapeStaffOffsetState.root.updateMatrixWorld(true)
}

function getAnimationSourceClipName(source, clip, index, total) {
  if (source && Array.isArray(source.clipLabels) && source.clipLabels[index]) return source.clipLabels[index]
  const label = source && source.label ? source.label : 'Animação externa'
  return total > 1 ? label + ' ' + (index + 1) : label
}

function cloneAnimationClip(clip) {
  return clip && typeof clip.clone === 'function' ? clip.clone() : clip
}

function shouldSkipAnimationSourceClip(source, clip, index) {
  const skipIndexes = source && Array.isArray(source.skipClipIndexes) ? source.skipClipIndexes : []
  if (skipIndexes.includes(index)) return true
  const name = normalizeName(getAnimationSourceClipName(source, clip, index, 1))
  return name.includes('loop')
}

function stripPositionScaleTracksFromClip(clip) {
  if (!clip || !Array.isArray(clip.tracks)) return clip
  clip.tracks = clip.tracks.filter(track => {
    const name = normalizeName(track && track.name)
    return !name.endsWith('.position') && !name.endsWith('.scale') && !name.endsWith('.translation')
  })
  if (typeof clip.resetDuration === 'function') clip.resetDuration()
  return clip
}

function stripRunescapeStaffRootTracksFromClip(clip) {
  if (!clip || !Array.isArray(clip.tracks)) return clip
  clip.tracks = clip.tracks.filter(track => {
    const name = normalizeName(track && track.name)
    if (!name.startsWith('root_51.')) return true
    return !name.endsWith('.position') && !name.endsWith('.scale') && !name.endsWith('.translation')
  })
  if (typeof clip.resetDuration === 'function') clip.resetDuration()
  return clip
}

function prepareExtraAnimationClip(source, clip, index, total) {
  const cloned = cloneAnimationClip(clip)
  cloned.name = getAnimationSourceClipName(source, clip, index, total)
  if (source && source.stripPositionScaleTracks) stripPositionScaleTracksFromClip(cloned)
  if (source && source.protectRunescapeStaff) stripRunescapeStaffRootTracksFromClip(cloned)
  return cloned
}

function loadExtraAnimationClips(loader, sources) {
  if (!sources.length) return Promise.resolve([])
  return Promise.all(sources.map(source => new Promise(resolve => {
    loader.load(source.path, extraGltf => {
      const sourceClips = extraGltf.animations || []
      const clips = []
      sourceClips.forEach((clip, index) => {
        if (shouldSkipAnimationSourceClip(source, clip, index)) return
        clips.push(prepareExtraAnimationClip(source, clip, index, sourceClips.length))
      })
      resolve(clips)
    }, undefined, err => {
      console.warn('Falha ao carregar animação extra do modelo', source.path, err)
      resolve([])
    })
  }))).then(groups => {
    const clips = []
    groups.forEach(group => group.forEach(clip => clips.push(clip)))
    return clips
  })
}

function isDevilsirModel(modelKey) {
  const entry = getModelEntry(modelKey)
  return !!entry && entry.character === 'devilsir'
}

function isRunescapeModel(modelKey) {
  const entry = getModelEntry(modelKey)
  return !!entry && entry.variant === 'runescape'
}

function getModelAnimationLabel(modelKey, clipName) {
  const entry = getModelEntry(modelKey)
  if (!entry || !entry.animationLabels) return clipName
  return entry.animationLabels[clipName] || clipName
}

function normalizeRunescapeAnimationName(index, clipName) {
  const cleanName = (clipName || '').trim()
  if (cleanName.toLowerCase().startsWith('runescape - ')) return cleanName
  if (!cleanName || cleanName.toLowerCase() === 'anim' || cleanName.toLowerCase() === 'animation') return index === 0 ? 'Runescape - Animação original' : 'Runescape - Animação ' + (index + 1)
  return cleanName
}

function prepareAnimationsForModel(sourceAnimations, modelKey) {
  const clips = sourceAnimations.slice()
  if (isRunescapeModel(modelKey)) {
    clips.forEach((clip, index) => {
      clip.name = normalizeRunescapeAnimationName(index, clip.name)
    })
  }
  return clips.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
}

function getAnimationDisplayName(name) {
  return getModelAnimationLabel(currentModelKey, name)
}

function animationMatchesSearch(name, query) {
  if (!query) return true
  const label = getAnimationDisplayName(name)
  return normalizeName(name).includes(query) || normalizeName(label).includes(query)
}

function populateModelSelect() {
  if (!modelSelect) return
  const catalog = getModelCatalog()
  const previousValue = modelSelect.value || 'lucas'
  modelSelect.innerHTML = ''
  for (const entry of catalog) {
    const option = document.createElement('option')
    option.value = entry.key
    option.textContent = entry.label || entry.key
    modelSelect.appendChild(option)
  }
  if ([...modelSelect.options].some(option => option.value === previousValue)) {
    modelSelect.value = previousValue
  } else if ([...modelSelect.options].some(option => option.value === 'lucas')) {
    modelSelect.value = 'lucas'
  }
}

function updateModelSpecificControls() {
  if (handItemModeSelect) {
    handItemModeSelect.disabled = false
  }
}

function findBoneByFragments(fragments) {
  if (!modelRoot) return null
  let found = null
  modelRoot.traverse(obj => {
    if (found || !obj.isBone) return
    const n = normalizeName(obj.name)
    for (const frag of fragments) {
      if (n.includes(frag)) { found = obj; break }
    }
  })
  return found
}

function findNodeByFragments(fragments) {
  if (!modelRoot) return null
  const compact = value => normalizeName(value).replace(/[^a-z0-9]/g, '')
  let found = null
  modelRoot.traverse(obj => {
    if (found) return
    const n = normalizeName(obj.name)
    const cn = compact(obj.name)
    for (const frag of fragments) {
      const f = normalizeName(frag)
      const cf = compact(frag)
      if (n.includes(f) || cn.includes(cf)) { found = obj; break }
    }
  })
  return found
}

function collectEyeMaterialsFromNode(node, kind) {
  if (!node || !node.isMesh || !node.material) return
  if (Array.isArray(node.material)) return
  const cloned = node.material.clone()
  node.material = cloned
  if (typeof cloned.emissive === 'undefined') cloned.emissive = new THREE.Color(0x000000)
  cloned.emissive = cloned.emissive ? cloned.emissive.clone() : new THREE.Color(0x000000)
  cloned.toneMapped = false
  lucasEyeMaterials.push({
    node,
    kind,
    material: cloned,
    baseColor: cloned.color ? cloned.color.getHex() : null,
    baseEmissive: cloned.emissive.getHex(),
    baseEmissiveIntensity: typeof cloned.emissiveIntensity === 'number' ? cloned.emissiveIntensity : 0,
    baseOpacity: typeof cloned.opacity === 'number' ? cloned.opacity : 1,
    baseTransparent: !!cloned.transparent
  })
}

function prepareLucasEyeMaterials() {
  lucasEyeMaterials = []
  const eyeLeft = findNodeByFragments(['object_4.002', 'object4.002', 'object4002'])
  const eyeRight = findNodeByFragments(['object_4_001', 'object4.001', 'object4001'])
  const membraneLeft = findNodeByFragments(['object_3.002', 'object3.002', 'object3002'])
  const membraneRight = findNodeByFragments(['object_3_001', 'object3.001', 'object3001'])
  collectEyeMaterialsFromNode(eyeLeft, 'eye')
  collectEyeMaterialsFromNode(eyeRight, 'eye')
  collectEyeMaterialsFromNode(membraneLeft, 'membrane')
  collectEyeMaterialsFromNode(membraneRight, 'membrane')
}

function resetLucasEyeEmission() {
  for (const item of lucasEyeMaterials) {
    const mat = item.material
    if (item.baseColor !== null && mat.color) mat.color.setHex(item.baseColor)
    mat.emissive.setHex(item.baseEmissive || 0x000000)
    mat.emissiveIntensity = typeof item.baseEmissiveIntensity === 'number' ? item.baseEmissiveIntensity : 0
    mat.opacity = typeof item.baseOpacity === 'number' ? item.baseOpacity : 1
    mat.transparent = !!item.baseTransparent
    mat.needsUpdate = true
  }
}

function setLucasEyeEmission(color, intensity) {
  for (const item of lucasEyeMaterials) {
    const mat = item.material
    if (item.baseColor !== null && mat.color) mat.color.setHex(item.baseColor)
    mat.emissive.setHex(color)
    mat.emissiveIntensity = item.kind === 'membrane' ? intensity * 0.22 : intensity
    if (item.kind === 'membrane') {
      mat.transparent = true
      mat.opacity = Math.min(1, Math.max(item.baseOpacity || 0.72, 0.72))
    }
    mat.needsUpdate = true
  }
}

function getLucasEyeEmissionStrength(fx) {
  const base = performanceMode ? 1.0 : 2.2
  const scaleByFx = {
    fire: 0.55,
    lava: 0.5,
    light: 0.6,
    lightning: 0.72,
    ice: 0.82,
    water: 0.82,
    wind: 0.75,
    earth: 0.68,
    shadow: 0.78,
    crystal: 0.72,
    void: 0.78
  }
  return base * (scaleByFx[fx] ?? 0.72)
}

function resolveSpecialBonesForModel() {

  if (currentModelKey === 'lucas') {
    if (!headBone) headBone = findBoneByFragments(['head'])
    if (!leftEyeNode) leftEyeNode = findNodeByFragments(['object_4.002', 'object4.002', 'object4002'])
    if (!rightEyeNode) rightEyeNode = findNodeByFragments(['object_4_001', 'object4.001', 'object4001'])
    if (!hands.left) hands.left = findBoneByFragments(['l_hand', 'left_hand'])
    if (!hands.right) hands.right = findBoneByFragments(['r_hand', 'right_hand'])
    if (!hands.rightForearm) hands.rightForearm = findBoneByFragments(['r_forearm', 'right_forearm'])
    if (leftEyeNode && rightEyeNode && lucasEyeMaterials.length === 0) prepareLucasEyeMaterials()
  } else if (isDevilsirModel(currentModelKey)) {
    if (!headBone) headBone = findBoneByFragments(['bone_16', 'head/helm'])
    if (!hands.left) hands.left = findBoneByFragments(['bone_36', 'bone_43'])
    if (!hands.right) hands.right = findBoneByFragments(['bone_48', 'bone_114', 'weapon'])
    if (!hands.rightForearm) hands.rightForearm = findBoneByFragments(['bone_37', 'bone_31'])
  }
}

function collectDevilsirSwordMeshes() {
  devilsirSwordMeshes = []
  devilsirShoulderReplacements = []
  runescapeStaffMeshes = []
  runescapeStaffReplacements = []
  if (!modelRoot) return
  modelRoot.traverse(obj => {
    if (!obj.isMesh) return
    const objName = normalizeName(obj.name)
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
    const isSword = objName.includes('geoset_20') || objName.includes('geoset_21') || objName.includes('geoset_22') || objName.includes('geoset_23') || objName.includes('geoset_24') || mats.some(mat => normalizeName(mat && mat.name).includes('sword'))
    if (isSword) devilsirSwordMeshes.push(obj)
  })
}

function applyDevilsirSwordVisibility() {
  const show = !handItemModeSelect || handItemModeSelect.value === 'sword'
  for (const mesh of devilsirSwordMeshes) mesh.visible = show
}

function cloneMaterialSet(material) {
  if (Array.isArray(material)) return material.map(mat => mat ? mat.clone() : mat)
  return material ? material.clone() : material
}

function attachRigidMeshToBone(sourceMesh, bone) {
  if (!sourceMesh || !bone) return null
  sourceMesh.updateWorldMatrix(true, false)
  bone.updateWorldMatrix(true, false)
  const rigid = new THREE.Mesh(sourceMesh.geometry, cloneMaterialSet(sourceMesh.material))
  rigid.name = sourceMesh.name + '_rigid'
  rigid.castShadow = true
  rigid.receiveShadow = true
  const localMatrix = new THREE.Matrix4().copy(bone.matrixWorld).invert().multiply(sourceMesh.matrixWorld)
  localMatrix.decompose(rigid.position, rigid.quaternion, rigid.scale)
  bone.add(rigid)
  sourceMesh.visible = false
  return rigid
}

function disposeLucasNeckFillers() {}

function addLucasNeckFillers() {}

function collectRunescapeStaffMeshes() {
  runescapeStaffMeshes = []
  if (!modelRoot || !isRunescapeModel(currentModelKey)) return
  const staffNames = new Set(['mesh_6', 'mesh_7', 'mesh_8', 'mesh_9'])
  modelRoot.traverse(obj => {
    if (!obj.isMesh) return
    if (staffNames.has(normalizeName(obj.name))) runescapeStaffMeshes.push(obj)
  })
}

function lockRunescapeStaffToHand() {
  runescapeStaffReplacements = []
}

function lockDevilsirShouldersToRig() {
  devilsirShoulderReplacements = []
}

function cleanupCurrentModel() {
  clearEffects()
  clearHandAccessory()
  clearPets()
  handAccessoryState.current = 'none'
  if (mixer) {
    mixer.stopAllAction()
    if (modelRoot) mixer.uncacheRoot(modelRoot)
  }
  activeAction = null
  activeClip = null
  mixer = null
  animations = []
  allAnimationNames = []
  filteredAnimationNames = []
  autoFxMap = {}
  hands = { left: null, right: null, rightForearm: null }
  headBone = null
  resetLucasEyeEmission()
  leftEyeNode = null
  rightEyeNode = null
  lucasEyeMaterials = []
  lucasActiveEyeColor = 0xffffff
  centerBone = null
  devilsirSwordMeshes = []
  devilsirShoulderReplacements = []
  runescapeStaffMeshes = []
  runescapeStaffReplacements = []
  runescapeStaffOffsetState = null
  runescapeStaffAnchorState = null
  if (modelPivot && modelPivot.parent) modelPivot.parent.remove(modelPivot)
  modelPivot = null
  modelRoot = null
}

function loadSelectedModel(modelKey) {
  currentModelKey = modelKey
  updateModelSpecificControls()
  cleanupCurrentModel()
  loading.textContent = 'Carregando modelo e animações…'
  loading.classList.remove('hidden')
  if (!THREE.GLTFLoader) {
    loading.textContent = 'GLTFLoader não carregou. Confira a internet.'
    throw new Error('THREE.GLTFLoader indisponível')
  }
  const loader = new THREE.GLTFLoader()
  const modelPath = getModelPath(modelKey)
  loader.load(modelPath, gltf => {
    const extraAnimationSources = getModelAnimationSources(modelKey)
    loadExtraAnimationClips(loader, extraAnimationSources).then(extraClips => {
      if (extraClips.length) gltf.animations = (gltf.animations || []).concat(extraClips)
      setupModel(gltf, modelKey)
    })
  }, undefined, err => {
    loading.textContent = 'Falha ao carregar o modelo. Abra pelo servidor local do ZIP.'
    console.error(err)
  })
}

function clearHandAccessory() {
  if (handAccessoryState.swordWrapper && handAccessoryState.swordWrapper.parent) {
    handAccessoryState.swordWrapper.parent.remove(handAccessoryState.swordWrapper)
  }
}

function styleSwordWrapper(wrapper) {
  wrapper.scale.copy(swordReferenceLocal.scale)
  wrapper.position.copy(swordReferenceLocal.position)
  wrapper.quaternion.copy(swordReferenceLocal.quaternion)
}

function attachSwordToHand() {
  if (!hands.right || !handAccessoryState.swordWrapper) return
  clearHandAccessory()
  styleSwordWrapper(handAccessoryState.swordWrapper)
  hands.right.add(handAccessoryState.swordWrapper)
}

function updateHandAccessoryWorld() {
  if (handAccessoryState.current !== 'sword' || !handAccessoryState.swordWrapper || !hands.right) return
  if (handAccessoryState.swordWrapper.parent !== hands.right) attachSwordToHand()
  styleSwordWrapper(handAccessoryState.swordWrapper)
}

function loadSwordAccessory(callback) {
  if (handAccessoryState.swordLoaded && handAccessoryState.swordWrapper) {
    callback && callback()
    return
  }
  if (handAccessoryState.swordLoading) return
  handAccessoryState.swordLoading = true
  const loader = new THREE.GLTFLoader()
  const swordPath = window.ASSET_PATHS && window.ASSET_PATHS.models ? window.ASSET_PATHS.models.sword : './assets/models/sword.glb'
  loader.load(swordPath, gltf => {
    const wrapper = new THREE.Group()
    wrapper.name = 'SwordAccessoryWrapper'
    wrapper.add(gltf.scene)
    let lucasSwordLayer = 0
    wrapper.traverse(obj => {
      if (obj.isMesh) {
        obj.castShadow = true
        obj.receiveShadow = true
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        for (const mat of mats) {
          if (!mat) continue
          mat.transparent = true
          mat.depthWrite = false
          mat.side = THREE.DoubleSide
          if (lucasSwordLayer === 0) mat.opacity = 0.3797468543
          else if (lucasSwordLayer === 1) mat.opacity = 0.2531645298
          else if (lucasSwordLayer === 2) mat.opacity = 0.3417721391
          else if (lucasSwordLayer === 3) mat.opacity = 0.65
          lucasSwordLayer++
        }
      }
    })
    handAccessoryState.swordWrapper = wrapper
    handAccessoryState.swordLoaded = true
    handAccessoryState.swordLoading = false
    callback && callback()
  }, err => {
    handAccessoryState.swordLoading = false
    console.error('Falha ao carregar espada', err)
  })
}

function applyHandAccessory(mode) {
  handAccessoryState.current = mode
  clearHandAccessory()
  if (isDevilsirModel(currentModelKey)) {
    applyDevilsirSwordVisibility()
    return
  }
  if (mode === 'sword') {
    loadSwordAccessory(() => {
      if (handAccessoryState.current === 'sword') attachSwordToHand()
    })
  }
}

function assignAutoEffects(names) {
  const cycle = ['fire', 'ice', 'lightning', 'wind', 'lava', 'earth', 'water', 'shadow', 'light', 'crystal', 'void']
  const map = {}
  let cycleIndex = 0
  for (const name of names) {
    const n = normalizeName(name)
    let fx = 'none'
    if (n.includes('attack') || n.includes('big_gesture')) {
      fx = cycle[cycleIndex % cycle.length]
      cycleIndex++
    } else if (n.includes('upper_body_gesture')) {
      fx = cycle[cycleIndex % cycle.length]
      cycleIndex++
    } else if (n.includes('fullbody_gesture')) {
      fx = cycle[cycleIndex % cycle.length]
      cycleIndex++
    } else if (n.includes('gesture') && !n.includes('head_reaction')) {
      fx = cycle[cycleIndex % cycle.length]
      cycleIndex++
    } else if (n.includes('head_reaction')) {
      fx = 'shadow'
    }
    map[name] = fx
  }
  return map
}

function createGlowTexture(innerColor, outerColor, shape = 'radial') {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (shape === 'ring') {
    ctx.clearRect(0, 0, 128, 128)
    ctx.beginPath()
    ctx.arc(64, 64, 46, 0, Math.PI * 2)
    ctx.lineWidth = 12
    ctx.strokeStyle = outerColor
    ctx.shadowColor = outerColor
    ctx.shadowBlur = 18
    ctx.stroke()
  } else {
    const gradient = ctx.createRadialGradient(64, 64, 8, 64, 64, 64)
    gradient.addColorStop(0, innerColor)
    gradient.addColorStop(0.35, outerColor)
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 128)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

const textures = {
  fire: createGlowTexture('rgba(255,250,210,1)', 'rgba(255,96,10,0.8)'),
  ember: createGlowTexture('rgba(255,240,190,0.95)', 'rgba(255,166,38,0.55)'),
  ice: createGlowTexture('rgba(240,253,255,1)', 'rgba(90,220,255,0.75)'),
  frost: createGlowTexture('rgba(235,250,255,0.95)', 'rgba(140,238,255,0.45)'),
  electric: createGlowTexture('rgba(255,255,255,1)', 'rgba(112,176,255,0.8)'),
  wind: createGlowTexture('rgba(255,255,255,0.85)', 'rgba(188,240,255,0.35)', 'ring'),
  gust: createGlowTexture('rgba(255,255,255,0.75)', 'rgba(170,220,255,0.25)'),
  lava: createGlowTexture('rgba(255,236,184,1)', 'rgba(255,70,0,0.85)'),
  smoke: createGlowTexture('rgba(110,70,55,0.42)', 'rgba(40,25,20,0.08)'),
  earth: createGlowTexture('rgba(219,200,160,0.55)', 'rgba(126,92,48,0.25)'),
  dust: createGlowTexture('rgba(222,205,170,0.55)', 'rgba(162,128,84,0.12)'),
  water: createGlowTexture('rgba(245,255,255,1)', 'rgba(60,176,255,0.62)'),
  splash: createGlowTexture('rgba(240,255,255,0.92)', 'rgba(120,210,255,0.33)'),
  shadow: createGlowTexture('rgba(192,118,255,0.95)', 'rgba(48,10,85,0.58)'),
  darksmoke: createGlowTexture('rgba(96,62,138,0.38)', 'rgba(14,6,24,0.08)'),
  light: createGlowTexture('rgba(255,250,220,1)', 'rgba(255,204,92,0.72)'),
  sparkle: createGlowTexture('rgba(255,255,255,0.95)', 'rgba(255,229,163,0.28)'),
  crystal: createGlowTexture('rgba(240,255,255,1)', 'rgba(156,116,255,0.56)'),
  void: createGlowTexture('rgba(155,104,255,0.9)', 'rgba(22,0,38,0.48)'),
  voidRing: createGlowTexture('rgba(210,170,255,0.7)', 'rgba(66,0,94,0.3)', 'ring')
}

const lavaSurfaceTexture = new THREE.TextureLoader().load('./assets/lava_texture.png')
lavaSurfaceTexture.wrapS = THREE.RepeatWrapping
lavaSurfaceTexture.wrapT = THREE.RepeatWrapping
lavaSurfaceTexture.repeat.set(1.8, 1.8)
lavaSurfaceTexture.offset.set(0, 0)

function createSoftSprite(texture, color, opacity, size) {
  const material = new THREE.SpriteMaterial({
    map: texture,
    color,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(size, size, size)
  sprite.renderOrder = 999
  sprite.material.depthTest = false
  sprite.material.depthWrite = false
  return sprite
}


const auraSprites = {
  left: createSoftSprite(textures.fire, 0xffffff, 0.0, 0.18),
  right: createSoftSprite(textures.fire, 0xffffff, 0.0, 0.18)
}
scene.add(auraSprites.left)
scene.add(auraSprites.right)
auraSprites.left.visible = false
auraSprites.right.visible = false

const eyeGlowState = {
  left: createSoftSprite(textures.sparkle, 0xffffff, 0.0, 0.18),
  right: createSoftSprite(textures.sparkle, 0xffffff, 0.0, 0.18),
  leftCore: new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, depthTest: false, depthWrite: false })),
  rightCore: new THREE.Mesh(new THREE.SphereGeometry(0.012, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, depthTest: false, depthWrite: false })),
  leftLight: new THREE.PointLight(0xffffff, 0, 1.8, 1.6),
  rightLight: new THREE.PointLight(0xffffff, 0, 1.8, 1.6),
  timer: 0,
  maxTimer: 0.28
}
eyeGlowState.left.visible = false
eyeGlowState.right.visible = false
eyeGlowState.leftCore.visible = false
eyeGlowState.rightCore.visible = false
eyeGlowState.leftLight.visible = false
eyeGlowState.rightLight.visible = false
eyeGlowState.left.renderOrder = 999
eyeGlowState.right.renderOrder = 999
eyeGlowState.leftCore.renderOrder = 999
eyeGlowState.rightCore.renderOrder = 999
scene.add(eyeGlowState.left)
scene.add(eyeGlowState.right)
scene.add(eyeGlowState.leftCore)
scene.add(eyeGlowState.rightCore)
scene.add(eyeGlowState.leftLight)
scene.add(eyeGlowState.rightLight)

function triggerEyeGlow(fxType, duration = 0.28) {
  const hasEyes = currentModelKey === 'lucas' ? (leftEyeNode && rightEyeNode) : !!headBone
  if (!hasEyes || fxType === 'none') return
  const theme = getFxVisualTheme(fxType)
  if (currentModelKey === 'lucas') {
    lucasActiveEyeColor = theme.color
    eyeGlowState.timer = Math.max(eyeGlowState.timer, duration)
    eyeGlowState.maxTimer = Math.max(duration, 0.18)
    eyeGlowState.left.visible = false
    eyeGlowState.right.visible = false
    eyeGlowState.leftCore.visible = false
    eyeGlowState.rightCore.visible = false
    eyeGlowState.leftLight.visible = false
    eyeGlowState.rightLight.visible = false
    return
  }
  eyeGlowState.timer = Math.max(eyeGlowState.timer, duration)
  eyeGlowState.maxTimer = Math.max(duration, 0.18)
  ;[eyeGlowState.left, eyeGlowState.right].forEach(sprite => {
    sprite.material.map = theme.texture
    sprite.material.color.setHex(theme.color)
    sprite.visible = true
  })
  ;[eyeGlowState.leftCore, eyeGlowState.rightCore].forEach(core => {
    core.material.color.setHex(theme.color)
    core.visible = true
  })
  ;[eyeGlowState.leftLight, eyeGlowState.rightLight].forEach(light => {
    light.color.setHex(theme.color)
    light.visible = true
  })
}

function getEyeGlowPlacement() {
  if (currentModelKey === 'lucas') {
    return {
      left: new THREE.Vector3(0.0, 0.0, 0.004),
      right: new THREE.Vector3(0.0, 0.0, 0.004),
      scale: performanceMode ? 0.16 : 0.34,
      opacity: performanceMode ? 0.55 : 1.25,
      coreOpacity: performanceMode ? 0.72 : 1.0,
      coreScale: performanceMode ? 0.018 : 0.03,
      lightIntensity: performanceMode ? 1.0 : 4.0
    }
  }
  return {
    left: new THREE.Vector3(-0.036, 0.032, 0.084),
    right: new THREE.Vector3(0.036, 0.032, 0.084),
    scale: performanceMode ? 0.065 : 0.14,
    opacity: performanceMode ? 0.16 : 0.58,
    coreOpacity: performanceMode ? 0.2 : 0.45,
    coreScale: performanceMode ? 0.009 : 0.012,
    lightIntensity: performanceMode ? 0.22 : 1.05
  }
}

function updateEyeGlow(dt) {
  const hasEyes = currentModelKey === 'lucas' ? (leftEyeNode && rightEyeNode) : !!headBone
  if (!hasEyes || eyeGlowState.timer <= 0) {
    eyeGlowState.left.visible = false
    eyeGlowState.right.visible = false
    eyeGlowState.leftCore.visible = false
    eyeGlowState.rightCore.visible = false
    eyeGlowState.leftLight.visible = false
    eyeGlowState.rightLight.visible = false
    if (currentModelKey === 'lucas') resetLucasEyeEmission()
    return
  }
  eyeGlowState.timer = Math.max(0, eyeGlowState.timer - dt)
  const alpha = eyeGlowState.maxTimer > 0 ? eyeGlowState.timer / eyeGlowState.maxTimer : 0
  if (currentModelKey === 'lucas') {
    const pulseLucas = 1.0 + Math.sin(clock.elapsedTime * 24.0) * 0.18
    setLucasEyeEmission(lucasActiveEyeColor, getLucasEyeEmissionStrength(currentFxType) * alpha * pulseLucas)
    eyeGlowState.left.visible = false
    eyeGlowState.right.visible = false
    eyeGlowState.leftCore.visible = false
    eyeGlowState.rightCore.visible = false
    eyeGlowState.leftLight.visible = false
    eyeGlowState.rightLight.visible = false
    return
  }
  const pulse = 0.9 + Math.sin(clock.elapsedTime * 18.0) * 0.1
  const placement = getEyeGlowPlacement()
  headBone.getWorldPosition(tmpVecA)
    headBone.getWorldQuaternion(tmpQuat)
    const leftOffset = placement.left.clone().applyQuaternion(tmpQuat)
    const rightOffset = placement.right.clone().applyQuaternion(tmpQuat)
    eyeGlowState.left.position.copy(tmpVecA).add(leftOffset)
    eyeGlowState.right.position.copy(tmpVecA).add(rightOffset)
  eyeGlowState.leftCore.position.copy(eyeGlowState.left.position)
  eyeGlowState.rightCore.position.copy(eyeGlowState.right.position)
  eyeGlowState.leftLight.position.copy(eyeGlowState.left.position)
  eyeGlowState.rightLight.position.copy(eyeGlowState.right.position)
  eyeGlowState.left.material.opacity = placement.opacity * alpha * pulse
  eyeGlowState.right.material.opacity = placement.opacity * alpha * pulse
  eyeGlowState.leftCore.material.opacity = placement.coreOpacity * alpha * pulse
  eyeGlowState.rightCore.material.opacity = placement.coreOpacity * alpha * pulse
  const s = placement.scale * (0.9 + alpha * 0.35)
  eyeGlowState.left.scale.setScalar(s)
  eyeGlowState.right.scale.setScalar(s)
  const coreScale = placement.coreScale * (0.9 + alpha * 0.35)
  eyeGlowState.leftCore.scale.setScalar(coreScale)
  eyeGlowState.rightCore.scale.setScalar(coreScale)
  eyeGlowState.leftLight.intensity = placement.lightIntensity * alpha * pulse
  eyeGlowState.rightLight.intensity = placement.lightIntensity * alpha * pulse
  eyeGlowState.left.visible = eyeGlowState.left.material.opacity > 0.01
  eyeGlowState.right.visible = eyeGlowState.right.material.opacity > 0.01
  eyeGlowState.leftCore.visible = eyeGlowState.leftCore.material.opacity > 0.01
  eyeGlowState.rightCore.visible = eyeGlowState.rightCore.material.opacity > 0.01
  eyeGlowState.leftLight.visible = eyeGlowState.leftLight.intensity > 0.02
  eyeGlowState.rightLight.visible = eyeGlowState.rightLight.intensity > 0.02
}

function getFxVisualTheme(fx) {
  const themes = {
    fire: { texture: textures.fire, color: 0xff8f2a, platform: 0xff9a3d },
    ice: { texture: textures.ice, color: 0xa7ebff, platform: 0x8ae4ff },
    lightning: { texture: textures.electric, color: 0xa8cfff, platform: 0x9ec7ff },
    wind: { texture: textures.wind, color: 0xeefbff, platform: 0xd6f5ff },
    lava: { texture: textures.lava, color: 0xff6322, platform: 0xff7030 },
    earth: { texture: textures.earth, color: 0xc9a873, platform: 0xb9955e },
    water: { texture: textures.water, color: 0x82d4ff, platform: 0x69c4ff },
    shadow: { texture: textures.shadow, color: 0xa874ff, platform: 0x9f63ff },
    light: { texture: textures.light, color: 0xffe08a, platform: 0xffd36f },
    crystal: { texture: textures.crystal, color: 0xc7adff, platform: 0xb08eff },
    void: { texture: textures.void, color: 0x9d69ff, platform: 0x7c47ff }
  }
  return themes[fx] || { texture: textures.fire, color: 0xffffff, platform: 0x6ca6ff }
}

function updateElementalAuras() {
  const active = currentFxType !== 'none' && !!hands.left && !!hands.right
  const theme = getFxVisualTheme(currentFxType)
  if (!active) {
    auraSprites.left.visible = false
    auraSprites.right.visible = false
    platformGlow.material.color.setHex(0x6ca6ff)
    platformTop.material.emissive.setHex(0x152238)
    return
  }
  const pulse = 0.82 + Math.sin(clock.elapsedTime * 5.5) * 0.18
  platformGlow.material.color.setHex(theme.platform)
  platformTop.material.emissive.setHex(theme.platform)
  platformTop.material.emissiveIntensity = performanceMode ? 0.35 : 0.55
  ;['left','right'].forEach(side => {
    const sprite = auraSprites[side]
    getHandWorldPosition(side, tmpVecA)
    sprite.visible = true
    sprite.position.copy(tmpVecA)
    sprite.position.y += 0.01
    sprite.material.map = theme.texture
    sprite.material.color.setHex(theme.color)
    sprite.material.opacity = performanceMode ? 0.10 * pulse : 0.42 * pulse
    const s = performanceMode ? 0.075 : 0.18
    sprite.scale.setScalar(s * pulse)
  })
}

function setLavaProjectileActive(item, active) {
  item.active = active
  item.group.visible = active
  item.light.visible = active
}

function setLavaDripActive(item, active) {
  item.active = active
  item.mesh.visible = active
  item.light.visible = active
}

function setLavaPuddleActive(item, active) {
  item.active = active
  item.group.visible = active
  item.light.visible = active
}

function initLavaPools() {
  if (lavaPool.initialized) return

  for (let i = 0; i < 8; i++) {
    const group = new THREE.Group()
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.058, 1),
      new THREE.MeshStandardMaterial({ color: 0xffffff, map: lavaSurfaceTexture, emissive: 0xff5a12, emissiveMap: lavaSurfaceTexture, emissiveIntensity: 1.85, transparent: true, opacity: 0.94, roughness: 0.58, metalness: 0.02 })
    )
    const glow = createSoftSprite(textures.lava, 0xff5a17, 0.52, 0.26)
    const halo = createSoftSprite(textures.ember, 0xffcf76, 0.30, 0.18)
    const smoke = createSoftSprite(textures.smoke, 0x6d4331, 0.18, 0.31)
    group.add(core)
    group.add(glow)
    group.add(halo)
    group.add(smoke)
    group.visible = false
    effectGroups.lava.add(group)
    const light = new THREE.PointLight(0xff5418, 0, 2.7, 2)
    light.visible = false
    scene.add(light)
    lavaPool.projectileItems.push({
      active: false,
      group, core, glow, halo, smoke, light,
      velocity: new THREE.Vector3(),
      life: 0, maxLife: 1.25, spin: 0, pulse: 0
    })
  }

  for (let i = 0; i < 12; i++) {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xffffff, map: lavaSurfaceTexture, emissive: 0xff661a, emissiveMap: lavaSurfaceTexture, emissiveIntensity: 1.35, transparent: true, opacity: 0.88, roughness: 0.62, metalness: 0.01 })
    )
    mesh.visible = false
    effectGroups.lava.add(mesh)
    const light = new THREE.PointLight(0xff6d1a, 0, 0.85, 2)
    light.visible = false
    scene.add(light)
    lavaPool.dripItems.push({
      active: false, mesh, light, velocity: new THREE.Vector3(), life: 0, maxLife: 0.45
    })
  }

  for (let i = 0; i < 8; i++) {
    const group = new THREE.Group()
    const puddle = new THREE.Mesh(
      new THREE.CircleGeometry(0.16, 24),
      new THREE.MeshStandardMaterial({ color: 0xffffff, map: lavaSurfaceTexture, emissive: 0xff5e12, emissiveMap: lavaSurfaceTexture, emissiveIntensity: 1.55, transparent: true, opacity: 0.9, roughness: 0.52, metalness: 0.0 })
    )
    puddle.rotation.x = -Math.PI / 2
    puddle.position.y = 0.1825
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(0.205, 24),
      new THREE.MeshBasicMaterial({ color: 0xff7a1f, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, depthWrite: false })
    )
    glow.rotation.x = -Math.PI / 2
    glow.position.y = 0.1815
    const rim = new THREE.Mesh(
      new THREE.RingGeometry(0.163, 0.19, 24),
      new THREE.MeshBasicMaterial({ color: 0x32150e, transparent: true, opacity: 0.45, depthWrite: false })
    )
    rim.rotation.x = -Math.PI / 2
    rim.position.y = 0.1822
    group.add(glow)
    group.add(rim)
    group.add(puddle)
    group.visible = false
    effectGroups.lava.add(group)
    const light = new THREE.PointLight(0xff5e14, 0, 2.6, 2)
    light.visible = false
    scene.add(light)
    lavaPool.puddleItems.push({
      active: false, group, puddle, glow, rim, light, life: 0, maxLife: 1.8, pulse: 0, radius: 0.16
    })
  }

  lavaPool.initialized = true
}

function acquirePooledLavaItem(list, nextKey) {
  initLavaPools()
  const index = lavaPool[nextKey]
  const item = list[index]
  lavaPool[nextKey] = (index + 1) % list.length
  return item
}

function createFxLight(color, intensity, distance, position, lifetime = 0.22) {
  if (performanceMode && fxLights.length > 10) {
    const light = new THREE.PointLight(color, 0, 0, 2)
    light.visible = false
    return light
  }
  const light = new THREE.PointLight(
    color,
    performanceMode ? intensity * 0.28 : intensity,
    performanceMode ? distance * 0.55 : distance,
    2
  )
  light.position.copy(position)
  scene.add(light)
  const holder = { light, life: performanceMode ? lifetime * 0.55 : lifetime, maxLife: performanceMode ? lifetime * 0.55 : lifetime }
  fxLights.push(holder)
  return light
}

function disposeGroupResources(group) {
  group.traverse(obj => {
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose && m.dispose())
      else obj.material.dispose && obj.material.dispose()
    }
    if (obj.geometry) obj.geometry.dispose && obj.geometry.dispose()
  })
}

function getHandWorldPosition(which, out) {
  const bone = which === 'left' ? hands.left : hands.right
  if (!bone) return out.set(0, 1, 0)
  bone.getWorldPosition(out)
  return out
}

function getCastDirection(which, out) {
  const hand = which === 'left' ? hands.left : hands.right
  if (hand) {
    hand.getWorldQuaternion(tmpQuat)
    out.set(0, 0, 1).applyQuaternion(tmpQuat).normalize()
    if (Math.abs(out.y) > 0.9) out.set(0.15, 0.06, 1).normalize()
  } else {
    out.set(0.15, 0.06, 1).normalize()
  }
  return out
}

function spawnTrail(position, kind, scale) {
  if (performanceMode) {
    if (trailParticles.length > 14) return
    if (Math.random() > 0.14) return
    scale *= 0.72
  }
  const map = {
    fire: [textures.ember, 0xffb03c],
    ice: [textures.frost, 0x9fe8ff],
    lightning: [textures.electric, 0xb9d8ff],
    wind: [textures.gust, 0xeafaff],
    lava: [textures.smoke, 0xff8d3c],
    earth: [textures.dust, 0xcfb280],
    water: [textures.splash, 0x86d8ff],
    shadow: [textures.darksmoke, 0xab78ff],
    light: [textures.sparkle, 0xffe7a4],
    crystal: [textures.crystal, 0xc7adff],
    void: [textures.void, 0x9c70ff]
  }
  const [texture, color] = map[kind]
  const sprite = createSoftSprite(texture, color, 0.7, scale)
  sprite.position.copy(position)
  scene.add(sprite)
  trailParticles.push({
    sprite,
    life: kind === 'wind' ? 0.55 : kind === 'earth' ? 0.48 : kind === 'void' ? 0.5 : 0.4,
    maxLife: kind === 'wind' ? 0.55 : kind === 'earth' ? 0.48 : kind === 'void' ? 0.5 : 0.4,
    spin: (Math.random() - 0.5) * 2.6,
    drift: new THREE.Vector3((Math.random() - 0.5) * 0.08, Math.random() * 0.12, (Math.random() - 0.5) * 0.08)
  })
}

function createFireProjectile(start, dir) {
  if (!canSpawnFx(fireProjectiles, 18, 3)) return
  const group = new THREE.Group()
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.05, 18, 18), new THREE.MeshStandardMaterial({ color: 0xffaa34, emissive: 0xff7a1a, emissiveIntensity: 3.1, transparent: true, opacity: 0.95, roughness: 0.18, metalness: 0 }))
  const shell = createSoftSprite(textures.fire, 0xff7a1f, 0.72, 0.25)
  const halo = createSoftSprite(textures.ember, 0xffd37a, 0.42, 0.34)
  group.add(core)
  group.add(shell)
  group.add(halo)
  group.position.copy(start)
  effectGroups.fire.add(group)
  const light = createFxLight(0xff8e24, 1.7, 2.6, start)
  fireProjectiles.push({ group, core, shell, halo, light, velocity: dir.multiplyScalar(3.0), life: 1.15, maxLife: 1.15, spin: (Math.random() - 0.5) * 4.5 })
}

function createIceProjectile(start, dir) {
  if (!canSpawnFx(iceProjectiles, 18, 3)) return
  const group = new THREE.Group()
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.07, 0), new THREE.MeshStandardMaterial({ color: 0xa8f3ff, emissive: 0x58d6ff, emissiveIntensity: 1.4, transparent: true, opacity: 0.82, roughness: 0.08, metalness: 0.12 }))
  crystal.scale.set(0.72, 1.7, 0.72)
  crystal.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
  const aura = createSoftSprite(textures.ice, 0xbef5ff, 0.48, 0.28)
  group.add(crystal)
  group.add(aura)
  group.position.copy(start)
  effectGroups.ice.add(group)
  const light = createFxLight(0x71dfff, 1.15, 2.3, start)
  iceProjectiles.push({ group, crystal, aura, light, velocity: dir.multiplyScalar(4.8), life: 0.9, maxLife: 0.9, spin: (Math.random() - 0.5) * 3.8 })
}

function createLavaProjectile(start, dir) {
  if (performanceMode && countActiveLavaProjectiles() >= 1) return
  const item = acquirePooledLavaItem(lavaPool.projectileItems, 'nextProjectile')
  item.velocity.copy(dir).multiplyScalar(2.35)
  item.group.position.copy(start)
  item.group.rotation.set(0, 0, 0)
  item.life = 1.25
  item.maxLife = 1.25
  item.spin = (Math.random() - 0.5) * 4.2
  item.pulse = Math.random() * Math.PI * 2
  item.core.material.opacity = 0.94
  item.core.material.emissiveIntensity = 1.85
  item.glow.material.opacity = 0.52
  item.halo.material.opacity = 0.30
  item.smoke.material.opacity = 0.18
  item.light.position.copy(start)
  item.light.intensity = performanceMode ? 0.0 : 1.9
  item.glow.visible = true
  item.halo.visible = !performanceMode
  item.smoke.visible = !performanceMode
  setLavaProjectileActive(item, true)
  if (performanceMode) item.light.visible = false
}


function createLavaDrip(position, velocity) {
  if (performanceMode) return
  const item = acquirePooledLavaItem(lavaPool.dripItems, 'nextDrip')
  item.mesh.position.copy(position)
  item.velocity.copy(velocity)
  item.life = 0.45
  item.maxLife = 0.45
  item.mesh.material.opacity = 0.88
  item.mesh.material.emissiveIntensity = 1.35
  item.light.position.copy(position)
  item.light.intensity = 0.5
  setLavaDripActive(item, true)
}

function createLavaPuddle(position, radius = 0.16) {
  if (performanceMode) return
  const item = acquirePooledLavaItem(lavaPool.puddleItems, 'nextPuddle')
  item.group.position.set(position.x, 0, position.z)
  item.life = 1.8
  item.maxLife = 1.8
  item.radius = radius
  item.pulse = Math.random() * Math.PI * 2
  item.group.scale.set(radius / 0.16, 1, radius / 0.16)
  item.puddle.material.opacity = 0.9
  item.puddle.material.emissiveIntensity = 1.55
  item.glow.material.opacity = 0.2
  item.rim.material.opacity = 0.45
  item.light.position.set(position.x, 0.24, position.z)
  item.light.intensity = 1.2
  setLavaPuddleActive(item, true)
}

function createWaterProjectile(start, dir) {
  if (!canSpawnFx(waterProjectiles, 18, 3)) return
  const group = new THREE.Group()
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.048, 18, 18), new THREE.MeshStandardMaterial({ color: 0x7fd5ff, emissive: 0x36aef5, emissiveIntensity: 1.0, transparent: true, opacity: 0.78, roughness: 0.05, metalness: 0.1 }))
  core.scale.set(0.82, 1.32, 0.82)
  core.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
  const aura = createSoftSprite(textures.water, 0x7fcfff, 0.42, 0.26)
  group.add(core)
  group.add(aura)
  group.position.copy(start)
  effectGroups.water.add(group)
  const light = createFxLight(0x55c6ff, 0.95, 2.1, start, 0.26)
  waterProjectiles.push({ group, core, aura, light, velocity: dir.multiplyScalar(4.15), life: 0.95, maxLife: 0.95, spin: (Math.random() - 0.5) * 3.1 })
}

function createEarthProjectile(start, dir) {
  if (!canSpawnFx(earthProjectiles, 14, 2)) return
  const group = new THREE.Group()
  const rock1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.06, 0), new THREE.MeshStandardMaterial({ color: 0x6d5437, emissive: 0x3a2c1a, emissiveIntensity: 0.25, roughness: 0.92, metalness: 0.02 }))
  const rock2 = rock1.clone()
  const rock3 = rock1.clone()
  rock2.position.set(0.05, 0.018, -0.02)
  rock2.scale.setScalar(0.75)
  rock3.position.set(-0.045, -0.02, 0.02)
  rock3.scale.setScalar(0.62)
  const dust = createSoftSprite(textures.earth, 0xc8ac7d, 0.26, 0.3)
  group.add(rock1)
  group.add(rock2)
  group.add(rock3)
  group.add(dust)
  group.position.copy(start)
  effectGroups.earth.add(group)
  earthProjectiles.push({ group, rocks: [rock1, rock2, rock3], dust, velocity: dir.multiplyScalar(2.9), life: 1.1, maxLife: 1.1, spin: new THREE.Vector3((Math.random()-0.5)*3, (Math.random()-0.5)*4, (Math.random()-0.5)*3) })
}


function createShadowProjectile(start, dir) {
  if (!canSpawnFx(shadowProjectiles, 14, 2)) return
  const group = new THREE.Group()
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.055, 18, 18), new THREE.MeshStandardMaterial({ color: 0x020204, emissive: 0x12001c, emissiveIntensity: 0.42, transparent: true, opacity: 0.98, roughness: 0.85, metalness: 0.02 }))
  const vortex = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 10, 28), new THREE.MeshBasicMaterial({ color: 0x9d5fff, transparent: true, opacity: 0.42, depthWrite: false, blending: THREE.AdditiveBlending }))
  const vortexB = vortex.clone()
  vortex.rotation.x = Math.PI * 0.5
  vortexB.rotation.y = Math.PI * 0.5
  vortexB.scale.setScalar(0.78)
  const aura = createSoftSprite(textures.voidRing, 0xb57aff, 0.42, 0.32)
  const smoke = createSoftSprite(textures.darksmoke, 0x8a52ff, 0.24, 0.42)
  const smokeB = createSoftSprite(textures.darksmoke, 0x5d2bb6, 0.18, 0.28)
  smokeB.position.set(0.05, 0.01, 0)
  group.add(core)
  group.add(vortex)
  group.add(vortexB)
  group.add(aura)
  group.add(smoke)
  group.add(smokeB)
  group.position.copy(start)
  effectGroups.shadow.add(group)
  const light = createFxLight(0x7d52ff, 0.95, 1.9, start, 0.28)
  shadowProjectiles.push({ group, core, aura, smoke, smokeB, vortex, vortexB, light, velocity: dir.multiplyScalar(2.55), life: 1.0, maxLife: 1.0, spin: (Math.random() - 0.5) * 2.8 })
}

function createLightProjectile(start, dir) {
  if (!canSpawnFx(lightProjectiles, 14, 2)) return
  const group = new THREE.Group()
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshStandardMaterial({ color: 0xfff2c1, emissive: 0xffd567, emissiveIntensity: 2.35, transparent: true, opacity: 0.94, roughness: 0.18, metalness: 0.02 }))
  const aura = createSoftSprite(textures.light, 0xffdf8e, 0.5, 0.28)
  const sparkle = createSoftSprite(textures.sparkle, 0xfff3cf, 0.35, 0.18)
  group.add(core)
  group.add(aura)
  group.add(sparkle)
  group.position.copy(start)
  effectGroups.light.add(group)
  const light = createFxLight(0xffdd87, 1.2, 2.0, start, 0.3)
  lightProjectiles.push({ group, core, aura, sparkle, light, velocity: dir.multiplyScalar(3.3), life: 0.95, maxLife: 0.95, spin: (Math.random() - 0.5) * 2.0 })
}

function createCrystalProjectile(start, dir) {
  if (!canSpawnFx(crystalProjectiles, 14, 2)) return
  const group = new THREE.Group()
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), new THREE.MeshStandardMaterial({ color: 0xd8c5ff, emissive: 0x8f6cff, emissiveIntensity: 1.4, transparent: true, opacity: 0.8, roughness: 0.1, metalness: 0.08 }))
  crystal.scale.set(0.65, 1.9, 0.65)
  crystal.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
  const aura = createSoftSprite(textures.crystal, 0xc8b4ff, 0.42, 0.26)
  group.add(crystal)
  group.add(aura)
  group.position.copy(start)
  effectGroups.crystal.add(group)
  const light = createFxLight(0xb191ff, 0.95, 2.0, start, 0.3)
  crystalProjectiles.push({ group, crystal, aura, light, velocity: dir.multiplyScalar(4.0), life: 0.9, maxLife: 0.9, spin: (Math.random() - 0.5) * 3.6 })
}

function createVoidBurst(start, dir) {
  if (!canSpawnFx(voidBursts, 12, 2)) return
  const group = new THREE.Group()
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.06, 18, 18), new THREE.MeshStandardMaterial({ color: 0x0f0618, emissive: 0x5a16d7, emissiveIntensity: 1.9, transparent: true, opacity: 0.92, roughness: 0.42, metalness: 0.04 }))
  const ring = createSoftSprite(textures.voidRing, 0x9f73ff, 0.42, 0.3)
  const aura = createSoftSprite(textures.void, 0x7e49ff, 0.3, 0.36)
  group.add(core)
  group.add(ring)
  group.add(aura)
  group.position.copy(start)
  effectGroups.void.add(group)
  const light = createFxLight(0x6d35ff, 0.95, 1.9, start, 0.3)
  voidBursts.push({ group, core, ring, aura, light, velocity: dir.multiplyScalar(2.2), life: 1.0, maxLife: 1.0, spin: (Math.random() - 0.5) * 2.5 })
}

function spawnShadowBurst() {
  const side = Math.random() > 0.5 ? 'left' : 'right'
  const start = getHandWorldPosition(side, tmpVecA.clone())
  const dir = getCastDirection(side, tmpVecB.clone())
  dir.x += (Math.random() - 0.5) * 0.05
  dir.y += (Math.random() - 0.5) * 0.05
  dir.z += (Math.random() - 0.5) * 0.05
  dir.normalize()
  createShadowProjectile(start, dir)
  for (let i = 0; i < fxCount(4, 1); i++) spawnTrail(start, 'shadow', 0.06 + Math.random() * 0.03)
}

function spawnLightBurst() {
  const side = Math.random() > 0.5 ? 'left' : 'right'
  const start = getHandWorldPosition(side, tmpVecA.clone())
  const dir = getCastDirection(side, tmpVecB.clone())
  dir.x += (Math.random() - 0.5) * 0.04
  dir.y += (Math.random() - 0.5) * 0.04
  dir.z += (Math.random() - 0.5) * 0.04
  dir.normalize()
  createLightProjectile(start, dir)
  for (let i = 0; i < fxCount(5, 1); i++) spawnTrail(start, 'light', 0.05 + Math.random() * 0.03)
}

function spawnCrystalBurst() {
  const side = Math.random() > 0.5 ? 'left' : 'right'
  const start = getHandWorldPosition(side, tmpVecA.clone())
  const dir = getCastDirection(side, tmpVecB.clone())
  dir.x += (Math.random() - 0.5) * 0.03
  dir.y += (Math.random() - 0.5) * 0.03
  dir.z += (Math.random() - 0.5) * 0.03
  dir.normalize()
  createCrystalProjectile(start, dir)
  for (let i = 0; i < fxCount(4, 1); i++) spawnTrail(start, 'crystal', 0.055 + Math.random() * 0.025)
}

function spawnVoidBurst() {
  const side = Math.random() > 0.5 ? 'left' : 'right'
  const start = getHandWorldPosition(side, tmpVecA.clone())
  const dir = getCastDirection(side, tmpVecB.clone())
  dir.x += (Math.random() - 0.5) * 0.02
  dir.y += (Math.random() - 0.5) * 0.02
  dir.z += (Math.random() - 0.5) * 0.02
  dir.normalize()
  createVoidBurst(start, dir)
  for (let i = 0; i < fxCount(4, 1); i++) spawnTrail(start, 'void', 0.05 + Math.random() * 0.03)
}

function createLightningPoints(start, end) {
  const points = []
  const segments = 10
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const p = new THREE.Vector3().lerpVectors(start, end, t)
    if (i !== 0 && i !== segments) {
      p.x += (Math.random() - 0.5) * 0.08
      p.y += (Math.random() - 0.5) * 0.12
      p.z += (Math.random() - 0.5) * 0.08
    }
    points.push(p)
  }
  return points
}

function spawnLightningBurst() {
  const side = Math.random() > 0.5 ? 'left' : 'right'
  const start = getHandWorldPosition(side, tmpVecA.clone())
  const dir = getCastDirection(side, tmpVecB.clone())
  const end = start.clone().add(dir.multiplyScalar(0.95 + Math.random() * 0.45))
  const points = createLightningPoints(start, end)
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xb9d9ff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }))
  const glowSprites = []
  for (let i = 1; i < points.length - 1; i += 2) {
    const glow = createSoftSprite(textures.electric, 0x96c7ff, 0.5, 0.11 + Math.random() * 0.04)
    glow.position.copy(points[i])
    effectGroups.lightning.add(glow)
    glowSprites.push(glow)
  }
  effectGroups.lightning.add(line)
  const light = createFxLight(0x92bfff, 1.25, 2.1, start)
  lightningBursts.push({ line, glowSprites, light, life: 0.2, maxLife: 0.2 })
  for (let i = 0; i < fxCount(5, 1); i++) spawnTrail(start, 'lightning', 0.05 + Math.random() * 0.025)
}

function spawnWindBurst() {
  const side = Math.random() > 0.5 ? 'left' : 'right'
  const start = getHandWorldPosition(side, tmpVecA.clone())
  const dir = getCastDirection(side, tmpVecB.clone())
  const group = new THREE.Group()
  const rings = []
  for (let i = 0; i < 3; i++) {
    const sprite = createSoftSprite(textures.wind, 0xeefbff, 0.34 - i * 0.06, 0.26 + i * 0.07)
    sprite.position.set((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, i * 0.08)
    group.add(sprite)
    rings.push(sprite)
  }
  group.position.copy(start)
  effectGroups.wind.add(group)
  const light = createFxLight(0xdff6ff, 0.55, 1.6, start, 0.35)
  windBursts.push({ group, rings, light, velocity: dir.multiplyScalar(2.7), life: 0.75, maxLife: 0.75, spin: (Math.random() > 0.5 ? 1 : -1) * (1.8 + Math.random() * 1.5) })
  for (let i = 0; i < fxCount(6, 1); i++) spawnTrail(start, 'wind', 0.06 + Math.random() * 0.035)
}

function spawnFireBurst() {
  const side = Math.random() > 0.5 ? 'left' : 'right'
  const start = getHandWorldPosition(side, tmpVecA.clone())
  const dir = getCastDirection(side, tmpVecB.clone())
  dir.x += (Math.random() - 0.5) * 0.07
  dir.y += (Math.random() - 0.5) * 0.07
  dir.z += (Math.random() - 0.5) * 0.07
  dir.normalize()
  createFireProjectile(start, dir)
  for (let i = 0; i < fxCount(4, 1); i++) spawnTrail(start, 'fire', 0.08 + Math.random() * 0.05)
}

function spawnIceBurst() {
  const side = Math.random() > 0.5 ? 'left' : 'right'
  const start = getHandWorldPosition(side, tmpVecA.clone())
  const dir = getCastDirection(side, tmpVecB.clone())
  dir.x += (Math.random() - 0.5) * 0.04
  dir.y += (Math.random() - 0.5) * 0.04
  dir.z += (Math.random() - 0.5) * 0.04
  dir.normalize()
  createIceProjectile(start, dir)
  for (let i = 0; i < fxCount(6, 1); i++) spawnTrail(start, 'ice', 0.06 + Math.random() * 0.035)
}

function spawnLavaBurst() {
  const side = Math.random() > 0.5 ? 'left' : 'right'
  const start = getHandWorldPosition(side, tmpVecA.clone())
  const dir = getCastDirection(side, tmpVecB.clone())
  dir.x += (Math.random() - 0.5) * 0.05
  dir.y += (Math.random() - 0.5) * 0.03
  dir.z += (Math.random() - 0.5) * 0.05
  dir.normalize()
  createLavaProjectile(start, dir)
  for (let i = 0; i < fxCount(5, 0); i++) spawnTrail(start, 'lava', 0.07 + Math.random() * 0.045)
}

function spawnEarthBurst() {
  const side = Math.random() > 0.5 ? 'left' : 'right'
  const start = getHandWorldPosition(side, tmpVecA.clone())
  const dir = getCastDirection(side, tmpVecB.clone())
  dir.y = Math.max(dir.y, 0.02)
  dir.normalize()
  createEarthProjectile(start, dir)
  for (let i = 0; i < fxCount(6, 1); i++) spawnTrail(start, 'earth', 0.06 + Math.random() * 0.045)
}

function spawnWaterBurst() {
  const side = Math.random() > 0.5 ? 'left' : 'right'
  const start = getHandWorldPosition(side, tmpVecA.clone())
  const dir = getCastDirection(side, tmpVecB.clone())
  dir.x += (Math.random() - 0.5) * 0.05
  dir.y += (Math.random() - 0.5) * 0.05
  dir.z += (Math.random() - 0.5) * 0.05
  dir.normalize()
  createWaterProjectile(start, dir)
  for (let i = 0; i < fxCount(6, 1); i++) spawnTrail(start, 'water', 0.05 + Math.random() * 0.03)
}

function clearEffects() {
  while (fireProjectiles.length) {
    const item = fireProjectiles.pop()
    effectGroups.fire.remove(item.group)
    disposeGroupResources(item.group)
  }
  while (iceProjectiles.length) {
    const item = iceProjectiles.pop()
    effectGroups.ice.remove(item.group)
    disposeGroupResources(item.group)
  }
  if (lavaPool.initialized) {
    lavaPool.projectileItems.forEach(item => setLavaProjectileActive(item, false))
    lavaPool.dripItems.forEach(item => setLavaDripActive(item, false))
    lavaPool.puddleItems.forEach(item => setLavaPuddleActive(item, false))
  }
  while (waterProjectiles.length) {
    const item = waterProjectiles.pop()
    effectGroups.water.remove(item.group)
    disposeGroupResources(item.group)
  }
  while (earthProjectiles.length) {
    const item = earthProjectiles.pop()
    effectGroups.earth.remove(item.group)
    disposeGroupResources(item.group)
  }
  while (windBursts.length) {
    const item = windBursts.pop()
    effectGroups.wind.remove(item.group)
    disposeGroupResources(item.group)
  }
  while (lightningBursts.length) {
    const item = lightningBursts.pop()
    effectGroups.lightning.remove(item.line)
    item.line.geometry.dispose()
    item.line.material.dispose()
    item.glowSprites.forEach(sprite => {
      effectGroups.lightning.remove(sprite)
      sprite.material.dispose()
    })
  }

  while (shadowProjectiles.length) {
    const item = shadowProjectiles.pop()
    effectGroups.shadow.remove(item.group)
    disposeGroupResources(item.group)
  }
  while (lightProjectiles.length) {
    const item = lightProjectiles.pop()
    effectGroups.light.remove(item.group)
    disposeGroupResources(item.group)
  }
  while (crystalProjectiles.length) {
    const item = crystalProjectiles.pop()
    effectGroups.crystal.remove(item.group)
    disposeGroupResources(item.group)
  }
  while (voidBursts.length) {
    const item = voidBursts.pop()
    effectGroups.void.remove(item.group)
    disposeGroupResources(item.group)
  }
  while (trailParticles.length) {
    const item = trailParticles.pop()
    scene.remove(item.sprite)
    item.sprite.material.dispose()
  }
  while (fxLights.length) {
    const item = fxLights.pop()
    scene.remove(item.light)
  }
  eyeGlowState.timer = 0
}


function updateFire(dt) {
  for (let i = fireProjectiles.length - 1; i >= 0; i--) {
    const p = fireProjectiles[i]
    p.life -= dt
    p.group.position.addScaledVector(p.velocity, dt)
    p.group.rotation.z += p.spin * dt
    p.shell.material.opacity = Math.max(0, 0.72 * (p.life / p.maxLife))
    p.halo.material.opacity = Math.max(0, 0.42 * (p.life / p.maxLife))
    p.core.material.opacity = Math.max(0, 0.95 * (p.life / p.maxLife))
    p.light.position.copy(p.group.position)
    p.light.intensity = 1.8 * (p.life / p.maxLife)
    if (Math.random() > (performanceMode ? 0.985 : 0.22)) spawnTrail(p.group.position, 'fire', 0.06)
    if (p.life <= 0) {
      effectGroups.fire.remove(p.group)
      disposeGroupResources(p.group)
      fireProjectiles.splice(i, 1)
    }
  }
}

function updateIce(dt) {
  for (let i = iceProjectiles.length - 1; i >= 0; i--) {
    const p = iceProjectiles[i]
    p.life -= dt
    p.group.position.addScaledVector(p.velocity, dt)
    p.crystal.rotation.y += p.spin * dt
    p.crystal.rotation.z += p.spin * 0.6 * dt
    p.aura.material.opacity = Math.max(0, 0.48 * (p.life / p.maxLife))
    p.crystal.material.opacity = Math.max(0, 0.82 * (p.life / p.maxLife))
    p.light.position.copy(p.group.position)
    p.light.intensity = 1.2 * (p.life / p.maxLife)
    if (Math.random() > (performanceMode ? 0.985 : 0.18)) spawnTrail(p.group.position, 'ice', 0.045)
    if (p.life <= 0) {
      effectGroups.ice.remove(p.group)
      disposeGroupResources(p.group)
      iceProjectiles.splice(i, 1)
    }
  }
}

function updateLava(dt) {
  if (!lavaPool.initialized) return
  lavaSurfaceTexture.offset.x += dt * (performanceMode ? 0.03 : 0.08)
  lavaSurfaceTexture.offset.y -= dt * (performanceMode ? 0.08 : 0.18)

  for (let i = 0; i < lavaPool.projectileItems.length; i++) {
    const p = lavaPool.projectileItems[i]
    if (!p.active) continue
    p.life -= dt
    p.group.position.addScaledVector(p.velocity, dt)
    p.velocity.y -= dt * 0.22
    p.group.rotation.y += p.spin * dt
    p.group.rotation.z += p.spin * 0.45 * dt
    const pulse = 1.0 + Math.sin(clock.elapsedTime * 10 + p.pulse) * 0.35
    const alpha = Math.max(0, p.life / p.maxLife)
    p.core.material.emissiveIntensity = performanceMode ? (1.05 + pulse * 0.18) : (1.55 + pulse * 0.55)
    p.glow.material.opacity = (performanceMode ? 0.24 : 0.56) * alpha
    p.halo.material.opacity = performanceMode ? 0.0 : 0.30 * alpha
    p.smoke.material.opacity = performanceMode ? 0.0 : 0.20 * alpha
    p.core.material.opacity = (performanceMode ? 0.84 : 0.92) * alpha
    p.light.position.copy(p.group.position)
    p.light.intensity = performanceMode ? 0.0 : (1.45 + pulse * 0.25) * alpha
    if (Math.random() > (performanceMode ? 0.9995 : 0.82)) spawnTrail(p.group.position, 'lava', 0.05)
    if (!performanceMode && Math.random() > 0.965) {
      tmpVecC.copy(p.velocity).multiplyScalar(0.18)
      tmpVecC.y -= 0.35 + Math.random() * 0.18
      createLavaDrip(p.group.position, tmpVecC)
    }
    if (p.life <= 0 || p.group.position.y <= 0.2) {
      if (!performanceMode) {
        createLavaPuddle(p.group.position, 0.13 + Math.random() * 0.09)
        for (let k = 0; k < 2; k++) spawnTrail(p.group.position, 'lava', 0.06 + Math.random() * 0.02)
      }
      setLavaProjectileActive(p, false)
    }
  }

  for (let i = 0; i < lavaPool.dripItems.length; i++) {
    const d = lavaPool.dripItems[i]
    if (!d.active) continue
    d.life -= dt
    d.velocity.y -= dt * 0.95
    d.mesh.position.addScaledVector(d.velocity, dt)
    d.mesh.material.opacity = Math.max(0, 0.88 * (d.life / d.maxLife))
    d.mesh.material.emissiveIntensity = 1.05 + Math.sin(clock.elapsedTime * 12 + i) * 0.18
    d.light.position.copy(d.mesh.position)
    d.light.intensity = 0.48 * (d.life / d.maxLife)
    if (Math.random() > (performanceMode ? 0.998 : 0.96)) spawnTrail(d.mesh.position, 'lava', 0.028)
    if (d.life <= 0 || d.mesh.position.y <= 0.19) {
      if (d.mesh.position.y <= 0.19) createLavaPuddle(d.mesh.position, 0.05 + Math.random() * 0.03)
      setLavaDripActive(d, false)
    }
  }

  for (let i = 0; i < lavaPool.puddleItems.length; i++) {
    const p = lavaPool.puddleItems[i]
    if (!p.active) continue
    p.life -= dt
    const alpha = Math.max(0, p.life / p.maxLife)
    const pulse = 1.0 + Math.sin(clock.elapsedTime * 7 + p.pulse) * 0.24
    p.puddle.material.emissiveIntensity = 1.15 + pulse * 0.55
    p.puddle.material.opacity = 0.86 * alpha
    p.glow.material.opacity = 0.20 * alpha + 0.05 * pulse
    p.group.scale.x = (p.radius / 0.16) * (1 + (1 - alpha) * 0.22)
    p.group.scale.z = (p.radius / 0.16) * (1 + (1 - alpha) * 0.22)
    p.light.intensity = (0.9 + pulse * 0.18) * alpha
    if (Math.random() > (performanceMode ? 0.998 : 0.985)) {
      tmpVecC.set(p.group.position.x, 0.19, p.group.position.z)
      spawnTrail(tmpVecC, 'lava', 0.04)
    }
    if (p.life <= 0) setLavaPuddleActive(p, false)
  }
}

function updateWater(dt) {
  for (let i = waterProjectiles.length - 1; i >= 0; i--) {
    const p = waterProjectiles[i]
    p.life -= dt
    p.group.position.addScaledVector(p.velocity, dt)
    p.core.rotation.y += p.spin * dt
    p.core.rotation.z += p.spin * 0.35 * dt
    p.aura.material.opacity = Math.max(0, 0.42 * (p.life / p.maxLife))
    p.core.material.opacity = Math.max(0, 0.78 * (p.life / p.maxLife))
    p.light.position.copy(p.group.position)
    p.light.intensity = 1.0 * (p.life / p.maxLife)
    if (Math.random() > (performanceMode ? 0.985 : 0.2)) spawnTrail(p.group.position, 'water', 0.04)
    if (p.life <= 0) {
      effectGroups.water.remove(p.group)
      disposeGroupResources(p.group)
      waterProjectiles.splice(i, 1)
    }
  }
}

function updateEarth(dt) {
  for (let i = earthProjectiles.length - 1; i >= 0; i--) {
    const p = earthProjectiles[i]
    p.life -= dt
    p.group.position.addScaledVector(p.velocity, dt)
    p.rocks[0].rotation.x += p.spin.x * dt
    p.rocks[1].rotation.y += p.spin.y * dt
    p.rocks[2].rotation.z += p.spin.z * dt
    p.dust.material.opacity = Math.max(0, 0.25 * (p.life / p.maxLife))
    if (Math.random() > (performanceMode ? 0.99 : 0.18)) spawnTrail(p.group.position, 'earth', 0.045)
    if (p.life <= 0) {
      effectGroups.earth.remove(p.group)
      disposeGroupResources(p.group)
      earthProjectiles.splice(i, 1)
    }
  }
}

function updateWind(dt) {
  for (let i = windBursts.length - 1; i >= 0; i--) {
    const p = windBursts[i]
    p.life -= dt
    p.group.position.addScaledVector(p.velocity, dt)
    p.group.rotation.z += p.spin * dt
    p.rings.forEach((ring, idx) => {
      ring.material.opacity = Math.max(0, (0.34 - idx * 0.06) * (p.life / p.maxLife))
      ring.scale.multiplyScalar(1.008)
    })
    p.light.position.copy(p.group.position)
    p.light.intensity = 0.55 * (p.life / p.maxLife)
    if (Math.random() > (performanceMode ? 0.985 : 0.25)) spawnTrail(p.group.position, 'wind', 0.05)
    if (p.life <= 0) {
      effectGroups.wind.remove(p.group)
      disposeGroupResources(p.group)
      windBursts.splice(i, 1)
    }
  }
}

function updateLightning(dt) {
  for (let i = lightningBursts.length - 1; i >= 0; i--) {
    const p = lightningBursts[i]
    p.life -= dt
    const alpha = Math.max(0, p.life / p.maxLife)
    p.line.material.opacity = 0.95 * alpha
    p.glowSprites.forEach(sprite => sprite.material.opacity = 0.5 * alpha)
    p.light.intensity = 1.3 * alpha
    if (p.life <= 0) {
      effectGroups.lightning.remove(p.line)
      p.line.geometry.dispose()
      p.line.material.dispose()
      p.glowSprites.forEach(sprite => {
        effectGroups.lightning.remove(sprite)
        sprite.material.dispose()
      })
      lightningBursts.splice(i, 1)
    }
  }
}


function updateShadow(dt) {
  for (let i = shadowProjectiles.length - 1; i >= 0; i--) {
    const p = shadowProjectiles[i]
    p.life -= dt
    const alpha = Math.max(0, p.life / p.maxLife)
    p.group.position.addScaledVector(p.velocity, dt)
    p.group.rotation.y += p.spin * dt
    p.vortex.rotation.z += (2.5 + p.spin) * dt
    p.vortexB.rotation.x -= (2.0 - p.spin * 0.35) * dt
    p.smoke.material.rotation += 1.1 * dt
    p.smokeB.material.rotation -= 1.6 * dt
    p.aura.material.opacity = 0.4 * alpha
    p.smoke.material.opacity = 0.22 * alpha
    p.smokeB.material.opacity = 0.18 * alpha
    p.core.material.opacity = 0.98 * alpha
    p.vortex.material.opacity = 0.42 * alpha
    p.vortexB.material.opacity = 0.28 * alpha
    p.smoke.position.set(Math.cos(clock.elapsedTime * 5.3 + i) * 0.018, Math.sin(clock.elapsedTime * 4.2 + i) * 0.012, 0)
    p.smokeB.position.set(Math.cos(clock.elapsedTime * 3.4 + i * 0.7) * -0.026, Math.sin(clock.elapsedTime * 5.1 + i * 0.2) * 0.014, 0)
    p.light.position.copy(p.group.position)
    p.light.intensity = 0.95 * alpha
    if (Math.random() > (performanceMode ? 0.992 : 0.72)) spawnTrail(p.group.position, 'shadow', 0.045)
    if (p.life <= 0) {
      effectGroups.shadow.remove(p.group)
      disposeGroupResources(p.group)
      shadowProjectiles.splice(i, 1)
    }
  }
}

function updateLight(dt) {
  for (let i = lightProjectiles.length - 1; i >= 0; i--) {
    const p = lightProjectiles[i]
    p.life -= dt
    p.group.position.addScaledVector(p.velocity, dt)
    p.group.rotation.z += p.spin * dt
    p.aura.material.opacity = Math.max(0, 0.5 * (p.life / p.maxLife))
    p.sparkle.material.opacity = Math.max(0, 0.35 * (p.life / p.maxLife))
    p.core.material.opacity = Math.max(0, 0.94 * (p.life / p.maxLife))
    p.light.position.copy(p.group.position)
    p.light.intensity = 1.15 * (p.life / p.maxLife)
    if (Math.random() > (performanceMode ? 0.992 : 0.7)) spawnTrail(p.group.position, 'light', 0.04)
    if (p.life <= 0) {
      effectGroups.light.remove(p.group)
      disposeGroupResources(p.group)
      lightProjectiles.splice(i, 1)
    }
  }
}

function updateCrystal(dt) {
  for (let i = crystalProjectiles.length - 1; i >= 0; i--) {
    const p = crystalProjectiles[i]
    p.life -= dt
    p.group.position.addScaledVector(p.velocity, dt)
    p.crystal.rotation.y += p.spin * dt
    p.crystal.rotation.z += p.spin * 0.45 * dt
    p.aura.material.opacity = Math.max(0, 0.42 * (p.life / p.maxLife))
    p.crystal.material.opacity = Math.max(0, 0.82 * (p.life / p.maxLife))
    p.light.position.copy(p.group.position)
    p.light.intensity = 0.95 * (p.life / p.maxLife)
    if (Math.random() > (performanceMode ? 0.992 : 0.72)) spawnTrail(p.group.position, 'crystal', 0.042)
    if (p.life <= 0) {
      effectGroups.crystal.remove(p.group)
      disposeGroupResources(p.group)
      crystalProjectiles.splice(i, 1)
    }
  }
}

function updateVoid(dt) {
  for (let i = voidBursts.length - 1; i >= 0; i--) {
    const p = voidBursts[i]
    p.life -= dt
    p.group.position.addScaledVector(p.velocity, dt)
    p.group.rotation.z += p.spin * dt
    const alpha = Math.max(0, p.life / p.maxLife)
    p.ring.material.opacity = 0.42 * alpha
    p.aura.material.opacity = 0.28 * alpha
    p.core.material.opacity = 0.92 * alpha
    p.ring.scale.multiplyScalar(1.01)
    p.light.position.copy(p.group.position)
    p.light.intensity = 0.95 * alpha
    if (Math.random() > (performanceMode ? 0.992 : 0.75)) spawnTrail(p.group.position, 'void', 0.045)
    if (p.life <= 0) {
      effectGroups.void.remove(p.group)
      disposeGroupResources(p.group)
      voidBursts.splice(i, 1)
    }
  }
}

function updateTrailAndLights(dt) {
  for (let i = trailParticles.length - 1; i >= 0; i--) {
    const t = trailParticles[i]
    t.life -= dt
    t.sprite.material.opacity = Math.max(0, 0.82 * (t.life / t.maxLife))
    t.sprite.position.addScaledVector(t.drift, dt)
    t.sprite.material.rotation += t.spin * dt
    t.sprite.scale.multiplyScalar(1.02)
    if (t.life <= 0) {
      scene.remove(t.sprite)
      t.sprite.material.dispose()
      trailParticles.splice(i, 1)
    }
  }
  for (let i = fxLights.length - 1; i >= 0; i--) {
    const l = fxLights[i]
    l.life -= dt
    l.light.intensity *= 0.96
    if (l.life <= 0 || l.light.intensity < 0.02) {
      scene.remove(l.light)
      fxLights.splice(i, 1)
    }
  }
}

function updateEffects(dt) {
  updateFire(dt)
  updateIce(dt)
  updateLightning(dt)
  updateWind(dt)
  updateShadow(dt)
  updateLight(dt)
  updateCrystal(dt)
  updateVoid(dt)
  lavaUpdateAccumulator += dt
  const lavaStep = performanceMode ? 1 / 8 : 1 / 30
  const lavaLoopLimit = performanceMode ? 1 : 2
  let lavaLoops = 0
  while (lavaUpdateAccumulator >= lavaStep && lavaLoops < lavaLoopLimit) {
    updateLava(lavaStep)
    lavaUpdateAccumulator -= lavaStep
    lavaLoops++
  }
  updateEarth(dt)
  updateWater(dt)
  if (currentFxType !== 'none') triggerEyeGlow(currentFxType, performanceMode ? 0.32 : 0.82)
  updateElementalAuras()
  updateEyeGlow(dt)
  updateTrailAndLights(dt)
}

function maybeEmitFx(dt) {
  if (!activeClip || !mixer || !playState || currentFxType === 'none') return
  effectClock += dt
  const duration = Math.max(activeClip.duration || 1, 0.8)
  const slowTypes = ['earth', 'lava', 'wind', 'void']
  const mediumTypes = ['water', 'fire', 'ice', 'shadow', 'light', 'crystal']
  let baseInterval = 0.22
  if (slowTypes.includes(currentFxType)) baseInterval = Math.max(0.32, Math.min(0.82, duration * 0.2))
  else if (mediumTypes.includes(currentFxType)) baseInterval = Math.max(0.25, Math.min(0.68, duration * 0.17))
  else baseInterval = Math.max(0.18, Math.min(0.46, duration * 0.14))
  if (performanceMode) baseInterval *= currentFxType === 'lava' ? 3.8 : 2.45
  if (effectClock - lastEffectBurst < baseInterval) return
  lastEffectBurst = effectClock
  triggerEyeGlow(currentFxType, performanceMode ? 0.28 : 0.72)

  if (currentFxType === 'fire') {
    spawnFireBurst()
    if (!performanceMode && Math.random() > 0.32) spawnFireBurst()
  } else if (currentFxType === 'ice') {
    spawnIceBurst()
    if (!performanceMode && Math.random() > 0.4) spawnIceBurst()
  } else if (currentFxType === 'lightning') {
    spawnLightningBurst()
    if (!performanceMode && Math.random() > 0.2) spawnLightningBurst()
  } else if (currentFxType === 'wind') {
    spawnWindBurst()
    if (!performanceMode && Math.random() > 0.3) spawnWindBurst()
  } else if (currentFxType === 'lava') {
    spawnLavaBurst()
    if (!performanceMode && Math.random() > 0.88) spawnLavaBurst()
  } else if (currentFxType === 'earth') {
    spawnEarthBurst()
    if (!performanceMode && Math.random() > 0.5) spawnEarthBurst()
  } else if (currentFxType === 'water') {
    spawnWaterBurst()
    if (!performanceMode && Math.random() > 0.35) spawnWaterBurst()
  } else if (currentFxType === 'shadow') {
    spawnShadowBurst()
    if (!performanceMode && Math.random() > 0.58) spawnShadowBurst()
  } else if (currentFxType === 'light') {
    spawnLightBurst()
    if (!performanceMode && Math.random() > 0.62) spawnLightBurst()
  } else if (currentFxType === 'crystal') {
    spawnCrystalBurst()
    if (!performanceMode && Math.random() > 0.6) spawnCrystalBurst()
  } else if (currentFxType === 'void') {
    spawnVoidBurst()
    if (!performanceMode && Math.random() > 0.7) spawnVoidBurst()
  }
}

function getFxForAnimation(name) {
  const mode = fxModeSelect.value
  if (mode !== 'auto') return mode
  return autoFxMap[name] || 'none'
}

function prettyFxName(fx) {
  if (fx === 'fire') return 'Bolas de fogo'
  if (fx === 'ice') return 'Rajadas de gelo'
  if (fx === 'lightning') return 'Raios pelas mãos'
  if (fx === 'wind') return 'Vento'
  if (fx === 'lava') return 'Lava'
  if (fx === 'earth') return 'Terra'
  if (fx === 'water') return 'Água'
  if (fx === 'shadow') return 'Sombra'
  if (fx === 'light') return 'Luz'
  if (fx === 'crystal') return 'Cristal'
  if (fx === 'void') return 'Void'
  return 'Sem efeito'
}

function updateBadges() {
  currentAnimBadge.textContent = 'Animação: ' + (activeClip ? getAnimationDisplayName(activeClip.name) : '-')
  currentFxBadge.textContent = 'FX: ' + prettyFxName(currentFxType)
}

function setPlayState(playing) {
  playState = playing
  if (activeAction) activeAction.paused = !playing
  for (const instance of petState.instances) {
    if (instance && instance.action) instance.action.paused = !playing
  }
  playBtn.textContent = playing ? 'Pause' : 'Play'
}

function playAnimationByName(name) {
  const clip = animations.find(a => a.name === name)
  if (!clip || !mixer) return
  if (activeAction) activeAction.fadeOut(0.18)
  const action = mixer.clipAction(clip)
  action.reset()
  action.enabled = true
  action.setLoop(THREE.LoopRepeat)
  action.clampWhenFinished = false
  action.fadeIn(0.18)
  action.timeScale = parseFloat(speedRange.value)
  action.play()
  activeAction = action
  activeClip = clip
  currentFxType = getFxForAnimation(clip.name)
  effectClock = 0
  lastEffectBurst = -10
  lavaUpdateAccumulator = 0
  clearEffects()
  updateBadges()
  setPlayState(true)
  animationSelect.value = clip.name
}

function rebuildSelect() {
  const query = searchInput ? normalizeName(searchInput.value.trim()) : ''
  filteredAnimationNames = allAnimationNames.filter(name => {
    const matchSearch = animationMatchesSearch(name, query)
    const matchFx = !fxOnlyMode || getFxForAnimation(name) !== 'none' || isRunescapeModel(currentModelKey)
    return matchSearch && matchFx
  })
  animationSelect.innerHTML = ''
  for (const name of filteredAnimationNames) {
    const option = document.createElement('option')
    const fx = autoFxMap[name] || 'none'
    option.value = name
    const label = getAnimationDisplayName(name)
    option.textContent = fx !== 'none' ? label + '  •  ' + prettyFxName(fx) : label
    animationSelect.appendChild(option)
  }
  if (!filteredAnimationNames.length) {
    const option = document.createElement('option')
    option.value = ''
    option.textContent = 'Nenhuma animação encontrada'
    animationSelect.appendChild(option)
  }
  const targetName = activeClip && filteredAnimationNames.includes(activeClip.name) ? activeClip.name : filteredAnimationNames[0]
  if (targetName) animationSelect.value = targetName
}

function moveSelection(step) {
  if (!filteredAnimationNames.length) return
  const current = animationSelect.value
  let idx = filteredAnimationNames.indexOf(current)
  if (idx < 0) idx = 0
  idx = (idx + step + filteredAnimationNames.length) % filteredAnimationNames.length
  const nextName = filteredAnimationNames[idx]
  animationSelect.value = nextName
  playAnimationByName(nextName)
}

function setupModel(gltf, modelKey = currentModelKey) {
  modelPivot = new THREE.Group()
  scene.add(modelPivot)
  modelRoot = gltf.scene
  modelPivot.add(modelRoot)
  const platformHeight = 0.18
  const fitEntry = getModelFitEntry(modelKey)
  const modelRotationY = Number(fitEntry.rotationY)
  if (Number.isFinite(modelRotationY)) modelRoot.rotation.y += modelRotationY
  let box = getModelFitBox(modelRoot, fitEntry)
  const rawSize = box.getSize(new THREE.Vector3())
  const targetHeight = getFitTargetHeight(fitEntry)
  if (rawSize.y > 0) {
    const normalizeScale = targetHeight / rawSize.y
    modelRoot.scale.setScalar(normalizeScale)
    box = getModelFitBox(modelRoot, fitEntry)
  }
  const center = box.getCenter(new THREE.Vector3())
  modelRoot.position.x = -center.x
  modelRoot.position.z = -center.z
  modelRoot.position.y = platformHeight - box.min.y
  modelRoot.updateWorldMatrix(true, true)
  box = getModelFitBox(modelRoot, fitEntry)
  const size = box.getSize(new THREE.Vector3())
  const placementCenterWorld = box.getCenter(new THREE.Vector3())
  modelRoot.userData.petPlacementSize = size.clone()
  modelRoot.userData.petPlacementCenterLocal = modelRoot.worldToLocal(placementCenterWorld.clone())
  centerBone = pickCenterBone(modelRoot)
  stabilizeCharacterOnPlatform()
  cameraControl.target.set(0, box.min.y + size.y * 0.56, 0)
  resetCameraView()
  modelRoot.traverse(obj => {
    if (obj.isMesh) {
      obj.castShadow = true
      obj.receiveShadow = true
      if (isRunescapeModel(modelKey)) obj.frustumCulled = false
      if (obj.material) {
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material]
        for (const mat of materials) {
          if ('envMapIntensity' in mat) mat.envMapIntensity = 1.0
          mat.transparent = !!mat.transparent
          if (isRunescapeModel(modelKey)) {
            mat.side = THREE.DoubleSide
            mat.needsUpdate = true
          }
        }
      }
    }
    if (obj.isBone) {
      if (obj.name === 'L_Hand') hands.left = obj
      if (obj.name === 'R_Hand') hands.right = obj
      if (obj.name === 'R_Forearm') hands.rightForearm = obj
      if (obj.name === 'Head') headBone = obj
    }
  })
  resolveSpecialBonesForModel()
  if (isDevilsirModel(modelKey)) {
    lockDevilsirShouldersToRig()
    collectDevilsirSwordMeshes()
    applyDevilsirSwordVisibility()
    lockRunescapeStaffToHand()
    prepareRunescapeStaffAnchor(modelKey)
  } else {
    applyHandAccessory(handItemModeSelect ? handItemModeSelect.value : 'none')
  }
  applyPetMode(petModeSelect ? petModeSelect.value : 'none')
  attachCharacterShadow()
  key.target = modelPivot || modelRoot
  scene.add(key.target)
  animations = prepareAnimationsForModel(gltf.animations, modelKey)
  allAnimationNames = animations.map(a => a.name)
  autoFxMap = assignAutoEffects(allAnimationNames)
  mixer = new THREE.AnimationMixer(modelRoot)
  rebuildSelect()
  const preferred = allAnimationNames.find(name => autoFxMap[name] !== 'none') || allAnimationNames[0]
  if (preferred) playAnimationByName(preferred)
  loading.classList.add('hidden')
}

populateModelSelect()
populatePetSelect()
if (modelSelect) {
  modelSelect.addEventListener('change', () => {
    loadSelectedModel(modelSelect.value)
  })
}
if (searchInput) searchInput.addEventListener('input', rebuildSelect)
animationSelect.addEventListener('change', () => { if (animationSelect.value) playAnimationByName(animationSelect.value) })
playBtn.addEventListener('click', () => setPlayState(!playState))
prevBtn.addEventListener('click', () => moveSelection(-1))
nextBtn.addEventListener('click', () => moveSelection(1))
fxOnlyBtn.addEventListener('click', () => {
  fxOnlyMode = !fxOnlyMode
  fxOnlyBtn.classList.toggle('active', fxOnlyMode)
  rebuildSelect()
})
resetCamBtn.addEventListener('click', resetCameraView)
fxModeSelect.addEventListener('change', () => {
  currentFxType = activeClip ? getFxForAnimation(activeClip.name) : 'none'
  clearEffects()
  lavaUpdateAccumulator = 0
  effectClock = 0
  lastEffectBurst = -10
  updateBadges()
  rebuildSelect()
})
handItemModeSelect.addEventListener('change', () => {
  applyHandAccessory(handItemModeSelect.value)
})
if (petModeSelect) {
  petModeSelect.addEventListener('change', () => {
    applyPetMode(petModeSelect.value)
  })
}
if (petAnimationModeSelect) {
  petAnimationModeSelect.addEventListener('change', () => {
    applyPetAnimationMode(petAnimationModeSelect.value)
  })
}
if (sceneModeSelect) {
  sceneModeSelect.addEventListener('change', () => {
    applyEnvironmentScene(sceneModeSelect.value)
  })
}
if (lightingModeSelect) {
  lightingModeSelect.addEventListener('change', () => {
    applyLightingMode(lightingModeSelect.value)
  })
}
if (ambienceModeSelect) {
  ambienceModeSelect.addEventListener('change', () => {
    applyAmbienceMode(ambienceModeSelect.value)
  })
}
qualityModeSelect.addEventListener('change', () => {
  applyQualityMode(qualityModeSelect.value)
})
speedRange.addEventListener('input', () => {
  const speed = parseFloat(speedRange.value)
  if (activeAction) activeAction.timeScale = speed
  for (const instance of petState.instances) {
    if (instance && instance.action) instance.action.timeScale = speed
  }
})

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, performanceMode ? 0.85 : 2))
})

function animate() {
  requestAnimationFrame(animate)
  const dt = Math.min(clock.getDelta(), 0.05)
  if (mixer && playState) mixer.update(dt)
  updatePetAnimations(dt)
  enforceRunescapeStaffAnchor()
  if (modelPivot && centerBone) stabilizeCharacterOnPlatform()
  updateCameraController()
  updatePetPlacements()
  updateHandAccessoryWorld()
  updateEnvironmentDetails(dt)
  platformGlow.material.opacity = 0.44 + Math.sin(clock.elapsedTime * 2.0) * 0.08
  maybeEmitFx(dt)
  updateEffects(dt)
  renderer.render(scene, camera)
}

initializeEnvironmentSystem()
resetCameraView()
applyEnvironmentScene(sceneModeSelect ? sceneModeSelect.value : 'studio')
applyLightingMode(lightingModeSelect ? lightingModeSelect.value : 'auto')
applyAmbienceMode(ambienceModeSelect ? ambienceModeSelect.value : 'full')
applyQualityMode(qualityModeSelect ? qualityModeSelect.value : 'normal')
updateModelSpecificControls()
loadSelectedModel(modelSelect && modelSelect.value ? modelSelect.value : 'lucas')
animate()
