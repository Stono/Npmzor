/*
 * NPMzor
 * An NPM proxy with the ability to aggregate multiple NPM repositories
 */
'use strict';
var http     = require('http');
var config   = require('./config');

var routes = new require('./lib/routes').Routes();
var server = http.createServer(routes.requestHandler);

server.listen(config.port);