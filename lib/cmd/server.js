'use strict';

const Command = require('../base');

class ServerCommand extends Command {

  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: doctools server [options] [baseDir]';
  }

  * run(ctx) {
    yield super.run(ctx);
    yield this.hexoServer();
  }

  get description() {
    return 'Start a server for local development';
  }
}

module.exports = ServerCommand;
