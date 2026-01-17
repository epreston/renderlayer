import { describe, expect, it, test, vi } from 'vitest';

import { EventDispatcher } from '../src/EventDispatcher.js';

describe('Core', () => {
  describe('EventDispatcher', () => {
    test('constructor', () => {
      const object = new EventDispatcher();
      expect(object).toBeDefined();
    });

    test('addEventListener', () => {
      const eventDispatcher = new EventDispatcher();
      const listener = {};

      eventDispatcher.addEventListener('anyType', listener);

      expect(listener).toMatchObject({});
    });

    test('hasEventListener', () => {
      const eventDispatcher = new EventDispatcher();

      expect(eventDispatcher.hasEventListener('anyType', {})).toBeFalsy();

      const listener = {};
      eventDispatcher.addEventListener('anyType', listener);

      expect(eventDispatcher.hasEventListener('anyType', listener)).toBeTruthy();
      expect(eventDispatcher.hasEventListener('anotherType', listener)).toBeFalsy();
    });

    test('removeEventListener', () => {
      const eventDispatcher = new EventDispatcher();
      const listener = {};

      eventDispatcher.addEventListener('anyType', listener);
      expect(eventDispatcher.hasEventListener('anyType', listener)).toBeTruthy();

      eventDispatcher.removeEventListener('anyType', listener);
      expect(eventDispatcher.hasEventListener('anyType', listener)).toBeFalsy();

      eventDispatcher.removeEventListener('unknownType', listener);
      expect(eventDispatcher.hasEventListener('unknownType', listener)).toBeFalsy();

      eventDispatcher.removeEventListener('anyType', undefined);
      expect(eventDispatcher.hasEventListener('anyType', listener)).toBeFalsy();
    });

    test('dispatchEvent', () => {
      const eventDispatcher = new EventDispatcher();

      let callCount = 0;
      const listener = function () {
        callCount++;
      };

      eventDispatcher.addEventListener('anyType', listener);
      expect(callCount).toBe(0);

      eventDispatcher.dispatchEvent({ type: 'anyType' });
      expect(callCount).toBe(1);

      eventDispatcher.dispatchEvent({ type: 'anyType' });
      expect(callCount).toBe(2);
    });
  });
});
