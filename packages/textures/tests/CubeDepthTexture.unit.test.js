import { describe, expect, it, test, vi } from 'vitest';

import { DepthTexture } from '../src/DepthTexture.js';
import { CubeDepthTexture } from '../src/CubeDepthTexture.js';

describe('Textures', () => {
  describe('CubeDepthTexture', () => {
    test('constructor', () => {
      const object = new CubeDepthTexture(1);
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new CubeDepthTexture(1);
      expect(object).toBeInstanceOf(DepthTexture);
    });

    test('isCubeDepthTexture', () => {
      const object = new CubeDepthTexture(1);
      expect(object.isCubeDepthTexture).toBeTruthy();
    });

    test('isCubeTexture', () => {
      const object = new CubeDepthTexture(1);
      expect(object.isCubeTexture).toBeTruthy();
    });

    test('image', () => {
      const object = new CubeDepthTexture(1);
      expect(object.image).toBeDefined();
    });

    test('images', () => {
      const object = new CubeDepthTexture(1);
      expect(object.images).toBeDefined();
    });
  });
});
