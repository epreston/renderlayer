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
    target: ['es2022', 'chrome112', 'edge112', 'firefox112', 'safari16.4', 'ios16.4']
  }
};
