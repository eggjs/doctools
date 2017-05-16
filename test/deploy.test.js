'use strict';

const path = require('path');
const coffee = require('coffee');
const { rimraf } = require('mz-modules');
const bin = path.join(__dirname, '../bin/doctools.js');

describe.skip('test/deploy.test.js', () => {

  describe('deploy', () => {
    const cwd = path.join(__dirname, 'fixtures/framework');
    const target = path.join(cwd, 'run/doctools');
    before(function* () {
      yield coffee.fork(bin, [ 'deploy' ], { cwd })
        .debug()
        .expect('code', 0)
        .end();
    });
    after(() => rimraf(target));

    it('should work', () => {});
  });
});
