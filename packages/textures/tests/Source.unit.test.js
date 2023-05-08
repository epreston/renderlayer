import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Source } from '../src/Source.js';

describe('Textures', () => {
  describe('Source', () => {
    test('Instancing', () => {
      const object = new Source();
      expect(object).toBeDefined();
    });

    test.todo('data', () => {
      // implement
    });

    test.todo('needsUpdate', () => {
      // implement
    });

    test.todo('uuid', () => {
      // implement
    });

    test.todo('version', () => {
      // implement
    });

    test('isSource', () => {
      const object = new Source();
      expect(object.isSource).toBeTruthy();
    });

    test.todo('toJSON', () => {
      // implement
    });
  });
});
