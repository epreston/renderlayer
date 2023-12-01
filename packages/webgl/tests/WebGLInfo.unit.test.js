import { describe, expect, it, test, vi } from 'vitest';

import { WebGLInfo } from '../src/WebGLInfo.js';

const WebGL2RenderingContext = vi.fn();

describe('WebGL', () => {
  describe('WebGLInfo', () => {
    it('should expose a class', () => {
      expect(WebGLInfo).toBeDefined();
    });

    test('constructor', () => {
      const object = new WebGLInfo(new WebGL2RenderingContext());
      expect(object).toBeInstanceOf(WebGLInfo);
    });

    test('memory', () => {
      const object = new WebGLInfo(new WebGL2RenderingContext());

      expect(object.memory).toBeDefined();
      expect(object.memory.geometries).toBe(0);
      expect(object.memory.textures).toBe(0);
    });

    test('render', () => {
      const object = new WebGLInfo(new WebGL2RenderingContext());

      expect(object.render).toBeDefined();
      expect(object.render.frame).toBe(0);
      expect(object.render.calls).toBe(0);
      expect(object.render.triangles).toBe(0);
      expect(object.render.points).toBe(0);
      expect(object.render.lines).toBe(0);
    });

    test('programs', () => {
      const object = new WebGLInfo(new WebGL2RenderingContext());

      expect(object.programs).toBeNull();
    });

    test('autoReset', () => {
      const object = new WebGLInfo(new WebGL2RenderingContext());

      expect(object.autoReset).toBe(true);
    });

    test('reset', () => {
      const object = new WebGLInfo(new WebGL2RenderingContext());

      expect(object.reset).toBeDefined();
      // todo: implement
    });

    test('update', () => {
      const object = new WebGLInfo(new WebGL2RenderingContext());

      expect(object.update).toBeDefined();
      // todo: implement
    });
  });
});
