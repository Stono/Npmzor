/*
 * NPMzor
 * An NPM proxy with the ability to aggregate multiple NPM repositories
 */
'use strict';
var director = require('director');
var http     = require('http');
var config   = require('./config');

var Routes = new require('./lib/routes').Routes(director);
var server = http.createServer(Routes.requestHandler);

server.listen(config.port);