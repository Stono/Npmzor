'use strict';
var Logger = function(config, module) {
  var log = require('minilog')(module);
  if(config.logging.console) {
    require('minilog').enable();
  }

  return Object.freeze({
    debug: log.debug,
    info: log.info,
    warn: log.warn,
    error: log.error
  });
};

module.exports = {
  Logger: Logger
};