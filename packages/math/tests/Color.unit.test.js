import { afterEach, beforeAll, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { BufferAttribute } from '@renderlayer/buffers';
import { DisplayP3ColorSpace, SRGBColorSpace } from '@renderlayer/shared';
import { ColorManagement } from '../src/ColorManagement.js';
import { eps } from './math-constants.js';

import { Color } from '../src/Color.js';

describe('Maths', () => {
  describe('Color', () => {
    const colorManagementEnabled = ColorManagement.enabled;

    afterEach(() => {
      ColorManagement.enabled = colorManagementEnabled;
    });

    test('constructor', () => {
      ColorManagement.enabled = false;

      // default ctor
      let c = new Color();
      expect(c.r).toBeTruthy();
      expect(c.g).toBeTruthy();
      expect(c.b).toBeTruthy();

      // rgb ctor
      c = new Color(1, 1, 1);
      expect(c.r == 1).toBeTruthy();
      expect(c.g == 1).toBeTruthy();
      expect(c.b == 1).toBeTruthy();
    });

    test('isColor', () => {
      ColorManagement.enabled = false;

      const a = new Color();
      expect(a.isColor === true).toBeTruthy();

      const b = new Object();

      // @ts-ignore
      expect(!b.isColor).toBeTruthy();
    });

    test('set', () => {
      ColorManagement.enabled = false;

      const a = new Color();
      const b = new Color(0.5, 0, 0);
      const c = new Color(0xff0000);
      const d = new Color(0, 1.0, 0);

      a.set(b);
      expect(a.equals(b)).toBeTruthy();

      a.set(0xff0000);
      expect(a.equals(c)).toBeTruthy();

      a.set('rgb(0,255,0)');
      expect(a.equals(d)).toBeTruthy();
    });

    test('setScalar', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      c.setScalar(0.5);
      expect(c.r === 0.5).toBeTruthy();
      expect(c.g === 0.5).toBeTruthy();
      expect(c.b === 0.5).toBeTruthy();
    });

    test('setHex', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      c.setHex(0xfa8072);
      expect(c.getHex() === 0xfa8072).toBeTruthy();
      expect(c.r === 0xfa / 0xff).toBeTruthy();
      expect(c.g === 0x80 / 0xff).toBeTruthy();
      expect(c.b === 0x72 / 0xff).toBeTruthy();
    });

    test('setRGB', () => {
      ColorManagement.enabled = true;

      const c = new Color();

      c.setRGB(0.3, 0.5, 0.7);

      // srgb-linear
      expect(c.r).toBeCloseTo(0.3, 2);
      expect(c.g).toBeCloseTo(0.5, 2);
      expect(c.b).toBeCloseTo(0.7, 2);

      c.setRGB(0.3, 0.5, 0.7, SRGBColorSpace);

      // srgb
      expect(c.r).toBeCloseTo(0.073, 3);
      expect(c.g).toBeCloseTo(0.214, 3);
      expect(c.b).toBeCloseTo(0.448, 3);

      c.setRGB(0.614, 0.731, 0.843, DisplayP3ColorSpace);

      // display-p3, in gamut
      expect(c.r).toBeCloseTo(0.3, 2);
      expect(c.g).toBeCloseTo(0.5, 2);
      expect(c.b).toBeCloseTo(0.7, 2);

      c.setRGB(1.0, 0.5, 0.0, DisplayP3ColorSpace);

      // display-p3, out of gamut
      expect(c.r).toBeCloseTo(1.177, 3);
      expect(c.g).toBeCloseTo(0.181, 3);
      expect(c.b).toBeCloseTo(-0.036, 3);
    });

    test('setHSL', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      const hsl = { h: 0, s: 0, l: 0 };

      c.setHSL(0.75, 1.0, 0.25);
      c.getHSL(hsl);

      expect(hsl.h === 0.75).toBeTruthy();
      expect(hsl.s === 1.0).toBeTruthy();
      expect(hsl.l === 0.25).toBeTruthy();
    });

    test('setStyle', () => {
      ColorManagement.enabled = false;

      const a = new Color();

      let b = new Color(8 / 255, 25 / 255, 178 / 255);
      a.setStyle('rgb(8,25,178)');
      expect(a.equals(b)).toBeTruthy();

      b = new Color(8 / 255, 25 / 255, 178 / 255);
      a.setStyle('rgba(8,25,178,200)');
      expect(a.equals(b)).toBeTruthy();

      let hsl = { h: 0, s: 0, l: 0 };
      a.setStyle('hsl(270,50%,75%)');
      a.getHSL(hsl);

      expect(hsl.h == 0.75).toBeTruthy();
      expect(hsl.s == 0.5).toBeTruthy();
      expect(hsl.l == 0.75).toBeTruthy();

      hsl = { h: 0, s: 0, l: 0 };
      a.setStyle('hsl(270,50%,75%)');
      a.getHSL(hsl);

      expect(hsl.h == 0.75).toBeTruthy();
      expect(hsl.s == 0.5).toBeTruthy();
      expect(hsl.l == 0.75).toBeTruthy();

      a.setStyle('#F8A');
      expect(a.r == 0xff / 255).toBeTruthy();
      expect(a.g == 0x88 / 255).toBeTruthy();
      expect(a.b == 0xaa / 255).toBeTruthy();

      a.setStyle('#F8ABC1');
      expect(a.r == 0xf8 / 255).toBeTruthy();
      expect(a.g == 0xab / 255).toBeTruthy();
      expect(a.b == 0xc1 / 255).toBeTruthy();

      a.setStyle('#f0f8ff');
      expect(a.r == 0xf0 / 255).toBeTruthy();
      expect(a.g == 0xf8 / 255).toBeTruthy();
      expect(a.b == 0xff / 255).toBeTruthy();
    });

    test('clone', () => {
      ColorManagement.enabled = false;

      const c = new Color('#008080');
      const c2 = c.clone();

      expect(c2.getHex() == 0x008080).toBeTruthy();
    });

    test('copy', () => {
      ColorManagement.enabled = false;

      const a = new Color('#008080');
      const b = new Color();

      b.copy(a);

      expect(b.r == 0x00 / 255).toBeTruthy();
      expect(b.g == 0x80 / 255).toBeTruthy();
      expect(b.b == 0x80 / 255).toBeTruthy();
    });

    test('copySRGBToLinear', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      const c2 = new Color();

      c2.setRGB(0.3, 0.5, 0.9);
      c.copySRGBToLinear(c2);

      expect(c.r).toBeCloseTo(0.07, 2);
      expect(c.g).toBeCloseTo(0.21, 2);
      expect(c.b).toBeCloseTo(0.79, 2);
    });

    test('copyLinearToSRGB', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      const c2 = new Color();

      c2.setRGB(0.09, 0.25, 0.81);
      c.copyLinearToSRGB(c2);

      expect(c.r).toBeCloseTo(0.33, 2);
      expect(c.g).toBeCloseTo(0.54, 2);
      expect(c.b).toBeCloseTo(0.91, 2);
    });

    test('convertSRGBToLinear', () => {
      ColorManagement.enabled = false;

      const c = new Color();

      c.setRGB(0.3, 0.5, 0.9);
      c.convertSRGBToLinear();

      expect(c.r).toBeCloseTo(0.07, 2);
      expect(c.g).toBeCloseTo(0.21, 2);
      expect(c.b).toBeCloseTo(0.79, 2);
    });

    test('convertLinearToSRGB', () => {
      ColorManagement.enabled = false;

      const c = new Color();

      c.setRGB(4, 9, 16);
      c.convertLinearToSRGB();

      expect(c.r).toBeCloseTo(1.82, 2);
      expect(c.g).toBeCloseTo(2.58, 2);
      expect(c.b).toBeCloseTo(3.29, 2);
    });

    test('getHex', () => {
      ColorManagement.enabled = false;

      const c = new Color('#ff0000');
      const res = c.getHex();

      expect(res == 0xff0000).toBeTruthy();
    });

    test('getHexString', () => {
      ColorManagement.enabled = false;

      const c = new Color(0xff6347);
      const res = c.getHexString();

      expect(res == 'ff6347').toBeTruthy();
    });

    test('getHSL', () => {
      ColorManagement.enabled = false;

      const c = new Color(0x80ffff);
      const hsl = { h: 0, s: 0, l: 0 };

      c.getHSL(hsl);

      expect(hsl.h == 0.5).toBeTruthy();
      expect(hsl.s == 1.0).toBeTruthy();
      expect(Math.round(hsl.l * 100.0) / 100 == 0.75).toBeTruthy();
    });

    test('getRGB', () => {
      ColorManagement.enabled = true;

      const c = new Color('#dda0dd');
      const t = { r: 0, g: 0, b: 0 };

      c.getRGB(t);

      // srgb-linear
      expect(t.r).toBeCloseTo(0.723, 3);
      expect(t.g).toBeCloseTo(0.352, 3);
      expect(t.b).toBeCloseTo(0.723, 3);

      c.getRGB(t, SRGBColorSpace);

      // srgb
      expect(t.r).toBeCloseTo(221 / 255, 3);
      expect(t.g).toBeCloseTo(160 / 255, 3);
      expect(t.b).toBeCloseTo(221 / 255, 3);

      c.getRGB(t, DisplayP3ColorSpace);

      // display-p3
      expect(t.r).toBeCloseTo(0.831, 3);
      expect(t.g).toBeCloseTo(0.637, 3);
      expect(t.b).toBeCloseTo(0.852, 3);
    });

    test('getStyle', () => {
      ColorManagement.enabled = true;

      const c = new Color('#dda0dd');

      expect(c.getStyle()).toBe('rgb(221,160,221)');
      expect(c.getStyle(DisplayP3ColorSpace)).toBe('color(display-p3 0.831 0.637 0.852)');
    });

    test('offsetHSL', () => {
      ColorManagement.enabled = false;

      const a = new Color('hsl(120,50%,50%)');
      const b = new Color(0.36, 0.84, 0.648);

      a.offsetHSL(0.1, 0.1, 0.1);

      expect(Math.abs(a.r - b.r) <= eps).toBeTruthy();
      expect(Math.abs(a.g - b.g) <= eps).toBeTruthy();
      expect(Math.abs(a.b - b.b) <= eps).toBeTruthy();
    });

    test('add', () => {
      ColorManagement.enabled = false;

      const a = new Color(0x0000ff);
      const b = new Color(0xff0000);
      const c = new Color(0xff00ff);

      a.add(b);

      expect(a.equals(c)).toBeTruthy();
    });

    test('addColors', () => {
      ColorManagement.enabled = false;

      const a = new Color(0x0000ff);
      const b = new Color(0xff0000);
      const c = new Color(0xff00ff);
      const d = new Color();

      d.addColors(a, b);

      expect(d.equals(c)).toBeTruthy();
    });

    test('addScalar', () => {
      ColorManagement.enabled = false;

      const a = new Color(0.1, 0.0, 0.0);
      const b = new Color(0.6, 0.5, 0.5);

      a.addScalar(0.5);

      expect(a.equals(b)).toBeTruthy();
    });

    test('sub', () => {
      ColorManagement.enabled = false;

      const a = new Color(0x0000cc);
      const b = new Color(0xff0000);
      const c = new Color(0x0000aa);

      a.sub(b);
      expect(a.getHex()).toStrictEqual(0xcc);

      a.sub(c);
      expect(a.getHex()).toStrictEqual(0x22);
    });

    test('multiply', () => {
      ColorManagement.enabled = false;

      const a = new Color(1, 0, 0.5);
      const b = new Color(0.5, 1, 0.5);
      const c = new Color(0.5, 0, 0.25);

      a.multiply(b);

      expect(a.equals(c)).toBeTruthy();
    });

    test('multiplyScalar', () => {
      ColorManagement.enabled = false;

      const a = new Color(0.25, 0, 0.5);
      const b = new Color(0.5, 0, 1);

      a.multiplyScalar(2);

      expect(a.equals(b)).toBeTruthy();
    });

    test('lerp', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      const c2 = new Color();

      c.setRGB(0, 0, 0);
      c.lerp(c2, 0.2);

      expect(c.r).toBeCloseTo(0.2);
      expect(c.g).toBeCloseTo(0.2);
      expect(c.b).toBeCloseTo(0.2);
    });

    test('lerpColors', () => {
      const c1 = new Color(0.1, 0.2, 0.3);
      const c2 = new Color(0.5, 0.6, 0.7);
      const c3 = new Color();

      c3.lerpColors(c1, c2, 0);
      expect(c3.r).to.equal(0.1);
      expect(c3.g).to.equal(0.2);
      expect(c3.b).to.equal(0.3);

      c3.lerpColors(c1, c2, 0.5);
      expect(c3.r).to.be.closeTo(0.3, 0.0001);
      expect(c3.g).to.be.closeTo(0.4, 0.0001);
      expect(c3.b).to.be.closeTo(0.5, 0.0001);

      c3.lerpColors(c1, c2, 1);
      expect(c3.r).to.equal(0.5);
      expect(c3.g).to.equal(0.6);
      expect(c3.b).to.equal(0.7);
    });

    test('lerpHSL', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      const c2 = new Color();

      c.setRGB(0, 0, 0);
      c.lerpHSL(c2, 0.2);

      expect(c.r).toBeCloseTo(0.2);
      expect(c.g).toBeCloseTo(0.2);
      expect(c.b).toBeCloseTo(0.2);
    });

    test('equals', () => {
      ColorManagement.enabled = false;

      const a = new Color(0.5, 0.0, 1.0);
      const b = new Color(0.5, 1.0, 0.0);

      expect(a.r).toStrictEqual(b.r);
      expect(a.g).not.toStrictEqual(b.g);
      expect(a.b).not.toStrictEqual(b.b);

      expect(a.equals(b)).toBeFalsy();
      expect(b.equals(a)).toBeFalsy();

      a.copy(b);
      expect(a.r).toStrictEqual(b.r);
      expect(a.g).toStrictEqual(b.g);
      expect(a.b).toStrictEqual(b.b);

      expect(a.equals(b)).toBeTruthy();
      expect(b.equals(a)).toBeTruthy();
    });

    test('fromArray', () => {
      ColorManagement.enabled = false;

      const a = new Color();
      const array = [0.5, 0.6, 0.7, 0, 1, 0];

      a.fromArray(array);
      expect(a.r).toStrictEqual(0.5);
      expect(a.g).toStrictEqual(0.6);
      expect(a.b).toStrictEqual(0.7);

      a.fromArray(array, 3);
      expect(a.r).toStrictEqual(0);
      expect(a.g).toStrictEqual(1);
      expect(a.b).toStrictEqual(0);
    });

    test('toArray', () => {
      ColorManagement.enabled = false;

      const r = 0.5,
        g = 1.0,
        b = 0.0;
      const a = new Color(r, g, b);

      let array = a.toArray();
      expect(array[0]).toStrictEqual(r);
      expect(array[1]).toStrictEqual(g);
      expect(array[2]).toStrictEqual(b);

      array = [];
      a.toArray(array);
      expect(array[0]).toStrictEqual(r);
      expect(array[1]).toStrictEqual(g);
      expect(array[2]).toStrictEqual(b);

      array = [];
      a.toArray(array, 1);
      expect(array[0]).toBeUndefined();
      expect(array[1]).toStrictEqual(r);
      expect(array[2]).toStrictEqual(g);
      expect(array[3]).toStrictEqual(b);
    });

    test('fromBufferAttribute', () => {
      const a = new Color();
      const attr = new BufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6]), 3);

      a.fromBufferAttribute(attr, 0);
      expect(a.r).toStrictEqual(1);
      expect(a.g).toStrictEqual(2);
      expect(a.b).toStrictEqual(3);

      a.fromBufferAttribute(attr, 1);
      expect(a.r).toStrictEqual(4);
      expect(a.g).toStrictEqual(5);
      expect(a.b).toStrictEqual(6);
    });

    test('toJSON', () => {
      ColorManagement.enabled = false;

      const a = new Color(0.0, 0.0, 0.0);
      const b = new Color(0.0, 0.5, 0.0);
      const c = new Color(1.0, 0.0, 0.0);
      const d = new Color(1.0, 1.0, 1.0);

      expect(a.toJSON()).toStrictEqual(0x000000);
      expect(b.toJSON()).toStrictEqual(0x008000);
      expect(c.toJSON()).toStrictEqual(0xff0000);
      expect(d.toJSON()).toStrictEqual(0xffffff);
    });

    test('copyHex', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      const c2 = new Color(0xf5fffa);

      c.copy(c2);

      expect(c.getHex() == c2.getHex()).toBeTruthy();
    });

    test('copyColorString', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      const c2 = new Color('#3fdefa');

      c.copy(c2);

      expect(c.getHex() == c2.getHex()).toBeTruthy();
    });

    test('setWithNum', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      c.set(0xff0000);

      expect(c.r === 1).toBeTruthy();
      expect(c.g === 0).toBeTruthy();
      expect(c.b === 0).toBeTruthy();
    });

    test('setWithString', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      c.set('#c0c0c0');

      expect(c.getHex() == 0xc0c0c0).toBeTruthy();
    });

    test('setStyleRGBRed', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      c.setStyle('rgb(255,0,0)');

      expect(c.r === 1).toBeTruthy();
      expect(c.g === 0).toBeTruthy();
      expect(c.b === 0).toBeTruthy();
    });

    test('setStyleRGBARed', () => {
      ColorManagement.enabled = false;

      const c = new Color();

      c.setStyle('rgba(255,0,0,0.5)');
      expect('Alpha component of rgba').toHaveBeenWarned();

      expect(c.r === 1).toBeTruthy();
      expect(c.g === 0).toBeTruthy();
      expect(c.b === 0).toBeTruthy();
    });

    test('setStyleRGBRedWithSpaces', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      c.setStyle('rgb( 255 , 0,   0 )');

      expect(c.r === 1).toBeTruthy();
      expect(c.g === 0).toBeTruthy();
      expect(c.b === 0).toBeTruthy();
    });

    test('setStyleRGBARedWithSpaces', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      c.setStyle('rgba( 255,  0,  0  , 1 )');

      expect(c.r === 1).toBeTruthy();
      expect(c.g === 0).toBeTruthy();
      expect(c.b === 0).toBeTruthy();
    });

    test('setStyleRGBPercent', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      c.setStyle('rgb(100%,50%,10%)');

      expect(c.r == 1).toBeTruthy();
      expect(c.g == 0.5).toBeTruthy();
      expect(c.b == 0.1).toBeTruthy();
    });

    test('setStyleRGBAPercent', () => {
      ColorManagement.enabled = false;

      const c = new Color();

      c.setStyle('rgba(100%,50%,10%, 0.5)');
      expect('Alpha component of rgba').toHaveBeenWarned();

      expect(c.r == 1).toBeTruthy();
      expect(c.g == 0.5).toBeTruthy();
      expect(c.b == 0.1).toBeTruthy();
    });

    test('setStyleRGBPercentWithSpaces', () => {
      ColorManagement.enabled = false;

      const c = new Color();

      c.setStyle('rgb( 100% ,50%  , 10% )');

      expect(c.r == 1).toBeTruthy();
      expect(c.g == 0.5).toBeTruthy();
      expect(c.b == 0.1).toBeTruthy();
    });

    test('setStyleRGBAPercentWithSpaces', () => {
      ColorManagement.enabled = false;

      const c = new Color();

      c.setStyle('rgba( 100%, 50%, 10%, 0.5 )');
      expect('Alpha component of rgba').toHaveBeenWarned();

      expect(c.r == 1).toBeTruthy();
      expect(c.g == 0.5).toBeTruthy();
      expect(c.b == 0.1).toBeTruthy();
    });

    test('setStyleHSLRed', () => {
      ColorManagement.enabled = false;

      const c = new Color();

      c.setStyle('hsl(360,100%,50%)');

      expect(c.r == 1).toBeTruthy();
      expect(c.g === 0).toBeTruthy();
      expect(c.b === 0).toBeTruthy();
    });

    test('setStyleHSLARed', () => {
      ColorManagement.enabled = false;

      const c = new Color();

      c.setStyle('hsla( 360, 100%, 50%, 0.5 )');
      expect('Alpha component of hsla').toHaveBeenWarned();

      expect(c.r == 1).toBeTruthy();
      expect(c.g === 0).toBeTruthy();
      expect(c.b === 0).toBeTruthy();
    });

    test('setStyleHSLRedWithSpaces', () => {
      ColorManagement.enabled = false;

      const c = new Color();

      c.setStyle('hsl( 360, 100%, 50% )');

      expect(c.r == 1).toBeTruthy();
      expect(c.g === 0).toBeTruthy();
      expect(c.b === 0).toBeTruthy();
    });

    test('setStyleHSLARedWithSpaces', () => {
      ColorManagement.enabled = false;

      const c = new Color();

      c.setStyle('hsla( 360, 100%, 50%, 0.5 )');
      expect('Alpha component of hsla').toHaveBeenWarned();

      expect(c.r == 1).toBeTruthy();
      expect(c.g === 0).toBeTruthy();
      expect(c.b === 0).toBeTruthy();
    });

    test('setStyleHSLRedWithDecimals', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      c.setStyle('hsl( 360, 100.0%, 50.0% )');
      expect(c.r == 1).toBeTruthy();
      expect(c.g === 0).toBeTruthy();
      expect(c.b === 0).toBeTruthy();
    });

    test('setStyleHSLARedWithDecimals', () => {
      ColorManagement.enabled = false;

      const c = new Color();

      c.setStyle('hsla( 360, 100.0%, 50.0%, 0.5 )');
      expect('Alpha component of hsla').toHaveBeenWarned();

      expect(c.r === 1).toBeTruthy();
      expect(c.g === 0).toBeTruthy();
      expect(c.b === 0).toBeTruthy();
    });

    test('setStyleHexSkyBlue', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      c.setStyle('#87CEEB');

      expect(c.getHex() == 0x87ceeb).toBeTruthy();
    });

    test('setStyleHexSkyBlueMixed', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      c.setStyle('#87cEeB');

      expect(c.getHex() == 0x87ceeb).toBeTruthy();
    });

    test('setStyleHex2Olive', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      c.setStyle('#F00');

      expect(c.getHex() == 0xff0000).toBeTruthy();
    });

    test('setStyleHex2OliveMixed', () => {
      ColorManagement.enabled = false;

      const c = new Color();
      c.setStyle('#f00');

      expect(c.getHex() == 0xff0000).toBeTruthy();
    });

    test('iterable', () => {
      ColorManagement.enabled = false;

      const c = new Color(0.5, 0.75, 1);
      const array = [...c];

      expect(array[0]).toStrictEqual(0.5);
      expect(array[1]).toStrictEqual(0.75);
      expect(array[2]).toStrictEqual(1);
    });
  });
});
