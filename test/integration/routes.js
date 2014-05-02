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
  var server;

  before(function(done) {
    var registryManager = new RegistryManager(mockConfig);
    var mockRegistryManager = deride.wrap(registryManager);

    mockRegistryManager.setup
      .getModuleIndex
      .toCallbackWith([undefined, JSON.parse(fs.readFileSync(__dirname + '/../data/sample-requests/mkdirp'))]);
    
    var routes = new require('../../lib/routes')
      .Routes(mockConfig, mockRegistryManager);
    server = http.createServer(routes.requestHandler);
    server.listen(mockConfig.port, done);
  });

  after(function(done) {
    server.close(done);
  });

  var urls = [
    { url: 'some-module', code: 200 },
    { url: 'some_module', code: 200 },
    { url: 's0m3_m0dul3', code: 200 },
    { url: 'some-module/0.1.0', code: 200 },
    { url: 'some-module/0.3.4', code: 200 },
    { url: 'some-module/12.1.0', code: 404 },
    { url: 'some-module/12.1.20', code: 404 },
    { url: 'some-module/-/some-module-1.0.27-1.tgz', code: 200 },
    { url: 'some-module/-/some-module.tgz', code: 404 },
    { url: 'some-module/-/some-module.zip', code: 404 },
    { url: 'some-module/some-module.tgz', code: 404 }
  ];

  _.forEach(urls, function(url) {
    it('Should return status ' + url.code + ' for ' + url.url, function(done) {
      restler.get(mockConfig.url + '/' + url.url)
      .on('complete', function(result, res) {
        assert.equal(result instanceof Error, false, result.toString());
        assert.equal(res.statusCode, url.code);
        done();
      });
    });
  });
  
});

