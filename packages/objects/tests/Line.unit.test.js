import { describe, expect, it, test, vi } from 'vitest';

import { BufferGeometry } from '@renderlayer/buffers';
import { Object3D, Raycaster } from '@renderlayer/core';
import { LineBasicMaterial } from '@renderlayer/materials';
import { Vector3 } from '@renderlayer/math';

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

    test('geometry', () => {
      const line = new Line();
      expect(line.geometry).toBeInstanceOf(BufferGeometry);
    });

    test('material', () => {
      const line = new Line();
      expect(line.material).toBeInstanceOf(LineBasicMaterial);
    });

    test('copy', () => {
      const src = new Line();
      const dst = new Line();

      dst.copy(src);

      expect(dst.geometry).toBe(src.geometry);
      expect(dst.material).toBe(src.material);

      // will be different
      dst.uuid = src.uuid;

      expect(dst).not.toBe(src);
      expect(dst).toStrictEqual(src);
    });

    test('computeLineDistances', () => {
      const points = [];
      points.push(new Vector3(-10, 0, 0));
      points.push(new Vector3(0, 10, 0));
      points.push(new Vector3(10, 0, 0));

      const geometry = new BufferGeometry().setFromPoints(points);
      const object = new Line(geometry);

      object.computeLineDistances();

      // EP: asserts required
    });

    test('raycast', () => {
      const points = [];
      points.push(new Vector3(-10, 0, 0));
      points.push(new Vector3(0, 10, 0));
      points.push(new Vector3(10, 0, 0));

      const geometry = new BufferGeometry().setFromPoints(points);

      const object = new Line(geometry);

      const raycaster = new Raycaster();
      const intersections = [];

      object.raycast(raycaster, intersections);
      expect(intersections.length).toBe(0);
    });

    test('updateMorphTargets', () => {
      const points = [];
      points.push(new Vector3(-10, 0, 0));
      points.push(new Vector3(0, 10, 0));
      points.push(new Vector3(10, 0, 0));

      const geometry = new BufferGeometry().setFromPoints(points);

      const object = new Line(geometry);

      object.updateMorphTargets();

      // EP: asserts required
    });
  });
});
