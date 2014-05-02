'use strict';
var fs = require('fs');
var Routes = function(config, registryManager) {
  var director = require('director');
  var log = new require('../lib/logger').Logger(config, 'Routing');

  function sendResponse(response, code, json) {
    response.writeHead(code, {'Content-Type': 'application/json'});
    response.end(JSON.stringify(json));
  }
  
  function getStatusCode(err, json) {
    return (err !== undefined || json === null) ? 404 : 200;
  }
  
  function getPackageIndex(name) {
    log.debug(name + ': Get Index');
    /* jshint validthis:true */
    var _this = this;
    registryManager.getModuleIndex(name, function(err, json) {
      var statusCode = getStatusCode(err, json);
      sendResponse(_this.res, statusCode, json);
    });
  }
  
  function getPackageVersion(name, version) {
    log.debug(name + ': Get Index for version ' + version);
    /* jshint validthis:true */
    var _this = this;
    registryManager.getModuleIndex(name, function(err, json) {
      var statusCode = getStatusCode(err, json);
      if(statusCode === 200 && json.versions[version] === undefined) {
        statusCode = 404;
      } else {
        json = json.versions[version];
      }
      sendResponse(_this.res, statusCode, json);
    });    
  }

  function getPackage(index, name, version) {
    log.debug(name + ': Get Package (' + version +')');
    /* jshint validthis:true */
    var _this = this;
    registryManager.getModule(index, name, version, function(err, pathToTemp) {
      _this.res.writeHead(200, { 'Content-Type': 'application/octet-stream' });
      fs.createReadStream(pathToTemp).pipe(_this.res);
    });
  }

  var router = new director.http.Router();
  // /package
  router.get(/([a-zA-Z0-9_-]+)/, getPackageIndex);
  
  // /package/0.1.0
  router.get(/([\w-]+)\/([\d]+(\.\d+){2})/, getPackageVersion);
  
  // /package/-/package-0.1.0.tgz
  router.get(/([\w-]+)\/-\/([\w-]+)-([\d]+(\.\d+){2}).*/, getPackage);
  
  var requestHandler = function(req, res) {
    router.dispatch(req, res, function(err) {
      if(err) {
        log.error('404: ' + req.url);
        res.writeHead(404);
        res.end('Invalid Request');
      }
    });
  };

  return Object.freeze({
    requestHandler: requestHandler
  });

};

module.exports = {
  Routes: Routes
};