import { describe, expect, it, test, vi } from 'vitest';

import { KeyframeTrack } from '../src/KeyframeTrack.js';
import { ColorKeyframeTrack } from '../src/ColorKeyframeTrack.js';

describe('Keyframes', () => {
  describe('ColorKeyframeTrack', () => {
    const parameters = {
      name: '.material.diffuse',
      times: [0, 1],
      values: [0, 0.5, 1.0],
      interpolation: ColorKeyframeTrack.DefaultInterpolation
    };

    test('constructor', () => {
      // name, times, values
      const object = new ColorKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object).toBeDefined();

      // name, times, values, interpolation
      const object_all = new ColorKeyframeTrack(
        parameters.name,
        parameters.times,
        parameters.values,
        parameters.interpolation
      );
      expect(object_all).toBeDefined();
    });

    test('extends', () => {
      const object = new ColorKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object).toBeInstanceOf(KeyframeTrack);
    });
  });
});
