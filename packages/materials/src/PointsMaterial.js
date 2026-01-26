import { Color } from '@renderlayer/math';
import { Material } from './Material.js';

class PointsMaterial extends Material {
  constructor(parameters) {
    super();

    this.type = 'PointsMaterial';

    this.color = new Color(0xffffff);

    this.map = null;
    this.alphaMap = null;

    this.size = 1;
    this.sizeAttenuation = true;

    this.fog = true;

    this.setValues(parameters);
  }

  get isPointsMaterial() {
    return true;
  }

  /**
   * @param {PointsMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);

    this.color.copy(source.color);

    this.map = source.map;
    this.alphaMap = source.alphaMap;

    this.size = source.size;
    this.sizeAttenuation = source.sizeAttenuation;

    this.fog = source.fog;

    return this;
  }
}

export { PointsMaterial };
