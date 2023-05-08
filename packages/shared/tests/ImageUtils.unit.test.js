// @vitest-environment jsdom

import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { ImageUtils } from '../src/ImageUtils.js';

describe('Shared', () => {
  describe('ImageUtils', () => {
    test('getDataURL', () => {
      expect(ImageUtils.getDataURL).toBeDefined();
    });

    test('sRGBToLinear', () => {
      expect(ImageUtils.sRGBToLinear).toBeDefined();
    });
  });
});
