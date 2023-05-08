import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { InterleavedBuffer } from '../src/InterleavedBuffer.js';
import { InterleavedBufferAttribute } from '../src/InterleavedBufferAttribute.js';

describe('Core', () => {
  describe('InterleavedBufferAttribute', () => {
    test('Instancing', () => {
      const object = new InterleavedBufferAttribute();
      expect(object).toBeDefined();
    });

    test.todo('name', () => {
      // implement
    });

    test.todo('data', () => {
      // implement
    });

    test.todo('itemSize', () => {
      // implement
    });

    test.todo('offset', () => {
      // implement
    });

    test.todo('normalized', () => {
      // implement
    });

    test('count', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const instance = new InterleavedBufferAttribute(buffer, 2, 0);

      // count is calculated via array length / stride
      expect(instance.count === 2).toBeTruthy();
    });

    test.todo('array', () => {
      // implement
    });

    test.todo('needsUpdate', () => {
      // set needsUpdate( value )
      // implement
    });

    test('isInterleavedBufferAttribute', () => {
      const object = new InterleavedBufferAttribute();
      expect(object.isInterleavedBufferAttribute).toBeTruthy();
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

    test.todo('clone', () => {
      // implement
    });

    test.todo('toJSON', () => {
      // implement
    });
  });
});
