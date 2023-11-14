// based on vue/core mono repo build system

// these aliases are shared between vitest and rollup
import { readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const resolveEntryForPkg = (p) =>
  path.resolve(fileURLToPath(import.meta.url), `../../packages/${p}/src/index.js`);

const dirs = readdirSync(new URL('../packages', import.meta.url));

const entries = {
  renderlayer: resolveEntryForPkg('renderlayer')
};

const nonSrcPackages = ['eslint-config', 'prettier-config', 'tsconfig', 'utils'];

for (const dir of dirs) {
  const key = `@renderlayer/${dir}`;
  if (
    dir !== 'renderlayer' &&
    !nonSrcPackages.includes(dir) &&
    !(key in entries) &&
    statSync(new URL(`../packages/${dir}`, import.meta.url)).isDirectory()
  ) {
    entries[key] = resolveEntryForPkg(dir);
  }
}

export { entries };
