import { IntType } from '@renderlayer/shared';

class BindingState {
  newAttributes = [];
  enabledAttributes = [];
  attributeDivisors = [];

  geometry = null;
  program = null;
  wireframe = false;
  object;
  attributes = {};
  attributesNum = 0;
  index = null;

  constructor(maxVertexAttributes, vao) {
    for (let i = 0; i < maxVertexAttributes; i++) {
      this.newAttributes[i] = 0;
      this.enabledAttributes[i] = 0;
      this.attributeDivisors[i] = 0;
    }

    this.object = vao;
  }
}

class WebGLBindingStates {
  #gl;
  #attributes;

  #maxVertexAttributes;

  #bindingStates = {};

  #defaultState;
  #currentState;
  #forceUpdate = false;

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {import('./WebGLExtensions.js').WebGLExtensions} extensions
   * @param {import('./WebGLCapabilities.js').WebGLCapabilities} capabilities
   */
  constructor(gl, extensions, attributes, capabilities) {
    this.#gl = gl;
    this.#attributes = attributes;

    this.#maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);

    this.#defaultState = new BindingState(this.#maxVertexAttributes, null);
    this.#currentState = this.#defaultState;
  }

  setup(object, material, program, geometry, index) {
    const gl = this.#gl;
    const attributes = this.#attributes;

    let updateBuffers = false;

    const state = this.#getBindingState(geometry, program, material);

    if (this.#currentState !== state) {
      this.#currentState = state;
      this.#bindVertexArrayObject(this.#currentState.object);
    }

    updateBuffers = this.#needsUpdate(object, geometry, program, index);

    if (updateBuffers) this.#saveCache(object, geometry, program, index);

    if (index !== null) {
      attributes.update(index, gl.ELEMENT_ARRAY_BUFFER);
    }

    if (updateBuffers || this.#forceUpdate) {
      this.#forceUpdate = false;

      this.#setupVertexAttributes(object, material, program, geometry);

      if (index !== null) {
        gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, attributes.get(index).buffer);
      }
    }
  }

  #createVertexArrayObject() {
    return this.#gl.createVertexArray();
  }

  #bindVertexArrayObject(vao) {
    return this.#gl.bindVertexArray(vao);
  }

  #deleteVertexArrayObject(vao) {
    return this.#gl.deleteVertexArray(vao);
  }

  #getBindingState(geometry, program, material) {
    const wireframe = material.wireframe === true ? 1 : 0;

    let programMap = this.#bindingStates[geometry.id];

    if (programMap === undefined) {
      programMap = {};
      this.#bindingStates[geometry.id] = programMap;
    }

    let stateMap = programMap[program.id];

    if (stateMap === undefined) {
      stateMap = {};
      programMap[program.id] = stateMap;
    }

    let state = stateMap[wireframe];

    if (state === undefined) {
      state = new BindingState(this.#maxVertexAttributes, this.#createVertexArrayObject());
      stateMap[wireframe] = state;
    }

    return state;
  }

  #needsUpdate(object, geometry, program, index) {
    const cachedAttributes = this.#currentState.attributes;
    const geometryAttributes = geometry.attributes;

    let attributesNum = 0;

    const programAttributes = program.getAttributes();

    for (const name in programAttributes) {
      const programAttribute = programAttributes[name];

      if (programAttribute.location >= 0) {
        const cachedAttribute = cachedAttributes[name];
        let geometryAttribute = geometryAttributes[name];

        if (geometryAttribute === undefined) {
          if (name === 'instanceMatrix' && object.instanceMatrix)
            geometryAttribute = object.instanceMatrix;
          if (name === 'instanceColor' && object.instanceColor)
            geometryAttribute = object.instanceColor;
        }

        if (cachedAttribute === undefined) return true;
        if (cachedAttribute.attribute !== geometryAttribute) return true;
        if (geometryAttribute && cachedAttribute.data !== geometryAttribute.data) return true;

        attributesNum++;
      }
    }

    if (this.#currentState.attributesNum !== attributesNum) return true;
    if (this.#currentState.index !== index) return true;

    return false;
  }

  #saveCache(object, geometry, program, index) {
    const cache = {};
    const attributes = geometry.attributes;
    let attributesNum = 0;

    const programAttributes = program.getAttributes();

    for (const name in programAttributes) {
      const programAttribute = programAttributes[name];

      if (programAttribute.location >= 0) {
        let attribute = attributes[name];

        if (attribute === undefined) {
          if (name === 'instanceMatrix' && object.instanceMatrix) attribute = object.instanceMatrix;
          if (name === 'instanceColor' && object.instanceColor) attribute = object.instanceColor;
        }

        const data = {};
        data.attribute = attribute;

        if (attribute && attribute.data) {
          data.data = attribute.data;
        }

        cache[name] = data;

        attributesNum++;
      }
    }

    this.#currentState.attributes = cache;
    this.#currentState.attributesNum = attributesNum;

    this.#currentState.index = index;
  }

  initAttributes() {
    const newAttributes = this.#currentState.newAttributes;

    for (let i = 0, il = newAttributes.length; i < il; i++) {
      newAttributes[i] = 0;
    }
  }

  enableAttribute(attribute) {
    this.#enableAttributeAndDivisor(attribute, 0);
  }

  #enableAttributeAndDivisor(attribute, meshPerAttribute) {
    const newAttributes = this.#currentState.newAttributes;
    const enabledAttributes = this.#currentState.enabledAttributes;
    const attributeDivisors = this.#currentState.attributeDivisors;
    const gl = this.#gl;

    newAttributes[attribute] = 1;

    if (enabledAttributes[attribute] === 0) {
      gl.enableVertexAttribArray(attribute);
      enabledAttributes[attribute] = 1;
    }

    if (attributeDivisors[attribute] !== meshPerAttribute) {
      gl.vertexAttribDivisor(attribute, meshPerAttribute);
      attributeDivisors[attribute] = meshPerAttribute;
    }
  }

  disableUnusedAttributes() {
    const newAttributes = this.#currentState.newAttributes;
    const enabledAttributes = this.#currentState.enabledAttributes;
    const gl = this.#gl;

    for (let i = 0, il = enabledAttributes.length; i < il; i++) {
      if (enabledAttributes[i] !== newAttributes[i]) {
        gl.disableVertexAttribArray(i);
        enabledAttributes[i] = 0;
      }
    }
  }

  #vertexAttribPointer(index, size, type, normalized, stride, offset, integer) {
    if (integer === true) {
      this.#gl.vertexAttribIPointer(index, size, type, stride, offset);
    } else {
      this.#gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
    }
  }

  #setupVertexAttributes(object, material, program, geometry) {
    this.initAttributes();

    const geometryAttributes = geometry.attributes;
    const programAttributes = program.getAttributes();
    const materialDefaultAttributeValues = material.defaultAttributeValues;
    const gl = this.#gl;

    for (const name in programAttributes) {
      const programAttribute = programAttributes[name];

      if (programAttribute.location >= 0) {
        let geometryAttribute = geometryAttributes[name];

        if (geometryAttribute === undefined) {
          if (name === 'instanceMatrix' && object.instanceMatrix)
            geometryAttribute = object.instanceMatrix;
          if (name === 'instanceColor' && object.instanceColor)
            geometryAttribute = object.instanceColor;
        }

        if (geometryAttribute !== undefined) {
          const normalized = geometryAttribute.normalized;
          const size = geometryAttribute.itemSize;

          const attribute = this.#attributes.get(geometryAttribute);

          // TODO Attribute may not be available on context restore

          if (attribute === undefined) continue;

          const buffer = attribute.buffer;
          const type = attribute.type;
          const bytesPerElement = attribute.bytesPerElement;

          // check for integer attributes (WebGL 2 only)

          const integer =
            type === gl.INT || type === gl.UNSIGNED_INT || geometryAttribute.gpuType === IntType;

          if (geometryAttribute.isInterleavedBufferAttribute) {
            const data = geometryAttribute.data;
            const stride = data.stride;
            const offset = geometryAttribute.offset;

            if (data.isInstancedInterleavedBuffer) {
              for (let i = 0; i < programAttribute.locationSize; i++) {
                this.#enableAttributeAndDivisor(
                  programAttribute.location + i,
                  data.meshPerAttribute
                );
              }

              if (object.isInstancedMesh !== true && geometry._maxInstanceCount === undefined) {
                geometry._maxInstanceCount = data.meshPerAttribute * data.count;
              }
            } else {
              for (let i = 0; i < programAttribute.locationSize; i++) {
                this.enableAttribute(programAttribute.location + i);
              }
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

            for (let i = 0; i < programAttribute.locationSize; i++) {
              this.#vertexAttribPointer(
                programAttribute.location + i,
                size / programAttribute.locationSize,
                type,
                normalized,
                stride * bytesPerElement,
                (offset + (size / programAttribute.locationSize) * i) * bytesPerElement,
                integer
              );
            }
          } else {
            if (geometryAttribute.isInstancedBufferAttribute) {
              for (let i = 0; i < programAttribute.locationSize; i++) {
                this.#enableAttributeAndDivisor(
                  programAttribute.location + i,
                  geometryAttribute.meshPerAttribute
                );
              }

              if (object.isInstancedMesh !== true && geometry._maxInstanceCount === undefined) {
                geometry._maxInstanceCount =
                  geometryAttribute.meshPerAttribute * geometryAttribute.count;
              }
            } else {
              for (let i = 0; i < programAttribute.locationSize; i++) {
                this.enableAttribute(programAttribute.location + i);
              }
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

            for (let i = 0; i < programAttribute.locationSize; i++) {
              this.#vertexAttribPointer(
                programAttribute.location + i,
                size / programAttribute.locationSize,
                type,
                normalized,
                size * bytesPerElement,
                (size / programAttribute.locationSize) * i * bytesPerElement,
                integer
              );
            }
          }
        } else if (materialDefaultAttributeValues !== undefined) {
          const value = materialDefaultAttributeValues[name];

          if (value !== undefined) {
            switch (value.length) {
              case 2:
                gl.vertexAttrib2fv(programAttribute.location, value);
                break;

              case 3:
                gl.vertexAttrib3fv(programAttribute.location, value);
                break;

              case 4:
                gl.vertexAttrib4fv(programAttribute.location, value);
                break;

              default:
                gl.vertexAttrib1fv(programAttribute.location, value);
            }
          }
        }
      }
    }

    this.disableUnusedAttributes();
  }

  dispose() {
    this.reset();

    for (const geometryId in this.#bindingStates) {
      const programMap = this.#bindingStates[geometryId];

      for (const programId in programMap) {
        const stateMap = programMap[programId];

        for (const wireframe in stateMap) {
          this.#deleteVertexArrayObject(stateMap[wireframe].object);

          delete stateMap[wireframe];
        }

        delete programMap[programId];
      }

      delete this.#bindingStates[geometryId];
    }
  }

  releaseStatesOfGeometry(geometry) {
    if (this.#bindingStates[geometry.id] === undefined) return;

    const programMap = this.#bindingStates[geometry.id];

    for (const programId in programMap) {
      const stateMap = programMap[programId];

      for (const wireframe in stateMap) {
        this.#deleteVertexArrayObject(stateMap[wireframe].object);

        delete stateMap[wireframe];
      }

      delete programMap[programId];
    }

    delete this.#bindingStates[geometry.id];
  }

  releaseStatesOfProgram(program) {
    for (const geometryId in this.#bindingStates) {
      const programMap = this.#bindingStates[geometryId];

      if (programMap[program.id] === undefined) continue;

      const stateMap = programMap[program.id];

      for (const wireframe in stateMap) {
        this.#deleteVertexArrayObject(stateMap[wireframe].object);

        delete stateMap[wireframe];
      }

      delete programMap[program.id];
    }
  }

  reset() {
    this.resetDefaultState();
    this.#forceUpdate = true;

    if (this.#currentState === this.#defaultState) return;

    this.#currentState = this.#defaultState;
    this.#bindVertexArrayObject(this.#currentState.object);
  }

  // for backward-compatibility
  resetDefaultState() {
    this.#defaultState.geometry = null;
    this.#defaultState.program = null;
    this.#defaultState.wireframe = false;
  }
}

export { WebGLBindingStates };
