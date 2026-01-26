import { Color } from '@renderlayer/math';

class Fog {
  name = '';

  color;

  near = 1;
  far = 1000;

  constructor(color, near = 1, far = 1000) {
    this.color = new Color(color);

    this.near = near;
    this.far = far;
  }

  get isFog() {
    return true;
  }

  clone() {
    return new Fog(this.color, this.near, this.far);
  }

  toJSON(/* meta */) {
    return {
      type: 'Fog',
      color: this.color.getHex(),
      near: this.near,
      far: this.far
    };
  }
}

export { Fog };
