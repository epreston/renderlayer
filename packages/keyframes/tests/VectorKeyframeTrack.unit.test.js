import { describe, expect, it, test, vi } from 'vitest';

import { KeyframeTrack } from '../src/KeyframeTrack.js';
import { VectorKeyframeTrack } from '../src/VectorKeyframeTrack.js';

describe('Keyframes', () => {
  describe('VectorKeyframeTrack', () => {
    const parameters = {
      name: '.force',
      times: [0],
      values: [0.5, 0.5, 0.5],
      interpolation: VectorKeyframeTrack.DefaultInterpolation
    };

    test('constructor', () => {
      // name, times, values
      const object = new VectorKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object).toBeDefined();

      // name, times, values, interpolation
      const object_all = new VectorKeyframeTrack(
        parameters.name,
        parameters.times,
        parameters.values,
        parameters.interpolation
      );
      expect(object_all).toBeDefined();
    });

    test('extends', () => {
      const object = new VectorKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object).toBeInstanceOf(KeyframeTrack);
    });
  });
});
