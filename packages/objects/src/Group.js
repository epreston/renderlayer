import { Object3D } from '@renderlayer/core';

class Group extends Object3D {
  type = 'Group';

  constructor() {
    super();
  }

  get isGroup() {
    return true;
  }
}

export { Group };
