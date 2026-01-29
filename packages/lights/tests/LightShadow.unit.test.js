import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { OrthographicCamera } from '@renderlayer/cameras';
import { Object3D } from '@renderlayer/core';
import { Frustum, Matrix4, Vector2, Vector4 } from '@renderlayer/math';

import { DirectionalLight } from '../src/DirectionalLight.js';
import { LightShadow } from '../src/LightShadow.js';

describe('Lights', () => {
  describe('LightShadow', () => {
    let _camera = undefined;
    let _object = undefined;

    beforeAll(() => {
      _camera = new OrthographicCamera(-5, 5, 5, -5, 0.5, 500);
    });

    beforeEach(() => {
      _object = new LightShadow(_camera);
    });

    test('constructor', () => {
      expect(_object).toBeDefined();
    });

    test('camera', () => {
      expect(_object.camera).toBeDefined();
      expect(_object.camera).toBeInstanceOf(OrthographicCamera);
      expect(_object.camera).toBe(_camera);
    });

    test('bias', () => {
      expect(_object.bias).toBeDefined();
      expect(_object.bias).toBe(0);
    });

    test('normalBias', () => {
      expect(_object.normalBias).toBeDefined();
      expect(_object.normalBias).toBe(0);
    });

    test('radius', () => {
      expect(_object.radius).toBeDefined();
      expect(_object.radius).toBe(1);
    });

    test('blurSamples', () => {
      expect(_object.blurSamples).toBeDefined();
      expect(_object.blurSamples).toBe(8);
    });

    test('mapSize', () => {
      expect(_object.mapSize).toBeDefined();
      expect(_object.mapSize.equals(new Vector2(512, 512))).toBeTruthy();
    });

    test('map', () => {
      expect(_object.map).toBeDefined();
      expect(_object.map).toBeNull();
    });

    test('mapPass', () => {
      expect(_object.mapPass).toBeDefined();
      expect(_object.mapPass).toBeNull();
    });

    test('matrix', () => {
      expect(_object.matrix).toBeDefined();
      expect(_object.matrix).toBeInstanceOf(Matrix4);
    });

    test('autoUpdate', () => {
      expect(_object.autoUpdate).toBeDefined();
      expect(_object.autoUpdate).toBe(true);
    });

    test('needsUpdate', () => {
      const object = new LightShadow();
      expect(object.needsUpdate).toBe(false);
    });

    test('getViewportCount', () => {
      expect(_object.getViewportCount()).toBe(1);
    });

    test('getFrustum', () => {
      const frustum = _object.getFrustum();
      expect(frustum).toBeInstanceOf(Frustum);
    });

    test('updateMatrices', () => {
      const light = new DirectionalLight();

      // only apples to light types with a target
      light.target = new Object3D();

      _object.updateMatrices(light);
    });

    test('getViewport', () => {
      const viewPort = _object.getViewport(0);
      expect(viewPort).toBeInstanceOf(Vector4);
    });

    test('getFrameExtents', () => {
      const extents = _object.getFrameExtents();
      expect(extents).toBeInstanceOf(Vector2);
    });

    test('dispose', () => {
      const shadow = new LightShadow();
      shadow.dispose();

      expect(shadow).toBeDefined();
    });

    test('copy', () => {
      const copiedObject = new LightShadow();

      copiedObject.copy(_object);

      // will be different
      copiedObject.camera.uuid = _object.camera.uuid;

      expect(copiedObject).not.toBe(_object);
      expect(copiedObject).toStrictEqual(_object);
    });

    test('clone', () => {
      const clonedObject = _object.clone();

      // will be different
      clonedObject.camera.uuid = _object.camera.uuid;

      expect(clonedObject).not.toBe(_object);
      expect(clonedObject).toStrictEqual(_object);
    });

    test('toJSON', () => {
      _object.camera.uuid = 'a3fb35eb-dcae-4ccd-a619-5bf5d09575d0';
      expect(_object).toMatchInlineSnapshot(`
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
