import { describe, expect, it, test, vi } from 'vitest';

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

    test('isShaderMaterial', () => {
      const object = new ShaderMaterial();
      expect(object.isShaderMaterial).toBeTruthy();
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

    test('vertexShader', () => {
      const object = new ShaderMaterial();
      expect(object.vertexShader).toBeDefined();
    });

    test('fragmentShader', () => {
      const object = new ShaderMaterial();
      expect(object.fragmentShader).toBeDefined();
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

    test('extensions', () => {
      const object = new ShaderMaterial();
      expect(object.extensions).toBeDefined();
    });

    test('defaultAttributeValues', () => {
      const object = new ShaderMaterial();
      expect(object.defaultAttributeValues).toBeDefined();
    });

    test('index0AttributeName', () => {
      const object = new ShaderMaterial();
      expect(object.index0AttributeName).toBeUndefined();
    });

    test('uniformsNeedUpdate', () => {
      const object = new ShaderMaterial();
      expect(object.uniformsNeedUpdate).toBe(false);
    });

    test('glslVersion', () => {
      const object = new ShaderMaterial();
      expect(object.glslVersion).toBeNull();
    });

    test('copy', () => {
      const object = new ShaderMaterial();
      const object2 = new ShaderMaterial();

      // EP: incomplete

      object2.linewidth = 2;
      object2.wireframe = true;
      object2.wireframeLinewidth = 2;
      object2.fog = true;
      object2.lights = true;
      object2.clipping = true;
      object2.forceSinglePass = false;

      object.copy(object2);

      // uuid will be different
      object.uuid = object2.uuid;

      expect(object).not.toBe(object2);
      expect(object).toStrictEqual(object2);
    });

    test('toJSON', () => {
      const object = new ShaderMaterial();

      // uuid will be different
      object.uuid = 'd8c485c3-df12-4143-9149-b249facd67f7';

      expect(object.toJSON()).toMatchSnapshot();
    });
  });
});
