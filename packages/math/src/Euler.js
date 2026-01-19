import { Quaternion } from './Quaternion.js';
import { Matrix4 } from './Matrix4.js';
import { clamp } from './MathUtils.js';

class Euler {
  static DEFAULT_ORDER = 'XYZ';

  #onChangeCallback = () => {};

  #x = 0;
  #y = 0;
  #z = 0;
  #order = Euler.DEFAULT_ORDER;

  constructor(x = 0, y = 0, z = 0, order = Euler.DEFAULT_ORDER) {
    this.#x = x;
    this.#y = y;
    this.#z = z;
    this.#order = order;
  }

  get isEuler() {
    return true;
  }

  get x() {
    return this.#x;
  }

  set x(value) {
    this.#x = value;
    this.#onChangeCallback();
  }

  get y() {
    return this.#y;
  }

  set y(value) {
    this.#y = value;
    this.#onChangeCallback();
  }

  get z() {
    return this.#z;
  }

  set z(value) {
    this.#z = value;
    this.#onChangeCallback();
  }

  get order() {
    return this.#order;
  }

  set order(value) {
    this.#order = value;
    this.#onChangeCallback();
  }

  set(x, y, z, order = this.order) {
    this.#x = x;
    this.#y = y;
    this.#z = z;
    this.#order = order;

    this.#onChangeCallback();

    return this;
  }

  /** @returns {this} */
  clone() {
    // @ts-ignore
    return new this.constructor(this.#x, this.#y, this.#z, this.#order);
  }

  copy(euler, update = true) {
    this.#x = euler.x;
    this.#y = euler.y;
    this.#z = euler.z;
    this.#order = euler.order;

    // update check required to optimize Object3D.copy()
    if (update === true) this.#onChangeCallback();

    return this;
  }

  setFromRotationMatrix(matrix, order = this.order, update = true) {
    // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

    // num + 0 is the most performant way to remove -0 when a potentially zero
    // matrix component is set directly as the value. This avoids confusion with
    // real underflows.
    //
    // -0+0 is positive zero. 0+0 is positive zero. negative numbers stay negative,
    // positive numbers stay positive.

    const te = matrix.elements;
    const m11 = te[0];
    const m12 = te[4];
    const m13 = te[8];
    const m21 = te[1];
    const m22 = te[5];
    const m23 = te[9];
    const m31 = te[2];
    const m32 = te[6];
    const m33 = te[10];

    switch (order) {
      case 'XYZ':
        this.#y = Math.asin(clamp(m13, -1, 1));

        if (Math.abs(m13) < 0.9999999) {
          this.#x = Math.atan2(-m23, m33) + 0;
          this.#z = Math.atan2(-m12, m11) + 0;
        } else {
          this.#x = Math.atan2(m32, m22);
          this.#z = 0;
        }

        break;

      case 'YXZ':
        this.#x = Math.asin(-clamp(m23, -1, 1));

        if (Math.abs(m23) < 0.9999999) {
          this.#y = Math.atan2(m13, m33);
          this.#z = Math.atan2(m21, m22);
        } else {
          this.#y = Math.atan2(-m31, m11) + 0;
          this.#z = 0;
        }

        break;

      case 'ZXY':
        this.#x = Math.asin(clamp(m32, -1, 1));

        if (Math.abs(m32) < 0.9999999) {
          this.#y = Math.atan2(-m31, m33) + 0;
          this.#z = Math.atan2(-m12, m22) + 0;
        } else {
          this.#y = 0;
          this.#z = Math.atan2(m21, m11);
        }

        break;

      case 'ZYX':
        this.#y = Math.asin(-clamp(m31, -1, 1));

        if (Math.abs(m31) < 0.9999999) {
          this.#x = Math.atan2(m32, m33);
          this.#z = Math.atan2(m21, m11);
        } else {
          this.#x = 0;
          this.#z = Math.atan2(-m12, m22) + 0;
        }

        break;

      case 'YZX':
        this.#z = Math.asin(clamp(m21, -1, 1));

        if (Math.abs(m21) < 0.9999999) {
          this.#x = Math.atan2(-m23, m22) + 0;
          this.#y = Math.atan2(-m31, m11) + 0;
        } else {
          this.#x = 0;
          this.#y = Math.atan2(m13, m33);
        }

        break;

      case 'XZY':
        this.#z = Math.asin(-clamp(m12, -1, 1));

        if (Math.abs(m12) < 0.9999999) {
          this.#x = Math.atan2(m32, m22);
          this.#y = Math.atan2(m13, m11);
        } else {
          this.#x = Math.atan2(-m23, m33) + 0;
          this.#y = 0;
        }

        break;

      default:
        console.warn(`Euler: .setFromRotationMatrix() encountered an unknown order: ${order}`);
    }

    this.#order = order;

    if (update === true) this.#onChangeCallback();

    return this;
  }

  setFromQuaternion(quaternion, order, update) {
    _matrix.makeRotationFromQuaternion(quaternion);

    return this.setFromRotationMatrix(_matrix, order, update);
  }

  setFromVector3(vector, order = this.order) {
    return this.set(vector.x, vector.y, vector.z, order);
  }

  reorder(newOrder) {
    // WARNING: this discards revolution information

    _quaternion.setFromEuler(this);

    return this.setFromQuaternion(_quaternion, newOrder);
  }

  equals(euler) {
    // prettier-ignore
    return euler.x === this.#x &&
      euler.y === this.#y &&
      euler.z === this.#z &&
      euler.order === this.#order;
  }

  fromArray(array) {
    this.#x = array[0];
    this.#y = array[1];
    this.#z = array[2];
    if (array[3] !== undefined) this.#order = array[3];

    this.#onChangeCallback();

    return this;
  }

  toArray(array = [], offset = 0) {
    array[offset] = this.#x;
    array[offset + 1] = this.#y;
    array[offset + 2] = this.#z;
    array[offset + 3] = this.#order;

    return array;
  }

  _onChange(callback) {
    this.#onChangeCallback = callback;

    return this;
  }

  *[Symbol.iterator]() {
    yield this.#x;
    yield this.#y;
    yield this.#z;
    yield this.#order;
  }
}

const _matrix = /*@__PURE__*/ new Matrix4();
const _quaternion = /*@__PURE__*/ new Quaternion();

export { Euler };
