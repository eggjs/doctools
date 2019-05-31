'use strict';

const os = require('os');
const path = require('path');
const fs = require('mz/fs');
const { existsSync } = require('fs');
const mkdirp = require('mz-modules/mkdirp');
const resolve = require('resolve');
const runscript = require('runscript');
const debug = require('debug')('jsdoc');
const getLoadUnits = require('egg-utils').getLoadUnits;

const tmp = path.join(os.tmpdir(), 'jsdoc');

module.exports = function* ({ baseDir, target }) {
  const config = yield getConfig({ baseDir });
  const jsdoc = resolve.sync('.bin/jsdoc', { basedir: __dirname });
  yield runscript(`${jsdoc} -c ${config} -d ${target} -r`);
};

class Source extends Set {
  constructor({ baseDir }) {
    super();

    this.baseDir = baseDir;

    for (const unit of getLoadUnits({ framework: baseDir })) {
      this.add(path.join(unit.path, 'app'));
      this.add(path.join(unit.path, 'config'));
      this.add(path.join(unit.path, 'app.js'));
      this.add(path.join(unit.path, 'agent.js'));
      try {
        const entry = require.resolve(unit.path);
        this.add(entry);
      } catch (_) {
        // nothing
      }
    }

    this.add(path.join(this.baseDir, 'lib'));

    this.add(path.join(this.baseDir, 'node_modules/egg-core/index.js'));
    this.add(path.join(this.baseDir, 'node_modules/egg-core/lib'));

    // this.add(path.join(this.baseDir, 'node_modules/egg-logger/index.js'));
    // this.add(path.join(this.baseDir, 'node_modules/egg-logger/lib'));
  }

  add(file) {
    if (existsSync(file)) {
      debug('add %s', file);
      super.add(file);
    }
  }
}

function* getConfig({ baseDir }) {
  yield mkdirp(tmp);

  const configPath = path.join(tmp, 'jsdoc.json');
  const packagePath = path.join(tmp, 'package.json');
  yield fs.writeFile(packagePath, '{"name": "jsdoc"}');

  const source = new Source({ baseDir });
  const config = {
    plugins: [ 'plugins/markdown' ],
    markdown: {
      tags: [ '@example' ],
    },
    source: {
      include: [ ...source ],
      // excludePattern: 'node_modules',
    },
    opts: {
      recurse: true,
      template: path.join(__dirname, 'jsdoc_template'),
    },
    templates: {
      default: {
        outputSourceFiles: true,
      },
    },
  };
  yield fs.writeFile(configPath, JSON.stringify(config));
  return configPath;
}
