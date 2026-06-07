import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";
import { FaceLandmarker, FilesetResolver, PoseLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12";

const canvas = document.getElementById("avatarCanvas");
const live2dCanvas = document.getElementById("live2dCanvas");
const modelInput = document.getElementById("modelInput");
const cameraButton = document.getElementById("cameraButton");
const resetButton = document.getElementById("resetButton");
const video = document.getElementById("webcamVideo");
const stageEmpty = document.getElementById("stageEmpty");
const trackingStatus = document.getElementById("trackingStatus");
const faceStatus = document.getElementById("faceStatus");
const modelStatus = document.getElementById("modelStatus");
const modeButtons = document.querySelectorAll("[data-mode-button]");
const uploadLabel = document.querySelector("label[for='modelInput']");
const avatar2dLayer = document.getElementById("avatar2dLayer");
const live2dDebug = document.getElementById("live2dDebug");
const live2dDebugText = document.getElementById("live2dDebugText");

const clock = new THREE.Clock();
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x070b18, 7, 18);

const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
camera.position.set(0, 1.35, 5.2);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1.15, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 2.4;
controls.maxDistance = 8;

const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
keyLight.position.set(2.5, 4, 4);
scene.add(keyLight);
scene.add(new THREE.HemisphereLight(0x8bdcff, 0x27124d, 1.8));

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(2.2, 96),
  new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.08 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.08;
scene.add(floor);

const loader = new GLTFLoader();
loader.register((parser) => new VRMLoaderPlugin(parser));

let currentMode = "3d";
let avatarScene = null;
let currentVrm = null;
let headBone = null;
let neckBone = null;
let armBones = { left: {}, right: {} };
let morphMeshes = [];
let live2dApp = null;
let live2dModel = null;
let live2dObjectUrls = [];
let faceLandmarker = null;
let poseLandmarker = null;
let cameraRunning = false;
let lastVideoTime = -1;
let targetPose = { x: 0, y: 0, z: 0 };
let targetExpressions = { blink: 0, smile: 0, mouth: 0 };
let targetArms = {
  left: { visible: false, upper: { x: 0, y: 0, z: 0 }, lower: { x: 0, y: 0, z: 0 }, hand: { x: 0, y: 0, z: 0 } },
  right: { visible: false, upper: { x: 0, y: 0, z: 0 }, lower: { x: 0, y: 0, z: 0 }, hand: { x: 0, y: 0, z: 0 } }
};
let loadedObjectUrl = null;

function tx(key) {
  return window.t ? window.t(key) : key;
}

function setText(element, key) {
  if (element) element.textContent = tx(key);
}
function showLive2dDebug(message) {
  if (!live2dDebug || !live2dDebugText) return;
  live2dDebug.classList.remove("hidden");
  live2dDebugText.textContent = message;
}

function hideLive2dDebug() {
  if (!live2dDebug || !live2dDebugText) return;
  live2dDebug.classList.add("hidden");
  live2dDebugText.textContent = "-";
}


function resizeRenderer() {
  const rect = canvas.parentElement.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / Math.max(rect.height, 1);
  camera.updateProjectionMatrix();
  resizeLive2d();
}

function disposeNode(root) {
  root.traverse((node) => {
    if (node.geometry) node.geometry.dispose?.();
    const materials = Array.isArray(node.material) ? node.material : node.material ? [node.material] : [];
    materials.forEach((material) => material.dispose?.());
  });
}

function clear3dAvatar() {
  if (avatarScene) {
    scene.remove(avatarScene);
    disposeNode(avatarScene);
  }
  currentVrm = null;
  avatarScene = null;
  headBone = null;
  neckBone = null;
  armBones = { left: {}, right: {} };
  morphMeshes = [];
}

function clearLive2dModel() {
  if (live2dModel) {
    live2dApp?.stage.removeChild(live2dModel);
    live2dModel.destroy?.({ children: true, texture: true, baseTexture: true });
  }
  live2dModel = null;
  live2dObjectUrls.forEach((url) => URL.revokeObjectURL(url));
  live2dObjectUrls = [];
}

