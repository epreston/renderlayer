import { describe, expect, it, test, vi } from 'vitest';

import { InterpolateDiscrete } from '@renderlayer/shared';
import { KeyframeTrack } from '../src/KeyframeTrack.js';
import { StringKeyframeTrack } from '../src/StringKeyframeTrack.js';

describe('Keyframes', () => {
  describe('StringKeyframeTrack', () => {
    const _parameters = {
      name: '.name',
      times: [0, 1],
      values: ['foo', 'bar'],
      interpolation: InterpolateDiscrete
    };

    test('constructor', () => {
      // name, times, values
      const object = new StringKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values
      );
      expect(object).toBeDefined();

      // name, times, values, interpolation
      const object_all = new StringKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values,
        _parameters.interpolation
      );
      expect(object_all).toBeDefined();
    });

    test('extends', () => {
      const object = new StringKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values
      );
      expect(object).toBeInstanceOf(KeyframeTrack);
      expect(object.name).toBe(_parameters.name);
    });

    test('ValueTypeName', () => {
      const object = new StringKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values
      );
      expect(object.ValueTypeName).toBe('string');
    });

    test('ValueBufferType', () => {
      const object = new StringKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values
      );
      expect(object.ValueBufferType).toBe(Array);
    });

    test('DefaultInterpolation', () => {
      const object = new StringKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values
      );
      expect(object.DefaultInterpolation).toBe(InterpolateDiscrete);
    });

    test('InterpolantFactoryMethodLinear', () => {
      const object = new StringKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values
      );
      expect(object.InterpolantFactoryMethodLinear).toBeUndefined();
    });

    test('InterpolantFactoryMethodSmooth', () => {
      const object = new StringKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values
      );
      expect(object.InterpolantFactoryMethodSmooth).toBeUndefined();
    });
  });
});
