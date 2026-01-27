class WebGLIndexedBufferRenderer {
  #gl;
  #info;

  #mode = null;
  #type = null;
  #bytesPerElement = null;

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {import('./WebGLExtensions.js').WebGLExtensions} extensions
   * @param {import('./WebGLInfo.js').WebGLInfo} info
   * @param {import('./WebGLCapabilities.js').WebGLCapabilities} capabilities
   */
  constructor(gl, extensions, info, capabilities) {
    this.#gl = gl;
    this.#info = info;
  }

  setMode(value) {
    this.#mode = value;
  }

  setIndex(value) {
    this.#type = value.type;
    this.#bytesPerElement = value.bytesPerElement;
  }

  render(start, count) {
    this.#gl.drawElements(this.#mode, count, this.#type, start * this.#bytesPerElement);

    this.#info.update(count, this.#mode, 1);
  }

  renderInstances(start, count, primcount) {
    if (primcount === 0) return;

    this.#gl.drawElementsInstanced(
      this.#mode,
      count,
      this.#type,
      start * this.#bytesPerElement,
      primcount
    );

    this.#info.update(count, this.#mode, primcount);
  }
}

export { WebGLIndexedBufferRenderer };
