'use strict';

const path = require('path');
const Hexo = require('hexo');

class DocHexo extends Hexo {
  constructor(base, args) {
    super(base, args);
    this.plugin_dir = path.join(__dirname, '../node_modules');
  }
}

module.exports = DocHexo;
