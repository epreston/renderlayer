import { clamp, euclideanModulo, lerp } from './MathUtils.js';
import { ColorManagement, SRGBToLinear, LinearToSRGB } from './ColorManagement.js';

const SRGBColorSpace = 'srgb';

const _hslA = { h: 0, s: 0, l: 0 };
const _hslB = { h: 0, s: 0, l: 0 };

function hue2rgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);

  return p;
}

class Color {
  constructor(r, g, b) {
    this.isColor = true;

    this.r = 1;
    this.g = 1;
    this.b = 1;

    return this.set(r, g, b);
  }

  set(r, g, b) {
    if (g === undefined && b === undefined) {
      // r is Color, hex or string

      const value = r;

      if (value && value.isColor) {
        this.copy(value);
      } else if (typeof value === 'number') {
        this.setHex(value);
      } else if (typeof value === 'string') {
        this.setStyle(value);
      }
    } else {
      this.setRGB(r, g, b);
    }

    return this;
  }

  setScalar(scalar) {
    this.r = scalar;
    this.g = scalar;
    this.b = scalar;

    return this;
  }

  setHex(hex, colorSpace = SRGBColorSpace) {
    hex = Math.floor(hex);

    this.r = ((hex >> 16) & 255) / 255;
    this.g = ((hex >> 8) & 255) / 255;
    this.b = (hex & 255) / 255;

    ColorManagement.toWorkingColorSpace(this, colorSpace);

    return this;
  }

  setRGB(r, g, b, colorSpace = ColorManagement.workingColorSpace) {
    this.r = r;
    this.g = g;
    this.b = b;

    ColorManagement.toWorkingColorSpace(this, colorSpace);

    return this;
  }

  setHSL(h, s, l, colorSpace = ColorManagement.workingColorSpace) {
    // h,s,l ranges are in 0.0 - 1.0
    h = euclideanModulo(h, 1);
    s = clamp(s, 0, 1);
    l = clamp(l, 0, 1);

    if (s === 0) {
      this.r = this.g = this.b = l;
    } else {
      const p = l <= 0.5 ? l * (1 + s) : l + s - l * s;
      const q = 2 * l - p;

      this.r = hue2rgb(q, p, h + 1 / 3);
      this.g = hue2rgb(q, p, h);
      this.b = hue2rgb(q, p, h - 1 / 3);
    }

    ColorManagement.toWorkingColorSpace(this, colorSpace);

    return this;
  }

  setStyle(style, colorSpace = SRGBColorSpace) {
    function handleAlpha(string) {
      if (string === undefined) return;

      if (parseFloat(string) < 1) {
        console.warn(`Color: Alpha component of ${style} will be ignored.`);
      }
    }

    let m;

    if ((m = /^(\w+)\(([^)]*)\)/.exec(style))) {
      // rgb / hsl

      let color;
      const name = m[1];
      const components = m[2];

      switch (name) {
        case 'rgb':
        case 'rgba':
          if (
            (color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
              components
            ))
          ) {
            // rgb(255,0,0) rgba(255,0,0,0.5)

            handleAlpha(color[4]);

            return this.setRGB(
              Math.min(255, parseInt(color[1], 10)) / 255,
              Math.min(255, parseInt(color[2], 10)) / 255,
              Math.min(255, parseInt(color[3], 10)) / 255,
              colorSpace
            );
          }

          if (
            (color = /^\s*(\d+)%\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
              components
            ))
          ) {
            // rgb(100%,0%,0%) rgba(100%,0%,0%,0.5)

            handleAlpha(color[4]);

            return this.setRGB(
              Math.min(100, parseInt(color[1], 10)) / 100,
              Math.min(100, parseInt(color[2], 10)) / 100,
              Math.min(100, parseInt(color[3], 10)) / 100,
              colorSpace
            );
          }

          break;

