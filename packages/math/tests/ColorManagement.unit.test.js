import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import {
  DisplayP3ColorSpace,
  LinearSRGBColorSpace,
  NoColorSpace,
  SRGBColorSpace
} from '@renderlayer/shared';

import { Color } from '../src/Color.js';
import { ColorManagement, LinearToSRGB, SRGBToLinear } from '../src/ColorManagement.js';

describe('Math', () => {
  describe('ColorManagement', () => {
    let enabledState;
    let testColor;

    beforeAll(() => {
      // capture default state
      enabledState = ColorManagement.enabled;
    });

    beforeEach(() => {
      // reset state
      ColorManagement.enabled = enabledState;
      testColor = new Color(0.5, 0.5, 0.5);
    });

    test('enabled', () => {
      expect(ColorManagement.enabled).toBeTruthy();
    });

    test('workingColorSpace', () => {
      expect(ColorManagement.workingColorSpace).toBe(LinearSRGBColorSpace);
    });

    test('convert - color without source or target, returns the color', () => {
      expect(ColorManagement.convert(testColor)).toBe(testColor);
    });

    test('convert - enabled is false, returns the color', () => {
      ColorManagement.enabled = false;
      expect(ColorManagement.convert(testColor, LinearSRGBColorSpace, SRGBColorSpace)).toBe(
        testColor
      );
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
