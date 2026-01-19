import { describe, expect, it, test, vi } from 'vitest';

import { InterpolateLinear } from '@renderlayer/shared';
import { KeyframeTrack } from '../src/KeyframeTrack.js';
import { VectorKeyframeTrack } from '../src/VectorKeyframeTrack.js';

describe('Keyframes', () => {
  describe('VectorKeyframeTrack', () => {
    const parameters = {
      name: '.force',
      times: [0],
      values: [0.5, 0.5, 0.5],
      interpolation: InterpolateLinear
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
      expect(object.name).toBe(parameters.name);
    });

    test('ValueTypeName', () => {
      const object = new VectorKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object.ValueTypeName).toBe('vector');
    });
  });
});
