// @vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';
import { resolveAfter, flushPromises } from './test-helpers.js';

import { BoxGeometry } from '@renderlayer/geometries';
import { MeshBasicMaterial } from '@renderlayer/materials';
import { Mesh } from '@renderlayer/objects';

import { Loader } from '../src/Loader.js';
import { ObjectLoader } from '../src/ObjectLoader.js';

describe('Loaders', () => {
  describe('ObjectLoader', () => {
    // will be intercepted by msw, not a real url
    const _MeshTestFile = 'http://renderlayer.org/test/json/Mesh.json';
    const _MissingTestFile = 'http://renderlayer.org/test/json/missing.json';

    test('constructor', () => {
      const object = new ObjectLoader();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new ObjectLoader();
      expect(object).toBeInstanceOf(Loader);
    });

    test('load', async () => {
      const onLoad = vi.fn();
      const onProgress = vi.fn(); // unused
      const onError = vi.fn();

      const object = new ObjectLoader();

      // --------------------
      // good file
      object.load(_MeshTestFile, onLoad, onProgress, onError);

      // allow time for fetch and async code to compete before asserts
      // await resolveAfter(100);
      await flushPromises();
      expect(onLoad).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();

      vi.clearAllMocks();

      // --------------------
      // bad file
      object.load(_MissingTestFile, onLoad, onProgress, onError);

      // allow time for fetch and async code to compete before asserts
      // await resolveAfter(100);
      await flushPromises();
      expect(onLoad).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
      expect('missing test file').toHaveBeenWarned();
    });

    test('loadAsync', async () => {
      const onProgress = vi.fn(); // unused
      const object = new ObjectLoader();

      // --------------------
      // good file
      const loadedMesh = await object.loadAsync(_MeshTestFile, onProgress);

      expect(loadedMesh).toBeDefined();
      expect(loadedMesh).toBeInstanceOf(Mesh);
      expect(loadedMesh.geometry).toBeInstanceOf(BoxGeometry);
      expect(loadedMesh.material).toBeInstanceOf(MeshBasicMaterial);

      vi.clearAllMocks();

      // --------------------
      // bad file
      const missingMesh = await object.loadAsync(_MissingTestFile, onProgress).catch((err) => {
        // it will error
      });

      expect(missingMesh).toBeUndefined();
      expect('missing test file').toHaveBeenWarned();
    });

    test('parse', () => {
      const geometry = new BoxGeometry(1, 1, 1);
      const material = new MeshBasicMaterial();
      const mesh = new Mesh(geometry, material);

      const json = mesh.toJSON();
      const loader = new ObjectLoader();

      const onLoad = vi.fn();
      const outputObject = loader.parse(json, onLoad);

      expect(onLoad).toHaveBeenCalled();
      expect(outputObject).toStrictEqual(mesh);
    });

    test('parseAsync', async () => {
      const geometry = new BoxGeometry(1, 1, 1);
      const material = new MeshBasicMaterial();
      const mesh = new Mesh(geometry, material);

      const json = mesh.toJSON();
      const loader = new ObjectLoader();
      const outputObject = await loader.parseAsync(json);

      expect(outputObject).toStrictEqual(mesh);
    });

    // test.todo('parseShapes', () => {
    //   // parseShapes( json )
    //   // implement
    // });

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
