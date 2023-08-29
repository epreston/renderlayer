import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

// import { BufferAttribute, BufferGeometry } from '@renderlayer/buffers';
// import { FileLoader, Loader } from '@renderlayer/loaders';
// import { Color } from '@renderlayer/math';
// import { LinearSRGBColorSpace, SRGBColorSpace } from '@renderlayer/shared';
import { DRACOLoader } from '../src/DRACOLoader.js';

// vi.mock('@renderlayer/buffers');
// vi.mock('@renderlayer/loaders');
// vi.mock('@renderlayer/math');
// vi.mock('@renderlayer/shared');

describe('DRACO', () => {
  describe.todo('DRACOLoader', () => {
    let instance;

    beforeAll(() => {
      instance = new DRACOLoader();
    });

    // beforeEach(() => {
    //   instance = new DRACOLoader();
    // });

    test('constructor', () => {
      expect(instance).toBeInstanceOf(DRACOLoader);
    });

    test('setDecoderPath()', () => {
      // instance.setDecoderPath(path);
    });

    test('setDecoderConfig()', () => {
      // instance.setDecoderConfig(config);
    });

    test('setWorkerLimtest()', () => {
      // instance.setWorkerLimtest(workerLimit);
    });

    test('load()', () => {
      // instance.load(url,onLoad,onProgress,onError);
    });

    test('parse()', () => {
      // instance.parse(buffer,onLoad,onError);
    });

    test('decodeDracoFile()', () => {
      // instance.decodeDracoFile(buffer,callback,attributeIDs,attributeTypes,vertexColorSpace);
    });

    test('decodeGeometry()', () => {
      // instance.decodeGeometry(buffer,taskConfig);
    });

    test('_createGeometry()', () => {
      // instance._createGeometry(geometryData);
    });

    test('_assignVertexColorSpace()', () => {
      // instance._assignVertexColorSpace(attribute,inputColorSpace);
    });

    test('_loadLibrary()', () => {
      // instance._loadLibrary(url,responseType);
    });

    test('preload()', () => {
      // instance.preload();
    });

    test('_initDecoder()', () => {
      // instance._initDecoder();
    });

    test('_getWorker()', () => {
      // instance._getWorker(taskID,taskCost);
    });

    test('_releaseTask()', () => {
      // instance._releaseTask(worker,taskID);
    });

    test('debug()', () => {
      // instance.debug();
    });

    test('dispose()', () => {
      // instance.dispose();
    });
  });
});
