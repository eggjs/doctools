'use strict';

const path = require('path');
const coffee = require('coffee');
const docBin = path.join(__dirname, '../../bin/doctools.js');

describe('test/bin/doc.test.js', () => {

  it('should show help', function* () {
    yield coffee.fork(docBin, [ '-h' ])
      // .debug()
      .expect('stdout', /Usage: doctools <command> \[options]/)
      .expect('stdout', /build *Build document/)
      .expect('stdout', /deploy *Build and deploy document/)
      .expect('stdout', /server *Start a server for local development/)
      .expect('code', 0)
      .end();
  });

  it('should show version', function* () {
    yield coffee.fork(docBin, [ '-V' ])
      // .debug()
      .expect('stdout', require('../../package.json').version + '\n')
      .expect('code', 0)
      .end();
  });

});
