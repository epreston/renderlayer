import { Color, Vector2, Matrix4, Frustum, Vector4, Vector3 } from '@renderlayer/math';
import { Object3D } from '@renderlayer/core';
import { OrthographicCamera } from '@renderlayer/cameras';

class Light extends Object3D {
  constructor(color, intensity = 1) {
    super();
    this.isLight = true;
    this.type = "Light";
    this.color = new Color(color);
    this.intensity = intensity;
  }
  dispose() {
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
    if (this.groundColor !== void 0)
      data.object.groundColor = this.groundColor.getHex();
    if (this.distance !== void 0)
      data.object.distance = this.distance;
    if (this.angle !== void 0)
      data.object.angle = this.angle;
    if (this.decay !== void 0)
      data.object.decay = this.decay;
    if (this.penumbra !== void 0)
      data.object.penumbra = this.penumbra;
    if (this.shadow !== void 0)
      data.object.shadow = this.shadow.toJSON();
    return data;
  }
}

class AmbientLight extends Light {
  constructor(color, intensity) {
    super(color, intensity);
    this.isAmbientLight = true;
    this.type = "AmbientLight";
  }
}

const _projScreenMatrix = /* @__PURE__ */ new Matrix4();
const _lightPositionWorld = /* @__PURE__ */ new Vector3();
const _lookTarget = /* @__PURE__ */ new Vector3();
class LightShadow {
  constructor(camera) {
    this.camera = camera;
    this.bias = 0;
    this.normalBias = 0;
    this.radius = 1;
    this.blurSamples = 8;
    this.mapSize = new Vector2(512, 512);
    this.map = null;
    this.mapPass = null;
    this.matrix = new Matrix4();
    this.autoUpdate = true;
    this.needsUpdate = false;
    this._frustum = new Frustum();
    this._frameExtents = new Vector2(1, 1);
    this._viewportCount = 1;
    this._viewports = [new Vector4(0, 0, 1, 1)];
  }
  getViewportCount() {
    return this._viewportCount;
  }
  getFrustum() {
    return this._frustum;
  }
  updateMatrices(light) {
    const shadowCamera = this.camera;
    const shadowMatrix = this.matrix;
    _lightPositionWorld.setFromMatrixPosition(light.matrixWorld);
    shadowCamera.position.copy(_lightPositionWorld);
    _lookTarget.setFromMatrixPosition(light.target.matrixWorld);
    shadowCamera.lookAt(_lookTarget);
    shadowCamera.updateMatrixWorld();
    _projScreenMatrix.multiplyMatrices(shadowCamera.projectionMatrix, shadowCamera.matrixWorldInverse);
    this._frustum.setFromProjectionMatrix(_projScreenMatrix);
    shadowMatrix.set(
      0.5,
      0,
      0,
      0.5,
      0,
      0.5,
      0,
      0.5,
      0,
      0,
      0.5,
      0.5,
      0,
      0,
      0,
      1
    );
    shadowMatrix.multiply(_projScreenMatrix);
  }
  getViewport(viewportIndex) {
    return this._viewports[viewportIndex];
  }
  getFrameExtents() {
    return this._frameExtents;
  }
  dispose() {
    if (this.map) {
      this.map.dispose();
    }
    if (this.mapPass) {
      this.mapPass.dispose();
    }
  }
  copy(source) {
    this.camera = source.camera.clone();
    this.bias = source.bias;
    this.radius = source.radius;
    this.mapSize.copy(source.mapSize);
    return this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    const object = {};
    if (this.bias !== 0)
      object.bias = this.bias;
    if (this.normalBias !== 0)
      object.normalBias = this.normalBias;
    if (this.radius !== 1)
      object.radius = this.radius;
    if (this.mapSize.x !== 512 || this.mapSize.y !== 512)
      object.mapSize = this.mapSize.toArray();
    object.camera = this.camera.toJSON(false).object;
    delete object.camera.matrix;
    return object;
  }
}

class DirectionalLightShadow extends LightShadow {
  constructor() {
    super(new OrthographicCamera(-5, 5, 5, -5, 0.5, 500));
    this.isDirectionalLightShadow = true;
  }
}

class DirectionalLight extends Light {
  constructor(color, intensity) {
    super(color, intensity);
    this.isDirectionalLight = true;
    this.type = "DirectionalLight";
    this.position.copy(Object3D.DEFAULT_UP);
    this.updateMatrix();
    this.target = new Object3D();
    this.shadow = new DirectionalLightShadow();
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

export { AmbientLight, DirectionalLight, DirectionalLightShadow, Light, LightShadow };
