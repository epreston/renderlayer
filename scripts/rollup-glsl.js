import { createFilter } from '@rollup/pluginutils';

/**
 * @type {readonly RegExp[]}
 */
const DEFAULT_SHADERS = Object.freeze(['**/*.glsl', '**/*.js', '**/*.vert', '**/*.frag']);

/**
 * @param {PluginOptions} options Plugin config object
 * @returns {Plugin} The plugin that converts shader code.
 */
export function glsl({ include = DEFAULT_SHADERS, exclude = undefined, enabled = true } = {}) {
  const filter = createFilter(include, exclude);
  // const prod = process.env.NODE_ENV === 'production';

  return {
    async transform(source, shader) {
      if (!enabled || !filter(shader)) return;

      source = source.replace(/\/\* *glsl *\*\/\s*\`(.*?)\`/gs, function (match, glsl) {
        return JSON.stringify(
          glsl
            .trim() // trim whitespace
            .replace(/\r/g, '') // Remove carriage returns
            .replace(/ {2}/g, '\t') // 2 spaces to tabs
            .replace(/[ \t]*\/\/.*\n/g, '') // remove //
            .replace(/[ \t]*\/\*[\s\S]*?\*\//g, '') // remove /* */
            .replace(/\n{2,}/g, '\n') // # \n+ to \n
        );
      });

      return {
        code: source,
        map: null
      };
    }
  };
}
