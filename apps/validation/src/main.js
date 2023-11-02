/* eslint-disable no-console */

// will return url, see vitest.config.js and this app's global.d.ts
import gblFile from './assets/spriggen-opt-compress.glb';
import hdrFile from './skybox/paul_lobe_haus_2k.hdr';

import frontz from './images/sunset0-front+z.png';
import backz from './images/sunset1-back-z.png';
import leftx from './images/sunset2-left+x.png';
import rightx from './images/sunset3-right-x.png';
import upy from './images/sunset4-up+y.png';
import downy from './images/sunset5-down-y.png';

import * as RL from 'renderlayer';

import { DRACOLoader } from '@renderlayer/draco';
import { GLTFLoader } from '@renderlayer/gltf';
import { RGBELoader } from '@renderlayer/extras';

// hdr

const rgbeLoader = new RGBELoader();
const hdrTexture = rgbeLoader.load(hdrFile, function (texture) {
  texture.mapping = RL.EquirectangularReflectionMapping;

  // scene.background = texture;
  // scene.environment = texture;
});

// cubemap environment

const cubeLoader = new RL.CubeTextureLoader();
const cubeTexture = cubeLoader.load([leftx, rightx, upy, downy, frontz, backz]);

// scene

const scene = new RL.Scene();
// scene.background = cubeTexture;
scene.environment = hdrTexture;

// debug light

const light = new RL.AmbientLight(0xffffff, 1.0 * Math.PI);
light.visible = false;
scene.add(light);

// load

const onLoad = (gltf) => {
  console.log('loaded');

  // const gltf = {
  //   scene: dependencies[0][json.scene || 0],
  //   scenes: dependencies[0],
  //   animations: dependencies[1],
  //   cameras: dependencies[2],
  //   asset: json.asset,
  //   parser: parser,
  //   userData: {}
  // };

  scene.add(gltf.scene);

  const action = mixer.clipAction(gltf.animations[0], gltf.scene);
  action.play();
};

const onProgress = (status) => console.log((status.loaded / status.total) * 100 + '% loaded');
const onError = (error) => console.log(error);

// load glTF with DRACO support

const decoderPath = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(decoderPath);

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

gltfLoader.load(gblFile, onLoad, onProgress, onError);

// camera

const camera = new RL.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.5, 2);

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

const mixer = new RL.AnimationMixer();
let previousRAF = null;

function animation(time) {
  if (previousRAF === null) {
    previousRAF = time;
  }

  const timeElapsed = (time - previousRAF) * 0.001;

  controls.update(timeElapsed); // not strictly required
  mixer.update(timeElapsed);
  renderer.render(scene, camera);

  previousRAF = time;
}

// resize

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

// keyboard

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case ' ':
      mixer.stopAllAction();
      break;

    case 'c':
      scene.environment = cubeTexture;
      break;

    case 'h':
      scene.environment = hdrTexture;
      break;

    case 'l':
      light.visible = light.visible ? false : true;
      break;

    case 'e':
      scene.environment = scene.environment ? null : hdrTexture;
      break;

    case 'b':
      scene.background = scene.background ? null : scene.environment;
      break;

    case 'f':
      scene.backgroundBlurriness = scene.backgroundBlurriness > 0 ? 0 : 0.1;
      break;

    case 'r':
      camera.position.set(0, 1.5, 2);
      controls.target.set(0, 1, 0);
      break;

    default:
      break;
  }
});
