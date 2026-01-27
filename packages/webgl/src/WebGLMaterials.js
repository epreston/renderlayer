import { BackSide } from '@renderlayer/shared';
import { getUnlitUniformColorSpace } from '@renderlayer/shaders';

class WebGLMaterials {
  #renderer;
  #properties;

  /** @param {import('@renderlayer/renderers').WebGLRenderer} renderer  */
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
      // } else if (material.isMeshLambertMaterial) {
      //   #refreshUniformsCommon(uniforms, material);
      // } else if (material.isMeshToonMaterial) {
      //   #refreshUniformsCommon(uniforms, material);
      //   #refreshUniformsToon(uniforms, material);
      // } else if (material.isMeshPhongMaterial) {
      //   #refreshUniformsCommon(uniforms, material);
      //   #refreshUniformsPhong(uniforms, material);
    } else if (material.isMeshStandardMaterial) {
      this.#refreshUniformsCommon(uniforms, material);
      this.#refreshUniformsStandard(uniforms, material);

      if (material.isMeshPhysicalMaterial) {
        this.#refreshUniformsPhysical(uniforms, material, transmissionRenderTarget);
      }
      // } else if (material.isMeshMatcapMaterial) {
      //   #refreshUniformsCommon(uniforms, material);
      //   #refreshUniformsMatcap(uniforms, material);
    } else if (material.isMeshDepthMaterial) {
      this.#refreshUniformsCommon(uniforms, material);
    } else if (material.isMeshDistanceMaterial) {
      this.#refreshUniformsCommon(uniforms, material);
      this.#refreshUniformsDistance(uniforms, material);
    } else if (material.isMeshNormalMaterial) {
      this.#refreshUniformsCommon(uniforms, material);
    } else if (material.isLineBasicMaterial) {
      this.#refreshUniformsLine(uniforms, material);

      //   if (material.isLineDashedMaterial) {
      //     #refreshUniformsDash(uniforms, material);
      //   }
    } else if (material.isPointsMaterial) {
      this.#refreshUniformsPoints(uniforms, material, pixelRatio, height);
    } else if (material.isSpriteMaterial) {
      this.#refreshUniformsSprites(uniforms, material);
    } else if (material.isShadowMaterial) {
      uniforms.color.value.copy(material.color);
      uniforms.opacity.value = material.opacity;
    } else if (material.isShaderMaterial) {
      material.uniformsNeedUpdate = false; // #15581
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

      uniforms.flipEnvMap.value =
        envMap.isCubeTexture && envMap.isRenderTargetTexture === false ? -1 : 1;

      uniforms.reflectivity.value = material.reflectivity;
      uniforms.ior.value = material.ior;
      uniforms.refractionRatio.value = material.refractionRatio;
    }

    if (material.lightMap) {
      uniforms.lightMap.value = material.lightMap;

      // artist-friendly light intensity scaling factor
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
      //uniforms.envMap.value = material.envMap; // part of uniforms common
      uniforms.envMapIntensity.value = material.envMapIntensity;
    }
  }

  #refreshUniformsPhysical(uniforms, material, transmissionRenderTarget) {
    uniforms.ior.value = material.ior; // also part of uniforms common

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

export { WebGLMaterials };
