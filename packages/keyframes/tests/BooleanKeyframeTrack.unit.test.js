import { describe, expect, it, test, vi } from 'vitest';

import { InterpolateDiscrete } from '@renderlayer/shared';
import { KeyframeTrack } from '../src/KeyframeTrack.js';
import { BooleanKeyframeTrack } from '../src/BooleanKeyframeTrack.js';

describe('Keyframes', () => {
  describe('BooleanKeyframeTrack', () => {
    const parameters = {
      name: '.visible',
      times: [0, 1],
      values: [true, false],
      interpolation: InterpolateDiscrete
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
      expect(object.name).toBe(parameters.name);
    });

    test('ValueTypeName', () => {
      const object = new BooleanKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object.ValueTypeName).toBe('bool');
    });

    test('ValueBufferType', () => {
      const object = new BooleanKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object.ValueBufferType).toBe(Array);
    });

    test('DefaultInterpolation', () => {
      const object = new BooleanKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object.DefaultInterpolation).toBe(InterpolateDiscrete);
    });

    test('InterpolantFactoryMethodLinear', () => {
      const object = new BooleanKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object.InterpolantFactoryMethodLinear).toBeUndefined();
    });

    test('InterpolantFactoryMethodSmooth', () => {
      const object = new BooleanKeyframeTrack(parameters.name, parameters.times, parameters.values);
      expect(object.InterpolantFactoryMethodSmooth).toBeUndefined();
    });
  });
});
