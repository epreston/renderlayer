import { Uint16BufferAttribute, Uint32BufferAttribute } from '@renderlayer/buffers';
import { arrayNeedsUint32 } from '@renderlayer/shared';

class WebGLGeometries {
  #gl;
  #attributes;
  #info;
  #bindingStates;

  #geometries = {};
  #wireframeAttributes = new WeakMap();

  onGeometryDispose;

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {import('./WebGLAttributes.js').WebGLAttributes} attributes
   * @param {import('./WebGLInfo.js').WebGLInfo} info
   * @param {import('./WebGLBindingStates.js').WebGLBindingStates} bindingStates
   */
  constructor(gl, attributes, info, bindingStates) {
    this.#gl = gl;
    this.#attributes = attributes;
    this.#info = info;
    this.#bindingStates = bindingStates;

    this.onGeometryDispose = this.#onGeometryDispose.bind(this);
  }

  #onGeometryDispose(event) {
    const geometry = event.target;

    if (geometry.index !== null) {
      this.#attributes.remove(geometry.index);
    }

    for (const name in geometry.attributes) {
      this.#attributes.remove(geometry.attributes[name]);
    }

    for (const name in geometry.morphAttributes) {
      const array = geometry.morphAttributes[name];

      for (let i = 0, l = array.length; i < l; i++) {
        this.#attributes.remove(array[i]);
      }
    }

    geometry.removeEventListener('dispose', this.onGeometryDispose);

    delete this.#geometries[geometry.id];

    const attribute = this.#wireframeAttributes.get(geometry);

    if (attribute) {
      this.#attributes.remove(attribute);
      this.#wireframeAttributes.delete(geometry);
    }

    this.#bindingStates.releaseStatesOfGeometry(geometry);

    if (geometry.isInstancedBufferGeometry === true) {
      delete geometry._maxInstanceCount;
    }

    this.#info.memory.geometries--;
  }

  get(object, geometry) {
    if (this.#geometries[geometry.id] === true) return geometry;

    geometry.addEventListener('dispose', this.onGeometryDispose);

    this.#geometries[geometry.id] = true;

    this.#info.memory.geometries++;

    return geometry;
  }

  update(geometry) {
    const geometryAttributes = geometry.attributes;

    // Updating index buffer in VAO now. See WebGLBindingStates.

    for (const name in geometryAttributes) {
      this.#attributes.update(geometryAttributes[name], this.#gl.ARRAY_BUFFER);
    }

    // morph targets

    const morphAttributes = geometry.morphAttributes;

    for (const name in morphAttributes) {
      const array = morphAttributes[name];

      for (let i = 0, l = array.length; i < l; i++) {
        this.#attributes.update(array[i], this.#gl.ARRAY_BUFFER);
      }
    }
  }

  #updateWireframeAttribute(geometry) {
    const indices = [];

    const geometryIndex = geometry.index;
    const geometryPosition = geometry.attributes.position;
    let version = 0;

    if (geometryIndex !== null) {
      const array = geometryIndex.array;
      version = geometryIndex.version;

      for (let i = 0, l = array.length; i < l; i += 3) {
        const a = array[i + 0];
        const b = array[i + 1];
        const c = array[i + 2];

        indices.push(a, b, b, c, c, a);
      }
    } else if (geometryPosition !== undefined) {
      const array = geometryPosition.array;
      version = geometryPosition.version;

      for (let i = 0, l = array.length / 3 - 1; i < l; i += 3) {
        const a = i + 0;
        const b = i + 1;
        const c = i + 2;

        indices.push(a, b, b, c, c, a);
      }
    } else {
      return;
    }

    const attribute = new (
      arrayNeedsUint32(indices) ? Uint32BufferAttribute : Uint16BufferAttribute)(indices, 1);
    attribute.version = version;

    // Updating index buffer in VAO now. See WebGLBindingStates

    //

    const previousAttribute = this.#wireframeAttributes.get(geometry);

    if (previousAttribute) this.#attributes.remove(previousAttribute);

    //

    this.#wireframeAttributes.set(geometry, attribute);
  }

  getWireframeAttribute(geometry) {
    const currentAttribute = this.#wireframeAttributes.get(geometry);

    if (currentAttribute) {
      const geometryIndex = geometry.index;

      if (geometryIndex !== null) {
        // if the attribute is obsolete, create a new one

        if (currentAttribute.version < geometryIndex.version) {
          this.#updateWireframeAttribute(geometry);
        }
      }
    } else {
      this.#updateWireframeAttribute(geometry);
    }

    return this.#wireframeAttributes.get(geometry);
  }
}

export { WebGLGeometries };
