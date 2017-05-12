'use strict';

const path = require('path');
const fs = require('mz/fs');
const rimraf = require('mz-modules/rimraf');
const cpy = require('cpy');
const Command = require('common-bin');

const Hexo = require('hexo');
const pkg = require('../package.json');

const themePath = path.join(__dirname, 'themes');

process.env.NODE_PATH = path.join(__dirname, '../node_modules');

class DocHexo extends Hexo {
  constructor(base, args) {
    super(base, args);
    this.plugin_dir = path.join(__dirname, '../node_modules');
  }
}

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
    // $baseDir/run/devtools
    argv.tmpDir = path.join(argv.baseDir, 'run/devtools');
    argv.docToolsDir = path.dirname(__dirname);

    yield this.copyFiles(argv);

    this.hexo = new DocHexo(argv.tmpDir, {
      debug: true,
      silent: false,
    });
    yield this.hexo.init();
  }

  * hexoBuild() {
    const { argv } = this.context;
    const linkPath = path.join(argv.docPath, 'themes');

    yield fs.symlink(themePath, linkPath, 'dir');
    yield this.hexo.call('generate', {});
    yield rimraf(linkPath);
  }

  * copyFiles({ tmpDir, docPath }) {
    // $baseDir/docs/* > $baseDir/run/devtools/*
    yield cpy([ '**/*' ], tmpDir, { cwd: docPath, nodir: true, parents: true });
    // lib/themes > $baseDir/run/devtools/themes
    yield cpy([ 'themes/**/*' ], tmpDir, { cwd: __dirname, nodir: true, parents: true });

    // $baseDir/run/devtools/package.json
    const hexoPkg = {
      hexo: {},
      dependencies: {},
    };
    const deps = pkg.dependencies;
    for (const name of Object.keys(deps)) {
      if (!/^hexo-/.test(name)) continue;
      hexoPkg.dependencies[name] = deps[name];
    }
    yield fs.writeFile(path.join(tmpDir, 'package.json'), JSON.stringify(hexoPkg, null, 2));
  }

  mergeFramework() {}

}

module.exports = DocToolsBase;
