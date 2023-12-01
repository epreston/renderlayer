import { clamp, denormalize, normalize, Vector3, Vector2, generateUUID, Matrix3, Box3, Sphere, Matrix4 } from '@renderlayer/math';
import { StaticDrawUsage, FloatType, arrayNeedsUint32, TrianglesDrawMode, TriangleFanDrawMode, TriangleStripDrawMode } from '@renderlayer/shared';
import { EventDispatcher, Object3D } from '@renderlayer/core';

const _tables = /* @__PURE__ */ _generateTables();
function _generateTables() {
  const buffer = new ArrayBuffer(4);
  const floatView = new Float32Array(buffer);
  const uint32View = new Uint32Array(buffer);
  const baseTable = new Uint32Array(512);
  const shiftTable = new Uint32Array(512);
  for (let i = 0; i < 256; ++i) {
    const e = i - 127;
    if (e < -27) {
      baseTable[i] = 0;
      baseTable[i | 256] = 32768;
      shiftTable[i] = 24;
      shiftTable[i | 256] = 24;
    } else if (e < -14) {
      baseTable[i] = 1024 >> -e - 14;
      baseTable[i | 256] = 1024 >> -e - 14 | 32768;
      shiftTable[i] = -e - 1;
      shiftTable[i | 256] = -e - 1;
    } else if (e <= 15) {
      baseTable[i] = e + 15 << 10;
      baseTable[i | 256] = e + 15 << 10 | 32768;
      shiftTable[i] = 13;
      shiftTable[i | 256] = 13;
    } else if (e < 128) {
      baseTable[i] = 31744;
      baseTable[i | 256] = 64512;
      shiftTable[i] = 24;
      shiftTable[i | 256] = 24;
    } else {
      baseTable[i] = 31744;
      baseTable[i | 256] = 64512;
      shiftTable[i] = 13;
      shiftTable[i | 256] = 13;
    }
  }
  const mantissaTable = new Uint32Array(2048);
  const exponentTable = new Uint32Array(64);
  const offsetTable = new Uint32Array(64);
  for (let i = 1; i < 1024; ++i) {
    let m = i << 13;
    let e = 0;
    while ((m & 8388608) === 0) {
      m <<= 1;
      e -= 8388608;
    }
    m &= ~8388608;
    e += 947912704;
    mantissaTable[i] = m | e;
  }
  for (let i = 1024; i < 2048; ++i) {
    mantissaTable[i] = 939524096 + (i - 1024 << 13);
  }
  for (let i = 1; i < 31; ++i) {
    exponentTable[i] = i << 23;
  }
  exponentTable[31] = 1199570944;
  exponentTable[32] = 2147483648;
  for (let i = 33; i < 63; ++i) {
    exponentTable[i] = 2147483648 + (i - 32 << 23);
  }
  exponentTable[63] = 3347054592;
  for (let i = 1; i < 64; ++i) {
    if (i !== 32) {
      offsetTable[i] = 1024;
    }
  }
  return {
    floatView,
    uint32View,
    baseTable,
    shiftTable,
    mantissaTable,
    exponentTable,
    offsetTable
  };
}
function toHalfFloat(val) {
  if (Math.abs(val) > 65504)
    console.warn("DataUtils.toHalfFloat(): Value out of range.");
  val = clamp(val, -65504, 65504);
  _tables.floatView[0] = val;
  const f = _tables.uint32View[0];
  const e = f >> 23 & 511;
  return _tables.baseTable[e] + ((f & 8388607) >> _tables.shiftTable[e]);
}
function fromHalfFloat(val) {
  const m = val >> 10;
  _tables.uint32View[0] = _tables.mantissaTable[_tables.offsetTable[m] + (val & 1023)] + _tables.exponentTable[m];
  return _tables.floatView[0];
}

const _vector$2 = /* @__PURE__ */ new Vector3();
const _vector2 = /* @__PURE__ */ new Vector2();
class BufferAttribute {
  constructor(array, itemSize, normalized = false) {
    if (Array.isArray(array)) {
      throw new TypeError("BufferAttribute: array should be a Typed Array.");
    }
    this.isBufferAttribute = true;
    this.name = "";
    this.array = array;
    this.itemSize = itemSize;
    this.count = array !== void 0 ? array.length / itemSize : 0;
    this.normalized = normalized;
    this.usage = StaticDrawUsage;
    this.updateRange = { offset: 0, count: -1 };
    this.gpuType = FloatType;
    this.version = 0;
  }
  onUploadCallback() {
  }
  set needsUpdate(value) {
    if (value === true)
      this.version++;
  }
  setUsage(value) {
    this.usage = value;
    return this;
  }
  copy(source) {
    this.name = source.name;
    this.array = new source.array.constructor(source.array);
    this.itemSize = source.itemSize;
    this.count = source.count;
    this.normalized = source.normalized;
    this.usage = source.usage;
    this.gpuType = source.gpuType;
    return this;
  }
  copyAt(index1, attribute, index2) {
    index1 *= this.itemSize;
    index2 *= attribute.itemSize;
    for (let i = 0, l = this.itemSize; i < l; i++) {
      this.array[index1 + i] = attribute.array[index2 + i];
    }
    return this;
  }
  copyArray(array) {
    this.array.set(array);
    return this;
  }
  applyMatrix3(m) {
    if (this.itemSize === 2) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector2.fromBufferAttribute(this, i);
        _vector2.applyMatrix3(m);
        this.setXY(i, _vector2.x, _vector2.y);
      }
    } else if (this.itemSize === 3) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector$2.fromBufferAttribute(this, i);
        _vector$2.applyMatrix3(m);
        this.setXYZ(i, _vector$2.x, _vector$2.y, _vector$2.z);
      }
    }
    return this;
  }
  applyMatrix4(m) {
    for (let i = 0, l = this.count; i < l; i++) {
      _vector$2.fromBufferAttribute(this, i);
      _vector$2.applyMatrix4(m);
      this.setXYZ(i, _vector$2.x, _vector$2.y, _vector$2.z);
    }
    return this;
  }
  applyNormalMatrix(m) {
    for (let i = 0, l = this.count; i < l; i++) {
      _vector$2.fromBufferAttribute(this, i);
      _vector$2.applyNormalMatrix(m);
      this.setXYZ(i, _vector$2.x, _vector$2.y, _vector$2.z);
    }
    return this;
  }
  transformDirection(m) {
    for (let i = 0, l = this.count; i < l; i++) {
      _vector$2.fromBufferAttribute(this, i);
      _vector$2.transformDirection(m);
      this.setXYZ(i, _vector$2.x, _vector$2.y, _vector$2.z);
    }
    return this;
  }
  set(value, offset = 0) {
    this.array.set(value, offset);
    return this;
  }
  getComponent(index, component) {
    let value = this.array[index * this.itemSize + component];
    if (this.normalized)
      value = denormalize(value, this.array);
    return value;
  }
  setComponent(index, component, value) {
    if (this.normalized)
      value = normalize(value, this.array);
    this.array[index * this.itemSize + component] = value;
    return this;
  }
  getX(index) {
    let x = this.array[index * this.itemSize];
    if (this.normalized)
      x = denormalize(x, this.array);
    return x;
  }
  setX(index, x) {
    if (this.normalized)
      x = normalize(x, this.array);
    this.array[index * this.itemSize] = x;
    return this;
  }
  getY(index) {
    let y = this.array[index * this.itemSize + 1];
    if (this.normalized)
      y = denormalize(y, this.array);
    return y;
  }
  setY(index, y) {
    if (this.normalized)
      y = normalize(y, this.array);
    this.array[index * this.itemSize + 1] = y;
    return this;
  }
  getZ(index) {
    let z = this.array[index * this.itemSize + 2];
    if (this.normalized)
      z = denormalize(z, this.array);
    return z;
  }
  setZ(index, z) {
    if (this.normalized)
      z = normalize(z, this.array);
    this.array[index * this.itemSize + 2] = z;
    return this;
  }
  getW(index) {
    let w = this.array[index * this.itemSize + 3];
    if (this.normalized)
      w = denormalize(w, this.array);
    return w;
  }
  setW(index, w) {
    if (this.normalized)
      w = normalize(w, this.array);
    this.array[index * this.itemSize + 3] = w;
    return this;
  }
  setXY(index, x, y) {
    index *= this.itemSize;
    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
    }
    this.array[index + 0] = x;
    this.array[index + 1] = y;
    return this;
  }
  setXYZ(index, x, y, z) {
    index *= this.itemSize;
    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);
    }
    this.array[index + 0] = x;
    this.array[index + 1] = y;
    this.array[index + 2] = z;
    return this;
  }
  setXYZW(index, x, y, z, w) {
    index *= this.itemSize;
    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);
      w = normalize(w, this.array);
    }
    this.array[index + 0] = x;
    this.array[index + 1] = y;
    this.array[index + 2] = z;
    this.array[index + 3] = w;
    return this;
  }
  onUpload(callback) {
    this.onUploadCallback = callback;
    return this;
  }
  /** @returns {this} */
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  toJSON() {
    const data = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized
    };
    if (this.name !== "")
      data.name = this.name;
    if (this.usage !== StaticDrawUsage)
      data.usage = this.usage;
    if (this.updateRange.offset !== 0 || this.updateRange.count !== -1)
      data.updateRange = this.updateRange;
    return data;
  }
}
class Int8BufferAttribute extends BufferAttribute {
  constructor(array, itemSize, normalized) {
    super(new Int8Array(array), itemSize, normalized);
  }
}
class Uint8BufferAttribute extends BufferAttribute {
  constructor(array, itemSize, normalized) {
    super(new Uint8Array(array), itemSize, normalized);
  }
}
class Uint8ClampedBufferAttribute extends BufferAttribute {
  constructor(array, itemSize, normalized) {
    super(new Uint8ClampedArray(array), itemSize, normalized);
  }
}
class Int16BufferAttribute extends BufferAttribute {
  constructor(array, itemSize, normalized) {
    super(new Int16Array(array), itemSize, normalized);
  }
}
class Uint16BufferAttribute extends BufferAttribute {
  constructor(array, itemSize, normalized) {
    super(new Uint16Array(array), itemSize, normalized);
  }
}
class Int32BufferAttribute extends BufferAttribute {
  constructor(array, itemSize, normalized) {
    super(new Int32Array(array), itemSize, normalized);
  }
}
class Uint32BufferAttribute extends BufferAttribute {
  constructor(array, itemSize, normalized) {
    super(new Uint32Array(array), itemSize, normalized);
  }
}
class Float16BufferAttribute extends BufferAttribute {
  constructor(array, itemSize, normalized) {
    super(new Uint16Array(array), itemSize, normalized);
    this.isFloat16BufferAttribute = true;
  }
  getX(index) {
    let x = fromHalfFloat(this.array[index * this.itemSize]);
    if (this.normalized)
      x = denormalize(x, this.array);
    return x;
  }
  setX(index, x) {
    if (this.normalized)
      x = normalize(x, this.array);
    this.array[index * this.itemSize] = toHalfFloat(x);
    return this;
  }
  getY(index) {
    let y = fromHalfFloat(this.array[index * this.itemSize + 1]);
    if (this.normalized)
      y = denormalize(y, this.array);
    return y;
  }
  setY(index, y) {
    if (this.normalized)
      y = normalize(y, this.array);
    this.array[index * this.itemSize + 1] = toHalfFloat(y);
    return this;
  }
  getZ(index) {
    let z = fromHalfFloat(this.array[index * this.itemSize + 2]);
    if (this.normalized)
      z = denormalize(z, this.array);
    return z;
  }
  setZ(index, z) {
    if (this.normalized)
      z = normalize(z, this.array);
    this.array[index * this.itemSize + 2] = toHalfFloat(z);
    return this;
  }
  getW(index) {
    let w = fromHalfFloat(this.array[index * this.itemSize + 3]);
    if (this.normalized)
      w = denormalize(w, this.array);
    return w;
  }
  setW(index, w) {
    if (this.normalized)
      w = normalize(w, this.array);
    this.array[index * this.itemSize + 3] = toHalfFloat(w);
    return this;
  }
  setXY(index, x, y) {
    index *= this.itemSize;
    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
    }
    this.array[index + 0] = toHalfFloat(x);
    this.array[index + 1] = toHalfFloat(y);
    return this;
  }
  setXYZ(index, x, y, z) {
    index *= this.itemSize;
    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);
    }
    this.array[index + 0] = toHalfFloat(x);
    this.array[index + 1] = toHalfFloat(y);
    this.array[index + 2] = toHalfFloat(z);
    return this;
  }
  setXYZW(index, x, y, z, w) {
    index *= this.itemSize;
    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);
      w = normalize(w, this.array);
    }
    this.array[index + 0] = toHalfFloat(x);
    this.array[index + 1] = toHalfFloat(y);
    this.array[index + 2] = toHalfFloat(z);
    this.array[index + 3] = toHalfFloat(w);
    return this;
  }
}
class Float32BufferAttribute extends BufferAttribute {
  constructor(array, itemSize, normalized) {
    super(new Float32Array(array), itemSize, normalized);
  }
}
class Float64BufferAttribute extends BufferAttribute {
  constructor(array, itemSize, normalized) {
    super(new Float64Array(array), itemSize, normalized);
  }
}

