function WebGLExtensions(gl) {
  const extensions = {};

  function getExtension(name) {
    if (extensions[name] !== undefined) {
      return extensions[name];
    }

    let extension;

    switch (name) {
      case 'WEBGL_compressed_texture_pvrtc':
        extension =
          gl.getExtension('WEBGL_compressed_texture_pvrtc') ||
          gl.getExtension('WEBKIT_WEBGL_compressed_texture_pvrtc');
        break;

      default:
        extension = gl.getExtension(name);
    }

    extensions[name] = extension;

    return extension;
  }

  return {
    has(name) {
      return getExtension(name) !== null;
    },

    init(capabilities) {
      // EP: some extensions need to be initialised by a query to function
      // Browser support percentages sourced from https://web3dsurvey.com/webgl2
      getExtension('EXT_color_buffer_float'); // 99.8%
      getExtension('OES_texture_float_linear'); // 86.31%
      getExtension('EXT_color_buffer_half_float'); // 92.2%
    },

    get(name) {
      const extension = getExtension(name);

      if (extension === null) {
        console.warn(`WebGLRenderer: ${name} extension not supported.`);
      }

      return extension;
    }
  };
}

export { WebGLExtensions };
