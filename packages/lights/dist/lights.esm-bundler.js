import { Color, Vector2, Matrix4, Frustum, Vector4, Vector3, RAD2DEG } from '@renderlayer/math';
import { Object3D } from '@renderlayer/core';
import { OrthographicCamera, PerspectiveCamera } from '@renderlayer/cameras';
import { UnsignedByteType, WebGPUCoordinateSystem } from '@renderlayer/shared';

class Light extends Object3D {
  type = "Light";
  color;
  intensity = 1;
  constructor(color, intensity = 1) {
    super();
    this.color = new Color(color);
    this.intensity = intensity;
  }
  get isLight() {
    return true;
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
    if (this.groundColor !== void 0) data.object.groundColor = this.groundColor.getHex();
    if (this.distance !== void 0) data.object.distance = this.distance;
    if (this.angle !== void 0) data.object.angle = this.angle;
    if (this.decay !== void 0) data.object.decay = this.decay;
    if (this.penumbra !== void 0) data.object.penumbra = this.penumbra;
    if (this.shadow !== void 0) data.object.shadow = this.shadow.toJSON();
    return data;
  }
}

class AmbientLight extends Light {
  type = "AmbientLight";
  constructor(color, intensity) {
    super(color, intensity);
  }
  get isAmbientLight() {
    return true;
  }
}

class LightShadow {
  camera;
  intensity = 1;
  bias = 0;
  normalBias = 0;
  radius = 1;
  blurSamples = 8;
  mapSize = new Vector2(512, 512);
  mapType = UnsignedByteType;
  map = null;
  mapPass = null;
  matrix = new Matrix4();
  autoUpdate = true;
  needsUpdate = false;
  _frustum = new Frustum();
  _frameExtents = new Vector2(1, 1);
  _viewportCount = 1;
  _viewports = [new Vector4(0, 0, 1, 1)];
  constructor(camera) {
    this.camera = camera;
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
    _lightPositionWorld$1.setFromMatrixPosition(light.matrixWorld);
    shadowCamera.position.copy(_lightPositionWorld$1);
    _lookTarget$1.setFromMatrixPosition(light.target.matrixWorld);
    shadowCamera.lookAt(_lookTarget$1);
    shadowCamera.updateMatrixWorld();
    _projScreenMatrix$1.multiplyMatrices(
      shadowCamera.projectionMatrix,
      shadowCamera.matrixWorldInverse
    );
    this._frustum.setFromProjectionMatrix(
      _projScreenMatrix$1,
      shadowCamera.coordinateSystem,
      shadowCamera.reversedDepth
    );
    if (shadowCamera.coordinateSystem === WebGPUCoordinateSystem || shadowCamera.reversedDepth) {
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
        1,
        0,
        // Identity Z (preserving the correct [0, 1] range from the projection matrix)
        0,
        0,
        0,
        1
      );
    } else {
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
    }
    shadowMatrix.multiply(_projScreenMatrix$1);
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
    this.intensity = source.intensity;
    this.bias = source.bias;
    this.radius = source.radius;
    this.autoUpdate = source.autoUpdate;
    this.needsUpdate = source.needsUpdate;
    this.normalBias = source.normalBias;
    this.blurSamples = source.blurSamples;
    this.mapSize.copy(source.mapSize);
    return this;
  }
  /** @returns {this} */
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    const object = {};
    if (this.intensity !== 1) object.intensity = this.intensity;
    if (this.bias !== 0) object.bias = this.bias;
    if (this.normalBias !== 0) object.normalBias = this.normalBias;
    if (this.radius !== 1) object.radius = this.radius;
    if (this.mapSize.x !== 512 || this.mapSize.y !== 512) object.mapSize = this.mapSize.toArray();
    object.camera = this.camera.toJSON(false).object;
    delete object.camera.matrix;
    return object;
  }
}
const _projScreenMatrix$1 = /* @__PURE__ */ new Matrix4();
const _lightPositionWorld$1 = /* @__PURE__ */ new Vector3();
const _lookTarget$1 = /* @__PURE__ */ new Vector3();

class DirectionalLightShadow extends LightShadow {
  constructor() {
    super(new OrthographicCamera(-5, 5, 5, -5, 0.5, 500));
  }
  get isDirectionalLightShadow() {
    return true;
  }
}

