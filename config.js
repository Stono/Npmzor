'use strict';
var Config = function() {
  var environment = (process.env.ENV || 'dev');
  var config = require('./config/' + environment + '/' + environment);

  var funcs = Object.freeze({
    config: config
  });
  return funcs;
};

module.exports = new Config().config;