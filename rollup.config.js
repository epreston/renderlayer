/* eslint-disable no-console */

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// 1st party Rollup plugins
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

// 3rd party Rollup plugins
import esbuild from 'rollup-plugin-esbuild';
import { shaderChunks } from 'rollup-shader-chunks';

import pico from 'picocolors';
import { entries } from './scripts/aliases.js';

if (!process.env.TARGET) {
  throw new Error('TARGET package must be specified via --environment flag.');
}

const require = createRequire(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const masterVersion = require('./package.json').version;

const packagesDir = path.resolve(__dirname, 'packages');
const packageDir = path.resolve(packagesDir, process.env.TARGET);

const resolve = (p) => path.resolve(packageDir, p);
const pkg = require(resolve(`package.json`));
const packageOptions = pkg.buildOptions || {};
const name = packageOptions.filename || path.basename(packageDir);

const outputConfigs = {
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: `es`
  },
  'esm-browser': {
    file: resolve(`dist/${name}.esm-browser.js`),
    format: `es`
  },
  'global': {
    file: resolve(`dist/${name}.global.js`),
    format: `iife`
  }
};

const defaultFormats = ['esm-bundler'];
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',');
const packageFormats = inlineFormats || packageOptions.formats || defaultFormats;
const packageConfigs =
  process.env.PROD_ONLY ?
    []
  : packageFormats.map((format) => createConfig(format, outputConfigs[format]));

if (process.env.NODE_ENV === 'production') {
  packageFormats.forEach((format) => {
    if (packageOptions.prod === false) {
      return;
    }
    if (format === 'cjs') {
      packageConfigs.push(createProductionConfig(format));
    }
    if (/^(global|esm-browser)(-runtime)?/.test(format)) {
      packageConfigs.push(createMinifiedConfig(format));
    }
  });
}

export default packageConfigs;

function createConfig(format, output, plugins = []) {
  if (!output) {
    console.log(pico.yellow(`invalid format: "${format}"`));
    process.exit(1);
  }

  const isProductionBuild = process.env.__DEV__ === 'false' || /\.prod\.js$/.test(output.file);
  const isBundlerESMBuild = /esm-bundler/.test(format);
  const isBrowserESMBuild = /esm-browser/.test(format);
  const isCJSBuild = format === 'cjs';
  const isGlobalBuild = /global/.test(format);
  const isCompatPackage = pkg.name === '@vue/compat' || pkg.name === '@vue/compat-canary';
  const isBrowserBuild =
    (isGlobalBuild || isBrowserESMBuild || isBundlerESMBuild) &&
    !packageOptions.enableNonBrowserBranches;

  output.exports = isCompatPackage ? 'auto' : 'named';

  if (isCJSBuild) {
    output.esModule = true;
  }

  output.sourcemap = !!process.env.SOURCE_MAP;
  output.externalLiveBindings = false;

  if (isGlobalBuild) {
    output.name = packageOptions.name;
  }

  // let entryFile = /runtime$/.test(format) ? `src/runtime.ts` : `src/index.ts`;
  let entryFile = /runtime$/.test(format) ? `src/runtime.js` : `src/index.js`;

  // the compat build needs both default AND named exports. This will cause
  // Rollup to complain for non-ESM targets, so we use separate entries for
  // esm vs. non-esm builds.
  if (isCompatPackage && (isBrowserESMBuild || isBundlerESMBuild)) {
    entryFile = /runtime$/.test(format) ? `src/esm-runtime.js` : `src/esm-index.js`;
  }

  function resolveDefine() {
    const replacements = {
      __COMMIT__: `"${process.env.COMMIT}"`,
      __VERSION__: `"${masterVersion}"`,
      __TEST__: `false`,
      // If the build is expected to run directly in the browser (global / esm builds)
      __BROWSER__: String(isBrowserBuild),
      __GLOBAL__: String(isGlobalBuild),
      __ESM_BUNDLER__: String(isBundlerESMBuild),
      __ESM_BROWSER__: String(isBrowserESMBuild),
      // is targeting Node (tests or tooling)?
      __CJS__: String(isCJSBuild)

      // feature flags
    };

    if (!isBundlerESMBuild) {
      // hard coded dev/prod builds
      // @ts-ignore
      replacements.__DEV__ = String(!isProductionBuild);
    }

    // allow inline overrides like
    //__TEST__=true npm run build math
    Object.keys(replacements).forEach((key) => {
      if (key in process.env) {
        replacements[key] = process.env[key];
      }
    });

    return replacements;
  }

  // esbuild define is a bit strict and only allows literal json or identifiers
  // so we still need replace plugin in some cases
  function resolveReplace() {
    const replacements = {
      /* ...enumDefines */
    };

    if (isProductionBuild && isBrowserBuild) {
      Object.assign(replacements, {
        'context.onError(': `/*#__PURE__*/ context.onError(`,
        'emitError(': `/*#__PURE__*/ emitError(`,
        'createCompilerError(': `/*#__PURE__*/ createCompilerError(`,
        'createDOMCompilerError(': `/*#__PURE__*/ createDOMCompilerError(`
      });
    }

    if (isBundlerESMBuild) {
      Object.assign(replacements, {
        // preserve to be handled by bundlers
        __DEV__: `!!(process.env.NODE_ENV !== 'production')`
      });
    }

    // for compiler-sfc browser build inlined deps
    if (isBrowserESMBuild) {
      Object.assign(replacements, {
        'process.env': '({})',
        'process.platform': '""',
        'process.stdout': 'null'
      });
    }

    if (Object.keys(replacements).length) {
      // @ts-ignore
      return [replace({ values: replacements, preventAssignment: true })];
    } else {
      return [];
    }
  }

  function resolveExternal() {
    const treeShakenDeps = ['source-map-js', '@babel/parser', 'estree-walker'];

    if (isGlobalBuild || isBrowserESMBuild || isCompatPackage) {
      if (!packageOptions.enableNonBrowserBranches) {
        // normal browser builds - non-browser only imports are tree-shaken,
        // they are only listed here to suppress warnings.
        return treeShakenDeps;
      }
    } else {
      // Node / esm-bundler builds.
      // externalize all direct deps unless it's the compat build.
      return [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        ...['path', 'url', 'stream'],
        // somehow these throw warnings for runtime-* package builds
        ...treeShakenDeps
      ];
    }
  }

  return {
    input: resolve(entryFile),
    // Global and Browser ESM builds inlines everything so that they can be used alone.
    external: resolveExternal(),
    plugins: [
      nodeResolve(),
      shaderChunks(),
      json({
        namedExports: false
      }),
      alias({
        entries
      }),
      ...resolveReplace(),
      esbuild({
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
        sourceMap: output.sourcemap,
        minify: false,
        // minifyWhitespace: true,
        target: isCJSBuild ? 'es2019' : 'es2022',
        define: resolveDefine()
      }),
      ...plugins
    ],
    output,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
    treeshake: {
      moduleSideEffects: false
    }
  };
}

function createProductionConfig(format) {
  return createConfig(format, {
    file: resolve(`dist/${name}.${format}.prod.js`),
    format: outputConfigs[format].format
  });
}

function createMinifiedConfig(format) {
  return createConfig(
    format,
    {
      file: outputConfigs[format].file.replace(/\.js$/, '.prod.js'),
      format: outputConfigs[format].format
    },
    [
      terser({
        module: /^esm/.test(format),
        compress: {
          ecma: 2020,
          pure_getters: true
        }
        // safari10: true,
      })
    ]
  );
}
