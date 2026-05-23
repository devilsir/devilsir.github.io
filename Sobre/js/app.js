
const modelBase64 = window.modelBase64;
const GLTFLoader = THREE.GLTFLoader;
const loading = document.getElementById("loading");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.01, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
if ("outputColorSpace" in renderer && THREE.SRGBColorSpace) {
renderer.outputColorSpace = THREE.SRGBColorSpace;
} else if ("outputEncoding" in renderer && THREE.sRGBEncoding) {
renderer.outputEncoding = THREE.sRGBEncoding;
}
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x786250, 1.8));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.1);
keyLight.position.set(4, 5, 6);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0xffffff, .85);
fillLight.position.set(-3, 2, -4);
scene.add(fillLight);

const clock = new THREE.Clock();
const mouse = new THREE.Vector2(0, 0);
const smoothMouse = new THREE.Vector2(0, 0);
const eyePivots = [];
const eyelids = [];
const mouthParts = [];
let headTurnTarget = null;
let headTurnPivot = null;
let headMouthDriver = null;
const worldUpAxis = new THREE.Vector3(0, 1, 0);
const worldDepthAxis = new THREE.Vector3(0, 0, 1);
const yawQuaternion = new THREE.Quaternion();
const pitchQuaternion = new THREE.Quaternion();
const parentWorldQuaternion = new THREE.Quaternion();
const parentWorldInverseQuaternion = new THREE.Quaternion();
const neutralWorldQuaternion = new THREE.Quaternion();
const desiredWorldQuaternion = new THREE.Quaternion();
const targetLocalQuaternion = new THREE.Quaternion();
let modelRoot = null;
const chatBubble = document.getElementById("chatBubble");
const chatClose = document.getElementById("chatClose");
const clickHint = document.getElementById("clickHint");
const raycaster = new THREE.Raycaster();
const clickPointer = new THREE.Vector2();
const downPointer = { x: 0, y: 0 };
let pointerDownOnModel = false;
let pointerDownTime = 0;
let chatIsOpen = false;
let animationFrameId = 0;
let pageIsVisible = !document.hidden;
let lastMouthEased = -1;
let mouthUpdateFrame = 0;
let lastCursorRaycastTime = 0;
let lastCursorHit = false;
let lastMouthUpdateTime = -1;
const mouthUpdateIntervalMs = 1000 / 30;

function base64ToBlobUrl(base64) {
const binary = atob(base64);
const bytes = new Uint8Array(binary.length);
for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
return URL.createObjectURL(new Blob([bytes], { type: "model/gltf-binary" }));
}

