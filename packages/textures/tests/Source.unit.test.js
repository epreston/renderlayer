import { describe, expect, it, test, vi } from 'vitest';

import { Source } from '../src/Source.js';

describe('Textures', () => {
  describe('Source', () => {
    test('constructor', () => {
      const object = new Source();
      expect(object).toBeDefined();
    });

    test('isSource', () => {
      const object = new Source();
      expect(object.isSource).toBeTruthy();
    });

    test('id', () => {
      const object = new Source();
      expect(object.id).toBeDefined();

      // can change based on order of tests
      const prevId = object.id;

      const object2 = new Source();
      expect(object2.id).toBeGreaterThan(prevId);
    });

    test('uuid', () => {
      const object = new Source();

      expect(object.uuid).to.be.a('string');
      expect(object.uuid).to.have.length(36);
    });

    test('data', () => {
      const object = new Source();
      expect(object.data).toBeNull();

      const data = { data: 'test', width: 4, height: 4 };
      const object2 = new Source(data);
      expect(object2.data).toBe(data);
    });

    test('version', () => {
      const object = new Source();
      expect(object.version).toBe(0);
    });

    test('needsUpdate', () => {
      const object = new Source();
      expect(object.version).toBe(0);

      object.needsUpdate = true;

      expect(object.version).toBe(1);
    });

    test('toJSON', () => {
      const object = new Source();
      object.uuid = 'b933ce08-897c-4d50-bb3b-9cc6d72c89fa';
      expect(object).toMatchInlineSnapshot(`
        {
          "url": "",
          "uuid": "b933ce08-897c-4d50-bb3b-9cc6d72c89fa",
        }
      `);
    });
  });
});
