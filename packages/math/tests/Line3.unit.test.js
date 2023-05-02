import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Vector3 } from '../src/Vector3.js';
import { Vector4 } from '../src/Vector4.js';
import { Matrix4 } from '../src/Matrix4.js';

import { x, y, z, zero3, one3, two3 } from './math-constants.js';

import { Line3 } from '../src/Line3.js';

describe('Maths', () => {
  describe('Line3', () => {
    test('Instancing', () => {
      let a = new Line3();
      expect(a.start.equals(zero3)).toBeTruthy();
      expect(a.end.equals(zero3)).toBeTruthy();

      a = new Line3(two3.clone(), one3.clone());
      expect(a.start.equals(two3)).toBeTruthy();
      expect(a.end.equals(one3)).toBeTruthy();
    });

    test('set', () => {
      const a = new Line3();

      a.set(one3, one3);

      expect(a.start.equals(one3)).toBeTruthy();
      expect(a.end.equals(one3)).toBeTruthy();
    });

    test('copy/equals', () => {
      const a = new Line3(zero3.clone(), one3.clone());
      const b = new Line3().copy(a);

      expect(b.start.equals(zero3)).toBeTruthy();
      expect(b.end.equals(one3)).toBeTruthy();

      // ensure that it is a true copy
      a.start = zero3;
      a.end = one3;

      expect(b.start.equals(zero3)).toBeTruthy();
      expect(b.end.equals(one3)).toBeTruthy();
    });

    test('clone/equal', () => {
      let a = new Line3();
      const b = new Line3(zero3, new Vector3(1, 1, 1));
      const c = new Line3(zero3, new Vector3(1, 1, 0));

      expect(a.equals(b)).toBeFalsy();
      expect(a.equals(c)).toBeFalsy();
      expect(b.equals(c)).toBeFalsy();

      a = b.clone();
      expect(a.equals(b)).toBeTruthy();
      expect(a.equals(c)).toBeFalsy();

      a.set(zero3, zero3);
      expect(a.equals(b)).toBeFalsy();
    });

    test('getCenter', () => {
      const center = new Vector3();
      const a = new Line3(zero3.clone(), two3.clone());

      expect(a.getCenter(center).equals(one3.clone())).toBeTruthy();
    });

    test('delta', () => {
      const delta = new Vector3();
      const a = new Line3(zero3.clone(), two3.clone());

      expect(a.delta(delta).equals(two3.clone())).toBeTruthy();
    });

    test('distanceSq', () => {
      const a = new Line3(zero3, zero3);
      const b = new Line3(zero3, one3);
      const c = new Line3(one3.clone().negate(), one3);
      const d = new Line3(two3.clone().multiplyScalar(-2), two3.clone().negate());

      expect(a.distanceSq()).toBe(0);
      expect(b.distanceSq()).toBe(3);
      expect(c.distanceSq()).toBe(12);
      expect(d.distanceSq()).toBe(12);
    });

    test('distance', () => {
      const a = new Line3(zero3, zero3);
      const b = new Line3(zero3, one3);
      const c = new Line3(one3.clone().negate(), one3);
      const d = new Line3(two3.clone().multiplyScalar(-2), two3.clone().negate());

      expect(a.distance()).toBe(0);
      expect(b.distance()).toBe(Math.sqrt(3));
      expect(c.distance()).toBe(Math.sqrt(12));
      expect(d.distance()).toBe(Math.sqrt(12));
    });

    test('at', () => {
      const a = new Line3(one3.clone(), new Vector3(1, 1, 2));
      const point = new Vector3();

      a.at(-1, point);
      expect(point.distanceTo(new Vector3(1, 1, 0)) < 0.0001).toBeTruthy();

      a.at(0, point);
      expect(point.distanceTo(one3.clone()) < 0.0001).toBeTruthy();

      a.at(1, point);
      expect(point.distanceTo(new Vector3(1, 1, 2)) < 0.0001).toBeTruthy();

      a.at(2, point);
      expect(point.distanceTo(new Vector3(1, 1, 3)) < 0.0001).toBeTruthy();
    });

    test('closestPointToPoint/closestPointToPointParameter', () => {
      const a = new Line3(one3.clone(), new Vector3(1, 1, 2));
      const point = new Vector3();

      // nearby the ray
      expect(a.closestPointToPointParameter(zero3.clone(), true) == 0).toBeTruthy();
      a.closestPointToPoint(zero3.clone(), true, point);
      expect(point.distanceTo(new Vector3(1, 1, 1)) < 0.0001).toBeTruthy();

      // nearby the ray
      expect(a.closestPointToPointParameter(zero3.clone(), false) == -1).toBeTruthy();
      a.closestPointToPoint(zero3.clone(), false, point);
      expect(point.distanceTo(new Vector3(1, 1, 0)) < 0.0001).toBeTruthy();

      // nearby the ray
      expect(a.closestPointToPointParameter(new Vector3(1, 1, 5), true) == 1).toBeTruthy();
      a.closestPointToPoint(new Vector3(1, 1, 5), true, point);
      expect(point.distanceTo(new Vector3(1, 1, 2)) < 0.0001).toBeTruthy();

      // exactly on the ray
      expect(a.closestPointToPointParameter(one3.clone(), true) == 0).toBeTruthy();
      a.closestPointToPoint(one3.clone(), true, point);
      expect(point.distanceTo(one3.clone()) < 0.0001).toBeTruthy();
    });

    test('applyMatrix4', () => {
      const a = new Line3(zero3.clone(), two3.clone());
      const b = new Vector4(two3.x, two3.y, two3.z, 1);
      const m = new Matrix4().makeTranslation(x, y, z);
      const v = new Vector3(x, y, z);

      a.applyMatrix4(m);
      expect(a.start.equals(v)).toBeTruthy();
      expect(a.end.equals(new Vector3(2 + x, 2 + y, 2 + z))).toBeTruthy();

      // reset starting conditions
      a.set(zero3.clone(), two3.clone());
      m.makeRotationX(Math.PI);

      a.applyMatrix4(m);
      b.applyMatrix4(m);

      expect(a.start.equals(zero3)).toBeTruthy();
      expect(a.end.x).toBe(b.x / b.w);
      expect(a.end.y).toBe(b.y / b.w);
      expect(a.end.z).toBe(b.z / b.w);

      // reset starting conditions
      a.set(zero3.clone(), two3.clone());
      b.set(two3.x, two3.y, two3.z, 1);
      m.setPosition(v);

      a.applyMatrix4(m);
      b.applyMatrix4(m);

      expect(a.start.equals(v)).toBeTruthy();
      expect(a.end.x).toBe(b.x / b.w);
      expect(a.end.y).toBe(b.y / b.w);
      expect(a.end.z).toBe(b.z / b.w);
    });

    test('equals', () => {
      const a = new Line3(zero3.clone(), zero3.clone());
      const b = new Line3();

      expect(a.equals(b)).toBeTruthy();
    });
  });
});
