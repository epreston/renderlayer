// https://vitejs.dev/config/
export default {
  define: {
    // __PROD__: false,
  },
  build: {
    rollupOptions: {
      input: ['src/main.js'],
      output: {
        entryFileNames: `[name].js`
      }
    },
    minify: 'terser'
  }
};
