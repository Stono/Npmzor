'use strict';
var assert      = require('assert');
var NpmRegistry = require('../../lib/npmRegistry').NpmRegistry;
var HttpUtil    = require('../../lib/httpUtil').HttpUtil;
var http        = require('http');
var mockConfig  = require('../mockConfig');
var fs          = require('fs');

describe('NPM Registry (npmRegistry)', function() {
  var server,
      serverReturns,
      endpoint = 'http://127.0.0.1:9615';

  var sampleData = {
    packageIndex: fs.readFileSync(__dirname + '/../data/sample-requests/mkdirp')
  };

  before(function(done) {
    server = http.createServer(function (req, res) {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(serverReturns);
    }).listen(9615, done);
  });

  after(function(done) {
    server.close(done);
  });

  it('Should proxy package index requests to the external registry and return valid JSON', function(done) {
    serverReturns   = sampleData.packageIndex;
    var config 	    = mockConfig.getNoProxyConfig();
    var httpUtil    = new HttpUtil(config, http);

    var npmRegistry = new NpmRegistry(httpUtil, endpoint);
    npmRegistry.getModuleIndex('mkdirp', function(err, json){
      assert.equal(json._id, 'mkdirp');
      done();
    });
  });
  
});