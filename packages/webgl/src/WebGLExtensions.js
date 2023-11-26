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
      getExtension('EXT_color_buffer_float');
      getExtension('OES_texture_float_linear');
      getExtension('EXT_color_buffer_half_float');
      getExtension('WEBGL_multisampled_render_to_texture');
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
