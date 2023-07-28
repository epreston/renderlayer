# renderlayer

Light, Modern, Stable - 3D Rendering Layer for the Web

[![NPM version][npm-badge]][npm-url]
[![License][license-badge]][license-url]
[![CI][ci-badge]][ci-url]

## Scripts

| Action        | Command                 | Description                     |
| ------------- | ----------------------- | ------------------------------- |
| build         | `npm run build`         | Build all modules               |
| check         | `npm run check`         | Check for circular dependencies |
| lint          | `npm run lint`          | Run static code analysis        |
| test          | `npm run test`          | Run unit tests                  |
| test-run      | `npm run test-run`      | Run unit tests and exit         |
| test-coverage | `npm run test-coverage` | Generate a test coverage report |

## Structure

This repository employs a [monorepo](https://en.wikipedia.org/wiki/Monorepo) setup which hosts a number of associated packages under the `packages` directory. They can be used in any combination and define minimum dependencies between eachother.

| Package        | Version | Description |
| -------------- | ------- | ----------- |
| `animation`    |         |             |
| `buffers`      |         |             |
| `cameras`      |         |             |
| `controls`     |         |             |
| `core`         |         |             |
| `curves`       |         |             |
| `draco`        |         |             |
| `extras`       |         |             |
| `geometries`   |         |             |
| `gltf`         |         |             |
| `interpolants` |         |             |
| `keyframes`    |         |             |
| `lights`       |         |             |
| `loaders`      |         |             |
| `materials`    |         |             |
| `math`         |         |             |
| `objects`      |         |             |
| `renderers`    |         |             |
| `renderlayer`  |         |             |
| `scenes`       |         |             |
| `shaders`      |         |             |
| `shared`       |         |             |
| `targets`      |         |             |
| `textures`     |         |             |
| `utils`        |         |             |
| `webgl`        |         |             |

## References

| Tool         | Reference                |
| ------------ | ------------------------ |
| Node.js      | https://nodejs.org/      |
| Vite         | https://vitejs.dev/      |
| Vitest       | https://vitest.dev/      |
| ESLint       | https://eslint.org/      |
| Prettier     | https://prettier.io      |
| EditorConfig | https://editorconfig.org |

| Website | Reference                      |
| ------- | ------------------------------ |
| WebGL2  | https://www.khronos.org/webgl/ |
| glTF    | https://www.khronos.org/gltf/  |

## License

This project is released under the MIT [License](LICENSE).

[ci-badge]: https://github.com/epreston/renderlayer/actions/workflows/ci.yml/badge.svg
[ci-url]: https://github.com/epreston/renderlayer/actions/workflows/ci.yml
[npm-badge]: https://img.shields.io/npm/v/renderlayer
[npm-url]: https://www.npmjs.com/package/renderlayer
[license-badge]: https://img.shields.io/npm/l/renderlayer.svg?cacheSeconds=2592000
[license-url]: LICENSE
