'use strict';
var NpmRepo = function(httpUtil, registry) {

  var getRoot = function() {
    return registry;
  };
  
  var getModuleIndexUrl = function(module) {
    return getRoot() + '/' + module;
  };

  var getModuleIndex = function(module, callback) {
    httpUtil.getJsonUrl(getModuleIndexUrl(module), callback);
  };
  
  return Object.freeze({
    getRoot: getRoot,
    getModuleIndex: getModuleIndex
  });

};

module.exports = {
  NpmRepo: NpmRepo
};
