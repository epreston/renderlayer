import { describe, expect, it, test, vi } from 'vitest';

import { InstancedBufferAttribute } from '@renderlayer/buffers';
import { Mesh } from '../src/Mesh.js';

import { InstancedMesh } from '../src/InstancedMesh.js';

describe('Objects', () => {
  describe('InstancedMesh', () => {
    test('constructor', () => {
      const object = new InstancedMesh();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new InstancedMesh();
      expect(object).toBeInstanceOf(Mesh);
    });

    test('isInstancedMesh', () => {
      const object = new InstancedMesh();
      expect(object.isInstancedMesh).toBeTruthy();
    });

    test('instanceMatrix', () => {
      const object = new InstancedMesh();
      const instanceMatrix = object.instanceMatrix;
      expect(instanceMatrix).toBeInstanceOf(InstancedBufferAttribute);
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
