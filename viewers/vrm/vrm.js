import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

/**
 * VRM 3D Avatar Viewer Entrypoint
 * @param {Uint8Array} dataBytes - In-memory VRM binary data
 * @param {Object} context - Metadata
 */
export async function render(dataBytes, context) {
  const container = document.getElementById('viewer-root') || document.body;
  container.innerHTML = '';
  container.className = 'vrm-viewport';

  // 1. Loading Indicator
  const loading = document.createElement('div');
  loading.className = 'vrm-loading';
  loading.innerHTML = '<span class="vrm-spinner"></span><span>VRMアバターを解析・構築中...</span>';
  container.appendChild(loading);

  // 2. VRM Meta HUD Overlay
  const hud = document.createElement('div');
  hud.className = 'vrm-hud';
  hud.innerHTML = `
    <div class="vrm-hud-title"><span>✨</span><span>${context.fileName}</span></div>
    <div id="vrm-meta-body" class="vrm-hud-meta" style="color:#94a3b8;">ロード待機中...</div>
  `;
  container.appendChild(hud);

  // 3. Three.js Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32.0, window.innerWidth / window.innerHeight, 0.1, 50.0);
  camera.position.set(0.0, 1.4, 2.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0.0, 1.1, 0.0);
  controls.update();

  // 4. Studio Lighting
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 1.2);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.8);
  mainLight.position.set(1.5, 3.5, 2.5);
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.9);
  fillLight.position.set(-1.8, 2.0, -1.5);
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0xa855f7, 0.6);
  backLight.position.set(0.0, 3.0, -3.0);
  scene.add(backLight);

  // 5. Floor Grid
  const gridHelper = new THREE.GridHelper(10, 20, 0x475569, 0x1e293b);
  gridHelper.position.y = 0;
  scene.add(gridHelper);

  // 6. Parse and Load VRM from dataBytes
  const loader = new GLTFLoader();
  loader.register((parser) => new VRMLoaderPlugin(parser));

  let currentVrm = null;
  const clock = new THREE.Clock();

  try {
    const gltf = await new Promise((resolve, reject) => {
      loader.parse(dataBytes.buffer, '', resolve, reject);
    });

    const vrm = gltf.userData.vrm;
    if (!vrm) {
      throw new Error('VRMメタデータが検出されませんでした。標準glTFとして描画します。');
    }

    currentVrm = vrm;
    VRMUtils.removeUnnecessaryVertices(gltf.scene);
    VRMUtils.removeUnnecessaryJoints(gltf.scene);

    if (vrm.meta?.metaVersion === '0' || !vrm.meta?.metaVersion) {
      VRMUtils.rotateVRM0(vrm);
    }

    scene.add(vrm.scene);

    // Metadata Display
    const meta = vrm.meta || {};
    const title = meta.name || meta.title || context.fileName;
    const author = meta.authors ? (Array.isArray(meta.authors) ? meta.authors.join(', ') : meta.authors) : (meta.author || '未設定');
    const version = meta.version || (meta.metaVersion === '0' ? 'VRM 0.0' : 'VRM 1.0');
    
    const metaBodyEl = document.getElementById('vrm-meta-body');
    if (metaBodyEl) {
      metaBodyEl.innerHTML = `
        <div>モデル名: <span class="val">${title}</span></div>
        <div>作者: <span class="val">${author}</span></div>
        <div>規格: <span class="badge">${version}</span></div>
        <div class="vrm-hud-hint">
          左ドラッグ: 回転 / 右ドラッグ: 平行移動 / ホイール: ズーム
        </div>
      `;
    }

    // Auto Camera Framing
    const box = new THREE.Box3().setFromObject(vrm.scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const headY = Math.max(0.8, center.y + size.y * 0.3);
    controls.target.set(0, headY, 0);
    camera.position.set(0, headY, Math.max(1.8, size.y * 1.4));
    controls.update();

    // Natural Relaxed Pose (lower arms from T-Pose)
    const humanoid = vrm.humanoid;
    if (humanoid) {
      const isVRM0 = (vrm.meta?.metaVersion === '0' || !vrm.meta?.metaVersion);
      const sign = isVRM0 ? 1 : -1;
      const leftUpperArm = humanoid.getNormalizedBoneNode('leftUpperArm');
      const rightUpperArm = humanoid.getNormalizedBoneNode('rightUpperArm');
      if (leftUpperArm) leftUpperArm.rotation.z = sign * (Math.PI / 2.6);
      if (rightUpperArm) rightUpperArm.rotation.z = -sign * (Math.PI / 2.6);
    }

    loading.style.display = 'none';

  } catch (err) {
    console.error('VRM解析警告/エラー:', err);
    loading.innerHTML = `<span style="color:#f87171">⚠️ ${err.message}</span>`;
    setTimeout(() => { loading.style.display = 'none'; }, 4000);

    if (!currentVrm && typeof gltf !== 'undefined' && gltf && gltf.scene) {
      scene.add(gltf.scene);
    }
  }

  // 7. Natural Breathing & Blinking Animation Loop
  let blinkTimer = 0;
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const t = clock.getElapsedTime();

    if (currentVrm) {
      currentVrm.update(delta);

      // Subtle breathing motion
      const chest = currentVrm.humanoid?.getNormalizedBoneNode('chest') || currentVrm.humanoid?.getNormalizedBoneNode('spine');
      if (chest) {
        chest.rotation.x = Math.sin(t * 1.8) * 0.02;
      }

      // Periodic blinking (~3.5s)
      blinkTimer += delta;
      if (blinkTimer > 3.5) {
        const blinkVal = Math.sin(Math.min((blinkTimer - 3.5) * 12.0, Math.PI));
        if (currentVrm.expressionManager) {
          currentVrm.expressionManager.setValue('blink', Math.max(0, blinkVal));
        }
        if (blinkTimer > 3.8) {
          blinkTimer = 0;
          if (currentVrm.expressionManager) {
            currentVrm.expressionManager.setValue('blink', 0);
          }
        }
      }
    }

    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}
