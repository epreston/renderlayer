import { WebGLCoordinateSystem, WebGPUCoordinateSystem } from '@renderlayer/shared';
import { Matrix4, Vector3, Quaternion, RAD2DEG, DEG2RAD } from '@renderlayer/math';
import { Object3D } from '@renderlayer/core';

class Camera extends Object3D {
  type = "Camera";
  matrixWorldInverse = new Matrix4();
  projectionMatrix = new Matrix4();
  projectionMatrixInverse = new Matrix4();
  coordinateSystem = WebGLCoordinateSystem;
  _reversedDepth = false;
  constructor() {
    super();
  }
  get isCamera() {
    return true;
  }
  get reversedDepth() {
    return this._reversedDepth;
  }
  copy(source, recursive) {
    super.copy(source, recursive);
    this.matrixWorldInverse.copy(source.matrixWorldInverse);
    this.projectionMatrix.copy(source.projectionMatrix);
    this.projectionMatrixInverse.copy(source.projectionMatrixInverse);
    this.coordinateSystem = source.coordinateSystem;
    return this;
  }
  getWorldDirection(target) {
    return super.getWorldDirection(target).negate();
  }
  updateMatrixWorld(force) {
    super.updateMatrixWorld(force);
    this.matrixWorld.decompose(_position, _quaternion, _scale);
    if (_scale.x === 1 && _scale.y === 1 && _scale.z === 1) {
      this.matrixWorldInverse.copy(this.matrixWorld).invert();
    } else {
      this.matrixWorldInverse.compose(_position, _quaternion, _scale.set(1, 1, 1)).invert();
    }
  }
  updateWorldMatrix(updateParents, updateChildren) {
    super.updateWorldMatrix(updateParents, updateChildren);
    this.matrixWorld.decompose(_position, _quaternion, _scale);
    if (_scale.x === 1 && _scale.y === 1 && _scale.z === 1) {
      this.matrixWorldInverse.copy(this.matrixWorld).invert();
    } else {
      this.matrixWorldInverse.compose(_position, _quaternion, _scale.set(1, 1, 1)).invert();
    }
  }
  /** @returns {this} */
  clone() {
    return new this.constructor().copy(this);
  }
}
const _position = /* @__PURE__ */ new Vector3();
const _quaternion = /* @__PURE__ */ new Quaternion();
const _scale = /* @__PURE__ */ new Vector3();

