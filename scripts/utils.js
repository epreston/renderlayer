/* eslint-disable no-console */

// based on vue/core mono repo build system

import fs from 'node:fs';
import { createRequire } from 'node:module';

/**
 * Simple console colors
 */
export const simpleConsoleColors = {
  reset: '\x1b[0m',
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,

  italic: (s) => `\x1b[3m${s}\x1b[23m`,
  underline: (s) => `\x1b[4m${s}\x1b[24m`,
  inverse: (s) => `\x1b[7m${s}\x1b[27m`,
  strikethrough: (s) => `\x1b[9m${s}\x1b[29m`,

  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  white: (s) => `\x1b[37m${s}\x1b[0m`,

  boldWhite: (s) => `\x1b[1;37m${s}\x1b[0m`,
  boldYellow: (s) => `\x1b[1;33m${s}\x1b[0m`,

  dimBlue: (s) => `\x1b[2;94m${s}\x1b[0m`,
  dimYellow: (s) => `\x1b[2;33m${s}\x1b[0m`,

  bgRed: (s) => `\x1b[41m${s}\x1b[49m`,
  bgGreen: (s) => `\x1b[42m${s}\x1b[49m`,
  bgYellow: (s) => `\x1b[43m${s}\x1b[49m`
};

const c = simpleConsoleColors;

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
      `  ${c.white(c.bgRed(' ERROR '))} ${c.red(
        `Target ${c.underline(partialTargets)} not found!`
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
