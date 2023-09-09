import { describe, expect, it, test, vi } from 'vitest';

import { Vector3 } from '@renderlayer/math';
import { Spherical } from '../src/Spherical.js';

export const eps = 0.0001;

describe('Controls', () => {
  describe('Spherical', () => {
    test('constructor', () => {
      const spherical = new Spherical();
      const radius = 10.0;
      const phi = Math.acos(-0.5);
      const theta = Math.sqrt(Math.PI) * phi;

      expect(spherical.radius).toBe(1.0);
      expect(spherical.phi).toBe(0);
      expect(spherical.theta).toBe(0);

      const spherical_all = new Spherical(radius, phi, theta);

      expect(spherical_all.radius).toBe(radius);
      expect(spherical_all.phi).toBe(phi);
      expect(spherical_all.theta).toBe(theta);
    });

    test('set', () => {
      const a = new Spherical();
      const radius = 10.0;
      const phi = Math.acos(-0.5);
      const theta = Math.sqrt(Math.PI) * phi;

      a.set(radius, phi, theta);
      expect(a.radius).toBe(radius);
      expect(a.phi).toBe(phi);
      expect(a.theta).toBe(theta);
    });

    test('clone', () => {
      const radius = 10.0;
      const phi = Math.acos(-0.5);
      const theta = Math.sqrt(Math.PI) * phi;
      const a = new Spherical(radius, phi, theta);
      const b = a.clone();

      expect(a).toEqual(b);

      a.radius = 2.0;
      expect(a).not.toEqual(b);
    });

    test('copy', () => {
      const radius = 10.0;
      const phi = Math.acos(-0.5);
      const theta = Math.sqrt(Math.PI) * phi;
      const a = new Spherical(radius, phi, theta);
      const b = new Spherical().copy(a);

      expect(a).toEqual(b);

      a.radius = 2.0;
      expect(a).not.toEqual(b);
    });

    test('makeSafe', () => {
      const EPS = 0.000001; // from source
      const tooLow = 0.0;
      const tooHigh = Math.PI;
      const justRight = 1.5;
      const a = new Spherical(1, tooLow, 0);

      a.makeSafe();
      expect(a.phi).toBe(EPS);

      a.set(1, tooHigh, 0);
      a.makeSafe();
      expect(a.phi).toBe(Math.PI - EPS);

      a.set(1, justRight, 0);
      a.makeSafe();
      expect(a.phi).toBe(justRight);
    });

    test('setFromVector3', () => {
      const a = new Spherical(1, 1, 1);
      const b = new Vector3(0, 0, 0);
      const c = new Vector3(Math.PI, 1, -Math.PI);
      const expected = new Spherical(4.554032147688322, 1.3494066171539107, 2.356194490192345);

      a.setFromVector3(b);
      expect(a.radius).toBe(0);
      expect(a.phi).toBe(0);
      expect(a.theta).toBe(0);

      a.setFromVector3(c);
      expect(Math.abs(a.radius - expected.radius) <= eps).toBeTruthy();
      expect(Math.abs(a.phi - expected.phi) <= eps).toBeTruthy();
      expect(Math.abs(a.theta - expected.theta) <= eps).toBeTruthy();
    });

    test('setFromCartesianCoords', () => {
      const a = new Spherical(1, 1, 1);
      const expected = new Spherical(4.554032147688322, 1.3494066171539107, 2.356194490192345);

      a.setFromCartesianCoords(0, 0, 0);
      expect(a.radius).toBe(0);
      expect(a.phi).toBe(0);
      expect(a.theta).toBe(0);

      a.setFromCartesianCoords(Math.PI, 1, -Math.PI);
      expect(Math.abs(a.radius - expected.radius) <= eps).toBeTruthy();
      expect(Math.abs(a.phi - expected.phi) <= eps).toBeTruthy();
      expect(Math.abs(a.theta - expected.theta) <= eps).toBeTruthy();
    });
  });
});
