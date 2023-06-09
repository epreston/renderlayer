import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { Line } from '../src/Line.js';

describe('Objects', () => {
  describe('Line', () => {
    test('Instancing', () => {
      const object = new Line();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const line = new Line();
      expect(line).toBeInstanceOf(Object3D);
    });

    test('type', () => {
      const object = new Line();
      expect(object.type).toBe('Line');
    });

    test.todo('geometry', () => {
      // implement
    });

    test.todo('material', () => {
      // implement
    });

    test('isLine', () => {
      const object = new Line();
      expect(object.isLine).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });

    test.todo('computeLineDistances', () => {
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
