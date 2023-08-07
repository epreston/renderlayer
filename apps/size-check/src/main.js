// The bare minimum code required for rendering something to the screen

import * as RL from '@renderlayer/renderlayer';

// init

const camera = new RL.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
camera.position.z = 1;

const scene = new RL.Scene();

const geometry = new RL.BoxGeometry(0.2, 0.2, 0.2);
const material = new RL.MeshBasicMaterial();

const mesh = new RL.Mesh(geometry, material);
scene.add(mesh);

const renderer = new RL.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

// animation

function animation(time) {
  mesh.rotation.x = time / 2000;
  mesh.rotation.y = time / 1000;

  renderer.render(scene, camera);
}
