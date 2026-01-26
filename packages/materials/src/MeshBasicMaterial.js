import { Color } from '@renderlayer/math';
import { MultiplyOperation } from '@renderlayer/shared';

import { Material } from './Material.js';

class MeshBasicMaterial extends Material {
  type = 'MeshBasicMaterial';

  color = new Color(0xffffff); // emissive

  map = null;

  lightMap = null;
  lightMapIntensity = 1.0;

  aoMap = null;
  aoMapIntensity = 1.0;

  specularMap = null;

  alphaMap = null;

  envMap = null;
  combine = MultiplyOperation;
  reflectivity = 1;
  refractionRatio = 0.98;

  wireframe = false;
  wireframeLinewidth = 1; // will almost always be 1

  fog = true;

  constructor(parameters) {
    super();

    this.setValues(parameters);
  }

  get isMeshBasicMaterial() {
    return true;
  }

  /**
   * @param {MeshBasicMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);

    this.color.copy(source.color);

    this.map = source.map;

    this.lightMap = source.lightMap;
    this.lightMapIntensity = source.lightMapIntensity;

    this.aoMap = source.aoMap;
    this.aoMapIntensity = source.aoMapIntensity;

    this.specularMap = source.specularMap;

    this.alphaMap = source.alphaMap;

    this.envMap = source.envMap;
    this.combine = source.combine;
    this.reflectivity = source.reflectivity;
    this.refractionRatio = source.refractionRatio;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;

    this.fog = source.fog;

    return this;
  }
}

export { MeshBasicMaterial };