function resetStageEmpty() {
  stageEmpty.classList.remove("hidden");
  setText(stageEmpty.querySelector("strong"), currentMode === "2d" ? "tryEmptyTitle2d" : "tryEmptyTitle");
  setText(stageEmpty.querySelector("span"), currentMode === "2d" ? "tryEmptyText2d" : "tryEmptyText");
}

function ensureLive2dApp() {
  if (live2dApp) return live2dApp;
  if (!window.PIXI || !window.PIXI.live2d?.Live2DModel) {
    throw new Error("Live2D runtime was not loaded");
  }
  live2dApp = new window.PIXI.Application({
    view: live2dCanvas,
    backgroundAlpha: 0,
    antialias: true,
    autoStart: true,
    resizeTo: live2dCanvas.parentElement
  });
  window.PIXI.Ticker.shared.autoStart = true;
  return live2dApp;
}

function resizeLive2d() {
  if (!live2dModel || !live2dApp) return;
  const width = live2dApp.renderer.width;
  const height = live2dApp.renderer.height;
  const scale = Math.min(width / Math.max(live2dModel.width, 1) * 0.68, height / Math.max(live2dModel.height, 1) * 0.82);
  live2dModel.scale.set(scale);
  live2dModel.x = width / 2;
  live2dModel.y = height * 0.56;
}

function setMode(mode) {
  currentMode = mode;
  modeButtons.forEach((button) => button.classList.toggle("active", button.dataset.modeButton === mode));
  modelInput.value = "";
  resetPose();

  if (mode === "2d") {
    clear3dAvatar();
    canvas.classList.add("hidden");
    live2dCanvas.classList.remove("hidden");
    avatar2dLayer?.classList.add("hidden");
    modelInput.accept = ".model3.json,.moc3,.json,.png,.jpg,.jpeg,.webp";
    modelInput.multiple = true;
    modelInput.setAttribute("webkitdirectory", "");
    modelInput.setAttribute("directory", "");
    if (uploadLabel) uploadLabel.dataset.i18n = "tryUploadLabel2d";
    setText(uploadLabel, "tryUploadLabel2d");
    setText(modelStatus, "tryModelEmpty");
    setText(trackingStatus, "tryStatusIdle2d");
  } else {
    clearLive2dModel();
    live2dCanvas.classList.add("hidden");
    canvas.classList.remove("hidden");
    avatar2dLayer?.classList.add("hidden");
    modelInput.accept = ".vrm,.glb,.gltf,model/gltf-binary,model/gltf+json";
    modelInput.multiple = false;
    modelInput.removeAttribute("webkitdirectory");
    modelInput.removeAttribute("directory");
    if (uploadLabel) uploadLabel.dataset.i18n = "tryUploadLabel";
    setText(uploadLabel, "tryUploadLabel");
    setText(modelStatus, "tryModelEmpty");
    setText(trackingStatus, "tryStatusIdle");
  }

  resetStageEmpty();
}

function collectMorphTargets(root) {
  morphMeshes = [];
  root.traverse((node) => {
    if (node.isMesh && node.morphTargetDictionary && node.morphTargetInfluences) morphMeshes.push(node);
  });
}

function fitModel(root) {
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  root.position.sub(center);
  root.scale.setScalar(2.65 / (Math.max(size.x, size.y, size.z) || 1));
  root.position.y -= 0.1;
}

function getVrmBone(vrm, name) {
  return vrm.humanoid?.getNormalizedBoneNode?.(name) || vrm.humanoid?.getRawBoneNode?.(name) || null;
}

