import { cloneUniforms, cloneUniformsGroups } from '@renderlayer/shaders';
import { Material } from './Material.js';

import default_vertex from './glsl/default_vertex.glsl.js';
import default_fragment from './glsl/default_fragment.glsl.js';

class ShaderMaterial extends Material {
  type = 'ShaderMaterial';

  defines = {};
  uniforms = {};
  uniformsGroups = [];

  vertexShader = default_vertex;
  fragmentShader = default_fragment;

  linewidth = 1;

  wireframe = false;
  wireframeLinewidth = 1;

  fog = false; // set to use scene fog
  lights = false; // set to use scene lights
  clipping = false; // set to use user-defined clipping planes

  forceSinglePass = true;

  extensions = {
    clipCullDistance: false, // set to use vertex shader clipping
    multiDraw: false // set to use vertex shader multi_draw / enable gl_DrawID
  };

  // When rendered geometry doesn't include these attributes but the material does,
  // use these default values in WebGL. This avoids errors when buffer data is missing.
  defaultAttributeValues = {
    color: [1, 1, 1],
    uv: [0, 0],
    uv1: [0, 0]
  };

  index0AttributeName = undefined;
  uniformsNeedUpdate = false;

  glslVersion = null;

  constructor(parameters) {
    super();

    if (parameters !== undefined) {
      this.setValues(parameters);
    }
  }

  get isShaderMaterial() {
    return true;
  }

  /**
   * @param {ShaderMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);

    this.fragmentShader = source.fragmentShader;
    this.vertexShader = source.vertexShader;

    this.uniforms = cloneUniforms(source.uniforms);
    this.uniformsGroups = cloneUniformsGroups(source.uniformsGroups);

    this.defines = Object.assign({}, source.defines);

    // EP: bug fix
    this.linewidth = source.linewidth;

    this.wireframe = source.wireframe;
    this.wireframeLinewidth = source.wireframeLinewidth;

    this.fog = source.fog;
    this.lights = source.lights;
    this.clipping = source.clipping;

    this.extensions = Object.assign({}, source.extensions);

    this.glslVersion = source.glslVersion;

    return this;
  }

  toJSON(meta) {
    const data = super.toJSON(meta);

    data.glslVersion = this.glslVersion;
    data.uniforms = {};

    for (const name in this.uniforms) {
      const uniform = this.uniforms[name];
      const value = uniform.value;

      if (value && value.isTexture) {
        data.uniforms[name] = {
          type: 't',
          value: value.toJSON(meta).uuid
        };
      } else if (value && value.isColor) {
        data.uniforms[name] = {
          type: 'c',
          value: value.getHex()
        };
      } else if (value && value.isVector2) {
        data.uniforms[name] = {
          type: 'v2',
          value: value.toArray()
        };
      } else if (value && value.isVector3) {
        data.uniforms[name] = {
          type: 'v3',
          value: value.toArray()
        };
      } else if (value && value.isVector4) {
        data.uniforms[name] = {
          type: 'v4',
          value: value.toArray()
        };
      } else if (value && value.isMatrix3) {
        data.uniforms[name] = {
          type: 'm3',
          value: value.toArray()
        };
      } else if (value && value.isMatrix4) {
        data.uniforms[name] = {
          type: 'm4',
          value: value.toArray()
        };
      } else {
        data.uniforms[name] = {
          value: value
        };

        // note: the array variants v2v, v3v, v4v, m4v and tv are not supported so far
      }
    }

    if (Object.keys(this.defines).length > 0) data.defines = this.defines;

    data.vertexShader = this.vertexShader;
    data.fragmentShader = this.fragmentShader;

    data.lights = this.lights;
    data.clipping = this.clipping;

    const extensions = {};

    for (const key in this.extensions) {
      if (this.extensions[key] === true) extensions[key] = true;
    }

    if (Object.keys(extensions).length > 0) data.extensions = extensions;

    return data;
  }
}

export { ShaderMaterial };
