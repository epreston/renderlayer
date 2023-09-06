import { describe, expect, it, test, vi } from 'vitest';

import { Matrix3, Matrix4 } from '@renderlayer/math';

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
      const object = new InterleavedBufferAttribute(buffer, 2, 0);

      expect(object.data).toBe(buffer);
    });

    test('itemSize', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);

      expect(object.itemSize).toBe(2);
    });

    test('offset', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);

      expect(object.offset).toBe(0);
    });

    test('normalized', () => {
      const object = new InterleavedBufferAttribute();
      expect(object.normalized).toBe(false);
    });

    test('count', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);

      // count is calculated via array length / stride
      expect(object.count).toBe(2);
    });

    test('array', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);

      expect(object.data.array).toBe(object.array);
    });

    test('needsUpdate', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);
      expect(object.data.version).toBe(0);

      object.needsUpdate = true;

      expect(object.data.version).toBe(1);
    });

    test('applyMatrix4', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);
      const matrix = new Matrix4();
      matrix.setPosition(3, 2, 1);

      expect(object.data.array).toMatchInlineSnapshot(`
        Float32Array [
          1,
          2,
          3,
          7,
          8,
          9,
        ]
      `);

      object.applyMatrix4(matrix);

      expect(object.data.array).toMatchInlineSnapshot(`
        Float32Array [
          4,
          4,
          4,
          10,
          10,
          10,
        ]
      `);
    });

    test('applyNormalMatrix', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);
      const matrix = new Matrix3();

      expect(object.data.array).toMatchInlineSnapshot(`
        Float32Array [
          1,
          2,
          3,
          7,
          8,
          9,
        ]
      `);

      object.applyNormalMatrix(matrix);

      expect(object.data.array).toMatchInlineSnapshot(`
        Float32Array [
          0.26726123690605164,
          0.5345224738121033,
          0.8017837405204773,
          0.5025706887245178,
          0.5743665099143982,
          0.6461623311042786,
        ]
      `);
    });

    test('transformDirection', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);
      const matrix = new Matrix4();

      expect(object.data.array).toMatchInlineSnapshot(`
        Float32Array [
          1,
          2,
          3,
          7,
          8,
          9,
        ]
      `);

      object.transformDirection(matrix);

      expect(object.data.array).toMatchInlineSnapshot(`
        Float32Array [
          0.26726123690605164,
          0.5345224738121033,
          0.8017837405204773,
          0.5025706887245178,
          0.5743665099143982,
          0.6461623311042786,
        ]
      `);
    });

    test('getX', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);

      const value = object.getX(1);

      expect(value).toBe(7);
    });

    test('setX', () => {
      let buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      let object = new InterleavedBufferAttribute(buffer, 2, 0);

      object.setX(0, 123);
      object.setX(1, 321);

      expect(object.data.array[0]).toBe(123);
      expect(object.data.array[3]).toBe(321);

      buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      object = new InterleavedBufferAttribute(buffer, 2, 1);

      object.setX(0, 123);
      object.setX(1, 321);

      // the offset was defined as 1, so go one step further in the array
      expect(object.data.array[1]).toBe(123);
      expect(object.data.array[4]).toBe(321);
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

    test('toJSON - with data param', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);
      const data = {};
      const json = object.toJSON(data);

      // will be different
      json.data = '932ee2e6-ca98-4b83-b0a1-83bd73af7e87';

      expect(json).toMatchInlineSnapshot(`
        {
          "data": "932ee2e6-ca98-4b83-b0a1-83bd73af7e87",
          "isInterleavedBufferAttribute": true,
          "itemSize": 2,
          "normalized": false,
          "offset": 0,
        }
      `);
    });

    test('toJSON - no data param', () => {
      const buffer = new InterleavedBuffer(new Float32Array([1, 2, 3, 7, 8, 9]), 3);
      const object = new InterleavedBufferAttribute(buffer, 2, 0);

      expect(object).toMatchInlineSnapshot(`
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

      expect('de-interleave buffer data').toHaveBeenWarned();
    });
  });
});