function setupVrm(vrm) {
  currentVrm = vrm;
  avatarScene = vrm.scene;
  VRMUtils.removeUnnecessaryVertices(avatarScene);
  VRMUtils.removeUnnecessaryJoints(avatarScene);
  avatarScene.traverse((object) => { object.frustumCulled = false; });
  fitModel(avatarScene);
  scene.add(avatarScene);
  headBone = getVrmBone(vrm, "head");
  neckBone = getVrmBone(vrm, "neck");
  armBones = {
    left: {
      upper: getVrmBone(vrm, "leftUpperArm"),
      lower: getVrmBone(vrm, "leftLowerArm"),
      hand: getVrmBone(vrm, "leftHand")
    },
    right: {
      upper: getVrmBone(vrm, "rightUpperArm"),
      lower: getVrmBone(vrm, "rightLowerArm"),
      hand: getVrmBone(vrm, "rightHand")
    }
  };
  collectMorphTargets(avatarScene);
}

function setupGenericGltf(gltf) {
  avatarScene = gltf.scene;
  fitModel(avatarScene);
  collectMorphTargets(avatarScene);
  scene.add(avatarScene);
}

function setMorphByPattern(patterns, value) {
  for (const mesh of morphMeshes) {
    for (const [name, index] of Object.entries(mesh.morphTargetDictionary)) {
      if (patterns.some((pattern) => pattern.test(name))) {
        mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(mesh.morphTargetInfluences[index] || 0, value, 0.45);
      }
    }
  }
}

function setVrmExpression(names, value) {
  const manager = currentVrm?.expressionManager;
  if (!manager) return;
  for (const name of names) {
    try { manager.setValue(name, value); } catch (_) {}
  }
}

function apply3dExpressions() {
  const blink = THREE.MathUtils.clamp(targetExpressions.blink, 0, 1);
  const smile = THREE.MathUtils.clamp(targetExpressions.smile, 0, 1);
  const mouth = THREE.MathUtils.clamp(targetExpressions.mouth, 0, 1);

  if (currentVrm?.expressionManager) {
    setVrmExpression(["blink", "blinkLeft", "blinkRight"], blink);
    setVrmExpression(["happy", "relaxed"], smile * 0.85);
    setVrmExpression(["aa", "oh"], mouth);
    currentVrm.expressionManager.update?.();
    return;
  }

  setMorphByPattern([/blink/i, /eye.*close/i, /close.*eye/i], blink);
  setMorphByPattern([/smile/i, /happy/i, /joy/i, /fun/i], smile);
  setMorphByPattern([/jaw.*open/i, /mouth.*open/i, /^aa$/i, /^a$/i, /v_aa/i], mouth);
}

function setLive2dParam(id, value) {
  const core = live2dModel?.internalModel?.coreModel;
  if (!core) return;
  try {
    if (typeof core.setParameterValueById === "function") core.setParameterValueById(id, value);
  } catch (_) {}
}

function applyLive2dFace() {
  if (!live2dModel) return;
  const angleX = THREE.MathUtils.clamp(targetPose.y * 70, -30, 30);
  const angleY = THREE.MathUtils.clamp(targetPose.x * -60, -30, 30);
  const angleZ = THREE.MathUtils.clamp(targetPose.z * 80, -30, 30);
  const blinkOpen = THREE.MathUtils.clamp(1 - targetExpressions.blink, 0, 1);
  const mouthOpen = THREE.MathUtils.clamp(targetExpressions.mouth * 1.25, 0, 1);
  const mouthForm = THREE.MathUtils.clamp(targetExpressions.smile * 1.6 - 0.3, -1, 1);

  setLive2dParam("ParamAngleX", angleX);
  setLive2dParam("ParamAngleY", angleY);
  setLive2dParam("ParamAngleZ", angleZ);
  setLive2dParam("ParamBodyAngleX", angleX * 0.35);
  setLive2dParam("ParamBodyAngleY", angleY * 0.18);
  setLive2dParam("ParamEyeBallX", THREE.MathUtils.clamp(targetPose.y * 2.2, -1, 1));
  setLive2dParam("ParamEyeBallY", THREE.MathUtils.clamp(targetPose.x * -1.8, -1, 1));
  setLive2dParam("ParamEyeLOpen", blinkOpen);
  setLive2dParam("ParamEyeROpen", blinkOpen);
  setLive2dParam("ParamMouthOpenY", mouthOpen);
  setLive2dParam("ParamMouthForm", mouthForm);
}


