import { EventDispatcher } from '@renderlayer/core';
import { Vector4 } from '@renderlayer/math';
import { LinearFilter, NoBlending, BackSide, LinearMipmapLinearFilter } from '@renderlayer/shared';
import { Texture, Source, CubeTexture } from '@renderlayer/textures';
import { BoxGeometry } from '@renderlayer/geometries';
import { ShaderMaterial } from '@renderlayer/materials';
import { Mesh } from '@renderlayer/objects';
import { cloneUniforms } from '@renderlayer/shaders';
import { CubeCamera } from '@renderlayer/cameras';

class RenderTarget extends EventDispatcher {
  width = 1;
  height = 1;
  depth = 1;
  scissor;
  scissorTest = false;
  viewport;
  textures = [];
  depthBuffer = true;
  stencilBuffer = false;
  resolveDepthBuffer = true;
  resolveStencilBuffer = true;
  #depthTexture = null;
  samples = 0;
  multiview = false;
  /*
   * In options, we can specify:
   * Texture parameters for an auto-generated target texture
   * depthBuffer/stencilBuffer: Booleans to indicate if we should generate these buffers
   */
  constructor(width = 1, height = 1, options = {}) {
    super();
    options = Object.assign(
      {
        generateMipmaps: false,
        internalFormat: null,
        minFilter: LinearFilter,
        depthBuffer: true,
        stencilBuffer: false,
        resolveDepthBuffer: true,
        resolveStencilBuffer: true,
        depthTexture: null,
        samples: 0,
        count: 1,
        depth: 1,
        multiview: false
      },
      options
    );
    this.width = width;
    this.height = height;
    this.depth = options.depth;
    this.scissor = new Vector4(0, 0, width, height);
    this.viewport = new Vector4(0, 0, width, height);
    const image = { width, height, depth: options.depth };
    const texture = new Texture(image);
    const count = options.count;
    for (let i = 0; i < count; i++) {
      this.textures[i] = texture.clone();
      this.textures[i].isRenderTargetTexture = true;
      this.textures[i].renderTarget = this;
    }
    this.#setTextureOptions(options);
    this.depthBuffer = options.depthBuffer;
    this.stencilBuffer = options.stencilBuffer;
    this.resolveDepthBuffer = options.resolveDepthBuffer;
    this.resolveStencilBuffer = options.resolveStencilBuffer;
    this.depthTexture = options.depthTexture;
    this.samples = options.samples;
    this.multiview = options.multiview;
  }
  get isRenderTarget() {
    return true;
  }
  /**
   * The texture representing the default color attachment.
   *
   * @type {Texture}
   */
  get texture() {
    return this.textures[0];
  }
  set texture(value) {
    this.textures[0] = value;
  }
  /**
   * Instead of saving the depth in a renderbuffer, a texture
   * can be used instead which is useful for further processing
   * e.g. in context of post-processing.
   *
   * @type {?DepthTexture}
   * @default null
   */
  get depthTexture() {
    return this.#depthTexture;
  }
  set depthTexture(current) {
    if (this.#depthTexture !== null) this.#depthTexture.renderTarget = null;
    if (current !== null) current.renderTarget = this;
    this.#depthTexture = current;
  }
  #setTextureOptions(options = {}) {
    const values = {
      minFilter: LinearFilter,
      generateMipmaps: false,
      flipY: false,
      internalFormat: null
    };
    if (options.mapping !== void 0) values.mapping = options.mapping;
    if (options.wrapS !== void 0) values.wrapS = options.wrapS;
    if (options.wrapT !== void 0) values.wrapT = options.wrapT;
    if (options.wrapR !== void 0) values.wrapR = options.wrapR;
    if (options.magFilter !== void 0) values.magFilter = options.magFilter;
    if (options.minFilter !== void 0) values.minFilter = options.minFilter;
    if (options.format !== void 0) values.format = options.format;
    if (options.type !== void 0) values.type = options.type;
    if (options.anisotropy !== void 0) values.anisotropy = options.anisotropy;
    if (options.colorSpace !== void 0) values.colorSpace = options.colorSpace;
    if (options.flipY !== void 0) values.flipY = options.flipY;
    if (options.generateMipmaps !== void 0) values.generateMipmaps = options.generateMipmaps;
    if (options.internalFormat !== void 0) values.internalFormat = options.internalFormat;
    for (let i = 0; i < this.textures.length; i++) {
      const texture = this.textures[i];
      texture.setValues(values);
    }
  }
  setSize(width, height, depth = 1) {
    if (this.width !== width || this.height !== height || this.depth !== depth) {
      this.width = width;
      this.height = height;
      this.depth = depth;
      for (let i = 0, il = this.textures.length; i < il; i++) {
        this.textures[i].image.width = width;
        this.textures[i].image.height = height;
        this.textures[i].image.depth = depth;
        if (this.textures[i].isData3DTexture !== true) {
          this.textures[i].isArrayTexture = this.textures[i].image.depth > 1;
        }
      }
      this.dispose();
    }
    this.viewport.set(0, 0, width, height);
    this.scissor.set(0, 0, width, height);
  }
  /** @returns {this} */
  clone() {
    return new this.constructor().copy(this);
  }
  /** @param {RenderTarget} source */
  copy(source) {
    this.width = source.width;
    this.height = source.height;
    this.depth = source.depth;
    this.scissor.copy(source.scissor);
    this.scissorTest = source.scissorTest;
    this.viewport.copy(source.viewport);
    this.textures.length = 0;
    for (let i = 0, il = source.textures.length; i < il; i++) {
      this.textures[i] = source.textures[i].clone();
      this.textures[i].isRenderTargetTexture = true;
      this.textures[i].renderTarget = this;
      const image = Object.assign({}, source.textures[i].image);
      this.textures[i].source = new Source(image);
    }
    this.depthBuffer = source.depthBuffer;
    this.stencilBuffer = source.stencilBuffer;
    this.resolveDepthBuffer = source.resolveDepthBuffer;
    this.resolveStencilBuffer = source.resolveStencilBuffer;
    if (source.depthTexture !== null) this.depthTexture = source.depthTexture.clone();
    this.samples = source.samples;
    return this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}

class WebGLRenderTarget extends RenderTarget {
  constructor(width = 1, height = 1, options = {}) {
    super(width, height, options);
    this.isXRRenderTarget = false;
  }
  get isWebGLRenderTarget() {
    return true;
  }
}

class WebGLCubeRenderTarget extends WebGLRenderTarget {
  constructor(size = 1, options = {}) {
    super(size, size, options);
    const image = { width: size, height: size, depth: 1 };
    const images = [image, image, image, image, image, image];
    this.texture = new CubeTexture(
      images,
      options.mapping,
      options.wrapS,
      options.wrapT,
      options.magFilter,
      options.minFilter,
      options.format,
      options.type,
      options.anisotropy,
      options.colorSpace
    );
    this.texture.isRenderTargetTexture = true;
    this.texture.generateMipmaps = options.generateMipmaps !== void 0 ? options.generateMipmaps : false;
    this.texture.minFilter = options.minFilter !== void 0 ? options.minFilter : LinearFilter;
  }
  get isWebGLCubeRenderTarget() {
    return true;
  }
  fromEquirectangularTexture(renderer, texture) {
    this.texture.type = texture.type;
    this.texture.colorSpace = texture.colorSpace;
    this.texture.generateMipmaps = texture.generateMipmaps;
    this.texture.minFilter = texture.minFilter;
    this.texture.magFilter = texture.magFilter;
    const shader = {
      uniforms: {
        tEquirect: { value: null }
      },
      vertexShader: `
				varying vec3 vWorldDirection;
				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
				}
				void main() {
					vWorldDirection = transformDirection( position, modelMatrix );
					#include <begin_vertex>
					#include <project_vertex>
				}
			`,
      fragmentShader: `
				uniform sampler2D tEquirect;
				varying vec3 vWorldDirection;
				#include <common>
				void main() {
					vec3 direction = normalize( vWorldDirection );
					vec2 sampleUV = equirectUv( direction );
					gl_FragColor = texture2D( tEquirect, sampleUV );
				}
			`
    };
    const geometry = new BoxGeometry(5, 5, 5);
    const material = new ShaderMaterial({
      name: "CubemapFromEquirect",
      uniforms: cloneUniforms(shader.uniforms),
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
      side: BackSide,
      blending: NoBlending
    });
    material.uniforms.tEquirect.value = texture;
    const mesh = new Mesh(geometry, material);
    const currentMinFilter = texture.minFilter;
    if (texture.minFilter === LinearMipmapLinearFilter) texture.minFilter = LinearFilter;
    const camera = new CubeCamera(1, 10, this);
    camera.update(renderer, mesh);
    texture.minFilter = currentMinFilter;
    mesh.geometry.dispose();
    mesh.material.dispose();
    return this;
  }
  clear(renderer, color, depth, stencil) {
    const currentRenderTarget = renderer.getRenderTarget();
    for (let i = 0; i < 6; i++) {
      renderer.setRenderTarget(this, i);
      renderer.clear(color, depth, stencil);
    }
    renderer.setRenderTarget(currentRenderTarget);
  }
}

export { RenderTarget, WebGLCubeRenderTarget, WebGLRenderTarget };
