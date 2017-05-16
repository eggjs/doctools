'use strict';

const Command = require('../base');

class BuildCommand extends Command {

  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: doctools build [options] [baseDir]';
  }

  * run(ctx) {
    yield super.run(ctx);
    yield this.hexoBuild();
  }

  get description() {
    return 'Build document';
  }
}

module.exports = BuildCommand;
