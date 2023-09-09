function WebGLIndexedBufferRenderer(gl, extensions, info, capabilities) {
  let mode;

  function setMode(value) {
    mode = value;
  }

  let type, bytesPerElement;

  function setIndex(value) {
    type = value.type;
    bytesPerElement = value.bytesPerElement;
  }

  function render(start, count) {
    gl.drawElements(mode, count, type, start * bytesPerElement);

    info.update(count, mode, 1);
  }

  function renderInstances(start, count, primcount) {
    if (primcount === 0) return;

    gl.drawElementsInstanced(mode, count, type, start * bytesPerElement, primcount);

    info.update(count, mode, primcount);
  }

  //

  this.setMode = setMode;
  this.setIndex = setIndex;
  this.render = render;
  this.renderInstances = renderInstances;
}

export { WebGLIndexedBufferRenderer };
