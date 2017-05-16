'use strict';

const path = require('path');
const fs = require('mz/fs');
const cpy = require('cpy');
const Command = require('common-bin');
const { mkdirp } = require('mz-modules');
const Zlogger = require('zlogger');

const Hexo = require('./hexo');
const jsdoc = require('./jsdoc');
const pkg = require('../package.json');

class DocToolsBase extends Command {

  constructor(rawArgv) {
    super(rawArgv);
    this.logger = new Zlogger({
      time: false,
    });
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

    this.logger.info('Build API document');
    yield jsdoc({ baseDir, target: path.join(argv.tmpDir, 'public/api') });

    this.hexo = new Hexo(argv.tmpDir, {
      debug: false,
      silent: true,
    });
    yield this.hexo.init();
  }

  * hexoBuild() {
    this.logger.info('Build document');
    yield this.hexo.call('generate', {});
  }

  * hexoServer() {
    this.logger.info('Build document');
    yield this.hexo.call('server', {});
    this.logger.info('Server started at http://localhost:4000');
  }

  * copyFiles({ baseDir, tmpDir, docPath }) {
    // $baseDir/docs/* > $baseDir/run/doctools/*
    this.logger.info('Copy files from %s', docPath);
    yield cpy([ '**/*' ], tmpDir, { cwd: docPath, nodir: true, parents: true });

    // doctools/lib/themes > $baseDir/run/doctools/themes
    this.logger.info('Copy files from %s', __dirname);
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
    this.logger.info('Generate package.json');

    const contribPath = path.join(baseDir, 'CONTRIBUTING.md');
    if (yield fs.exists(contribPath)) {
      yield cpy(contribPath, path.join(tmpDir, 'source/en'), { rename });
      yield cpy(contribPath, path.join(tmpDir, 'source/zh-cn'), { rename });
      this.logger.info('Copy CONTRIBUTING.md');
    }

    const contribCnPath = path.join(baseDir, 'CONTRIBUTING.zh-CN.md');
    if (yield fs.exists(contribCnPath)) {
      yield cpy(contribCnPath, path.join(tmpDir, 'source/zh-cn'), { rename });
      this.logger.info('Copy CONTRIBUTING.zh-CN.md');
    }
  }

  * generateVersion({ baseDir, tmpDir }) {
    const pkg = require(`${baseDir}/package.json`);
    const eggVersion = pkg.version;
    const nodeVersion = pkg.engines && pkg.engines.node;

    const versionPath = `${tmpDir}/source/_data/versions.yml`;
    yield mkdirp(path.dirname(versionPath));
    yield fs.writeFile(versionPath, `egg: ${eggVersion}\nnode: "${nodeVersion}"\n`);
    this.logger.info('Generate %s', versionPath);
  }

}

module.exports = DocToolsBase;

function rename() { return 'contributing.md'; }
