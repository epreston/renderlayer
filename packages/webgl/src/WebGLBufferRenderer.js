/**
 * @import { WebGLExtensions, WebGLInfo } from "@renderlayer/webgl"
 */

class WebGLBufferRenderer {
  #gl;
  #info;

  #mode = null;

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLExtensions} extensions
   * @param {WebGLInfo} info
   */
  constructor(gl, extensions, info) {
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
