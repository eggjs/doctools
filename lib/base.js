'use strict';

const path = require('path');
const fs = require('mz/fs');
const cpy = require('cpy');
const Command = require('common-bin');
const { mkdirp } = require('mz-modules');

const Hexo = require('./hexo');
const jsdoc = require('./jsdoc');
const pkg = require('../package.json');

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
    // $baseDir/run/doctools
    argv.tmpDir = path.join(argv.baseDir, 'run/doctools');
    argv.docToolsDir = path.dirname(__dirname);

    yield this.copyFiles(argv);
    yield this.generateVersion(argv);
    yield jsdoc({ baseDir, target: path.join(argv.tmpDir, 'public/api') });

    this.hexo = new Hexo(argv.tmpDir, {
      debug: true,
      silent: false,
    });
    yield this.hexo.init();
  }

  * hexoBuild() {
    yield this.hexo.call('generate', {});
  }

  * hexoServer() {
    yield this.hexo.call('server', {});
  }

  * copyFiles({ tmpDir, docPath }) {
    // $baseDir/docs/* > $baseDir/run/doctools/*
    yield cpy([ '**/*' ], tmpDir, { cwd: docPath, nodir: true, parents: true });
    // doctools/lib/themes > $baseDir/run/doctools/themes
    yield cpy([ 'themes/**/*' ], tmpDir, { cwd: __dirname, nodir: true, parents: true });

    // generate $baseDir/run/doctools/package.json
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

  * generateVersion({ baseDir, tmpDir }) {
    const pkg = require(`${baseDir}/package.json`);
    const eggVersion = pkg.version;
    const nodeVersion = pkg.engines && pkg.engines.node;

    const versionPath = `${tmpDir}/source/_data/versions.yml`;
    yield mkdirp(path.dirname(versionPath));
    yield fs.writeFile(versionPath, `egg: ${eggVersion}\nnode: "${nodeVersion}"\n`);
  }

  mergeFramework() {}

}

module.exports = DocToolsBase;
