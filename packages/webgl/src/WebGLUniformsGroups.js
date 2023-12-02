class WebGLUniformsGroups {
  /** @param {WebGL2RenderingContext} gl */
  constructor(gl, info, capabilities, state) {
    this._gl = gl;
    this._info = info;
    this._capabilities = capabilities;
    this._state = state;
    this._buffers = {};
    this._updateList = {};
    this._allocatedBindingPoints = [];

    this._maxBindingPoints = gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS);
  }

  bind(uniformsGroup, program) {
    const webglProgram = program.program;
    this._state.uniformBlockBinding(uniformsGroup, webglProgram);
  }

  update(uniformsGroup, program) {
    let buffer = this._buffers[uniformsGroup.id];

    if (buffer === undefined) {
      this._prepareUniformsGroup(uniformsGroup);

      buffer = this._createBuffer(uniformsGroup);
      this._buffers[uniformsGroup.id] = buffer;

      uniformsGroup.addEventListener('dispose', this._onUniformsGroupsDispose);
    }

    // ensure to update the binding points/block indices mapping for this program

    const webglProgram = program.program;
    this._state.updateUBOMapping(uniformsGroup, webglProgram);

    // update UBO once per frame

    const frame = this._info.render.frame;

    if (this._updateList[uniformsGroup.id] !== frame) {
      this._updateBufferData(uniformsGroup);

      this._updateList[uniformsGroup.id] = frame;
    }
  }

  _createBuffer(uniformsGroup) {
    // the setup of an UBO is independent of a particular shader program but global

    const bindingPointIndex = this._allocateBindingPointIndex();
    uniformsGroup.__bindingPointIndex = bindingPointIndex;

    const buffer = this._gl.createBuffer();
    const size = uniformsGroup.__size;
    const usage = uniformsGroup.usage;

    this._gl.bindBuffer(this._gl.UNIFORM_BUFFER, buffer);
    this._gl.bufferData(this._gl.UNIFORM_BUFFER, size, usage);
    this._gl.bindBuffer(this._gl.UNIFORM_BUFFER, null);
    this._gl.bindBufferBase(this._gl.UNIFORM_BUFFER, bindingPointIndex, buffer);

    return buffer;
  }

  _allocateBindingPointIndex() {
    for (let i = 0; i < this._maxBindingPoints; i++) {
      if (!this._allocatedBindingPoints.includes(i)) {
        this._allocatedBindingPoints.push(i);
        return i;
      }
    }

    console.error(
      'WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.'
    );

    return 0;
  }

  _updateBufferData(uniformsGroup) {
    const buffer = this._buffers[uniformsGroup.id];
    const uniforms = uniformsGroup.uniforms;
    const cache = uniformsGroup.__cache;

    this._gl.bindBuffer(this._gl.UNIFORM_BUFFER, buffer);

    for (let i = 0, il = uniforms.length; i < il; i++) {
      const uniform = uniforms[i];

      // partly update the buffer if necessary

      if (this._hasUniformChanged(uniform, i, cache) === true) {
        const offset = uniform.__offset;

        const values = Array.isArray(uniform.value) ? uniform.value : [uniform.value];

        let arrayOffset = 0;

        for (const value of values) {
          const info = this._getUniformSize(value);

          if (typeof value === 'number' || typeof value === 'boolean') {
            uniform.__data[0] = value;
            this._gl.bufferSubData(this._gl.UNIFORM_BUFFER, offset + arrayOffset, uniform.__data);
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

        this._gl.bufferSubData(this._gl.UNIFORM_BUFFER, offset, uniform.__data);
      }
    }

    this._gl.bindBuffer(this._gl.UNIFORM_BUFFER, null);
  }

  _hasUniformChanged(uniform, index, cache) {
    const value = uniform.value;

    if (cache[index] === undefined) {
      // cache entry does not exist so far

      if (typeof value === 'number' || typeof value === 'boolean') {
        cache[index] = value;
      } else {
        const values = Array.isArray(value) ? value : [value];
        const tempValues = [];

        for (let i = 0; i < values.length; i++) {
          tempValues.push(values[i].clone());
        }

        cache[index] = tempValues;
      }

      return true;
    } else {
      // compare current value with cached entry

      if (typeof value === 'number' || typeof value === 'boolean') {
        if (cache[index] !== value) {
          cache[index] = value;
          return true;
        }
      } else {
        const cachedObjects = Array.isArray(cache[index]) ? cache[index] : [cache[index]];
        const values = Array.isArray(value) ? value : [value];

        for (let i = 0; i < cachedObjects.length; i++) {
          const cachedObject = cachedObjects[i];

          if (typeof cachedObject === 'number' || typeof cachedObject === 'boolean') {
            if (cachedObject !== values[i]) {
              cachedObjects[i] = values[i];
              return true;
            }
          } else if (cachedObject.equals(values[i]) === false) {
            cachedObject.copy(values[i]);
            return true;
          }
        }
      }
    }

    return false;
  }

  _prepareUniformsGroup(uniformsGroup) {
    // determine total buffer size according to the STD140 layout
    // Hint: STD140 is the only supported layout in WebGL 2

    const uniforms = uniformsGroup.uniforms;

    let offset = 0; // global buffer offset in bytes
    const chunkSize = 16; // size of a chunk in bytes
    let chunkOffset = 0; // offset within a single chunk in bytes

    for (let i = 0, l = uniforms.length; i < l; i++) {
      const uniform = uniforms[i];

      const infos = {
        boundary: 0, // bytes
        storage: 0 // bytes
      };

      const values = Array.isArray(uniform.value) ? uniform.value : [uniform.value];

      for (let j = 0, jl = values.length; j < jl; j++) {
        const value = values[j];

        const info = this._getUniformSize(value);

        infos.boundary += info.boundary;
        infos.storage += info.storage;
      }

      // the following two properties will be used for partial buffer updates

      uniform.__data = new Float32Array(infos.storage / Float32Array.BYTES_PER_ELEMENT);
      uniform.__offset = offset;

      //

      if (i > 0) {
        chunkOffset = offset % chunkSize;

        const remainingSizeInChunk = chunkSize - chunkOffset;

        // check for chunk overflow

        if (chunkOffset !== 0 && remainingSizeInChunk - infos.boundary < 0) {
          // add padding and adjust offset

          offset += chunkSize - chunkOffset;
          uniform.__offset = offset;
        }
      }

      offset += infos.storage;
    }

    // ensure correct final padding

    chunkOffset = offset % chunkSize;

    if (chunkOffset > 0) offset += chunkSize - chunkOffset;

    //

    uniformsGroup.__size = offset;
    uniformsGroup.__cache = {};
  }

  _getUniformSize(value) {
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

    const index = this._allocatedBindingPoints.indexOf(uniformsGroup.__bindingPointIndex);
    this._allocatedBindingPoints.splice(index, 1);

    this._gl.deleteBuffer(this._buffers[uniformsGroup.id]);

    delete this._buffers[uniformsGroup.id];
    delete this._updateList[uniformsGroup.id];
  }

  dispose() {
    for (const id in this._buffers) {
      this._gl.deleteBuffer(this._buffers[id]);
    }

    this._allocatedBindingPoints = [];
    this._buffers = {};
    this._updateList = {};
  }
}

export { WebGLUniformsGroups };
