import { Vector4, Color, Frustum, Matrix4, Vector2, Vector3, floorPowerOfTwo } from '@renderlayer/math';
import { createCanvasElement, SRGBColorSpace, NoToneMapping, HalfFloatType, UnsignedByteType, LinearMipmapLinearFilter, DoubleSide, BackSide, FrontSide, RGBAFormat, FloatType, WebGLCoordinateSystem, LinearSRGBColorSpace, RGBAIntegerFormat, RGIntegerFormat, RedIntegerFormat, UnsignedIntType, UnsignedShortType, UnsignedInt248Type, UnsignedShort4444Type, UnsignedShort5551Type } from '@renderlayer/shared';
import { WebGLRenderTarget } from '@renderlayer/targets';
import { WebGLAnimation, WebGLUniforms, WebGLExtensions, WebGLCapabilities, WebGLUtils, WebGLState, WebGLInfo, WebGLProperties, WebGLTextures, WebGLCubeMaps, WebGLCubeUVMaps, WebGLAttributes, WebGLBindingStates, WebGLGeometries, WebGLObjects, WebGLMorphtargets, WebGLClipping, WebGLPrograms, WebGLMaterials, WebGLRenderLists, WebGLRenderStates, WebGLBackground, WebGLShadowMap, WebGLUniformsGroups, WebGLBufferRenderer, WebGLIndexedBufferRenderer } from '@renderlayer/webgl';

