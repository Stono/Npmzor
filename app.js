/*
 * NPMzor
 * An NPM proxy with the ability to aggregate multiple NPM repositories
 */
'use strict';
var http            = require('http');
var config          = require('./config');
var log             = new require('./lib/logger').Logger(config, 'App');
var fs              = require('fs');
var mkdirp          = require('mkdirp');
var Db              = require('tingodb')().Db;

// Cache DB setup
log.debug('Initialising Cache DB at: ' + config.cache.db);

mkdirp(config.cache.db, function(err) {
  if (err) { log.error(err) }
  var db = new Db(config.cache.db, {});
  
  var RegistryManager = require('./lib/registryManager').RegistryManager;
  var RegistryCache   = require('./lib/registryCache').RegistryCache;
  
  var registryCache   = new RegistryCache(config, db, fs);
  var registryManager = new RegistryManager(config, registryCache);
  var routes = new require('./lib/routes').Routes(config, registryManager, fs);
  var server = http.createServer(routes.requestHandler);
  
  server.listen(config.port);
  log.debug('NPMZor started at: ' + config.url);
});
