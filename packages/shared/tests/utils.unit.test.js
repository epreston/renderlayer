import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { arrayMin, arrayMax, getTypedArray } from '../src/utils.js';

describe('Shared', () => {
  describe('utils', () => {
    test('arrayMin', () => {
      expect(arrayMin([])).toBe(Infinity);
      expect(arrayMin([5])).toBe(5);
      expect(arrayMin([1, 5, 10])).toBe(1);
      expect(arrayMin([5, 1, 10])).toBe(1);
      expect(arrayMin([10, 5, 1])).toBe(1);
      expect(arrayMax([-0, 0])).toBe(-0);
      expect(arrayMin([-Infinity, 0, Infinity])).toBe(-Infinity);
    });

    test('arrayMax', () => {
      expect(arrayMax([])).toBe(-Infinity);
      expect(arrayMax([5])).toBe(5);
      expect(arrayMax([10, 5, 1])).toBe(10);
      expect(arrayMax([1, 10, 5])).toBe(10);
      expect(arrayMax([1, 5, 10])).toBe(10);

      // TODO: use toBeCloseTo to avoid Object.is comparison, this may be an issue
      // implementation uses numeric comparison which is not the same as Object.is
      // it can not see the difference between -0 and 0
      expect(arrayMax([-0, 0])).toBeCloseTo(0);

      expect(arrayMax([-Infinity, 0, Infinity])).toBe(Infinity);
    });

    test('getTypedArray', () => {
      expect(getTypedArray('Int8Array', new ArrayBuffer(0))).toBeInstanceOf(Int8Array);
      expect(getTypedArray('Uint8Array', new ArrayBuffer(0))).toBeInstanceOf(Uint8Array);
      expect(getTypedArray('Uint8ClampedArray', new ArrayBuffer(0))).toBeInstanceOf(
        Uint8ClampedArray
      );
      expect(getTypedArray('Int16Array', new ArrayBuffer(0))).toBeInstanceOf(Int16Array);
      expect(getTypedArray('Uint16Array', new ArrayBuffer(0))).toBeInstanceOf(Uint16Array);
      expect(getTypedArray('Int32Array', new ArrayBuffer(0))).toBeInstanceOf(Int32Array);
      expect(getTypedArray('Uint32Array', new ArrayBuffer(0))).toBeInstanceOf(Uint32Array);
      expect(getTypedArray('Float32Array', new ArrayBuffer(0))).toBeInstanceOf(Float32Array);
      expect(getTypedArray('Float64Array', new ArrayBuffer(0))).toBeInstanceOf(Float64Array);
    });
  });
});
