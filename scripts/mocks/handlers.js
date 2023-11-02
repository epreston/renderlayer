import { http, HttpResponse } from 'msw';
import fs from 'node:fs';
import path from 'node:path';

export const handlers = [
  // GLTFLoader
  http.get('http://renderlayer.org/test/gltf/:fileName', (info) => {
    const { fileName } = info.params;
    const resolvedFileName = path.resolve(__dirname, `../fixtures/${fileName}`);

    if (!fs.existsSync(resolvedFileName)) {
      console.warn(`missing test file: ${fileName}`);

      // prettier-ignore
      return HttpResponse.json(
        { errorMessage: `File '${fileName}' not found.` },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(resolvedFileName);

    return new HttpResponse(fileBuffer, {
      headers: {
        'Content-Length': fileBuffer.byteLength.toString(),
        'Content-Type': 'model/gltf+json'
      }
    });
  }),
  // ImageLoader
  http.get('http://renderlayer.org/test/png/:fileName', (info) => {
    const { fileName } = info.params;
    const resolvedFileName = path.resolve(__dirname, `../fixtures/${fileName}`);

    if (!fs.existsSync(resolvedFileName)) {
      console.warn(`missing test file: ${fileName}`);

      // prettier-ignore
      return HttpResponse.json(
        { errorMessage: `File '${fileName}' not found.` },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(resolvedFileName);

    return new HttpResponse(fileBuffer, {
      headers: {
        'Content-Length': fileBuffer.byteLength.toString(),
        'Content-Type': 'image/png'
      }
    });
  }),
  // TextureLoader
  http.get('http://renderlayer.org/test/jpeg/:fileName', (info) => {
    const { fileName } = info.params;
    const resolvedFileName = path.resolve(__dirname, `../fixtures/${fileName}`);

    if (!fs.existsSync(resolvedFileName)) {
      console.warn(`missing test file: ${fileName}`);

      // prettier-ignore
      return HttpResponse.json(
        { errorMessage: `File '${fileName}' not found.` },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(resolvedFileName);

    return new HttpResponse(fileBuffer, {
      headers: {
        'Content-Length': fileBuffer.byteLength.toString(),
        'Content-Type': 'image/jpeg'
      }
    });
  }),
  // FileLoader
  http.get('http://renderlayer.org/test/bin/:fileName', (info) => {
    const { fileName } = info.params;
    const resolvedFileName = path.resolve(__dirname, `../fixtures/${fileName}`);

    if (!fs.existsSync(resolvedFileName)) {
      console.warn(`missing test file: ${fileName}`);

      // prettier-ignore
      return HttpResponse.json(
        { errorMessage: `File '${fileName}' not found.` },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(resolvedFileName);

    return new HttpResponse(fileBuffer, {
      headers: {
        'Content-Length': fileBuffer.byteLength.toString(),
        'Content-Type': 'application/octet-stream'
      }
    });
  }),
  // Binary GLB
  http.get('http://renderlayer.org/test/glb/:fileName', (info) => {
    const { fileName } = info.params;
    const resolvedFileName = path.resolve(__dirname, `../fixtures/${fileName}`);

    if (!fs.existsSync(resolvedFileName)) {
      console.warn(`missing test file: ${fileName}`);

      // prettier-ignore
      return HttpResponse.json(
        { errorMessage: `File '${fileName}' not found.` },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(resolvedFileName);

    return new HttpResponse(fileBuffer, {
      headers: {
        'Content-Length': fileBuffer.byteLength.toString(),
        'Content-Type': 'model/gltf-binary'
      }
    });
  }),
  // webp
  http.get('http://renderlayer.org/test/webp/:fileName', (info) => {
    const { fileName } = info.params;
    const resolvedFileName = path.resolve(__dirname, `../fixtures/${fileName}`);

    if (!fs.existsSync(resolvedFileName)) {
      console.warn(`missing test file: ${fileName}`);

      // prettier-ignore
      return HttpResponse.json(
        { errorMessage: `File '${fileName}' not found.` },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(resolvedFileName);

    return new HttpResponse(fileBuffer, {
      headers: {
        'Content-Length': fileBuffer.byteLength.toString(),
        'Content-Type': 'image/webp'
      }
    });
  }),
  // JSON - BufferGeometryLoader, FileLoader
  http.get('http://renderlayer.org/test/json/:fileName', (info) => {
    const { fileName } = info.params;
    const resolvedFileName = path.resolve(__dirname, `../fixtures/${fileName}`);

    if (!fs.existsSync(resolvedFileName)) {
      console.warn(`missing test file: ${fileName}`);

      // prettier-ignore
      return HttpResponse.json(
        { errorMessage: `File '${fileName}' not found.` },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(resolvedFileName);

    return new HttpResponse(fileBuffer, {
      headers: {
        'Content-Length': fileBuffer.byteLength.toString(),
        'Content-Type': 'application/json'
      }
    });
  })
];
