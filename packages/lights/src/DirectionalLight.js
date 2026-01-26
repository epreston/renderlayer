import { Object3D } from '@renderlayer/core';
import { DirectionalLightShadow } from './DirectionalLightShadow.js';
import { Light } from './Light.js';

class DirectionalLight extends Light {
  constructor(color, intensity) {
    super(color, intensity);

    this.type = 'DirectionalLight';

    this.position.copy(Object3D.DEFAULT_UP);
    this.updateMatrix();

    this.target = new Object3D();

    this.shadow = new DirectionalLightShadow();
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
