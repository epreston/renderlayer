class WebGLBufferRenderer {
  /** @param { WebGL2RenderingContext} gl */
  constructor(gl, extensions, info, capabilities) {
    let mode;

    function setMode(value) {
      mode = value;
    }

    function render(start, count) {
      gl.drawArrays(mode, start, count);

      info.update(count, mode, 1);
    }

    function renderInstances(start, count, primcount) {
      if (primcount === 0) return;

      gl.drawArraysInstanced(mode, start, count, primcount);

      info.update(count, mode, primcount);
    }

    //

    this.setMode = setMode;
    this.render = render;
    this.renderInstances = renderInstances;
  }
}

export { WebGLBufferRenderer };
