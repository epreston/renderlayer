// https://vitejs.dev/config/
export default {
  // server: {
  //   open: '/index.html'
  // },
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.hdr'],
  build: {
    target: ['es2022', 'chrome112', 'edge112', 'firefox112', 'safari16.4', 'ios16.4']
  }
};
