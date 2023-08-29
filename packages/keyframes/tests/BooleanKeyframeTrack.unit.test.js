import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { KeyframeTrack } from '../src/KeyframeTrack.js';
import { BooleanKeyframeTrack } from '../src/BooleanKeyframeTrack.js';

describe('Keyframes', () => {
  describe('BooleanKeyframeTrack', () => {
    const parameters = {
      name: '.visible',
      times: [0, 1],
      values: [true, false],
      interpolation: BooleanKeyframeTrack.DefaultInterpolation
    };

    test('constructor', () => {
      // name, times, values
      const object = new BooleanKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object).toBeDefined();

      // name, times, values, interpolation
      const object_all = new BooleanKeyframeTrack(
        parameters.name,
        parameters.times,
        parameters.values,
        parameters.interpolation
      );
      expect(object_all).toBeDefined();
    });

    test('extends', () => {
      const object = new BooleanKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object).toBeInstanceOf(KeyframeTrack);
    });
  });
});
