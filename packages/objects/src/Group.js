import { Object3D } from '@renderlayer/core';

class Group extends Object3D {
  constructor() {
    super();

    this.isGroup = true;
    this.type = 'Group';
  }
}

export { Group };
