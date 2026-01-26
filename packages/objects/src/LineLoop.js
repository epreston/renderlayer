import { Line } from './Line.js';

class LineLoop extends Line {
  type = 'LineLoop';

  constructor(geometry, material) {
    super(geometry, material);
  }

  get isLineLoop() {
    return true;
  }
}

export { LineLoop };
