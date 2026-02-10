class WebGLAttributes {
  #gl;
  #buffers = new WeakMap();

  /**
   * @param {WebGL2RenderingContext} gl
   */
  constructor(gl) {
    this.#gl = gl;
  }

  #createBuffer(attribute, bufferType) {
    const gl = this.#gl;

    const array = attribute.array;
    const usage = attribute.usage;
    const size = array.byteLength;

    const buffer = gl.createBuffer();

    gl.bindBuffer(bufferType, buffer);
    gl.bufferData(bufferType, array, usage);

    attribute.onUploadCallback();

    let type;

    if (array instanceof Float32Array) {
      type = gl.FLOAT;
      // @ts-ignore
      // eslint-disable-next-line no-undef
    } else if (typeof Float16Array !== 'undefined' && array instanceof Float16Array) {
      // EP: defined in typescript es2025.float16.d.ts but not in tools yet
      type = gl.HALF_FLOAT;
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
      version: attribute.version,
      size: size
    };
  }

  #updateBuffer(buffer, attribute, bufferType) {
    const gl = this.#gl;

    const array = attribute.array;
    const updateRanges = attribute.updateRanges ?? [];

    gl.bindBuffer(bufferType, buffer);

    if (updateRanges.length === 0) {
      // Not using update ranges
      gl.bufferSubData(bufferType, 0, array);
    } else {
      // Before applying update ranges, we merge any adjacent / overlapping
      // ranges to reduce load on `gl.bufferSubData`. Empirically, this has led
      // to performance improvements for applications which make heavy use of
      // update ranges. Likely due to GPU command overhead.
      //
      // Note that to reduce garbage collection between frames, we merge the
      // update ranges in-place. This is safe because this method will clear the
      // update ranges once updated.

      updateRanges.sort((a, b) => a.start - b.start);

      // To merge the update ranges in-place, we work from left to right in the
      // existing updateRanges array, merging ranges. This may result in a final
      // array which is smaller than the original. This index tracks the last
      // index representing a merged range, any data after this index can be
      // trimmed once the merge algorithm is completed.
      let mergeIndex = 0;

      for (let i = 1; i < updateRanges.length; i++) {
        const previousRange = updateRanges[mergeIndex];
        const range = updateRanges[i];

        // We add one here to merge adjacent ranges. This is safe because ranges
        // operate over positive integers.
        if (range.start <= previousRange.start + previousRange.count + 1) {
          previousRange.count = Math.max(
            previousRange.count,
            range.start + range.count - previousRange.start
          );
        } else {
          ++mergeIndex;
          updateRanges[mergeIndex] = range;
        }
      }

      // Trim the array to only contain the merged ranges.
      updateRanges.length = mergeIndex + 1;

      for (let i = 0, l = updateRanges.length; i < l; i++) {
        const range = updateRanges[i];

        gl.bufferSubData(
          bufferType,
          range.start * array.BYTES_PER_ELEMENT,
          array,
          range.start,
          range.count
        );
      }

      attribute.clearUpdateRanges();
    }

    attribute.onUploadCallback();
  }

  //

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
    if (attribute.isInterleavedBufferAttribute) attribute = attribute.data;
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

    const data = this.#buffers.get(attribute);

    if (data === undefined) {
      this.#buffers.set(attribute, this.#createBuffer(attribute, bufferType));
    } else if (data.version < attribute.version) {
      if (data.size !== attribute.array.byteLength) {
        throw new Error(
          "WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported."
        );
      }

      this.#updateBuffer(data.buffer, attribute, bufferType);

      data.version = attribute.version;
    }
  }
}

export { WebGLAttributes };
