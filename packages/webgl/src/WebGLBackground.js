import { BoxGeometry, PlaneGeometry } from '@renderlayer/geometries';
import { ShaderMaterial } from '@renderlayer/materials';
import { Color, ColorManagement } from '@renderlayer/math';
import { Mesh } from '@renderlayer/objects';
import { ShaderLib, cloneUniforms, getUnlitUniformColorSpace } from '@renderlayer/shaders';
import { BackSide, CubeUVReflectionMapping, FrontSide, SRGBTransfer } from '@renderlayer/shared';

class WebGLBackground {
  #renderer;
  #cubemaps;
  #cubeuvmaps;
  #state;
  #objects;
  #alpha;
  #premultipliedAlpha;

  #clearColor = new Color(0x000000);
  #clearAlpha = 1;

  #planeMesh = undefined;
  #boxMesh = undefined;

  #currentBackground = null;
  #currentBackgroundVersion = 0;
  #currentTonemapping = null;

  constructor(renderer, cubemaps, cubeuvmaps, state, objects, alpha, premultipliedAlpha) {
    this.#renderer = renderer;
    this.#cubemaps = cubemaps;
    this.#cubeuvmaps = cubeuvmaps;
    this.#state = state;
    this.#objects = objects;
    this.#alpha = alpha;
    this.#premultipliedAlpha = premultipliedAlpha;

    this.#clearAlpha = alpha === true ? 0 : 1;
  }

  render(renderList, scene) {
    let forceClear = false;
    let background = scene.isScene === true ? scene.background : null;

    if (background && background.isTexture) {
      const usePMREM = scene.backgroundBlurriness > 0; // use PMREM if the user wants to blur the background
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

    if (
      background &&
      (background.isCubeTexture || background.mapping === CubeUVReflectionMapping)
    ) {
      if (this.#boxMesh === undefined) {
        this.#boxMesh = new Mesh(
          new BoxGeometry(1, 1, 1),
          new ShaderMaterial({
            name: 'BackgroundCubeMaterial',
            uniforms: cloneUniforms(ShaderLib.backgroundCube.uniforms),
            vertexShader: ShaderLib.backgroundCube.vertexShader,
            fragmentShader: ShaderLib.backgroundCube.fragmentShader,
            side: BackSide,
            depthTest: false,
            depthWrite: false,
            fog: false
          })
        );

        this.#boxMesh.geometry.deleteAttribute('normal');
        this.#boxMesh.geometry.deleteAttribute('uv');

        this.#boxMesh.onBeforeRender = function (renderer, scene, camera) {
          this.matrixWorld.copyPosition(camera.matrixWorld);
        };

        // add "envMap" material property so the renderer can evaluate it like
        // for built-in materials

        // EP : Fix me
        Object.defineProperty(this.#boxMesh.material, 'envMap', {
          get() {
            return this.uniforms.envMap.value;
          }
        });

        this.#objects.update(this.#boxMesh);
      }

      this.#boxMesh.material.uniforms.envMap.value = background;
      this.#boxMesh.material.uniforms.flipEnvMap.value =
        background.isCubeTexture && background.isRenderTargetTexture === false ? -1 : 1;
      this.#boxMesh.material.uniforms.backgroundBlurriness.value = scene.backgroundBlurriness;
      this.#boxMesh.material.uniforms.backgroundIntensity.value = scene.backgroundIntensity;
      this.#boxMesh.material.toneMapped =
        ColorManagement.getTransfer(background.colorSpace) !== SRGBTransfer;

      if (
        this.#currentBackground !== background ||
        this.#currentBackgroundVersion !== background.version ||
        this.#currentTonemapping !== this.#renderer.toneMapping
      ) {
        this.#boxMesh.material.needsUpdate = true;

        this.#currentBackground = background;
        this.#currentBackgroundVersion = background.version;
        this.#currentTonemapping = this.#renderer.toneMapping;
      }

      this.#boxMesh.layers.enableAll();

      // push to the pre-sorted opaque render list
      renderList.unshift(this.#boxMesh, this.#boxMesh.geometry, this.#boxMesh.material, 0, 0, null);
    } else if (background && background.isTexture) {
      if (this.#planeMesh === undefined) {
        this.#planeMesh = new Mesh(
          new PlaneGeometry(2, 2),
          new ShaderMaterial({
            name: 'BackgroundMaterial',
            uniforms: cloneUniforms(ShaderLib.background.uniforms),
            vertexShader: ShaderLib.background.vertexShader,
            fragmentShader: ShaderLib.background.fragmentShader,
            side: FrontSide,
            depthTest: false,
            depthWrite: false,
            fog: false
          })
        );

        this.#planeMesh.geometry.deleteAttribute('normal');

        // add "map" material property so the renderer can evaluate it like for built-in materials
        Object.defineProperty(this.#planeMesh.material, 'map', {
          get() {
            return this.uniforms.t2D.value;
          }
        });

        this.#objects.update(this.#planeMesh);
      }

      this.#planeMesh.material.uniforms.t2D.value = background;
      this.#planeMesh.material.uniforms.backgroundIntensity.value = scene.backgroundIntensity;
      this.#planeMesh.material.toneMapped =
        ColorManagement.getTransfer(background.colorSpace) !== SRGBTransfer;

      if (background.matrixAutoUpdate === true) {
        background.updateMatrix();
      }

      this.#planeMesh.material.uniforms.uvTransform.value.copy(background.matrix);

      if (
        this.#currentBackground !== background ||
        this.#currentBackgroundVersion !== background.version ||
        this.#currentTonemapping !== this.#renderer.toneMapping
      ) {
        this.#planeMesh.material.needsUpdate = true;

        this.#currentBackground = background;
        this.#currentBackgroundVersion = background.version;
        this.#currentTonemapping = this.#renderer.toneMapping;
      }

      this.#planeMesh.layers.enableAll();

      // push to the pre-sorted opaque render list
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

export { WebGLBackground };
