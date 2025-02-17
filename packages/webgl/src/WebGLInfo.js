class WebGLInfo {
  /** @param { WebGL2RenderingContext} gl */
  constructor(gl) {
    this._gl = gl;

    this.memory = {
      geometries: 0,
      textures: 0
    };

    this.render = {
      frame: 0,
      calls: 0,
      triangles: 0,
      points: 0,
      lines: 0
    };

    this.programs = null;
    this.autoReset = true;
  }

  update(count, mode, instanceCount) {
    const { render, _gl: gl } = this;

    render.calls++;

    switch (mode) {
      case gl.TRIANGLES:
        render.triangles += instanceCount * (count / 3);
        break;

      case gl.LINES:
        render.lines += instanceCount * (count / 2);
        break;

      case gl.LINE_STRIP:
        render.lines += instanceCount * (count - 1);
        break;

      case gl.LINE_LOOP:
        render.lines += instanceCount * count;
        break;

      case gl.POINTS:
        render.points += instanceCount * count;
        break;

      default:
        console.error('WebGLInfo: Unknown draw mode:', mode);
        break;
    }
  }

  reset() {
    const { render } = this;

    render.calls = 0;
    render.triangles = 0;
    render.points = 0;
    render.lines = 0;
  }
}

export { WebGLInfo };
