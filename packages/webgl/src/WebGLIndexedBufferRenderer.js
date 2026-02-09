/**
 * @import { WebGLExtensions, WebGLInfo } from "@renderlayer/webgl"
 */

class WebGLIndexedBufferRenderer {
  #gl;
  #info;
  #extensions;

  #mode = null;
  #type = null;
  #bytesPerElement = null;

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

  renderMultiDraw(starts, counts, drawCount) {
    if (drawCount === 0) return;

    const extension = this.#extensions.get('WEBGL_multi_draw');
    extension.multiDrawElementsWEBGL(this.#mode, counts, 0, this.#type, starts, 0, drawCount);

    let elementCount = 0;
    for (let i = 0; i < drawCount; i++) {
      elementCount += counts[i];
    }

    this.#info.update(elementCount, this.#mode, 1);
  }

  renderMultiDrawInstances(starts, counts, drawCount, primcount) {
    if (drawCount === 0) return;

    const extension = this.#extensions.get('WEBGL_multi_draw');

    if (extension === null) {
      for (let i = 0; i < starts.length; i++) {
        this.renderInstances(starts[i] / this.#bytesPerElement, counts[i], primcount[i]);
      }
    } else {
      extension.multiDrawElementsInstancedWEBGL(
        this.#mode,
        counts,
        0,
        this.#type,
        starts,
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

export { WebGLIndexedBufferRenderer };
