import { Object3D } from '@renderlayer/core';
import { Matrix4, Quaternion, Vector3 } from '@renderlayer/math';
import { WebGLCoordinateSystem } from '@renderlayer/shared';

class Camera extends Object3D {
  type = 'Camera';

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

    // exclude scale from view matrix to be glTF conform

    this.matrixWorld.decompose(_position, _quaternion, _scale);

    if (_scale.x === 1 && _scale.y === 1 && _scale.z === 1) {
      this.matrixWorldInverse.copy(this.matrixWorld).invert();
    } else {
      this.matrixWorldInverse.compose(_position, _quaternion, _scale.set(1, 1, 1)).invert();
    }
  }

  updateWorldMatrix(updateParents, updateChildren) {
    super.updateWorldMatrix(updateParents, updateChildren);

    // exclude scale from view matrix to be glTF conform

    this.matrixWorld.decompose(_position, _quaternion, _scale);

    if (_scale.x === 1 && _scale.y === 1 && _scale.z === 1) {
      this.matrixWorldInverse.copy(this.matrixWorld).invert();
    } else {
      this.matrixWorldInverse.compose(_position, _quaternion, _scale.set(1, 1, 1)).invert();
    }
  }

  /** @returns {this} */
  clone() {
    // @ts-ignore
    return new this.constructor().copy(this);
  }
}

const _position = /*@__PURE__*/ new Vector3();
const _quaternion = /*@__PURE__*/ new Quaternion();
const _scale = /*@__PURE__*/ new Vector3();

export { Camera };
