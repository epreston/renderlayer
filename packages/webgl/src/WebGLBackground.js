import { BoxGeometry, PlaneGeometry } from '@renderlayer/geometries';
import { ShaderMaterial } from '@renderlayer/materials';
import { Color, ColorManagement } from '@renderlayer/math';
import { Mesh } from '@renderlayer/objects';
import { ShaderLib, cloneUniforms, getUnlitUniformColorSpace } from '@renderlayer/shaders';
import { BackSide, CubeUVReflectionMapping, FrontSide, SRGBTransfer } from '@renderlayer/shared';

const _rgb = { r: 0, b: 0, g: 0 };

class WebGLBackground {
  constructor(renderer, cubemaps, cubeuvmaps, state, objects, alpha, premultipliedAlpha) {
    this._renderer = renderer;
    this._cubemaps = cubemaps;
    this._cubeuvmaps = cubeuvmaps;
    this._state = state;
    this._objects = objects;
    this._alpha = alpha;
    this._premultipliedAlpha = premultipliedAlpha;

    this._clearColor = new Color(0x000000);
    this._clearAlpha = alpha === true ? 0 : 1;

    this._planeMesh = undefined;
    this._boxMesh = undefined;

    this._currentBackground = null;
    this._currentBackgroundVersion = 0;
    this._currentTonemapping = null;
  }

  render(renderList, scene) {
    let forceClear = false;
    let background = scene.isScene === true ? scene.background : null;

    if (background && background.isTexture) {
      const usePMREM = scene.backgroundBlurriness > 0; // use PMREM if the user wants to blur the background
      background = (usePMREM ? this._cubeuvmaps : this._cubemaps).get(background);
    }

    if (background === null) {
      this._setClear(this._clearColor, this._clearAlpha);
    } else if (background && background.isColor) {
      this._setClear(background, 1);
      forceClear = true;
    }

    if (this._renderer.autoClear || forceClear) {
      this._renderer.clear(
        this._renderer.autoClearColor,
        this._renderer.autoClearDepth,
        this._renderer.autoClearStencil
      );
    }

    if (
      background &&
      (background.isCubeTexture || background.mapping === CubeUVReflectionMapping)
    ) {
      if (this._boxMesh === undefined) {
        this._boxMesh = new Mesh(
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

        this._boxMesh.geometry.deleteAttribute('normal');
        this._boxMesh.geometry.deleteAttribute('uv');

        this._boxMesh.onBeforeRender = function (renderer, scene, camera) {
          this.matrixWorld.copyPosition(camera.matrixWorld);
        };

        // add "envMap" material property so the renderer can evaluate it like
        // for built-in materials
        Object.defineProperty(this._boxMesh.material, 'envMap', {
          get() {
            return this.uniforms.envMap.value;
          }
        });

        this._objects.update(this._boxMesh);
      }

      this._boxMesh.material.uniforms.envMap.value = background;
      this._boxMesh.material.uniforms.flipEnvMap.value =
        background.isCubeTexture && background.isRenderTargetTexture === false ? -1 : 1;
      this._boxMesh.material.uniforms.backgroundBlurriness.value = scene.backgroundBlurriness;
      this._boxMesh.material.uniforms.backgroundIntensity.value = scene.backgroundIntensity;
      this._boxMesh.material.toneMapped =
        ColorManagement.getTransfer(background.colorSpace) !== SRGBTransfer;

      if (
        this._currentBackground !== background ||
        this._currentBackgroundVersion !== background.version ||
        this._currentTonemapping !== this._renderer.toneMapping
      ) {
        this._boxMesh.material.needsUpdate = true;

        this._currentBackground = background;
        this._currentBackgroundVersion = background.version;
        this._currentTonemapping = this._renderer.toneMapping;
      }

      this._boxMesh.layers.enableAll();

      // push to the pre-sorted opaque render list
      renderList.unshift(this._boxMesh, this._boxMesh.geometry, this._boxMesh.material, 0, 0, null);
    } else if (background && background.isTexture) {
      if (this._planeMesh === undefined) {
        this._planeMesh = new Mesh(
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

        this._planeMesh.geometry.deleteAttribute('normal');

        // add "map" material property so the renderer can evaluate it like for built-in materials
        Object.defineProperty(this._planeMesh.material, 'map', {
          get() {
            return this.uniforms.t2D.value;
          }
        });

        this._objects.update(this._planeMesh);
      }

      this._planeMesh.material.uniforms.t2D.value = background;
      this._planeMesh.material.uniforms.backgroundIntensity.value = scene.backgroundIntensity;
      this._planeMesh.material.toneMapped =
        ColorManagement.getTransfer(background.colorSpace) !== SRGBTransfer;

      if (background.matrixAutoUpdate === true) {
        background.updateMatrix();
      }

      this._planeMesh.material.uniforms.uvTransform.value.copy(background.matrix);

      if (
        this._currentBackground !== background ||
        this._currentBackgroundVersion !== background.version ||
        this._currentTonemapping !== this._renderer.toneMapping
      ) {
        this._planeMesh.material.needsUpdate = true;

        this._currentBackground = background;
        this._currentBackgroundVersion = background.version;
        this._currentTonemapping = this._renderer.toneMapping;
      }

      this._planeMesh.layers.enableAll();

      // push to the pre-sorted opaque render list
      renderList.unshift(
        this._planeMesh,
        this._planeMesh.geometry,
        this._planeMesh.material,
        0,
        0,
        null
      );
    }
  }

  _setClear(color, alpha) {
    color.getRGB(_rgb, getUnlitUniformColorSpace(this._renderer));

    this._state.buffers.color.setClear(_rgb.r, _rgb.g, _rgb.b, alpha, this._premultipliedAlpha);
  }

  getClearColor() {
    return this._clearColor;
  }

  setClearColor(color, alpha = 1) {
    this._clearColor.set(color);
    this._clearAlpha = alpha;
    this._setClear(this._clearColor, this._clearAlpha);
  }

  getClearAlpha() {
    return this._clearAlpha;
  }

  setClearAlpha(alpha) {
    this._clearAlpha = alpha;
    this._setClear(this._clearColor, this._clearAlpha);
  }
}

export { WebGLBackground };