        case 'hsl':
        case 'hsla':
          if (
            (color =
              /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)%\s*,\s*(\d*\.?\d+)%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
                components
              ))
          ) {
            // hsl(120,50%,50%) hsla(120,50%,50%,0.5)

            handleAlpha(color[4]);

            return this.setHSL(
              parseFloat(color[1]) / 360,
              parseFloat(color[2]) / 100,
              parseFloat(color[3]) / 100,
              colorSpace
            );
          }

          break;

        default:
          console.warn(`Color: Unknown color model ${style}`);
      }
    } else if ((m = /^#([A-Fa-f\d]+)$/.exec(style))) {
      // hex color

      const hex = m[1];
      const size = hex.length;

      if (size === 3) {
        // #ff0
        return this.setRGB(
          parseInt(hex.charAt(0), 16) / 15,
          parseInt(hex.charAt(1), 16) / 15,
          parseInt(hex.charAt(2), 16) / 15,
          colorSpace
        );
      } else if (size === 6) {
        // #ff0000
        return this.setHex(parseInt(hex, 16), colorSpace);
      } else {
        console.warn(`Color: Invalid hex color ${style}`);
      }
    }

    return this;
  }

  /** @returns {this} */
  clone() {
    // @ts-ignore
    return new this.constructor(this.r, this.g, this.b);
  }

  copy(color) {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;

    return this;
  }

  copySRGBToLinear(color) {
    this.r = SRGBToLinear(color.r);
    this.g = SRGBToLinear(color.g);
    this.b = SRGBToLinear(color.b);

    return this;
  }

  copyLinearToSRGB(color) {
    this.r = LinearToSRGB(color.r);
    this.g = LinearToSRGB(color.g);
    this.b = LinearToSRGB(color.b);

    return this;
  }

  convertSRGBToLinear() {
    this.copySRGBToLinear(this);

    return this;
  }

  convertLinearToSRGB() {
    this.copyLinearToSRGB(this);

    return this;
  }

  getHex(colorSpace = SRGBColorSpace) {
    ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace);

    return (
      Math.round(clamp(_color.r * 255, 0, 255)) * 65536 +
      Math.round(clamp(_color.g * 255, 0, 255)) * 256 +
      Math.round(clamp(_color.b * 255, 0, 255))
    );
  }

  getHexString(colorSpace = SRGBColorSpace) {
    return `000000${this.getHex(colorSpace).toString(16)}`.slice(-6);
  }

  getHSL(target, colorSpace = ColorManagement.workingColorSpace) {
    // h,s,l ranges are in 0.0 - 1.0

    ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace);

    const r = _color.r;
    const g = _color.g;
    const b = _color.b;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let hue;
    let saturation;
    const lightness = (min + max) / 2.0;

    if (min === max) {
      hue = 0;
      saturation = 0;
    } else {
      const delta = max - min;

      saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min);

      switch (max) {
        case r:
          hue = (g - b) / delta + (g < b ? 6 : 0);
          break;
        case g:
          hue = (b - r) / delta + 2;
          break;
        case b:
          hue = (r - g) / delta + 4;
          break;
      }

      hue /= 6;
    }

    target.h = hue;
    target.s = saturation;
    target.l = lightness;

    return target;
  }

  getRGB(target, colorSpace = ColorManagement.workingColorSpace) {
    ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace);

    target.r = _color.r;
    target.g = _color.g;
    target.b = _color.b;

    return target;
  }

  getStyle(colorSpace = SRGBColorSpace) {
    ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace);

    const r = _color.r;
    const g = _color.g;
    const b = _color.b;

    if (colorSpace !== SRGBColorSpace) {
      // Requires CSS Color Module Level 4 (https://www.w3.org/TR/css-color-4/).
      return `color(${colorSpace} ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)})`;
    }

    return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
  }

  offsetHSL(h, s, l) {
    this.getHSL(_hslA);

    return this.setHSL(_hslA.h + h, _hslA.s + s, _hslA.l + l);
  }

  add(color) {
    this.r += color.r;
    this.g += color.g;
    this.b += color.b;

    return this;
  }

  addColors(color1, color2) {
    this.r = color1.r + color2.r;
    this.g = color1.g + color2.g;
    this.b = color1.b + color2.b;

    return this;
  }

  addScalar(s) {
    this.r += s;
    this.g += s;
    this.b += s;

    return this;
  }

  sub(color) {
    this.r = Math.max(0, this.r - color.r);
    this.g = Math.max(0, this.g - color.g);
    this.b = Math.max(0, this.b - color.b);

    return this;
  }

  multiply(color) {
    this.r *= color.r;
    this.g *= color.g;
    this.b *= color.b;

    return this;
  }

  multiplyScalar(s) {
    this.r *= s;
    this.g *= s;
    this.b *= s;

    return this;
  }

  lerp(color, alpha) {
    this.r += (color.r - this.r) * alpha;
    this.g += (color.g - this.g) * alpha;
    this.b += (color.b - this.b) * alpha;

    return this;
  }

  lerpColors(color1, color2, alpha) {
    this.r = color1.r + (color2.r - color1.r) * alpha;
    this.g = color1.g + (color2.g - color1.g) * alpha;
    this.b = color1.b + (color2.b - color1.b) * alpha;

    return this;
  }

  lerpHSL(color, alpha) {
    this.getHSL(_hslA);
    color.getHSL(_hslB);

    const h = lerp(_hslA.h, _hslB.h, alpha);
    const s = lerp(_hslA.s, _hslB.s, alpha);
    const l = lerp(_hslA.l, _hslB.l, alpha);

    this.setHSL(h, s, l);

    return this;
  }

  setFromVector3(v) {
    this.r = v.x;
    this.g = v.y;
    this.b = v.z;

    return this;
  }

  applyMatrix3(m) {
    const r = this.r;
    const g = this.g;
    const b = this.b;
    const e = m.elements;

    this.r = e[0] * r + e[3] * g + e[6] * b;
    this.g = e[1] * r + e[4] * g + e[7] * b;
    this.b = e[2] * r + e[5] * g + e[8] * b;

    return this;
  }

  equals(c) {
    return c.r === this.r && c.g === this.g && c.b === this.b;
  }

  fromArray(array, offset = 0) {
    this.r = array[offset];
    this.g = array[offset + 1];
    this.b = array[offset + 2];

    return this;
  }

  toArray(array = [], offset = 0) {
    array[offset] = this.r;
    array[offset + 1] = this.g;
    array[offset + 2] = this.b;

    return array;
  }

  fromBufferAttribute(attribute, index) {
    this.r = attribute.getX(index);
    this.g = attribute.getY(index);
    this.b = attribute.getZ(index);

    return this;
  }

  toJSON() {
    return this.getHex();
  }

  *[Symbol.iterator]() {
    yield this.r;
    yield this.g;
    yield this.b;
  }
}

const _color = /*@__PURE__*/ new Color();

export { Color };
