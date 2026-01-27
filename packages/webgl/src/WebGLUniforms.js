/**
 * Uniforms of a program.
 * These form a tree structure with a special top-level container for the root,
 * which you get by calling 'new WebGLUniforms( gl, program )'.
 *
 *
 * Properties of inner nodes including the top-level container:
 *
 * .seq - array of nested uniforms
 * .map - nested uniforms by name
 *
 *
 * Methods of all nodes except the top-level container:
 *
 * .setValue( gl, value, [textures] )
 *
 * 		uploads a uniform value(s)
 *  	the 'textures' parameter is needed for sampler uniforms
 *
 *
 * Static methods of the top-level container (textures factorizations):
 *
 * .upload( gl, seq, values, textures )
 *
 * 		sets uniforms in 'seq' to 'values[id].value'
 *
 * .seqWithValue( seq, values ) : filteredSeq
 *
 * 		filters 'seq' entries with corresponding entry in values
 *
 *
 * Methods of the top-level container (textures factorizations):
 *
 * .setValue( gl, name, value, textures )
 *
 * 		sets uniform with  name 'name' to 'value'
 *
 * .setOptional( gl, obj, prop )
 *
 * 		like .set for an optional property of the object
 *
 */

import { CubeTexture, Data3DTexture, DataArrayTexture, Texture } from '@renderlayer/textures';

// --- Top-level ---

// Root Container
class WebGLUniforms {
  seq = [];
  map = {};

  /** @param {WebGL2RenderingContext} gl */
  constructor(gl, program) {
    const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

    for (let i = 0; i < n; ++i) {
      const info = gl.getActiveUniform(program, i);
      const addr = gl.getUniformLocation(program, info.name);

      _parseUniform(info, addr, this);
    }
  }

  setValue(gl, name, value, textures) {
    const u = this.map[name];
    if (u !== undefined) u.setValue(gl, value, textures);
  }

  setOptional(gl, object, name) {
    const v = object[name];
    if (v !== undefined) this.setValue(gl, name, v);
  }

  static upload(gl, seq, values, textures) {
    for (let i = 0, n = seq.length; i !== n; ++i) {
      const u = seq[i];
      const v = values[u.id];

      if (v.needsUpdate !== false) {
        // note: always updating when .needsUpdate is undefined
        u.setValue(gl, v.value, textures);
      }
    }
  }

  static seqWithValue(seq, values) {
    const r = [];

    for (let i = 0, n = seq.length; i !== n; ++i) {
      const u = seq[i];
      if (u.id in values) r.push(u);
    }

    return r;
  }
}

// --- Uniform Classes ---

class SingleUniform {
  id;
  addr;
  cache = [];
  setValue;

  constructor(id, activeInfo, addr) {
    this.id = id;
    this.addr = addr;
    this.setValue = this.getSingularSetter(activeInfo.type);

    // this.path = activeInfo.name; // DEBUG
  }

  // Single scalar

  setValueV1f(gl, v) {
    const cache = this.cache;

    if (cache[0] === v) return;

    gl.uniform1f(this.addr, v);

    cache[0] = v;
  }

  // Single float vector (from flat array or VectorN)

  setValueV2f(gl, v) {
    const cache = this.cache;

    if (v.x !== undefined) {
      if (cache[0] !== v.x || cache[1] !== v.y) {
        gl.uniform2f(this.addr, v.x, v.y);

        cache[0] = v.x;
        cache[1] = v.y;
      }
    } else {
      if (_arraysEqual(cache, v)) return;

      gl.uniform2fv(this.addr, v);

      _copyArray(cache, v);
    }
  }

  setValueV3f(gl, v) {
    const cache = this.cache;

    if (v.x !== undefined) {
      if (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z) {
        gl.uniform3f(this.addr, v.x, v.y, v.z);

        cache[0] = v.x;
        cache[1] = v.y;
        cache[2] = v.z;
      }
    } else if (v.r !== undefined) {
      if (cache[0] !== v.r || cache[1] !== v.g || cache[2] !== v.b) {
        gl.uniform3f(this.addr, v.r, v.g, v.b);

        cache[0] = v.r;
        cache[1] = v.g;
        cache[2] = v.b;
      }
    } else {
      if (_arraysEqual(cache, v)) return;

      gl.uniform3fv(this.addr, v);

      _copyArray(cache, v);
    }
  }

