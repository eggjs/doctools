'use strict';

const Command = require('../base');

class ServerCommand extends Command {

  hexoServer() {}

  get description() {
    return 'Start a server for local development';
  }
}

module.exports = ServerCommand;
