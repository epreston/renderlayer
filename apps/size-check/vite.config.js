// https://vitejs.dev/config/
export default {
  appType: 'mpa', // disable history fallback
  define: {
    // __PROD__: false,
  },
  build: {
    assetsInlineLimit: 0,
    target: ['es2024'],
    rollupOptions: {
      input: ['src/main.js'],
      output: {
        entryFileNames: `[name].js`
      }
    },
    minify: 'terser'
  }
};