class WebGLRenderer {
  constructor(parameters = {}) {
    const {
      canvas = createCanvasElement(),
      context = null,
      depth = true,
      stencil = true,
      alpha = false,
      antialias = false,
      premultipliedAlpha = true,
      preserveDrawingBuffer = false,
      powerPreference = "default",
      failIfMajorPerformanceCaveat = false
    } = parameters;
    this.isWebGLRenderer = true;
    let _alpha;
    if (context !== null) {
      _alpha = context.getContextAttributes().alpha;
    } else {
      _alpha = alpha;
    }
    const uintClearColor = new Uint32Array(4);
    const intClearColor = new Int32Array(4);
    let currentRenderList = null;
    let currentRenderState = null;
    const renderListStack = [];
    const renderStateStack = [];
    this.domElement = canvas;
    this.debug = {
      /**
       * Enables error checking and reporting when shader programs are being compiled
       * @type {boolean}
       */
      checkShaderErrors: true,
      /**
       * Callback for custom error reporting.
       * @type {?Function}
       */
      onShaderError: null
    };
    this.autoClear = true;
    this.autoClearColor = true;
    this.autoClearDepth = true;
    this.autoClearStencil = true;
    this.sortObjects = true;
    this.clippingPlanes = [];
    this.localClippingEnabled = false;
    this.outputColorSpace = SRGBColorSpace;
    this._useLegacyLights = false;
    this.toneMapping = NoToneMapping;
    this.toneMappingExposure = 1;
    const _this = this;
    let _isContextLost = false;
    let _currentActiveCubeFace = 0;
    let _currentActiveMipmapLevel = 0;
    let _currentRenderTarget = null;
    let _currentMaterialId = -1;
    let _currentCamera = null;
    const _currentViewport = new Vector4();
    const _currentScissor = new Vector4();
    let _currentScissorTest = null;
    const _currentClearColor = new Color(0);
    let _currentClearAlpha = 0;
    let _width = canvas.width;
    let _height = canvas.height;
    let _pixelRatio = 1;
    let _opaqueSort = null;
    let _transparentSort = null;
    const _viewport = new Vector4(0, 0, _width, _height);
    const _scissor = new Vector4(0, 0, _width, _height);
    let _scissorTest = false;
    const _frustum = new Frustum();
    let _clippingEnabled = false;
    let _localClippingEnabled = false;
    let _transmissionRenderTarget = null;
    const _projScreenMatrix = new Matrix4();
    const _vector2 = new Vector2();
    const _vector3 = new Vector3();
    const _emptyScene = {
      background: null,
      fog: null,
      environment: null,
      overrideMaterial: null,
      isScene: true
    };
    function getTargetPixelRatio() {
      return _currentRenderTarget === null ? _pixelRatio : 1;
    }
    let _gl = context;
    function getContext(contextNames, contextAttributes) {
      for (const contextName of contextNames) {
        const context2 = canvas.getContext(contextName, contextAttributes);
        if (context2 !== null)
          return context2;
      }
      return null;
    }
    try {
      const contextAttributes = {
        alpha: true,
        depth,
        stencil,
        antialias,
        premultipliedAlpha,
        preserveDrawingBuffer,
        powerPreference,
        failIfMajorPerformanceCaveat
      };
      canvas.addEventListener("webglcontextlost", onContextLost, false);
      canvas.addEventListener("webglcontextrestored", onContextRestore, false);
      canvas.addEventListener("webglcontextcreationerror", onContextCreationError, false);
      if (_gl === null) {
        const contextNames = ["webgl2"];
        _gl = getContext(contextNames, contextAttributes);
        if (_gl === null) {
          if (getContext(contextNames)) {
            throw new Error("Error creating WebGL context with your selected attributes.");
          } else {
            throw new Error("Error creating WebGL context.");
          }
        }
      }
      if (_gl.getShaderPrecisionFormat === void 0) {
        _gl.getShaderPrecisionFormat = () => ({
          rangeMin: 1,
          rangeMax: 1,
          precision: 1
        });
      }
    } catch (error) {
      console.error(`WebGLRenderer: ${error.message}`);
      throw error;
    }
    let extensions;
    let capabilities;
    let state;
    let info;
    let properties;
    let textures;
    let cubemaps;
    let cubeuvmaps;
    let attributes;
    let geometries;
    let objects;
    let programCache;
    let materials;
    let renderLists;
    let renderStates;
    let clipping;
    let shadowMap;
    let background;
    let morphtargets;
    let bufferRenderer;
    let indexedBufferRenderer;
    let utils;
    let bindingStates;
    let uniformsGroups;
    function initGLContext() {
      extensions = new WebGLExtensions(_gl);
      capabilities = new WebGLCapabilities(_gl, extensions, parameters);
      extensions.init(capabilities);
      utils = new WebGLUtils(_gl, extensions, capabilities);
      state = new WebGLState(_gl, extensions, capabilities);
      info = new WebGLInfo(_gl);
      properties = new WebGLProperties();
      textures = new WebGLTextures(_gl, extensions, state, properties, capabilities, utils, info);
      cubemaps = new WebGLCubeMaps(_this);
      cubeuvmaps = new WebGLCubeUVMaps(_this);
      attributes = new WebGLAttributes(_gl, capabilities);
      bindingStates = new WebGLBindingStates(_gl, extensions, attributes, capabilities);
      geometries = new WebGLGeometries(_gl, attributes, info, bindingStates);
      objects = new WebGLObjects(_gl, geometries, attributes, info);
      morphtargets = new WebGLMorphtargets(_gl, capabilities, textures);
      clipping = new WebGLClipping(properties);
      programCache = new WebGLPrograms(
        _this,
        cubemaps,
        cubeuvmaps,
        extensions,
        capabilities,
        bindingStates,
        clipping
      );
      materials = new WebGLMaterials(_this, properties);
      renderLists = new WebGLRenderLists();
      renderStates = new WebGLRenderStates(extensions, capabilities);
      background = new WebGLBackground(
        _this,
        cubemaps,
        cubeuvmaps,
        state,
        objects,
        _alpha,
        premultipliedAlpha
      );
      shadowMap = new WebGLShadowMap(_this, objects, capabilities);
      uniformsGroups = new WebGLUniformsGroups(_gl, info, capabilities, state);
      bufferRenderer = new WebGLBufferRenderer(_gl, extensions, info, capabilities);
      indexedBufferRenderer = new WebGLIndexedBufferRenderer(_gl, extensions, info, capabilities);
      info.programs = programCache.programs;
      _this.capabilities = capabilities;
      _this.extensions = extensions;
      _this.properties = properties;
      _this.renderLists = renderLists;
      _this.shadowMap = shadowMap;
      _this.state = state;
      _this.info = info;
    }
    initGLContext();
    this.getContext = () => _gl;
    this.getContextAttributes = () => _gl.getContextAttributes();
    this.forceContextLoss = () => {
      const extension = extensions.get("WEBGL_lose_context");
      if (extension)
        extension.loseContext();
    };
    this.forceContextRestore = () => {
      const extension = extensions.get("WEBGL_lose_context");
      if (extension)
        extension.restoreContext();
    };
    this.getPixelRatio = () => _pixelRatio;
    this.setPixelRatio = function(value) {
      if (value === void 0)
        return;
      _pixelRatio = value;
      this.setSize(_width, _height, false);
    };
    this.getSize = (target) => target.set(_width, _height);
    this.setSize = function(width, height, updateStyle = true) {
      _width = width;
      _height = height;
      canvas.width = Math.floor(width * _pixelRatio);
      canvas.height = Math.floor(height * _pixelRatio);
      if (updateStyle === true) {
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      this.setViewport(0, 0, width, height);
    };
    this.getDrawingBufferSize = (target) => target.set(_width * _pixelRatio, _height * _pixelRatio).floor();
    this.setDrawingBufferSize = function(width, height, pixelRatio) {
      _width = width;
      _height = height;
      _pixelRatio = pixelRatio;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      this.setViewport(0, 0, width, height);
    };
    this.getCurrentViewport = (target) => target.copy(_currentViewport);
    this.getViewport = (target) => target.copy(_viewport);
    this.setViewport = (x, y, width, height) => {
      if (x.isVector4) {
        _viewport.set(x.x, x.y, x.z, x.w);
      } else {
        _viewport.set(x, y, width, height);
      }
      state.viewport(_currentViewport.copy(_viewport).multiplyScalar(_pixelRatio).floor());
    };
    this.getScissor = (target) => target.copy(_scissor);
    this.setScissor = (x, y, width, height) => {
      if (x.isVector4) {
        _scissor.set(x.x, x.y, x.z, x.w);
      } else {
        _scissor.set(x, y, width, height);
      }
      state.scissor(_currentScissor.copy(_scissor).multiplyScalar(_pixelRatio).floor());
    };
    this.getScissorTest = () => _scissorTest;
    this.setScissorTest = (boolean) => {
      state.setScissorTest(_scissorTest = boolean);
    };
    this.setOpaqueSort = (method) => {
      _opaqueSort = method;
    };
    this.setTransparentSort = (method) => {
      _transparentSort = method;
    };
    this.getClearColor = (target) => target.copy(background.getClearColor());
    this.setClearColor = function(...args) {
      background.setClearColor(...args);
    };
    this.getClearAlpha = () => background.getClearAlpha();
    this.setClearAlpha = function(...args) {
      background.setClearAlpha(...args);
    };
    this.clear = (color = true, depth2 = true, stencil2 = true) => {
      let bits = 0;
      if (color) {
        let isIntegerFormat = false;
        if (_currentRenderTarget !== null) {
          const targetFormat = _currentRenderTarget.texture.format;
          isIntegerFormat = targetFormat === RGBAIntegerFormat || targetFormat === RGIntegerFormat || targetFormat === RedIntegerFormat;
        }
        if (isIntegerFormat) {
          const targetType = _currentRenderTarget.texture.type;
          const isUnsignedType = targetType === UnsignedByteType || targetType === UnsignedIntType || targetType === UnsignedShortType || targetType === UnsignedInt248Type || targetType === UnsignedShort4444Type || targetType === UnsignedShort5551Type;
          const clearColor = background.getClearColor();
          const a = background.getClearAlpha();
          const r = clearColor.r;
          const g = clearColor.g;
          const b = clearColor.b;
          if (isUnsignedType) {
            uintClearColor[0] = r;
            uintClearColor[1] = g;
            uintClearColor[2] = b;
            uintClearColor[3] = a;
            _gl.clearBufferuiv(_gl.COLOR, 0, uintClearColor);
          } else {
            intClearColor[0] = r;
            intClearColor[1] = g;
            intClearColor[2] = b;
            intClearColor[3] = a;
            _gl.clearBufferiv(_gl.COLOR, 0, intClearColor);
          }
        } else {
          bits |= _gl.COLOR_BUFFER_BIT;
        }
      }
      if (depth2)
        bits |= _gl.DEPTH_BUFFER_BIT;
      if (stencil2)
        bits |= _gl.STENCIL_BUFFER_BIT;
      _gl.clear(bits);
    };
    this.clearColor = function() {
      this.clear(true, false, false);
    };
    this.clearDepth = function() {
      this.clear(false, true, false);
    };
    this.clearStencil = function() {
      this.clear(false, false, true);
    };
    this.dispose = () => {
      canvas.removeEventListener("webglcontextlost", onContextLost, false);
      canvas.removeEventListener("webglcontextrestored", onContextRestore, false);
      canvas.removeEventListener("webglcontextcreationerror", onContextCreationError, false);
      renderLists.dispose();
      renderStates.dispose();
      properties.dispose();
      cubemaps.dispose();
      cubeuvmaps.dispose();
      objects.dispose();
      bindingStates.dispose();
      uniformsGroups.dispose();
      programCache.dispose();
      if (_transmissionRenderTarget) {
        _transmissionRenderTarget.dispose();
        _transmissionRenderTarget = null;
      }
      animation.stop();
    };
    function onContextLost(event) {
      event.preventDefault();
      console.log("WebGLRenderer: Context Lost.");
      _isContextLost = true;
    }
    function onContextRestore() {
      console.log("WebGLRenderer: Context Restored.");
      _isContextLost = false;
      const infoAutoReset = info.autoReset;
      const shadowMapEnabled = shadowMap.enabled;
      const shadowMapAutoUpdate = shadowMap.autoUpdate;
      const shadowMapNeedsUpdate = shadowMap.needsUpdate;
      const shadowMapType = shadowMap.type;
      initGLContext();
      info.autoReset = infoAutoReset;
      shadowMap.enabled = shadowMapEnabled;
      shadowMap.autoUpdate = shadowMapAutoUpdate;
      shadowMap.needsUpdate = shadowMapNeedsUpdate;
      shadowMap.type = shadowMapType;
    }
    function onContextCreationError(event) {
      console.error(
        "WebGLRenderer: A WebGL context could not be created. Reason: ",
        event.statusMessage
      );
    }
    function onMaterialDispose(event) {
      const material = event.target;
      material.removeEventListener("dispose", onMaterialDispose);
      deallocateMaterial(material);
    }
    function deallocateMaterial(material) {
      releaseMaterialProgramReferences(material);
      properties.remove(material);
    }
    function releaseMaterialProgramReferences(material) {
      const programs = properties.get(material).programs;
      if (programs !== void 0) {
        programs.forEach((program) => {
          programCache.releaseProgram(program);
        });
        if (material.isShaderMaterial) {
          programCache.releaseShaderCache(material);
        }
      }
    }
    this.renderBufferDirect = (camera, scene, geometry, material, object, group) => {
      if (scene === null)
        scene = _emptyScene;
      const frontFaceCW = object.isMesh && object.matrixWorld.determinant() < 0;
      const program = setProgram(camera, scene, geometry, material, object);
      state.setMaterial(material, frontFaceCW);
      let index = geometry.index;
      let rangeFactor = 1;
      if (material.wireframe === true) {
        index = geometries.getWireframeAttribute(geometry);
        if (index === void 0)
          return;
        rangeFactor = 2;
      }
      const drawRange = geometry.drawRange;
      const position = geometry.attributes.position;
      let drawStart = drawRange.start * rangeFactor;
      let drawEnd = (drawRange.start + drawRange.count) * rangeFactor;
      if (group !== null) {
        drawStart = Math.max(drawStart, group.start * rangeFactor);
        drawEnd = Math.min(drawEnd, (group.start + group.count) * rangeFactor);
      }
      if (index !== null) {
        drawStart = Math.max(drawStart, 0);
        drawEnd = Math.min(drawEnd, index.count);
      } else if (position !== void 0 && position !== null) {
        drawStart = Math.max(drawStart, 0);
        drawEnd = Math.min(drawEnd, position.count);
      }
      const drawCount = drawEnd - drawStart;
      if (drawCount < 0 || drawCount === Infinity)
        return;
      bindingStates.setup(object, material, program, geometry, index);
      let attribute;
      let renderer = bufferRenderer;
      if (index !== null) {
        attribute = attributes.get(index);
        renderer = indexedBufferRenderer;
        renderer.setIndex(attribute);
      }
      if (object.isMesh) {
        if (material.wireframe === true) {
          state.setLineWidth(material.wireframeLinewidth * getTargetPixelRatio());
          renderer.setMode(_gl.LINES);
        } else {
          renderer.setMode(_gl.TRIANGLES);
        }
      } else if (object.isLine) {
        let lineWidth = material.linewidth;
        if (lineWidth === void 0)
          lineWidth = 1;
        state.setLineWidth(lineWidth * getTargetPixelRatio());
        if (object.isLineSegments) {
          renderer.setMode(_gl.LINES);
        } else if (object.isLineLoop) {
          renderer.setMode(_gl.LINE_LOOP);
        } else {
          renderer.setMode(_gl.LINE_STRIP);
        }
      } else if (object.isPoints) {
        renderer.setMode(_gl.POINTS);
      } else if (object.isSprite) {
        renderer.setMode(_gl.TRIANGLES);
      }
      if (object.isInstancedMesh) {
        renderer.renderInstances(drawStart, drawCount, object.count);
      } else if (geometry.isInstancedBufferGeometry) {
        const maxInstanceCount = geometry._maxInstanceCount !== void 0 ? geometry._maxInstanceCount : Infinity;
        const instanceCount = Math.min(geometry.instanceCount, maxInstanceCount);
        renderer.renderInstances(drawStart, drawCount, instanceCount);
      } else {
        renderer.render(drawStart, drawCount);
      }
    };
    this.compile = (scene, camera) => {
      function prepare(material, scene2, object) {
        if (material.transparent === true && material.side === DoubleSide && material.forceSinglePass === false) {
          material.side = BackSide;
          material.needsUpdate = true;
          getProgram(material, scene2, object);
          material.side = FrontSide;
          material.needsUpdate = true;
          getProgram(material, scene2, object);
          material.side = DoubleSide;
        } else {
          getProgram(material, scene2, object);
        }
      }
      currentRenderState = renderStates.get(scene);
      currentRenderState.init();
      renderStateStack.push(currentRenderState);
      scene.traverseVisible((object) => {
        if (object.isLight && object.layers.test(camera.layers)) {
          currentRenderState.pushLight(object);
          if (object.castShadow) {
            currentRenderState.pushShadow(object);
          }
        }
      });
      currentRenderState.setupLights(_this._useLegacyLights);
      scene.traverse((object) => {
        const material = object.material;
        if (material) {
          if (Array.isArray(material)) {
            for (const material2 of material) {
              prepare(material2, scene, object);
            }
          } else {
            prepare(material, scene, object);
          }
        }
      });
      renderStateStack.pop();
      currentRenderState = null;
    };
    let onAnimationFrameCallback = null;
    function onAnimationFrame(time) {
      if (onAnimationFrameCallback)
        onAnimationFrameCallback(time);
    }
    const animation = new WebGLAnimation();
    animation.setAnimationLoop(onAnimationFrame);
    if (typeof self !== "undefined")
      animation.setContext(self);
    this.setAnimationLoop = (callback) => {
      onAnimationFrameCallback = callback;
      callback === null ? animation.stop() : animation.start();
    };
    this.render = function(scene, camera) {
      if (camera !== void 0 && camera.isCamera !== true) {
        console.error("WebGLRenderer.render: camera is not an instance of Camera.");
        return;
      }
      if (_isContextLost === true)
        return;
      if (scene.matrixWorldAutoUpdate === true)
        scene.updateMatrixWorld();
      if (camera.parent === null && camera.matrixWorldAutoUpdate === true)
        camera.updateMatrixWorld();
      if (scene.isScene === true)
        scene.onBeforeRender(_this, scene, camera, _currentRenderTarget);
      currentRenderState = renderStates.get(scene, renderStateStack.length);
      currentRenderState.init();
      renderStateStack.push(currentRenderState);
      _projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      _frustum.setFromProjectionMatrix(_projScreenMatrix);
      _localClippingEnabled = this.localClippingEnabled;
      _clippingEnabled = clipping.init(this.clippingPlanes, _localClippingEnabled);
      currentRenderList = renderLists.get(scene, renderListStack.length);
      currentRenderList.init();
      renderListStack.push(currentRenderList);
      projectObject(scene, camera, 0, _this.sortObjects);
      currentRenderList.finish();
      if (_this.sortObjects === true) {
        currentRenderList.sort(_opaqueSort, _transparentSort);
      }
      this.info.render.frame++;
      if (_clippingEnabled === true)
        clipping.beginShadows();
      const shadowsArray = currentRenderState.state.shadowsArray;
      shadowMap.render(shadowsArray, scene, camera);
      if (_clippingEnabled === true)
        clipping.endShadows();
      if (this.info.autoReset === true)
        this.info.reset();
      background.render(currentRenderList, scene);
      currentRenderState.setupLights(_this._useLegacyLights);
      if (camera.isArrayCamera) {
        const cameras = camera.cameras;
        for (let i = 0, l = cameras.length; i < l; i++) {
          const camera2 = cameras[i];
          renderScene(currentRenderList, scene, camera2, camera2.viewport);
        }
      } else {
        renderScene(currentRenderList, scene, camera);
      }
      if (_currentRenderTarget !== null) {
        textures.updateMultisampleRenderTarget(_currentRenderTarget);
        textures.updateRenderTargetMipmap(_currentRenderTarget);
      }
      if (scene.isScene === true)
        scene.onAfterRender(_this, scene, camera);
      bindingStates.resetDefaultState();
      _currentMaterialId = -1;
      _currentCamera = null;
      renderStateStack.pop();
      if (renderStateStack.length > 0) {
        currentRenderState = renderStateStack[renderStateStack.length - 1];
      } else {
        currentRenderState = null;
      }
      renderListStack.pop();
      if (renderListStack.length > 0) {
        currentRenderList = renderListStack[renderListStack.length - 1];
      } else {
        currentRenderList = null;
      }
    };
    function projectObject(object, camera, groupOrder, sortObjects) {
      if (object.visible === false)
        return;
      const visible = object.layers.test(camera.layers);
      if (visible) {
        if (object.isGroup) {
          groupOrder = object.renderOrder;
        } else if (object.isLOD) {
          if (object.autoUpdate === true)
            object.update(camera);
        } else if (object.isLight) {
          currentRenderState.pushLight(object);
          if (object.castShadow) {
            currentRenderState.pushShadow(object);
          }
        } else if (object.isSprite) {
          if (!object.frustumCulled || _frustum.intersectsSprite(object)) {
            if (sortObjects) {
              _vector3.setFromMatrixPosition(object.matrixWorld).applyMatrix4(_projScreenMatrix);
            }
            const geometry = objects.update(object);
            const material = object.material;
            if (material.visible) {
              currentRenderList.push(object, geometry, material, groupOrder, _vector3.z, null);
            }
          }
        } else if (object.isMesh || object.isLine || object.isPoints) {
          if (!object.frustumCulled || _frustum.intersectsObject(object)) {
            const geometry = objects.update(object);
            const material = object.material;
            if (sortObjects) {
              if (object.boundingSphere !== void 0) {
                if (object.boundingSphere === null)
                  object.computeBoundingSphere();
                _vector3.copy(object.boundingSphere.center);
              } else {
                if (geometry.boundingSphere === null)
                  geometry.computeBoundingSphere();
                _vector3.copy(geometry.boundingSphere.center);
              }
              _vector3.applyMatrix4(object.matrixWorld).applyMatrix4(_projScreenMatrix);
            }
            if (Array.isArray(material)) {
              const groups = geometry.groups;
              for (let i = 0, l = groups.length; i < l; i++) {
                const group = groups[i];
                const groupMaterial = material[group.materialIndex];
                if (groupMaterial && groupMaterial.visible) {
                  currentRenderList.push(
                    object,
                    geometry,
                    groupMaterial,
                    groupOrder,
                    _vector3.z,
                    group
                  );
                }
              }
            } else if (material.visible) {
              currentRenderList.push(object, geometry, material, groupOrder, _vector3.z, null);
            }
          }
        }
      }
      const children = object.children;
      for (let i = 0, l = children.length; i < l; i++) {
        projectObject(children[i], camera, groupOrder, sortObjects);
      }
    }
    function renderScene(currentRenderList2, scene, camera, viewport) {
      const opaqueObjects = currentRenderList2.opaque;
      const transmissiveObjects = currentRenderList2.transmissive;
      const transparentObjects = currentRenderList2.transparent;
      currentRenderState.setupLightsView(camera);
      if (_clippingEnabled === true)
        clipping.setGlobalState(_this.clippingPlanes, camera);
      if (transmissiveObjects.length > 0)
        renderTransmissionPass(opaqueObjects, transmissiveObjects, scene, camera);
      if (viewport)
        state.viewport(_currentViewport.copy(viewport));
      if (opaqueObjects.length > 0)
        renderObjects(opaqueObjects, scene, camera);
      if (transmissiveObjects.length > 0)
        renderObjects(transmissiveObjects, scene, camera);
      if (transparentObjects.length > 0)
        renderObjects(transparentObjects, scene, camera);
      state.buffers.depth.setTest(true);
      state.buffers.depth.setMask(true);
      state.buffers.color.setMask(true);
      state.setPolygonOffset(false);
    }
    function renderTransmissionPass(opaqueObjects, transmissiveObjects, scene, camera) {
      const isWebGL2 = capabilities.isWebGL2;
      if (_transmissionRenderTarget === null) {
        _transmissionRenderTarget = new WebGLRenderTarget(1, 1, {
          generateMipmaps: true,
          type: extensions.has("EXT_color_buffer_half_float") ? HalfFloatType : UnsignedByteType,
          minFilter: LinearMipmapLinearFilter,
          samples: isWebGL2 ? 4 : 0
        });
      }
      _this.getDrawingBufferSize(_vector2);
      if (isWebGL2) {
        _transmissionRenderTarget.setSize(_vector2.x, _vector2.y);
      } else {
        _transmissionRenderTarget.setSize(floorPowerOfTwo(_vector2.x), floorPowerOfTwo(_vector2.y));
      }
      const currentRenderTarget = _this.getRenderTarget();
      _this.setRenderTarget(_transmissionRenderTarget);
      _this.getClearColor(_currentClearColor);
      _currentClearAlpha = _this.getClearAlpha();
      if (_currentClearAlpha < 1)
        _this.setClearColor(16777215, 0.5);
      _this.clear();
      const currentToneMapping = _this.toneMapping;
      _this.toneMapping = NoToneMapping;
      renderObjects(opaqueObjects, scene, camera);
      textures.updateMultisampleRenderTarget(_transmissionRenderTarget);
      textures.updateRenderTargetMipmap(_transmissionRenderTarget);
      let renderTargetNeedsUpdate = false;
      for (let i = 0, l = transmissiveObjects.length; i < l; i++) {
        const renderItem = transmissiveObjects[i];
        const object = renderItem.object;
        const geometry = renderItem.geometry;
        const material = renderItem.material;
        const group = renderItem.group;
        if (material.side === DoubleSide && object.layers.test(camera.layers)) {
          const currentSide = material.side;
          material.side = BackSide;
          material.needsUpdate = true;
          renderObject(object, scene, camera, geometry, material, group);
          material.side = currentSide;
          material.needsUpdate = true;
          renderTargetNeedsUpdate = true;
        }
      }
      if (renderTargetNeedsUpdate === true) {
        textures.updateMultisampleRenderTarget(_transmissionRenderTarget);
        textures.updateRenderTargetMipmap(_transmissionRenderTarget);
      }
      _this.setRenderTarget(currentRenderTarget);
      _this.setClearColor(_currentClearColor, _currentClearAlpha);
      _this.toneMapping = currentToneMapping;
    }
    function renderObjects(renderList, scene, camera) {
      const overrideMaterial = scene.isScene === true ? scene.overrideMaterial : null;
      for (let i = 0, l = renderList.length; i < l; i++) {
        const renderItem = renderList[i];
        const object = renderItem.object;
        const geometry = renderItem.geometry;
        const material = overrideMaterial === null ? renderItem.material : overrideMaterial;
        const group = renderItem.group;
        if (object.layers.test(camera.layers)) {
          renderObject(object, scene, camera, geometry, material, group);
        }
      }
    }
    function renderObject(object, scene, camera, geometry, material, group) {
      object.onBeforeRender(_this, scene, camera, geometry, material, group);
      object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
      object.normalMatrix.getNormalMatrix(object.modelViewMatrix);
      material.onBeforeRender(_this, scene, camera, geometry, object, group);
      if (material.transparent === true && material.side === DoubleSide && material.forceSinglePass === false) {
        material.side = BackSide;
        material.needsUpdate = true;
        _this.renderBufferDirect(camera, scene, geometry, material, object, group);
        material.side = FrontSide;
        material.needsUpdate = true;
        _this.renderBufferDirect(camera, scene, geometry, material, object, group);
        material.side = DoubleSide;
      } else {
        _this.renderBufferDirect(camera, scene, geometry, material, object, group);
      }
      object.onAfterRender(_this, scene, camera, geometry, material, group);
    }
    function getProgram(material, scene, object) {
      if (scene.isScene !== true)
        scene = _emptyScene;
      const materialProperties = properties.get(material);
      const lights = currentRenderState.state.lights;
      const shadowsArray = currentRenderState.state.shadowsArray;
      const lightsStateVersion = lights.state.version;
      const parameters2 = programCache.getParameters(
        material,
        lights.state,
        shadowsArray,
        scene,
        object
      );
      const programCacheKey = programCache.getProgramCacheKey(parameters2);
      let programs = materialProperties.programs;
      materialProperties.environment = material.isMeshStandardMaterial ? scene.environment : null;
      materialProperties.fog = scene.fog;
      materialProperties.envMap = (material.isMeshStandardMaterial ? cubeuvmaps : cubemaps).get(
        material.envMap || materialProperties.environment
      );
      if (programs === void 0) {
        material.addEventListener("dispose", onMaterialDispose);
        programs = /* @__PURE__ */ new Map();
        materialProperties.programs = programs;
      }
      let program = programs.get(programCacheKey);
      if (program !== void 0) {
        if (materialProperties.currentProgram === program && materialProperties.lightsStateVersion === lightsStateVersion) {
          updateCommonMaterialProperties(material, parameters2);
          return program;
        }
      } else {
        parameters2.uniforms = programCache.getUniforms(material);
        material.onBuild(object, parameters2, _this);
        material.onBeforeCompile(parameters2, _this);
        program = programCache.acquireProgram(parameters2, programCacheKey);
        programs.set(programCacheKey, program);
        materialProperties.uniforms = parameters2.uniforms;
      }
      const uniforms = materialProperties.uniforms;
      if (!material.isShaderMaterial && !material.isRawShaderMaterial || material.clipping === true) {
        uniforms.clippingPlanes = clipping.uniform;
      }
      updateCommonMaterialProperties(material, parameters2);
      materialProperties.needsLights = materialNeedsLights(material);
      materialProperties.lightsStateVersion = lightsStateVersion;
      if (materialProperties.needsLights) {
        uniforms.ambientLightColor.value = lights.state.ambient;
        uniforms.lightProbe.value = lights.state.probe;
        uniforms.directionalLights.value = lights.state.directional;
        uniforms.directionalLightShadows.value = lights.state.directionalShadow;
        uniforms.spotLights.value = lights.state.spot;
        uniforms.spotLightShadows.value = lights.state.spotShadow;
        uniforms.rectAreaLights.value = lights.state.rectArea;
        uniforms.ltc_1.value = lights.state.rectAreaLTC1;
        uniforms.ltc_2.value = lights.state.rectAreaLTC2;
        uniforms.pointLights.value = lights.state.point;
        uniforms.pointLightShadows.value = lights.state.pointShadow;
        uniforms.hemisphereLights.value = lights.state.hemi;
        uniforms.directionalShadowMap.value = lights.state.directionalShadowMap;
        uniforms.directionalShadowMatrix.value = lights.state.directionalShadowMatrix;
        uniforms.spotShadowMap.value = lights.state.spotShadowMap;
        uniforms.spotLightMatrix.value = lights.state.spotLightMatrix;
        uniforms.spotLightMap.value = lights.state.spotLightMap;
        uniforms.pointShadowMap.value = lights.state.pointShadowMap;
        uniforms.pointShadowMatrix.value = lights.state.pointShadowMatrix;
      }
      const progUniforms = program.getUniforms();
      const uniformsList = WebGLUniforms.seqWithValue(progUniforms.seq, uniforms);
      materialProperties.currentProgram = program;
      materialProperties.uniformsList = uniformsList;
      return program;
    }
    function updateCommonMaterialProperties(material, parameters2) {
      const materialProperties = properties.get(material);
      materialProperties.outputColorSpace = parameters2.outputColorSpace;
      materialProperties.instancing = parameters2.instancing;
      materialProperties.instancingColor = parameters2.instancingColor;
      materialProperties.skinning = parameters2.skinning;
      materialProperties.morphTargets = parameters2.morphTargets;
      materialProperties.morphNormals = parameters2.morphNormals;
      materialProperties.morphColors = parameters2.morphColors;
      materialProperties.morphTargetsCount = parameters2.morphTargetsCount;
      materialProperties.numClippingPlanes = parameters2.numClippingPlanes;
      materialProperties.numIntersection = parameters2.numClipIntersection;
      materialProperties.vertexAlphas = parameters2.vertexAlphas;
      materialProperties.vertexTangents = parameters2.vertexTangents;
      materialProperties.toneMapping = parameters2.toneMapping;
    }
    function setProgram(camera, scene, geometry, material, object) {
      if (scene.isScene !== true)
        scene = _emptyScene;
      textures.resetTextureUnits();
      const fog = scene.fog;
      const environment = material.isMeshStandardMaterial ? scene.environment : null;
      const colorSpace = _currentRenderTarget === null ? _this.outputColorSpace : (
        // : _currentRenderTarget.isXRRenderTarget === true
        // ? _currentRenderTarget.texture.colorSpace
        LinearSRGBColorSpace
      );
      const envMap = (material.isMeshStandardMaterial ? cubeuvmaps : cubemaps).get(
        material.envMap || environment
      );
      const vertexAlphas = material.vertexColors === true && !!geometry.attributes.color && geometry.attributes.color.itemSize === 4;
      const vertexTangents = !!geometry.attributes.tangent && (!!material.normalMap || material.anisotropy > 0);
      const morphTargets = !!geometry.morphAttributes.position;
      const morphNormals = !!geometry.morphAttributes.normal;
      const morphColors = !!geometry.morphAttributes.color;
      let toneMapping = NoToneMapping;
      if (material.toneMapped) {
        if (_currentRenderTarget === null || _currentRenderTarget.isXRRenderTarget === true) {
          toneMapping = _this.toneMapping;
        }
      }
      const morphAttribute = geometry.morphAttributes.position || geometry.morphAttributes.normal || geometry.morphAttributes.color;
      const morphTargetsCount = morphAttribute !== void 0 ? morphAttribute.length : 0;
      const materialProperties = properties.get(material);
      const lights = currentRenderState.state.lights;
      if (_clippingEnabled === true) {
        if (_localClippingEnabled === true || camera !== _currentCamera) {
          const useCache = camera === _currentCamera && material.id === _currentMaterialId;
          clipping.setState(material, camera, useCache);
        }
      }
      let needsProgramChange = false;
      if (material.version === materialProperties.__version) {
        if (materialProperties.needsLights && materialProperties.lightsStateVersion !== lights.state.version) {
          needsProgramChange = true;
        } else if (materialProperties.outputColorSpace !== colorSpace) {
          needsProgramChange = true;
        } else if (object.isInstancedMesh && materialProperties.instancing === false) {
          needsProgramChange = true;
        } else if (!object.isInstancedMesh && materialProperties.instancing === true) {
          needsProgramChange = true;
        } else if (object.isSkinnedMesh && materialProperties.skinning === false) {
          needsProgramChange = true;
        } else if (!object.isSkinnedMesh && materialProperties.skinning === true) {
          needsProgramChange = true;
        } else if (object.isInstancedMesh && materialProperties.instancingColor === true && object.instanceColor === null) {
          needsProgramChange = true;
        } else if (object.isInstancedMesh && materialProperties.instancingColor === false && object.instanceColor !== null) {
          needsProgramChange = true;
        } else if (materialProperties.envMap !== envMap) {
          needsProgramChange = true;
        } else if (material.fog === true && materialProperties.fog !== fog) {
          needsProgramChange = true;
        } else if (materialProperties.numClippingPlanes !== void 0 && (materialProperties.numClippingPlanes !== clipping.numPlanes || materialProperties.numIntersection !== clipping.numIntersection)) {
          needsProgramChange = true;
        } else if (materialProperties.vertexAlphas !== vertexAlphas) {
          needsProgramChange = true;
        } else if (materialProperties.vertexTangents !== vertexTangents) {
          needsProgramChange = true;
        } else if (materialProperties.morphTargets !== morphTargets) {
          needsProgramChange = true;
        } else if (materialProperties.morphNormals !== morphNormals) {
          needsProgramChange = true;
        } else if (materialProperties.morphColors !== morphColors) {
          needsProgramChange = true;
        } else if (materialProperties.toneMapping !== toneMapping) {
          needsProgramChange = true;
        } else if (capabilities.isWebGL2 === true && materialProperties.morphTargetsCount !== morphTargetsCount) {
          needsProgramChange = true;
        }
      } else {
        needsProgramChange = true;
        materialProperties.__version = material.version;
      }
      let program = materialProperties.currentProgram;
      if (needsProgramChange === true) {
        program = getProgram(material, scene, object);
      }
      let refreshProgram = false;
      let refreshMaterial = false;
      let refreshLights = false;
      const p_uniforms = program.getUniforms();
      const m_uniforms = materialProperties.uniforms;
      if (state.useProgram(program.program)) {
        refreshProgram = true;
        refreshMaterial = true;
        refreshLights = true;
      }
      if (material.id !== _currentMaterialId) {
        _currentMaterialId = material.id;
        refreshMaterial = true;
      }
      if (refreshProgram || _currentCamera !== camera) {
        p_uniforms.setValue(_gl, "projectionMatrix", camera.projectionMatrix);
        p_uniforms.setValue(_gl, "viewMatrix", camera.matrixWorldInverse);
        const uCamPos = p_uniforms.map.cameraPosition;
        if (uCamPos !== void 0) {
          uCamPos.setValue(_gl, _vector3.setFromMatrixPosition(camera.matrixWorld));
        }
        if (capabilities.logarithmicDepthBuffer) {
          p_uniforms.setValue(_gl, "logDepthBufFC", 2 / (Math.log(camera.far + 1) / Math.LN2));
        }
        if (material.isMeshPhongMaterial || material.isMeshToonMaterial || material.isMeshLambertMaterial || material.isMeshBasicMaterial || material.isMeshStandardMaterial || material.isShaderMaterial) {
          p_uniforms.setValue(_gl, "isOrthographic", camera.isOrthographicCamera === true);
        }
        if (_currentCamera !== camera) {
          _currentCamera = camera;
          refreshMaterial = true;
          refreshLights = true;
        }
      }
      if (object.isSkinnedMesh) {
        p_uniforms.setOptional(_gl, object, "bindMatrix");
        p_uniforms.setOptional(_gl, object, "bindMatrixInverse");
        const skeleton = object.skeleton;
        if (skeleton) {
          if (capabilities.floatVertexTextures) {
            if (skeleton.boneTexture === null)
              skeleton.computeBoneTexture();
            p_uniforms.setValue(_gl, "boneTexture", skeleton.boneTexture, textures);
            p_uniforms.setValue(_gl, "boneTextureSize", skeleton.boneTextureSize);
          } else {
            console.warn(
              "WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."
            );
          }
        }
      }
      const morphAttributes = geometry.morphAttributes;
      if (morphAttributes.position !== void 0 || morphAttributes.normal !== void 0 || morphAttributes.color !== void 0 && capabilities.isWebGL2 === true) {
        morphtargets.update(object, geometry, program);
      }
      if (refreshMaterial || materialProperties.receiveShadow !== object.receiveShadow) {
        materialProperties.receiveShadow = object.receiveShadow;
        p_uniforms.setValue(_gl, "receiveShadow", object.receiveShadow);
      }
      if (material.isMeshGouraudMaterial && material.envMap !== null) {
        m_uniforms.envMap.value = envMap;
        m_uniforms.flipEnvMap.value = envMap.isCubeTexture && envMap.isRenderTargetTexture === false ? -1 : 1;
      }
      if (refreshMaterial) {
        p_uniforms.setValue(_gl, "toneMappingExposure", _this.toneMappingExposure);
        if (materialProperties.needsLights) {
          markUniformsLightsNeedsUpdate(m_uniforms, refreshLights);
        }
        if (fog && material.fog === true) {
          materials.refreshFogUniforms(m_uniforms, fog);
        }
        materials.refreshMaterialUniforms(
          m_uniforms,
          material,
          _pixelRatio,
          _height,
          _transmissionRenderTarget
        );
        WebGLUniforms.upload(_gl, materialProperties.uniformsList, m_uniforms, textures);
      }
      if (material.isShaderMaterial && material.uniformsNeedUpdate === true) {
        WebGLUniforms.upload(_gl, materialProperties.uniformsList, m_uniforms, textures);
        material.uniformsNeedUpdate = false;
      }
      if (material.isSpriteMaterial) {
        p_uniforms.setValue(_gl, "center", object.center);
      }
      p_uniforms.setValue(_gl, "modelViewMatrix", object.modelViewMatrix);
      p_uniforms.setValue(_gl, "normalMatrix", object.normalMatrix);
      p_uniforms.setValue(_gl, "modelMatrix", object.matrixWorld);
      if (material.isShaderMaterial || material.isRawShaderMaterial) {
        const groups = material.uniformsGroups;
        for (let i = 0, l = groups.length; i < l; i++) {
          if (capabilities.isWebGL2) {
            const group = groups[i];
            uniformsGroups.update(group, program);
            uniformsGroups.bind(group, program);
          } else {
            console.warn("WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.");
          }
        }
      }
      return program;
    }
    function markUniformsLightsNeedsUpdate(uniforms, value) {
      uniforms.ambientLightColor.needsUpdate = value;
      uniforms.lightProbe.needsUpdate = value;
      uniforms.directionalLights.needsUpdate = value;
      uniforms.directionalLightShadows.needsUpdate = value;
      uniforms.pointLights.needsUpdate = value;
      uniforms.pointLightShadows.needsUpdate = value;
      uniforms.spotLights.needsUpdate = value;
      uniforms.spotLightShadows.needsUpdate = value;
      uniforms.rectAreaLights.needsUpdate = value;
      uniforms.hemisphereLights.needsUpdate = value;
    }
    function materialNeedsLights(material) {
      return material.isMeshLambertMaterial || material.isMeshToonMaterial || material.isMeshPhongMaterial || material.isMeshStandardMaterial || material.isShadowMaterial || material.isShaderMaterial && material.lights === true;
    }
    this.getActiveCubeFace = () => _currentActiveCubeFace;
    this.getActiveMipmapLevel = () => _currentActiveMipmapLevel;
    this.getRenderTarget = () => _currentRenderTarget;
    this.setRenderTargetTextures = (renderTarget, colorTexture, depthTexture) => {
      properties.get(renderTarget.texture).__webglTexture = colorTexture;
      properties.get(renderTarget.depthTexture).__webglTexture = depthTexture;
      const renderTargetProperties = properties.get(renderTarget);
      renderTargetProperties.__hasExternalTextures = true;
      if (renderTargetProperties.__hasExternalTextures) {
        renderTargetProperties.__autoAllocateDepthBuffer = depthTexture === void 0;
        if (!renderTargetProperties.__autoAllocateDepthBuffer) {
          if (extensions.has("WEBGL_multisampled_render_to_texture") === true) {
            console.warn(
              "WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"
            );
            renderTargetProperties.__useRenderToTexture = false;
          }
        }
      }
    };
    this.setRenderTargetFramebuffer = (renderTarget, defaultFramebuffer) => {
      const renderTargetProperties = properties.get(renderTarget);
      renderTargetProperties.__webglFramebuffer = defaultFramebuffer;
      renderTargetProperties.__useDefaultFramebuffer = defaultFramebuffer === void 0;
    };
    this.setRenderTarget = (renderTarget, activeCubeFace = 0, activeMipmapLevel = 0) => {
      _currentRenderTarget = renderTarget;
      _currentActiveCubeFace = activeCubeFace;
      _currentActiveMipmapLevel = activeMipmapLevel;
      let useDefaultFramebuffer = true;
      let framebuffer = null;
      let isCube = false;
      let isRenderTarget3D = false;
      if (renderTarget) {
        const renderTargetProperties = properties.get(renderTarget);
        if (renderTargetProperties.__useDefaultFramebuffer !== void 0) {
          state.bindFramebuffer(_gl.FRAMEBUFFER, null);
          useDefaultFramebuffer = false;
        } else if (renderTargetProperties.__webglFramebuffer === void 0) {
          textures.setupRenderTarget(renderTarget);
        } else if (renderTargetProperties.__hasExternalTextures) {
          textures.rebindTextures(
            renderTarget,
            properties.get(renderTarget.texture).__webglTexture,
            properties.get(renderTarget.depthTexture).__webglTexture
          );
        }
        const texture = renderTarget.texture;
        if (texture.isData3DTexture || texture.isDataArrayTexture || texture.isCompressedArrayTexture) {
          isRenderTarget3D = true;
        }
        const __webglFramebuffer = properties.get(renderTarget).__webglFramebuffer;
        if (renderTarget.isWebGLCubeRenderTarget) {
          if (Array.isArray(__webglFramebuffer[activeCubeFace])) {
            framebuffer = __webglFramebuffer[activeCubeFace][activeMipmapLevel];
          } else {
            framebuffer = __webglFramebuffer[activeCubeFace];
          }
          isCube = true;
        } else if (capabilities.isWebGL2 && renderTarget.samples > 0 && textures.useMultisampledRTT(renderTarget) === false) {
          framebuffer = properties.get(renderTarget).__webglMultisampledFramebuffer;
        } else {
          if (Array.isArray(__webglFramebuffer)) {
            framebuffer = __webglFramebuffer[activeMipmapLevel];
          } else {
            framebuffer = __webglFramebuffer;
          }
        }
        _currentViewport.copy(renderTarget.viewport);
        _currentScissor.copy(renderTarget.scissor);
        _currentScissorTest = renderTarget.scissorTest;
      } else {
        _currentViewport.copy(_viewport).multiplyScalar(_pixelRatio).floor();
        _currentScissor.copy(_scissor).multiplyScalar(_pixelRatio).floor();
        _currentScissorTest = _scissorTest;
      }
      const framebufferBound = state.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);
      if (framebufferBound && capabilities.drawBuffers && useDefaultFramebuffer) {
        state.drawBuffers(renderTarget, framebuffer);
      }
      state.viewport(_currentViewport);
      state.scissor(_currentScissor);
      state.setScissorTest(_currentScissorTest);
      if (isCube) {
        const textureProperties = properties.get(renderTarget.texture);
        _gl.framebufferTexture2D(
          _gl.FRAMEBUFFER,
          _gl.COLOR_ATTACHMENT0,
          _gl.TEXTURE_CUBE_MAP_POSITIVE_X + activeCubeFace,
          textureProperties.__webglTexture,
          activeMipmapLevel
        );
      } else if (isRenderTarget3D) {
        const textureProperties = properties.get(renderTarget.texture);
        const layer = activeCubeFace || 0;
        _gl.framebufferTextureLayer(
          _gl.FRAMEBUFFER,
          _gl.COLOR_ATTACHMENT0,
          textureProperties.__webglTexture,
          activeMipmapLevel || 0,
          layer
        );
      }
      _currentMaterialId = -1;
    };
    this.readRenderTargetPixels = (renderTarget, x, y, width, height, buffer, activeCubeFaceIndex) => {
      if (!(renderTarget && renderTarget.isWebGLRenderTarget)) {
        console.error(
          "WebGLRenderer.readRenderTargetPixels: renderTarget is not WebGLRenderTarget."
        );
        return;
      }
      let framebuffer = properties.get(renderTarget).__webglFramebuffer;
      if (renderTarget.isWebGLCubeRenderTarget && activeCubeFaceIndex !== void 0) {
        framebuffer = framebuffer[activeCubeFaceIndex];
      }
      if (framebuffer) {
        state.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);
        try {
          const texture = renderTarget.texture;
          const textureFormat = texture.format;
          const textureType = texture.type;
          if (textureFormat !== RGBAFormat && utils.convert(textureFormat) !== _gl.getParameter(_gl.IMPLEMENTATION_COLOR_READ_FORMAT)) {
            console.error(
              "WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format."
            );
            return;
          }
          const halfFloatSupportedByExt = textureType === HalfFloatType && (extensions.has("EXT_color_buffer_half_float") || capabilities.isWebGL2 && extensions.has("EXT_color_buffer_float"));
          if (textureType !== UnsignedByteType && utils.convert(textureType) !== _gl.getParameter(_gl.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
          !(textureType === FloatType && (capabilities.isWebGL2 || extensions.has("OES_texture_float") || extensions.has("WEBGL_color_buffer_float"))) && // Chrome Mac >= 52 and Firefox
          !halfFloatSupportedByExt) {
            console.error(
              "WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type."
            );
            return;
          }
          if (x >= 0 && x <= renderTarget.width - width && y >= 0 && y <= renderTarget.height - height) {
            _gl.readPixels(
              x,
              y,
              width,
              height,
              utils.convert(textureFormat),
              utils.convert(textureType),
              buffer
            );
          }
        } finally {
          const framebuffer2 = _currentRenderTarget !== null ? properties.get(_currentRenderTarget).__webglFramebuffer : null;
          state.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer2);
        }
      }
    };
    this.copyFramebufferToTexture = (position, texture, level = 0) => {
      const levelScale = Math.pow(2, -level);
      const width = Math.floor(texture.image.width * levelScale);
      const height = Math.floor(texture.image.height * levelScale);
      textures.setTexture2D(texture, 0);
      _gl.copyTexSubImage2D(_gl.TEXTURE_2D, level, 0, 0, position.x, position.y, width, height);
      state.unbindTexture();
    };
    this.copyTextureToTexture = (position, srcTexture, dstTexture, level = 0) => {
      const width = srcTexture.image.width;
      const height = srcTexture.image.height;
      const glFormat = utils.convert(dstTexture.format);
      const glType = utils.convert(dstTexture.type);
      textures.setTexture2D(dstTexture, 0);
      _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, dstTexture.flipY);
      _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, dstTexture.premultiplyAlpha);
      _gl.pixelStorei(_gl.UNPACK_ALIGNMENT, dstTexture.unpackAlignment);
      if (srcTexture.isDataTexture) {
        _gl.texSubImage2D(
          _gl.TEXTURE_2D,
          level,
          position.x,
          position.y,
          width,
          height,
          glFormat,
          glType,
          srcTexture.image.data
        );
      } else {
        if (srcTexture.isCompressedTexture) {
          _gl.compressedTexSubImage2D(
            _gl.TEXTURE_2D,
            level,
            position.x,
            position.y,
            srcTexture.mipmaps[0].width,
            srcTexture.mipmaps[0].height,
            glFormat,
            srcTexture.mipmaps[0].data
          );
        } else {
          _gl.texSubImage2D(
            _gl.TEXTURE_2D,
            level,
            position.x,
            position.y,
            glFormat,
            glType,
            srcTexture.image
          );
        }
      }
      if (level === 0 && dstTexture.generateMipmaps)
        _gl.generateMipmap(_gl.TEXTURE_2D);
      state.unbindTexture();
    };
    this.copyTextureToTexture3D = (sourceBox, position, srcTexture, dstTexture, level = 0) => {
      const width = sourceBox.max.x - sourceBox.min.x + 1;
      const height = sourceBox.max.y - sourceBox.min.y + 1;
      const depth2 = sourceBox.max.z - sourceBox.min.z + 1;
      const glFormat = utils.convert(dstTexture.format);
      const glType = utils.convert(dstTexture.type);
      let glTarget;
      if (dstTexture.isData3DTexture) {
        textures.setTexture3D(dstTexture, 0);
        glTarget = _gl.TEXTURE_3D;
      } else if (dstTexture.isDataArrayTexture) {
        textures.setTexture2DArray(dstTexture, 0);
        glTarget = _gl.TEXTURE_2D_ARRAY;
      } else {
        console.warn(
          "WebGLRenderer.copyTextureToTexture3D: only supports DataTexture3D and DataTexture2DArray."
        );
        return;
      }
      _gl.pixelStorei(_gl.UNPACK_FLIP_Y_WEBGL, dstTexture.flipY);
      _gl.pixelStorei(_gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, dstTexture.premultiplyAlpha);
      _gl.pixelStorei(_gl.UNPACK_ALIGNMENT, dstTexture.unpackAlignment);
      const unpackRowLen = _gl.getParameter(_gl.UNPACK_ROW_LENGTH);
      const unpackImageHeight = _gl.getParameter(_gl.UNPACK_IMAGE_HEIGHT);
      const unpackSkipPixels = _gl.getParameter(_gl.UNPACK_SKIP_PIXELS);
      const unpackSkipRows = _gl.getParameter(_gl.UNPACK_SKIP_ROWS);
      const unpackSkipImages = _gl.getParameter(_gl.UNPACK_SKIP_IMAGES);
      const image = srcTexture.isCompressedTexture ? srcTexture.mipmaps[0] : srcTexture.image;
      _gl.pixelStorei(_gl.UNPACK_ROW_LENGTH, image.width);
      _gl.pixelStorei(_gl.UNPACK_IMAGE_HEIGHT, image.height);
      _gl.pixelStorei(_gl.UNPACK_SKIP_PIXELS, sourceBox.min.x);
      _gl.pixelStorei(_gl.UNPACK_SKIP_ROWS, sourceBox.min.y);
      _gl.pixelStorei(_gl.UNPACK_SKIP_IMAGES, sourceBox.min.z);
      if (srcTexture.isDataTexture || srcTexture.isData3DTexture) {
        _gl.texSubImage3D(
          glTarget,
          level,
          position.x,
          position.y,
          position.z,
          width,
          height,
          depth2,
          glFormat,
          glType,
          image.data
        );
      } else {
        if (srcTexture.isCompressedArrayTexture) {
          console.warn(
            "WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."
          );
          _gl.compressedTexSubImage3D(
            glTarget,
            level,
            position.x,
            position.y,
            position.z,
            width,
            height,
            depth2,
            glFormat,
            image.data
          );
        } else {
          _gl.texSubImage3D(
            glTarget,
            level,
            position.x,
            position.y,
            position.z,
            width,
            height,
            depth2,
            glFormat,
            glType,
            image
          );
        }
      }
      _gl.pixelStorei(_gl.UNPACK_ROW_LENGTH, unpackRowLen);
      _gl.pixelStorei(_gl.UNPACK_IMAGE_HEIGHT, unpackImageHeight);
      _gl.pixelStorei(_gl.UNPACK_SKIP_PIXELS, unpackSkipPixels);
      _gl.pixelStorei(_gl.UNPACK_SKIP_ROWS, unpackSkipRows);
      _gl.pixelStorei(_gl.UNPACK_SKIP_IMAGES, unpackSkipImages);
      if (level === 0 && dstTexture.generateMipmaps)
        _gl.generateMipmap(glTarget);
      state.unbindTexture();
    };
    this.initTexture = (texture) => {
      if (texture.isCubeTexture) {
        textures.setTextureCube(texture, 0);
      } else if (texture.isData3DTexture) {
        textures.setTexture3D(texture, 0);
      } else if (texture.isDataArrayTexture || texture.isCompressedArrayTexture) {
        textures.setTexture2DArray(texture, 0);
      } else {
        textures.setTexture2D(texture, 0);
      }
      state.unbindTexture();
    };
    this.resetState = () => {
      _currentActiveCubeFace = 0;
      _currentActiveMipmapLevel = 0;
      _currentRenderTarget = null;
      state.reset();
      bindingStates.reset();
    };
  }
  get coordinateSystem() {
    return WebGLCoordinateSystem;
  }
  /** @deprecated Multiply light intensity values by PI when false. */
  get useLegacyLights() {
    return this._useLegacyLights;
  }
  /** @deprecated Multiply light intensity values by PI when false. */
  set useLegacyLights(value) {
    this._useLegacyLights = value;
  }
}

export { WebGLRenderer };
