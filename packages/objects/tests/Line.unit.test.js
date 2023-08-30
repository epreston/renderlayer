import { describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { Line } from '../src/Line.js';

describe('Objects', () => {
  describe('Line', () => {
    test('constructor', () => {
      const object = new Line();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const line = new Line();
      expect(line).toBeInstanceOf(Object3D);
    });

    test('isLine', () => {
      const object = new Line();
      expect(object.isLine).toBeTruthy();
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

    test('copy', () => {
      const src = new Line();
      const dst = new Line();

      dst.copy(src);

      expect(dst.geometry).toBe(src.geometry);
      expect(dst.material).toBe(src.material);
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