  setValueV4f(gl, v) {
    const cache = this.cache;

    if (v.x !== undefined) {
      if (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z || cache[3] !== v.w) {
        gl.uniform4f(this.addr, v.x, v.y, v.z, v.w);

        cache[0] = v.x;
        cache[1] = v.y;
        cache[2] = v.z;
        cache[3] = v.w;
      }
    } else {
      if (_arraysEqual(cache, v)) return;

      gl.uniform4fv(this.addr, v);

      _copyArray(cache, v);
    }
  }

  // Single matrix (from flat array or MatrixN)

  setValueM2(gl, v) {
    const cache = this.cache;
    const elements = v.elements;

    if (elements === undefined) {
      if (_arraysEqual(cache, v)) return;

      gl.uniformMatrix2fv(this.addr, false, v);

      _copyArray(cache, v);
    } else {
      if (_arraysEqual(cache, elements)) return;

      _mat2array.set(elements);

      gl.uniformMatrix2fv(this.addr, false, _mat2array);

      _copyArray(cache, elements);
    }
  }

  setValueM3(gl, v) {
    const cache = this.cache;
    const elements = v.elements;

    if (elements === undefined) {
      if (_arraysEqual(cache, v)) return;

      gl.uniformMatrix3fv(this.addr, false, v);

      _copyArray(cache, v);
    } else {
      if (_arraysEqual(cache, elements)) return;

      _mat3array.set(elements);

      gl.uniformMatrix3fv(this.addr, false, _mat3array);

      _copyArray(cache, elements);
    }
  }

  setValueM4(gl, v) {
    const cache = this.cache;
    const elements = v.elements;

    if (elements === undefined) {
      if (_arraysEqual(cache, v)) return;

      gl.uniformMatrix4fv(this.addr, false, v);

      _copyArray(cache, v);
    } else {
      if (_arraysEqual(cache, elements)) return;

      _mat4array.set(elements);

      gl.uniformMatrix4fv(this.addr, false, _mat4array);

      _copyArray(cache, elements);
    }
  }

  // Single integer / boolean

  setValueV1i(gl, v) {
    const cache = this.cache;

    if (cache[0] === v) return;

    gl.uniform1i(this.addr, v);

    cache[0] = v;
  }

  // Single integer / boolean vector (from flat array or VectorN)

  setValueV2i(gl, v) {
    const cache = this.cache;

    if (v.x !== undefined) {
      if (cache[0] !== v.x || cache[1] !== v.y) {
        gl.uniform2i(this.addr, v.x, v.y);

        cache[0] = v.x;
        cache[1] = v.y;
      }
    } else {
      if (_arraysEqual(cache, v)) return;

      gl.uniform2iv(this.addr, v);

      _copyArray(cache, v);
    }
  }

  setValueV3i(gl, v) {
    const cache = this.cache;

    if (v.x !== undefined) {
      if (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z) {
        gl.uniform3i(this.addr, v.x, v.y, v.z);

        cache[0] = v.x;
        cache[1] = v.y;
        cache[2] = v.z;
      }
    } else {
      if (_arraysEqual(cache, v)) return;

      gl.uniform3iv(this.addr, v);

      _copyArray(cache, v);
    }
  }

  setValueV4i(gl, v) {
    const cache = this.cache;

    if (v.x !== undefined) {
      if (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z || cache[3] !== v.w) {
        gl.uniform4i(this.addr, v.x, v.y, v.z, v.w);

        cache[0] = v.x;
        cache[1] = v.y;
        cache[2] = v.z;
        cache[3] = v.w;
      }
    } else {
      if (_arraysEqual(cache, v)) return;

      gl.uniform4iv(this.addr, v);

      _copyArray(cache, v);
    }
  }

  // Single unsigned integer

  setValueV1ui(gl, v) {
    const cache = this.cache;

    if (cache[0] === v) return;

    gl.uniform1ui(this.addr, v);

    cache[0] = v;
  }

