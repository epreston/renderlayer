import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { OrthographicCamera } from '@renderlayer/cameras';
import { Object3D } from '@renderlayer/core';
import { Frustum, Matrix4, Vector2, Vector4 } from '@renderlayer/math';

import { Light } from '../src/Light.js';
import { LightShadow } from '../src/LightShadow.js';

describe('Lights', () => {
  describe('LightShadow', () => {
    let camera = undefined;
    let object = undefined;

    beforeAll(() => {
      camera = new OrthographicCamera(-5, 5, 5, -5, 0.5, 500);
    });

    beforeEach(() => {
      object = new LightShadow(camera);
    });

    test('constructor', () => {
      expect(object).toBeDefined();
    });

    test('camera', () => {
      expect(object.camera).toBeDefined();
      expect(object.camera).toBeInstanceOf(OrthographicCamera);
      expect(object.camera).toBe(camera);
    });

    test('bias', () => {
      expect(object.bias).toBeDefined();
      expect(object.bias).toBe(0);
    });

    test('normalBias', () => {
      expect(object.normalBias).toBeDefined();
      expect(object.normalBias).toBe(0);
    });

    test('radius', () => {
      expect(object.radius).toBeDefined();
      expect(object.radius).toBe(1);
    });

    test('blurSamples', () => {
      expect(object.blurSamples).toBeDefined();
      expect(object.blurSamples).toBe(8);
    });

    test('mapSize', () => {
      expect(object.mapSize).toBeDefined();
      expect(object.mapSize.equals(new Vector2(512, 512))).toBeTruthy();
    });

    test('map', () => {
      expect(object.map).toBeDefined();
      expect(object.map).toBeNull();
    });

    test('mapPass', () => {
      expect(object.mapPass).toBeDefined();
      expect(object.mapPass).toBeNull();
    });

    test('matrix', () => {
      expect(object.matrix).toBeDefined();
      expect(object.matrix).toBeInstanceOf(Matrix4);
    });

    test('autoUpdate', () => {
      expect(object.autoUpdate).toBeDefined();
      expect(object.autoUpdate).toBe(true);
    });

    test('needsUpdate', () => {
      const object = new LightShadow();
      expect(object.needsUpdate).toBe(false);
    });

    test('getViewportCount', () => {
      expect(object.getViewportCount()).toBe(1);
    });

    test('getFrustum', () => {
      const frustum = object.getFrustum();
      expect(frustum).toBeInstanceOf(Frustum);
    });

    test('updateMatrices', () => {
      const light = new Light();

      // only apples to light types with a target
      light.target = new Object3D();

      object.updateMatrices(light);
    });

    test('getViewport', () => {
      const viewPort = object.getViewport(0);
      expect(viewPort).toBeInstanceOf(Vector4);
    });

    test('getFrameExtents', () => {
      const extents = object.getFrameExtents();
      expect(extents).toBeInstanceOf(Vector2);
    });

    test('dispose', () => {
      const shadow = new LightShadow();
      shadow.dispose();

      expect(shadow).toBeDefined();
    });

    test('copy', () => {
      const copiedObject = new LightShadow();

      copiedObject.copy(object);

      // will be different
      copiedObject.camera.uuid = object.camera.uuid;

      expect(copiedObject).not.toBe(object);
      expect(copiedObject).toStrictEqual(object);
    });

    test('clone', () => {
      const clonedObject = object.clone();

      // will be different
      clonedObject.camera.uuid = object.camera.uuid;

      expect(clonedObject).not.toBe(object);
      expect(clonedObject).toStrictEqual(object);
    });

    test('toJSON', () => {
      object.camera.uuid = 'a3fb35eb-dcae-4ccd-a619-5bf5d09575d0';
      expect(object).toMatchInlineSnapshot(`
        {
          "camera": {
            "bottom": -5,
            "far": 500,
            "layers": 1,
            "left": -5,
            "near": 0.5,
            "right": 5,
            "top": 5,
            "type": "OrthographicCamera",
            "up": [
              0,
              1,
              0,
            ],
            "uuid": "a3fb35eb-dcae-4ccd-a619-5bf5d09575d0",
            "zoom": 1,
          },
        }
      `);
    });

    test('clone/copy', () => {
      const a = new LightShadow(new OrthographicCamera(-5, 5, 5, -5, 0.5, 500));
      const b = new LightShadow(new OrthographicCamera(-3, 3, 3, -3, 0.3, 300));

      expect(a).not.toEqual(b);

      const c = a.clone();
      c.camera.uuid = a.camera.uuid;
      expect(a).toStrictEqual(c);

      c.mapSize.set(256, 256);
      expect(a).not.toEqual(c);

      b.copy(a);
      b.camera.uuid = a.camera.uuid;
      expect(a).toStrictEqual(b);

      b.mapSize.set(256, 256);
      expect(a).not.toEqual(b);
    });
  });
});
