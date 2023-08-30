import { describe, expect, it, test, vi } from 'vitest';

import { BufferGeometry } from '@renderlayer/buffers';
import { PerspectiveCamera } from '@renderlayer/cameras';
import { Object3D, Raycaster } from '@renderlayer/core';
import { SpriteMaterial } from '@renderlayer/materials';
import { Vector2 } from '@renderlayer/math';

import { Sprite } from '../src/Sprite.js';

describe('Objects', () => {
  describe('Sprite', () => {
    test('constructor', () => {
      const object = new Sprite();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new Sprite();
      expect(object).toBeInstanceOf(Object3D);
    });

    test('isSprite', () => {
      const object = new Sprite();
      expect(object.isSprite).toBeTruthy();
    });

    test('type', () => {
      const object = new Sprite();
      expect(object.type).toBe('Sprite');
    });

    test('geometry', () => {
      const object = new Sprite();
      expect(object.geometry).toBeInstanceOf(BufferGeometry);
    });

    test('material', () => {
      const object = new Sprite();
      expect(object.material).toBeInstanceOf(SpriteMaterial);
    });

    test('center', () => {
      const object = new Sprite();
      expect(object.center).toBeInstanceOf(Vector2);
    });

    test('raycast', () => {
      const object = new Sprite();
      const raycaster = new Raycaster();
      const camera = new PerspectiveCamera(90, 1, 1, 1000);
      raycaster.setFromCamera(
        {
          x: 0.5,
          y: 0.5
        },
        camera
      );

      expect(raycaster.intersectObject(object, false).length).toBe(1);
    });

    test('copy', () => {
      const object = new Sprite();
      const object2 = new Sprite();

      object2.center = new Vector2(1, 1);
      object2.material = new SpriteMaterial();

      object.copy(object2);

      // uuid will be different
      object.uuid = object2.uuid;

      expect(object).not.toBe(object2);
      expect(object).toStrictEqual(object2);
    });
  });
});
