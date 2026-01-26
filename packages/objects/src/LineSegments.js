import { Float32BufferAttribute } from '@renderlayer/buffers';
import { Vector3 } from '@renderlayer/math';
import { Line } from './Line.js';

const _start = /*@__PURE__*/ new Vector3();
const _end = /*@__PURE__*/ new Vector3();

class LineSegments extends Line {
  constructor(geometry, material) {
    super(geometry, material);

    this.type = 'LineSegments';
  }

  get isLineSegments() {
    return true;
  }

  computeLineDistances() {
    const geometry = this.geometry;

    // we assume non-indexed geometry

    if (geometry.index === null) {
      const positionAttribute = geometry.attributes.position;
      const lineDistances = [];

      for (let i = 0, l = positionAttribute.count; i < l; i += 2) {
        _start.fromBufferAttribute(positionAttribute, i);
        _end.fromBufferAttribute(positionAttribute, i + 1);

        lineDistances[i] = i === 0 ? 0 : lineDistances[i - 1];
        lineDistances[i + 1] = lineDistances[i] + _start.distanceTo(_end);
      }

      geometry.setAttribute('lineDistance', new Float32BufferAttribute(lineDistances, 1));
    } else {
      console.warn(
        'LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.'
      );
    }

    return this;
  }
}

export { LineSegments };
