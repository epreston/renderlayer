import { describe, expect, it, test, vi } from 'vitest';

import { EventDispatcher } from '@renderlayer/core';
import { Texture } from '../src/Texture.js';

describe('Textures', () => {
  describe('Texture', () => {
    test('constructor', () => {
      // no params
      const object = new Texture();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Texture();
      expect(object).toBeInstanceOf(EventDispatcher);
    });

    test('isTexture', () => {
      const object = new Texture();
      expect(object.isTexture).toBeTruthy();
    });

    test.todo('image', () => {
      // implement
    });

    test('id', () => {
      const object = new Texture();
      expect(object.id).toBeDefined();

      // can change based on order of tests
      const prevId = object.id;

      const object2 = new Texture();
      expect(object2.id).toBeGreaterThan(prevId);
    });

    test('uuid', () => {
      const object = new Texture();

      expect(object.uuid).to.be.a('string');
      expect(object.uuid).to.have.length(36);
    });

    test('name', () => {
      const object = new Texture();
      expect(object.name).toBe('');
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

    test.todo('updateMatrix', () => {
      // implement
    });

    test.todo('clone', () => {
      // implement
    });

    test.todo('copy', () => {
      // implement
    });

    test('toJSON', () => {
      const object = new Texture();

      // source becomes image in output
      object.source.uuid = '9ae69e66-9d0f-44a4-b9f2-c8bf45dde5b8';
      object.uuid = 'd7f92a28-2076-4957-b10e-5427f9bc610c';

      expect(object).toMatchInlineSnapshot(`
        {
          "anisotropy": 1,
          "center": [
            0,
            0,
          ],
          "channel": 0,
          "colorSpace": "",
          "flipY": true,
          "format": 1023,
          "generateMipmaps": true,
          "image": "9ae69e66-9d0f-44a4-b9f2-c8bf45dde5b8",
          "internalFormat": null,
          "magFilter": 1006,
          "mapping": 300,
          "metadata": {
            "generator": "Texture.toJSON",
            "type": "Texture",
            "version": 4.5,
          },
          "minFilter": 1008,
          "name": "",
          "offset": [
            0,
            0,
          ],
          "premultiplyAlpha": false,
          "repeat": [
            1,
            1,
          ],
          "rotation": 0,
          "type": 1009,
          "unpackAlignment": 4,
          "uuid": "d7f92a28-2076-4957-b10e-5427f9bc610c",
          "wrap": [
            1001,
            1001,
          ],
        }
      `);
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
