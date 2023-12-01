class WebGLExtensions {
  /** !param { WebGL2RenderingContext} gl */
  constructor(gl) {
    this.gl = gl;
    this.extensions = [];

    // debug: gl.getSupportedExtensions();
  }

  _getExtension(name) {
    if (this.extensions[name] !== undefined) {
      return this.extensions[name];
    }

    let extension;

    switch (name) {
      case 'WEBGL_compressed_texture_pvrtc':
        extension =
          this.gl.getExtension('WEBGL_compressed_texture_pvrtc') ||
          this.gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
        break;

      default:
        extension = this.gl.getExtension(name);
    }

    this.extensions[name] = extension;

    return extension;
  }

  //

  has(name) {
    return this._getExtension(name) !== null;
  }

  init(capabilities) {
    // EP: some extensions need to be initialised by a query to function
    // Browser support percentages sourced from https://web3dsurvey.com/webgl2
    this._getExtension('EXT_color_buffer_float'); // 99.8%
    this._getExtension('OES_texture_float_linear'); // 86.31%
    this._getExtension('EXT_color_buffer_half_float'); // 92.2%
  }

  get(name) {
    const extension = this._getExtension(name);

    if (extension === null) {
      console.warn(`WebGLRenderer: ${name} extension not supported.`);
    }

    return extension;
  }
}

export { WebGLExtensions };
