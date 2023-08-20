/* eslint-disable no-console */
// @ts-check

// based on vue/core mono repo build system

/*
Checks packages for circular references.

To specify the package to check, simply pass its name.

```
# name supports fuzzy match. will check all packages with name containing "test":
npm run check test
```
*/

import path from 'node:path';
import minimist from 'minimist';

import { execa } from 'execa';
// import { cpus } from 'node:os';
import { createRequire } from 'node:module';
import { targets as allTargets, fuzzyMatchTarget } from './utils.js';

const require = createRequire(import.meta.url);
const args = minimist(process.argv.slice(2));
const targets = args._;
const isRelease = args.release;
const buildAllMatching = args.all || args.a;

run();

async function run() {
  try {
    const resolvedTargets = targets.length
      ? fuzzyMatchTarget(targets, buildAllMatching)
      : allTargets;

    await checkAll(resolvedTargets);
  } finally {
    // cleanup
  }
}

async function checkAll(targets) {
  // await runParallel(cpus().length, targets, check);

  await runParallel(1, targets, check);
}

async function runParallel(maxConcurrency, source, iteratorFn) {
  const ret = [];
  const executing = [];
  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item, source));
    ret.push(p);

    if (maxConcurrency <= source.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

async function check(target) {
  const pkgDir = path.resolve(`packages/${target}`);
  const pkg = require(`${pkgDir}/package.json`);

  // if this is a full check (no specific targets), ignore private packages
  if ((isRelease || !targets.length) && pkg.private) {
    return;
  }

  console.log(target);

  await execa(
    'madge',
    [
      '--no-spinner',
      '--circular',
      // '--warning',
      `${pkgDir}/src`
    ],
    { stdio: 'inherit' }
  );
}