function fadeArmTargets() {
  for (const side of ["left", "right"]) {
    targetArms[side].visible = false;
    for (const part of ["upper", "lower", "hand"]) {
      targetArms[side][part].x *= 0.86;
      targetArms[side][part].y *= 0.86;
      targetArms[side][part].z *= 0.86;
    }
  }
}

function landmarkVisible(point) {
  return !!point && (point.visibility === undefined || point.visibility > 0.35);
}

function vectorAngle(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function makeArmTarget(shoulder, elbow, wrist, side) {
  const sideSign = side === "left" ? 1 : -1;
  const upperAngle = vectorAngle(shoulder, elbow);
  const lowerAngle = vectorAngle(elbow, wrist);
  const wristLift = THREE.MathUtils.clamp((shoulder.y - wrist.y) * 2.2, -1, 1);
  const wristSide = THREE.MathUtils.clamp((wrist.x - shoulder.x) * sideSign * 2.4, -1, 1);
  const elbowBend = THREE.MathUtils.clamp(Math.abs(lowerAngle - upperAngle), 0, 1.8);

  return {
    visible: true,
    upper: {
      x: THREE.MathUtils.clamp(wristLift * -0.9, -1.1, 1.1),
      y: THREE.MathUtils.clamp(wristSide * 0.55, -0.75, 0.75),
      z: THREE.MathUtils.clamp((upperAngle - (side === "left" ? 2.65 : 0.5)) * sideSign, -1.25, 1.25)
    },
    lower: {
      x: THREE.MathUtils.clamp(wristLift * -0.45, -0.8, 0.8),
      y: THREE.MathUtils.clamp(wristSide * 0.28, -0.55, 0.55),
      z: THREE.MathUtils.clamp((elbowBend - 0.45) * sideSign, -1.15, 1.15)
    },
    hand: {
      x: THREE.MathUtils.clamp(wristLift * -0.35, -0.55, 0.55),
      y: THREE.MathUtils.clamp(wristSide * 0.35, -0.55, 0.55),
      z: THREE.MathUtils.clamp((lowerAngle - upperAngle) * sideSign * 0.35, -0.65, 0.65)
    }
  };
}

function updateFromPose(results) {
  const landmarks = results.landmarks?.[0];
  if (!landmarks) {
    fadeArmTargets();
    return;
  }

  const points = {
    leftShoulder: landmarks[11], leftElbow: landmarks[13], leftWrist: landmarks[15],
    rightShoulder: landmarks[12], rightElbow: landmarks[14], rightWrist: landmarks[16]
  };

  const leftVisible = landmarkVisible(points.leftShoulder) && landmarkVisible(points.leftElbow) && landmarkVisible(points.leftWrist);
  const rightVisible = landmarkVisible(points.rightShoulder) && landmarkVisible(points.rightElbow) && landmarkVisible(points.rightWrist);

  targetArms.left = leftVisible ? makeArmTarget(points.leftShoulder, points.leftElbow, points.leftWrist, "left") : { ...targetArms.left, visible: false };
  targetArms.right = rightVisible ? makeArmTarget(points.rightShoulder, points.rightElbow, points.rightWrist, "right") : { ...targetArms.right, visible: false };
  if (!leftVisible && !rightVisible) fadeArmTargets();
}

function lerpBoneRotation(bone, target, amount = 0.16) {
  if (!bone || !target) return;
  bone.rotation.x = THREE.MathUtils.lerp(bone.rotation.x, target.x, amount);
  bone.rotation.y = THREE.MathUtils.lerp(bone.rotation.y, target.y, amount);
  bone.rotation.z = THREE.MathUtils.lerp(bone.rotation.z, target.z, amount);
}

function apply3dArms() {
  if (!currentVrm) return;
  lerpBoneRotation(armBones.left.upper, targetArms.left.upper, 0.15);
  lerpBoneRotation(armBones.left.lower, targetArms.left.lower, 0.18);
  lerpBoneRotation(armBones.left.hand, targetArms.left.hand, 0.2);
  lerpBoneRotation(armBones.right.upper, targetArms.right.upper, 0.15);
  lerpBoneRotation(armBones.right.lower, targetArms.right.lower, 0.18);
  lerpBoneRotation(armBones.right.hand, targetArms.right.hand, 0.2);
}

function setLive2dParams(ids, value) {
  ids.forEach((id) => setLive2dParam(id, value));
}

function applyLive2dArms() {
  if (!live2dModel) return;
  const leftLift = THREE.MathUtils.clamp(targetArms.left.upper.x * -30, -30, 30);
  const rightLift = THREE.MathUtils.clamp(targetArms.right.upper.x * -30, -30, 30);
  const leftSide = THREE.MathUtils.clamp(targetArms.left.upper.y * 30, -30, 30);
  const rightSide = THREE.MathUtils.clamp(targetArms.right.upper.y * 30, -30, 30);
  const leftHand = THREE.MathUtils.clamp(targetArms.left.hand.z * 30, -30, 30);
  const rightHand = THREE.MathUtils.clamp(targetArms.right.hand.z * 30, -30, 30);

  setLive2dParams(["ParamArmLA", "ParamArmL", "ParamArmLeft", "ParamShoulderL"], leftLift);
  setLive2dParams(["ParamArmRA", "ParamArmR", "ParamArmRight", "ParamShoulderR"], rightLift);
  setLive2dParams(["ParamArmLB", "ParamElbowL"], leftSide);
  setLive2dParams(["ParamArmRB", "ParamElbowR"], rightSide);
  setLive2dParams(["ParamHandL", "ParamHandAngleL", "ParamWristL"], leftHand);
  setLive2dParams(["ParamHandR", "ParamHandAngleR", "ParamWristR"], rightHand);
}
function blendshapeScore(faceBlendshapes, names) {
  const categories = faceBlendshapes?.[0]?.categories || [];
  let best = 0;
  for (const category of categories) if (names.includes(category.categoryName)) best = Math.max(best, category.score || 0);
  return best;
}

function setPoseFromTransformation(results) {
  const matrixData = results.facialTransformationMatrixes?.[0]?.data;
  if (!matrixData) return false;
  const matrix = new THREE.Matrix4().fromArray(matrixData);
  const euler = new THREE.Euler().setFromRotationMatrix(matrix, "YXZ");
  targetPose.x = THREE.MathUtils.clamp(-euler.x * 0.55, -0.34, 0.34);
  targetPose.y = THREE.MathUtils.clamp(euler.y * 0.75, -0.55, 0.55);
  targetPose.z = THREE.MathUtils.clamp(-euler.z * 0.55, -0.32, 0.32);
  return true;
}

function setPoseFromLandmarks(landmarks) {
  const nose = landmarks[1] || landmarks[4] || landmarks[0];
  if (!nose) return;
  targetPose.y = THREE.MathUtils.clamp(-(nose.x - 0.5) * 1.45, -0.48, 0.48);
  targetPose.x = THREE.MathUtils.clamp(-(nose.y - 0.5) * 0.9, -0.32, 0.32);
  targetPose.z = 0;
}

function updateFromFace(results) {
  const landmarks = results.faceLandmarks?.[0];
  if (!landmarks) {
    setText(faceStatus, "tryFaceSearching");
    targetPose.x *= 0.88; targetPose.y *= 0.88; targetPose.z *= 0.88;
    targetExpressions.blink *= 0.8; targetExpressions.smile *= 0.82; targetExpressions.mouth *= 0.82;
    return;
  }
  setText(faceStatus, "tryFaceOn");
  if (!setPoseFromTransformation(results)) setPoseFromLandmarks(landmarks);
  targetExpressions.blink = Math.max(blendshapeScore(results.faceBlendshapes, ["eyeBlinkLeft"]), blendshapeScore(results.faceBlendshapes, ["eyeBlinkRight"]));
  targetExpressions.smile = Math.max(blendshapeScore(results.faceBlendshapes, ["mouthSmileLeft"]), blendshapeScore(results.faceBlendshapes, ["mouthSmileRight"]));
  targetExpressions.mouth = Math.max(blendshapeScore(results.faceBlendshapes, ["jawOpen"]), blendshapeScore(results.faceBlendshapes, ["mouthFunnel"]) * 0.7);
}

async function initTrackers() {
  if (faceLandmarker && poseLandmarker) return;
  setText(trackingStatus, "tryStatusLoadingTracker");
  const fileset = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm");
  if (!faceLandmarker) {
    faceLandmarker = await FaceLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: true,
      outputFacialTransformationMatrixes: true
    });
  }
  if (!poseLandmarker) {
    poseLandmarker = await PoseLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.45,
      minPosePresenceConfidence: 0.45,
      minTrackingConfidence: 0.45
    });
  }
}

