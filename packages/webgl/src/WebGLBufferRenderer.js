/**
 * @import { WebGLExtensions, WebGLInfo } from "@renderlayer/webgl"
 */

class WebGLBufferRenderer {
  #gl;
  #info;
  #extensions;

  #mode = null;

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLExtensions} extensions
   * @param {WebGLInfo} info
   */
  constructor(gl, extensions, info) {
    this.#gl = gl;
    this.#info = info;
    this.#extensions = extensions;
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

  renderMultiDraw(starts, counts, drawCount) {
    if (drawCount === 0) return;

    const extension = this.#extensions.get('WEBGL_multi_draw'); // 93.32%
    extension.multiDrawArraysWEBGL(this.#mode, starts, 0, counts, 0, drawCount);

    let elementCount = 0;
    for (let i = 0; i < drawCount; i++) {
      elementCount += counts[i];
    }

    this.#info.update(elementCount, this.#mode, 1);
  }

  renderMultiDrawInstances(starts, counts, drawCount, primcount) {
    if (drawCount === 0) return;

    const extension = this.#extensions.get('WEBGL_multi_draw'); // 93.32%

    if (extension === null) {
      for (let i = 0; i < starts.length; i++) {
        this.renderInstances(starts[i], counts[i], primcount[i]);
      }
    } else {
      extension.multiDrawArraysInstancedWEBGL(
        this.#mode,
        starts,
        0,
        counts,
        0,
        primcount,
        0,
        drawCount
      );

      let elementCount = 0;
      for (let i = 0; i < drawCount; i++) {
        elementCount += counts[i] * primcount[i];
      }

      this.#info.update(elementCount, this.#mode, 1);
    }
  }
}

export { WebGLBufferRenderer };
