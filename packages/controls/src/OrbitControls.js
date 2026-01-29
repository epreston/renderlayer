import { DEG2RAD, Plane, Quaternion, Ray, Vector2, Vector3 } from '@renderlayer/math';

import { MOUSE, TOUCH, Controls } from './Controls.js';
import { Spherical } from './Spherical.js';

// OrbitControls performs orbiting, dollying (zooming), and panning.
// It maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

class OrbitControls extends Controls {
  state = _STATE.NONE;

  // sets the location of focus, where the object orbits around
  target = new Vector3();

  // The focus point of the `minTargetRadius` and `maxTargetRadius` limits.
  cursor = new Vector3();

  // How far you can dolly in and out ( PerspectiveCamera only )
  minDistance = 0;
  maxDistance = Infinity;

  // How far you can zoom in and out ( OrthographicCamera only )
  minZoom = 0;
  maxZoom = Infinity;

  // How far you can move the target from the 3D `cursor`
  minTargetRadius = 0;
  maxTargetRadius = Infinity;

  // How far you can orbit vertically, upper and lower limits.
  // Range is 0 to Math.PI radians.
  minPolarAngle = 0; // radians
  maxPolarAngle = Math.PI; // radians

  // How far you can orbit horizontally, upper and lower limits.
  // If set, the interval [ min, max ] must be a sub-interval of [ - 2 PI, 2 PI ], with ( max - min < 2 PI )
  minAzimuthAngle = -Infinity; // radians
  maxAzimuthAngle = Infinity; // radians

  // Set to true to enable damping (inertia)
  // If damping is enabled, you must call controls.update() in your animation loop
  enableDamping = false;
  dampingFactor = 0.05;

  // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
  // Set to false to disable zooming
  enableZoom = true;
  zoomSpeed = 1.0;

  // Set to false to disable rotating
  enableRotate = true;
  rotateSpeed = 1.0;
  keyRotateSpeed = 1.0;

  // Set to false to disable panning
  enablePan = true;
  panSpeed = 1.0;
  screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
  keyPanSpeed = 7.0; // pixels moved per arrow key push
  zoomToCursor = false;

  // Set to true to automatically rotate around the target
  // If auto-rotate is enabled, you must call controls.update() in your animation loop
  autoRotate = false;
  autoRotateSpeed = 2.0; // 30 seconds per orbit when fps is 60

  keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };
  mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };
  touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

  // for reset
  #target0;
  #position0;
  #zoom0;

  // the target DOM element for key events
  #domElementKeyEvents = null;

  // internals

  #lastPosition = new Vector3();
  #lastQuaternion = new Quaternion();
  #lastTargetPosition = new Vector3();

  // so camera.up is the orbit axis
  #quat;
  #quatInverse;

  // current position in spherical coordinates
  #spherical = new Spherical();
  #sphericalDelta = new Spherical();

  #scale = 1;
  #panOffset = new Vector3();

  #rotateStart = new Vector2();
  #rotateEnd = new Vector2();
  #rotateDelta = new Vector2();

  #panStart = new Vector2();
  #panEnd = new Vector2();
  #panDelta = new Vector2();

  #dollyStart = new Vector2();
  #dollyEnd = new Vector2();
  #dollyDelta = new Vector2();

  #dollyDirection = new Vector3();
  #mouse = new Vector2();
  #performCursorZoom = false;

  #pointers = [];
  #pointerPositions = {};

  #controlActive = false;

  constructor(camera, domElement = null) {
    super(camera, domElement);

    // for reset
    this.#target0 = this.target.clone();
    this.#position0 = this.object.position.clone();
    this.#zoom0 = this.object.zoom;

    this.#quat = new Quaternion().setFromUnitVectors(camera.up, new Vector3(0, 1, 0));
    this.#quatInverse = this.#quat.clone().invert();

    this.onPointerMove = this.#onPointerMove.bind(this);
    this.onPointerDown = this.#onPointerDown.bind(this);
    this.onPointerUp = this.#onPointerUp.bind(this);

    this.onContextMenu = this.#onContextMenu.bind(this);
    this.onMouseWheel = this.#onMouseWheel.bind(this);
    this.onKeyDown = this.#onKeyDown.bind(this);

    this.interceptControlDown = this.#interceptControlDown.bind(this);
    this.interceptControlUp = this.#interceptControlUp.bind(this);

    if (domElement !== null) {
      this.connect(domElement);
    }

    this.update();
  }

  connect(element) {
    super.connect(element);

    this.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.domElement.addEventListener('pointercancel', this.onPointerUp);

    this.domElement.addEventListener('contextmenu', this.onContextMenu);
    this.domElement.addEventListener('wheel', this.onMouseWheel, { passive: false });

    const document = this.domElement.getRootNode(); // offscreen canvas compatibility
    document.addEventListener('keydown', this.interceptControlDown, {
      passive: true,
      capture: true
    });

    this.domElement.style.touchAction = 'none'; // disable touch scroll
  }

  disconnect() {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.domElement.removeEventListener('pointercancel', this.onPointerUp);

    this.domElement.removeEventListener('contextmenu', this.onContextMenu);
    this.domElement.removeEventListener('wheel', this.onMouseWheel);

    this.domElement.ownerDocument.removeEventListener('pointermove', this.onPointerMove);
    this.domElement.ownerDocument.removeEventListener('pointerup', this.onPointerUp);

    this.stopListenToKeyEvents();

    const document = this.domElement.getRootNode(); // offscreen canvas compatibility
    document.removeEventListener('keydown', this.interceptControlDown, { capture: true });

    this.domElement.style.touchAction = 'auto';
  }

  dispose() {
    this.disconnect();
  }

  getPolarAngle() {
    return this.#spherical.phi;
  }

  getAzimuthalAngle() {
    this.#spherical.theta;
  }

  getDistance() {
    return this.object.position.distanceTo(this.target);
  }

  listenToKeyEvents(domElement) {
    domElement.addEventListener('keydown', this.onKeyDown);
    this._domElementKeyEvents = domElement;
  }

  stopListenToKeyEvents() {
    if (this.#domElementKeyEvents) {
      this.#domElementKeyEvents.removeEventListener('keydown', this.onKeyDown);
      this._domElementKeyEvents = null;
    }
  }

  saveState() {
    this.#target0.copy(this.target);
    this.#position0.copy(this.object.position);
    this.#zoom0 = this.object.zoom;
  }

  reset() {
    this.target.copy(this.#target0);
    this.object.position.copy(this.#position0);
    this.object.zoom = this.#zoom0;

    this.object.updateProjectionMatrix();
    this.dispatchEvent(_changeEvent);

    this.update();

    this.state = _STATE.NONE;
  }

  update(deltaTime = null) {
    const position = this.object.position;

    _v.copy(position).sub(this.target);

    // rotate offset to "y-axis-is-up" space
    _v.applyQuaternion(this.#quat);

    // angle from z-axis around y-axis
    this.#spherical.setFromVector3(_v);

    if (this.autoRotate && this.state === _STATE.NONE) {
      this.#rotateLeft(this.#getAutoRotationAngle(deltaTime));
    }

    if (this.enableDamping) {
      this.#spherical.theta += this.#sphericalDelta.theta * this.dampingFactor;
      this.#spherical.phi += this.#sphericalDelta.phi * this.dampingFactor;
    } else {
      this.#spherical.theta += this.#sphericalDelta.theta;
      this.#spherical.phi += this.#sphericalDelta.phi;
    }

    // restrict theta to be between desired limits
    let min = this.minAzimuthAngle;
    let max = this.maxAzimuthAngle;

    if (isFinite(min) && isFinite(max)) {
      if (min < -Math.PI) min += _TWOPI;
      else if (min > Math.PI) min -= _TWOPI;

      if (max < -Math.PI) max += _TWOPI;
      else if (max > Math.PI) max -= _TWOPI;

      if (min <= max) {
        this.#spherical.theta = Math.max(min, Math.min(max, this.#spherical.theta));
      } else {
        this.#spherical.theta =
          this.#spherical.theta > (min + max) / 2 ?
            Math.max(min, this.#spherical.theta)
          : Math.min(max, this.#spherical.theta);
      }
    }

    // restrict phi to be between desired limits
    this.#spherical.phi = Math.max(
      this.minPolarAngle,
      Math.min(this.maxPolarAngle, this.#spherical.phi)
    );

    this.#spherical.makeSafe();

    // move target to panned location
    if (this.enableDamping === true) {
      this.target.addScaledVector(this.#panOffset, this.dampingFactor);
    } else {
      this.target.add(this.#panOffset);
    }

    // Limit the target distance from the cursor to create a sphere around the center of interest
    this.target.sub(this.cursor);
    this.target.clampLength(this.minTargetRadius, this.maxTargetRadius);
    this.target.add(this.cursor);

    let zoomChanged = false;

    // adjust the camera position based on zoom only if we're not zooming to the cursor or if it's an ortho camera
    // we adjust zoom later in these cases
    if ((this.zoomToCursor && this.#performCursorZoom) || this.object.isOrthographicCamera) {
      this.#spherical.radius = this.#clampDistance(this.#spherical.radius);
    } else {
      const prevRadius = this.#spherical.radius;
      this.#spherical.radius = this.#clampDistance(this.#spherical.radius * this.#scale);
      zoomChanged = prevRadius !== this.#spherical.radius;
    }

    _v.setFromSpherical(this.#spherical);

    // rotate offset back to "camera-up-vector-is-up" space
    _v.applyQuaternion(this.#quatInverse);

    position.copy(this.target).add(_v);

    this.object.lookAt(this.target);

    if (this.enableDamping === true) {
      this.#sphericalDelta.theta *= 1 - this.dampingFactor;
      this.#sphericalDelta.phi *= 1 - this.dampingFactor;

      this.#panOffset.multiplyScalar(1 - this.dampingFactor);
    } else {
      this.#sphericalDelta.set(0, 0, 0);

      this.#panOffset.set(0, 0, 0);
    }

    // adjust camera position
    if (this.zoomToCursor && this.#performCursorZoom) {
      let newRadius = null;
      if (this.object.isPerspectiveCamera) {
        // move the camera down the pointer ray
        // this method avoids floating point error
        const prevRadius = _v.length();
        newRadius = this.#clampDistance(prevRadius * this.#scale);

        const radiusDelta = prevRadius - newRadius;
        this.object.position.addScaledVector(this.#dollyDirection, radiusDelta);
        this.object.updateMatrixWorld();

        zoomChanged = !!radiusDelta;
      } else if (this.object.isOrthographicCamera) {
        // adjust the ortho camera position based on zoom changes
        const mouseBefore = new Vector3(this.#mouse.x, this.#mouse.y, 0);
        mouseBefore.unproject(this.object);

        const prevZoom = this.object.zoom;
        this.object.zoom = Math.max(
          this.minZoom,
          Math.min(this.maxZoom, this.object.zoom / this.#scale)
        );
        this.object.updateProjectionMatrix();

        zoomChanged = prevZoom !== this.object.zoom;

        const mouseAfter = new Vector3(this.#mouse.x, this.#mouse.y, 0);
        mouseAfter.unproject(this.object);

        this.object.position.sub(mouseAfter).add(mouseBefore);
        this.object.updateMatrixWorld();

        newRadius = _v.length();
      } else {
        console.warn('OrbitControls encountered an unknown camera type - zoom to cursor disabled.');
        this.zoomToCursor = false;
      }

      // handle the placement of the target
      if (newRadius !== null) {
        if (this.screenSpacePanning) {
          // position the orbit target in front of the new camera position
          this.target
            .set(0, 0, -1)
            .transformDirection(this.object.matrix)
            .multiplyScalar(newRadius)
            .add(this.object.position);
        } else {
          // get the ray and translation plane to compute target
          _ray.origin.copy(this.object.position);
          _ray.direction.set(0, 0, -1).transformDirection(this.object.matrix);

          // if the camera is 20 degrees above the horizon then don't adjust the focus target to avoid
          // extremely large values
          if (Math.abs(this.object.up.dot(_ray.direction)) < _TILT_LIMIT) {
            this.object.lookAt(this.target);
          } else {
            _plane.setFromNormalAndCoplanarPoint(this.object.up, this.target);
            _ray.intersectPlane(_plane, this.target);
          }
        }
      }
    } else if (this.object.isOrthographicCamera) {
      const prevZoom = this.object.zoom;
      this.object.zoom = Math.max(
        this.minZoom,
        Math.min(this.maxZoom, this.object.zoom / this.#scale)
      );

      if (prevZoom !== this.object.zoom) {
        this.object.updateProjectionMatrix();
        zoomChanged = true;
      }
    }

    this.#scale = 1;
    this.#performCursorZoom = false;

    // update condition is:
    // min(camera displacement, camera rotation in radians)^2 > EPS
    // using small-angle approximation cos(x/2) = 1 - x^2 / 8

    if (
      zoomChanged ||
      this.#lastPosition.distanceToSquared(this.object.position) > _EPS ||
      8 * (1 - this.#lastQuaternion.dot(this.object.quaternion)) > _EPS ||
      this.#lastTargetPosition.distanceToSquared(this.target) > _EPS
    ) {
      this.dispatchEvent(_changeEvent);

      this.#lastPosition.copy(this.object.position);
      this.#lastQuaternion.copy(this.object.quaternion);
      this.#lastTargetPosition.copy(this.target);

      return true;
    }

    return false;
  }

  #getAutoRotationAngle(deltaTime) {
    if (deltaTime !== null) {
      return ((2 * Math.PI) / 60) * this.autoRotateSpeed * deltaTime;
    } else {
      return ((2 * Math.PI) / 60 / 60) * this.autoRotateSpeed;
    }
  }

  #getZoomScale(delta) {
    const normalizedDelta = Math.abs(delta * 0.01);
    return Math.pow(0.95, this.zoomSpeed * normalizedDelta);
  }

  #rotateLeft(angle) {
    this.#sphericalDelta.theta -= angle;
  }

  #rotateUp(angle) {
    this.#sphericalDelta.phi -= angle;
  }

  #panLeft(distance, objectMatrix) {
    _v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
    _v.multiplyScalar(-distance);

    this.#panOffset.add(_v);
  }

  #panUp(distance, objectMatrix) {
    if (this.screenSpacePanning === true) {
      _v.setFromMatrixColumn(objectMatrix, 1);
    } else {
      _v.setFromMatrixColumn(objectMatrix, 0);
      _v.crossVectors(this.object.up, _v);
    }

    _v.multiplyScalar(distance);

    this.#panOffset.add(_v);
  }

  // deltaX and deltaY are in pixels; right and down are positive
  #pan(deltaX, deltaY) {
    const element = this.domElement;

    if (this.object.isPerspectiveCamera) {
      // perspective
      const position = this.object.position;
      _v.copy(position).sub(this.target);
      let targetDistance = _v.length();

      // half of the fov is center to top of screen
      targetDistance *= Math.tan(((this.object.fov / 2) * Math.PI) / 180.0);

      // we use only clientHeight here so aspect ratio does not distort speed
      this.#panLeft((2 * deltaX * targetDistance) / element.clientHeight, this.object.matrix);
      this.#panUp((2 * deltaY * targetDistance) / element.clientHeight, this.object.matrix);
    } else if (this.object.isOrthographicCamera) {
      // orthographic
      this.#panLeft(
        (deltaX * (this.object.right - this.object.left)) / this.object.zoom / element.clientWidth,
        this.object.matrix
      );
      this.#panUp(
        (deltaY * (this.object.top - this.object.bottom)) / this.object.zoom / element.clientHeight,
        this.object.matrix
      );
    } else {
      // camera neither orthographic nor perspective
      console.warn('OrbitControls encountered an unknown camera type - pan disabled.');
      this.enablePan = false;
    }
  }

  #dollyOut(dollyScale) {
    if (this.object.isPerspectiveCamera || this.object.isOrthographicCamera) {
      this.#scale /= dollyScale;
    } else {
      console.warn('OrbitControls encountered an unknown camera type - dolly/zoom disabled.');
      this.enableZoom = false;
    }
  }

  #dollyIn(dollyScale) {
    if (this.object.isPerspectiveCamera || this.object.isOrthographicCamera) {
      this.#scale *= dollyScale;
    } else {
      console.warn('OrbitControls encountered an unknown camera type - dolly/zoom disabled.');
      this.enableZoom = false;
    }
  }

  #updateZoomParameters(x, y) {
    if (!this.zoomToCursor) {
      return;
    }

    this.#performCursorZoom = true;

    const rect = this.domElement.getBoundingClientRect();
    const dx = x - rect.left;
    const dy = y - rect.top;
    const w = rect.width;
    const h = rect.height;

    this.#mouse.x = (dx / w) * 2 - 1;
    this.#mouse.y = -(dy / h) * 2 + 1;

    this.#dollyDirection
      .set(this.#mouse.x, this.#mouse.y, 1)
      .unproject(this.object)
      .sub(this.object.position)
      .normalize();
  }

  #clampDistance(dist) {
    return Math.max(this.minDistance, Math.min(this.maxDistance, dist));
  }

  //
  // event callbacks - update the object state
  //

  #handleMouseDownRotate(event) {
    this.#rotateStart.set(event.clientX, event.clientY);
  }

  #handleMouseDownDolly(event) {
    this.#updateZoomParameters(event.clientX, event.clientX);
    this.#dollyStart.set(event.clientX, event.clientY);
  }

  #handleMouseDownPan(event) {
    this.#panStart.set(event.clientX, event.clientY);
  }

  #handleMouseMoveRotate(event) {
    this.#rotateEnd.set(event.clientX, event.clientY);

    this.#rotateDelta
      .subVectors(this.#rotateEnd, this.#rotateStart)
      .multiplyScalar(this.rotateSpeed);

    const element = this.domElement;

    this.#rotateLeft((2 * Math.PI * this.#rotateDelta.x) / element.clientHeight); // yes, height

    this.#rotateUp((2 * Math.PI * this.#rotateDelta.y) / element.clientHeight);

    this.#rotateStart.copy(this.#rotateEnd);

    this.update();
  }

  #handleMouseMoveDolly(event) {
    this.#dollyEnd.set(event.clientX, event.clientY);

    this.#dollyDelta.subVectors(this.#dollyEnd, this.#dollyStart);

    if (this.#dollyDelta.y > 0) {
      this.#dollyOut(this.#getZoomScale(this.#dollyDelta.y));
    } else if (this.#dollyDelta.y < 0) {
      this.#dollyIn(this.#getZoomScale(this.#dollyDelta.y));
    }

    this.#dollyStart.copy(this.#dollyEnd);

    this.update();
  }

  #handleMouseMovePan(event) {
    this.#panEnd.set(event.clientX, event.clientY);

    this.#panDelta.subVectors(this.#panEnd, this.#panStart).multiplyScalar(this.panSpeed);

    this.#pan(this.#panDelta.x, this.#panDelta.y);

    this.#panStart.copy(this.#panEnd);

    this.update();
  }

  #handleMouseWheel(event) {
    this.#updateZoomParameters(event.clientX, event.clientY);

    if (event.deltaY < 0) {
      this.#dollyIn(this.#getZoomScale(event.deltaY));
    } else if (event.deltaY > 0) {
      this.#dollyOut(this.#getZoomScale(event.deltaY));
    }

    this.update();
  }

  #handleKeyDown(event) {
    let needsUpdate = false;

    switch (event.code) {
      case this.keys.UP:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate) {
            this.#rotateUp((_TWOPI * this.keyRotateSpeed) / this.domElement.clientHeight);
          }
        } else {
          if (this.enablePan) {
            this.#pan(0, this.keyPanSpeed);
          }
        }

        needsUpdate = true;
        break;

      case this.keys.BOTTOM:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate) {
            this.#rotateUp((-_TWOPI * this.keyRotateSpeed) / this.domElement.clientHeight);
          }
        } else {
          if (this.enablePan) {
            this.#pan(0, -this.keyPanSpeed);
          }
        }

        needsUpdate = true;
        break;

      case this.keys.LEFT:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate) {
            this.#rotateLeft((_TWOPI * this.keyRotateSpeed) / this.domElement.clientHeight);
          }
        } else {
          if (this.enablePan) {
            this.#pan(this.keyPanSpeed, 0);
          }
        }

        needsUpdate = true;
        break;

      case this.keys.RIGHT:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate) {
            this.#rotateLeft((-_TWOPI * this.keyRotateSpeed) / this.domElement.clientHeight);
          }
        } else {
          if (this.enablePan) {
            this.#pan(-this.keyPanSpeed, 0);
          }
        }

        needsUpdate = true;
        break;
    }

    if (needsUpdate) {
      // prevent the browser from scrolling on cursor keys
      event.preventDefault();

      this.update();
    }
  }

  #handleTouchStartRotate(event) {
    if (this.#pointers.length === 1) {
      this.#rotateStart.set(event.pageX, event.pageY);
    } else {
      const position = this.#getSecondPointerPosition(event);

      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);

      this.#rotateStart.set(x, y);
    }
  }

  #handleTouchStartPan(event) {
    if (this.#pointers.length === 1) {
      this.#panStart.set(event.pageX, event.pageY);
    } else {
      const position = this.#getSecondPointerPosition(event);

      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);

      this.#panStart.set(x, y);
    }
  }

  #handleTouchStartDolly(event) {
    const position = this.#getSecondPointerPosition(event);

    const dx = event.pageX - position.x;
    const dy = event.pageY - position.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    this.#dollyStart.set(0, distance);
  }

  #handleTouchStartDollyPan(event) {
    if (this.enableZoom) this.#handleTouchStartDolly(event);

    if (this.enablePan) this.#handleTouchStartPan(event);
  }

  #handleTouchStartDollyRotate(event) {
    if (this.enableZoom) this.#handleTouchStartDolly(event);

    if (this.enableRotate) this.#handleTouchStartRotate(event);
  }

  #handleTouchMoveRotate(event) {
    if (this.#pointers.length === 1) {
      this.#rotateEnd.set(event.pageX, event.pageY);
    } else {
      const position = this.#getSecondPointerPosition(event);

      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);

      this.#rotateEnd.set(x, y);
    }

    this.#rotateDelta
      .subVectors(this.#rotateEnd, this.#rotateStart)
      .multiplyScalar(this.rotateSpeed);

    const element = this.domElement;

    this.#rotateLeft((2 * Math.PI * this.#rotateDelta.x) / element.clientHeight); // yes, height
    this.#rotateUp((2 * Math.PI * this.#rotateDelta.y) / element.clientHeight);

    this.#rotateStart.copy(this.#rotateEnd);
  }

  #handleTouchMovePan(event) {
    if (this.#pointers.length === 1) {
      this.#panEnd.set(event.pageX, event.pageY);
    } else {
      const position = this.#getSecondPointerPosition(event);

      const x = 0.5 * (event.pageX + position.x);
      const y = 0.5 * (event.pageY + position.y);

      this.#panEnd.set(x, y);
    }

    this.#panDelta.subVectors(this.#panEnd, this.#panStart).multiplyScalar(this.panSpeed);

    this.#pan(this.#panDelta.x, this.#panDelta.y);

    this.#panStart.copy(this.#panEnd);
  }

  #handleTouchMoveDolly(event) {
    const position = this.#getSecondPointerPosition(event);

    const dx = event.pageX - position.x;
    const dy = event.pageY - position.y;

    const distance = Math.sqrt(dx * dx + dy * dy);

    this.#dollyEnd.set(0, distance);
    this.#dollyDelta.set(0, Math.pow(this.#dollyEnd.y / this.#dollyStart.y, this.zoomSpeed));
    this.#dollyOut(this.#dollyDelta.y);
    this.#dollyStart.copy(this.#dollyEnd);

    const centerX = (event.pageX + position.x) * 0.5;
    const centerY = (event.pageY + position.y) * 0.5;

    this.#updateZoomParameters(centerX, centerY);
  }

  #handleTouchMoveDollyPan(event) {
    if (this.enableZoom) this.#handleTouchMoveDolly(event);
    if (this.enablePan) this.#handleTouchMovePan(event);
  }

  #handleTouchMoveDollyRotate(event) {
    if (this.enableZoom) this.#handleTouchMoveDolly(event);
    if (this.enableRotate) this.#handleTouchMoveRotate(event);
  }

  //  pointer tracking

  #addPointer(event) {
    this.#pointers.push(event.pointerId);
  }

  #removePointer(event) {
    delete this.#pointerPositions[event.pointerId];

    for (let i = 0; i < this.#pointers.length; i++) {
      if (this.#pointers[i] === event.pointerId) {
        this.#pointers.splice(i, 1);
        return;
      }
    }
  }

  #isTrackingPointer(event) {
    for (let i = 0; i < this.#pointers.length; i++) {
      if (this.#pointers[i] === event.pointerId) return true;
    }

    return false;
  }

  #trackPointer(event) {
    let position = this.#pointerPositions[event.pointerId];

    if (position === undefined) {
      position = new Vector2();
      this.#pointerPositions[event.pointerId] = position;
    }

    position.set(event.pageX, event.pageY);
  }

  #getSecondPointerPosition(event) {
    const pointerId = event.pointerId === this.#pointers[0] ? this.#pointers[1] : this.#pointers[0];

    return this.#pointerPositions[pointerId];
  }

  //

  #customWheelEvent(event) {
    const mode = event.deltaMode;

    // minimal wheel event altered to meet delta-zoom demand
    const newEvent = {
      clientX: event.clientX,
      clientY: event.clientY,
      deltaY: event.deltaY
    };

    switch (mode) {
      case 1: // LINE_MODE
        newEvent.deltaY *= 16;
        break;

      case 2: // PAGE_MODE
        newEvent.deltaY *= 100;
        break;
    }

    // detect if event was triggered by pinching
    if (event.ctrlKey && !this.#controlActive) {
      newEvent.deltaY *= 10;
    }

    return newEvent;
  }

  // event handlers

  #onPointerDown(event) {
    if (this.enabled === false) return;

    if (this.#pointers.length === 0) {
      this.domElement.setPointerCapture(event.pointerId);

      this.domElement.ownerDocument.addEventListener('pointermove', this.onPointerMove);
      this.domElement.ownerDocument.addEventListener('pointerup', this.onPointerUp);
    }

    if (this.#isTrackingPointer(event)) return;

    this.#addPointer(event);

    if (event.pointerType === 'touch') {
      this.#onTouchStart(event);
    } else {
      this.#onMouseDown(event);
    }
  }

  #onPointerMove(event) {
    if (this.enabled === false) return;

    if (event.pointerType === 'touch') {
      this.#onTouchMove(event);
    } else {
      this.#onMouseMove(event);
    }
  }

  #onPointerUp(event) {
    this.#removePointer(event);

    if (this.#pointers.length === 0) {
      this.domElement.releasePointerCapture(event.pointerId);

      this.domElement.ownerDocument.removeEventListener('pointermove', this.onPointerMove);
      this.domElement.ownerDocument.removeEventListener('pointerup', this.onPointerUp);

      this.dispatchEvent(_endEvent);

      this.state = _STATE.NONE;

      return;
    }

    const pointerId = this.#pointers[0];
    const position = this.#pointerPositions[pointerId];

    // minimal placeholder event - allows state correction on pointer-up
    this.#onTouchStart({ pointerId: pointerId, pageX: position.x, pageY: position.y });
  }

  #onMouseDown(event) {
    let mouseAction;

    switch (event.button) {
      case 0:
        mouseAction = this.mouseButtons.LEFT;
        break;

      case 1:
        mouseAction = this.mouseButtons.MIDDLE;
        break;

      case 2:
        mouseAction = this.mouseButtons.RIGHT;
        break;

      default:
        mouseAction = -1;
    }

    switch (mouseAction) {
      case MOUSE.DOLLY:
        if (this.enableZoom === false) return;

        this.#handleMouseDownDolly(event);
        this.state = _STATE.DOLLY;

        break;

      case MOUSE.ROTATE:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enablePan === false) return;

          this.#handleMouseDownPan(event);
          this.state = _STATE.PAN;
        } else {
          if (this.enableRotate === false) return;

          this.#handleMouseDownRotate(event);
          this.state = _STATE.ROTATE;
        }

        break;

      case MOUSE.PAN:
        if (event.ctrlKey || event.metaKey || event.shiftKey) {
          if (this.enableRotate === false) return;

          this.#handleMouseDownRotate(event);
          this.state = _STATE.ROTATE;
        } else {
          if (this.enablePan === false) return;

          this.#handleMouseDownPan(event);
          this.state = _STATE.PAN;
        }

        break;

      default:
        this.state = _STATE.NONE;
    }

    if (this.state !== _STATE.NONE) {
      this.dispatchEvent(_startEvent);
    }
  }

  #onMouseMove(event) {
    switch (this.state) {
      case _STATE.ROTATE:
        if (this.enableRotate === false) return;

        this.#handleMouseMoveRotate(event);

        break;

      case _STATE.DOLLY:
        if (this.enableZoom === false) return;

        this.#handleMouseMoveDolly(event);

        break;

      case _STATE.PAN:
        if (this.enablePan === false) return;

        this.#handleMouseMovePan(event);

        break;
    }
  }

  #onMouseWheel(event) {
    if (this.enabled === false || this.enableZoom === false || this.state !== _STATE.NONE) return;

    event.preventDefault();

    this.dispatchEvent(_startEvent);

    this.#handleMouseWheel(this.#customWheelEvent(event));

    this.dispatchEvent(_endEvent);
  }

  #onKeyDown(event) {
    if (this.enabled === false) return;

    this.#handleKeyDown(event);
  }

  #onTouchStart(event) {
    this.#trackPointer(event);

    switch (this.#pointers.length) {
      case 1:
        switch (this.touches.ONE) {
          case TOUCH.ROTATE:
            if (this.enableRotate === false) return;

            this.#handleTouchStartRotate(event);
            this.state = _STATE.TOUCH_ROTATE;

            break;

          case TOUCH.PAN:
            if (this.enablePan === false) return;

            this.#handleTouchStartPan(event);
            this.state = _STATE.TOUCH_PAN;

            break;

          default:
            this.state = _STATE.NONE;
        }

        break;

      case 2:
        switch (this.touches.TWO) {
          case TOUCH.DOLLY_PAN:
            if (this.enableZoom === false && this.enablePan === false) return;

            this.#handleTouchStartDollyPan(event);
            this.state = _STATE.TOUCH_DOLLY_PAN;

            break;

          case TOUCH.DOLLY_ROTATE:
            if (this.enableZoom === false && this.enableRotate === false) return;

            this.#handleTouchStartDollyRotate(event);
            this.state = _STATE.TOUCH_DOLLY_ROTATE;

            break;

          default:
            this.state = _STATE.NONE;
        }

        break;

      default:
        this.state = _STATE.NONE;
    }

    if (this.state !== _STATE.NONE) {
      this.dispatchEvent(_startEvent);
    }
  }

  #onTouchMove(event) {
    this.#trackPointer(event);

    switch (this.state) {
      case _STATE.TOUCH_ROTATE:
        if (this.enableRotate === false) return;

        this.#handleTouchMoveRotate(event);
        this.update();

        break;

      case _STATE.TOUCH_PAN:
        if (this.enablePan === false) return;

        this.#handleTouchMovePan(event);
        this.update();

        break;

      case _STATE.TOUCH_DOLLY_PAN:
        if (this.enableZoom === false && this.enablePan === false) return;

        this.#handleTouchMoveDollyPan(event);
        this.update();

        break;

      case _STATE.TOUCH_DOLLY_ROTATE:
        if (this.enableZoom === false && this.enableRotate === false) return;

        this.#handleTouchMoveDollyRotate(event);
        this.update();

        break;

      default:
        this.state = _STATE.NONE;
    }
  }

  #onContextMenu(event) {
    if (this.enabled === false) return;

    event.preventDefault();
  }

  // On many systems, a touchpad pinch-to-zoom gesture is technically interpreted
  // as a Ctrl + scroll wheel command

  #interceptControlDown(event) {
    if (event.key === 'Control') {
      this.#controlActive = true;

      const document = this.domElement.getRootNode(); // offscreen canvas compatibility

      document.addEventListener('keyup', this.interceptControlUp, { passive: true, capture: true });
    }
  }

  #interceptControlUp(event) {
    if (event.key === 'Control') {
      this.#controlActive = false;

      const document = this.domElement.getRootNode(); // offscreen canvas compatibility

      document.removeEventListener('keyup', this.interceptControlUp, {
        passive: true,
        capture: true
      });
    }
  }
}

const _changeEvent = { type: 'change' };
const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };

const _ray = new Ray();
const _plane = new Plane();
const _TILT_LIMIT = Math.cos(70 * DEG2RAD);

const _v = new Vector3();
const _TWOPI = 2 * Math.PI;

const _STATE = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
};

const _EPS = 0.000001;

export { OrbitControls };
