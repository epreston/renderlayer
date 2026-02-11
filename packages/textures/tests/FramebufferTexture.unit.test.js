import { describe, expect, it, test, vi } from 'vitest';
import { NearestFilter } from '@renderlayer/shared';

import { Texture } from '../src/Texture.js';
import { FramebufferTexture } from '../src/FramebufferTexture.js';

describe('Textures', () => {
  describe('FramebufferTexture', () => {
    test('constructor', () => {
      const object = new FramebufferTexture();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new FramebufferTexture();
      expect(object).toBeInstanceOf(Texture);
    });

    test('isFramebufferTexture', () => {
      const object = new FramebufferTexture();
      expect(object.isFramebufferTexture).toBeTruthy();
    });

    test('magFilter', () => {
      const object = new FramebufferTexture();
      expect(object.magFilter).toBe(NearestFilter);
    });

    test('minFilter', () => {
      const object = new FramebufferTexture();
      expect(object.minFilter).toBe(NearestFilter);
    });

    test('generateMipmaps', () => {
      const object = new FramebufferTexture();
      expect(object.generateMipmaps).toBe(false);
    });
  });
});
