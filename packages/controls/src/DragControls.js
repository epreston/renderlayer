import { EventDispatcher, Raycaster } from '@renderlayer/core';
import { Matrix4, Plane, Vector2, Vector3 } from '@renderlayer/math';

class DragControls extends EventDispatcher {
  enabled = true;
  recursive = true;
  transformGroup = false;

  constructor(objects, camera, domElement) {
    super();

    domElement.style.touchAction = 'none'; // disable touch scroll

    let _selected = null;
    let _hovered = null;

    const _intersections = [];

    //

    const scope = this;

    function activate() {
      domElement.addEventListener('pointermove', onPointerMove);
      domElement.addEventListener('pointerdown', onPointerDown);
      domElement.addEventListener('pointerup', onPointerCancel);
      domElement.addEventListener('pointerleave', onPointerCancel);
    }

    function deactivate() {
      domElement.removeEventListener('pointermove', onPointerMove);
      domElement.removeEventListener('pointerdown', onPointerDown);
      domElement.removeEventListener('pointerup', onPointerCancel);
      domElement.removeEventListener('pointerleave', onPointerCancel);

      domElement.style.cursor = '';
    }

    function dispose() {
      deactivate();
    }

    function getObjects() {
      return objects;
    }

    function getRaycaster() {
      return _raycaster;
    }

    function onPointerMove(event) {
      if (scope.enabled === false) return;

      updatePointer(event);

      _raycaster.setFromCamera(_pointer, camera);

      if (_selected) {
        if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
          _selected.position.copy(_intersection.sub(_offset).applyMatrix4(_inverseMatrix));
        }

        scope.dispatchEvent({ type: 'drag', object: _selected });

        return;
      }

      // hover support

      if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        _intersections.length = 0;

        _raycaster.setFromCamera(_pointer, camera);
        _raycaster.intersectObjects(objects, scope.recursive, _intersections);

        if (_intersections.length > 0) {
          const object = _intersections[0].object;

          _plane.setFromNormalAndCoplanarPoint(
            camera.getWorldDirection(_plane.normal),
            _worldPosition.setFromMatrixPosition(object.matrixWorld)
          );

          if (_hovered !== object && _hovered !== null) {
            scope.dispatchEvent({ type: 'hoveroff', object: _hovered });

            domElement.style.cursor = 'auto';
            _hovered = null;
          }

          if (_hovered !== object) {
            scope.dispatchEvent({ type: 'hoveron', object: object });

            domElement.style.cursor = 'pointer';
            _hovered = object;
          }
        } else {
          if (_hovered !== null) {
            scope.dispatchEvent({ type: 'hoveroff', object: _hovered });

            domElement.style.cursor = 'auto';
            _hovered = null;
          }
        }
      }
    }

    function onPointerDown(event) {
      if (scope.enabled === false) return;

      updatePointer(event);

      _intersections.length = 0;

      _raycaster.setFromCamera(_pointer, camera);
      _raycaster.intersectObjects(objects, scope.recursive, _intersections);

      if (_intersections.length > 0) {
        _selected = scope.transformGroup === true ? objects[0] : _intersections[0].object;

        _plane.setFromNormalAndCoplanarPoint(
          camera.getWorldDirection(_plane.normal),
          _worldPosition.setFromMatrixPosition(_selected.matrixWorld)
        );

        if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
          _inverseMatrix.copy(_selected.parent.matrixWorld).invert();
          _offset
            .copy(_intersection)
            .sub(_worldPosition.setFromMatrixPosition(_selected.matrixWorld));
        }

        domElement.style.cursor = 'move';

        scope.dispatchEvent({ type: 'dragstart', object: _selected });
      }
    }

    function onPointerCancel() {
      if (scope.enabled === false) return;

      if (_selected) {
        scope.dispatchEvent({ type: 'dragend', object: _selected });

        _selected = null;
      }

      domElement.style.cursor = _hovered ? 'pointer' : 'auto';
    }

    function updatePointer(event) {
      const rect = domElement.getBoundingClientRect();

      _pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      _pointer.y = (-(event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    activate();

    // API

    this.activate = activate;
    this.deactivate = deactivate;
    this.dispose = dispose;
    this.getObjects = getObjects;
    this.getRaycaster = getRaycaster;
  }
}

const _plane = new Plane();
const _raycaster = new Raycaster();

const _pointer = new Vector2();
const _offset = new Vector3();
const _intersection = new Vector3();
const _worldPosition = new Vector3();
const _inverseMatrix = new Matrix4();

export { DragControls };
