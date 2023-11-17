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

      expect(eventDispatcher._listeners.anyType.length).toBe(1);
      expect(eventDispatcher._listeners.anyType[0]).toBe(listener);

      eventDispatcher.addEventListener('anyType', listener);

      expect(eventDispatcher._listeners.anyType.length).toBe(1);
      expect(eventDispatcher._listeners.anyType[0]).toBe(listener);
    });

    test('hasEventListener', () => {
      const eventDispatcher = new EventDispatcher();

      const listener = {};
      eventDispatcher.addEventListener('anyType', listener);

      expect(eventDispatcher.hasEventListener('anyType', listener)).toBeTruthy();
      expect(!eventDispatcher.hasEventListener('anotherType', listener)).toBeTruthy();
    });

    test('removeEventListener', () => {
      const eventDispatcher = new EventDispatcher();

      const listener = {};

      expect(eventDispatcher._listeners).toBeUndefined();

      eventDispatcher.addEventListener('anyType', listener);
      expect(Object.keys(eventDispatcher._listeners).length).toBe(1);
      expect(eventDispatcher._listeners.anyType.length).toBe(1);

      eventDispatcher.removeEventListener('anyType', listener);
      expect(eventDispatcher._listeners.anyType.length).toBe(0);

      eventDispatcher.removeEventListener('unknownType', listener);
      expect(eventDispatcher._listeners.unknownType).toBeUndefined();

      eventDispatcher.removeEventListener('anyType', undefined);
      expect(eventDispatcher._listeners.anyType.length).toBe(0);
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
