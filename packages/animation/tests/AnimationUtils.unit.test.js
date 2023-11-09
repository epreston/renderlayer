import { describe, expect, it, test, vi } from 'vitest';

import * as AnimationUtils from '../src/AnimationUtils.js';

// split out keyframe

describe('Animation', () => {
  describe('AnimationUtils', () => {
    // test.todo('convertArray', () => {
    //   // implement
    // });

    test('getKeyframeOrder', () => {
      expect(AnimationUtils.getKeyframeOrder).toBeDefined();
    });

    test('sortedArray', () => {
      expect(AnimationUtils.sortedArray).toBeDefined();
    });

    test('flattenJSON', () => {
      expect(AnimationUtils.flattenJSON).toBeDefined();
    });

    test('subclip', () => {
      expect(AnimationUtils.subclip).toBeDefined();
    });

    test('makeClipAdditive', () => {
      expect(AnimationUtils.makeClipAdditive).toBeDefined();
    });
  });
});
