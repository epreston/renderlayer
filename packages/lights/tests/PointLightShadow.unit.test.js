import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { LightShadow } from '../src/LightShadow.js';
import { PointLightShadow } from '../src/PointLightShadow.js';

describe('Lights', () => {
  describe('PointLightShadow', () => {
    test('constructor', () => {
      const object = new PointLightShadow();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new PointLightShadow();
      expect(object).toBeInstanceOf(LightShadow);
    });

    test('isPointLightShadow', () => {
      const object = new PointLightShadow();
      expect(object.isPointLightShadow).toBeTruthy();
    });

    test.todo('updateMatrices', () => {
      // implement
    });
  });
});
