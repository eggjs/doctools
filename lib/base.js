'use strict';

const path = require('path');
const fs = require('mz/fs');
const cpy = require('cpy');
const Command = require('common-bin');
const { mkdirp, rimraf } = require('mz-modules');
const Zlogger = require('zlogger');
const runscript = require('runscript');
const getPlugins = require('egg-utils').getPlugins;

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
        describe: 'relative path to the document',
      },
      external: {
        type: 'array',
        describe: 'external framework git repository',
      },
    };
  }

  * run({ argv }) {
    let baseDir = argv._[0] || process.cwd();
    argv.baseDir = baseDir = this.baseDir = path.resolve(baseDir);
    // $baseDir/run/doctools
    argv.targetDir = this.targetDir = path.join(argv.baseDir, 'run/doctools');
    argv.docToolsDir = path.dirname(__dirname);

    yield this.copyFiles(argv);
    yield this.generateVersion(argv);
    yield this.generatePlugin(argv);

    this.logger.info('Build API document');
    yield jsdoc({ baseDir, target: path.join(argv.targetDir, 'public/api') });

    this.hexo = new Hexo(argv.targetDir, {
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

  * copyFiles({ baseDir, targetDir, docPath, external }) {
    // doctools/lib/themes > $baseDir/run/doctools/themes
    this.logger.info('Copy theme from %s', __dirname);
    yield cpy('themes/**/*', targetDir, { cwd: __dirname, nodir: true, parents: true });

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
    yield fs.writeFile(path.join(targetDir, 'package.json'), JSON.stringify(hexoPkg, null, 2));
    this.logger.info('Generate package.json');

    // Copy contributing
    // $baseDir/CONTRIBUTING.{locale}.md > $targetDir/source/{locale}/contributing.md
    const contribPath = path.join(baseDir, 'CONTRIBUTING.md');
    if (yield fs.exists(contribPath)) {
      yield cpy(contribPath, path.join(targetDir, 'source/en'), { rename });
      yield cpy(contribPath, path.join(targetDir, 'source/zh-cn'), { rename });
      this.logger.info('Copy CONTRIBUTING.md');
    }

    const contribCnPath = path.join(baseDir, 'CONTRIBUTING.zh-CN.md');
    if (yield fs.exists(contribCnPath)) {
      yield cpy(contribCnPath, path.join(targetDir, 'source/zh-cn'), { rename });
      this.logger.info('Copy CONTRIBUTING.zh-CN.md');
    }

    yield checkMarkdownTitle(path.join(targetDir, 'source/zh-cn/contributing.md'));
    yield checkMarkdownTitle(path.join(targetDir, 'source/en/contributing.md'));

    // download external framework
    const externalPath = path.join(targetDir, 'external');
    const dirs = yield this.downloadExternal(external, externalPath);
    for (const dir of dirs) {
      yield this.copyFramework(path.join(externalPath, dir, docPath), targetDir);
    }

    yield this.copyFramework(path.join(baseDir, docPath), targetDir);

    function rename() { return 'contributing.md'; }
  }

  * copyFramework(docPath, targetDir) {
    // $baseDir/docs/* > $targetDir/*
    this.logger.info('Copy files from %s', docPath);
    yield cpy('**/*', targetDir, { cwd: docPath, nodir: true, parents: true });

    // $baseDir/docs/source/languages > $targetDir/themes/egg/languages
    const languagePath = path.join(docPath, 'source/languages');
    if (yield fs.exists(languagePath)) {
      this.logger.info('Copy files from %s', languagePath);
      yield cpy('*.yml', path.join(targetDir, 'themes/egg/languages'), { cwd: languagePath });
    }

    // $baseDir/docs/theme/* > $targetDir/themes/egg
    const themePath = path.join(docPath, 'theme');
    yield cpy('**/*', path.join(targetDir, 'themes/egg'), { cwd: themePath, nodir: true, parents: true });
  }

  * generateVersion() {
    const pkg = require(`${this.baseDir}/package.json`);
    const eggVersion = pkg.version;
    const nodeVersion = pkg.engines && pkg.engines.node;
    yield this._writeData('versions.yml', `egg: ${eggVersion}\nnode: "${nodeVersion}"\n`);
  }

  * generatePlugin({ baseDir }) {
    const plugins = getPlugins({ framework: baseDir });
    const sourceDir = path.join(this.targetDir, 'source');
    let data = '';

    for (const name of Object.keys(plugins)) {
      const plugin = plugins[name];
      const readmePath = path.join(plugin.path, 'README.md');
      let exists = yield fs.exists(readmePath);
      if (!exists) continue;

      yield cpy(readmePath, path.join(sourceDir, 'en/plugins'), { rename() { return `${name}.md`; } });
      yield cpy(readmePath, path.join(sourceDir, 'zh-cn/plugins'), { rename() { return `${name}.md`; } });
      this.logger.info('Copy README of %s from %s', name, readmePath);

      const readmeCNPath = path.join(plugin.path, 'README.zh_CN.md');
      exists = yield fs.exists(readmeCNPath);
      if (exists) {
        yield cpy(readmeCNPath, path.join(sourceDir, 'zh-cn/plugins'), { rename() { return `${name}.md`; } });
        this.logger.info('Copy README of %s from %s', name, readmeCNPath);
      }

      yield checkMarkdownTitle(path.join(sourceDir, 'en/plugins', `${name}.md`));
      yield checkMarkdownTitle(path.join(sourceDir, 'zh-cn/plugins', `${name}.md`));

      data += `- ${name}\n`;
    }

    yield this._writeData('plugins.yml', data);
  }

  * downloadExternal(external, externalPath) {
    if (!external || !external.length) return [];

    yield rimraf(externalPath);
    yield mkdirp(externalPath);

    const opt = { pipe: 'ignore' };
    const names = [];
    for (const repo of external) {
      this.logger.info('clone %s', repo);
      const name = String(Date.now());
      yield runscript(`git clone --depth 1 ${repo} ${externalPath}/${name}`, opt);
      names.push(name);
    }
    return names;
  }

  * _writeData(filename, data) {
    const filepath = `${this.targetDir}/source/_data/${filename}`;
    yield mkdirp(path.dirname(filepath));
    yield fs.writeFile(filepath, data);
    this.logger.info('Generate %s', filepath);
  }
}

module.exports = DocToolsBase;

function* checkMarkdownTitle(markdown) {
  const content = yield fs.readFile(markdown, 'utf8');
  let result = content;
  // # egg-security
  const reg1 = /^\s*#\s*(.+?)\n/;
  // egg-security
  // ===
  const reg2 = /^(.+?)\n===+\n/;
  if (content.match(reg1)) {
    result = content.replace(reg1, (_, title) => `title: "${title}"\n---\n`);
  } else if (content.match(reg2)) {
    result = content.replace(reg2, (_, title) => `title: "${title}"\n---\n`);
  }

  if (content !== result) yield fs.writeFile(markdown, result);
}
