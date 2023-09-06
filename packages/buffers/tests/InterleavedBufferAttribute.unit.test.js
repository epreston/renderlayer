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

    test('getX', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);

      const value = object.getX(1);

      expect(value).toBe(7);
    });

    test('setX', () => {
      let buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      let instance = new InterleavedBufferAttribute(buffer, 2, 0);

      instance.setX(0, 123);
      instance.setX(1, 321);

      expect(instance.data.array[0]).toBe(123);
      expect(instance.data.array[3]).toBe(321);

      buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      instance = new InterleavedBufferAttribute(buffer, 2, 1);

      instance.setX(0, 123);
      instance.setX(1, 321);

      // the offset was defined as 1, so go one step further in the array
      expect(instance.data.array[1]).toBe(123);
      expect(instance.data.array[4]).toBe(321);
    });

    test('getY', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);

      const value = object.getY(1);

      expect(value).toBe(8);
    });

    test('setY', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);

      object.setY(0, 42);

      expect(object.getY(0)).toBe(42);
    });

    test('getZ', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 3, 0);

      const value = object.getZ(1);

      expect(value).toBe(9);
    });

    test('setZ', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 3, 0);

      object.setZ(0, 42);

      expect(object.getZ(0)).toBe(42);
    });

    test('getW', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 4, 7, 8, 9, 10]), 4);
      const object = new InterleavedBufferAttribute(buffer, 4, 0);

      const value = object.getW(1);

      expect(value).toBe(10);
    });

    test('setW', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 4, 7, 8, 9, 10]), 4);
      const object = new InterleavedBufferAttribute(buffer, 4, 0);

      object.setW(0, 42);

      expect(object.getW(0)).toBe(42);
    });

    test('setXY', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 4, 7, 8, 9, 10]), 4);
      const object = new InterleavedBufferAttribute(buffer, 4, 0);

      object.setXY(1, 11, 22);

      expect(object.getY(1)).toBe(22);
    });

    test('setXYZ', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 4, 7, 8, 9, 10]), 4);
      const object = new InterleavedBufferAttribute(buffer, 4, 0);

      object.setXYZ(0, 11, 22, 33);

      expect(object.getZ(0)).toBe(33);
    });

    test('setXYZW', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 4, 7, 8, 9, 10]), 4);
      const object = new InterleavedBufferAttribute(buffer, 4, 0);

      object.setXYZW(1, 11, 22, 33, 44);

      expect(object.getW(1)).toBe(44);
    });

    test('clone - with data param', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);
      const data = {};
      const clonedObject = object.clone(data);

      // will be different
      clonedObject.data.uuid = object.data.uuid;

      expect(clonedObject).not.toBe(object);
      expect(clonedObject).toStrictEqual(object);
    });

    test('clone - no data param', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);
      const clonedObject = object.clone();

      expect('de-interleave buffer data').toHaveBeenWarned();

      expect(clonedObject).not.toBe(object);
      expect(clonedObject.itemSize).toBe(object.itemSize);
      expect(clonedObject.name).toBe(object.name);
      expect(clonedObject.normalized).toBe(object.normalized);
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
