import { entries as renderLayerEntries } from '../../scripts/aliases.js';

// https://vitejs.dev/config/
export default {
  appType: 'mpa', // disable history fallback
  resolve: {
    // run validation on source for instant feedback
    alias: {
      ...renderLayerEntries
    }
  },
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.hdr'],
  build: {
    assetsInlineLimit: 0,
    target: ['es2024']
  }
};
