import { describe, expect, it, test, vi } from 'vitest';

import { InterpolateLinear } from '@renderlayer/shared';
import { KeyframeTrack } from '../src/KeyframeTrack.js';
import { NumberKeyframeTrack } from '../src/NumberKeyframeTrack.js';

describe('Keyframes', () => {
  describe('NumberKeyframeTrack', () => {
    const _parameters = {
      name: '.material.opacity',
      times: [0, 1],
      values: [0, 0.5],
      interpolation: InterpolateLinear
    };

    test('constructor', () => {
      // name, times, values
      const object = new NumberKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values
      );
      expect(object).toBeDefined();

      // name, times, values, interpolation
      const object_all = new NumberKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values,
        _parameters.interpolation
      );
      expect(object_all).toBeDefined();
    });

    test('extends', () => {
      const object = new NumberKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values
      );
      expect(object).toBeInstanceOf(KeyframeTrack);
      expect(object.name).toBe(_parameters.name);
    });

    test('ValueTypeName', () => {
      const object = new NumberKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values
      );
      expect(object.ValueTypeName).toBe('number');
    });
  });
});
