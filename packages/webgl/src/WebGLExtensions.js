/**
 * @import { WebGLCapabilities } from "@renderlayer/webgl"
 */

class WebGLExtensions {
  #gl;
  #extensions = [];

  /** @param {WebGL2RenderingContext} gl */
  constructor(gl) {
    this.#gl = gl;

    // debug: gl.getSupportedExtensions();
  }

  #getExtension(name) {
    if (this.#extensions[name] !== undefined) {
      return this.#extensions[name];
    }

    let extension;

    switch (name) {
      case 'WEBGL_compressed_texture_pvrtc':
        extension =
          this.#gl.getExtension('WEBGL_compressed_texture_pvrtc') ||
          this.#gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
        break;

      default:
        extension = this.#gl.getExtension(name);
    }

    this.#extensions[name] = extension;

    return extension;
  }

  //

  has(name) {
    return this.#getExtension(name) !== null;
  }

  /** @param {?WebGLCapabilities} capabilities  */
  init(capabilities) {
    // EP: some extensions need to be initialised by a query to function
    // Browser support percentages sourced from https://web3dsurvey.com/webgl2
    this.#getExtension('EXT_color_buffer_float'); // 99.8%
    this.#getExtension('WEBGL_clip_cull_distance'); // 75.33%
    this.#getExtension('OES_texture_float_linear'); // 86.31%
    this.#getExtension('EXT_color_buffer_half_float'); // 92.2%
    this.#getExtension('WEBGL_multisampled_render_to_texture'); // EP: ??? used by texture, EXT_multisampled_render_to_texture ?
    this.#getExtension('WEBGL_render_shared_exponent'); // 22.42%
  }

  get(name) {
    const extension = this.#getExtension(name);

    if (extension === null) {
      console.warn(`WebGLRenderer: ${name} extension not supported.`);
    }

    return extension;
  }
}

export { WebGLExtensions };
