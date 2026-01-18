import { Ray } from '@renderlayer/math';
import { Layers } from './Layers.js';

// TODO: remove from core

class Raycaster {
  ray;

  near = 0;
  far = Infinity;
  camera = null;
  layers = new Layers();

  params = {
    Mesh: {},
    Line: { threshold: 1 },
    LOD: {},
    Points: { threshold: 1 },
    Sprite: {}
  };

  constructor(origin, direction, near = 0, far = Infinity) {
    // direction is assumed to be normalized (for accurate distance calculations)
    this.ray = new Ray(origin, direction);

    this.near = near;
    this.far = far;
  }

  set(origin, direction) {
    // direction is assumed to be normalized (for accurate distance calculations)
    this.ray.set(origin, direction);
  }

  setFromCamera(coords, camera) {
    if (camera.isPerspectiveCamera) {
      this.ray.origin.setFromMatrixPosition(camera.matrixWorld);
      this.ray.direction
        .set(coords.x, coords.y, 0.5)
        .unproject(camera)
        .sub(this.ray.origin)
        .normalize();
      this.camera = camera;
    } else if (camera.isOrthographicCamera) {
      this.ray.origin
        .set(coords.x, coords.y, (camera.near + camera.far) / (camera.near - camera.far))
        .unproject(camera); // set origin in plane of camera
      this.ray.direction.set(0, 0, -1).transformDirection(camera.matrixWorld);
      this.camera = camera;
    } else {
      console.error(`Raycaster: Unsupported camera type: ${camera.type}`);
    }
  }

  intersectObject(object, recursive = true, intersects = []) {
    _intersectObject(object, this, intersects, recursive);

    intersects.sort(_ascSort);

    return intersects;
  }

  intersectObjects(objects, recursive = true, intersects = []) {
    for (let i = 0, l = objects.length; i < l; i++) {
      _intersectObject(objects[i], this, intersects, recursive);
    }

    intersects.sort(_ascSort);

    return intersects;
  }
}

function _ascSort(a, b) {
  return a.distance - b.distance;
}

function _intersectObject(object, raycaster, intersects, recursive) {
  if (object.layers.test(raycaster.layers)) {
    object.raycast(raycaster, intersects);
  }

  if (recursive === true) {
    const children = object.children;

    for (let i = 0, l = children.length; i < l; i++) {
      _intersectObject(children[i], raycaster, intersects, true);
    }
  }
}

export { Raycaster };
