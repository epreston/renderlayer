import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { OrthographicCamera } from '@renderlayer/cameras';
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

    test.todo('blurSamples', () => {
      // implement
    });

    test.todo('mapSize', () => {
      // implement
    });

    test.todo('map', () => {
      // implement
    });

    test.todo('mapPass', () => {
      // implement
    });

    test.todo('matrix', () => {
      // implement
    });

    test.todo('autoUpdate', () => {
      // implement
    });

    test.todo('needsUpdate', () => {
      // implement
    });

    test.todo('getViewportCount', () => {
      // implement
    });

    test.todo('getFrustum', () => {
      // implement
    });

    test.todo('updateMatrices', () => {
      // implement
    });

    test.todo('getViewport', () => {
      // implement
    });

    test.todo('getFrameExtents', () => {
      // implement
    });

    test('dispose', () => {
      const shadow = new LightShadow();
      shadow.dispose();

      expect(shadow).toBeDefined();
    });

    test.todo('copy', () => {
      // implement
    });

    test.todo('clone', () => {
      // implement
    });

    test.todo('toJSON', () => {
      // implement
    });

    test('clone/copy', () => {
      const a = new LightShadow(new OrthographicCamera(-5, 5, 5, -5, 0.5, 500));
      const b = new LightShadow(new OrthographicCamera(-3, 3, 3, -3, 0.3, 300));

      expect(a).not.toEqual(b);

      // const c = a.clone();
      // expect(a).toEqual(c);

      // c.mapSize.set(256, 256);
      // expect(a).not.toEqual(c);

      // b.copy(a);
      // expect(a).toEqual(b);

      // b.mapSize.set(512, 512);
      // expect(a).not.toEqual(b);
    });
  });
});
