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

    test.todo('view', () => {
      // implement
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

    test.todo('setViewOffset', () => {
      // implement
    });

    test.todo('clearViewOffset', () => {
      // implement
    });

    test('updateProjectionMatrix', () => {
      const left = -1,
        right = 1,
        top = 1,
        bottom = -1,
        near = 1,
        far = 3;
      const cam = new OrthographicCamera(left, right, top, bottom, near, far);

      // updateProjectionMatrix is called in constructor
      const pMatrix = cam.projectionMatrix.elements;

      // orthographic projection is given my the 4x4 Matrix
      // 2/r-l		0			 0		-(l+r/r-l)
      //   0		2/t-b		 0		-(t+b/t-b)
      //   0			0		-2/f-n	-(f+n/f-n)
      //   0			0			 0				1

      expect(pMatrix[0] === 2 / (right - left)).toBeTruthy(); // m[0,0] === 2 / (r - l)
      expect(pMatrix[5] === 2 / (top - bottom)).toBeTruthy(); // m[1,1] === 2 / (t - b)
      expect(pMatrix[10] === -2 / (far - near)).toBeTruthy(); // m[2,2] === -2 / (f - n)
      expect(pMatrix[12] === -((right + left) / (right - left))).toBeTruthy(); // m[3,0] === -(r+l/r-l)
      expect(pMatrix[13] === -((top + bottom) / (top - bottom))).toBeTruthy(); // m[3,1] === -(t+b/b-t)
      expect(pMatrix[14] === -((far + near) / (far - near))).toBeTruthy(); // m[3,2] === -(f+n/f-n)
    });

    test('toJSON', () => {
      const left = -1.5,
        right = 1.5,
        top = 1,
        bottom = -1,
        near = 0.1,
        far = 42;
      const cam = new OrthographicCamera(left, right, top, bottom, near, far);
      cam.uuid = 'b67e5706-a8aa-410b-b306-e71461b67e2f';

      expect(cam).toMatchSnapshot();
    });

    // TODO: clone is a camera methods that relied to copy method
    test('clone', () => {
      const left = -1.5,
        right = 1.5,
        top = 1,
        bottom = -1,
        near = 0.1,
        far = 42;
      const cam = new OrthographicCamera(left, right, top, bottom, near, far);

      const clonedCam = cam.clone();
      expect(cam).not.toBe(clonedCam);

      expect(cam.left === clonedCam.left).toBeTruthy();
      expect(cam.right === clonedCam.right).toBeTruthy();
      expect(cam.top === clonedCam.top).toBeTruthy();
      expect(cam.bottom === clonedCam.bottom).toBeTruthy();
      expect(cam.near === clonedCam.near).toBeTruthy();
      expect(cam.far === clonedCam.far).toBeTruthy();
      expect(cam.zoom === clonedCam.zoom).toBeTruthy();
    });
  });
});
