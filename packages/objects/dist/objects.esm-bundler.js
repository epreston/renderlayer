import { Object3D } from '@renderlayer/core';
import { BufferGeometry, InstancedBufferAttribute, Float32BufferAttribute, InterleavedBuffer, InterleavedBufferAttribute } from '@renderlayer/buffers';
import { Triangle, Vector2, Vector3, Matrix4, Ray, Sphere, Box3, generateUUID, ceilPowerOfTwo, Vector4 } from '@renderlayer/math';
import { MeshBasicMaterial, LineBasicMaterial, PointsMaterial, SpriteMaterial } from '@renderlayer/materials';
import { BackSide, FrontSide, RGBAFormat, FloatType } from '@renderlayer/shared';
import { DataTexture } from '@renderlayer/textures';

class Bone extends Object3D {
  constructor() {
    super();
    this.isBone = true;
    this.type = "Bone";
  }
}

class Group extends Object3D {
  constructor() {
    super();
    this.isGroup = true;
    this.type = "Group";
  }
}

const _inverseMatrix$3 = /* @__PURE__ */ new Matrix4();
const _ray$3 = /* @__PURE__ */ new Ray();
const _sphere$4 = /* @__PURE__ */ new Sphere();
const _sphereHitAt = /* @__PURE__ */ new Vector3();
const _vA$1 = /* @__PURE__ */ new Vector3();
const _vB$1 = /* @__PURE__ */ new Vector3();
const _vC$1 = /* @__PURE__ */ new Vector3();
const _tempA = /* @__PURE__ */ new Vector3();
const _morphA = /* @__PURE__ */ new Vector3();
const _uvA$1 = /* @__PURE__ */ new Vector2();
const _uvB$1 = /* @__PURE__ */ new Vector2();
const _uvC$1 = /* @__PURE__ */ new Vector2();
const _normalA = /* @__PURE__ */ new Vector3();
const _normalB = /* @__PURE__ */ new Vector3();
const _normalC = /* @__PURE__ */ new Vector3();
const _intersectionPoint = /* @__PURE__ */ new Vector3();
const _intersectionPointWorld = /* @__PURE__ */ new Vector3();
class Mesh extends Object3D {
  constructor(geometry = new BufferGeometry(), material = new MeshBasicMaterial()) {
    super();
    this.isMesh = true;
    this.type = "Mesh";
    this.geometry = geometry;
    this.material = material;
    this.updateMorphTargets();
  }
  copy(source, recursive) {
    super.copy(source, recursive);
    if (source.morphTargetInfluences !== void 0) {
      this.morphTargetInfluences = source.morphTargetInfluences.slice();
    }
    if (source.morphTargetDictionary !== void 0) {
      this.morphTargetDictionary = Object.assign({}, source.morphTargetDictionary);
    }
    this.material = source.material;
    this.geometry = source.geometry;
    return this;
  }
  updateMorphTargets() {
    const geometry = this.geometry;
    const morphAttributes = geometry.morphAttributes;
    const keys = Object.keys(morphAttributes);
    if (keys.length > 0) {
      const morphAttribute = morphAttributes[keys[0]];
      if (morphAttribute !== void 0) {
        this.morphTargetInfluences = [];
        this.morphTargetDictionary = {};
        for (let m = 0, ml = morphAttribute.length; m < ml; m++) {
          const name = morphAttribute[m].name || String(m);
          this.morphTargetInfluences.push(0);
          this.morphTargetDictionary[name] = m;
        }
      }
    }
  }
  getVertexPosition(index, target) {
    const geometry = this.geometry;
    const position = geometry.attributes.position;
    const morphPosition = geometry.morphAttributes.position;
    const morphTargetsRelative = geometry.morphTargetsRelative;
    target.fromBufferAttribute(position, index);
    const morphInfluences = this.morphTargetInfluences;
    if (morphPosition && morphInfluences) {
      _morphA.set(0, 0, 0);
      for (let i = 0, il = morphPosition.length; i < il; i++) {
        const influence = morphInfluences[i];
        const morphAttribute = morphPosition[i];
        if (influence === 0)
          continue;
        _tempA.fromBufferAttribute(morphAttribute, index);
        if (morphTargetsRelative) {
          _morphA.addScaledVector(_tempA, influence);
        } else {
          _morphA.addScaledVector(_tempA.sub(target), influence);
        }
      }
      target.add(_morphA);
    }
    return target;
  }
  raycast(raycaster, intersects) {
    const geometry = this.geometry;
    const material = this.material;
    const matrixWorld = this.matrixWorld;
    if (material === void 0)
      return;
    if (geometry.boundingSphere === null)
      geometry.computeBoundingSphere();
    _sphere$4.copy(geometry.boundingSphere);
    _sphere$4.applyMatrix4(matrixWorld);
    _ray$3.copy(raycaster.ray).recast(raycaster.near);
    if (_sphere$4.containsPoint(_ray$3.origin) === false) {
      if (_ray$3.intersectSphere(_sphere$4, _sphereHitAt) === null)
        return;
      if (_ray$3.origin.distanceToSquared(_sphereHitAt) > (raycaster.far - raycaster.near) ** 2)
        return;
    }
    _inverseMatrix$3.copy(matrixWorld).invert();
    _ray$3.copy(raycaster.ray).applyMatrix4(_inverseMatrix$3);
    if (geometry.boundingBox !== null) {
      if (_ray$3.intersectsBox(geometry.boundingBox) === false)
        return;
    }
    this._computeIntersections(raycaster, intersects, _ray$3);
  }
  _computeIntersections(raycaster, intersects, rayLocalSpace) {
    let intersection;
    const geometry = this.geometry;
    const material = this.material;
    const index = geometry.index;
    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    const uv1 = geometry.attributes.uv1;
    const normal = geometry.attributes.normal;
    const groups = geometry.groups;
    const drawRange = geometry.drawRange;
    if (index !== null) {
      if (Array.isArray(material)) {
        for (let i = 0, il = groups.length; i < il; i++) {
          const group = groups[i];
          const groupMaterial = material[group.materialIndex];
          const start = Math.max(group.start, drawRange.start);
          const end = Math.min(
            index.count,
            Math.min(group.start + group.count, drawRange.start + drawRange.count)
          );
          for (let j = start, jl = end; j < jl; j += 3) {
            const a = index.getX(j);
            const b = index.getX(j + 1);
            const c = index.getX(j + 2);
            intersection = checkGeometryIntersection(
              this,
              groupMaterial,
              raycaster,
              rayLocalSpace,
              uv,
              uv1,
              normal,
              a,
              b,
              c
            );
            if (intersection) {
              intersection.faceIndex = Math.floor(j / 3);
              intersection.face.materialIndex = group.materialIndex;
              intersects.push(intersection);
            }
          }
        }
      } else {
        const start = Math.max(0, drawRange.start);
        const end = Math.min(index.count, drawRange.start + drawRange.count);
        for (let i = start, il = end; i < il; i += 3) {
          const a = index.getX(i);
          const b = index.getX(i + 1);
          const c = index.getX(i + 2);
          intersection = checkGeometryIntersection(
            this,
            material,
            raycaster,
            rayLocalSpace,
            uv,
            uv1,
            normal,
            a,
            b,
            c
          );
          if (intersection) {
            intersection.faceIndex = Math.floor(i / 3);
            intersects.push(intersection);
          }
        }
      }
    } else if (position !== void 0) {
      if (Array.isArray(material)) {
        for (let i = 0, il = groups.length; i < il; i++) {
          const group = groups[i];
          const groupMaterial = material[group.materialIndex];
          const start = Math.max(group.start, drawRange.start);
          const end = Math.min(
            position.count,
            Math.min(group.start + group.count, drawRange.start + drawRange.count)
          );
          for (let j = start, jl = end; j < jl; j += 3) {
            const a = j;
            const b = j + 1;
            const c = j + 2;
            intersection = checkGeometryIntersection(
              this,
              groupMaterial,
              raycaster,
              rayLocalSpace,
              uv,
              uv1,
              normal,
              a,
              b,
              c
            );
            if (intersection) {
              intersection.faceIndex = Math.floor(j / 3);
              intersection.face.materialIndex = group.materialIndex;
              intersects.push(intersection);
            }
          }
        }
      } else {
        const start = Math.max(0, drawRange.start);
        const end = Math.min(position.count, drawRange.start + drawRange.count);
        for (let i = start, il = end; i < il; i += 3) {
          const a = i;
          const b = i + 1;
          const c = i + 2;
          intersection = checkGeometryIntersection(
            this,
            material,
            raycaster,
            rayLocalSpace,
            uv,
            uv1,
            normal,
            a,
            b,
            c
          );
          if (intersection) {
            intersection.faceIndex = Math.floor(i / 3);
            intersects.push(intersection);
          }
        }
      }
    }
  }
}
function checkIntersection(object, material, raycaster, ray, pA, pB, pC, point) {
  let intersect;
  if (material.side === BackSide) {
    intersect = ray.intersectTriangle(pC, pB, pA, true, point);
  } else {
    intersect = ray.intersectTriangle(pA, pB, pC, material.side === FrontSide, point);
  }
  if (intersect === null)
    return null;
  _intersectionPointWorld.copy(point);
  _intersectionPointWorld.applyMatrix4(object.matrixWorld);
  const distance = raycaster.ray.origin.distanceTo(_intersectionPointWorld);
  if (distance < raycaster.near || distance > raycaster.far)
    return null;
  return {
    distance,
    point: _intersectionPointWorld.clone(),
    object
  };
}
function checkGeometryIntersection(object, material, raycaster, ray, uv, uv1, normal, a, b, c) {
  object.getVertexPosition(a, _vA$1);
  object.getVertexPosition(b, _vB$1);
  object.getVertexPosition(c, _vC$1);
  const intersection = checkIntersection(
    object,
    material,
    raycaster,
    ray,
    _vA$1,
    _vB$1,
    _vC$1,
    _intersectionPoint
  );
  if (intersection) {
    if (uv) {
      _uvA$1.fromBufferAttribute(uv, a);
      _uvB$1.fromBufferAttribute(uv, b);
      _uvC$1.fromBufferAttribute(uv, c);
      intersection.uv = Triangle.getInterpolation(
        _intersectionPoint,
        _vA$1,
        _vB$1,
        _vC$1,
        _uvA$1,
        _uvB$1,
        _uvC$1,
        new Vector2()
      );
    }
    if (uv1) {
      _uvA$1.fromBufferAttribute(uv1, a);
      _uvB$1.fromBufferAttribute(uv1, b);
      _uvC$1.fromBufferAttribute(uv1, c);
      intersection.uv1 = Triangle.getInterpolation(
        _intersectionPoint,
        _vA$1,
        _vB$1,
        _vC$1,
        _uvA$1,
        _uvB$1,
        _uvC$1,
        new Vector2()
      );
      intersection.uv2 = intersection.uv1;
    }
    if (normal) {
      _normalA.fromBufferAttribute(normal, a);
      _normalB.fromBufferAttribute(normal, b);
      _normalC.fromBufferAttribute(normal, c);
      intersection.normal = Triangle.getInterpolation(
        _intersectionPoint,
        _vA$1,
        _vB$1,
        _vC$1,
        _normalA,
        _normalB,
        _normalC,
        new Vector3()
      );
      if (intersection.normal.dot(ray.direction) > 0) {
        intersection.normal.multiplyScalar(-1);
      }
    }
    const face = {
      a,
      b,
      c,
      normal: new Vector3(),
      materialIndex: 0
    };
    Triangle.getNormal(_vA$1, _vB$1, _vC$1, face.normal);
    intersection.face = face;
  }
  return intersection;
}

