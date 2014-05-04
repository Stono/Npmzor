/*
 * NPMzor
 * An NPM proxy with the ability to aggregate multiple NPM repositories
 */
'use strict';
var http            = require('http');
var mkdirp          = require('mkdirp');

var Logger          = require('./lib/logger').Logger;
var RegistryManager = require('./lib/registryManager').RegistryManager;
var RegistryCache   = require('./lib/registryCache').RegistryCache;
var HttpUtil        = require('./lib/httpUtil').HttpUtil;
var Routes          = require('./lib/routes').Routes;
var config          = require('./config');

// We're going to use tingodb, but you could switch this out to mongodb if you wanted.
var Db              = require('tingodb')().Db;
var log             = new Logger(config, 'App');
var app;

// Cache DB setup
log.debug('Initialising Cache DB at: ' + config.cache.db);

mkdirp(config.cache.db, function(err) {
  if (err) { log.error(err) }
  var db = new Db(config.cache.db, {});
    
  var httpUtil        = new HttpUtil(config);
  var registryCache   = new RegistryCache(config, db);
  var registryManager = new RegistryManager(config, registryCache, httpUtil);
  var routes          = new Routes(config, registryManager);
  var server          = http.createServer(routes.requestHandler);
  
  app = server.listen(config.port); 
  log.debug('NPMZor started at: ' + config.url);
});

module.exports = function() {
  return app;
};
