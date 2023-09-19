import { describe, expect, it, test, vi } from 'vitest';

import { ColorManagement, SRGBToLinear, LinearToSRGB } from '../src/ColorManagement.js';

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

    test.each([
      [0.0, 0.0],
      [0.25, 0.05087609],
      [0.5, 0.21404114],
      [0.75, 0.52252155],
      [1.0, 1.0]
    ])('SRGBToLinear(%i) -> %i', (srgb, linear) => {
      expect(SRGBToLinear(srgb)).toBeCloseTo(linear, 8);
    });

    test.each([
      [0.0, 0.0],
      [0.05087609, 0.25000606],
      [0.21404114, 0.5000057],
      [0.52252155, 0.75000348],
      [1.0, 1.0]
    ])('LinearToSRGB(%i) -> %i', (linear, srgb) => {
      expect(LinearToSRGB(linear)).toBeCloseTo(srgb, 8);
    });
  });
});
