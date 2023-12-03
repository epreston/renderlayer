class WebGLBufferRenderer {
  /** @param {WebGL2RenderingContext} gl */
  constructor(gl, extensions, info, capabilities) {
    this._gl = gl;
    this._info = info;

    this._mode = null;
  }

  setMode(value) {
    this._mode = value;
  }

  render(start, count) {
    this._gl.drawArrays(this._mode, start, count);
    this._info.update(count, this._mode, 1);
  }

  renderInstances(start, count, primcount) {
    if (primcount === 0) return;
    this._gl.drawArraysInstanced(this._mode, start, count, primcount);
    this._info.update(count, this._mode, primcount);
  }
}

export { WebGLBufferRenderer };
