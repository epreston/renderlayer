import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Loader } from '../src/Loader.js';
import { MaterialLoader } from '../src/MaterialLoader.js';

describe('Loaders', () => {
  describe('MaterialLoader', () => {
    test('constructor', () => {
      const object = new MaterialLoader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new MaterialLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test('textures', () => {
      const actual = new MaterialLoader().textures;
      const expected = {};
      expect(actual).toEqual(expected);
    });

    test.todo('load', () => {
      // implement
    });

    test.todo('parse', () => {
      // implement
    });

    test.todo('setTextures', () => {
      // implement
    });

    test.todo('createMaterialFromType', () => {
      // static createMaterialFromType( type )
      // implement
    });
  });
});
