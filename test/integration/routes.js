'use strict';
var assert     = require('assert');
var http       = require('http');
var restler    = require('restler');
var _          = require('lodash');
var mockConfig = require('../mockConfig').getNoProxyConfig();
var deride     = require('deride');
var fs         = require('fs');
var RegistryManager = require('../../lib/registryManager').RegistryManager;

describe('Routing Configuration (routes)', function() {
  var server,
      endpoint = 'http://127.0.0.1:9615';

  before(function(done) {
    var registryManager = new RegistryManager(mockConfig);
    var mockRegistryManager = deride.wrap(registryManager);

    mockRegistryManager.setup
      .getModuleIndex
      .toCallbackWith([undefined, JSON.parse(fs.readFileSync(__dirname + '/../data/sample-requests/mkdirp'))]);
    
    var routes = new require('../../lib/routes')
      .Routes(mockConfig, mockRegistryManager);
    server = http.createServer(routes.requestHandler);
    server.listen(9615, done);
  });

  after(function(done) {
    server.close(done);
  });

  var urls = [
    { url: 'readable-stream', code: 200 },
    { url: 'readable_stream', code: 200 },
    { url: 'r34dable_stream', code: 200 },
    { url: 'readable-stream/0.1.0', code: 200 },
    { url: 'readable-stream/0.3.4', code: 200 },
    { url: 'readable-stream/12.1.0', code: 404 },
    { url: 'readable-stream/12.1.20', code: 404 },
    { url: 'readable-stream/-/readable-stream-1.0.27-1.tgz', code: 200 },
    { url: 'readable-stream/-/readable-stream.tgz', code: 404 },
    { url: 'readable-stream/-/readable-stream.zip', code: 404 },
    { url: 'readable-stream/readable-stream.tgz', code: 404 }
  ];

  _.forEach(urls, function(url) {
    it('Should return status ' + url.code + ' for ' + url.url, function(done) {
      restler.get(endpoint + '/' + url.url)
      .on('complete', function(result, res) {
        assert.equal(result instanceof Error, false, result.toString());
        assert.equal(res.statusCode, url.code);
        done();
      });
    });
  });
  
});

