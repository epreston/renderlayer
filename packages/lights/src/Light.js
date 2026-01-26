import { Color } from '@renderlayer/math';
import { Object3D } from '@renderlayer/core';

class Light extends Object3D {
  constructor(color, intensity = 1) {
    super();

    this.type = 'Light';

    this.color = new Color(color);
    this.intensity = intensity;
  }

  get isLight() {
    return true;
  }

  dispose() {
    // this.dispatchEvent( { type: 'dispose' } );
  }

  copy(source, recursive) {
    super.copy(source, recursive);

    this.color.copy(source.color);
    this.intensity = source.intensity;

    return this;
  }

  toJSON(meta) {
    const data = super.toJSON(meta);

    data.object.color = this.color.getHex();
    data.object.intensity = this.intensity;

    if (this.groundColor !== undefined) data.object.groundColor = this.groundColor.getHex();

    if (this.distance !== undefined) data.object.distance = this.distance;
    if (this.angle !== undefined) data.object.angle = this.angle;
    if (this.decay !== undefined) data.object.decay = this.decay;
    if (this.penumbra !== undefined) data.object.penumbra = this.penumbra;

    if (this.shadow !== undefined) data.object.shadow = this.shadow.toJSON();

    return data;
  }
}

export { Light };