let _id = 0;
const _m1 = /* @__PURE__ */ new Matrix4();
const _obj = /* @__PURE__ */ new Object3D();
const _offset = /* @__PURE__ */ new Vector3();
const _box = /* @__PURE__ */ new Box3();
const _boxMorphTargets = /* @__PURE__ */ new Box3();
const _vector$1 = /* @__PURE__ */ new Vector3();
class BufferGeometry extends EventDispatcher {
  constructor() {
    super();
    this.isBufferGeometry = true;
    this.type = "BufferGeometry";
    Object.defineProperty(this, "id", { value: _id++ });
    this.uuid = generateUUID();
    this.name = "";
    this.index = null;
    this.attributes = {};
    this.morphAttributes = {};
    this.morphTargetsRelative = false;
    this.groups = [];
    this.boundingBox = null;
    this.boundingSphere = null;
    this.drawRange = { start: 0, count: Infinity };
    this.userData = {};
  }
  /** @returns {Uint32BufferAttribute | Uint16BufferAttribute} */
  getIndex() {
    return this.index;
  }
  setIndex(index) {
    if (Array.isArray(index)) {
      this.index = new (arrayNeedsUint32(index) ? Uint32BufferAttribute : Uint16BufferAttribute)(
        index,
        1
      );
    } else {
      this.index = index;
    }
    return this;
  }
  /** @returns {BufferAttribute} */
  getAttribute(name) {
    return this.attributes[name];
  }
  setAttribute(name, attribute) {
    this.attributes[name] = attribute;
    return this;
  }
  deleteAttribute(name) {
    delete this.attributes[name];
    return this;
  }
  hasAttribute(name) {
    return this.attributes[name] !== void 0;
  }
  addGroup(start, count, materialIndex = 0) {
    this.groups.push({
      start,
      count,
      materialIndex
    });
  }
  clearGroups() {
    this.groups = [];
  }
  setDrawRange(start, count) {
    this.drawRange.start = start;
    this.drawRange.count = count;
  }
  applyMatrix4(matrix) {
    const position = this.attributes.position;
    if (position !== void 0) {
      position.applyMatrix4(matrix);
      position.needsUpdate = true;
    }
    const normal = this.attributes.normal;
    if (normal !== void 0) {
      const normalMatrix = new Matrix3().getNormalMatrix(matrix);
      normal.applyNormalMatrix(normalMatrix);
      normal.needsUpdate = true;
    }
    const tangent = this.attributes.tangent;
    if (tangent !== void 0) {
      tangent.transformDirection(matrix);
      tangent.needsUpdate = true;
    }
    if (this.boundingBox !== null) {
      this.computeBoundingBox();
    }
    if (this.boundingSphere !== null) {
      this.computeBoundingSphere();
    }
    return this;
  }
  applyQuaternion(q) {
    _m1.makeRotationFromQuaternion(q);
    this.applyMatrix4(_m1);
    return this;
  }
  rotateX(angle) {
    _m1.makeRotationX(angle);
    this.applyMatrix4(_m1);
    return this;
  }
  rotateY(angle) {
    _m1.makeRotationY(angle);
    this.applyMatrix4(_m1);
    return this;
  }
  rotateZ(angle) {
    _m1.makeRotationZ(angle);
    this.applyMatrix4(_m1);
    return this;
  }
  translate(x, y, z) {
    _m1.makeTranslation(x, y, z);
    this.applyMatrix4(_m1);
    return this;
  }
  scale(x, y, z) {
    _m1.makeScale(x, y, z);
    this.applyMatrix4(_m1);
    return this;
  }
  lookAt(vector) {
    _obj.lookAt(vector);
    _obj.updateMatrix();
    this.applyMatrix4(_obj.matrix);
    return this;
  }
  center() {
    this.computeBoundingBox();
    this.boundingBox.getCenter(_offset).negate();
    this.translate(_offset.x, _offset.y, _offset.z);
    return this;
  }
  setFromPoints(points) {
    const position = [];
    for (let i = 0, l = points.length; i < l; i++) {
      const point = points[i];
      position.push(point.x, point.y, point.z || 0);
    }
    this.setAttribute("position", new Float32BufferAttribute(position, 3));
    return this;
  }
  computeBoundingBox() {
    if (this.boundingBox === null) {
      this.boundingBox = new Box3();
    }
    const position = this.attributes.position;
    const morphAttributesPosition = this.morphAttributes.position;
    if (position && position.isGLBufferAttribute) {
      console.error(
        'BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',
        this
      );
      this.boundingBox.set(
        new Vector3(-Infinity, -Infinity, -Infinity),
        new Vector3(Infinity, Infinity, Infinity)
      );
      return;
    }
    if (position !== void 0) {
      this.boundingBox.setFromBufferAttribute(position);
      if (morphAttributesPosition) {
        for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
          const morphAttribute = morphAttributesPosition[i];
          _box.setFromBufferAttribute(morphAttribute);
          if (this.morphTargetsRelative) {
            _vector$1.addVectors(this.boundingBox.min, _box.min);
            this.boundingBox.expandByPoint(_vector$1);
            _vector$1.addVectors(this.boundingBox.max, _box.max);
            this.boundingBox.expandByPoint(_vector$1);
          } else {
            this.boundingBox.expandByPoint(_box.min);
            this.boundingBox.expandByPoint(_box.max);
          }
        }
      }
    } else {
      this.boundingBox.makeEmpty();
    }
    if (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) {
      console.error(
        'BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',
        this
      );
    }
  }
  computeBoundingSphere() {
    if (this.boundingSphere === null) {
      this.boundingSphere = new Sphere();
    }
    const position = this.attributes.position;
    const morphAttributesPosition = this.morphAttributes.position;
    if (position && position.isGLBufferAttribute) {
      console.error(
        'BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',
        this
      );
      this.boundingSphere.set(new Vector3(), Infinity);
      return;
    }
    if (position) {
      const center = this.boundingSphere.center;
      _box.setFromBufferAttribute(position);
      if (morphAttributesPosition) {
        for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
          const morphAttribute = morphAttributesPosition[i];
          _boxMorphTargets.setFromBufferAttribute(morphAttribute);
          if (this.morphTargetsRelative) {
            _vector$1.addVectors(_box.min, _boxMorphTargets.min);
            _box.expandByPoint(_vector$1);
            _vector$1.addVectors(_box.max, _boxMorphTargets.max);
            _box.expandByPoint(_vector$1);
          } else {
            _box.expandByPoint(_boxMorphTargets.min);
            _box.expandByPoint(_boxMorphTargets.max);
          }
        }
      }
      _box.getCenter(center);
      let maxRadiusSq = 0;
      for (let i = 0, il = position.count; i < il; i++) {
        _vector$1.fromBufferAttribute(position, i);
        maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector$1));
      }
      if (morphAttributesPosition) {
        for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
          const morphAttribute = morphAttributesPosition[i];
          const morphTargetsRelative = this.morphTargetsRelative;
          for (let j = 0, jl = morphAttribute.count; j < jl; j++) {
            _vector$1.fromBufferAttribute(morphAttribute, j);
            if (morphTargetsRelative) {
              _offset.fromBufferAttribute(position, j);
              _vector$1.add(_offset);
            }
            maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector$1));
          }
        }
      }
      this.boundingSphere.radius = Math.sqrt(maxRadiusSq);
      if (isNaN(this.boundingSphere.radius)) {
        console.error(
          'BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',
          this
        );
      }
    }
  }
  computeTangents() {
    const index = this.index;
    const attributes = this.attributes;
    if (index === null || attributes.position === void 0 || attributes.normal === void 0 || attributes.uv === void 0) {
      console.error(
        "BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)"
      );
      return;
    }
    const indices = index.array;
    const positions = attributes.position.array;
    const normals = attributes.normal.array;
    const uvs = attributes.uv.array;
    const nVertices = positions.length / 3;
    if (this.hasAttribute("tangent") === false) {
      this.setAttribute("tangent", new BufferAttribute(new Float32Array(4 * nVertices), 4));
    }
    const tangents = this.getAttribute("tangent").array;
    const tan1 = [];
    const tan2 = [];
    for (let i = 0; i < nVertices; i++) {
      tan1[i] = new Vector3();
      tan2[i] = new Vector3();
    }
    const vA = new Vector3();
    const vB = new Vector3();
    const vC = new Vector3();
    const uvA = new Vector2();
    const uvB = new Vector2();
    const uvC = new Vector2();
    const sdir = new Vector3();
    const tdir = new Vector3();
    function handleTriangle(a, b, c) {
      vA.fromArray(positions, a * 3);
      vB.fromArray(positions, b * 3);
      vC.fromArray(positions, c * 3);
      uvA.fromArray(uvs, a * 2);
      uvB.fromArray(uvs, b * 2);
      uvC.fromArray(uvs, c * 2);
      vB.sub(vA);
      vC.sub(vA);
      uvB.sub(uvA);
      uvC.sub(uvA);
      const r = 1 / (uvB.x * uvC.y - uvC.x * uvB.y);
      if (!isFinite(r))
        return;
      sdir.copy(vB).multiplyScalar(uvC.y).addScaledVector(vC, -uvB.y).multiplyScalar(r);
      tdir.copy(vC).multiplyScalar(uvB.x).addScaledVector(vB, -uvC.x).multiplyScalar(r);
      tan1[a].add(sdir);
      tan1[b].add(sdir);
      tan1[c].add(sdir);
      tan2[a].add(tdir);
      tan2[b].add(tdir);
      tan2[c].add(tdir);
    }
    let groups = this.groups;
    if (groups.length === 0) {
      groups = [{
        start: 0,
        count: indices.length
      }];
    }
    for (let i = 0, il = groups.length; i < il; ++i) {
      const group = groups[i];
      const start = group.start;
      const count = group.count;
      for (let j = start, jl = start + count; j < jl; j += 3) {
        handleTriangle(
          indices[j + 0],
          indices[j + 1],
          indices[j + 2]
        );
      }
    }
    const tmp = new Vector3();
    const tmp2 = new Vector3();
    const n = new Vector3();
    const n2 = new Vector3();
    function handleVertex(v) {
      n.fromArray(normals, v * 3);
      n2.copy(n);
      const t = tan1[v];
      tmp.copy(t);
      tmp.sub(n.multiplyScalar(n.dot(t))).normalize();
      tmp2.crossVectors(n2, t);
      const test = tmp2.dot(tan2[v]);
      const w = test < 0 ? -1 : 1;
      tangents[v * 4] = tmp.x;
      tangents[v * 4 + 1] = tmp.y;
      tangents[v * 4 + 2] = tmp.z;
      tangents[v * 4 + 3] = w;
    }
    for (let i = 0, il = groups.length; i < il; ++i) {
      const group = groups[i];
      const start = group.start;
      const count = group.count;
      for (let j = start, jl = start + count; j < jl; j += 3) {
        handleVertex(indices[j + 0]);
        handleVertex(indices[j + 1]);
        handleVertex(indices[j + 2]);
      }
    }
  }
  computeVertexNormals() {
    const index = this.index;
    const positionAttribute = this.getAttribute("position");
    if (positionAttribute !== void 0) {
      let normalAttribute = this.getAttribute("normal");
      if (normalAttribute === void 0) {
        normalAttribute = new BufferAttribute(new Float32Array(positionAttribute.count * 3), 3);
        this.setAttribute("normal", normalAttribute);
      } else {
        for (let i = 0, il = normalAttribute.count; i < il; i++) {
          normalAttribute.setXYZ(i, 0, 0, 0);
        }
      }
      const pA = new Vector3();
      const pB = new Vector3();
      const pC = new Vector3();
      const nA = new Vector3();
      const nB = new Vector3();
      const nC = new Vector3();
      const cb = new Vector3();
      const ab = new Vector3();
      if (index) {
        for (let i = 0, il = index.count; i < il; i += 3) {
          const vA = index.getX(i + 0);
          const vB = index.getX(i + 1);
          const vC = index.getX(i + 2);
          pA.fromBufferAttribute(positionAttribute, vA);
          pB.fromBufferAttribute(positionAttribute, vB);
          pC.fromBufferAttribute(positionAttribute, vC);
          cb.subVectors(pC, pB);
          ab.subVectors(pA, pB);
          cb.cross(ab);
          nA.fromBufferAttribute(normalAttribute, vA);
          nB.fromBufferAttribute(normalAttribute, vB);
          nC.fromBufferAttribute(normalAttribute, vC);
          nA.add(cb);
          nB.add(cb);
          nC.add(cb);
          normalAttribute.setXYZ(vA, nA.x, nA.y, nA.z);
          normalAttribute.setXYZ(vB, nB.x, nB.y, nB.z);
          normalAttribute.setXYZ(vC, nC.x, nC.y, nC.z);
        }
      } else {
        for (let i = 0, il = positionAttribute.count; i < il; i += 3) {
          pA.fromBufferAttribute(positionAttribute, i + 0);
          pB.fromBufferAttribute(positionAttribute, i + 1);
          pC.fromBufferAttribute(positionAttribute, i + 2);
          cb.subVectors(pC, pB);
          ab.subVectors(pA, pB);
          cb.cross(ab);
          normalAttribute.setXYZ(i + 0, cb.x, cb.y, cb.z);
          normalAttribute.setXYZ(i + 1, cb.x, cb.y, cb.z);
          normalAttribute.setXYZ(i + 2, cb.x, cb.y, cb.z);
        }
      }
      this.normalizeNormals();
      normalAttribute.needsUpdate = true;
    }
  }
  normalizeNormals() {
    const normals = this.attributes.normal;
    for (let i = 0, il = normals.count; i < il; i++) {
      _vector$1.fromBufferAttribute(normals, i);
      _vector$1.normalize();
      normals.setXYZ(i, _vector$1.x, _vector$1.y, _vector$1.z);
    }
  }
  toNonIndexed() {
    function convertBufferAttribute(attribute, indices2) {
      const array = attribute.array;
      const itemSize = attribute.itemSize;
      const normalized = attribute.normalized;
      const array2 = new array.constructor(indices2.length * itemSize);
      let index = 0;
      let index2 = 0;
      for (let i = 0, l = indices2.length; i < l; i++) {
        if (attribute.isInterleavedBufferAttribute) {
          index = indices2[i] * attribute.data.stride + attribute.offset;
        } else {
          index = indices2[i] * itemSize;
        }
        for (let j = 0; j < itemSize; j++) {
          array2[index2++] = array[index++];
        }
      }
      return new BufferAttribute(array2, itemSize, normalized);
    }
    if (this.index === null) {
      console.warn("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.");
      return this;
    }
    const geometry2 = new BufferGeometry();
    const indices = this.index.array;
    const attributes = this.attributes;
    for (const name in attributes) {
      const attribute = attributes[name];
      const newAttribute = convertBufferAttribute(attribute, indices);
      geometry2.setAttribute(name, newAttribute);
    }
    const morphAttributes = this.morphAttributes;
    for (const name in morphAttributes) {
      const morphArray = [];
      const morphAttribute = morphAttributes[name];
      for (let i = 0, il = morphAttribute.length; i < il; i++) {
        const attribute = morphAttribute[i];
        const newAttribute = convertBufferAttribute(attribute, indices);
        morphArray.push(newAttribute);
      }
      geometry2.morphAttributes[name] = morphArray;
    }
    geometry2.morphTargetsRelative = this.morphTargetsRelative;
    const groups = this.groups;
    for (let i = 0, l = groups.length; i < l; i++) {
      const group = groups[i];
      geometry2.addGroup(group.start, group.count, group.materialIndex);
    }
    return geometry2;
  }
  toJSON() {
    const data = {
      metadata: {
        version: 4.5,
        type: "BufferGeometry",
        generator: "BufferGeometry.toJSON"
      }
    };
    data.uuid = this.uuid;
    data.type = this.type;
    if (this.name !== "")
      data.name = this.name;
    if (Object.keys(this.userData).length > 0)
      data.userData = this.userData;
    if (this.parameters !== void 0) {
      const parameters = this.parameters;
      for (const key in parameters) {
        if (parameters[key] !== void 0)
          data[key] = parameters[key];
      }
      return data;
    }
    data.data = { attributes: {} };
    const index = this.index;
    if (index !== null) {
      data.data.index = {
        type: index.array.constructor.name,
        array: Array.prototype.slice.call(index.array)
      };
    }
    const attributes = this.attributes;
    for (const key in attributes) {
      const attribute = attributes[key];
      data.data.attributes[key] = attribute.toJSON(data.data);
    }
    const morphAttributes = {};
    let hasMorphAttributes = false;
    for (const key in this.morphAttributes) {
      const attributeArray = this.morphAttributes[key];
      const array = [];
      for (let i = 0, il = attributeArray.length; i < il; i++) {
        const attribute = attributeArray[i];
        array.push(attribute.toJSON(data.data));
      }
      if (array.length > 0) {
        morphAttributes[key] = array;
        hasMorphAttributes = true;
      }
    }
    if (hasMorphAttributes) {
      data.data.morphAttributes = morphAttributes;
      data.data.morphTargetsRelative = this.morphTargetsRelative;
    }
    const groups = this.groups;
    if (groups.length > 0) {
      data.data.groups = JSON.parse(JSON.stringify(groups));
    }
    const boundingSphere = this.boundingSphere;
    if (boundingSphere !== null) {
      data.data.boundingSphere = {
        center: boundingSphere.center.toArray(),
        radius: boundingSphere.radius
      };
    }
    return data;
  }
  /** @returns {this} */
  clone() {
    return new this.constructor().copy(this);
  }
  copy(source) {
    this.index = null;
    this.attributes = {};
    this.morphAttributes = {};
    this.groups = [];
    this.boundingBox = null;
    this.boundingSphere = null;
    const data = {};
    this.name = source.name;
    const index = source.index;
    if (index !== null) {
      this.setIndex(index.clone(data));
    }
    const attributes = source.attributes;
    for (const name in attributes) {
      const attribute = attributes[name];
      this.setAttribute(name, attribute.clone(data));
    }
    const morphAttributes = source.morphAttributes;
    for (const name in morphAttributes) {
      const array = [];
      const morphAttribute = morphAttributes[name];
      for (let i = 0, l = morphAttribute.length; i < l; i++) {
        array.push(morphAttribute[i].clone(data));
      }
      this.morphAttributes[name] = array;
    }
    this.morphTargetsRelative = source.morphTargetsRelative;
    const groups = source.groups;
    for (let i = 0, l = groups.length; i < l; i++) {
      const group = groups[i];
      this.addGroup(group.start, group.count, group.materialIndex);
    }
    const boundingBox = source.boundingBox;
    if (boundingBox !== null) {
      this.boundingBox = boundingBox.clone();
    }
    const boundingSphere = source.boundingSphere;
    if (boundingSphere !== null) {
      this.boundingSphere = boundingSphere.clone();
    }
    this.drawRange.start = source.drawRange.start;
    this.drawRange.count = source.drawRange.count;
    this.userData = source.userData;
    return this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}

