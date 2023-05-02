/* global QUnit */

import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Matrix3 } from '../src/Matrix3.js';
import { Matrix4 } from '../src/Matrix4.js';

function matrixEquals3(a, b, tolerance = 0.0001) {
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

function toMatrix4(m3) {
  const result = new Matrix4();
  const re = result.elements;
  const me = m3.elements;

  re[0] = me[0];
  re[1] = me[1];
  re[2] = me[2];
  re[4] = me[3];
  re[5] = me[4];
  re[6] = me[5];
  re[8] = me[6];
  re[9] = me[7];
  re[10] = me[8];

  return result;
}

describe('Maths', () => {
  describe('Matrix3', () => {
    test('Instancing', () => {
      const a = new Matrix3();
      expect(a.determinant() == 1).toBeTruthy();

      const b = new Matrix3().set(0, 1, 2, 3, 4, 5, 6, 7, 8);
      expect(b.elements[0] == 0).toBeTruthy();
      expect(b.elements[1] == 3).toBeTruthy();
      expect(b.elements[2] == 6).toBeTruthy();
      expect(b.elements[3] == 1).toBeTruthy();
      expect(b.elements[4] == 4).toBeTruthy();
      expect(b.elements[5] == 7).toBeTruthy();
      expect(b.elements[6] == 2).toBeTruthy();
      expect(b.elements[7] == 5).toBeTruthy();
      expect(b.elements[8] == 8).toBeTruthy();

      expect(!matrixEquals3(a, b)).toBeTruthy();
    });

    test('isMatrix3', () => {
      const a = new Matrix3();
      // @ts-ignore
      expect(a.isMatrix3 === true).toBeTruthy();

      const b = new Matrix4();
      // @ts-ignore
      expect(!b.isMatrix3).toBeTruthy();
    });

    test('set', () => {
      const b = new Matrix3();
      expect(b.determinant() == 1).toBeTruthy();

      b.set(0, 1, 2, 3, 4, 5, 6, 7, 8);
      expect(b.elements[0] == 0).toBeTruthy();
      expect(b.elements[1] == 3).toBeTruthy();
      expect(b.elements[2] == 6).toBeTruthy();
      expect(b.elements[3] == 1).toBeTruthy();
      expect(b.elements[4] == 4).toBeTruthy();
      expect(b.elements[5] == 7).toBeTruthy();
      expect(b.elements[6] == 2).toBeTruthy();
      expect(b.elements[7] == 5).toBeTruthy();
      expect(b.elements[8] == 8).toBeTruthy();
    });

    test('identity', () => {
      const b = new Matrix3().set(0, 1, 2, 3, 4, 5, 6, 7, 8);
      expect(b.elements[0] == 0).toBeTruthy();
      expect(b.elements[1] == 3).toBeTruthy();
      expect(b.elements[2] == 6).toBeTruthy();
      expect(b.elements[3] == 1).toBeTruthy();
      expect(b.elements[4] == 4).toBeTruthy();
      expect(b.elements[5] == 7).toBeTruthy();
      expect(b.elements[6] == 2).toBeTruthy();
      expect(b.elements[7] == 5).toBeTruthy();
      expect(b.elements[8] == 8).toBeTruthy();

      const a = new Matrix3();
      expect(!matrixEquals3(a, b)).toBeTruthy();

      b.identity();

      expect(matrixEquals3(a, b)).toBeTruthy();
    });

    test('clone', () => {
      const a = new Matrix3().set(0, 1, 2, 3, 4, 5, 6, 7, 8);
      const b = a.clone();

      expect(matrixEquals3(a, b)).toBeTruthy();

      // ensure that it is a true copy
      a.elements[0] = 2;
      expect(!matrixEquals3(a, b)).toBeTruthy();
    });

    test('copy', () => {
      const a = new Matrix3().set(0, 1, 2, 3, 4, 5, 6, 7, 8);
      const b = new Matrix3().copy(a);

      expect(matrixEquals3(a, b)).toBeTruthy();

      // ensure that it is a true copy
      a.elements[0] = 2;
      expect(!matrixEquals3(a, b)).toBeTruthy();
    });

    test.todo('extractBasis', () => {
      // extractBasis( xAxis, yAxis, zAxis )
      // implement
    });

    test('setFromMatrix4', () => {
      const a = new Matrix4().set(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
      const b = new Matrix3();
      const c = new Matrix3().set(0, 1, 2, 4, 5, 6, 8, 9, 10);

      b.setFromMatrix4(a);

      expect(b.equals(c)).toBeTruthy();
    });

    test('multiply/premultiply', () => {
      // both simply just wrap multiplyMatrices
      const a = new Matrix3().set(2, 3, 5, 7, 11, 13, 17, 19, 23);
      const b = new Matrix3().set(29, 31, 37, 41, 43, 47, 53, 59, 61);
      const expectedMultiply = [446, 1343, 2491, 486, 1457, 2701, 520, 1569, 2925];
      const expectedPremultiply = [904, 1182, 1556, 1131, 1489, 1967, 1399, 1845, 2435];

      a.multiply(b);
      expect(a.elements).toEqual(expectedMultiply);

      a.set(2, 3, 5, 7, 11, 13, 17, 19, 23);
      a.premultiply(b);
      expect(a.elements).toEqual(expectedPremultiply);
    });

    test('multiplyMatrices', () => {
      // Reference:
      //
      // #!/usr/bin/env python
      // from __future__ import print_function
      // import numpy as np
      // print(
      //     np.dot(
      //         np.reshape([2, 3, 5, 7, 11, 13, 17, 19, 23], (3, 3)),
      //         np.reshape([29, 31, 37, 41, 43, 47, 53, 59, 61], (3, 3))
      //     )
      // )
      //
      // [[ 446  486  520]
      //  [1343 1457 1569]
      //  [2491 2701 2925]]
      const lhs = new Matrix3().set(2, 3, 5, 7, 11, 13, 17, 19, 23);
      const rhs = new Matrix3().set(29, 31, 37, 41, 43, 47, 53, 59, 61);
      const ans = new Matrix3();

      ans.multiplyMatrices(lhs, rhs);

      expect(ans.elements[0] == 446).toBeTruthy();
      expect(ans.elements[1] == 1343).toBeTruthy();
      expect(ans.elements[2] == 2491).toBeTruthy();
      expect(ans.elements[3] == 486).toBeTruthy();
      expect(ans.elements[4] == 1457).toBeTruthy();
      expect(ans.elements[5] == 2701).toBeTruthy();
      expect(ans.elements[6] == 520).toBeTruthy();
      expect(ans.elements[7] == 1569).toBeTruthy();
      expect(ans.elements[8] == 2925).toBeTruthy();
    });

    test('multiplyScalar', () => {
      const b = new Matrix3().set(0, 1, 2, 3, 4, 5, 6, 7, 8);
      expect(b.elements[0] == 0).toBeTruthy();
      expect(b.elements[1] == 3).toBeTruthy();
      expect(b.elements[2] == 6).toBeTruthy();
      expect(b.elements[3] == 1).toBeTruthy();
      expect(b.elements[4] == 4).toBeTruthy();
      expect(b.elements[5] == 7).toBeTruthy();
      expect(b.elements[6] == 2).toBeTruthy();
      expect(b.elements[7] == 5).toBeTruthy();
      expect(b.elements[8] == 8).toBeTruthy();

      b.multiplyScalar(2);

      expect(b.elements[0] == 0 * 2).toBeTruthy();
      expect(b.elements[1] == 3 * 2).toBeTruthy();
      expect(b.elements[2] == 6 * 2).toBeTruthy();
      expect(b.elements[3] == 1 * 2).toBeTruthy();
      expect(b.elements[4] == 4 * 2).toBeTruthy();
      expect(b.elements[5] == 7 * 2).toBeTruthy();
      expect(b.elements[6] == 2 * 2).toBeTruthy();
      expect(b.elements[7] == 5 * 2).toBeTruthy();
      expect(b.elements[8] == 8 * 2).toBeTruthy();
    });

    test('determinant', () => {
      const a = new Matrix3();
      expect(a.determinant() == 1).toBeTruthy();

      a.elements[0] = 2;
      expect(a.determinant() == 2).toBeTruthy();

      a.elements[0] = 0;
      expect(a.determinant() == 0).toBeTruthy();

      // calculated via http://www.euclideanspace.com/maths/algebra/matrix/functions/determinant/threeD/index.htm
      a.set(2, 3, 4, 5, 13, 7, 8, 9, 11);
      expect(a.determinant() == -73).toBeTruthy();
    });

    test('invert', () => {
      const zero = new Matrix3().set(0, 0, 0, 0, 0, 0, 0, 0, 0);
      const identity4 = new Matrix4();
      const a = new Matrix3().set(0, 0, 0, 0, 0, 0, 0, 0, 0);
      const b = new Matrix3();

      b.copy(a).invert();
      expect(matrixEquals3(b, zero)).toBeTruthy();

      const testMatrices = [
        new Matrix4().makeRotationX(0.3),
        new Matrix4().makeRotationX(-0.3),
        new Matrix4().makeRotationY(0.3),
        new Matrix4().makeRotationY(-0.3),
        new Matrix4().makeRotationZ(0.3),
        new Matrix4().makeRotationZ(-0.3),
        new Matrix4().makeScale(1, 2, 3),
        new Matrix4().makeScale(1 / 8, 1 / 2, 1 / 3),
      ];

      for (let i = 0, il = testMatrices.length; i < il; i++) {
        const m = testMatrices[i];

        a.setFromMatrix4(m);
        const mInverse3 = b.copy(a).invert();

        const mInverse = toMatrix4(mInverse3);

        // the determinant of the inverse should be the reciprocal
        expect(Math.abs(a.determinant() * mInverse3.determinant() - 1) < 0.0001).toBeTruthy();
        expect(Math.abs(m.determinant() * mInverse.determinant() - 1) < 0.0001).toBeTruthy();

        const mProduct = new Matrix4().multiplyMatrices(m, mInverse);
        expect(Math.abs(mProduct.determinant() - 1) < 0.0001).toBeTruthy();
        expect(matrixEquals3(mProduct, identity4)).toBeTruthy();
      }
    });

    test('transpose', () => {
      const a = new Matrix3();
      let b = a.clone().transpose();
      expect(matrixEquals3(a, b)).toBeTruthy();

      b = new Matrix3().set(0, 1, 2, 3, 4, 5, 6, 7, 8);
      const c = b.clone().transpose();
      expect(!matrixEquals3(b, c)).toBeTruthy();

      c.transpose();

      expect(matrixEquals3(b, c)).toBeTruthy();
    });

    test('getNormalMatrix', () => {
      const a = new Matrix3();

      // prettier-ignore
      const b = new Matrix4().set(
				2, 3, 5, 7,
				11, 13, 17, 19,
				23, 29, 31, 37,
				41, 43, 47, 57
			);

      // prettier-ignore
      const expected = new Matrix3().set(
				- 1.2857142857142856, 0.7142857142857143, 0.2857142857142857,
				0.7428571428571429, - 0.7571428571428571, 0.15714285714285714,
				- 0.19999999999999998, 0.3, - 0.09999999999999999
			);

      a.getNormalMatrix(b);

      expect(matrixEquals3(a, expected)).toBeTruthy();
    });

    test('transposeIntoArray', () => {
      const a = new Matrix3().set(0, 1, 2, 3, 4, 5, 6, 7, 8);
      const b = [];

      a.transposeIntoArray(b);

      expect(b[0] == 0).toBeTruthy();
      expect(b[1] == 1).toBeTruthy();
      expect(b[2] == 2).toBeTruthy();
      expect(b[3] == 3).toBeTruthy();
      expect(b[4] == 4).toBeTruthy();
      expect(b[5] == 5).toBeTruthy();
      expect(b[5] == 5).toBeTruthy();
      expect(b[6] == 6).toBeTruthy();
      expect(b[7] == 7).toBeTruthy();
      expect(b[8] == 8).toBeTruthy();
    });

    test('setUvTransform', () => {
      // prettier-ignore
      const a = new Matrix3().set(
				0.1767766952966369, 0.17677669529663687, 0.32322330470336313,
				- 0.17677669529663687, 0.1767766952966369, 0.5,
				0, 0, 1
			);

      const b = new Matrix3();

      // prettier-ignore
      const params = {
				centerX: 0.5,
				centerY: 0.5,
				offsetX: 0,
				offsetY: 0,
				repeatX: 0.25,
				repeatY: 0.25,
				rotation: 0.7753981633974483
			};

      // prettier-ignore
      const expected = new Matrix3().set(
				0.1785355940258599, 0.17500011904519763, 0.32323214346447127,
				- 0.17500011904519763, 0.1785355940258599, 0.4982322625096689,
				0, 0, 1
			);

      // prettier-ignore
      a.setUvTransform(
				params.offsetX, params.offsetY,
				params.repeatX, params.repeatY,
				params.rotation,
				params.centerX, params.centerY
			);

      b.identity()
        .translate(-params.centerX, -params.centerY)
        .rotate(params.rotation)
        .scale(params.repeatX, params.repeatY)
        .translate(params.centerX, params.centerY)
        .translate(params.offsetX, params.offsetY);

      expect(matrixEquals3(a, expected)).toBeTruthy();
      expect(matrixEquals3(b, expected)).toBeTruthy();
    });

    test('scale', () => {
      const a = new Matrix3().set(1, 2, 3, 4, 5, 6, 7, 8, 9);

      // prettier-ignore
      const expected = new Matrix3().set(
				0.25, 0.5, 0.75,
				1, 1.25, 1.5,
				7, 8, 9
			);

      a.scale(0.25, 0.25);

      expect(matrixEquals3(a, expected)).toBeTruthy();
    });

    test('rotate', () => {
      const a = new Matrix3().set(1, 2, 3, 4, 5, 6, 7, 8, 9);

      // prettier-ignore
      const expected = new Matrix3().set(
				3.5355339059327373, 4.949747468305833, 6.363961030678928,
				2.121320343559643, 2.121320343559643, 2.1213203435596433,
				7, 8, 9
			);

      a.rotate(Math.PI / 4);

      expect(matrixEquals3(a, expected)).toBeTruthy();
    });

    test('translate', () => {
      const a = new Matrix3().set(1, 2, 3, 4, 5, 6, 7, 8, 9);
      const expected = new Matrix3().set(22, 26, 30, 53, 61, 69, 7, 8, 9);

      a.translate(3, 7);

      expect(matrixEquals3(a, expected)).toBeTruthy();
    });

    test.todo('makeTranslation', () => {
      // makeTranslation( x, y )
      // implement
    });

    test.todo('makeRotation', () => {
      // makeRotation( theta ) // counterclockwise
      // implement
    });

    test.todo('makeScale', () => {
      // makeScale( x, y )
      // implement
    });

    test('equals', () => {
      const a = new Matrix3().set(0, 1, 2, 3, 4, 5, 6, 7, 8);
      const b = new Matrix3().set(0, -1, 2, 3, 4, 5, 6, 7, 8);

      expect(a.equals(b)).toBeFalsy();
      expect(b.equals(a)).toBeFalsy();

      a.copy(b);
      expect(a.equals(b)).toBeTruthy();
      expect(b.equals(a)).toBeTruthy();
    });

    test('fromArray', () => {
      let b = new Matrix3();
      b.fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8]);

      expect(b.elements[0] == 0).toBeTruthy();
      expect(b.elements[1] == 1).toBeTruthy();
      expect(b.elements[2] == 2).toBeTruthy();
      expect(b.elements[3] == 3).toBeTruthy();
      expect(b.elements[4] == 4).toBeTruthy();
      expect(b.elements[5] == 5).toBeTruthy();
      expect(b.elements[6] == 6).toBeTruthy();
      expect(b.elements[7] == 7).toBeTruthy();
      expect(b.elements[8] == 8).toBeTruthy();

      b = new Matrix3();
      b.fromArray([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], 10);

      expect(b.elements[0] == 10).toBeTruthy();
      expect(b.elements[1] == 11).toBeTruthy();
      expect(b.elements[2] == 12).toBeTruthy();
      expect(b.elements[3] == 13).toBeTruthy();
      expect(b.elements[4] == 14).toBeTruthy();
      expect(b.elements[5] == 15).toBeTruthy();
      expect(b.elements[6] == 16).toBeTruthy();
      expect(b.elements[7] == 17).toBeTruthy();
      expect(b.elements[8] == 18).toBeTruthy();
    });

    test('toArray', () => {
      const a = new Matrix3().set(1, 2, 3, 4, 5, 6, 7, 8, 9);
      const noOffset = [1, 4, 7, 2, 5, 8, 3, 6, 9];
      const withOffset = [undefined, 1, 4, 7, 2, 5, 8, 3, 6, 9];

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
