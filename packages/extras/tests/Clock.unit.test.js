import { describe, expect, it, test, vi } from 'vitest';

import { Clock } from '../src/Clock.js';

describe('Extras', () => {
  describe('Clock', () => {
    function _mockPerformance() {
      // @ts-ignore - allow code to run in browser or node
      const reference = typeof global !== 'undefined' ? global : self;

      reference.performance = {
        deltaTime: 0,

        next: function (delta) {
          this.deltaTime += delta;
        },

        now: function () {
          return this.deltaTime;
        }
      };
    }

    test('constructor', () => {
      // no params
      const object = new Clock();
      expect(object).toBeDefined();

      // autostart
      const object_all = new Clock(false);
      expect(object_all).toBeDefined();
    });

    test('autoStart', () => {
      const object = new Clock();
      expect(object.autoStart).toBeTruthy();
    });

    test('startTime', () => {
      const object = new Clock();
      expect(object.startTime).toBe(0);
    });

    test('oldTime', () => {
      const object = new Clock();
      expect(object.oldTime).toBe(0);
    });

    test('elapsedTime', () => {
      const object = new Clock();
      expect(object.elapsedTime).toBe(0);
    });

    test('running', () => {
      const object = new Clock();
      expect(object.running).toBeFalsy();
    });

    test.todo('start', () => {
      // implement
    });

    test.todo('stop', () => {
      // implement
    });

    test.todo('getElapsedTime', () => {
      // implement
    });

    test.todo('getDelta', () => {
      // implement
    });

    test('clock with performance', () => {
      if (typeof performance === 'undefined') {
        return;
      }

      _mockPerformance();

      const clock = new Clock(false);

      clock.start();

      // @ts-ignore
      performance.next(123);
      expect(clock.getElapsedTime()).toBeCloseTo(0.123, 3);

      // @ts-ignore
      performance.next(100);
      expect(clock.getElapsedTime()).toBeCloseTo(0.223, 3);

      clock.stop();

      // @ts-ignore
      performance.next(1000);
      expect(clock.getElapsedTime()).toBeCloseTo(0.223, 3);
    });
  });
});
