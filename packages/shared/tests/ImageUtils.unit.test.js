// Disabled: -AT-vitest-environment jsdom

import { describe, expect, it, test, vi } from 'vitest';

import { ImageUtils } from '../src/ImageUtils.js';

describe('Shared', () => {
  describe('ImageUtils', () => {
    test('getDataURL', () => {
      expect(ImageUtils.getDataURL).toBeDefined();

      const imageSrc = {
        src: 'test',
        width: 128,
        height: 128
      };

      if (typeof HTMLCanvasElement === 'undefined') {
        expect(ImageUtils.getDataURL(imageSrc)).toBe(imageSrc.src);
      }

      const imageSrcData = {
        src: 'data:1234567890',
        width: 128,
        height: 128
      };

      expect(ImageUtils.getDataURL(imageSrcData)).toBe(imageSrcData.src);
    });

    test('sRGBToLinear', () => {
      expect(ImageUtils.sRGBToLinear).toBeDefined();

      const imageSrc = {
        data: [0.1, 0.2, 0.3, 0.4],
        width: 2,
        height: 2
      };

      const linearImage = ImageUtils.sRGBToLinear(imageSrc);

      expect(linearImage).toMatchInlineSnapshot(`
        {
          "data": [
            0.01002282557165656,
            0.033104766565152086,
            0.07323895587043372,
            0.13286832154414627,
          ],
          "height": 2,
          "width": 2,
        }
      `);

      const imageUint8Array = {
        data: new Uint8Array([25, 50, 75, 100, 125, 150, 175, 200, 225, 250]),
        width: 2,
        height: 2
      };

      const linearImageFromUnit = ImageUtils.sRGBToLinear(imageUint8Array);

      expect(linearImageFromUnit).toMatchInlineSnapshot(`
        {
          "data": Uint8Array [
            2,
            8,
            17,
            32,
            52,
            77,
            109,
            147,
            192,
            243,
          ],
          "height": 2,
          "width": 2,
        }
      `);
    });
  });
});
