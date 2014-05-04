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
      currentVersion.dist.tarball = currentVersion.dist.tarball.replace(extract[1], config.url);
    }
    return json;
  };

  var getModuleIndexUrl = function(module) {
    return getRoot() + '/' + module;
  };
  
  var getModuleUrl = function(index, name, version) {
    return getRoot() + '/' + index + '/-/' + name + '-' + version + '.tgz';
  };

  var getTemporaryLocation = function() {
    return config.temp + '/' + Date.now().toString(12);
  };

  var getModuleIndex = function(module, callback) {
    httpUtil.getJsonUrl(getModuleIndexUrl(module), function(err, json) {
      if(err) { callback(err, json); return }
      callback(undefined, rewriteRegistry(json));
    });
  };
  
  var getModule = function(index, name, version, callback) {
    var moduleUrl = getModuleUrl(index, name, version);
    var target    = getTemporaryLocation();
    httpUtil.getBinaryUrl(moduleUrl, target, function(err) {
      callback(err, target);
    });
  };

  return Object.freeze({
    getRoot: getRoot,
    getModule: getModule,
    getModuleIndex: getModuleIndex
  });

};

module.exports = {
  NpmRegistry: NpmRegistry
};
