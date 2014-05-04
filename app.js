/*
 * NPMzor
 * An NPM proxy with the ability to aggregate multiple NPM repositories
 */
'use strict';
var http            = require('http');
var config          = require('./config');
var log             = new require('./lib/logger').Logger(config, 'App');
var fs              = require('fs');

// Cache DB setup
log.debug('Initialising Cache DB at: ' + config.cache.db);
if(!fs.existsSync(config.cache.db)) {
  fs.mkdirSync(config.cache.db, '0766');
}
var Db = require('tingodb')().Db;
var db = new Db(config.cache.db, {});

var RegistryManager = require('./lib/registryManager').RegistryManager;
var RegistryCache   = require('./lib/registryCache').RegistryCache;

var registryCache   = new RegistryCache(config, db);
var registryManager = new RegistryManager(config, registryCache);
var routes = new require('./lib/routes').Routes(config, registryManager);
var server = http.createServer(routes.requestHandler);

server.listen(config.port);
log.debug('NPMZor started on port ' + config.port);