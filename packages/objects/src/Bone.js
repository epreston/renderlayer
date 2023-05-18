import { Object3D } from '@renderlayer/core';

class Bone extends Object3D {
  constructor() {
    super();

    this.isBone = true;
    this.type = 'Bone';
  }
}

export { Bone };
