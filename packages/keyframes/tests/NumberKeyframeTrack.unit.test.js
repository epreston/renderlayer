import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { KeyframeTrack } from '../src/KeyframeTrack.js';
import { NumberKeyframeTrack } from '../src/NumberKeyframeTrack.js';

describe('Keyframes', () => {
  describe('NumberKeyframeTrack', () => {
    const parameters = {
      name: '.material.opacity',
      times: [0, 1],
      values: [0, 0.5],
      interpolation: NumberKeyframeTrack.DefaultInterpolation,
    };

    test('Instancing', () => {
      // name, times, values
      const object = new NumberKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object).toBeDefined();

      // name, times, values, interpolation
      const object_all = new NumberKeyframeTrack(
        parameters.name,
        parameters.times,
        parameters.values,
        parameters.interpolation
      );
      expect(object_all).toBeDefined();
    });

    test('Extending', () => {
      const object = new NumberKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object).toBeInstanceOf(KeyframeTrack);
    });
  });
});
