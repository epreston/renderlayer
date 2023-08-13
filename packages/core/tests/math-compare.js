import { eps } from './math-constants.js';

export const matrixEquals4 = (a, b) => {
  for (let i = 0; i < 16; i++) {
    if (Math.abs(a.elements[i] - b.elements[i]) >= eps) {
      return false;
    }
  }

  return true;
};

export const eulerEquals = function (a, b, tolerance = 0.0001) {
  if (a.order != b.order) {
    return false;
  }

  // prettier-ignore
  return Math.abs(a.x - b.x) <= tolerance &&
    Math.abs(a.y - b.y) <= tolerance &&
    Math.abs(a.z - b.z) <= tolerance;
};
