import { Color, Matrix4, Vector2, Vector3 } from '@renderlayer/math';
import { UniformsLib } from '@renderlayer/shaders';

class UniformsCache {
  constructor() {
    this.lights = {}; // EP: use map ?
  }

  get(light) {
    const { lights } = this;

    if (lights[light.id] !== undefined) {
      return lights[light.id];
    }

    let uniforms;

    switch (light.type) {
      case 'DirectionalLight':
        uniforms = {
          direction: new Vector3(),
          color: new Color()
        };
        break;

      case 'SpotLight':
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

      case 'PointLight':
        uniforms = {
          position: new Vector3(),
          color: new Color(),
          distance: 0,
          decay: 0
        };
        break;

      case 'HemisphereLight':
        uniforms = {
          direction: new Vector3(),
          skyColor: new Color(),
          groundColor: new Color()
        };
        break;

      case 'RectAreaLight':
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
  constructor() {
    this.lights = {}; // EP: use map ?
  }

  get(light) {
    const { lights } = this;

    if (lights[light.id] !== undefined) {
      return lights[light.id];
    }

    let uniforms;

    switch (light.type) {
      case 'DirectionalLight':
        uniforms = {
          shadowBias: 0,
          shadowNormalBias: 0,
          shadowRadius: 1,
          shadowMapSize: new Vector2()
        };
        break;

      case 'SpotLight':
        uniforms = {
          shadowBias: 0,
          shadowNormalBias: 0,
          shadowRadius: 1,
          shadowMapSize: new Vector2()
        };
        break;

      case 'PointLight':
        uniforms = {
          shadowBias: 0,
          shadowNormalBias: 0,
          shadowRadius: 1,
          shadowMapSize: new Vector2(),
          shadowCameraNear: 1,
          shadowCameraFar: 1000
        };
        break;

      // TODO: set RectAreaLight shadow uniforms
    }

    lights[light.id] = uniforms;

    return uniforms;
  }
}

let nextVersion = 0;

function _shadowCastingAndTexturingLightsFirst(lightA, lightB) {
  return (
    (lightB.castShadow ? 2 : 0) -
    (lightA.castShadow ? 2 : 0) +
    (lightB.map ? 1 : 0) -
    (lightA.map ? 1 : 0)
  );
}

const _vector3 = /*@__PURE__*/ new Vector3();
const _matrix4 = /*@__PURE__*/ new Matrix4();
const _matrix42 = /*@__PURE__*/ new Matrix4();

class WebGLLights {
  // EP: params not used
  constructor(extensions, capabilities) {
    this._cache = new UniformsCache();
    this._shadowCache = new ShadowUniformsCache();

    this.state = {
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

    // ordering : [shadow casting + map texturing, map texturing, shadow casting, none ]
    lights.sort(_shadowCastingAndTexturingLightsFirst);

    // artist-friendly light intensity scaling factor
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
        const uniforms = this._cache.get(light);

        uniforms.color.copy(light.color).multiplyScalar(light.intensity * scaleFactor);

        if (light.castShadow) {
          const shadow = light.shadow;
          const shadowUniforms = this._shadowCache.get(light);

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
        const uniforms = this._cache.get(light);

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

          // make sure the lightMatrix is up to date
          // TODO : do it if required only
          shadow.updateMatrices(light);

          if (light.castShadow) numSpotShadowsWithMaps++;
        }

        this.state.spotLightMatrix[spotLength] = shadow.matrix;

        if (light.castShadow) {
          const shadowUniforms = this._shadowCache.get(light);

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
        const uniforms = this._cache.get(light);

        uniforms.color.copy(color).multiplyScalar(intensity);

        uniforms.halfWidth.set(light.width * 0.5, 0.0, 0.0);
        uniforms.halfHeight.set(0.0, light.height * 0.5, 0.0);

        this.state.rectArea[rectAreaLength] = uniforms;

        rectAreaLength++;
      } else if (light.isPointLight) {
        const uniforms = this._cache.get(light);

        uniforms.color.copy(light.color).multiplyScalar(light.intensity * scaleFactor);
        uniforms.distance = light.distance;
        uniforms.decay = light.decay;

        if (light.castShadow) {
          const shadow = light.shadow;
          const shadowUniforms = this._shadowCache.get(light);

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
        const uniforms = this._cache.get(light);

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

    if (
      hash.directionalLength !== directionalLength ||
      hash.pointLength !== pointLength ||
      hash.spotLength !== spotLength ||
      hash.rectAreaLength !== rectAreaLength ||
      hash.hemiLength !== hemiLength ||
      hash.numDirectionalShadows !== numDirectionalShadows ||
      hash.numPointShadows !== numPointShadows ||
      hash.numSpotShadows !== numSpotShadows ||
      hash.numSpotMaps !== numSpotMaps ||
      hash.numLightProbes !== numLightProbes
    ) {
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

      this.state.version = nextVersion++;
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

        // extract local rotation of light to derive width/height half vectors
        _matrix42.identity();
        _matrix4.copy(light.matrixWorld);
        _matrix4.premultiply(viewMatrix);
        _matrix42.extractRotation(_matrix4);

        uniforms.halfWidth.set(light.width * 0.5, 0.0, 0.0);
        uniforms.halfHeight.set(0.0, light.height * 0.5, 0.0);

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

export { WebGLLights };
