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
  })
];
