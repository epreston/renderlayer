import { describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';

import { CubeCamera } from '../src/CubeCamera.js';

describe('Cameras', () => {
  describe('CubeCamera', () => {
    test('constructor', () => {
      const object = new CubeCamera();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new CubeCamera();
      expect(object).toBeInstanceOf(Object3D);
    });

    test('type', () => {
      const object = new CubeCamera();
      expect(object.type).toBe('CubeCamera');
    });

    test.todo('renderTarget', () => {
      // implement
    });

    test.todo('update', () => {
      // update( renderer, scene )
      // implement
    });
  });
});
