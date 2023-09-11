/* eslint-disable no-console */

// will return url, see vite.config.js and this app's global.d.ts
import gblFile from './assets/spriggen-opt-compress.glb';

import * as RL from 'renderlayer';

import { DRACOLoader } from '@renderlayer/draco';
import { GLTFLoader } from '@renderlayer/gltf';

const decoderPath = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

// load

let scene = new RL.Scene();

const onLoad = (gltf) => {
  // const gltf = {
  //   scene: dependencies[0][json.scene || 0],
  //   scenes: dependencies[0],
  //   animations: dependencies[1],
  //   cameras: dependencies[2],
  //   asset: json.asset,
  //   parser: parser,
  //   userData: {}
  // };

  console.log('loaded');
  scene = gltf.scene;

  const light = new RL.AmbientLight();
  scene.add(light);
};

const onProgress = (status) => console.log((status.loaded / status.total) * 100 + '% loaded');
const onError = (error) => console.log(error);

// load glTF with DRACO support

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(decoderPath);

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load(gblFile, onLoad, onProgress, onError);

// camera

const camera = new RL.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.01, 100);
camera.position.set(0, 1, 3);

// renderer

const renderer = new RL.WebGLRenderer({ antialias: true });
renderer.setClearColor(0x3d3d3d);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

// controls

const controls = new RL.OrbitControls(camera, renderer.domElement);
controls.maxDistance = 50;
controls.target.set(0, 1, 0);
controls.update();

// animation

function animation(time) {
  renderer.render(scene, camera);
}

// resize

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});
