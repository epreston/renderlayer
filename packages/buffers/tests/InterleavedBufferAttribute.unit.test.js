import { describe, expect, it, test, vi } from 'vitest';

import { InterleavedBuffer } from '../src/InterleavedBuffer.js';
import { InterleavedBufferAttribute } from '../src/InterleavedBufferAttribute.js';

describe('Buffers', () => {
  describe('InterleavedBufferAttribute', () => {
    test('constructor', () => {
      const object = new InterleavedBufferAttribute();
      expect(object).toBeDefined();
    });

    test('isInterleavedBufferAttribute', () => {
      const object = new InterleavedBufferAttribute();
      expect(object.isInterleavedBufferAttribute).toBeTruthy();
    });

    test('name', () => {
      const object = new InterleavedBufferAttribute();
      expect(object.name).toBe('');
    });

    test('data', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const instance = new InterleavedBufferAttribute(buffer, 2, 0);

      expect(instance.data).toBe(buffer);
    });

    test('itemSize', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const instance = new InterleavedBufferAttribute(buffer, 2, 0);

      expect(instance.itemSize).toBe(2);
    });

    test('offset', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const instance = new InterleavedBufferAttribute(buffer, 2, 0);

      expect(instance.offset).toBe(0);
    });

    test('normalized', () => {
      const object = new InterleavedBufferAttribute();
      expect(object.normalized).toBe(false);
    });

    test('count', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const instance = new InterleavedBufferAttribute(buffer, 2, 0);

      // count is calculated via array length / stride
      expect(instance.count).toBe(2);
    });

    test.todo('array', () => {
      // implement
    });

    test('needsUpdate', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);
      expect(object.data.version).toBe(0);

      object.needsUpdate = true;

      expect(object.data.version).toBe(1);
    });

    test.todo('applyMatrix4', () => {
      // implement
    });

    test.todo('applyNormalMatrix', () => {
      // implement
    });

    test.todo('transformDirection', () => {
      // implement
    });

    test('setX', () => {
      let buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      let instance = new InterleavedBufferAttribute(buffer, 2, 0);

      instance.setX(0, 123);
      instance.setX(1, 321);

      expect(instance.data.array[0] === 123 && instance.data.array[3] === 321).toBeTruthy();

      buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      instance = new InterleavedBufferAttribute(buffer, 2, 1);

      instance.setX(0, 123);
      instance.setX(1, 321);

      // the offset was defined as 1, so go one step futher in the array
      expect(instance.data.array[1] === 123 && instance.data.array[4] === 321).toBeTruthy();
    });

    test.todo('setY', () => {
      // implement
    });

    test.todo('setZ', () => {
      // implement
    });

    test.todo('setW', () => {
      // implement
    });

    test.todo('getX', () => {
      // implement
    });

    test.todo('getY', () => {
      // implement
    });

    test.todo('getZ', () => {
      // implement
    });

    test.todo('getW', () => {
      // implement
    });

    test.todo('setXY', () => {
      // implement
    });

    test.todo('setXYZ', () => {
      // implement
    });

    test.todo('setXYZW', () => {
      // implement
    });

    test('clone', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);
      const data = {};
      const clonedObject = object.clone(data);

      // will be different
      clonedObject.data.uuid = object.data.uuid;

      expect(clonedObject).not.toBe(object);
      expect(clonedObject).toStrictEqual(object);
    });

    test('toJSON', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const instance = new InterleavedBufferAttribute(buffer, 2, 0);

      expect(instance).toMatchInlineSnapshot(`
        {
          "array": [
            1,
            2,
            7,
            8,
          ],
          "itemSize": 2,
          "normalized": false,
          "type": "Float32Array",
        }
      `);

      expect('de-interleave buffer data').toHaveBeenWarnedTimes(1);
    });
  });
});
