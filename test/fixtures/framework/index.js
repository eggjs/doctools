'use strict';

const egg = require('egg');

const Application = egg.Application;
const Agent = egg.Agent;
const EGG_PATH = Symbol.for('egg#eggPath');

class DemoAgent extends Agent {
  get [EGG_PATH]() {
    return __dirname;
  }
}

class DemoApplication extends Application {
  get [EGG_PATH]() {
    return __dirname;
  }
}

Object.assign(exports, egg);
exports.Application = DemoApplication;
exports.Agent = DemoAgent;
