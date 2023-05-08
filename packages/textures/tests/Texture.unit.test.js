import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { EventDispatcher } from '@renderlayer/core';
import { Texture } from '../src/Texture.js';

describe('Textures', () => {
  describe('Texture', () => {
    test('Instancing', () => {
      // no params
      const object = new Texture();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new Texture();
      expect(object).toBeInstanceOf(EventDispatcher);
    });

    test.todo('image', () => {
      // implement
    });

    test.todo('id', () => {
      // implement
    });

    test.todo('uuid', () => {
      // implement
    });

    test.todo('name', () => {
      // implement
    });

    test.todo('source', () => {
      // implement
    });

    test.todo('mipmaps', () => {
      // implement
    });

    test.todo('mapping', () => {
      // implement
    });

    test.todo('wrapS', () => {
      // implement
    });

    test.todo('wrapT', () => {
      // implement
    });

    test.todo('magFilter', () => {
      // implement
    });

    test.todo('minFilter', () => {
      // implement
    });

    test.todo('anisotropy', () => {
      // implement
    });

    test.todo('format', () => {
      // implement
    });

    test.todo('internalFormat', () => {
      // implement
    });

    test.todo('type', () => {
      // implement
    });

    test.todo('offset', () => {
      // implement
    });

    test.todo('repeat', () => {
      // implement
    });

    test.todo('center', () => {
      // implement
    });

    test.todo('rotation', () => {
      // implement
    });

    test.todo('matrixAutoUpdate', () => {
      // implement
    });

    test.todo('matrix', () => {
      // implement
    });

    test.todo('generateMipmaps', () => {
      // implement
    });

    test.todo('premultiplyAlpha', () => {
      // implement
    });

    test.todo('flipY', () => {
      // implement
    });

    test.todo('unpackAlignment', () => {
      // implement
    });

    test.todo('colorSpace', () => {
      // implement
    });

    test.todo('userData', () => {
      // implement
    });

    test.todo('version', () => {
      // implement
    });

    test.todo('onUpdate', () => {
      // implement
    });

    test.todo('needsPMREMUpdate', () => {
      // implement
    });

    test('isTexture', () => {
      const object = new Texture();
      expect(object.isTexture).toBeTruthy();
    });

    test.todo('updateMatrix', () => {
      // implement
    });

    test.todo('clone', () => {
      // implement
    });

    test.todo('copy', () => {
      // implement
    });

    test.todo('toJSON', () => {
      // implement
    });

    test('dispose', () => {
      const object = new Texture();
      object.dispose();

      expect(object).toBeDefined();
    });

    test.todo('transformUv', () => {
      // implement
    });
  });
});
