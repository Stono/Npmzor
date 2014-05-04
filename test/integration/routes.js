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
    
    mockRegistryManager.setup
      .getModule
      .toCallbackWith([undefined, '']);

    var routes = new require('../../lib/routes')
      .Routes(mockConfig, mockRegistryManager);
    server = http.createServer(routes.requestHandler);
    server.listen(mockConfig.port, done);
  });

  after(function(done) {
    server.close(done);
  });

  // { url: 'mkdirp/-/mkdirp-1.0.10.tgz', code: 200 }
  // { url: 'mkdirp/-/mkdirp-1.0.10-1.tgz', code: 200 }
  // Need to accomodate the above tests better... had to remove for now
  var urls = [
    { url: 'mkdirp', code: 200 },
    { url: 'mkdirp/0.1.0', code: 200 },
    { url: 'mkdirp/0.3.4', code: 200 },
    { url: 'mkdirp/12.1.0', code: 404 },
    { url: 'mkdirp/12.1.20', code: 404 },
    { url: 'mkdirp/-/some-module.tgz', code: 404 },
    { url: 'mkdirp/-/some-module.zip', code: 404 },
    { url: 'mkdirp/some-module.tgz', code: 404 }
  ];

  _.forEach(urls, function(url) {
    it('Should return status ' + url.code + ' for ' + url.url, function(done) {
      restler.get(mockConfig.url + '/' + url.url)
      .on('complete', function(result, res) {
        assert.equal(res.statusCode, url.code);
        done();
      });
    });
  });
  
});

