import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Material } from '../src/Material.js';
import { MeshBasicMaterial } from '../src/MeshBasicMaterial.js';

describe('Materials', () => {
  describe('MeshBasicMaterial', () => {
    test('Instancing', () => {
      const object = new MeshBasicMaterial();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new MeshBasicMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test('type', () => {
      const object = new MeshBasicMaterial();
      expect(object.type === 'MeshBasicMaterial').toBeTruthy();
    });

    test.todo('color', () => {
      // implement
    });

    test.todo('map', () => {
      // implement
    });

    test.todo('lightMap', () => {
      // implement
    });

    test.todo('lightMapIntensity', () => {
      // implement
    });

    test.todo('aoMap', () => {
      // implement
    });

    test.todo('aoMapIntensity', () => {
      // implement
    });

    test.todo('specularMap', () => {
      // implement
    });

    test.todo('alphaMap', () => {
      // implement
    });

    test.todo('envMap', () => {
      // implement
    });

    test.todo('combine', () => {
      // implement
    });

    test.todo('reflectivity', () => {
      // implement
    });

    test.todo('refractionRatio', () => {
      // implement
    });

    test.todo('wireframe', () => {
      // implement
    });

    test.todo('wireframeLinewidth', () => {
      // implement
    });

    test.todo('wireframeLinecap', () => {
      // implement
    });

    test.todo('wireframeLinejoin', () => {
      // implement
    });

    test.todo('fog', () => {
      // implement
    });

    test('isMeshBasicMaterial', () => {
      const object = new MeshBasicMaterial();
      expect(object.isMeshBasicMaterial).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });
  });
});
