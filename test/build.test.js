'use strict';

const fs = require('mz/fs');
const path = require('path');
const coffee = require('coffee');
const assert = require('assert');
const bin = path.join(__dirname, '../bin/doctools.js');

describe.only('test/build.test.js', () => {

  describe('build framework', () => {
    const cwd = path.join(__dirname, 'fixtures/framework');
    const target = path.join(cwd, 'run/doctools');
    before(function* () {
      yield coffee.fork(bin, [ 'build' ], { cwd })
        .debug()
        .expect('code', 0)
        .end();
    });

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
  });

});
