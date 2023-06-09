import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Material } from '../src/Material.js';
import { MeshStandardMaterial } from '../src/MeshStandardMaterial.js';

describe('Materials', () => {
  describe('MeshStandardMaterial', () => {
    test('Instancing', () => {
      const object = new MeshStandardMaterial();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new MeshStandardMaterial();
      expect(object).toBeInstanceOf(Material);
    });

    test.todo('defines', () => {
      // implement
    });

    test('type', () => {
      const object = new MeshStandardMaterial();
      expect(object.type).toBe('MeshStandardMaterial');
    });

    test.todo('color', () => {
      // diffuse color
      // implement
    });

    test.todo('roughness', () => {
      // implement
    });

    test.todo('metalness', () => {
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

    test.todo('emissive', () => {
      // implement
    });

    test.todo('emissiveIntensity', () => {
      // implement
    });

    test.todo('emissiveMap', () => {
      // implement
    });

    test.todo('bumpMap', () => {
      // implement
    });

    test.todo('bumpScale', () => {
      // implement
    });

    test.todo('normalMap', () => {
      // implement
    });

    test.todo('normalMapType', () => {
      // implement
    });

    test.todo('normalScale', () => {
      // implement
    });

    test.todo('displacementMap', () => {
      // implement
    });

    test.todo('displacementScale', () => {
      // implement
    });

    test.todo('displacementBias', () => {
      // implement
    });

    test.todo('roughnessMap', () => {
      // implement
    });

    test.todo('metalnessMap', () => {
      // implement
    });

    test.todo('alphaMap', () => {
      // implement
    });

    test.todo('envMap', () => {
      // implement
    });

    test.todo('envMapIntensity', () => {
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

    test.todo('flatShading', () => {
      // implement
    });

    test.todo('fog', () => {
      // implement
    });

    test('isMeshStandardMaterial', () => {
      const object = new MeshStandardMaterial();
      expect(object.isMeshStandardMaterial).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });
  });
});
