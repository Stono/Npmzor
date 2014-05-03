/*
 * NPMzor
 * An NPM proxy with the ability to aggregate multiple NPM repositories
 */
'use strict';
var http            = require('http');
var config          = require('./config');
var log             = new require('./lib/logger').Logger(config, 'App');

// Cache DB setup
var Db = require('tingodb')().Db;
var db = new Db('./db/' + process.env.ENV, {});

var RegistryManager = require('./lib/registryManager').RegistryManager;
var RegistryCache   = require('./lib/registryCache').RegistryCache;

var registryCache   = new RegistryCache(config, db);
var registryManager = new RegistryManager(config, registryCache);
var routes = new require('./lib/routes').Routes(config, registryManager);
var server = http.createServer(routes.requestHandler);

server.listen(config.port);
log.debug('NPMZor started on port ' + config.port);