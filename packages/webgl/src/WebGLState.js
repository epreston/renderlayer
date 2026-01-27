import { Color, Vector4 } from '@renderlayer/math';
import {
  AddEquation,
  AdditiveBlending,
  AlwaysDepth,
  BackSide,
  ConstantAlphaFactor,
  ConstantColorFactor,
  CullFaceBack,
  CullFaceFront,
  CullFaceNone,
  CustomBlending,
  DoubleSide,
  DstAlphaFactor,
  DstColorFactor,
  EqualDepth,
  GreaterDepth,
  GreaterEqualDepth,
  LessDepth,
  LessEqualDepth,
  MaxEquation,
  MinEquation,
  MultiplyBlending,
  NeverDepth,
  NoBlending,
  NormalBlending,
  NotEqualDepth,
  OneFactor,
  OneMinusConstantAlphaFactor,
  OneMinusConstantColorFactor,
  OneMinusDstAlphaFactor,
  OneMinusDstColorFactor,
  OneMinusSrcAlphaFactor,
  OneMinusSrcColorFactor,
  ReverseSubtractEquation,
  SrcAlphaFactor,
  SrcAlphaSaturateFactor,
  SrcColorFactor,
  SubtractEquation,
  SubtractiveBlending,
  ZeroFactor
} from '@renderlayer/shared';

/**
 * @param {WebGL2RenderingContext} gl
 * @param {import('./WebGLExtensions.js').WebGLExtensions} extensions
 * @param {import('./WebGLCapabilities.js').WebGLCapabilities} capabilities
 */
