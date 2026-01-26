import { Color } from '@renderlayer/math';

class FogExp2 {
  constructor(color, density = 0.00025) {
    this.name = '';

    this.color = new Color(color);
    this.density = density;
  }

  get isFogExp2() {
    return true;
  }

  clone() {
    return new FogExp2(this.color, this.density);
  }

  toJSON(/* meta */) {
    return {
      type: 'FogExp2',
      color: this.color.getHex(),
      density: this.density
    };
  }
}

export { FogExp2 };
