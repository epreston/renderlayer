import { BoxGeometry, PlaneGeometry } from '@renderlayer/geometries';
import { ShaderMaterial, MeshDistanceMaterial, MeshDepthMaterial } from '@renderlayer/materials';
import { Color, ColorManagement, Matrix3, Plane, Vector4, Vector2, Vector3, Matrix4, Frustum } from '@renderlayer/math';
import { Mesh } from '@renderlayer/objects';
import { ShaderLib, cloneUniforms, getUnlitUniformColorSpace, ShaderChunk, UniformsLib } from '@renderlayer/shaders';
import { CubeUVReflectionMapping, BackSide, SRGBTransfer, FrontSide, IntType, EquirectangularReflectionMapping, CubeReflectionMapping, EquirectangularRefractionMapping, CubeRefractionMapping, arrayNeedsUint32, FloatType, NoToneMapping, GLSL3, PCFShadowMap, PCFSoftShadowMap, VSMShadowMap, CustomToneMapping, ACESFilmicToneMapping, CineonToneMapping, ReinhardToneMapping, LinearToneMapping, DisplayP3ColorSpace, SRGBColorSpace, LinearDisplayP3ColorSpace, LinearSRGBColorSpace, P3Primaries, Rec709Primaries, AddOperation, MixOperation, MultiplyOperation, DoubleSide, NormalBlending, TangentSpaceNormalMap, ObjectSpaceNormalMap, NoBlending, NearestFilter, RGBADepthPacking, MaxEquation, MinEquation, ReverseSubtractEquation, SubtractEquation, AddEquation, OneMinusConstantAlphaFactor, ConstantAlphaFactor, OneMinusConstantColorFactor, ConstantColorFactor, OneMinusDstAlphaFactor, OneMinusDstColorFactor, OneMinusSrcAlphaFactor, OneMinusSrcColorFactor, DstAlphaFactor, DstColorFactor, SrcAlphaSaturateFactor, SrcAlphaFactor, SrcColorFactor, OneFactor, ZeroFactor, LessEqualDepth, CullFaceBack, CustomBlending, MultiplyBlending, SubtractiveBlending, AdditiveBlending, CullFaceNone, CullFaceFront, NotEqualDepth, GreaterDepth, GreaterEqualDepth, EqualDepth, LessDepth, AlwaysDepth, NeverDepth, MirroredRepeatWrapping, ClampToEdgeWrapping, RepeatWrapping, LinearMipmapLinearFilter, LinearMipmapNearestFilter, LinearFilter, NearestMipmapLinearFilter, NearestMipmapNearestFilter, NotEqualCompare, GreaterCompare, GreaterEqualCompare, EqualCompare, LessEqualCompare, LessCompare, AlwaysCompare, NeverCompare, createElementNS, LinearTransfer, NoColorSpace, RGB_ETC1_Format, UnsignedIntType, UnsignedInt248Type, DepthFormat, UnsignedShortType, DepthStencilFormat, RGBAFormat, _SRGBAFormat, UnsignedByteType, UnsignedShort4444Type, UnsignedShort5551Type, UnsignedInt5999Type, UnsignedInt101111Type, ByteType, ShortType, HalfFloatType, AlphaFormat, RGBFormat, LuminanceFormat, LuminanceAlphaFormat, RedFormat, RedIntegerFormat, RGFormat, RGIntegerFormat, RGBAIntegerFormat, RGB_S3TC_DXT1_Format, RGBA_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format, RGB_PVRTC_4BPPV1_Format, RGB_PVRTC_2BPPV1_Format, RGBA_PVRTC_4BPPV1_Format, RGBA_PVRTC_2BPPV1_Format, RGB_ETC2_Format, RGBA_ETC2_EAC_Format, R11_EAC_Format, SIGNED_R11_EAC_Format, RG11_EAC_Format, SIGNED_RG11_EAC_Format, RGBA_ASTC_4x4_Format, RGBA_ASTC_5x4_Format, RGBA_ASTC_5x5_Format, RGBA_ASTC_6x5_Format, RGBA_ASTC_6x6_Format, RGBA_ASTC_8x5_Format, RGBA_ASTC_8x6_Format, RGBA_ASTC_8x8_Format, RGBA_ASTC_10x5_Format, RGBA_ASTC_10x6_Format, RGBA_ASTC_10x8_Format, RGBA_ASTC_10x10_Format, RGBA_ASTC_12x10_Format, RGBA_ASTC_12x12_Format, RGBA_BPTC_Format, RGB_BPTC_SIGNED_Format, RGB_BPTC_UNSIGNED_Format, RED_RGTC1_Format, SIGNED_RED_RGTC1_Format, RED_GREEN_RGTC2_Format, SIGNED_RED_GREEN_RGTC2_Format } from '@renderlayer/shared';
import { WebGLCubeRenderTarget, WebGLRenderTarget } from '@renderlayer/targets';
import { PMREMGenerator } from '@renderlayer/pmrem';
import { Uint32BufferAttribute, Uint16BufferAttribute, BufferGeometry, BufferAttribute } from '@renderlayer/buffers';
import { DataArrayTexture, Texture, Data3DTexture, CubeTexture } from '@renderlayer/textures';
import { Layers } from '@renderlayer/core';

class WebGLAnimation {
  #context = null;
  #isAnimating = false;
  #animationLoop = null;
  #requestId = null;
  onAnimationFrame;
  constructor() {
    this.onAnimationFrame = this.#onAnimationFrame.bind(this);
  }
  #onAnimationFrame(time, frame) {
    this.#animationLoop(time, frame);
    this.#requestId = this.#context.requestAnimationFrame(this.onAnimationFrame);
  }
  start() {
    if (this.#isAnimating === true) return;
    if (this.#animationLoop === null) return;
    this.#requestId = this.#context.requestAnimationFrame(this.onAnimationFrame);
    this.#isAnimating = true;
  }
  stop() {
    this.#context.cancelAnimationFrame(this.#requestId);
    this.#isAnimating = false;
  }
  setAnimationLoop(callback) {
    this.#animationLoop = callback;
  }
  setContext(value) {
    this.#context = value;
  }
}

class WebGLAttributes {
  #gl;
  #buffers = /* @__PURE__ */ new WeakMap();
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLCapabilities} capabilities
   */
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
      buffer,
      type,
      bytesPerElement: array.BYTES_PER_ELEMENT,
      version: attribute.version
    };
  }
  #updateBuffer(buffer, attribute, bufferType) {
    const { array, updateRange } = attribute;
    const gl = this.#gl;
    gl.bindBuffer(bufferType, buffer);
    if (updateRange.count === -1) {
      gl.bufferSubData(bufferType, 0, array);
    } else {
      gl.bufferSubData(
        bufferType,
        updateRange.offset * array.BYTES_PER_ELEMENT,
        array,
        updateRange.offset,
        updateRange.count
      );
      updateRange.count = -1;
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
    if (data === void 0) {
      this.#buffers.set(attribute, this.#createBuffer(attribute, bufferType));
    } else if (data.version < attribute.version) {
      this.#updateBuffer(data.buffer, attribute, bufferType);
      data.version = attribute.version;
    }
  }
}

class WebGLBackground {
  #renderer;
  #cubemaps;
  #cubeuvmaps;
  #state;
  #objects;
  // #alpha;
  #premultipliedAlpha;
  #clearColor = new Color(0);
  #clearAlpha = 1;
  #planeMesh = void 0;
  #boxMesh = void 0;
  #currentBackground = null;
  #currentBackgroundVersion = 0;
  #currentTonemapping = null;
  /**
   * @param {WebGLRenderer} renderer
   * @param {WebGLCubeMaps} cubemaps
   * @param {WebGLCubeUVMaps} cubeuvmaps
   * @param {WebGLState} state
   * @param {WebGLObjects} objects
   */
  constructor(renderer, cubemaps, cubeuvmaps, state, objects, alpha, premultipliedAlpha) {
    this.#renderer = renderer;
    this.#cubemaps = cubemaps;
    this.#cubeuvmaps = cubeuvmaps;
    this.#state = state;
    this.#objects = objects;
    this.#premultipliedAlpha = premultipliedAlpha;
    this.#clearAlpha = alpha === true ? 0 : 1;
  }
  render(renderList, scene) {
    let forceClear = false;
    let background = scene.isScene === true ? scene.background : null;
    if (background && background.isTexture) {
      const usePMREM = scene.backgroundBlurriness > 0;
      background = (usePMREM ? this.#cubeuvmaps : this.#cubemaps).get(background);
    }
    if (background === null) {
      this.#setClear(this.#clearColor, this.#clearAlpha);
    } else if (background && background.isColor) {
      this.#setClear(background, 1);
      forceClear = true;
    }
    if (this.#renderer.autoClear || forceClear) {
      this.#renderer.clear(
        this.#renderer.autoClearColor,
        this.#renderer.autoClearDepth,
        this.#renderer.autoClearStencil
      );
    }
    if (background && (background.isCubeTexture || background.mapping === CubeUVReflectionMapping)) {
      if (this.#boxMesh === void 0) {
        this.#boxMesh = new Mesh(
          new BoxGeometry(1, 1, 1),
          new ShaderMaterial({
            name: "BackgroundCubeMaterial",
            uniforms: cloneUniforms(ShaderLib.backgroundCube.uniforms),
            vertexShader: ShaderLib.backgroundCube.vertexShader,
            fragmentShader: ShaderLib.backgroundCube.fragmentShader,
            side: BackSide,
            depthTest: false,
            depthWrite: false,
            fog: false
          })
        );
        this.#boxMesh.geometry.deleteAttribute("normal");
        this.#boxMesh.geometry.deleteAttribute("uv");
        this.#boxMesh.onBeforeRender = function(renderer, scene2, camera) {
          this.matrixWorld.copyPosition(camera.matrixWorld);
        };
        Object.defineProperty(this.#boxMesh.material, "envMap", {
          get() {
            return this.uniforms.envMap.value;
          }
        });
        this.#objects.update(this.#boxMesh);
      }
      this.#boxMesh.material.uniforms.envMap.value = background;
      this.#boxMesh.material.uniforms.flipEnvMap.value = background.isCubeTexture && background.isRenderTargetTexture === false ? -1 : 1;
      this.#boxMesh.material.uniforms.backgroundBlurriness.value = scene.backgroundBlurriness;
      this.#boxMesh.material.uniforms.backgroundIntensity.value = scene.backgroundIntensity;
      this.#boxMesh.material.toneMapped = ColorManagement.getTransfer(background.colorSpace) !== SRGBTransfer;
      if (this.#currentBackground !== background || this.#currentBackgroundVersion !== background.version || this.#currentTonemapping !== this.#renderer.toneMapping) {
        this.#boxMesh.material.needsUpdate = true;
        this.#currentBackground = background;
        this.#currentBackgroundVersion = background.version;
        this.#currentTonemapping = this.#renderer.toneMapping;
      }
      this.#boxMesh.layers.enableAll();
      renderList.unshift(this.#boxMesh, this.#boxMesh.geometry, this.#boxMesh.material, 0, 0, null);
    } else if (background && background.isTexture) {
      if (this.#planeMesh === void 0) {
        this.#planeMesh = new Mesh(
          new PlaneGeometry(2, 2),
          new ShaderMaterial({
            name: "BackgroundMaterial",
            uniforms: cloneUniforms(ShaderLib.background.uniforms),
            vertexShader: ShaderLib.background.vertexShader,
            fragmentShader: ShaderLib.background.fragmentShader,
            side: FrontSide,
            depthTest: false,
            depthWrite: false,
            fog: false
          })
        );
        this.#planeMesh.geometry.deleteAttribute("normal");
        Object.defineProperty(this.#planeMesh.material, "map", {
          get() {
            return this.uniforms.t2D.value;
          }
        });
        this.#objects.update(this.#planeMesh);
      }
      this.#planeMesh.material.uniforms.t2D.value = background;
      this.#planeMesh.material.uniforms.backgroundIntensity.value = scene.backgroundIntensity;
      this.#planeMesh.material.toneMapped = ColorManagement.getTransfer(background.colorSpace) !== SRGBTransfer;
      if (background.matrixAutoUpdate === true) {
        background.updateMatrix();
      }
      this.#planeMesh.material.uniforms.uvTransform.value.copy(background.matrix);
      if (this.#currentBackground !== background || this.#currentBackgroundVersion !== background.version || this.#currentTonemapping !== this.#renderer.toneMapping) {
        this.#planeMesh.material.needsUpdate = true;
        this.#currentBackground = background;
        this.#currentBackgroundVersion = background.version;
        this.#currentTonemapping = this.#renderer.toneMapping;
      }
      this.#planeMesh.layers.enableAll();
      renderList.unshift(
        this.#planeMesh,
        this.#planeMesh.geometry,
        this.#planeMesh.material,
        0,
        0,
        null
      );
    }
  }
  #setClear(color, alpha) {
    color.getRGB(_rgb, getUnlitUniformColorSpace(this.#renderer));
    this.#state.buffers.color.setClear(_rgb.r, _rgb.g, _rgb.b, alpha, this.#premultipliedAlpha);
  }
  getClearColor() {
    return this.#clearColor;
  }
  setClearColor(color, alpha = 1) {
    this.#clearColor.set(color);
    this.#clearAlpha = alpha;
    this.#setClear(this.#clearColor, this.#clearAlpha);
  }
  getClearAlpha() {
    return this.#clearAlpha;
  }
  setClearAlpha(alpha) {
    this.#clearAlpha = alpha;
    this.#setClear(this.#clearColor, this.#clearAlpha);
  }
}
const _rgb = { r: 0, b: 0, g: 0 };

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
   * @param {WebGLExtensions} extensions
   * @param {WebGLAttributes} attributes
   * @param {WebGLCapabilities} capabilities
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
    if (programMap === void 0) {
      programMap = {};
      this.#bindingStates[geometry.id] = programMap;
    }
    let stateMap = programMap[program.id];
    if (stateMap === void 0) {
      stateMap = {};
      programMap[program.id] = stateMap;
    }
    let state = stateMap[wireframe];
    if (state === void 0) {
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
        if (geometryAttribute === void 0) {
          if (name === "instanceMatrix" && object.instanceMatrix)
            geometryAttribute = object.instanceMatrix;
          if (name === "instanceColor" && object.instanceColor)
            geometryAttribute = object.instanceColor;
        }
        if (cachedAttribute === void 0) return true;
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
        if (attribute === void 0) {
          if (name === "instanceMatrix" && object.instanceMatrix) attribute = object.instanceMatrix;
          if (name === "instanceColor" && object.instanceColor) attribute = object.instanceColor;
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
        if (geometryAttribute === void 0) {
          if (name === "instanceMatrix" && object.instanceMatrix)
            geometryAttribute = object.instanceMatrix;
          if (name === "instanceColor" && object.instanceColor)
            geometryAttribute = object.instanceColor;
        }
        if (geometryAttribute !== void 0) {
          const normalized = geometryAttribute.normalized;
          const size = geometryAttribute.itemSize;
          const attribute = this.#attributes.get(geometryAttribute);
          if (attribute === void 0) continue;
          const buffer = attribute.buffer;
          const type = attribute.type;
          const bytesPerElement = attribute.bytesPerElement;
          const integer = type === gl.INT || type === gl.UNSIGNED_INT || geometryAttribute.gpuType === IntType;
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
              if (object.isInstancedMesh !== true && geometry._maxInstanceCount === void 0) {
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
                (offset + size / programAttribute.locationSize * i) * bytesPerElement,
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
              if (object.isInstancedMesh !== true && geometry._maxInstanceCount === void 0) {
                geometry._maxInstanceCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;
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
                size / programAttribute.locationSize * i * bytesPerElement,
                integer
              );
            }
          }
        } else if (materialDefaultAttributeValues !== void 0) {
          const value = materialDefaultAttributeValues[name];
          if (value !== void 0) {
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
    if (this.#bindingStates[geometry.id] === void 0) return;
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
      if (programMap[program.id] === void 0) continue;
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

class WebGLBufferRenderer {
  #gl;
  #info;
  #mode = null;
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLExtensions} extensions
   * @param {WebGLInfo} info
   * @param {WebGLCapabilities} capabilities
   */
  constructor(gl, extensions, info, capabilities) {
    this.#gl = gl;
    this.#info = info;
  }
  setMode(value) {
    this.#mode = value;
  }
  render(start, count) {
    this.#gl.drawArrays(this.#mode, start, count);
    this.#info.update(count, this.#mode, 1);
  }
  renderInstances(start, count, primcount) {
    if (primcount === 0) return;
    this.#gl.drawArraysInstanced(this.#mode, start, count, primcount);
    this.#info.update(count, this.#mode, primcount);
  }
}

class WebGLCapabilities {
  #gl;
  #isWebGL2 = true;
  #drawBuffers = true;
  #maxAnisotropy = 16;
  #precision = "highp";
  #logarithmicDepthBuffer = false;
  #maxTextures = 16;
  #maxVertexTextures = 16;
  #maxTextureSize = 16384;
  #maxCubemapSize = 16384;
  #maxAttributes = 16;
  #maxVertexUniforms = 4095;
  #maxVaryings = 30;
  #maxFragmentUniforms = 1024;
  #vertexTextures = true;
  #floatFragmentTextures = true;
  #floatVertexTextures = true;
  #maxSamples;
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLExtensions} extensions
   */
  constructor(gl, extensions, parameters) {
    this.#gl = gl;
    if (extensions.has("EXT_texture_filter_anisotropic") === true) {
      const extension = extensions.get("EXT_texture_filter_anisotropic");
      this.#maxAnisotropy = gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else {
      this.#maxAnisotropy = 0;
    }
    this.#isWebGL2 = typeof WebGL2RenderingContext !== "undefined" && gl.constructor.name === "WebGL2RenderingContext";
    this.#precision = parameters.precision !== void 0 ? parameters.precision : "highp";
    const maxPrecision = this.getMaxPrecision(this.#precision);
    if (maxPrecision !== this.#precision) {
      console.warn(
        `WebGLRenderer: ${this.#precision} not supported, using ${maxPrecision} instead.`
      );
      this.#precision = maxPrecision;
    }
    this.#logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true;
    this.#maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    this.#maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    this.#maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    this.#maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);
    this.#maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    this.#maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    this.#maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
    this.#maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);
    this.#vertexTextures = this.#maxVertexTextures > 0;
    this.#floatVertexTextures = this.#vertexTextures && this.#floatFragmentTextures;
    this.#maxSamples = gl.getParameter(gl.MAX_SAMPLES);
  }
  getMaxAnisotropy() {
    return this.#maxAnisotropy;
  }
  getMaxPrecision(precision) {
    const gl = this.#gl;
    if (precision === "highp") {
      if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.HIGH_FLOAT).precision > 0 && gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT).precision > 0) {
        return "highp";
      }
      precision = "mediump";
    }
    if (precision === "mediump") {
      if (gl.getShaderPrecisionFormat(gl.VERTEX_SHADER, gl.MEDIUM_FLOAT).precision > 0 && gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.MEDIUM_FLOAT).precision > 0) {
        return "mediump";
      }
    }
    return "lowp";
  }
  get isWebGL2() {
    return this.#isWebGL2;
  }
  get drawBuffers() {
    return this.#drawBuffers;
  }
  get precision() {
    return this.#precision;
  }
  get logarithmicDepthBuffer() {
    return this.#logarithmicDepthBuffer;
  }
  get maxTextures() {
    return this.#maxTextures;
  }
  get maxVertexTextures() {
    return this.#maxVertexTextures;
  }
  get maxTextureSize() {
    return this.#maxTextureSize;
  }
  get maxCubemapSize() {
    return this.#maxCubemapSize;
  }
  get maxAttributes() {
    return this.#maxAttributes;
  }
  get maxVertexUniforms() {
    return this.#maxVertexUniforms;
  }
  get maxVaryings() {
    return this.#maxVaryings;
  }
  get maxFragmentUniforms() {
    return this.#maxFragmentUniforms;
  }
  get vertexTextures() {
    return this.#vertexTextures;
  }
  get floatFragmentTextures() {
    return this.#floatFragmentTextures;
  }
  get floatVertexTextures() {
    return this.#floatVertexTextures;
  }
  get maxSamples() {
    return this.#maxSamples;
  }
}

class WebGLClipping {
  #properties;
  #globalState = null;
  #numGlobalPlanes = 0;
  #localClippingEnabled = false;
  #renderingShadows = false;
  #uniform = { value: null, needsUpdate: false };
  uniform;
  numPlanes = 0;
  numIntersection = 0;
  constructor(properties) {
    this.#properties = properties;
    this.uniform = this.#uniform;
  }
  init(planes, enableLocalClipping) {
    const enabled = planes.length !== 0 || enableLocalClipping || // enable state of previous frame - the clipping code has to
    // run another frame in order to reset the state:
    this.#numGlobalPlanes !== 0 || this.#localClippingEnabled;
    this.#localClippingEnabled = enableLocalClipping;
    this.#numGlobalPlanes = planes.length;
    return enabled;
  }
  beginShadows() {
    this.#renderingShadows = true;
    this.#projectPlanes(null);
  }
  endShadows() {
    this.#renderingShadows = false;
  }
  setGlobalState(planes, camera) {
    this.#globalState = this.#projectPlanes(planes, camera, 0);
  }
  setState(material, camera, useCache) {
    const planes = material.clippingPlanes;
    const clipIntersection = material.clipIntersection;
    const clipShadows = material.clipShadows;
    const materialProperties = this.#properties.get(material);
    if (!this.#localClippingEnabled || planes === null || planes.length === 0 || this.#renderingShadows && !clipShadows) {
      if (this.#renderingShadows) {
        this.#projectPlanes(null);
      } else {
        this.#resetGlobalState();
      }
    } else {
      const nGlobal = this.#renderingShadows ? 0 : this.#numGlobalPlanes;
      const lGlobal = nGlobal * 4;
      let dstArray = materialProperties.clippingState || null;
      this.#uniform.value = dstArray;
      dstArray = this.#projectPlanes(planes, camera, lGlobal, useCache);
      for (let i = 0; i !== lGlobal; ++i) {
        dstArray[i] = this.#globalState[i];
      }
      materialProperties.clippingState = dstArray;
      this.numIntersection = clipIntersection ? this.numPlanes : 0;
      this.numPlanes += nGlobal;
    }
  }
  #resetGlobalState() {
    const globalState = this.#globalState;
    const numGlobalPlanes = this.#numGlobalPlanes;
    const uniform = this.#uniform;
    if (uniform.value !== globalState) {
      uniform.value = globalState;
      uniform.needsUpdate = numGlobalPlanes > 0;
    }
    this.numPlanes = numGlobalPlanes;
    this.numIntersection = 0;
  }
  #projectPlanes(planes, camera, dstOffset, skipTransform) {
    const uniform = this.#uniform;
    const nPlanes = planes !== null ? planes.length : 0;
    let dstArray = null;
    if (nPlanes !== 0) {
      dstArray = uniform.value;
      if (skipTransform !== true || dstArray === null) {
        const flatSize = dstOffset + nPlanes * 4;
        const viewMatrix = camera.matrixWorldInverse;
        _viewNormalMatrix.getNormalMatrix(viewMatrix);
        if (dstArray === null || dstArray.length < flatSize) {
          dstArray = new Float32Array(flatSize);
        }
        for (let i = 0, i4 = dstOffset; i !== nPlanes; ++i, i4 += 4) {
          _plane.copy(planes[i]).applyMatrix4(viewMatrix, _viewNormalMatrix);
          _plane.normal.toArray(dstArray, i4);
          dstArray[i4 + 3] = _plane.constant;
        }
      }
      uniform.value = dstArray;
      uniform.needsUpdate = true;
    }
    this.numPlanes = nPlanes;
    this.numIntersection = 0;
    return dstArray;
  }
}
const _plane = /* @__PURE__ */ new Plane();
const _viewNormalMatrix = /* @__PURE__ */ new Matrix3();

class WebGLCubeMaps {
  #renderer;
  #cubemaps = /* @__PURE__ */ new WeakMap();
  /** @param {WebGLRenderer} renderer  */
  constructor(renderer) {
    this.#renderer = renderer;
  }
  #mapTextureMapping(texture, mapping) {
    if (mapping === EquirectangularReflectionMapping) {
      texture.mapping = CubeReflectionMapping;
    } else if (mapping === EquirectangularRefractionMapping) {
      texture.mapping = CubeRefractionMapping;
    }
    return texture;
  }
  get(texture) {
    if (texture && texture.isTexture) {
      const mapping = texture.mapping;
      if (mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping) {
        if (this.#cubemaps.has(texture)) {
          const cubemap = this.#cubemaps.get(texture).texture;
          return this.#mapTextureMapping(cubemap, texture.mapping);
        } else {
          const image = texture.image;
          if (image && image.height > 0) {
            const renderTarget = new WebGLCubeRenderTarget(image.height / 2);
            renderTarget.fromEquirectangularTexture(this.#renderer, texture);
            this.#cubemaps.set(texture, renderTarget);
            texture.addEventListener("dispose", this._onTextureDispose);
            return this.#mapTextureMapping(renderTarget.texture, texture.mapping);
          } else {
            return null;
          }
        }
      }
    }
    return texture;
  }
  _onTextureDispose(event) {
    const texture = event.target;
    texture.removeEventListener("dispose", this._onTextureDispose);
    const cubemap = this.#cubemaps.get(texture);
    if (cubemap !== void 0) {
      this.#cubemaps.delete(texture);
      cubemap.dispose();
    }
  }
  dispose() {
    this.#cubemaps = /* @__PURE__ */ new WeakMap();
  }
}

class WebGLCubeUVMaps {
  #renderer;
  #cubeUVmaps = /* @__PURE__ */ new WeakMap();
  #pmremGenerator = null;
  /** @param {WebGLRenderer} renderer  */
  constructor(renderer) {
    this.#renderer = renderer;
  }
  get(texture) {
    if (texture && texture.isTexture) {
      const mapping = texture.mapping;
      const isEquirectMap = mapping === EquirectangularReflectionMapping || mapping === EquirectangularRefractionMapping;
      const isCubeMap = mapping === CubeReflectionMapping || mapping === CubeRefractionMapping;
      if (isEquirectMap || isCubeMap) {
        if (texture.isRenderTargetTexture && texture.needsPMREMUpdate === true) {
          texture.needsPMREMUpdate = false;
          let renderTarget = this.#cubeUVmaps.get(texture);
          if (this.#pmremGenerator === null)
            this.#pmremGenerator = new PMREMGenerator(this.#renderer);
          renderTarget = isEquirectMap ? this.#pmremGenerator.fromEquirectangular(texture, renderTarget) : this.#pmremGenerator.fromCubemap(texture, renderTarget);
          this.#cubeUVmaps.set(texture, renderTarget);
          return renderTarget.texture;
        } else {
          if (this.#cubeUVmaps.has(texture)) {
            return this.#cubeUVmaps.get(texture).texture;
          } else {
            const image = texture.image;
            if (isEquirectMap && image && image.height > 0 || isCubeMap && image && this.#isCubeTextureComplete(image)) {
              if (this.#pmremGenerator === null)
                this.#pmremGenerator = new PMREMGenerator(this.#renderer);
              const renderTarget = isEquirectMap ? this.#pmremGenerator.fromEquirectangular(texture) : this.#pmremGenerator.fromCubemap(texture);
              this.#cubeUVmaps.set(texture, renderTarget);
              texture.addEventListener("dispose", this._onTextureDispose);
              return renderTarget.texture;
            } else {
              return null;
            }
          }
        }
      }
    }
    return texture;
  }
  #isCubeTextureComplete(image) {
    let count = 0;
    const length = 6;
    for (let i = 0; i < length; i++) {
      if (image[i] !== void 0) count++;
    }
    return count === length;
  }
  _onTextureDispose(event) {
    const texture = event.target;
    texture.removeEventListener("dispose", this._onTextureDispose);
    const cubemapUV = this.#cubeUVmaps.get(texture);
    if (cubemapUV !== void 0) {
      this.#cubeUVmaps.delete(texture);
      cubemapUV.dispose();
    }
  }
  dispose() {
    this.#cubeUVmaps = /* @__PURE__ */ new WeakMap();
    if (this.#pmremGenerator !== null) {
      this.#pmremGenerator.dispose();
      this.#pmremGenerator = null;
    }
  }
}

class WebGLExtensions {
  #gl;
  #extensions = [];
  /** @param {WebGL2RenderingContext} gl */
  constructor(gl) {
    this.#gl = gl;
  }
  #getExtension(name) {
    if (this.#extensions[name] !== void 0) {
      return this.#extensions[name];
    }
    let extension;
    switch (name) {
      case "WEBGL_compressed_texture_pvrtc":
        extension = this.#gl.getExtension("WEBGL_compressed_texture_pvrtc") || this.#gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        extension = this.#gl.getExtension(name);
    }
    this.#extensions[name] = extension;
    return extension;
  }
  //
  has(name) {
    return this.#getExtension(name) !== null;
  }
  /** @param {?WebGLCapabilities} capabilities  */
  init(capabilities) {
    this.#getExtension("EXT_color_buffer_float");
    this.#getExtension("WEBGL_clip_cull_distance");
    this.#getExtension("OES_texture_float_linear");
    this.#getExtension("EXT_color_buffer_half_float");
    this.#getExtension("WEBGL_multisampled_render_to_texture");
    this.#getExtension("WEBGL_render_shared_exponent");
  }
  get(name) {
    const extension = this.#getExtension(name);
    if (extension === null) {
      console.warn(`WebGLRenderer: ${name} extension not supported.`);
    }
    return extension;
  }
}

