import { describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { Matrix4, Vector3 } from '@renderlayer/math';
import { WebGLCoordinateSystem } from '@renderlayer/shared';

import { Camera } from '../src/Camera.js';

describe('Cameras', () => {
  describe('Camera', () => {
    test('constructor', () => {
      const object = new Camera();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Camera();
      expect(object).toBeInstanceOf(Object3D);
    });

    test('isCamera', () => {
      const object = new Camera();
      expect(object.isCamera).toBeTruthy();
    });

    test('type', () => {
      const object = new Camera();
      expect(object.type).toBe('Camera');
    });

    test('matrixWorldInverse', () => {
      const object = new Camera();
      expect(object.matrixWorldInverse).toBeInstanceOf(Matrix4);
    });

    test('projectionMatrix', () => {
      const object = new Camera();
      expect(object.projectionMatrix).toBeInstanceOf(Matrix4);
    });

    test('projectionMatrixInverse', () => {
      const object = new Camera();
      expect(object.projectionMatrixInverse).toBeInstanceOf(Matrix4);
    });

    test('coordinateSystem', () => {
      const object = new Camera();
      expect(object.coordinateSystem).toBe(WebGLCoordinateSystem);
    });

    test('copy', () => {
      const object = new Camera();
      const clonedObject = new Camera().copy(object, true);

      // will be different
      clonedObject.uuid = object.uuid;

      expect(clonedObject).not.toBe(object);
      expect(clonedObject).toStrictEqual(object);
    });

    test('getWorldDirection', () => {
      const cam = new Camera();
      cam.lookAt(new Vector3(1, 1, 1));

      const target = new Vector3();
      const direction = cam.getWorldDirection(target);

      // it provides direction two ways, return and target
      expect(direction.equals(target)).toBeTruthy();
    });

    test('updateMatrixWorld', () => {
      const cam = new Camera();
      cam.updateMatrixWorld(false);

      // EP: asserts required
    });

    test('updateWorldMatrix', () => {
      const cam = new Camera();
      cam.updateWorldMatrix(true, false);

      // EP: asserts required
    });

    test('clone', () => {
      const cam = new Camera();

      // fill the matrices with any nonsense values just to see if they get copied
      cam.matrixWorldInverse.set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
      cam.projectionMatrix.set(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);

      const clonedCam = cam.clone();

      expect(cam.matrixWorldInverse.equals(clonedCam.matrixWorldInverse)).toBeTruthy();
      expect(cam.projectionMatrix.equals(clonedCam.projectionMatrix)).toBeTruthy();
    });

    // inherited from Object3D
    test('lookAt', () => {
      const cam = new Camera();
      cam.lookAt(new Vector3(0, 1, -1));

      expect(cam.rotation.x * (180 / Math.PI)).toBeCloseTo(45);
    });

    // inherited from Object3D
    test('layers', () => {
      const cam = new Camera();
      expect(cam.layers).toBeDefined();

      // Objects must share at least one layer with the camera to be seen
      // when the camera's viewpoint is rendered.
    });
  });
});
