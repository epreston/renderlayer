import { WebGLCoordinateSystem } from '@renderlayer/shared';
import { Matrix4 } from '@renderlayer/math';
import { Object3D } from '@renderlayer/core';

class Camera extends Object3D {
  type = 'Camera';

  matrixWorldInverse = new Matrix4();

  projectionMatrix = new Matrix4();
  projectionMatrixInverse = new Matrix4();

  coordinateSystem = WebGLCoordinateSystem;

  constructor() {
    super();
  }

  get isCamera() {
    return true;
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

    this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }

  updateWorldMatrix(updateParents, updateChildren) {
    super.updateWorldMatrix(updateParents, updateChildren);

    this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }

  /** @returns {this} */
  clone() {
    // @ts-ignore
    return new this.constructor().copy(this);
  }
}

export { Camera };