class InstancedBufferAttribute extends BufferAttribute {
  constructor(array, itemSize, normalized, meshPerAttribute = 1) {
    super(array, itemSize, normalized);
    this.isInstancedBufferAttribute = true;
    this.meshPerAttribute = meshPerAttribute;
  }
  copy(source) {
    super.copy(source);
    this.meshPerAttribute = source.meshPerAttribute;
    return this;
  }
  toJSON() {
    const data = super.toJSON();
    data.meshPerAttribute = this.meshPerAttribute;
    data.isInstancedBufferAttribute = true;
    return data;
  }
}

class InterleavedBuffer {
  constructor(array, stride) {
    this.isInterleavedBuffer = true;
    this.array = array;
    this.stride = stride;
    this.count = array !== void 0 ? array.length / stride : 0;
    this.usage = StaticDrawUsage;
    this.updateRange = { offset: 0, count: -1 };
    this.version = 0;
    this.uuid = generateUUID();
  }
  onUploadCallback() {
  }
  set needsUpdate(value) {
    if (value === true)
      this.version++;
  }
  setUsage(value) {
    this.usage = value;
    return this;
  }
  copy(source) {
    this.array = new source.array.constructor(source.array);
    this.count = source.count;
    this.stride = source.stride;
    this.usage = source.usage;
    return this;
  }
  copyAt(index1, attribute, index2) {
    index1 *= this.stride;
    index2 *= attribute.stride;
    for (let i = 0, l = this.stride; i < l; i++) {
      this.array[index1 + i] = attribute.array[index2 + i];
    }
    return this;
  }
  set(value, offset = 0) {
    this.array.set(value, offset);
    return this;
  }
  clone(data) {
    if (data.arrayBuffers === void 0) {
      data.arrayBuffers = {};
    }
    if (this.array.buffer._uuid === void 0) {
      this.array.buffer._uuid = generateUUID();
    }
    if (data.arrayBuffers[this.array.buffer._uuid] === void 0) {
      data.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer;
    }
    const array = new this.array.constructor(data.arrayBuffers[this.array.buffer._uuid]);
    const ib = new this.constructor(array, this.stride);
    ib.setUsage(this.usage);
    return ib;
  }
  onUpload(callback) {
    this.onUploadCallback = callback;
    return this;
  }
  toJSON(data) {
    if (data.arrayBuffers === void 0) {
      data.arrayBuffers = {};
    }
    if (this.array.buffer._uuid === void 0) {
      this.array.buffer._uuid = generateUUID();
    }
    if (data.arrayBuffers[this.array.buffer._uuid] === void 0) {
      data.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer));
    }
    return {
      uuid: this.uuid,
      buffer: this.array.buffer._uuid,
      type: this.array.constructor.name,
      stride: this.stride
    };
  }
}

