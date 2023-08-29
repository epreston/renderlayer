import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { Vector3 } from '@renderlayer/math';
import { Curve } from '../src/core/Curve.js';
import { LineCurve3 } from '../src/LineCurve3.js';

describe('Curves', () => {
  describe('LineCurve3', () => {
    let _points = undefined;
    let _curve = undefined;

    beforeEach(function () {
      // prettier-ignore
      _points = [
        new Vector3(0, 0, 0),
        new Vector3(10, 10, 10),
        new Vector3(-10, 10, -10),
        new Vector3(-8, 5, -7)
      ];

      _curve = new LineCurve3(_points[0], _points[1]);
    });

    test('constructor', () => {
      const object = new LineCurve3();
      expect(object).toBeDefined();
    });

    test('extends', () => {
      const object = new LineCurve3();
      expect(object).toBeInstanceOf(Curve);
    });

    test('type', () => {
      const object = new LineCurve3();
      expect(object.type === 'LineCurve3').toBeTruthy();
    });

    test.todo('v1', () => {
      // Vector3 exists
      // implement
    });

    test.todo('v2', () => {
      // Vector3 exists
      // implement
    });

    test('isLineCurve3', () => {
      const object = new LineCurve3();
      expect(object.isLineCurve3).toBeTruthy();
    });

    test.todo('getPoint', () => {
      // implement
    });

    test('getPointAt', () => {
      const curve = new LineCurve3(_points[0], _points[3]);

      const expectedPoints = [
        new Vector3(0, 0, 0),
        new Vector3(-2.4, 1.5, -2.1),
        new Vector3(-4, 2.5, -3.5),
        new Vector3(-8, 5, -7)
      ];

      const points = [
        curve.getPointAt(0, new Vector3()),
        curve.getPointAt(0.3, new Vector3()),
        curve.getPointAt(0.5, new Vector3()),
        curve.getPointAt(1, new Vector3())
      ];

      expect(points).toEqual(expectedPoints);
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

    test('Simple curve', () => {
      let curve = _curve;

      let expectedPoints = [
        new Vector3(0, 0, 0),
        new Vector3(2, 2, 2),
        new Vector3(4, 4, 4),
        new Vector3(6, 6, 6),
        new Vector3(8, 8, 8),
        new Vector3(10, 10, 10)
      ];

      let points = curve.getPoints();

      expect(points).toEqual(expectedPoints);

      //

      curve = new LineCurve3(_points[1], _points[2]);

      expectedPoints = [
        new Vector3(10, 10, 10),
        new Vector3(6, 10, 6),
        new Vector3(2, 10, 2),
        new Vector3(-2, 10, -2),
        new Vector3(-6, 10, -6),
        new Vector3(-10, 10, -10)
      ];

      points = curve.getPoints();

      expect(points).toEqual(expectedPoints);
    });

    test('getLength/getLengths', () => {
      const curve = _curve;

      const length = curve.getLength();
      const expectedLength = Math.sqrt(300);

      expect(length).toBeCloseTo(expectedLength);

      const lengths = curve.getLengths(5);
      const expectedLengths = [
        0.0,
        Math.sqrt(12),
        Math.sqrt(48),
        Math.sqrt(108),
        Math.sqrt(192),
        Math.sqrt(300)
      ];

      expect(lengths.length).toBe(expectedLengths.length);

      lengths.forEach(function (segment, i) {
        expect(segment).toBeCloseTo(expectedLengths[i]);
      });
    });

    test('getTangent/getTangentAt', () => {
      const curve = _curve;
      let tangent = new Vector3();

      curve.getTangent(0.5, tangent);
      const expectedTangent = Math.sqrt(1 / 3);

      expect(tangent.x).toBeCloseTo(expectedTangent);
      expect(tangent.y).toBeCloseTo(expectedTangent);
      expect(tangent.z).toBeCloseTo(expectedTangent);

      tangent = curve.getTangentAt(0.5);

      expect(tangent.x).toBeCloseTo(expectedTangent);
      expect(tangent.y).toBeCloseTo(expectedTangent);
      expect(tangent.z).toBeCloseTo(expectedTangent);
    });

    test('computeFrenetFrames', () => {
      const curve = _curve;

      const expected = {
        binormals: new Vector3(-0.5 * Math.sqrt(2), 0.5 * Math.sqrt(2), 0),
        normals: new Vector3(Math.sqrt(1 / 6), Math.sqrt(1 / 6), -Math.sqrt(2 / 3)),
        tangents: new Vector3(Math.sqrt(1 / 3), Math.sqrt(1 / 3), Math.sqrt(1 / 3))
      };

      const frames = curve.computeFrenetFrames(1, false);

      for (const val in expected) {
        expect(frames[val][0].x).toBeCloseTo(expected[val].x);
        expect(frames[val][0].y).toBeCloseTo(expected[val].y);
        expect(frames[val][0].z).toBeCloseTo(expected[val].z);
      }
    });

    test('getUtoTmapping', () => {
      const curve = _curve;

      const start = curve.getUtoTmapping(0, 0);
      const end = curve.getUtoTmapping(0, curve.getLength());
      const somewhere = curve.getUtoTmapping(0.7, 0);

      expect(start).toBe(0);
      expect(end).toBe(1);
      expect(somewhere).toBeCloseTo(0.7);
    });

    test('getSpacedPoints', () => {
      const curve = _curve;

      const expectedPoints = [
        new Vector3(0, 0, 0),
        new Vector3(2.5, 2.5, 2.5),
        new Vector3(5, 5, 5),
        new Vector3(7.5, 7.5, 7.5),
        new Vector3(10, 10, 10)
      ];

      const points = curve.getSpacedPoints(4);

      expect(points.length).toBe(expectedPoints.length);
      expect(points).toEqual(expectedPoints);
    });
  });
});
