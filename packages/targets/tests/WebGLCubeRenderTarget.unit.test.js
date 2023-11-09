import { describe, expect, it, test, vi } from 'vitest';

import { WebGLCoordinateSystem } from '@renderlayer/shared';
import { CubeTexture, Texture } from '@renderlayer/textures';

import { WebGLCubeRenderTarget } from '../src/WebGLCubeRenderTarget.js';
import { WebGLRenderTarget } from '../src/WebGLRenderTarget.js';

describe('Targets', () => {
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

    test('texture', () => {
      const object = new WebGLCubeRenderTarget();
      expect(object.texture).toBeInstanceOf(CubeTexture);
      expect(object.texture.isRenderTargetTexture).toBeTruthy();
      expect(object.texture.flipY).toBe(false);
      expect(object.texture.images).toBeInstanceOf(Array);
      expect(object.texture.images.length).toBe(6);
    });

    test('fromEquirectangularTexture', () => {
      const object = new WebGLCubeRenderTarget();
      const texture = new Texture();
      const renderer = {
        coordinateSystem: WebGLCoordinateSystem,
        getActiveCubeFace: vi.fn(),
        getActiveMipmapLevel: vi.fn(),
        getRenderTarget: vi.fn(),
        setRenderTarget: vi.fn(),
        render: vi.fn()
      };

      object.fromEquirectangularTexture(renderer, texture);

      expect(renderer.render).toHaveBeenCalledTimes(6);
    });

    test('clear', () => {
      // prettier-ignore
      const color = {}, depth = {}, stencil = {};
      const object = new WebGLCubeRenderTarget();
      const renderer = {
        getRenderTarget: vi.fn(),
        setRenderTarget: vi.fn(),
        clear: vi.fn()
      };

      object.clear(renderer, color, depth, stencil);

      expect(renderer.clear).toHaveBeenCalledWith(color, depth, stencil);
    });
  });
});
