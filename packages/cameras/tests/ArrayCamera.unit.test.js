import { describe, expect, it, test, vi } from 'vitest';

import { PerspectiveCamera } from '../src/PerspectiveCamera.js';
import { ArrayCamera } from '../src/ArrayCamera.js';

describe('Cameras', () => {
  describe('ArrayCamera', () => {
    test('constructor', () => {
      const object = new ArrayCamera();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new ArrayCamera();
      expect(object).toBeInstanceOf(PerspectiveCamera);
    });

    test('cameras', () => {
      const object = new ArrayCamera();
      expect(object.cameras).toBeInstanceOf(Array);
    });

    test('isArrayCamera', () => {
      const object = new ArrayCamera();
      expect(object.isArrayCamera).toBeTruthy();
    });

    test('isMultiViewCamera', () => {
      const object = new ArrayCamera();
      expect(object.isMultiViewCamera).toBeFalsy();
    });
  });
});
