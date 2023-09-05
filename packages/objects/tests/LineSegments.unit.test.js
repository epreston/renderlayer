import { describe, expect, it, test, vi } from 'vitest';

import { BufferGeometry } from '@renderlayer/buffers';
import { Object3D } from '@renderlayer/core';
import { Vector3 } from '@renderlayer/math';

import { Line } from '../src/Line.js';
import { LineSegments } from '../src/LineSegments.js';

describe('Objects', () => {
  describe('LineSegments', () => {
    // This is nearly the same as Line; the only difference is that it is
    // rendered using gl.LINES instead of gl.LINE_STRIP.

    test('constructor', () => {
      const object = new LineSegments();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const lineSegments = new LineSegments();
      expect(lineSegments).toBeInstanceOf(Object3D);
      expect(lineSegments).toBeInstanceOf(Line);
    });

    test('isLineSegments', () => {
      const object = new LineSegments();
      expect(object.isLineSegments).toBeTruthy();
    });

    test('type', () => {
      const object = new LineSegments();
      expect(object.type).toBe('LineSegments');
    });

    test('computeLineDistances', () => {
      const points = [];
      points.push(new Vector3(-10, 0, 0));
      points.push(new Vector3(0, 10, 0));
      points.push(new Vector3(10, 0, 0));

      const geometry = new BufferGeometry().setFromPoints(points);
      const object = new LineSegments(geometry);

      object.computeLineDistances();

      // EP: asserts required
    });
  });
});
