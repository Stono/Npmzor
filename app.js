/*
 * NPMzor
 * An NPM proxy with the ability to aggregate multiple NPM repositories
 */
'use strict';
var http     = require('http');
var config   = require('./config');
var log      = new require('./lib/logger').Logger(config, 'App');

var routes = new require('./lib/routes').Routes(config);
var server = http.createServer(routes.requestHandler);

server.listen(config.port);
log.debug('NPMZor started on port ' + config.port);