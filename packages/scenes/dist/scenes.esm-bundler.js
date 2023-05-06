import { Color } from '@renderlayer/math';
import { Object3D } from '@renderlayer/core';

class Fog {
  constructor(color, near = 1, far = 1e3) {
    this.isFog = true;
    this.name = "";
    this.color = new Color(color);
    this.near = near;
    this.far = far;
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
  constructor(color, density = 25e-5) {
    this.isFogExp2 = true;
    this.name = "";
    this.color = new Color(color);
    this.density = density;
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
  constructor() {
    super();
    this.isScene = true;
    this.type = "Scene";
    this.background = null;
    this.environment = null;
    this.fog = null;
    this.backgroundBlurriness = 0;
    this.backgroundIntensity = 1;
    this.overrideMaterial = null;
  }
  copy(source, recursive) {
    super.copy(source, recursive);
    if (source.background !== null)
      this.background = source.background.clone();
    if (source.environment !== null)
      this.environment = source.environment.clone();
    if (source.fog !== null)
      this.fog = source.fog.clone();
    this.backgroundBlurriness = source.backgroundBlurriness;
    this.backgroundIntensity = source.backgroundIntensity;
    if (source.overrideMaterial !== null)
      this.overrideMaterial = source.overrideMaterial.clone();
    this.matrixAutoUpdate = source.matrixAutoUpdate;
    return this;
  }
  toJSON(meta) {
    const data = super.toJSON(meta);
    if (this.fog !== null)
      data.object.fog = this.fog.toJSON();
    if (this.backgroundBlurriness > 0)
      data.object.backgroundBlurriness = this.backgroundBlurriness;
    if (this.backgroundIntensity !== 1)
      data.object.backgroundIntensity = this.backgroundIntensity;
    return data;
  }
}

export { Fog, FogExp2, Scene };
