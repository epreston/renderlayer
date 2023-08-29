import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Vector4 } from '../src/Vector4.js';
import { Matrix3 } from '../src/Matrix3.js';
import { Matrix4 } from '../src/Matrix4.js';
import { Euler } from '../src/Euler.js';
import { Quaternion } from '../src/Quaternion.js';

// import { Spherical } from '../src/Spherical.js';
// import { Cylindrical } from '../src/Cylindrical.js';

import { BufferAttribute } from '@renderlayer/buffers';
import { PerspectiveCamera } from '@renderlayer/cameras';

import { x, y, z, w, eps } from './math-constants.js';

import { Vector3 } from '../src/Vector3.js';

describe('Maths', () => {
  describe('Vector3', () => {
    test('constructor', () => {
      let a = new Vector3();
      expect(a.x == 0).toBeTruthy();
      expect(a.y == 0).toBeTruthy();
      expect(a.z == 0).toBeTruthy();

      a = new Vector3(x, y, z);
      expect(a.x === x).toBeTruthy();
      expect(a.y === y).toBeTruthy();
      expect(a.z === z).toBeTruthy();
    });

    test('isVector3', () => {
      const object = new Vector3();

      // @ts-ignore
      expect(object.isVector3).toBeTruthy();
    });

    test('set', () => {
      const a = new Vector3();
      expect(a.x == 0).toBeTruthy();
      expect(a.y == 0).toBeTruthy();
      expect(a.z == 0).toBeTruthy();

      a.set(x, y, z);
      expect(a.x == x).toBeTruthy();
      expect(a.y == y).toBeTruthy();
      expect(a.z == z).toBeTruthy();
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

    test.todo('setZ', () => {
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
      const a = new Vector3(x, y, z);
      const b = new Vector3().copy(a);
      expect(b.x == x).toBeTruthy();
      expect(b.y == y).toBeTruthy();
      expect(b.z == z).toBeTruthy();

      // ensure that it is a true copy
      a.x = 0;
      a.y = -1;
      a.z = -2;

      expect(b.x == x).toBeTruthy();
      expect(b.y == y).toBeTruthy();
      expect(b.z == z).toBeTruthy();
    });

    test('add', () => {
      const a = new Vector3(x, y, z);
      const b = new Vector3(-x, -y, -z);

      a.add(b);
      expect(a.x == 0).toBeTruthy();
      expect(a.y == 0).toBeTruthy();
      expect(a.z == 0).toBeTruthy();

      const c = new Vector3().addVectors(b, b);
      expect(c.x == -2 * x).toBeTruthy();
      expect(c.y == -2 * y).toBeTruthy();
      expect(c.z == -2 * z).toBeTruthy();
    });

    test('addScalar', () => {
      const v = new Vector3(1, 2, 3);

      v.addScalar(2);
      expect(v.x).to.equal(3);
      expect(v.y).to.equal(4);
      expect(v.z).to.equal(5);
    });

    test('addVectors', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);

      v1.add(v2);
      expect(v1.x).to.equal(5);
      expect(v1.y).to.equal(7);
      expect(v1.z).to.equal(9);
    });

    test('addScaledVector', () => {
      const a = new Vector3(x, y, z);
      const b = new Vector3(2, 3, 4);
      const s = 3;

      a.addScaledVector(b, s);
      expect(a.x).toStrictEqual(x + b.x * s);
      expect(a.y).toStrictEqual(y + b.y * s);
      expect(a.z).toStrictEqual(z + b.z * s);
    });

    test('sub', () => {
      const a = new Vector3(x, y, z);
      const b = new Vector3(-x, -y, -z);

      a.sub(b);
      expect(a.x == 2 * x).toBeTruthy();
      expect(a.y == 2 * y).toBeTruthy();
      expect(a.z == 2 * z).toBeTruthy();

      const c = new Vector3().subVectors(a, a);
      expect(c.x == 0).toBeTruthy();
      expect(c.y == 0).toBeTruthy();
      expect(c.z == 0).toBeTruthy();
    });

    test.todo('subScalar', () => {
      // implement
    });

    test.todo('subVectors', () => {
      // implement
    });

    test('multiply', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);

      v1.multiply(v2);
      expect(v1.x).to.equal(4);
      expect(v1.y).to.equal(10);
      expect(v1.z).to.equal(18);
    });

    test('multiplyScalar', () => {
      const v = new Vector3(1, 2, 3);

      v.multiplyScalar(2);
      expect(v.x).to.equal(2);
      expect(v.y).to.equal(4);
      expect(v.z).to.equal(6);
    });

    test('multiplyVectors', () => {
      const a = new Vector3(x, y, z);
      const b = new Vector3(2, 3, -5);

      const c = new Vector3().multiplyVectors(a, b);
      expect(c.x).toStrictEqual(x * 2);
      expect(c.y).toStrictEqual(y * 3);
      expect(c.z).toStrictEqual(z * -5);
    });

    test('applyEuler', () => {
      const a = new Vector3(x, y, z);
      const euler = new Euler(90, -45, 0);
      const expected = new Vector3(-2.352970120501014, -4.7441750936226645, 0.9779234597246458);

      a.applyEuler(euler);
      expect(Math.abs(a.x - expected.x) <= eps).toBeTruthy();
      expect(Math.abs(a.y - expected.y) <= eps).toBeTruthy();
      expect(Math.abs(a.z - expected.z) <= eps).toBeTruthy();
    });

    test('applyAxisAngle', () => {
      const a = new Vector3(x, y, z);
      const axis = new Vector3(0, 1, 0);
      const angle = Math.PI / 4.0;
      const expected = new Vector3(3 * Math.sqrt(2), 3, Math.sqrt(2));

      a.applyAxisAngle(axis, angle);
      expect(Math.abs(a.x - expected.x) <= eps).toBeTruthy();
      expect(Math.abs(a.y - expected.y) <= eps).toBeTruthy();
      expect(Math.abs(a.z - expected.z) <= eps).toBeTruthy();
    });

    test('applyMatrix3', () => {
      const a = new Vector3(x, y, z);
      const m = new Matrix3().set(2, 3, 5, 7, 11, 13, 17, 19, 23);

      a.applyMatrix3(m);
      expect(a.x).toStrictEqual(33);
      expect(a.y).toStrictEqual(99);
      expect(a.z).toStrictEqual(183);
    });

    test.todo('applyNormalMatrix', () => {
      // applyNormalMatrix( m )
      // implement
    });

    test('applyMatrix4', () => {
      const a = new Vector3(x, y, z);
      const b = new Vector4(x, y, z, 1);

      let m = new Matrix4().makeRotationX(Math.PI);
      a.applyMatrix4(m);
      b.applyMatrix4(m);
      expect(a.x == b.x / b.w).toBeTruthy();
      expect(a.y == b.y / b.w).toBeTruthy();
      expect(a.z == b.z / b.w).toBeTruthy();

      m = new Matrix4().makeTranslation(3, 2, 1);
      a.applyMatrix4(m);
      b.applyMatrix4(m);
      expect(a.x == b.x / b.w).toBeTruthy();
      expect(a.y == b.y / b.w).toBeTruthy();
      expect(a.z == b.z / b.w).toBeTruthy();

      m = new Matrix4().set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0);
      a.applyMatrix4(m);
      b.applyMatrix4(m);
      expect(a.x == b.x / b.w).toBeTruthy();
      expect(a.y == b.y / b.w).toBeTruthy();
      expect(a.z == b.z / b.w).toBeTruthy();
    });

    test('applyQuaternion', () => {
      const a = new Vector3(x, y, z);

      a.applyQuaternion(new Quaternion());
      expect(a.x).toStrictEqual(x);
      expect(a.y).toStrictEqual(y);
      expect(a.z).toStrictEqual(z);

      a.applyQuaternion(new Quaternion(x, y, z, w));
      expect(a.x).toStrictEqual(108);
      expect(a.y).toStrictEqual(162);
      expect(a.z).toStrictEqual(216);
    });

    test.todo('project', () => {
      // matrix - implement
    });

    test.todo('unproject', () => {
      // matrix - implement
    });

    test('transformDirection', () => {
      const a = new Vector3(x, y, z);
      const m = new Matrix4();
      const transformed = new Vector3(0.3713906763541037, 0.5570860145311556, 0.7427813527082074);

      a.transformDirection(m);

      expect(Math.abs(a.x - transformed.x) <= eps).toBeTruthy();
      expect(Math.abs(a.y - transformed.y) <= eps).toBeTruthy();
      expect(Math.abs(a.z - transformed.z) <= eps).toBeTruthy();
    });

    test('divide', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);

      v1.divide(v2);
      expect(v1.x).to.equal(0.25);
      expect(v1.y).to.equal(0.4);
      expect(v1.z).to.equal(0.5);
    });

    test('divideScalar', () => {
      const v = new Vector3(1, 2, 3);

      v.divideScalar(2);
      expect(v.x).to.equal(0.5);
      expect(v.y).to.equal(1);
      expect(v.z).to.equal(1.5);
    });

    test('min', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);

      v1.min(v2);
      expect(v1.x).to.equal(1);
      expect(v1.y).to.equal(2);
      expect(v1.z).to.equal(3);
    });

    test('max', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);

      v1.max(v2);
      expect(v1.x).to.equal(4);
      expect(v1.y).to.equal(5);
      expect(v1.z).to.equal(6);
    });

    test.todo('clamp', () => {
      // implement
    });

    test('clampScalar', () => {
      const a = new Vector3(-0.01, 0.5, 1.5);
      const clamped = new Vector3(0.1, 0.5, 1.0);

      a.clampScalar(0.1, 1.0);
      expect(Math.abs(a.x - clamped.x) <= 0.001).toBeTruthy();
      expect(Math.abs(a.y - clamped.y) <= 0.001).toBeTruthy();
      expect(Math.abs(a.z - clamped.z) <= 0.001).toBeTruthy();
    });

    test.todo('clampLength', () => {
      // implement
    });

    test('floor', () => {
      const v = new Vector3(1.1, 2.2, 3.3);

      v.floor();
      expect(v.x).to.equal(1);
      expect(v.y).to.equal(2);
      expect(v.z).to.equal(3);
    });

    test('ceil', () => {
      const v = new Vector3(1.1, 2.2, 3.3);

      v.ceil();
      expect(v.x).to.equal(2);
      expect(v.y).to.equal(3);
      expect(v.z).to.equal(4);
    });

    test('round', () => {
      const v = new Vector3(1.1, 2.2, 3.3);

      v.round();
      expect(v.x).to.equal(1);
      expect(v.y).to.equal(2);
      expect(v.z).to.equal(3);
    });

    test.todo('roundToZero', () => {
      // implement
    });

    test('negate', () => {
      const a = new Vector3(x, y, z);

      a.negate();
      expect(a.x == -x).toBeTruthy();
      expect(a.y == -y).toBeTruthy();
      expect(a.z == -z).toBeTruthy();
    });

    test('dot', () => {
      const a = new Vector3(x, y, z);
      const b = new Vector3(-x, -y, -z);
      const c = new Vector3();

      let result = a.dot(b);
      expect(result == -x * x - y * y - z * z).toBeTruthy();

      result = a.dot(c);
      expect(result == 0).toBeTruthy();
    });

    test('lengthSq', () => {
      const a = new Vector3();
      expect(a.lengthSq()).to.equal(0);

      const b = new Vector3(0, 3, 4);
      expect(b.lengthSq()).to.equal(25);
    });

    test('length', () => {
      const a = new Vector3();
      expect(a.length()).to.equal(0);

      const b = new Vector3(0, 3, 4);
      expect(b.length()).to.equal(5);
    });

    test('manhattanLength', () => {
      const a = new Vector3(x, 0, 0);
      const b = new Vector3(0, -y, 0);
      const c = new Vector3(0, 0, z);
      const d = new Vector3();

      expect(a.manhattanLength() == x).toBeTruthy();
      expect(b.manhattanLength() == y).toBeTruthy();
      expect(c.manhattanLength() == z).toBeTruthy();
      expect(d.manhattanLength() == 0).toBeTruthy();

      a.set(x, y, z);
      expect(a.manhattanLength() == Math.abs(x) + Math.abs(y) + Math.abs(z)).toBeTruthy();
    });

    test('normalize', () => {
      const a = new Vector3(x, 0, 0);
      const b = new Vector3(0, -y, 0);
      const c = new Vector3(0, 0, z);

      a.normalize();
      expect(a.length() == 1).toBeTruthy();
      expect(a.x == 1).toBeTruthy();

      b.normalize();
      expect(b.length() == 1).toBeTruthy();
      expect(b.y == -1).toBeTruthy();

      c.normalize();
      expect(c.length() == 1).toBeTruthy();
      expect(c.z == 1).toBeTruthy();
    });

    test('setLength', () => {
      let a = new Vector3(x, 0, 0);
      expect(a.length() == x).toBeTruthy();

      a.setLength(y);
      expect(a.length() == y).toBeTruthy();

      a = new Vector3(0, 0, 0);
      expect(a.length() == 0).toBeTruthy();

      a.setLength(y);
      expect(a.length() == 0).toBeTruthy();

      a.setLength();
      expect(isNaN(a.length())).toBeTruthy();
    });

    test.todo('lerp', () => {
      // implement
    });

    test('lerpVectors', () => {
      const v1 = new Vector3(1, 2, 3);
      const v2 = new Vector3(4, 5, 6);
      const v3 = new Vector3();

      v3.lerpVectors(v1, v2, 0.5);
      expect(v3.x).to.equal(2.5);
      expect(v3.y).to.equal(3.5);
      expect(v3.z).to.equal(4.5);
    });

    test('cross', () => {
      const a = new Vector3(x, y, z);
      const b = new Vector3(2 * x, -y, 0.5 * z);
      const crossed = new Vector3(18, 12, -18);

      a.cross(b);

      expect(Math.abs(a.x - crossed.x) <= eps).toBeTruthy();
      expect(Math.abs(a.y - crossed.y) <= eps).toBeTruthy();
      expect(Math.abs(a.z - crossed.z) <= eps).toBeTruthy();
    });

    test('crossVectors', () => {
      const a = new Vector3(x, y, z);
      const b = new Vector3(x, -y, z);
      const c = new Vector3();
      const crossed = new Vector3(24, 0, -12);

      c.crossVectors(a, b);

      expect(Math.abs(c.x - crossed.x) <= eps).toBeTruthy();
      expect(Math.abs(c.y - crossed.y) <= eps).toBeTruthy();
      expect(Math.abs(c.z - crossed.z) <= eps).toBeTruthy();
    });

    test('projectOnVector', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3();
      const normal = new Vector3(10, 0, 0);

      expect(
        b
          .copy(a)
          .projectOnVector(normal)
          .equals(new Vector3(1, 0, 0))
      ).toBeTruthy();

      a.set(0, 1, 0);
      expect(
        b
          .copy(a)
          .projectOnVector(normal)
          .equals(new Vector3(0, 0, 0))
      ).toBeTruthy();

      a.set(0, 0, -1);
      expect(
        b
          .copy(a)
          .projectOnVector(normal)
          .equals(new Vector3(0, 0, 0))
      ).toBeTruthy();

      a.set(-1, 0, 0);
      expect(
        b
          .copy(a)
          .projectOnVector(normal)
          .equals(new Vector3(-1, 0, 0))
      ).toBeTruthy();
    });

    test('projectOnPlane', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3();
      const normal = new Vector3(1, 0, 0);

      expect(
        b
          .copy(a)
          .projectOnPlane(normal)
          .equals(new Vector3(0, 0, 0))
      ).toBeTruthy();

      a.set(0, 1, 0);
      expect(
        b
          .copy(a)
          .projectOnPlane(normal)
          .equals(new Vector3(0, 1, 0))
      ).toBeTruthy();

      a.set(0, 0, -1);
      expect(
        b
          .copy(a)
          .projectOnPlane(normal)
          .equals(new Vector3(0, 0, -1))
      ).toBeTruthy();

      a.set(-1, 0, 0);
      expect(
        b
          .copy(a)
          .projectOnPlane(normal)
          .equals(new Vector3(0, 0, 0))
      ).toBeTruthy();
    });

    test('reflect', () => {
      const a = new Vector3();
      const normal = new Vector3(0, 1, 0);
      const b = new Vector3();

      a.set(0, -1, 0);
      expect(
        b
          .copy(a)
          .reflect(normal)
          .equals(new Vector3(0, 1, 0))
      ).toBeTruthy();

      a.set(1, -1, 0);
      expect(
        b
          .copy(a)
          .reflect(normal)
          .equals(new Vector3(1, 1, 0))
      ).toBeTruthy();

      a.set(1, -1, 0);
      normal.set(0, -1, 0);
      expect(
        b
          .copy(a)
          .reflect(normal)
          .equals(new Vector3(1, 1, 0))
      ).toBeTruthy();
    });

    test('angleTo', () => {
      const a = new Vector3(0, -0.18851655680720186, 0.9820700116639124);
      const b = new Vector3(0, 0.18851655680720186, -0.9820700116639124);

      expect(a.angleTo(a)).toBe(0);
      expect(a.angleTo(b)).toBe(Math.PI);

      const x = new Vector3(1, 0, 0);
      const y = new Vector3(0, 1, 0);
      const z = new Vector3(0, 0, 1);

      expect(x.angleTo(y)).toBe(Math.PI / 2);
      expect(x.angleTo(z)).toBe(Math.PI / 2);
      expect(z.angleTo(x)).toBe(Math.PI / 2);

      expect(Math.abs(x.angleTo(new Vector3(1, 1, 0)) - Math.PI / 4) < 0.0000001).toBeTruthy();
    });

    test('distanceTo', () => {
      const v1 = new Vector3();
      const v2 = new Vector3(10, 0, 0);

      const distance = v1.distanceTo(v2);
      expect(distance).to.equal(10);

      const zeroDistance = v2.distanceTo(v2);
      expect(zeroDistance).to.equal(0);
    });

    test.todo('distanceToSquared', () => {
      // implement
    });

    test.todo('manhattanDistanceTo', () => {
      // implement
    });

    test.todo('setFromSpherical', () => {
      // const a = new Vector3();
      // const phi = Math.acos(-0.5);
      // const theta = Math.sqrt(Math.PI) * phi;
      // const sph = new Spherical(10, phi, theta);
      // const expected = new Vector3(-4.677914006701843, -5, -7.288149322420796);
      //
      // a.setFromSpherical(sph);
      // expect(Math.abs(a.x - expected.x) <= eps).toBeTruthy();
      // expect(Math.abs(a.y - expected.y) <= eps).toBeTruthy();
      // expect(Math.abs(a.z - expected.z) <= eps).toBeTruthy();
    });

    test.todo('setFromSphericalCoords', () => {
      // setFromSphericalCoords( radius, phi, theta )
      // implement
    });

    test.todo('setFromCylindrical', () => {
      // const a = new Vector3();
      // const cyl = new Cylindrical(10, Math.PI * 0.125, 20);
      // const expected = new Vector3(3.826834323650898, 20, 9.238795325112868);
      //
      // a.setFromCylindrical(cyl);
      // expect(Math.abs(a.x - expected.x) <= eps).toBeTruthy();
      // expect(Math.abs(a.y - expected.y) <= eps).toBeTruthy();
      // expect(Math.abs(a.z - expected.z) <= eps).toBeTruthy();
    });

    test.todo('setFromCylindricalCoords', () => {
      // setFromCylindricalCoords( radius, theta, y )
      // implement
    });

    test('setFromMatrixPosition', () => {
      const a = new Vector3();
      const m = new Matrix4().set(2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53);

      a.setFromMatrixPosition(m);
      expect(a.x).toStrictEqual(7);
      expect(a.y).toStrictEqual(19);
      expect(a.z).toStrictEqual(37);
    });

    test('setFromMatrixScale', () => {
      const a = new Vector3();
      const m = new Matrix4().set(2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53);
      const expected = new Vector3(25.573423705088842, 31.921779399024736, 35.70714214271425);

      a.setFromMatrixScale(m);
      expect(Math.abs(a.x - expected.x) <= eps).toBeTruthy();
      expect(Math.abs(a.y - expected.y) <= eps).toBeTruthy();
      expect(Math.abs(a.z - expected.z) <= eps).toBeTruthy();
    });

    test('setFromMatrixColumn', () => {
      const a = new Vector3();
      const m = new Matrix4().set(2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53);

      a.setFromMatrixColumn(m, 0);
      expect(a.x).toStrictEqual(2);
      expect(a.y).toStrictEqual(11);
      expect(a.z).toStrictEqual(23);

      a.setFromMatrixColumn(m, 2);
      expect(a.x).toStrictEqual(5);
      expect(a.y).toStrictEqual(17);
      expect(a.z).toStrictEqual(31);
    });

    test.todo('setFromMatrix3Column', () => {
      // setFromMatrix3Column( mat3, index )
      // implement
    });

    test.todo('setFromEuler', () => {
      // setFromEuler( e )
      // implement
    });

    test('equals', () => {
      const a = new Vector3(x, 0, z);
      const b = new Vector3(0, -y, 0);

      expect(a.x != b.x).toBeTruthy();
      expect(a.y != b.y).toBeTruthy();
      expect(a.z != b.z).toBeTruthy();

      expect(!a.equals(b)).toBeTruthy();
      expect(!b.equals(a)).toBeTruthy();

      a.copy(b);
      expect(a.x == b.x).toBeTruthy();
      expect(a.y == b.y).toBeTruthy();
      expect(a.z == b.z).toBeTruthy();

      expect(a.equals(b)).toBeTruthy();
      expect(b.equals(a)).toBeTruthy();
    });

    test('fromArray', () => {
      const a = new Vector3();
      const array = [1, 2, 3, 4, 5, 6];

      a.fromArray(array);
      expect(a.x).toStrictEqual(1);
      expect(a.y).toStrictEqual(2);
      expect(a.z).toStrictEqual(3);

      a.fromArray(array, 3);
      expect(a.x).toStrictEqual(4);
      expect(a.y).toStrictEqual(5);
      expect(a.z).toStrictEqual(6);
    });

    test('toArray', () => {
      const a = new Vector3(x, y, z);

      // No array, no offset
      let array = a.toArray();
      expect(array[0]).toStrictEqual(x);
      expect(array[1]).toStrictEqual(y);
      expect(array[2]).toStrictEqual(z);

      // With array, no offset
      array = [];
      a.toArray(array);
      expect(array[0]).toStrictEqual(x);
      expect(array[1]).toStrictEqual(y);
      expect(array[2]).toStrictEqual(z);

      // With array and offset
      array = [];
      a.toArray(array, 1);
      expect(array[0]).toBeUndefined();
      expect(array[1]).toStrictEqual(x);
      expect(array[2]).toStrictEqual(y);
      expect(array[3]).toStrictEqual(z);
    });

    test('fromBufferAttribute', () => {
      const a = new Vector3();
      const attr = new BufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6]), 3);

      a.fromBufferAttribute(attr, 0);
      expect(a.x).toStrictEqual(1);
      expect(a.y).toStrictEqual(2);
      expect(a.z).toStrictEqual(3);

      a.fromBufferAttribute(attr, 1);
      expect(a.x).toStrictEqual(4);
      expect(a.y).toStrictEqual(5);
      expect(a.z).toStrictEqual(6);
    });

    test.todo('random', () => {
      // random()
      // implement
    });

    test('randomDirection', () => {
      const vec = new Vector3();

      vec.randomDirection();

      const zero = new Vector3();
      expect(vec).not.toEqual(zero);

      // produces a unit vector
      expect(1 - vec.length() <= Number.EPSILON).toBeTruthy();
    });

    test('setX,setY,setZ', () => {
      const a = new Vector3();
      expect(a.x == 0).toBeTruthy();
      expect(a.y == 0).toBeTruthy();
      expect(a.z == 0).toBeTruthy();

      a.setX(x);
      a.setY(y);
      a.setZ(z);

      expect(a.x == x).toBeTruthy();
      expect(a.y == y).toBeTruthy();
      expect(a.z == z).toBeTruthy();
    });

    test('setComponent,getComponent', () => {
      const a = new Vector3();

      expect(a.x == 0).toBeTruthy();
      expect(a.y == 0).toBeTruthy();
      expect(a.z == 0).toBeTruthy();

      a.setComponent(0, 1);
      a.setComponent(1, 2);
      a.setComponent(2, 3);

      expect(a.getComponent(0) == 1).toBeTruthy();
      expect(a.getComponent(1) == 2).toBeTruthy();
      expect(a.getComponent(2) == 3).toBeTruthy();
    });

    test('setComponent/getComponent exceptions', () => {
      const a = new Vector3();

      expect(() => a.setComponent(3, 0)).toThrowError('index is out of range');
      expect(() => a.setComponent(3)).toThrowError('index is out of range');
    });

    test('min/max/clamp', () => {
      const a = new Vector3(x, y, z);
      const b = new Vector3(-x, -y, -z);
      const c = new Vector3();

      c.copy(a).min(b);
      expect(c.x == -x).toBeTruthy();
      expect(c.y == -y).toBeTruthy();
      expect(c.z == -z).toBeTruthy();

      c.copy(a).max(b);
      expect(c.x == x).toBeTruthy();
      expect(c.y == y).toBeTruthy();
      expect(c.z == z).toBeTruthy();

      c.set(-2 * x, 2 * y, -2 * z);
      c.clamp(b, a);
      expect(c.x == -x).toBeTruthy();
      expect(c.y == y).toBeTruthy();
      expect(c.z == -z).toBeTruthy();
    });

    test('distanceTo/distanceToSquared', () => {
      const a = new Vector3(x, 0, 0);
      const b = new Vector3(0, -y, 0);
      const c = new Vector3(0, 0, z);
      const d = new Vector3();

      expect(a.distanceTo(d) == x).toBeTruthy();
      expect(a.distanceToSquared(d) == x * x).toBeTruthy();

      expect(b.distanceTo(d) == y).toBeTruthy();
      expect(b.distanceToSquared(d) == y * y).toBeTruthy();

      expect(c.distanceTo(d) == z).toBeTruthy();
      expect(c.distanceToSquared(d) == z * z).toBeTruthy();
    });

    test('setScalar/addScalar/subScalar', () => {
      const a = new Vector3();
      const s = 3;

      a.setScalar(s);
      expect(a.x).toStrictEqual(s);
      expect(a.y).toStrictEqual(s);
      expect(a.z).toStrictEqual(s);

      a.addScalar(s);
      expect(a.x).toStrictEqual(2 * s);
      expect(a.y).toStrictEqual(2 * s);
      expect(a.z).toStrictEqual(2 * s);

      a.subScalar(2 * s);
      expect(a.x).toStrictEqual(0);
      expect(a.y).toStrictEqual(0);
      expect(a.z).toStrictEqual(0);
    });

    test('multiply/divide', () => {
      const a = new Vector3(x, y, z);
      const b = new Vector3(2 * x, 2 * y, 2 * z);
      const c = new Vector3(4 * x, 4 * y, 4 * z);

      a.multiply(b);
      expect(a.x).toStrictEqual(x * b.x);
      expect(a.y).toStrictEqual(y * b.y);
      expect(a.z).toStrictEqual(z * b.z);

      b.divide(c);
      expect(Math.abs(b.x - 0.5) <= eps).toBeTruthy();
      expect(Math.abs(b.y - 0.5) <= eps).toBeTruthy();
      expect(Math.abs(b.z - 0.5) <= eps).toBeTruthy();
    });

    test('multiply/divide', () => {
      const a = new Vector3(x, y, z);
      const b = new Vector3(-x, -y, -z);

      a.multiplyScalar(-2);
      expect(a.x == x * -2).toBeTruthy();
      expect(a.y == y * -2).toBeTruthy();
      expect(a.z == z * -2).toBeTruthy();

      b.multiplyScalar(-2);
      expect(b.x == 2 * x).toBeTruthy();
      expect(b.y == 2 * y).toBeTruthy();
      expect(b.z == 2 * z).toBeTruthy();

      a.divideScalar(-2);
      expect(a.x == x).toBeTruthy();
      expect(a.y == y).toBeTruthy();
      expect(a.z == z).toBeTruthy();

      b.divideScalar(-2);
      expect(b.x == -x).toBeTruthy();
      expect(b.y == -y).toBeTruthy();
      expect(b.z == -z).toBeTruthy();
    });

    test('project/unproject', () => {
      const a = new Vector3(x, y, z);
      const camera = new PerspectiveCamera(75, 16 / 9, 0.1, 300.0);
      const projected = new Vector3(-0.36653213611158914, -0.9774190296309043, 1.0506835611870624);

      a.project(camera);
      expect(Math.abs(a.x - projected.x) <= eps).toBeTruthy();
      expect(Math.abs(a.y - projected.y) <= eps).toBeTruthy();
      expect(Math.abs(a.z - projected.z) <= eps).toBeTruthy();

      a.unproject(camera);
      expect(Math.abs(a.x - x) <= eps).toBeTruthy();
      expect(Math.abs(a.y - y) <= eps).toBeTruthy();
      expect(Math.abs(a.z - z) <= eps).toBeTruthy();
    });

    test('length/lengthSq', () => {
      const a = new Vector3(x, 0, 0);
      const b = new Vector3(0, -y, 0);
      const c = new Vector3(0, 0, z);
      const d = new Vector3();

      expect(a.length() == x).toBeTruthy();
      expect(a.lengthSq() == x * x).toBeTruthy();

      expect(b.length() == y).toBeTruthy();
      expect(b.lengthSq() == y * y).toBeTruthy();

      expect(c.length() == z).toBeTruthy();
      expect(c.lengthSq() == z * z).toBeTruthy();

      expect(d.length() == 0).toBeTruthy();
      expect(d.lengthSq() == 0).toBeTruthy();

      a.set(x, y, z);
      expect(a.length() == Math.sqrt(x * x + y * y + z * z)).toBeTruthy();
      expect(a.lengthSq() == x * x + y * y + z * z).toBeTruthy();
    });

    test('lerp/clone', () => {
      const a = new Vector3(x, 0, z);
      const b = new Vector3(0, -y, 0);

      expect(a.lerp(a, 0).equals(a.lerp(a, 0.5))).toBeTruthy();
      expect(a.lerp(a, 0).equals(a.lerp(a, 1))).toBeTruthy();

      expect(a.clone().lerp(b, 0).equals(a)).toBeTruthy();

      expect(a.clone().lerp(b, 0.5).x == x * 0.5).toBeTruthy();
      expect(a.clone().lerp(b, 0.5).y == -y * 0.5).toBeTruthy();
      expect(a.clone().lerp(b, 0.5).z == z * 0.5).toBeTruthy();

      expect(a.clone().lerp(b, 1).equals(b)).toBeTruthy();
    });

    test('iterable', () => {
      const v = new Vector3(0, 0.5, 1);
      const array = [...v];

      expect(array[0]).toStrictEqual(0);
      expect(array[1]).toStrictEqual(0.5);
      expect(array[2]).toStrictEqual(1);
    });
  });
});
