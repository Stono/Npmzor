'use strict';
var Routes = function(config) {
  var director = require('director');
  var log = new require('../lib/logger').Logger(config, 'Routing');

  function getPackageIndex(name) {
    log.debug(name + ': Get Index');
    /* jshint validthis:true */
    this.res.writeHead(200, { 'Content-Type': 'text/plain' });
    this.res.end('You requested index ' + name + '\n');
  }

  function getPackage(index, name, version) {
    log.debug(name + ': Get Package (' + version +')');
    /* jshint validthis:true */
    this.res.writeHead(200, { 'Content-Type': 'text/plain' });
    this.res.end('You requested package ' + name + ', version ' + version + ' from ' + index + '\n');
  }

  var router = new director.http.Router();
  router.get('/([a-zA-Z0-9_-]+)', getPackageIndex);
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