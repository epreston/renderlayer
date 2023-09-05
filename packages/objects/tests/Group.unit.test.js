import { describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { ObjectLoader } from '@renderlayer/loaders';

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
      expect(object.type).toBe('Group');
    });

    test('from ObjectLoader', () => {
      const object = new Group();

      const json = object.toJSON();
      const loader = new ObjectLoader();
      const outputObject = loader.parse(json);

      expect(outputObject).toStrictEqual(object);
    });
  });
});
