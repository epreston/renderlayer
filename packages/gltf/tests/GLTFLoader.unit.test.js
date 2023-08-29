import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { GLTFLoader } from '../src/GLTFLoader.js';

describe('GLTF', () => {
  describe('GLTFLoader', () => {
    test('constructor', () => {
      const object = new GLTFLoader();
      expect(object).toBeDefined();
    });
  });
});
