import { Raycaster } from '@renderlayer/core';
import { Matrix4, Plane, Vector2, Vector3 } from '@renderlayer/math';

import { MOUSE, TOUCH, Controls } from './Controls.js';

class DragControls extends Controls {
  state = _STATE.NONE;

  objects = [];

  recursive = true;
  transformGroup = false;
  rotateSpeed = 1;
  raycaster = new Raycaster();

  mouseButtons = { LEFT: MOUSE.PAN, MIDDLE: MOUSE.PAN, RIGHT: MOUSE.ROTATE };
  touches = { ONE: TOUCH.PAN, TWO: TOUCH.PAN };

  onPointerMove;
  onPointerDown;
  onPointerCancel;
  onContextMenu;

  constructor(objects, camera, domElement = null) {
    super(camera, domElement);

    this.objects = objects;

    this.onPointerMove = this.#onPointerMove.bind(this);
    this.onPointerDown = this.#onPointerDown.bind(this);
    this.onPointerCancel = this.#onPointerCancel.bind(this);
    this.onContextMenu = this.#onContextMenu.bind(this);

    if (domElement !== null) {
      this.connect(domElement);
    }
  }

  connect(element) {
    super.connect(element);

    this.domElement.addEventListener('pointermove', this.onPointerMove);
    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.domElement.addEventListener('pointerup', this.onPointerCancel);
    this.domElement.addEventListener('pointerleave', this.onPointerCancel);
    this.domElement.addEventListener('contextmenu', this.onContextMenu);

    this.domElement.style.touchAction = 'none'; // disable touch scroll
  }

  disconnect() {
    this.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.domElement.removeEventListener('pointerup', this.onPointerCancel);
    this.domElement.removeEventListener('pointerleave', this.onPointerCancel);
    this.domElement.removeEventListener('contextmenu', this.onContextMenu);

    this.domElement.style.touchAction = 'auto';
    this.domElement.style.cursor = '';
  }

  dispose() {
    this.disconnect();
  }

  #updatePointer(event) {
    const rect = this.domElement.getBoundingClientRect();

    _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    _pointer.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  #updateState(event) {
    // determine action
    let action;

    if (event.pointerType === 'touch') {
      action = this.touches.ONE;
    } else {
      switch (event.button) {
        case 0:
          action = this.mouseButtons.LEFT;
          break;

        case 1:
          action = this.mouseButtons.MIDDLE;
          break;

        case 2:
          action = this.mouseButtons.RIGHT;
          break;

        default:
          action = null;
      }
    }

    // determine state

    switch (action) {
      case MOUSE.PAN:
      case TOUCH.PAN:
        this.state = _STATE.PAN;
        break;

      case MOUSE.ROTATE:
      case TOUCH.ROTATE:
        this.state = _STATE.ROTATE;
        break;

      default:
        this.state = _STATE.NONE;
    }
  }

  #onPointerMove(event) {
    const camera = this.object;
    const domElement = this.domElement;
    const raycaster = this.raycaster;

    if (this.enabled === false) return;

    this.#updatePointer(event);

    raycaster.setFromCamera(_pointer, camera);

    if (_selected) {
      if (this.state === _STATE.PAN) {
        if (raycaster.ray.intersectPlane(_plane, _intersection)) {
          _selected.position.copy(_intersection.sub(_offset).applyMatrix4(_inverseMatrix));
          this.dispatchEvent({ type: 'drag', object: _selected });
        }
      } else if (this.state === _STATE.ROTATE) {
        _diff.subVectors(_pointer, _previousPointer).multiplyScalar(this.rotateSpeed);
        _selected.rotateOnWorldAxis(_up, _diff.x);
        _selected.rotateOnWorldAxis(_right.normalize(), -_diff.y);
        this.dispatchEvent({ type: 'drag', object: _selected });
      }

      _previousPointer.copy(_pointer);
    } else {
      // hover support

      if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        _intersections.length = 0;

        raycaster.setFromCamera(_pointer, camera);
        raycaster.intersectObjects(this.objects, this.recursive, _intersections);

        if (_intersections.length > 0) {
          const object = _intersections[0].object;

          _plane.setFromNormalAndCoplanarPoint(
            camera.getWorldDirection(_plane.normal),
            _worldPosition.setFromMatrixPosition(object.matrixWorld)
          );

          if (_hovered !== object && _hovered !== null) {
            this.dispatchEvent({ type: 'hoveroff', object: _hovered });

            domElement.style.cursor = 'auto';
            _hovered = null;
          }

          if (_hovered !== object) {
            this.dispatchEvent({ type: 'hoveron', object: object });

            domElement.style.cursor = 'pointer';
            _hovered = object;
          }
        } else {
          if (_hovered !== null) {
            this.dispatchEvent({ type: 'hoveroff', object: _hovered });

            domElement.style.cursor = 'auto';
            _hovered = null;
          }
        }
      }
    }

    _previousPointer.copy(_pointer);
  }

  #onPointerDown(event) {
    const camera = this.object;
    const domElement = this.domElement;
    const raycaster = this.raycaster;

    if (this.enabled === false) return;

    this.#updatePointer(event);
    this.#updateState(event);

    _intersections.length = 0;

    raycaster.setFromCamera(_pointer, camera);
    raycaster.intersectObjects(this.objects, this.recursive, _intersections);

    if (_intersections.length > 0) {
      if (this.transformGroup === true) {
        // look for the outermost group in the object's upper hierarchy

        _selected = _findGroup(_intersections[0].object);
      } else {
        _selected = _intersections[0].object;
      }

      _plane.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(_plane.normal),
        _worldPosition.setFromMatrixPosition(_selected.matrixWorld)
      );

      if (raycaster.ray.intersectPlane(_plane, _intersection)) {
        if (this.state === _STATE.PAN) {
          _inverseMatrix.copy(_selected.parent.matrixWorld).invert();
          _offset
            .copy(_intersection)
            .sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld));
          domElement.style.cursor = 'move';
          this.dispatchEvent({ type: 'dragstart', object: _selected });
        } else if (this.state === _STATE.ROTATE) {
          // the controls only support Y+ up
          _up.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
          _right.set(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
          domElement.style.cursor = 'move';
          this.dispatchEvent({ type: 'dragstart', object: _selected });
        }
      }
    }

    _previousPointer.copy(_pointer);
  }

  #onPointerCancel() {
    if (this.enabled === false) return;

    if (_selected) {
      this.dispatchEvent({ type: 'dragend', object: _selected });
      _selected = null;
    }

    this.domElement.style.cursor = _hovered ? 'pointer' : 'auto';
    this.state = _STATE.NONE;
  }

  #onContextMenu(event) {
    if (this.enabled === false) return;

    event.preventDefault();
  }
}

function _findGroup(obj, group = null) {
  if (obj.isGroup) group = obj;

  if (obj.parent === null) return group;

  return _findGroup(obj.parent, group);
}

const _plane = new Plane();

const _pointer = new Vector2();
const _offset = new Vector3();
const _diff = new Vector2();
const _previousPointer = new Vector2();
const _intersection = new Vector3();
const _worldPosition = new Vector3();
const _inverseMatrix = new Matrix4();

const _up = new Vector3();
const _right = new Vector3();

let _selected = null;
let _hovered = null;
const _intersections = [];

const _STATE = { NONE: -1, PAN: 0, ROTATE: 1 };

export { DragControls };
