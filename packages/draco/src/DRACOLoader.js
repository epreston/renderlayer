import { BufferAttribute, BufferGeometry } from '@renderlayer/buffers';
import { FileLoader, Loader } from '@renderlayer/loaders';
import { Color } from '@renderlayer/math';
import { LinearSRGBColorSpace, SRGBColorSpace } from '@renderlayer/shared';

import { DRACOWorker } from './DRACOWorker';

class DRACOLoader extends Loader {
  #decoderPath = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';
  #decoderConfig = {};
  // #decoderBinary = null;
  #decoderPending = null;

  #workerLimit = 4;
  #workerPool = [];
  #workerNextTaskID = 1;
  #workerSourceURL = '';

  #defaultAttributeIDs = {
    position: 'POSITION',
    normal: 'NORMAL',
    color: 'COLOR',
    uv: 'TEX_COORD'
  };

  #defaultAttributeTypes = {
    position: 'Float32Array',
    normal: 'Float32Array',
    color: 'Float32Array',
    uv: 'Float32Array'
  };

  constructor(manager) {
    super(manager);
  }

  setDecoderPath(path) {
    this.#decoderPath = path;

    return this;
  }

  setDecoderConfig(config) {
    this.#decoderConfig = config;

    return this;
  }

  setWorkerLimit(workerLimit) {
    this.#workerLimit = workerLimit;

    return this;
  }

  load(url, onLoad, onProgress, onError) {
    const loader = new FileLoader(this.manager);

    loader.setPath(this.path);
    loader.setResponseType('arraybuffer');
    loader.setRequestHeader(this.requestHeader);
    loader.setWithCredentials(this.withCredentials);

    loader.load(
      url,
      (buffer) => {
        this.parse(buffer, onLoad, onError);
      },
      onProgress,
      onError
    );
  }

  parse(buffer, onLoad, onError) {
    this.decodeDracoFile(buffer, onLoad, null, null, SRGBColorSpace).catch(onError);
  }

  decodeDracoFile(
    buffer,
    callback,
    attributeIDs,
    attributeTypes,
    vertexColorSpace = LinearSRGBColorSpace
  ) {
    const taskConfig = {
      attributeIDs: attributeIDs || this.#defaultAttributeIDs,
      attributeTypes: attributeTypes || this.#defaultAttributeTypes,
      useUniqueIDs: !!attributeIDs,
      vertexColorSpace: vertexColorSpace
    };

    return this.decodeGeometry(buffer, taskConfig).then(callback);
  }

  decodeGeometry(buffer, taskConfig) {
    const taskKey = JSON.stringify(taskConfig);

    // Check for an existing task using this buffer. A transferred buffer cannot be transferred
    // again from this thread.
    if (_taskCache.has(buffer)) {
      const cachedTask = _taskCache.get(buffer);

      if (cachedTask.key === taskKey) {
        return cachedTask.promise;
      } else if (buffer.byteLength === 0) {
        // Technically, it would be possible to wait for the previous task to complete,
        // transfer the buffer back, and decode again with the second configuration. That
        // is complex, and I don't know of any reason to decode a Draco buffer twice in
        // different ways, so this is left unimplemented.

        // prettier-ignore
        throw new Error(
          'DRACOLoader: Unable to re-decode a buffer with different ' +
          'settings. Buffer has already been transferred.'
        );
      }
    }

    //

    let worker;
    const taskID = this.#workerNextTaskID++;
    const taskCost = buffer.byteLength;

    // Obtain a worker and assign a task, and construct a geometry instance
    // when the task completes.
    const geometryPending = this.#getWorker(taskID, taskCost)
      .then((_worker) => {
        worker = _worker;

        return new Promise((resolve, reject) => {
          worker._callbacks[taskID] = { resolve, reject };

          worker.postMessage({ type: 'decode', id: taskID, taskConfig, buffer }, [buffer]);

          // this.debug();
        });
      })
      .then((message) => this.#createGeometry(message.geometry));

    // Remove task from the task list.
    // Note: replaced '.finally()' with '.catch().then()' block - iOS 11 support (#19416)
    geometryPending
      .catch(() => true)
      .then(() => {
        if (worker && taskID) {
          this.#releaseTask(worker, taskID);

          // this.debug();
        }
      });

    // Cache the task result.
    _taskCache.set(buffer, {
      key: taskKey,
      promise: geometryPending
    });

    return geometryPending;
  }

  #createGeometry(geometryData) {
    const geometry = new BufferGeometry();

    if (geometryData.index) {
      geometry.setIndex(new BufferAttribute(geometryData.index.array, 1));
    }

    for (const result of geometryData.attributes) {
      const name = result.name;
      const array = result.array;
      const itemSize = result.itemSize;

      const attribute = new BufferAttribute(array, itemSize);

      if (name === 'color') {
        this.#assignVertexColorSpace(attribute, result.vertexColorSpace);

        attribute.normalized = array instanceof Float32Array === false;
      }

      geometry.setAttribute(name, attribute);
    }

    return geometry;
  }

  #assignVertexColorSpace(attribute, inputColorSpace) {
    // While .drc files do not specify colorspace, the only 'official' tooling
    // is PLY and OBJ converters, which use sRGB. We'll assume sRGB when a .drc
    // file is passed into .load() or .parse(). GLTFLoader uses internal APIs
    // to decode geometry, and vertex colors are already Linear-sRGB in there.

    if (inputColorSpace !== SRGBColorSpace) return;

    const _color = new Color();

    for (let i = 0, il = attribute.count; i < il; i++) {
      _color.fromBufferAttribute(attribute, i).convertSRGBToLinear();
      attribute.setXYZ(i, _color.r, _color.g, _color.b);
    }
  }

  #loadLibrary(url, responseType) {
    const loader = new FileLoader(this.manager);
    loader.setPath(this.#decoderPath);
    loader.setResponseType(responseType);
    loader.setWithCredentials(this.withCredentials);

    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  preload() {
    this.#initDecoder();

    return this;
  }

  #initDecoder() {
    if (this.#decoderPending) return this.#decoderPending;

    const useJS = typeof WebAssembly !== 'object' || this.#decoderConfig.type === 'js';
    const librariesPending = [];

    if (useJS) {
      librariesPending.push(this.#loadLibrary('draco_decoder.js', 'text'));
    } else {
      librariesPending.push(this.#loadLibrary('draco_wasm_wrapper.js', 'text'));
      librariesPending.push(this.#loadLibrary('draco_decoder.wasm', 'arraybuffer'));
    }

    this.#decoderPending = Promise.all(librariesPending).then((libraries) => {
      const jsContent = libraries[0];

      if (!useJS) {
        this.#decoderConfig.wasmBinary = libraries[1];
      }

      const fn = DRACOWorker.toString();

      const body = [
        '/* draco decoder */',
        jsContent,
        '',
        '/* worker */',
        fn.substring(fn.indexOf('{') + 1, fn.lastIndexOf('}'))
      ].join('\n');

      this.#workerSourceURL = URL.createObjectURL(new Blob([body]));
    });

    return this.#decoderPending;
  }

  #getWorker(taskID, taskCost) {
    return this.#initDecoder().then(() => {
      if (this.#workerPool.length < this.#workerLimit) {
        const worker = new Worker(this.#workerSourceURL);

        // @ts-ignore
        worker._callbacks = {};
        // @ts-ignore
        worker._taskCosts = {};
        // @ts-ignore
        worker._taskLoad = 0;

        worker.postMessage({ type: 'init', decoderConfig: this.#decoderConfig });

        worker.onmessage = (e) => {
          const message = e.data;

          switch (message.type) {
            case 'decode':
              // @ts-ignore
              worker._callbacks[message.id].resolve(message);
              break;

            case 'error':
              // @ts-ignore
              worker._callbacks[message.id].reject(message);
              break;

            default:
              console.error(`DRACOLoader: Unexpected message, "${message.type}"`);
          }
        };

        this.#workerPool.push(worker);
      } else {
        this.#workerPool.sort((a, b) => (a._taskLoad > b._taskLoad ? -1 : 1));
      }

      const worker = this.#workerPool[this.#workerPool.length - 1];
      worker._taskCosts[taskID] = taskCost;
      worker._taskLoad += taskCost;
      return worker;
    });
  }

  #releaseTask(worker, taskID) {
    worker._taskLoad -= worker._taskCosts[taskID];
    delete worker._callbacks[taskID];
    delete worker._taskCosts[taskID];
  }

  debug() {
    // eslint-disable-next-line no-console
    console.log(
      'Task load: ',
      this.#workerPool.map((worker) => worker._taskLoad)
    );
  }

  dispose() {
    for (let i = 0; i < this.#workerPool.length; ++i) {
      this.#workerPool[i].terminate();
    }

    this.#workerPool.length = 0;

    if (this.#workerSourceURL !== '') {
      URL.revokeObjectURL(this.#workerSourceURL);
    }

    return this;
  }
}

const _taskCache = /* @__PURE__ */ new WeakMap();

export { DRACOLoader };
