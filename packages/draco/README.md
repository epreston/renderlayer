# @renderlayer/draco

Draco wrapper library used by `@renderlayer` packages.

Draco is an open-source library for compressing and decompressing 3D geometric meshes and point clouds. It is intended to improve the storage and transmission of 3D graphics.

[![NPM version][npm-badge]][npm-url]
[![License][license-badge]][license-url]

## Install

```bash
npm i @renderlayer/draco
```

## Configure

Specifiy where the 'lib' files are hosted using `decoderPath`. This can be a directory relative to the root of the web site or googles dedicated CDN for these files.

```js
const decoderPath = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(decoderPath);
```

## References

| Website | Reference                       |
| ------- | ------------------------------- |
| DRACO   | https://google.github.io/draco/ |
| Github  | https://github.com/google/draco |

## License

This package is released under the [MIT License][license-url]

[npm-badge]: https://img.shields.io/npm/v/@renderlayer/draco
[npm-url]: https://www.npmjs.com/package/@renderlayer/draco
[license-badge]: https://img.shields.io/npm/l/renderlayer.svg?cacheSeconds=2592000
[license-url]: https://github.com/epreston/renderlayer/blob/main/LICENSE
