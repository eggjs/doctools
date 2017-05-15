'use strict';

const path = require('path');
const coffee = require('coffee');
const bin = path.join(__dirname, '../bin/doctools.js');


describe.only('test/build.test.js', () => {

  it('should work', function* () {
    const cwd = path.join(__dirname, '../node_modules/egg');
    yield coffee.fork(bin, [ 'build' ], { cwd })
      .debug()
      .expect('code', 0)
      .end();
  });

});
