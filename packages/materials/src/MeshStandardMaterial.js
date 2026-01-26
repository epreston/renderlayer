import { Color, Vector2 } from '@renderlayer/math';
import { TangentSpaceNormalMap } from '@renderlayer/shared';
import { Material } from './Material.js';

class MeshStandardMaterial extends Material {
  type = 'MeshStandardMaterial';

  defines = { STANDARD: '' };

  color = new Color(0xffffff); // diffuse
  roughness = 1.0;
  metalness = 0.0;

  map = null;

  lightMap = null;
  lightMapIntensity = 1.0;

  aoMap = null;
  aoMapIntensity = 1.0;

  emissive = new Color(0x000000);
  emissiveIntensity = 1.0;
  emissiveMap = null;

  bumpMap = null;
  bumpScale = 1;

  normalMap = null;
  normalMapType = TangentSpaceNormalMap;
  normalScale = new Vector2(1, 1);

  displacementMap = null;
  displacementScale = 1;
  displacementBias = 0;

  roughnessMap = null;

  metalnessMap = null;

  alphaMap = null;

  envMap = null;
  envMapIntensity = 1.0;

  wireframe = false;
  wireframeLinewidth = 1; // will almost always be 1

  flatShading = false;

  fog = true;

  constructor(parameters) {
    super();

    this.setValues(parameters);
  }

  get isMeshStandardMaterial() {
    return true;
  }

  /**
   * @param {MeshStandardMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);

    this.defines = { STANDARD: '' };

    this.color.copy(source.color);
    this.roughness = source.roughness;
    this.metalness = source.metalness;

    this.map = source.map;

    this.lightMap = source.lightMap;
    this.lightMapIntensity = source.lightMapIntensity;

    this.aoMap = source.aoMap;
    this.aoMapIntensity = source.aoMapIntensity;

    this.emissive.copy(source.emissive);
    this.emissiveMap = source.emissiveMap;
    this.emissiveIntensity = source.emissiveIntensity;

    this.bumpMap = source.bumpMap;
    this.bumpScale = source.bumpScale;

    this.normalMap = source.normalMap;
    this.normalMapType = source.normalMapType;
    this.normalScale.copy(source.normalScale);

    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;

    this.roughnessMap = source.roughnessMap;

    this.metalnessMap = source.metalnessMap;

    this.alphaMap = source.alphaMap;

    this.envMap = source.envMap;
    this.envMapIntensity = source.envMapIntensity;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;

    this.flatShading = source.flatShading;

    this.fog = source.fog;

    return this;
  }
}

export { MeshStandardMaterial };
