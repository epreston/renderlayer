import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Mesh } from '../src/Mesh.js';
import { InstancedMesh } from '../src/InstancedMesh.js';

describe('Objects', () => {
  describe('InstancedMesh', () => {
    test('Instancing', () => {
      const object = new InstancedMesh();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const object = new InstancedMesh();
      expect(object).toBeInstanceOf(Mesh);
    });

    test.todo('instanceMatrix', () => {
      // implement
    });

    test.todo('instanceColor', () => {
      // implement
    });

    test.todo('count', () => {
      // implement
    });

    test.todo('frustumCulled', () => {
      // implement
    });

    test('isInstancedMesh', () => {
      const object = new InstancedMesh();
      expect(object.isInstancedMesh).toBeTruthy();
    });

    test.todo('copy', () => {
      // implement
    });

    test.todo('getColorAt', () => {
      // implement
    });

    test.todo('getMatrixAt', () => {
      // implement
    });

    test.todo('raycast', () => {
      // implement
    });

    test.todo('setColorAt', () => {
      // implement
    });

    test.todo('setMatrixAt', () => {
      // implement
    });

    test.todo('updateMorphTargets', () => {
      // signature defined, no implementation
      // implement
    });

    test('dispose', () => {
      const object = new InstancedMesh();
      object.dispose();

      expect(object).toBeDefined();
    });
  });
});
