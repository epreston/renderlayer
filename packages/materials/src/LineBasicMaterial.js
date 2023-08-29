import { Color } from '@renderlayer/math';
import { Material } from './Material.js';

class LineBasicMaterial extends Material {
  constructor(parameters) {
    super();

    this.isLineBasicMaterial = true;
    this.type = 'LineBasicMaterial';

    this.color = new Color(0xffffff);
    this.map = null;
    this.linewidth = 1; // may be ignored
    this.fog = true;

    this.setValues(parameters);
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