async function startCamera() {
  try {
    await initTrackers();
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: false });
    video.srcObject = stream;
    await video.play();
    cameraRunning = true;
    setText(trackingStatus, "tryStatusTracking");
    cameraButton.classList.add("hidden");
  } catch (error) {
    console.error(error);
    setText(trackingStatus, "tryStatusCameraError");
    setText(faceStatus, "tryFaceOff");
  }
}

function detectTracking() {
  if (!cameraRunning || !faceLandmarker || !poseLandmarker || video.readyState < 2) return;
  if (video.currentTime === lastVideoTime) return;
  lastVideoTime = video.currentTime;
  const now = performance.now();
  updateFromFace(faceLandmarker.detectForVideo(video, now));
  updateFromPose(poseLandmarker.detectForVideo(video, now));
}

function apply3dPose() {
  if (headBone) {
    headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, targetPose.x, 0.18);
    headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, targetPose.y, 0.18);
    headBone.rotation.z = THREE.MathUtils.lerp(headBone.rotation.z, targetPose.z, 0.18);
    if (neckBone) {
      neckBone.rotation.x = THREE.MathUtils.lerp(neckBone.rotation.x, targetPose.x * 0.28, 0.14);
      neckBone.rotation.y = THREE.MathUtils.lerp(neckBone.rotation.y, targetPose.y * 0.28, 0.14);
      neckBone.rotation.z = THREE.MathUtils.lerp(neckBone.rotation.z, targetPose.z * 0.18, 0.14);
    }
  } else if (avatarScene) {
    avatarScene.rotation.x = THREE.MathUtils.lerp(avatarScene.rotation.x, targetPose.x * 0.45, 0.12);
    avatarScene.rotation.y = THREE.MathUtils.lerp(avatarScene.rotation.y, targetPose.y * 0.45, 0.12);
    avatarScene.rotation.z = THREE.MathUtils.lerp(avatarScene.rotation.z, targetPose.z * 0.35, 0.12);
  }
}

