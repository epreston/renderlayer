import { Color } from '@renderlayer/math';
import { Material } from './Material.js';

class PointsMaterial extends Material {
  type = 'PointsMaterial';

  color = new Color(0xffffff);

  map = null;
  alphaMap = null;

  size = 1;
  sizeAttenuation = true;

  fog = true;

  constructor(parameters) {
    super();

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
