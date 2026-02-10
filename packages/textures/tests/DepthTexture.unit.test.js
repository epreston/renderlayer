import { describe, expect, it, test, vi } from 'vitest';

import { Texture } from '../src/Texture.js';
import { DepthTexture } from '../src/DepthTexture.js';

describe('Textures', () => {
  describe('DepthTexture', () => {
    test('constructor', () => {
      const object = new DepthTexture();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new DepthTexture();
      expect(object).toBeInstanceOf(Texture);
    });

    test('isDepthTexture', () => {
      const object = new DepthTexture();
      expect(object.isDepthTexture).toBeTruthy();
    });

    test('generateMipmaps', () => {
      const object = new DepthTexture();
      expect(object.generateMipmaps).toBe(false);
    });

    test('flipY', () => {
      const object = new DepthTexture();
      expect(object.flipY).toBe(false);
    });

    test.todo('copy', () => {
      const object = new DepthTexture();
      expect(object.copy).toBeNull();
    });

    test.todo('toJSON', () => {
      const object = new DepthTexture();
      expect(object.toJSON).toBeNull();
    });
  });
});
