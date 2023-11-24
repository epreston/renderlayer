import { entries as renderLayerEntries } from '../../scripts/aliases.js';

// https://vitejs.dev/config/
export default {
  resolve: {
    // run validation on source for instant feedback
    alias: {
      ...renderLayerEntries
    }
  },
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.hdr'],
  build: {
    assetsInlineLimit: 0,
    target: ['es2022']
  }
};
