import { EventDispatcher } from '@renderlayer/core';
import { Vector4 } from '@renderlayer/math';
import { LinearFilter, BackSide, NoBlending, LinearMipmapLinearFilter } from '@renderlayer/shared';
import { Texture, Source, CubeTexture } from '@renderlayer/textures';
import { BoxGeometry } from '@renderlayer/geometries';
import { ShaderMaterial } from '@renderlayer/materials';
import { Mesh } from '@renderlayer/objects';
import { cloneUniforms } from '@renderlayer/shaders';
import { CubeCamera } from '@renderlayer/cameras';

class RenderTarget extends EventDispatcher {
  constructor(width = 1, height = 1, options = {}) {
    super();
    this.isRenderTarget = true;
    this.width = width;
    this.height = height;
    this.depth = 1;
    this.scissor = new Vector4(0, 0, width, height);
    this.scissorTest = false;
    this.viewport = new Vector4(0, 0, width, height);
    const image = { width, height, depth: 1 };
    const defaults = {
      generateMipmaps: false,
      internalFormat: null,
      minFilter: LinearFilter,
      depthBuffer: true,
      stencilBuffer: false,
      depthTexture: null,
      samples: 0
    };
    options = {
      ...defaults,
      ...options
    };
    this.texture = new Texture(
      image,
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
    this.texture.flipY = false;
    this.texture.generateMipmaps = options.generateMipmaps;
    this.texture.internalFormat = options.internalFormat;
    this.depthBuffer = options.depthBuffer;
    this.stencilBuffer = options.stencilBuffer;
    this.depthTexture = options.depthTexture;
    this.samples = options.samples;
  }
  setSize(width, height, depth = 1) {
    if (this.width !== width || this.height !== height || this.depth !== depth) {
      this.width = width;
      this.height = height;
      this.depth = depth;
      this.texture.image.width = width;
      this.texture.image.height = height;
      this.texture.image.depth = depth;
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
    this.texture = source.texture.clone();
    this.texture.isRenderTargetTexture = true;
    const image = Object.assign({}, source.texture.image);
    this.texture.source = new Source(image);
    this.depthBuffer = source.depthBuffer;
    this.stencilBuffer = source.stencilBuffer;
    if (source.depthTexture !== null)
      this.depthTexture = source.depthTexture.clone();
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
    this.isWebGLRenderTarget = true;
  }
}

class WebGLCubeRenderTarget extends WebGLRenderTarget {
  constructor(size = 1, options = {}) {
    super(size, size, options);
    this.isWebGLCubeRenderTarget = true;
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
    if (texture.minFilter === LinearMipmapLinearFilter)
      texture.minFilter = LinearFilter;
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
