'use strict';

var NpmRegistry = function(config, httpUtil, registry) {

  var getRoot = function() {
    return registry;
  };
  
  // This will rewrite any JSON files to point to us
  var rewriteRegistry = function(json) {
    var urlRegex        = /^(.*\/\/[a-zA-Z0-9.]+)\/?:?([.*]+)?(.*)$/;
    var versionsNumbers = Object.keys(json.versions);
    for (var i = versionsNumbers.length - 1; i >= 0; i--) {
      var currentVersionNumber = versionsNumbers[i];
      var currentVersion       = json.versions[currentVersionNumber];
      var extract  = currentVersion.dist.tarball.match(urlRegex);
      currentVersion.dist.tarball = currentVersion.dist.tarball.replace(extract[0], config.url);
    }
    return json;
  };

  var getModuleIndexUrl = function(module) {
    return getRoot() + '/' + module;
  };

  var getModuleIndex = function(module, callback) {
    httpUtil.getJsonUrl(getModuleIndexUrl(module), function(err, json) {
      if(err) { callback(err, json); return }
      callback(undefined, rewriteRegistry(json));
    });
  };
  
  return Object.freeze({
    getRoot: getRoot,
    getModuleIndex: getModuleIndex
  });

};

module.exports = {
  NpmRegistry: NpmRegistry
};
