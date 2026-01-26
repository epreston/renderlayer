import { Object3D } from '@renderlayer/core';

class Bone extends Object3D {
  constructor() {
    super();

    this.type = 'Bone';
  }

  get isBone() {
    return true;
  }
}

export { Bone };
