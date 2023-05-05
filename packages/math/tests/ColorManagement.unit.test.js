import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { ColorManagement } from '../src/ColorManagement.js';

describe('Maths', () => {
  describe('ColorManagement', () => {
    test('enabled', () => {
      expect(ColorManagement.enabled).toBeTruthy();
    });

    test('legacyMode', () => {
      expect(ColorManagement.legacyMode).toBeFalsy();
    });

    test.todo('workingColorSpace', () => {
      // implement
    });

    test.todo('convert', () => {
      // implement
    });

    test.todo('fromWorkingColorSpace', () => {
      // implement
    });

    test.todo('toWorkingColorSpace', () => {
      // implement
    });

    test.todo('SRGBToLinear', () => {
      // implement
    });

    test.todo('LinearToSRGB', () => {
      // implement
    });
  });
});
