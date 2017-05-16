'use strict';

const path = require('path');
const Command = require('common-bin');

class DocTools extends Command {
  constructor(rawArgv) {
    super(rawArgv);
    this.usage = 'Usage: doctools <command> [options]';
    this.load(path.join(__dirname, '../lib/cmd'));
    this.yargs.alias('V', 'version');
  }

  errorHandler(err) {
    console.error(err.stack);
    process.exit(1);
  }

}

exports.DocTools = DocTools;
exports.BuildCommand = require('./cmd/build');
exports.ServerCommand = require('./cmd/server');
exports.DeployCommand = require('./cmd/deploy');
