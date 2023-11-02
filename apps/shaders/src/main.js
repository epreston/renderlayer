// will return url, see vitest.config.js and this app's global.d.ts
import hdrFile from './skybox/paul_lobe_haus_2k.hdr';

// shaders
import fsh from './shaders/fragment-shader.glsl?raw';
import vsh from './shaders/vertex-shader.glsl?raw';

// cubemap textures
import frontz from './images/sunset0-front+z.png';
import backz from './images/sunset1-back-z.png';
import leftx from './images/sunset2-left+x.png';
import rightx from './images/sunset3-right-x.png';
import upy from './images/sunset4-up+y.png';
import downy from './images/sunset5-down-y.png';

import * as RL from 'renderlayer';
import { RGBELoader } from '@renderlayer/extras';

// hdr

const rgbeLoader = new RGBELoader();
const hdrTexture = rgbeLoader.load(hdrFile, function (texture) {
  texture.mapping = RL.EquirectangularReflectionMapping;
});

// cubemap environment

const cubeLoader = new RL.CubeTextureLoader();
const cubeTexture = cubeLoader.load([leftx, rightx, upy, downy, frontz, backz]);

// scene

const scene = new RL.Scene();
scene.background = cubeTexture;

// material

const material = new RL.ShaderMaterial({
  uniforms: {
    specMap: { value: cubeTexture },
    time: { value: 0.0 }
  },
  vertexShader: vsh,
  fragmentShader: fsh
});

// geometry

const geometry = new RL.SphereGeometry(1, 128, 128);
const mesh = new RL.Mesh(geometry, material);
scene.add(mesh);

// camera

const camera = new RL.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100.0);
camera.position.set(1, 0, 5);

// renderer

const renderer = new RL.WebGLRenderer(); // { antialias: true }
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animation);
document.body.appendChild(renderer.domElement);

// controls

const controls = new RL.OrbitControls(camera, renderer.domElement);
controls.maxDistance = 50;
controls.target.set(0, 0, 0);
controls.update();

// animation

let previousRAF = null;
let totalTime = 0;

function animation(time) {
  if (previousRAF === null) {
    previousRAF = time;
  }

  const timeElapsed = (time - previousRAF) * 0.001;
  totalTime += timeElapsed;

  material.uniforms.time.value = totalTime;
  controls.update(timeElapsed); // not strictly required
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
    case 'c':
      scene.background = cubeTexture;
      material.uniforms.specMap.value = cubeTexture;
      material.needsUpdate = true;
      break;

    case 'h':
      scene.background = hdrTexture;
      material.uniforms.specMap.value = hdrTexture.clone(); // EP: Clone required? Bug?
      material.needsUpdate = true;
      break;

    case 'b':
      scene.background = scene.background ? null : material.uniforms.specMap.value.clone(); // EP: Clone required? Bug?
      break;

    case 'f':
      scene.backgroundBlurriness = scene.backgroundBlurriness > 0 ? 0 : 0.1;
      break;

    case 'r':
      scene.background = cubeTexture;
      material.uniforms.specMap.value = cubeTexture;
      camera.position.set(1, 0, 5);
      controls.target.set(0, 0, 0);
      break;

    default:
      break;
  }
});
