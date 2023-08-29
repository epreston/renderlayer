import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Material } from '../src/Material.js';
import { ShaderMaterial } from '../src/ShaderMaterial.js';

describe('Materials', () => {
  describe('ShaderMaterial', () => {
    test('constructor', () => {
      const object = new ShaderMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new ShaderMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('type', () => {
      const object = new ShaderMaterial();
      expect(object.type === 'ShaderMaterial').toBeTruthy();
    });

    test.todo('defines', () => {
      // implement
    });

    test.todo('uniforms', () => {
      // implement
    });

    test.todo('uniformsGroups', () => {
      // implement
    });

    test.todo('vertexShader', () => {
      // implement
    });

    test.todo('fragmentShader', () => {
      // implement
    });

    test.todo('linewidth', () => {
      // implement
    });

    test.todo('wireframe', () => {
      // implement
    });

    test.todo('wireframeLinewidth', () => {
      // implement
    });

    test.todo('fog', () => {
      // implement
    });

    test.todo('lights', () => {
      // implement
    });

    test.todo('clipping', () => {
      // implement
    });

    test.todo('extensions', () => {
      // implement
    });

    test.todo('defaultAttributeValues', () => {
      // implement
    });

    test.todo('index0AttributeName', () => {
      // implement
    });

    test.todo('uniformsNeedUpdate', () => {
      // implement
    });

    test.todo('glslVersion', () => {
      // implement
    });

    test('isShaderMaterial', () => {
      const object = new ShaderMaterial();
      expect(object.isShaderMaterial).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });

    test.todo('toJSON', () => {
      // implement
    });
  });
});
