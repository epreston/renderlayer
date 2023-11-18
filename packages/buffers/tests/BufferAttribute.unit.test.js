import { describe, expect, it, test, vi } from 'vitest';

import { DynamicDrawUsage, StaticDrawUsage, FloatType } from '@renderlayer/shared';
import { toHalfFloat, fromHalfFloat } from '../src/BufferAttributeUtils.js';

import {
  BufferAttribute,
  Int8BufferAttribute,
  Uint8BufferAttribute,
  Uint8ClampedBufferAttribute,
  Int16BufferAttribute,
  Uint16BufferAttribute,
  Int32BufferAttribute,
  Uint32BufferAttribute,
  Float16BufferAttribute,
  Float32BufferAttribute,
  Float64BufferAttribute
} from '../src/BufferAttribute.js';

describe('Buffers', () => {
  describe('BufferAttribute', () => {
    test('constructor', () => {
      // no simple array

      // prettier-ignore
      expect(
        () => new BufferAttribute([1, 2, 3, 4], 2, false)
      ).toThrow('array should be a Typed Array');
    });

    test('isBufferAttribute', () => {
      const object = new BufferAttribute();
      expect(object.isBufferAttribute).toBeTruthy();
    });

    test('name', () => {
      const object = new BufferAttribute();
      expect(object.name).toBe('');
    });

    test('array', () => {
      const object = new BufferAttribute();
      expect(object.array).toBeUndefined();
    });

    test('itemSize', () => {
      const object = new BufferAttribute();
      expect(object.itemSize).toBeUndefined();
    });

    test('count', () => {
      const object = new BufferAttribute();
      expect(object.count).toBe(0);
    });

    test('normalized', () => {
      const object = new BufferAttribute();
      expect(object.normalized).toBe(false);
    });

    test('usage', () => {
      const object = new BufferAttribute();
      expect(object.usage).toBe(StaticDrawUsage);
    });

    test('updateRange', () => {
      const object = new BufferAttribute();
      expect(object.updateRange).toMatchInlineSnapshot(`
        {
          "count": -1,
          "offset": 0,
        }
      `);
    });

    test('gpuType', () => {
      const object = new BufferAttribute();
      expect(object.gpuType).toBe(FloatType);
    });

    test('version', () => {
      const object = new BufferAttribute();
      expect(object.version).toBe(0);
    });

    test('onUploadCallback', () => {
      const object = new BufferAttribute();
      expect(object.onUploadCallback).toBeDefined();
      // onUploadCallback() {}
      // defined as member function but set property. refactor req
    });

    test('needsUpdate', () => {
      const object = new BufferAttribute();
      expect(object.version).toBe(0);

      object.needsUpdate = true;

      expect(object.version).toBe(1);
    });

    test('setUsage', () => {
      const attr = new BufferAttribute();
      attr.setUsage(DynamicDrawUsage);

      expect(attr.usage).toBe(DynamicDrawUsage);
    });

    test('copy', () => {
      const attr = new BufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6]), 3);
      attr.setUsage(DynamicDrawUsage);
      attr.needsUpdate = true;

      const attrCopy = new BufferAttribute().copy(attr);

      expect(attr.count).toBe(attrCopy.count);
      expect(attr.itemSize).toBe(attrCopy.itemSize);
      expect(attr.usage).toBe(attrCopy.usage);
      expect(attr.array.length).toBe(attrCopy.array.length);
      expect(attr.version).toBe(1);
      expect(attrCopy.version).toBe(0);
    });

    test('copyAt', () => {
      const attr = new BufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9]), 3);
      const attr2 = new BufferAttribute(new Float32Array(9), 3);

      attr2.copyAt(1, attr, 2);
      attr2.copyAt(0, attr, 1);
      attr2.copyAt(2, attr, 0);

      const i = attr.array;
      const i2 = attr2.array; // should be [4, 5, 6, 7, 8, 9, 1, 2, 3]

      expect(i2[0] === i[3] && i2[1] === i[4] && i2[2] === i[5]).toBeTruthy();
      expect(i2[3] === i[6] && i2[4] === i[7] && i2[5] === i[8]).toBeTruthy();
      expect(i2[6] === i[0] && i2[7] === i[1] && i2[8] === i[2]).toBeTruthy();
    });

    test('copyArray', () => {
      const f32a = new Float32Array([5, 6, 7, 8]);
      const a = new BufferAttribute(new Float32Array([1, 2, 3, 4]), 2, false);

      a.copyArray(f32a);

      expect(a.array).toEqual(f32a);
    });

    test.todo('applyMatrix3', () => {
      // applyMatrix3( m )
      // implement
    });

    test.todo('applyMatrix4', () => {
      // applyMatrix4( m )
      // implement
    });

    test.todo('applyNormalMatrix', () => {
      // applyNormalMatrix( m )
      // implement
    });

    test.todo('transformDirection', () => {
      // transformDirection( m )
      // implement
    });

    test('set', () => {
      const f32a = new Float32Array([1, 2, 3, 4]);
      const a = new BufferAttribute(f32a, 2, false);
      const expected = new Float32Array([9, 2, 8, 4]);

      a.set([9]);
      a.set([8], 2);

      expect(a.array).toEqual(expected);
    });

    test.todo('getComponent', () => {
      // implement
    });

    test.todo('setComponent', () => {
      // implement
    });

    test('set[X, Y, Z, W, XYZ, XYZW]/get[X, Y, Z, W]', () => {
      const f32a = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const a = new BufferAttribute(f32a, 4, false);
      const expected = new Float32Array([1, 2, -3, -4, -5, -6, 7, 8]);

      a.setX(1, a.getX(1) * -1);
      a.setY(1, a.getY(1) * -1);
      a.setZ(0, a.getZ(0) * -1);
      a.setW(0, a.getW(0) * -1);

      expect(a.array).toEqual(expected);
    });

    test('setXY', () => {
      const f32a = new Float32Array([1, 2, 3, 4]);
      const a = new BufferAttribute(f32a, 2, false);
      const expected = new Float32Array([-1, -2, 3, 4]);

      a.setXY(0, -1, -2);

      expect(a.array).toEqual(expected);
    });

    test('setXYZ', () => {
      const f32a = new Float32Array([1, 2, 3, 4, 5, 6]);
      const a = new BufferAttribute(f32a, 3, false);
      const expected = new Float32Array([1, 2, 3, -4, -5, -6]);

      a.setXYZ(1, -4, -5, -6);

      expect(a.array).toEqual(expected);
    });

    test('setXYZW', () => {
      const f32a = new Float32Array([1, 2, 3, 4]);
      const a = new BufferAttribute(f32a, 4, false);
      const expected = new Float32Array([-1, -2, -3, -4]);

      a.setXYZW(0, -1, -2, -3, -4);

      expect(a.array).toEqual(expected);
    });

    test('onUpload', () => {
      const a = new BufferAttribute();
      const func = vi.fn();

      a.onUpload(func);

      expect(a.onUploadCallback).toBe(func);
    });

    test('clone', () => {
      const attr = new BufferAttribute(new Float32Array([1, 2, 3, 4, 0.12, -12]), 2);
      const attrCopy = attr.clone();

      expect(attr.array.length === attrCopy.array.length).toBeTruthy();
      for (let i = 0; i < attr.array.length; i++) {
        expect(attr.array[i] === attrCopy.array[i]).toBeTruthy();
      }
    });

    test('toJSON', () => {
      const attr = new BufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6]), 3);

      expect(attr.toJSON()).toEqual({
        itemSize: 3,
        type: 'Float32Array',
        array: [1, 2, 3, 4, 5, 6],
        normalized: false
      });

      const attr2 = new BufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6]), 3, true);
      attr2.name = 'attributeName';
      attr2.setUsage(DynamicDrawUsage);
      attr2.updateRange.offset = 1;
      attr2.updateRange.count = 2;

      expect(attr2.toJSON()).toEqual({
        itemSize: 3,
        type: 'Float32Array',
        array: [1, 2, 3, 4, 5, 6],
        normalized: true,
        name: 'attributeName',
        usage: DynamicDrawUsage,
        updateRange: { offset: 1, count: 2 }
      });
    });

    test('count', () => {
      expect(new BufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6]), 3).count === 2).toBeTruthy();
    });
  });

  describe('Int8BufferAttribute', () => {
    test('constructor', () => {
      const object = new Int8BufferAttribute();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Int8BufferAttribute();
      expect(object).toBeInstanceOf(BufferAttribute);
    });
  });

  describe('Uint8BufferAttribute', () => {
    test('constructor', () => {
      const object = new Uint8BufferAttribute();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Uint8BufferAttribute();
      expect(object).toBeInstanceOf(BufferAttribute);
    });
  });

  describe('Uint8ClampedBufferAttribute', () => {
    test('constructor', () => {
      const object = new Uint8ClampedBufferAttribute();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Uint8ClampedBufferAttribute();
      expect(object).toBeInstanceOf(BufferAttribute);
    });
  });

  describe('Int16BufferAttribute', () => {
    test('constructor', () => {
      const object = new Int16BufferAttribute();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Int16BufferAttribute();
      expect(object).toBeInstanceOf(BufferAttribute);
    });
  });

  describe('Uint16BufferAttribute', () => {
    test('constructor', () => {
      const object = new Uint16BufferAttribute();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Uint16BufferAttribute();
      expect(object).toBeInstanceOf(BufferAttribute);
    });
  });

  describe('Int32BufferAttribute', () => {
    test('constructor', () => {
      const object = new Int32BufferAttribute();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Int32BufferAttribute();
      expect(object).toBeInstanceOf(BufferAttribute);
    });
  });

  describe('Uint32BufferAttribute', () => {
    test('constructor', () => {
      const object = new Uint32BufferAttribute();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Uint32BufferAttribute();
      expect(object).toBeInstanceOf(BufferAttribute);
    });
  });

  describe('Float16BufferAttribute', () => {
    test('constructor', () => {
      const object = new Float16BufferAttribute();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Float16BufferAttribute();
      expect(object).toBeInstanceOf(BufferAttribute);
    });

    const toHalfFloatArray = (f32Array) => {
      const f16Array = new Uint16Array(f32Array.length);
      for (let i = 0, n = f32Array.length; i < n; ++i) {
        f16Array[i] = toHalfFloat(f32Array[i]);
      }

      return f16Array;
    };

    const fromHalfFloatArray = (f16Array) => {
      const f32Array = new Float32Array(f16Array.length);
      for (let i = 0, n = f16Array.length; i < n; ++i) {
        f32Array[i] = fromHalfFloat(f16Array[i]);
      }

      return f32Array;
    };

    test('set[X, Y, Z, W, XYZ, XYZW]/get[X, Y, Z, W]', () => {
      const f32a = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const a = new Float16BufferAttribute(toHalfFloatArray(f32a), 4, false);
      const expected = new Float32Array([1, 2, -3, -4, -5, -6, 7, 8]);

      a.setX(1, a.getX(1) * -1);
      a.setY(1, a.getY(1) * -1);
      a.setZ(0, a.getZ(0) * -1);
      a.setW(0, a.getW(0) * -1);

      expect(fromHalfFloatArray(a.array)).toEqual(expected);
    });

    test('setXY', () => {
      const f32a = new Float32Array([1, 2, 3, 4]);
      const a = new Float16BufferAttribute(toHalfFloatArray(f32a), 2, false);
      const expected = new Float32Array([-1, -2, 3, 4]);

      a.setXY(0, -1, -2);

      expect(fromHalfFloatArray(a.array)).toEqual(expected);
    });

    test('setXYZ', () => {
      const f32a = new Float32Array([1, 2, 3, 4, 5, 6]);
      const a = new Float16BufferAttribute(toHalfFloatArray(f32a), 3, false);
      const expected = new Float32Array([1, 2, 3, -4, -5, -6]);

      a.setXYZ(1, -4, -5, -6);

      expect(fromHalfFloatArray(a.array)).toEqual(expected);
    });

    test('setXYZW', () => {
      const f32a = new Float32Array([1, 2, 3, 4]);
      const a = new Float16BufferAttribute(toHalfFloatArray(f32a), 4, false);
      const expected = new Float32Array([-1, -2, -3, -4]);

      a.setXYZW(0, -1, -2, -3, -4);

      expect(fromHalfFloatArray(a.array)).toEqual(expected);
    });
  });

  describe('Float32BufferAttribute', () => {
    test('constructor', () => {
      const object = new Float32BufferAttribute();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Float32BufferAttribute();
      expect(object).toBeInstanceOf(BufferAttribute);
    });
  });

  describe('Float64BufferAttribute', () => {
    test('constructor', () => {
      const object = new Float64BufferAttribute();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Float64BufferAttribute();
      expect(object).toBeInstanceOf(BufferAttribute);
    });
  });
});
