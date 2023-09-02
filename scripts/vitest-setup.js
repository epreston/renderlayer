import { TextDecoder as nodeTextDecoder, TextEncoder as nodeTextEncoder } from 'node:util';
import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from 'vitest';
import { server } from './mocks/server.js';

// mock service worker - test resources and api testing
// catch unhandled requests { onUnhandledRequest: 'error' };
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterAll(() => server.close());
afterEach(() => server.resetHandlers());

// import crypto from 'node:crypto';

// beforeAll(() => {
//   global.crypto = crypto.webcrypto;
// });

// afterAll(() => {
//   delete global.crypto;
// });

if (typeof ResizeObserver === 'undefined') {
  global.ResizeObserver = class ResizeObserver {
    constructor(callback) {}
    observe(target, options = {}) {}
    unobserve(target) {}
    disconnect() {}
  };
}

if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = nodeTextEncoder;
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = nodeTextDecoder;
}

// from vue/core repo
// - toHaveBeenWarned
// - toHaveBeenWarnedLast
// - toHaveBeenWarnedTimes

expect.extend({
  toHaveBeenWarned(received) {
    asserted.add(received);
    const passed = warn.mock.calls.some((args) => args[0].includes(received));
    if (passed) {
      return {
        pass: true,
        message: () => `expected "${received}" not to have been warned.`
      };
    } else {
      const msgs = warn.mock.calls.map((args) => args[0]).join('\n - ');
      return {
        pass: false,
        message: () =>
          `expected "${received}" to have been warned` +
          (msgs.length ? `.\n\nActual messages:\n\n - ${msgs}` : ' but no warning was recorded.')
      };
    }
  },

  toHaveBeenWarnedLast(received) {
    asserted.add(received);
    const passed = warn.mock.calls[warn.mock.calls.length - 1][0].includes(received);
    if (passed) {
      return {
        pass: true,
        message: () => `expected "${received}" not to have been warned last.`
      };
    } else {
      const msgs = warn.mock.calls.map((args) => args[0]).join('\n - ');
      return {
        pass: false,
        message: () =>
          `expected "${received}" to have been warned last.\n\nActual messages:\n\n - ${msgs}`
      };
    }
  },

  toHaveBeenWarnedTimes(received, n) {
    asserted.add(received);
    let found = 0;
    warn.mock.calls.forEach((args) => {
      if (args[0].includes(received)) {
        found++;
      }
    });
    if (found === n) {
      return {
        pass: true,
        message: () => `expected "${received}" to have been warned ${n} times.`
      };
    } else {
      return {
        pass: false,
        message: () => `expected "${received}" to have been warned ${n} times but got ${found}.`
      };
    }
  }
});

let warn;
const asserted = new Set();

beforeEach(() => {
  asserted.clear();
  warn = vi.spyOn(console, 'warn');
  warn.mockImplementation(() => {});
});

afterEach(() => {
  const assertedArray = Array.from(asserted);
  const nonAssertedWarnings = warn.mock.calls
    .map((args) => args[0])
    .filter((received) => {
      return !assertedArray.some((assertedMsg) => {
        return received.includes(assertedMsg);
      });
    });
  warn.mockRestore();
  if (nonAssertedWarnings.length) {
    throw new Error(
      `test case threw unexpected warnings:\n - ${nonAssertedWarnings.join('\n - ')}`
    );
  }
});
