import { describe, expect, it, test, vi } from 'vitest';

import { Clock } from '../src/Clock.js';

describe('Extras', () => {
  describe('Clock', () => {
    // replace with vitest mock timers
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

    test.todo('autoStart', () => {
      // implement
    });

    test.todo('startTime', () => {
      // implement
    });

    test.todo('oldTime', () => {
      // implement
    });

    test.todo('elapsedTime', () => {
      // implement
    });

    test.todo('running', () => {
      // implement
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

      performance.next(123);
      expect(clock.getElapsedTime()).toBeCloseTo(0.123, 3);

      performance.next(100);
      expect(clock.getElapsedTime()).toBeCloseTo(0.223, 3);

      clock.stop();

      performance.next(1000);
      expect(clock.getElapsedTime()).toBeCloseTo(0.223, 3);
    });
  });
});
