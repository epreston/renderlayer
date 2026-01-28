import { Color } from '@renderlayer/math';
import { Object3D } from '@renderlayer/core';

class Fog {
  name = "";
  color;
  near = 1;
  far = 1e3;
  constructor(color, near = 1, far = 1e3) {
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
  toJSON() {
    return {
      type: "Fog",
      color: this.color.getHex(),
      near: this.near,
      far: this.far
    };
  }
}

class FogExp2 {
  name = "";
  color;
  density = 25e-5;
  constructor(color, density = 25e-5) {
    this.color = new Color(color);
    this.density = density;
  }
  get isFogExp2() {
    return true;
  }
  clone() {
    return new FogExp2(this.color, this.density);
  }
  toJSON() {
    return {
      type: "FogExp2",
      color: this.color.getHex(),
      density: this.density
    };
  }
}

class Scene extends Object3D {
  type = "Scene";
  background = null;
  environment = null;
  fog = null;
  backgroundBlurriness = 0;
  backgroundIntensity = 1;
  overrideMaterial = null;
  constructor() {
    super();
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

export { Fog, FogExp2, Scene };
