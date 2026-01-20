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
  describe('DRACOLoader', () => {
    let _instance;

    beforeAll(() => {
      _instance = new DRACOLoader();
    });

    // beforeEach(() => {
    //   instance = new DRACOLoader();
    // });

    test('constructor', () => {
      expect(_instance).toBeInstanceOf(DRACOLoader);
    });

    test.todo('setDecoderPath()', () => {
      // instance.setDecoderPath(path);
    });

    test.todo('setDecoderConfig()', () => {
      // instance.setDecoderConfig(config);
    });

    test.todo('setWorkerLimit()', () => {
      // instance.setWorkerLimit(workerLimit);
    });

    test.todo('load()', () => {
      // instance.load(url,onLoad,onProgress,onError);
    });

    test.todo('parse()', () => {
      // instance.parse(buffer,onLoad,onError);
    });

    test.todo('decodeDracoFile()', () => {
      // instance.decodeDracoFile(buffer,callback,attributeIDs,attributeTypes,vertexColorSpace);
    });

    test.todo('decodeGeometry()', () => {
      // instance.decodeGeometry(buffer,taskConfig);
    });

    test.todo('_createGeometry()', () => {
      // instance._createGeometry(geometryData);
    });

    test.todo('_assignVertexColorSpace()', () => {
      // instance._assignVertexColorSpace(attribute,inputColorSpace);
    });

    test.todo('_loadLibrary()', () => {
      // instance._loadLibrary(url,responseType);
    });

    test.todo('preload()', () => {
      // instance.preload();
    });

    test.todo('_initDecoder()', () => {
      // instance._initDecoder();
    });

    test.todo('_getWorker()', () => {
      // instance._getWorker(taskID,taskCost);
    });

    test.todo('_releaseTask()', () => {
      // instance._releaseTask(worker,taskID);
    });

    test.todo('debug()', () => {
      // instance.debug();
    });

    test.todo('dispose()', () => {
      // instance.dispose();
    });
  });
});
