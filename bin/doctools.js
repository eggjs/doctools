#!/usr/bin/env node

'use strict';

const path = require('path');
const cp = require('child_process');

// set NODE_PATH
// let module under doctools can be required in baseDir
const NODE_PATH = path.join(__dirname, '../node_modules');
const cmd = path.join(__dirname, '../lib/command.js');
const args = process.argv.slice(2);
const opt = {
  env: Object.assign({ NODE_PATH }, process.env),
};
cp.fork(cmd, args, opt);
