import { describe, expect, it, test, vi } from 'vitest';

import { Texture } from '../src/Texture.js';
import { VideoTexture } from '../src/VideoTexture.js';

describe('Textures', () => {
  describe('VideoTexture', () => {
    test('constructor', () => {
      const object = new VideoTexture({});
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new VideoTexture({});
      expect(object).toBeInstanceOf(Texture);
    });

    test('isVideoTexture', () => {
      const object = new VideoTexture({});
      expect(object.isVideoTexture).toBeTruthy();
    });

    test('generateMipmaps', () => {
      const object = new VideoTexture({});
      expect(object.generateMipmaps).toBe(false);
    });

    test('clone', () => {
      const object = new VideoTexture({});
      expect(object.clone).toBeDefined();

      // EP: todo
    });

    test('update', () => {
      const object = new VideoTexture({});
      expect(object.update).toBeDefined();

      // EP: todo
    });
  });
});
