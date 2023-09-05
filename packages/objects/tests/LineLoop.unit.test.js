import { describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { ObjectLoader } from '@renderlayer/loaders';

import { Line } from '../src/Line.js';
import { LineLoop } from '../src/LineLoop.js';

describe('Objects', () => {
  describe('LineLoop', () => {
    test('constructor', () => {
      const object = new LineLoop();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const lineLoop = new LineLoop();

      expect(lineLoop).toBeInstanceOf(Object3D);
      expect(lineLoop).toBeInstanceOf(Line);
    });

    test('isLineLoop', () => {
      const object = new LineLoop();
      expect(object.isLineLoop).toBeTruthy();
    });

    test('type', () => {
      const object = new LineLoop();
      expect(object.type).toBe('LineLoop');
    });

    test('from ObjectLoader', () => {
      const object = new LineLoop();

      const json = object.toJSON();
      const loader = new ObjectLoader();
      const outputObject = loader.parse(json);

      expect(outputObject).toStrictEqual(object);
    });
  });
});
