import { Color } from '@renderlayer/math';
import { Material } from './Material.js';

class LineBasicMaterial extends Material {
  type = 'LineBasicMaterial';

  color = new Color(0xffffff);
  map = null;
  linewidth = 1; // may be ignored
  fog = true;

  constructor(parameters) {
    super();

    this.setValues(parameters);
  }

  get isLineBasicMaterial() {
    return true;
  }

  /**
   * @param {LineBasicMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);

    this.color.copy(source.color);
    this.map = source.map;
    this.linewidth = source.linewidth;
    this.fog = source.fog;

    return this;
  }
}

export { LineBasicMaterial };
