const { brotliCompressSync } = require('node:zlib');

const file = require('node:fs').readFileSync('dist/main.js');
const compressed = brotliCompressSync(file);
const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb';
console.warn(`brotli: ${compressedSize}`);
