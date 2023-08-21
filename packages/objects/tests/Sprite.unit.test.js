import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
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

    test('type', () => {
      const object = new Sprite();
      expect(object.type).toBe('Sprite');
    });

    test('isSprite', () => {
      const object = new Sprite();
      expect(object.isSprite).toBeTruthy();
    });

    test.todo('geometry', () => {
      // implement
    });

    test.todo('material', () => {
      // implement
    });

    test.todo('center', () => {
      // implement
    });

    test.todo('raycast', () => {
      // implement
    });

    test.todo('copy', () => {
      // implement
    });
  });
});
