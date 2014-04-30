'use strict';
var url = require('url');

var NpmRepo = function(registry, http) {

  var getIndexUrl = function(module) {
    return registry + '/' + module;
  };

  var getIndex = function(module, callback) {
    var target = url.parse(getIndexUrl(module));
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
    getIndex: getIndex
  });
};

module.exports = {
  NpmRepo: NpmRepo
};