const _vector = /* @__PURE__ */ new Vector3();
class InterleavedBufferAttribute {
  constructor(interleavedBuffer, itemSize, offset, normalized = false) {
    this.isInterleavedBufferAttribute = true;
    this.name = "";
    this.data = interleavedBuffer;
    this.itemSize = itemSize;
    this.offset = offset;
    this.normalized = normalized;
  }
  get count() {
    return this.data.count;
  }
  get array() {
    return this.data.array;
  }
  set needsUpdate(value) {
    this.data.needsUpdate = value;
  }
  /** @param {import('@renderlayer/math').Matrix4} m */
  applyMatrix4(m) {
    for (let i = 0, l = this.data.count; i < l; i++) {
      _vector.fromBufferAttribute(this, i);
      _vector.applyMatrix4(m);
      this.setXYZ(i, _vector.x, _vector.y, _vector.z);
    }
    return this;
  }
  /** @param {import('@renderlayer/math').Matrix3} m */
  applyNormalMatrix(m) {
    for (let i = 0, l = this.count; i < l; i++) {
      _vector.fromBufferAttribute(this, i);
      _vector.applyNormalMatrix(m);
      this.setXYZ(i, _vector.x, _vector.y, _vector.z);
    }
    return this;
  }
  /** @param {import('@renderlayer/math').Matrix4} m */
  transformDirection(m) {
    for (let i = 0, l = this.count; i < l; i++) {
      _vector.fromBufferAttribute(this, i);
      _vector.transformDirection(m);
      this.setXYZ(i, _vector.x, _vector.y, _vector.z);
    }
    return this;
  }
  setX(index, x) {
    if (this.normalized)
      x = normalize(x, this.array);
    this.data.array[index * this.data.stride + this.offset] = x;
    return this;
  }
  setY(index, y) {
    if (this.normalized)
      y = normalize(y, this.array);
    this.data.array[index * this.data.stride + this.offset + 1] = y;
    return this;
  }
  setZ(index, z) {
    if (this.normalized)
      z = normalize(z, this.array);
    this.data.array[index * this.data.stride + this.offset + 2] = z;
    return this;
  }
  setW(index, w) {
    if (this.normalized)
      w = normalize(w, this.array);
    this.data.array[index * this.data.stride + this.offset + 3] = w;
    return this;
  }
  getX(index) {
    let x = this.data.array[index * this.data.stride + this.offset];
    if (this.normalized)
      x = denormalize(x, this.array);
    return x;
  }
  getY(index) {
    let y = this.data.array[index * this.data.stride + this.offset + 1];
    if (this.normalized)
      y = denormalize(y, this.array);
    return y;
  }
  getZ(index) {
    let z = this.data.array[index * this.data.stride + this.offset + 2];
    if (this.normalized)
      z = denormalize(z, this.array);
    return z;
  }
  getW(index) {
    let w = this.data.array[index * this.data.stride + this.offset + 3];
    if (this.normalized)
      w = denormalize(w, this.array);
    return w;
  }
  setXY(index, x, y) {
    index = index * this.data.stride + this.offset;
    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
    }
    this.data.array[index + 0] = x;
    this.data.array[index + 1] = y;
    return this;
  }
  setXYZ(index, x, y, z) {
    index = index * this.data.stride + this.offset;
    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);
    }
    this.data.array[index + 0] = x;
    this.data.array[index + 1] = y;
    this.data.array[index + 2] = z;
    return this;
  }
  setXYZW(index, x, y, z, w) {
    index = index * this.data.stride + this.offset;
    if (this.normalized) {
      x = normalize(x, this.array);
      y = normalize(y, this.array);
      z = normalize(z, this.array);
      w = normalize(w, this.array);
    }
    this.data.array[index + 0] = x;
    this.data.array[index + 1] = y;
    this.data.array[index + 2] = z;
    this.data.array[index + 3] = w;
    return this;
  }
  clone(data) {
    if (data === void 0) {
      console.warn(
        "InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data."
      );
      const array = [];
      for (let i = 0; i < this.count; i++) {
        const index = i * this.data.stride + this.offset;
        for (let j = 0; j < this.itemSize; j++) {
          array.push(this.data.array[index + j]);
        }
      }
      return new BufferAttribute(new this.array.constructor(array), this.itemSize, this.normalized);
    } else {
      if (data.interleavedBuffers === void 0) {
        data.interleavedBuffers = {};
      }
      if (data.interleavedBuffers[this.data.uuid] === void 0) {
        data.interleavedBuffers[this.data.uuid] = this.data.clone(data);
      }
      return new InterleavedBufferAttribute(
        data.interleavedBuffers[this.data.uuid],
        this.itemSize,
        this.offset,
        this.normalized
      );
    }
  }
  toJSON(data) {
    if (data === void 0) {
      console.warn(
        "InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data."
      );
      const array = [];
      for (let i = 0; i < this.count; i++) {
        const index = i * this.data.stride + this.offset;
        for (let j = 0; j < this.itemSize; j++) {
          array.push(this.data.array[index + j]);
        }
      }
      return {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array,
        normalized: this.normalized
      };
    } else {
      if (data.interleavedBuffers === void 0) {
        data.interleavedBuffers = {};
      }
      if (data.interleavedBuffers[this.data.uuid] === void 0) {
        data.interleavedBuffers[this.data.uuid] = this.data.toJSON(data);
      }
      return {
        isInterleavedBufferAttribute: true,
        itemSize: this.itemSize,
        data: this.data.uuid,
        offset: this.offset,
        normalized: this.normalized
      };
    }
  }
}

