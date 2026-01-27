class WebGLBufferRenderer {
  #gl;
  #info;

  #mode = null;

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {import('./WebGLExtensions.js').WebGLExtensions} extensions
   * @param {import('./WebGLCapabilities.js').WebGLCapabilities} capabilities
   */
  constructor(gl, extensions, info, capabilities) {
    this.#gl = gl;
    this.#info = info;
  }

  setMode(value) {
    this.#mode = value;
  }

  render(start, count) {
    this.#gl.drawArrays(this.#mode, start, count);
    this.#info.update(count, this.#mode, 1);
  }

  renderInstances(start, count, primcount) {
    if (primcount === 0) return;
    this.#gl.drawArraysInstanced(this.#mode, start, count, primcount);
    this.#info.update(count, this.#mode, primcount);
  }
}

export { WebGLBufferRenderer };
