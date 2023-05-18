import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { Bone } from '../src/Bone.js';

describe('Objects', () => {
  describe('Bone', () => {
    test('Instancing', () => {
      const object = new Bone();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const bone = new Bone();
      expect(bone).toBeInstanceOf(Object3D);
    });

    test('type', () => {
      const object = new Bone();
      expect(object.type).toBe('Bone');
    });

    test('isBone', () => {
      const object = new Bone();
      expect(object.isBone).toBeTruthy();
    });
  });
});
