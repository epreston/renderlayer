import { describe, expect, it, test, vi } from 'vitest';

import { BufferAttribute } from '../src/BufferAttribute.js';
import { InstancedBufferAttribute } from '../src/InstancedBufferAttribute.js';

describe('Buffers', () => {
  describe('InstancedBufferAttribute', () => {
    test('constructor', () => {
      // array, itemSize
      let instance = new InstancedBufferAttribute(new Float32Array(10), 2);
      expect(instance.meshPerAttribute).toBe(1);

      // array, itemSize, normalized, meshPerAttribute
      instance = new InstancedBufferAttribute(new Float32Array(10), 2, false, 123);
      expect(instance.meshPerAttribute).toBe(123);
    });

    test('extends', () => {
      const object = new BufferAttribute();
      expect(object).toBeInstanceOf(BufferAttribute);
    });

    test('isInstancedBufferAttribute', () => {
      const object = new InstancedBufferAttribute();
      expect(object.isInstancedBufferAttribute).toBeTruthy();
    });

    test('meshPerAttribute', () => {
      const array = new Float32Array([1, 2, 3, 7, 8, 9]);
      const instance = new InstancedBufferAttribute(array, 2, true, 123);

      expect(instance.meshPerAttribute).toBe(123);
    });

    test('copy', () => {
      const array = new Float32Array([1, 2, 3, 7, 8, 9]);
      const instance = new InstancedBufferAttribute(array, 2, true, 123);
      const copiedInstance = instance.copy(instance);

      expect(copiedInstance).toBeInstanceOf(InstancedBufferAttribute);
      expect(copiedInstance.itemSize).toBe(2);
      expect(copiedInstance.normalized).toBeTruthy();
      expect(copiedInstance.meshPerAttribute).toBe(123);

      for (let i = 0; i < array.length; i++) {
        expect(copiedInstance.array[i]).toBe(array[i]);
      }
    });

    test('toJSON', () => {
      const array = new Float32Array([1, 2, 3, 7, 8, 9]);
      const instance = new InstancedBufferAttribute(array, 2, true, 123);

      expect(instance).toMatchInlineSnapshot(`
        {
          "array": [
            1,
            2,
            3,
            7,
            8,
            9,
          ],
          "isInstancedBufferAttribute": true,
          "itemSize": 2,
          "meshPerAttribute": 123,
          "normalized": true,
          "type": "Float32Array",
        }
      `);
    });
  });
});
