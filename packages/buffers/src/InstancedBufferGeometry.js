import { BufferGeometry } from './BufferGeometry.js';

class InstancedBufferGeometry extends BufferGeometry {
  isInstancedBufferGeometry = true;
  type = 'InstancedBufferGeometry';

  instanceCount = Infinity;

  constructor() {
    super();
  }

  copy(source) {
    super.copy(source);

    this.instanceCount = source.instanceCount;

    return this;
  }

  toJSON() {
    const data = super.toJSON();

    data.instanceCount = this.instanceCount;
    data.isInstancedBufferGeometry = true;

    return data;
  }
}

export { InstancedBufferGeometry };
