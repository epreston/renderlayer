import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Object3D } from '@renderlayer/core';
import { Line } from '../src/Line.js';
import { LineLoop } from '../src/LineLoop.js';

describe('Objects', () => {
  describe('LineLoop', () => {
    test('Instancing', () => {
      const object = new LineLoop();
      expect(object).toBeDefined();
    });

    test('Extending', () => {
      const lineLoop = new LineLoop();

      expect(lineLoop).toBeInstanceOf(Object3D);
      expect(lineLoop).toBeInstanceOf(Line);
    });

    test('type', () => {
      const object = new LineLoop();
      expect(object.type).toBe('LineLoop');
    });

    test('isLineLoop', () => {
      const object = new LineLoop();
      expect(object.isLineLoop).toBeTruthy();
    });
  });
});
