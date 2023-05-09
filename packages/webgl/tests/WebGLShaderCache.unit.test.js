import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { WebGLShaderCache } from '../src/WebGLShaderCache.js';

describe('WebGLShaderCache', () => {
  let instance;

  beforeAll(() => {
    instance = new WebGLShaderCache();
  });

  // beforeEach(() => {
  //   instance = new WebGLShaderCache();
  // });

  test('Instancing', () => {
    expect(instance).toBeInstanceOf(WebGLShaderCache);
  });

  test.todo('update()', () => {
    // instance.update(material);
  });

  test.todo('remove()', () => {
    // instance.remove(material);
  });

  test.todo('getVertexShaderID()', () => {
    // instance.getVertexShaderID(material);
  });

  test.todo('getFragmentShaderID()', () => {
    // instance.getFragmentShaderID(material);
  });

  test.todo('dispose()', () => {
    // instance.dispose();
  });

  // test.todo('_getShaderCacheForMaterial()', () => {
  //   // instance._getShaderCacheForMaterial(material);
  // });

  // test.todo('_getShaderStage()', () => {
  //   // instance._getShaderStage(code);
  // });
});
