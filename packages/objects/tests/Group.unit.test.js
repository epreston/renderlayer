import { describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { Group } from '../src/Group.js';

describe('Objects', () => {
  describe('Group', () => {
    test('constructor', () => {
      const object = new Group();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const group = new Group();
      expect(group).toBeInstanceOf(Object3D);
    });

    test('isGroup', () => {
      const object = new Group();
      expect(object.isGroup).toBeTruthy();
    });

    test('type', () => {
      const object = new Group();
      expect(object.type === 'Group').toBeTruthy();
    });
  });
});
