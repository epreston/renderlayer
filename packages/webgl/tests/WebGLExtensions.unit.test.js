import { describe, expect, it, test, vi } from 'vitest';

import { WebGLExtensions } from '../src/WebGLExtensions.js';

const WebGLRenderingContextMock = function (supportedExtensions) {
  this.supportedExtensions = supportedExtensions || [];
  this.getSupportedExtensions = function () {
    return this.supportedExtensions;
  };
  this.getExtension = function (name) {
    if (this.supportedExtensions.indexOf(name) > -1) {
      return { name: name };
    } else {
      return null;
    }
  };
};

function getWebGLRenderingContextMock(supportedExtensions) {
  // @ts-ignore
  return /** @type {WebGL2RenderingContext} */ (new WebGLRenderingContextMock(supportedExtensions));
}

describe('WebGL', () => {
  describe('WebGLExtensions', () => {
    it('should expose a class', () => {
      expect(WebGLExtensions).toBeDefined();
    });

    test('constructor', () => {
      const gl = getWebGLRenderingContextMock();
      const extensions = new WebGLExtensions(gl);

      expect(extensions).toBeInstanceOf(Object);
      expect(extensions).toBeInstanceOf(WebGLExtensions);
    });

    test('has', () => {
      const gl = getWebGLRenderingContextMock(['Extension1', 'Extension2']);
      const extensions = new WebGLExtensions(gl);

      expect(extensions.has('Extension1')).toBeTruthy();
      expect(extensions.has('Extension2')).toBeTruthy();
      expect(extensions.has('Extension1')).toBeTruthy();
      expect(extensions.has('NonExistingExtension')).toBeFalsy();
    });

    test('has (with aliases)', () => {
      const gl = getWebGLRenderingContextMock(['WEBKIT_WEBGL_compressed_texture_pvrtc']);
      const extensions = new WebGLExtensions(gl);

      expect(extensions.has('WEBGL_compressed_texture_pvrtc')).toBeTruthy();
      expect(extensions.has('NonExistingExtension')).toBeFalsy();
    });

    test('get', () => {
      const gl = getWebGLRenderingContextMock(['Extension1', 'Extension2']);
      const extensions = new WebGLExtensions(gl);

      expect(extensions.get('Extension1')).toBeTruthy();
      expect(extensions.get('Extension2')).toBeTruthy();
      expect(extensions.get('Extension1')).toBeTruthy();

      expect(extensions.get('NonExistingExtension')).toBeFalsy();
      expect('extension not supported').toHaveBeenWarnedTimes(1);
    });

    test('get (with aliases)', () => {
      const gl = getWebGLRenderingContextMock(['WEBKIT_WEBGL_compressed_texture_pvrtc']);
      const extensions = new WebGLExtensions(gl);

      expect(extensions.get('WEBGL_compressed_texture_pvrtc')).toBeTruthy();

      expect(extensions.get('EXT_texture_filter_anisotropic')).toBeFalsy();
      expect(extensions.get('NonExistingExtension')).toBeFalsy();
      expect('extension not supported').toHaveBeenWarnedTimes(2);
    });

    test('init', () => {
      const gl = getWebGLRenderingContextMock();
      const extensions = new WebGLExtensions(gl);
      extensions.init(null);

      expect(extensions).toBeDefined();
    });
  });
});
