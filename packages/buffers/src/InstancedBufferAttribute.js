import { BufferAttribute } from './BufferAttribute.js';

class InstancedBufferAttribute extends BufferAttribute {
  meshPerAttribute = 1;

  constructor(array, itemSize, normalized, meshPerAttribute = 1) {
    super(array, itemSize, normalized);

    this.meshPerAttribute = meshPerAttribute;
  }

  get isInstancedBufferAttribute() {
    return true;
  }

  copy(source) {
    super.copy(source);

    this.meshPerAttribute = source.meshPerAttribute;

    return this;
  }

  toJSON() {
    const data = super.toJSON();

    data.meshPerAttribute = this.meshPerAttribute;
    data.isInstancedBufferAttribute = true;

    return data;
  }
}

export { InstancedBufferAttribute };
