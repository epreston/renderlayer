import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { Group } from '../src/Group.js';

describe('Objects', () => {
  describe('Group', () => {
    test('Instancing', () => {
      const object = new Group();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const group = new Group();
      expect(group).toBeInstanceOf(Object3D);
    });

    test('type', () => {
      const object = new Group();
      expect(object.type === 'Group').toBeTruthy();
    });

    test('isGroup', () => {
      const object = new Group();
      expect(object.isGroup).toBeTruthy();
    });
  });
});
