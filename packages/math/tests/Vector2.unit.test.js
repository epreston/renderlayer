import { describe, expect, it, test, vi } from 'vitest';

import { Vector2 } from '../src/Vector2.js';
import { Matrix3 } from '../src/Matrix3.js';

import { BufferAttribute } from '@renderlayer/buffers';

import { x, y, eps } from './math-constants.js';

describe('Maths', () => {
  describe('Vector2', () => {
    test('constructor', () => {
      const a = new Vector2();
      expect(a.x).toBe(0);
      expect(a.y).toBe(0);

      const b = new Vector2(x, y);
      expect(b.x).toBe(x);
      expect(b.y).toBe(y);
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
      expect(a.x).toBe(0);
      expect(a.y).toBe(0);

      a.set(x, y);
      expect(a.x).toBe(x);
      expect(a.y).toBe(y);
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
      expect(b.x).toBe(x);
      expect(b.y).toBe(y);

      // ensure that it is a true copy
      a.x = 0;
      a.y = -1;
      expect(b.x).toBe(x);
      expect(b.y).toBe(y);
    });

    test('add', () => {
      const a = new Vector2(x, y);
      const b = new Vector2(-x, -y);

      a.add(b);
      expect(a.x).toBe(0);
      expect(a.y).toBe(0);
      0;
      const c = new Vector2().addVectors(b, b);
      expect(c.x).toBe(-2 * x);
      expect(c.y).toBe(-2 * y);
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
      expect(a.x).toBe(2 * x);
      expect(a.y).toBe(2 * y);

      const c = new Vector2().subVectors(a, a);
      expect(c.x).toBe(0);
      expect(c.y).toBe(0);
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
      expect(a.x).toBe(-x);
      expect(a.y).toBe(-y);
    });

    test('dot', () => {
      const a = new Vector2(x, y);
      const b = new Vector2(-x, -y);
      const c = new Vector2();

      let result = a.dot(b);
      expect(result).toBe(-x * x - y * y);

      result = a.dot(c);
      expect(result).toBe(0);
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
      expect(a.length()).toBe(1);
      expect(a.x).toBe(1);

      b.normalize();
      expect(b.length()).toBe(1);
      expect(b.y).toBe(-1);
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
      expect(a.length()).toBe(x);

      a.setLength(y);
      expect(a.length()).toBe(y);

      a = new Vector2(0, 0);
      expect(a.length()).toBe(0);

      a.setLength(y);
      expect(a.length()).toBe(0);

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

      expect(a.x).not.toBe(b.x);
      expect(a.y).not.toBe(b.y);

      expect(!a.equals(b)).toBeTruthy();
      expect(!b.equals(a)).toBeTruthy();

      a.copy(b);
      expect(a.x).toBe(b.x);
      expect(a.y).toBe(b.y);

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

    test('fromBufferAttribute', () => {
      const a = new Vector2();
      const attr = new BufferAttribute(new Float32Array([1, 2, 3, 4]), 2);

      a.fromBufferAttribute(attr, 0);
      expect(a.x).toStrictEqual(1);
      expect(a.y).toStrictEqual(2);

      a.fromBufferAttribute(attr, 1);
      expect(a.x).toStrictEqual(3);
      expect(a.y).toStrictEqual(4);
    });

    test.todo('rotateAround', () => {
      // implement
    });

    test('setX,setY', () => {
      const a = new Vector2();

      expect(a.x).toBe(0);
      expect(a.y).toBe(0);

      a.setX(x);
      a.setY(y);
      expect(a.x).toBe(x);
      expect(a.y).toBe(y);
    });

    test('setComponent,getComponent', () => {
      const a = new Vector2();

      expect(a.x).toBe(0);
      expect(a.y).toBe(0);

      a.setComponent(0, 1);
      a.setComponent(1, 2);
      expect(a.getComponent(0)).toBe(1);
      expect(a.getComponent(1)).toBe(2);
    });

    test('multiply/divide', () => {
      const a = new Vector2(x, y);
      const b = new Vector2(-x, -y);

      a.multiplyScalar(-2);
      expect(a.x).toBe(x * -2);
      expect(a.y).toBe(y * -2);

      b.multiplyScalar(-2);
      expect(b.x).toBe(2 * x);
      expect(b.y).toBe(2 * y);

      a.divideScalar(-2);
      expect(a.x).toBe(x);
      expect(a.y).toBe(y);

      b.divideScalar(-2);
      expect(b.x).toBe(-x);
      expect(b.y).toBe(-y);
    });

    test('min/max/clamp', () => {
      const a = new Vector2(x, y);
      const b = new Vector2(-x, -y);
      const c = new Vector2();

      c.copy(a).min(b);
      expect(c.x).toBe(-x);
      expect(c.y).toBe(-y);

      c.copy(a).max(b);
      expect(c.x).toBe(x);
      expect(c.y).toBe(y);

      c.set(-2 * x, 2 * y);
      c.clamp(b, a);
      expect(c.x).toBe(-x);
      expect(c.y).toBe(y);

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

      expect(a.length()).toBe(x);
      expect(a.lengthSq()).toBe(x * x);

      expect(b.length()).toBe(y);
      expect(b.lengthSq()).toBe(y * y);

      expect(c.length()).toBe(0);
      expect(c.lengthSq()).toBe(0);

      a.set(x, y);
      expect(a.length()).toBe(Math.sqrt(x * x + y * y));
      expect(a.lengthSq()).toBe(x * x + y * y);
    });

    test('distanceTo/distanceToSquared', () => {
      const a = new Vector2(x, 0);
      const b = new Vector2(0, -y);
      const c = new Vector2();

      expect(a.distanceTo(c)).toBe(x);
      expect(a.distanceToSquared(c)).toBe(x * x);

      expect(b.distanceTo(c)).toBe(y);
      expect(b.distanceToSquared(c)).toBe(y * y);
    });

    test('lerp/clone', () => {
      const a = new Vector2(x, 0);
      const b = new Vector2(0, -y);

      expect(a.lerp(a, 0).equals(a.lerp(a, 0.5))).toBeTruthy();
      expect(a.lerp(a, 0).equals(a.lerp(a, 1))).toBeTruthy();

      expect(a.clone().lerp(b, 0).equals(a)).toBeTruthy();

      expect(a.clone().lerp(b, 0.5).x).toBe(x * 0.5);
      expect(a.clone().lerp(b, 0.5).y).toBe(-y * 0.5);

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
