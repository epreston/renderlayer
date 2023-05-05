import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Vector3 } from '@renderlayer/math';
import { Object3D } from '@renderlayer/core';

import { Camera } from '../src/Camera.js';

describe('Cameras', () => {
  describe('Camera', () => {
    test('Instancing', () => {
      const object = new Camera();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new Camera();
      expect(object).toBeInstanceOf(Object3D);
    });

    test('type', () => {
      const object = new Camera();
      expect(object.type === 'Camera').toBeTruthy();
    });

    test.todo('matrixWorldInverse', () => {
      // implement
    });

    test.todo('projectionMatrix', () => {
      // implement
    });

    test.todo('projectionMatrixInverse', () => {
      // implement
    });

    test('isCamera', () => {
      const object = new Camera();
      expect(object.isCamera).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });

    test.todo('getWorldDirection', () => {
      // implement
    });

    test.todo('updateMatrixWorld', () => {
      // implement
    });

    test.todo('updateWorldMatrix', () => {
      // implement
    });

    test('clone', () => {
      const cam = new Camera();

      // fill the matrices with any nonsense values just to see if they get copied
      cam.matrixWorldInverse.set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
      cam.projectionMatrix.set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

      const clonedCam = cam.clone();

      // TODO: do not rely equality on object methods
      // TODO: What's append if matrix.equal is wrongly implemented
      // TODO: this MUST be check by assert
      expect(cam.matrixWorldInverse.equals(clonedCam.matrixWorldInverse)).toBeTruthy();
      expect(cam.projectionMatrix.equals(clonedCam.projectionMatrix)).toBeTruthy();
    });

    // TODO: this should not be here, Object3D related
    test('lookAt', () => {
      const cam = new Camera();
      cam.lookAt(new Vector3(0, 1, -1));

      expect(cam.rotation.x * (180 / Math.PI)).toBeCloseTo(45);
    });
  });
});
