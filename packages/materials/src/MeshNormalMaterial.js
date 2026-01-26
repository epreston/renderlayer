import { Vector2 } from '@renderlayer/math';
import { TangentSpaceNormalMap } from '@renderlayer/shared';
import { Material } from './Material.js';

class MeshNormalMaterial extends Material {
  type = 'MeshNormalMaterial';

  bumpMap = null;
  bumpScale = 1;

  normalMap = null;
  normalMapType = TangentSpaceNormalMap;
  normalScale = new Vector2(1, 1);

  displacementMap = null;
  displacementScale = 1;
  displacementBias = 0;

  wireframe = false;
  wireframeLinewidth = 1;

  flatShading = false;

  constructor(parameters) {
    super();

    this.setValues(parameters);
  }

  get isMeshNormalMaterial() {
    return true;
  }

  /**
   * @param {MeshNormalMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);

    this.bumpMap = source.bumpMap;
    this.bumpScale = source.bumpScale;

    this.normalMap = source.normalMap;
    this.normalMapType = source.normalMapType;
    this.normalScale.copy(source.normalScale);

    this.displacementMap = source.displacementMap;
    this.displacementScale = source.displacementScale;
    this.displacementBias = source.displacementBias;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;

    this.flatShading = source.flatShading;

    return this;
  }
}

export { MeshNormalMaterial };
