import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { BufferAttribute } from '../src/BufferAttribute.js';
import { InstancedBufferAttribute } from '../src/InstancedBufferAttribute.js';

describe('Buffers', () => {
  describe('InstancedBufferAttribute', () => {
    test('Extending', () => {
      const object = new BufferAttribute();
      expect(object).toBeInstanceOf(BufferAttribute);
    });

    test('Instancing', () => {
      // array, itemSize
      let instance = new InstancedBufferAttribute(new Float32Array(10), 2);
      expect(instance.meshPerAttribute === 1).toBeTruthy();

      // array, itemSize, normalized, meshPerAttribute
      instance = new InstancedBufferAttribute(new Float32Array(10), 2, false, 123);
      expect(instance.meshPerAttribute === 123).toBeTruthy();
    });

    test.todo('meshPerAttribute', () => {
      // implement
    });

    test('isInstancedBufferAttribute', () => {
      const object = new InstancedBufferAttribute();
      expect(object.isInstancedBufferAttribute).toBeTruthy();
    });

    test('copy', () => {
      const array = new Float32Array([1, 2, 3, 7, 8, 9]);
      const instance = new InstancedBufferAttribute(array, 2, true, 123);
      const copiedInstance = instance.copy(instance);

      expect(copiedInstance).toBeInstanceOf(InstancedBufferAttribute);
      expect(copiedInstance.itemSize === 2).toBeTruthy();
      expect(copiedInstance.normalized === true).toBeTruthy();
      expect(copiedInstance.meshPerAttribute === 123).toBeTruthy();

      for (let i = 0; i < array.length; i++) {
        expect(copiedInstance.array[i] === array[i]).toBeTruthy();
      }
    });

    test.todo('toJSON', () => {
      // implement
    });
  });
});
