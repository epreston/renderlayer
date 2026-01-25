import { EventDispatcher } from '@renderlayer/core';

export const MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2, ROTATE: 0, DOLLY: 1, PAN: 2 };
export const TOUCH = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 };

class Controls extends EventDispatcher {
  object;
  domElement = null;

  enabled = true;
  state = -1;
  keys = {};

  mouseButtons = { LEFT: null, MIDDLE: null, RIGHT: null };
  touches = { ONE: null, TWO: null };

  constructor(object, domElement = null) {
    super();

    this.object = object;
    this.domElement = domElement;
  }

  connect(element) {
    if (this.domElement !== null) this.disconnect();
    this.domElement = element;
  }

  disconnect() {}

  dispose() {}

  update(/* delta */) {}
}

export { Controls };
