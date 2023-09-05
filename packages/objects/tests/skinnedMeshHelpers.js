import { Float32BufferAttribute, Uint16BufferAttribute } from '@renderlayer/buffers';
import { CylinderGeometry } from '@renderlayer/geometries';
import { MeshBasicMaterial } from '@renderlayer/materials';
import { Vector3 } from '@renderlayer/math';

import { Bone } from '../src/Bone.js';
import { SkinnedMesh } from '../src/SkinnedMesh.js';
import { Skeleton } from '../src/Skeleton.js';

function createGeometry(sizing) {
  const geometry = new CylinderGeometry(
    5, // radiusTop
    5, // radiusBottom
    sizing.height, // height
    8, // radiusSegments
    sizing.segmentCount * 3, // heightSegments
    true // openEnded
  );

  const position = geometry.attributes.position;

  const vertex = new Vector3();

  const skinIndices = [];
  const skinWeights = [];

  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);

    const y = vertex.y + sizing.halfHeight;

    const skinIndex = Math.floor(y / sizing.segmentHeight);
    const skinWeight = (y % sizing.segmentHeight) / sizing.segmentHeight;

    skinIndices.push(skinIndex, skinIndex + 1, 0, 0);
    skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
  }

  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndices, 4));
  geometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));

  return geometry;
}

function createBones(sizing) {
  const bones = [];

  let prevBone = new Bone();
  bones.push(prevBone);
  prevBone.position.y = -sizing.halfHeight;

  for (let i = 0; i < sizing.segmentCount; i++) {
    const bone = new Bone();
    bone.position.y = sizing.segmentHeight;
    bones.push(bone);
    prevBone.add(bone);
    prevBone = bone;
  }

  return bones;
}

function createMesh(geometry, bones) {
  const material = new MeshBasicMaterial();
  const mesh = new SkinnedMesh(geometry, material);
  const skeleton = new Skeleton(bones);

  mesh.add(bones[0]);

  mesh.bind(skeleton);

  return mesh;
}

function skinnedMeshFactory() {
  const segmentHeight = 8;
  const segmentCount = 4;
  const height = segmentHeight * segmentCount;
  const halfHeight = height * 0.5;

  const sizing = {
    segmentHeight: segmentHeight,
    segmentCount: segmentCount,
    height: height,
    halfHeight: halfHeight
  };

  const geometry = createGeometry(sizing);
  const bones = createBones(sizing);
  const mesh = createMesh(geometry, bones);

  mesh.scale.multiplyScalar(1);

  return {
    geometry,
    bones,
    mesh
  };
}

export { skinnedMeshFactory };
