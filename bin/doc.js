#!/usr/bin/env node

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
}

const d = new DocTools();
d.start();
