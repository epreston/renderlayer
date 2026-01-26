import { Color, Vector2, clamp } from '@renderlayer/math';
import { MeshStandardMaterial } from './MeshStandardMaterial.js';

class MeshPhysicalMaterial extends MeshStandardMaterial {
  type = 'MeshPhysicalMaterial';

  defines = {
    STANDARD: '',
    PHYSICAL: ''
  };

  anisotropyRotation = 0;
  anisotropyMap = null;

  clearcoatMap = null;
  clearcoatRoughness = 0.0;
  clearcoatRoughnessMap = null;
  clearcoatNormalScale = new Vector2(1, 1);
  clearcoatNormalMap = null;

  ior = 1.5;

  iridescenceMap = null;
  iridescenceIOR = 1.3;
  iridescenceThicknessRange = [100, 400];
  iridescenceThicknessMap = null;

  sheenColor = new Color(0x000000);
  sheenColorMap = null;
  sheenRoughness = 1.0;
  sheenRoughnessMap = null;

  transmissionMap = null;

  thickness = 0;
  thicknessMap = null;
  attenuationDistance = Infinity;
  attenuationColor = new Color(1, 1, 1);

  specularIntensity = 1.0;
  specularIntensityMap = null;
  specularColor = new Color(1, 1, 1);
  specularColorMap = null;

  _anisotropy = 0;
  _clearcoat = 0;
  _iridescence = 0;
  _sheen = 0.0;
  _transmission = 0;

  constructor(parameters) {
    super();

    this.setValues(parameters);
  }

  get isMeshPhysicalMaterial() {
    return true;
  }

  get anisotropy() {
    return this._anisotropy;
  }

  set anisotropy(value) {
    if (this._anisotropy > 0 !== value > 0) {
      this.version++;
    }

    this._anisotropy = value;
  }

  get clearcoat() {
    return this._clearcoat;
  }

  set clearcoat(value) {
    if (this._clearcoat > 0 !== value > 0) {
      this.version++;
    }

    this._clearcoat = value;
  }

  get iridescence() {
    return this._iridescence;
  }

  set iridescence(value) {
    if (this._iridescence > 0 !== value > 0) {
      this.version++;
    }

    this._iridescence = value;
  }

  get reflectivity() {
    return clamp((2.5 * (this.ior - 1)) / (this.ior + 1), 0, 1);
  }

  set reflectivity(reflectivity) {
    this.ior = (1 + 0.4 * reflectivity) / (1 - 0.4 * reflectivity);
  }

  get sheen() {
    return this._sheen;
  }

  set sheen(value) {
    if (this._sheen > 0 !== value > 0) {
      this.version++;
    }

    this._sheen = value;
  }

  get transmission() {
    return this._transmission;
  }

  set transmission(value) {
    if (this._transmission > 0 !== value > 0) {
      this.version++;
    }

    this._transmission = value;
  }

  /**
   * @param {MeshPhysicalMaterial} source
   * @returns {this}
   */
  copy(source) {
    super.copy(source);

    this.defines = {
      STANDARD: '',
      PHYSICAL: ''
    };

    this.anisotropy = source.anisotropy;
    this.anisotropyRotation = source.anisotropyRotation;
    this.anisotropyMap = source.anisotropyMap;

    this.clearcoat = source.clearcoat;
    this.clearcoatMap = source.clearcoatMap;
    this.clearcoatRoughness = source.clearcoatRoughness;
    this.clearcoatRoughnessMap = source.clearcoatRoughnessMap;
    this.clearcoatNormalMap = source.clearcoatNormalMap;
    this.clearcoatNormalScale.copy(source.clearcoatNormalScale);

    this.ior = source.ior;

    this.iridescence = source.iridescence;
    this.iridescenceMap = source.iridescenceMap;
    this.iridescenceIOR = source.iridescenceIOR;
    this.iridescenceThicknessRange = [...source.iridescenceThicknessRange];
    this.iridescenceThicknessMap = source.iridescenceThicknessMap;

    this.sheen = source.sheen;
    this.sheenColor.copy(source.sheenColor);
    this.sheenColorMap = source.sheenColorMap;
    this.sheenRoughness = source.sheenRoughness;
    this.sheenRoughnessMap = source.sheenRoughnessMap;

    this.transmission = source.transmission;
    this.transmissionMap = source.transmissionMap;

    this.thickness = source.thickness;
    this.thicknessMap = source.thicknessMap;
    this.attenuationDistance = source.attenuationDistance;
    this.attenuationColor.copy(source.attenuationColor);

    this.specularIntensity = source.specularIntensity;
    this.specularIntensityMap = source.specularIntensityMap;
    this.specularColor.copy(source.specularColor);
    this.specularColorMap = source.specularColorMap;

    return this;
  }
}

export { MeshPhysicalMaterial };
