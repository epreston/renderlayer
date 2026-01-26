import { Object3D } from '@renderlayer/core';

class Bone extends Object3D {
  type = 'Bone';

  constructor() {
    super();
  }

  get isBone() {
    return true;
  }
}

export { Bone };
