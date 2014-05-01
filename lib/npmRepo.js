'use strict';
var url = require('url');

var NpmRepo = function(config, registry, http) {

  var getModuleIndexUrl = function(module) {
    return registry + '/' + module;
  };

  var getModuleIndex = function(module, callback) {
    var target = url.parse(getModuleIndexUrl(module));
    var opts = {
      method: 'GET', 
      path: target.path, 
      port: target.port, 
      hostname: target.hostname
    };

    http.get(opts, function(res) {
      var parsedResponse = JSON.parse(res.body);
      callback(null, parsedResponse);
    });
  };

  return Object.freeze({
    getModuleIndex: getModuleIndex
  });
};

module.exports = {
  NpmRepo: NpmRepo
};
