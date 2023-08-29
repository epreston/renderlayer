import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { KeyframeTrack } from '../src/KeyframeTrack.js';
import { QuaternionKeyframeTrack } from '../src/QuaternionKeyframeTrack.js';

describe('Keyframes', () => {
  describe('QuaternionKeyframeTrack', () => {
    const parameters = {
      name: '.rotation',
      times: [0],
      values: [0.5, 0.5, 0.5, 1],
      interpolation: QuaternionKeyframeTrack.DefaultInterpolation
    };

    test('constructor', () => {
      // name, times, values
      const object = new QuaternionKeyframeTrack(
        parameters.name,
        parameters.times,
        parameters.values
      );
      expect(object).toBeDefined();

      // name, times, values, interpolation
      const object_all = new QuaternionKeyframeTrack(
        parameters.name,
        parameters.times,
        parameters.values,
        parameters.interpolation
      );
      expect(object_all).toBeDefined();
    });

    test('extends', () => {
      const object = new QuaternionKeyframeTrack(
        parameters.name,
        parameters.times,
        parameters.values
      );
      expect(object).toBeInstanceOf(KeyframeTrack);
    });
  });
});
