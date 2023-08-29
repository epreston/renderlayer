import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Loader } from '../src/Loader.js';
import { ObjectLoader } from '../src/ObjectLoader.js';

describe('Loaders', () => {
  describe('ObjectLoader', () => {
    test('constructor', () => {
      const object = new ObjectLoader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new ObjectLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test.todo('load', () => {
      // implement
    });

    test.todo('loadAsync', () => {
      // async loadAsync( url, onProgress )
      // implement
    });

    test.todo('parse', () => {
      // implement
    });

    test.todo('parseAsync', () => {
      // async parseAsync( json )
      // implement
    });

    test.todo('parseShapes', () => {
      // parseShapes( json )
      // implement
    });

    test.todo('parseSkeletons', () => {
      // parseSkeletons( json, object )
      // implement
    });

    test.todo('parseGeometries', () => {
      // implement
    });

    test.todo('parseMaterials', () => {
      // implement
    });

    test.todo('parseAnimations', () => {
      // implement
    });

    test.todo('parseImages', () => {
      // implement
    });

    test.todo('parseImagesAsync', () => {
      // async parseImagesAsync( json )
      // implement
    });

    test.todo('parseTextures', () => {
      // implement
    });

    test.todo('parseObject', () => {
      // implement
    });

    test.todo('bindSkeletons', () => {
      // bindSkeletons( object, skeletons )
      // implement
    });
  });
});