  // Single unsigned integer vector (from flat array or VectorN)

  setValueV2ui(gl, v) {
    const cache = this.cache;

    if (v.x !== undefined) {
      if (cache[0] !== v.x || cache[1] !== v.y) {
        gl.uniform2ui(this.addr, v.x, v.y);

        cache[0] = v.x;
        cache[1] = v.y;
      }
    } else {
      if (_arraysEqual(cache, v)) return;

      gl.uniform2uiv(this.addr, v);

      _copyArray(cache, v);
    }
  }

  setValueV3ui(gl, v) {
    const cache = this.cache;

    if (v.x !== undefined) {
      if (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z) {
        gl.uniform3ui(this.addr, v.x, v.y, v.z);

        cache[0] = v.x;
        cache[1] = v.y;
        cache[2] = v.z;
      }
    } else {
      if (_arraysEqual(cache, v)) return;

      gl.uniform3uiv(this.addr, v);

      _copyArray(cache, v);
    }
  }

  setValueV4ui(gl, v) {
    const cache = this.cache;

    if (v.x !== undefined) {
      if (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z || cache[3] !== v.w) {
        gl.uniform4ui(this.addr, v.x, v.y, v.z, v.w);

        cache[0] = v.x;
        cache[1] = v.y;
        cache[2] = v.z;
        cache[3] = v.w;
      }
    } else {
      if (_arraysEqual(cache, v)) return;

      gl.uniform4uiv(this.addr, v);

      _copyArray(cache, v);
    }
  }

  // Single texture (2D / Cube)

  setValueT1(gl, v, textures) {
    const cache = this.cache;
    const unit = textures.allocateTextureUnit();

    if (cache[0] !== unit) {
      gl.uniform1i(this.addr, unit);
      cache[0] = unit;
    }

    textures.setTexture2D(v || _emptyTexture, unit);
  }

  setValueT3D1(gl, v, textures) {
    const cache = this.cache;
    const unit = textures.allocateTextureUnit();

    if (cache[0] !== unit) {
      gl.uniform1i(this.addr, unit);
      cache[0] = unit;
    }

    textures.setTexture3D(v || _empty3dTexture, unit);
  }

  setValueT6(gl, v, textures) {
    const cache = this.cache;
    const unit = textures.allocateTextureUnit();

    if (cache[0] !== unit) {
      gl.uniform1i(this.addr, unit);
      cache[0] = unit;
    }

    textures.setTextureCube(v || _emptyCubeTexture, unit);
  }

  setValueT2DArray1(gl, v, textures) {
    const cache = this.cache;
    const unit = textures.allocateTextureUnit();

    if (cache[0] !== unit) {
      gl.uniform1i(this.addr, unit);
      cache[0] = unit;
    }

    textures.setTexture2DArray(v || _emptyArrayTexture, unit);
  }

  // Helper to pick the right setter for the singular case

