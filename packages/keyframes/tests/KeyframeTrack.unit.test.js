import { describe, expect, it, test, vi } from 'vitest';

import { InterpolateLinear } from '@renderlayer/shared';
import { NumberKeyframeTrack } from '../src/NumberKeyframeTrack.js';
import { KeyframeTrack } from '../src/KeyframeTrack.js';

describe('Keyframes', () => {
  describe('KeyframeTrack', () => {
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
    });

    test('name', () => {
      const object = new NumberKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values,
        _parameters.interpolation
      );

      expect(object.name).toBe(_parameters.name);
    });

    test('times', () => {
      const object = new NumberKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values,
        _parameters.interpolation
      );

      expect(object.times[0]).toBe(0);
      expect(object.times[1]).toBe(1);
    });

    test('values', () => {
      const object = new NumberKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values,
        _parameters.interpolation
      );

      expect(object.values[0]).toBe(0);
      expect(object.values[1]).toBe(0.5);
    });

    test('TimeBufferType', () => {
      const object = new NumberKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values,
        _parameters.interpolation
      );

      expect(object.TimeBufferType).toBe(Float32Array);
    });

    test('ValueBufferType', () => {
      const object = new NumberKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values,
        _parameters.interpolation
      );

      expect(object.ValueBufferType).toBe(Float32Array);
    });

    test('DefaultInterpolation', () => {
      const object = new NumberKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values,
        _parameters.interpolation
      );

      expect(object.DefaultInterpolation).toBe(InterpolateLinear);
    });

    test('toJSON', () => {
      const object = new NumberKeyframeTrack(
        _parameters.name,
        _parameters.times,
        _parameters.values,
        _parameters.interpolation
      );

      const json = NumberKeyframeTrack.toJSON(object);

      expect(json).toMatchInlineSnapshot(`
        {
          "name": ".material.opacity",
          "times": [
            0,
            1,
          ],
          "type": "number",
          "values": [
            0,
            0.5,
          ],
        }
      `);
    });

    test.todo('InterpolantFactoryMethodDiscrete', () => {
      // implement
    });

    test.todo('InterpolantFactoryMethodLinear', () => {
      // implement
    });

    test.todo('InterpolantFactoryMethodSmooth', () => {
      // implement
    });

    test.todo('setInterpolation', () => {
      // implement
    });

    test.todo('getInterpolation', () => {
      // implement
    });

    test.todo('getValueSize', () => {
      // implement
    });

    test.todo('shift', () => {
      // implement
    });

    test.todo('scale', () => {
      // implement
    });

    test.todo('trim', () => {
      // implement
    });

    test('validate', () => {
      const validTrack = new NumberKeyframeTrack('.material.opacity', [0, 1], [0, 0.5]);
      const invalidTrack = new NumberKeyframeTrack('.material.opacity', [0, 1], [0, NaN]);

      expect(validTrack.validate()).toBeTruthy();

      expect(invalidTrack.validate()).toBeFalsy();
      expect('not a valid number').toHaveBeenWarned();
    });

    test('optimize', () => {
      const track = new NumberKeyframeTrack('.material.opacity', [0, 1, 2, 3, 4], [0, 0, 0, 0, 1]);

      expect(track.values.length).toBe(5);

      track.optimize();

      expect(Array.from(track.times)).toEqual([0, 3, 4]);
      expect(Array.from(track.values)).toEqual([0, 0, 1]);
    });

    test('clone', () => {
      const object = new NumberKeyframeTrack('.material.opacity', [0, 1, 2, 3, 4], [0, 0, 0, 0, 1]);
      const clonedObject = object.clone();

      expect(clonedObject).not.toBe(object);
      expect(clonedObject).toStrictEqual(object);
    });
  });
});
