import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Vector4 } from '../src/Vector4.js';
import { Matrix4 } from '../src/Matrix4.js';

// import { BufferAttribute } from '@renderlayer/buffers';

import { x, y, z, w, eps } from './math-constants.js';

describe('Maths', () => {
  describe('Vector4', () => {
    test('Instancing', () => {
      let a = new Vector4();
      expect(a.x == 0).toBeTruthy();
      expect(a.y == 0).toBeTruthy();
      expect(a.z == 0).toBeTruthy();
      expect(a.w == 1).toBeTruthy();

      a = new Vector4(x, y, z, w);
      expect(a.x === x).toBeTruthy();
      expect(a.y === y).toBeTruthy();
      expect(a.z === z).toBeTruthy();
      expect(a.w === w).toBeTruthy();
    });

    test('isVector4', () => {
      const object = new Vector4();

      // @ts-ignore
      expect(object.isVector4).toBeTruthy();
    });

    test('set', () => {
      const a = new Vector4();
      expect(a.x == 0).toBeTruthy();
      expect(a.y == 0).toBeTruthy();
      expect(a.z == 0).toBeTruthy();
      expect(a.w == 1).toBeTruthy();

      a.set(x, y, z, w);
      expect(a.x == x).toBeTruthy();
      expect(a.y == y).toBeTruthy();
      expect(a.z == z).toBeTruthy();
      expect(a.w == w).toBeTruthy();
    });

    test.todo('setScalar', () => {
      // implement
    });

    test('setX', () => {
      const a = new Vector4();
      expect(a.x == 0).toBeTruthy();

      a.setX(x);
      expect(a.x == x).toBeTruthy();
    });

    test('setY', () => {
      const a = new Vector4();
      expect(a.y == 0).toBeTruthy();

      a.setY(y);
      expect(a.y == y).toBeTruthy();
    });

    test('setZ', () => {
      const a = new Vector4();
      expect(a.z == 0).toBeTruthy();

      a.setZ(z);
      expect(a.z == z).toBeTruthy();
    });

    test('setW', () => {
      const a = new Vector4();
      expect(a.w == 1).toBeTruthy();

      a.setW(w);
      expect(a.w == w).toBeTruthy();
    });

    test.todo('setComponent', () => {
      // implement
    });

    test.todo('getComponent', () => {
      // implement
    });

    test('clone', () => {
      const v1 = new Vector4(1, 2, 3, 4);
      const v2 = v1.clone();

      expect(v2).to.be.instanceof(Vector4);
      expect(v2.x).to.equal(1);
      expect(v2.y).to.equal(2);
      expect(v2.z).to.equal(3);
      expect(v2.w).to.equal(4);

      // subclass keeps its class prototype
      class UserVec4 extends Vector4 {}
      const a = new UserVec4();
      const b = a.clone();
      expect(b).to.be.an.instanceof(UserVec4);
    });

    test('copy', () => {
      const a = new Vector4(x, y, z, w);
      const b = new Vector4().copy(a);

      expect(b.x == x).toBeTruthy();
      expect(b.y == y).toBeTruthy();
      expect(b.z == z).toBeTruthy();
      expect(b.w == w).toBeTruthy();

      // ensure that it is a true copy
      a.x = 0;
      a.y = -1;
      a.z = -2;
      a.w = -3;
      expect(b.x == x).toBeTruthy();
      expect(b.y == y).toBeTruthy();
      expect(b.z == z).toBeTruthy();
      expect(b.w == w).toBeTruthy();
    });

    test('add', () => {
      const a = new Vector4(x, y, z, w);
      const b = new Vector4(-x, -y, -z, -w);

      a.add(b);
      expect(a.x == 0).toBeTruthy();
      expect(a.y == 0).toBeTruthy();
      expect(a.z == 0).toBeTruthy();
      expect(a.w == 0).toBeTruthy();
    });

    test('addScalar', () => {
      const v = new Vector4(1, 2, 3, 4);

      v.addScalar(2);
      expect(v.x).to.equal(3);
      expect(v.y).to.equal(4);
      expect(v.z).to.equal(5);
      expect(v.w).to.equal(6);
    });

    test('addVectors', () => {
      const b = new Vector4(-x, -y, -z, -w);
      const c = new Vector4().addVectors(b, b);

      expect(c.x == -2 * x).toBeTruthy();
      expect(c.y == -2 * y).toBeTruthy();
      expect(c.z == -2 * z).toBeTruthy();
      expect(c.w == -2 * w).toBeTruthy();
    });

    test('addScaledVector', () => {
      const a = new Vector4(x, y, z, w);
      const b = new Vector4(6, 7, 8, 9);
      const s = 3;

      a.addScaledVector(b, s);
      expect(a.x).toStrictEqual(x + b.x * s);
      expect(a.y).toStrictEqual(y + b.y * s);
      expect(a.z).toStrictEqual(z + b.z * s);
      expect(a.w).toStrictEqual(w + b.w * s);
    });

    test('sub', () => {
      const a = new Vector4(x, y, z, w);
      const b = new Vector4(-x, -y, -z, -w);

      a.sub(b);
      expect(a.x == 2 * x).toBeTruthy();
      expect(a.y == 2 * y).toBeTruthy();
      expect(a.z == 2 * z).toBeTruthy();
      expect(a.w == 2 * w).toBeTruthy();
    });

    test('subScalar', () => {
      const v = new Vector4(1, 2, 3, 4);

      v.subScalar(2);
      expect(v.x).to.equal(-1);
      expect(v.y).to.equal(0);
      expect(v.z).to.equal(1);
      expect(v.w).to.equal(2);
    });

    test('subVectors', () => {
      const a = new Vector4(x, y, z, w);
      const c = new Vector4().subVectors(a, a);

      expect(c.x == 0).toBeTruthy();
      expect(c.y == 0).toBeTruthy();
      expect(c.z == 0).toBeTruthy();
      expect(c.w == 0).toBeTruthy();
    });

    test.todo('multiply', () => {
      // implement
    });

    test.todo('multiplyScalar', () => {
      // implement
    });

    test('applyMatrix4', () => {
      const a = new Vector4(x, y, z, w);
      const m = new Matrix4().makeRotationX(Math.PI);
      const expected = new Vector4(2, -3, -4, 5);

      a.applyMatrix4(m);
      expect(Math.abs(a.x - expected.x) <= eps).toBeTruthy();
      expect(Math.abs(a.y - expected.y) <= eps).toBeTruthy();
      expect(Math.abs(a.z - expected.z) <= eps).toBeTruthy();
      expect(Math.abs(a.w - expected.w) <= eps).toBeTruthy();

      a.set(x, y, z, w);
      m.makeTranslation(5, 7, 11);
      expected.set(27, 38, 59, 5);

      a.applyMatrix4(m);
      expect(Math.abs(a.x - expected.x) <= eps).toBeTruthy();
      expect(Math.abs(a.y - expected.y) <= eps).toBeTruthy();
      expect(Math.abs(a.z - expected.z) <= eps).toBeTruthy();
      expect(Math.abs(a.w - expected.w) <= eps).toBeTruthy();

      a.set(x, y, z, w);
      m.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0);
      expected.set(2, 3, 4, 4);

      a.applyMatrix4(m);
      expect(Math.abs(a.x - expected.x) <= eps).toBeTruthy();
      expect(Math.abs(a.y - expected.y) <= eps).toBeTruthy();
      expect(Math.abs(a.z - expected.z) <= eps).toBeTruthy();
      expect(Math.abs(a.w - expected.w) <= eps).toBeTruthy();

      a.set(x, y, z, w);
      m.set(2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53);
      expected.set(68, 224, 442, 664);

      a.applyMatrix4(m);
      expect(Math.abs(a.x - expected.x) <= eps).toBeTruthy();
      expect(Math.abs(a.y - expected.y) <= eps).toBeTruthy();
      expect(Math.abs(a.z - expected.z) <= eps).toBeTruthy();
      expect(Math.abs(a.w - expected.w) <= eps).toBeTruthy();
    });

    test.todo('divideScalar', () => {
      // implement
    });

    test.todo('setAxisAngleFromQuaternion', () => {
      // implement
    });

    test.todo('setAxisAngleFromRotationMatrix', () => {
      // implement
    });

    test.todo('min', () => {
      // implement
    });

    test.todo('max', () => {
      // implement
    });

    test.todo('clamp', () => {
      // implement
    });

    test('clampScalar', () => {
      const a = new Vector4(-0.1, 0.01, 0.5, 1.5);
      const clamped = new Vector4(0.1, 0.1, 0.5, 1.0);

      a.clampScalar(0.1, 1.0);
      expect(Math.abs(a.x - clamped.x) <= eps).toBeTruthy();
      expect(Math.abs(a.y - clamped.y) <= eps).toBeTruthy();
      expect(Math.abs(a.z - clamped.z) <= eps).toBeTruthy();
      expect(Math.abs(a.w - clamped.w) <= eps).toBeTruthy();
    });

    test.todo('clampLength', () => {
      // implement
    });

    test.todo('floor', () => {
      // implement
    });

    test.todo('ceil', () => {
      // implement
    });

    test.todo('round', () => {
      // implement
    });

    test.todo('roundToZero', () => {
      // implement
    });

    test('negate', () => {
      const a = new Vector4(x, y, z, w);

      a.negate();
      expect(a.x == -x).toBeTruthy();
      expect(a.y == -y).toBeTruthy();
      expect(a.z == -z).toBeTruthy();
      expect(a.w == -w).toBeTruthy();
    });

    test('dot', () => {
      const a = new Vector4(x, y, z, w);
      const b = new Vector4(-x, -y, -z, -w);
      const c = new Vector4(0, 0, 0, 0);

      let result = a.dot(b);
      expect(result == -x * x - y * y - z * z - w * w).toBeTruthy();

      result = a.dot(c);
      expect(result == 0).toBeTruthy();
    });

    test.todo('lengthSq', () => {
      // implement
    });

    test.todo('length', () => {
      // implement
    });

    test('manhattanLength', () => {
      const a = new Vector4(x, 0, 0, 0);
      const b = new Vector4(0, -y, 0, 0);
      const c = new Vector4(0, 0, z, 0);
      const d = new Vector4(0, 0, 0, w);
      const e = new Vector4(0, 0, 0, 0);

      expect(a.manhattanLength() == x).toBeTruthy();
      expect(b.manhattanLength() == y).toBeTruthy();
      expect(c.manhattanLength() == z).toBeTruthy();
      expect(d.manhattanLength() == w).toBeTruthy();
      expect(e.manhattanLength() == 0).toBeTruthy();

      a.set(x, y, z, w);
      expect(
        a.manhattanLength() == Math.abs(x) + Math.abs(y) + Math.abs(z) + Math.abs(w)
      ).toBeTruthy();
    });

    test('normalize', () => {
      const a = new Vector4(x, 0, 0, 0);
      const b = new Vector4(0, -y, 0, 0);
      const c = new Vector4(0, 0, z, 0);
      const d = new Vector4(0, 0, 0, -w);

      a.normalize();
      expect(a.length() == 1).toBeTruthy();
      expect(a.x == 1).toBeTruthy();

      b.normalize();
      expect(b.length() == 1).toBeTruthy();
      expect(b.y == -1).toBeTruthy();

      c.normalize();
      expect(c.length() == 1).toBeTruthy();
      expect(c.z == 1).toBeTruthy();

      d.normalize();
      expect(d.length() == 1).toBeTruthy();
      expect(d.w == -1).toBeTruthy();
    });

    test('setLength', () => {
      let a = new Vector4(x, 0, 0, 0);
      expect(a.length() == x).toBeTruthy();

      a.setLength(y);
      expect(a.length() == y).toBeTruthy();

      a = new Vector4(0, 0, 0, 0);
      expect(a.length() == 0).toBeTruthy();

      a.setLength(y);
      expect(a.length() == 0).toBeTruthy();

      a.setLength();
      expect(isNaN(a.length())).toBeTruthy();
    });

    test.todo('lerp', () => {
      // implement
    });

    test.todo('lerpVectors', () => {
      // implement
    });

    test('equals', () => {
      const a = new Vector4(x, 0, z, 0);
      const b = new Vector4(0, -y, 0, -w);

      expect(a.x != b.x).toBeTruthy();
      expect(a.y != b.y).toBeTruthy();
      expect(a.z != b.z).toBeTruthy();
      expect(a.w != b.w).toBeTruthy();

      expect(!a.equals(b)).toBeTruthy();
      expect(!b.equals(a)).toBeTruthy();

      a.copy(b);
      expect(a.x == b.x).toBeTruthy();
      expect(a.y == b.y).toBeTruthy();
      expect(a.z == b.z).toBeTruthy();
      expect(a.w == b.w).toBeTruthy();

      expect(a.equals(b)).toBeTruthy();
      expect(b.equals(a)).toBeTruthy();
    });

    test('fromArray', () => {
      const a = new Vector4();
      const array = [1, 2, 3, 4, 5, 6, 7, 8];

      a.fromArray(array);
      expect(a.x).toStrictEqual(1);
      expect(a.y).toStrictEqual(2);
      expect(a.z).toStrictEqual(3);
      expect(a.w).toStrictEqual(4);

      a.fromArray(array, 4);
      expect(a.x).toStrictEqual(5);
      expect(a.y).toStrictEqual(6);
      expect(a.z).toStrictEqual(7);
      expect(a.w).toStrictEqual(8);
    });

    test('toArray', () => {
      const a = new Vector4(x, y, z, w);

      let array = a.toArray();
      expect(array[0]).toStrictEqual(x);
      expect(array[1]).toStrictEqual(y);
      expect(array[2]).toStrictEqual(z);
      expect(array[3]).toStrictEqual(w);

      array = [];
      a.toArray(array);
      expect(array[0]).toStrictEqual(x);
      expect(array[1]).toStrictEqual(y);
      expect(array[2]).toStrictEqual(z);
      expect(array[3]).toStrictEqual(w);

      array = [];
      a.toArray(array, 1);
      expect(array[0]).toBeUndefined();
      expect(array[1]).toStrictEqual(x);
      expect(array[2]).toStrictEqual(y);
      expect(array[3]).toStrictEqual(z);
      expect(array[4]).toStrictEqual(w);
    });

    test.todo('fromBufferAttribute', () => {
      // const a = new Vector4();
      // const attr = new BufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]), 4);
      //
      // a.fromBufferAttribute(attr, 0);
      // expect(a.x).toStrictEqual(1);
      // expect(a.y).toStrictEqual(2);
      // expect(a.z).toStrictEqual(3);
      // expect(a.w).toStrictEqual(4);
      //
      // a.fromBufferAttribute(attr, 1);
      // expect(a.x).toStrictEqual(5);
      // expect(a.y).toStrictEqual(6);
      // expect(a.z).toStrictEqual(7);
      // expect(a.w).toStrictEqual(8);
    });

    test('setX,setY,setZ,setW', () => {
      const a = new Vector4();
      expect(a.x == 0).toBeTruthy();
      expect(a.y == 0).toBeTruthy();
      expect(a.z == 0).toBeTruthy();
      expect(a.w == 1).toBeTruthy();

      a.setX(x);
      a.setY(y);
      a.setZ(z);
      a.setW(w);

      expect(a.x == x).toBeTruthy();
      expect(a.y == y).toBeTruthy();
      expect(a.z == z).toBeTruthy();
      expect(a.w == w).toBeTruthy();
    });

    test('setComponent,getComponent', () => {
      const a = new Vector4();

      expect(a.x == 0).toBeTruthy();
      expect(a.y == 0).toBeTruthy();
      expect(a.z == 0).toBeTruthy();
      expect(a.w == 1).toBeTruthy();

      a.setComponent(0, 1);
      a.setComponent(1, 2);
      a.setComponent(2, 3);
      a.setComponent(3, 4);

      expect(a.getComponent(0) == 1).toBeTruthy();
      expect(a.getComponent(1) == 2).toBeTruthy();
      expect(a.getComponent(2) == 3).toBeTruthy();
      expect(a.getComponent(3) == 4).toBeTruthy();
    });

    test('setComponent/getComponent exceptions', () => {
      const a = new Vector4();

      expect(() => a.setComponent(4, 0)).toThrowError('index is out of range');
      expect(() => a.getComponent(4)).toThrowError('index is out of range');
    });

    test('setScalar/addScalar/subScalar', () => {
      const a = new Vector4();
      const s = 3;

      a.setScalar(s);
      expect(a.x).toStrictEqual(s);
      expect(a.y).toStrictEqual(s);
      expect(a.z).toStrictEqual(s);
      expect(a.w).toStrictEqual(s);

      a.addScalar(s);
      expect(a.x).toStrictEqual(2 * s);
      expect(a.y).toStrictEqual(2 * s);
      expect(a.z).toStrictEqual(2 * s);
      expect(a.w).toStrictEqual(2 * s);

      a.subScalar(2 * s);
      expect(a.x).toStrictEqual(0);
      expect(a.y).toStrictEqual(0);
      expect(a.z).toStrictEqual(0);
      expect(a.w).toStrictEqual(0);
    });

    test('multiplyScalar/divideScalar', () => {
      const a = new Vector4(x, y, z, w);
      const b = new Vector4(-x, -y, -z, -w);

      a.multiplyScalar(-2);
      expect(a.x == x * -2).toBeTruthy();
      expect(a.y == y * -2).toBeTruthy();
      expect(a.z == z * -2).toBeTruthy();
      expect(a.w == w * -2).toBeTruthy();

      b.multiplyScalar(-2);
      expect(b.x == 2 * x).toBeTruthy();
      expect(b.y == 2 * y).toBeTruthy();
      expect(b.z == 2 * z).toBeTruthy();
      expect(b.w == 2 * w).toBeTruthy();

      a.divideScalar(-2);
      expect(a.x == x).toBeTruthy();
      expect(a.y == y).toBeTruthy();
      expect(a.z == z).toBeTruthy();
      expect(a.w == w).toBeTruthy();

      b.divideScalar(-2);
      expect(b.x == -x).toBeTruthy();
      expect(b.y == -y).toBeTruthy();
      expect(b.z == -z).toBeTruthy();
      expect(b.w == -w).toBeTruthy();
    });

    test('min/max/clamp', () => {
      const a = new Vector4(x, y, z, w);
      const b = new Vector4(-x, -y, -z, -w);
      const c = new Vector4();

      c.copy(a).min(b);
      expect(c.x == -x).toBeTruthy();
      expect(c.y == -y).toBeTruthy();
      expect(c.z == -z).toBeTruthy();
      expect(c.w == -w).toBeTruthy();

      c.copy(a).max(b);
      expect(c.x == x).toBeTruthy();
      expect(c.y == y).toBeTruthy();
      expect(c.z == z).toBeTruthy();
      expect(c.w == w).toBeTruthy();

      c.set(-2 * x, 2 * y, -2 * z, 2 * w);
      c.clamp(b, a);
      expect(c.x == -x).toBeTruthy();
      expect(c.y == y).toBeTruthy();
      expect(c.z == -z).toBeTruthy();
      expect(c.w == w).toBeTruthy();
    });

    test('length/lengthSq', () => {
      const a = new Vector4(x, 0, 0, 0);
      const b = new Vector4(0, -y, 0, 0);
      const c = new Vector4(0, 0, z, 0);
      const d = new Vector4(0, 0, 0, w);
      const e = new Vector4(0, 0, 0, 0);

      expect(a.length() == x).toBeTruthy();
      expect(a.lengthSq() == x * x).toBeTruthy();

      expect(b.length() == y).toBeTruthy();
      expect(b.lengthSq() == y * y).toBeTruthy();

      expect(c.length() == z).toBeTruthy();
      expect(c.lengthSq() == z * z).toBeTruthy();

      expect(d.length() == w).toBeTruthy();
      expect(d.lengthSq() == w * w).toBeTruthy();

      expect(e.length() == 0).toBeTruthy();
      expect(e.lengthSq() == 0).toBeTruthy();

      a.set(x, y, z, w);
      expect(a.length() == Math.sqrt(x * x + y * y + z * z + w * w)).toBeTruthy();
      expect(a.lengthSq() == x * x + y * y + z * z + w * w).toBeTruthy();
    });

    test('lerp/clone', () => {
      const a = new Vector4(x, 0, z, 0);
      const b = new Vector4(0, -y, 0, -w);

      expect(a.lerp(a, 0).equals(a.lerp(a, 0.5))).toBeTruthy();
      expect(a.lerp(a, 0).equals(a.lerp(a, 1))).toBeTruthy();

      expect(a.clone().lerp(b, 0).equals(a)).toBeTruthy();

      expect(a.clone().lerp(b, 0.5).x == x * 0.5).toBeTruthy();
      expect(a.clone().lerp(b, 0.5).y == -y * 0.5).toBeTruthy();
      expect(a.clone().lerp(b, 0.5).z == z * 0.5).toBeTruthy();
      expect(a.clone().lerp(b, 0.5).w == -w * 0.5).toBeTruthy();

      expect(a.clone().lerp(b, 1).equals(b)).toBeTruthy();
    });

    test('iterable', () => {
      const v = new Vector4(0, 0.3, 0.7, 1);
      const array = [...v];

      expect(array[0]).toStrictEqual(0);
      expect(array[1]).toStrictEqual(0.3);
      expect(array[2]).toStrictEqual(0.7);
      expect(array[3]).toStrictEqual(1);
    });
  });
});
