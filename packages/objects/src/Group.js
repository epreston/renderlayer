import { Object3D } from '@renderlayer/core';

class Group extends Object3D {
  constructor() {
    super();

    this.type = 'Group';
  }

  get isGroup() {
    return true;
  }
}

export { Group };
