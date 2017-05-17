'use strict';

const path = require('path');
const coffee = require('coffee');
const { rimraf, mkdirp } = require('mz-modules');
const runscript = require('runscript');
const bin = path.join(__dirname, '../bin/doctools.js');

describe('test/deploy.test.js', () => {

  describe.only('deploy', () => {
    const fixtures = path.join(__dirname, 'fixtures');
    const cwd = path.join(fixtures, 'doctools');
    before(function* () {
      yield mkdirp(cwd);
      yield runscript('git clone -b test-branch --depth 1 git@github.com:eggjs/doctools.git', { cwd: fixtures });
    });
    after(() => rimraf(cwd));

    it('should work', function* () {
      yield coffee.fork(bin, [ 'deploy' ], { cwd })
        .debug()
        .expect('code', 0)
        .end();
    });
  });
});
