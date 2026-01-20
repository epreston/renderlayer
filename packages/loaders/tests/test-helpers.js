export function resolveAfter(ms) {
  // introduces a delay
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// @ts-ignore - ensure code works in browser and node
const scheduler = typeof setImmediate === 'function' ? setImmediate : setTimeout;

// Credit to: https://github.com/kentor/flush-promises
export function flushPromises() {
  return new Promise(function (resolve) {
    scheduler(resolve, 0);
  });
}
