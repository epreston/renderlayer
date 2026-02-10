import { describe, expect, it, test, vi } from 'vitest';

import { EventDispatcher } from '@renderlayer/core';
import { Matrix3, Vector2 } from '@renderlayer/math';
import {
  ClampToEdgeWrapping,
  LinearFilter,
  LinearMipmapLinearFilter,
  MirroredRepeatWrapping,
  NoColorSpace,
  RGBAFormat,
  RepeatWrapping,
  UnsignedByteType
} from '@renderlayer/shared';

import { Source } from '../src/Source.js';
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

    test('image', () => {
      const object = new Texture();

      const data = object.image;
      expect(data).toBeNull();

      const newData = { data: 'test', width: 4, height: 4 };
      object.image = newData;
      expect(object.image).toBe(newData);
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

    test('source', () => {
      const object = new Texture();
      expect(object.source).toBeInstanceOf(Source);
    });

    test('mipmaps', () => {
      const object = new Texture();
      expect(object.mipmaps).toBeInstanceOf(Array);
    });

    test('mapping', () => {
      const object = new Texture();
      expect(object.mapping).toBe(Texture.DEFAULT_MAPPING);
    });

    test('wrapS', () => {
      const object = new Texture();
      expect(object.wrapS).toBe(ClampToEdgeWrapping);
    });

    test('wrapT', () => {
      const object = new Texture();
      expect(object.wrapT).toBe(ClampToEdgeWrapping);
    });

    test('magFilter', () => {
      const object = new Texture();
      expect(object.magFilter).toBe(LinearFilter);
    });

    test('minFilter', () => {
      const object = new Texture();
      expect(object.minFilter).toBe(LinearMipmapLinearFilter);
    });

    test('anisotropy', () => {
      const object = new Texture();
      expect(object.anisotropy).toBe(Texture.DEFAULT_ANISOTROPY);
    });

    test('format', () => {
      const object = new Texture();
      expect(object.format).toBe(RGBAFormat);
    });

    test('internalFormat', () => {
      const object = new Texture();
      expect(object.internalFormat).toBeNull();
    });

    test('type', () => {
      const object = new Texture();
      expect(object.type).toBe(UnsignedByteType);
    });

    test('offset', () => {
      const object = new Texture();
      expect(object.offset).toBeInstanceOf(Vector2);
    });

    test('repeat', () => {
      const object = new Texture();
      expect(object.repeat).toBeInstanceOf(Vector2);
    });

    test('center', () => {
      const object = new Texture();
      expect(object.center).toBeInstanceOf(Vector2);
    });

    test('rotation', () => {
      const object = new Texture();
      expect(object.rotation).toBe(0);
    });

    test('matrixAutoUpdate', () => {
      const object = new Texture();
      expect(object.matrixAutoUpdate).toBe(true);
    });

    test('matrix', () => {
      const object = new Texture();
      expect(object.matrix).toBeInstanceOf(Matrix3);
    });

    test('generateMipmaps', () => {
      const object = new Texture();
      expect(object.generateMipmaps).toBe(true);
    });

    test('premultiplyAlpha', () => {
      const object = new Texture();
      expect(object.premultiplyAlpha).toBe(false);
    });

    test('flipY', () => {
      const object = new Texture();
      expect(object.flipY).toBe(true);
    });

    test('unpackAlignment', () => {
      const object = new Texture();
      expect(object.unpackAlignment).toBe(4);
    });

    test('colorSpace', () => {
      const object = new Texture();
      expect(object.colorSpace).toBe(NoColorSpace);
    });

    test('userData', () => {
      const object = new Texture();
      expect(object.userData).toBeDefined();
      expect(object.userData).toBeInstanceOf(Object);
    });

    test('version', () => {
      const object = new Texture();
      expect(object.version).toBe(0);
    });

    test('onUpdate', () => {
      const object = new Texture();
      expect(object.onUpdate).toBeNull();
    });

    test('renderTarget', () => {
      const object = new Texture();
      expect(object.renderTarget).toBeNull();
    });

    test('isRenderTargetTexture', () => {
      const object = new Texture();
      expect(object.isRenderTargetTexture).toBeFalsy();
    });

    test('isArrayTexture', () => {
      const object = new Texture();
      expect(object.isArrayTexture).toBeFalsy();
    });

    test('needsPMREMUpdate', () => {
      // EP: no longer required ?

      const object = new Texture();
      expect(object.needsPMREMUpdate).toBe(false);
    });

    test('pmremVersion', () => {
      const object = new Texture();
      expect(object.pmremVersion).toBe(0);
    });

    test('updateMatrix', () => {
      const object = new Texture();
      object.updateMatrix();

      expect(object.matrix).toMatchInlineSnapshot(`
        Matrix3 {
          "elements": [
            1,
            -0,
            0,
            0,
            1,
            0,
            0,
            0,
            1,
          ],
        }
      `);
    });

    test('clone', () => {
      const object = new Texture();
      const clonedObject = object.clone();

      // will be different
      clonedObject.uuid = object.uuid;
      clonedObject.version = object.version;

      expect(clonedObject).not.toBe(object);
      expect(clonedObject).toStrictEqual(object);
    });

    test('copy', () => {
      const object = new Texture();
      const copiedObject = new Texture();

      copiedObject.copy(object);

      // will be different
      copiedObject.uuid = object.uuid;
      copiedObject.version = object.version;

      expect(copiedObject).not.toBe(object);
      expect(copiedObject).toStrictEqual(object);
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

    test('transformUv', () => {
      const object = new Texture();

      const uvOne = object.transformUv(new Vector2(0.5, 0.5));
      expect(uvOne).toStrictEqual(new Vector2(0.5, 0.5));

      const uvClamp = object.transformUv(new Vector2(1.5, 1.5));
      expect(uvClamp).toStrictEqual(new Vector2(1.0, 0.0));

      object.wrapS = MirroredRepeatWrapping;
      object.wrapT = MirroredRepeatWrapping;

      const uvTwo = object.transformUv(new Vector2(0.5, 0.5));
      expect(uvTwo).toStrictEqual(new Vector2(0.5, 0.5));

      const uvThree = object.transformUv(new Vector2(1.5, 0.5));
      expect(uvThree).toStrictEqual(new Vector2(0.5, 0.5));

      const uvFour = object.transformUv(new Vector2(0.5, 1.5));
      expect(uvFour).toStrictEqual(new Vector2(0.5, 0.5));

      object.wrapS = RepeatWrapping;
      object.wrapT = RepeatWrapping;

      const uvFive = object.transformUv(new Vector2(0.5, 0.5));
      expect(uvFive).toStrictEqual(new Vector2(0.5, 0.5));

      const uvSix = object.transformUv(new Vector2(1.5, 1.5));
      expect(uvSix).toStrictEqual(new Vector2(0.5, 0.5));
    });

    test('needsUpdate', () => {
      const object = new Texture();
      expect(object.version).toBe(0);

      object.needsUpdate = true;

      expect(object.version).toBe(1);
    });
  });
});
