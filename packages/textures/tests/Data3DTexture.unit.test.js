import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Texture } from '../src/Texture.js';
import { Data3DTexture } from '../src/Data3DTexture.js';

describe('Textures', () => {
  describe('Data3DTexture', () => {
    test('Instancing', (assert) => {
      const object = new Data3DTexture();
      expect(object).toBeDefined();
    });

    test('Extending', (assert) => {
      const object = new Data3DTexture();
      expect(object).toBeInstanceOf(Texture);
    });

    test.todo('image', (assert) => {
      // implement
    });

    test.todo('magFilter', (assert) => {
      // implement
    });

    test.todo('minFilter', (assert) => {
      // implement
    });

    test.todo('wrapR', (assert) => {
      // implement
    });

    test.todo('generateMipmaps', (assert) => {
      // implement
    });

    test.todo('flipY', (assert) => {
      // implement
    });

    test.todo('unpackAlignment', (assert) => {
      // implement
    });

    test('isData3DTexture', (assert) => {
      const object = new Data3DTexture();
      expect(object.isData3DTexture).toBeTruthy();
    });
  });
});
