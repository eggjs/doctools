'use strict';

const fs = require('mz/fs');
const path = require('path');
const coffee = require('coffee');
const assert = require('assert');
const { rimraf } = require('mz-modules');
const bin = path.join(__dirname, '../bin/doctools.js');

describe('test/build.test.js', () => {

  describe('build framework', () => {
    const cwd = path.join(__dirname, 'fixtures/framework');
    const target = path.join(cwd, 'run/doctools');
    before(function* () {
      yield coffee.fork(bin, [ 'build' ], { cwd })
        .debug()
        .expect('code', 0)
        .end();
    });
    after(() => rimraf(target));

    it('should generate framework version and node version', function* () {
      const content = yield fs.readFile(path.join(target, 'public/index.html'), 'utf8');
      assert(content.includes('Latest: <strong>1.0.0</strong>'));
      assert(content.includes('Node.js: <strong>>=6.0.0</strong>'));
    });

    it('should generate package.json', function* () {
      let content = yield fs.readFile(path.join(target, 'package.json'), 'utf8');
      content = JSON.parse(content);
      assert(content.dependencies['hexo-generator-index']);
    });

    it('should generate jsdoc', function* () {
      const apiPath = path.join(target, 'public/api');
      assert(yield fs.exists(apiPath));
      const dirs = yield fs.readdir(apiPath);
      assert(dirs.length > 0);
    });

    it('should generate intro', function* () {
      let docPath = path.join(target, 'public/en/intro/index.html');
      let content = yield fs.readFile(docPath, 'utf8');
      assert(content.includes('English document'));

      docPath = path.join(target, 'public/zh-cn/intro/index.html');
      content = yield fs.readFile(docPath, 'utf8');
      assert(content.includes('中文文档'));
    });

    it('should copy contributing', function* () {
      let docPath = path.join(target, 'public/en/contributing.html');
      let content = yield fs.readFile(docPath, 'utf8');
      assert(content.includes('Contribution Guide'));

      docPath = path.join(target, 'public/zh-cn/contributing.html');
      content = yield fs.readFile(docPath, 'utf8');
      assert(content.includes('代码贡献规范'));
    });

    it('should support languages config', function* () {
      let docPath = path.join(target, 'public/en/intro/index.html');
      let content = yield fs.readFile(docPath, 'utf8');
      assert(content.includes('Guide'));
      assert(content.includes('What is Egg?'));

      docPath = path.join(target, 'public/zh-cn/intro/index.html');
      content = yield fs.readFile(docPath, 'utf8');
      assert(content.includes('新手指南'));
      assert(content.includes('Egg.js 是什么?'));
    });

    it('should copy theme', function* () {
      const docPath = path.join(target, 'public/index.html');
      const content = yield fs.readFile(docPath, 'utf8');
      assert(content.includes('overwrite index template'));
    });
  });

  describe('build with external', () => {
    const cwd = path.join(__dirname, 'fixtures/framework-external');
    const target = path.join(cwd, 'run/doctools');
    const repo = 'https://github.com/eggjs/egg.git';
    before(function* () {
      yield coffee.fork(bin, [ 'build', '--external', repo ], { cwd })
        // .debug()
        .expect('code', 0)
        .end();
    });
    after(() => rimraf(target));

    it('should use external document', function* () {
      const docPath = path.join(target, 'public/zh-cn/intro/index.html');
      const content = yield fs.readFile(docPath, 'utf8');
      assert(content.includes('新手指南'));
      assert(content.includes('Egg.js 是什么?'));
    });

    it('should overwrite external', function* () {
      const docPath = path.join(target, 'public/en/intro/index.html');
      const content = yield fs.readFile(docPath, 'utf8');
      assert(content.includes('English document'));
    });
  });

  describe('build error', () => {
    const cwd = path.join(__dirname, 'fixtures/error');
    const target = path.join(cwd, 'run/doctools');
    after(() => rimraf(target));

    it('should exit 1', function* () {
      yield coffee.fork(bin, [ 'build' ], { cwd })
        .debug()
        .expect('stderr', /Cannot find module .*test[\/\\]fixtures[\/\\]error/)
        .expect('code', 1)
        .end();
    });
  });
});
