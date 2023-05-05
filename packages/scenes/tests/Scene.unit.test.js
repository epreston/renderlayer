import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { Scene } from '../src/Scene.js';

describe('Scenes', () => {
  describe('Scene', () => {
    test('Extending', () => {
      const object = new Scene();
      expect(object).toBeInstanceOf(Object3D);
    });

    test('Instancing', () => {
      const object = new Scene();
      expect(object).toBeDefined();
    });

    test.todo('type', () => {
      // implement
    });

    test.todo('background', () => {
      // implement
    });

    test.todo('environment', () => {
      // implement
    });

    test.todo('fog', () => {
      // implement
    });

    test.todo('backgroundBlurriness', () => {
      // implement
    });

    test.todo('backgroundIntensity', () => {
      // implement
    });

    test.todo('overrideMaterial', () => {
      // implement
    });

    test('isScene', () => {
      const object = new Scene();
      expect(object.isScene).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });

    test.todo('toJSON', () => {
      // implement
    });
  });
});
