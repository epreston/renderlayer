import { describe, expect, it, test, vi } from 'vitest';

import { WebGLRenderTarget } from '../src/WebGLRenderTarget.js';
import { WebGLCubeRenderTarget } from '../src/WebGLCubeRenderTarget.js';

describe('Renderers', () => {
  describe('WebGLCubeRenderTarget', () => {
    test('constructor', () => {
      const object = new WebGLCubeRenderTarget();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new WebGLCubeRenderTarget();
      expect(object).toBeInstanceOf(WebGLRenderTarget);
    });

    test('isWebGLCubeRenderTarget', () => {
      const object = new WebGLCubeRenderTarget();
      expect(object.isWebGLCubeRenderTarget).toBeTruthy();
    });

    test.todo('texture', () => {
      // doc update needed, this needs to be a CubeTexture unlike parent class
      // implement
    });

    test.todo('fromEquirectangularTexture', () => {
      // implement
    });

    test.todo('clear', () => {
      // implement
      // see CubeCamera
    });
  });
});
