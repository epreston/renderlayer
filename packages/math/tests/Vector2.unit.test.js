import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Vector2 } from '../src/Vector2.js';
import { Matrix3 } from '../src/Matrix3.js';

// import { BufferAttribute } from '@renderlayer/buffers';

import { x, y, eps } from './math-constants.js';

describe('Maths', () => {
  describe('Vector2', () => {
    test('Instancing', () => {
      const a = new Vector2();
      expect(a.x == 0).toBeTruthy();
      expect(a.y == 0).toBeTruthy();

      const b = new Vector2(x, y);
      expect(b.x === x).toBeTruthy();
      expect(b.y === y).toBeTruthy();
    });

    test('properties', () => {
      const a = new Vector2(0, 0);
      const width = 100;
      const height = 200;

      expect((a.width = width)).toBeTruthy();
      expect((a.height = height)).toBeTruthy();

      a.set(width, height);
      expect(a.width).toStrictEqual(width);
      expect(a.height).toStrictEqual(height);
    });

    test.todo('width', () => {
      // implement
    });

    test.todo('height', () => {
      // implement
    });

    test('isVector2', () => {
      const object = new Vector2();

      // @ts-ignore
      expect(object.isVector2).toBeTruthy();
    });

    test('set', () => {
      const a = new Vector2();
      expect(a.x == 0).toBeTruthy();
      expect(a.y == 0).toBeTruthy();

      a.set(x, y);
      expect(a.x == x).toBeTruthy();
      expect(a.y == y).toBeTruthy();
    });

    test.todo('setScalar', () => {
      // implement
    });

    test.todo('setX', () => {
      // implement
    });

    test.todo('setY', () => {
      // implement
    });

    test.todo('setComponent', () => {
      // implement
    });

    test.todo('getComponent', () => {
      // implement
    });

    test.todo('clone', () => {
      // implement
    });

    test('copy', () => {
      const a = new Vector2(x, y);
      const b = new Vector2().copy(a);
      expect(b.x == x).toBeTruthy();
      expect(b.y == y).toBeTruthy();

      // ensure that it is a true copy
      a.x = 0;
      a.y = -1;
      expect(b.x == x).toBeTruthy();
      expect(b.y == y).toBeTruthy();
    });

    test('add', () => {
      const a = new Vector2(x, y);
      const b = new Vector2(-x, -y);

      a.add(b);
      expect(a.x == 0).toBeTruthy();
      expect(a.y == 0).toBeTruthy();

      const c = new Vector2().addVectors(b, b);
      expect(c.x == -2 * x).toBeTruthy();
      expect(c.y == -2 * y).toBeTruthy();
    });

    test.todo('addScalar', () => {
      // implement
    });

    test.todo('addVectors', () => {
      // implement
    });

    test('addScaledVector', () => {
      const a = new Vector2(x, y);
      const b = new Vector2(2, 3);
      const s = 3;

      a.addScaledVector(b, s);
      expect(a.x).toStrictEqual(x + b.x * s);
      expect(a.y).toStrictEqual(y + b.y * s);
    });

    test('sub', () => {
      const a = new Vector2(x, y);
      const b = new Vector2(-x, -y);

      a.sub(b);
      expect(a.x == 2 * x).toBeTruthy();
      expect(a.y == 2 * y).toBeTruthy();

      const c = new Vector2().subVectors(a, a);
      expect(c.x == 0).toBeTruthy();
      expect(c.y == 0).toBeTruthy();
    });

    test.todo('subScalar', () => {
      // implement
    });

    test.todo('subVectors', () => {
      // implement
    });

    test.todo('multiply', () => {
      // implement
    });

    test.todo('multiplyScalar', () => {
      // implement
    });

    test.todo('divide', () => {
      // implement
    });

    test.todo('divideScalar', () => {
      // implement
    });

    test('applyMatrix3', () => {
      const a = new Vector2(x, y);
      const m = new Matrix3().set(2, 3, 5, 7, 11, 13, 17, 19, 23);

      a.applyMatrix3(m);
      expect(a.x).toStrictEqual(18);
      expect(a.y).toStrictEqual(60);
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

    test.todo('clampScalar', () => {
      // implement
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
      const a = new Vector2(x, y);

      a.negate();
      expect(a.x == -x).toBeTruthy();
      expect(a.y == -y).toBeTruthy();
    });

    test('dot', () => {
      const a = new Vector2(x, y);
      const b = new Vector2(-x, -y);
      const c = new Vector2();

      let result = a.dot(b);
      expect(result == -x * x - y * y).toBeTruthy();

      result = a.dot(c);
      expect(result == 0).toBeTruthy();
    });

    test('cross', () => {
      const a = new Vector2(x, y);
      const b = new Vector2(2 * x, -y);
      const answer = -18;
      const crossed = a.cross(b);

      expect(Math.abs(answer - crossed) <= eps).toBeTruthy();
    });

    test.todo('lengthSq', () => {
      // implement
    });

    test.todo('length', () => {
      // implement
    });

    test('manhattanLength', () => {
      const a = new Vector2(x, 0);
      const b = new Vector2(0, -y);
      const c = new Vector2();

      expect(a.manhattanLength()).toStrictEqual(x);
      expect(b.manhattanLength()).toStrictEqual(y);
      expect(c.manhattanLength()).toStrictEqual(0);

      a.set(x, y);
      expect(a.manhattanLength()).toStrictEqual(Math.abs(x) + Math.abs(y));
    });

    test('normalize', () => {
      const a = new Vector2(x, 0);
      const b = new Vector2(0, -y);

      a.normalize();
      expect(a.length() == 1).toBeTruthy();
      expect(a.x == 1).toBeTruthy();

      b.normalize();
      expect(b.length() == 1).toBeTruthy();
      expect(b.y == -1).toBeTruthy();
    });

    test.todo('angle', () => {
      // implement
    });

    test('angleTo', () => {
      const a = new Vector2(-0.18851655680720186, 0.9820700116639124);
      const b = new Vector2(0.18851655680720186, -0.9820700116639124);

      expect(a.angleTo(a)).toBe(0);
      expect(a.angleTo(b)).toBe(Math.PI);

      const x = new Vector2(1, 0);
      const y = new Vector2(0, 1);

      expect(x.angleTo(y)).toBe(Math.PI / 2);
      expect(y.angleTo(x)).toBe(Math.PI / 2);

      expect(Math.abs(x.angleTo(new Vector2(1, 1)) - Math.PI / 4) < 0.0000001).toBeTruthy();
    });

    test.todo('distanceTo', () => {
      // implement
    });

    test.todo('distanceToSquared', () => {
      // implement
    });

    test.todo('manhattanDistanceTo', () => {
      // implement
    });

    test('setLength', () => {
      let a = new Vector2(x, 0);
      expect(a.length() == x).toBeTruthy();

      a.setLength(y);
      expect(a.length() == y).toBeTruthy();

      a = new Vector2(0, 0);
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
      const a = new Vector2(x, 0);
      const b = new Vector2(0, -y);

      expect(a.x != b.x).toBeTruthy();
      expect(a.y != b.y).toBeTruthy();

      expect(!a.equals(b)).toBeTruthy();
      expect(!b.equals(a)).toBeTruthy();

      a.copy(b);
      expect(a.x == b.x).toBeTruthy();
      expect(a.y == b.y).toBeTruthy();

      expect(a.equals(b)).toBeTruthy();
      expect(b.equals(a)).toBeTruthy();
    });

    test('fromArray', () => {
      const a = new Vector2();
      const array = [1, 2, 3, 4];

      a.fromArray(array);
      expect(a.x).toStrictEqual(1);
      expect(a.y).toStrictEqual(2);

      a.fromArray(array, 2);
      expect(a.x).toStrictEqual(3);
      expect(a.y).toStrictEqual(4);
    });

    test('toArray', () => {
      const a = new Vector2(x, y);

      let array = a.toArray();
      expect(array[0]).toStrictEqual(x);
      expect(array[1]).toStrictEqual(y);

      array = [];
      a.toArray(array);
      expect(array[0]).toStrictEqual(x);
      expect(array[1]).toStrictEqual(y);

      array = [];
      a.toArray(array, 1);
      expect(array[0]).toBeUndefined();
      expect(array[1]).toStrictEqual(x);
      expect(array[2]).toStrictEqual(y);
    });

    test.todo('fromBufferAttribute', () => {
      // const a = new Vector2();
      // const attr = new BufferAttribute(new Float32Array([1, 2, 3, 4]), 2);
      //
      // a.fromBufferAttribute(attr, 0);
      // expect(a.x).toStrictEqual(1);
      // expect(a.y).toStrictEqual(2);
      //
      // a.fromBufferAttribute(attr, 1);
      // expect(a.x).toStrictEqual(3);
      // expect(a.y).toStrictEqual(4);
    });

    test.todo('rotateAround', () => {
      // implement
    });

    test('setX,setY', () => {
      const a = new Vector2();

      expect(a.x == 0).toBeTruthy();
      expect(a.y == 0).toBeTruthy();

      a.setX(x);
      a.setY(y);
      expect(a.x == x).toBeTruthy();
      expect(a.y == y).toBeTruthy();
    });

    test('setComponent,getComponent', () => {
      const a = new Vector2();

      expect(a.x == 0).toBeTruthy();
      expect(a.y == 0).toBeTruthy();

      a.setComponent(0, 1);
      a.setComponent(1, 2);
      expect(a.getComponent(0) == 1).toBeTruthy();
      expect(a.getComponent(1) == 2).toBeTruthy();
    });

    test('multiply/divide', () => {
      const a = new Vector2(x, y);
      const b = new Vector2(-x, -y);

      a.multiplyScalar(-2);
      expect(a.x == x * -2).toBeTruthy();
      expect(a.y == y * -2).toBeTruthy();

      b.multiplyScalar(-2);
      expect(b.x == 2 * x).toBeTruthy();
      expect(b.y == 2 * y).toBeTruthy();

      a.divideScalar(-2);
      expect(a.x == x).toBeTruthy();
      expect(a.y == y).toBeTruthy();

      b.divideScalar(-2);
      expect(b.x == -x).toBeTruthy();
      expect(b.y == -y).toBeTruthy();
    });

    test('min/max/clamp', () => {
      const a = new Vector2(x, y);
      const b = new Vector2(-x, -y);
      const c = new Vector2();

      c.copy(a).min(b);
      expect(c.x == -x).toBeTruthy();
      expect(c.y == -y).toBeTruthy();

      c.copy(a).max(b);
      expect(c.x == x).toBeTruthy();
      expect(c.y == y).toBeTruthy();

      c.set(-2 * x, 2 * y);
      c.clamp(b, a);
      expect(c.x == -x).toBeTruthy();
      expect(c.y == y).toBeTruthy();

      c.set(-2 * x, 2 * x);
      c.clampScalar(-x, x);
      expect(c.x).toBe(-x);
      expect(c.y).toBe(x);
    });

    test('rounding', () => {
      const floor1 = new Vector2(-0.1, 0.1).floor();
      expect(floor1.x).toBeCloseTo(-1);
      expect(floor1.y).toBeCloseTo(0);

      const floor2 = new Vector2(-0.5, 0.5).floor();
      expect(floor2.x).toBeCloseTo(-1);
      expect(floor2.y).toBeCloseTo(0);

      const floor3 = new Vector2(-0.9, 0.9).floor();
      expect(floor3.x).toBeCloseTo(-1);
      expect(floor3.y).toBeCloseTo(0);

      const ceil1 = new Vector2(-0.1, 0.1).ceil();
      expect(ceil1.x).toBeCloseTo(0);
      expect(ceil1.y).toBeCloseTo(1);

      const ceil2 = new Vector2(-0.5, 0.5).ceil();
      expect(ceil2.x).toBeCloseTo(0);
      expect(ceil2.y).toBeCloseTo(1);

      const ceil3 = new Vector2(-0.9, 0.9).ceil();
      expect(ceil3.x).toBeCloseTo(0);
      expect(ceil3.y).toBeCloseTo(1);

      const round1 = new Vector2(-0.1, 0.1).round();
      expect(round1.x).toBeCloseTo(0);
      expect(round1.y).toBeCloseTo(0);

      const round2 = new Vector2(-0.5, 0.5).round();
      expect(round2.x).toBeCloseTo(0);
      expect(round2.y).toBeCloseTo(1);

      const round3 = new Vector2(-0.9, 0.9).round();
      expect(round3.x).toBeCloseTo(-1);
      expect(round3.y).toBeCloseTo(1);

      const roundToZero1 = new Vector2(-0.1, 0.1).roundToZero();
      expect(roundToZero1.x).toBeCloseTo(0);
      expect(roundToZero1.y).toBeCloseTo(0);

      const roundToZero2 = new Vector2(-0.5, 0.5).roundToZero();
      expect(roundToZero2.x).toBeCloseTo(0);
      expect(roundToZero2.y).toBeCloseTo(0);

      const roundToZero3 = new Vector2(-0.9, 0.9).roundToZero();
      expect(roundToZero3.x).toBeCloseTo(0);
      expect(roundToZero3.y).toBeCloseTo(0);

      const roundToZero4 = new Vector2(-1.1, 1.1).roundToZero();
      expect(roundToZero4.x).toBeCloseTo(-1);
      expect(roundToZero4.y).toBeCloseTo(1);

      const roundToZero5 = new Vector2(-1.5, 1.5).roundToZero();
      expect(roundToZero5.x).toBeCloseTo(-1);
      expect(roundToZero5.y).toBeCloseTo(1);

      const roundToZero6 = new Vector2(-1.9, 1.9).roundToZero();
      expect(roundToZero6.x).toBeCloseTo(-1);
      expect(roundToZero6.y).toBeCloseTo(1);
    });

    test('length/lengthSq', () => {
      const a = new Vector2(x, 0);
      const b = new Vector2(0, -y);
      const c = new Vector2();

      expect(a.length() == x).toBeTruthy();
      expect(a.lengthSq() == x * x).toBeTruthy();

      expect(b.length() == y).toBeTruthy();
      expect(b.lengthSq() == y * y).toBeTruthy();

      expect(c.length() == 0).toBeTruthy();
      expect(c.lengthSq() == 0).toBeTruthy();

      a.set(x, y);
      expect(a.length() == Math.sqrt(x * x + y * y)).toBeTruthy();
      expect(a.lengthSq() == x * x + y * y).toBeTruthy();
    });

    test('distanceTo/distanceToSquared', () => {
      const a = new Vector2(x, 0);
      const b = new Vector2(0, -y);
      const c = new Vector2();

      expect(a.distanceTo(c) == x).toBeTruthy();
      expect(a.distanceToSquared(c) == x * x).toBeTruthy();

      expect(b.distanceTo(c) == y).toBeTruthy();
      expect(b.distanceToSquared(c) == y * y).toBeTruthy();
    });

    test('lerp/clone', () => {
      const a = new Vector2(x, 0);
      const b = new Vector2(0, -y);

      expect(a.lerp(a, 0).equals(a.lerp(a, 0.5))).toBeTruthy();
      expect(a.lerp(a, 0).equals(a.lerp(a, 1))).toBeTruthy();

      expect(a.clone().lerp(b, 0).equals(a)).toBeTruthy();

      expect(a.clone().lerp(b, 0.5).x == x * 0.5).toBeTruthy();
      expect(a.clone().lerp(b, 0.5).y == -y * 0.5).toBeTruthy();

      expect(a.clone().lerp(b, 1).equals(b)).toBeTruthy();
    });

    test('setComponent/getComponent exceptions', () => {
      const a = new Vector2(0, 0);

      expect(() => a.setComponent(2, 0)).toThrowError('index is out of range');
      expect(() => a.getComponent(2)).toThrowError('index is out of range');
    });

    test('setScalar/addScalar/subScalar', () => {
      const a = new Vector2(1, 1);
      const s = 3;

      a.setScalar(s);
      expect(a.x).toStrictEqual(s);
      expect(a.y).toStrictEqual(s);

      a.addScalar(s);
      expect(a.x).toStrictEqual(2 * s);
      expect(a.y).toStrictEqual(2 * s);

      a.subScalar(2 * s);
      expect(a.x).toStrictEqual(0);
      expect(a.y).toStrictEqual(0);
    });

    test('multiply/divide', () => {
      const a = new Vector2(x, y);
      const b = new Vector2(2 * x, 2 * y);
      const c = new Vector2(4 * x, 4 * y);

      a.multiply(b);
      expect(a.x).toStrictEqual(x * b.x);
      expect(a.y).toStrictEqual(y * b.y);

      b.divide(c);
      expect(b.x).toStrictEqual(0.5);
      expect(b.y).toStrictEqual(0.5);
    });

    test('iterable', () => {
      const v = new Vector2(0, 1);
      const array = [...v];

      expect(array[0]).toStrictEqual(0);
      expect(array[1]).toStrictEqual(1);
    });
  });
});
