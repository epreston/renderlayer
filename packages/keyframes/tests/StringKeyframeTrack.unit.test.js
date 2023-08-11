import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { KeyframeTrack } from '../src/KeyframeTrack.js';
import { StringKeyframeTrack } from '../src/StringKeyframeTrack.js';

describe('Keyframes', () => {
  describe('StringKeyframeTrack', () => {
    const parameters = {
      name: '.name',
      times: [0, 1],
      values: ['foo', 'bar'],
      interpolation: StringKeyframeTrack.DefaultInterpolation
    };

    test('Instancing', () => {
      // name, times, values
      const object = new StringKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object).toBeDefined();

      // name, times, values, interpolation
      const object_all = new StringKeyframeTrack(
        parameters.name,
        parameters.times,
        parameters.values,
        parameters.interpolation
      );
      expect(object_all).toBeDefined();
    });

    test('Extending', () => {
      const object = new StringKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object).toBeInstanceOf(KeyframeTrack);
    });
  });
});
