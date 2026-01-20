import { describe, expect, it, test, vi } from 'vitest';

import { InterpolateLinear } from '@renderlayer/shared';
import { KeyframeTrack } from '../src/KeyframeTrack.js';
import { ColorKeyframeTrack } from '../src/ColorKeyframeTrack.js';

describe('Keyframes', () => {
  describe('ColorKeyframeTrack', () => {
    const _parameters = {
      name: '.material.diffuse',
      times: [0, 1],
      values: [0, 0.5, 1.0],
      interpolation: InterpolateLinear
    };

    test('constructor', () => {
      // name, times, values
      const object = new ColorKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values
      );
      expect(object).toBeDefined();

      // name, times, values, interpolation
      const object_all = new ColorKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values,
        _parameters.interpolation
      );
      expect(object_all).toBeDefined();
    });

    test('extends', () => {
      const object = new ColorKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values
      );
      expect(object).toBeInstanceOf(KeyframeTrack);
      expect(object.name).toBe(_parameters.name);
    });

    test('ValueTypeName', () => {
      const object = new ColorKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values
      );
      expect(object.ValueTypeName).toBe('color');
    });
  });
});
