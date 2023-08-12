// The bare minimum code required for rendering something to the screen

import * as RL from 'renderlayer';

// init

const geometry = new RL.BoxGeometry(0.2, 0.2, 0.2);
const material = new RL.MeshNormalMaterial();
const mesh = new RL.Mesh(geometry, material);

const scene = new RL.Scene();
scene.add(mesh);

const camera = new RL.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.z = 1;

const renderer = new RL.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x3d3d3d);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

// animation

function animation(time) {
  mesh.rotation.x = time / 2000;
  mesh.rotation.y = time / 1000;

  renderer.render(scene, camera);
}

// resize

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
