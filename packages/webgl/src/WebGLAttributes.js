class WebGLAttributes {
  #gl;
  #buffers = new WeakMap();

  /** @param {WebGL2RenderingContext} gl */
  constructor(gl, capabilities) {
    this.#gl = gl;
  }

  #createBuffer(attribute, bufferType) {
    const { array, usage } = attribute;
    const gl = this.#gl;

    const buffer = gl.createBuffer();

    gl.bindBuffer(bufferType, buffer);
    gl.bufferData(bufferType, array, usage);

    attribute.onUploadCallback();

    let type;

    if (array instanceof Float32Array) {
      type = gl.FLOAT;
    } else if (array instanceof Uint16Array) {
      if (attribute.isFloat16BufferAttribute) {
        type = gl.HALF_FLOAT;
      } else {
        type = gl.UNSIGNED_SHORT;
      }
    } else if (array instanceof Int16Array) {
      type = gl.SHORT;
    } else if (array instanceof Uint32Array) {
      type = gl.UNSIGNED_INT;
    } else if (array instanceof Int32Array) {
      type = gl.INT;
    } else if (array instanceof Int8Array) {
      type = gl.BYTE;
    } else if (array instanceof Uint8Array) {
      type = gl.UNSIGNED_BYTE;
    } else if (array instanceof Uint8ClampedArray) {
      type = gl.UNSIGNED_BYTE;
    } else {
      throw new Error(`WebGLAttributes: Unsupported buffer data format: ${array}`);
    }

    return {
      buffer: buffer,
      type: type,
      bytesPerElement: array.BYTES_PER_ELEMENT,
      version: attribute.version
    };
  }

  #updateBuffer(buffer, attribute, bufferType) {
    const { array, updateRange } = attribute;
    const gl = this.#gl;

    gl.bindBuffer(bufferType, buffer);

    if (updateRange.count === -1) {
      // Not using update ranges
      gl.bufferSubData(bufferType, 0, array);
    } else {
      gl.bufferSubData(
        bufferType,
        updateRange.offset * array.BYTES_PER_ELEMENT,
        array,
        updateRange.offset,
        updateRange.count
      );

      updateRange.count = -1; // reset range
    }

    attribute.onUploadCallback();
  }

  get(attribute) {
    if (attribute.isInterleavedBufferAttribute) attribute = attribute.data;

    return this.#buffers.get(attribute);
  }

  remove(attribute) {
    if (attribute.isInterleavedBufferAttribute) attribute = attribute.data;

    const data = this.#buffers.get(attribute);

    if (data) {
      this.#gl.deleteBuffer(data.buffer);
      this.#buffers.delete(attribute);
    }
  }

  update(attribute, bufferType) {
    if (attribute.isGLBufferAttribute) {
      const cached = this.#buffers.get(attribute);

      if (!cached || cached.version < attribute.version) {
        this.#buffers.set(attribute, {
          buffer: attribute.buffer,
          type: attribute.type,
          bytesPerElement: attribute.elementSize,
          version: attribute.version
        });
      }

      return;
    }

    if (attribute.isInterleavedBufferAttribute) attribute = attribute.data;

    const data = this.#buffers.get(attribute);

    if (data === undefined) {
      this.#buffers.set(attribute, this.#createBuffer(attribute, bufferType));
    } else if (data.version < attribute.version) {
      this.#updateBuffer(data.buffer, attribute, bufferType);
      data.version = attribute.version;
    }
  }
}

export { WebGLAttributes };
