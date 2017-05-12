'use strict';

const path = require('path');
const Hexo = require('hexo');
const chalk = require('chalk');
const fs = require('mz/fs');
// const Theme = require('hexo/lib/theme');

const defaults = {
  baseDir: process.cwd(),
  docPath: 'docs',
};

const pkg = require('../package.json');

class DocHexo extends Hexo {
  constructor(options) {
    options = Object.assign({}, defaults, options);
    const docPath = path.join(options.baseDir, options.docPath);
    const args = {
      debug: true,
      silent: false,
    };
    super(docPath, args);

    // this.theme_dir = path.join(__dirname, 'themes/egg') + path.sep;
    // this.theme_script_dir = path.join(this.theme_dir, 'scripts') + path.sep;
  }

  * init() {
    const self = this;

    this.log.debug('Hexo version: %s', chalk.magenta(this.version));
    this.log.debug('Working directory: %s', chalk.magenta(this.base_dir));

    // Load internal plugins
    require('hexo/lib/plugins/console')(this);
    require('hexo/lib/plugins/filter')(this);
    require('hexo/lib/plugins/generator')(this);
    require('hexo/lib/plugins/helper')(this);
    require('hexo/lib/plugins/processor')(this);
    require('hexo/lib/plugins/renderer')(this);
    require('hexo/lib/plugins/tag')(this);

    // ignore read package.json
    // https://github.com/hexojs/hexo/blob/master/lib/hexo/update_package.js
    this.env.init = true;

    yield require('hexo/lib/hexo/load_config')(this);

    // const theme = this.config.theme;
    // console.log(theme);

    // this.theme_dir = path.join(__dirname, 'themes', theme) + path.sep;
    // this.theme_script_dir = path.join(this.theme_dir, 'scripts') + path.sep;
    // this.theme = new Theme(this);

    console.log(this.theme_dir);


    yield this.loadPlugins();
    yield this.loadScripts();
    yield this.execFilter('after_init', null, { context: this });

    self.emit('ready');
  }

  * loadPlugins() {
    const deps = pkg.dependencies;
    for (const name of Object.keys(deps)) {
      if (!/^hexo-/.test(name)) continue;
      yield this.loadPlugin(require.resolve(name));
      this.log.debug('Plugin loaded: %s', chalk.magenta(name));
    }
  }

  * loadScripts() {
    const scriptList = [
      this.script_dir,
      this.theme_script_dir,
    ];

    for (const dir of scriptList) {
      console.log(dir);
      const exists = yield fs.exists(dir);
      if (!exists) continue;

      const subdirs = yield fs.readdir(dir);
      for (const file of subdirs) {
        yield this.loadPlugin(path.join(dir, file));
      }
    }
  }
}

module.exports = DocHexo;
