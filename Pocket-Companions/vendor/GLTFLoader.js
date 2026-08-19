import {
  AnimationClip,
  Bone,
  Box3,
  BufferAttribute,
  BufferGeometry,
  ClampToEdgeWrapping,
  Color,
  DoubleSide,
  FileLoader,
  FrontSide,
  Group,
  InterpolateDiscrete,
  LinearFilter,
  LinearMipmapLinearFilter,
  Loader,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
  NearestFilter,
  NearestMipmapLinearFilter,
  NearestMipmapNearestFilter,
  Object3D,
  QuaternionKeyframeTrack,
  RepeatWrapping,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  TextureLoader,
  VectorKeyframeTrack
} from './three.module.js';

const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

const COMPONENTS = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
};

const TYPE_SIZE = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
};

const ATTRIBUTE_NAMES = {
  POSITION: 'position',
  NORMAL: 'normal',
  TEXCOORD_0: 'uv',
  TEXCOORD_1: 'uv1',
  COLOR_0: 'color',
  JOINTS_0: 'skinIndex',
  WEIGHTS_0: 'skinWeight'
};

const WRAPPING = {
  33071: ClampToEdgeWrapping,
  33648: MirroredRepeatWrapping,
  10497: RepeatWrapping
};

const FILTERS = {
  9728: NearestFilter,
  9729: LinearFilter,
  9984: NearestMipmapNearestFilter,
  9985: NearestMipmapLinearFilter,
  9986: LinearMipmapLinearFilter,
  9987: LinearMipmapLinearFilter
};

function sanitizeName(value, index) {
  const cleaned = String(value || `node_${index}`)
    .replace(/\s+/g, '_')
    .replace(/[\[\].:/\\]/g, '_');
  return `${cleaned}_${index}`;
}

function cloneTypedArray(array) {
  return new array.constructor(array);
}

function getAccessorArray(json, binaryChunk, accessorIndex) {
  const accessor = json.accessors[accessorIndex];
  const componentType = COMPONENTS[accessor.componentType];
  const itemSize = TYPE_SIZE[accessor.type];
  if (!componentType || !itemSize) throw new Error(`Unsupported glTF accessor ${accessor.componentType}/${accessor.type}.`);
  if (accessor.bufferView === undefined) return new componentType(accessor.count * itemSize);

  const view = json.bufferViews[accessor.bufferView];
  const componentBytes = componentType.BYTES_PER_ELEMENT;
  const byteOffset = (view.byteOffset || 0) + (accessor.byteOffset || 0);
  const byteStride = view.byteStride || itemSize * componentBytes;
  const elementBytes = itemSize * componentBytes;

  if (byteStride === elementBytes) {
    return new componentType(binaryChunk, byteOffset, accessor.count * itemSize);
  }

  const source = new Uint8Array(binaryChunk, byteOffset, byteStride * accessor.count);
  const output = new componentType(accessor.count * itemSize);
  for (let row = 0; row < accessor.count; row += 1) {
    const sourceOffset = row * byteStride;
    const targetBytes = new Uint8Array(output.buffer, row * elementBytes, elementBytes);
    targetBytes.set(source.subarray(sourceOffset, sourceOffset + elementBytes));
  }
  return output;
}

function getBufferView(json, binaryChunk, index) {
  const view = json.bufferViews[index];
  const start = view.byteOffset || 0;
  const end = start + view.byteLength;
  return binaryChunk.slice(start, end);
}

function parseGLB(data) {
  const view = new DataView(data);
  if (view.getUint32(0, true) !== GLB_MAGIC) throw new Error('Pocket Companions supports binary .glb models only.');
  const version = view.getUint32(4, true);
  if (version !== 2) throw new Error(`Unsupported glTF version ${version}.`);

  let offset = 12;
  let json = null;
  let binaryChunk = null;
  while (offset < data.byteLength) {
    const length = view.getUint32(offset, true);
    const type = view.getUint32(offset + 4, true);
    offset += 8;
    const chunk = data.slice(offset, offset + length);
    if (type === JSON_CHUNK) {
      const text = new TextDecoder().decode(chunk).replace(/[\u0000\s]+$/g, '');
      json = JSON.parse(text);
    } else if (type === BIN_CHUNK) {
      binaryChunk = chunk;
    }
    offset += length;
  }
  if (!json || !binaryChunk) throw new Error('Invalid GLB: JSON or binary chunk is missing.');
  return { json, binaryChunk };
}

