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
 * @import { WebGLExtensions, WebGLCapabilities } from "@renderlayer/webgl"
 */

class WebGLState {
  #gl;

  #enabledCapabilities;

  #colorBuffer;
  #depthBuffer;
  #stencilBuffer;

  #uboBindings = new WeakMap();
  #uboProgramMap = new WeakMap();

  #currentBoundFramebuffers = {};
  #currentDrawbuffers = new WeakMap();
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
   */
  constructor(gl) {
    this.#gl = gl;
    this.#enabledCapabilities = new CapabilityTracker(gl);

    //

    this.#colorBuffer = new ColorBuffer(gl);
    this.#depthBuffer = new DepthBuffer(gl, this.#enabledCapabilities);
    this.#stencilBuffer = new StencilBuffer(gl, this.#enabledCapabilities);

    this.buffers = {
      color: this.#colorBuffer,
      depth: this.#depthBuffer,
      stencil: this.#stencilBuffer
    };

    this.#maxTextures = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

    // EP : not required
    let version = 0;
    const glVersion = gl.getParameter(gl.VERSION);

    if (glVersion.includes('WebGL')) {
      version = parseFloat(/^WebGL (\d)/.exec(glVersion)[1]);
      this.#lineWidthAvailable = version >= 1.0;
    } else if (glVersion.includes('OpenGL ES')) {
      version = parseFloat(/^OpenGL ES (\d)/.exec(glVersion)[1]);
      this.#lineWidthAvailable = version >= 2.0;
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

    //

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

    // init

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

      // gl.DRAW_FRAMEBUFFER is equivalent to gl.FRAMEBUFFER

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

      if (drawBuffers === undefined) {
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

  setBlending(
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
      if (
        blending !== this.#currentBlending ||
        premultipliedAlpha !== this.#currentPremultipledAlpha
      ) {
        if (
          this.#currentBlendEquation !== AddEquation ||
          this.#currentBlendEquationAlpha !== AddEquation
        ) {
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

    // custom blending

    blendEquationAlpha = blendEquationAlpha || blendEquation;
    blendSrcAlpha = blendSrcAlpha || blendSrc;
    blendDstAlpha = blendDstAlpha || blendDst;

    if (
      blendEquation !== this.#currentBlendEquation ||
      blendEquationAlpha !== this.#currentBlendEquationAlpha
    ) {
      gl.blendEquationSeparate(
        this.#equationToGL[blendEquation],
        this.#equationToGL[blendEquationAlpha]
      );

      this.#currentBlendEquation = blendEquation;
      this.#currentBlendEquationAlpha = blendEquationAlpha;
    }

    if (
      blendSrc !== this.#currentBlendSrc ||
      blendDst !== this.#currentBlendDst ||
      blendSrcAlpha !== this.#currentBlendSrcAlpha ||
      blendDstAlpha !== this.#currentBlendDstAlpha
    ) {
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

    if (
      blendColor.equals(this.#currentBlendColor) === false ||
      blendAlpha !== this.#currentBlendAlpha
    ) {
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

    material.blending === NormalBlending && material.transparent === false ?
      this.setBlending(NoBlending)
    : this.setBlending(
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

    material.alphaToCoverage === true ?
      this.enable(gl.SAMPLE_ALPHA_TO_COVERAGE)
    : this.disable(gl.SAMPLE_ALPHA_TO_COVERAGE);
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

      if (
        this.#currentPolygonOffsetFactor !== factor ||
        this.#currentPolygonOffsetUnits !== units
      ) {
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

    if (webglSlot === undefined) webglSlot = gl.TEXTURE0 + this.#maxTextures - 1;

    if (this.#currentTextureSlot !== webglSlot) {
      gl.activeTexture(webglSlot);
      this.#currentTextureSlot = webglSlot;
    }
  }

  bindTexture(webglType, webglTexture, webglSlot) {
    const gl = this.#gl;

    if (webglSlot === undefined) {
      if (this.#currentTextureSlot === null) {
        webglSlot = gl.TEXTURE0 + this.#maxTextures - 1;
      } else {
        webglSlot = this.#currentTextureSlot;
      }
    }

    let boundTexture = this.#currentBoundTextures[webglSlot];

    if (boundTexture === undefined) {
      boundTexture = { type: undefined, texture: undefined };
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

    if (boundTexture !== undefined && boundTexture.type !== undefined) {
      this.#gl.bindTexture(boundTexture.type, null);

      boundTexture.type = undefined;
      boundTexture.texture = undefined;
    }
  }

  compressedTexImage2D(...args) {
    try {
      this.#gl.compressedTexImage2D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  compressedTexImage3D(...args) {
    try {
      this.#gl.compressedTexImage3D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  texSubImage2D(...args) {
    try {
      this.#gl.texSubImage2D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  texSubImage3D(...args) {
    try {
      this.#gl.texSubImage3D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  compressedTexSubImage2D(...args) {
    try {
      this.#gl.compressedTexSubImage2D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  compressedTexSubImage3D(...args) {
    try {
      this.#gl.compressedTexSubImage3D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  texStorage2D(...args) {
    try {
      this.#gl.texStorage2D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  texStorage3D(...args) {
    try {
      this.#gl.texStorage3D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  texImage2D(...args) {
    try {
      this.#gl.texImage2D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
    }
  }

  texImage3D(...args) {
    try {
      this.#gl.texImage3D(...args);
    } catch (error) {
      console.error('WebGLState:', error);
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

    if (mapping === undefined) {
      mapping = new WeakMap();

      this.#uboProgramMap.set(program, mapping);
    }

    let blockIndex = mapping.get(uniformsGroup);

    if (blockIndex === undefined) {
      blockIndex = this.#gl.getUniformBlockIndex(program, uniformsGroup.name);

      mapping.set(uniformsGroup, blockIndex);
    }
  }

  uniformBlockBinding(uniformsGroup, program) {
    const mapping = this.#uboProgramMap.get(program);
    const blockIndex = mapping.get(uniformsGroup);

    if (this.#uboBindings.get(program) !== blockIndex) {
      // bind shader specific block index to global block point
      this.#gl.uniformBlockBinding(program, blockIndex, uniformsGroup.__bindingPointIndex);

      this.#uboBindings.set(program, blockIndex);
    }
  }

  //

  reset() {
    const gl = this.#gl;

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

    this.#enabledCapabilities.reset();

    this.#currentTextureSlot = null;
    this.#currentBoundTextures = {};

    this.#currentBoundFramebuffers = {};
    this.#currentDrawbuffers = new WeakMap();
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
    if (
      this.#currentStencilFunc !== stencilFunc ||
      this.#currentStencilRef !== stencilRef ||
      this.#currentStencilFuncMask !== stencilMask
    ) {
      this.#gl.stencilFunc(stencilFunc, stencilRef, stencilMask);

      this.#currentStencilFunc = stencilFunc;
      this.#currentStencilRef = stencilRef;
      this.#currentStencilFuncMask = stencilMask;
    }
  }

  setOp(stencilFail, stencilZFail, stencilZPass) {
    if (
      this.#currentStencilFail !== stencilFail ||
      this.#currentStencilZFail !== stencilZFail ||
      this.#currentStencilZPass !== stencilZPass
    ) {
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

export { WebGLState };
