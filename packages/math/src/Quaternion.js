import { clamp as clampToRange } from './MathUtils.js';

class Quaternion {
  #onChangeCallback = () => {};

  #x = 0;
  #y = 0;
  #z = 0;
  #w = 1;

  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.#x = x;
    this.#y = y;
    this.#z = z;
    this.#w = w;
  }

  get isQuaternion() {
    return true;
  }

  static slerpFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
    // fuzz-free, array-based Quaternion SLERP operation

    let x0 = src0[srcOffset0 + 0];

    let y0 = src0[srcOffset0 + 1];
    let z0 = src0[srcOffset0 + 2];
    let w0 = src0[srcOffset0 + 3];
    const x1 = src1[srcOffset1 + 0];
    const y1 = src1[srcOffset1 + 1];
    const z1 = src1[srcOffset1 + 2];
    const w1 = src1[srcOffset1 + 3];

    if (t === 0) {
      dst[dstOffset + 0] = x0;
      dst[dstOffset + 1] = y0;
      dst[dstOffset + 2] = z0;
      dst[dstOffset + 3] = w0;
      return;
    }

    if (t === 1) {
      dst[dstOffset + 0] = x1;
      dst[dstOffset + 1] = y1;
      dst[dstOffset + 2] = z1;
      dst[dstOffset + 3] = w1;
      return;
    }

    if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
      let s = 1 - t;

      const cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1;
      const dir = cos >= 0 ? 1 : -1;
      const sqrSin = 1 - cos * cos;

      // Skip the Slerp for tiny steps to avoid numeric problems:
      if (sqrSin > Number.EPSILON) {
        const sin = Math.sqrt(sqrSin);
        const len = Math.atan2(sin, cos * dir);

        s = Math.sin(s * len) / sin;
        t = Math.sin(t * len) / sin;
      }

      const tDir = t * dir;

      x0 = x0 * s + x1 * tDir;
      y0 = y0 * s + y1 * tDir;
      z0 = z0 * s + z1 * tDir;
      w0 = w0 * s + w1 * tDir;

      // Normalize in case we just did a lerp:
      if (s === 1 - t) {
        const f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);

        x0 *= f;
        y0 *= f;
        z0 *= f;
        w0 *= f;
      }
    }

    dst[dstOffset] = x0;
    dst[dstOffset + 1] = y0;
    dst[dstOffset + 2] = z0;
    dst[dstOffset + 3] = w0;
  }

  static multiplyQuaternionsFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1) {
    const x0 = src0[srcOffset0];
    const y0 = src0[srcOffset0 + 1];
    const z0 = src0[srcOffset0 + 2];
    const w0 = src0[srcOffset0 + 3];

    const x1 = src1[srcOffset1];
    const y1 = src1[srcOffset1 + 1];
    const z1 = src1[srcOffset1 + 2];
    const w1 = src1[srcOffset1 + 3];

    dst[dstOffset] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
    dst[dstOffset + 1] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
    dst[dstOffset + 2] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
    dst[dstOffset + 3] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;

    return dst;
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

  get w() {
    return this.#w;
  }

  set w(value) {
    this.#w = value;
    this.#onChangeCallback();
  }

  set(x, y, z, w) {
    this.#x = x;
    this.#y = y;
    this.#z = z;
    this.#w = w;

    this.#onChangeCallback();

    return this;
  }

  /** @returns {this} */
  clone() {
    // @ts-ignore
    return new this.constructor(this.#x, this.#y, this.#z, this.#w);
  }

  copy(quaternion, update = true) {
    this.#x = quaternion.x;
    this.#y = quaternion.y;
    this.#z = quaternion.z;
    this.#w = quaternion.w;

    // update check required to optimize Object3D.copy()
    if (update === true) this.#onChangeCallback();

    return this;
  }

  setFromEuler(euler, update) {
    const x = euler.x;
    const y = euler.y;
    const z = euler.z;
    const order = euler.order;

    // http://www.mathworks.com/matlabcentral/fileexchange/
    // 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
    //	content/SpinCalc.m

    const cos = Math.cos;
    const sin = Math.sin;

    const c1 = cos(x / 2);
    const c2 = cos(y / 2);
    const c3 = cos(z / 2);

    const s1 = sin(x / 2);
    const s2 = sin(y / 2);
    const s3 = sin(z / 2);

    switch (order) {
      case 'XYZ':
        this.#x = s1 * c2 * c3 + c1 * s2 * s3;
        this.#y = c1 * s2 * c3 - s1 * c2 * s3;
        this.#z = c1 * c2 * s3 + s1 * s2 * c3;
        this.#w = c1 * c2 * c3 - s1 * s2 * s3;
        break;

      case 'YXZ':
        this.#x = s1 * c2 * c3 + c1 * s2 * s3;
        this.#y = c1 * s2 * c3 - s1 * c2 * s3;
        this.#z = c1 * c2 * s3 - s1 * s2 * c3;
        this.#w = c1 * c2 * c3 + s1 * s2 * s3;
        break;

      case 'ZXY':
        this.#x = s1 * c2 * c3 - c1 * s2 * s3;
        this.#y = c1 * s2 * c3 + s1 * c2 * s3;
        this.#z = c1 * c2 * s3 + s1 * s2 * c3;
        this.#w = c1 * c2 * c3 - s1 * s2 * s3;
        break;

      case 'ZYX':
        this.#x = s1 * c2 * c3 - c1 * s2 * s3;
        this.#y = c1 * s2 * c3 + s1 * c2 * s3;
        this.#z = c1 * c2 * s3 - s1 * s2 * c3;
        this.#w = c1 * c2 * c3 + s1 * s2 * s3;
        break;

      case 'YZX':
        this.#x = s1 * c2 * c3 + c1 * s2 * s3;
        this.#y = c1 * s2 * c3 + s1 * c2 * s3;
        this.#z = c1 * c2 * s3 - s1 * s2 * c3;
        this.#w = c1 * c2 * c3 - s1 * s2 * s3;
        break;

      case 'XZY':
        this.#x = s1 * c2 * c3 - c1 * s2 * s3;
        this.#y = c1 * s2 * c3 - s1 * c2 * s3;
        this.#z = c1 * c2 * s3 + s1 * s2 * c3;
        this.#w = c1 * c2 * c3 + s1 * s2 * s3;
        break;

      default:
        console.warn(`Quaternion: .setFromEuler() encountered an unknown order: ${order}`);
    }

    if (update !== false) this.#onChangeCallback();

    return this;
  }

  setFromAxisAngle(axis, angle) {
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

    // assumes axis is normalized

    const halfAngle = angle / 2;
    const s = Math.sin(halfAngle);

    this.#x = axis.x * s;
    this.#y = axis.y * s;
    this.#z = axis.z * s;
    this.#w = Math.cos(halfAngle);

    this.#onChangeCallback();

    return this;
  }

  setFromRotationMatrix(matrix) {
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

    // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

    // prettier-ignore
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
    const trace = m11 + m22 + m33;

    if (trace > 0) {
      const s = 0.5 / Math.sqrt(trace + 1.0);

      this.#w = 0.25 / s;
      this.#x = (m32 - m23) * s;
      this.#y = (m13 - m31) * s;
      this.#z = (m21 - m12) * s;
    } else if (m11 > m22 && m11 > m33) {
      const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

      this.#w = (m32 - m23) / s;
      this.#x = 0.25 * s;
      this.#y = (m12 + m21) / s;
      this.#z = (m13 + m31) / s;
    } else if (m22 > m33) {
      const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

      this.#w = (m13 - m31) / s;
      this.#x = (m12 + m21) / s;
      this.#y = 0.25 * s;
      this.#z = (m23 + m32) / s;
    } else {
      const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

      this.#w = (m21 - m12) / s;
      this.#x = (m13 + m31) / s;
      this.#y = (m23 + m32) / s;
      this.#z = 0.25 * s;
    }

    this.#onChangeCallback();

    return this;
  }

  setFromUnitVectors(vFrom, vTo) {
    // assumes direction vectors vFrom and vTo are normalized
    let r = vFrom.dot(vTo) + 1;

    if (r < Number.EPSILON) {
      // vFrom and vTo point in opposite directions

      r = 0;

      if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
        this.#x = -vFrom.y;
        this.#y = vFrom.x;
        this.#z = 0;
        this.#w = r;
      } else {
        this.#x = 0;
        this.#y = -vFrom.z;
        this.#z = vFrom.y;
        this.#w = r;
      }
    } else {
      // crossVectors( vFrom, vTo ); // inlined to avoid cyclic dependency on Vector3

      this.#x = vFrom.y * vTo.z - vFrom.z * vTo.y;
      this.#y = vFrom.z * vTo.x - vFrom.x * vTo.z;
      this.#z = vFrom.x * vTo.y - vFrom.y * vTo.x;
      this.#w = r;
    }

    return this.normalize();
  }

  angleTo(quaternion) {
    return 2 * Math.acos(Math.abs(clampToRange(this.dot(quaternion), -1, 1)));
  }

  rotateTowards(quaternion, step) {
    const angle = this.angleTo(quaternion);

    if (angle === 0) return this;

    const t = Math.min(1, step / angle);

    this.slerp(quaternion, t);

    return this;
  }

  identity() {
    return this.set(0, 0, 0, 1);
  }

  invert() {
    // quaternion is assumed to have unit length

    return this.conjugate();
  }

  conjugate() {
    this.#x *= -1;
    this.#y *= -1;
    this.#z *= -1;

    this.#onChangeCallback();

    return this;
  }

  dot(quaternion) {
    return (
      this.#x * quaternion.x +
      this.#y * quaternion.y +
      this.#z * quaternion.z +
      this.#w * quaternion.w
    );
  }

  lengthSq() {
    return this.#x * this.#x + this.#y * this.#y + this.#z * this.#z + this.#w * this.#w;
  }

  length() {
    return Math.sqrt(this.#x * this.#x + this.#y * this.#y + this.#z * this.#z + this.#w * this.#w);
  }

  normalize() {
    let l = this.length();

    if (l === 0) {
      this.#x = 0;
      this.#y = 0;
      this.#z = 0;
      this.#w = 1;
    } else {
      l = 1 / l;

      this.#x = this.#x * l;
      this.#y = this.#y * l;
      this.#z = this.#z * l;
      this.#w = this.#w * l;
    }

    this.#onChangeCallback();

    return this;
  }

  multiply(quaternion) {
    return this.multiplyQuaternions(this, quaternion);
  }

  premultiply(quaternion) {
    return this.multiplyQuaternions(quaternion, this);
  }

  multiplyQuaternions(a, b) {
    // from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

    const qax = a.x;
    const qay = a.y;
    const qaz = a.z;
    const qaw = a.w;
    const qbx = b.x;
    const qby = b.y;
    const qbz = b.z;
    const qbw = b.w;

    this.#x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this.#y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this.#z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this.#w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

    this.#onChangeCallback();

    return this;
  }

  slerp(qb, t) {
    if (t === 0) return this;
    if (t === 1) return this.copy(qb);

    const x = this.#x;
    const y = this.#y;
    const z = this.#z;
    const w = this.#w;

    // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

    let cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;

    if (cosHalfTheta < 0) {
      this.#w = -qb.w;
      this.#x = -qb.x;
      this.#y = -qb.y;
      this.#z = -qb.z;

      cosHalfTheta = -cosHalfTheta;
    } else {
      this.copy(qb);
    }

    if (cosHalfTheta >= 1.0) {
      this.#w = w;
      this.#x = x;
      this.#y = y;
      this.#z = z;

      return this;
    }

    const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

    if (sqrSinHalfTheta <= Number.EPSILON) {
      const s = 1 - t;
      this.#w = s * w + t * this.#w;
      this.#x = s * x + t * this.#x;
      this.#y = s * y + t * this.#y;
      this.#z = s * z + t * this.#z;

      this.normalize();
      this.#onChangeCallback();

      return this;
    }

    const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
    const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    this.#w = w * ratioA + this.#w * ratioB;
    this.#x = x * ratioA + this.#x * ratioB;
    this.#y = y * ratioA + this.#y * ratioB;
    this.#z = z * ratioA + this.#z * ratioB;

    this.#onChangeCallback();

    return this;
  }

  slerpQuaternions(qa, qb, t) {
    return this.copy(qa).slerp(qb, t);
  }

  random() {
    // Derived from http://planning.cs.uiuc.edu/node198.html
    // Note, this source uses w, x, y, z ordering,
    // so we swap the order below.

    const u1 = Math.random();
    const sqrt1u1 = Math.sqrt(1 - u1);
    const sqrtu1 = Math.sqrt(u1);

    const u2 = 2 * Math.PI * Math.random();

    const u3 = 2 * Math.PI * Math.random();

    // prettier-ignore
    return this.set(
			sqrt1u1 * Math.cos( u2 ),
			sqrtu1 * Math.sin( u3 ),
			sqrtu1 * Math.cos( u3 ),
			sqrt1u1 * Math.sin( u2 ),
		);
  }

  equals(quaternion) {
    // prettier-ignore
    return (
      quaternion.x === this.#x &&
      quaternion.y === this.#y &&
      quaternion.z === this.#z &&
      quaternion.w === this.#w
    );
  }

  fromArray(array, offset = 0) {
    this.#x = array[offset];
    this.#y = array[offset + 1];
    this.#z = array[offset + 2];
    this.#w = array[offset + 3];

    this.#onChangeCallback();

    return this;
  }

  toArray(array = [], offset = 0) {
    array[offset] = this.#x;
    array[offset + 1] = this.#y;
    array[offset + 2] = this.#z;
    array[offset + 3] = this.#w;

    return array;
  }

  fromBufferAttribute(attribute, index) {
    this.#x = attribute.getX(index);
    this.#y = attribute.getY(index);
    this.#z = attribute.getZ(index);
    this.#w = attribute.getW(index);

    return this;
  }

  toJSON() {
    return this.toArray();
  }

  _onChange(callback) {
    this.#onChangeCallback = callback;

    return this;
  }

  *[Symbol.iterator]() {
    yield this.#x;
    yield this.#y;
    yield this.#z;
    yield this.#w;
  }
}

export { Quaternion };
