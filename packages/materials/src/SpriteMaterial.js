import { Color } from '@renderlayer/math';
import { Material } from './Material.js';

class SpriteMaterial extends Material {
  constructor(parameters) {
    super();

    this.isSpriteMaterial = true;
    this.type = 'SpriteMaterial';

    this.transparent = true;

    this.color = new Color(0xffffff);
    this.map = null;
    this.alphaMap = null;
    this.rotation = 0;
    this.sizeAttenuation = true;
    this.fog = true;

    this.setValues(parameters);
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
