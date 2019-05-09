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
    const nodeModules = path.join(cwd, 'node_modules');
    before(function* () {
      yield fs.symlink(path.join(process.cwd(), 'node_modules'), nodeModules);
      yield coffee.fork(bin, [ 'build' ], { cwd })
        .debug()
        .expect('code', 0)
        .end();
    });
    after(function* () {
      yield rimraf(target);
      yield rimraf(nodeModules);
    });

    it('should generate framework version and node version', function* () {
      const content = yield fs.readFile(path.join(target, 'public/index.html'), 'utf8');
      assert(content.includes('Latest: 1.0.0'));
      assert(content.includes('Node.js: >=6.0.0'));
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
      const docMdPath = path.join(target, 'source/en/contributing.md');
      let content = yield fs.readFile(docMdPath, 'utf8');
      assert(content.includes('title: "Contribution Guide"'));

      let docPath = path.join(target, 'public/en/contributing.html');
      content = yield fs.readFile(docPath, 'utf8');
      assert(content.includes('<h1>Contribution Guide</h1>'));

      docPath = path.join(target, 'public/zh-cn/contributing.html');
      content = yield fs.readFile(docPath, 'utf8');
      assert(content.includes('<h1>代码贡献规范</h1>'));
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

    it('should not escape html', function* () {
      const docPath = path.join(target, 'public/zh-cn/html.html');
      const content = yield fs.readFile(docPath, 'utf8');
      assert(content.includes('<img src="/img.png">'));
    });

    it('should generate plugin pages', function* () {
      const pluginData = yield fs.readFile(path.join(target, 'source/_data/plugins.yml'), 'utf8');
      assert(pluginData.includes('- onerror\n'));

      const pluginDocs = yield fs.readdir(path.join(target, 'source/zh-cn/plugins'));
      assert(pluginDocs.length === 15);

      let pluginA = yield fs.readFile(path.join(target, 'source/zh-cn/plugins/a.md'), 'utf8');
      assert(pluginA.includes('title: "中文文档"\n---\n'));
      pluginA = yield fs.readFile(path.join(target, 'source/en/plugins/a.md'), 'utf8');
      assert(pluginA.includes('title: "English Document"\n---\n'));

      let pluginB = yield fs.readFile(path.join(target, 'source/zh-cn/plugins/b.md'), 'utf8');
      assert(pluginB.includes('title: "@scope/module"\n---\n'));
      pluginB = yield fs.readFile(path.join(target, 'source/en/plugins/b.md'), 'utf8');
      assert(pluginB.includes('title: "@scope/module"\n---\n'));
      const pluginBDoc = yield fs.readFile(path.join(target, 'public/en/plugins/b.html'), 'utf8');
      assert(pluginBDoc.includes('<h1>@scope/module</h1>'));

      let pluginIndex = yield fs.readFile(path.join(target, 'public/zh-cn/plugins/index.html'), 'utf8');
      assert(pluginIndex.includes('内置插件列表'));
      pluginIndex = yield fs.readFile(path.join(target, 'public/en/plugins/index.html'), 'utf8');
      assert(pluginIndex.includes('Plugin List'));
    });

    it('should generate links', function* () {
      const docPath = path.join(target, 'public/index.html');
      const content = yield fs.readFile(docPath, 'utf8');
      assert(content.includes('<dt>Github</dt>'));
      assert(content.includes('<dt>Community</dt>'));
      assert(content.includes('<dt>Links</dt>'));
      assert(content.includes('<dd><a href="https://github.com/eggjs" target="_blank">Organization</a></dd>'));
    });
  });

  describe('build with external', () => {
    const cwd = path.join(__dirname, 'fixtures/framework-external');
    const target = path.join(cwd, 'run/doctools');
    const repo = 'https://github.com/eggjs/egg.git';
    const nodeModules = path.join(cwd, 'node_modules');

    before(function* () {
      yield fs.symlink(path.join(process.cwd(), 'node_modules'), nodeModules);
      yield coffee.fork(bin, [ 'build', '--external', repo ], { cwd })
      // .debug()
        .expect('code', 0)
        .end();
    });
    after(function* () {
      yield rimraf(target);
      yield rimraf(nodeModules);
    });

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
        // .debug()
        // .expect('stderr', /Cannot find module .*test[\/\\]fixtures[\/\\]error/)
        .expect('stderr', /NestedError\: Cannot glob `\*\*\/\*`/)
        .expect('code', 1)
        .end();
    });
  });
});
