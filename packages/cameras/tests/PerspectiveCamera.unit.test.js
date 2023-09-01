import { describe, expect, it, test, vi } from 'vitest';

import { Matrix4 } from '@renderlayer/math';

import { Camera } from '../src/Camera.js';
import { PerspectiveCamera } from '../src/PerspectiveCamera.js';

// see e.g. math/Matrix4.js
const matrixEquals4 = function (a, b, tolerance) {
  tolerance = tolerance || 0.0001;
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
};

describe('Cameras', () => {
  describe('PerspectiveCamera', () => {
    test('constructor', () => {
      const object = new PerspectiveCamera();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new PerspectiveCamera();
      expect(object).toBeInstanceOf(Camera);
    });

    test('isPerspectiveCamera', () => {
      const object = new PerspectiveCamera();
      expect(object.isPerspectiveCamera).toBeTruthy();
    });

    test('type', () => {
      const object = new PerspectiveCamera();
      expect(object.type).toBe('PerspectiveCamera');
    });

    test('fov', () => {
      const object = new PerspectiveCamera();
      expect(object.fov).toBe(50);
    });

    test('zoom', () => {
      const object = new PerspectiveCamera();
      expect(object.zoom).toBe(1);
    });

    test('near', () => {
      const object = new PerspectiveCamera();
      expect(object.near).toBe(0.1);
    });

    test('far', () => {
      const object = new PerspectiveCamera();
      expect(object.far).toBe(2000);
    });

    test('focus', () => {
      const object = new PerspectiveCamera();
      expect(object.focus).toBe(10);
    });

    test('aspect', () => {
      const object = new PerspectiveCamera();
      expect(object.aspect).toBe(1);
    });

    test('view', () => {
      const object = new PerspectiveCamera();
      expect(object.view).toBeNull();
    });

    test('filmGauge', () => {
      const object = new PerspectiveCamera();
      expect(object.filmGauge).toBe(35);
    });

    test('filmOffset', () => {
      const object = new PerspectiveCamera();
      expect(object.filmOffset).toBe(0);
    });

    test.todo('copy', () => {
      // implement
    });

    test.todo('setFocalLength', () => {
      // implement
    });

    test.todo('getFocalLength', () => {
      // implement
    });

    test.todo('getEffectiveFOV', () => {
      // implement
    });

    test.todo('getFilmWidth', () => {
      // implement
    });

    test.todo('getFilmHeight', () => {
      // implement
    });

    test.todo('setViewOffset', () => {
      // implement
    });

    test.todo('clearViewOffset', () => {
      // implement
    });

    test('updateProjectionMatrix', () => {
      const cam = new PerspectiveCamera(75, 16 / 9, 0.1, 300.0);

      // updateProjectionMatrix is called in constructor
      const m = cam.projectionMatrix;

      // perspective projection is given my the 4x4 Matrix
      // 2n/r-l		0			l+r/r-l				 0
      //   0		2n/t-b	t+b/t-b				 0
      //   0			0		-(f+n/f-n)	-(2fn/f-n)
      //   0			0				-1					 0

      // this matrix was calculated by hand via glMatrix.perspective(75, 16 / 9, 0.1, 300.0, pMatrix)
      // to get a reference matrix from plain WebGL

      // prettier-ignore
      const reference = new Matrix4().set(
				0.7330642938613892, 0, 0, 0,
				0, 1.3032253980636597, 0, 0,
				0, 0, - 1.000666856765747, - 0.2000666856765747,
				0, 0, - 1, 0
			);

      // expect( reference.equals(m) );
      expect(matrixEquals4(reference, m, 0.000001)).toBeTruthy();
    });

    test.todo('toJSON', () => {
      // implement
    });

    // TODO: clone is a camera methods that relied to copy method
    test('clone', () => {
      const near = 1,
        far = 3,
        aspect = 16 / 9,
        fov = 90;

      const cam = new PerspectiveCamera(fov, aspect, near, far);

      const clonedCam = cam.clone();

      expect(cam.fov === clonedCam.fov).toBeTruthy();
      expect(cam.aspect === clonedCam.aspect).toBeTruthy();
      expect(cam.near === clonedCam.near).toBeTruthy();
      expect(cam.far === clonedCam.far).toBeTruthy();
      expect(cam.zoom === clonedCam.zoom).toBeTruthy();
      expect(cam.projectionMatrix.equals(clonedCam.projectionMatrix)).toBeTruthy();
    });
  });
});
