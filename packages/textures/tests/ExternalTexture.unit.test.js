import { describe, expect, it, test, vi } from 'vitest';

import { Texture } from '../src/Texture.js';
import { ExternalTexture } from '../src/ExternalTexture.js';

describe('Textures', () => {
  describe('ExternalTexture', () => {
    test('constructor', () => {
      const object = new ExternalTexture();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new ExternalTexture();
      expect(object).toBeInstanceOf(Texture);
    });

    test('isExternalTexture', () => {
      const object = new ExternalTexture();
      expect(object.isExternalTexture).toBeTruthy();
    });

    test.todo('copy', () => {
      const object = new ExternalTexture();
      expect(object.copy).toBeNull();
    });
  });
});
