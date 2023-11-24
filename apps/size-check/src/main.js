import './css/reset.css';
import './css/style.css';

// Minimum code required for rendering something meaningful the screen

import * as RL from 'renderlayer';

// init

const scene = new RL.Scene();

const geometry = new RL.BoxGeometry(0.2, 0.2, 0.2);
const material = new RL.MeshStandardMaterial({
  color: 0x44526b,
  roughness: 0.8,
  metalness: 0.5
});

const mesh = new RL.Mesh(geometry, material);
scene.add(mesh);

const camera = new RL.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.z = 1;

const ambientLight = new RL.AmbientLight(0xffffff, 1.0 * Math.PI);
scene.add(ambientLight);

const pointLight = new RL.PointLight(0xffffff, 3.0 * Math.PI);
pointLight.position.set(1.0, 1.0, 1.0);
scene.add(pointLight);

const renderer = new RL.WebGLRenderer({ antialias: true });
document.body.appendChild(renderer.domElement);
renderer.setClearColor(0x3d3d3d);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animation);

// animation

function animation(time) {
  mesh.rotation.x = time / 2000;
  mesh.rotation.y = time / 1000;

  render();
}

// render

let averageTime = 0;
let timeSamples = 0;
const infoEl = document.getElementById('info');

function render() {
  const start = window.performance.now();
  renderer.render(scene, camera);
  const delta = window.performance.now() - start;
  averageTime += (delta - averageTime) / (timeSamples + 1);
  if (timeSamples < 60) {
    timeSamples++;
  }

  infoEl.innerHTML = `draw calls : ${renderer.info.render.calls}\n`;
  infoEl.innerHTML += `cpu time : ${averageTime.toFixed(2)}ms`;
}

// resize

window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
