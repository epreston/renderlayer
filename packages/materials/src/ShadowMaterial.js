import { Color } from '@renderlayer/math';
import { Material } from './Material.js';

class ShadowMaterial extends Material {
  type = 'ShadowMaterial';

  color = new Color(0x000000);
  transparent = true;

  fog = true;

  constructor(parameters) {
    super();

    this.setValues(parameters);
  }

  get isShadowMaterial() {
    return true;
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
