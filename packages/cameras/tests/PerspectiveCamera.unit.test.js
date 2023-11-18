import { describe, expect, it, test, vi } from 'vitest';

import { ObjectLoader } from '@renderlayer/loaders';
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

    test('copy', () => {
      // prettier-ignore
      const near = 1, far = 3, aspect = 16 / 9, fov = 90;
      const object = new PerspectiveCamera(fov, aspect, near, far);
      const clonedObject = new PerspectiveCamera().copy(object, true);

      // will be different
      clonedObject.uuid = object.uuid;

      expect(clonedObject).not.toBe(object);
      expect(clonedObject).toStrictEqual(object);
    });

    test('setFocalLength', () => {
      // prettier-ignore
      const near = 1, far = 3, aspect = 16 / 9, fov = 90;
      const cam = new PerspectiveCamera(fov, aspect, near, far);

      cam.setFocalLength(50);
      expect(cam.projectionMatrix).toMatchObject({
        elements: [
          2.857142857142857, 0, 0, 0, 0, 5.079365079365079, 0, 0, 0, 0, -2, -1, 0, 0, -3, 0
        ]
      });

      cam.setFocalLength(40);
      expect(cam.projectionMatrix).toMatchObject({
        elements: [
          2.2857142857142856, 0, 0, 0, 0, 4.063492063492063, 0, 0, 0, 0, -2, -1, 0, 0, -3, 0
        ]
      });
    });

    test('getFocalLength', () => {
      // prettier-ignore
      const near = 1, far = 3, aspect = 16 / 9, fov = 60;
      const cam = new PerspectiveCamera(fov, aspect, near, far);

      expect(cam.getFocalLength()).toBeCloseTo(17.0498);
    });

    test('getEffectiveFOV', () => {
      // prettier-ignore
      const near = 1, far = 3, aspect = 16 / 9, fov = 60;
      const cam = new PerspectiveCamera(fov, aspect, near, far);

      expect(cam.getEffectiveFOV()).toBeCloseTo(59.9999);

      cam.setFocalLength(50);

      expect(cam.getEffectiveFOV()).toBeCloseTo(22.2753);
    });

    test('getFilmWidth', () => {
      // prettier-ignore
      const near = 1, far = 3, aspect = 16 / 9, fov = 90;
      const cam = new PerspectiveCamera(fov, aspect, near, far);

      expect(cam.getFilmWidth()).toBeCloseTo(35);
    });

    test('getFilmHeight', () => {
      // prettier-ignore
      const near = 1, far = 3, aspect = 16 / 9, fov = 90;
      const cam = new PerspectiveCamera(fov, aspect, near, far);

      expect(cam.getFilmHeight()).toBeCloseTo(19.6875);
    });

    test('setViewOffset', () => {
      // prettier-ignore
      const near = 1, far = 3, aspect = 16 / 9, fov = 90;
      const cam = new PerspectiveCamera(fov, aspect, near, far);

      const w = 1920;
      const h = 1080;
      const fullWidth = w * 3;
      const fullHeight = h * 2;

      /*
       * In grid of 3x2 displays:
       *
       *   +---+---+---+
       *   | A | B | C |
       *   +---+---+---+
       *   | D | E | F |
       *   +---+---+---+
       *
       */

      // set camera to render monitor A
      cam.setViewOffset(fullWidth, fullHeight, w * 0, h * 0, w, h);

      expect(cam.projectionMatrix).toMatchObject({
        elements: [
          1.1250000000000004, 0, 0, 0, 0, 2.0000000000000004, 0, 0, -2.0000000000000004, 1, -2, -1,
          0, 0, -3, 0
        ]
      });
    });

    test('clearViewOffset', () => {
      // prettier-ignore
      const near = 1, far = 3, aspect = 16 / 9, fov = 90;
      const cam = new PerspectiveCamera(fov, aspect, near, far);

      const w = 1920;
      const h = 1080;
      const fullWidth = w * 3;
      const fullHeight = h * 2;

      // set camera to render monitor A
      cam.setViewOffset(fullWidth, fullHeight, w * 0, h * 0, w, h);

      expect(cam.projectionMatrix).toMatchObject({
        elements: [
          1.1250000000000004, 0, 0, 0, 0, 2.0000000000000004, 0, 0, -2.0000000000000004, 1, -2, -1,
          0, 0, -3, 0
        ]
      });

      cam.clearViewOffset();

      expect(cam.projectionMatrix).toMatchObject({
        elements: [
          0.3750000000000001, 0, 0, 0, 0, 1.0000000000000002, 0, 0, 0, 0, -2, -1, 0, 0, -3, 0
        ]
      });
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

    test('toJSON', () => {
      const object = new PerspectiveCamera();

      // will be different
      object.uuid = '934b9669-a7d5-4214-b723-dea6b4b3e068';

      expect(object).toMatchSnapshot();
    });

    test('clone', () => {
      // prettier-ignore
      const near = 1, far = 3, aspect = 16 / 9, fov = 90;
      const cam = new PerspectiveCamera(fov, aspect, near, far);

      const clonedCam = cam.clone();

      expect(cam.fov).toBe(clonedCam.fov);
      expect(cam.aspect).toBe(clonedCam.aspect);
      expect(cam.near).toBe(clonedCam.near);
      expect(cam.far).toBe(clonedCam.far);
      expect(cam.zoom).toBe(clonedCam.zoom);
      expect(cam.projectionMatrix.equals(clonedCam.projectionMatrix)).toBeTruthy();
    });

    test('from ObjectLoader', () => {
      // prettier-ignore
      const near = 1, far = 3, aspect = 16 / 9, fov = 90;
      const object = new PerspectiveCamera(fov, aspect, near, far);

      const json = object.toJSON();
      const loader = new ObjectLoader();
      const outputObject = loader.parse(json);

      expect(outputObject).toStrictEqual(object);
    });
  });
});
