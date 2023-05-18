import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { Points } from '../src/Points.js';

describe('Objects', () => {
  describe('Points', () => {
    test('Instancing', () => {
      const object = new Points();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const points = new Points();
      expect(points).toBeInstanceOf(Object3D);
    });

    test('type', () => {
      const object = new Points();
      expect(object.type).toBe('Points');
    });

    test.todo('geometry', () => {
      // implement
    });

    test.todo('material', () => {
      // implement
    });

    test('isPoints', () => {
      const object = new Points();
      expect(object.isPoints).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });

    test.todo('raycast', () => {
      // implement
    });

    test.todo('updateMorphTargets', () => {
      // implement
    });
  });
});
