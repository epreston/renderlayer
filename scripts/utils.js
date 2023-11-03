/* eslint-disable no-console */

// based on vue/core mono repo build system

import fs from 'node:fs';
import { createRequire } from 'node:module';

import pico from 'picocolors';

const require = createRequire(import.meta.url);

export const targets = fs.readdirSync('packages').filter((f) => {
  if (!fs.statSync(`packages/${f}`).isDirectory()) {
    return false;
  }

  const pkg = require(`../packages/${f}/package.json`);

  if (pkg.private && !pkg.buildOptions) {
    return false;
  }

  return true;
});

export function fuzzyMatchTarget(partialTargets, includeAllMatching) {
  const matched = [];

  partialTargets.forEach((partialTarget) => {
    for (const target of targets) {
      if (target.match(partialTarget)) {
        matched.push(target);

        if (!includeAllMatching) {
          break;
        }
      }
    }
  });

  if (matched.length) {
    return matched;
  } else {
    console.log();
    console.error(
      `  ${pico.white(pico.bgRed(' ERROR '))} ${pico.red(
        `Target ${pico.underline(partialTargets)} not found!`
      )}`
    );
    console.log();

    process.exit(1);
  }
}

export function resolveAfter(ms) {
  // introduces a delay
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const scheduler = typeof setImmediate === 'function' ? setImmediate : setTimeout;
// Credit to: https://github.com/kentor/flush-promises
export function flushPromises() {
  return new Promise(function (resolve) {
    scheduler(resolve, 0);
  });
}
