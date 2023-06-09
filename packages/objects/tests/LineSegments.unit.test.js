import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { Line } from '../src/Line.js';
import { LineSegments } from '../src/LineSegments.js';

describe('Objects', () => {
  describe('LineSegments', () => {
    test('Instancing', () => {
      const object = new LineSegments();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const lineSegments = new LineSegments();
      expect(lineSegments).toBeInstanceOf(Object3D);
      expect(lineSegments).toBeInstanceOf(Line);
    });

    test('type', () => {
      const object = new LineSegments();
      expect(object.type).toBe('LineSegments');
    });

    test('isLineSegments', () => {
      const object = new LineSegments();
      expect(object.isLineSegments).toBeTruthy();
    });

    test.todo('computeLineDistances', () => {
      // implement
    });
  });
});
