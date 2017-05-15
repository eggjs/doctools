'use strict';

const os = require('os');
const path = require('path');
const fs = require('mz/fs');
const { existsSync } = require('fs');
const mkdirp = require('mz-modules/mkdirp');
const runscript = require('runscript');
const debug = require('debug')('jsdoc');

const PATH = process.env.PATH;
const tmp = path.join(os.tmpdir(), 'jsdoc');

module.exports = function* ({ baseDir, target }) {
  const config = yield getConfig({ baseDir });
  yield runscript(`jsdoc -c ${config} -d ${target} --verbose`, {
    env: {
      PATH: `${path.join(__dirname, '../node_modules/.bin')}:${PATH}`,
    },
  });
};

class Source extends Set {
  constructor({ baseDir }) {
    super();

    this.baseDir = baseDir;

    for (const unit of this.getLoadUnits()) {
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

  getLoadUnits() {
    const baseDir = this.baseDir;
    const EGG_LOADER = Symbol.for('egg#loader');
    const EGG_PATH = Symbol.for('egg#eggPath');
    const Application = require(baseDir).Application;
    const AppWorkerLoader = require(baseDir).AppWorkerLoader;

    class JsdocLoader extends AppWorkerLoader {
      // only load plugin
      // loadConfig() { this.loadPlugin(); }
      // do nothing
      load() {}
    }

    class JsdocApplication extends Application {
      get [EGG_LOADER]() {
        return JsdocLoader;
      }
      get [EGG_PATH]() {
        return baseDir;
      }
    }

    const app = new JsdocApplication({
      baseDir: tmp,
    });
    const loadUnits = app.loader.getLoadUnits();
    app.close();
    return loadUnits;
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
