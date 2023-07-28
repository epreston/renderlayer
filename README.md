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

| Package        | Version                                                 | Description |
| -------------- | ------------------------------------------------------- | ----------- |
| `animation`    | [![animation][animation-badge]][animation-url]          |             |
| `buffers`      | [![buffers][buffers-badge]][buffers-url]                |             |
| `cameras`      | [![cameras][cameras-badge]][cameras-url]                |             |
| `controls`     | [![controls][controls-badge]][controls-url]             |             |
| `core`         | [![core][core-badge]][core-url]                         |             |
| `curves`       | [![curves][curves-badge]][curves-url]                   |             |
| `draco`        | [![draco][draco-badge]][draco-url]                      |             |
| `extras`       | [![extras][extras-badge]][extras-url]                   |             |
| `geometries`   | [![geometries][geometries-badge]][geometries-url]       |             |
| `gltf`         | [![gltf][gltf-badge]][gltf-url]                         |             |
| `interpolants` | [![interpolants][interpolants-badge]][interpolants-url] |             |
| `keyframes`    | [![keyframes][keyframes-badge]][keyframes-url]          |             |
| `lights`       | [![lights][lights-badge]][lights-url]                   |             |
| `loaders`      | [![loaders][loaders-badge]][loaders-url]                |             |
| `materials`    | [![materials][materials-badge]][materials-url]          |             |
| `math`         | [![math][math-badge]][math-url]                         |             |
| `objects`      | [![objects][objects-badge]][objects-url]                |             |
| `renderers`    | [![renderers][renderers-badge]][renderers-url]          |             |
| `renderlayer`  | [![renderlayer][renderlayer-badge]][renderlayer-url]    |             |
| `scenes`       | [![scenes][scenes-badge]][scenes-url]                   |             |
| `shaders`      | [![shaders][shaders-badge]][shaders-url]                |             |
| `shared`       | [![shared][shared-badge]][shared-url]                   |             |
| `targets`      | [![targets][targets-badge]][targets-url]                |             |
| `textures`     | [![textures][textures-badge]][textures-url]             |             |
| `webgl`        | [![webgl][webgl-badge]][webgl-url]                      |             |

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
[animation-badge]: https://img.shields.io/npm/v/@renderlayer/animation
[animation-url]: https://www.npmjs.com/package/@renderlayer/animation
[buffers-badge]: https://img.shields.io/npm/v/@renderlayer/buffers
[buffers-url]: https://www.npmjs.com/package/@renderlayer/buffers
[cameras-badge]: https://img.shields.io/npm/v/@renderlayer/cameras
[cameras-url]: https://www.npmjs.com/package/@renderlayer/cameras
[controls-badge]: https://img.shields.io/npm/v/@renderlayer/controls
[controls-url]: https://www.npmjs.com/package/@renderlayer/controls
[core-badge]: https://img.shields.io/npm/v/@renderlayer/core
[core-url]: https://www.npmjs.com/package/@renderlayer/core
[curves-badge]: https://img.shields.io/npm/v/@renderlayer/curves
[curves-url]: https://www.npmjs.com/package/@renderlayer/curves
[draco-badge]: https://img.shields.io/npm/v/@renderlayer/draco
[draco-url]: https://www.npmjs.com/package/@renderlayer/draco
[extras-badge]: https://img.shields.io/npm/v/@renderlayer/extras
[extras-url]: https://www.npmjs.com/package/@renderlayer/extras
[geometries-badge]: https://img.shields.io/npm/v/@renderlayer/geometries
[geometries-url]: https://www.npmjs.com/package/@renderlayer/geometries
[gltf-badge]: https://img.shields.io/npm/v/@renderlayer/gltf
[gltf-url]: https://www.npmjs.com/package/@renderlayer/gltf
[interpolants-badge]: https://img.shields.io/npm/v/@renderlayer/interpolants
[interpolants-url]: https://www.npmjs.com/package/@renderlayer/interpolants
[keyframes-badge]: https://img.shields.io/npm/v/@renderlayer/keyframes
[keyframes-url]: https://www.npmjs.com/package/@renderlayer/keyframes
[lights-badge]: https://img.shields.io/npm/v/@renderlayer/lights
[lights-url]: https://www.npmjs.com/package/@renderlayer/lights
[loaders-badge]: https://img.shields.io/npm/v/@renderlayer/loaders
[loaders-url]: https://www.npmjs.com/package/@renderlayer/loaders
[materials-badge]: https://img.shields.io/npm/v/@renderlayer/materials
[materials-url]: https://www.npmjs.com/package/@renderlayer/materials
[math-badge]: https://img.shields.io/npm/v/@renderlayer/math
[math-url]: https://www.npmjs.com/package/@renderlayer/math
[objects-badge]: https://img.shields.io/npm/v/@renderlayer/objects
[objects-url]: https://www.npmjs.com/package/@renderlayer/objects
[renderers-badge]: https://img.shields.io/npm/v/@renderlayer/renderers
[renderers-url]: https://www.npmjs.com/package/@renderlayer/renderers
[renderlayer-badge]: https://img.shields.io/npm/v/@renderlayer/renderlayer
[renderlayer-url]: https://www.npmjs.com/package/@renderlayer/renderlayer
[scenes-badge]: https://img.shields.io/npm/v/@renderlayer/scenes
[scenes-url]: https://www.npmjs.com/package/@renderlayer/scenes
[shaders-badge]: https://img.shields.io/npm/v/@renderlayer/shaders
[shaders-url]: https://www.npmjs.com/package/@renderlayer/shaders
[shared-badge]: https://img.shields.io/npm/v/@renderlayer/shared
[shared-url]: https://www.npmjs.com/package/@renderlayer/shared
[targets-badge]: https://img.shields.io/npm/v/@renderlayer/targets
[targets-url]: https://www.npmjs.com/package/@renderlayer/targets
[textures-badge]: https://img.shields.io/npm/v/@renderlayer/textures
[textures-url]: https://www.npmjs.com/package/@renderlayer/textures
[webgl-badge]: https://img.shields.io/npm/v/@renderlayer/webgl
[webgl-url]: https://www.npmjs.com/package/@renderlayer/webgl