async function loadTexture(json, binaryChunk, textureIndex, colorTexture = false) {
  if (globalThis.__POCKET_COMPANIONS_SKIP_TEXTURES__) return null;
  const textureDef = json.textures?.[textureIndex];
  if (!textureDef) return null;
  const imageDef = json.images?.[textureDef.source];
  if (!imageDef) return null;

  let url;
  let revoke = false;
  if (imageDef.bufferView !== undefined) {
    const blob = new Blob([getBufferView(json, binaryChunk, imageDef.bufferView)], {
      type: imageDef.mimeType || 'application/octet-stream'
    });
    url = URL.createObjectURL(blob);
    revoke = true;
  } else if (imageDef.uri) {
    url = imageDef.uri;
  } else {
    return null;
  }

  try {
    const texture = await new Promise((resolve, reject) => {
      new TextureLoader().load(url, resolve, undefined, reject);
    });
    texture.flipY = false;
    if (colorTexture) texture.colorSpace = SRGBColorSpace;
    const sampler = json.samplers?.[textureDef.sampler] || {};
    texture.wrapS = WRAPPING[sampler.wrapS] || RepeatWrapping;
    texture.wrapT = WRAPPING[sampler.wrapT] || RepeatWrapping;
    texture.magFilter = FILTERS[sampler.magFilter] || LinearFilter;
    texture.minFilter = FILTERS[sampler.minFilter] || LinearMipmapLinearFilter;
    texture.name = imageDef.name || `texture_${textureIndex}`;
    texture.needsUpdate = true;
    return texture;
  } finally {
    if (revoke) URL.revokeObjectURL(url);
  }
}

async function buildMaterials(json, binaryChunk) {
  const definitions = json.materials || [];
  return Promise.all(definitions.map(async (definition, materialIndex) => {
    const pbr = definition.pbrMetallicRoughness || {};
    const factor = pbr.baseColorFactor || [1, 1, 1, 1];
    const material = new MeshStandardMaterial({
      name: definition.name || `material_${materialIndex}`,
      color: new Color(factor[0], factor[1], factor[2]),
      opacity: factor[3],
      transparent: definition.alphaMode === 'BLEND' || factor[3] < 1,
      alphaTest: definition.alphaMode === 'MASK' ? (definition.alphaCutoff ?? 0.5) : 0,
      metalness: pbr.metallicFactor ?? 1,
      roughness: pbr.roughnessFactor ?? 1,
      side: definition.doubleSided ? DoubleSide : FrontSide
    });

    if (pbr.baseColorTexture) material.map = await loadTexture(json, binaryChunk, pbr.baseColorTexture.index, true);
    if (definition.normalTexture) {
      material.normalMap = await loadTexture(json, binaryChunk, definition.normalTexture.index, false);
      const scale = definition.normalTexture.scale ?? 1;
      material.normalScale.set(scale, scale);
    }
    material.needsUpdate = true;
    return material;
  }));
}

function buildGeometries(json, binaryChunk) {
  return (json.meshes || []).map((meshDef, meshIndex) => {
    return meshDef.primitives.map((primitive, primitiveIndex) => {
      if ((primitive.mode ?? 4) !== 4) throw new Error('Only triangle GLB meshes are supported.');
      const geometry = new BufferGeometry();
      for (const [semantic, accessorIndex] of Object.entries(primitive.attributes || {})) {
        const name = ATTRIBUTE_NAMES[semantic];
        if (!name) continue;
        const accessor = json.accessors[accessorIndex];
        const array = getAccessorArray(json, binaryChunk, accessorIndex);
        geometry.setAttribute(name, new BufferAttribute(array, TYPE_SIZE[accessor.type], Boolean(accessor.normalized)));
      }
      if (primitive.indices !== undefined) {
        const indexAccessor = json.accessors[primitive.indices];
        geometry.setIndex(new BufferAttribute(getAccessorArray(json, binaryChunk, primitive.indices), TYPE_SIZE[indexAccessor.type]));
      }
      if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      geometry.name = `${meshDef.name || `mesh_${meshIndex}`}_${primitiveIndex}`;
      return { geometry, materialIndex: primitive.material ?? -1 };
    });
  });
}

function applyNodeTransform(object, definition) {
  if (definition.matrix) {
    object.matrix.fromArray(definition.matrix);
    object.matrix.decompose(object.position, object.quaternion, object.scale);
  } else {
    if (definition.translation) object.position.fromArray(definition.translation);
    if (definition.rotation) object.quaternion.fromArray(definition.rotation);
    if (definition.scale) object.scale.fromArray(definition.scale);
  }
}