class WebGLGeometries {
  #gl;
  #attributes;
  #info;
  #bindingStates;
  #geometries = {};
  #wireframeAttributes = /* @__PURE__ */ new WeakMap();
  onGeometryDispose;
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLAttributes} attributes
   * @param {WebGLInfo} info
   * @param {WebGLBindingStates} bindingStates
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
    geometry.removeEventListener("dispose", this.onGeometryDispose);
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
    geometry.addEventListener("dispose", this.onGeometryDispose);
    this.#geometries[geometry.id] = true;
    this.#info.memory.geometries++;
    return geometry;
  }
  update(geometry) {
    const geometryAttributes = geometry.attributes;
    for (const name in geometryAttributes) {
      this.#attributes.update(geometryAttributes[name], this.#gl.ARRAY_BUFFER);
    }
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
    } else if (geometryPosition !== void 0) {
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
    const attribute = new (arrayNeedsUint32(indices) ? Uint32BufferAttribute : Uint16BufferAttribute)(indices, 1);
    attribute.version = version;
    const previousAttribute = this.#wireframeAttributes.get(geometry);
    if (previousAttribute) this.#attributes.remove(previousAttribute);
    this.#wireframeAttributes.set(geometry, attribute);
  }
  getWireframeAttribute(geometry) {
    const currentAttribute = this.#wireframeAttributes.get(geometry);
    if (currentAttribute) {
      const geometryIndex = geometry.index;
      if (geometryIndex !== null) {
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

class WebGLIndexedBufferRenderer {
  #gl;
  #info;
  #mode = null;
  #type = null;
  #bytesPerElement = null;
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLExtensions} extensions
   * @param {WebGLInfo} info
   * @param {WebGLCapabilities} capabilities
   */
  constructor(gl, extensions, info, capabilities) {
    this.#gl = gl;
    this.#info = info;
  }
  setMode(value) {
    this.#mode = value;
  }
  setIndex(value) {
    this.#type = value.type;
    this.#bytesPerElement = value.bytesPerElement;
  }
  render(start, count) {
    this.#gl.drawElements(this.#mode, count, this.#type, start * this.#bytesPerElement);
    this.#info.update(count, this.#mode, 1);
  }
  renderInstances(start, count, primcount) {
    if (primcount === 0) return;
    this.#gl.drawElementsInstanced(
      this.#mode,
      count,
      this.#type,
      start * this.#bytesPerElement,
      primcount
    );
    this.#info.update(count, this.#mode, primcount);
  }
}

class WebGLInfo {
  #gl;
  memory = {
    geometries: 0,
    textures: 0
  };
  render = {
    frame: 0,
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  };
  programs = null;
  autoReset = true;
  /** @param {WebGL2RenderingContext} gl */
  constructor(gl) {
    this.#gl = gl;
  }
  update(count, mode, instanceCount) {
    const render = this.render;
    const gl = this.#gl;
    render.calls++;
    switch (mode) {
      case gl.TRIANGLES:
        render.triangles += instanceCount * (count / 3);
        break;
      case gl.LINES:
        render.lines += instanceCount * (count / 2);
        break;
      case gl.LINE_STRIP:
        render.lines += instanceCount * (count - 1);
        break;
      case gl.LINE_LOOP:
        render.lines += instanceCount * count;
        break;
      case gl.POINTS:
        render.points += instanceCount * count;
        break;
      default:
        console.error("WebGLInfo: Unknown draw mode:", mode);
        break;
    }
  }
  reset() {
    const render = this.render;
    render.calls = 0;
    render.triangles = 0;
    render.points = 0;
    render.lines = 0;
  }
}

class WebGLMaterials {
  #renderer;
  #properties;
  /** @param {WebGLRenderer} renderer  */
  constructor(renderer, properties) {
    this.#renderer = renderer;
    this.#properties = properties;
  }
  refreshFogUniforms(uniforms, fog) {
    fog.color.getRGB(uniforms.fogColor.value, getUnlitUniformColorSpace(this.#renderer));
    if (fog.isFog) {
      uniforms.fogNear.value = fog.near;
      uniforms.fogFar.value = fog.far;
    } else if (fog.isFogExp2) {
      uniforms.fogDensity.value = fog.density;
    }
  }
  refreshMaterialUniforms(uniforms, material, pixelRatio, height, transmissionRenderTarget) {
    if (material.isMeshBasicMaterial) {
      this.#refreshUniformsCommon(uniforms, material);
    } else if (material.isMeshStandardMaterial) {
      this.#refreshUniformsCommon(uniforms, material);
      this.#refreshUniformsStandard(uniforms, material);
      if (material.isMeshPhysicalMaterial) {
        this.#refreshUniformsPhysical(uniforms, material, transmissionRenderTarget);
      }
    } else if (material.isMeshDepthMaterial) {
      this.#refreshUniformsCommon(uniforms, material);
    } else if (material.isMeshDistanceMaterial) {
      this.#refreshUniformsCommon(uniforms, material);
      this.#refreshUniformsDistance(uniforms, material);
    } else if (material.isMeshNormalMaterial) {
      this.#refreshUniformsCommon(uniforms, material);
    } else if (material.isLineBasicMaterial) {
      this.#refreshUniformsLine(uniforms, material);
    } else if (material.isPointsMaterial) {
      this.#refreshUniformsPoints(uniforms, material, pixelRatio, height);
    } else if (material.isSpriteMaterial) {
      this.#refreshUniformsSprites(uniforms, material);
    } else if (material.isShadowMaterial) {
      uniforms.color.value.copy(material.color);
      uniforms.opacity.value = material.opacity;
    } else if (material.isShaderMaterial) {
      material.uniformsNeedUpdate = false;
    }
  }
  #refreshTransformUniform(map, uniform) {
    if (map.matrixAutoUpdate === true) {
      map.updateMatrix();
    }
    uniform.value.copy(map.matrix);
  }
  #refreshUniformsCommon(uniforms, material) {
    uniforms.opacity.value = material.opacity;
    if (material.color) {
      uniforms.diffuse.value.copy(material.color);
    }
    if (material.emissive) {
      uniforms.emissive.value.copy(material.emissive).multiplyScalar(material.emissiveIntensity);
    }
    if (material.map) {
      uniforms.map.value = material.map;
      this.#refreshTransformUniform(material.map, uniforms.mapTransform);
    }
    if (material.alphaMap) {
      uniforms.alphaMap.value = material.alphaMap;
      this.#refreshTransformUniform(material.alphaMap, uniforms.alphaMapTransform);
    }
    if (material.bumpMap) {
      uniforms.bumpMap.value = material.bumpMap;
      this.#refreshTransformUniform(material.bumpMap, uniforms.bumpMapTransform);
      uniforms.bumpScale.value = material.bumpScale;
      if (material.side === BackSide) {
        uniforms.bumpScale.value *= -1;
      }
    }
    if (material.normalMap) {
      uniforms.normalMap.value = material.normalMap;
      this.#refreshTransformUniform(material.normalMap, uniforms.normalMapTransform);
      uniforms.normalScale.value.copy(material.normalScale);
      if (material.side === BackSide) {
        uniforms.normalScale.value.negate();
      }
    }
    if (material.displacementMap) {
      uniforms.displacementMap.value = material.displacementMap;
      this.#refreshTransformUniform(material.displacementMap, uniforms.displacementMapTransform);
      uniforms.displacementScale.value = material.displacementScale;
      uniforms.displacementBias.value = material.displacementBias;
    }
    if (material.emissiveMap) {
      uniforms.emissiveMap.value = material.emissiveMap;
      this.#refreshTransformUniform(material.emissiveMap, uniforms.emissiveMapTransform);
    }
    if (material.specularMap) {
      uniforms.specularMap.value = material.specularMap;
      this.#refreshTransformUniform(material.specularMap, uniforms.specularMapTransform);
    }
    if (material.alphaTest > 0) {
      uniforms.alphaTest.value = material.alphaTest;
    }
    const envMap = this.#properties.get(material).envMap;
    if (envMap) {
      uniforms.envMap.value = envMap;
      uniforms.flipEnvMap.value = envMap.isCubeTexture && envMap.isRenderTargetTexture === false ? -1 : 1;
      uniforms.reflectivity.value = material.reflectivity;
      uniforms.ior.value = material.ior;
      uniforms.refractionRatio.value = material.refractionRatio;
    }
    if (material.lightMap) {
      uniforms.lightMap.value = material.lightMap;
      const scaleFactor = this.#renderer._useLegacyLights === true ? Math.PI : 1;
      uniforms.lightMapIntensity.value = material.lightMapIntensity * scaleFactor;
      this.#refreshTransformUniform(material.lightMap, uniforms.lightMapTransform);
    }
    if (material.aoMap) {
      uniforms.aoMap.value = material.aoMap;
      uniforms.aoMapIntensity.value = material.aoMapIntensity;
      this.#refreshTransformUniform(material.aoMap, uniforms.aoMapTransform);
    }
  }
  #refreshUniformsLine(uniforms, material) {
    uniforms.diffuse.value.copy(material.color);
    uniforms.opacity.value = material.opacity;
    if (material.map) {
      uniforms.map.value = material.map;
      this.#refreshTransformUniform(material.map, uniforms.mapTransform);
    }
  }
  // #refreshUniformsDash(uniforms, material) {
  //   uniforms.dashSize.value = material.dashSize;
  //   uniforms.totalSize.value = material.dashSize + material.gapSize;
  //   uniforms.scale.value = material.scale;
  // }
  #refreshUniformsPoints(uniforms, material, pixelRatio, height) {
    uniforms.diffuse.value.copy(material.color);
    uniforms.opacity.value = material.opacity;
    uniforms.size.value = material.size * pixelRatio;
    uniforms.scale.value = height * 0.5;
    if (material.map) {
      uniforms.map.value = material.map;
      this.#refreshTransformUniform(material.map, uniforms.uvTransform);
    }
    if (material.alphaMap) {
      uniforms.alphaMap.value = material.alphaMap;
      this.#refreshTransformUniform(material.alphaMap, uniforms.alphaMapTransform);
    }
    if (material.alphaTest > 0) {
      uniforms.alphaTest.value = material.alphaTest;
    }
  }
  #refreshUniformsSprites(uniforms, material) {
    uniforms.diffuse.value.copy(material.color);
    uniforms.opacity.value = material.opacity;
    uniforms.rotation.value = material.rotation;
    if (material.map) {
      uniforms.map.value = material.map;
      this.#refreshTransformUniform(material.map, uniforms.mapTransform);
    }
    if (material.alphaMap) {
      uniforms.alphaMap.value = material.alphaMap;
      this.#refreshTransformUniform(material.alphaMap, uniforms.alphaMapTransform);
    }
    if (material.alphaTest > 0) {
      uniforms.alphaTest.value = material.alphaTest;
    }
  }
  // #refreshUniformsPhong(uniforms, material) {
  //   uniforms.specular.value.copy(material.specular);
  //   uniforms.shininess.value = Math.max(material.shininess, 1e-4); // to prevent pow( 0.0, 0.0 )
  // }
  // #refreshUniformsToon(uniforms, material) {
  //   if (material.gradientMap) {
  //     uniforms.gradientMap.value = material.gradientMap;
  //   }
  // }
  #refreshUniformsStandard(uniforms, material) {
    uniforms.metalness.value = material.metalness;
    if (material.metalnessMap) {
      uniforms.metalnessMap.value = material.metalnessMap;
      this.#refreshTransformUniform(material.metalnessMap, uniforms.metalnessMapTransform);
    }
    uniforms.roughness.value = material.roughness;
    if (material.roughnessMap) {
      uniforms.roughnessMap.value = material.roughnessMap;
      this.#refreshTransformUniform(material.roughnessMap, uniforms.roughnessMapTransform);
    }
    const envMap = this.#properties.get(material).envMap;
    if (envMap) {
      uniforms.envMapIntensity.value = material.envMapIntensity;
    }
  }
  #refreshUniformsPhysical(uniforms, material, transmissionRenderTarget) {
    uniforms.ior.value = material.ior;
    if (material.sheen > 0) {
      uniforms.sheenColor.value.copy(material.sheenColor).multiplyScalar(material.sheen);
      uniforms.sheenRoughness.value = material.sheenRoughness;
      if (material.sheenColorMap) {
        uniforms.sheenColorMap.value = material.sheenColorMap;
        this.#refreshTransformUniform(material.sheenColorMap, uniforms.sheenColorMapTransform);
      }
      if (material.sheenRoughnessMap) {
        uniforms.sheenRoughnessMap.value = material.sheenRoughnessMap;
        this.#refreshTransformUniform(
          material.sheenRoughnessMap,
          uniforms.sheenRoughnessMapTransform
        );
      }
    }
    if (material.clearcoat > 0) {
      uniforms.clearcoat.value = material.clearcoat;
      uniforms.clearcoatRoughness.value = material.clearcoatRoughness;
      if (material.clearcoatMap) {
        uniforms.clearcoatMap.value = material.clearcoatMap;
        this.#refreshTransformUniform(material.clearcoatMap, uniforms.clearcoatMapTransform);
      }
      if (material.clearcoatRoughnessMap) {
        uniforms.clearcoatRoughnessMap.value = material.clearcoatRoughnessMap;
        this.#refreshTransformUniform(
          material.clearcoatRoughnessMap,
          uniforms.clearcoatRoughnessMapTransform
        );
      }
      if (material.clearcoatNormalMap) {
        uniforms.clearcoatNormalMap.value = material.clearcoatNormalMap;
        this.#refreshTransformUniform(
          material.clearcoatNormalMap,
          uniforms.clearcoatNormalMapTransform
        );
        uniforms.clearcoatNormalScale.value.copy(material.clearcoatNormalScale);
        if (material.side === BackSide) {
          uniforms.clearcoatNormalScale.value.negate();
        }
      }
    }
    if (material.iridescence > 0) {
      uniforms.iridescence.value = material.iridescence;
      uniforms.iridescenceIOR.value = material.iridescenceIOR;
      uniforms.iridescenceThicknessMinimum.value = material.iridescenceThicknessRange[0];
      uniforms.iridescenceThicknessMaximum.value = material.iridescenceThicknessRange[1];
      if (material.iridescenceMap) {
        uniforms.iridescenceMap.value = material.iridescenceMap;
        this.#refreshTransformUniform(material.iridescenceMap, uniforms.iridescenceMapTransform);
      }
      if (material.iridescenceThicknessMap) {
        uniforms.iridescenceThicknessMap.value = material.iridescenceThicknessMap;
        this.#refreshTransformUniform(
          material.iridescenceThicknessMap,
          uniforms.iridescenceThicknessMapTransform
        );
      }
    }
    if (material.transmission > 0) {
      uniforms.transmission.value = material.transmission;
      uniforms.transmissionSamplerMap.value = transmissionRenderTarget.texture;
      uniforms.transmissionSamplerSize.value.set(
        transmissionRenderTarget.width,
        transmissionRenderTarget.height
      );
      if (material.transmissionMap) {
        uniforms.transmissionMap.value = material.transmissionMap;
        this.#refreshTransformUniform(material.transmissionMap, uniforms.transmissionMapTransform);
      }
      uniforms.thickness.value = material.thickness;
      if (material.thicknessMap) {
        uniforms.thicknessMap.value = material.thicknessMap;
        this.#refreshTransformUniform(material.thicknessMap, uniforms.thicknessMapTransform);
      }
      uniforms.attenuationDistance.value = material.attenuationDistance;
      uniforms.attenuationColor.value.copy(material.attenuationColor);
    }
    if (material.anisotropy > 0) {
      uniforms.anisotropyVector.value.set(
        material.anisotropy * Math.cos(material.anisotropyRotation),
        material.anisotropy * Math.sin(material.anisotropyRotation)
      );
      if (material.anisotropyMap) {
        uniforms.anisotropyMap.value = material.anisotropyMap;
        this.#refreshTransformUniform(material.anisotropyMap, uniforms.anisotropyMapTransform);
      }
    }
    uniforms.specularIntensity.value = material.specularIntensity;
    uniforms.specularColor.value.copy(material.specularColor);
    if (material.specularColorMap) {
      uniforms.specularColorMap.value = material.specularColorMap;
      this.#refreshTransformUniform(material.specularColorMap, uniforms.specularColorMapTransform);
    }
    if (material.specularIntensityMap) {
      uniforms.specularIntensityMap.value = material.specularIntensityMap;
      this.#refreshTransformUniform(
        material.specularIntensityMap,
        uniforms.specularIntensityMapTransform
      );
    }
  }
  // #refreshUniformsMatcap(uniforms, material) {
  //   if (material.matcap) {
  //     uniforms.matcap.value = material.matcap;
  //   }
  // }
  #refreshUniformsDistance(uniforms, material) {
    const light = this.#properties.get(material).light;
    uniforms.referencePosition.value.setFromMatrixPosition(light.matrixWorld);
    uniforms.nearDistance.value = light.shadow.camera.near;
    uniforms.farDistance.value = light.shadow.camera.far;
  }
}

class WebGLMorphtargets {
  #gl;
  #capabilities;
  #textures;
  #morphTextures = /* @__PURE__ */ new WeakMap();
  #morph = new Vector4();
  #workInfluences = [];
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLCapabilities} capabilities
   * @param {WebGLTextures} textures
   */
  constructor(gl, capabilities, textures) {
    this.#gl = gl;
    this.#capabilities = capabilities;
    this.#textures = textures;
    for (let i = 0; i < 8; i++) {
      this.#workInfluences[i] = [i, 0];
    }
  }
  update(object, geometry, program) {
    const gl = this.#gl;
    const capabilities = this.#capabilities;
    const textures = this.#textures;
    const objectInfluences = object.morphTargetInfluences;
    const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
    const morphTargetsCount = morphAttribute !== void 0 ? morphAttribute.length : 0;
    let entry = this.#morphTextures.get(geometry);
    if (entry === void 0 || entry.count !== morphTargetsCount) {
      if (entry !== void 0) entry.texture.dispose();
      const hasMorphPosition = geometry.morphAttributes.position !== void 0;
      const hasMorphNormals = geometry.morphAttributes.normal !== void 0;
      const hasMorphColors = geometry.morphAttributes.color !== void 0;
      const morphTargets = geometry.morphAttributes.position || [];
      const morphNormals = geometry.morphAttributes.normal || [];
      const morphColors = geometry.morphAttributes.color || [];
      let vertexDataCount = 0;
      if (hasMorphPosition === true) vertexDataCount = 1;
      if (hasMorphNormals === true) vertexDataCount = 2;
      if (hasMorphColors === true) vertexDataCount = 3;
      let width = geometry.attributes.position.count * vertexDataCount;
      let height = 1;
      if (width > capabilities.maxTextureSize) {
        height = Math.ceil(width / capabilities.maxTextureSize);
        width = capabilities.maxTextureSize;
      }
      const buffer = new Float32Array(width * height * 4 * morphTargetsCount);
      const texture = new DataArrayTexture(buffer, width, height, morphTargetsCount);
      texture.type = FloatType;
      texture.needsUpdate = true;
      const vertexDataStride = vertexDataCount * 4;
      for (let i = 0; i < morphTargetsCount; i++) {
        const morphTarget = morphTargets[i];
        const morphNormal = morphNormals[i];
        const morphColor = morphColors[i];
        const offset = width * height * 4 * i;
        for (let j = 0; j < morphTarget.count; j++) {
          const stride = j * vertexDataStride;
          if (hasMorphPosition === true) {
            this.#morph.fromBufferAttribute(morphTarget, j);
            buffer[offset + stride + 0] = this.#morph.x;
            buffer[offset + stride + 1] = this.#morph.y;
            buffer[offset + stride + 2] = this.#morph.z;
            buffer[offset + stride + 3] = 0;
          }
          if (hasMorphNormals === true) {
            this.#morph.fromBufferAttribute(morphNormal, j);
            buffer[offset + stride + 4] = this.#morph.x;
            buffer[offset + stride + 5] = this.#morph.y;
            buffer[offset + stride + 6] = this.#morph.z;
            buffer[offset + stride + 7] = 0;
          }
          if (hasMorphColors === true) {
            this.#morph.fromBufferAttribute(morphColor, j);
            buffer[offset + stride + 8] = this.#morph.x;
            buffer[offset + stride + 9] = this.#morph.y;
            buffer[offset + stride + 10] = this.#morph.z;
            buffer[offset + stride + 11] = morphColor.itemSize === 4 ? this.#morph.w : 1;
          }
        }
      }
      entry = {
        count: morphTargetsCount,
        texture,
        size: new Vector2(width, height)
      };
      this.#morphTextures.set(geometry, entry);
      const disposeTexture = () => {
        texture.dispose();
        this.#morphTextures.delete(geometry);
        geometry.removeEventListener("dispose", disposeTexture);
      };
      geometry.addEventListener("dispose", disposeTexture);
    }
    let morphInfluencesSum = 0;
    for (let i = 0; i < objectInfluences.length; i++) {
      morphInfluencesSum += objectInfluences[i];
    }
    const morphBaseInfluence = geometry.morphTargetsRelative ? 1 : 1 - morphInfluencesSum;
    program.getUniforms().setValue(gl, "morphTargetBaseInfluence", morphBaseInfluence);
    program.getUniforms().setValue(gl, "morphTargetInfluences", objectInfluences);
    program.getUniforms().setValue(gl, "morphTargetsTexture", entry.texture, textures);
    program.getUniforms().setValue(gl, "morphTargetsTextureSize", entry.size);
  }
}

class WebGLObjects {
  #gl;
  #geometries;
  #attributes;
  #info;
  #updateMap = /* @__PURE__ */ new WeakMap();
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLGeometries} geometries
   * @param {WebGLAttributes} attributes
   * @param {WebGLInfo} info
   */
  constructor(gl, geometries, attributes, info) {
    this.#gl = gl;
    this.#geometries = geometries;
    this.#attributes = attributes;
    this.#info = info;
  }
  update(object) {
    const frame = this.#info.render.frame;
    const geometry = object.geometry;
    const buffergeometry = this.#geometries.get(object, geometry);
    if (this.#updateMap.get(buffergeometry) !== frame) {
      this.#geometries.update(buffergeometry);
      this.#updateMap.set(buffergeometry, frame);
    }
    if (object.isInstancedMesh) {
      if (object.hasEventListener("dispose", this._onInstancedMeshDispose) === false) {
        object.addEventListener("dispose", this._onInstancedMeshDispose);
      }
      if (this.#updateMap.get(object) !== frame) {
        this.#attributes.update(object.instanceMatrix, this.#gl.ARRAY_BUFFER);
        if (object.instanceColor !== null) {
          this.#attributes.update(object.instanceColor, this.#gl.ARRAY_BUFFER);
        }
        this.#updateMap.set(object, frame);
      }
    }
    if (object.isSkinnedMesh) {
      const skeleton = object.skeleton;
      if (this.#updateMap.get(skeleton) !== frame) {
        skeleton.update();
        this.#updateMap.set(skeleton, frame);
      }
    }
    return buffergeometry;
  }
  dispose() {
    this.#updateMap = /* @__PURE__ */ new WeakMap();
  }
  _onInstancedMeshDispose(event) {
    const instancedMesh = event.target;
    instancedMesh.removeEventListener("dispose", this._onInstancedMeshDispose);
    this.#attributes.remove(instancedMesh.instanceMatrix);
    if (instancedMesh.instanceColor !== null) this.#attributes.remove(instancedMesh.instanceColor);
  }
}

