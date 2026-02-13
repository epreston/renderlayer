import { Frustum, Matrix4, Vector2, Vector3, Vector4 } from '@renderlayer/math';
import { UnsignedByteType, WebGPUCoordinateSystem } from '@renderlayer/shared';

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

    _lightPositionWorld.setFromMatrixPosition(light.matrixWorld);
    shadowCamera.position.copy(_lightPositionWorld);

    _lookTarget.setFromMatrixPosition(light.target.matrixWorld);
    shadowCamera.lookAt(_lookTarget);
    shadowCamera.updateMatrixWorld();

    _projScreenMatrix.multiplyMatrices(
      shadowCamera.projectionMatrix,
      shadowCamera.matrixWorldInverse
    );
    this._frustum.setFromProjectionMatrix(
      _projScreenMatrix,
      shadowCamera.coordinateSystem,
      shadowCamera.reversedDepth
    );

    if (shadowCamera.coordinateSystem === WebGPUCoordinateSystem || shadowCamera.reversedDepth) {
      // prettier-ignore
      shadowMatrix.set(
				0.5, 0.0, 0.0, 0.5,
				0.0, 0.5, 0.0, 0.5,
				0.0, 0.0, 1.0, 0.0, // Identity Z (preserving the correct [0, 1] range from the projection matrix)
				0.0, 0.0, 0.0, 1.0
			);
    } else {
      // prettier-ignore
      shadowMatrix.set(
				0.5, 0.0, 0.0, 0.5,
				0.0, 0.5, 0.0, 0.5,
				0.0, 0.0, 0.5, 0.5,
				0.0, 0.0, 0.0, 1.0
			);
    }

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
    // @ts-ignore
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

const _projScreenMatrix = /*@__PURE__*/ new Matrix4();
const _lightPositionWorld = /*@__PURE__*/ new Vector3();
const _lookTarget = /*@__PURE__*/ new Vector3();

export { LightShadow };
