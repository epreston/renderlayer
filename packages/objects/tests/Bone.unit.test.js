import { describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { Bone } from '../src/Bone.js';

describe('Objects', () => {
  describe('Bone', () => {
    test('constructor', () => {
      const object = new Bone();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const bone = new Bone();
      expect(bone).toBeInstanceOf(Object3D);
    });

    test('isBone', () => {
      const object = new Bone();
      expect(object.isBone).toBeTruthy();
    });

    test('type', () => {
      const object = new Bone();
      expect(object.type).toBe('Bone');
    });
  });
});
