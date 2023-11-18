import { describe, expect, it, test, vi } from 'vitest';

import { WebGLExtensions } from '../src/WebGLExtensions.js';

const WebglContextMock = function (supportedExtensions) {
  this.supportedExtensions = supportedExtensions || [];
  this.getExtension = function (name) {
    if (this.supportedExtensions.indexOf(name) > -1) {
      return { name: name };
    } else {
      return null;
    }
  };
};

describe('WebGL', () => {
  describe('WebGLExtensions', () => {
    it('should expose a function', () => {
      expect(WebGLExtensions).toBeDefined();
    });

    test('constructor', () => {
      const gl = new WebglContextMock();
      const extensions = WebGLExtensions(gl);

      expect(extensions).toBeInstanceOf(Object);
    });

    test('has', () => {
      const gl = new WebglContextMock(['Extension1', 'Extension2']);
      const extensions = WebGLExtensions(gl);

      expect(extensions.has('Extension1')).toBeTruthy();
      expect(extensions.has('Extension2')).toBeTruthy();
      expect(extensions.has('Extension1')).toBeTruthy();
      expect(extensions.has('NonExistingExtension')).toBeFalsy();
    });

    test('has (with aliasses)', () => {
      const gl = new WebglContextMock(['WEBKIT_WEBGL_depth_texture']);
      const extensions = WebGLExtensions(gl);

      expect(extensions.has('WEBGL_depth_texture')).toBeTruthy();
      expect(extensions.has('WEBKIT_WEBGL_depth_texture')).toBeTruthy();
      expect(extensions.has('EXT_texture_filter_anisotropic')).toBeFalsy();
      expect(extensions.has('NonExistingExtension')).toBeFalsy();
    });

    test('get', () => {
      const gl = new WebglContextMock(['Extension1', 'Extension2']);
      const extensions = WebGLExtensions(gl);

      expect(extensions.get('Extension1')).toBeTruthy();
      expect(extensions.get('Extension2')).toBeTruthy();
      expect(extensions.get('Extension1')).toBeTruthy();

      expect(extensions.get('NonExistingExtension')).toBeFalsy();
      expect('extension not supported').toHaveBeenWarnedTimes(1);
    });

    test('get (with aliases)', () => {
      const gl = new WebglContextMock(['WEBKIT_WEBGL_depth_texture']);
      const extensions = WebGLExtensions(gl);

      expect(extensions.get('WEBGL_depth_texture')).toBeTruthy();
      expect(extensions.get('WEBKIT_WEBGL_depth_texture')).toBeTruthy();

      expect(extensions.get('EXT_texture_filter_anisotropic')).toBeFalsy();
      expect(extensions.get('NonExistingExtension')).toBeFalsy();
      expect('extension not supported').toHaveBeenWarnedTimes(2);
    });

    test('init', () => {
      const gl = new WebglContextMock();
      const extensions = WebGLExtensions(gl);
      extensions.init({ isWebGL2: false });

      expect(extensions).toBeDefined();

      const gl2 = new WebglContextMock();
      const extensions2 = WebGLExtensions(gl2);
      extensions2.init({ isWebGL2: true });

      expect(extensions2).toBeDefined();
    });
  });
});
