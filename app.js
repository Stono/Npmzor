/*
 * NPMzor
 * An NPM proxy with the ability to aggregate multiple NPM repositories
 */
'use strict';
var http            = require('http');
var config          = require('./config');
var log             = new require('./lib/logger').Logger(config, 'App');
var RegistryManager = require('./lib/registryManager').RegistryManager;

var registryManager = new RegistryManager(config);
var routes = new require('./lib/routes').Routes(config, registryManager);
var server = http.createServer(routes.requestHandler);

server.listen(config.port);
log.debug('NPMZor started on port ' + config.port);