function WebGLState(gl, extensions, capabilities) {
  // EP : params not used

  const enabledCapabilities = new CapabilityTracker(gl);

  //

  const colorBuffer = new ColorBuffer(gl);
  const depthBuffer = new DepthBuffer(gl, enabledCapabilities);
  const stencilBuffer = new StencilBuffer(gl, enabledCapabilities);

  const uboBindings = new WeakMap();
  const uboProgramMap = new WeakMap();

  let currentBoundFramebuffers = {};
  let currentDrawbuffers = new WeakMap();
  let defaultDrawbuffers = [];

  let currentProgram = null;

  let currentBlendingEnabled = false;
  let currentBlending = null;
  let currentBlendEquation = null;
  let currentBlendSrc = null;
  let currentBlendDst = null;
  let currentBlendEquationAlpha = null;
  let currentBlendSrcAlpha = null;
  let currentBlendDstAlpha = null;
  let currentBlendColor = new Color(0, 0, 0);
  let currentBlendAlpha = 0;
  let currentPremultipledAlpha = false;

  let currentFlipSided = null;
  let currentCullFace = null;

  let currentLineWidth = null;

  let currentPolygonOffsetFactor = null;
  let currentPolygonOffsetUnits = null;

  const maxTextures = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

  let lineWidthAvailable = false;
  let version = 0;
  const glVersion = gl.getParameter(gl.VERSION);

  if (glVersion.includes('WebGL')) {
    version = parseFloat(/^WebGL (\d)/.exec(glVersion)[1]);
    lineWidthAvailable = version >= 1.0;
  } else if (glVersion.includes('OpenGL ES')) {
    version = parseFloat(/^OpenGL ES (\d)/.exec(glVersion)[1]);
    lineWidthAvailable = version >= 2.0;
  }

  let currentTextureSlot = null;
  let currentBoundTextures = {};

  const scissorParam = gl.getParameter(gl.SCISSOR_BOX);
  const viewportParam = gl.getParameter(gl.VIEWPORT);

  const currentScissor = new Vector4().fromArray(scissorParam);
  const currentViewport = new Vector4().fromArray(viewportParam);

  function createTexture(type, target, count, dimensions) {
    const data = new Uint8Array(4); // 4 is required to match default unpack alignment of 4.
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

  const emptyTextures = {};
  emptyTextures[gl.TEXTURE_2D] = createTexture(gl.TEXTURE_2D, gl.TEXTURE_2D, 1);
  emptyTextures[gl.TEXTURE_CUBE_MAP] = createTexture(
    gl.TEXTURE_CUBE_MAP,
    gl.TEXTURE_CUBE_MAP_POSITIVE_X,
    6
  );

  emptyTextures[gl.TEXTURE_2D_ARRAY] = createTexture(
    gl.TEXTURE_2D_ARRAY,
    gl.TEXTURE_2D_ARRAY,
    1,
    1
  );
  emptyTextures[gl.TEXTURE_3D] = createTexture(gl.TEXTURE_3D, gl.TEXTURE_3D, 1, 1);

  // init

  colorBuffer.setClear(0, 0, 0, 1);
  depthBuffer.setClear(1);
  stencilBuffer.setClear(0);

  enable(gl.DEPTH_TEST);
  depthBuffer.setFunc(LessEqualDepth);

  setFlipSided(false);
  setCullFace(CullFaceBack);
  enable(gl.CULL_FACE);

  setBlending(NoBlending);

  //

  function enable(id) {
    enabledCapabilities.enable(id);
  }

  function disable(id) {
    enabledCapabilities.disable(id);
  }

  function bindFramebuffer(target, framebuffer) {
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

  function drawBuffers(renderTarget, framebuffer) {
    let drawBuffers = defaultDrawbuffers;

    let needsUpdate = false;

    if (renderTarget) {
      drawBuffers = currentDrawbuffers.get(framebuffer);

      if (drawBuffers === undefined) {
        drawBuffers = [];
        currentDrawbuffers.set(framebuffer, drawBuffers);
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

  function useProgram(program) {
    if (currentProgram !== program) {
      gl.useProgram(program);

      currentProgram = program;

      return true;
    }

    return false;
  }

  const equationToGL = {
    [AddEquation]: gl.FUNC_ADD,
    [SubtractEquation]: gl.FUNC_SUBTRACT,
    [ReverseSubtractEquation]: gl.FUNC_REVERSE_SUBTRACT
  };

  equationToGL[MinEquation] = gl.MIN;
  equationToGL[MaxEquation] = gl.MAX;

  const factorToGL = {
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

  function setBlending(
    blending,
    blendEquation,
    blendSrc,
    blendDst,
    blendEquationAlpha,
    blendSrcAlpha,
    blendDstAlpha,
    blendColor,
    blendAlpha,
    premultipliedAlpha
  ) {
    if (blending === NoBlending) {
      if (currentBlendingEnabled === true) {
        disable(gl.BLEND);
        currentBlendingEnabled = false;
      }

      return;
    }

    if (currentBlendingEnabled === false) {
      enable(gl.BLEND);
      currentBlendingEnabled = true;
    }

    if (blending !== CustomBlending) {
      if (blending !== currentBlending || premultipliedAlpha !== currentPremultipledAlpha) {
        if (currentBlendEquation !== AddEquation || currentBlendEquationAlpha !== AddEquation) {
          gl.blendEquation(gl.FUNC_ADD);

          currentBlendEquation = AddEquation;
          currentBlendEquationAlpha = AddEquation;
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
              console.error('WebGLState: Invalid blending: ', blending);
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
              console.error('WebGLState: Invalid blending: ', blending);
              break;
          }
        }

        currentBlendSrc = null;
        currentBlendDst = null;
        currentBlendSrcAlpha = null;
        currentBlendDstAlpha = null;
        currentBlendColor.set(0, 0, 0);
        currentBlendAlpha = 0;

        currentBlending = blending;
        currentPremultipledAlpha = premultipliedAlpha;
      }

      return;
    }

    // custom blending

    blendEquationAlpha = blendEquationAlpha || blendEquation;
    blendSrcAlpha = blendSrcAlpha || blendSrc;
    blendDstAlpha = blendDstAlpha || blendDst;

    if (
      blendEquation !== currentBlendEquation ||
      blendEquationAlpha !== currentBlendEquationAlpha
    ) {
      gl.blendEquationSeparate(equationToGL[blendEquation], equationToGL[blendEquationAlpha]);

      currentBlendEquation = blendEquation;
      currentBlendEquationAlpha = blendEquationAlpha;
    }

    if (
      blendSrc !== currentBlendSrc ||
      blendDst !== currentBlendDst ||
      blendSrcAlpha !== currentBlendSrcAlpha ||
      blendDstAlpha !== currentBlendDstAlpha
    ) {
      gl.blendFuncSeparate(
        factorToGL[blendSrc],
        factorToGL[blendDst],
        factorToGL[blendSrcAlpha],
        factorToGL[blendDstAlpha]
      );

      currentBlendSrc = blendSrc;
      currentBlendDst = blendDst;
      currentBlendSrcAlpha = blendSrcAlpha;
      currentBlendDstAlpha = blendDstAlpha;
    }

    if (blendColor.equals(currentBlendColor) === false || blendAlpha !== currentBlendAlpha) {
      gl.blendColor(blendColor.r, blendColor.g, blendColor.b, blendAlpha);

      currentBlendColor.copy(blendColor);
      currentBlendAlpha = blendAlpha;
    }

    currentBlending = blending;
    currentPremultipledAlpha = false;
  }

  function setMaterial(material, frontFaceCW) {
    material.side === DoubleSide ? disable(gl.CULL_FACE) : enable(gl.CULL_FACE);

    let flipSided = material.side === BackSide;
    if (frontFaceCW) flipSided = !flipSided;

    setFlipSided(flipSided);

    material.blending === NormalBlending && material.transparent === false ?
      setBlending(NoBlending)
    : setBlending(
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

    depthBuffer.setFunc(material.depthFunc);
    depthBuffer.setTest(material.depthTest);
    depthBuffer.setMask(material.depthWrite);
    colorBuffer.setMask(material.colorWrite);

    const stencilWrite = material.stencilWrite;
    stencilBuffer.setTest(stencilWrite);
    if (stencilWrite) {
      stencilBuffer.setMask(material.stencilWriteMask);
      stencilBuffer.setFunc(material.stencilFunc, material.stencilRef, material.stencilFuncMask);
      stencilBuffer.setOp(material.stencilFail, material.stencilZFail, material.stencilZPass);
    }

    setPolygonOffset(
      material.polygonOffset,
      material.polygonOffsetFactor,
      material.polygonOffsetUnits
    );

    material.alphaToCoverage === true ?
      enable(gl.SAMPLE_ALPHA_TO_COVERAGE)
    : disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
  }

  //

  function setFlipSided(flipSided) {
    if (currentFlipSided !== flipSided) {
      if (flipSided) {
        gl.frontFace(gl.CW);
      } else {
        gl.frontFace(gl.CCW);
      }

      currentFlipSided = flipSided;
    }
  }

  function setCullFace(cullFace) {
    if (cullFace !== CullFaceNone) {
      enable(gl.CULL_FACE);

      if (cullFace !== currentCullFace) {
        if (cullFace === CullFaceBack) {
          gl.cullFace(gl.BACK);
        } else if (cullFace === CullFaceFront) {
          gl.cullFace(gl.FRONT);
        } else {
          gl.cullFace(gl.FRONT_AND_BACK);
        }
      }
    } else {
      disable(gl.CULL_FACE);
    }

    currentCullFace = cullFace;
  }

  function setLineWidth(width) {
    if (width !== currentLineWidth) {
      if (lineWidthAvailable) gl.lineWidth(width);

      currentLineWidth = width;
    }
  }

  function setPolygonOffset(polygonOffset, factor, units) {
    if (polygonOffset) {
      enable(gl.POLYGON_OFFSET_FILL);

      if (currentPolygonOffsetFactor !== factor || currentPolygonOffsetUnits !== units) {
        gl.polygonOffset(factor, units);

        currentPolygonOffsetFactor = factor;
        currentPolygonOffsetUnits = units;
      }
    } else {
      disable(gl.POLYGON_OFFSET_FILL);
    }
  }

  function setScissorTest(scissorTest) {
    if (scissorTest) {
      enable(gl.SCISSOR_TEST);
    } else {
      disable(gl.SCISSOR_TEST);
    }
  }

  // texture

  function activeTexture(webglSlot) {
    if (webglSlot === undefined) webglSlot = gl.TEXTURE0 + maxTextures - 1;

    if (currentTextureSlot !== webglSlot) {
      gl.activeTexture(webglSlot);
      currentTextureSlot = webglSlot;
    }
  }

  function bindTexture(webglType, webglTexture, webglSlot) {
    if (webglSlot === undefined) {
      if (currentTextureSlot === null) {
        webglSlot = gl.TEXTURE0 + maxTextures - 1;
      } else {
        webglSlot = currentTextureSlot;
      }
    }

    let boundTexture = currentBoundTextures[webglSlot];

    if (boundTexture === undefined) {
      boundTexture = { type: undefined, texture: undefined };
      currentBoundTextures[webglSlot] = boundTexture;
    }

    if (boundTexture.type !== webglType || boundTexture.texture !== webglTexture) {
      if (currentTextureSlot !== webglSlot) {
        gl.activeTexture(webglSlot);
        currentTextureSlot = webglSlot;
      }

      gl.bindTexture(webglType, webglTexture || emptyTextures[webglType]);

      boundTexture.type = webglType;
      boundTexture.texture = webglTexture;
    }
  }

  function unbindTexture() {
    const boundTexture = currentBoundTextures[currentTextureSlot];

    if (boundTexture !== undefined && boundTexture.type !== undefined) {
      gl.bindTexture(boundTexture.type, null);

      boundTexture.type = undefined;
      boundTexture.texture = undefined;
    }
  }

  function compressedTexImage2D(...args) {
    try {
      gl.compressedTexImage2D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  function compressedTexImage3D(...args) {
    try {
      gl.compressedTexImage3D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  function texSubImage2D(...args) {
    try {
      gl.texSubImage2D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  function texSubImage3D(...args) {
    try {
      gl.texSubImage3D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  function compressedTexSubImage2D(...args) {
    try {
      gl.compressedTexSubImage2D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  function compressedTexSubImage3D(...args) {
    try {
      gl.compressedTexSubImage3D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  function texStorage2D(...args) {
    try {
      gl.texStorage2D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  function texStorage3D(...args) {
    try {
      gl.texStorage3D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  function texImage2D(...args) {
    try {
      gl.texImage2D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  function texImage3D(...args) {
    try {
      gl.texImage3D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  //

  function scissor(scissor) {
    if (currentScissor.equals(scissor) === false) {
      gl.scissor(scissor.x, scissor.y, scissor.z, scissor.w);
      currentScissor.copy(scissor);
    }
  }

  function viewport(viewport) {
    if (currentViewport.equals(viewport) === false) {
      gl.viewport(viewport.x, viewport.y, viewport.z, viewport.w);
      currentViewport.copy(viewport);
    }
  }

  function updateUBOMapping(uniformsGroup, program) {
    let mapping = uboProgramMap.get(program);

    if (mapping === undefined) {
      mapping = new WeakMap();

      uboProgramMap.set(program, mapping);
    }

    let blockIndex = mapping.get(uniformsGroup);

    if (blockIndex === undefined) {
      blockIndex = gl.getUniformBlockIndex(program, uniformsGroup.name);

      mapping.set(uniformsGroup, blockIndex);
    }
  }

  function uniformBlockBinding(uniformsGroup, program) {
    const mapping = uboProgramMap.get(program);
    const blockIndex = mapping.get(uniformsGroup);

    if (uboBindings.get(program) !== blockIndex) {
      // bind shader specific block index to global block point
      gl.uniformBlockBinding(program, blockIndex, uniformsGroup.__bindingPointIndex);

      uboBindings.set(program, blockIndex);
    }
  }

  //

  function reset() {
    // reset state

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

    gl.stencilMask(0xffffffff);
    gl.stencilFunc(gl.ALWAYS, 0, 0xffffffff);
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

    // reset internals

    enabledCapabilities.reset();

    currentTextureSlot = null;
    currentBoundTextures = {};

    currentBoundFramebuffers = {};
    currentDrawbuffers = new WeakMap();
    defaultDrawbuffers = [];

    currentProgram = null;

    currentBlendingEnabled = false;
    currentBlending = null;
    currentBlendEquation = null;
    currentBlendSrc = null;
    currentBlendDst = null;
    currentBlendEquationAlpha = null;
    currentBlendSrcAlpha = null;
    currentBlendDstAlpha = null;
    currentBlendColor = new Color(0, 0, 0);
    currentBlendAlpha = 0;
    currentPremultipledAlpha = false;

    currentFlipSided = null;
    currentCullFace = null;

    currentLineWidth = null;

    currentPolygonOffsetFactor = null;
    currentPolygonOffsetUnits = null;

    currentScissor.set(0, 0, gl.canvas.width, gl.canvas.height);
    currentViewport.set(0, 0, gl.canvas.width, gl.canvas.height);

    colorBuffer.reset();
    depthBuffer.reset();
    stencilBuffer.reset();
  }

  return {
    buffers: {
      color: colorBuffer,
      depth: depthBuffer,
      stencil: stencilBuffer
    },

    enable,
    disable,

    bindFramebuffer,
    drawBuffers,

    useProgram,

    setBlending,
    setMaterial,

    setFlipSided,
    setCullFace,

    setLineWidth,
    setPolygonOffset,

    setScissorTest,

    activeTexture,
    bindTexture,
    unbindTexture,
    compressedTexImage2D,
    compressedTexImage3D,
    texImage2D,
    texImage3D,

    updateUBOMapping,
    uniformBlockBinding,

    texStorage2D,
    texStorage3D,
    texSubImage2D,
    texSubImage3D,
    compressedTexSubImage2D,
    compressedTexSubImage3D,

    scissor,
    viewport,

    reset
  };
}

class CapabilityTracker {
  #gl;
  #capabilities = {}; // EP : Map ?

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
    this.#currentColorClear.set(-1, 0, 0, 0); // set to invalid state
  }
}

class DepthBuffer {
  #gl;
  #capabilities;

  _locked = false;

  _currentDepthMask = null;
  _currentDepthFunc = null;
  _currentDepthClear = null;

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
    if (this._currentDepthMask !== depthMask && !this._locked) {
      this.#gl.depthMask(depthMask);
      this._currentDepthMask = depthMask;
    }
  }

  setFunc(depthFunc) {
    const gl = this.#gl;

    if (this._currentDepthFunc !== depthFunc) {
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

      this._currentDepthFunc = depthFunc;
    }
  }

  setLocked(lock) {
    this._locked = lock;
  }

  setClear(depth) {
    if (this._currentDepthClear !== depth) {
      this.#gl.clearDepth(depth);
      this._currentDepthClear = depth;
    }
  }

  reset() {
    this._locked = false;

    this._currentDepthMask = null;
    this._currentDepthFunc = null;
    this._currentDepthClear = null;
  }
}

class StencilBuffer {
  #gl;
  #capabilities;

  _locked = false;

  _currentStencilMask = null;
  _currentStencilFunc = null;
  _currentStencilRef = null;
  _currentStencilFuncMask = null;
  _currentStencilFail = null;
  _currentStencilZFail = null;
  _currentStencilZPass = null;
  _currentStencilClear = null;

  /**
   * @param {WebGL2RenderingContext} gl
   * @param {CapabilityTracker} capabilities
   */
  constructor(gl, capabilities) {
    this.#gl = gl;
    this.#capabilities = capabilities;
  }

  setTest(stencilTest) {
    if (!this._locked) {
      if (stencilTest) {
        this.#capabilities.enable(this.#gl.STENCIL_TEST);
      } else {
        this.#capabilities.disable(this.#gl.STENCIL_TEST);
      }
    }
  }

  setMask(stencilMask) {
    if (this._currentStencilMask !== stencilMask && !this._locked) {
      this.#gl.stencilMask(stencilMask);
      this._currentStencilMask = stencilMask;
    }
  }

  setFunc(stencilFunc, stencilRef, stencilMask) {
    if (
      this._currentStencilFunc !== stencilFunc ||
      this._currentStencilRef !== stencilRef ||
      this._currentStencilFuncMask !== stencilMask
    ) {
      this.#gl.stencilFunc(stencilFunc, stencilRef, stencilMask);

      this._currentStencilFunc = stencilFunc;
      this._currentStencilRef = stencilRef;
      this._currentStencilFuncMask = stencilMask;
    }
  }

  setOp(stencilFail, stencilZFail, stencilZPass) {
    if (
      this._currentStencilFail !== stencilFail ||
      this._currentStencilZFail !== stencilZFail ||
      this._currentStencilZPass !== stencilZPass
    ) {
      this.#gl.stencilOp(stencilFail, stencilZFail, stencilZPass);

      this._currentStencilFail = stencilFail;
      this._currentStencilZFail = stencilZFail;
      this._currentStencilZPass = stencilZPass;
    }
  }

  setLocked(lock) {
    this._locked = lock;
  }

  setClear(stencil) {
    if (this._currentStencilClear !== stencil) {
      this.#gl.clearStencil(stencil);
      this._currentStencilClear = stencil;
    }
  }

  reset() {
    this._locked = false;

    this._currentStencilMask = null;
    this._currentStencilFunc = null;
    this._currentStencilRef = null;
    this._currentStencilFuncMask = null;
    this._currentStencilFail = null;
    this._currentStencilZFail = null;
    this._currentStencilZPass = null;
    this._currentStencilClear = null;
  }
}

export { WebGLState };
