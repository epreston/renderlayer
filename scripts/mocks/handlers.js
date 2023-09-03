import { rest } from 'msw';
import * as fs from 'node:fs';
import * as path from 'node:path';

export const handlers = [
  // GLTFLoader
  rest.get('http://renderlayer.org/test/gltf/:fileName', (req, res, ctx) => {
    const { fileName } = req.params;
    const resolvedFileName = path.resolve(__dirname, `../fixtures/${fileName}`);

    if (!fs.existsSync(resolvedFileName)) {
      console.warn(`missing test file: ${fileName}`);

      // prettier-ignore
      return res(
        ctx.status(404),
        ctx.json({ errorMessage: `File '${fileName}' not found.` })
      );
    }

    const fileBuffer = fs.readFileSync(resolvedFileName);

    return res(
      ctx.set('Content-Length', fileBuffer.byteLength.toString()),
      ctx.set('Content-Type', 'model/gltf+json'),
      ctx.body(fileBuffer)
    );
  }),
  // ImageLoader
  rest.get('http://renderlayer.org/test/png/:fileName', (req, res, ctx) => {
    const { fileName } = req.params;
    const resolvedFileName = path.resolve(__dirname, `../fixtures/${fileName}`);

    if (!fs.existsSync(resolvedFileName)) {
      console.warn(`missing test file: ${fileName}`);

      // prettier-ignore
      return res(
        ctx.status(404),
        ctx.json({ errorMessage: `File '${fileName}' not found.` })
      );
    }

    const fileBuffer = fs.readFileSync(resolvedFileName);

    return res(
      ctx.set('Content-Length', fileBuffer.byteLength.toString()),
      ctx.set('Content-Type', 'image/png'),
      ctx.body(fileBuffer)
    );
  }),
  // TextureLoader
  rest.get('http://renderlayer.org/test/jpeg/:fileName', (req, res, ctx) => {
    const { fileName } = req.params;
    const resolvedFileName = path.resolve(__dirname, `../fixtures/${fileName}`);

    if (!fs.existsSync(resolvedFileName)) {
      console.warn(`missing test file: ${fileName}`);

      // prettier-ignore
      return res(
        ctx.status(404),
        ctx.json({ errorMessage: `File '${fileName}' not found.` })
      );
    }

    const fileBuffer = fs.readFileSync(resolvedFileName);

    return res(
      ctx.set('Content-Length', fileBuffer.byteLength.toString()),
      ctx.set('Content-Type', 'image/jpeg'),
      ctx.body(fileBuffer)
    );
  }),
  // FileLoader
  rest.get('http://renderlayer.org/test/bin/:fileName', (req, res, ctx) => {
    const { fileName } = req.params;
    const resolvedFileName = path.resolve(__dirname, `../fixtures/${fileName}`);

    if (!fs.existsSync(resolvedFileName)) {
      console.warn(`missing test file: ${fileName}`);

      // prettier-ignore
      return res(
        ctx.status(404),
        ctx.json({ errorMessage: `File '${fileName}' not found.` })
      );
    }

    const fileBuffer = fs.readFileSync(resolvedFileName);

    return res(
      ctx.set('Content-Length', fileBuffer.byteLength.toString()),
      ctx.set('Content-Type', 'application/octet-stream'),
      ctx.body(fileBuffer)
    );
  }),
  // Binary GLB
  rest.get('http://renderlayer.org/test/glb/:fileName', (req, res, ctx) => {
    const { fileName } = req.params;
    const resolvedFileName = path.resolve(__dirname, `../fixtures/${fileName}`);

    if (!fs.existsSync(resolvedFileName)) {
      console.warn(`missing test file: ${fileName}`);

      // prettier-ignore
      return res(
        ctx.status(404),
        ctx.json({ errorMessage: `File '${fileName}' not found.` })
      );
    }

    const fileBuffer = fs.readFileSync(resolvedFileName);

    return res(
      ctx.set('Content-Length', fileBuffer.byteLength.toString()),
      ctx.set('Content-Type', 'model/gltf-binary'),
      ctx.body(fileBuffer)
    );
  }),
  // webp
  rest.get('http://renderlayer.org/test/webp/:fileName', (req, res, ctx) => {
    const { fileName } = req.params;
    const resolvedFileName = path.resolve(__dirname, `../fixtures/${fileName}`);

    if (!fs.existsSync(resolvedFileName)) {
      console.warn(`missing test file: ${fileName}`);

      // prettier-ignore
      return res(
        ctx.status(404),
        ctx.json({ errorMessage: `File '${fileName}' not found.` })
      );
    }

    const fileBuffer = fs.readFileSync(resolvedFileName);

    return res(
      ctx.set('Content-Length', fileBuffer.byteLength.toString()),
      ctx.set('Content-Type', 'image/webp'),
      ctx.body(fileBuffer)
    );
  }),
  // JSON - BufferGeometryLoader, FileLoader
  rest.get('http://renderlayer.org/test/json/:fileName', (req, res, ctx) => {
    const { fileName } = req.params;
    const resolvedFileName = path.resolve(__dirname, `../fixtures/${fileName}`);

    if (!fs.existsSync(resolvedFileName)) {
      console.warn(`missing test file: ${fileName}`);

      // prettier-ignore
      return res(
        ctx.status(404),
        ctx.json({ errorMessage: `File '${fileName}' not found.` })
      );
    }

    const fileBuffer = fs.readFileSync(resolvedFileName);

    return res(
      ctx.set('Content-Length', fileBuffer.byteLength.toString()),
      ctx.set('Content-Type', 'application/json'),
      ctx.body(fileBuffer)
    );
  })
];
