import { BufferGeometry } from './BufferGeometry.js';

class InstancedBufferGeometry extends BufferGeometry {
  type = 'InstancedBufferGeometry';

  instanceCount = Infinity;

  constructor() {
    super();
  }

  get isInstancedBufferGeometry() {
    return true;
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