  getSingularSetter(type) {
    switch (type) {
      case 0x1406:
        return this.setValueV1f; // FLOAT
      case 0x8b50:
        return this.setValueV2f; // _VEC2
      case 0x8b51:
        return this.setValueV3f; // _VEC3
      case 0x8b52:
        return this.setValueV4f; // _VEC4

      case 0x8b5a:
        return this.setValueM2; // _MAT2
      case 0x8b5b:
        return this.setValueM3; // _MAT3
      case 0x8b5c:
        return this.setValueM4; // _MAT4

      case 0x1404:
      case 0x8b56:
        return this.setValueV1i; // INT, BOOL
      case 0x8b53:
      case 0x8b57:
        return this.setValueV2i; // _VEC2
      case 0x8b54:
      case 0x8b58:
        return this.setValueV3i; // _VEC3
      case 0x8b55:
      case 0x8b59:
        return this.setValueV4i; // _VEC4

      case 0x1405:
        return this.setValueV1ui; // UINT
      case 0x8dc6:
        return this.setValueV2ui; // _VEC2
      case 0x8dc7:
        return this.setValueV3ui; // _VEC3
      case 0x8dc8:
        return this.setValueV4ui; // _VEC4

      case 0x8b5e: // SAMPLER_2D
      case 0x8d66: // SAMPLER_EXTERNAL_OES
      case 0x8dca: // INT_SAMPLER_2D
      case 0x8dd2: // UNSIGNED_INT_SAMPLER_2D
      case 0x8b62: // SAMPLER_2D_SHADOW
        return this.setValueT1;

      case 0x8b5f: // SAMPLER_3D
      case 0x8dcb: // INT_SAMPLER_3D
      case 0x8dd3: // UNSIGNED_INT_SAMPLER_3D
        return this.setValueT3D1;

      case 0x8b60: // SAMPLER_CUBE
      case 0x8dcc: // INT_SAMPLER_CUBE
      case 0x8dd4: // UNSIGNED_INT_SAMPLER_CUBE
      case 0x8dc5: // SAMPLER_CUBE_SHADOW
        return this.setValueT6;

      case 0x8dc1: // SAMPLER_2D_ARRAY
      case 0x8dcf: // INT_SAMPLER_2D_ARRAY
      case 0x8dd7: // UNSIGNED_INT_SAMPLER_2D_ARRAY
      case 0x8dc4: // SAMPLER_2D_ARRAY_SHADOW
        return this.setValueT2DArray1;
    }
  }
}

class PureArrayUniform {
  id;
  addr;
  cache = [];
  size;
  setValue;

  constructor(id, activeInfo, addr) {
    this.id = id;
    this.addr = addr;
    this.size = activeInfo.size;
    this.setValue = this.getPureArraySetter(activeInfo.type);

    // this.path = activeInfo.name; // DEBUG
  }

  // Array of scalars

  setValueV1fArray(gl, v) {
    gl.uniform1fv(this.addr, v);
  }

  // Array of vectors (from flat array or array of VectorN)

  setValueV2fArray(gl, v) {
    const data = _flatten(v, this.size, 2);
    gl.uniform2fv(this.addr, data);
  }

  setValueV3fArray(gl, v) {
    const data = _flatten(v, this.size, 3);
    gl.uniform3fv(this.addr, data);
  }

  setValueV4fArray(gl, v) {
    const data = _flatten(v, this.size, 4);
    gl.uniform4fv(this.addr, data);
  }

  // Array of matrices (from flat array or array of MatrixN)

  setValueM2Array(gl, v) {
    const data = _flatten(v, this.size, 4);
    gl.uniformMatrix2fv(this.addr, false, data);
  }

  setValueM3Array(gl, v) {
    const data = _flatten(v, this.size, 9);
    gl.uniformMatrix3fv(this.addr, false, data);
  }

  setValueM4Array(gl, v) {
    const data = _flatten(v, this.size, 16);
    gl.uniformMatrix4fv(this.addr, false, data);
  }

  // Array of integer / boolean

  setValueV1iArray(gl, v) {
    gl.uniform1iv(this.addr, v);
  }

  // Array of integer / boolean vectors (from flat array)

  setValueV2iArray(gl, v) {
    gl.uniform2iv(this.addr, v);
  }

  setValueV3iArray(gl, v) {
    gl.uniform3iv(this.addr, v);
  }

  setValueV4iArray(gl, v) {
    gl.uniform4iv(this.addr, v);
  }

  // Array of unsigned integer

  setValueV1uiArray(gl, v) {
    gl.uniform1uiv(this.addr, v);
  }

  // Array of unsigned integer vectors (from flat array)

  setValueV2uiArray(gl, v) {
    gl.uniform2uiv(this.addr, v);
  }

  setValueV3uiArray(gl, v) {
    gl.uniform3uiv(this.addr, v);
  }

  setValueV4uiArray(gl, v) {
    gl.uniform4uiv(this.addr, v);
  }

  // Array of textures (2D / 3D / Cube / 2DArray)

  setValueT1Array(gl, v, textures) {
    const cache = this.cache;
    const n = v.length;
    const units = _allocTexUnits(textures, n);

    if (!_arraysEqual(cache, units)) {
      gl.uniform1iv(this.addr, units);
      _copyArray(cache, units);
    }

    for (let i = 0; i !== n; ++i) {
      textures.setTexture2D(v[i] || _emptyTexture, units[i]);
    }
  }

