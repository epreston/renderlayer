class WebGLIndexedBufferRenderer {
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {import('./WebGLExtensions.js').WebGLExtensions} extensions
   * @param {import('./WebGLCapabilities.js').WebGLCapabilities} capabilities
   */
  constructor(gl, extensions, info, capabilities) {
    this._gl = gl;
    this._info = info;

    this._mode = null;

    this._type = null;
    this._bytesPerElement = null;
  }

  setMode(value) {
    this._mode = value;
  }

  setIndex(value) {
    this._type = value.type;
    this._bytesPerElement = value.bytesPerElement;
  }

  render(start, count) {
    this._gl.drawElements(this._mode, count, this._type, start * this._bytesPerElement);

    this._info.update(count, this._mode, 1);
  }

  renderInstances(start, count, primcount) {
    if (primcount === 0) return;

    this._gl.drawElementsInstanced(
      this._mode,
      count,
      this._type,
      start * this._bytesPerElement,
      primcount
    );

    this._info.update(count, this._mode, primcount);
  }
}

export { WebGLIndexedBufferRenderer };
