import { describe, expect, it, test, vi } from 'vitest';

import { Matrix3 } from '../src/Matrix3.js';
import { Vector3 } from '../src/Vector3.js';
import { Euler } from '../src/Euler.js';
import { Quaternion } from '../src/Quaternion.js';

import * as MathUtils from '../src/MathUtils.js';
import { eps } from './math-constants.js';

import { Matrix4 } from '../src/Matrix4.js';

function matrixEquals4(a, b, tolerance = 0.0001) {
  if (a.elements.length !== b.elements.length) {
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

function eulerEquals(a, b, tolerance = 0.0001) {
  // from Euler.js
  const diff = Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z);
  return diff < tolerance;
}

describe('Maths', () => {
  describe('Matrix4', () => {
    test('constructor', () => {
      const a = new Matrix4();
      expect(a.determinant()).toBe(1);

      const b = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
      expect(b.elements[0]).toBe(0);
      expect(b.elements[1]).toBe(4);
      expect(b.elements[2]).toBe(8);
      expect(b.elements[3]).toBe(12);
      expect(b.elements[4]).toBe(1);
      expect(b.elements[5]).toBe(5);
      expect(b.elements[6]).toBe(9);
      expect(b.elements[7]).toBe(13);
      expect(b.elements[8]).toBe(2);
      expect(b.elements[9]).toBe(6);
      expect(b.elements[10]).toBe(10);
      expect(b.elements[11]).toBe(14);
      expect(b.elements[12]).toBe(3);
      expect(b.elements[13]).toBe(7);
      expect(b.elements[14]).toBe(11);
      expect(b.elements[15]).toBe(15);

      expect(!matrixEquals4(a, b)).toBeTruthy();
    });

    test('isMatrix4', () => {
      const a = new Matrix4();
      // @ts-ignore
      expect(a.isMatrix4).toBeTruthy();

      const b = new Vector3();
      // @ts-ignore
      expect(!b.isMatrix4).toBeTruthy();
    });

    test('set', () => {
      const b = new Matrix4();
      expect(b.determinant()).toBe(1);

      b.set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
      expect(b.elements[0]).toBe(0);
      expect(b.elements[1]).toBe(4);
      expect(b.elements[2]).toBe(8);
      expect(b.elements[3]).toBe(12);
      expect(b.elements[4]).toBe(1);
      expect(b.elements[5]).toBe(5);
      expect(b.elements[6]).toBe(9);
      expect(b.elements[7]).toBe(13);
      expect(b.elements[8]).toBe(2);
      expect(b.elements[9]).toBe(6);
      expect(b.elements[10]).toBe(10);
      expect(b.elements[11]).toBe(14);
      expect(b.elements[12]).toBe(3);
      expect(b.elements[13]).toBe(7);
      expect(b.elements[14]).toBe(11);
      expect(b.elements[15]).toBe(15);
    });

    test('identity', () => {
      const b = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
      expect(b.elements[0]).toBe(0);
      expect(b.elements[1]).toBe(4);
      expect(b.elements[2]).toBe(8);
      expect(b.elements[3]).toBe(12);
      expect(b.elements[4]).toBe(1);
      expect(b.elements[5]).toBe(5);
      expect(b.elements[6]).toBe(9);
      expect(b.elements[7]).toBe(13);
      expect(b.elements[8]).toBe(2);
      expect(b.elements[9]).toBe(6);
      expect(b.elements[10]).toBe(10);
      expect(b.elements[11]).toBe(14);
      expect(b.elements[12]).toBe(3);
      expect(b.elements[13]).toBe(7);
      expect(b.elements[14]).toBe(11);
      expect(b.elements[15]).toBe(15);

      const a = new Matrix4();
      expect(!matrixEquals4(a, b)).toBeTruthy();

      b.identity();
      expect(matrixEquals4(a, b)).toBeTruthy();
    });

    test('clone', () => {
      const a = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
      const b = a.clone();

      expect(matrixEquals4(a, b)).toBeTruthy();

      // ensure that it is a true copy
      a.elements[0] = 2;
      expect(!matrixEquals4(a, b)).toBeTruthy();
    });

    test('copy', () => {
      const a = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
      const b = new Matrix4().copy(a);

      expect(matrixEquals4(a, b)).toBeTruthy();

      // ensure that it is a true copy
      a.elements[0] = 2;
      expect(!matrixEquals4(a, b)).toBeTruthy();
    });

    test('setFromMatrix3', () => {
      // prettier-ignore
      const a = new Matrix3().set(
				0, 1, 2,
				3, 4, 5,
				6, 7, 8
			);

      const b = new Matrix4();

      // prettier-ignore
      const c = new Matrix4().set(
				0, 1, 2, 0,
				3, 4, 5, 0,
				6, 7, 8, 0,
				0, 0, 0, 1
			);

      b.setFromMatrix3(a);

      expect(b.equals(c)).toBeTruthy();
    });

    test('copyPosition', () => {
      const a = new Matrix4().set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
      const b = new Matrix4().set(1, 2, 3, 0, 5, 6, 7, 0, 9, 10, 11, 0, 13, 14, 15, 16);

      expect(matrixEquals4(a, b)).toBeFalsy();

      b.copyPosition(a);

      expect(matrixEquals4(a, b)).toBeTruthy();
    });

    test('makeBasis/extractBasis', () => {
      const identityBasis = [new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1)];
      const a = new Matrix4().makeBasis(identityBasis[0], identityBasis[1], identityBasis[2]);
      const identity = new Matrix4();
      expect(matrixEquals4(a, identity)).toBeTruthy();

      const testBases = [[new Vector3(0, 1, 0), new Vector3(-1, 0, 0), new Vector3(0, 0, 1)]];

      for (let i = 0; i < testBases.length; i++) {
        const testBasis = testBases[i];
        const b = new Matrix4().makeBasis(testBasis[0], testBasis[1], testBasis[2]);
        const outBasis = [new Vector3(), new Vector3(), new Vector3()];
        b.extractBasis(outBasis[0], outBasis[1], outBasis[2]);

        for (let j = 0; j < outBasis.length; j++) {
          expect(outBasis[j].equals(testBasis[j])).toBeTruthy();
        }

        for (let j = 0; j < identityBasis.length; j++) {
          outBasis[j].copy(identityBasis[j]);
          outBasis[j].applyMatrix4(b);
        }

        for (let j = 0; j < outBasis.length; j++) {
          expect(outBasis[j].equals(testBasis[j])).toBeTruthy();
        }
      }
    });

    test('makeRotationFromEuler/extractRotation', () => {
      const testValues = [
        new Euler(0, 0, 0, 'XYZ'),
        new Euler(1, 0, 0, 'XYZ'),
        new Euler(0, 1, 0, 'ZYX'),
        new Euler(0, 0, 0.5, 'YZX'),
        new Euler(0, 0, -0.5, 'YZX')
      ];

      for (let i = 0; i < testValues.length; i++) {
        const v = testValues[i];

        const m = new Matrix4().makeRotationFromEuler(v);

        const v2 = new Euler().setFromRotationMatrix(m, v.order);
        const m2 = new Matrix4().makeRotationFromEuler(v2);

        expect(matrixEquals4(m, m2, eps)).toBeTruthy();
        expect(eulerEquals(v, v2, eps)).toBeTruthy();

        const m3 = new Matrix4().extractRotation(m2);
        const v3 = new Euler().setFromRotationMatrix(m3, v.order);

        expect(matrixEquals4(m, m3, eps)).toBeTruthy();
        expect(eulerEquals(v, v3, eps)).toBeTruthy();
      }
    });

    test.todo('makeRotationFromQuaternion', () => {
      // makeRotationFromQuaternion( q )
      // implement
    });

    test('lookAt', () => {
      const a = new Matrix4();
      const expected = new Matrix4().identity();
      const eye = new Vector3(0, 0, 0);
      const target = new Vector3(0, 1, -1);
      const up = new Vector3(0, 1, 0);

      a.lookAt(eye, target, up);
      const rotation = new Euler().setFromRotationMatrix(a);
      expect(rotation.x * (180 / Math.PI)).toBe(45);

      // eye and target are in the same position
      eye.copy(target);
      a.lookAt(eye, target, up);
      expect(matrixEquals4(a, expected)).toBeTruthy();

      // up and z are parallel
      eye.set(0, 1, 0);
      target.set(0, 0, 0);
      a.lookAt(eye, target, up);
      expected.set(1, 0, 0, 0, 0, 0.0001, 1, 0, 0, -1, 0.0001, 0, 0, 0, 0, 1);
      expect(matrixEquals4(a, expected)).toBeTruthy();
    });

    test('multiply', () => {
      // prettier-ignore
      const lhs = new Matrix4().set(
        2, 3, 5, 7,
        11, 13, 17, 19,
        23, 29, 31, 37,
        41, 43, 47, 53
      );

      // prettier-ignore
      const rhs = new Matrix4().set(
        59, 61, 67, 71,
        73, 79, 83, 89,
        97, 101, 103, 107,
        109, 113, 127, 131
      );

      lhs.multiply(rhs);

      expect(lhs.elements[0]).toBe(1585);
      expect(lhs.elements[1]).toBe(5318);
      expect(lhs.elements[2]).toBe(10514);
      expect(lhs.elements[3]).toBe(15894);
      expect(lhs.elements[4]).toBe(1655);
      expect(lhs.elements[5]).toBe(5562);
      expect(lhs.elements[6]).toBe(11006);
      expect(lhs.elements[7]).toBe(16634);
      expect(lhs.elements[8]).toBe(1787);
      expect(lhs.elements[9]).toBe(5980);
      expect(lhs.elements[10]).toBe(11840);
      expect(lhs.elements[11]).toBe(17888);
      expect(lhs.elements[12]).toBe(1861);
      expect(lhs.elements[13]).toBe(6246);
      expect(lhs.elements[14]).toBe(12378);
      expect(lhs.elements[15]).toBe(18710);
    });

    test('premultiply', () => {
      // prettier-ignore
      const lhs = new Matrix4().set(
        2, 3, 5, 7,
        11, 13, 17, 19,
        23, 29, 31, 37,
        41, 43, 47, 53
      );

      // prettier-ignore
      const rhs = new Matrix4().set(
        59, 61, 67, 71,
        73, 79, 83, 89,
        97, 101, 103, 107,
        109, 113, 127, 131
      );

      rhs.premultiply(lhs);

      expect(rhs.elements[0]).toBe(1585);
      expect(rhs.elements[1]).toBe(5318);
      expect(rhs.elements[2]).toBe(10514);
      expect(rhs.elements[3]).toBe(15894);
      expect(rhs.elements[4]).toBe(1655);
      expect(rhs.elements[5]).toBe(5562);
      expect(rhs.elements[6]).toBe(11006);
      expect(rhs.elements[7]).toBe(16634);
      expect(rhs.elements[8]).toBe(1787);
      expect(rhs.elements[9]).toBe(5980);
      expect(rhs.elements[10]).toBe(11840);
      expect(rhs.elements[11]).toBe(17888);
      expect(rhs.elements[12]).toBe(1861);
      expect(rhs.elements[13]).toBe(6246);
      expect(rhs.elements[14]).toBe(12378);
      expect(rhs.elements[15]).toBe(18710);
    });

    test('multiplyMatrices', () => {
      // prettier-ignore
      const lhs = new Matrix4().set(
        2, 3, 5, 7,
        11, 13, 17, 19,
        23, 29, 31, 37,
        41, 43, 47, 53
      );

      // prettier-ignore
      const rhs = new Matrix4().set(
        59, 61, 67, 71,
        73, 79, 83, 89,
        97, 101, 103, 107,
        109, 113, 127, 131
      );

      const ans = new Matrix4();

      ans.multiplyMatrices(lhs, rhs);

      expect(ans.elements[0]).toBe(1585);
      expect(ans.elements[1]).toBe(5318);
      expect(ans.elements[2]).toBe(10514);
      expect(ans.elements[3]).toBe(15894);
      expect(ans.elements[4]).toBe(1655);
      expect(ans.elements[5]).toBe(5562);
      expect(ans.elements[6]).toBe(11006);
      expect(ans.elements[7]).toBe(16634);
      expect(ans.elements[8]).toBe(1787);
      expect(ans.elements[9]).toBe(5980);
      expect(ans.elements[10]).toBe(11840);
      expect(ans.elements[11]).toBe(17888);
      expect(ans.elements[12]).toBe(1861);
      expect(ans.elements[13]).toBe(6246);
      expect(ans.elements[14]).toBe(12378);
      expect(ans.elements[15]).toBe(18710);
    });

    test('multiplyScalar', () => {
      const b = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
      expect(b.elements[0]).toBe(0);
      expect(b.elements[1]).toBe(4);
      expect(b.elements[2]).toBe(8);
      expect(b.elements[3]).toBe(12);
      expect(b.elements[4]).toBe(1);
      expect(b.elements[5]).toBe(5);
      expect(b.elements[6]).toBe(9);
      expect(b.elements[7]).toBe(13);
      expect(b.elements[8]).toBe(2);
      expect(b.elements[9]).toBe(6);
      expect(b.elements[10]).toBe(10);
      expect(b.elements[11]).toBe(14);
      expect(b.elements[12]).toBe(3);
      expect(b.elements[13]).toBe(7);
      expect(b.elements[14]).toBe(11);
      expect(b.elements[15]).toBe(15);

      b.multiplyScalar(2);
      expect(b.elements[0]).toBe(0 * 2);
      expect(b.elements[1]).toBe(4 * 2);
      expect(b.elements[2]).toBe(8 * 2);
      expect(b.elements[3]).toBe(12 * 2);
      expect(b.elements[4]).toBe(1 * 2);
      expect(b.elements[5]).toBe(5 * 2);
      expect(b.elements[6]).toBe(9 * 2);
      expect(b.elements[7]).toBe(13 * 2);
      expect(b.elements[8]).toBe(2 * 2);
      expect(b.elements[9]).toBe(6 * 2);
      expect(b.elements[10]).toBe(10 * 2);
      expect(b.elements[11]).toBe(14 * 2);
      expect(b.elements[12]).toBe(3 * 2);
      expect(b.elements[13]).toBe(7 * 2);
      expect(b.elements[14]).toBe(11 * 2);
      expect(b.elements[15]).toBe(15 * 2);
    });

    test('determinant', () => {
      const a = new Matrix4();
      expect(a.determinant()).toBe(1);

      a.elements[0] = 2;
      expect(a.determinant()).toBe(2);

      a.elements[0] = 0;
      expect(a.determinant()).toBe(0);

      // calculated via http://www.euclideanspace.com/maths/algebra/matrix/functions/determinant/fourD/index.htm
      a.set(2, 3, 4, 5, -1, -21, -3, -4, 6, 7, 8, 10, -8, -9, -10, -12);
      expect(a.determinant()).toBe(76);
    });

    test('transpose', () => {
      const a = new Matrix4();
      let b = a.clone().transpose();
      expect(matrixEquals4(a, b)).toBeTruthy();

      b = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);

      const c = b.clone().transpose();
      expect(!matrixEquals4(b, c)).toBeTruthy();

      c.transpose();
      expect(matrixEquals4(b, c)).toBeTruthy();
    });

    test('setPosition', () => {
      const a = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
      const b = new Vector3(-1, -2, -3);
      const c = new Matrix4().set(0, 1, 2, -1, 4, 5, 6, -2, 8, 9, 10, -3, 12, 13, 14, 15);

      a.setPosition(b);
      expect(matrixEquals4(a, c)).toBeTruthy();

      const d = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
      const e = new Matrix4().set(0, 1, 2, -1, 4, 5, 6, -2, 8, 9, 10, -3, 12, 13, 14, 15);

      d.setPosition(-1, -2, -3);
      expect(matrixEquals4(d, e)).toBeTruthy();
    });

    test('invert', () => {
      const zero = new Matrix4().set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      const identity = new Matrix4();

      const a = new Matrix4();
      const b = new Matrix4().set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

      a.copy(b).invert();
      expect(matrixEquals4(a, zero)).toBeTruthy();

      const testMatrices = [
        new Matrix4().makeRotationX(0.3),
        new Matrix4().makeRotationX(-0.3),
        new Matrix4().makeRotationY(0.3),
        new Matrix4().makeRotationY(-0.3),
        new Matrix4().makeRotationZ(0.3),
        new Matrix4().makeRotationZ(-0.3),
        new Matrix4().makeScale(1, 2, 3),
        new Matrix4().makeScale(1 / 8, 1 / 2, 1 / 3),
        new Matrix4().makePerspective(-1, 1, 1, -1, 1, 1000),
        new Matrix4().makePerspective(-16, 16, 9, -9, 0.1, 10000),
        new Matrix4().makeTranslation(1, 2, 3)
      ];

      for (let i = 0, il = testMatrices.length; i < il; i++) {
        const m = testMatrices[i];

        const mInverse = new Matrix4().copy(m).invert();
        const mSelfInverse = m.clone();
        mSelfInverse.copy(mSelfInverse).invert();

        // self-inverse should the same as inverse
        expect(matrixEquals4(mSelfInverse, mInverse)).toBeTruthy();

        // the determinant of the inverse should be the reciprocal
        expect(Math.abs(m.determinant() * mInverse.determinant() - 1) < 0.0001).toBeTruthy();

        const mProduct = new Matrix4().multiplyMatrices(m, mInverse);

        // the determinant of the identity matrix is 1
        expect(Math.abs(mProduct.determinant() - 1) < 0.0001).toBeTruthy();
        expect(matrixEquals4(mProduct, identity)).toBeTruthy();
      }
    });

    test('scale', () => {
      const a = new Matrix4().set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
      const b = new Vector3(2, 3, 4);
      const c = new Matrix4().set(2, 6, 12, 4, 10, 18, 28, 8, 18, 30, 44, 12, 26, 42, 60, 16);

      a.scale(b);

      expect(matrixEquals4(a, c)).toBeTruthy();
    });

    test('getMaxScaleOnAxis', () => {
      const a = new Matrix4().set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
      const expected = Math.sqrt(3 * 3 + 7 * 7 + 11 * 11);

      expect(Math.abs(a.getMaxScaleOnAxis() - expected) <= eps).toBeTruthy();
    });

    test('makeTranslation', () => {
      const a = new Matrix4();
      const b = new Vector3(2, 3, 4);
      const c = new Matrix4().set(1, 0, 0, 2, 0, 1, 0, 3, 0, 0, 1, 4, 0, 0, 0, 1);

      a.makeTranslation(b.x, b.y, b.z);

      expect(matrixEquals4(a, c)).toBeTruthy();
    });

    test('makeRotationX', () => {
      const a = new Matrix4();
      const b = Math.sqrt(3) / 2;
      const c = new Matrix4().set(1, 0, 0, 0, 0, b, -0.5, 0, 0, 0.5, b, 0, 0, 0, 0, 1);

      a.makeRotationX(Math.PI / 6);

      expect(matrixEquals4(a, c)).toBeTruthy();
    });

    test('makeRotationY', () => {
      const a = new Matrix4();
      const b = Math.sqrt(3) / 2;
      const c = new Matrix4().set(b, 0, 0.5, 0, 0, 1, 0, 0, -0.5, 0, b, 0, 0, 0, 0, 1);

      a.makeRotationY(Math.PI / 6);

      expect(matrixEquals4(a, c)).toBeTruthy();
    });

    test('makeRotationZ', () => {
      const a = new Matrix4();
      const b = Math.sqrt(3) / 2;
      const c = new Matrix4().set(b, -0.5, 0, 0, 0.5, b, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

      a.makeRotationZ(Math.PI / 6);

      expect(matrixEquals4(a, c)).toBeTruthy();
    });

    test('makeRotationAxis', () => {
      const axis = new Vector3(1.5, 0.0, 1.0).normalize();
      const radians = MathUtils.degToRad(45);
      const a = new Matrix4().makeRotationAxis(axis, radians);

      // prettier-ignore
      const expected = new Matrix4().set(
				0.9098790095958609, - 0.39223227027636803, 0.13518148560620882, 0,
				0.39223227027636803, 0.7071067811865476, - 0.588348405414552, 0,
				0.13518148560620882, 0.588348405414552, 0.7972277715906868, 0,
				0, 0, 0, 1
			);

      expect(matrixEquals4(a, expected)).toBeTruthy();
    });

    test('makeScale', () => {
      const a = new Matrix4();
      const c = new Matrix4().set(2, 0, 0, 0, 0, 3, 0, 0, 0, 0, 4, 0, 0, 0, 0, 1);

      a.makeScale(2, 3, 4);

      expect(matrixEquals4(a, c)).toBeTruthy();
    });

    test('makeShear', () => {
      const a = new Matrix4();
      const c = new Matrix4().set(1, 3, 5, 0, 1, 1, 6, 0, 2, 4, 1, 0, 0, 0, 0, 1);

      a.makeShear(1, 2, 3, 4, 5, 6);

      expect(matrixEquals4(a, c)).toBeTruthy();
    });

    test('compose/decompose', () => {
      const tValues = [
        new Vector3(),
        new Vector3(3, 0, 0),
        new Vector3(0, 4, 0),
        new Vector3(0, 0, 5),
        new Vector3(-6, 0, 0),
        new Vector3(0, -7, 0),
        new Vector3(0, 0, -8),
        new Vector3(-2, 5, -9),
        new Vector3(-2, -5, -9)
      ];

      const sValues = [
        new Vector3(1, 1, 1),
        new Vector3(2, 2, 2),
        new Vector3(1, -1, 1),
        new Vector3(-1, 1, 1),
        new Vector3(1, 1, -1),
        new Vector3(2, -2, 1),
        new Vector3(-1, 2, -2),
        new Vector3(-1, -1, -1),
        new Vector3(-2, -2, -2)
      ];

      const rValues = [
        new Quaternion(),
        new Quaternion().setFromEuler(new Euler(1, 1, 0)),
        new Quaternion().setFromEuler(new Euler(1, -1, 1)),
        new Quaternion(0, 0.9238795292366128, 0, 0.38268342717215614)
      ];

      for (let ti = 0; ti < tValues.length; ti++) {
        for (let si = 0; si < sValues.length; si++) {
          for (let ri = 0; ri < rValues.length; ri++) {
            const t = tValues[ti];
            const s = sValues[si];
            const r = rValues[ri];

            const m = new Matrix4().compose(t, r, s);
            const t2 = new Vector3();
            const r2 = new Quaternion();
            const s2 = new Vector3();

            m.decompose(t2, r2, s2);

            const m2 = new Matrix4().compose(t2, r2, s2);

            expect(matrixEquals4(m, m2)).toBeTruthy();
          }
        }
      }
    });

    test('makePerspective', () => {
      const a = new Matrix4().makePerspective(-1, 1, -1, 1, 1, 100);

      // prettier-ignore
      const expected = new Matrix4().set(
				1, 0, 0, 0,
				0, - 1, 0, 0,
				0, 0, - 101 / 99, - 200 / 99,
				0, 0, - 1, 0
			);

      expect(matrixEquals4(a, expected)).toBeTruthy();
    });

    test('makeOrthographic', () => {
      const a = new Matrix4().makeOrthographic(-1, 1, -1, 1, 1, 100);

      // prettier-ignore
      const expected = new Matrix4().set(
				1, 0, 0, 0,
				0, - 1, 0, 0,
				0, 0, - 2 / 99, - 101 / 99,
				0, 0, 0, 1
			);

      expect(matrixEquals4(a, expected)).toBeTruthy();
    });

    test('equals', () => {
      const a = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
      const b = new Matrix4().set(0, -1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);

      expect(a.equals(b)).toBeFalsy();
      expect(b.equals(a)).toBeFalsy();

      a.copy(b);
      expect(a.equals(b)).toBeTruthy();
      expect(b.equals(a)).toBeTruthy();
    });

    test('fromArray', () => {
      const a = new Matrix4();
      const b = new Matrix4().set(1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16);

      a.fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

      expect(a.equals(b)).toBeTruthy();
    });

    test('toArray', () => {
      const a = new Matrix4().set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
      const noOffset = [1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16];
      const withOffset = [undefined, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15, 4, 8, 12, 16];

      let array = a.toArray();
      expect(array).toEqual(noOffset);

      array = [];
      a.toArray(array);
      expect(array).toEqual(noOffset);

      array = [];
      a.toArray(array, 1);
      expect(array).toEqual(withOffset);
    });
  });
});
