import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Fog } from '../src/Fog.js';

describe('Scenes', () => {
  describe('Fog', () => {
    test('Instancing', () => {
      // Fog( color, near = 1, far = 1000 )

      // no params
      const object = new Fog();
      expect(object).toBeDefined();

      // color
      const object_color = new Fog(0xffffff);
      expect(object_color).toBeDefined();

      // color, near, far
      const object_all = new Fog(0xffffff, 0.015, 100);
      expect(object_all).toBeDefined();
    });

    test.todo('name', () => {
      // implement
    });

    test.todo('color', () => {
      // implement
    });

    test.todo('near', () => {
      // implement
    });

    test.todo('far', () => {
      // implement
    });

    test('isFog', () => {
      const object = new Fog();
      expect(object.isFog).toBeTruthy();
    });

    test.todo('clone', () => {
      // implement
    });

    test.todo('toJSON', () => {
      // implement
    });
  });
});
