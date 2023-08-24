/* eslint-disable no-console */
// @ts-check

// based on vue/core mono repo build system

/*
generates bundle meta using esbuild

To specify the package to check, simply pass its name.

```
# name supports fuzzy match. will check all packages with name containing "test":
npm run check test
```
*/

import path from 'node:path';
import minimist from 'minimist';

// import { cpus } from 'node:os';
import { createRequire } from 'node:module';
import { targets as allTargets, fuzzyMatchTarget } from './utils.js';

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const args = minimist(process.argv.slice(2));
const targets = args._;
const isRelease = args.release;
const buildAllMatching = args.all || args.a;

const __dirname = fileURLToPath(new URL('../', import.meta.url));
const logLevel = 'info';

run();

async function run() {
  const outDir = path.resolve(`meta`);

  // don't remove directory if updating specific target
  if (!targets && existsSync(`${outDir}`)) {
    await fs.rm(outDir, { recursive: true });
  }

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
  // will jumble console output but is very fast
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

  await build({
    tsconfig: path.resolve('jsconfig.json'),
    minify: false,
    target: 'es2022',

    logLevel: logLevel,
    entryPoints: [`${pkgDir}/src/index.js`],
    bundle: true,
    metafile: true,
    format: 'esm',
    sourcemap: 'external', // true
    packages: 'external',
    external: ['@renderlayer/*'],
    // outfile: `meta/${target}.js`,
    write: false,
    outdir: 'meta'
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
