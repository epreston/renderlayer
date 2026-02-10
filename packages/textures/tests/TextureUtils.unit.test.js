import { describe, expect, it, test, vi } from 'vitest';

import { Texture } from '../src/Texture.js';
import { contain, cover, fill, getByteLength, TextureUtils } from '../src/TextureUtils.js';

describe('Textures', () => {
  describe('TextureUtils', () => {
    test('constructor', () => {
      const object = new TextureUtils({});
      expect(object).toBeDefined();
    });

    test('contain', () => {
      expect(TextureUtils.contain).toBeDefined();
    });

    test('cover', () => {
      expect(TextureUtils.cover).toBeDefined();
    });

    test('fill', () => {
      expect(TextureUtils.fill).toBeDefined();
    });

    test('getByteLength', () => {
      expect(TextureUtils.getByteLength).toBeDefined();
    });
  });
});

// EP : Todo
// contain, cover, fill, getByteLength,
