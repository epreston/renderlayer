import { describe, expect, it, test, vi } from 'vitest';

import { InterpolateLinear } from '@renderlayer/shared';
import { KeyframeTrack } from '../src/KeyframeTrack.js';
import { QuaternionKeyframeTrack } from '../src/QuaternionKeyframeTrack.js';

describe('Keyframes', () => {
  describe('QuaternionKeyframeTrack', () => {
    const parameters = {
      name: '.rotation',
      times: [0],
      values: [0.5, 0.5, 0.5, 1],
      interpolation: InterpolateLinear
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
      expect(object.name).toBe(parameters.name);
    });

    test('ValueTypeName', () => {
      const object = new QuaternionKeyframeTrack(
        parameters.name,
        parameters.times,
        parameters.values
      );
      expect(object.ValueTypeName).toBe('quaternion');
    });

    test('InterpolantFactoryMethodLinear', () => {
      const object = new QuaternionKeyframeTrack(
        parameters.name,
        parameters.times,
        parameters.values
      );
      expect(object.InterpolantFactoryMethodLinear).toBeDefined();
    });

    test('InterpolantFactoryMethodSmooth', () => {
      const object = new QuaternionKeyframeTrack(
        parameters.name,
        parameters.times,
        parameters.values
      );
      expect(object.InterpolantFactoryMethodSmooth).toBeUndefined();
    });
  });
});