class DirectionalLight extends Light {
  type = "DirectionalLight";
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

class PointLightShadow extends LightShadow {
  _frameExtents = new Vector2(4, 2);
  _viewports = [
    // These viewports map a cube-map onto a 2D texture with the
    // following orientation:
    //
    //  xzXZ
    //   y Y
    //
    // X - Positive x direction
    // x - Negative x direction
    // Y - Positive y direction
    // y - Negative y direction
    // Z - Positive z direction
    // z - Negative z direction
    // positive X
    new Vector4(2, 1, 1, 1),
    // negative X
    new Vector4(0, 1, 1, 1),
    // positive Z
    new Vector4(3, 1, 1, 1),
    // negative Z
    new Vector4(1, 1, 1, 1),
    // positive Y
    new Vector4(3, 0, 1, 1),
    // negative Y
    new Vector4(1, 0, 1, 1)
  ];
  #cubeDirections = [
    new Vector3(1, 0, 0),
    new Vector3(-1, 0, 0),
    new Vector3(0, 0, 1),
    new Vector3(0, 0, -1),
    new Vector3(0, 1, 0),
    new Vector3(0, -1, 0)
  ];
  #cubeUps = [
    new Vector3(0, 1, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 1, 0),
    new Vector3(0, 0, 1),
    new Vector3(0, 0, -1)
  ];
  constructor() {
    super(new PerspectiveCamera(90, 1, 0.5, 500));
  }
  get isPointLightShadow() {
    return true;
  }
  getViewportCount() {
    return 6;
  }
  updateMatrices(light, viewportIndex = 0) {
    const camera = this.camera;
    const shadowMatrix = this.matrix;
    const far = light.distance || camera.far;
    if (far !== camera.far) {
      camera.far = far;
      camera.updateProjectionMatrix();
    }
    _lightPositionWorld.setFromMatrixPosition(light.matrixWorld);
    camera.position.copy(_lightPositionWorld);
    _lookTarget.copy(camera.position);
    _lookTarget.add(this.#cubeDirections[viewportIndex]);
    camera.up.copy(this.#cubeUps[viewportIndex]);
    camera.lookAt(_lookTarget);
    camera.updateMatrixWorld();
    shadowMatrix.makeTranslation(
      -_lightPositionWorld.x,
      -_lightPositionWorld.y,
      -_lightPositionWorld.z
    );
    _projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this._frustum.setFromProjectionMatrix(_projScreenMatrix);
  }
}
const _projScreenMatrix = /* @__PURE__ */ new Matrix4();
const _lightPositionWorld = /* @__PURE__ */ new Vector3();
const _lookTarget = /* @__PURE__ */ new Vector3();

class PointLight extends Light {
  type = "PointLight";
  distance = 0;
  decay = 2;
  shadow = new PointLightShadow();
  constructor(color, intensity, distance = 0, decay = 2) {
    super(color, intensity);
    this.distance = distance;
    this.decay = decay;
  }
  get isPointLight() {
    return true;
  }
  get power() {
    return this.intensity * 4 * Math.PI;
  }
  set power(power) {
    this.intensity = power / (4 * Math.PI);
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(source, recursive) {
    super.copy(source, recursive);
    this.distance = source.distance;
    this.decay = source.decay;
    this.shadow = source.shadow.clone();
    return this;
  }
}

class SpotLightShadow extends LightShadow {
  focus = 1;
  constructor() {
    super(new PerspectiveCamera(50, 1, 0.5, 500));
  }
  get isSpotLightShadow() {
    return true;
  }
  updateMatrices(light) {
    const camera = this.camera;
    const fov = RAD2DEG * 2 * light.angle * this.focus;
    const aspect = this.mapSize.width / this.mapSize.height;
    const far = light.distance || camera.far;
    if (fov !== camera.fov || aspect !== camera.aspect || far !== camera.far) {
      camera.fov = fov;
      camera.aspect = aspect;
      camera.far = far;
      camera.updateProjectionMatrix();
    }
    super.updateMatrices(light);
  }
  copy(source) {
    super.copy(source);
    this.focus = source.focus;
    return this;
  }
}

class SpotLight extends Light {
  type = "SpotLight";
  target = new Object3D();
  distance = 0;
  angle = Math.PI / 3;
  penumbra = 0;
  decay = 2;
  map = null;
  shadow = new SpotLightShadow();
  constructor(color, intensity, distance = 0, angle = Math.PI / 3, penumbra = 0, decay = 2) {
    super(color, intensity);
    this.position.copy(Object3D.DEFAULT_UP);
    this.updateMatrix();
    this.distance = distance;
    this.angle = angle;
    this.penumbra = penumbra;
    this.decay = decay;
  }
  get isSpotLight() {
    return true;
  }
  get power() {
    return this.intensity * Math.PI;
  }
  set power(power) {
    this.intensity = power / Math.PI;
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(source, recursive) {
    super.copy(source, recursive);
    this.distance = source.distance;
    this.angle = source.angle;
    this.penumbra = source.penumbra;
    this.decay = source.decay;
    this.target = source.target.clone();
    this.shadow = source.shadow.clone();
    return this;
  }
}

export { AmbientLight, DirectionalLight, DirectionalLightShadow, Light, LightShadow, PointLight, PointLightShadow, SpotLight, SpotLightShadow };
