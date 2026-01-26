import { Object3D } from '@renderlayer/core';
import { DirectionalLightShadow } from './DirectionalLightShadow.js';
import { Light } from './Light.js';

class DirectionalLight extends Light {
  type = 'DirectionalLight';

  target = new Object3D();
  shadow = new DirectionalLightShadow();

  constructor(color, intensity) {
    super(color, intensity);

    this.position.copy(Object3D.DEFAULT_UP);
    this.updateMatrix();
  }

  get isDirectionalLight() {
    return true;
  }

  dispose() {
    this.shadow.dispose();
  }

  copy(source) {
    super.copy(source);

    this.target = source.target.clone();
    this.shadow = source.shadow.clone();

    return this;
  }
}

export { DirectionalLight };
