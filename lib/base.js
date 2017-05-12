'use strict';

const path = require('path');
const fs = require('mz/fs');
const rimraf = require('mz-modules/rimraf');
const Command = require('common-bin');

const Hexo = require('./hexo');

const themePath = path.join(__dirname, 'themes');

class DocToolsBase extends Command {

  constructor(rawArgv) {
    super(rawArgv);
    this.options = {
      docPath: {
        type: 'string',
        default: 'docs',
      },
    };
  }

  * run({ argv }) {
    let baseDir = argv._[0] || process.cwd();
    argv.baseDir = baseDir = path.resolve(baseDir);
    console.log(argv.docPath);

    this.hexo = new Hexo(argv);
    yield this.hexo.init();
  }

  * hexoBuild() {
    const { argv } = this.context;
    const linkPath = path.join(argv.docPath, 'themes');

    yield fs.symlink(themePath, linkPath, 'dir');
    yield this.hexo.call('generate', {});
    yield rimraf(linkPath);
  }

  mergeFramework() {}

}

module.exports = DocToolsBase;
