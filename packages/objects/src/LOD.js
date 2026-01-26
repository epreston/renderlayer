import { Object3D } from '@renderlayer/core';
import { Vector3 } from '@renderlayer/math';

class LOD extends Object3D {
  type = 'LOD';

  autoUpdate = true;

  #levels = [];
  #currentLevel = 0;

  constructor() {
    super();
  }

  get isLOD() {
    return true;
  }

  get levels() {
    return this.#levels;
  }

  copy(source) {
    super.copy(source, false);

    const levels = source.levels;

    for (let i = 0, l = levels.length; i < l; i++) {
      const level = levels[i];

      this.addLevel(level.object.clone(), level.distance, level.hysteresis);
    }

    this.autoUpdate = source.autoUpdate;

    return this;
  }

  addLevel(object, distance = 0, hysteresis = 0) {
    distance = Math.abs(distance);

    const levels = this.levels;

    let l;

    for (l = 0; l < levels.length; l++) {
      if (distance < levels[l].distance) {
        break;
      }
    }

    levels.splice(l, 0, { distance: distance, hysteresis: hysteresis, object: object });

    this.add(object);

    return this;
  }

  getCurrentLevel() {
    return this.#currentLevel;
  }

  getObjectForDistance(distance) {
    const levels = this.levels;

    if (levels.length > 0) {
      let i;
      let l;

      for (i = 1, l = levels.length; i < l; i++) {
        let levelDistance = levels[i].distance;

        if (levels[i].object.visible) {
          levelDistance -= levelDistance * levels[i].hysteresis;
        }

        if (distance < levelDistance) {
          break;
        }
      }

      return levels[i - 1].object;
    }

    return null;
  }

  raycast(raycaster, intersects) {
    const levels = this.levels;

    if (levels.length > 0) {
      _v1.setFromMatrixPosition(this.matrixWorld);

      const distance = raycaster.ray.origin.distanceTo(_v1);

      this.getObjectForDistance(distance).raycast(raycaster, intersects);
    }
  }

  update(camera) {
    const levels = this.levels;

    if (levels.length > 1) {
      _v1.setFromMatrixPosition(camera.matrixWorld);
      _v2.setFromMatrixPosition(this.matrixWorld);

      const distance = _v1.distanceTo(_v2) / camera.zoom;

      levels[0].object.visible = true;

      let i;
      let l;

      for (i = 1, l = levels.length; i < l; i++) {
        let levelDistance = levels[i].distance;

        if (levels[i].object.visible) {
          levelDistance -= levelDistance * levels[i].hysteresis;
        }

        if (distance >= levelDistance) {
          levels[i - 1].object.visible = false;
          levels[i].object.visible = true;
        } else {
          break;
        }
      }

      this.#currentLevel = i - 1;

      for (; i < l; i++) {
        levels[i].object.visible = false;
      }
    }
  }

  toJSON(meta) {
    const data = super.toJSON(meta);

    if (this.autoUpdate === false) data.object.autoUpdate = false;

    data.object.levels = [];

    const levels = this.levels;

    for (let i = 0, l = levels.length; i < l; i++) {
      const level = levels[i];

      data.object.levels.push({
        object: level.object.uuid,
        distance: level.distance,
        hysteresis: level.hysteresis
      });
    }

    return data;
  }
}

const _v1 = /*@__PURE__*/ new Vector3();
const _v2 = /*@__PURE__*/ new Vector3();

export { LOD };
