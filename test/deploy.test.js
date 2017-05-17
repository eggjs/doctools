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
    const cwd = path.join(fixtures, 'doctools-test-repo');
    before(function* () {
      yield mkdirp(cwd);
      yield runscript('git clone git@github.com:eggjs/doctools-test-repo.git', { cwd: fixtures });
      try {
        yield runscript('git push origin :gh-pages', { cwd });
      } catch (e) {
        console.log('catch error %s, but ignore', e.message);
      }
    });
    after(() => rimraf(cwd));

    it('should work', function* () {
      yield coffee.fork(bin, [ 'deploy' ], { cwd })
        .debug()
        .expect('code', 0)
        .end();

      yield runscript('git fetch', { cwd });
      const res = yield runscript('git branch -r', { cwd, stdio: 'pipe' });
      assert(res.stdout.toString().includes('origin/gh-pages'));
    });
  });
});
