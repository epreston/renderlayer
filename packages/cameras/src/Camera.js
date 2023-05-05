import { Matrix4 } from '@renderlayer/math';
import { Object3D } from '@renderlayer/core';

class Camera extends Object3D {
  constructor() {
    super();

    this.isCamera = true;

    this.type = 'Camera';

    this.matrixWorldInverse = new Matrix4();

    this.projectionMatrix = new Matrix4();
    this.projectionMatrixInverse = new Matrix4();
  }

  copy(source, recursive) {
    super.copy(source, recursive);

    this.matrixWorldInverse.copy(source.matrixWorldInverse);

    this.projectionMatrix.copy(source.projectionMatrix);
    this.projectionMatrixInverse.copy(source.projectionMatrixInverse);

    return this;
  }

  getWorldDirection(target) {
    this.updateWorldMatrix(true, false);

    const e = this.matrixWorld.elements;

    return target.set(-e[8], -e[9], -e[10]).normalize();
  }

  updateMatrixWorld(force) {
    super.updateMatrixWorld(force);

    this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }

  updateWorldMatrix(updateParents, updateChildren) {
    super.updateWorldMatrix(updateParents, updateChildren);

    this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }

  clone() {
    return new this.constructor().copy(this);
  }
}

export { Camera };
