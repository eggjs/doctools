'use strict';

const BuildCommand = require('./build');

class DeployCommand extends BuildCommand {

  * run(ctx) {
    yield super.run(ctx);
  }

  get description() {
    return 'Build and deploy document';
  }
}

module.exports = DeployCommand;
