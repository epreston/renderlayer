import { describe, expect, it, test, vi } from 'vitest';

import { Material } from '../src/Material.js';
import { MeshPhysicalMaterial } from '../src/MeshPhysicalMaterial.js';

describe('Materials', () => {
  describe('MeshPhysicalMaterial', () => {
    test('constructor', () => {
      const object = new MeshPhysicalMaterial();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new MeshPhysicalMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('isMeshPhysicalMaterial', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.isMeshPhysicalMaterial).toBeTruthy();
    });

    test('type', () => {
      const object = new MeshPhysicalMaterial();
      expect(object.type).toBe('MeshPhysicalMaterial');
    });

    test.todo('defines', () => {
      // implement
    });

    test.todo('clearcoatMap', () => {
      // implement
    });

    test.todo('clearcoatRoughness', () => {
      // implement
    });

    test.todo('clearcoatRoughnessMap', () => {
      // implement
    });

    test.todo('clearcoatNormalScale', () => {
      // implement
    });

    test.todo('clearcoatNormalMap', () => {
      // implement
    });

    test.todo('ior', () => {
      // implement
    });

    test.todo('reflectivity', () => {
      // implement
    });

    test.todo('iridescenceMap', () => {
      // implement
    });

    test.todo('iridescenceIOR', () => {
      // implement
    });

    test.todo('iridescenceThicknessRange', () => {
      // implement
    });

    test.todo('iridescenceThicknessMap', () => {
      // implement
    });

    test.todo('sheenColor', () => {
      // implement
    });

    test.todo('sheenColorMap', () => {
      // implement
    });

    test.todo('sheenRoughness', () => {
      // implement
    });

    test.todo('sheenRoughnessMap', () => {
      // implement
    });

    test.todo('transmissionMap', () => {
      // implement
    });

    test.todo('thickness', () => {
      // implement
    });

    test.todo('thicknessMap', () => {
      // implement
    });

    test.todo('attenuationDistance', () => {
      // implement
    });

    test.todo('attenuationColor', () => {
      // implement
    });

    test.todo('specularIntensity', () => {
      // implement
    });

    test.todo('specularIntensityMap', () => {
      // implement
    });

    test.todo('specularColor', () => {
      // implement
    });

    test.todo('specularColorMap', () => {
      // implement
    });

    test.todo('sheen', () => {
      // implement
    });

    test.todo('clearcoat', () => {
      // implement
    });

    test.todo('iridescence', () => {
      // implement
    });

    test.todo('transmission', () => {
      // implement
    });

    test.todo('copy', () => {
      // implement
    });
  });
});
