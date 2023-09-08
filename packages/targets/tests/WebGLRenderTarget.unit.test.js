import { describe, expect, it, test, vi } from 'vitest';

import { RenderTarget } from '../src/RenderTarget.js';
import { WebGLRenderTarget } from '../src/WebGLRenderTarget.js';

describe('Targets', () => {
  describe('WebGLRenderTarget', () => {
    test('constructor', () => {
      const object = new WebGLRenderTarget();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new WebGLRenderTarget();
      expect(object).toBeInstanceOf(RenderTarget);
    });

    test('isWebGLRenderTarget', () => {
      const object = new WebGLRenderTarget();
      expect(object.isWebGLRenderTarget).toBeTruthy();
    });
  });
});
