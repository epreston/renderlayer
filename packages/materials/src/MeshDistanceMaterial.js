import { Material } from './Material.js';

class MeshDistanceMaterial extends Material {
  type = 'MeshDistanceMaterial';

  map = null;

  alphaMap = null;

  displacementMap = null;
  displacementScale = 1;
  displacementBias = 0;

  constructor(parameters) {
    super();

    this.setValues(parameters);
  }

  get isMeshDistanceMaterial() {
    return true;
  }

  /**
   * @param {MeshDistanceMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);

    this.map = source.map;

    this.alphaMap = source.alphaMap;

    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;

    return this;
  }
}

export { MeshDistanceMaterial };