function normalizeName(value) {
return String(value || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function forEachMaterial(object, callback) {
if (!object.material) return;
const materials = Array.isArray(object.material) ? object.material : [object.material];
for (const material of materials) callback(material);
}

function cloneMaterialsFor(object) {
if (!object.material) return;
object.material = Array.isArray(object.material) ? object.material.map((material) => material.clone()) : object.material.clone();
}

function collectHeadMouthAffectedIndices(base, center, radiusX, radiusY, radiusZ) {
const indices = [];
const cx = center.x;
const cy = center.y;
const cz = center.z;
for (let i = 0; i < base.length; i += 3) {
const x = base[i];
const y = base[i + 1];
const z = base[i + 2];
const nx = Math.abs(x - cx) / radiusX;
const ny = Math.abs(y - cy) / radiusY;
const nz = Math.abs(z - cz) / radiusZ;
if (nx <= 1 && ny <= 1 && nz <= 1) indices.push(i);
}
return indices;
}

function prepareMaterials(root) {
root.traverse((object) => {
if (!object.isMesh || !object.material) return;
cloneMaterialsFor(object);
forEachMaterial(object, (material) => {
material.side = THREE.DoubleSide;
if (material.map) {
if ("colorSpace" in material.map && THREE.SRGBColorSpace) material.map.colorSpace = THREE.SRGBColorSpace;
else if ("encoding" in material.map && THREE.sRGBEncoding) material.map.encoding = THREE.sRGBEncoding;
}
material.needsUpdate = true;
});
});
}

function isLegacyEyeName(name) {
return name.includes("old") || name.includes("antigo") || name.includes("legacy");
}

function hideLegacyEyes(root) {
root.traverse((object) => {
const name = normalizeName(object.name);
if (!isLegacyEyeName(name)) return;
object.visible = false;
object.userData.hiddenLegacyEye = true;
if (object.isMesh) {
forEachMaterial(object, (material) => {
material.transparent = true;
material.opacity = 0;
material.depthWrite = false;
material.needsUpdate = true;
});
}
});
}
function hideEyeOverlayMeshes(root) {
root.traverse((object) => {
if (!object.isMesh || !object.material) return;
const name = normalizeName(object.name);
const parentName = normalizeName(object.parent && object.parent.name);
const relatedToEye = name.includes("olho") || parentName.includes("olho") || parentName.includes("object_") || parentName.includes("gles");
if (!relatedToEye) return;
let shouldHide = false;
forEachMaterial(object, (material) => {
const materialName = normalizeName(material && material.name);
if (materialName.includes("wire")) shouldHide = true;
});
if (!shouldHide) return;
object.visible = false;
object.userData.hiddenEyeOverlay = true;
forEachMaterial(object, (material) => {
material.transparent = true;
material.opacity = 0;
material.depthWrite = false;
material.needsUpdate = true;
});
});
}

function collectEyeCandidates(root) {
const candidates = [];
root.traverse((object) => {
const name = normalizeName(object.name);
if (!name.includes("olho")) return;
if (name.includes("palpebra")) return;
if (isLegacyEyeName(name)) return;
if (object.userData.hiddenLegacyEye) return;
if (!(object.isMesh || object.children.length > 0)) return;
candidates.push(object);
});
return candidates;
}

function createPivot(target, label) {
target.updateMatrixWorld(true);
const parent = target.parent;
const box = new THREE.Box3().setFromObject(target);
const centerWorld = box.getCenter(new THREE.Vector3());
const pivot = new THREE.Group();
pivot.name = `${label}_mouse_anchor`;
parent.add(pivot);
pivot.position.copy(parent.worldToLocal(centerWorld.clone()));
pivot.updateMatrixWorld(true);
pivot.attach(target);
pivot.userData.neutralQuaternion = pivot.quaternion.clone();
pivot.userData.targetName = target.name || label;
return pivot;
}
function createHeadTurnPivot(root) {
root.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(root);
const centerWorld = box.getCenter(new THREE.Vector3());
const size = box.getSize(new THREE.Vector3());
const pivot = new THREE.Group();
pivot.name = "head_mouse_follow_anchor";
const parent = root.parent || scene;
parent.add(pivot);
pivot.position.copy(parent.worldToLocal(centerWorld.clone()));
pivot.position.y -= size.y * .03;
pivot.updateMatrixWorld(true);
pivot.attach(root);
pivot.userData.neutralQuaternion = pivot.quaternion.clone();
return pivot;
}

function registerHeadTurn(root) {
headTurnTarget = root;
headTurnPivot = createHeadTurnPivot(root);
}

function updateHeadTurn() {
if (!headTurnPivot) return;
const yaw = THREE.MathUtils.clamp(smoothMouse.x, -1, 1) * .26;
const pitch = THREE.MathUtils.clamp(smoothMouse.y, -1, 1) * .16;
const roll = THREE.MathUtils.clamp(smoothMouse.x, -1, 1) * -.035;
const targetEuler = new THREE.Euler(pitch, yaw, roll, "YXZ");
const targetQuaternion = new THREE.Quaternion().setFromEuler(targetEuler);
targetQuaternion.premultiply(headTurnPivot.userData.neutralQuaternion);
headTurnPivot.quaternion.slerp(targetQuaternion, .075);
}

function registerEyes(root) {
const candidates = collectEyeCandidates(root);
for (const object of candidates) {
eyePivots.push(createPivot(object, normalizeName(object.name).replace(/\s+/g, "_") || "olho"));
}
}

function registerEyelids(root) {
root.traverse((object) => {
const name = normalizeName(object.name);
if (!object.isMesh) return;
if (!name.includes("palpebra")) return;
forEachMaterial(object, (material) => {
material.transparent = true;
material.opacity = 0;
material.alphaTest = 0.01;
material.depthWrite = true;
material.needsUpdate = true;
});
object.visible = false;
object.renderOrder = 30;
eyelids.push(object);
});
}

function isMouthName(name) {
return name.includes("labio") || name.includes("boca") || name.includes("mouth") || name.includes("lip");
}

function findHeadAnchor(root) {
const preferred = [];
root.traverse((object) => {
const name = normalizeName(object.name);
if (!name) return;
const isHead = name.includes("cabeca") || name.includes("head") || name.includes("rosto") || name.includes("face");
const isBad = isMouthName(name) || name.includes("olho") || name.includes("palpebra") || isLegacyEyeName(name);
if (isHead && !isBad) preferred.push(object);
});
return preferred.find((object) => object.isMesh) || preferred[0] || root;
}

function registerMouth(root) {
root.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(root);
const size = box.getSize(new THREE.Vector3());
const amp = Math.max(size.x, size.y, size.z) * .018;
const parts = [];
const mouthWorldBox = new THREE.Box3();
let mouthWorldInitialized = false;
root.traverse((object) => {
const name = normalizeName(object.name);
if (!object.isMesh) return;
if (!isMouthName(name)) return;
parts.push(object);
const worldBox = new THREE.Box3().setFromObject(object);
if (!mouthWorldInitialized) {
mouthWorldBox.copy(worldBox);
mouthWorldInitialized = true;
} else {
mouthWorldBox.union(worldBox);
}
});
for (const object of parts) {
const name = normalizeName(object.name);
object.userData.basePosition = object.position.clone();
object.userData.baseRotation = object.rotation.clone();
object.userData.baseScale = object.scale.clone();
object.userData.mouthAmp = amp;
object.userData.mouthKind = "middle";
if (name.includes("inferior") || name.includes("baixo") || name.includes("lower")) object.userData.mouthKind = "lower";
if (name.includes("superior") || name.includes("cima") || name.includes("upper")) object.userData.mouthKind = "upper";
object.userData.originalGeometry = object.geometry;
object.geometry = object.geometry.clone();
object.geometry.computeBoundingBox();
const position = object.geometry.attributes.position;
if (position && position.setUsage && THREE.DynamicDrawUsage) position.setUsage(THREE.DynamicDrawUsage);
object.userData.baseMouthPositions = new Float32Array(position.array);
const bb = object.geometry.boundingBox;
object.userData.localMinY = bb.min.y;
object.userData.localMaxY = bb.max.y;
object.userData.localRangeY = Math.max(.00001, bb.max.y - bb.min.y);
object.userData.localCenterX = (bb.min.x + bb.max.x) * .5;
object.userData.localCenterZ = (bb.min.z + bb.max.z) * .5;
object.userData.localRangeX = Math.max(.00001, bb.max.x - bb.min.x);
object.userData.localRangeZ = Math.max(.00001, bb.max.z - bb.min.z);
const base = object.userData.baseMouthPositions;
const factorsX = new Float32Array(base.length / 3);
const factorsY = new Float32Array(base.length / 3);
const factorsZ = new Float32Array(base.length / 3);
const centerX = object.userData.localCenterX || 0;
const centerZ = object.userData.localCenterZ || 0;
const minY = object.userData.localMinY;
const maxY = object.userData.localMaxY;
const rangeY = object.userData.localRangeY || 1;
const rangeX = object.userData.localRangeX || 1;
const rangeZ = object.userData.localRangeZ || 1;
for (let i = 0, v = 0; i < base.length; i += 3, v += 1) {
const x = base[i];
const y = base[i + 1];
const z = base[i + 2];
const centerWeightX = 1 - THREE.MathUtils.clamp(Math.abs(x - centerX) / (rangeX * .7), 0, 1);
const centerWeightZ = 1 - THREE.MathUtils.clamp(Math.abs(z - centerZ) / (rangeZ * .9), 0, 1);
const centerWeight = Math.pow(Math.max(0, centerWeightX * .8 + centerWeightZ * .2), 1.2);
if (object.userData.mouthKind === "lower") {
const lowerWeight = THREE.MathUtils.clamp((maxY - y) / rangeY, 0, 1);
const openWeight = .2 + lowerWeight * .8;
factorsY[v] = -amp * (.28 + openWeight * .72) * (.55 + centerWeight * .45);
factorsX[v] = (x - centerX) * amp * .03 * centerWeight;
factorsZ[v] = amp * .035 * centerWeight;
} else if (object.userData.mouthKind === "upper") {
const upperWeight = THREE.MathUtils.clamp((y - minY) / rangeY, 0, 1);
factorsY[v] = amp * .46 * (.2 + upperWeight * .8) * (.55 + centerWeight * .45);
factorsX[v] = (x - centerX) * amp * .02 * centerWeight;
factorsZ[v] = amp * .018 * centerWeight;
} else {
factorsY[v] = amp * .02;
}
}
object.userData.mouthFactorsX = factorsX;
object.userData.mouthFactorsY = factorsY;
object.userData.mouthFactorsZ = factorsZ;
object.renderOrder = 22;
mouthParts.push(object);
}
const head = findHeadAnchor(root);
if (head && head.isMesh && mouthWorldInitialized) {
head.geometry = head.geometry.clone();
head.geometry.computeBoundingBox();
const headPos = head.geometry.attributes.position;
if (headPos && headPos.setUsage && THREE.DynamicDrawUsage) headPos.setUsage(THREE.DynamicDrawUsage);
const baseHeadPositions = new Float32Array(headPos.array);
const mouthCenterWorld = mouthWorldBox.getCenter(new THREE.Vector3());
const mouthSizeWorld = mouthWorldBox.getSize(new THREE.Vector3());
const mouthCenterLocal = head.worldToLocal(mouthCenterWorld.clone());
const bb = head.geometry.boundingBox;
const radiusX = Math.max(mouthSizeWorld.x * 1.8, (bb.max.x - bb.min.x) * .12);
const radiusY = Math.max(mouthSizeWorld.y * 2.0, (bb.max.y - bb.min.y) * .075);
const radiusZ = Math.max(mouthSizeWorld.z * 2.2, (bb.max.z - bb.min.z) * .09);
const affectedIndices = collectHeadMouthAffectedIndices(baseHeadPositions, mouthCenterLocal, radiusX, radiusY, radiusZ);
const factorX = new Float32Array(affectedIndices.length);
const factorY = new Float32Array(affectedIndices.length);
const factorZ = new Float32Array(affectedIndices.length);
for (let n = 0; n < affectedIndices.length; n += 1) {
const i = affectedIndices[n];
const x = baseHeadPositions[i];
const y = baseHeadPositions[i + 1];
const z = baseHeadPositions[i + 2];
const nx = Math.abs(x - mouthCenterLocal.x) / radiusX;
const ny = Math.abs(y - mouthCenterLocal.y) / radiusY;
const nz = Math.abs(z - mouthCenterLocal.z) / radiusZ;
const radial = 1 - Math.min(1, Math.sqrt(nx * nx + ny * ny + nz * nz));
const falloff = radial * radial * (3 - 2 * radial);
factorX[n] = (x - mouthCenterLocal.x) * falloff * .04;
if (y <= mouthCenterLocal.y) {
const lowerWeight = 1 - THREE.MathUtils.clamp((mouthCenterLocal.y - y) / radiusY, 0, 1);
factorY[n] = -amp * .62 * falloff * (.45 + lowerWeight * .55);
factorZ[n] = amp * .12 * falloff;
} else {
const upperWeight = 1 - THREE.MathUtils.clamp((y - mouthCenterLocal.y) / radiusY, 0, 1);
factorY[n] = amp * .22 * falloff * (.35 + upperWeight * .65);
factorZ[n] = amp * .03 * falloff;
}
}
headMouthDriver = {
mesh: head,
basePositions: baseHeadPositions,
affectedIndices,
factorX,
factorY,
factorZ
};
}
}
function frameModel(root) {
root.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(root);
const center = box.getCenter(new THREE.Vector3());
const size = box.getSize(new THREE.Vector3());
const radius = Math.max(size.x, size.y, size.z) * .5;
root.position.sub(center);
root.position.y -= size.y * .035;
camera.position.set(radius * 6.1, radius * .08, 0);
camera.lookAt(0, size.y * .03, 0);
camera.near = Math.max(0.001, radius / 100);
camera.far = radius * 30;
camera.updateProjectionMatrix();
}

function blinkValue(elapsed) {
if (elapsed < 1.2) return 0;
const cycle = (elapsed - 1.2) % 2.5;
const duration = .32;
if (cycle > duration) return 0;
const raw = Math.sin((cycle / duration) * Math.PI);
return Math.pow(raw, .34);
}

function updateEyes() {
smoothMouse.x += (mouse.x - smoothMouse.x) * .32;
smoothMouse.y += (mouse.y - smoothMouse.y) * .32;
const yaw = THREE.MathUtils.clamp(smoothMouse.x, -1, 1) * .98;
const pitch = THREE.MathUtils.clamp(smoothMouse.y, -1, 1) * .68;
yawQuaternion.setFromAxisAngle(worldUpAxis, yaw);
pitchQuaternion.setFromAxisAngle(worldDepthAxis, pitch);
for (const pivot of eyePivots) {
const parent = pivot.parent;
parent.getWorldQuaternion(parentWorldQuaternion);
parentWorldInverseQuaternion.copy(parentWorldQuaternion).invert();
neutralWorldQuaternion.copy(parentWorldQuaternion).multiply(pivot.userData.neutralQuaternion);
desiredWorldQuaternion.copy(yawQuaternion).multiply(pitchQuaternion).multiply(neutralWorldQuaternion);
targetLocalQuaternion.copy(parentWorldInverseQuaternion).multiply(desiredWorldQuaternion);
pivot.quaternion.slerp(targetLocalQuaternion, .46);
}
}

function updateBlink(elapsed) {
const blink = blinkValue(elapsed);
const opacity = blink > .015 ? Math.min(1, blink * 1.45) : 0;
for (const object of eyelids) {
object.visible = opacity > 0;
forEachMaterial(object, (material) => {
material.opacity = opacity;
material.needsUpdate = true;
});
}
}

function mouthValue(elapsed) {
if (!chatIsOpen) return 0;
const a = (Math.sin(elapsed * 8.7) + 1) * .5;
const b = (Math.sin(elapsed * 13.9 + 1.7) + 1) * .5;
const c = (Math.sin(elapsed * 21.1 + .4) + 1) * .5;
const rhythm = (Math.sin(elapsed * 2.2) + 1) * .5;
const raw = a * .52 + b * .34 + c * .14;
return THREE.MathUtils.clamp(Math.pow(raw, 1.8) * (.55 + rhythm * .45), 0, 1);
}

function updateMouth(elapsed) {
const now = performance.now();
const shouldAnimate = chatIsOpen;
if (!shouldAnimate && lastMouthEased === 0) return;
if (shouldAnimate && lastMouthUpdateTime >= 0 && now - lastMouthUpdateTime < mouthUpdateIntervalMs) return;
lastMouthUpdateTime = now;
const open = shouldAnimate ? mouthValue(elapsed) : 0;
const eased = open * open * (3 - 2 * open);
if (Math.abs(eased - lastMouthEased) < .0008) return;
lastMouthEased = eased;
mouthUpdateFrame += 1;
for (const object of mouthParts) {
const position = object.geometry && object.geometry.attributes && object.geometry.attributes.position;
const base = object.userData.baseMouthPositions;
if (!position || !base) continue;
const arr = position.array;
const factorsX = object.userData.mouthFactorsX;
const factorsY = object.userData.mouthFactorsY;
const factorsZ = object.userData.mouthFactorsZ;
const kind = object.userData.mouthKind;
for (let i = 0, v = 0; i < arr.length; i += 3, v += 1) {
arr[i] = base[i] + factorsX[v] * eased;
if (kind === "middle") {
arr[i + 1] = base[i + 1] + Math.sin(elapsed * 8 + base[i] * 40) * factorsY[v] * eased;
arr[i + 2] = base[i + 2];
} else {
arr[i + 1] = base[i + 1] + factorsY[v] * eased;
arr[i + 2] = base[i + 2] + factorsZ[v] * eased;
}
}
position.needsUpdate = true;
}
if (headMouthDriver && headMouthDriver.mesh && headMouthDriver.mesh.geometry) {
const mesh = headMouthDriver.mesh;
const position = mesh.geometry.attributes.position;
const base = headMouthDriver.basePositions;
const arr = position.array;
const affected = headMouthDriver.affectedIndices || [];
const factorX = headMouthDriver.factorX || [];
const factorY = headMouthDriver.factorY || [];
const factorZ = headMouthDriver.factorZ || [];
for (let n = 0; n < affected.length; n += 1) {
const i = affected[n];
arr[i] = base[i] + factorX[n] * eased;
arr[i + 1] = base[i + 1] + factorY[n] * eased;
arr[i + 2] = base[i + 2] + factorZ[n] * eased;
}
position.needsUpdate = true;
if (mouthUpdateFrame % 8 === 0 || eased === 0) mesh.geometry.computeVertexNormals();
}
}

function animate() {
if (!pageIsVisible) {
animationFrameId = 0;
return;
}
const elapsed = clock.getElapsedTime();
updateHeadTurn();
updateEyes();
updateBlink(elapsed);
updateMouth(elapsed);
renderer.render(scene, camera);
animationFrameId = requestAnimationFrame(animate);
}
function startRenderLoop() {
if (!animationFrameId && pageIsVisible) animationFrameId = requestAnimationFrame(animate);
}

function hideClickHint() {
if (!clickHint) return;
clickHint.classList.add("hidden");
clickHint.setAttribute("aria-hidden", "true");
}

function showChatBubble() {
if (!chatBubble) return;
chatIsOpen = true;
hideClickHint();
chatBubble.classList.add("open");
chatBubble.setAttribute("aria-hidden", "false");
}

function hideChatBubble() {
if (!chatBubble) return;
chatIsOpen = false;
chatBubble.classList.remove("open");
chatBubble.setAttribute("aria-hidden", "true");
}

function setClickPointerFromEvent(event) {
clickPointer.x = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
clickPointer.y = -((event.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
}

function isPointerOnHead(event) {
if (!modelRoot) return false;
setClickPointerFromEvent(event);
raycaster.setFromCamera(clickPointer, camera);
const intersects = raycaster.intersectObject(modelRoot, true);
return intersects.some((hit) => {
const object = hit.object;
if (!object || !object.visible) return false;
const name = normalizeName(object.name);
if (name.includes("palpebra")) return false;
if (object.userData.hiddenLegacyEye || object.userData.hiddenEyeOverlay) return false;
return true;
});
}

function setMouseFromClient(clientX, clientY) {
mouse.x = (clientX / Math.max(1, window.innerWidth)) * 2 - 1;
mouse.y = -((clientY / Math.max(1, window.innerHeight)) * 2 - 1);
}

renderer.domElement.addEventListener("pointerdown", (event) => {
downPointer.x = event.clientX;
downPointer.y = event.clientY;
pointerDownTime = performance.now();
pointerDownOnModel = isPointerOnHead(event);
}, { passive: true });

renderer.domElement.addEventListener("pointerup", (event) => {
const dx = event.clientX - downPointer.x;
const dy = event.clientY - downPointer.y;
const moved = Math.hypot(dx, dy) > 8;
const quick = performance.now() - pointerDownTime < 650;
if (pointerDownOnModel && !moved && quick && isPointerOnHead(event)) showChatBubble();
pointerDownOnModel = false;
}, { passive: true });

renderer.domElement.addEventListener("pointermove", (event) => {
const now = performance.now();
if (now - lastCursorRaycastTime > 90) {
lastCursorRaycastTime = now;
lastCursorHit = isPointerOnHead(event);
renderer.domElement.style.cursor = lastCursorHit ? "pointer" : "default";
}
}, { passive: true });

if (chatClose) chatClose.addEventListener("click", hideChatBubble);

window.addEventListener("pointermove", (event) => {
setMouseFromClient(event.clientX, event.clientY);
}, { passive: true });

window.addEventListener("touchmove", (event) => {
const touch = event.touches && event.touches[0];
if (touch) setMouseFromClient(touch.clientX, touch.clientY);
}, { passive: true });

window.addEventListener("pointerleave", () => {
mouse.x = 0;
mouse.y = 0;
}, { passive: true });

let resizeFrameId = 0;
window.addEventListener("resize", () => {
if (resizeFrameId) return;
resizeFrameId = requestAnimationFrame(() => {
resizeFrameId = 0;
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize(window.innerWidth, window.innerHeight);
});
});

document.addEventListener("visibilitychange", () => {
pageIsVisible = !document.hidden;
if (pageIsVisible) startRenderLoop();
});

const loader = new GLTFLoader();
const url = base64ToBlobUrl(modelBase64);
loader.load(url, (gltf) => {
modelRoot = gltf.scene;
scene.add(modelRoot);
prepareMaterials(modelRoot);
hideLegacyEyes(modelRoot);
registerEyelids(modelRoot);
registerHeadTurn(modelRoot);
registerEyes(modelRoot);
registerMouth(modelRoot);
frameModel(modelRoot);
loading.classList.add("hidden");
setTimeout(() => loading.remove(), 500);
console.log(`olhos rastreando: ${eyePivots.length} | cabeca seguindo mouse: ${headTurnPivot ? 1 : 0} | palpebras: ${eyelids.length} | boca vinculada: ${mouthParts.length} | cabeca deformando: ${headMouthDriver ? 1 : 0}`);
startRenderLoop();
}, undefined, (error) => {
console.error(error);
loading.textContent = "erro ao carregar o modelo";
});
