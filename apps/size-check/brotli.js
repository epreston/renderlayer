import { brotliCompressSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const file = readFileSync('dist/main.js');
const compressed = brotliCompressSync(file);
const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb';
console.warn(`brotli: ${compressedSize}`);
