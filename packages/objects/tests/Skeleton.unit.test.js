import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Skeleton } from '../src/Skeleton.js';

describe('Objects', () => {
  describe('Skeleton', () => {
    test('Instancing', () => {
      const object = new Skeleton();
      expect(object).toBeDefined();
    });

    test.todo('uuid', () => {
      // implement
    });

    test.todo('bones', () => {
      // implement
    });

    test.todo('boneInverses', () => {
      // implement
    });

    test.todo('boneMatrices', () => {
      // implement
    });

    test.todo('boneTexture', () => {
      // implement
    });

    test.todo('boneTextureSize', () => {
      // implement
    });

    test.todo('frame', () => {
      // implement
    });

    test.todo('init', () => {
      // implement
    });

    test.todo('calculateInverses', () => {
      // implement
    });

    test.todo('pose', () => {
      // implement
    });

    test.todo('update', () => {
      // implement
    });

    test.todo('clone', () => {
      // implement
    });

    test.todo('computeBoneTexture', () => {
      // implement
    });

    test.todo('getBoneByName', () => {
      // implement
    });

    test('dispose', () => {
      const object = new Skeleton();
      object.dispose();

      expect(object).toBeDefined();
    });

    test.todo('fromJSON', () => {
      // implement
    });

    test.todo('toJSON', () => {
      // implement
    });
  });
});
