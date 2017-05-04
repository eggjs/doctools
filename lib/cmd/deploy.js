'use strict';

const BuildCommand = require('./build');

class DeployCommand extends BuildCommand {

  get description() {
    return 'Build and deploy document';
  }
}

module.exports = DeployCommand;