const _instanceLocalMatrix = /* @__PURE__ */ new Matrix4();
const _instanceWorldMatrix = /* @__PURE__ */ new Matrix4();
const _instanceIntersects = [];
const _box3 = /* @__PURE__ */ new Box3();
const _identity = /* @__PURE__ */ new Matrix4();
const _mesh = /* @__PURE__ */ new Mesh();
const _sphere$3 = /* @__PURE__ */ new Sphere();
class InstancedMesh extends Mesh {
  constructor(geometry, material, count) {
    super(geometry, material);
    this.isInstancedMesh = true;
    this.instanceMatrix = new InstancedBufferAttribute(new Float32Array(count * 16), 16);
    this.instanceColor = null;
    this.count = count;
    this.boundingBox = null;
    this.boundingSphere = null;
    for (let i = 0; i < count; i++) {
      this.setMatrixAt(i, _identity);
    }
  }
  computeBoundingBox() {
    const geometry = this.geometry;
    const count = this.count;
    if (this.boundingBox === null) {
      this.boundingBox = new Box3();
    }
    if (geometry.boundingBox === null) {
      geometry.computeBoundingBox();
    }
    this.boundingBox.makeEmpty();
    for (let i = 0; i < count; i++) {
      this.getMatrixAt(i, _instanceLocalMatrix);
      _box3.copy(geometry.boundingBox).applyMatrix4(_instanceLocalMatrix);
      this.boundingBox.union(_box3);
    }
  }
  computeBoundingSphere() {
    const geometry = this.geometry;
    const count = this.count;
    if (this.boundingSphere === null) {
      this.boundingSphere = new Sphere();
    }
    if (geometry.boundingSphere === null) {
      geometry.computeBoundingSphere();
    }
    this.boundingSphere.makeEmpty();
    for (let i = 0; i < count; i++) {
      this.getMatrixAt(i, _instanceLocalMatrix);
      _sphere$3.copy(geometry.boundingSphere).applyMatrix4(_instanceLocalMatrix);
      this.boundingSphere.union(_sphere$3);
    }
  }
  copy(source, recursive) {
    super.copy(source, recursive);
    this.instanceMatrix.copy(source.instanceMatrix);
    if (source.instanceColor !== null)
      this.instanceColor = source.instanceColor.clone();
    this.count = source.count;
    return this;
  }
  getColorAt(index, color) {
    color.fromArray(this.instanceColor.array, index * 3);
  }
  getMatrixAt(index, matrix) {
    matrix.fromArray(this.instanceMatrix.array, index * 16);
  }
  raycast(raycaster, intersects) {
    const matrixWorld = this.matrixWorld;
    const raycastTimes = this.count;
    _mesh.geometry = this.geometry;
    _mesh.material = this.material;
    if (_mesh.material === void 0)
      return;
    if (this.boundingSphere === null)
      this.computeBoundingSphere();
    _sphere$3.copy(this.boundingSphere);
    _sphere$3.applyMatrix4(matrixWorld);
    if (raycaster.ray.intersectsSphere(_sphere$3) === false)
      return;
    for (let instanceId = 0; instanceId < raycastTimes; instanceId++) {
      this.getMatrixAt(instanceId, _instanceLocalMatrix);
      _instanceWorldMatrix.multiplyMatrices(matrixWorld, _instanceLocalMatrix);
      _mesh.matrixWorld = _instanceWorldMatrix;
      _mesh.raycast(raycaster, _instanceIntersects);
      for (let i = 0, l = _instanceIntersects.length; i < l; i++) {
        const intersect = _instanceIntersects[i];
        intersect.instanceId = instanceId;
        intersect.object = this;
        intersects.push(intersect);
      }
      _instanceIntersects.length = 0;
    }
  }
  setColorAt(index, color) {
    if (this.instanceColor === null) {
      this.instanceColor = new InstancedBufferAttribute(
        new Float32Array(this.instanceMatrix.count * 3),
        3
      );
    }
    color.toArray(this.instanceColor.array, index * 3);
  }
  setMatrixAt(index, matrix) {
    matrix.toArray(this.instanceMatrix.array, index * 16);
  }
  updateMorphTargets() {
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}

const _start$1 = /* @__PURE__ */ new Vector3();
const _end$1 = /* @__PURE__ */ new Vector3();
const _inverseMatrix$2 = /* @__PURE__ */ new Matrix4();
const _ray$2 = /* @__PURE__ */ new Ray();
const _sphere$2 = /* @__PURE__ */ new Sphere();
class Line extends Object3D {
  constructor(geometry = new BufferGeometry(), material = new LineBasicMaterial()) {
    super();
    this.isLine = true;
    this.type = "Line";
    this.geometry = geometry;
    this.material = material;
    this.updateMorphTargets();
  }
  copy(source, recursive) {
    super.copy(source, recursive);
    this.material = source.material;
    this.geometry = source.geometry;
    return this;
  }
  computeLineDistances() {
    const geometry = this.geometry;
    if (geometry.index === null) {
      const positionAttribute = geometry.attributes.position;
      const lineDistances = [0];
      for (let i = 1, l = positionAttribute.count; i < l; i++) {
        _start$1.fromBufferAttribute(positionAttribute, i - 1);
        _end$1.fromBufferAttribute(positionAttribute, i);
        lineDistances[i] = lineDistances[i - 1];
        lineDistances[i] += _start$1.distanceTo(_end$1);
      }
      geometry.setAttribute("lineDistance", new Float32BufferAttribute(lineDistances, 1));
    } else {
      console.warn(
        "Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry."
      );
    }
    return this;
  }
  raycast(raycaster, intersects) {
    const geometry = this.geometry;
    const matrixWorld = this.matrixWorld;
    const threshold = raycaster.params.Line.threshold;
    const drawRange = geometry.drawRange;
    if (geometry.boundingSphere === null)
      geometry.computeBoundingSphere();
    _sphere$2.copy(geometry.boundingSphere);
    _sphere$2.applyMatrix4(matrixWorld);
    _sphere$2.radius += threshold;
    if (raycaster.ray.intersectsSphere(_sphere$2) === false)
      return;
    _inverseMatrix$2.copy(matrixWorld).invert();
    _ray$2.copy(raycaster.ray).applyMatrix4(_inverseMatrix$2);
    const localThreshold = threshold / ((this.scale.x + this.scale.y + this.scale.z) / 3);
    const localThresholdSq = localThreshold * localThreshold;
    const vStart = new Vector3();
    const vEnd = new Vector3();
    const interSegment = new Vector3();
    const interRay = new Vector3();
    const step = this.isLineSegments ? 2 : 1;
    const index = geometry.index;
    const attributes = geometry.attributes;
    const positionAttribute = attributes.position;
    if (index !== null) {
      const start = Math.max(0, drawRange.start);
      const end = Math.min(index.count, drawRange.start + drawRange.count);
      for (let i = start, l = end - 1; i < l; i += step) {
        const a = index.getX(i);
        const b = index.getX(i + 1);
        vStart.fromBufferAttribute(positionAttribute, a);
        vEnd.fromBufferAttribute(positionAttribute, b);
        const distSq = _ray$2.distanceSqToSegment(vStart, vEnd, interRay, interSegment);
        if (distSq > localThresholdSq)
          continue;
        interRay.applyMatrix4(this.matrixWorld);
        const distance = raycaster.ray.origin.distanceTo(interRay);
        if (distance < raycaster.near || distance > raycaster.far)
          continue;
        intersects.push({
          distance,
          // intersection point on the ray or on the segment?
          // point: raycaster.ray.at( distance ),
          point: interSegment.clone().applyMatrix4(this.matrixWorld),
          index: i,
          face: null,
          faceIndex: null,
          object: this
        });
      }
    } else {
      const start = Math.max(0, drawRange.start);
      const end = Math.min(positionAttribute.count, drawRange.start + drawRange.count);
      for (let i = start, l = end - 1; i < l; i += step) {
        vStart.fromBufferAttribute(positionAttribute, i);
        vEnd.fromBufferAttribute(positionAttribute, i + 1);
        const distSq = _ray$2.distanceSqToSegment(vStart, vEnd, interRay, interSegment);
        if (distSq > localThresholdSq)
          continue;
        interRay.applyMatrix4(this.matrixWorld);
        const distance = raycaster.ray.origin.distanceTo(interRay);
        if (distance < raycaster.near || distance > raycaster.far)
          continue;
        intersects.push({
          distance,
          // intersection point on the ray or on the segment?
          // point: raycaster.ray.at( distance ),
          point: interSegment.clone().applyMatrix4(this.matrixWorld),
          index: i,
          face: null,
          faceIndex: null,
          object: this
        });
      }
    }
  }
  updateMorphTargets() {
    const geometry = this.geometry;
    const morphAttributes = geometry.morphAttributes;
    const keys = Object.keys(morphAttributes);
    if (keys.length > 0) {
      const morphAttribute = morphAttributes[keys[0]];
      if (morphAttribute !== void 0) {
        this.morphTargetInfluences = [];
        this.morphTargetDictionary = {};
        for (let m = 0, ml = morphAttribute.length; m < ml; m++) {
          const name = morphAttribute[m].name || String(m);
          this.morphTargetInfluences.push(0);
          this.morphTargetDictionary[name] = m;
        }
      }
    }
  }
}

class LineLoop extends Line {
  constructor(geometry, material) {
    super(geometry, material);
    this.isLineLoop = true;
    this.type = "LineLoop";
  }
}

const _start = /* @__PURE__ */ new Vector3();
const _end = /* @__PURE__ */ new Vector3();
class LineSegments extends Line {
  constructor(geometry, material) {
    super(geometry, material);
    this.isLineSegments = true;
    this.type = "LineSegments";
  }
  computeLineDistances() {
    const geometry = this.geometry;
    if (geometry.index === null) {
      const positionAttribute = geometry.attributes.position;
      const lineDistances = [];
      for (let i = 0, l = positionAttribute.count; i < l; i += 2) {
        _start.fromBufferAttribute(positionAttribute, i);
        _end.fromBufferAttribute(positionAttribute, i + 1);
        lineDistances[i] = i === 0 ? 0 : lineDistances[i - 1];
        lineDistances[i + 1] = lineDistances[i] + _start.distanceTo(_end);
      }
      geometry.setAttribute("lineDistance", new Float32BufferAttribute(lineDistances, 1));
    } else {
      console.warn(
        "LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry."
      );
    }
    return this;
  }
}

const _v1 = /* @__PURE__ */ new Vector3();
const _v2 = /* @__PURE__ */ new Vector3();
class LOD extends Object3D {
  constructor() {
    super();
    this._currentLevel = 0;
    this.type = "LOD";
    Object.defineProperties(this, {
      levels: {
        enumerable: true,
        value: []
      },
      isLOD: {
        value: true
      }
    });
    this.autoUpdate = true;
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
    levels.splice(l, 0, { distance, hysteresis, object });
    this.add(object);
    return this;
  }
  getCurrentLevel() {
    return this._currentLevel;
  }
  getObjectForDistance(distance) {
    const levels = this.levels;
    if (levels.length > 0) {
      let i, l;
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
      let i, l;
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
      this._currentLevel = i - 1;
      for (; i < l; i++) {
        levels[i].object.visible = false;
      }
    }
  }
  toJSON(meta) {
    const data = super.toJSON(meta);
    if (this.autoUpdate === false)
      data.object.autoUpdate = false;
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

const _inverseMatrix$1 = /* @__PURE__ */ new Matrix4();
const _ray$1 = /* @__PURE__ */ new Ray();
const _sphere$1 = /* @__PURE__ */ new Sphere();
const _position = /* @__PURE__ */ new Vector3();
class Points extends Object3D {
  constructor(geometry = new BufferGeometry(), material = new PointsMaterial()) {
    super();
    this.isPoints = true;
    this.type = "Points";
    this.geometry = geometry;
    this.material = material;
    this.updateMorphTargets();
  }
  copy(source, recursive) {
    super.copy(source, recursive);
    this.material = source.material;
    this.geometry = source.geometry;
    return this;
  }
  raycast(raycaster, intersects) {
    const geometry = this.geometry;
    const matrixWorld = this.matrixWorld;
    const threshold = raycaster.params.Points.threshold;
    const drawRange = geometry.drawRange;
    if (geometry.boundingSphere === null)
      geometry.computeBoundingSphere();
    _sphere$1.copy(geometry.boundingSphere);
    _sphere$1.applyMatrix4(matrixWorld);
    _sphere$1.radius += threshold;
    if (raycaster.ray.intersectsSphere(_sphere$1) === false)
      return;
    _inverseMatrix$1.copy(matrixWorld).invert();
    _ray$1.copy(raycaster.ray).applyMatrix4(_inverseMatrix$1);
    const localThreshold = threshold / ((this.scale.x + this.scale.y + this.scale.z) / 3);
    const localThresholdSq = localThreshold * localThreshold;
    const index = geometry.index;
    const attributes = geometry.attributes;
    const positionAttribute = attributes.position;
    if (index !== null) {
      const start = Math.max(0, drawRange.start);
      const end = Math.min(index.count, drawRange.start + drawRange.count);
      for (let i = start, il = end; i < il; i++) {
        const a = index.getX(i);
        _position.fromBufferAttribute(positionAttribute, a);
        testPoint(_position, a, localThresholdSq, matrixWorld, raycaster, intersects, this);
      }
    } else {
      const start = Math.max(0, drawRange.start);
      const end = Math.min(positionAttribute.count, drawRange.start + drawRange.count);
      for (let i = start, l = end; i < l; i++) {
        _position.fromBufferAttribute(positionAttribute, i);
        testPoint(_position, i, localThresholdSq, matrixWorld, raycaster, intersects, this);
      }
    }
  }
  updateMorphTargets() {
    const geometry = this.geometry;
    const morphAttributes = geometry.morphAttributes;
    const keys = Object.keys(morphAttributes);
    if (keys.length > 0) {
      const morphAttribute = morphAttributes[keys[0]];
      if (morphAttribute !== void 0) {
        this.morphTargetInfluences = [];
        this.morphTargetDictionary = {};
        for (let m = 0, ml = morphAttribute.length; m < ml; m++) {
          const name = morphAttribute[m].name || String(m);
          this.morphTargetInfluences.push(0);
          this.morphTargetDictionary[name] = m;
        }
      }
    }
  }
}
function testPoint(point, index, localThresholdSq, matrixWorld, raycaster, intersects, object) {
  const rayPointDistanceSq = _ray$1.distanceSqToPoint(point);
  if (rayPointDistanceSq < localThresholdSq) {
    const intersectPoint = new Vector3();
    _ray$1.closestPointToPoint(point, intersectPoint);
    intersectPoint.applyMatrix4(matrixWorld);
    const distance = raycaster.ray.origin.distanceTo(intersectPoint);
    if (distance < raycaster.near || distance > raycaster.far)
      return;
    intersects.push({
      distance,
      distanceToRay: Math.sqrt(rayPointDistanceSq),
      point: intersectPoint,
      index,
      face: null,
      object
    });
  }
}

const _offsetMatrix = /* @__PURE__ */ new Matrix4();
const _identityMatrix = /* @__PURE__ */ new Matrix4();
class Skeleton {
  constructor(bones = [], boneInverses = []) {
    this.uuid = generateUUID();
    this.bones = bones.slice(0);
    this.boneInverses = boneInverses;
    this.boneMatrices = null;
    this.boneTexture = null;
    this.boneTextureSize = 0;
    this.frame = -1;
    this.init();
  }
  init() {
    const bones = this.bones;
    const boneInverses = this.boneInverses;
    this.boneMatrices = new Float32Array(bones.length * 16);
    if (boneInverses.length === 0) {
      this.calculateInverses();
    } else {
      if (bones.length !== boneInverses.length) {
        console.warn("Skeleton: Number of inverse bone matrices does not match amount of bones.");
        this.boneInverses = [];
        for (let i = 0, il = this.bones.length; i < il; i++) {
          this.boneInverses.push(new Matrix4());
        }
      }
    }
  }
  calculateInverses() {
    this.boneInverses.length = 0;
    for (let i = 0, il = this.bones.length; i < il; i++) {
      const inverse = new Matrix4();
      if (this.bones[i]) {
        inverse.copy(this.bones[i].matrixWorld).invert();
      }
      this.boneInverses.push(inverse);
    }
  }
  pose() {
    for (let i = 0, il = this.bones.length; i < il; i++) {
      const bone = this.bones[i];
      if (bone) {
        bone.matrixWorld.copy(this.boneInverses[i]).invert();
      }
    }
    for (let i = 0, il = this.bones.length; i < il; i++) {
      const bone = this.bones[i];
      if (bone) {
        if (bone.parent && bone.parent.isBone) {
          bone.matrix.copy(bone.parent.matrixWorld).invert();
          bone.matrix.multiply(bone.matrixWorld);
        } else {
          bone.matrix.copy(bone.matrixWorld);
        }
        bone.matrix.decompose(bone.position, bone.quaternion, bone.scale);
      }
    }
  }
  update() {
    const bones = this.bones;
    const boneInverses = this.boneInverses;
    const boneMatrices = this.boneMatrices;
    const boneTexture = this.boneTexture;
    for (let i = 0, il = bones.length; i < il; i++) {
      const matrix = bones[i] ? bones[i].matrixWorld : _identityMatrix;
      _offsetMatrix.multiplyMatrices(matrix, boneInverses[i]);
      _offsetMatrix.toArray(boneMatrices, i * 16);
    }
    if (boneTexture !== null) {
      boneTexture.needsUpdate = true;
    }
  }
  clone() {
    return new Skeleton(this.bones, this.boneInverses);
  }
  computeBoneTexture() {
    let size = Math.sqrt(this.bones.length * 4);
    size = ceilPowerOfTwo(size);
    size = Math.max(size, 4);
    const boneMatrices = new Float32Array(size * size * 4);
    boneMatrices.set(this.boneMatrices);
    const boneTexture = new DataTexture(boneMatrices, size, size, RGBAFormat, FloatType);
    boneTexture.needsUpdate = true;
    this.boneMatrices = boneMatrices;
    this.boneTexture = boneTexture;
    this.boneTextureSize = size;
    return this;
  }
  getBoneByName(name) {
    for (let i = 0, il = this.bones.length; i < il; i++) {
      const bone = this.bones[i];
      if (bone.name === name) {
        return bone;
      }
    }
    return void 0;
  }
  dispose() {
    if (this.boneTexture !== null) {
      this.boneTexture.dispose();
      this.boneTexture = null;
    }
  }
  fromJSON(json, bones) {
    this.uuid = json.uuid;
    for (let i = 0, l = json.bones.length; i < l; i++) {
      const uuid = json.bones[i];
      let bone = bones[uuid];
      if (bone === void 0) {
        console.warn("Skeleton: No bone found with UUID:", uuid);
        bone = new Bone();
      }
      this.bones.push(bone);
      this.boneInverses.push(new Matrix4().fromArray(json.boneInverses[i]));
    }
    this.init();
    return this;
  }
  toJSON() {
    const data = {
      metadata: {
        version: 4.5,
        type: "Skeleton",
        generator: "Skeleton.toJSON"
      },
      bones: [],
      boneInverses: []
    };
    data.uuid = this.uuid;
    const bones = this.bones;
    const boneInverses = this.boneInverses;
    for (let i = 0, l = bones.length; i < l; i++) {
      const bone = bones[i];
      data.bones.push(bone.uuid);
      const boneInverse = boneInverses[i];
      data.boneInverses.push(boneInverse.toArray());
    }
    return data;
  }
}

const _basePosition = /* @__PURE__ */ new Vector3();
const _skinIndex = /* @__PURE__ */ new Vector4();
const _skinWeight = /* @__PURE__ */ new Vector4();
const _vector3 = /* @__PURE__ */ new Vector3();
const _matrix4 = /* @__PURE__ */ new Matrix4();
const _vertex = /* @__PURE__ */ new Vector3();
const _sphere = /* @__PURE__ */ new Sphere();
const _inverseMatrix = /* @__PURE__ */ new Matrix4();
const _ray = /* @__PURE__ */ new Ray();
class SkinnedMesh extends Mesh {
  constructor(geometry, material) {
    super(geometry, material);
    this.isSkinnedMesh = true;
    this.type = "SkinnedMesh";
    this.bindMode = "attached";
    this.bindMatrix = new Matrix4();
    this.bindMatrixInverse = new Matrix4();
    this.boundingBox = null;
    this.boundingSphere = null;
  }
  computeBoundingBox() {
    const geometry = this.geometry;
    if (this.boundingBox === null) {
      this.boundingBox = new Box3();
    }
    this.boundingBox.makeEmpty();
    const positionAttribute = geometry.getAttribute("position");
    for (let i = 0; i < positionAttribute.count; i++) {
      _vertex.fromBufferAttribute(positionAttribute, i);
      this.applyBoneTransform(i, _vertex);
      this.boundingBox.expandByPoint(_vertex);
    }
  }
  computeBoundingSphere() {
    const geometry = this.geometry;
    if (this.boundingSphere === null) {
      this.boundingSphere = new Sphere();
    }
    this.boundingSphere.makeEmpty();
    const positionAttribute = geometry.getAttribute("position");
    for (let i = 0; i < positionAttribute.count; i++) {
      _vertex.fromBufferAttribute(positionAttribute, i);
      this.applyBoneTransform(i, _vertex);
      this.boundingSphere.expandByPoint(_vertex);
    }
  }
  copy(source, recursive) {
    super.copy(source, recursive);
    this.bindMode = source.bindMode;
    this.bindMatrix.copy(source.bindMatrix);
    this.bindMatrixInverse.copy(source.bindMatrixInverse);
    this.skeleton = source.skeleton;
    return this;
  }
  raycast(raycaster, intersects) {
    const material = this.material;
    const matrixWorld = this.matrixWorld;
    if (material === void 0)
      return;
    if (this.boundingSphere === null)
      this.computeBoundingSphere();
    _sphere.copy(this.boundingSphere);
    _sphere.applyMatrix4(matrixWorld);
    if (raycaster.ray.intersectsSphere(_sphere) === false)
      return;
    _inverseMatrix.copy(matrixWorld).invert();
    _ray.copy(raycaster.ray).applyMatrix4(_inverseMatrix);
    if (this.boundingBox !== null) {
      if (_ray.intersectsBox(this.boundingBox) === false)
        return;
    }
    this._computeIntersections(raycaster, intersects, _ray);
  }
  getVertexPosition(index, target) {
    super.getVertexPosition(index, target);
    this.applyBoneTransform(index, target);
    return target;
  }
  bind(skeleton, bindMatrix) {
    this.skeleton = skeleton;
    if (bindMatrix === void 0) {
      this.updateMatrixWorld(true);
      this.skeleton.calculateInverses();
      bindMatrix = this.matrixWorld;
    }
    this.bindMatrix.copy(bindMatrix);
    this.bindMatrixInverse.copy(bindMatrix).invert();
  }
  pose() {
    this.skeleton.pose();
  }
  normalizeSkinWeights() {
    const vector = new Vector4();
    const skinWeight = this.geometry.attributes.skinWeight;
    for (let i = 0, l = skinWeight.count; i < l; i++) {
      vector.fromBufferAttribute(skinWeight, i);
      const scale = 1 / vector.manhattanLength();
      if (scale !== Infinity) {
        vector.multiplyScalar(scale);
      } else {
        vector.set(1, 0, 0, 0);
      }
      skinWeight.setXYZW(i, vector.x, vector.y, vector.z, vector.w);
    }
  }
  updateMatrixWorld(force) {
    super.updateMatrixWorld(force);
    if (this.bindMode === "attached") {
      this.bindMatrixInverse.copy(this.matrixWorld).invert();
    } else if (this.bindMode === "detached") {
      this.bindMatrixInverse.copy(this.bindMatrix).invert();
    } else {
      console.warn("SkinnedMesh: Unrecognized bindMode: " + this.bindMode);
    }
  }
  applyBoneTransform(index, vector) {
    const skeleton = this.skeleton;
    const geometry = this.geometry;
    _skinIndex.fromBufferAttribute(geometry.attributes.skinIndex, index);
    _skinWeight.fromBufferAttribute(geometry.attributes.skinWeight, index);
    _basePosition.copy(vector).applyMatrix4(this.bindMatrix);
    vector.set(0, 0, 0);
    for (let i = 0; i < 4; i++) {
      const weight = _skinWeight.getComponent(i);
      if (weight !== 0) {
        const boneIndex = _skinIndex.getComponent(i);
        _matrix4.multiplyMatrices(
          skeleton.bones[boneIndex].matrixWorld,
          skeleton.boneInverses[boneIndex]
        );
        vector.addScaledVector(_vector3.copy(_basePosition).applyMatrix4(_matrix4), weight);
      }
    }
    return vector.applyMatrix4(this.bindMatrixInverse);
  }
}

let _geometry;
const _intersectPoint = /* @__PURE__ */ new Vector3();
const _worldScale = /* @__PURE__ */ new Vector3();
const _mvPosition = /* @__PURE__ */ new Vector3();
const _alignedPosition = /* @__PURE__ */ new Vector2();
const _rotatedPosition = /* @__PURE__ */ new Vector2();
const _viewWorldMatrix = /* @__PURE__ */ new Matrix4();
const _vA = /* @__PURE__ */ new Vector3();
const _vB = /* @__PURE__ */ new Vector3();
const _vC = /* @__PURE__ */ new Vector3();
const _uvA = /* @__PURE__ */ new Vector2();
const _uvB = /* @__PURE__ */ new Vector2();
const _uvC = /* @__PURE__ */ new Vector2();
class Sprite extends Object3D {
  constructor(material) {
    super();
    this.isSprite = true;
    this.type = "Sprite";
    if (_geometry === void 0) {
      _geometry = new BufferGeometry();
      const float32Array = new Float32Array([
        -0.5,
        -0.5,
        0,
        0,
        0,
        0.5,
        -0.5,
        0,
        1,
        0,
        0.5,
        0.5,
        0,
        1,
        1,
        -0.5,
        0.5,
        0,
        0,
        1
      ]);
      const interleavedBuffer = new InterleavedBuffer(float32Array, 5);
      _geometry.setIndex([0, 1, 2, 0, 2, 3]);
      _geometry.setAttribute(
        "position",
        new InterleavedBufferAttribute(interleavedBuffer, 3, 0, false)
      );
      _geometry.setAttribute("uv", new InterleavedBufferAttribute(interleavedBuffer, 2, 3, false));
    }
    this.geometry = _geometry;
    this.material = material !== void 0 ? material : new SpriteMaterial();
    this.center = new Vector2(0.5, 0.5);
  }
  raycast(raycaster, intersects) {
    if (raycaster.camera === null) {
      console.error(
        'THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'
      );
    }
    _worldScale.setFromMatrixScale(this.matrixWorld);
    _viewWorldMatrix.copy(raycaster.camera.matrixWorld);
    this.modelViewMatrix.multiplyMatrices(raycaster.camera.matrixWorldInverse, this.matrixWorld);
    _mvPosition.setFromMatrixPosition(this.modelViewMatrix);
    if (raycaster.camera.isPerspectiveCamera && this.material.sizeAttenuation === false) {
      _worldScale.multiplyScalar(-_mvPosition.z);
    }
    const rotation = this.material.rotation;
    let sin, cos;
    if (rotation !== 0) {
      cos = Math.cos(rotation);
      sin = Math.sin(rotation);
    }
    const center = this.center;
    transformVertex(_vA.set(-0.5, -0.5, 0), _mvPosition, center, _worldScale, sin, cos);
    transformVertex(_vB.set(0.5, -0.5, 0), _mvPosition, center, _worldScale, sin, cos);
    transformVertex(_vC.set(0.5, 0.5, 0), _mvPosition, center, _worldScale, sin, cos);
    _uvA.set(0, 0);
    _uvB.set(1, 0);
    _uvC.set(1, 1);
    let intersect = raycaster.ray.intersectTriangle(_vA, _vB, _vC, false, _intersectPoint);
    if (intersect === null) {
      transformVertex(_vB.set(-0.5, 0.5, 0), _mvPosition, center, _worldScale, sin, cos);
      _uvB.set(0, 1);
      intersect = raycaster.ray.intersectTriangle(_vA, _vC, _vB, false, _intersectPoint);
      if (intersect === null) {
        return;
      }
    }
    const distance = raycaster.ray.origin.distanceTo(_intersectPoint);
    if (distance < raycaster.near || distance > raycaster.far)
      return;
    intersects.push({
      distance,
      point: _intersectPoint.clone(),
      uv: Triangle.getInterpolation(
        _intersectPoint,
        _vA,
        _vB,
        _vC,
        _uvA,
        _uvB,
        _uvC,
        new Vector2()
      ),
      face: null,
      object: this
    });
  }
  copy(source, recursive) {
    super.copy(source, recursive);
    if (source.center !== void 0)
      this.center.copy(source.center);
    this.material = source.material;
    return this;
  }
}
function transformVertex(vertexPosition, mvPosition, center, scale, sin, cos) {
  _alignedPosition.subVectors(vertexPosition, center).addScalar(0.5).multiply(scale);
  if (sin !== void 0) {
    _rotatedPosition.x = cos * _alignedPosition.x - sin * _alignedPosition.y;
    _rotatedPosition.y = sin * _alignedPosition.x + cos * _alignedPosition.y;
  } else {
    _rotatedPosition.copy(_alignedPosition);
  }
  vertexPosition.copy(mvPosition);
  vertexPosition.x += _rotatedPosition.x;
  vertexPosition.y += _rotatedPosition.y;
  vertexPosition.applyMatrix4(_viewWorldMatrix);
}

export { Bone, Group, InstancedMesh, LOD, Line, LineLoop, LineSegments, Mesh, Points, Skeleton, SkinnedMesh, Sprite };
