import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Source } from '../src/Source.js';

describe('Textures', () => {
  describe('Source', () => {
    test('constructor', () => {
      const object = new Source();
      expect(object).toBeDefined();
    });

    test.todo('data', () => {
      // implement
    });

    test.todo('needsUpdate', () => {
      // implement
    });

    test('uuid', () => {
      const object = new Source();

      expect(object.uuid).to.be.a('string');
      expect(object.uuid).to.have.length(36);
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
