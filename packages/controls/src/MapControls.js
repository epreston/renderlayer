import { MOUSE, TOUCH, OrbitControls } from './OrbitControls.js';

// MapControls performs orbiting, dollying (zooming), and panning.
// It maintains the "up" direction object.up (+Y by default).
//
//    Orbit - right mouse, or left mouse + ctrl/meta/shiftKey / touch: two-finger rotate
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - left mouse, or arrow keys / touch: one-finger move

class MapControls extends OrbitControls {
  // pan orthogonal to world-space direction camera.up
  screenSpacePanning = false;

  mouseButtons = { LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.ROTATE };

  touches = { ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_ROTATE };

  constructor(object, domElement) {
    super(object, domElement);
  }
}

export { MapControls };
