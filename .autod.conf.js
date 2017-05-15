'use strict';

module.exports = {
  write: true,
  prefix: '^',
  test: [
    'test',
  ],
  dep: [
    'hexo-generator-index',
    'hexo-generator-tag',
    'hexo-renderer-less',
    'hexo-server',
    'jsdoc',
  ],
  devdep: [
    'egg',
    'egg-ci',
    'egg-bin',
    'autod',
    'eslint',
    'eslint-config-egg',
    'webstorm-disable-index',
  ],
  exclude: [
    './test/fixtures',
  ],
  semver: [
    'egg@1.2.1',
  ],
};
