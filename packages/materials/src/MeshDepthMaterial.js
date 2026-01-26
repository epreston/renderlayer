import { BasicDepthPacking } from '@renderlayer/shared';
import { Material } from './Material.js';

class MeshDepthMaterial extends Material {
  type = 'MeshDepthMaterial';

  depthPacking = BasicDepthPacking;

  map = null;

  alphaMap = null;

  displacementMap = null;
  displacementScale = 1;
  displacementBias = 0;

  wireframe = false;
  wireframeLinewidth = 1; // will almost always be 1

  constructor(parameters) {
    super();

    this.setValues(parameters);
  }

  get isMeshDepthMaterial() {
    return true;
  }

  /**
   * @param {MeshDepthMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);

    this.depthPacking = source.depthPacking;

    this.map = source.map;

    this.alphaMap = source.alphaMap;

    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;

    return this;
  }
}

export { MeshDepthMaterial };
