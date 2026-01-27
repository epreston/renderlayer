import { Uint16BufferAttribute, Uint32BufferAttribute } from '@renderlayer/buffers';
import { arrayNeedsUint32 } from '@renderlayer/shared';

class WebGLGeometries {
  /**
   * @param { WebGL2RenderingContext} gl
   * @param {import('./WebGLAttributes.js').WebGLAttributes} attributes
   */
  constructor(gl, attributes, info, bindingStates) {
    this._gl = gl;
    this._attributes = attributes;
    this._info = info;
    this._bindingStates = bindingStates;

    this._geometries = {};
    this._wireframeAttributes = new WeakMap();
  }

  _onGeometryDispose(event) {
    const geometry = event.target;

    if (geometry.index !== null) {
      this._attributes.remove(geometry.index);
    }

    for (const name in geometry.attributes) {
      this._attributes.remove(geometry.attributes[name]);
    }

    for (const name in geometry.morphAttributes) {
      const array = geometry.morphAttributes[name];

      for (let i = 0, l = array.length; i < l; i++) {
        this._attributes.remove(array[i]);
      }
    }

    geometry.removeEventListener('dispose', this._onGeometryDispose);

    delete this._geometries[geometry.id];

    const attribute = this._wireframeAttributes.get(geometry);

    if (attribute) {
      this._attributes.remove(attribute);
      this._wireframeAttributes.delete(geometry);
    }

    this._bindingStates.releaseStatesOfGeometry(geometry);

    if (geometry.isInstancedBufferGeometry === true) {
      delete geometry._maxInstanceCount;
    }

    this._info.memory.geometries--;
  }

  get(object, geometry) {
    if (this._geometries[geometry.id] === true) return geometry;

    geometry.addEventListener('dispose', this._onGeometryDispose.bind(this));

    this._geometries[geometry.id] = true;

    this._info.memory.geometries++;

    return geometry;
  }

  update(geometry) {
    const geometryAttributes = geometry.attributes;

    // Updating index buffer in VAO now. See WebGLBindingStates.

    for (const name in geometryAttributes) {
      this._attributes.update(geometryAttributes[name], this._gl.ARRAY_BUFFER);
    }

    // morph targets

    const morphAttributes = geometry.morphAttributes;

    for (const name in morphAttributes) {
      const array = morphAttributes[name];

      for (let i = 0, l = array.length; i < l; i++) {
        this._attributes.update(array[i], this._gl.ARRAY_BUFFER);
      }
    }
  }

  _updateWireframeAttribute(geometry) {
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

    const previousAttribute = this._wireframeAttributes.get(geometry);

    if (previousAttribute) this._attributes.remove(previousAttribute);

    //

    this._wireframeAttributes.set(geometry, attribute);
  }

  getWireframeAttribute(geometry) {
    const currentAttribute = this._wireframeAttributes.get(geometry);

    if (currentAttribute) {
      const geometryIndex = geometry.index;

      if (geometryIndex !== null) {
        // if the attribute is obsolete, create a new one

        if (currentAttribute.version < geometryIndex.version) {
          this._updateWireframeAttribute(geometry);
        }
      }
    } else {
      this._updateWireframeAttribute(geometry);
    }

    return this._wireframeAttributes.get(geometry);
  }
}

export { WebGLGeometries };