  setValueT3DArray(gl, v, textures) {
    const cache = this.cache;
    const n = v.length;
    const units = _allocTexUnits(textures, n);

    if (!_arraysEqual(cache, units)) {
      gl.uniform1iv(this.addr, units);
      _copyArray(cache, units);
    }

    for (let i = 0; i !== n; ++i) {
      textures.setTexture3D(v[i] || _empty3dTexture, units[i]);
    }
  }

  setValueT6Array(gl, v, textures) {
    const cache = this.cache;
    const n = v.length;
    const units = _allocTexUnits(textures, n);

    if (!_arraysEqual(cache, units)) {
      gl.uniform1iv(this.addr, units);
      _copyArray(cache, units);
    }

    for (let i = 0; i !== n; ++i) {
      textures.setTextureCube(v[i] || _emptyCubeTexture, units[i]);
    }
  }

  setValueT2DArrayArray(gl, v, textures) {
    const cache = this.cache;
    const n = v.length;
    const units = _allocTexUnits(textures, n);

    if (!_arraysEqual(cache, units)) {
      gl.uniform1iv(this.addr, units);
      _copyArray(cache, units);
    }

    for (let i = 0; i !== n; ++i) {
      textures.setTexture2DArray(v[i] || _emptyArrayTexture, units[i]);
    }
  }

  // Helper to pick the right setter for a pure (bottom-level) array

  getPureArraySetter(type) {
    switch (type) {
      case 0x1406:
        return this.setValueV1fArray; // FLOAT
      case 0x8b50:
        return this.setValueV2fArray; // _VEC2
      case 0x8b51:
        return this.setValueV3fArray; // _VEC3
      case 0x8b52:
        return this.setValueV4fArray; // _VEC4

      case 0x8b5a:
        return this.setValueM2Array; // _MAT2
      case 0x8b5b:
        return this.setValueM3Array; // _MAT3
      case 0x8b5c:
        return this.setValueM4Array; // _MAT4

      case 0x1404:
      case 0x8b56:
        return this.setValueV1iArray; // INT, BOOL
      case 0x8b53:
      case 0x8b57:
        return this.setValueV2iArray; // _VEC2
      case 0x8b54:
      case 0x8b58:
        return this.setValueV3iArray; // _VEC3
      case 0x8b55:
      case 0x8b59:
        return this.setValueV4iArray; // _VEC4

      case 0x1405:
        return this.setValueV1uiArray; // UINT
      case 0x8dc6:
        return this.setValueV2uiArray; // _VEC2
      case 0x8dc7:
        return this.setValueV3uiArray; // _VEC3
      case 0x8dc8:
        return this.setValueV4uiArray; // _VEC4

      case 0x8b5e: // SAMPLER_2D
      case 0x8d66: // SAMPLER_EXTERNAL_OES
      case 0x8dca: // INT_SAMPLER_2D
      case 0x8dd2: // UNSIGNED_INT_SAMPLER_2D
      case 0x8b62: // SAMPLER_2D_SHADOW
        return this.setValueT1Array;

      case 0x8b5f: // SAMPLER_3D
      case 0x8dcb: // INT_SAMPLER_3D
      case 0x8dd3: // UNSIGNED_INT_SAMPLER_3D
        return this.setValueT3DArray;

      case 0x8b60: // SAMPLER_CUBE
      case 0x8dcc: // INT_SAMPLER_CUBE
      case 0x8dd4: // UNSIGNED_INT_SAMPLER_CUBE
      case 0x8dc5: // SAMPLER_CUBE_SHADOW
        return this.setValueT6Array;

      case 0x8dc1: // SAMPLER_2D_ARRAY
      case 0x8dcf: // INT_SAMPLER_2D_ARRAY
      case 0x8dd7: // UNSIGNED_INT_SAMPLER_2D_ARRAY
      case 0x8dc4: // SAMPLER_2D_ARRAY_SHADOW
        return this.setValueT2DArrayArray;
    }
  }
}

