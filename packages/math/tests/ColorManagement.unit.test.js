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

    test('convert - color with same source or target, returns the color', () => {
      expect(ColorManagement.convert(testColor, LinearSRGBColorSpace, LinearSRGBColorSpace)).toBe(
        testColor
      );
    });

    test('convert - enabled is false, returns the color', () => {
      ColorManagement.enabled = false;
      expect(ColorManagement.convert(testColor, LinearSRGBColorSpace, SRGBColorSpace)).toBe(
        testColor
      );
    });

    test('convert - unsupported throws error', () => {
      expect(() => ColorManagement.convert(testColor, LinearSRGBColorSpace, 'ICtCp')).toThrowError(
        'Unsupported'
      );
    });

    test('fromWorkingColorSpace - SRGBColorSpace', () => {
      const color = ColorManagement.fromWorkingColorSpace(testColor, SRGBColorSpace);

      expect(color.r).toBeCloseTo(0.73536064, 8);
      expect(color.g).toBeCloseTo(0.73536064, 8);
      expect(color.b).toBeCloseTo(0.73536064, 8);
    });

    test('fromWorkingColorSpace - LinearSRGBColorSpace', () => {
      const color = ColorManagement.fromWorkingColorSpace(testColor, LinearSRGBColorSpace);

      expect(color.r).toBeCloseTo(0.5);
      expect(color.g).toBeCloseTo(0.5);
      expect(color.b).toBeCloseTo(0.5);
    });

    test('fromWorkingColorSpace - DisplayP3ColorSpace', () => {
      const color = ColorManagement.fromWorkingColorSpace(testColor, DisplayP3ColorSpace);

      expect(color.r).toBeCloseTo(0.735361, 6);
      expect(color.g).toBeCloseTo(0.735361, 6);
      expect(color.b).toBeCloseTo(0.735361, 6);
    });

    test('toWorkingColorSpace - SRGBColorSpace', () => {
      const color = ColorManagement.toWorkingColorSpace(testColor, SRGBColorSpace);

      expect(color.r).toBeCloseTo(0.21404114, 8);
      expect(color.g).toBeCloseTo(0.21404114, 8);
      expect(color.b).toBeCloseTo(0.21404114, 8);
    });

    test('toWorkingColorSpace - LinearSRGBColorSpace', () => {
      const color = ColorManagement.toWorkingColorSpace(testColor, LinearSRGBColorSpace);

      expect(color.r).toBeCloseTo(0.5);
      expect(color.g).toBeCloseTo(0.5);
      expect(color.b).toBeCloseTo(0.5);
    });

    test('toWorkingColorSpace - DisplayP3ColorSpace', () => {
      const color = ColorManagement.toWorkingColorSpace(testColor, DisplayP3ColorSpace);

      expect(color.r).toBeCloseTo(0.2140411, 6);
      expect(color.g).toBeCloseTo(0.2140411, 6);
      expect(color.b).toBeCloseTo(0.2140411, 6);
    });

    test.each([
      [0.0, 0.0],
      [0.25, 0.05087609],
      [0.5, 0.21404114],
      [0.75, 0.52252155],
      [1.0, 1.0]
    ])('SRGBToLinear(%f) -> %f', (srgb, linear) => {
      expect(SRGBToLinear(srgb)).toBeCloseTo(linear, 8);
    });

    test.each([
      [0.0, 0.0],
      [0.05087609, 0.25000606],
      [0.21404114, 0.5000057],
      [0.52252155, 0.75000348],
      [1.0, 1.0]
    ])('LinearToSRGB(%f) -> %f', (linear, srgb) => {
      expect(LinearToSRGB(linear)).toBeCloseTo(srgb, 8);
    });
  });
});
