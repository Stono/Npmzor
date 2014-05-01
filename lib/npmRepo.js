'use strict';
var NpmRepo = function(httpUtil, registry) {

  var getModuleIndexUrl = function(module) {
    return registry + '/' + module;
  };

  var getModuleIndex = function(module, callback) {
    httpUtil.getJsonUrl(getModuleIndexUrl(module), callback);
  };

  return Object.freeze({
    getModuleIndex: getModuleIndex
  });
};

module.exports = {
  NpmRepo: NpmRepo
};