function WebGLShader(gl, type, string) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, string);
  gl.compileShader(shader);
  return shader;
}

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
    if (u !== void 0) u.setValue(gl, value, textures);
  }
  setOptional(gl, object, name) {
    const v = object[name];
    if (v !== void 0) this.setValue(gl, name, v);
  }
  static upload(gl, seq, values, textures) {
    for (let i = 0, n = seq.length; i !== n; ++i) {
      const u = seq[i];
      const v = values[u.id];
      if (v.needsUpdate !== false) {
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
class SingleUniform {
  id;
  addr;
  cache = [];
  setValue;
  constructor(id, activeInfo, addr) {
    this.id = id;
    this.addr = addr;
    this.setValue = this.getSingularSetter(activeInfo.type);
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
    if (v.x !== void 0) {
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
    if (v.x !== void 0) {
      if (cache[0] !== v.x || cache[1] !== v.y || cache[2] !== v.z) {
        gl.uniform3f(this.addr, v.x, v.y, v.z);
        cache[0] = v.x;
        cache[1] = v.y;
        cache[2] = v.z;
      }
    } else if (v.r !== void 0) {
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
    if (v.x !== void 0) {
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
    if (elements === void 0) {
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
    if (elements === void 0) {
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
    if (elements === void 0) {
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
    if (v.x !== void 0) {
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
    if (v.x !== void 0) {
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
    if (v.x !== void 0) {
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
    if (v.x !== void 0) {
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
    if (v.x !== void 0) {
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
    if (v.x !== void 0) {
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
      case 5126:
        return this.setValueV1f;
      // FLOAT
      case 35664:
        return this.setValueV2f;
      // _VEC2
      case 35665:
        return this.setValueV3f;
      // _VEC3
      case 35666:
        return this.setValueV4f;
      // _VEC4
      case 35674:
        return this.setValueM2;
      // _MAT2
      case 35675:
        return this.setValueM3;
      // _MAT3
      case 35676:
        return this.setValueM4;
      // _MAT4
      case 5124:
      case 35670:
        return this.setValueV1i;
      // INT, BOOL
      case 35667:
      case 35671:
        return this.setValueV2i;
      // _VEC2
      case 35668:
      case 35672:
        return this.setValueV3i;
      // _VEC3
      case 35669:
      case 35673:
        return this.setValueV4i;
      // _VEC4
      case 5125:
        return this.setValueV1ui;
      // UINT
      case 36294:
        return this.setValueV2ui;
      // _VEC2
      case 36295:
        return this.setValueV3ui;
      // _VEC3
      case 36296:
        return this.setValueV4ui;
      // _VEC4
      case 35678:
      // SAMPLER_2D
      case 36198:
      // SAMPLER_EXTERNAL_OES
      case 36298:
      // INT_SAMPLER_2D
      case 36306:
      // UNSIGNED_INT_SAMPLER_2D
      case 35682:
        return this.setValueT1;
      case 35679:
      // SAMPLER_3D
      case 36299:
      // INT_SAMPLER_3D
      case 36307:
        return this.setValueT3D1;
      case 35680:
      // SAMPLER_CUBE
      case 36300:
      // INT_SAMPLER_CUBE
      case 36308:
      // UNSIGNED_INT_SAMPLER_CUBE
      case 36293:
        return this.setValueT6;
      case 36289:
      // SAMPLER_2D_ARRAY
      case 36303:
      // INT_SAMPLER_2D_ARRAY
      case 36311:
      // UNSIGNED_INT_SAMPLER_2D_ARRAY
      case 36292:
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
      case 5126:
        return this.setValueV1fArray;
      // FLOAT
      case 35664:
        return this.setValueV2fArray;
      // _VEC2
      case 35665:
        return this.setValueV3fArray;
      // _VEC3
      case 35666:
        return this.setValueV4fArray;
      // _VEC4
      case 35674:
        return this.setValueM2Array;
      // _MAT2
      case 35675:
        return this.setValueM3Array;
      // _MAT3
      case 35676:
        return this.setValueM4Array;
      // _MAT4
      case 5124:
      case 35670:
        return this.setValueV1iArray;
      // INT, BOOL
      case 35667:
      case 35671:
        return this.setValueV2iArray;
      // _VEC2
      case 35668:
      case 35672:
        return this.setValueV3iArray;
      // _VEC3
      case 35669:
      case 35673:
        return this.setValueV4iArray;
      // _VEC4
      case 5125:
        return this.setValueV1uiArray;
      // UINT
      case 36294:
        return this.setValueV2uiArray;
      // _VEC2
      case 36295:
        return this.setValueV3uiArray;
      // _VEC3
      case 36296:
        return this.setValueV4uiArray;
      // _VEC4
      case 35678:
      // SAMPLER_2D
      case 36198:
      // SAMPLER_EXTERNAL_OES
      case 36298:
      // INT_SAMPLER_2D
      case 36306:
      // UNSIGNED_INT_SAMPLER_2D
      case 35682:
        return this.setValueT1Array;
      case 35679:
      // SAMPLER_3D
      case 36299:
      // INT_SAMPLER_3D
      case 36307:
        return this.setValueT3DArray;
      case 35680:
      // SAMPLER_CUBE
      case 36300:
      // INT_SAMPLER_CUBE
      case 36308:
      // UNSIGNED_INT_SAMPLER_CUBE
      case 36293:
        return this.setValueT6Array;
      case 36289:
      // SAMPLER_2D_ARRAY
      case 36303:
      // INT_SAMPLER_2D_ARRAY
      case 36311:
      // UNSIGNED_INT_SAMPLER_2D_ARRAY
      case 36292:
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
const _RePathPart = /(\w+)(\])?(\[|\.)?/g;
function _addUniform(container, uniformObject) {
  container.seq.push(uniformObject);
  container.map[uniformObject.id] = uniformObject;
}
function _parseUniform(activeInfo, addr, container) {
  const path = activeInfo.name;
  const pathLength = path.length;
  _RePathPart.lastIndex = 0;
  while (true) {
    const match = _RePathPart.exec(path);
    const matchEnd = _RePathPart.lastIndex;
    let id = match[1];
    const idIsIndex = match[2] === "]";
    const subscript = match[3];
    if (idIsIndex) id = id | 0;
    if (subscript === void 0 || subscript === "[" && matchEnd + 2 === pathLength) {
      _addUniform(
        container,
        subscript === void 0 ? new SingleUniform(id, activeInfo, addr) : new PureArrayUniform(id, activeInfo, addr)
      );
      break;
    } else {
      const map = container.map;
      let next = map[id];
      if (next === void 0) {
        next = new StructuredUniform(id);
        _addUniform(container, next);
      }
      container = next;
    }
  }
}
function _flatten(array, nBlocks, blockSize) {
  const firstElem = array[0];
  if (firstElem <= 0 || firstElem > 0) return array;
  const n = nBlocks * blockSize;
  let r = _arrayCacheF32[n];
  if (r === void 0) {
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
function _allocTexUnits(textures, n) {
  let r = _arrayCacheI32[n];
  if (r === void 0) {
    r = new Int32Array(n);
    _arrayCacheI32[n] = r;
  }
  for (let i = 0; i !== n; ++i) {
    r[i] = textures.allocateTextureUnit();
  }
  return r;
}
const _emptyTexture = /* @__PURE__ */ new Texture();
const _emptyArrayTexture = /* @__PURE__ */ new DataArrayTexture();
const _empty3dTexture = /* @__PURE__ */ new Data3DTexture();
const _emptyCubeTexture = /* @__PURE__ */ new CubeTexture();
const _arrayCacheF32 = [];
const _arrayCacheI32 = [];
const _mat4array = new Float32Array(16);
const _mat3array = new Float32Array(9);
const _mat2array = new Float32Array(4);

class WebGLProgram {
  #gl;
  #renderer;
  #bindingStates;
  // set up caching for uniform locations
  #cachedUniforms;
  // set up caching for attribute locations
  #cachedAttributes;
  // indicate when the program is ready to be used.
  #programReady;
  // diagnostics
  #prefixVertex;
  #prefixFragment;
  // public
  type;
  name;
  id = _programIdCount++;
  cacheKey;
  usedTimes = 1;
  program;
  vertexShader;
  fragmentShader;
  /**
   * @param {WebGLRenderer} renderer
   * @param {WebGLBindingStates} bindingStates
   */
  constructor(renderer, cacheKey, parameters, bindingStates) {
    this.#gl = renderer.getContext();
    this.#renderer = renderer;
    this.#bindingStates = bindingStates;
    const gl = this.#gl;
    const defines = parameters.defines;
    let vertexShader = parameters.vertexShader;
    let fragmentShader = parameters.fragmentShader;
    const shadowMapTypeDefine = _generateShadowMapTypeDefine(parameters);
    const envMapTypeDefine = _generateEnvMapTypeDefine(parameters);
    const envMapModeDefine = _generateEnvMapModeDefine(parameters);
    const envMapBlendingDefine = _generateEnvMapBlendingDefine(parameters);
    const envMapCubeUVSize = _generateCubeUVSize(parameters);
    const customExtensions = "";
    const customDefines = _generateDefines(defines);
    this.program = gl.createProgram();
    let prefixVertex;
    let prefixFragment;
    let versionString = parameters.glslVersion ? `#version ${parameters.glslVersion}
` : "";
    if (parameters.isRawShaderMaterial) {
      prefixVertex = [
        `#define SHADER_TYPE ${parameters.shaderType}`,
        `#define SHADER_NAME ${parameters.shaderName}`,
        customDefines
      ].filter(_filterEmptyLine).join("\n");
      if (prefixVertex.length > 0) {
        prefixVertex += "\n";
      }
      prefixFragment = [
        customExtensions,
        `#define SHADER_TYPE ${parameters.shaderType}`,
        `#define SHADER_NAME ${parameters.shaderName}`,
        customDefines
      ].filter(_filterEmptyLine).join("\n");
      if (prefixFragment.length > 0) {
        prefixFragment += "\n";
      }
    } else {
      prefixVertex = [
        _generatePrecision(parameters),
        `#define SHADER_TYPE ${parameters.shaderType}`,
        `#define SHADER_NAME ${parameters.shaderName}`,
        customDefines,
        parameters.instancing ? "#define USE_INSTANCING" : "",
        parameters.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
        parameters.useFog && parameters.fog ? "#define USE_FOG" : "",
        parameters.useFog && parameters.fogExp2 ? "#define FOG_EXP2" : "",
        parameters.map ? "#define USE_MAP" : "",
        parameters.envMap ? "#define USE_ENVMAP" : "",
        parameters.envMap ? `#define ${envMapModeDefine}` : "",
        parameters.lightMap ? "#define USE_LIGHTMAP" : "",
        parameters.aoMap ? "#define USE_AOMAP" : "",
        parameters.bumpMap ? "#define USE_BUMPMAP" : "",
        parameters.normalMap ? "#define USE_NORMALMAP" : "",
        parameters.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
        parameters.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
        parameters.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
        parameters.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
        parameters.anisotropy ? "#define USE_ANISOTROPY" : "",
        parameters.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
        parameters.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
        parameters.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
        parameters.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
        parameters.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
        parameters.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
        parameters.specularMap ? "#define USE_SPECULARMAP" : "",
        parameters.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
        parameters.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
        parameters.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
        parameters.metalnessMap ? "#define USE_METALNESSMAP" : "",
        parameters.alphaMap ? "#define USE_ALPHAMAP" : "",
        parameters.alphaHash ? "#define USE_ALPHAHASH" : "",
        parameters.transmission ? "#define USE_TRANSMISSION" : "",
        parameters.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
        parameters.thicknessMap ? "#define USE_THICKNESSMAP" : "",
        parameters.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
        parameters.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
        //
        parameters.mapUv ? `#define MAP_UV ${parameters.mapUv}` : "",
        parameters.alphaMapUv ? `#define ALPHAMAP_UV ${parameters.alphaMapUv}` : "",
        parameters.lightMapUv ? `#define LIGHTMAP_UV ${parameters.lightMapUv}` : "",
        parameters.aoMapUv ? `#define AOMAP_UV ${parameters.aoMapUv}` : "",
        parameters.emissiveMapUv ? `#define EMISSIVEMAP_UV ${parameters.emissiveMapUv}` : "",
        parameters.bumpMapUv ? `#define BUMPMAP_UV ${parameters.bumpMapUv}` : "",
        parameters.normalMapUv ? `#define NORMALMAP_UV ${parameters.normalMapUv}` : "",
        parameters.displacementMapUv ? `#define DISPLACEMENTMAP_UV ${parameters.displacementMapUv}` : "",
        parameters.metalnessMapUv ? `#define METALNESSMAP_UV ${parameters.metalnessMapUv}` : "",
        parameters.roughnessMapUv ? `#define ROUGHNESSMAP_UV ${parameters.roughnessMapUv}` : "",
        parameters.anisotropyMapUv ? `#define ANISOTROPYMAP_UV ${parameters.anisotropyMapUv}` : "",
        parameters.clearcoatMapUv ? `#define CLEARCOATMAP_UV ${parameters.clearcoatMapUv}` : "",
        parameters.clearcoatNormalMapUv ? `#define CLEARCOAT_NORMALMAP_UV ${parameters.clearcoatNormalMapUv}` : "",
        parameters.clearcoatRoughnessMapUv ? `#define CLEARCOAT_ROUGHNESSMAP_UV ${parameters.clearcoatRoughnessMapUv}` : "",
        parameters.iridescenceMapUv ? `#define IRIDESCENCEMAP_UV ${parameters.iridescenceMapUv}` : "",
        parameters.iridescenceThicknessMapUv ? `#define IRIDESCENCE_THICKNESSMAP_UV ${parameters.iridescenceThicknessMapUv}` : "",
        parameters.sheenColorMapUv ? `#define SHEEN_COLORMAP_UV ${parameters.sheenColorMapUv}` : "",
        parameters.sheenRoughnessMapUv ? `#define SHEEN_ROUGHNESSMAP_UV ${parameters.sheenRoughnessMapUv}` : "",
        parameters.specularMapUv ? `#define SPECULARMAP_UV ${parameters.specularMapUv}` : "",
        parameters.specularColorMapUv ? `#define SPECULAR_COLORMAP_UV ${parameters.specularColorMapUv}` : "",
        parameters.specularIntensityMapUv ? `#define SPECULAR_INTENSITYMAP_UV ${parameters.specularIntensityMapUv}` : "",
        parameters.transmissionMapUv ? `#define TRANSMISSIONMAP_UV ${parameters.transmissionMapUv}` : "",
        parameters.thicknessMapUv ? `#define THICKNESSMAP_UV ${parameters.thicknessMapUv}` : "",
        //
        parameters.vertexTangents && parameters.flatShading === false ? "#define USE_TANGENT" : "",
        parameters.vertexColors ? "#define USE_COLOR" : "",
        parameters.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
        parameters.vertexUv1s ? "#define USE_UV1" : "",
        parameters.vertexUv2s ? "#define USE_UV2" : "",
        parameters.vertexUv3s ? "#define USE_UV3" : "",
        parameters.pointsUvs ? "#define USE_POINTS_UV" : "",
        parameters.flatShading ? "#define FLAT_SHADED" : "",
        parameters.skinning ? "#define USE_SKINNING" : "",
        parameters.morphTargets ? "#define USE_MORPHTARGETS" : "",
        parameters.morphNormals && parameters.flatShading === false ? "#define USE_MORPHNORMALS" : "",
        parameters.morphColors ? "#define USE_MORPHCOLORS" : "",
        parameters.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE" : "",
        parameters.morphTargetsCount > 0 ? `#define MORPHTARGETS_TEXTURE_STRIDE ${parameters.morphTextureStride}` : "",
        parameters.morphTargetsCount > 0 ? `#define MORPHTARGETS_COUNT ${parameters.morphTargetsCount}` : "",
        parameters.doubleSided ? "#define DOUBLE_SIDED" : "",
        parameters.flipSided ? "#define FLIP_SIDED" : "",
        parameters.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
        parameters.shadowMapEnabled ? `#define ${shadowMapTypeDefine}` : "",
        parameters.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
        parameters.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
        parameters.useLegacyLights ? "#define LEGACY_LIGHTS" : "",
        parameters.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
        parameters.logarithmicDepthBuffer && parameters.rendererExtensionFragDepth ? "#define USE_LOGDEPTHBUF_EXT" : "",
        "uniform mat4 modelMatrix;",
        "uniform mat4 modelViewMatrix;",
        "uniform mat4 projectionMatrix;",
        "uniform mat4 viewMatrix;",
        "uniform mat3 normalMatrix;",
        "uniform vec3 cameraPosition;",
        "uniform bool isOrthographic;",
        "#ifdef USE_INSTANCING",
        "	attribute mat4 instanceMatrix;",
        "#endif",
        "#ifdef USE_INSTANCING_COLOR",
        "	attribute vec3 instanceColor;",
        "#endif",
        "attribute vec3 position;",
        "attribute vec3 normal;",
        "attribute vec2 uv;",
        "#ifdef USE_UV1",
        "	attribute vec2 uv1;",
        "#endif",
        "#ifdef USE_UV2",
        "	attribute vec2 uv2;",
        "#endif",
        "#ifdef USE_UV3",
        "	attribute vec2 uv3;",
        "#endif",
        "#ifdef USE_TANGENT",
        "	attribute vec4 tangent;",
        "#endif",
        "#if defined( USE_COLOR_ALPHA )",
        "	attribute vec4 color;",
        "#elif defined( USE_COLOR )",
        "	attribute vec3 color;",
        "#endif",
        "#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )",
        "	attribute vec3 morphTarget0;",
        "	attribute vec3 morphTarget1;",
        "	attribute vec3 morphTarget2;",
        "	attribute vec3 morphTarget3;",
        "	#ifdef USE_MORPHNORMALS",
        "		attribute vec3 morphNormal0;",
        "		attribute vec3 morphNormal1;",
        "		attribute vec3 morphNormal2;",
        "		attribute vec3 morphNormal3;",
        "	#else",
        "		attribute vec3 morphTarget4;",
        "		attribute vec3 morphTarget5;",
        "		attribute vec3 morphTarget6;",
        "		attribute vec3 morphTarget7;",
        "	#endif",
        "#endif",
        "#ifdef USE_SKINNING",
        "	attribute vec4 skinIndex;",
        "	attribute vec4 skinWeight;",
        "#endif",
        "\n"
      ].filter(_filterEmptyLine).join("\n");
      prefixFragment = [
        customExtensions,
        _generatePrecision(parameters),
        `#define SHADER_TYPE ${parameters.shaderType}`,
        `#define SHADER_NAME ${parameters.shaderName}`,
        customDefines,
        parameters.useFog && parameters.fog ? "#define USE_FOG" : "",
        parameters.useFog && parameters.fogExp2 ? "#define FOG_EXP2" : "",
        parameters.map ? "#define USE_MAP" : "",
        parameters.matcap ? "#define USE_MATCAP" : "",
        parameters.envMap ? "#define USE_ENVMAP" : "",
        parameters.envMap ? `#define ${envMapTypeDefine}` : "",
        parameters.envMap ? `#define ${envMapModeDefine}` : "",
        parameters.envMap ? `#define ${envMapBlendingDefine}` : "",
        envMapCubeUVSize ? `#define CUBEUV_TEXEL_WIDTH ${envMapCubeUVSize.texelWidth}` : "",
        envMapCubeUVSize ? `#define CUBEUV_TEXEL_HEIGHT ${envMapCubeUVSize.texelHeight}` : "",
        envMapCubeUVSize ? `#define CUBEUV_MAX_MIP ${envMapCubeUVSize.maxMip}.0` : "",
        parameters.lightMap ? "#define USE_LIGHTMAP" : "",
        parameters.aoMap ? "#define USE_AOMAP" : "",
        parameters.bumpMap ? "#define USE_BUMPMAP" : "",
        parameters.normalMap ? "#define USE_NORMALMAP" : "",
        parameters.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
        parameters.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
        parameters.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
        parameters.anisotropy ? "#define USE_ANISOTROPY" : "",
        parameters.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
        parameters.clearcoat ? "#define USE_CLEARCOAT" : "",
        parameters.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
        parameters.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
        parameters.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
        parameters.iridescence ? "#define USE_IRIDESCENCE" : "",
        parameters.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
        parameters.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
        parameters.specularMap ? "#define USE_SPECULARMAP" : "",
        parameters.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
        parameters.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
        parameters.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
        parameters.metalnessMap ? "#define USE_METALNESSMAP" : "",
        parameters.alphaMap ? "#define USE_ALPHAMAP" : "",
        parameters.alphaTest ? "#define USE_ALPHATEST" : "",
        parameters.alphaHash ? "#define USE_ALPHAHASH" : "",
        parameters.sheen ? "#define USE_SHEEN" : "",
        parameters.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
        parameters.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
        parameters.transmission ? "#define USE_TRANSMISSION" : "",
        parameters.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
        parameters.thicknessMap ? "#define USE_THICKNESSMAP" : "",
        parameters.vertexTangents && parameters.flatShading === false ? "#define USE_TANGENT" : "",
        parameters.vertexColors || parameters.instancingColor ? "#define USE_COLOR" : "",
        parameters.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
        parameters.vertexUv1s ? "#define USE_UV1" : "",
        parameters.vertexUv2s ? "#define USE_UV2" : "",
        parameters.vertexUv3s ? "#define USE_UV3" : "",
        parameters.pointsUvs ? "#define USE_POINTS_UV" : "",
        parameters.gradientMap ? "#define USE_GRADIENTMAP" : "",
        parameters.flatShading ? "#define FLAT_SHADED" : "",
        parameters.doubleSided ? "#define DOUBLE_SIDED" : "",
        parameters.flipSided ? "#define FLIP_SIDED" : "",
        parameters.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
        parameters.shadowMapEnabled ? `#define ${shadowMapTypeDefine}` : "",
        parameters.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
        parameters.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
        parameters.useLegacyLights ? "#define LEGACY_LIGHTS" : "",
        parameters.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
        parameters.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
        parameters.logarithmicDepthBuffer && parameters.rendererExtensionFragDepth ? "#define USE_LOGDEPTHBUF_EXT" : "",
        "uniform mat4 viewMatrix;",
        "uniform vec3 cameraPosition;",
        "uniform bool isOrthographic;",
        parameters.toneMapping !== NoToneMapping ? "#define TONE_MAPPING" : "",
        parameters.toneMapping !== NoToneMapping ? ShaderChunk["tonemapping_pars_fragment"] : "",
        // this code is required here because it is used by the toneMapping() function defined below
        parameters.toneMapping !== NoToneMapping ? _getToneMappingFunction("toneMapping", parameters.toneMapping) : "",
        parameters.dithering ? "#define DITHERING" : "",
        parameters.opaque ? "#define OPAQUE" : "",
        ShaderChunk["colorspace_pars_fragment"],
        // this code is required here because it is used by the various encoding/decoding function defined below
        _getTexelEncodingFunction("linearToOutputTexel", parameters.outputColorSpace),
        parameters.useDepthPacking ? `#define DEPTH_PACKING ${parameters.depthPacking}` : "",
        "\n"
      ].filter(_filterEmptyLine).join("\n");
    }
    vertexShader = _resolveIncludes(vertexShader);
    vertexShader = _replaceLightNums(vertexShader, parameters);
    vertexShader = _replaceClippingPlaneNums(vertexShader, parameters);
    fragmentShader = _resolveIncludes(fragmentShader);
    fragmentShader = _replaceLightNums(fragmentShader, parameters);
    fragmentShader = _replaceClippingPlaneNums(fragmentShader, parameters);
    vertexShader = _unrollLoops(vertexShader);
    fragmentShader = _unrollLoops(fragmentShader);
    if (parameters.isRawShaderMaterial !== true) {
      versionString = "#version 300 es\n";
      prefixVertex = [
        "precision mediump sampler2DArray;",
        "#define attribute in",
        "#define varying out",
        "#define texture2D texture"
      ].join("\n") + "\n" + prefixVertex;
      prefixFragment = [
        "precision mediump sampler2DArray;",
        "#define varying in",
        parameters.glslVersion === GLSL3 ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
        parameters.glslVersion === GLSL3 ? "" : "#define gl_FragColor pc_fragColor",
        "#define gl_FragDepthEXT gl_FragDepth",
        "#define texture2D texture",
        "#define textureCube texture",
        "#define texture2DProj textureProj",
        "#define texture2DLodEXT textureLod",
        "#define texture2DProjLodEXT textureProjLod",
        "#define textureCubeLodEXT textureLod",
        "#define texture2DGradEXT textureGrad",
        "#define texture2DProjGradEXT textureProjGrad",
        "#define textureCubeGradEXT textureGrad"
      ].join("\n") + "\n" + prefixFragment;
    }
    const _vertexGlsl = versionString + prefixVertex + vertexShader;
    const _fragmentGlsl = versionString + prefixFragment + fragmentShader;
    const _glVertexShader = WebGLShader(gl, gl.VERTEX_SHADER, _vertexGlsl);
    const _glFragmentShader = WebGLShader(gl, gl.FRAGMENT_SHADER, _fragmentGlsl);
    gl.attachShader(this.program, _glVertexShader);
    gl.attachShader(this.program, _glFragmentShader);
    if (parameters.index0AttributeName !== void 0) {
      gl.bindAttribLocation(this.program, 0, parameters.index0AttributeName);
    } else if (parameters.morphTargets === true) {
      gl.bindAttribLocation(this.program, 0, "position");
    }
    gl.linkProgram(this.program);
    this.#programReady = parameters.rendererExtensionParallelShaderCompile === false;
    this.#prefixVertex = prefixVertex;
    this.#prefixFragment = prefixFragment;
    this.type = parameters.shaderType;
    this.name = parameters.shaderName;
    this.cacheKey = cacheKey;
    this.vertexShader = _glVertexShader;
    this.fragmentShader = _glFragmentShader;
  }
  #onFirstUse(self) {
    const gl = this.#gl;
    const renderer = this.#renderer;
    if (renderer.debug.checkShaderErrors) {
      const programLog = gl.getProgramInfoLog(this.program).trim();
      const vertexLog = gl.getShaderInfoLog(this.vertexShader).trim();
      const fragmentLog = gl.getShaderInfoLog(this.fragmentShader).trim();
      let runnable = true;
      let haveDiagnostics = true;
      if (gl.getProgramParameter(this.program, gl.LINK_STATUS) === false) {
        runnable = false;
        if (typeof renderer.debug.onShaderError === "function") {
          renderer.debug.onShaderError(gl, this.program, this.vertexShader, this.fragmentShader);
        } else {
          const vertexErrors = _getShaderErrors(gl, this.vertexShader, "vertex");
          const fragmentErrors = _getShaderErrors(gl, this.fragmentShader, "fragment");
          console.error(
            `WebGLProgram: Shader Error ${gl.getError()} - VALIDATE_STATUS ${gl.getProgramParameter(
              this.program,
              gl.VALIDATE_STATUS
            )}

Program Info Log: ${programLog}
${vertexErrors}
${fragmentErrors}`
          );
        }
      } else if (programLog !== "") {
        console.warn("WebGLProgram: Program Info Log:", programLog);
      } else if (vertexLog === "" || fragmentLog === "") {
        haveDiagnostics = false;
      }
      if (haveDiagnostics) {
        self.diagnostics = {
          runnable,
          programLog,
          vertexShader: {
            log: vertexLog,
            prefix: this.#prefixVertex
          },
          fragmentShader: {
            log: fragmentLog,
            prefix: this.#prefixFragment
          }
        };
      }
    }
    gl.deleteShader(this.vertexShader);
    gl.deleteShader(this.fragmentShader);
    this.#cachedUniforms = new WebGLUniforms(gl, this.program);
    this.#cachedAttributes = _fetchAttributeLocations(gl, this.program);
  }
  getUniforms() {
    if (this.#cachedUniforms === void 0) {
      this.#onFirstUse(this);
    }
    return this.#cachedUniforms;
  }
  getAttributes() {
    if (this.#cachedAttributes === void 0) {
      this.#onFirstUse(this);
    }
    return this.#cachedAttributes;
  }
  isReady() {
    if (this.#programReady === false) {
      this.#programReady = this.#gl.getProgramParameter(this.program, COMPLETION_STATUS_KHR);
    }
    return this.#programReady;
  }
  destroy() {
    this.#bindingStates.releaseStatesOfProgram(this);
    this.#gl.deleteProgram(this.program);
    this.program = void 0;
  }
}
function _handleSource(string, errorLine) {
  const lines = string.split("\n");
  const lines2 = [];
  const from = Math.max(errorLine - 6, 0);
  const to = Math.min(errorLine + 6, lines.length);
  for (let i = from; i < to; i++) {
    const line = i + 1;
    lines2.push(`${line === errorLine ? ">" : " "} ${line}: ${lines[i]}`);
  }
  return lines2.join("\n");
}
function _getEncodingComponents(colorSpace) {
  const workingPrimaries = ColorManagement.getPrimaries(ColorManagement.workingColorSpace);
  const encodingPrimaries = ColorManagement.getPrimaries(colorSpace);
  let gamutMapping;
  if (workingPrimaries === encodingPrimaries) {
    gamutMapping = "";
  } else if (workingPrimaries === P3Primaries && encodingPrimaries === Rec709Primaries) {
    gamutMapping = "LinearDisplayP3ToLinearSRGB";
  } else if (workingPrimaries === Rec709Primaries && encodingPrimaries === P3Primaries) {
    gamutMapping = "LinearSRGBToLinearDisplayP3";
  }
  switch (colorSpace) {
    case LinearSRGBColorSpace:
    case LinearDisplayP3ColorSpace:
      return [gamutMapping, "LinearTransferOETF"];
    case SRGBColorSpace:
    case DisplayP3ColorSpace:
      return [gamutMapping, "sRGBTransferOETF"];
    default:
      console.warn("WebGLProgram: Unsupported color space:", colorSpace);
      return [gamutMapping, "LinearTransferOETF"];
  }
}
function _getShaderErrors(gl, shader, type) {
  const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  const errors = gl.getShaderInfoLog(shader).trim();
  if (status && errors === "") return "";
  const errorMatches = /ERROR: 0:(\d+)/.exec(errors);
  if (errorMatches) {
    const errorLine = parseInt(errorMatches[1]);
    return `${type.toUpperCase()}

${errors}

${_handleSource(
      gl.getShaderSource(shader),
      errorLine
    )}`;
  } else {
    return errors;
  }
}
function _getTexelEncodingFunction(functionName, colorSpace) {
  const components = _getEncodingComponents(colorSpace);
  return `vec4 ${functionName}( vec4 value ) { return ${components[0]}( ${components[1]}( value ) ); }`;
}
function _getToneMappingFunction(functionName, toneMapping) {
  let toneMappingName;
  switch (toneMapping) {
    case LinearToneMapping:
      toneMappingName = "Linear";
      break;
    case ReinhardToneMapping:
      toneMappingName = "Reinhard";
      break;
    case CineonToneMapping:
      toneMappingName = "OptimizedCineon";
      break;
    case ACESFilmicToneMapping:
      toneMappingName = "ACESFilmic";
      break;
    case CustomToneMapping:
      toneMappingName = "Custom";
      break;
    default:
      console.warn("WebGLProgram: Unsupported toneMapping:", toneMapping);
      toneMappingName = "Linear";
  }
  return `vec3 ${functionName}( vec3 color ) { return ${toneMappingName}ToneMapping( color ); }`;
}
function _generateDefines(defines) {
  const chunks = [];
  for (const name in defines) {
    const value = defines[name];
    if (value === false) continue;
    chunks.push(`#define ${name} ${value}`);
  }
  return chunks.join("\n");
}
function _fetchAttributeLocations(gl, program) {
  const attributes = {};
  const n = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveAttrib(program, i);
    const name = info.name;
    let locationSize = 1;
    if (info.type === gl.FLOAT_MAT2) locationSize = 2;
    if (info.type === gl.FLOAT_MAT3) locationSize = 3;
    if (info.type === gl.FLOAT_MAT4) locationSize = 4;
    attributes[name] = {
      type: info.type,
      location: gl.getAttribLocation(program, name),
      locationSize
    };
  }
  return attributes;
}
function _filterEmptyLine(string) {
  return string !== "";
}
function _replaceLightNums(string, parameters) {
  const numSpotLightCoords = parameters.numSpotLightShadows + parameters.numSpotLightMaps - parameters.numSpotLightShadowsWithMaps;
  return string.replace(/NUM_DIR_LIGHTS/g, parameters.numDirLights).replace(/NUM_SPOT_LIGHTS/g, parameters.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, parameters.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, numSpotLightCoords).replace(/NUM_RECT_AREA_LIGHTS/g, parameters.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, parameters.numPointLights).replace(/NUM_HEMI_LIGHTS/g, parameters.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, parameters.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, parameters.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, parameters.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, parameters.numPointLightShadows);
}
function _replaceClippingPlaneNums(string, parameters) {
  return string.replace(/NUM_CLIPPING_PLANES/g, parameters.numClippingPlanes).replace(
    /UNION_CLIPPING_PLANES/g,
    parameters.numClippingPlanes - parameters.numClipIntersection
  );
}
const _includePattern = /^[ \t]*#include +<([\w\d./]+)>/gm;
function _resolveIncludes(string) {
  return string.replace(_includePattern, _includeReplacer);
}
const _shaderChunkMap = /* @__PURE__ */ new Map([
  ["encodings_fragment", "colorspace_fragment"],
  // @deprecated, r154
  ["encodings_pars_fragment", "colorspace_pars_fragment"],
  // @deprecated, r154
  ["output_fragment", "opaque_fragment"]
  // @deprecated, r154
]);
function _includeReplacer(match, include) {
  let string = ShaderChunk[include];
  if (string === void 0) {
    const newInclude = _shaderChunkMap.get(include);
    if (newInclude !== void 0) {
      string = ShaderChunk[newInclude];
      console.warn(
        `WebGLRenderer: Shader chunk '${include}' has been deprecated. Use '${newInclude}' instead.`
      );
    } else {
      throw new Error(`Can not resolve #include <${include}>`);
    }
  }
  return _resolveIncludes(string);
}
const _unrollLoopPattern = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function _unrollLoops(string) {
  return string.replace(_unrollLoopPattern, _loopReplacer);
}
function _loopReplacer(match, start, end, snippet) {
  let string = "";
  for (let i = parseInt(start); i < parseInt(end); i++) {
    string += snippet.replace(/\[\s*i\s*\]/g, `[ ${i} ]`).replace(/UNROLLED_LOOP_INDEX/g, i);
  }
  return string;
}
function _generatePrecision(parameters) {
  let precisionString = `precision ${parameters.precision} float;
precision ${parameters.precision} int;`;
  if (parameters.precision === "highp") {
    precisionString += "\n#define HIGH_PRECISION";
  } else if (parameters.precision === "mediump") {
    precisionString += "\n#define MEDIUM_PRECISION";
  } else if (parameters.precision === "lowp") {
    precisionString += "\n#define LOW_PRECISION";
  }
  return precisionString;
}
function _generateShadowMapTypeDefine(parameters) {
  let shadowMapTypeDefine = "SHADOWMAP_TYPE_BASIC";
  if (parameters.shadowMapType === PCFShadowMap) {
    shadowMapTypeDefine = "SHADOWMAP_TYPE_PCF";
  } else if (parameters.shadowMapType === PCFSoftShadowMap) {
    shadowMapTypeDefine = "SHADOWMAP_TYPE_PCF_SOFT";
  } else if (parameters.shadowMapType === VSMShadowMap) {
    shadowMapTypeDefine = "SHADOWMAP_TYPE_VSM";
  }
  return shadowMapTypeDefine;
}
function _generateEnvMapTypeDefine(parameters) {
  let envMapTypeDefine = "ENVMAP_TYPE_CUBE";
  if (parameters.envMap) {
    switch (parameters.envMapMode) {
      case CubeReflectionMapping:
      case CubeRefractionMapping:
        envMapTypeDefine = "ENVMAP_TYPE_CUBE";
        break;
      case CubeUVReflectionMapping:
        envMapTypeDefine = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  }
  return envMapTypeDefine;
}
function _generateEnvMapModeDefine(parameters) {
  let envMapModeDefine = "ENVMAP_MODE_REFLECTION";
  if (parameters.envMap) {
    switch (parameters.envMapMode) {
      case CubeRefractionMapping:
        envMapModeDefine = "ENVMAP_MODE_REFRACTION";
        break;
    }
  }
  return envMapModeDefine;
}
function _generateEnvMapBlendingDefine(parameters) {
  let envMapBlendingDefine = "ENVMAP_BLENDING_NONE";
  if (parameters.envMap) {
    switch (parameters.combine) {
      case MultiplyOperation:
        envMapBlendingDefine = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case MixOperation:
        envMapBlendingDefine = "ENVMAP_BLENDING_MIX";
        break;
      case AddOperation:
        envMapBlendingDefine = "ENVMAP_BLENDING_ADD";
        break;
    }
  }
  return envMapBlendingDefine;
}
function _generateCubeUVSize(parameters) {
  const imageHeight = parameters.envMapCubeUVHeight;
  if (imageHeight === null) return null;
  const maxMip = Math.log2(imageHeight) - 2;
  const texelHeight = 1 / imageHeight;
  const texelWidth = 1 / (3 * Math.max(Math.pow(2, maxMip), 7 * 16));
  return { texelWidth, texelHeight, maxMip };
}
const COMPLETION_STATUS_KHR = 37297;
let _programIdCount = 0;

class WebGLShaderCache {
  shaderCache = /* @__PURE__ */ new Map();
  materialCache = /* @__PURE__ */ new Map();
  dispose() {
    this.shaderCache.clear();
    this.materialCache.clear();
  }
  update(material) {
    const vertexShader = material.vertexShader;
    const fragmentShader = material.fragmentShader;
    const vertexShaderStage = this.#getShaderStage(vertexShader);
    const fragmentShaderStage = this.#getShaderStage(fragmentShader);
    const materialShaders = this.#getShaderCacheForMaterial(material);
    if (materialShaders.has(vertexShaderStage) === false) {
      materialShaders.add(vertexShaderStage);
      vertexShaderStage.usedTimes++;
    }
    if (materialShaders.has(fragmentShaderStage) === false) {
      materialShaders.add(fragmentShaderStage);
      fragmentShaderStage.usedTimes++;
    }
    return this;
  }
  remove(material) {
    const materialShaders = this.materialCache.get(material);
    for (const shaderStage of materialShaders) {
      shaderStage.usedTimes--;
      if (shaderStage.usedTimes === 0) this.shaderCache.delete(shaderStage.code);
    }
    this.materialCache.delete(material);
    return this;
  }
  getVertexShaderID(material) {
    return this.#getShaderStage(material.vertexShader).id;
  }
  getFragmentShaderID(material) {
    return this.#getShaderStage(material.fragmentShader).id;
  }
  #getShaderCacheForMaterial(material) {
    const cache = this.materialCache;
    let set = cache.get(material);
    if (set === void 0) {
      set = /* @__PURE__ */ new Set();
      cache.set(material, set);
    }
    return set;
  }
  #getShaderStage(code) {
    const cache = this.shaderCache;
    let stage = cache.get(code);
    if (stage === void 0) {
      stage = new WebGLShaderStage(code);
      cache.set(code, stage);
    }
    return stage;
  }
}
class WebGLShaderStage {
  id = _shaderStageId++;
  code;
  usedTimes = 0;
  constructor(code) {
    this.code = code;
  }
}
let _shaderStageId = 0;

class WebGLPrograms {
  #renderer;
  #cubemaps;
  #cubeuvmaps;
  #extensions;
  #capabilities;
  #bindingStates;
  #clipping;
  #programLayers = new Layers();
  #customShaders = new WebGLShaderCache();
  #logarithmicDepthBuffer;
  #SUPPORTS_VERTEX_TEXTURES;
  #precision;
  #shaderIDs = {
    MeshDepthMaterial: "depth",
    MeshDistanceMaterial: "distanceRGBA",
    MeshNormalMaterial: "normal",
    MeshBasicMaterial: "basic",
    // MeshLambertMaterial: 'lambert',
    // MeshPhongMaterial: 'phong',
    // MeshToonMaterial: 'toon',
    MeshStandardMaterial: "physical",
    MeshPhysicalMaterial: "physical",
    // MeshMatcapMaterial: 'matcap',
    LineBasicMaterial: "basic",
    // LineDashedMaterial: 'dashed',
    PointsMaterial: "points",
    ShadowMaterial: "shadow",
    SpriteMaterial: "sprite"
  };
  // Exposed for resource monitoring & error feedback via renderer.info:
  programs = [];
  /**
   * @param {WebGLRenderer} renderer
   * @param {WebGLCubeMaps} cubemaps
   * @param {WebGLCubeUVMaps} cubeuvmaps
   * @param {WebGLExtensions} extensions
   * @param {WebGLCapabilities} capabilities
   * @param {WebGLBindingStates} bindingStates
   * @param {WebGLClipping} clipping
   */
  constructor(renderer, cubemaps, cubeuvmaps, extensions, capabilities, bindingStates, clipping) {
    this.#renderer = renderer;
    this.#cubemaps = cubemaps;
    this.#cubeuvmaps = cubeuvmaps;
    this.#extensions = extensions;
    this.#capabilities = capabilities;
    this.#bindingStates = bindingStates;
    this.#clipping = clipping;
    this.#logarithmicDepthBuffer = capabilities.logarithmicDepthBuffer;
    this.#SUPPORTS_VERTEX_TEXTURES = capabilities.vertexTextures;
    this.#precision = capabilities.precision;
  }
  #getChannel(value) {
    if (value === 0) return "uv";
    return `uv${value}`;
  }
  getParameters(material, lights, shadows, scene, object) {
    const renderer = this.#renderer;
    const fog = scene.fog;
    const geometry = object.geometry;
    const environment = material.isMeshStandardMaterial ? scene.environment : null;
    const envMap = (material.isMeshStandardMaterial ? this.#cubeuvmaps : this.#cubemaps).get(
      material.envMap || environment
    );
    const envMapCubeUVHeight = !!envMap && envMap.mapping === CubeUVReflectionMapping ? envMap.image.height : null;
    const shaderID = this.#shaderIDs[material.type];
    if (material.precision !== null) {
      this.#precision = this.#capabilities.getMaxPrecision(material.precision);
      if (this.#precision !== material.precision) {
        console.warn(
          `WebGLProgram.getParameters: ${material.precision} not supported, using ${this.#precision} instead.`
        );
      }
    }
    const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
    const morphTargetsCount = morphAttribute !== void 0 ? morphAttribute.length : 0;
    let morphTextureStride = 0;
    if (geometry.morphAttributes.position !== void 0) morphTextureStride = 1;
    if (geometry.morphAttributes.normal !== void 0) morphTextureStride = 2;
    if (geometry.morphAttributes.color !== void 0) morphTextureStride = 3;
    let vertexShader;
    let fragmentShader;
    let customVertexShaderID;
    let customFragmentShaderID;
    if (shaderID) {
      const shader = ShaderLib[shaderID];
      vertexShader = shader.vertexShader;
      fragmentShader = shader.fragmentShader;
    } else {
      vertexShader = material.vertexShader;
      fragmentShader = material.fragmentShader;
      this.#customShaders.update(material);
      customVertexShaderID = this.#customShaders.getVertexShaderID(material);
      customFragmentShaderID = this.#customShaders.getFragmentShaderID(material);
    }
    const currentRenderTarget = renderer.getRenderTarget();
    const IS_INSTANCEDMESH = object.isInstancedMesh === true;
    const HAS_MAP = !!material.map;
    const HAS_MATCAP = !!material.matcap;
    const HAS_ENVMAP = !!envMap;
    const HAS_AOMAP = !!material.aoMap;
    const HAS_LIGHTMAP = !!material.lightMap;
    const HAS_BUMPMAP = !!material.bumpMap;
    const HAS_NORMALMAP = !!material.normalMap;
    const HAS_DISPLACEMENTMAP = !!material.displacementMap;
    const HAS_EMISSIVEMAP = !!material.emissiveMap;
    const HAS_METALNESSMAP = !!material.metalnessMap;
    const HAS_ROUGHNESSMAP = !!material.roughnessMap;
    const HAS_ANISOTROPY = material.anisotropy > 0;
    const HAS_CLEARCOAT = material.clearcoat > 0;
    const HAS_IRIDESCENCE = material.iridescence > 0;
    const HAS_SHEEN = material.sheen > 0;
    const HAS_TRANSMISSION = material.transmission > 0;
    const HAS_ANISOTROPYMAP = HAS_ANISOTROPY && !!material.anisotropyMap;
    const HAS_CLEARCOATMAP = HAS_CLEARCOAT && !!material.clearcoatMap;
    const HAS_CLEARCOAT_NORMALMAP = HAS_CLEARCOAT && !!material.clearcoatNormalMap;
    const HAS_CLEARCOAT_ROUGHNESSMAP = HAS_CLEARCOAT && !!material.clearcoatRoughnessMap;
    const HAS_IRIDESCENCEMAP = HAS_IRIDESCENCE && !!material.iridescenceMap;
    const HAS_IRIDESCENCE_THICKNESSMAP = HAS_IRIDESCENCE && !!material.iridescenceThicknessMap;
    const HAS_SHEEN_COLORMAP = HAS_SHEEN && !!material.sheenColorMap;
    const HAS_SHEEN_ROUGHNESSMAP = HAS_SHEEN && !!material.sheenRoughnessMap;
    const HAS_SPECULARMAP = !!material.specularMap;
    const HAS_SPECULAR_COLORMAP = !!material.specularColorMap;
    const HAS_SPECULAR_INTENSITYMAP = !!material.specularIntensityMap;
    const HAS_TRANSMISSIONMAP = HAS_TRANSMISSION && !!material.transmissionMap;
    const HAS_THICKNESSMAP = HAS_TRANSMISSION && !!material.thicknessMap;
    const HAS_GRADIENTMAP = !!material.gradientMap;
    const HAS_ALPHAMAP = !!material.alphaMap;
    const HAS_ALPHATEST = material.alphaTest > 0;
    const HAS_ALPHAHASH = !!material.alphaHash;
    const HAS_EXTENSIONS = !!material.extensions;
    const HAS_ATTRIBUTE_UV1 = !!geometry.attributes.uv1;
    const HAS_ATTRIBUTE_UV2 = !!geometry.attributes.uv2;
    const HAS_ATTRIBUTE_UV3 = !!geometry.attributes.uv3;
    let toneMapping = NoToneMapping;
    if (material.toneMapped) {
      if (currentRenderTarget === null || currentRenderTarget.isXRRenderTarget === true) {
        toneMapping = renderer.toneMapping;
      }
    }
    const parameters = {
      isWebGL2: true,
      // EP: optimise
      shaderID,
      shaderType: material.type,
      shaderName: material.name,
      vertexShader,
      fragmentShader,
      defines: material.defines,
      customVertexShaderID,
      customFragmentShaderID,
      isRawShaderMaterial: material.isRawShaderMaterial === true,
      glslVersion: material.glslVersion,
      precision: this.#precision,
      instancing: IS_INSTANCEDMESH,
      instancingColor: IS_INSTANCEDMESH && object.instanceColor !== null,
      supportsVertexTextures: this.#SUPPORTS_VERTEX_TEXTURES,
      outputColorSpace: currentRenderTarget === null ? renderer.outputColorSpace : currentRenderTarget.isXRRenderTarget === true ? currentRenderTarget.texture.colorSpace : LinearSRGBColorSpace,
      map: HAS_MAP,
      matcap: HAS_MATCAP,
      envMap: HAS_ENVMAP,
      envMapMode: HAS_ENVMAP && envMap.mapping,
      envMapCubeUVHeight,
      aoMap: HAS_AOMAP,
      lightMap: HAS_LIGHTMAP,
      bumpMap: HAS_BUMPMAP,
      normalMap: HAS_NORMALMAP,
      displacementMap: this.#SUPPORTS_VERTEX_TEXTURES && HAS_DISPLACEMENTMAP,
      emissiveMap: HAS_EMISSIVEMAP,
      normalMapObjectSpace: HAS_NORMALMAP && material.normalMapType === ObjectSpaceNormalMap,
      normalMapTangentSpace: HAS_NORMALMAP && material.normalMapType === TangentSpaceNormalMap,
      metalnessMap: HAS_METALNESSMAP,
      roughnessMap: HAS_ROUGHNESSMAP,
      anisotropy: HAS_ANISOTROPY,
      anisotropyMap: HAS_ANISOTROPYMAP,
      clearcoat: HAS_CLEARCOAT,
      clearcoatMap: HAS_CLEARCOATMAP,
      clearcoatNormalMap: HAS_CLEARCOAT_NORMALMAP,
      clearcoatRoughnessMap: HAS_CLEARCOAT_ROUGHNESSMAP,
      iridescence: HAS_IRIDESCENCE,
      iridescenceMap: HAS_IRIDESCENCEMAP,
      iridescenceThicknessMap: HAS_IRIDESCENCE_THICKNESSMAP,
      sheen: HAS_SHEEN,
      sheenColorMap: HAS_SHEEN_COLORMAP,
      sheenRoughnessMap: HAS_SHEEN_ROUGHNESSMAP,
      specularMap: HAS_SPECULARMAP,
      specularColorMap: HAS_SPECULAR_COLORMAP,
      specularIntensityMap: HAS_SPECULAR_INTENSITYMAP,
      transmission: HAS_TRANSMISSION,
      transmissionMap: HAS_TRANSMISSIONMAP,
      thicknessMap: HAS_THICKNESSMAP,
      gradientMap: HAS_GRADIENTMAP,
      opaque: material.transparent === false && material.blending === NormalBlending,
      alphaMap: HAS_ALPHAMAP,
      alphaTest: HAS_ALPHATEST,
      alphaHash: HAS_ALPHAHASH,
      combine: material.combine,
      //
      mapUv: HAS_MAP && this.#getChannel(material.map.channel),
      aoMapUv: HAS_AOMAP && this.#getChannel(material.aoMap.channel),
      lightMapUv: HAS_LIGHTMAP && this.#getChannel(material.lightMap.channel),
      bumpMapUv: HAS_BUMPMAP && this.#getChannel(material.bumpMap.channel),
      normalMapUv: HAS_NORMALMAP && this.#getChannel(material.normalMap.channel),
      displacementMapUv: HAS_DISPLACEMENTMAP && this.#getChannel(material.displacementMap.channel),
      emissiveMapUv: HAS_EMISSIVEMAP && this.#getChannel(material.emissiveMap.channel),
      metalnessMapUv: HAS_METALNESSMAP && this.#getChannel(material.metalnessMap.channel),
      roughnessMapUv: HAS_ROUGHNESSMAP && this.#getChannel(material.roughnessMap.channel),
      anisotropyMapUv: HAS_ANISOTROPYMAP && this.#getChannel(material.anisotropyMap.channel),
      clearcoatMapUv: HAS_CLEARCOATMAP && this.#getChannel(material.clearcoatMap.channel),
      clearcoatNormalMapUv: HAS_CLEARCOAT_NORMALMAP && this.#getChannel(material.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: HAS_CLEARCOAT_ROUGHNESSMAP && this.#getChannel(material.clearcoatRoughnessMap.channel),
      iridescenceMapUv: HAS_IRIDESCENCEMAP && this.#getChannel(material.iridescenceMap.channel),
      iridescenceThicknessMapUv: HAS_IRIDESCENCE_THICKNESSMAP && this.#getChannel(material.iridescenceThicknessMap.channel),
      sheenColorMapUv: HAS_SHEEN_COLORMAP && this.#getChannel(material.sheenColorMap.channel),
      sheenRoughnessMapUv: HAS_SHEEN_ROUGHNESSMAP && this.#getChannel(material.sheenRoughnessMap.channel),
      specularMapUv: HAS_SPECULARMAP && this.#getChannel(material.specularMap.channel),
      specularColorMapUv: HAS_SPECULAR_COLORMAP && this.#getChannel(material.specularColorMap.channel),
      specularIntensityMapUv: HAS_SPECULAR_INTENSITYMAP && this.#getChannel(material.specularIntensityMap.channel),
      transmissionMapUv: HAS_TRANSMISSIONMAP && this.#getChannel(material.transmissionMap.channel),
      thicknessMapUv: HAS_THICKNESSMAP && this.#getChannel(material.thicknessMap.channel),
      alphaMapUv: HAS_ALPHAMAP && this.#getChannel(material.alphaMap.channel),
      //
      vertexTangents: !!geometry.attributes.tangent && (HAS_NORMALMAP || HAS_ANISOTROPY),
      vertexColors: material.vertexColors,
      vertexAlphas: material.vertexColors === true && !!geometry.attributes.color && geometry.attributes.color.itemSize === 4,
      vertexUv1s: HAS_ATTRIBUTE_UV1,
      vertexUv2s: HAS_ATTRIBUTE_UV2,
      vertexUv3s: HAS_ATTRIBUTE_UV3,
      pointsUvs: object.isPoints === true && !!geometry.attributes.uv && (HAS_MAP || HAS_ALPHAMAP),
      fog: !!fog,
      useFog: material.fog === true,
      fogExp2: fog && fog.isFogExp2,
      flatShading: material.flatShading === true,
      sizeAttenuation: material.sizeAttenuation === true,
      logarithmicDepthBuffer: this.#logarithmicDepthBuffer,
      skinning: object.isSkinnedMesh === true,
      morphTargets: geometry.morphAttributes.position !== void 0,
      morphNormals: geometry.morphAttributes.normal !== void 0,
      morphColors: geometry.morphAttributes.color !== void 0,
      morphTargetsCount,
      morphTextureStride,
      numDirLights: lights.directional.length,
      numPointLights: lights.point.length,
      numSpotLights: lights.spot.length,
      numSpotLightMaps: lights.spotLightMap.length,
      numRectAreaLights: lights.rectArea.length,
      numHemiLights: lights.hemi.length,
      numDirLightShadows: lights.directionalShadowMap.length,
      numPointLightShadows: lights.pointShadowMap.length,
      numSpotLightShadows: lights.spotShadowMap.length,
      numSpotLightShadowsWithMaps: lights.numSpotLightShadowsWithMaps,
      numLightProbes: lights.numLightProbes,
      numClippingPlanes: this.#clipping.numPlanes,
      numClipIntersection: this.#clipping.numIntersection,
      dithering: material.dithering,
      shadowMapEnabled: renderer.shadowMap.enabled && shadows.length > 0,
      shadowMapType: renderer.shadowMap.type,
      toneMapping,
      useLegacyLights: renderer._useLegacyLights,
      decodeVideoTexture: HAS_MAP && material.map.isVideoTexture === true && ColorManagement.getTransfer(material.map.colorSpace) === SRGBTransfer,
      premultipliedAlpha: material.premultipliedAlpha,
      doubleSided: material.side === DoubleSide,
      flipSided: material.side === BackSide,
      useDepthPacking: material.depthPacking >= 0,
      depthPacking: material.depthPacking || 0,
      index0AttributeName: material.index0AttributeName,
      extensionDerivatives: HAS_EXTENSIONS && material.extensions.derivatives === true,
      extensionFragDepth: HAS_EXTENSIONS && material.extensions.fragDepth === true,
      extensionDrawBuffers: HAS_EXTENSIONS && material.extensions.drawBuffers === true,
      extensionShaderTextureLOD: HAS_EXTENSIONS && material.extensions.shaderTextureLOD === true,
      rendererExtensionFragDepth: true,
      // EP: always true in webgl2, optimise
      rendererExtensionDrawBuffers: true,
      rendererExtensionShaderTextureLod: true,
      rendererExtensionParallelShaderCompile: this.#extensions.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: material.customProgramCacheKey()
    };
    return parameters;
  }
  getProgramCacheKey(parameters) {
    const array = [];
    if (parameters.shaderID) {
      array.push(parameters.shaderID);
    } else {
      array.push(parameters.customVertexShaderID);
      array.push(parameters.customFragmentShaderID);
    }
    if (parameters.defines !== void 0) {
      for (const name in parameters.defines) {
        array.push(name);
        array.push(parameters.defines[name]);
      }
    }
    if (parameters.isRawShaderMaterial === false) {
      this.#getProgramCacheKeyParameters(array, parameters);
      this.#getProgramCacheKeyBooleans(array, parameters);
      array.push(this.#renderer.outputColorSpace);
    }
    array.push(parameters.customProgramCacheKey);
    return array.join();
  }
  #getProgramCacheKeyParameters(array, parameters) {
    array.push(parameters.precision);
    array.push(parameters.outputColorSpace);
    array.push(parameters.envMapMode);
    array.push(parameters.envMapCubeUVHeight);
    array.push(parameters.mapUv);
    array.push(parameters.alphaMapUv);
    array.push(parameters.lightMapUv);
    array.push(parameters.aoMapUv);
    array.push(parameters.bumpMapUv);
    array.push(parameters.normalMapUv);
    array.push(parameters.displacementMapUv);
    array.push(parameters.emissiveMapUv);
    array.push(parameters.metalnessMapUv);
    array.push(parameters.roughnessMapUv);
    array.push(parameters.anisotropyMapUv);
    array.push(parameters.clearcoatMapUv);
    array.push(parameters.clearcoatNormalMapUv);
    array.push(parameters.clearcoatRoughnessMapUv);
    array.push(parameters.iridescenceMapUv);
    array.push(parameters.iridescenceThicknessMapUv);
    array.push(parameters.sheenColorMapUv);
    array.push(parameters.sheenRoughnessMapUv);
    array.push(parameters.specularMapUv);
    array.push(parameters.specularColorMapUv);
    array.push(parameters.specularIntensityMapUv);
    array.push(parameters.transmissionMapUv);
    array.push(parameters.thicknessMapUv);
    array.push(parameters.combine);
    array.push(parameters.fogExp2);
    array.push(parameters.sizeAttenuation);
    array.push(parameters.morphTargetsCount);
    array.push(parameters.morphAttributeCount);
    array.push(parameters.numDirLights);
    array.push(parameters.numPointLights);
    array.push(parameters.numSpotLights);
    array.push(parameters.numSpotLightMaps);
    array.push(parameters.numHemiLights);
    array.push(parameters.numRectAreaLights);
    array.push(parameters.numDirLightShadows);
    array.push(parameters.numPointLightShadows);
    array.push(parameters.numSpotLightShadows);
    array.push(parameters.numSpotLightShadowsWithMaps);
    array.push(parameters.numLightProbes);
    array.push(parameters.shadowMapType);
    array.push(parameters.toneMapping);
    array.push(parameters.numClippingPlanes);
    array.push(parameters.numClipIntersection);
    array.push(parameters.depthPacking);
  }
  #getProgramCacheKeyBooleans(array, parameters) {
    this.#programLayers.disableAll();
    if (parameters.isWebGL2) this.#programLayers.enable(0);
    if (parameters.supportsVertexTextures) this.#programLayers.enable(1);
    if (parameters.instancing) this.#programLayers.enable(2);
    if (parameters.instancingColor) this.#programLayers.enable(3);
    if (parameters.matcap) this.#programLayers.enable(4);
    if (parameters.envMap) this.#programLayers.enable(5);
    if (parameters.normalMapObjectSpace) this.#programLayers.enable(6);
    if (parameters.normalMapTangentSpace) this.#programLayers.enable(7);
    if (parameters.clearcoat) this.#programLayers.enable(8);
    if (parameters.iridescence) this.#programLayers.enable(9);
    if (parameters.alphaTest) this.#programLayers.enable(10);
    if (parameters.vertexColors) this.#programLayers.enable(11);
    if (parameters.vertexAlphas) this.#programLayers.enable(12);
    if (parameters.vertexUv1s) this.#programLayers.enable(13);
    if (parameters.vertexUv2s) this.#programLayers.enable(14);
    if (parameters.vertexUv3s) this.#programLayers.enable(15);
    if (parameters.vertexTangents) this.#programLayers.enable(16);
    if (parameters.anisotropy) this.#programLayers.enable(17);
    if (parameters.alphaHash) this.#programLayers.enable(18);
    array.push(this.#programLayers.mask);
    this.#programLayers.disableAll();
    if (parameters.fog) this.#programLayers.enable(0);
    if (parameters.useFog) this.#programLayers.enable(1);
    if (parameters.flatShading) this.#programLayers.enable(2);
    if (parameters.logarithmicDepthBuffer) this.#programLayers.enable(3);
    if (parameters.skinning) this.#programLayers.enable(4);
    if (parameters.morphTargets) this.#programLayers.enable(5);
    if (parameters.morphNormals) this.#programLayers.enable(6);
    if (parameters.morphColors) this.#programLayers.enable(7);
    if (parameters.premultipliedAlpha) this.#programLayers.enable(8);
    if (parameters.shadowMapEnabled) this.#programLayers.enable(9);
    if (parameters.useLegacyLights) this.#programLayers.enable(10);
    if (parameters.doubleSided) this.#programLayers.enable(11);
    if (parameters.flipSided) this.#programLayers.enable(12);
    if (parameters.useDepthPacking) this.#programLayers.enable(13);
    if (parameters.dithering) this.#programLayers.enable(14);
    if (parameters.transmission) this.#programLayers.enable(15);
    if (parameters.sheen) this.#programLayers.enable(16);
    if (parameters.opaque) this.#programLayers.enable(17);
    if (parameters.pointsUvs) this.#programLayers.enable(18);
    if (parameters.decodeVideoTexture) this.#programLayers.enable(19);
    array.push(this.#programLayers.mask);
  }
  getUniforms(material) {
    const shaderID = this.#shaderIDs[material.type];
    let uniforms;
    if (shaderID) {
      const shader = ShaderLib[shaderID];
      uniforms = cloneUniforms(shader.uniforms);
    } else {
      uniforms = material.uniforms;
    }
    return uniforms;
  }
  acquireProgram(parameters, cacheKey) {
    let program;
    for (let p = 0, pl = this.programs.length; p < pl; p++) {
      const preexistingProgram = this.programs[p];
      if (preexistingProgram.cacheKey === cacheKey) {
        program = preexistingProgram;
        ++program.usedTimes;
        break;
      }
    }
    if (program === void 0) {
      program = new WebGLProgram(this.#renderer, cacheKey, parameters, this.#bindingStates);
      this.programs.push(program);
    }
    return program;
  }
  releaseProgram(program) {
    if (--program.usedTimes === 0) {
      const i = this.programs.indexOf(program);
      this.programs[i] = this.programs[this.programs.length - 1];
      this.programs.pop();
      program.destroy();
    }
  }
  releaseShaderCache(material) {
    this.#customShaders.remove(material);
  }
  dispose() {
    this.#customShaders.dispose();
  }
}

class WebGLProperties {
  #properties = /* @__PURE__ */ new WeakMap();
  dispose() {
    this.#properties = /* @__PURE__ */ new WeakMap();
  }
  get(object) {
    let map = this.#properties.get(object);
    if (map === void 0) {
      map = {};
      this.#properties.set(object, map);
    }
    return map;
  }
  remove(object) {
    this.#properties.delete(object);
  }
  update(object, key, value) {
    this.#properties.get(object)[key] = value;
  }
}

class WebGLRenderList {
  #renderItems = [];
  #renderItemsIndex = 0;
  opaque = [];
  transmissive = [];
  transparent = [];
  init() {
    this.#renderItemsIndex = 0;
    this.opaque.length = 0;
    this.transmissive.length = 0;
    this.transparent.length = 0;
  }
  #getNextRenderItem(object, geometry, material, groupOrder, z, group) {
    let renderItem = this.#renderItems[this.#renderItemsIndex];
    if (renderItem === void 0) {
      renderItem = {
        id: object.id,
        object,
        geometry,
        material,
        groupOrder,
        renderOrder: object.renderOrder,
        z,
        group
      };
      this.#renderItems[this.#renderItemsIndex] = renderItem;
    } else {
      renderItem.id = object.id;
      renderItem.object = object;
      renderItem.geometry = geometry;
      renderItem.material = material;
      renderItem.groupOrder = groupOrder;
      renderItem.renderOrder = object.renderOrder;
      renderItem.z = z;
      renderItem.group = group;
    }
    this.#renderItemsIndex++;
    return renderItem;
  }
  push(object, geometry, material, groupOrder, z, group) {
    const renderItem = this.#getNextRenderItem(object, geometry, material, groupOrder, z, group);
    if (material.transmission > 0) {
      this.transmissive.push(renderItem);
    } else if (material.transparent === true) {
      this.transparent.push(renderItem);
    } else {
      this.opaque.push(renderItem);
    }
  }
  unshift(object, geometry, material, groupOrder, z, group) {
    const renderItem = this.#getNextRenderItem(object, geometry, material, groupOrder, z, group);
    if (material.transmission > 0) {
      this.transmissive.unshift(renderItem);
    } else if (material.transparent === true) {
      this.transparent.unshift(renderItem);
    } else {
      this.opaque.unshift(renderItem);
    }
  }
  sort(customOpaqueSort, customTransparentSort) {
    if (this.opaque.length > 1) this.opaque.sort(customOpaqueSort || _painterSortStable);
    if (this.transmissive.length > 1)
      this.transmissive.sort(customTransparentSort || _reversePainterSortStable);
    if (this.transparent.length > 1)
      this.transparent.sort(customTransparentSort || _reversePainterSortStable);
  }
  finish() {
    for (let i = this.#renderItemsIndex, il = this.#renderItems.length; i < il; i++) {
      const renderItem = this.#renderItems[i];
      if (renderItem.id === null) break;
      renderItem.id = null;
      renderItem.object = null;
      renderItem.geometry = null;
      renderItem.material = null;
      renderItem.group = null;
    }
  }
}
class WebGLRenderLists {
  lists = /* @__PURE__ */ new WeakMap();
  dispose() {
    this.lists = /* @__PURE__ */ new WeakMap();
  }
  get(scene, renderCallDepth) {
    const listArray = this.lists.get(scene);
    let list;
    if (listArray === void 0) {
      list = new WebGLRenderList();
      this.lists.set(scene, [list]);
    } else {
      if (renderCallDepth >= listArray.length) {
        list = new WebGLRenderList();
        listArray.push(list);
      } else {
        list = listArray[renderCallDepth];
      }
    }
    return list;
  }
}
function _painterSortStable(a, b) {
  if (a.groupOrder !== b.groupOrder) {
    return a.groupOrder - b.groupOrder;
  } else if (a.renderOrder !== b.renderOrder) {
    return a.renderOrder - b.renderOrder;
  } else if (a.material.id !== b.material.id) {
    return a.material.id - b.material.id;
  } else if (a.z !== b.z) {
    return a.z - b.z;
  } else {
    return a.id - b.id;
  }
}
function _reversePainterSortStable(a, b) {
  if (a.groupOrder !== b.groupOrder) {
    return a.groupOrder - b.groupOrder;
  } else if (a.renderOrder !== b.renderOrder) {
    return a.renderOrder - b.renderOrder;
  } else if (a.z !== b.z) {
    return b.z - a.z;
  } else {
    return a.id - b.id;
  }
}

class WebGLLights {
  #cache = new UniformsCache();
  #shadowCache = new ShadowUniformsCache();
  state = {
    version: 0,
    hash: {
      directionalLength: -1,
      pointLength: -1,
      spotLength: -1,
      rectAreaLength: -1,
      hemiLength: -1,
      numDirectionalShadows: -1,
      numPointShadows: -1,
      numSpotShadows: -1,
      numSpotMaps: -1,
      numLightProbes: -1
    },
    ambient: [0, 0, 0],
    probe: [],
    directional: [],
    directionalShadow: [],
    directionalShadowMap: [],
    directionalShadowMatrix: [],
    spot: [],
    spotLightMap: [],
    spotShadow: [],
    spotShadowMap: [],
    spotLightMatrix: [],
    rectArea: [],
    rectAreaLTC1: null,
    rectAreaLTC2: null,
    point: [],
    pointShadow: [],
    pointShadowMap: [],
    pointShadowMatrix: [],
    hemi: [],
    numSpotLightShadowsWithMaps: 0,
    numLightProbes: 0
  };
  /**
   * @param {WebGLExtensions} extensions
   * @param {WebGLCapabilities} capabilities
   */
  constructor(extensions, capabilities) {
    for (let i = 0; i < 9; i++) {
      this.state.probe.push(new Vector3());
    }
  }
  setup(lights, useLegacyLights) {
    let r = 0;
    let g = 0;
    let b = 0;
    for (let i = 0; i < 9; i++) {
      this.state.probe[i].set(0, 0, 0);
    }
    let directionalLength = 0;
    let pointLength = 0;
    let spotLength = 0;
    let rectAreaLength = 0;
    let hemiLength = 0;
    let numDirectionalShadows = 0;
    let numPointShadows = 0;
    let numSpotShadows = 0;
    let numSpotMaps = 0;
    let numSpotShadowsWithMaps = 0;
    let numLightProbes = 0;
    lights.sort(_shadowCastingAndTexturingLightsFirst);
    const scaleFactor = useLegacyLights === true ? Math.PI : 1;
    for (let i = 0, l = lights.length; i < l; i++) {
      const light = lights[i];
      const color = light.color;
      const intensity = light.intensity;
      const distance = light.distance;
      const shadowMap = light.shadow && light.shadow.map ? light.shadow.map.texture : null;
      if (light.isAmbientLight) {
        r += color.r * intensity * scaleFactor;
        g += color.g * intensity * scaleFactor;
        b += color.b * intensity * scaleFactor;
      } else if (light.isLightProbe) {
        for (let j = 0; j < 9; j++) {
          this.state.probe[j].addScaledVector(light.sh.coefficients[j], intensity);
        }
        numLightProbes++;
      } else if (light.isDirectionalLight) {
        const uniforms = this.#cache.get(light);
        uniforms.color.copy(light.color).multiplyScalar(light.intensity * scaleFactor);
        if (light.castShadow) {
          const shadow = light.shadow;
          const shadowUniforms = this.#shadowCache.get(light);
          shadowUniforms.shadowBias = shadow.bias;
          shadowUniforms.shadowNormalBias = shadow.normalBias;
          shadowUniforms.shadowRadius = shadow.radius;
          shadowUniforms.shadowMapSize = shadow.mapSize;
          this.state.directionalShadow[directionalLength] = shadowUniforms;
          this.state.directionalShadowMap[directionalLength] = shadowMap;
          this.state.directionalShadowMatrix[directionalLength] = light.shadow.matrix;
          numDirectionalShadows++;
        }
        this.state.directional[directionalLength] = uniforms;
        directionalLength++;
      } else if (light.isSpotLight) {
        const uniforms = this.#cache.get(light);
        uniforms.position.setFromMatrixPosition(light.matrixWorld);
        uniforms.color.copy(color).multiplyScalar(intensity * scaleFactor);
        uniforms.distance = distance;
        uniforms.coneCos = Math.cos(light.angle);
        uniforms.penumbraCos = Math.cos(light.angle * (1 - light.penumbra));
        uniforms.decay = light.decay;
        this.state.spot[spotLength] = uniforms;
        const shadow = light.shadow;
        if (light.map) {
          this.state.spotLightMap[numSpotMaps] = light.map;
          numSpotMaps++;
          shadow.updateMatrices(light);
          if (light.castShadow) numSpotShadowsWithMaps++;
        }
        this.state.spotLightMatrix[spotLength] = shadow.matrix;
        if (light.castShadow) {
          const shadowUniforms = this.#shadowCache.get(light);
          shadowUniforms.shadowBias = shadow.bias;
          shadowUniforms.shadowNormalBias = shadow.normalBias;
          shadowUniforms.shadowRadius = shadow.radius;
          shadowUniforms.shadowMapSize = shadow.mapSize;
          this.state.spotShadow[spotLength] = shadowUniforms;
          this.state.spotShadowMap[spotLength] = shadowMap;
          numSpotShadows++;
        }
        spotLength++;
      } else if (light.isRectAreaLight) {
        const uniforms = this.#cache.get(light);
        uniforms.color.copy(color).multiplyScalar(intensity);
        uniforms.halfWidth.set(light.width * 0.5, 0, 0);
        uniforms.halfHeight.set(0, light.height * 0.5, 0);
        this.state.rectArea[rectAreaLength] = uniforms;
        rectAreaLength++;
      } else if (light.isPointLight) {
        const uniforms = this.#cache.get(light);
        uniforms.color.copy(light.color).multiplyScalar(light.intensity * scaleFactor);
        uniforms.distance = light.distance;
        uniforms.decay = light.decay;
        if (light.castShadow) {
          const shadow = light.shadow;
          const shadowUniforms = this.#shadowCache.get(light);
          shadowUniforms.shadowBias = shadow.bias;
          shadowUniforms.shadowNormalBias = shadow.normalBias;
          shadowUniforms.shadowRadius = shadow.radius;
          shadowUniforms.shadowMapSize = shadow.mapSize;
          shadowUniforms.shadowCameraNear = shadow.camera.near;
          shadowUniforms.shadowCameraFar = shadow.camera.far;
          this.state.pointShadow[pointLength] = shadowUniforms;
          this.state.pointShadowMap[pointLength] = shadowMap;
          this.state.pointShadowMatrix[pointLength] = light.shadow.matrix;
          numPointShadows++;
        }
        this.state.point[pointLength] = uniforms;
        pointLength++;
      } else if (light.isHemisphereLight) {
        const uniforms = this.#cache.get(light);
        uniforms.skyColor.copy(light.color).multiplyScalar(intensity * scaleFactor);
        uniforms.groundColor.copy(light.groundColor).multiplyScalar(intensity * scaleFactor);
        this.state.hemi[hemiLength] = uniforms;
        hemiLength++;
      }
    }
    if (rectAreaLength > 0) {
      this.state.rectAreaLTC1 = UniformsLib.LTC_FLOAT_1;
      this.state.rectAreaLTC2 = UniformsLib.LTC_FLOAT_2;
    }
    this.state.ambient[0] = r;
    this.state.ambient[1] = g;
    this.state.ambient[2] = b;
    const hash = this.state.hash;
    if (hash.directionalLength !== directionalLength || hash.pointLength !== pointLength || hash.spotLength !== spotLength || hash.rectAreaLength !== rectAreaLength || hash.hemiLength !== hemiLength || hash.numDirectionalShadows !== numDirectionalShadows || hash.numPointShadows !== numPointShadows || hash.numSpotShadows !== numSpotShadows || hash.numSpotMaps !== numSpotMaps || hash.numLightProbes !== numLightProbes) {
      this.state.directional.length = directionalLength;
      this.state.spot.length = spotLength;
      this.state.rectArea.length = rectAreaLength;
      this.state.point.length = pointLength;
      this.state.hemi.length = hemiLength;
      this.state.directionalShadow.length = numDirectionalShadows;
      this.state.directionalShadowMap.length = numDirectionalShadows;
      this.state.pointShadow.length = numPointShadows;
      this.state.pointShadowMap.length = numPointShadows;
      this.state.spotShadow.length = numSpotShadows;
      this.state.spotShadowMap.length = numSpotShadows;
      this.state.directionalShadowMatrix.length = numDirectionalShadows;
      this.state.pointShadowMatrix.length = numPointShadows;
      this.state.spotLightMatrix.length = numSpotShadows + numSpotMaps - numSpotShadowsWithMaps;
      this.state.spotLightMap.length = numSpotMaps;
      this.state.numSpotLightShadowsWithMaps = numSpotShadowsWithMaps;
      this.state.numLightProbes = numLightProbes;
      hash.directionalLength = directionalLength;
      hash.pointLength = pointLength;
      hash.spotLength = spotLength;
      hash.rectAreaLength = rectAreaLength;
      hash.hemiLength = hemiLength;
      hash.numDirectionalShadows = numDirectionalShadows;
      hash.numPointShadows = numPointShadows;
      hash.numSpotShadows = numSpotShadows;
      hash.numSpotMaps = numSpotMaps;
      hash.numLightProbes = numLightProbes;
      this.state.version = _nextVersion++;
    }
  }
  setupView(lights, camera) {
    let directionalLength = 0;
    let pointLength = 0;
    let spotLength = 0;
    let rectAreaLength = 0;
    let hemiLength = 0;
    const viewMatrix = camera.matrixWorldInverse;
    for (let i = 0, l = lights.length; i < l; i++) {
      const light = lights[i];
      if (light.isDirectionalLight) {
        const uniforms = this.state.directional[directionalLength];
        uniforms.direction.setFromMatrixPosition(light.matrixWorld);
        _vector3.setFromMatrixPosition(light.target.matrixWorld);
        uniforms.direction.sub(_vector3);
        uniforms.direction.transformDirection(viewMatrix);
        directionalLength++;
      } else if (light.isSpotLight) {
        const uniforms = this.state.spot[spotLength];
        uniforms.position.setFromMatrixPosition(light.matrixWorld);
        uniforms.position.applyMatrix4(viewMatrix);
        uniforms.direction.setFromMatrixPosition(light.matrixWorld);
        _vector3.setFromMatrixPosition(light.target.matrixWorld);
        uniforms.direction.sub(_vector3);
        uniforms.direction.transformDirection(viewMatrix);
        spotLength++;
      } else if (light.isRectAreaLight) {
        const uniforms = this.state.rectArea[rectAreaLength];
        uniforms.position.setFromMatrixPosition(light.matrixWorld);
        uniforms.position.applyMatrix4(viewMatrix);
        _matrix42.identity();
        _matrix4.copy(light.matrixWorld);
        _matrix4.premultiply(viewMatrix);
        _matrix42.extractRotation(_matrix4);
        uniforms.halfWidth.set(light.width * 0.5, 0, 0);
        uniforms.halfHeight.set(0, light.height * 0.5, 0);
        uniforms.halfWidth.applyMatrix4(_matrix42);
        uniforms.halfHeight.applyMatrix4(_matrix42);
        rectAreaLength++;
      } else if (light.isPointLight) {
        const uniforms = this.state.point[pointLength];
        uniforms.position.setFromMatrixPosition(light.matrixWorld);
        uniforms.position.applyMatrix4(viewMatrix);
        pointLength++;
      } else if (light.isHemisphereLight) {
        const uniforms = this.state.hemi[hemiLength];
        uniforms.direction.setFromMatrixPosition(light.matrixWorld);
        uniforms.direction.transformDirection(viewMatrix);
        hemiLength++;
      }
    }
  }
}
class UniformsCache {
  lights = {};
  // EP: use map ?
  get(light) {
    const { lights } = this;
    if (lights[light.id] !== void 0) {
      return lights[light.id];
    }
    let uniforms;
    switch (light.type) {
      case "DirectionalLight":
        uniforms = {
          direction: new Vector3(),
          color: new Color()
        };
        break;
      case "SpotLight":
        uniforms = {
          position: new Vector3(),
          direction: new Vector3(),
          color: new Color(),
          distance: 0,
          coneCos: 0,
          penumbraCos: 0,
          decay: 0
        };
        break;
      case "PointLight":
        uniforms = {
          position: new Vector3(),
          color: new Color(),
          distance: 0,
          decay: 0
        };
        break;
      case "HemisphereLight":
        uniforms = {
          direction: new Vector3(),
          skyColor: new Color(),
          groundColor: new Color()
        };
        break;
      case "RectAreaLight":
        uniforms = {
          color: new Color(),
          position: new Vector3(),
          halfWidth: new Vector3(),
          halfHeight: new Vector3()
        };
        break;
    }
    lights[light.id] = uniforms;
    return uniforms;
  }
}
class ShadowUniformsCache {
  lights = {};
  // EP: use map ?
  get(light) {
    const { lights } = this;
    if (lights[light.id] !== void 0) {
      return lights[light.id];
    }
    let uniforms;
    switch (light.type) {
      case "DirectionalLight":
        uniforms = {
          shadowBias: 0,
          shadowNormalBias: 0,
          shadowRadius: 1,
          shadowMapSize: new Vector2()
        };
        break;
      case "SpotLight":
        uniforms = {
          shadowBias: 0,
          shadowNormalBias: 0,
          shadowRadius: 1,
          shadowMapSize: new Vector2()
        };
        break;
      case "PointLight":
        uniforms = {
          shadowBias: 0,
          shadowNormalBias: 0,
          shadowRadius: 1,
          shadowMapSize: new Vector2(),
          shadowCameraNear: 1,
          shadowCameraFar: 1e3
        };
        break;
    }
    lights[light.id] = uniforms;
    return uniforms;
  }
}
let _nextVersion = 0;
function _shadowCastingAndTexturingLightsFirst(lightA, lightB) {
  return (lightB.castShadow ? 2 : 0) - (lightA.castShadow ? 2 : 0) + (lightB.map ? 1 : 0) - (lightA.map ? 1 : 0);
}
const _vector3 = /* @__PURE__ */ new Vector3();
const _matrix4 = /* @__PURE__ */ new Matrix4();
const _matrix42 = /* @__PURE__ */ new Matrix4();

class WebGLRenderState {
  lights;
  lightsArray;
  shadowsArray;
  state;
  /**
   * @param {WebGLExtensions} extensions
   * @param {WebGLCapabilities} capabilities
   */
  constructor(extensions, capabilities) {
    const lights = new WebGLLights(extensions, capabilities);
    const lightsArray = [];
    const shadowsArray = [];
    this.lights = lights;
    this.lightsArray = lightsArray;
    this.shadowsArray = shadowsArray;
    this.state = {
      lightsArray,
      shadowsArray,
      lights
    };
  }
  init() {
    this.lightsArray.length = 0;
    this.shadowsArray.length = 0;
  }
  pushLight(light) {
    this.lightsArray.push(light);
  }
  pushShadow(shadowLight) {
    this.shadowsArray.push(shadowLight);
  }
  setupLights(useLegacyLights) {
    this.lights.setup(this.lightsArray, useLegacyLights);
  }
  setupLightsView(camera) {
    this.lights.setupView(this.lightsArray, camera);
  }
}
class WebGLRenderStates {
  renderStates = /* @__PURE__ */ new WeakMap();
  extensions;
  capabilities;
  /**
   * @param {WebGLExtensions} extensions
   * @param {WebGLCapabilities} capabilities
   */
  constructor(extensions, capabilities) {
    this.extensions = extensions;
    this.capabilities = capabilities;
  }
  dispose() {
    this.renderStates = /* @__PURE__ */ new WeakMap();
  }
  get(scene, renderCallDepth = 0) {
    const renderStateArray = this.renderStates.get(scene);
    let renderState;
    if (renderStateArray === void 0) {
      renderState = new WebGLRenderState(this.extensions, this.capabilities);
      this.renderStates.set(scene, [renderState]);
    } else {
      if (renderCallDepth >= renderStateArray.length) {
        renderState = new WebGLRenderState(this.extensions, this.capabilities);
        renderStateArray.push(renderState);
      } else {
        renderState = renderStateArray[renderCallDepth];
      }
    }
    return renderState;
  }
}

const vertex = `
void main() {
	gl_Position = vec4( position, 1.0 );
}
`;
const fragment = `
uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}
`;

class WebGLShadowMap {
  #renderer;
  #objects;
  #capabilities;
  #materialCache = {};
  #maxTextureSize;
  #previousType = PCFShadowMap;
  enabled = false;
  autoUpdate = true;
  needsUpdate = false;
  type = PCFShadowMap;
  /**
   * @param {WebGLRenderer} renderer
   * @param {WebGLObjects} objects
   * @param {WebGLCapabilities} capabilities
   */
  constructor(renderer, objects, capabilities) {
    this.#renderer = renderer;
    this.#objects = objects;
    this.#capabilities = capabilities;
    this.#maxTextureSize = this.#capabilities.maxTextureSize;
  }
  render(lights, scene, camera) {
    if (this.enabled === false) return;
    if (this.autoUpdate === false && this.needsUpdate === false) return;
    if (lights.length === 0) return;
    const currentRenderTarget = this.#renderer.getRenderTarget();
    const activeCubeFace = this.#renderer.getActiveCubeFace();
    const activeMipmapLevel = this.#renderer.getActiveMipmapLevel();
    const state = this.#renderer.state;
    state.setBlending(NoBlending);
    state.buffers.color.setClear(1, 1, 1, 1);
    state.buffers.depth.setTest(true);
    state.setScissorTest(false);
    const toVSM = this.#previousType !== VSMShadowMap && this.type === VSMShadowMap;
    const fromVSM = this.#previousType === VSMShadowMap && this.type !== VSMShadowMap;
    for (let i = 0, il = lights.length; i < il; i++) {
      const light = lights[i];
      const shadow = light.shadow;
      if (shadow === void 0) {
        console.warn(`WebGLShadowMap: ${light} has no shadow.`);
        continue;
      }
      if (shadow.autoUpdate === false && shadow.needsUpdate === false) continue;
      _shadowMapSize.copy(shadow.mapSize);
      const shadowFrameExtents = shadow.getFrameExtents();
      _shadowMapSize.multiply(shadowFrameExtents);
      _viewportSize.copy(shadow.mapSize);
      if (_shadowMapSize.x > this.#maxTextureSize || _shadowMapSize.y > this.#maxTextureSize) {
        if (_shadowMapSize.x > this.#maxTextureSize) {
          _viewportSize.x = Math.floor(this.#maxTextureSize / shadowFrameExtents.x);
          _shadowMapSize.x = _viewportSize.x * shadowFrameExtents.x;
          shadow.mapSize.x = _viewportSize.x;
        }
        if (_shadowMapSize.y > this.#maxTextureSize) {
          _viewportSize.y = Math.floor(this.#maxTextureSize / shadowFrameExtents.y);
          _shadowMapSize.y = _viewportSize.y * shadowFrameExtents.y;
          shadow.mapSize.y = _viewportSize.y;
        }
      }
      if (shadow.map === null || toVSM === true || fromVSM === true) {
        const pars = this.type !== VSMShadowMap ? { minFilter: NearestFilter, magFilter: NearestFilter } : {};
        if (shadow.map !== null) {
          shadow.map.dispose();
        }
        shadow.map = new WebGLRenderTarget(_shadowMapSize.x, _shadowMapSize.y, pars);
        shadow.map.texture.name = `${light.name}.shadowMap`;
        shadow.camera.updateProjectionMatrix();
      }
      this.#renderer.setRenderTarget(shadow.map);
      this.#renderer.clear();
      const viewportCount = shadow.getViewportCount();
      for (let vp = 0; vp < viewportCount; vp++) {
        const viewport = shadow.getViewport(vp);
        _viewport.set(
          _viewportSize.x * viewport.x,
          _viewportSize.y * viewport.y,
          _viewportSize.x * viewport.z,
          _viewportSize.y * viewport.w
        );
        state.viewport(_viewport);
        shadow.updateMatrices(light, vp);
        _frustum = shadow.getFrustum();
        this.#renderObject(scene, camera, shadow.camera, light, this.type);
      }
      if (shadow.isPointLightShadow !== true && this.type === VSMShadowMap) {
        this.#VSMPass(shadow, camera);
      }
      shadow.needsUpdate = false;
    }
    this.#previousType = this.type;
    this.needsUpdate = false;
    this.#renderer.setRenderTarget(currentRenderTarget, activeCubeFace, activeMipmapLevel);
  }
  #VSMPass(shadow, camera) {
    const shadowMaterialVertical = new ShaderMaterial({
      defines: {
        VSM_SAMPLES: 8
      },
      uniforms: {
        shadow_pass: { value: null },
        resolution: { value: new Vector2() },
        radius: { value: 4 }
      },
      vertexShader: vertex,
      fragmentShader: fragment
    });
    const shadowMaterialHorizontal = shadowMaterialVertical.clone();
    shadowMaterialHorizontal.defines.HORIZONTAL_PASS = 1;
    const fullScreenTri = new BufferGeometry();
    fullScreenTri.setAttribute(
      "position",
      new BufferAttribute(new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]), 3)
    );
    const fullScreenMesh = new Mesh(fullScreenTri, shadowMaterialVertical);
    const geometry = this.#objects.update(fullScreenMesh);
    if (shadowMaterialVertical.defines.VSM_SAMPLES !== shadow.blurSamples) {
      shadowMaterialVertical.defines.VSM_SAMPLES = shadow.blurSamples;
      shadowMaterialHorizontal.defines.VSM_SAMPLES = shadow.blurSamples;
      shadowMaterialVertical.needsUpdate = true;
      shadowMaterialHorizontal.needsUpdate = true;
    }
    if (shadow.mapPass === null) {
      shadow.mapPass = new WebGLRenderTarget(_shadowMapSize.x, _shadowMapSize.y);
    }
    shadowMaterialVertical.uniforms.shadow_pass.value = shadow.map.texture;
    shadowMaterialVertical.uniforms.resolution.value = shadow.mapSize;
    shadowMaterialVertical.uniforms.radius.value = shadow.radius;
    this.#renderer.setRenderTarget(shadow.mapPass);
    this.#renderer.clear();
    this.#renderer.renderBufferDirect(
      camera,
      null,
      geometry,
      shadowMaterialVertical,
      fullScreenMesh,
      null
    );
    shadowMaterialHorizontal.uniforms.shadow_pass.value = shadow.mapPass.texture;
    shadowMaterialHorizontal.uniforms.resolution.value = shadow.mapSize;
    shadowMaterialHorizontal.uniforms.radius.value = shadow.radius;
    this.#renderer.setRenderTarget(shadow.map);
    this.#renderer.clear();
    this.#renderer.renderBufferDirect(
      camera,
      null,
      geometry,
      shadowMaterialHorizontal,
      fullScreenMesh,
      null
    );
  }
  #getDepthMaterial(object, material, light, type) {
    const shadowSide = { [FrontSide]: BackSide, [BackSide]: FrontSide, [DoubleSide]: DoubleSide };
    let result = null;
    const customMaterial = light.isPointLight === true ? object.customDistanceMaterial : object.customDepthMaterial;
    if (customMaterial !== void 0) {
      result = customMaterial;
    } else {
      result = light.isPointLight === true ? _distanceMaterial : _depthMaterial;
      if (this.#renderer.localClippingEnabled && material.clipShadows === true && Array.isArray(material.clippingPlanes) && material.clippingPlanes.length !== 0 || material.displacementMap && material.displacementScale !== 0 || material.alphaMap && material.alphaTest > 0 || material.map && material.alphaTest > 0) {
        const keyA = result.uuid;
        const keyB = material.uuid;
        let materialsForVariant = this.#materialCache[keyA];
        if (materialsForVariant === void 0) {
          materialsForVariant = {};
          this.#materialCache[keyA] = materialsForVariant;
        }
        let cachedMaterial = materialsForVariant[keyB];
        if (cachedMaterial === void 0) {
          cachedMaterial = result.clone();
          materialsForVariant[keyB] = cachedMaterial;
        }
        result = cachedMaterial;
      }
    }
    result.visible = material.visible;
    result.wireframe = material.wireframe;
    if (type === VSMShadowMap) {
      result.side = material.shadowSide !== null ? material.shadowSide : material.side;
    } else {
      result.side = material.shadowSide !== null ? material.shadowSide : shadowSide[material.side];
    }
    result.alphaMap = material.alphaMap;
    result.alphaTest = material.alphaTest;
    result.map = material.map;
    result.clipShadows = material.clipShadows;
    result.clippingPlanes = material.clippingPlanes;
    result.clipIntersection = material.clipIntersection;
    result.displacementMap = material.displacementMap;
    result.displacementScale = material.displacementScale;
    result.displacementBias = material.displacementBias;
    result.wireframeLinewidth = material.wireframeLinewidth;
    result.linewidth = material.linewidth;
    if (light.isPointLight === true && result.isMeshDistanceMaterial === true) {
      const materialProperties = this.#renderer.properties.get(result);
      materialProperties.light = light;
    }
    return result;
  }
  #renderObject(object, camera, shadowCamera, light, type) {
    if (object.visible === false) return;
    const visible = object.layers.test(camera.layers);
    if (visible && (object.isMesh || object.isLine || object.isPoints)) {
      if ((object.castShadow || object.receiveShadow && type === VSMShadowMap) && (!object.frustumCulled || _frustum.intersectsObject(object))) {
        object.modelViewMatrix.multiplyMatrices(
          shadowCamera.matrixWorldInverse,
          object.matrixWorld
        );
        const geometry = this.#objects.update(object);
        const material = object.material;
        if (Array.isArray(material)) {
          const groups = geometry.groups;
          for (let k = 0, kl = groups.length; k < kl; k++) {
            const group = groups[k];
            const groupMaterial = material[group.materialIndex];
            if (groupMaterial && groupMaterial.visible) {
              const depthMaterial = this.#getDepthMaterial(object, groupMaterial, light, type);
              this.#renderer.renderBufferDirect(
                shadowCamera,
                null,
                geometry,
                depthMaterial,
                object,
                group
              );
            }
          }
        } else if (material.visible) {
          const depthMaterial = this.#getDepthMaterial(object, material, light, type);
          this.#renderer.renderBufferDirect(
            shadowCamera,
            null,
            geometry,
            depthMaterial,
            object,
            null
          );
        }
      }
    }
    const children = object.children;
    for (let i = 0, l = children.length; i < l; i++) {
      this.#renderObject(children[i], camera, shadowCamera, light, type);
    }
  }
}
let _frustum = /* @__PURE__ */ new Frustum();
const _shadowMapSize = /* @__PURE__ */ new Vector2();
const _viewportSize = /* @__PURE__ */ new Vector2();
const _viewport = /* @__PURE__ */ new Vector4();
const _depthMaterial = /* @__PURE__ */ new MeshDepthMaterial({ depthPacking: RGBADepthPacking });
const _distanceMaterial = /* @__PURE__ */ new MeshDistanceMaterial();

class WebGLState {
  #gl;
  #enabledCapabilities;
  #colorBuffer;
  #depthBuffer;
  #stencilBuffer;
  #uboBindings = /* @__PURE__ */ new WeakMap();
  #uboProgramMap = /* @__PURE__ */ new WeakMap();
  #currentBoundFramebuffers = {};
  #currentDrawbuffers = /* @__PURE__ */ new WeakMap();
  #defaultDrawbuffers = [];
  #currentProgram = null;
  #currentBlendingEnabled = false;
  #currentBlending = null;
  #currentBlendEquation = null;
  #currentBlendSrc = null;
  #currentBlendDst = null;
  #currentBlendEquationAlpha = null;
  #currentBlendSrcAlpha = null;
  #currentBlendDstAlpha = null;
  #currentBlendColor = new Color(0, 0, 0);
  #currentBlendAlpha = 0;
  #currentPremultipledAlpha = false;
  #currentFlipSided = null;
  #currentCullFace = null;
  #currentLineWidth = null;
  #currentPolygonOffsetFactor = null;
  #currentPolygonOffsetUnits = null;
  #maxTextures;
  #lineWidthAvailable = false;
  #currentTextureSlot = null;
  #currentBoundTextures = {};
  #currentScissor;
  #currentViewport;
  #emptyTextures = {};
  #equationToGL;
  #factorToGL;
  // public
  buffers;
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLExtensions} extensions
   * @param {WebGLCapabilities} capabilities
   */
  constructor(gl, extensions, capabilities) {
    this.#gl = gl;
    this.#enabledCapabilities = new CapabilityTracker(gl);
    this.#colorBuffer = new ColorBuffer(gl);
    this.#depthBuffer = new DepthBuffer(gl, this.#enabledCapabilities);
    this.#stencilBuffer = new StencilBuffer(gl, this.#enabledCapabilities);
    this.buffers = {
      color: this.#colorBuffer,
      depth: this.#depthBuffer,
      stencil: this.#stencilBuffer
    };
    this.#maxTextures = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    let version = 0;
    const glVersion = gl.getParameter(gl.VERSION);
    if (glVersion.includes("WebGL")) {
      version = parseFloat(/^WebGL (\d)/.exec(glVersion)[1]);
      this.#lineWidthAvailable = version >= 1;
    } else if (glVersion.includes("OpenGL ES")) {
      version = parseFloat(/^OpenGL ES (\d)/.exec(glVersion)[1]);
      this.#lineWidthAvailable = version >= 2;
    }
    const _scissorParam = gl.getParameter(gl.SCISSOR_BOX);
    const _viewportParam = gl.getParameter(gl.VIEWPORT);
    this.#currentScissor = new Vector4().fromArray(_scissorParam);
    this.#currentViewport = new Vector4().fromArray(_viewportParam);
    this.#emptyTextures[gl.TEXTURE_2D] = this.#createTexture(gl.TEXTURE_2D, gl.TEXTURE_2D, 1);
    this.#emptyTextures[gl.TEXTURE_CUBE_MAP] = this.#createTexture(
      gl.TEXTURE_CUBE_MAP,
      gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      6
    );
    this.#emptyTextures[gl.TEXTURE_2D_ARRAY] = this.#createTexture(
      gl.TEXTURE_2D_ARRAY,
      gl.TEXTURE_2D_ARRAY,
      1,
      1
    );
    this.#emptyTextures[gl.TEXTURE_3D] = this.#createTexture(gl.TEXTURE_3D, gl.TEXTURE_3D, 1, 1);
    this.#equationToGL = {
      [AddEquation]: gl.FUNC_ADD,
      [SubtractEquation]: gl.FUNC_SUBTRACT,
      [ReverseSubtractEquation]: gl.FUNC_REVERSE_SUBTRACT,
      [MinEquation]: gl.MIN,
      [MaxEquation]: gl.MAX
    };
    this.#factorToGL = {
      [ZeroFactor]: gl.ZERO,
      [OneFactor]: gl.ONE,
      [SrcColorFactor]: gl.SRC_COLOR,
      [SrcAlphaFactor]: gl.SRC_ALPHA,
      [SrcAlphaSaturateFactor]: gl.SRC_ALPHA_SATURATE,
      [DstColorFactor]: gl.DST_COLOR,
      [DstAlphaFactor]: gl.DST_ALPHA,
      [OneMinusSrcColorFactor]: gl.ONE_MINUS_SRC_COLOR,
      [OneMinusSrcAlphaFactor]: gl.ONE_MINUS_SRC_ALPHA,
      [OneMinusDstColorFactor]: gl.ONE_MINUS_DST_COLOR,
      [OneMinusDstAlphaFactor]: gl.ONE_MINUS_DST_ALPHA,
      [ConstantColorFactor]: gl.CONSTANT_COLOR,
      [OneMinusConstantColorFactor]: gl.ONE_MINUS_CONSTANT_COLOR,
      [ConstantAlphaFactor]: gl.CONSTANT_ALPHA,
      [OneMinusConstantAlphaFactor]: gl.ONE_MINUS_CONSTANT_ALPHA
    };
    this.#colorBuffer.setClear(0, 0, 0, 1);
    this.#depthBuffer.setClear(1);
    this.#stencilBuffer.setClear(0);
    this.enable(gl.DEPTH_TEST);
    this.#depthBuffer.setFunc(LessEqualDepth);
    this.setFlipSided(false);
    this.setCullFace(CullFaceBack);
    this.enable(gl.CULL_FACE);
    this.setBlending(NoBlending);
  }
  #createTexture(type, target, count, dimensions) {
    const gl = this.#gl;
    const data = new Uint8Array(4);
    const texture = gl.createTexture();
    gl.bindTexture(type, texture);
    gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(type, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    for (let i = 0; i < count; i++) {
      if (type === gl.TEXTURE_3D || type === gl.TEXTURE_2D_ARRAY) {
        gl.texImage3D(target, 0, gl.RGBA, 1, 1, dimensions, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      } else {
        gl.texImage2D(target + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      }
    }
    return texture;
  }
  //
  enable(id) {
    this.#enabledCapabilities.enable(id);
  }
  disable(id) {
    this.#enabledCapabilities.disable(id);
  }
  //
  bindFramebuffer(target, framebuffer) {
    const gl = this.#gl;
    const currentBoundFramebuffers = this.#currentBoundFramebuffers;
    if (currentBoundFramebuffers[target] !== framebuffer) {
      gl.bindFramebuffer(target, framebuffer);
      currentBoundFramebuffers[target] = framebuffer;
      if (target === gl.DRAW_FRAMEBUFFER) {
        currentBoundFramebuffers[gl.FRAMEBUFFER] = framebuffer;
      }
      if (target === gl.FRAMEBUFFER) {
        currentBoundFramebuffers[gl.DRAW_FRAMEBUFFER] = framebuffer;
      }
      return true;
    }
    return false;
  }
  drawBuffers(renderTarget, framebuffer) {
    const gl = this.#gl;
    let drawBuffers = this.#defaultDrawbuffers;
    let needsUpdate = false;
    if (renderTarget) {
      drawBuffers = this.#currentDrawbuffers.get(framebuffer);
      if (drawBuffers === void 0) {
        drawBuffers = [];
        this.#currentDrawbuffers.set(framebuffer, drawBuffers);
      }
      if (renderTarget.isWebGLMultipleRenderTargets) {
        const textures = renderTarget.texture;
        if (drawBuffers.length !== textures.length || drawBuffers[0] !== gl.COLOR_ATTACHMENT0) {
          for (let i = 0, il = textures.length; i < il; i++) {
            drawBuffers[i] = gl.COLOR_ATTACHMENT0 + i;
          }
          drawBuffers.length = textures.length;
          needsUpdate = true;
        }
      } else {
        if (drawBuffers[0] !== gl.COLOR_ATTACHMENT0) {
          drawBuffers[0] = gl.COLOR_ATTACHMENT0;
          needsUpdate = true;
        }
      }
    } else {
      if (drawBuffers[0] !== gl.BACK) {
        drawBuffers[0] = gl.BACK;
        needsUpdate = true;
      }
    }
    if (needsUpdate) {
      gl.drawBuffers(drawBuffers);
    }
  }
  //
  useProgram(program) {
    if (this.#currentProgram !== program) {
      this.#gl.useProgram(program);
      this.#currentProgram = program;
      return true;
    }
    return false;
  }
  //
  setBlending(blending, blendEquation, blendSrc, blendDst, blendEquationAlpha, blendSrcAlpha, blendDstAlpha, blendColor, blendAlpha, premultipliedAlpha) {
    const gl = this.#gl;
    if (blending === NoBlending) {
      if (this.#currentBlendingEnabled === true) {
        this.disable(gl.BLEND);
        this.#currentBlendingEnabled = false;
      }
      return;
    }
    if (this.#currentBlendingEnabled === false) {
      this.enable(gl.BLEND);
      this.#currentBlendingEnabled = true;
    }
    if (blending !== CustomBlending) {
      if (blending !== this.#currentBlending || premultipliedAlpha !== this.#currentPremultipledAlpha) {
        if (this.#currentBlendEquation !== AddEquation || this.#currentBlendEquationAlpha !== AddEquation) {
          gl.blendEquation(gl.FUNC_ADD);
          this.#currentBlendEquation = AddEquation;
          this.#currentBlendEquationAlpha = AddEquation;
        }
        if (premultipliedAlpha) {
          switch (blending) {
            case NormalBlending:
              gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
              break;
            case AdditiveBlending:
              gl.blendFunc(gl.ONE, gl.ONE);
              break;
            case SubtractiveBlending:
              gl.blendFuncSeparate(gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ZERO, gl.ONE);
              break;
            case MultiplyBlending:
              gl.blendFuncSeparate(gl.ZERO, gl.SRC_COLOR, gl.ZERO, gl.SRC_ALPHA);
              break;
            default:
              console.error("WebGLState: Invalid blending: ", blending);
              break;
          }
        } else {
          switch (blending) {
            case NormalBlending:
              gl.blendFuncSeparate(
                gl.SRC_ALPHA,
                gl.ONE_MINUS_SRC_ALPHA,
                gl.ONE,
                gl.ONE_MINUS_SRC_ALPHA
              );
              break;
            case AdditiveBlending:
              gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
              break;
            case SubtractiveBlending:
              gl.blendFuncSeparate(gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ZERO, gl.ONE);
              break;
            case MultiplyBlending:
              gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
              break;
            default:
              console.error("WebGLState: Invalid blending: ", blending);
              break;
          }
        }
        this.#currentBlendSrc = null;
        this.#currentBlendDst = null;
        this.#currentBlendSrcAlpha = null;
        this.#currentBlendDstAlpha = null;
        this.#currentBlendColor.set(0, 0, 0);
        this.#currentBlendAlpha = 0;
        this.#currentBlending = blending;
        this.#currentPremultipledAlpha = premultipliedAlpha;
      }
      return;
    }
    blendEquationAlpha = blendEquationAlpha || blendEquation;
    blendSrcAlpha = blendSrcAlpha || blendSrc;
    blendDstAlpha = blendDstAlpha || blendDst;
    if (blendEquation !== this.#currentBlendEquation || blendEquationAlpha !== this.#currentBlendEquationAlpha) {
      gl.blendEquationSeparate(
        this.#equationToGL[blendEquation],
        this.#equationToGL[blendEquationAlpha]
      );
      this.#currentBlendEquation = blendEquation;
      this.#currentBlendEquationAlpha = blendEquationAlpha;
    }
    if (blendSrc !== this.#currentBlendSrc || blendDst !== this.#currentBlendDst || blendSrcAlpha !== this.#currentBlendSrcAlpha || blendDstAlpha !== this.#currentBlendDstAlpha) {
      gl.blendFuncSeparate(
        this.#factorToGL[blendSrc],
        this.#factorToGL[blendDst],
        this.#factorToGL[blendSrcAlpha],
        this.#factorToGL[blendDstAlpha]
      );
      this.#currentBlendSrc = blendSrc;
      this.#currentBlendDst = blendDst;
      this.#currentBlendSrcAlpha = blendSrcAlpha;
      this.#currentBlendDstAlpha = blendDstAlpha;
    }
    if (blendColor.equals(this.#currentBlendColor) === false || blendAlpha !== this.#currentBlendAlpha) {
      gl.blendColor(blendColor.r, blendColor.g, blendColor.b, blendAlpha);
      this.#currentBlendColor.copy(blendColor);
      this.#currentBlendAlpha = blendAlpha;
    }
    this.#currentBlending = blending;
    this.#currentPremultipledAlpha = false;
  }
  setMaterial(material, frontFaceCW) {
    const gl = this.#gl;
    material.side === DoubleSide ? this.disable(gl.CULL_FACE) : this.enable(gl.CULL_FACE);
    let flipSided = material.side === BackSide;
    if (frontFaceCW) flipSided = !flipSided;
    this.setFlipSided(flipSided);
    material.blending === NormalBlending && material.transparent === false ? this.setBlending(NoBlending) : this.setBlending(
      material.blending,
      material.blendEquation,
      material.blendSrc,
      material.blendDst,
      material.blendEquationAlpha,
      material.blendSrcAlpha,
      material.blendDstAlpha,
      material.blendColor,
      material.blendAlpha,
      material.premultipliedAlpha
    );
    this.#depthBuffer.setFunc(material.depthFunc);
    this.#depthBuffer.setTest(material.depthTest);
    this.#depthBuffer.setMask(material.depthWrite);
    this.#colorBuffer.setMask(material.colorWrite);
    const stencilWrite = material.stencilWrite;
    this.#stencilBuffer.setTest(stencilWrite);
    if (stencilWrite) {
      this.#stencilBuffer.setMask(material.stencilWriteMask);
      this.#stencilBuffer.setFunc(
        material.stencilFunc,
        material.stencilRef,
        material.stencilFuncMask
      );
      this.#stencilBuffer.setOp(material.stencilFail, material.stencilZFail, material.stencilZPass);
    }
    this.setPolygonOffset(
      material.polygonOffset,
      material.polygonOffsetFactor,
      material.polygonOffsetUnits
    );
    material.alphaToCoverage === true ? this.enable(gl.SAMPLE_ALPHA_TO_COVERAGE) : this.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
  }
  //
  setFlipSided(flipSided) {
    const gl = this.#gl;
    if (this.#currentFlipSided !== flipSided) {
      if (flipSided) {
        gl.frontFace(gl.CW);
      } else {
        gl.frontFace(gl.CCW);
      }
      this.#currentFlipSided = flipSided;
    }
  }
  setCullFace(cullFace) {
    const gl = this.#gl;
    if (cullFace !== CullFaceNone) {
      this.enable(gl.CULL_FACE);
      if (cullFace !== this.#currentCullFace) {
        if (cullFace === CullFaceBack) {
          gl.cullFace(gl.BACK);
        } else if (cullFace === CullFaceFront) {
          gl.cullFace(gl.FRONT);
        } else {
          gl.cullFace(gl.FRONT_AND_BACK);
        }
      }
    } else {
      this.disable(gl.CULL_FACE);
    }
    this.#currentCullFace = cullFace;
  }
  //
  setLineWidth(width) {
    if (width !== this.#currentLineWidth) {
      if (this.#lineWidthAvailable) this.#gl.lineWidth(width);
      this.#currentLineWidth = width;
    }
  }
  setPolygonOffset(polygonOffset, factor, units) {
    const gl = this.#gl;
    if (polygonOffset) {
      this.enable(gl.POLYGON_OFFSET_FILL);
      if (this.#currentPolygonOffsetFactor !== factor || this.#currentPolygonOffsetUnits !== units) {
        gl.polygonOffset(factor, units);
        this.#currentPolygonOffsetFactor = factor;
        this.#currentPolygonOffsetUnits = units;
      }
    } else {
      this.disable(gl.POLYGON_OFFSET_FILL);
    }
  }
  //
  setScissorTest(scissorTest) {
    const gl = this.#gl;
    if (scissorTest) {
      this.enable(gl.SCISSOR_TEST);
    } else {
      this.disable(gl.SCISSOR_TEST);
    }
  }
  // texture
  activeTexture(webglSlot) {
    const gl = this.#gl;
    if (webglSlot === void 0) webglSlot = gl.TEXTURE0 + this.#maxTextures - 1;
    if (this.#currentTextureSlot !== webglSlot) {
      gl.activeTexture(webglSlot);
      this.#currentTextureSlot = webglSlot;
    }
  }
  bindTexture(webglType, webglTexture, webglSlot) {
    const gl = this.#gl;
    if (webglSlot === void 0) {
      if (this.#currentTextureSlot === null) {
        webglSlot = gl.TEXTURE0 + this.#maxTextures - 1;
      } else {
        webglSlot = this.#currentTextureSlot;
      }
    }
    let boundTexture = this.#currentBoundTextures[webglSlot];
    if (boundTexture === void 0) {
      boundTexture = { type: void 0, texture: void 0 };
      this.#currentBoundTextures[webglSlot] = boundTexture;
    }
    if (boundTexture.type !== webglType || boundTexture.texture !== webglTexture) {
      if (this.#currentTextureSlot !== webglSlot) {
        gl.activeTexture(webglSlot);
        this.#currentTextureSlot = webglSlot;
      }
      gl.bindTexture(webglType, webglTexture || this.#emptyTextures[webglType]);
      boundTexture.type = webglType;
      boundTexture.texture = webglTexture;
    }
  }
  unbindTexture() {
    const boundTexture = this.#currentBoundTextures[this.#currentTextureSlot];
    if (boundTexture !== void 0 && boundTexture.type !== void 0) {
      this.#gl.bindTexture(boundTexture.type, null);
      boundTexture.type = void 0;
      boundTexture.texture = void 0;
    }
  }
  compressedTexImage2D(...args) {
    try {
      this.#gl.compressedTexImage2D(...args);
    } catch (error) {
      console.error("WebGLState:", error);
    }
  }
  compressedTexImage3D(...args) {
    try {
      this.#gl.compressedTexImage3D(...args);
    } catch (error) {
      console.error("WebGLState:", error);
    }
  }
  texSubImage2D(...args) {
    try {
      this.#gl.texSubImage2D(...args);
    } catch (error) {
      console.error("WebGLState:", error);
    }
  }
  texSubImage3D(...args) {
    try {
      this.#gl.texSubImage3D(...args);
    } catch (error) {
      console.error("WebGLState:", error);
    }
  }
  compressedTexSubImage2D(...args) {
    try {
      this.#gl.compressedTexSubImage2D(...args);
    } catch (error) {
      console.error("WebGLState:", error);
    }
  }
  compressedTexSubImage3D(...args) {
    try {
      this.#gl.compressedTexSubImage3D(...args);
    } catch (error) {
      console.error("WebGLState:", error);
    }
  }
  texStorage2D(...args) {
    try {
      this.#gl.texStorage2D(...args);
    } catch (error) {
      console.error("WebGLState:", error);
    }
  }
  texStorage3D(...args) {
    try {
      this.#gl.texStorage3D(...args);
    } catch (error) {
      console.error("WebGLState:", error);
    }
  }
  texImage2D(...args) {
    try {
      this.#gl.texImage2D(...args);
    } catch (error) {
      console.error("WebGLState:", error);
    }
  }
  texImage3D(...args) {
    try {
      this.#gl.texImage3D(...args);
    } catch (error) {
      console.error("WebGLState:", error);
    }
  }
  //
  scissor(scissor) {
    if (this.#currentScissor.equals(scissor) === false) {
      this.#gl.scissor(scissor.x, scissor.y, scissor.z, scissor.w);
      this.#currentScissor.copy(scissor);
    }
  }
  viewport(viewport) {
    if (this.#currentViewport.equals(viewport) === false) {
      this.#gl.viewport(viewport.x, viewport.y, viewport.z, viewport.w);
      this.#currentViewport.copy(viewport);
    }
  }
  //
  updateUBOMapping(uniformsGroup, program) {
    let mapping = this.#uboProgramMap.get(program);
    if (mapping === void 0) {
      mapping = /* @__PURE__ */ new WeakMap();
      this.#uboProgramMap.set(program, mapping);
    }
    let blockIndex = mapping.get(uniformsGroup);
    if (blockIndex === void 0) {
      blockIndex = this.#gl.getUniformBlockIndex(program, uniformsGroup.name);
      mapping.set(uniformsGroup, blockIndex);
    }
  }
  uniformBlockBinding(uniformsGroup, program) {
    const mapping = this.#uboProgramMap.get(program);
    const blockIndex = mapping.get(uniformsGroup);
    if (this.#uboBindings.get(program) !== blockIndex) {
      this.#gl.uniformBlockBinding(program, blockIndex, uniformsGroup.__bindingPointIndex);
      this.#uboBindings.set(program, blockIndex);
    }
  }
  //
  reset() {
    const gl = this.#gl;
    gl.disable(gl.BLEND);
    gl.disable(gl.CULL_FACE);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.disable(gl.SCISSOR_TEST);
    gl.disable(gl.STENCIL_TEST);
    gl.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.ONE, gl.ZERO);
    gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO);
    gl.blendColor(0, 0, 0, 0);
    gl.colorMask(true, true, true, true);
    gl.clearColor(0, 0, 0, 0);
    gl.depthMask(true);
    gl.depthFunc(gl.LESS);
    gl.clearDepth(1);
    gl.stencilMask(4294967295);
    gl.stencilFunc(gl.ALWAYS, 0, 4294967295);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
    gl.clearStencil(0);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);
    gl.polygonOffset(0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    gl.useProgram(null);
    gl.lineWidth(1);
    gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    this.#enabledCapabilities.reset();
    this.#currentTextureSlot = null;
    this.#currentBoundTextures = {};
    this.#currentBoundFramebuffers = {};
    this.#currentDrawbuffers = /* @__PURE__ */ new WeakMap();
    this.#defaultDrawbuffers = [];
    this.#currentProgram = null;
    this.#currentBlendingEnabled = false;
    this.#currentBlending = null;
    this.#currentBlendEquation = null;
    this.#currentBlendSrc = null;
    this.#currentBlendDst = null;
    this.#currentBlendEquationAlpha = null;
    this.#currentBlendSrcAlpha = null;
    this.#currentBlendDstAlpha = null;
    this.#currentBlendColor = new Color(0, 0, 0);
    this.#currentBlendAlpha = 0;
    this.#currentPremultipledAlpha = false;
    this.#currentFlipSided = null;
    this.#currentCullFace = null;
    this.#currentLineWidth = null;
    this.#currentPolygonOffsetFactor = null;
    this.#currentPolygonOffsetUnits = null;
    this.#currentScissor.set(0, 0, gl.canvas.width, gl.canvas.height);
    this.#currentViewport.set(0, 0, gl.canvas.width, gl.canvas.height);
    this.#colorBuffer.reset();
    this.#depthBuffer.reset();
    this.#stencilBuffer.reset();
  }
}
class CapabilityTracker {
  #gl;
  #capabilities = {};
  // EP : Map ?
  /** @param {WebGL2RenderingContext} gl */
  constructor(gl) {
    this.#gl = gl;
  }
  enable(id) {
    if (this.#capabilities[id] !== true) {
      this.#gl.enable(id);
      this.#capabilities[id] = true;
    }
  }
  disable(id) {
    if (this.#capabilities[id] !== false) {
      this.#gl.disable(id);
      this.#capabilities[id] = false;
    }
  }
  reset() {
    this.#capabilities = {};
  }
}
class ColorBuffer {
  #gl;
  #locked = false;
  #color = new Vector4();
  #currentColorMask = null;
  #currentColorClear = new Vector4(0, 0, 0, 0);
  /** @param {WebGL2RenderingContext} gl */
  constructor(gl) {
    this.#gl = gl;
  }
  setMask(colorMask) {
    if (this.#currentColorMask !== colorMask && !this.#locked) {
      this.#gl.colorMask(colorMask, colorMask, colorMask, colorMask);
      this.#currentColorMask = colorMask;
    }
  }
  setLocked(lock) {
    this.#locked = lock;
  }
  setClear(r, g, b, a, premultipliedAlpha) {
    if (premultipliedAlpha === true) {
      r *= a;
      g *= a;
      b *= a;
    }
    this.#color.set(r, g, b, a);
    if (this.#currentColorClear.equals(this.#color) === false) {
      this.#gl.clearColor(r, g, b, a);
      this.#currentColorClear.copy(this.#color);
    }
  }
  reset() {
    this.#locked = false;
    this.#currentColorMask = null;
    this.#currentColorClear.set(-1, 0, 0, 0);
  }
}
class DepthBuffer {
  #gl;
  #capabilities;
  #locked = false;
  #currentDepthMask = null;
  #currentDepthFunc = null;
  #currentDepthClear = null;
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {CapabilityTracker} capabilities
   */
  constructor(gl, capabilities) {
    this.#gl = gl;
    this.#capabilities = capabilities;
  }
  setTest(depthTest) {
    if (depthTest) {
      this.#capabilities.enable(this.#gl.DEPTH_TEST);
    } else {
      this.#capabilities.disable(this.#gl.DEPTH_TEST);
    }
  }
  setMask(depthMask) {
    if (this.#currentDepthMask !== depthMask && !this.#locked) {
      this.#gl.depthMask(depthMask);
      this.#currentDepthMask = depthMask;
    }
  }
  setFunc(depthFunc) {
    const gl = this.#gl;
    if (this.#currentDepthFunc !== depthFunc) {
      switch (depthFunc) {
        case NeverDepth:
          gl.depthFunc(gl.NEVER);
          break;
        case AlwaysDepth:
          gl.depthFunc(gl.ALWAYS);
          break;
        case LessDepth:
          gl.depthFunc(gl.LESS);
          break;
        case LessEqualDepth:
          gl.depthFunc(gl.LEQUAL);
          break;
        case EqualDepth:
          gl.depthFunc(gl.EQUAL);
          break;
        case GreaterEqualDepth:
          gl.depthFunc(gl.GEQUAL);
          break;
        case GreaterDepth:
          gl.depthFunc(gl.GREATER);
          break;
        case NotEqualDepth:
          gl.depthFunc(gl.NOTEQUAL);
          break;
        default:
          gl.depthFunc(gl.LEQUAL);
      }
      this.#currentDepthFunc = depthFunc;
    }
  }
  setLocked(lock) {
    this.#locked = lock;
  }
  setClear(depth) {
    if (this.#currentDepthClear !== depth) {
      this.#gl.clearDepth(depth);
      this.#currentDepthClear = depth;
    }
  }
  reset() {
    this.#locked = false;
    this.#currentDepthMask = null;
    this.#currentDepthFunc = null;
    this.#currentDepthClear = null;
  }
}
class StencilBuffer {
  #gl;
  #capabilities;
  #locked = false;
  #currentStencilMask = null;
  #currentStencilFunc = null;
  #currentStencilRef = null;
  #currentStencilFuncMask = null;
  #currentStencilFail = null;
  #currentStencilZFail = null;
  #currentStencilZPass = null;
  #currentStencilClear = null;
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {CapabilityTracker} capabilities
   */
  constructor(gl, capabilities) {
    this.#gl = gl;
    this.#capabilities = capabilities;
  }
  setTest(stencilTest) {
    if (!this.#locked) {
      if (stencilTest) {
        this.#capabilities.enable(this.#gl.STENCIL_TEST);
      } else {
        this.#capabilities.disable(this.#gl.STENCIL_TEST);
      }
    }
  }
  setMask(stencilMask) {
    if (this.#currentStencilMask !== stencilMask && !this.#locked) {
      this.#gl.stencilMask(stencilMask);
      this.#currentStencilMask = stencilMask;
    }
  }
  setFunc(stencilFunc, stencilRef, stencilMask) {
    if (this.#currentStencilFunc !== stencilFunc || this.#currentStencilRef !== stencilRef || this.#currentStencilFuncMask !== stencilMask) {
      this.#gl.stencilFunc(stencilFunc, stencilRef, stencilMask);
      this.#currentStencilFunc = stencilFunc;
      this.#currentStencilRef = stencilRef;
      this.#currentStencilFuncMask = stencilMask;
    }
  }
  setOp(stencilFail, stencilZFail, stencilZPass) {
    if (this.#currentStencilFail !== stencilFail || this.#currentStencilZFail !== stencilZFail || this.#currentStencilZPass !== stencilZPass) {
      this.#gl.stencilOp(stencilFail, stencilZFail, stencilZPass);
      this.#currentStencilFail = stencilFail;
      this.#currentStencilZFail = stencilZFail;
      this.#currentStencilZPass = stencilZPass;
    }
  }
  setLocked(lock) {
    this.#locked = lock;
  }
  setClear(stencil) {
    if (this.#currentStencilClear !== stencil) {
      this.#gl.clearStencil(stencil);
      this.#currentStencilClear = stencil;
    }
  }
  reset() {
    this.#locked = false;
    this.#currentStencilMask = null;
    this.#currentStencilFunc = null;
    this.#currentStencilRef = null;
    this.#currentStencilFuncMask = null;
    this.#currentStencilFail = null;
    this.#currentStencilZFail = null;
    this.#currentStencilZPass = null;
    this.#currentStencilClear = null;
  }
}

class WebGLTextures {
  #gl;
  #extensions;
  #state;
  #properties;
  #capabilities;
  #utils;
  #info;
  #maxTextures;
  #maxCubemapSize;
  #maxTextureSize;
  #maxSamples;
  #supportsInvalidateFramebuffer;
  #useOffscreenCanvas = false;
  #canvas;
  #videoTextures = /* @__PURE__ */ new WeakMap();
  #sources = /* @__PURE__ */ new WeakMap();
  // maps WebglTexture objects to instances of Source
  #textureUnits = 0;
  #wrappingToGL;
  #filterToGL;
  #compareToGL;
  onTextureDispose;
  onRenderTargetDispose;
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLExtensions} extensions
   * @param {WebGLState} state
   * @param {WebGLCapabilities} capabilities
   * @param {WebGLUtils} utils
   * @param {WebGLInfo} info
   */
  constructor(gl, extensions, state, properties, capabilities, utils, info) {
    this.#gl = gl;
    this.#extensions = extensions;
    this.#state = state;
    this.#properties = properties;
    this.#capabilities = capabilities;
    this.#utils = utils;
    this.#info = info;
    this.#maxTextures = capabilities.maxTextures;
    this.#maxCubemapSize = capabilities.maxCubemapSize;
    this.#maxTextureSize = capabilities.maxTextureSize;
    this.#maxSamples = capabilities.maxSamples;
    this.#supportsInvalidateFramebuffer = typeof navigator === "undefined" ? false : /OculusBrowser/g.test(navigator.userAgent);
    try {
      this.#useOffscreenCanvas = typeof OffscreenCanvas !== "undefined" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
    } catch (err) {
    }
    this.#wrappingToGL = {
      [RepeatWrapping]: gl.REPEAT,
      [ClampToEdgeWrapping]: gl.CLAMP_TO_EDGE,
      [MirroredRepeatWrapping]: gl.MIRRORED_REPEAT
    };
    this.#filterToGL = {
      [NearestFilter]: gl.NEAREST,
      [NearestMipmapNearestFilter]: gl.NEAREST_MIPMAP_NEAREST,
      [NearestMipmapLinearFilter]: gl.NEAREST_MIPMAP_LINEAR,
      [LinearFilter]: gl.LINEAR,
      [LinearMipmapNearestFilter]: gl.LINEAR_MIPMAP_NEAREST,
      [LinearMipmapLinearFilter]: gl.LINEAR_MIPMAP_LINEAR
    };
    this.#compareToGL = {
      [NeverCompare]: gl.NEVER,
      [AlwaysCompare]: gl.ALWAYS,
      [LessCompare]: gl.LESS,
      [LessEqualCompare]: gl.LEQUAL,
      [EqualCompare]: gl.EQUAL,
      [GreaterEqualCompare]: gl.GEQUAL,
      [GreaterCompare]: gl.GREATER,
      [NotEqualCompare]: gl.NOTEQUAL
    };
    this.onTextureDispose = this.#onTextureDispose.bind(this);
    this.onRenderTargetDispose = this.#onRenderTargetDispose.bind(this);
  }
  #createCanvas(width, height) {
    return this.#useOffscreenCanvas ? new OffscreenCanvas(width, height) : createElementNS("canvas");
  }
  #resizeImage(image, needsNewCanvas, maxSize) {
    let scale = 1;
    if (image.width > maxSize || image.height > maxSize) {
      scale = maxSize / Math.max(image.width, image.height);
    }
    if (scale < 1) {
      if (typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement || typeof HTMLCanvasElement !== "undefined" && image instanceof HTMLCanvasElement || typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap) {
        const width = Math.floor(scale * image.width);
        const height = Math.floor(scale * image.height);
        if (this.#canvas === void 0) this.#canvas = this.#createCanvas(width, height);
        const canvas = needsNewCanvas ? this.#createCanvas(width, height) : this.#canvas;
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, width, height);
        console.warn(
          `WebGLRenderer: Texture has been resized from (${image.width}x${image.height}) to (${width}x${height}).`
        );
        return canvas;
      } else {
        if ("data" in image) {
          console.warn(
            `WebGLRenderer: Image in DataTexture is too big (${image.width}x${image.height}).`
          );
        }
        return image;
      }
    }
    return image;
  }
  #textureNeedsGenerateMipmaps(texture, supportsMips) {
    return texture.generateMipmaps && supportsMips && texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter;
  }
  #generateMipmap(target) {
    this.#gl.generateMipmap(target);
  }
  #getInternalFormat(internalFormatName, glFormat, glType, colorSpace, forceLinearTransfer = false) {
    const gl = this.#gl;
    if (internalFormatName !== null) {
      if (gl[internalFormatName] !== void 0) return gl[internalFormatName];
      console.warn(
        `WebGLRenderer: Attempt to use non-existing WebGL internal format '${internalFormatName}'`
      );
    }
    let internalFormat = glFormat;
    if (glFormat === gl.RED) {
      if (glType === gl.FLOAT) internalFormat = gl.R32F;
      if (glType === gl.HALF_FLOAT) internalFormat = gl.R16F;
      if (glType === gl.UNSIGNED_BYTE) internalFormat = gl.R8;
    }
    if (glFormat === gl.RED_INTEGER) {
      if (glType === gl.UNSIGNED_BYTE) internalFormat = gl.R8UI;
      if (glType === gl.UNSIGNED_SHORT) internalFormat = gl.R16UI;
      if (glType === gl.UNSIGNED_INT) internalFormat = gl.R32UI;
      if (glType === gl.BYTE) internalFormat = gl.R8I;
      if (glType === gl.SHORT) internalFormat = gl.R16I;
      if (glType === gl.INT) internalFormat = gl.R32I;
    }
    if (glFormat === gl.RG) {
      if (glType === gl.FLOAT) internalFormat = gl.RG32F;
      if (glType === gl.HALF_FLOAT) internalFormat = gl.RG16F;
      if (glType === gl.UNSIGNED_BYTE) internalFormat = gl.RG8;
    }
    if (glFormat === gl.RG_INTEGER) {
      if (glType === gl.UNSIGNED_BYTE) internalFormat = gl.RG8UI;
      if (glType === gl.UNSIGNED_SHORT) internalFormat = gl.RG16UI;
      if (glType === gl.UNSIGNED_INT) internalFormat = gl.RG32UI;
      if (glType === gl.BYTE) internalFormat = gl.RG8I;
      if (glType === gl.SHORT) internalFormat = gl.RG16I;
      if (glType === gl.INT) internalFormat = gl.RG32I;
    }
    if (glFormat === gl.RGB_INTEGER) {
      if (glType === gl.UNSIGNED_BYTE) internalFormat = gl.RGB8UI;
      if (glType === gl.UNSIGNED_SHORT) internalFormat = gl.RGB16UI;
      if (glType === gl.UNSIGNED_INT) internalFormat = gl.RGB32UI;
      if (glType === gl.BYTE) internalFormat = gl.RGB8I;
      if (glType === gl.SHORT) internalFormat = gl.RGB16I;
      if (glType === gl.INT) internalFormat = gl.RGB32I;
    }
    if (glFormat === gl.RGBA_INTEGER) {
      if (glType === gl.UNSIGNED_BYTE) internalFormat = gl.RGBA8UI;
      if (glType === gl.UNSIGNED_SHORT) internalFormat = gl.RGBA16UI;
      if (glType === gl.UNSIGNED_INT) internalFormat = gl.RGBA32UI;
      if (glType === gl.BYTE) internalFormat = gl.RGBA8I;
      if (glType === gl.SHORT) internalFormat = gl.RGBA16I;
      if (glType === gl.INT) internalFormat = gl.RGBA32I;
    }
    if (glFormat === gl.RGB) {
      if (glType === gl.UNSIGNED_INT_5_9_9_9_REV) internalFormat = gl.RGB9_E5;
      if (glType === gl.UNSIGNED_INT_10F_11F_11F_REV) internalFormat = gl.R11F_G11F_B10F;
    }
    if (glFormat === gl.RGBA) {
      const transfer = forceLinearTransfer ? LinearTransfer : ColorManagement.getTransfer(colorSpace);
      if (glType === gl.FLOAT) internalFormat = gl.RGBA32F;
      if (glType === gl.HALF_FLOAT) internalFormat = gl.RGBA16F;
      if (glType === gl.UNSIGNED_BYTE)
        internalFormat = transfer === SRGBTransfer ? gl.SRGB8_ALPHA8 : gl.RGBA8;
      if (glType === gl.UNSIGNED_SHORT_4_4_4_4) internalFormat = gl.RGBA4;
      if (glType === gl.UNSIGNED_SHORT_5_5_5_1) internalFormat = gl.RGB5_A1;
    }
    if (internalFormat === gl.R16F || internalFormat === gl.R32F || internalFormat === gl.RG16F || internalFormat === gl.RG32F || internalFormat === gl.RGBA16F || internalFormat === gl.RGBA32F) {
      this.#extensions.get("EXT_color_buffer_float");
    }
    return internalFormat;
  }
  #getMipLevels(texture, image, supportsMips) {
    if (this.#textureNeedsGenerateMipmaps(texture, supportsMips) === true || texture.isFramebufferTexture && texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter) {
      return 1 + Math.floor(Math.log2(Math.max(image.width, image.height)));
    } else if (texture.mipmaps !== void 0 && texture.mipmaps.length > 0) {
      return texture.mipmaps.length;
    } else if (texture.isCompressedTexture && Array.isArray(texture.image)) {
      return image.mipmaps.length;
    } else {
      return 1;
    }
  }
  // Fallback filters for non-power-of-2 textures
  #filterFallback(f) {
    const gl = this.#gl;
    if (f === NearestFilter || f === NearestMipmapNearestFilter || f === NearestMipmapLinearFilter) {
      return gl.NEAREST;
    }
    return gl.LINEAR;
  }
  //
  #onTextureDispose(event) {
    const texture = event.target;
    texture.removeEventListener("dispose", this.onTextureDispose);
    this.#deallocateTexture(texture);
    if (texture.isVideoTexture) {
      this.#videoTextures.delete(texture);
    }
  }
  #onRenderTargetDispose(event) {
    const renderTarget = event.target;
    renderTarget.removeEventListener("dispose", this.onRenderTargetDispose);
    this.#deallocateRenderTarget(renderTarget);
  }
  //
  #deallocateTexture(texture) {
    const textureProperties = this.#properties.get(texture);
    if (textureProperties.__webglInit === void 0) return;
    const source = texture.source;
    const webglTextures = this.#sources.get(source);
    if (webglTextures) {
      const webglTexture = webglTextures[textureProperties.__cacheKey];
      webglTexture.usedTimes--;
      if (webglTexture.usedTimes === 0) {
        this.#deleteTexture(texture);
      }
      if (Object.keys(webglTextures).length === 0) {
        this.#sources.delete(source);
      }
    }
    this.#properties.remove(texture);
  }
  #deleteTexture(texture) {
    const textureProperties = this.#properties.get(texture);
    this.#gl.deleteTexture(textureProperties.__webglTexture);
    const source = texture.source;
    const webglTextures = this.#sources.get(source);
    delete webglTextures[textureProperties.__cacheKey];
    this.#info.memory.textures--;
  }
  #deallocateRenderTarget(renderTarget) {
    const gl = this.#gl;
    const properties = this.#properties;
    const texture = renderTarget.texture;
    const renderTargetProperties = properties.get(renderTarget);
    const textureProperties = properties.get(texture);
    if (textureProperties.__webglTexture !== void 0) {
      gl.deleteTexture(textureProperties.__webglTexture);
      this.#info.memory.textures--;
    }
    if (renderTarget.depthTexture) {
      renderTarget.depthTexture.dispose();
    }
    if (renderTarget.isWebGLCubeRenderTarget) {
      for (let i = 0; i < 6; i++) {
        if (Array.isArray(renderTargetProperties.__webglFramebuffer[i])) {
          for (let level = 0; level < renderTargetProperties.__webglFramebuffer[i].length; level++)
            gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[i][level]);
        } else {
          gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[i]);
        }
        if (renderTargetProperties.__webglDepthbuffer)
          gl.deleteRenderbuffer(renderTargetProperties.__webglDepthbuffer[i]);
      }
    } else {
      if (Array.isArray(renderTargetProperties.__webglFramebuffer)) {
        for (let level = 0; level < renderTargetProperties.__webglFramebuffer.length; level++)
          gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[level]);
      } else {
        gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer);
      }
      if (renderTargetProperties.__webglDepthbuffer)
        gl.deleteRenderbuffer(renderTargetProperties.__webglDepthbuffer);
      if (renderTargetProperties.__webglMultisampledFramebuffer)
        gl.deleteFramebuffer(renderTargetProperties.__webglMultisampledFramebuffer);
      if (renderTargetProperties.__webglColorRenderbuffer) {
        for (let i = 0; i < renderTargetProperties.__webglColorRenderbuffer.length; i++) {
          if (renderTargetProperties.__webglColorRenderbuffer[i])
            gl.deleteRenderbuffer(renderTargetProperties.__webglColorRenderbuffer[i]);
        }
      }
      if (renderTargetProperties.__webglDepthRenderbuffer)
        gl.deleteRenderbuffer(renderTargetProperties.__webglDepthRenderbuffer);
    }
    if (renderTarget.isWebGLMultipleRenderTargets) {
      for (let i = 0, il = texture.length; i < il; i++) {
        const attachmentProperties = properties.get(texture[i]);
        if (attachmentProperties.__webglTexture) {
          gl.deleteTexture(attachmentProperties.__webglTexture);
          this.#info.memory.textures--;
        }
        properties.remove(texture[i]);
      }
    }
    properties.remove(texture);
    properties.remove(renderTarget);
  }
  //
  resetTextureUnits() {
    this.#textureUnits = 0;
  }
  allocateTextureUnit() {
    const textureUnit = this.#textureUnits;
    if (textureUnit >= this.#maxTextures) {
      console.warn(
        `WebGLTextures: Trying to use ${textureUnit} texture units while this GPU supports only ${this.#maxTextures}`
      );
    }
    this.#textureUnits += 1;
    return textureUnit;
  }
  #getTextureCacheKey(texture) {
    const array = [];
    array.push(texture.wrapS);
    array.push(texture.wrapT);
    array.push(texture.wrapR || 0);
    array.push(texture.magFilter);
    array.push(texture.minFilter);
    array.push(texture.anisotropy);
    array.push(texture.internalFormat);
    array.push(texture.format);
    array.push(texture.type);
    array.push(texture.generateMipmaps);
    array.push(texture.premultiplyAlpha);
    array.push(texture.flipY);
    array.push(texture.unpackAlignment);
    array.push(texture.colorSpace);
    return array.join();
  }
  //
  setTexture2D(texture, slot) {
    const gl = this.#gl;
    const textureProperties = this.#properties.get(texture);
    if (texture.isVideoTexture) this.#updateVideoTexture(texture);
    if (texture.isRenderTargetTexture === false && texture.version > 0 && textureProperties.__version !== texture.version) {
      const image = texture.image;
      if (image === null) {
        console.warn("WebGLRenderer: Texture marked for update but no image data found.");
      } else if (image.complete === false) {
        console.warn("WebGLRenderer: Texture marked for update but image is incomplete");
      } else {
        this.#uploadTexture(textureProperties, texture, slot);
        return;
      }
    }
    this.#state.bindTexture(gl.TEXTURE_2D, textureProperties.__webglTexture, gl.TEXTURE0 + slot);
  }
  setTexture2DArray(texture, slot) {
    const gl = this.#gl;
    const textureProperties = this.#properties.get(texture);
    if (texture.version > 0 && textureProperties.__version !== texture.version) {
      this.#uploadTexture(textureProperties, texture, slot);
      return;
    }
    this.#state.bindTexture(
      gl.TEXTURE_2D_ARRAY,
      textureProperties.__webglTexture,
      gl.TEXTURE0 + slot
    );
  }
  setTexture3D(texture, slot) {
    const gl = this.#gl;
    const textureProperties = this.#properties.get(texture);
    if (texture.version > 0 && textureProperties.__version !== texture.version) {
      this.#uploadTexture(textureProperties, texture, slot);
      return;
    }
    this.#state.bindTexture(gl.TEXTURE_3D, textureProperties.__webglTexture, gl.TEXTURE0 + slot);
  }
  setTextureCube(texture, slot) {
    const gl = this.#gl;
    const textureProperties = this.#properties.get(texture);
    if (texture.version > 0 && textureProperties.__version !== texture.version) {
      this.#uploadCubeTexture(textureProperties, texture, slot);
      return;
    }
    this.#state.bindTexture(
      gl.TEXTURE_CUBE_MAP,
      textureProperties.__webglTexture,
      gl.TEXTURE0 + slot
    );
  }
  #setTextureParameters(textureType, texture, supportsMips) {
    const gl = this.#gl;
    const extensions = this.#extensions;
    const properties = this.#properties;
    if (supportsMips) {
      gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, this.#wrappingToGL[texture.wrapS]);
      gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, this.#wrappingToGL[texture.wrapT]);
      if (textureType === gl.TEXTURE_3D || textureType === gl.TEXTURE_2D_ARRAY) {
        gl.texParameteri(textureType, gl.TEXTURE_WRAP_R, this.#wrappingToGL[texture.wrapR]);
      }
      gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, this.#filterToGL[texture.magFilter]);
      gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, this.#filterToGL[texture.minFilter]);
    } else {
      gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      if (textureType === gl.TEXTURE_3D || textureType === gl.TEXTURE_2D_ARRAY) {
        gl.texParameteri(textureType, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
      }
      if (texture.wrapS !== ClampToEdgeWrapping || texture.wrapT !== ClampToEdgeWrapping) {
        console.warn(
          "WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to ClampToEdgeWrapping."
        );
      }
      gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, this.#filterFallback(texture.magFilter));
      gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, this.#filterFallback(texture.minFilter));
      if (texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter) {
        console.warn(
          "WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to NearestFilter or LinearFilter."
        );
      }
    }
    if (texture.compareFunction) {
      gl.texParameteri(textureType, gl.TEXTURE_COMPARE_MODE, gl.COMPARE_REF_TO_TEXTURE);
      gl.texParameteri(
        textureType,
        gl.TEXTURE_COMPARE_FUNC,
        this.#compareToGL[texture.compareFunction]
      );
    }
    if (extensions.has("EXT_texture_filter_anisotropic") === true) {
      const extension = extensions.get("EXT_texture_filter_anisotropic");
      if (texture.magFilter === NearestFilter) return;
      if (texture.minFilter !== NearestMipmapLinearFilter && texture.minFilter !== LinearMipmapLinearFilter)
        return;
      if (texture.type === FloatType && extensions.has("OES_texture_float_linear") === false)
        return;
      if (texture.anisotropy > 1 || properties.get(texture).__currentAnisotropy) {
        gl.texParameterf(
          textureType,
          extension.TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(texture.anisotropy, this.#capabilities.getMaxAnisotropy())
        );
        properties.get(texture).__currentAnisotropy = texture.anisotropy;
      }
    }
  }
  #initTexture(textureProperties, texture) {
    let forceUpload = false;
    if (textureProperties.__webglInit === void 0) {
      textureProperties.__webglInit = true;
      texture.addEventListener("dispose", this.onTextureDispose);
    }
    const source = texture.source;
    let webglTextures = this.#sources.get(source);
    if (webglTextures === void 0) {
      webglTextures = {};
      this.#sources.set(source, webglTextures);
    }
    const textureCacheKey = this.#getTextureCacheKey(texture);
    if (textureCacheKey !== textureProperties.__cacheKey) {
      if (webglTextures[textureCacheKey] === void 0) {
        webglTextures[textureCacheKey] = {
          texture: this.#gl.createTexture(),
          usedTimes: 0
        };
        this.#info.memory.textures++;
        forceUpload = true;
      }
      webglTextures[textureCacheKey].usedTimes++;
      const webglTexture = webglTextures[textureProperties.__cacheKey];
      if (webglTexture !== void 0) {
        webglTextures[textureProperties.__cacheKey].usedTimes--;
        if (webglTexture.usedTimes === 0) {
          this.#deleteTexture(texture);
        }
      }
      textureProperties.__cacheKey = textureCacheKey;
      textureProperties.__webglTexture = webglTextures[textureCacheKey].texture;
    }
    return forceUpload;
  }
  #uploadTexture(textureProperties, texture, slot) {
    const gl = this.#gl;
    const properties = this.#properties;
    const state = this.#state;
    const utils = this.#utils;
    let textureType;
    textureType = gl.TEXTURE_2D;
    if (texture.isDataArrayTexture || texture.isCompressedArrayTexture)
      textureType = gl.TEXTURE_2D_ARRAY;
    if (texture.isData3DTexture) textureType = gl.TEXTURE_3D;
    const forceUpload = this.#initTexture(textureProperties, texture);
    const source = texture.source;
    state.bindTexture(textureType, textureProperties.__webglTexture, gl.TEXTURE0 + slot);
    const sourceProperties = properties.get(source);
    if (source.version !== sourceProperties.__version || forceUpload === true) {
      state.activeTexture(gl.TEXTURE0 + slot);
      const workingPrimaries = ColorManagement.getPrimaries(ColorManagement.workingColorSpace);
      const texturePrimaries = texture.colorSpace === NoColorSpace ? null : ColorManagement.getPrimaries(texture.colorSpace);
      const unpackConversion = texture.colorSpace === NoColorSpace || workingPrimaries === texturePrimaries ? gl.NONE : gl.BROWSER_DEFAULT_WEBGL;
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, unpackConversion);
      let image = this.#resizeImage(texture.image, false, this.#maxTextureSize);
      image = this.#verifyColorSpace(texture, image);
      const supportsMips = true;
      const glFormat = utils.convert(texture.format, texture.colorSpace);
      let glType = utils.convert(texture.type);
      let glInternalFormat = this.#getInternalFormat(
        texture.internalFormat,
        glFormat,
        glType,
        texture.colorSpace,
        texture.isVideoTexture
      );
      this.#setTextureParameters(textureType, texture, supportsMips);
      let mipmap;
      const mipmaps = texture.mipmaps;
      const useTexStorage = texture.isVideoTexture !== true && glInternalFormat !== RGB_ETC1_Format;
      const allocateMemory = sourceProperties.__version === void 0 || forceUpload === true;
      const levels = this.#getMipLevels(texture, image, supportsMips);
      if (texture.isDepthTexture) {
        glInternalFormat = gl.DEPTH_COMPONENT;
        if (texture.type === FloatType) {
          glInternalFormat = gl.DEPTH_COMPONENT32F;
        } else if (texture.type === UnsignedIntType) {
          glInternalFormat = gl.DEPTH_COMPONENT24;
        } else if (texture.type === UnsignedInt248Type) {
          glInternalFormat = gl.DEPTH24_STENCIL8;
        } else {
          glInternalFormat = gl.DEPTH_COMPONENT16;
        }
        if (texture.format === DepthFormat && glInternalFormat === gl.DEPTH_COMPONENT) {
          if (texture.type !== UnsignedShortType && texture.type !== UnsignedIntType) {
            console.warn(
              "WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."
            );
            texture.type = UnsignedIntType;
            glType = utils.convert(texture.type);
          }
        }
        if (texture.format === DepthStencilFormat && glInternalFormat === gl.DEPTH_COMPONENT) {
          glInternalFormat = gl.DEPTH_STENCIL;
          if (texture.type !== UnsignedInt248Type) {
            console.warn(
              "WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."
            );
            texture.type = UnsignedInt248Type;
            glType = this.#utils.convert(texture.type);
          }
        }
        if (allocateMemory) {
          if (useTexStorage) {
            state.texStorage2D(gl.TEXTURE_2D, 1, glInternalFormat, image.width, image.height);
          } else {
            state.texImage2D(
              gl.TEXTURE_2D,
              0,
              glInternalFormat,
              image.width,
              image.height,
              0,
              glFormat,
              glType,
              null
            );
          }
        }
      } else if (texture.isDataTexture) {
        if (mipmaps.length > 0 && supportsMips) {
          if (useTexStorage && allocateMemory) {
            state.texStorage2D(
              gl.TEXTURE_2D,
              levels,
              glInternalFormat,
              mipmaps[0].width,
              mipmaps[0].height
            );
          }
          for (let i = 0, il = mipmaps.length; i < il; i++) {
            mipmap = mipmaps[i];
            if (useTexStorage) {
              state.texSubImage2D(
                gl.TEXTURE_2D,
                i,
                0,
                0,
                mipmap.width,
                mipmap.height,
                glFormat,
                glType,
                mipmap.data
              );
            } else {
              state.texImage2D(
                gl.TEXTURE_2D,
                i,
                glInternalFormat,
                mipmap.width,
                mipmap.height,
                0,
                glFormat,
                glType,
                mipmap.data
              );
            }
          }
          texture.generateMipmaps = false;
        } else {
          if (useTexStorage) {
            if (allocateMemory) {
              state.texStorage2D(
                gl.TEXTURE_2D,
                levels,
                glInternalFormat,
                image.width,
                image.height
              );
            }
            state.texSubImage2D(
              gl.TEXTURE_2D,
              0,
              0,
              0,
              image.width,
              image.height,
              glFormat,
              glType,
              image.data
            );
          } else {
            state.texImage2D(
              gl.TEXTURE_2D,
              0,
              glInternalFormat,
              image.width,
              image.height,
              0,
              glFormat,
              glType,
              image.data
            );
          }
        }
      } else if (texture.isCompressedTexture) {
        if (texture.isCompressedArrayTexture) {
          if (useTexStorage && allocateMemory) {
            state.texStorage3D(
              gl.TEXTURE_2D_ARRAY,
              levels,
              glInternalFormat,
              mipmaps[0].width,
              mipmaps[0].height,
              image.depth
            );
          }
          for (let i = 0, il = mipmaps.length; i < il; i++) {
            mipmap = mipmaps[i];
            if (texture.format !== RGBAFormat) {
              if (glFormat !== null) {
                if (useTexStorage) {
                  state.compressedTexSubImage3D(
                    gl.TEXTURE_2D_ARRAY,
                    i,
                    0,
                    0,
                    0,
                    mipmap.width,
                    mipmap.height,
                    image.depth,
                    glFormat,
                    mipmap.data,
                    0,
                    0
                  );
                } else {
                  state.compressedTexImage3D(
                    gl.TEXTURE_2D_ARRAY,
                    i,
                    glInternalFormat,
                    mipmap.width,
                    mipmap.height,
                    image.depth,
                    0,
                    mipmap.data,
                    0,
                    0
                  );
                }
              } else {
                console.warn(
                  "WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"
                );
              }
            } else {
              if (useTexStorage) {
                state.texSubImage3D(
                  gl.TEXTURE_2D_ARRAY,
                  i,
                  0,
                  0,
                  0,
                  mipmap.width,
                  mipmap.height,
                  image.depth,
                  glFormat,
                  glType,
                  mipmap.data
                );
              } else {
                state.texImage3D(
                  gl.TEXTURE_2D_ARRAY,
                  i,
                  glInternalFormat,
                  mipmap.width,
                  mipmap.height,
                  image.depth,
                  0,
                  glFormat,
                  glType,
                  mipmap.data
                );
              }
            }
          }
        } else {
          if (useTexStorage && allocateMemory) {
            state.texStorage2D(
              gl.TEXTURE_2D,
              levels,
              glInternalFormat,
              mipmaps[0].width,
              mipmaps[0].height
            );
          }
          for (let i = 0, il = mipmaps.length; i < il; i++) {
            mipmap = mipmaps[i];
            if (texture.format !== RGBAFormat) {
              if (glFormat !== null) {
                if (useTexStorage) {
                  state.compressedTexSubImage2D(
                    gl.TEXTURE_2D,
                    i,
                    0,
                    0,
                    mipmap.width,
                    mipmap.height,
                    glFormat,
                    mipmap.data
                  );
                } else {
                  state.compressedTexImage2D(
                    gl.TEXTURE_2D,
                    i,
                    glInternalFormat,
                    mipmap.width,
                    mipmap.height,
                    0,
                    mipmap.data
                  );
                }
              } else {
                console.warn(
                  "WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"
                );
              }
            } else {
              if (useTexStorage) {
                state.texSubImage2D(
                  gl.TEXTURE_2D,
                  i,
                  0,
                  0,
                  mipmap.width,
                  mipmap.height,
                  glFormat,
                  glType,
                  mipmap.data
                );
              } else {
                state.texImage2D(
                  gl.TEXTURE_2D,
                  i,
                  glInternalFormat,
                  mipmap.width,
                  mipmap.height,
                  0,
                  glFormat,
                  glType,
                  mipmap.data
                );
              }
            }
          }
        }
      } else if (texture.isDataArrayTexture) {
        if (useTexStorage) {
          if (allocateMemory) {
            state.texStorage3D(
              gl.TEXTURE_2D_ARRAY,
              levels,
              glInternalFormat,
              image.width,
              image.height,
              image.depth
            );
          }
          state.texSubImage3D(
            gl.TEXTURE_2D_ARRAY,
            0,
            0,
            0,
            0,
            image.width,
            image.height,
            image.depth,
            glFormat,
            glType,
            image.data
          );
        } else {
          state.texImage3D(
            gl.TEXTURE_2D_ARRAY,
            0,
            glInternalFormat,
            image.width,
            image.height,
            image.depth,
            0,
            glFormat,
            glType,
            image.data
          );
        }
      } else if (texture.isData3DTexture) {
        if (useTexStorage) {
          if (allocateMemory) {
            state.texStorage3D(
              gl.TEXTURE_3D,
              levels,
              glInternalFormat,
              image.width,
              image.height,
              image.depth
            );
          }
          state.texSubImage3D(
            gl.TEXTURE_3D,
            0,
            0,
            0,
            0,
            image.width,
            image.height,
            image.depth,
            glFormat,
            glType,
            image.data
          );
        } else {
          state.texImage3D(
            gl.TEXTURE_3D,
            0,
            glInternalFormat,
            image.width,
            image.height,
            image.depth,
            0,
            glFormat,
            glType,
            image.data
          );
        }
      } else if (texture.isFramebufferTexture) {
        if (allocateMemory) {
          if (useTexStorage) {
            state.texStorage2D(gl.TEXTURE_2D, levels, glInternalFormat, image.width, image.height);
          } else {
            let width = image.width;
            let height = image.height;
            for (let i = 0; i < levels; i++) {
              state.texImage2D(
                gl.TEXTURE_2D,
                i,
                glInternalFormat,
                width,
                height,
                0,
                glFormat,
                glType,
                null
              );
              width >>= 1;
              height >>= 1;
            }
          }
        }
      } else {
        if (mipmaps.length > 0 && supportsMips) {
          if (useTexStorage && allocateMemory) {
            state.texStorage2D(
              gl.TEXTURE_2D,
              levels,
              glInternalFormat,
              mipmaps[0].width,
              mipmaps[0].height
            );
          }
          for (let i = 0, il = mipmaps.length; i < il; i++) {
            mipmap = mipmaps[i];
            if (useTexStorage) {
              state.texSubImage2D(gl.TEXTURE_2D, i, 0, 0, glFormat, glType, mipmap);
            } else {
              state.texImage2D(gl.TEXTURE_2D, i, glInternalFormat, glFormat, glType, mipmap);
            }
          }
          texture.generateMipmaps = false;
        } else {
          if (useTexStorage) {
            if (allocateMemory) {
              state.texStorage2D(
                gl.TEXTURE_2D,
                levels,
                glInternalFormat,
                image.width,
                image.height
              );
            }
            state.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, glFormat, glType, image);
          } else {
            state.texImage2D(gl.TEXTURE_2D, 0, glInternalFormat, glFormat, glType, image);
          }
        }
      }
      if (this.#textureNeedsGenerateMipmaps(texture, supportsMips)) {
        this.#generateMipmap(textureType);
      }
      sourceProperties.__version = source.version;
      if (texture.onUpdate) texture.onUpdate(texture);
    }
    textureProperties.__version = texture.version;
  }
  #uploadCubeTexture(textureProperties, texture, slot) {
    const gl = this.#gl;
    const state = this.#state;
    if (texture.image.length !== 6) return;
    const forceUpload = this.#initTexture(textureProperties, texture);
    const source = texture.source;
    state.bindTexture(gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture, gl.TEXTURE0 + slot);
    const sourceProperties = this.#properties.get(source);
    if (source.version !== sourceProperties.__version || forceUpload === true) {
      state.activeTexture(gl.TEXTURE0 + slot);
      const workingPrimaries = ColorManagement.getPrimaries(ColorManagement.workingColorSpace);
      const texturePrimaries = texture.colorSpace === NoColorSpace ? null : ColorManagement.getPrimaries(texture.colorSpace);
      const unpackConversion = texture.colorSpace === NoColorSpace || workingPrimaries === texturePrimaries ? gl.NONE : gl.BROWSER_DEFAULT_WEBGL;
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, unpackConversion);
      const isCompressed = texture.isCompressedTexture || texture.image[0].isCompressedTexture;
      const isDataTexture = texture.image[0] && texture.image[0].isDataTexture;
      const cubeImage = [];
      for (let i = 0; i < 6; i++) {
        if (!isCompressed && !isDataTexture) {
          cubeImage[i] = this.#resizeImage(texture.image[i], true, this.#maxCubemapSize);
        } else {
          cubeImage[i] = isDataTexture ? texture.image[i].image : texture.image[i];
        }
        cubeImage[i] = this.#verifyColorSpace(texture, cubeImage[i]);
      }
      const image = cubeImage[0];
      const supportsMips = true;
      const glFormat = this.#utils.convert(texture.format, texture.colorSpace);
      const glType = this.#utils.convert(texture.type);
      const glInternalFormat = this.#getInternalFormat(
        texture.internalFormat,
        glFormat,
        glType,
        texture.colorSpace
      );
      const useTexStorage = texture.isVideoTexture !== true;
      const allocateMemory = sourceProperties.__version === void 0 || forceUpload === true;
      let levels = this.#getMipLevels(texture, image, supportsMips);
      this.#setTextureParameters(gl.TEXTURE_CUBE_MAP, texture, supportsMips);
      let mipmaps;
      if (isCompressed) {
        if (useTexStorage && allocateMemory) {
          state.texStorage2D(
            gl.TEXTURE_CUBE_MAP,
            levels,
            glInternalFormat,
            image.width,
            image.height
          );
        }
        for (let i = 0; i < 6; i++) {
          mipmaps = cubeImage[i].mipmaps;
          for (let j = 0; j < mipmaps.length; j++) {
            const mipmap = mipmaps[j];
            if (texture.format !== RGBAFormat) {
              if (glFormat !== null) {
                if (useTexStorage) {
                  state.compressedTexSubImage2D(
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                    j,
                    0,
                    0,
                    mipmap.width,
                    mipmap.height,
                    glFormat,
                    mipmap.data
                  );
                } else {
                  state.compressedTexImage2D(
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                    j,
                    glInternalFormat,
                    mipmap.width,
                    mipmap.height,
                    0,
                    mipmap.data
                  );
                }
              } else {
                console.warn(
                  "WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"
                );
              }
            } else {
              if (useTexStorage) {
                state.texSubImage2D(
                  gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                  j,
                  0,
                  0,
                  mipmap.width,
                  mipmap.height,
                  glFormat,
                  glType,
                  mipmap.data
                );
              } else {
                state.texImage2D(
                  gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                  j,
                  glInternalFormat,
                  mipmap.width,
                  mipmap.height,
                  0,
                  glFormat,
                  glType,
                  mipmap.data
                );
              }
            }
          }
        }
      } else {
        mipmaps = texture.mipmaps;
        if (useTexStorage && allocateMemory) {
          if (mipmaps.length > 0) levels++;
          state.texStorage2D(
            gl.TEXTURE_CUBE_MAP,
            levels,
            glInternalFormat,
            cubeImage[0].width,
            cubeImage[0].height
          );
        }
        for (let i = 0; i < 6; i++) {
          if (isDataTexture) {
            if (useTexStorage) {
              state.texSubImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0,
                0,
                0,
                cubeImage[i].width,
                cubeImage[i].height,
                glFormat,
                glType,
                cubeImage[i].data
              );
            } else {
              state.texImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0,
                glInternalFormat,
                cubeImage[i].width,
                cubeImage[i].height,
                0,
                glFormat,
                glType,
                cubeImage[i].data
              );
            }
            for (let j = 0; j < mipmaps.length; j++) {
              const mipmap = mipmaps[j];
              const mipmapImage = mipmap.image[i].image;
              if (useTexStorage) {
                state.texSubImage2D(
                  gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                  j + 1,
                  0,
                  0,
                  mipmapImage.width,
                  mipmapImage.height,
                  glFormat,
                  glType,
                  mipmapImage.data
                );
              } else {
                state.texImage2D(
                  gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                  j + 1,
                  glInternalFormat,
                  mipmapImage.width,
                  mipmapImage.height,
                  0,
                  glFormat,
                  glType,
                  mipmapImage.data
                );
              }
            }
          } else {
            if (useTexStorage) {
              state.texSubImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0,
                0,
                0,
                glFormat,
                glType,
                cubeImage[i]
              );
            } else {
              state.texImage2D(
                gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                0,
                glInternalFormat,
                glFormat,
                glType,
                cubeImage[i]
              );
            }
            for (let j = 0; j < mipmaps.length; j++) {
              const mipmap = mipmaps[j];
              if (useTexStorage) {
                state.texSubImage2D(
                  gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                  j + 1,
                  0,
                  0,
                  glFormat,
                  glType,
                  mipmap.image[i]
                );
              } else {
                state.texImage2D(
                  gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
                  j + 1,
                  glInternalFormat,
                  glFormat,
                  glType,
                  mipmap.image[i]
                );
              }
            }
          }
        }
      }
      if (this.#textureNeedsGenerateMipmaps(texture, supportsMips)) {
        this.#generateMipmap(gl.TEXTURE_CUBE_MAP);
      }
      sourceProperties.__version = source.version;
      if (texture.onUpdate) texture.onUpdate(texture);
    }
    textureProperties.__version = texture.version;
  }
  // Render targets
  // Setup storage for target texture and bind it to correct framebuffer
  setupFrameBufferTexture(framebuffer, renderTarget, texture, attachment, textureTarget, level) {
    const gl = this.#gl;
    const state = this.#state;
    const glFormat = this.#utils.convert(texture.format, texture.colorSpace);
    const glType = this.#utils.convert(texture.type);
    const glInternalFormat = this.#getInternalFormat(
      texture.internalFormat,
      glFormat,
      glType,
      texture.colorSpace
    );
    const renderTargetProperties = this.#properties.get(renderTarget);
    if (!renderTargetProperties.__hasExternalTextures) {
      const width = Math.max(1, renderTarget.width >> level);
      const height = Math.max(1, renderTarget.height >> level);
      if (textureTarget === gl.TEXTURE_3D || textureTarget === gl.TEXTURE_2D_ARRAY) {
        state.texImage3D(
          textureTarget,
          level,
          glInternalFormat,
          width,
          height,
          renderTarget.depth,
          0,
          glFormat,
          glType,
          null
        );
      } else {
        state.texImage2D(
          textureTarget,
          level,
          glInternalFormat,
          width,
          height,
          0,
          glFormat,
          glType,
          null
        );
      }
    }
    state.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    if (textureTarget === gl.TEXTURE_2D || textureTarget >= gl.TEXTURE_CUBE_MAP_POSITIVE_X && textureTarget <= gl.TEXTURE_CUBE_MAP_NEGATIVE_Z) {
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        attachment,
        textureTarget,
        this.#properties.get(texture).__webglTexture,
        level
      );
    }
    state.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  // Setup storage for internal depth/stencil buffers and bind to correct framebuffer
  #setupRenderBufferStorage(renderbuffer, renderTarget, isMultisample) {
    const gl = this.#gl;
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    if (renderTarget.depthBuffer && !renderTarget.stencilBuffer) {
      let glInternalFormat;
      glInternalFormat = gl.DEPTH_COMPONENT32F;
      if (isMultisample) {
        const depthTexture = renderTarget.depthTexture;
        if (depthTexture && depthTexture.isDepthTexture) {
          if (depthTexture.type === FloatType) {
            glInternalFormat = gl.DEPTH_COMPONENT32F;
          } else if (depthTexture.type === UnsignedIntType) {
            glInternalFormat = gl.DEPTH_COMPONENT24;
          }
        }
        const samples = this.#getRenderTargetSamples(renderTarget);
        gl.renderbufferStorageMultisample(
          gl.RENDERBUFFER,
          samples,
          glInternalFormat,
          renderTarget.width,
          renderTarget.height
        );
      } else {
        gl.renderbufferStorage(
          gl.RENDERBUFFER,
          glInternalFormat,
          renderTarget.width,
          renderTarget.height
        );
      }
      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        renderbuffer
      );
    } else if (renderTarget.depthBuffer && renderTarget.stencilBuffer) {
      const samples = this.#getRenderTargetSamples(renderTarget);
      if (isMultisample) {
        gl.renderbufferStorageMultisample(
          gl.RENDERBUFFER,
          samples,
          gl.DEPTH24_STENCIL8,
          renderTarget.width,
          renderTarget.height
        );
      } else {
        gl.renderbufferStorage(
          gl.RENDERBUFFER,
          gl.DEPTH_STENCIL,
          renderTarget.width,
          renderTarget.height
        );
      }
      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_STENCIL_ATTACHMENT,
        gl.RENDERBUFFER,
        renderbuffer
      );
    } else {
      const textures = renderTarget.isWebGLMultipleRenderTargets === true ? renderTarget.texture : [renderTarget.texture];
      for (const texture of textures) {
        const glFormat = this.#utils.convert(texture.format, texture.colorSpace);
        const glType = this.#utils.convert(texture.type);
        const glInternalFormat = this.#getInternalFormat(
          texture.internalFormat,
          glFormat,
          glType,
          texture.colorSpace
        );
        const samples = this.#getRenderTargetSamples(renderTarget);
        if (isMultisample) {
          gl.renderbufferStorageMultisample(
            gl.RENDERBUFFER,
            samples,
            glInternalFormat,
            renderTarget.width,
            renderTarget.height
          );
        } else {
          gl.renderbufferStorage(
            gl.RENDERBUFFER,
            glInternalFormat,
            renderTarget.width,
            renderTarget.height
          );
        }
      }
    }
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }
  // Setup resources for a Depth Texture for a FBO (needs an extension)
  #setupDepthTexture(framebuffer, renderTarget) {
    const gl = this.#gl;
    const properties = this.#properties;
    const isCube = renderTarget && renderTarget.isWebGLCubeRenderTarget;
    if (isCube) throw new Error("Depth Texture with cube render targets is not supported");
    this.#state.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    if (!(renderTarget.depthTexture && renderTarget.depthTexture.isDepthTexture)) {
      throw new Error("renderTarget.depthTexture must be an instance of DepthTexture");
    }
    if (!properties.get(renderTarget.depthTexture).__webglTexture || renderTarget.depthTexture.image.width !== renderTarget.width || renderTarget.depthTexture.image.height !== renderTarget.height) {
      renderTarget.depthTexture.image.width = renderTarget.width;
      renderTarget.depthTexture.image.height = renderTarget.height;
      renderTarget.depthTexture.needsUpdate = true;
    }
    this.setTexture2D(renderTarget.depthTexture, 0);
    const webglDepthTexture = properties.get(renderTarget.depthTexture).__webglTexture;
    this.#getRenderTargetSamples(renderTarget);
    if (renderTarget.depthTexture.format === DepthFormat) {
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.TEXTURE_2D,
        webglDepthTexture,
        0
      );
    } else if (renderTarget.depthTexture.format === DepthStencilFormat) {
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.DEPTH_STENCIL_ATTACHMENT,
        gl.TEXTURE_2D,
        webglDepthTexture,
        0
      );
    } else {
      throw new Error("Unknown depthTexture format");
    }
  }
  // Setup GL resources for a non-texture depth buffer
  setupDepthRenderbuffer(renderTarget) {
    const gl = this.#gl;
    const state = this.#state;
    const renderTargetProperties = this.#properties.get(renderTarget);
    const isCube = renderTarget.isWebGLCubeRenderTarget === true;
    if (renderTarget.depthTexture && !renderTargetProperties.__autoAllocateDepthBuffer) {
      if (isCube) throw new Error("target.depthTexture not supported in Cube render targets");
      this.#setupDepthTexture(renderTargetProperties.__webglFramebuffer, renderTarget);
    } else {
      if (isCube) {
        renderTargetProperties.__webglDepthbuffer = [];
        for (let i = 0; i < 6; i++) {
          state.bindFramebuffer(gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer[i]);
          renderTargetProperties.__webglDepthbuffer[i] = gl.createRenderbuffer();
          this.#setupRenderBufferStorage(
            renderTargetProperties.__webglDepthbuffer[i],
            renderTarget,
            false
          );
        }
      } else {
        state.bindFramebuffer(gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
        renderTargetProperties.__webglDepthbuffer = gl.createRenderbuffer();
        this.#setupRenderBufferStorage(
          renderTargetProperties.__webglDepthbuffer,
          renderTarget,
          false
        );
      }
    }
    state.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
  // rebind framebuffer with external textures
  rebindTextures(renderTarget, colorTexture, depthTexture) {
    const gl = this.#gl;
    const renderTargetProperties = this.#properties.get(renderTarget);
    if (colorTexture !== void 0) {
      this.setupFrameBufferTexture(
        renderTargetProperties.__webglFramebuffer,
        renderTarget,
        renderTarget.texture,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        0
      );
    }
    if (depthTexture !== void 0) {
      this.setupDepthRenderbuffer(renderTarget);
    }
  }
  // Set up GL resources for the render target
  setupRenderTarget(renderTarget) {
    const gl = this.#gl;
    const properties = this.#properties;
    const info = this.#info;
    const capabilities = this.#capabilities;
    const state = this.#state;
    const utils = this.#utils;
    const texture = renderTarget.texture;
    const renderTargetProperties = properties.get(renderTarget);
    const textureProperties = properties.get(texture);
    renderTarget.addEventListener("dispose", this.onRenderTargetDispose);
    if (renderTarget.isWebGLMultipleRenderTargets !== true) {
      if (textureProperties.__webglTexture === void 0) {
        textureProperties.__webglTexture = gl.createTexture();
      }
      textureProperties.__version = texture.version;
      info.memory.textures++;
    }
    const isCube = renderTarget.isWebGLCubeRenderTarget === true;
    const isMultipleRenderTargets = renderTarget.isWebGLMultipleRenderTargets === true;
    const supportsMips = true;
    if (isCube) {
      renderTargetProperties.__webglFramebuffer = [];
      for (let i = 0; i < 6; i++) {
        if (texture.mipmaps && texture.mipmaps.length > 0) {
          renderTargetProperties.__webglFramebuffer[i] = [];
          for (let level = 0; level < texture.mipmaps.length; level++) {
            renderTargetProperties.__webglFramebuffer[i][level] = gl.createFramebuffer();
          }
        } else {
          renderTargetProperties.__webglFramebuffer[i] = gl.createFramebuffer();
        }
      }
    } else {
      if (texture.mipmaps && texture.mipmaps.length > 0) {
        renderTargetProperties.__webglFramebuffer = [];
        for (let level = 0; level < texture.mipmaps.length; level++) {
          renderTargetProperties.__webglFramebuffer[level] = gl.createFramebuffer();
        }
      } else {
        renderTargetProperties.__webglFramebuffer = gl.createFramebuffer();
      }
      if (isMultipleRenderTargets) {
        if (capabilities.drawBuffers) {
          const textures = renderTarget.texture;
          for (let i = 0, il = textures.length; i < il; i++) {
            const attachmentProperties = properties.get(textures[i]);
            if (attachmentProperties.__webglTexture === void 0) {
              attachmentProperties.__webglTexture = gl.createTexture();
              info.memory.textures++;
            }
          }
        } else {
          console.warn(
            "WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension."
          );
        }
      }
      if (renderTarget.samples > 0) {
        const textures = isMultipleRenderTargets ? texture : [texture];
        renderTargetProperties.__webglMultisampledFramebuffer = gl.createFramebuffer();
        renderTargetProperties.__webglColorRenderbuffer = [];
        state.bindFramebuffer(
          gl.FRAMEBUFFER,
          renderTargetProperties.__webglMultisampledFramebuffer
        );
        for (let i = 0; i < textures.length; i++) {
          const texture2 = textures[i];
          renderTargetProperties.__webglColorRenderbuffer[i] = gl.createRenderbuffer();
          gl.bindRenderbuffer(gl.RENDERBUFFER, renderTargetProperties.__webglColorRenderbuffer[i]);
          const glFormat = utils.convert(texture2.format, texture2.colorSpace);
          const glType = utils.convert(texture2.type);
          const glInternalFormat = this.#getInternalFormat(
            texture2.internalFormat,
            glFormat,
            glType,
            texture2.colorSpace,
            renderTarget.isXRRenderTarget === true
          );
          const samples = this.#getRenderTargetSamples(renderTarget);
          gl.renderbufferStorageMultisample(
            gl.RENDERBUFFER,
            samples,
            glInternalFormat,
            renderTarget.width,
            renderTarget.height
          );
          gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0 + i,
            gl.RENDERBUFFER,
            renderTargetProperties.__webglColorRenderbuffer[i]
          );
        }
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        if (renderTarget.depthBuffer) {
          renderTargetProperties.__webglDepthRenderbuffer = gl.createRenderbuffer();
          this.#setupRenderBufferStorage(
            renderTargetProperties.__webglDepthRenderbuffer,
            renderTarget,
            true
          );
        }
        state.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
    }
    if (isCube) {
      state.bindTexture(gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture);
      this.#setTextureParameters(gl.TEXTURE_CUBE_MAP, texture, supportsMips);
      for (let i = 0; i < 6; i++) {
        if (texture.mipmaps && texture.mipmaps.length > 0) {
          for (let level = 0; level < texture.mipmaps.length; level++) {
            this.setupFrameBufferTexture(
              renderTargetProperties.__webglFramebuffer[i][level],
              renderTarget,
              texture,
              gl.COLOR_ATTACHMENT0,
              gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
              level
            );
          }
        } else {
          this.setupFrameBufferTexture(
            renderTargetProperties.__webglFramebuffer[i],
            renderTarget,
            texture,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_CUBE_MAP_POSITIVE_X + i,
            0
          );
        }
      }
      if (this.#textureNeedsGenerateMipmaps(texture, supportsMips)) {
        this.#generateMipmap(gl.TEXTURE_CUBE_MAP);
      }
      state.unbindTexture();
    } else if (isMultipleRenderTargets) {
      const textures = renderTarget.texture;
      for (let i = 0, il = textures.length; i < il; i++) {
        const attachment = textures[i];
        const attachmentProperties = properties.get(attachment);
        state.bindTexture(gl.TEXTURE_2D, attachmentProperties.__webglTexture);
        this.#setTextureParameters(gl.TEXTURE_2D, attachment, supportsMips);
        this.setupFrameBufferTexture(
          renderTargetProperties.__webglFramebuffer,
          renderTarget,
          attachment,
          gl.COLOR_ATTACHMENT0 + i,
          gl.TEXTURE_2D,
          0
        );
        if (this.#textureNeedsGenerateMipmaps(attachment, supportsMips)) {
          this.#generateMipmap(gl.TEXTURE_2D);
        }
      }
      state.unbindTexture();
    } else {
      let glTextureType;
      glTextureType = gl.TEXTURE_2D;
      if (renderTarget.isWebGL3DRenderTarget || renderTarget.isWebGLArrayRenderTarget) {
        glTextureType = renderTarget.isWebGL3DRenderTarget ? gl.TEXTURE_3D : gl.TEXTURE_2D_ARRAY;
      }
      state.bindTexture(glTextureType, textureProperties.__webglTexture);
      this.#setTextureParameters(glTextureType, texture, supportsMips);
      if (texture.mipmaps && texture.mipmaps.length > 0) {
        for (let level = 0; level < texture.mipmaps.length; level++) {
          this.setupFrameBufferTexture(
            renderTargetProperties.__webglFramebuffer[level],
            renderTarget,
            texture,
            gl.COLOR_ATTACHMENT0,
            glTextureType,
            level
          );
        }
      } else {
        this.setupFrameBufferTexture(
          renderTargetProperties.__webglFramebuffer,
          renderTarget,
          texture,
          gl.COLOR_ATTACHMENT0,
          glTextureType,
          0
        );
      }
      if (this.#textureNeedsGenerateMipmaps(texture, supportsMips)) {
        this.#generateMipmap(glTextureType);
      }
      state.unbindTexture();
    }
    if (renderTarget.depthBuffer) {
      this.setupDepthRenderbuffer(renderTarget);
    }
  }
  updateRenderTargetMipmap(renderTarget) {
    const gl = this.#gl;
    const supportsMips = true;
    const textures = renderTarget.isWebGLMultipleRenderTargets === true ? renderTarget.texture : [renderTarget.texture];
    for (let i = 0, il = textures.length; i < il; i++) {
      const texture = textures[i];
      if (this.#textureNeedsGenerateMipmaps(texture, supportsMips)) {
        const target = renderTarget.isWebGLCubeRenderTarget ? gl.TEXTURE_CUBE_MAP : gl.TEXTURE_2D;
        const webglTexture = this.#properties.get(texture).__webglTexture;
        this.#state.bindTexture(target, webglTexture);
        this.#generateMipmap(target);
        this.#state.unbindTexture();
      }
    }
  }
  updateMultisampleRenderTarget(renderTarget) {
    const gl = this.#gl;
    const properties = this.#properties;
    const state = this.#state;
    if (renderTarget.samples > 0) {
      const textures = renderTarget.isWebGLMultipleRenderTargets ? renderTarget.texture : [renderTarget.texture];
      const width = renderTarget.width;
      const height = renderTarget.height;
      let mask = gl.COLOR_BUFFER_BIT;
      const invalidationArray = [];
      const depthStyle = renderTarget.stencilBuffer ? gl.DEPTH_STENCIL_ATTACHMENT : gl.DEPTH_ATTACHMENT;
      const renderTargetProperties = properties.get(renderTarget);
      const isMultipleRenderTargets = renderTarget.isWebGLMultipleRenderTargets === true;
      if (isMultipleRenderTargets) {
        for (let i = 0; i < textures.length; i++) {
          state.bindFramebuffer(
            gl.FRAMEBUFFER,
            renderTargetProperties.__webglMultisampledFramebuffer
          );
          gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0 + i,
            gl.RENDERBUFFER,
            null
          );
          state.bindFramebuffer(gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
          gl.framebufferTexture2D(
            gl.DRAW_FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0 + i,
            gl.TEXTURE_2D,
            null,
            0
          );
        }
      }
      state.bindFramebuffer(
        gl.READ_FRAMEBUFFER,
        renderTargetProperties.__webglMultisampledFramebuffer
      );
      state.bindFramebuffer(gl.DRAW_FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
      for (let i = 0; i < textures.length; i++) {
        invalidationArray.push(gl.COLOR_ATTACHMENT0 + i);
        if (renderTarget.depthBuffer) {
          invalidationArray.push(depthStyle);
        }
        const ignoreDepthValues = renderTargetProperties.__ignoreDepthValues !== void 0 ? renderTargetProperties.__ignoreDepthValues : false;
        if (ignoreDepthValues === false) {
          if (renderTarget.depthBuffer) mask |= gl.DEPTH_BUFFER_BIT;
          if (renderTarget.stencilBuffer) mask |= gl.STENCIL_BUFFER_BIT;
        }
        if (isMultipleRenderTargets) {
          gl.framebufferRenderbuffer(
            gl.READ_FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.RENDERBUFFER,
            renderTargetProperties.__webglColorRenderbuffer[i]
          );
        }
        if (ignoreDepthValues === true) {
          gl.invalidateFramebuffer(gl.READ_FRAMEBUFFER, [depthStyle]);
          gl.invalidateFramebuffer(gl.DRAW_FRAMEBUFFER, [depthStyle]);
        }
        if (isMultipleRenderTargets) {
          const webglTexture = properties.get(textures[i]).__webglTexture;
          gl.framebufferTexture2D(
            gl.DRAW_FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            webglTexture,
            0
          );
        }
        gl.blitFramebuffer(0, 0, width, height, 0, 0, width, height, mask, gl.NEAREST);
        if (this.#supportsInvalidateFramebuffer) {
          gl.invalidateFramebuffer(gl.READ_FRAMEBUFFER, invalidationArray);
        }
      }
      state.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
      state.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
      if (isMultipleRenderTargets) {
        for (let i = 0; i < textures.length; i++) {
          state.bindFramebuffer(
            gl.FRAMEBUFFER,
            renderTargetProperties.__webglMultisampledFramebuffer
          );
          gl.framebufferRenderbuffer(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0 + i,
            gl.RENDERBUFFER,
            renderTargetProperties.__webglColorRenderbuffer[i]
          );
          const webglTexture = properties.get(textures[i]).__webglTexture;
          state.bindFramebuffer(gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
          gl.framebufferTexture2D(
            gl.DRAW_FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0 + i,
            gl.TEXTURE_2D,
            webglTexture,
            0
          );
        }
      }
      state.bindFramebuffer(
        gl.DRAW_FRAMEBUFFER,
        renderTargetProperties.__webglMultisampledFramebuffer
      );
    }
  }
  #getRenderTargetSamples(renderTarget) {
    return Math.min(this.#maxSamples, renderTarget.samples);
  }
  #updateVideoTexture(texture) {
    const frame = this.#info.render.frame;
    if (this.#videoTextures.get(texture) !== frame) {
      this.#videoTextures.set(texture, frame);
      texture.update();
    }
  }
  #verifyColorSpace(texture, image) {
    const colorSpace = texture.colorSpace;
    const format = texture.format;
    const type = texture.type;
    if (texture.isCompressedTexture === true || texture.isVideoTexture === true || texture.format === _SRGBAFormat)
      return image;
    if (colorSpace !== LinearSRGBColorSpace && colorSpace !== NoColorSpace) {
      if (ColorManagement.getTransfer(colorSpace) === SRGBTransfer) {
        if (format !== RGBAFormat || type !== UnsignedByteType) {
          console.warn(
            "WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."
          );
        }
      } else {
        console.error("WebGLTextures: Unsupported texture color space:", colorSpace);
      }
    }
    return image;
  }
}

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
    this.#maxBindingPoints = gl.getParameter(gl.MAX_UNIFORM_BUFFER_BINDINGS);
  }
  bind(uniformsGroup, program) {
    const webglProgram = program.program;
    this.#state.uniformBlockBinding(uniformsGroup, webglProgram);
  }
  update(uniformsGroup, program) {
    let buffer = this.#buffers[uniformsGroup.id];
    if (buffer === void 0) {
      this.#prepareUniformsGroup(uniformsGroup);
      buffer = this.#createBuffer(uniformsGroup);
      this.#buffers[uniformsGroup.id] = buffer;
      uniformsGroup.addEventListener("dispose", this._onUniformsGroupsDispose);
    }
    const webglProgram = program.program;
    this.#state.updateUBOMapping(uniformsGroup, webglProgram);
    const frame = this.#info.render.frame;
    if (this.#updateList[uniformsGroup.id] !== frame) {
      this.#updateBufferData(uniformsGroup);
      this.#updateList[uniformsGroup.id] = frame;
    }
  }
  #createBuffer(uniformsGroup) {
    const bindingPointIndex = this.#allocateBindingPointIndex();
    uniformsGroup.__bindingPointIndex = bindingPointIndex;
    const buffer = this.#gl.createBuffer();
    const size = uniformsGroup.__size;
    const usage = uniformsGroup.usage;
    this.#gl.bindBuffer(this.#gl.UNIFORM_BUFFER, buffer);
    this.#gl.bufferData(this.#gl.UNIFORM_BUFFER, size, usage);
    this.#gl.bindBuffer(this.#gl.UNIFORM_BUFFER, null);
    this.#gl.bindBufferBase(this.#gl.UNIFORM_BUFFER, bindingPointIndex, buffer);
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
      "WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."
    );
    return 0;
  }
  #updateBufferData(uniformsGroup) {
    const buffer = this.#buffers[uniformsGroup.id];
    const uniforms = uniformsGroup.uniforms;
    const cache = uniformsGroup.__cache;
    this.#gl.bindBuffer(this.#gl.UNIFORM_BUFFER, buffer);
    for (let i = 0, il = uniforms.length; i < il; i++) {
      const uniform = uniforms[i];
      if (this.#hasUniformChanged(uniform, i, cache) === true) {
        const offset = uniform.__offset;
        const values = Array.isArray(uniform.value) ? uniform.value : [uniform.value];
        let arrayOffset = 0;
        for (const value of values) {
          const info = this.#getUniformSize(value);
          if (typeof value === "number" || typeof value === "boolean") {
            uniform.__data[0] = value;
            this.#gl.bufferSubData(this.#gl.UNIFORM_BUFFER, offset + arrayOffset, uniform.__data);
          } else if (value.isMatrix3) {
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
        this.#gl.bufferSubData(this.#gl.UNIFORM_BUFFER, offset, uniform.__data);
      }
    }
    this.#gl.bindBuffer(this.#gl.UNIFORM_BUFFER, null);
  }
  #hasUniformChanged(uniform, index, cache) {
    const value = uniform.value;
    if (cache[index] === void 0) {
      if (typeof value === "number" || typeof value === "boolean") {
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
      if (typeof value === "number" || typeof value === "boolean") {
        if (cache[index] !== value) {
          cache[index] = value;
          return true;
        }
      } else {
        const cachedObjects = Array.isArray(cache[index]) ? cache[index] : [cache[index]];
        const values = Array.isArray(value) ? value : [value];
        for (let i = 0; i < cachedObjects.length; i++) {
          const cachedObject = cachedObjects[i];
          if (typeof cachedObject === "number" || typeof cachedObject === "boolean") {
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
  #prepareUniformsGroup(uniformsGroup) {
    const uniforms = uniformsGroup.uniforms;
    let offset = 0;
    const chunkSize = 16;
    let chunkOffset = 0;
    for (let i = 0, l = uniforms.length; i < l; i++) {
      const uniform = uniforms[i];
      const infos = {
        boundary: 0,
        // bytes
        storage: 0
        // bytes
      };
      const values = Array.isArray(uniform.value) ? uniform.value : [uniform.value];
      for (let j = 0, jl = values.length; j < jl; j++) {
        const value = values[j];
        const info = this.#getUniformSize(value);
        infos.boundary += info.boundary;
        infos.storage += info.storage;
      }
      uniform.__data = new Float32Array(infos.storage / Float32Array.BYTES_PER_ELEMENT);
      uniform.__offset = offset;
      if (i > 0) {
        chunkOffset = offset % chunkSize;
        const remainingSizeInChunk = chunkSize - chunkOffset;
        if (chunkOffset !== 0 && remainingSizeInChunk - infos.boundary < 0) {
          offset += chunkSize - chunkOffset;
          uniform.__offset = offset;
        }
      }
      offset += infos.storage;
    }
    chunkOffset = offset % chunkSize;
    if (chunkOffset > 0) offset += chunkSize - chunkOffset;
    uniformsGroup.__size = offset;
    uniformsGroup.__cache = {};
  }
  #getUniformSize(value) {
    const info = {
      boundary: 0,
      // bytes
      storage: 0
      // bytes
    };
    if (typeof value === "number" || typeof value === "boolean") {
      info.boundary = 4;
      info.storage = 4;
    } else if (value.isVector2) {
      info.boundary = 8;
      info.storage = 8;
    } else if (value.isVector3 || value.isColor) {
      info.boundary = 16;
      info.storage = 12;
    } else if (value.isVector4) {
      info.boundary = 16;
      info.storage = 16;
    } else if (value.isMatrix3) {
      info.boundary = 48;
      info.storage = 48;
    } else if (value.isMatrix4) {
      info.boundary = 64;
      info.storage = 64;
    } else if (value.isTexture) {
      console.warn("WebGLRenderer: Texture samplers can not be part of an uniforms group.");
    } else {
      console.warn("WebGLRenderer: Unsupported uniform value type.", value);
    }
    return info;
  }
  _onUniformsGroupsDispose(event) {
    const uniformsGroup = event.target;
    uniformsGroup.removeEventListener("dispose", this._onUniformsGroupsDispose);
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

class WebGLUtils {
  #gl;
  #extensions;
  /**
   * @param {WebGL2RenderingContext} gl
   * @param {WebGLExtensions} extensions
   * @param {WebGLCapabilities} capabilities
   */
  constructor(gl, extensions, capabilities) {
    this.#gl = gl;
    this.#extensions = extensions;
  }
  convert(p, colorSpace = NoColorSpace) {
    const gl = this.#gl;
    const extensions = this.#extensions;
    let extension;
    const transfer = ColorManagement.getTransfer(colorSpace);
    if (p === UnsignedByteType) return gl.UNSIGNED_BYTE;
    if (p === UnsignedShort4444Type) return gl.UNSIGNED_SHORT_4_4_4_4;
    if (p === UnsignedShort5551Type) return gl.UNSIGNED_SHORT_5_5_5_1;
    if (p === UnsignedInt5999Type) return gl.UNSIGNED_INT_5_9_9_9_REV;
    if (p === UnsignedInt101111Type) return gl.UNSIGNED_INT_10F_11F_11F_REV;
    if (p === ByteType) return gl.BYTE;
    if (p === ShortType) return gl.SHORT;
    if (p === UnsignedShortType) return gl.UNSIGNED_SHORT;
    if (p === IntType) return gl.INT;
    if (p === UnsignedIntType) return gl.UNSIGNED_INT;
    if (p === FloatType) return gl.FLOAT;
    if (p === HalfFloatType) return gl.HALF_FLOAT;
    if (p === HalfFloatType) return gl.HALF_FLOAT;
    if (p === AlphaFormat) return gl.ALPHA;
    if (p === RGBFormat) return gl.RGB;
    if (p === RGBAFormat) return gl.RGBA;
    if (p === LuminanceFormat) return gl.LUMINANCE;
    if (p === LuminanceAlphaFormat) return gl.LUMINANCE_ALPHA;
    if (p === DepthFormat) return gl.DEPTH_COMPONENT;
    if (p === DepthStencilFormat) return gl.DEPTH_STENCIL;
    if (p === _SRGBAFormat) {
      extension = extensions.get("EXT_sRGB");
      if (extension !== null) {
        return extension.SRGB_ALPHA_EXT;
      } else {
        return null;
      }
    }
    if (p === RedFormat) return gl.RED;
    if (p === RedIntegerFormat) return gl.RED_INTEGER;
    if (p === RGFormat) return gl.RG;
    if (p === RGIntegerFormat) return gl.RG_INTEGER;
    if (p === RGBAIntegerFormat) return gl.RGBA_INTEGER;
    if (p === RGB_S3TC_DXT1_Format || p === RGBA_S3TC_DXT1_Format || p === RGBA_S3TC_DXT3_Format || p === RGBA_S3TC_DXT5_Format) {
      if (transfer === SRGBTransfer) {
        extension = extensions.get("WEBGL_compressed_texture_s3tc_srgb");
        if (extension !== null) {
          if (p === RGB_S3TC_DXT1_Format) return extension.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (p === RGBA_S3TC_DXT1_Format) return extension.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (p === RGBA_S3TC_DXT3_Format) return extension.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (p === RGBA_S3TC_DXT5_Format) return extension.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else {
          return null;
        }
      } else {
        extension = extensions.get("WEBGL_compressed_texture_s3tc");
        if (extension !== null) {
          if (p === RGB_S3TC_DXT1_Format) return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
          if (p === RGBA_S3TC_DXT1_Format) return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
          if (p === RGBA_S3TC_DXT3_Format) return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
          if (p === RGBA_S3TC_DXT5_Format) return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;
        } else {
          return null;
        }
      }
    }
    if (p === RGB_PVRTC_4BPPV1_Format || p === RGB_PVRTC_2BPPV1_Format || p === RGBA_PVRTC_4BPPV1_Format || p === RGBA_PVRTC_2BPPV1_Format) {
      extension = extensions.get("WEBGL_compressed_texture_pvrtc");
      if (extension !== null) {
        if (p === RGB_PVRTC_4BPPV1_Format) return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (p === RGB_PVRTC_2BPPV1_Format) return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (p === RGBA_PVRTC_4BPPV1_Format) return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (p === RGBA_PVRTC_2BPPV1_Format) return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else {
        return null;
      }
    }
    if (p === RGB_ETC1_Format || p === RGB_ETC2_Format || p === RGBA_ETC2_EAC_Format || p === R11_EAC_Format || p === SIGNED_R11_EAC_Format || p === RG11_EAC_Format || p === SIGNED_RG11_EAC_Format) {
      extension = extensions.get("WEBGL_compressed_texture_etc");
      if (extension !== null) {
        if (p === RGB_ETC1_Format || p === RGB_ETC2_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ETC2 : extension.COMPRESSED_RGB8_ETC2;
        if (p === RGBA_ETC2_EAC_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : extension.COMPRESSED_RGBA8_ETC2_EAC;
        if (p === R11_EAC_Format) return extension.COMPRESSED_R11_EAC;
        if (p === SIGNED_R11_EAC_Format) return extension.COMPRESSED_SIGNED_R11_EAC;
        if (p === RG11_EAC_Format) return extension.COMPRESSED_RG11_EAC;
        if (p === SIGNED_RG11_EAC_Format) return extension.COMPRESSED_SIGNED_RG11_EAC;
      } else {
        return null;
      }
    }
    if (p === RGBA_ASTC_4x4_Format || p === RGBA_ASTC_5x4_Format || p === RGBA_ASTC_5x5_Format || p === RGBA_ASTC_6x5_Format || p === RGBA_ASTC_6x6_Format || p === RGBA_ASTC_8x5_Format || p === RGBA_ASTC_8x6_Format || p === RGBA_ASTC_8x8_Format || p === RGBA_ASTC_10x5_Format || p === RGBA_ASTC_10x6_Format || p === RGBA_ASTC_10x8_Format || p === RGBA_ASTC_10x10_Format || p === RGBA_ASTC_12x10_Format || p === RGBA_ASTC_12x12_Format) {
      extension = extensions.get("WEBGL_compressed_texture_astc");
      if (extension !== null) {
        if (p === RGBA_ASTC_4x4_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : extension.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (p === RGBA_ASTC_5x4_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : extension.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (p === RGBA_ASTC_5x5_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : extension.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (p === RGBA_ASTC_6x5_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : extension.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (p === RGBA_ASTC_6x6_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : extension.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (p === RGBA_ASTC_8x5_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : extension.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (p === RGBA_ASTC_8x6_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : extension.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (p === RGBA_ASTC_8x8_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : extension.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (p === RGBA_ASTC_10x5_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : extension.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (p === RGBA_ASTC_10x6_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : extension.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (p === RGBA_ASTC_10x8_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : extension.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (p === RGBA_ASTC_10x10_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : extension.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (p === RGBA_ASTC_12x10_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : extension.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (p === RGBA_ASTC_12x12_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : extension.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else {
        return null;
      }
    }
    if (p === RGBA_BPTC_Format || p === RGB_BPTC_SIGNED_Format || p === RGB_BPTC_UNSIGNED_Format) {
      extension = extensions.get("EXT_texture_compression_bptc");
      if (extension !== null) {
        if (p === RGBA_BPTC_Format)
          return transfer === SRGBTransfer ? extension.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : extension.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (p === RGB_BPTC_SIGNED_Format) return extension.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (p === RGB_BPTC_UNSIGNED_Format) return extension.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else {
        return null;
      }
    }
    if (p === RED_RGTC1_Format || p === SIGNED_RED_RGTC1_Format || p === RED_GREEN_RGTC2_Format || p === SIGNED_RED_GREEN_RGTC2_Format) {
      extension = extensions.get("EXT_texture_compression_rgtc");
      if (extension !== null) {
        if (p === RED_RGTC1_Format) return extension.COMPRESSED_RED_RGTC1_EXT;
        if (p === SIGNED_RED_RGTC1_Format) return extension.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (p === RED_GREEN_RGTC2_Format) return extension.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (p === SIGNED_RED_GREEN_RGTC2_Format)
          return extension.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else {
        return null;
      }
    }
    if (p === UnsignedInt248Type) return gl.UNSIGNED_INT_24_8;
    return gl[p] !== void 0 ? gl[p] : null;
  }
}

export { WebGLAnimation, WebGLAttributes, WebGLBackground, WebGLBindingStates, WebGLBufferRenderer, WebGLCapabilities, WebGLClipping, WebGLCubeMaps, WebGLCubeUVMaps, WebGLExtensions, WebGLGeometries, WebGLIndexedBufferRenderer, WebGLInfo, WebGLMaterials, WebGLMorphtargets, WebGLObjects, WebGLPrograms, WebGLProperties, WebGLRenderList, WebGLRenderLists, WebGLRenderState, WebGLRenderStates, WebGLShadowMap, WebGLState, WebGLTextures, WebGLUniforms, WebGLUniformsGroups, WebGLUtils };