class StructuredUniform {
  id;

  seq = [];
  map = {};

  constructor(id) {
    this.id = id;
  }

  setValue(gl, value, textures) {
    const seq = this.seq;

    for (let i = 0, n = seq.length; i !== n; ++i) {
      const u = seq[i];
      u.setValue(gl, value[u.id], textures);
    }
  }
}

// --- Utilities ---

// Parser - builds up the property tree from the path strings

const _RePathPart = /(\w+)(\])?(\[|\.)?/g;

// extracts
// 	- the identifier (member name or array index)
//  - followed by an optional right bracket (found when array index)
//  - followed by an optional left bracket or dot (type of subscript)
//
// Note: These portions can be read in a non-overlapping fashion and
// allow straightforward parsing of the hierarchy that WebGL encodes
// in the uniform names.

function _addUniform(container, uniformObject) {
  container.seq.push(uniformObject);
  container.map[uniformObject.id] = uniformObject;
}

function _parseUniform(activeInfo, addr, container) {
  const path = activeInfo.name;
  const pathLength = path.length;

  // reset RegExp object, because of the early exit of a previous run
  _RePathPart.lastIndex = 0;

  while (true) {
    const match = _RePathPart.exec(path);
    const matchEnd = _RePathPart.lastIndex;

    let id = match[1];
    const idIsIndex = match[2] === ']';
    const subscript = match[3];

    // @ts-ignore
    if (idIsIndex) id = id | 0; // convert to integer

    if (subscript === undefined || (subscript === '[' && matchEnd + 2 === pathLength)) {
      // bare name or "pure" bottom-level array "[0]" suffix

      _addUniform(
        container,
        subscript === undefined ?
          new SingleUniform(id, activeInfo, addr)
        : new PureArrayUniform(id, activeInfo, addr)
      );

      break;
    } else {
      // step into inner node / create it in case it doesn't exist

      const map = container.map;
      let next = map[id];

      if (next === undefined) {
        next = new StructuredUniform(id);
        _addUniform(container, next);
      }

      container = next;
    }
  }
}

// Flattening for arrays of vectors and matrices

function _flatten(array, nBlocks, blockSize) {
  const firstElem = array[0];

  if (firstElem <= 0 || firstElem > 0) return array;
  // unoptimized: ! isNaN( firstElem )
  // see http://jacksondunstan.com/articles/983

  const n = nBlocks * blockSize;
  let r = _arrayCacheF32[n];

  if (r === undefined) {
    r = new Float32Array(n);
    _arrayCacheF32[n] = r;
  }

  if (nBlocks !== 0) {
    firstElem.toArray(r, 0);

    for (let i = 1, offset = 0; i !== nBlocks; ++i) {
      offset += blockSize;
      array[i].toArray(r, offset);
    }
  }

  return r;
}

function _arraysEqual(a, b) {
  if (a.length !== b.length) return false;

  for (let i = 0, l = a.length; i < l; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

function _copyArray(a, b) {
  for (let i = 0, l = b.length; i < l; i++) {
    a[i] = b[i];
  }
}

// Texture unit allocation

function _allocTexUnits(textures, n) {
  let r = _arrayCacheI32[n];

  if (r === undefined) {
    r = new Int32Array(n);
    _arrayCacheI32[n] = r;
  }

  for (let i = 0; i !== n; ++i) {
    r[i] = textures.allocateTextureUnit();
  }

  return r;
}

const _emptyTexture = /*@__PURE__*/ new Texture();
const _emptyArrayTexture = /*@__PURE__*/ new DataArrayTexture();
const _empty3dTexture = /*@__PURE__*/ new Data3DTexture();
const _emptyCubeTexture = /*@__PURE__*/ new CubeTexture();

// Array Caches (provide typed arrays for temporary by size)

const _arrayCacheF32 = [];
const _arrayCacheI32 = [];

// Float32Array caches used for uploading Matrix uniforms

const _mat4array = new Float32Array(16);
const _mat3array = new Float32Array(9);
const _mat2array = new Float32Array(4);

export { WebGLUniforms };
