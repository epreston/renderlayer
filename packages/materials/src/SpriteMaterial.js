import { Color } from '@renderlayer/math';
import { Material } from './Material.js';

class SpriteMaterial extends Material {
  type = 'SpriteMaterial';

  transparent = true;

  color = new Color(0xffffff);
  map = null;
  alphaMap = null;
  rotation = 0;
  sizeAttenuation = true;
  fog = true;

  constructor(parameters) {
    super();

    this.setValues(parameters);
  }

  get isSpriteMaterial() {
    return true;
  }

  /**
   * @param {SpriteMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);

    this.color.copy(source.color);
    this.map = source.map;
    this.alphaMap = source.alphaMap;
    this.rotation = source.rotation;
    this.sizeAttenuation = source.sizeAttenuation;
    this.fog = source.fog;

    return this;
  }
}

export { SpriteMaterial };
