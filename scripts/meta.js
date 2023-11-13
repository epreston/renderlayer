/* eslint-disable no-console */

// based on vue/core mono repo build system

/*
generates bundle meta using esbuild

To specify the package to check, simply pass its name.

```
# name supports fuzzy match. will check all packages with name containing "test":
npm run check test
```
*/

// import { cpus } from 'node:os';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

import { build } from 'esbuild';
import minimist from 'minimist';

import { targets as allTargets, fuzzyMatchTarget } from './utils.js';

const require = createRequire(import.meta.url);
const args = minimist(process.argv.slice(2));
const targets = args._;
const isRelease = args.release;
const buildAllMatching = args.all || args.a;

const logLevel = 'info';

run();

async function run() {
  const outDir = path.resolve(`meta`);

  // don't remove directory if updating specific target
  if (!targets && existsSync(`${outDir}`)) {
    await fs.rm(outDir, { recursive: true });
  }

  try {
    const resolvedTargets =
      targets.length ? fuzzyMatchTarget(targets, buildAllMatching) : allTargets;

    await checkAll(resolvedTargets);
  } finally {
    // cleanup
  }
}

/**
 * Check all the targets in parallel.
 * @param {Array<string>} targets - An array of targets to build.
 * @returns {Promise<void>} - A promise representing the build process.
 */
async function checkAll(targets) {
  // will jumble console output but is very fast
  // await runParallel(cpus().length, targets, check);

  await runParallel(1, targets, check);
}

/**
 * Runs iterator function in parallel.
 * @template T - The type of items in the data source
 * @param {number} maxConcurrency - The maximum concurrency.
 * @param {Array<T>} source - The data source
 * @param {(item: T) => Promise<void>} iteratorFn - The iteratorFn
 * @returns {Promise<void[]>} - A Promise array containing all iteration results.
 */
async function runParallel(maxConcurrency, source, iteratorFn) {
  /**@type {Promise<void>[]} */
  const ret = [];

  /**@type {Promise<void>[]} */
  const executing = [];

  for (const item of source) {
    const p = Promise.resolve().then(() => iteratorFn(item));
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

/**
 * Check the target.
 * @param {string} target - The target to build.
 * @returns {Promise<void>} - A promise representing the build process.
 */
async function check(target) {
  const pkgDir = path.resolve(`packages/${target}`);
  const pkg = require(`${pkgDir}/package.json`);

  // if this is a full check (no specific targets), ignore private packages
  if ((isRelease || !targets.length) && pkg.private) {
    return;
  }

  console.log(target);

  await build({
    tsconfig: path.resolve('tsconfig.json'),
    minify: false,
    target: 'es2022',

    logLevel: logLevel,
    entryPoints: [`${pkgDir}/src/index.js`],
    bundle: true,
    metafile: true,
    format: 'esm',
    // sourcemap: 'external',
    packages: 'external',
    external: ['@renderlayer/*'],
    write: false,
    outfile: `meta/${target}.js`
    // outdir: 'meta'
  })
    .then(({ metafile }) => {
      // const file = Object.keys(metafile.outputs)[0].replace('map', 'meta.json');
      const outDir = path.resolve(`meta`);

      if (!existsSync(outDir)) {
        fs.mkdir(outDir);
      }

      const file = `${outDir}/${target}.js.meta.json`;
      fs.writeFile(file, JSON.stringify(metafile, null, 2), 'utf-8');
    })
    .catch(() => {
      process.exit(1);
    });
}
