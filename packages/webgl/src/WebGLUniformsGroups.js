/**
 * @import { WebGLCapabilities, WebGLState, WebGLInfo } from "@renderlayer/webgl"
 */

class WebGLUniformsGroups {
  #gl;
  #info;
  #state;

  #buffers = {};
  #updateList = {};
  #allocatedBindingPoints = [];

  #maxBindingPoints;

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLInfo} info
   * @param {WebGLCapabilities} capabilities
   * @param {WebGLState} state
   */
  constructor(gl, info, capabilities, state) {
    this.#gl = gl;
    this.#info = info;
    this.#state = state;

    // binding points are global whereas block indices are per shader program
    this.#maxBindingPoints = gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS);
  }

  bind(uniformsGroup, program) {
    const webglProgram = program.program;
    this.#state.uniformBlockBinding(uniformsGroup, webglProgram);
  }

  update(uniformsGroup, program) {
    let buffer = this.#buffers[uniformsGroup.id];

    if (buffer === undefined) {
      this.#prepareUniformsGroup(uniformsGroup);

      buffer = this.#createBuffer(uniformsGroup);
      this.#buffers[uniformsGroup.id] = buffer;

      uniformsGroup.addEventListener('dispose', this._onUniformsGroupsDispose);
    }

    // ensure to update the binding points/block indices mapping for this program

    const webglProgram = program.program;
    this.#state.updateUBOMapping(uniformsGroup, webglProgram);

    // update UBO once per frame

    const frame = this.#info.render.frame;

    if (this.#updateList[uniformsGroup.id] !== frame) {
      this.#updateBufferData(uniformsGroup);

      this.#updateList[uniformsGroup.id] = frame;
    }
  }

  #createBuffer(uniformsGroup) {
    const gl = this.#gl;
    // the setup of an UBO is independent of a particular shader program but global

    const bindingPointIndex = this.#allocateBindingPointIndex();
    uniformsGroup.__bindingPointIndex = bindingPointIndex;

    const buffer = gl.createBuffer();
    const size = uniformsGroup.__size;
    const usage = uniformsGroup.usage;

    gl.bindBuffer(gl.UNIFORM_BUFFER, buffer);
    gl.bufferData(gl.UNIFORM_BUFFER, size, usage);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPointIndex, buffer);

    return buffer;
  }

  #allocateBindingPointIndex() {
    for (let i = 0; i < this.#maxBindingPoints; i++) {
      if (!this.#allocatedBindingPoints.includes(i)) {
        this.#allocatedBindingPoints.push(i);
        return i;
      }
    }

    console.error(
      'WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.'
    );

    return 0;
  }

  #updateBufferData(uniformsGroup) {
    const gl = this.#gl;

    const buffer = this.#buffers[uniformsGroup.id];
    const uniforms = uniformsGroup.uniforms;
    const cache = uniformsGroup.__cache;

    gl.bindBuffer(gl.UNIFORM_BUFFER, buffer);

    for (let i = 0, il = uniforms.length; i < il; i++) {
      const uniformArray = Array.isArray(uniforms[i]) ? uniforms[i] : [uniforms[i]];

      for (let j = 0, jl = uniformArray.length; j < jl; j++) {
        const uniform = uniformArray[j];

        if (this.#hasUniformChanged(uniform, i, j, cache) === true) {
          const offset = uniform.__offset;

          const values = Array.isArray(uniform.value) ? uniform.value : [uniform.value];

          let arrayOffset = 0;

          for (let k = 0; k < values.length; k++) {
            const value = values[k];

            const info = this.#getUniformSize(value);

            // TODO add integer and struct support
            if (typeof value === 'number' || typeof value === 'boolean') {
              uniform.__data[0] = value;
              gl.bufferSubData(gl.UNIFORM_BUFFER, offset + arrayOffset, uniform.__data);
            } else if (value.isMatrix3) {
              // manually converting 3x3 to 3x4

              uniform.__data[0] = value.elements[0];
              uniform.__data[1] = value.elements[1];
              uniform.__data[2] = value.elements[2];
              uniform.__data[3] = 0;
              uniform.__data[4] = value.elements[3];
              uniform.__data[5] = value.elements[4];
              uniform.__data[6] = value.elements[5];
              uniform.__data[7] = 0;
              uniform.__data[8] = value.elements[6];
              uniform.__data[9] = value.elements[7];
              uniform.__data[10] = value.elements[8];
              uniform.__data[11] = 0;
            } else {
              value.toArray(uniform.__data, arrayOffset);

              arrayOffset += info.storage / Float32Array.BYTES_PER_ELEMENT;
            }
          }

          gl.bufferSubData(gl.UNIFORM_BUFFER, offset, uniform.__data);
        }
      }
    }

    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
  }

  #hasUniformChanged(uniform, index, indexArray, cache) {
    const value = uniform.value;
    const indexString = index + '_' + indexArray;

    if (cache[indexString] === undefined) {
      // cache entry does not exist so far

      if (typeof value === 'number' || typeof value === 'boolean') {
        cache[indexString] = value;
      } else {
        cache[indexString] = value.clone();
      }

      return true;
    } else {
      const cachedObject = cache[indexString];

      // compare current value with cached entry

      if (typeof value === 'number' || typeof value === 'boolean') {
        if (cachedObject !== value) {
          cache[indexString] = value;
          return true;
        }
      } else {
        if (cachedObject.equals(value) === false) {
          cachedObject.copy(value);
          return true;
        }
      }
    }

    return false;
  }

  #prepareUniformsGroup(uniformsGroup) {
    // determine total buffer size according to the STD140 layout
    // Hint: STD140 is the only supported layout in WebGL 2

    const uniforms = uniformsGroup.uniforms;

    let offset = 0; // global buffer offset in bytes
    const chunkSize = 16; // size of a chunk in bytes

    for (let i = 0, l = uniforms.length; i < l; i++) {
      const uniformArray = Array.isArray(uniforms[i]) ? uniforms[i] : [uniforms[i]];

      for (let j = 0, jl = uniformArray.length; j < jl; j++) {
        const uniform = uniformArray[j];

        const values = Array.isArray(uniform.value) ? uniform.value : [uniform.value];

        for (let k = 0, kl = values.length; k < kl; k++) {
          const value = values[k];

          const info = this.#getUniformSize(value);

          const chunkOffset = offset % chunkSize; // offset in the current chunk
          const chunkPadding = chunkOffset % info.boundary; // required padding to match boundary
          const chunkStart = chunkOffset + chunkPadding; // the start position in the current chunk for the data

          offset += chunkPadding;

          // Check for chunk overflow
          if (chunkStart !== 0 && chunkSize - chunkStart < info.storage) {
            // Add padding and adjust offset
            offset += chunkSize - chunkStart;
          }

          // the following two properties will be used for partial buffer updates
          uniform.__data = new Float32Array(info.storage / Float32Array.BYTES_PER_ELEMENT);
          uniform.__offset = offset;

          // Update the global offset
          offset += info.storage;
        }
      }
    }

    // ensure correct final padding

    const chunkOffset = offset % chunkSize;

    if (chunkOffset > 0) offset += chunkSize - chunkOffset;

    //

    uniformsGroup.__size = offset;
    uniformsGroup.__cache = {};

    return this;
  }

  #getUniformSize(value) {
    const info = {
      boundary: 0, // bytes
      storage: 0 // bytes
    };

    // determine sizes according to STD140

    if (typeof value === 'number' || typeof value === 'boolean') {
      // float/int/bool

      info.boundary = 4;
      info.storage = 4;
    } else if (value.isVector2) {
      // vec2

      info.boundary = 8;
      info.storage = 8;
    } else if (value.isVector3 || value.isColor) {
      // vec3

      info.boundary = 16;
      info.storage = 12; // evil: vec3 must start on a 16-byte boundary but it only consumes 12 bytes
    } else if (value.isVector4) {
      // vec4

      info.boundary = 16;
      info.storage = 16;
    } else if (value.isMatrix3) {
      // mat3 (in STD140 a 3x3 matrix is represented as 3x4)

      info.boundary = 48;
      info.storage = 48;
    } else if (value.isMatrix4) {
      // mat4

      info.boundary = 64;
      info.storage = 64;
    } else if (value.isTexture) {
      console.warn('WebGLRenderer: Texture samplers can not be part of an uniforms group.');
    } else {
      console.warn('WebGLRenderer: Unsupported uniform value type.', value);
    }

    return info;
  }

  _onUniformsGroupsDispose(event) {
    const uniformsGroup = event.target;

    uniformsGroup.removeEventListener('dispose', this._onUniformsGroupsDispose);

    const index = this.#allocatedBindingPoints.indexOf(uniformsGroup.__bindingPointIndex);
    this.#allocatedBindingPoints.splice(index, 1);

    this.#gl.deleteBuffer(this.#buffers[uniformsGroup.id]);

    delete this.#buffers[uniformsGroup.id];
    delete this.#updateList[uniformsGroup.id];
  }

  dispose() {
    for (const id in this.#buffers) {
      this.#gl.deleteBuffer(this.#buffers[id]);
    }

    this.#allocatedBindingPoints = [];
    this.#buffers = {};
    this.#updateList = {};
  }
}

export { WebGLUniformsGroups };
