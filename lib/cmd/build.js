'use strict';

const Command = require('../base');

class BuildCommand extends Command {

  hexoBuild() {}

  get description() {
    return 'Build document';
  }
}

module.exports = BuildCommand;
