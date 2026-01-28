import { CubeReflectionMapping, CubeRefractionMapping, NoToneMapping, BackSide, CubeUVReflectionMapping, NoBlending, LinearSRGBColorSpace, RGBAFormat, HalfFloatType, LinearFilter } from '@renderlayer/shared';
import { BufferGeometry, BufferAttribute } from '@renderlayer/buffers';
import { OrthographicCamera, PerspectiveCamera } from '@renderlayer/cameras';
import { BoxGeometry } from '@renderlayer/geometries';
import { MeshBasicMaterial, ShaderMaterial } from '@renderlayer/materials';
import { Color, Vector3 } from '@renderlayer/math';
import { Mesh } from '@renderlayer/objects';
import { WebGLRenderTarget } from '@renderlayer/targets';

class PMREMGenerator {
  #renderer;
  #pingPongRenderTarget = null;
  #lodMax = 0;
  #cubeSize = 0;
  #lodPlanes = [];
  #sizeLods = [];
  #sigmas = [];
  #blurMaterial = null;
  #cubemapMaterial = null;
  #equirectMaterial = null;
  constructor(renderer) {
    this.#renderer = renderer;
    this.#compileMaterial(this.#blurMaterial);
  }
  /**
   * Generates a PMREM from a supplied Scene, which can be faster than using an
   * image if networking bandwidth is low. Optional sigma specifies a blur radius
   * in radians to be applied to the scene before PMREM generation. Optional near
   * and far planes ensure the scene is rendered in its entirety (the cubeCamera
   * is placed at the origin).
   */
  fromScene(scene, sigma = 0, near = 0.1, far = 100) {
    _oldTarget = this.#renderer.getRenderTarget();
    _oldActiveCubeFace = this.#renderer.getActiveCubeFace();
    _oldActiveMipmapLevel = this.#renderer.getActiveMipmapLevel();
    this.#setSize(256);
    const cubeUVRenderTarget = this.#allocateTargets();
    cubeUVRenderTarget.depthBuffer = true;
    this.#sceneToCubeUV(scene, near, far, cubeUVRenderTarget);
    if (sigma > 0) {
      this.#blur(cubeUVRenderTarget, 0, 0, sigma);
    }
    this.#applyPMREM(cubeUVRenderTarget);
    this.#cleanup(cubeUVRenderTarget);
    return cubeUVRenderTarget;
  }
  /**
   * Generates a PMREM from an equirectangular texture, which can be either LDR
   * or HDR. The ideal input image size is 1k (1024 x 512),
   * as this matches best with the 256 x 256 cubemap output.
   */
  fromEquirectangular(equirectangular, renderTarget = null) {
    return this.#fromTexture(equirectangular, renderTarget);
  }
  /**
   * Generates a PMREM from an cubemap texture, which can be either LDR
   * or HDR. The ideal input cube size is 256 x 256,
   * as this matches best with the 256 x 256 cubemap output.
   */
  fromCubemap(cubemap, renderTarget = null) {
    return this.#fromTexture(cubemap, renderTarget);
  }
  /**
   * Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileCubemapShader() {
    if (this.#cubemapMaterial === null) {
      this.#cubemapMaterial = _getCubemapMaterial();
      this.#compileMaterial(this.#cubemapMaterial);
    }
  }
  /**
   * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileEquirectangularShader() {
    if (this.#equirectMaterial === null) {
      this.#equirectMaterial = _getEquirectMaterial();
      this.#compileMaterial(this.#equirectMaterial);
    }
  }
  /**
   * Disposes of the PMREMGenerator's internal memory. Note that PMREMGenerator is a static class,
   * so you should not need more than one PMREMGenerator object. If you do, calling dispose() on
   * one of them will cause any others to also become unusable.
   */
  dispose() {
    this.#dispose();
    if (this.#cubemapMaterial !== null) this.#cubemapMaterial.dispose();
    if (this.#equirectMaterial !== null) this.#equirectMaterial.dispose();
  }
  // private interface
  #setSize(cubeSize) {
    this.#lodMax = Math.floor(Math.log2(cubeSize));
    this.#cubeSize = Math.pow(2, this.#lodMax);
  }
  #dispose() {
    if (this.#blurMaterial !== null) this.#blurMaterial.dispose();
    if (this.#pingPongRenderTarget !== null) this.#pingPongRenderTarget.dispose();
    for (let i = 0; i < this.#lodPlanes.length; i++) {
      this.#lodPlanes[i].dispose();
    }
  }
  #cleanup(outputTarget) {
    this.#renderer.setRenderTarget(_oldTarget, _oldActiveCubeFace, _oldActiveMipmapLevel);
    outputTarget.scissorTest = false;
    _setViewport(outputTarget, 0, 0, outputTarget.width, outputTarget.height);
  }
  #fromTexture(texture, renderTarget) {
    if (texture.mapping === CubeReflectionMapping || texture.mapping === CubeRefractionMapping) {
      this.#setSize(
        texture.image.length === 0 ? 16 : texture.image[0].width || texture.image[0].image.width
      );
    } else {
      this.#setSize(texture.image.width / 4);
    }
    _oldTarget = this.#renderer.getRenderTarget();
    _oldActiveCubeFace = this.#renderer.getActiveCubeFace();
    _oldActiveMipmapLevel = this.#renderer.getActiveMipmapLevel();
    const cubeUVRenderTarget = renderTarget || this.#allocateTargets();
    this.#textureToCubeUV(texture, cubeUVRenderTarget);
    this.#applyPMREM(cubeUVRenderTarget);
    this.#cleanup(cubeUVRenderTarget);
    return cubeUVRenderTarget;
  }
  #allocateTargets() {
    const width = 3 * Math.max(this.#cubeSize, 16 * 7);
    const height = 4 * this.#cubeSize;
    const params = {
      magFilter: LinearFilter,
      minFilter: LinearFilter,
      generateMipmaps: false,
      type: HalfFloatType,
      format: RGBAFormat,
      colorSpace: LinearSRGBColorSpace,
      depthBuffer: false
    };
    const cubeUVRenderTarget = _createRenderTarget(width, height, params);
    if (this.#pingPongRenderTarget === null || this.#pingPongRenderTarget.width !== width || this.#pingPongRenderTarget.height !== height) {
      if (this.#pingPongRenderTarget !== null) {
        this.#dispose();
      }
      this.#pingPongRenderTarget = _createRenderTarget(width, height, params);
      const lodMax = this.#lodMax;
      ({
        sizeLods: this.#sizeLods,
        lodPlanes: this.#lodPlanes,
        sigmas: this.#sigmas
      } = _createPlanes(lodMax));
      this.#blurMaterial = _getBlurShader(lodMax, width, height);
    }
    return cubeUVRenderTarget;
  }
  #compileMaterial(material) {
    const tmpMesh = new Mesh(this.#lodPlanes[0], material);
    this.#renderer.compile(tmpMesh, _flatCamera);
  }
  #sceneToCubeUV(scene, near, far, cubeUVRenderTarget) {
    const fov = 90;
    const aspect = 1;
    const cubeCamera = new PerspectiveCamera(fov, aspect, near, far);
    const upSign = [1, -1, 1, 1, 1, 1];
    const forwardSign = [1, 1, 1, -1, -1, -1];
    const renderer = this.#renderer;
    const originalAutoClear = renderer.autoClear;
    const toneMapping = renderer.toneMapping;
    renderer.getClearColor(_clearColor);
    renderer.toneMapping = NoToneMapping;
    renderer.autoClear = false;
    const backgroundMaterial = new MeshBasicMaterial({
      name: "PMREM.Background",
      side: BackSide,
      depthWrite: false,
      depthTest: false
    });
    const backgroundBox = new Mesh(new BoxGeometry(), backgroundMaterial);
    let useSolidColor = false;
    const background = scene.background;
    if (background) {
      if (background.isColor) {
        backgroundMaterial.color.copy(background);
        scene.background = null;
        useSolidColor = true;
      }
    } else {
      backgroundMaterial.color.copy(_clearColor);
      useSolidColor = true;
    }
    for (let i = 0; i < 6; i++) {
      const col = i % 3;
      if (col === 0) {
        cubeCamera.up.set(0, upSign[i], 0);
        cubeCamera.lookAt(forwardSign[i], 0, 0);
      } else if (col === 1) {
        cubeCamera.up.set(0, 0, upSign[i]);
        cubeCamera.lookAt(0, forwardSign[i], 0);
      } else {
        cubeCamera.up.set(0, upSign[i], 0);
        cubeCamera.lookAt(0, 0, forwardSign[i]);
      }
      const size = this.#cubeSize;
      _setViewport(cubeUVRenderTarget, col * size, i > 2 ? size : 0, size, size);
      renderer.setRenderTarget(cubeUVRenderTarget);
      if (useSolidColor) {
        renderer.render(backgroundBox, cubeCamera);
      }
      renderer.render(scene, cubeCamera);
    }
    backgroundBox.geometry.dispose();
    backgroundBox.material.dispose();
    renderer.toneMapping = toneMapping;
    renderer.autoClear = originalAutoClear;
    scene.background = background;
  }
  #textureToCubeUV(texture, cubeUVRenderTarget) {
    const renderer = this.#renderer;
    const isCubeTexture = texture.mapping === CubeReflectionMapping || texture.mapping === CubeRefractionMapping;
    if (isCubeTexture) {
      if (this.#cubemapMaterial === null) {
        this.#cubemapMaterial = _getCubemapMaterial();
      }
      this.#cubemapMaterial.uniforms.flipEnvMap.value = texture.isRenderTargetTexture === false ? -1 : 1;
    } else {
      if (this.#equirectMaterial === null) {
        this.#equirectMaterial = _getEquirectMaterial();
      }
    }
    const material = isCubeTexture ? this.#cubemapMaterial : this.#equirectMaterial;
    const mesh = new Mesh(this.#lodPlanes[0], material);
    const uniforms = material.uniforms;
    uniforms["envMap"].value = texture;
    const size = this.#cubeSize;
    _setViewport(cubeUVRenderTarget, 0, 0, 3 * size, 2 * size);
    renderer.setRenderTarget(cubeUVRenderTarget);
    renderer.render(mesh, _flatCamera);
  }
  #applyPMREM(cubeUVRenderTarget) {
    const renderer = this.#renderer;
    const autoClear = renderer.autoClear;
    renderer.autoClear = false;
    for (let i = 1; i < this.#lodPlanes.length; i++) {
      const sigma = Math.sqrt(
        this.#sigmas[i] * this.#sigmas[i] - this.#sigmas[i - 1] * this.#sigmas[i - 1]
      );
      const poleAxis = _axisDirections[(i - 1) % _axisDirections.length];
      this.#blur(cubeUVRenderTarget, i - 1, i, sigma, poleAxis);
    }
    renderer.autoClear = autoClear;
  }
  /**
   * This is a two-pass Gaussian blur for a cubemap. Normally this is done
   * vertically and horizontally, but this breaks down on a cube. Here we apply
   * the blur latitudinally (around the poles), and then longitudinally (towards
   * the poles) to approximate the orthogonally-separable blur. It is least
   * accurate at the poles, but still does a decent job.
   */
  #blur(cubeUVRenderTarget, lodIn, lodOut, sigma, poleAxis) {
    const pingPongRenderTarget = this.#pingPongRenderTarget;
    this.#halfBlur(
      cubeUVRenderTarget,
      pingPongRenderTarget,
      lodIn,
      lodOut,
      sigma,
      "latitudinal",
      poleAxis
    );
    this.#halfBlur(
      pingPongRenderTarget,
      cubeUVRenderTarget,
      lodOut,
      lodOut,
      sigma,
      "longitudinal",
      poleAxis
    );
  }
  #halfBlur(targetIn, targetOut, lodIn, lodOut, sigmaRadians, direction, poleAxis) {
    const renderer = this.#renderer;
    const blurMaterial = this.#blurMaterial;
    if (direction !== "latitudinal" && direction !== "longitudinal") {
      console.error("blur direction must be either latitudinal or longitudinal!");
    }
    const STANDARD_DEVIATIONS = 3;
    const blurMesh = new Mesh(this.#lodPlanes[lodOut], blurMaterial);
    const blurUniforms = blurMaterial.uniforms;
    const pixels = this.#sizeLods[lodIn] - 1;
    const radiansPerPixel = isFinite(sigmaRadians) ? Math.PI / (2 * pixels) : 2 * Math.PI / (2 * _MAX_SAMPLES - 1);
    const sigmaPixels = sigmaRadians / radiansPerPixel;
    const samples = isFinite(sigmaRadians) ? 1 + Math.floor(STANDARD_DEVIATIONS * sigmaPixels) : _MAX_SAMPLES;
    if (samples > _MAX_SAMPLES) {
      console.warn(
        `sigmaRadians, ${sigmaRadians}, is too large and will clip, as it requested ${samples} samples when the maximum is set to ${_MAX_SAMPLES}`
      );
    }
    const weights = [];
    let sum = 0;
    for (let i = 0; i < _MAX_SAMPLES; ++i) {
      const x2 = i / sigmaPixels;
      const weight = Math.exp(-x2 * x2 / 2);
      weights.push(weight);
      if (i === 0) {
        sum += weight;
      } else if (i < samples) {
        sum += 2 * weight;
      }
    }
    for (let i = 0; i < weights.length; i++) {
      weights[i] = weights[i] / sum;
    }
    blurUniforms["envMap"].value = targetIn.texture;
    blurUniforms["samples"].value = samples;
    blurUniforms["weights"].value = weights;
    blurUniforms["latitudinal"].value = direction === "latitudinal";
    if (poleAxis) {
      blurUniforms["poleAxis"].value = poleAxis;
    }
    const lodMax = this.#lodMax;
    blurUniforms["dTheta"].value = radiansPerPixel;
    blurUniforms["mipInt"].value = lodMax - lodIn;
    const outputSize = this.#sizeLods[lodOut];
    const x = 3 * outputSize * (lodOut > lodMax - _LOD_MIN ? lodOut - lodMax + _LOD_MIN : 0);
    const y = 4 * (this.#cubeSize - outputSize);
    _setViewport(targetOut, x, y, 3 * outputSize, 2 * outputSize);
    renderer.setRenderTarget(targetOut);
    renderer.render(blurMesh, _flatCamera);
  }
}
function _createPlanes(lodMax) {
  const lodPlanes = [];
  const sizeLods = [];
  const sigmas = [];
  let lod = lodMax;
  const totalLods = lodMax - _LOD_MIN + 1 + _EXTRA_LOD_SIGMA.length;
  for (let i = 0; i < totalLods; i++) {
    const sizeLod = Math.pow(2, lod);
    sizeLods.push(sizeLod);
    let sigma = 1 / sizeLod;
    if (i > lodMax - _LOD_MIN) {
      sigma = _EXTRA_LOD_SIGMA[i - lodMax + _LOD_MIN - 1];
    } else if (i === 0) {
      sigma = 0;
    }
    sigmas.push(sigma);
    const texelSize = 1 / (sizeLod - 2);
    const min = -texelSize;
    const max = 1 + texelSize;
    const uv1 = [min, min, max, min, max, max, min, min, max, max, min, max];
    const cubeFaces = 6;
    const vertices = 6;
    const positionSize = 3;
    const uvSize = 2;
    const faceIndexSize = 1;
    const position = new Float32Array(positionSize * vertices * cubeFaces);
    const uv = new Float32Array(uvSize * vertices * cubeFaces);
    const faceIndex = new Float32Array(faceIndexSize * vertices * cubeFaces);
    for (let face = 0; face < cubeFaces; face++) {
      const x = face % 3 * 2 / 3 - 1;
      const y = face > 2 ? 0 : -1;
      const coordinates = [
        x,
        y,
        0,
        x + 2 / 3,
        y,
        0,
        x + 2 / 3,
        y + 1,
        0,
        x,
        y,
        0,
        x + 2 / 3,
        y + 1,
        0,
        x,
        y + 1,
        0
      ];
      position.set(coordinates, positionSize * vertices * face);
      uv.set(uv1, uvSize * vertices * face);
      const fill = [face, face, face, face, face, face];
      faceIndex.set(fill, faceIndexSize * vertices * face);
    }
    const planes = new BufferGeometry();
    planes.setAttribute("position", new BufferAttribute(position, positionSize));
    planes.setAttribute("uv", new BufferAttribute(uv, uvSize));
    planes.setAttribute("faceIndex", new BufferAttribute(faceIndex, faceIndexSize));
    lodPlanes.push(planes);
    if (lod > _LOD_MIN) {
      lod--;
    }
  }
  return { lodPlanes, sizeLods, sigmas };
}
function _createRenderTarget(width, height, params) {
  const cubeUVRenderTarget = new WebGLRenderTarget(width, height, params);
  cubeUVRenderTarget.texture.mapping = CubeUVReflectionMapping;
  cubeUVRenderTarget.texture.name = "PMREM.cubeUv";
  cubeUVRenderTarget.scissorTest = true;
  return cubeUVRenderTarget;
}
function _setViewport(target, x, y, width, height) {
  target.viewport.set(x, y, width, height);
  target.scissor.set(x, y, width, height);
}
function _getBlurShader(lodMax, width, height) {
  const weights = new Float32Array(_MAX_SAMPLES);
  const poleAxis = new Vector3(0, 1, 0);
  const shaderMaterial = new ShaderMaterial({
    name: "SphericalGaussianBlur",
    defines: {
      n: _MAX_SAMPLES,
      CUBEUV_TEXEL_WIDTH: 1 / width,
      CUBEUV_TEXEL_HEIGHT: 1 / height,
      CUBEUV_MAX_MIP: `${lodMax}.0`
    },
    uniforms: {
      envMap: { value: null },
      samples: { value: 1 },
      weights: { value: weights },
      latitudinal: { value: false },
      dTheta: { value: 0 },
      mipInt: { value: 0 },
      poleAxis: { value: poleAxis }
    },
    vertexShader: _getCommonVertexShader(),
    fragmentShader: `
			precision mediump float;
			precision mediump int;
			varying vec3 vOutputDirection;
			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;
			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>
			vec3 getSample( float theta, vec3 axis ) {
				float cosTheta = cos( theta );
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );
				return bilinearCubeUV( envMap, sampleDirection, mipInt );
			}
			void main() {
				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );
				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {
					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );
				}
				axis = normalize( axis );
				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );
				for ( int i = 1; i < n; i++ ) {
					if ( i >= samples ) {
						break;
					}
					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );
				}
			}
		`,
    blending: NoBlending,
    depthTest: false,
    depthWrite: false
  });
  return shaderMaterial;
}
function _getEquirectMaterial() {
  return new ShaderMaterial({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: { value: null }
    },
    vertexShader: _getCommonVertexShader(),
    fragmentShader: `
			precision mediump float;
			precision mediump int;
			varying vec3 vOutputDirection;
			uniform sampler2D envMap;
			#include <common>
			void main() {
				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );
				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );
			}
		`,
    blending: NoBlending,
    depthTest: false,
    depthWrite: false
  });
}
function _getCubemapMaterial() {
  return new ShaderMaterial({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: _getCommonVertexShader(),
    fragmentShader: `
			precision mediump float;
			precision mediump int;
			uniform float flipEnvMap;
			varying vec3 vOutputDirection;
			uniform samplerCube envMap;
			void main() {
				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );
			}
		`,
    blending: NoBlending,
    depthTest: false,
    depthWrite: false
  });
}
function _getCommonVertexShader() {
  return `
		precision mediump float;
		precision mediump int;
		attribute float faceIndex;
		varying vec3 vOutputDirection;
		vec3 getDirection( vec2 uv, float face ) {
			uv = 2.0 * uv - 1.0;
			vec3 direction = vec3( uv, 1.0 );
			if ( face == 0.0 ) {
				direction = direction.zyx;
			} else if ( face == 1.0 ) {
				direction = direction.xzy;
				direction.xz *= -1.0;
			} else if ( face == 2.0 ) {
				direction.x *= -1.0;
			} else if ( face == 3.0 ) {
				direction = direction.zyx;
				direction.xz *= -1.0;
			} else if ( face == 4.0 ) {
				direction = direction.xzy;
				direction.xy *= -1.0;
			} else if ( face == 5.0 ) {
				direction.z *= -1.0;
			}
			return direction;
		}
		void main() {
			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );
		}
	`;
}
const _LOD_MIN = 4;
const _EXTRA_LOD_SIGMA = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582];
const _MAX_SAMPLES = 20;
const _flatCamera = /* @__PURE__ */ new OrthographicCamera();
const _clearColor = /* @__PURE__ */ new Color();
let _oldTarget = null;
let _oldActiveCubeFace = 0;
let _oldActiveMipmapLevel = 0;
const _PHI = (1 + Math.sqrt(5)) / 2;
const _INV_PHI = 1 / _PHI;
const _axisDirections = [
  /* @__PURE__ */ new Vector3(1, 1, 1),
  /* @__PURE__ */ new Vector3(-1, 1, 1),
  /* @__PURE__ */ new Vector3(1, 1, -1),
  /* @__PURE__ */ new Vector3(-1, 1, -1),
  /* @__PURE__ */ new Vector3(0, _PHI, _INV_PHI),
  /* @__PURE__ */ new Vector3(0, _PHI, -_INV_PHI),
  /* @__PURE__ */ new Vector3(_INV_PHI, 0, _PHI),
  /* @__PURE__ */ new Vector3(-_INV_PHI, 0, _PHI),
  /* @__PURE__ */ new Vector3(_PHI, _INV_PHI, 0),
  /* @__PURE__ */ new Vector3(-_PHI, _INV_PHI, 0)
];

export { PMREMGenerator };
