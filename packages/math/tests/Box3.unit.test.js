import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Matrix4 } from '../src/Matrix4.js';
import { Plane } from '../src/Plane.js';
import { Sphere } from '../src/Sphere.js';
import { Triangle } from '../src/Triangle.js';
import { Vector3 } from '../src/Vector3.js';

import { Mesh } from '@renderlayer/objects';
import { BufferAttribute } from '@renderlayer/buffers';
import { BoxGeometry, SphereGeometry } from '@renderlayer/geometries';

import { negInf3, one3, posInf3, two3, zero3 } from './math-constants.js';

import { Box3 } from '../src/Box3.js';

function compareBox(a, b, threshold) {
  threshold = threshold || 0.0001;
  return a.min.distanceTo(b.min) < threshold && a.max.distanceTo(b.max) < threshold;
}

describe('Maths', () => {
  describe('Box3', () => {
    test('Instancing', () => {
      let a = new Box3();
      expect(a.min.equals(posInf3)).toBeTruthy();
      expect(a.max.equals(negInf3)).toBeTruthy();

      a = new Box3(zero3.clone(), zero3.clone());
      expect(a.min.equals(zero3)).toBeTruthy();
      expect(a.max.equals(zero3)).toBeTruthy();

      a = new Box3(zero3.clone(), one3.clone());
      expect(a.min.equals(zero3)).toBeTruthy();
      expect(a.max.equals(one3)).toBeTruthy();
    });

    test('isBox3', () => {
      const a = new Box3();
      expect(a.isBox3 === true).toBeTruthy();

      const b = new Sphere();

      // @ts-ignore
      expect(!b.isBox3).toBeTruthy();
    });

    test('set', () => {
      const a = new Box3();

      a.set(zero3, one3);
      expect(a.min.equals(zero3)).toBeTruthy();
      expect(a.max.equals(one3)).toBeTruthy();
    });

    test('setFromArray', () => {
      const a = new Box3();

      a.setFromArray([0, 0, 0, 1, 1, 1, 2, 2, 2]);
      expect(a.min.equals(zero3)).toBeTruthy();
      expect(a.max.equals(two3)).toBeTruthy();
    });

    test('setFromBufferAttribute', () => {
      const a = new Box3(zero3.clone(), one3.clone());
      const bigger = new BufferAttribute(
        new Float32Array([-2, -2, -2, 2, 2, 2, 1.5, 1.5, 1.5, 0, 0, 0]),
        3
      );
      const smaller = new BufferAttribute(
        new Float32Array([-0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0, 0, 0]),
        3
      );
      const newMin = new Vector3(-2, -2, -2);
      const newMax = new Vector3(2, 2, 2);

      a.setFromBufferAttribute(bigger);
      expect(a.min.equals(newMin)).toBeTruthy();
      expect(a.max.equals(newMax)).toBeTruthy();

      newMin.set(-0.5, -0.5, -0.5);
      newMax.set(0.5, 0.5, 0.5);

      a.setFromBufferAttribute(smaller);
      expect(a.min.equals(newMin)).toBeTruthy();
      expect(a.max.equals(newMax)).toBeTruthy();
    });

    test('setFromPoints', () => {
      const a = new Box3();

      a.setFromPoints([zero3, one3, two3]);
      expect(a.min.equals(zero3)).toBeTruthy();
      expect(a.max.equals(two3)).toBeTruthy();

      a.setFromPoints([one3]);
      expect(a.min.equals(one3)).toBeTruthy();
      expect(a.max.equals(one3)).toBeTruthy();

      a.setFromPoints([]);
      expect(a.isEmpty()).toBeTruthy();
    });

    test('setFromCenterAndSize', () => {
      const a = new Box3(zero3.clone(), one3.clone());
      const b = a.clone();
      const centerA = new Vector3();
      const sizeA = new Vector3();
      const sizeB = new Vector3();
      const newCenter = one3;
      const newSize = two3;

      a.getCenter(centerA);
      a.getSize(sizeA);
      a.setFromCenterAndSize(centerA, sizeA);

      expect(a.equals(b)).toBeTruthy();

      a.setFromCenterAndSize(newCenter, sizeA);
      a.getCenter(centerA);
      a.getSize(sizeA);
      b.getSize(sizeB);

      expect(centerA.equals(newCenter)).toBeTruthy();
      expect(sizeA.equals(sizeB)).toBeTruthy();
      expect(a.equals(b)).toBeFalsy();

      a.setFromCenterAndSize(centerA, newSize);
      a.getCenter(centerA);
      a.getSize(sizeA);

      expect(centerA.equals(newCenter)).toBeTruthy();
      expect(sizeA.equals(newSize)).toBeTruthy();
      expect(a.equals(b)).toBeFalsy();
    });

    test('setFromObject/BufferGeometry', () => {
      const a = new Box3(zero3.clone(), one3.clone());
      const object = new Mesh(new BoxGeometry(2, 2, 2));
      const child = new Mesh(new BoxGeometry(1, 1, 1));
      object.add(child);

      a.setFromObject(object);
      expect(a.min.equals(new Vector3(-1, -1, -1))).toBeTruthy();
      expect(a.max.equals(new Vector3(1, 1, 1))).toBeTruthy();
    });

    test('setFromObject/Precise', () => {
      const a = new Box3(zero3.clone(), one3.clone());
      const object = new Mesh(new SphereGeometry(1, 32, 32));
      const child = new Mesh(new SphereGeometry(2, 32, 32));
      object.add(child);

      object.rotation.setFromVector3(new Vector3(0, 0, Math.PI / 4.0));

      a.setFromObject(object);
      const rotatedBox = new Box3(
        new Vector3(-2 * Math.SQRT2, -2 * Math.SQRT2, -2),
        new Vector3(2 * Math.SQRT2, 2 * Math.SQRT2, 2)
      );
      expect(compareBox(a, rotatedBox)).toBeTruthy();

      a.setFromObject(object, true);
      const rotatedMinBox = new Box3(new Vector3(-2, -2, -2), new Vector3(2, 2, 2));
      expect(compareBox(a, rotatedMinBox)).toBeTruthy();
    });

    test('clone', () => {
      let a = new Box3(zero3.clone(), one3.clone());
      let b = a.clone();

      expect(b.min.equals(zero3)).toBeTruthy();
      expect(b.max.equals(one3)).toBeTruthy();

      a = new Box3();
      b = a.clone();
      expect(b.min.equals(posInf3)).toBeTruthy();
      expect(b.max.equals(negInf3)).toBeTruthy();
    });

    test('copy', () => {
      const a = new Box3(zero3.clone(), one3.clone());
      const b = new Box3().copy(a);

      expect(b.min.equals(zero3)).toBeTruthy();
      expect(b.max.equals(one3)).toBeTruthy();

      // ensure that it is a true copy
      a.min = zero3;
      a.max = one3;
      expect(b.min.equals(zero3)).toBeTruthy();
      expect(b.max.equals(one3)).toBeTruthy();
    });

    test('empty/makeEmpty', () => {
      let a = new Box3();

      expect(a.isEmpty()).toBeTruthy();

      a = new Box3(zero3.clone(), one3.clone());
      expect(!a.isEmpty()).toBeTruthy();

      a.makeEmpty();
      expect(a.isEmpty()).toBeTruthy();
    });

    test('isEmpty', () => {
      let a = new Box3(zero3.clone(), zero3.clone());
      expect(!a.isEmpty()).toBeTruthy();

      a = new Box3(zero3.clone(), one3.clone());
      expect(!a.isEmpty()).toBeTruthy();

      a = new Box3(two3.clone(), one3.clone());
      expect(a.isEmpty()).toBeTruthy();

      a = new Box3(posInf3.clone(), negInf3.clone());
      expect(a.isEmpty()).toBeTruthy();
    });

    test('getCenter', () => {
      let a = new Box3(zero3.clone(), zero3.clone());
      const center = new Vector3();

      expect(a.getCenter(center).equals(zero3)).toBeTruthy();

      a = new Box3(zero3.clone(), one3.clone());
      const midpoint = one3.clone().multiplyScalar(0.5);
      expect(a.getCenter(center).equals(midpoint)).toBeTruthy();
    });

    test('getSize', () => {
      let a = new Box3(zero3.clone(), zero3.clone());
      const size = new Vector3();

      expect(a.getSize(size).equals(zero3)).toBeTruthy();

      a = new Box3(zero3.clone(), one3.clone());
      expect(a.getSize(size).equals(one3)).toBeTruthy();
    });

    test('expandByPoint', () => {
      const a = new Box3(zero3.clone(), zero3.clone());
      const center = new Vector3();
      const size = new Vector3();

      a.expandByPoint(zero3);
      expect(a.getSize(size).equals(zero3)).toBeTruthy();

      a.expandByPoint(one3);
      expect(a.getSize(size).equals(one3)).toBeTruthy();

      a.expandByPoint(one3.clone().negate());
      expect(a.getSize(size).equals(one3.clone().multiplyScalar(2))).toBeTruthy();
      expect(a.getCenter(center).equals(zero3)).toBeTruthy();
    });

    test('expandByVector', () => {
      const a = new Box3(zero3.clone(), zero3.clone());
      const center = new Vector3();
      const size = new Vector3();

      a.expandByVector(zero3);
      expect(a.getSize(size).equals(zero3)).toBeTruthy();

      a.expandByVector(one3);
      expect(a.getSize(size).equals(one3.clone().multiplyScalar(2))).toBeTruthy();
      expect(a.getCenter(center).equals(zero3)).toBeTruthy();
    });

    test('expandByScalar', () => {
      const a = new Box3(zero3.clone(), zero3.clone());
      const center = new Vector3();
      const size = new Vector3();

      a.expandByScalar(0);
      expect(a.getSize(size).equals(zero3)).toBeTruthy();

      a.expandByScalar(1);
      expect(a.getSize(size).equals(one3.clone().multiplyScalar(2))).toBeTruthy();
      expect(a.getCenter(center).equals(zero3)).toBeTruthy();
    });

    test('expandByObject', () => {
      const a = new Box3(zero3.clone(), one3.clone());
      const b = a.clone();
      const bigger = new Mesh(new BoxGeometry(2, 2, 2));
      const smaller = new Mesh(new BoxGeometry(0.5, 0.5, 0.5));
      const child = new Mesh(new BoxGeometry(1, 1, 1));

      // just a bigger box to begin with
      a.expandByObject(bigger);
      expect(a.min.equals(new Vector3(-1, -1, -1))).toBeTruthy();
      expect(a.max.equals(new Vector3(1, 1, 1))).toBeTruthy();

      // a translated, bigger box
      a.copy(b);
      bigger.translateX(2);
      a.expandByObject(bigger);
      expect(a.min.equals(new Vector3(0, -1, -1))).toBeTruthy();
      expect(a.max.equals(new Vector3(3, 1, 1))).toBeTruthy();

      // a translated, bigger box with child
      a.copy(b);
      bigger.add(child);
      a.expandByObject(bigger);
      expect(a.min.equals(new Vector3(0, -1, -1))).toBeTruthy();
      expect(a.max.equals(new Vector3(3, 1, 1))).toBeTruthy();

      // a translated, bigger box with a translated child
      a.copy(b);
      child.translateX(2);
      a.expandByObject(bigger);
      expect(a.min.equals(new Vector3(0, -1, -1))).toBeTruthy();
      expect(a.max.equals(new Vector3(4.5, 1, 1))).toBeTruthy();

      // a smaller box
      a.copy(b);
      a.expandByObject(smaller);
      expect(a.min.equals(new Vector3(-0.25, -0.25, -0.25))).toBeTruthy();
      expect(a.max.equals(new Vector3(1, 1, 1))).toBeTruthy();

      // The AABB of a mesh with initial geometry is empty.
      expect(new Box3().expandByObject(new Mesh()).isEmpty() === true).toBeTruthy();
    });

    test('containsPoint', () => {
      const a = new Box3(zero3.clone(), zero3.clone());

      expect(a.containsPoint(zero3)).toBeTruthy();
      expect(!a.containsPoint(one3)).toBeTruthy();

      a.expandByScalar(1);
      expect(a.containsPoint(zero3)).toBeTruthy();
      expect(a.containsPoint(one3)).toBeTruthy();
      expect(a.containsPoint(one3.clone().negate())).toBeTruthy();
    });

    test('containsBox', () => {
      const a = new Box3(zero3.clone(), zero3.clone());
      const b = new Box3(zero3.clone(), one3.clone());
      const c = new Box3(one3.clone().negate(), one3.clone());

      expect(a.containsBox(a)).toBeTruthy();
      expect(!a.containsBox(b)).toBeTruthy();
      expect(!a.containsBox(c)).toBeTruthy();

      expect(b.containsBox(a)).toBeTruthy();
      expect(c.containsBox(a)).toBeTruthy();
      expect(!b.containsBox(c)).toBeTruthy();
    });

    test('getParameter', () => {
      const a = new Box3(zero3.clone(), one3.clone());
      const b = new Box3(one3.clone().negate(), one3.clone());
      const parameter = new Vector3();

      a.getParameter(zero3, parameter);
      expect(parameter.equals(zero3)).toBeTruthy();

      a.getParameter(one3, parameter);
      expect(parameter.equals(one3)).toBeTruthy();

      //

      b.getParameter(one3.clone().negate(), parameter);
      expect(parameter.equals(zero3)).toBeTruthy();

      b.getParameter(zero3, parameter);
      expect(parameter.equals(new Vector3(0.5, 0.5, 0.5))).toBeTruthy();

      b.getParameter(one3, parameter);
      expect(parameter.equals(one3)).toBeTruthy();
    });

    test('intersectsBox', () => {
      const a = new Box3(zero3.clone(), zero3.clone());
      const b = new Box3(zero3.clone(), one3.clone());
      const c = new Box3(one3.clone().negate(), one3.clone());

      expect(a.intersectsBox(a)).toBeTruthy();
      expect(a.intersectsBox(b)).toBeTruthy();
      expect(a.intersectsBox(c)).toBeTruthy();

      expect(b.intersectsBox(a)).toBeTruthy();
      expect(c.intersectsBox(a)).toBeTruthy();
      expect(b.intersectsBox(c)).toBeTruthy();

      b.translate(new Vector3(2, 2, 2));
      expect(!a.intersectsBox(b)).toBeTruthy();
      expect(!b.intersectsBox(a)).toBeTruthy();
      expect(!b.intersectsBox(c)).toBeTruthy();
    });

    test('intersectsSphere', () => {
      const a = new Box3(zero3.clone(), one3.clone());
      const b = new Sphere(zero3.clone(), 1);

      expect(a.intersectsSphere(b)).toBeTruthy();

      b.translate(new Vector3(2, 2, 2));
      expect(!a.intersectsSphere(b)).toBeTruthy();
    });

    test('intersectsPlane', () => {
      const a = new Box3(zero3.clone(), one3.clone());
      const b = new Plane(new Vector3(0, 1, 0), 1);
      const c = new Plane(new Vector3(0, 1, 0), 1.25);
      const d = new Plane(new Vector3(0, -1, 0), 1.25);
      const e = new Plane(new Vector3(0, 1, 0), 0.25);
      const f = new Plane(new Vector3(0, 1, 0), -0.25);
      const g = new Plane(new Vector3(0, 1, 0), -0.75);
      const h = new Plane(new Vector3(0, 1, 0), -1);
      const i = new Plane(new Vector3(1, 1, 1).normalize(), -1.732);
      const j = new Plane(new Vector3(1, 1, 1).normalize(), -1.733);

      expect(!a.intersectsPlane(b)).toBeTruthy();
      expect(!a.intersectsPlane(c)).toBeTruthy();
      expect(!a.intersectsPlane(d)).toBeTruthy();
      expect(!a.intersectsPlane(e)).toBeTruthy();
      expect(a.intersectsPlane(f)).toBeTruthy();
      expect(a.intersectsPlane(g)).toBeTruthy();
      expect(a.intersectsPlane(h)).toBeTruthy();
      expect(a.intersectsPlane(i)).toBeTruthy();
      expect(!a.intersectsPlane(j)).toBeTruthy();
    });

    test('intersectsTriangle', () => {
      const a = new Box3(one3.clone(), two3.clone());
      const b = new Triangle(
        new Vector3(1.5, 1.5, 2.5),
        new Vector3(2.5, 1.5, 1.5),
        new Vector3(1.5, 2.5, 1.5)
      );
      const c = new Triangle(
        new Vector3(1.5, 1.5, 3.5),
        new Vector3(3.5, 1.5, 1.5),
        new Vector3(1.5, 1.5, 1.5)
      );
      const d = new Triangle(
        new Vector3(1.5, 1.75, 3),
        new Vector3(3, 1.75, 1.5),
        new Vector3(1.5, 2.5, 1.5)
      );
      const e = new Triangle(
        new Vector3(1.5, 1.8, 3),
        new Vector3(3, 1.8, 1.5),
        new Vector3(1.5, 2.5, 1.5)
      );
      const f = new Triangle(
        new Vector3(1.5, 2.5, 3),
        new Vector3(3, 2.5, 1.5),
        new Vector3(1.5, 2.5, 1.5)
      );

      expect(a.intersectsTriangle(b)).toBeTruthy();
      expect(a.intersectsTriangle(c)).toBeTruthy();
      expect(a.intersectsTriangle(d)).toBeTruthy();
      expect(!a.intersectsTriangle(e)).toBeTruthy();
      expect(!a.intersectsTriangle(f)).toBeTruthy();
    });

    test('clampPoint', () => {
      const a = new Box3(zero3.clone(), zero3.clone());
      const b = new Box3(one3.clone().negate(), one3.clone());
      const point = new Vector3();

      a.clampPoint(zero3, point);
      expect(point.equals(zero3)).toBeTruthy();

      a.clampPoint(one3, point);
      expect(point.equals(zero3)).toBeTruthy();

      a.clampPoint(one3.clone().negate(), point);
      expect(point.equals(zero3)).toBeTruthy();

      //

      b.clampPoint(new Vector3(2, 2, 2), point);
      expect(point.equals(one3)).toBeTruthy();

      b.clampPoint(one3, point);
      expect(point.equals(one3)).toBeTruthy();

      b.clampPoint(zero3, point);
      expect(point.equals(zero3)).toBeTruthy();

      b.clampPoint(one3.clone().negate(), point);
      expect(point.equals(one3.clone().negate())).toBeTruthy();

      b.clampPoint(new Vector3(-2, -2, -2), point);
      expect(point.equals(one3.clone().negate())).toBeTruthy();
    });

    test('distanceToPoint', () => {
      const a = new Box3(zero3.clone(), zero3.clone());
      const b = new Box3(one3.clone().negate(), one3.clone());

      expect(a.distanceToPoint(new Vector3(0, 0, 0)) == 0).toBeTruthy();
      expect(a.distanceToPoint(new Vector3(1, 1, 1)) == Math.sqrt(3)).toBeTruthy();
      expect(a.distanceToPoint(new Vector3(-1, -1, -1)) == Math.sqrt(3)).toBeTruthy();

      expect(b.distanceToPoint(new Vector3(2, 2, 2)) == Math.sqrt(3)).toBeTruthy();
      expect(b.distanceToPoint(new Vector3(1, 1, 1)) == 0).toBeTruthy();
      expect(b.distanceToPoint(new Vector3(0, 0, 0)) == 0).toBeTruthy();
      expect(b.distanceToPoint(new Vector3(-1, -1, -1)) == 0).toBeTruthy();
      expect(b.distanceToPoint(new Vector3(-2, -2, -2)) == Math.sqrt(3)).toBeTruthy();
    });

    test('getBoundingSphere', () => {
      const a = new Box3(zero3.clone(), zero3.clone());
      const b = new Box3(zero3.clone(), one3.clone());
      const c = new Box3(one3.clone().negate(), one3.clone());
      const sphere = new Sphere();

      expect(a.getBoundingSphere(sphere).equals(new Sphere(zero3, 0))).toBeTruthy();
      expect(
        b
          .getBoundingSphere(sphere)
          .equals(new Sphere(one3.clone().multiplyScalar(0.5), Math.sqrt(3) * 0.5))
      ).toBeTruthy();
      expect(
        c.getBoundingSphere(sphere).equals(new Sphere(zero3, Math.sqrt(12) * 0.5))
      ).toBeTruthy();

      // Empty box\'s bounding sphere is empty
      const d = new Box3().makeEmpty();
      expect(d.getBoundingSphere(sphere).isEmpty()).toBeTruthy();
    });

    test('intersect', () => {
      const a = new Box3(zero3.clone(), zero3.clone());
      const b = new Box3(zero3.clone(), one3.clone());
      const c = new Box3(one3.clone().negate(), one3.clone());

      expect(a.clone().intersect(a).equals(a)).toBeTruthy();
      expect(a.clone().intersect(b).equals(a)).toBeTruthy();
      expect(b.clone().intersect(b).equals(b)).toBeTruthy();
      expect(a.clone().intersect(c).equals(a)).toBeTruthy();
      expect(b.clone().intersect(c).equals(b)).toBeTruthy();
      expect(c.clone().intersect(c).equals(c)).toBeTruthy();
    });

    test('union', () => {
      const a = new Box3(zero3.clone(), zero3.clone());
      const b = new Box3(zero3.clone(), one3.clone());
      const c = new Box3(one3.clone().negate(), one3.clone());

      expect(a.clone().union(a).equals(a)).toBeTruthy();
      expect(a.clone().union(b).equals(b)).toBeTruthy();
      expect(a.clone().union(c).equals(c)).toBeTruthy();
      expect(b.clone().union(c).equals(c)).toBeTruthy();
    });

    test('applyMatrix4', () => {
      const a = new Box3(zero3.clone(), zero3.clone());
      const b = new Box3(zero3.clone(), one3.clone());
      const c = new Box3(one3.clone().negate(), one3.clone());
      const d = new Box3(one3.clone().negate(), zero3.clone());

      const m = new Matrix4().makeTranslation(1, -2, 1);
      const t1 = new Vector3(1, -2, 1);

      expect(compareBox(a.clone().applyMatrix4(m), a.clone().translate(t1))).toBeTruthy();
      expect(compareBox(b.clone().applyMatrix4(m), b.clone().translate(t1))).toBeTruthy();
      expect(compareBox(c.clone().applyMatrix4(m), c.clone().translate(t1))).toBeTruthy();
      expect(compareBox(d.clone().applyMatrix4(m), d.clone().translate(t1))).toBeTruthy();
    });

    test('translate', () => {
      const a = new Box3(zero3.clone(), zero3.clone());
      const b = new Box3(zero3.clone(), one3.clone());
      const c = new Box3(one3.clone().negate(), zero3.clone());

      expect(a.clone().translate(one3).equals(new Box3(one3, one3))).toBeTruthy();
      expect(a.clone().translate(one3).translate(one3.clone().negate()).equals(a)).toBeTruthy();
      expect(c.clone().translate(one3).equals(b)).toBeTruthy();
      expect(b.clone().translate(one3.clone().negate()).equals(c)).toBeTruthy();
    });

    test('equals', () => {
      let a = new Box3();
      let b = new Box3();
      expect(b.equals(a)).toBeTruthy();
      expect(a.equals(b)).toBeTruthy();

      a = new Box3(one3, two3);
      b = new Box3(one3, two3);
      expect(b.equals(a)).toBeTruthy();
      expect(a.equals(b)).toBeTruthy();

      a = new Box3(one3, two3);
      b = a.clone();
      expect(b.equals(a)).toBeTruthy();
      expect(a.equals(b)).toBeTruthy();

      a = new Box3(one3, two3);
      b = new Box3(one3, one3);
      expect(!b.equals(a)).toBeTruthy();
      expect(!a.equals(b)).toBeTruthy();

      a = new Box3();
      b = new Box3(one3, one3);
      expect(!b.equals(a)).toBeTruthy();
      expect(!a.equals(b)).toBeTruthy();
    });
  });
});
