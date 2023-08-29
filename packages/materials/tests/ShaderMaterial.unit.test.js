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

    test('defines', () => {
      const object = new ShaderMaterial();
      expect(object.defines).toBeInstanceOf(Object);
    });

    test('uniforms', () => {
      const object = new ShaderMaterial();
      expect(object.uniforms).toBeInstanceOf(Object);
    });

    test('uniformsGroups', () => {
      const object = new ShaderMaterial();
      expect(object.uniformsGroups).toBeInstanceOf(Array);
    });

    test.todo('vertexShader', () => {
      // implement
    });

    test.todo('fragmentShader', () => {
      // implement
    });

    test('linewidth', () => {
      const object = new ShaderMaterial();
      expect(object.linewidth).toBe(1);
    });

    test('wireframe', () => {
      const object = new ShaderMaterial();
      expect(object.wireframe).toBe(false);
    });

    test('wireframeLinewidth', () => {
      const object = new ShaderMaterial();
      expect(object.wireframeLinewidth).toBe(1);
    });

    test('fog', () => {
      const object = new ShaderMaterial();
      expect(object.fog).toBe(false);
    });

    test('lights', () => {
      const object = new ShaderMaterial();
      expect(object.lights).toBe(false);
    });

    test('clipping', () => {
      const object = new ShaderMaterial();
      expect(object.clipping).toBe(false);
    });

    test('forceSinglePass', () => {
      const object = new ShaderMaterial();
      expect(object.forceSinglePass).toBe(true);
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
