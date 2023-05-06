import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Vector2 } from '@renderlayer/math';
import { Curve } from '../src/core/Curve.js';
import { LineCurve } from '../src/LineCurve.js';

describe('Curves', () => {
  describe('LineCurve', () => {
    let _points = undefined;
    let _curve = undefined;

    beforeEach(() => {
      // prettier-ignore
      _points = [
        new Vector2(0, 0),
        new Vector2(10, 10),
        new Vector2(-10, 10),
        new Vector2(-8, 5)
      ];

      _curve = new LineCurve(_points[0], _points[1]);
    });

    test('Extending', () => {
      const object = new LineCurve();
      expect(object).toBeInstanceOf(Curve);
    });

    test('Instancing', () => {
      const object = new LineCurve();
      expect(object).toBeDefined();
    });

    test('type', () => {
      const object = new LineCurve();
      expect(object.type === 'LineCurve').toBeTruthy();
    });

    test.todo('v1', () => {
      // implement
    });

    test.todo('v2', () => {
      // implement
    });

    test('isLineCurve', () => {
      const object = new LineCurve();
      expect(object.isLineCurve).toBeTruthy();
    });

    test.todo('getPoint', () => {
      // implement
    });

    test('getPointAt', () => {
      const curve = new LineCurve(_points[0], _points[3]);

      const expectedPoints = [new Vector2(0, 0), new Vector2(-2.4, 1.5), new Vector2(-4, 2.5), new Vector2(-8, 5)];

      const points = [
        curve.getPointAt(0, new Vector2()),
        curve.getPointAt(0.3, new Vector2()),
        curve.getPointAt(0.5, new Vector2()),
        curve.getPointAt(1, new Vector2()),
      ];

      expect(points).toEqual(expectedPoints);
    });

    test('getTangent/getTangentAt', () => {
      const curve = _curve;
      const tangent = new Vector2();

      curve.getTangent(0, tangent);
      const expectedTangent = Math.sqrt(0.5);

      expect(tangent.x).toBeCloseTo(expectedTangent);
      expect(tangent.y).toBeCloseTo(expectedTangent);

      curve.getTangentAt(0, tangent);

      expect(tangent.x).toBeCloseTo(expectedTangent);
      expect(tangent.y).toBeCloseTo(expectedTangent);
    });

    test.todo('copy', () => {
      // implement
    });

    test.todo('toJSON', () => {
      // implement
    });

    test.todo('fromJSON', () => {
      // implement
    });

    // OTHERS
    test('Simple curve', () => {
      let curve = _curve;

      let expectedPoints = [
        new Vector2(0, 0),
        new Vector2(2, 2),
        new Vector2(4, 4),
        new Vector2(6, 6),
        new Vector2(8, 8),
        new Vector2(10, 10),
      ];

      let points = curve.getPoints();

      expect(points).toEqual(expectedPoints);

      //

      curve = new LineCurve(_points[1], _points[2]);

      expectedPoints = [
        new Vector2(10, 10),
        new Vector2(6, 10),
        new Vector2(2, 10),
        new Vector2(-2, 10),
        new Vector2(-6, 10),
        new Vector2(-10, 10),
      ];

      points = curve.getPoints();

      expect(points).toEqual(expectedPoints);
    });

    test('getLength/getLengths', () => {
      const curve = _curve;

      const length = curve.getLength();
      const expectedLength = Math.sqrt(200);

      expect(length).toBeCloseTo(expectedLength);

      const lengths = curve.getLengths(5);

      // prettier-ignore
      const expectedLengths = [
					0.0,
					Math.sqrt( 8 ),
					Math.sqrt( 32 ),
					Math.sqrt( 72 ),
					Math.sqrt( 128 ),
					Math.sqrt( 200 )
				];

      expect(lengths.length).toBe(expectedLengths.length);

      lengths.forEach(function (segment, i) {
        expect(segment).toBeCloseTo(expectedLengths[i]);
      });
    });

    test('getUtoTmapping', () => {
      const curve = _curve;

      const start = curve.getUtoTmapping(0, 0);
      const end = curve.getUtoTmapping(0, curve.getLength());
      const somewhere = curve.getUtoTmapping(0.3, 0);

      expect(start).toBe(0);
      expect(end).toBe(1);
      expect(somewhere).toBeCloseTo(0.3);
    });

    test('getSpacedPoints', () => {
      const curve = _curve;

      const expectedPoints = [
        new Vector2(0, 0),
        new Vector2(2.5, 2.5),
        new Vector2(5, 5),
        new Vector2(7.5, 7.5),
        new Vector2(10, 10),
      ];

      const points = curve.getSpacedPoints(4);

      expect(points.length).toBe(expectedPoints.length);
      expect(points).toEqual(expectedPoints);
    });
  });
});
