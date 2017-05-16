'use strict';

const path = require('path');
const coffee = require('coffee');
const { sleep } = require('mz-modules');
const request = require('supertest');
const bin = path.join(__dirname, '../bin/doctools.js');


describe.only('test/server.test.js', () => {

  describe('launsh server', () => {
    const url = 'http://localhost:4000';
    const cwd = path.join(__dirname, 'fixtures/framework');
    // const target = path.join(cwd, 'run/doctools');
    let proc;
    before(function* () {
      const c = coffee.fork(bin, [ 'server' ], { cwd });
      c.debug()
        .expect('code', 0)
        .end();

      // wait server listen
      yield sleep(10000);
      proc = c.proc;
    });
    after(() => {
      proc.kill();
    });

    it('request index', () => {
      return request(url)
        .get('/')
        .expect(200)
        .expect(/Latest: <strong>1.0.0<\/strong>/);
    });

    it('request api', () => {
      return request(url)
        .get('/api/')
        .expect(200)
        .expect(/Egg/)
        .expect(/Application/);
    });

    it('request intro', function* () {
      yield request(url)
        .get('/en/intro/')
        .expect(200)
        .expect(/English document/);

      yield request(url)
        .get('/zh-cn/intro/')
        .expect(200)
        .expect(/中文文档/);
    });
  });

});
