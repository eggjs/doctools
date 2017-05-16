# Doctools for [Egg.js](https://eggjs.org)

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![NPM download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-doctools.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-doctools
[travis-image]: https://img.shields.io/travis/eggjs/doctools.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/doctools
[codecov-image]: https://codecov.io/gh/eggjs/doctools/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/eggjs/doctools
[david-image]: https://img.shields.io/david/eggjs/doctools.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/doctools
[snyk-image]: https://snyk.io/test/npm/egg-doctools/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-doctools
[download-image]: https://img.shields.io/npm/dm/egg-doctools.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-doctools

## Feature

- Document generator using hexo
- API document generator using jsdoc
- Deploy to gh-pages
- Local development
- Theme for Egg.js

## Usage

Installation

```bash
npm i egg-doctools --save-dev
```

Only support egg framework, see structure below

```
|- index.js
|- docs
|  |- source
|  |  |- _data
|  |  |  |- guide_toc.yml <- toc links
|  |  |  `- menu.yml      <- menu links
|  |  |- en               <- english document
|  |  `- zh-cn            <- chinese document
|  `- _config.yml         <- hexo config
`- package.json
```

Run `doctools build` to generate document to `${baseDir}/run/doctools`.

## Commands

- `doctools build`: build document
- `doctools server`: local development
- `doctools deploy`: deploy to gh-pages

## License

[MIT](LICENSE)