function mergeGeometries(geometries, useGroups = false) {
  const isIndexed = geometries[0].index !== null;
  const attributesUsed = new Set(Object.keys(geometries[0].attributes));
  const morphAttributesUsed = new Set(Object.keys(geometries[0].morphAttributes));
  const attributes = {};
  const morphAttributes = {};
  const morphTargetsRelative = geometries[0].morphTargetsRelative;
  const mergedGeometry = new BufferGeometry();
  let offset = 0;
  for (let i = 0; i < geometries.length; ++i) {
    const geometry = geometries[i];
    let attributesCount = 0;
    if (isIndexed !== (geometry.index !== null)) {
      console.error(
        `BufferGeometryUtils: .mergeGeometries() failed with geometry at index ${i}. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.`
      );
      return null;
    }
    for (const name in geometry.attributes) {
      if (!attributesUsed.has(name)) {
        console.error(
          `BufferGeometryUtils: .mergeGeometries() failed with geometry at index ${i}. All geometries must have compatible attributes; make sure "${name}" attribute exists among all geometries, or in none of them.`
        );
        return null;
      }
      if (attributes[name] === void 0)
        attributes[name] = [];
      attributes[name].push(geometry.attributes[name]);
      attributesCount++;
    }
    if (attributesCount !== attributesUsed.size) {
      console.error(
        `BufferGeometryUtils: .mergeGeometries() failed with geometry at index ${i}. Make sure all geometries have the same number of attributes.`
      );
      return null;
    }
    if (morphTargetsRelative !== geometry.morphTargetsRelative) {
      console.error(
        `BufferGeometryUtils: .mergeGeometries() failed with geometry at index ${i}. .morphTargetsRelative must be consistent throughout all geometries.`
      );
      return null;
    }
    for (const name in geometry.morphAttributes) {
      if (!morphAttributesUsed.has(name)) {
        console.error(
          `BufferGeometryUtils: .mergeGeometries() failed with geometry at index ${i}.  .morphAttributes must be consistent throughout all geometries.`
        );
        return null;
      }
      if (morphAttributes[name] === void 0)
        morphAttributes[name] = [];
      morphAttributes[name].push(geometry.morphAttributes[name]);
    }
    if (useGroups) {
      let count;
      if (isIndexed) {
        count = geometry.index.count;
      } else if (geometry.attributes.position !== void 0) {
        count = geometry.attributes.position.count;
      } else {
        console.error(
          `BufferGeometryUtils: .mergeGeometries() failed with geometry at index ${i}. The geometry must have either an index or a position attribute`
        );
        return null;
      }
      mergedGeometry.addGroup(offset, count, i);
      offset += count;
    }
  }
  if (isIndexed) {
    let indexOffset = 0;
    const mergedIndex = [];
    for (let i = 0; i < geometries.length; ++i) {
      const index = geometries[i].index;
      for (let j = 0; j < index.count; ++j) {
        mergedIndex.push(index.getX(j) + indexOffset);
      }
      indexOffset += geometries[i].attributes.position.count;
    }
    mergedGeometry.setIndex(mergedIndex);
  }
  for (const name in attributes) {
    const mergedAttribute = mergeAttributes(attributes[name]);
    if (!mergedAttribute) {
      console.error(
        `BufferGeometryUtils: .mergeGeometries() failed while trying to merge the ${name} attribute.`
      );
      return null;
    }
    mergedGeometry.setAttribute(name, mergedAttribute);
  }
  for (const name in morphAttributes) {
    const numMorphTargets = morphAttributes[name][0].length;
    if (numMorphTargets === 0)
      break;
    mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
    mergedGeometry.morphAttributes[name] = [];
    for (let i = 0; i < numMorphTargets; ++i) {
      const morphAttributesToMerge = [];
      for (let j = 0; j < morphAttributes[name].length; ++j) {
        morphAttributesToMerge.push(morphAttributes[name][j][i]);
      }
      const mergedMorphAttribute = mergeAttributes(morphAttributesToMerge);
      if (!mergedMorphAttribute) {
        console.error(
          `BufferGeometryUtils: .mergeGeometries() failed while trying to merge the ${name} morphAttribute.`
        );
        return null;
      }
      mergedGeometry.morphAttributes[name].push(mergedMorphAttribute);
    }
  }
  return mergedGeometry;
}
function mergeAttributes(attributes) {
  let TypedArray;
  let itemSize;
  let normalized;
  let gpuType = -1;
  let arrayLength = 0;
  for (const attribute of attributes) {
    if (attribute.isInterleavedBufferAttribute) {
      console.error(
        "BufferGeometryUtils: .mergeAttributes() failed. InterleavedBufferAttributes are not supported."
      );
      return null;
    }
    if (TypedArray === void 0)
      TypedArray = attribute.array.constructor;
    if (TypedArray !== attribute.array.constructor) {
      console.error(
        "BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."
      );
      return null;
    }
    if (itemSize === void 0)
      itemSize = attribute.itemSize;
    if (itemSize !== attribute.itemSize) {
      console.error(
        "BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."
      );
      return null;
    }
    if (normalized === void 0)
      normalized = attribute.normalized;
    if (normalized !== attribute.normalized) {
      console.error(
        "BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."
      );
      return null;
    }
    if (gpuType === -1)
      gpuType = attribute.gpuType;
    if (gpuType !== attribute.gpuType) {
      console.error(
        "BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."
      );
      return null;
    }
    arrayLength += attribute.array.length;
  }
  const array = new TypedArray(arrayLength);
  let offset = 0;
  for (let i = 0; i < attributes.length; ++i) {
    array.set(attributes[i].array, offset);
    offset += attributes[i].array.length;
  }
  const result = new BufferAttribute(array, itemSize, normalized);
  if (gpuType !== void 0) {
    result.gpuType = gpuType;
  }
  return result;
}
function deepCloneAttribute(attribute) {
  if (attribute.isInstancedInterleavedBufferAttribute || attribute.isInterleavedBufferAttribute) {
    return deinterleaveAttribute(attribute);
  }
  if (attribute.isInstancedBufferAttribute) {
    return new InstancedBufferAttribute().copy(attribute);
  }
  return new BufferAttribute().copy(attribute);
}
function interleaveAttributes(attributes) {
  let TypedArray;
  let arrayLength = 0;
  let stride = 0;
  for (let i = 0, l = attributes.length; i < l; ++i) {
    const attribute = attributes[i];
    if (TypedArray === void 0)
      TypedArray = attribute.array.constructor;
    if (TypedArray !== attribute.array.constructor) {
      console.error("AttributeBuffers of different types cannot be interleaved");
      return null;
    }
    arrayLength += attribute.array.length;
    stride += attribute.itemSize;
  }
  const interleavedBuffer = new InterleavedBuffer(new TypedArray(arrayLength), stride);
  let offset = 0;
  const res = [];
  const getters = ["getX", "getY", "getZ", "getW"];
  const setters = ["setX", "setY", "setZ", "setW"];
  for (let j = 0, l = attributes.length; j < l; j++) {
    const attribute = attributes[j];
    const itemSize = attribute.itemSize;
    const count = attribute.count;
    const iba = new InterleavedBufferAttribute(
      interleavedBuffer,
      itemSize,
      offset,
      attribute.normalized
    );
    res.push(iba);
    offset += itemSize;
    for (let c = 0; c < count; c++) {
      for (let k = 0; k < itemSize; k++) {
        iba[setters[k]](c, attribute[getters[k]](c));
      }
    }
  }
  return res;
}
function deinterleaveAttribute(attribute) {
  const cons = attribute.data.array.constructor;
  const count = attribute.count;
  const itemSize = attribute.itemSize;
  const normalized = attribute.normalized;
  const array = new cons(count * itemSize);
  let newAttribute;
  if (attribute.isInstancedInterleavedBufferAttribute) {
    newAttribute = new InstancedBufferAttribute(
      array,
      itemSize,
      normalized,
      attribute.meshPerAttribute
    );
  } else {
    newAttribute = new BufferAttribute(array, itemSize, normalized);
  }
  for (let i = 0; i < count; i++) {
    newAttribute.setX(i, attribute.getX(i));
    if (itemSize >= 2) {
      newAttribute.setY(i, attribute.getY(i));
    }
    if (itemSize >= 3) {
      newAttribute.setZ(i, attribute.getZ(i));
    }
    if (itemSize >= 4) {
      newAttribute.setW(i, attribute.getW(i));
    }
  }
  return newAttribute;
}
function deinterleaveGeometry(geometry) {
  const attributes = geometry.attributes;
  const morphTargets = geometry.morphTargets;
  const attrMap = /* @__PURE__ */ new Map();
  for (const key in attributes) {
    const attr = attributes[key];
    if (attr.isInterleavedBufferAttribute) {
      if (!attrMap.has(attr)) {
        attrMap.set(attr, deinterleaveAttribute(attr));
      }
      attributes[key] = attrMap.get(attr);
    }
  }
  for (const key in morphTargets) {
    const attr = morphTargets[key];
    if (attr.isInterleavedBufferAttribute) {
      if (!attrMap.has(attr)) {
        attrMap.set(attr, deinterleaveAttribute(attr));
      }
      morphTargets[key] = attrMap.get(attr);
    }
  }
}
function estimateBytesUsed(geometry) {
  let mem = 0;
  for (const name in geometry.attributes) {
    const attr = geometry.getAttribute(name);
    mem += attr.count * attr.itemSize * attr.array.BYTES_PER_ELEMENT;
  }
  const indices = geometry.getIndex();
  mem += indices ? indices.count * indices.itemSize * indices.array.BYTES_PER_ELEMENT : 0;
  return mem;
}
function mergeVertices(geometry, tolerance = 1e-4) {
  tolerance = Math.max(tolerance, Number.EPSILON);
  const hashToIndex = {};
  const indices = geometry.getIndex();
  const positions = geometry.getAttribute("position");
  const vertexCount = indices ? indices.count : positions.count;
  let nextIndex = 0;
  const attributeNames = Object.keys(geometry.attributes);
  const tmpAttributes = {};
  const tmpMorphAttributes = {};
  const newIndices = [];
  const getters = ["getX", "getY", "getZ", "getW"];
  const setters = ["setX", "setY", "setZ", "setW"];
  for (let i = 0, l = attributeNames.length; i < l; i++) {
    const name = attributeNames[i];
    const attr = geometry.attributes[name];
    tmpAttributes[name] = new BufferAttribute(
      new attr.array.constructor(attr.count * attr.itemSize),
      attr.itemSize,
      attr.normalized
    );
    const morphAttr = geometry.morphAttributes[name];
    if (morphAttr) {
      tmpMorphAttributes[name] = new BufferAttribute(
        new morphAttr.array.constructor(morphAttr.count * morphAttr.itemSize),
        morphAttr.itemSize,
        morphAttr.normalized
      );
    }
  }
  const decimalShift = Math.log10(1 / tolerance);
  const shiftMultiplier = Math.pow(10, decimalShift);
  for (let i = 0; i < vertexCount; i++) {
    const index = indices ? indices.getX(i) : i;
    let hash = "";
    for (let j = 0, l = attributeNames.length; j < l; j++) {
      const name = attributeNames[j];
      const attribute = geometry.getAttribute(name);
      const itemSize = attribute.itemSize;
      for (let k = 0; k < itemSize; k++) {
        hash += `${~~(attribute[getters[k]](index) * shiftMultiplier)},`;
      }
    }
    if (hash in hashToIndex) {
      newIndices.push(hashToIndex[hash]);
    } else {
      for (let j = 0, l = attributeNames.length; j < l; j++) {
        const name = attributeNames[j];
        const attribute = geometry.getAttribute(name);
        const morphAttr = geometry.morphAttributes[name];
        const itemSize = attribute.itemSize;
        const newArray = tmpAttributes[name];
        const newMorphArrays = tmpMorphAttributes[name];
        for (let k = 0; k < itemSize; k++) {
          const getterFunc = getters[k];
          const setterFunc = setters[k];
          newArray[setterFunc](nextIndex, attribute[getterFunc](index));
          if (morphAttr) {
            for (let m = 0, ml = morphAttr.length; m < ml; m++) {
              newMorphArrays[m][setterFunc](nextIndex, morphAttr[m][getterFunc](index));
            }
          }
        }
      }
      hashToIndex[hash] = nextIndex;
      newIndices.push(nextIndex);
      nextIndex++;
    }
  }
  const result = geometry.clone();
  for (const name in geometry.attributes) {
    const tmpAttribute = tmpAttributes[name];
    result.setAttribute(
      name,
      new BufferAttribute(
        tmpAttribute.array.slice(0, nextIndex * tmpAttribute.itemSize),
        tmpAttribute.itemSize,
        tmpAttribute.normalized
      )
    );
    if (!(name in tmpMorphAttributes))
      continue;
    for (let j = 0; j < tmpMorphAttributes[name].length; j++) {
      const tmpMorphAttribute = tmpMorphAttributes[name][j];
      result.morphAttributes[name][j] = new BufferAttribute(
        tmpMorphAttribute.array.slice(0, nextIndex * tmpMorphAttribute.itemSize),
        tmpMorphAttribute.itemSize,
        tmpMorphAttribute.normalized
      );
    }
  }
  result.setIndex(newIndices);
  return result;
}
function toTrianglesDrawMode(geometry, drawMode) {
  if (drawMode === TrianglesDrawMode) {
    console.warn(
      "BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."
    );
    return geometry;
  }
  if (drawMode === TriangleFanDrawMode || drawMode === TriangleStripDrawMode) {
    let index = geometry.getIndex();
    if (index === null) {
      const indices = [];
      const position = geometry.getAttribute("position");
      if (position !== void 0) {
        for (let i = 0; i < position.count; i++) {
          indices.push(i);
        }
        geometry.setIndex(indices);
        index = geometry.getIndex();
      } else {
        console.error(
          "BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."
        );
        return geometry;
      }
    }
    const numberOfTriangles = index.count - 2;
    const newIndices = [];
    if (drawMode === TriangleFanDrawMode) {
      for (let i = 1; i <= numberOfTriangles; i++) {
        newIndices.push(index.getX(0));
        newIndices.push(index.getX(i));
        newIndices.push(index.getX(i + 1));
      }
    } else {
      for (let i = 0; i < numberOfTriangles; i++) {
        if (i % 2 === 0) {
          newIndices.push(index.getX(i));
          newIndices.push(index.getX(i + 1));
          newIndices.push(index.getX(i + 2));
        } else {
          newIndices.push(index.getX(i + 2));
          newIndices.push(index.getX(i + 1));
          newIndices.push(index.getX(i));
        }
      }
    }
    if (newIndices.length / 3 !== numberOfTriangles) {
      console.error(
        "BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."
      );
    }
    const newGeometry = geometry.clone();
    newGeometry.setIndex(newIndices);
    newGeometry.clearGroups();
    return newGeometry;
  } else {
    console.error("BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", drawMode);
    return geometry;
  }
}
function computeMorphedAttributes(object) {
  const _vA = new Vector3();
  const _vB = new Vector3();
  const _vC = new Vector3();
  const _tempA = new Vector3();
  const _tempB = new Vector3();
  const _tempC = new Vector3();
  const _morphA = new Vector3();
  const _morphB = new Vector3();
  const _morphC = new Vector3();
  function _calculateMorphedAttributeData(object2, attribute, morphAttribute, morphTargetsRelative2, a2, b2, c2, modifiedAttributeArray) {
    _vA.fromBufferAttribute(attribute, a2);
    _vB.fromBufferAttribute(attribute, b2);
    _vC.fromBufferAttribute(attribute, c2);
    const morphInfluences = object2.morphTargetInfluences;
    if (morphAttribute && morphInfluences) {
      _morphA.set(0, 0, 0);
      _morphB.set(0, 0, 0);
      _morphC.set(0, 0, 0);
      for (let i2 = 0, il2 = morphAttribute.length; i2 < il2; i2++) {
        const influence = morphInfluences[i2];
        const morph = morphAttribute[i2];
        if (influence === 0)
          continue;
        _tempA.fromBufferAttribute(morph, a2);
        _tempB.fromBufferAttribute(morph, b2);
        _tempC.fromBufferAttribute(morph, c2);
        if (morphTargetsRelative2) {
          _morphA.addScaledVector(_tempA, influence);
          _morphB.addScaledVector(_tempB, influence);
          _morphC.addScaledVector(_tempC, influence);
        } else {
          _morphA.addScaledVector(_tempA.sub(_vA), influence);
          _morphB.addScaledVector(_tempB.sub(_vB), influence);
          _morphC.addScaledVector(_tempC.sub(_vC), influence);
        }
      }
      _vA.add(_morphA);
      _vB.add(_morphB);
      _vC.add(_morphC);
    }
    if (object2.isSkinnedMesh) {
      object2.applyBoneTransform(a2, _vA);
      object2.applyBoneTransform(b2, _vB);
      object2.applyBoneTransform(c2, _vC);
    }
    modifiedAttributeArray[a2 * 3 + 0] = _vA.x;
    modifiedAttributeArray[a2 * 3 + 1] = _vA.y;
    modifiedAttributeArray[a2 * 3 + 2] = _vA.z;
    modifiedAttributeArray[b2 * 3 + 0] = _vB.x;
    modifiedAttributeArray[b2 * 3 + 1] = _vB.y;
    modifiedAttributeArray[b2 * 3 + 2] = _vB.z;
    modifiedAttributeArray[c2 * 3 + 0] = _vC.x;
    modifiedAttributeArray[c2 * 3 + 1] = _vC.y;
    modifiedAttributeArray[c2 * 3 + 2] = _vC.z;
  }
  const geometry = object.geometry;
  const material = object.material;
  let a;
  let b;
  let c;
  const index = geometry.index;
  const positionAttribute = geometry.attributes.position;
  const morphPosition = geometry.morphAttributes.position;
  const morphTargetsRelative = geometry.morphTargetsRelative;
  const normalAttribute = geometry.attributes.normal;
  const morphNormal = geometry.morphAttributes.position;
  const groups = geometry.groups;
  const drawRange = geometry.drawRange;
  let i;
  let j;
  let il;
  let jl;
  let group;
  let start;
  let end;
  const modifiedPosition = new Float32Array(positionAttribute.count * positionAttribute.itemSize);
  const modifiedNormal = new Float32Array(normalAttribute.count * normalAttribute.itemSize);
  if (index !== null) {
    if (Array.isArray(material)) {
      for (i = 0, il = groups.length; i < il; i++) {
        group = groups[i];
        start = Math.max(group.start, drawRange.start);
        end = Math.min(group.start + group.count, drawRange.start + drawRange.count);
        for (j = start, jl = end; j < jl; j += 3) {
          a = index.getX(j);
          b = index.getX(j + 1);
          c = index.getX(j + 2);
          _calculateMorphedAttributeData(
            object,
            positionAttribute,
            morphPosition,
            morphTargetsRelative,
            a,
            b,
            c,
            modifiedPosition
          );
          _calculateMorphedAttributeData(
            object,
            normalAttribute,
            morphNormal,
            morphTargetsRelative,
            a,
            b,
            c,
            modifiedNormal
          );
        }
      }
    } else {
      start = Math.max(0, drawRange.start);
      end = Math.min(index.count, drawRange.start + drawRange.count);
      for (i = start, il = end; i < il; i += 3) {
        a = index.getX(i);
        b = index.getX(i + 1);
        c = index.getX(i + 2);
        _calculateMorphedAttributeData(
          object,
          positionAttribute,
          morphPosition,
          morphTargetsRelative,
          a,
          b,
          c,
          modifiedPosition
        );
        _calculateMorphedAttributeData(
          object,
          normalAttribute,
          morphNormal,
          morphTargetsRelative,
          a,
          b,
          c,
          modifiedNormal
        );
      }
    }
  } else {
    if (Array.isArray(material)) {
      for (i = 0, il = groups.length; i < il; i++) {
        group = groups[i];
        start = Math.max(group.start, drawRange.start);
        end = Math.min(group.start + group.count, drawRange.start + drawRange.count);
        for (j = start, jl = end; j < jl; j += 3) {
          a = j;
          b = j + 1;
          c = j + 2;
          _calculateMorphedAttributeData(
            object,
            positionAttribute,
            morphPosition,
            morphTargetsRelative,
            a,
            b,
            c,
            modifiedPosition
          );
          _calculateMorphedAttributeData(
            object,
            normalAttribute,
            morphNormal,
            morphTargetsRelative,
            a,
            b,
            c,
            modifiedNormal
          );
        }
      }
    } else {
      start = Math.max(0, drawRange.start);
      end = Math.min(positionAttribute.count, drawRange.start + drawRange.count);
      for (i = start, il = end; i < il; i += 3) {
        a = i;
        b = i + 1;
        c = i + 2;
        _calculateMorphedAttributeData(
          object,
          positionAttribute,
          morphPosition,
          morphTargetsRelative,
          a,
          b,
          c,
          modifiedPosition
        );
        _calculateMorphedAttributeData(
          object,
          normalAttribute,
          morphNormal,
          morphTargetsRelative,
          a,
          b,
          c,
          modifiedNormal
        );
      }
    }
  }
  const morphedPositionAttribute = new Float32BufferAttribute(modifiedPosition, 3);
  const morphedNormalAttribute = new Float32BufferAttribute(modifiedNormal, 3);
  return {
    positionAttribute,
    normalAttribute,
    morphedPositionAttribute,
    morphedNormalAttribute
  };
}
function mergeGroups(geometry) {
  if (geometry.groups.length === 0) {
    console.warn("BufferGeometryUtils.mergeGroups(): No groups are defined. Nothing to merge.");
    return geometry;
  }
  let groups = geometry.groups;
  groups = groups.sort((a, b) => {
    if (a.materialIndex !== b.materialIndex)
      return a.materialIndex - b.materialIndex;
    return a.start - b.start;
  });
  if (geometry.getIndex() === null) {
    const positionAttribute = geometry.getAttribute("position");
    const indices = [];
    for (let i = 0; i < positionAttribute.count; i += 3) {
      indices.push(i, i + 1, i + 2);
    }
    geometry.setIndex(indices);
  }
  const index = geometry.getIndex();
  const newIndices = [];
  for (const group of groups) {
    const groupStart = group.start;
    const groupLength = groupStart + group.count;
    for (let j = groupStart; j < groupLength; j++) {
      newIndices.push(index.getX(j));
    }
  }
  geometry.dispose();
  geometry.setIndex(newIndices);
  let start = 0;
  for (const group of groups) {
    group.start = start;
    start += group.count;
  }
  let currentGroup = groups[0];
  geometry.groups = [currentGroup];
  for (let i = 1; i < groups.length; i++) {
    const group = groups[i];
    if (currentGroup.materialIndex === group.materialIndex) {
      currentGroup.count += group.count;
    } else {
      currentGroup = group;
      geometry.groups.push(currentGroup);
    }
  }
  return geometry;
}
function toCreasedNormals(geometry, creaseAngle = Math.PI / 3) {
  const creaseDot = Math.cos(creaseAngle);
  const hashMultiplier = (1 + 1e-10) * 100;
  const verts = [new Vector3(), new Vector3(), new Vector3()];
  const tempVec1 = new Vector3();
  const tempVec2 = new Vector3();
  const tempNorm = new Vector3();
  const tempNorm2 = new Vector3();
  function hashVertex(v) {
    const x = ~~(v.x * hashMultiplier);
    const y = ~~(v.y * hashMultiplier);
    const z = ~~(v.z * hashMultiplier);
    return `${x},${y},${z}`;
  }
  const resultGeometry = geometry.index ? geometry.toNonIndexed() : geometry;
  const posAttr = resultGeometry.attributes.position;
  const vertexMap = {};
  for (let i = 0, l = posAttr.count / 3; i < l; i++) {
    const i3 = 3 * i;
    const a = verts[0].fromBufferAttribute(posAttr, i3 + 0);
    const b = verts[1].fromBufferAttribute(posAttr, i3 + 1);
    const c = verts[2].fromBufferAttribute(posAttr, i3 + 2);
    tempVec1.subVectors(c, b);
    tempVec2.subVectors(a, b);
    const normal = new Vector3().crossVectors(tempVec1, tempVec2).normalize();
    for (let n = 0; n < 3; n++) {
      const vert = verts[n];
      const hash = hashVertex(vert);
      if (!(hash in vertexMap)) {
        vertexMap[hash] = [];
      }
      vertexMap[hash].push(normal);
    }
  }
  const normalArray = new Float32Array(posAttr.count * 3);
  const normAttr = new BufferAttribute(normalArray, 3, false);
  for (let i = 0, l = posAttr.count / 3; i < l; i++) {
    const i3 = 3 * i;
    const a = verts[0].fromBufferAttribute(posAttr, i3 + 0);
    const b = verts[1].fromBufferAttribute(posAttr, i3 + 1);
    const c = verts[2].fromBufferAttribute(posAttr, i3 + 2);
    tempVec1.subVectors(c, b);
    tempVec2.subVectors(a, b);
    tempNorm.crossVectors(tempVec1, tempVec2).normalize();
    for (let n = 0; n < 3; n++) {
      const vert = verts[n];
      const hash = hashVertex(vert);
      const otherNormals = vertexMap[hash];
      tempNorm2.set(0, 0, 0);
      for (let k = 0, lk = otherNormals.length; k < lk; k++) {
        const otherNorm = otherNormals[k];
        if (tempNorm.dot(otherNorm) > creaseDot) {
          tempNorm2.add(otherNorm);
        }
      }
      tempNorm2.normalize();
      normAttr.setXYZ(i3 + n, tempNorm2.x, tempNorm2.y, tempNorm2.z);
    }
  }
  resultGeometry.setAttribute("normal", normAttr);
  return resultGeometry;
}