function resetPose() {
  targetPose = { x: 0, y: 0, z: 0 };
  targetExpressions = { blink: 0, smile: 0, mouth: 0 };
  targetArms = {
    left: { visible: false, upper: { x: 0, y: 0, z: 0 }, lower: { x: 0, y: 0, z: 0 }, hand: { x: 0, y: 0, z: 0 } },
    right: { visible: false, upper: { x: 0, y: 0, z: 0 }, lower: { x: 0, y: 0, z: 0 }, hand: { x: 0, y: 0, z: 0 } }
  };
  if (headBone) headBone.rotation.set(0, 0, 0);
  if (neckBone) neckBone.rotation.set(0, 0, 0);
  [armBones.left.upper, armBones.left.lower, armBones.left.hand, armBones.right.upper, armBones.right.lower, armBones.right.hand].forEach((bone) => bone?.rotation?.set(0, 0, 0));
  if (avatarScene && !headBone) avatarScene.rotation.set(0, 0, 0);
  if (live2dModel) {
    ["ParamAngleX", "ParamAngleY", "ParamAngleZ", "ParamBodyAngleX", "ParamBodyAngleY", "ParamEyeBallX", "ParamEyeBallY", "ParamMouthOpenY", "ParamMouthForm"].forEach((id) => setLive2dParam(id, 0));
    setLive2dParam("ParamEyeLOpen", 1);
    setLive2dParam("ParamEyeROpen", 1);
  }
}

