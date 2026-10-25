import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

/**
 * 3D STL Mesh Viewer Entrypoint
 * @param {Uint8Array} dataBytes - In-memory STL binary or ASCII data
 * @param {Object} context - Metadata
 */
export async function render(dataBytes, context) {
  const container = document.getElementById('viewer-root') || document.body;
  container.innerHTML = '';
  container.className = 'stl-viewport';

  const hud = document.createElement('div');
  hud.className = 'stl-hud';
  hud.innerHTML = `
    <div class="stl-hud-title">📐 ${context.fileName}</div>
    <div style="font-size:11px; color:#94a3b8;">左ドラッグ: 回転 / 右ドラッグ: 移動 / ホイール: ズーム</div>
  `;
  container.appendChild(hud);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
  hemiLight.position.set(0, 200, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(100, 200, 100);
  scene.add(dirLight);

  const loader = new STLLoader();
  const geometry = loader.parse(dataBytes.buffer);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.25,
    roughness: 0.35
  });
  const mesh = new THREE.Mesh(geometry, material);

  geometry.center();
  scene.add(mesh);

  geometry.computeBoundingSphere();
  const radius = geometry.boundingSphere.radius || 50;
  camera.position.set(radius * 1.8, radius * 1.5, radius * 2.2);
  camera.lookAt(0, 0, 0);
  controls.target.set(0, 0, 0);

  const grid = new THREE.GridHelper(radius * 3, 20, 0x334155, 0x1e293b);
  grid.position.y = -radius * 0.7;
  scene.add(grid);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}
