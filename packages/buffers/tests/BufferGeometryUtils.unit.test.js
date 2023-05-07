import { beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

// import { Vector3 } from '@renderlayer/math';
// import { BufferAttribute, Float32BufferAttribute } from '../src/BufferAttribute.js';
// import { BufferGeometry } from '../src/BufferGeometry.js';
// import { InstancedBufferAttribute } from '../src/InstancedBufferAttribute.js';
// import { InterleavedBuffer } from '../src/InterleavedBuffer.js';
// import { InterleavedBufferAttribute } from '../src/InterleavedBufferAttribute.js';

// import {
//   TriangleFanDrawMode,
//   TriangleStripDrawMode,
//   TrianglesDrawMode,
// } from '@renderlayer/shared';

import {
  deepCloneAttribute,
  deinterleaveAttribute,
  deinterleaveGeometry,
  mergeGeometries,
  mergeAttributes,
  interleaveAttributes,
  estimateBytesUsed,
  mergeVertices,
  toTrianglesDrawMode,
  computeMorphedAttributes,
  mergeGroups,
  toCreasedNormals,
} from '../src/BufferGeometryUtils.js';

// vi.mock('@renderlayer/math');
// vi.mock('./BufferAttribute.js');
// vi.mock('./BufferGeometry.js');
// vi.mock('./InstancedBufferAttribute.js');
// vi.mock('./InterleavedBuffer.js');
// vi.mock('./InterleavedBufferAttribute.js');
// vi.mock('@renderlayer/shared');

describe('deepCloneAttribute', () => {
  it('should expose a function', () => {
    expect(deepCloneAttribute).toBeDefined();
  });

  // it('deepCloneAttribute should return expected output', () => {
  //   // const retValue = deepCloneAttribute(attribute);
  //   expect(false).toBeTruthy();
  // });
});

describe('deinterleaveAttribute', () => {
  it('should expose a function', () => {
    expect(deinterleaveAttribute).toBeDefined();
  });

  // it('deinterleaveAttribute should return expected output', () => {
  //   // const retValue = deinterleaveAttribute(attribute);
  //   expect(false).toBeTruthy();
  // });
});

describe('deinterleaveGeometry', () => {
  it('should expose a function', () => {
    expect(deinterleaveGeometry).toBeDefined();
  });

  // it('deinterleaveGeometry should return expected output', () => {
  //   // const retValue = deinterleaveGeometry(geometry);
  //   expect(false).toBeTruthy();
  // });
});

describe('mergeGeometries', () => {
  it('should expose a function', () => {
    expect(mergeGeometries).toBeDefined();
  });

  // it('mergeGeometries should return expected output', () => {
  //   // const retValue = mergeGeometries(geometries,useGroups);
  //   expect(false).toBeTruthy();
  // });
});

describe('mergeAttributes', () => {
  it('should expose a function', () => {
    expect(mergeAttributes).toBeDefined();
  });

  // it('mergeAttributes should return expected output', () => {
  //   // const retValue = mergeAttributes(attributes);
  //   expect(false).toBeTruthy();
  // });
});

describe('interleaveAttributes', () => {
  it('should expose a function', () => {
    expect(interleaveAttributes).toBeDefined();
  });

  // it('interleaveAttributes should return expected output', () => {
  //   // const retValue = interleaveAttributes(attributes);
  //   expect(false).toBeTruthy();
  // });
});

describe('estimateBytesUsed', () => {
  it('should expose a function', () => {
    expect(estimateBytesUsed).toBeDefined();
  });

  // it('estimateBytesUsed should return expected output', () => {
  //   // const retValue = estimateBytesUsed(geometry);
  //   expect(false).toBeTruthy();
  // });
});

describe('mergeVertices', () => {
  it('should expose a function', () => {
    expect(mergeVertices).toBeDefined();
  });

  // it('mergeVertices should return expected output', () => {
  //   // const retValue = mergeVertices(geometry,tolerance);
  //   expect(false).toBeTruthy();
  // });
});

describe('toTrianglesDrawMode', () => {
  it('should expose a function', () => {
    expect(toTrianglesDrawMode).toBeDefined();
  });

  // it('toTrianglesDrawMode should return expected output', () => {
  //   // const retValue = toTrianglesDrawMode(geometry,drawMode);
  //   expect(false).toBeTruthy();
  // });
});

describe('computeMorphedAttributes', () => {
  it('should expose a function', () => {
    expect(computeMorphedAttributes).toBeDefined();
  });

  // it('computeMorphedAttributes should return expected output', () => {
  //   // const retValue = computeMorphedAttributes(object);
  //   expect(false).toBeTruthy();
  // });
});

describe('mergeGroups', () => {
  it('should expose a function', () => {
    expect(mergeGroups).toBeDefined();
  });

  // it('mergeGroups should return expected output', () => {
  //   // const retValue = mergeGroups(geometry);
  //   expect(false).toBeTruthy();
  // });
});

describe('toCreasedNormals', () => {
  it('should expose a function', () => {
    expect(toCreasedNormals).toBeDefined();
  });

  // it('toCreasedNormals should return expected output', () => {
  //   // const retValue = toCreasedNormals(geometry,creaseAngle);
  //   expect(false).toBeTruthy();
  // });
});
