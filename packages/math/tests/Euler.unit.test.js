import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Matrix4 } from '../src/Matrix4.js';
import { Quaternion } from '../src/Quaternion.js';
import { Vector3 } from '../src/Vector3.js';
import { x, y, z } from './math-constants.js';

import { Euler } from '../src/Euler.js';

const eulerZero = new Euler(0, 0, 0, 'XYZ');
const eulerAxyz = new Euler(1, 0, 0, 'XYZ');
const eulerAzyx = new Euler(0, 1, 0, 'ZYX');

function matrixEquals4(a, b, tolerance) {
  tolerance = tolerance || 0.0001;
  if (a.elements.length != b.elements.length) {
    return false;
  }

  for (let i = 0, il = a.elements.length; i < il; i++) {
    const delta = a.elements[i] - b.elements[i];
    if (delta > tolerance) {
      return false;
    }
  }

  return true;
}

function quatEquals(a, b, tolerance) {
  tolerance = tolerance || 0.0001;
  const diff =
    Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z) + Math.abs(a.w - b.w);

  return diff < tolerance;
}

describe('Maths', () => {
  describe('Euler', () => {
    test('Instancing', () => {
      const a = new Euler();

      expect(a.equals(eulerZero)).toBeTruthy();
      expect(!a.equals(eulerAxyz)).toBeTruthy();
      expect(!a.equals(eulerAzyx)).toBeTruthy();
    });

    test('DEFAULT_ORDER', () => {
      expect(Euler.DEFAULT_ORDER).toBe('XYZ');
    });

    test('x', () => {
      let a = new Euler();
      expect(a.x === 0).toBeTruthy();

      a = new Euler(1, 2, 3);
      expect(a.x === 1).toBeTruthy();

      a = new Euler(4, 5, 6, 'XYZ');
      expect(a.x === 4).toBeTruthy();

      a = new Euler(7, 8, 9, 'XYZ');
      a.x = 10;
      expect(a.x === 10).toBeTruthy();

      a = new Euler(11, 12, 13, 'XYZ');
      let b = false;
      a._onChange(() => (b = true));
      a.x = 14;

      expect(b).toBeTruthy();
      expect(a.x === 14).toBeTruthy();
    });

    test('y', () => {
      let a = new Euler();
      expect(a.y === 0).toBeTruthy();

      a = new Euler(1, 2, 3);
      expect(a.y === 2).toBeTruthy();

      a = new Euler(4, 5, 6, 'XYZ');
      expect(a.y === 5).toBeTruthy();

      a = new Euler(7, 8, 9, 'XYZ');
      a.y = 10;
      expect(a.y === 10).toBeTruthy();

      a = new Euler(11, 12, 13, 'XYZ');
      let b = false;
      a._onChange(() => (b = true));
      a.y = 14;

      expect(b).toBeTruthy();
      expect(a.y === 14).toBeTruthy();
    });

    test('z', () => {
      let a = new Euler();
      expect(a.z === 0).toBeTruthy();

      a = new Euler(1, 2, 3);
      expect(a.z === 3).toBeTruthy();

      a = new Euler(4, 5, 6, 'XYZ');
      expect(a.z === 6).toBeTruthy();

      a = new Euler(7, 8, 9, 'XYZ');
      a.z = 10;
      expect(a.z === 10).toBeTruthy();

      a = new Euler(11, 12, 13, 'XYZ');
      let b = false;
      a._onChange(() => (b = true));
      a.z = 14;

      expect(b).toBeTruthy();
      expect(a.z === 14).toBeTruthy();
    });

    test('order', () => {
      let a = new Euler();
      expect(a.order === Euler.DEFAULT_ORDER).toBeTruthy();

      a = new Euler(1, 2, 3);
      expect(a.order === Euler.DEFAULT_ORDER).toBeTruthy();

      a = new Euler(4, 5, 6, 'YZX');
      expect(a.order === 'YZX').toBeTruthy();

      a = new Euler(7, 8, 9, 'YZX');
      a.order = 'ZXY';
      expect(a.order === 'ZXY').toBeTruthy();

      a = new Euler(11, 12, 13, 'YZX');
      let b = false;
      a._onChange(() => (b = true));
      a.order = 'ZXY';

      expect(b).toBeTruthy();
      expect(a.order === 'ZXY').toBeTruthy();
    });

    test('isEuler', () => {
      const a = new Euler();
      expect(a.isEuler).toBeTruthy();

      const b = new Vector3();

      // @ts-ignore
      expect(!b.isEuler).toBeTruthy();
    });

    test('clone/copy/equals', () => {
      const a = eulerAxyz.clone();
      expect(a.equals(eulerAxyz)).toBeTruthy();
      expect(!a.equals(eulerZero)).toBeTruthy();
      expect(!a.equals(eulerAzyx)).toBeTruthy();

      a.copy(eulerAzyx);
      expect(a.equals(eulerAzyx)).toBeTruthy();
      expect(!a.equals(eulerAxyz)).toBeTruthy();
      expect(!a.equals(eulerZero)).toBeTruthy();
    });

    test('Quaternion.setFromEuler/Euler.setFromQuaternion', () => {
      const testValues = [eulerZero, eulerAxyz, eulerAzyx];

      for (let i = 0; i < testValues.length; i++) {
        const v = testValues[i];
        const q = new Quaternion().setFromEuler(v);

        const v2 = new Euler().setFromQuaternion(q, v.order);
        const q2 = new Quaternion().setFromEuler(v2);

        expect(quatEquals(q, q2)).toBeTruthy();
      }
    });

    test('Matrix4.makeRotationFromEuler/Euler.setFromRotationMatrix', () => {
      const testValues = [eulerZero, eulerAxyz, eulerAzyx];

      for (let i = 0; i < testValues.length; i++) {
        const v = testValues[i];
        const m = new Matrix4().makeRotationFromEuler(v);

        const v2 = new Euler().setFromRotationMatrix(m, v.order);
        const m2 = new Matrix4().makeRotationFromEuler(v2);

        expect(matrixEquals4(m, m2, 0.0001)).toBeTruthy();
      }
    });

    test.todo('Euler.setFromVector3', () => {
      // setFromVector3( v, order = this._order )
      // implement
    });

    test('reorder', () => {
      const testValues = [eulerZero, eulerAxyz, eulerAzyx];

      for (let i = 0; i < testValues.length; i++) {
        const v = testValues[i];
        const q = new Quaternion().setFromEuler(v);

        v.reorder('YZX');
        const q2 = new Quaternion().setFromEuler(v);
        expect(quatEquals(q, q2)).toBeTruthy();

        v.reorder('ZXY');
        const q3 = new Quaternion().setFromEuler(v);
        expect(quatEquals(q, q3)).toBeTruthy();
      }
    });

    test('set/get properties, check callbacks', () => {
      const a = new Euler();
      const mockFn = vi.fn();

      a._onChange(mockFn);

      a.x = 1;
      a.y = 2;
      a.z = 3;
      a.order = 'ZYX';

      expect(a.x).toStrictEqual(1);
      expect(a.y).toStrictEqual(2);
      expect(a.z).toStrictEqual(3);
      expect(a.order).toStrictEqual('ZYX');

      expect(mockFn).toBeCalledTimes(4);
    });

    test('clone/copy, check callbacks', () => {
      let a = new Euler(1, 2, 3, 'ZXY');
      const b = new Euler(4, 5, 6, 'XZY');
      const cbSucceed = vi.fn();
      const cbFail = vi.fn();

      a._onChange(cbFail);
      b._onChange(cbFail);

      // clone doesn't trigger onChange
      a = b.clone();

      expect(a.equals(b)).toBeTruthy();
      expect(cbFail).toBeCalledTimes(0);

      // copy triggers onChange once
      a = new Euler(1, 2, 3, 'ZXY');
      a._onChange(cbSucceed);
      a.copy(b);

      expect(a.equals(b)).toBeTruthy();
      expect(cbSucceed).toBeCalledTimes(1);
    });

    test('toArray', () => {
      const order = 'YXZ';
      const a = new Euler(x, y, z, order);

      let array = a.toArray();
      expect(array[0]).toStrictEqual(x);
      expect(array[1]).toStrictEqual(y);
      expect(array[2]).toStrictEqual(z);
      expect(array[3]).toStrictEqual(order);

      array = [];
      a.toArray(array);
      expect(array[0]).toStrictEqual(x);
      expect(array[1]).toStrictEqual(y);
      expect(array[2]).toStrictEqual(z);
      expect(array[3]).toStrictEqual(order);

      array = [];
      a.toArray(array, 1);
      expect(array[0]).toBeUndefined();
      expect(array[1]).toStrictEqual(x);
      expect(array[2]).toStrictEqual(y);
      expect(array[3]).toStrictEqual(z);
      expect(array[4]).toStrictEqual(order);
    });

    test('fromArray', () => {
      let a = new Euler();
      let array = [x, y, z];
      const cb = vi.fn();

      a._onChange(cb);
      a.fromArray(array);

      expect(a.x).toStrictEqual(x);
      expect(a.y).toStrictEqual(y);
      expect(a.z).toStrictEqual(z);
      expect(a.order).toStrictEqual('XYZ');

      expect(cb).toBeCalledTimes(1);

      a = new Euler();
      // @ts-ignore
      array = [x, y, z, 'ZXY'];
      a._onChange(cb);
      a.fromArray(array);

      expect(a.x).toStrictEqual(x);
      expect(a.y).toStrictEqual(y);
      expect(a.z).toStrictEqual(z);
      expect(a.order).toStrictEqual('ZXY');

      expect(cb).toBeCalledTimes(2);
    });

    test('_onChange', () => {
      const f = function () {};
      const a = new Euler(11, 12, 13, 'XYZ');

      a._onChange(f);

      expect(a._onChangeCallback === f).toBeTruthy();
    });

    test('_onChangeCallback', () => {
      let b = false;
      const a = new Euler(11, 12, 13, 'XYZ');
      const f = function () {
        b = true;
        expect(a === this).toBeTruthy();
      };

      a._onChangeCallback = f;
      expect(a._onChangeCallback === f).toBeTruthy();

      a._onChangeCallback();
      expect(b).toBeTruthy();
    });

    test('iterable', () => {
      const e = new Euler(0.5, 0.75, 1, 'YZX');
      const array = [...e];

      expect(array[0]).toStrictEqual(0.5);
      expect(array[1]).toStrictEqual(0.75);
      expect(array[2]).toStrictEqual(1);
      expect(array[3]).toStrictEqual('YZX');
    });
  });
});
