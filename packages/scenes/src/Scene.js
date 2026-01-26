import { Object3D } from '@renderlayer/core';

class Scene extends Object3D {
  constructor() {
    super();

    this.type = 'Scene';

    this.background = null;
    this.environment = null;
    this.fog = null;

    this.backgroundBlurriness = 0;
    this.backgroundIntensity = 1;

    this.overrideMaterial = null;
  }

  get isScene() {
    return true;
  }

  copy(source, recursive) {
    super.copy(source, recursive);

    if (source.background !== null) this.background = source.background.clone();
    if (source.environment !== null) this.environment = source.environment.clone();
    if (source.fog !== null) this.fog = source.fog.clone();

    this.backgroundBlurriness = source.backgroundBlurriness;
    this.backgroundIntensity = source.backgroundIntensity;

    if (source.overrideMaterial !== null) this.overrideMaterial = source.overrideMaterial.clone();

    this.matrixAutoUpdate = source.matrixAutoUpdate;

    return this;
  }

  toJSON(meta) {
    const data = super.toJSON(meta);

    if (this.fog !== null) data.object.fog = this.fog.toJSON();
    if (this.backgroundBlurriness > 0) data.object.backgroundBlurriness = this.backgroundBlurriness;
    if (this.backgroundIntensity !== 1) data.object.backgroundIntensity = this.backgroundIntensity;

    return data;
  }
}

export { Scene };