class PerspectiveCamera extends Camera {
  type = "PerspectiveCamera";
  fov = 50;
  zoom = 1;
  near = 0.1;
  far = 2e3;
  focus = 10;
  aspect = 1;
  view = null;
  filmGauge = 35;
  // width of the film (default in millimetres)
  filmOffset = 0;
  // horizontal film offset (same unit as gauge)
  constructor(fov = 50, aspect = 1, near = 0.1, far = 2e3) {
    super();
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    this.updateProjectionMatrix();
  }
  get isPerspectiveCamera() {
    return true;
  }
  copy(source, recursive) {
    super.copy(source, recursive);
    this.fov = source.fov;
    this.zoom = source.zoom;
    this.near = source.near;
    this.far = source.far;
    this.focus = source.focus;
    this.aspect = source.aspect;
    this.view = source.view === null ? null : Object.assign({}, source.view);
    this.filmGauge = source.filmGauge;
    this.filmOffset = source.filmOffset;
    return this;
  }
  /**
   * Sets the FOV by focal length in respect to the current .filmGauge.
   *
   * The default film gauge is 35, so that the focal length can be specified for
   * a 35mm (full frame) camera.
   *
   * Values for focal length and film gauge must have the same unit.
   */
  setFocalLength(focalLength) {
    const vExtentSlope = 0.5 * this.getFilmHeight() / focalLength;
    this.fov = RAD2DEG * 2 * Math.atan(vExtentSlope);
    this.updateProjectionMatrix();
  }
  /**
   * Calculates the focal length from the current .fov and .filmGauge.
   */
  getFocalLength() {
    const vExtentSlope = Math.tan(DEG2RAD * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / vExtentSlope;
  }
  getEffectiveFOV() {
    return RAD2DEG * 2 * Math.atan(Math.tan(DEG2RAD * 0.5 * this.fov) / this.zoom);
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  /**
   * Sets an offset in a larger frustum. This is useful for multi-window or
   * multi-monitor/multi-machine setups.
   *
   * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
   * the monitors are in grid like this
   *
   *   +---+---+---+
   *   | A | B | C |
   *   +---+---+---+
   *   | D | E | F |
   *   +---+---+---+
   *
   * then for each monitor you would call it like this
   *
   *   const w = 1920;
   *   const h = 1080;
   *   const fullWidth = w * 3;
   *   const fullHeight = h * 2;
   *
   *   --A--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
   *   --B--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
   *   --C--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
   *   --D--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
   *   --E--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
   *   --F--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
   *
   *   Note there is no reason monitors have to be the same size or in a grid.
   */
  setViewOffset(fullWidth, fullHeight, x, y, width, height) {
    this.aspect = fullWidth / fullHeight;
    if (this.view === null) {
      this.view = {
        enabled: true,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1
      };
    }
    this.view.enabled = true;
    this.view.fullWidth = fullWidth;
    this.view.fullHeight = fullHeight;
    this.view.offsetX = x;
    this.view.offsetY = y;
    this.view.width = width;
    this.view.height = height;
    this.updateProjectionMatrix();
  }
  clearViewOffset() {
    if (this.view !== null) {
      this.view.enabled = false;
    }
    this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const near = this.near;
    let top = near * Math.tan(DEG2RAD * 0.5 * this.fov) / this.zoom;
    let height = 2 * top;
    let width = this.aspect * height;
    let left = -0.5 * width;
    const view = this.view;
    if (this.view !== null && this.view.enabled) {
      const fullWidth = view.fullWidth;
      const fullHeight = view.fullHeight;
      left += view.offsetX * width / fullWidth;
      top -= view.offsetY * height / fullHeight;
      width *= view.width / fullWidth;
      height *= view.height / fullHeight;
    }
    const skew = this.filmOffset;
    if (skew !== 0) left += near * skew / this.getFilmWidth();
    this.projectionMatrix.makePerspective(
      left,
      left + width,
      top,
      top - height,
      near,
      this.far,
      this.coordinateSystem === WebGPUCoordinateSystem
    );
    this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(meta) {
    const data = super.toJSON(meta);
    data.object.fov = this.fov;
    data.object.zoom = this.zoom;
    data.object.near = this.near;
    data.object.far = this.far;
    data.object.focus = this.focus;
    data.object.aspect = this.aspect;
    if (this.view !== null) data.object.view = Object.assign({}, this.view);
    data.object.filmGauge = this.filmGauge;
    data.object.filmOffset = this.filmOffset;
    return data;
  }
}

class ArrayCamera extends PerspectiveCamera {
  cameras;
  isMultiViewCamera = false;
  /**
   * @param {Array<PerspectiveCamera>} [array=[]]
   */
  constructor(array = []) {
    super();
    this.cameras = array;
  }
  get isArrayCamera() {
    return true;
  }
}

class CubeCamera extends Object3D {
  type = "CubeCamera";
  renderTarget;
  coordinateSystem = null;
  activeMipmapLevel = 0;
  constructor(near, far, renderTarget) {
    super();
    this.renderTarget = renderTarget;
    const cameraPX = new PerspectiveCamera(_fov, _aspect, near, far);
    cameraPX.layers = this.layers;
    this.add(cameraPX);
    const cameraNX = new PerspectiveCamera(_fov, _aspect, near, far);
    cameraNX.layers = this.layers;
    this.add(cameraNX);
    const cameraPY = new PerspectiveCamera(_fov, _aspect, near, far);
    cameraPY.layers = this.layers;
    this.add(cameraPY);
    const cameraNY = new PerspectiveCamera(_fov, _aspect, near, far);
    cameraNY.layers = this.layers;
    this.add(cameraNY);
    const cameraPZ = new PerspectiveCamera(_fov, _aspect, near, far);
    cameraPZ.layers = this.layers;
    this.add(cameraPZ);
    const cameraNZ = new PerspectiveCamera(_fov, _aspect, near, far);
    cameraNZ.layers = this.layers;
    this.add(cameraNZ);
  }
  updateCoordinateSystem() {
    const coordinateSystem = this.coordinateSystem;
    const cameras = this.children.concat();
    const [cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ] = cameras;
    for (const camera of cameras) this.remove(camera);
    if (coordinateSystem === WebGLCoordinateSystem) {
      cameraPX.up.set(0, 1, 0);
      cameraPX.lookAt(1, 0, 0);
      cameraNX.up.set(0, 1, 0);
      cameraNX.lookAt(-1, 0, 0);
      cameraPY.up.set(0, 0, -1);
      cameraPY.lookAt(0, 1, 0);
      cameraNY.up.set(0, 0, 1);
      cameraNY.lookAt(0, -1, 0);
      cameraPZ.up.set(0, 1, 0);
      cameraPZ.lookAt(0, 0, 1);
      cameraNZ.up.set(0, 1, 0);
      cameraNZ.lookAt(0, 0, -1);
    } else if (coordinateSystem === WebGPUCoordinateSystem) {
      cameraPX.up.set(0, -1, 0);
      cameraPX.lookAt(-1, 0, 0);
      cameraNX.up.set(0, -1, 0);
      cameraNX.lookAt(1, 0, 0);
      cameraPY.up.set(0, 0, 1);
      cameraPY.lookAt(0, 1, 0);
      cameraNY.up.set(0, 0, -1);
      cameraNY.lookAt(0, -1, 0);
      cameraPZ.up.set(0, -1, 0);
      cameraPZ.lookAt(0, 0, 1);
      cameraNZ.up.set(0, -1, 0);
      cameraNZ.lookAt(0, 0, -1);
    } else {
      throw new Error(
        `CubeCamera.updateCoordinateSystem(): Invalid coordinate system: ${coordinateSystem}`
      );
    }
    for (const camera of cameras) {
      this.add(camera);
      camera.updateMatrixWorld();
    }
  }
  update(renderer, scene) {
    if (this.parent === null) this.updateMatrixWorld();
    const { renderTarget, activeMipmapLevel } = this;
    if (this.coordinateSystem !== renderer.coordinateSystem) {
      this.coordinateSystem = renderer.coordinateSystem;
      this.updateCoordinateSystem();
    }
    const [cameraPX, cameraNX, cameraPY, cameraNY, cameraPZ, cameraNZ] = this.children;
    const currentRenderTarget = renderer.getRenderTarget();
    const currentActiveCubeFace = renderer.getActiveCubeFace();
    const currentActiveMipmapLevel = renderer.getActiveMipmapLevel();
    const generateMipmaps = renderTarget.texture.generateMipmaps;
    renderTarget.texture.generateMipmaps = false;
    renderer.setRenderTarget(renderTarget, 0, activeMipmapLevel);
    renderer.render(scene, cameraPX);
    renderer.setRenderTarget(renderTarget, 1, activeMipmapLevel);
    renderer.render(scene, cameraNX);
    renderer.setRenderTarget(renderTarget, 2, activeMipmapLevel);
    renderer.render(scene, cameraPY);
    renderer.setRenderTarget(renderTarget, 3, activeMipmapLevel);
    renderer.render(scene, cameraNY);
    renderer.setRenderTarget(renderTarget, 4, activeMipmapLevel);
    renderer.render(scene, cameraPZ);
    renderTarget.texture.generateMipmaps = generateMipmaps;
    renderer.setRenderTarget(renderTarget, 5, activeMipmapLevel);
    renderer.render(scene, cameraNZ);
    renderer.setRenderTarget(currentRenderTarget, currentActiveCubeFace, currentActiveMipmapLevel);
    renderTarget.texture.needsPMREMUpdate = true;
  }
}
const _fov = -90;
const _aspect = 1;

class OrthographicCamera extends Camera {
  type = "OrthographicCamera";
  zoom = 1;
  view = null;
  left = -1;
  right = 1;
  top = 1;
  bottom = -1;
  near = 0.1;
  far = 2e3;
  constructor(left = -1, right = 1, top = 1, bottom = -1, near = 0.1, far = 2e3) {
    super();
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.near = near;
    this.far = far;
    this.updateProjectionMatrix();
  }
  get isOrthographicCamera() {
    return true;
  }
  copy(source, recursive) {
    super.copy(source, recursive);
    this.left = source.left;
    this.right = source.right;
    this.top = source.top;
    this.bottom = source.bottom;
    this.near = source.near;
    this.far = source.far;
    this.zoom = source.zoom;
    this.view = source.view === null ? null : Object.assign({}, source.view);
    return this;
  }
  setViewOffset(fullWidth, fullHeight, x, y, width, height) {
    if (this.view === null) {
      this.view = {
        enabled: true,
        fullWidth: 1,
        fullHeight: 1,
        offsetX: 0,
        offsetY: 0,
        width: 1,
        height: 1
      };
    }
    this.view.enabled = true;
    this.view.fullWidth = fullWidth;
    this.view.fullHeight = fullHeight;
    this.view.offsetX = x;
    this.view.offsetY = y;
    this.view.width = width;
    this.view.height = height;
    this.updateProjectionMatrix();
  }
  clearViewOffset() {
    if (this.view !== null) {
      this.view.enabled = false;
    }
    this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const dx = (this.right - this.left) / (2 * this.zoom);
    const dy = (this.top - this.bottom) / (2 * this.zoom);
    const cx = (this.right + this.left) / 2;
    const cy = (this.top + this.bottom) / 2;
    let left = cx - dx;
    let right = cx + dx;
    let top = cy + dy;
    let bottom = cy - dy;
    if (this.view !== null && this.view.enabled) {
      const scaleW = (this.right - this.left) / this.view.fullWidth / this.zoom;
      const scaleH = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      left += scaleW * this.view.offsetX;
      right = left + scaleW * this.view.width;
      top -= scaleH * this.view.offsetY;
      bottom = top - scaleH * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(
      left,
      right,
      top,
      bottom,
      this.near,
      this.far,
      this.coordinateSystem === WebGPUCoordinateSystem
    );
    this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(meta) {
    const data = super.toJSON(meta);
    data.object.zoom = this.zoom;
    data.object.left = this.left;
    data.object.right = this.right;
    data.object.top = this.top;
    data.object.bottom = this.bottom;
    data.object.near = this.near;
    data.object.far = this.far;
    if (this.view !== null) data.object.view = Object.assign({}, this.view);
    return data;
  }
}

export { ArrayCamera, Camera, CubeCamera, OrthographicCamera, PerspectiveCamera };
