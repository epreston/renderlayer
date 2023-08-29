import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { FogExp2 } from '../src/FogExp2.js';

describe('Scenes', () => {
  describe('FoxExp2', () => {
    test('constructor', () => {
      // FoxExp2( color, density = 0.00025 )

      // no params
      const object = new FogExp2();
      expect(object).toBeDefined();

      // color
      const object_color = new FogExp2(0xffffff);
      expect(object_color).toBeDefined();

      // color, density
      const object_all = new FogExp2(0xffffff, 0.0003);
      expect(object_all).toBeDefined();
    });

    test.todo('name', () => {
      // implement
    });

    test('color', () => {
      const object = new FogExp2(0xffffff, 0.0003);
      expect(object.color.getHex()).toEqual(0xffffff);
    });

    test('density', () => {
      const object = new FogExp2(0xffffff, 0.0003);
      expect(object.density).toEqual(0.0003);
    });

    test('isFogExp2', () => {
      const object = new FogExp2();
      expect(object.isFogExp2).toBeTruthy();
    });

    test.todo('clone', () => {
      // implement
    });

    test.todo('toJSON', () => {
      // implement
    });
  });
});
