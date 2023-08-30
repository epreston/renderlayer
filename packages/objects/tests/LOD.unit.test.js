import { describe, expect, it, test, vi } from 'vitest';

import { Object3D, Raycaster } from '@renderlayer/core';
import { LOD } from '../src/LOD.js';

describe('Objects', () => {
  describe('LOD', () => {
    test('constructor', () => {
      const object = new LOD();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new LOD();
      expect(object).toBeInstanceOf(Object3D);
    });

    test('isLOD', () => {
      const object = new LOD();
      // @ts-ignore
      expect(object.isLOD).toBeTruthy();
    });

    test('type', () => {
      const object = new LOD();
      expect(object.type).toBe('LOD');
    });

    test('levels', () => {
      const lod = new LOD();
      // @ts-ignore
      const levels = lod.levels;

      expect(Array.isArray(levels)).toBeTruthy();
      expect(levels.length).toBe(0);
    });

    test('autoUpdate', () => {
      const lod = new LOD();

      expect(lod.autoUpdate).toBe(true);
    });

    test('copy', () => {
      const lod1 = new LOD();
      const lod2 = new LOD();

      const high = new Object3D();
      const mid = new Object3D();
      const low = new Object3D();

      lod1.addLevel(high, 5);
      lod1.addLevel(mid, 25);
      lod1.addLevel(low, 50);

      lod1.autoUpdate = false;

      lod2.copy(lod1);

      expect(lod2.autoUpdate).toBe(false);
      // @ts-ignore
      expect(lod2.levels.length).toBe(3);
    });

    test('addLevel', () => {
      const lod = new LOD();

      const high = new Object3D();
      const mid = new Object3D();
      const low = new Object3D();

      lod.addLevel(high, 5, 0.0);
      lod.addLevel(mid, 25, 0.05);
      lod.addLevel(low, 50, 0.1);

      // @ts-ignore
      expect(lod.levels.length).toBe(3);
      // @ts-ignore
      expect(lod.levels[0]).toStrictEqual({ distance: 5, object: high, hysteresis: 0.0 });
      // @ts-ignore
      expect(lod.levels[1]).toStrictEqual({ distance: 25, object: mid, hysteresis: 0.05 });
      // @ts-ignore
      expect(lod.levels[2]).toStrictEqual({ distance: 50, object: low, hysteresis: 0.1 });
    });

    test.todo('getCurrentLevel', () => {
      // implement
    });

    test('getObjectForDistance', () => {
      const lod = new LOD();

      const high = new Object3D();
      const mid = new Object3D();
      const low = new Object3D();

      // no levels defined
      expect(lod.getObjectForDistance(5)).toStrictEqual(null);

      // returns the same object if only one LOD level is defined
      lod.addLevel(high, 5);

      expect(lod.getObjectForDistance(0)).toBe(high);
      expect(lod.getObjectForDistance(10)).toBe(high);

      // returns correct object for distance
      lod.addLevel(mid, 25);
      lod.addLevel(low, 50);

      expect(lod.getObjectForDistance(0)).toBe(high);
      expect(lod.getObjectForDistance(10)).toBe(high);
      expect(lod.getObjectForDistance(25)).toBe(mid);
      expect(lod.getObjectForDistance(50)).toBe(low);
      expect(lod.getObjectForDistance(60)).toBe(low);
    });

    test('raycast', () => {
      const lod = new LOD();
      const raycaster = new Raycaster();
      const intersections = [];

      // no LOD defined
      lod.raycast(raycaster, intersections);
      expect(intersections.length).toBe(0);
    });

    test.todo('update', () => {
      // implement
    });

    test.todo('toJSON', () => {
      // implement
    });
  });
});
