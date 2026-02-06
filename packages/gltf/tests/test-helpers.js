// @ts-ignore
const scheduler = typeof setImmediate === 'function' ? setImmediate : setTimeout;

export function resolveAfter(ms) {
  // introduces a delay
  return new Promise((resolve) => scheduler(resolve, ms));
}

// Credit to: https://github.com/kentor/flush-promises
export function flushPromises() {
  return resolveAfter(0);
}
