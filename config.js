'use strict';
var mkdirp = require('mkdirp');

var Config = function() {
  var environment = (process.env.ENV || 'dev');
  var config = require('./config/' + environment + '/' + environment);

  var funcs = Object.freeze({
    config: config
  });
  return funcs;
};

var config = new Config().config;

mkdirp.sync(config.db);
mkdirp.sync(config.internal.tgz);
mkdirp.sync(config.cache.tgz);
mkdirp.sync(config.temp);

module.exports = config;
