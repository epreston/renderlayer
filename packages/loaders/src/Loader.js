import { DefaultLoadingManager, LoadingManager } from './LoadingManager.js';

class Loader {
  manager;

  crossOrigin = 'anonymous';
  withCredentials = false;
  path = '';
  resourcePath = '';
  requestHeader = {};

  /** @param {LoadingManager} [manager]  */
  constructor(manager) {
    this.manager = manager !== undefined ? manager : DefaultLoadingManager;
  }

  load(/* url, onLoad, onProgress, onError */) {}

  loadAsync(url, onProgress) {
    const scope = this;

    return new Promise(function (resolve, reject) {
      // @ts-ignore
      scope.load(url, resolve, onProgress, reject);
    });
  }

  parse(/* data */) {}

  setCrossOrigin(crossOrigin) {
    this.crossOrigin = crossOrigin;
    return this;
  }

  setWithCredentials(value) {
    this.withCredentials = value;
    return this;
  }

  setPath(path) {
    this.path = path;
    return this;
  }

  setResourcePath(resourcePath) {
    this.resourcePath = resourcePath;
    return this;
  }

  setRequestHeader(requestHeader) {
    this.requestHeader = requestHeader;
    return this;
  }
}

export { Loader };
