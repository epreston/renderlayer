import { describe, expect, it, test, vi } from 'vitest';

import { DataTexture } from '@renderlayer/textures';

import { Bone } from '../src/Bone.js';
import { Skeleton } from '../src/Skeleton.js';

function createSkeleton() {
  const bones = [];

  const shoulder = new Bone();
  const elbow = new Bone();
  const hand = new Bone();

  shoulder.name = 'shoulder';
  elbow.name = 'elbow';
  hand.name = 'hand';

  // lock uuid
  shoulder.uuid = '67f50833-ee0f-4d7a-b326-751057ac4d41';
  elbow.uuid = '53c519fb-0ede-4ebd-9861-ebca457e4654';
  hand.uuid = '62bbd12f-0a27-42fe-a2a7-f040d91b2152';

  shoulder.add(elbow);
  elbow.add(hand);

  bones.push(shoulder);
  bones.push(elbow);
  bones.push(hand);

  shoulder.position.y = -5;
  elbow.position.y = 0;
  hand.position.y = 5;

  const skeleton = new Skeleton(bones);
  skeleton.uuid = '14e0bc18-e2f2-4d3b-ab56-90561fcf1afd';

  return {
    shoulder: shoulder,
    elbow: elbow,
    hand: hand,
    skeleton: skeleton
  };
}

describe('Objects', () => {
  describe('Skeleton', () => {
    test('constructor', () => {
      const object = new Skeleton();
      expect(object).toBeDefined();
    });

    test('uuid', () => {
      const object = new Skeleton();
      expect(object.uuid).to.be.a('string');
      expect(object.uuid).to.have.length(36);
    });

    test('bones', () => {
      const { skeleton } = createSkeleton();
      expect(skeleton.bones).toBeInstanceOf(Array);
    });

    test('boneInverses', () => {
      const { skeleton } = createSkeleton();
      expect(skeleton.boneInverses).toBeInstanceOf(Array);
    });

    test('boneMatrices', () => {
      const { skeleton } = createSkeleton();
      expect(skeleton.boneMatrices).toBeInstanceOf(Float32Array);
    });

    test('boneTexture', () => {
      const { skeleton } = createSkeleton();
      expect(skeleton.boneTexture).toBeNull();

      skeleton.computeBoneTexture();

      expect(skeleton.boneTexture).not.toBeNull();
      expect(skeleton.boneTexture).toBeInstanceOf(DataTexture);
    });

    test('boneTextureSize', () => {
      const { skeleton } = createSkeleton();
      expect(skeleton.boneTextureSize).toBe(0);

      skeleton.computeBoneTexture();

      expect(skeleton.boneTextureSize).toBe(4);
    });

    test('init', () => {
      const { skeleton } = createSkeleton();
      skeleton.init();
    });

    test('calculateInverses', () => {
      const { skeleton } = createSkeleton();

      skeleton.calculateInverses();

      expect(skeleton.boneInverses).toBeInstanceOf(Array);
    });

    test('pose', () => {
      const { skeleton } = createSkeleton();
      skeleton.pose();
    });

    test('update', () => {
      const { skeleton, hand } = createSkeleton();
      hand.position.y = 10;

      skeleton.update();
    });

    test('clone', () => {
      const { skeleton } = createSkeleton();
      const cloneSkeleton = skeleton.clone();

      // will be different
      cloneSkeleton.uuid = skeleton.uuid;

      expect(skeleton).not.toBe(cloneSkeleton);
      expect(skeleton).toStrictEqual(cloneSkeleton);
    });

    test('computeBoneTexture', () => {
      const { skeleton } = createSkeleton();
      expect(skeleton.boneTextureSize).toBe(0);

      skeleton.computeBoneTexture();

      expect(skeleton.boneTexture).not.toBeNull();
      expect(skeleton.boneTextureSize).toBe(4);
    });

    test('getBoneByName', () => {
      const { skeleton } = createSkeleton();
      const hand = skeleton.getBoneByName('hand');

      expect(hand).toBeInstanceOf(Bone);
      expect(hand.name).toBe('hand');
    });

    test('dispose', () => {
      const object = new Skeleton();
      object.dispose();

      expect(object).toBeDefined();
    });

    test('fromJSON', () => {
      const { shoulder, elbow, hand, skeleton } = createSkeleton();

      const bones = {};
      bones[shoulder.uuid] = shoulder;
      bones[elbow.uuid] = elbow;
      bones[hand.uuid] = hand;

      const jsonSkeleton = new Skeleton().fromJSON(
        {
          boneInverses: [
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
          ],
          bones: [
            '67f50833-ee0f-4d7a-b326-751057ac4d41',
            '53c519fb-0ede-4ebd-9861-ebca457e4654',
            '62bbd12f-0a27-42fe-a2a7-f040d91b2152'
          ],
          metadata: {
            generator: 'Skeleton.toJSON',
            type: 'Skeleton',
            version: 4.5
          },
          uuid: '14e0bc18-e2f2-4d3b-ab56-90561fcf1afd'
        },
        bones
      );

      expect(skeleton).not.toBe(jsonSkeleton);
      expect(skeleton).toStrictEqual(jsonSkeleton);
    });

    test('toJSON', () => {
      const { skeleton } = createSkeleton();
      skeleton.uuid = '14e0bc18-e2f2-4d3b-ab56-90561fcf1afd';
      expect(skeleton).toMatchSnapshot();
    });
  });
});