async function load3dModel(file) {
  clear3dAvatar();
  clearLive2dModel();
  canvas.classList.remove("hidden");
  live2dCanvas.classList.add("hidden");
  if (loadedObjectUrl) URL.revokeObjectURL(loadedObjectUrl);
  loadedObjectUrl = URL.createObjectURL(file);
  setText(trackingStatus, "tryStatusLoadingModel");
  modelStatus.textContent = file.name;
  try {
    const gltf = await loader.loadAsync(loadedObjectUrl);
    if (gltf.userData?.vrm) setupVrm(gltf.userData.vrm);
    else setupGenericGltf(gltf);
    stageEmpty.classList.add("hidden");
    setText(trackingStatus, (!!currentVrm?.expressionManager || morphMeshes.length > 0) ? "tryStatusModelReadyFace" : "tryStatusModelReadyBasic");
  } catch (error) {
    console.error(error);
    setText(trackingStatus, "tryStatusModelError");
    setText(modelStatus, "tryModelEmpty");
    resetStageEmpty();
  }
}

function normalizePath(path) {
  return path.replace(/\\/g, "/").replace(/^\.\//, "");
}

function basename(path) {
  return normalizePath(path).split("/").pop();
}

function fileKey(file) {
  return normalizePath(file.webkitRelativePath || file.name);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error(`Could not read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function findFileUrl(ref, modelDir, fileMap) {
  if (!ref) return ref;
  const normalizedRef = normalizePath(ref);
  const normalizedModelDir = normalizePath(modelDir || "");
  const candidates = [
    normalizePath(`${normalizedModelDir}/${normalizedRef}`),
    normalizedRef,
    basename(normalizedRef)
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fileMap.has(candidate)) return fileMap.get(candidate);
  }

  const refBase = basename(normalizedRef).toLowerCase();
  const refSuffix = normalizedRef.toLowerCase();
  for (const [key, url] of fileMap.entries()) {
    const lowerKey = key.toLowerCase();
    if (lowerKey.endsWith(refSuffix) || lowerKey.endsWith(`/${refSuffix}`) || basename(lowerKey) === refBase) {
      return url;
    }
  }

  throw new Error(`Missing referenced Live2D asset: ${ref}`);
}

function patchModelSettings(settings, modelDir, fileMap) {
  const refs = settings.FileReferences || {};
  refs.Moc = findFileUrl(refs.Moc, modelDir, fileMap);
  refs.Physics = findFileUrl(refs.Physics, modelDir, fileMap);
  refs.Pose = findFileUrl(refs.Pose, modelDir, fileMap);
  refs.DisplayInfo = findFileUrl(refs.DisplayInfo, modelDir, fileMap);
  refs.Textures = (refs.Textures || []).map((item) => findFileUrl(item, modelDir, fileMap));
  refs.Expressions = (refs.Expressions || []).map((item) => ({ ...item, File: findFileUrl(item.File, modelDir, fileMap) }));
  if (refs.Motions) {
    Object.keys(refs.Motions).forEach((group) => {
      refs.Motions[group] = refs.Motions[group].map((motion) => ({
        ...motion,
        File: findFileUrl(motion.File, modelDir, fileMap),
        Sound: findFileUrl(motion.Sound, modelDir, fileMap)
      }));
    });
  }
  settings.FileReferences = refs;
  return settings;
}

async function loadLive2dFolder(files) {
  clear3dAvatar();
  clearLive2dModel();
  hideLive2dDebug();
  canvas.classList.add("hidden");
  live2dCanvas.classList.remove("hidden");
  setText(trackingStatus, "tryStatusLoadingModel");

  const fileArray = Array.from(files || []);
  const foundSummary = fileArray.map((file) => fileKey(file)).slice(0, 24).join("\n");
  const modelFile = fileArray.find((file) => fileKey(file).toLowerCase().endsWith(".model3.json"));
  if (!modelFile) {
    setText(trackingStatus, "tryStatusLive2dMissing");
    setText(modelStatus, "tryModelEmpty");
    showLive2dDebug(`Selected ${fileArray.length} file(s), but no .model3.json was found.\n\nFound:\n${foundSummary || "No files received from browser."}`);
    resetStageEmpty();
    return;
  }

  try {
    const fileMap = new Map();
    for (const file of fileArray) {
      const url = await readFileAsDataUrl(file);
      const key = fileKey(file);
      fileMap.set(key, url);
      fileMap.set(basename(key), url);
      fileMap.set(file.name, url);
    }

    const modelPath = fileKey(modelFile);
    const modelDir = modelPath.includes("/") ? modelPath.slice(0, modelPath.lastIndexOf("/")) : "";
    const rawSettings = JSON.parse(await modelFile.text());
    const settings = patchModelSettings(rawSettings, modelDir, fileMap);
    const modelSettingsUrl = `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(settings))}`;

    const app = ensureLive2dApp();
    live2dModel = await window.PIXI.live2d.Live2DModel.from(modelSettingsUrl, { autoInteract: false, motionPreload: "NONE" });
    live2dModel.anchor?.set?.(0.5, 0.5);
    app.stage.addChild(live2dModel);
    resizeLive2d();
    stageEmpty.classList.add("hidden");
    modelStatus.textContent = modelFile.name;
    setText(trackingStatus, "tryStatusLive2dReady");
    showLive2dDebug(`Loaded: ${modelPath}\nFiles received: ${fileArray.length}\nMoc: ${rawSettings.FileReferences?.Moc || "not listed"}\nTextures: ${(rawSettings.FileReferences?.Textures || []).length}`);
  } catch (error) {
    console.error(error);
    const message = error?.message || String(error);
    clearLive2dModel();
    setText(trackingStatus, "tryStatusModelError");
    setText(modelStatus, "tryModelEmpty");
    showLive2dDebug(`Live2D load failed:\n${message}\n\nTip: if this still says Network error, check that the page is opened through localhost and the browser allowed loading local folder files.`);
    resetStageEmpty();
  }
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  detectTracking();
  if (currentMode === "2d") {
    applyLive2dFace();
    applyLive2dArms();
  } else {
    apply3dPose();
    apply3dExpressions();
    currentVrm?.update?.(delta);
    controls.update();
    renderer.render(scene, camera);
  }
  floor.rotation.z += 0.003;
}

modeButtons.forEach((button) => button.addEventListener("click", () => setMode(button.dataset.modeButton)));
modelInput.addEventListener("change", (event) => {
  if (currentMode === "2d") loadLive2dFolder(event.target.files);
  else {
    const file = event.target.files?.[0];
    if (file) load3dModel(file);
  }
});
cameraButton.addEventListener("click", startCamera);
resetButton.addEventListener("click", resetPose);
window.addEventListener("resize", resizeRenderer);
window.addEventListener("vtuberforge:languagechange", () => {
  if (!cameraRunning) setText(faceStatus, "tryFaceOff");
  setText(uploadLabel, currentMode === "2d" ? "tryUploadLabel2d" : "tryUploadLabel");
  if (!avatarScene && !live2dModel) {
    setText(modelStatus, "tryModelEmpty");
    setText(trackingStatus, currentMode === "2d" ? "tryStatusIdle2d" : "tryStatusIdle");
    resetStageEmpty();
  } else if (live2dModel) {
    setText(trackingStatus, "tryStatusLive2dReady");
  }
});

resizeRenderer();
setMode("3d");
hideLive2dDebug();
setText(faceStatus, "tryFaceOff");
setText(modelStatus, "tryModelEmpty");
animate();





