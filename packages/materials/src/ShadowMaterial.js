import { Color } from '@renderlayer/math';
import { Material } from './Material.js';

class ShadowMaterial extends Material {
  constructor(parameters) {
    super();

    this.isShadowMaterial = true;
    this.type = 'ShadowMaterial';

    this.color = new Color(0x000000);
    this.transparent = true;

    this.fog = true;

    this.setValues(parameters);
  }

  /**
   * @param {ShadowMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);

    this.color.copy(source.color);

    this.fog = source.fog;

    return this;
  }
}

export { ShadowMaterial };
