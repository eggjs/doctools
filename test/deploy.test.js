'use strict';

const path = require('path');
const coffee = require('coffee');
const { rimraf, mkdirp } = require('mz-modules');
const runscript = require('runscript');
const assert = require('assert');
const bin = path.join(__dirname, '../bin/doctools.js');

describe('test/deploy.test.js', () => {

  describe('deploy', () => {
    const fixtures = path.join(__dirname, 'fixtures');
    const cwd = path.join(fixtures, 'doctools');
    const nodeModules = path.join(cwd, 'node_modules');
    let originMsg;

    before(function* () {
      yield fs.symlink(path.join(process.cwd(), 'node_modules'), nodeModules);
      yield rimraf(cwd);
      yield mkdirp(cwd);
      yield runscript('git clone -b test-branch git@github.com:eggjs/doctools.git', { cwd: fixtures });
      originMsg = yield runscript('git log --format=%B -n 1', { stdio: 'pipe', cwd });
      originMsg = originMsg.stdout.toString().replace(/\n*$/, '');
      try {
        yield runscript('git push origin :gh-pages', { cwd });
      } catch (err) {
        console.log('catch error %s, but ignore', err.message);
      }
    });
    after(function* () {
      yield rimraf(target);
      yield rimraf(nodeModules);
    });

    it('should work', function* () {
      yield coffee.fork(bin, [ 'deploy' ], { cwd })
        .debug()
        .expect('code', 0)
        .end();

      yield runscript('git fetch', { cwd });
      let stdio = yield runscript('git branch -r', { cwd, stdio: 'pipe' });
      assert(stdio.stdout.toString().includes('origin/gh-pages'));

      stdio = yield runscript('git log origin/gh-pages --format=%B -n 1', { cwd, stdio: 'pipe' });
      assert(stdio.stdout.toString().includes(originMsg));
    });
  });
});
