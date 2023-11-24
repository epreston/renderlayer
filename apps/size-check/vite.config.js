// https://vitejs.dev/config/
export default {
  define: {
    // __PROD__: false,
  },
  build: {
    assetsInlineLimit: 0,
    target: ['es2022'],
    rollupOptions: {
      input: ['src/main.js'],
      output: {
        entryFileNames: `[name].js`
      }
    },
    minify: 'terser'
  }
};
