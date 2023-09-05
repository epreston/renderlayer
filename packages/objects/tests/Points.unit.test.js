import { describe, expect, it, test, vi } from 'vitest';

import { BufferGeometry } from '@renderlayer/buffers';
import { Object3D, Raycaster } from '@renderlayer/core';
import { ObjectLoader } from '@renderlayer/loaders';
import { PointsMaterial } from '@renderlayer/materials';
import { Vector3 } from '@renderlayer/math';

import { Points } from '../src/Points.js';

describe('Objects', () => {
  describe('Points', () => {
    test('constructor', () => {
      const object = new Points();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const points = new Points();
      expect(points).toBeInstanceOf(Object3D);
    });

    test('isPoints', () => {
      const object = new Points();
      expect(object.isPoints).toBeTruthy();
    });

    test('type', () => {
      const object = new Points();
      expect(object.type).toBe('Points');
    });

    test('geometry', () => {
      const line = new Points();
      expect(line.geometry).toBeInstanceOf(BufferGeometry);
    });

    test('material', () => {
      const object = new Points();
      expect(object.material).toBeInstanceOf(PointsMaterial);
    });

    test('copy', () => {
      const src = new Points();
      const dst = new Points();

      dst.copy(src);

      expect(dst.geometry).toBe(src.geometry);
      expect(dst.material).toBe(src.material);
    });

    test('raycast', () => {
      const points = [];
      points.push(new Vector3(-10, 0, 0));
      points.push(new Vector3(0, 10, 0));
      points.push(new Vector3(10, 0, 0));

      const geometry = new BufferGeometry().setFromPoints(points);

      const object = new Points(geometry);

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

      const object = new Points(geometry);

      object.updateMorphTargets();
    });

    test('from ObjectLoader', () => {
      const object = new Points();

      const json = object.toJSON();
      const loader = new ObjectLoader();
      const outputObject = loader.parse(json);

      expect(outputObject).toStrictEqual(object);
    });
  });
});
