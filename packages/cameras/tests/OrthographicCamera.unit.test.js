import { describe, expect, it, test, vi } from 'vitest';

import { Camera } from '../src/Camera.js';
import { OrthographicCamera } from '../src/OrthographicCamera.js';

describe('Cameras', () => {
  describe('OrthographicCamera', () => {
    test('constructor', () => {
      const object = new OrthographicCamera();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new OrthographicCamera();
      expect(object).toBeInstanceOf(Camera);
    });

    test('isOrthographicCamera', () => {
      const object = new OrthographicCamera();
      expect(object.isOrthographicCamera).toBeTruthy();
    });

    test('type', () => {
      const object = new OrthographicCamera();
      expect(object.type).toBe('OrthographicCamera');
    });

    test('zoom', () => {
      const object = new OrthographicCamera();
      expect(object.zoom).toBe(1.0);
    });

    test('view', () => {
      const object = new OrthographicCamera();
      expect(object.view).toBeNull();
    });

    test('left', () => {
      const object = new OrthographicCamera();
      expect(object.left).toBe(-1);
    });

    test('right', () => {
      const object = new OrthographicCamera();
      expect(object.right).toBe(1);
    });

    test('top', () => {
      const object = new OrthographicCamera();
      expect(object.top).toBe(1);
    });

    test('bottom', () => {
      const object = new OrthographicCamera();
      expect(object.bottom).toBe(-1);
    });

    test('near', () => {
      const object = new OrthographicCamera();
      expect(object.near).toBe(0.1);
    });

    test('far', () => {
      const object = new OrthographicCamera();
      expect(object.far).toBe(2000);
    });

    test.todo('copy', () => {
      // implement
    });

    test('setViewOffset', () => {
      // prettier-ignore
      const left = -1.5, right = 1.5, top = 1, bottom = -1, near = 0.1, far = 42;
      const cam = new OrthographicCamera(left, right, top, bottom, near, far);

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
          2, 0, 0, 0, 0, 2, 0, 0, 0, 0, -0.0477326968973747, 0, 2, -1, -1.0047732696897376, 1
        ]
      });
    });

    test('clearViewOffset', () => {
      // prettier-ignore
      const left = -1.5, right = 1.5, top = 1, bottom = -1, near = 0.1, far = 42;
      const cam = new OrthographicCamera(left, right, top, bottom, near, far);

      const w = 1920;
      const h = 1080;
      const fullWidth = w * 3;
      const fullHeight = h * 2;

      // set camera to render monitor A
      cam.setViewOffset(fullWidth, fullHeight, w * 0, h * 0, w, h);

      expect(cam.projectionMatrix).toMatchObject({
        elements: [
          2, 0, 0, 0, 0, 2, 0, 0, 0, 0, -0.0477326968973747, 0, 2, -1, -1.0047732696897376, 1
        ]
      });

      cam.clearViewOffset();

      expect(cam.projectionMatrix).toMatchObject({
        elements: [
          0.6666666666666666, 0, 0, 0, 0, 1, 0, 0, 0, 0, -0.0477326968973747, 0, -0, -0,
          -1.0047732696897376, 1
        ]
      });
    });

    test('updateProjectionMatrix', () => {
      // prettier-ignore
      const left = -1, right = 1, top = 1, bottom = -1, near = 1, far = 3;
      const cam = new OrthographicCamera(left, right, top, bottom, near, far);

      // updateProjectionMatrix is called in constructor
      const pMatrix = cam.projectionMatrix.elements;

      // orthographic projection is given my the 4x4 Matrix
      // 2/r-l		0			 0		-(l+r/r-l)
      //   0		2/t-b		 0		-(t+b/t-b)
      //   0			0		-2/f-n	-(f+n/f-n)
      //   0			0			 0				1

      expect(pMatrix[0]).toBe(2 / (right - left)); // m[0,0] === 2 / (r - l)
      expect(pMatrix[5]).toBe(2 / (top - bottom)); // m[1,1] === 2 / (t - b)
      expect(pMatrix[10]).toBe(-2 / (far - near)); // m[2,2] === -2 / (f - n)
      expect(pMatrix[12]).toBe(-((right + left) / (right - left))); // m[3,0] === -(r+l/r-l)
      expect(pMatrix[13]).toBe(-((top + bottom) / (top - bottom))); // m[3,1] === -(t+b/b-t)
      expect(pMatrix[14]).toBe(-((far + near) / (far - near))); // m[3,2] === -(f+n/f-n)
    });

    test('toJSON', () => {
      // prettier-ignore
      const left = -1.5, right = 1.5, top = 1, bottom = -1, near = 0.1, far = 42;
      const cam = new OrthographicCamera(left, right, top, bottom, near, far);
      cam.uuid = 'b67e5706-a8aa-410b-b306-e71461b67e2f';

      expect(cam).toMatchSnapshot();
    });

    // TODO: clone is a camera methods that relied to copy method
    test('clone', () => {
      // prettier-ignore
      const left = -1.5, right = 1.5, top = 1, bottom = -1, near = 0.1, far = 42;
      const cam = new OrthographicCamera(left, right, top, bottom, near, far);

      const clonedCam = cam.clone();
      expect(cam).not.toBe(clonedCam);

      expect(cam.left).toBe(clonedCam.left);
      expect(cam.right).toBe(clonedCam.right);
      expect(cam.top).toBe(clonedCam.top);
      expect(cam.bottom).toBe(clonedCam.bottom);
      expect(cam.near).toBe(clonedCam.near);
      expect(cam.far).toBe(clonedCam.far);
      expect(cam.zoom).toBe(clonedCam.zoom);
    });
  });
});
