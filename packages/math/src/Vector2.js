import { clamp as clampToRange } from './MathUtils.js';

class Vector2 {
  x = 0;
  y = 0;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  get isVector2() {
    return true;
  }

  get width() {
    return this.x;
  }

  set width(value) {
    this.x = value;
  }

  get height() {
    return this.y;
  }

  set height(value) {
    this.y = value;
  }

  set(x, y) {
    this.x = x;
    this.y = y;

    return this;
  }

  setScalar(scalar) {
    this.x = scalar;
    this.y = scalar;

    return this;
  }

  setX(x) {
    this.x = x;

    return this;
  }

  setY(y) {
    this.y = y;

    return this;
  }

  setComponent(index, value) {
    switch (index) {
      case 0:
        this.x = value;
        break;
      case 1:
        this.y = value;
        break;
      default:
        throw new Error(`index is out of range: ${index}`);
    }

    return this;
  }

  getComponent(index) {
    switch (index) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error(`index is out of range: ${index}`);
    }
  }

  /** @returns {this} */
  clone() {
    // @ts-ignore
    return new this.constructor(this.x, this.y);
  }

  copy(vector) {
    this.x = vector.x;
    this.y = vector.y;

    return this;
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;

    return this;
  }

  addScalar(scalar) {
    this.x += scalar;
    this.y += scalar;

    return this;
  }

  addVectors(a, b) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;

    return this;
  }

  addScaledVector(vector, scalar) {
    this.x += vector.x * scalar;
    this.y += vector.y * scalar;

    return this;
  }

  sub(vector) {
    this.x -= vector.x;
    this.y -= vector.y;

    return this;
  }

  subScalar(scalar) {
    this.x -= scalar;
    this.y -= scalar;

    return this;
  }

  subVectors(a, b) {
    this.x = a.x - b.x;
    this.y = a.y - b.y;

    return this;
  }

  multiply(vector) {
    this.x *= vector.x;
    this.y *= vector.y;

    return this;
  }

  multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;

    return this;
  }

  divide(vector) {
    this.x /= vector.x;
    this.y /= vector.y;

    return this;
  }

  divideScalar(scalar) {
    return this.multiplyScalar(1 / scalar);
  }

  applyMatrix3(matrix) {
    const x = this.x;
    const y = this.y;
    const e = matrix.elements;

    this.x = e[0] * x + e[3] * y + e[6];
    this.y = e[1] * x + e[4] * y + e[7];

    return this;
  }

  min(vector) {
    this.x = Math.min(this.x, vector.x);
    this.y = Math.min(this.y, vector.y);

    return this;
  }

  max(vector) {
    this.x = Math.max(this.x, vector.x);
    this.y = Math.max(this.y, vector.y);

    return this;
  }

  clamp(min, max) {
    // assumes min < max, componentwise

    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));

    return this;
  }

  clampScalar(minVal, maxVal) {
    this.x = Math.max(minVal, Math.min(maxVal, this.x));
    this.y = Math.max(minVal, Math.min(maxVal, this.y));

    return this;
  }

  clampLength(min, max) {
    const length = this.length();

    return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);

    return this;
  }

  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);

    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);

    return this;
  }

  roundToZero() {
    this.x = Math.trunc(this.x);
    this.y = Math.trunc(this.y);

    return this;
  }

  negate() {
    this.x = -this.x;
    this.y = -this.y;

    return this;
  }

  dot(vector) {
    return this.x * vector.x + this.y * vector.y;
  }

  cross(vector) {
    return this.x * vector.y - this.y * vector.x;
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }

  normalize() {
    return this.divideScalar(this.length() || 1);
  }

  angle() {
    // computes the angle in radians with respect to the positive x-axis

    const angle = Math.atan2(-this.y, -this.x) + Math.PI;

    return angle;
  }

  angleTo(vector) {
    const denominator = Math.sqrt(this.lengthSq() * vector.lengthSq());

    if (denominator === 0) return Math.PI / 2;

    const theta = this.dot(vector) / denominator;

    // clamp, to handle numerical problems
    return Math.acos(clampToRange(theta, -1, 1));
  }

  distanceTo(vector) {
    return Math.sqrt(this.distanceToSquared(vector));
  }

  distanceToSquared(vector) {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    return dx * dx + dy * dy;
  }

  manhattanDistanceTo(vector) {
    return Math.abs(this.x - vector.x) + Math.abs(this.y - vector.y);
  }

  setLength(length) {
    return this.normalize().multiplyScalar(length);
  }

  lerp(vector, alpha) {
    this.x += (vector.x - this.x) * alpha;
    this.y += (vector.y - this.y) * alpha;

    return this;
  }

  lerpVectors(v1, v2, alpha) {
    this.x = v1.x + (v2.x - v1.x) * alpha;
    this.y = v1.y + (v2.y - v1.y) * alpha;

    return this;
  }

  equals(vector) {
    return vector.x === this.x && vector.y === this.y;
  }

  fromArray(array, offset = 0) {
    this.x = array[offset];
    this.y = array[offset + 1];

    return this;
  }

  toArray(array = [], offset = 0) {
    array[offset] = this.x;
    array[offset + 1] = this.y;

    return array;
  }

  fromBufferAttribute(attribute, index) {
    this.x = attribute.getX(index);
    this.y = attribute.getY(index);

    return this;
  }

  rotateAround(center, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);

    const x = this.x - center.x;
    const y = this.y - center.y;

    this.x = x * c - y * s + center.x;
    this.y = x * s + y * c + center.y;

    return this;
  }

  random() {
    this.x = Math.random();
    this.y = Math.random();

    return this;
  }

  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
  }
}

export { Vector2 };