function buildAnimations(json, binaryChunk, nodes) {
  return (json.animations || []).map((animationDef, animationIndex) => {
    const tracks = [];
    for (const channel of animationDef.channels || []) {
      const sampler = animationDef.samplers[channel.sampler];
      const node = nodes[channel.target.node];
      if (!node || channel.target.path === 'weights') continue;
      const input = cloneTypedArray(getAccessorArray(json, binaryChunk, sampler.input));
      const output = cloneTypedArray(getAccessorArray(json, binaryChunk, sampler.output));
      let track;
      if (channel.target.path === 'rotation') {
        track = new QuaternionKeyframeTrack(`${node.name}.quaternion`, input, output);
      } else if (channel.target.path === 'translation') {
        track = new VectorKeyframeTrack(`${node.name}.position`, input, output);
      } else if (channel.target.path === 'scale') {
        track = new VectorKeyframeTrack(`${node.name}.scale`, input, output);
      }
      if (!track) continue;
      if (sampler.interpolation === 'STEP') track.setInterpolation(InterpolateDiscrete);
      tracks.push(track);
    }
    return new AnimationClip(animationDef.name || `animation_${animationIndex}`, -1, tracks);
  });
}

async function buildGLTF(data) {
  const { json, binaryChunk } = parseGLB(data);
  const materials = await buildMaterials(json, binaryChunk);
  const geometries = buildGeometries(json, binaryChunk);
  const jointIndices = new Set((json.skins || []).flatMap((skin) => skin.joints || []));
  const nodes = (json.nodes || []).map((definition, index) => {
    const object = jointIndices.has(index) ? new Bone() : new Object3D();
    object.name = sanitizeName(definition.name, index);
    object.userData.gltfNodeIndex = index;
    applyNodeTransform(object, definition);
    return object;
  });

  for (let index = 0; index < nodes.length; index += 1) {
    const definition = json.nodes[index];
    const node = nodes[index];
    for (const childIndex of definition.children || []) node.add(nodes[childIndex]);
  }

  const meshNodes = [];
  for (let index = 0; index < nodes.length; index += 1) {
    const definition = json.nodes[index];
    if (definition.mesh === undefined) continue;
    const primitives = geometries[definition.mesh] || [];
    const holder = nodes[index];
    const meshes = primitives.map((primitive, primitiveIndex) => {
      const material = materials[primitive.materialIndex] || new MeshStandardMaterial({ color: 0xffffff });
      const mesh = definition.skin !== undefined
        ? new SkinnedMesh(primitive.geometry, material)
        : new Mesh(primitive.geometry, material);
      mesh.name = `${holder.name}_primitive_${primitiveIndex}`;
      mesh.userData.gltfSkin = definition.skin;
      holder.add(mesh);
      return mesh;
    });
    meshNodes.push({ holder, meshes, skinIndex: definition.skin });
  }

  const scenes = (json.scenes || [{ nodes: [json.scene || 0] }]).map((sceneDef, sceneIndex) => {
    const scene = new Group();
    scene.name = sceneDef.name || `scene_${sceneIndex}`;
    for (const nodeIndex of sceneDef.nodes || []) scene.add(nodes[nodeIndex]);
    return scene;
  });

  for (const scene of scenes) scene.updateMatrixWorld(true);

  const skeletons = (json.skins || []).map((skinDef) => {
    const bones = skinDef.joints.map((jointIndex) => nodes[jointIndex]);
    let inverses;
    if (skinDef.inverseBindMatrices !== undefined) {
      const values = getAccessorArray(json, binaryChunk, skinDef.inverseBindMatrices);
      inverses = bones.map((_, index) => new Matrix4().fromArray(values, index * 16));
    }
    return new Skeleton(bones, inverses);
  });

  for (const entry of meshNodes) {
    if (entry.skinIndex === undefined) continue;
    const skeleton = skeletons[entry.skinIndex];
    // glTF inverse-bind matrices are authored in model space. Binding with the
    // mesh world matrix applies that transform twice and stretches animated limbs.
    for (const mesh of entry.meshes) mesh.bind(skeleton, new Matrix4());
  }

  const animations = buildAnimations(json, binaryChunk, nodes);
  const activeSceneIndex = json.scene ?? 0;
  const scene = scenes[activeSceneIndex] || scenes[0] || new Group();
  scene.updateMatrixWorld(true);

  return {
    scene,
    scenes,
    animations,
    cameras: [],
    asset: json.asset || {},
    parser: { json },
    userData: {},
    bounds: new Box3().setFromObject(scene)
  };
}

export class GLTFLoader extends Loader {
  load(url, onLoad, onProgress, onError) {
    const loader = new FileLoader(this.manager);
    loader.setPath(this.path);
    loader.setResponseType('arraybuffer');
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);
    loader.load(url, (data) => {
      buildGLTF(data).then(onLoad).catch((error) => {
        if (onError) onError(error);
        else console.error(error);
      });
    }, onProgress, onError);
    return this;
  }

  parse(data, path, onLoad, onError) {
    void path;
    buildGLTF(data).then(onLoad).catch((error) => {
      if (onError) onError(error);
      else console.error(error);
    });
  }

  parseAsync(data, path = '') {
    void path;
    return buildGLTF(data);
  }
}