class InstancedBufferGeometry extends BufferGeometry {
  constructor() {
    super();
    this.isInstancedBufferGeometry = true;
    this.type = "InstancedBufferGeometry";
    this.instanceCount = Infinity;
  }
  copy(source) {
    super.copy(source);
    this.instanceCount = source.instanceCount;
    return this;
  }
  toJSON() {
    const data = super.toJSON();
    data.instanceCount = this.instanceCount;
    data.isInstancedBufferGeometry = true;
    return data;
  }
}

class InstancedInterleavedBuffer extends InterleavedBuffer {
  constructor(array, stride, meshPerAttribute = 1) {
    super(array, stride);
    this.isInstancedInterleavedBuffer = true;
    this.meshPerAttribute = meshPerAttribute;
  }
  copy(source) {
    super.copy(source);
    this.meshPerAttribute = source.meshPerAttribute;
    return this;
  }
  clone(data) {
    const ib = super.clone(data);
    ib.meshPerAttribute = this.meshPerAttribute;
    return ib;
  }
  toJSON(data) {
    const json = super.toJSON(data);
    json.isInstancedInterleavedBuffer = true;
    json.meshPerAttribute = this.meshPerAttribute;
    return json;
  }
}

export { BufferAttribute, BufferGeometry, Float16BufferAttribute, Float32BufferAttribute, Float64BufferAttribute, InstancedBufferAttribute, InstancedBufferGeometry, InstancedInterleavedBuffer, Int16BufferAttribute, Int32BufferAttribute, Int8BufferAttribute, InterleavedBuffer, InterleavedBufferAttribute, Uint16BufferAttribute, Uint32BufferAttribute, Uint8BufferAttribute, Uint8ClampedBufferAttribute, computeMorphedAttributes, deepCloneAttribute, deinterleaveAttribute, deinterleaveGeometry, estimateBytesUsed, fromHalfFloat, interleaveAttributes, mergeAttributes, mergeGeometries, mergeGroups, mergeVertices, toCreasedNormals, toHalfFloat, toTrianglesDrawMode };
