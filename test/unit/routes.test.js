'use strict';
var assert     = require('assert');
var http       = require('http');
var restler    = require('restler');
var _          = require('lodash');
var deride     = require('deride');
var fs         = require('fs');

var mockConfig = require('../mockConfig').getNoProxyConfig();
var RegistryManager = require('../../lib/registryManager').RegistryManager;

describe('Routing Configuration (routes)', function() {
  var server;

  before(function(done) {
    var registryManager = new RegistryManager(mockConfig);
    var mockRegistryManager = deride.wrap(registryManager);
    
    var MockFs = function() {
      var MockReadStream = function() {
        var pipe = function(res) {
          res.end('fake');
        };
        
        return {
          pipe: pipe
        };
      };
      
      var createReadStream = function() {
        return new MockReadStream();
      };
      
      return {
        createReadStream: createReadStream
      };
    };
    
    var MockMultiparty = function() {
      
      var Form = function() {
        var parse = function (req, callback) {
          callback(null, [], 
            { package: 
              [
                {
                  fieldName: 'package',
                  path: '/tmp/28670-1x1i0pm.tgz',
                }
              ]
            }
          );
        };
        
        return {
          parse: parse
        };
      };
      return {
        Form: Form
      };
    };
    
    mockRegistryManager.setup
      .getModuleIndex
      .toCallbackWith([undefined, JSON.parse(fs.readFileSync(__dirname + '/../data/sample-requests/mkdirp'))]);
    
    mockRegistryManager.setup
      .getModule
      .toCallbackWith([undefined, 'fake-path']);

    mockRegistryManager.setup
      .addInternalModule
      .toCallbackWith([undefined, 'fake-path', 'fake-version']);
      
    var routes = new require('../../lib/routes')
      .Routes(mockConfig, mockRegistryManager, new MockFs(), new MockMultiparty());
    server = http.createServer(routes.requestHandler);
    server.listen(mockConfig.port, done);
  });

  after(function(done) {
    server.close(done);
  });

  var urls = [
    { url: 'mkdirp', code: 200 },
    { url: 'htmlparser2', code: 200 },
    { url: 'underscore.tostring', code: 200 },
    { url: 'buffer-crc32', code: 200 },
    { url: 'mkdirp/1.0.2-1.2.3', code: 200},
    { url: 'mkdirp/0.1.0', code: 200 },
    { url: 'mkdirp/0.3.4', code: 200 },
    { url: 'mkdirp/-/mkdirp-1.0.10.tgz', code: 200 },
    { url: 'mkdirp/-/mkdirp-1.0.10-1.tgz', code: 200 },
    { url: 'socket.io/0.9.14', code: 200 },
    { url: 'underscore.string/-/underscore.string-2.2.1.tgz', code: 200 },
    { url: 'my-pack/-/my-pack-0.0.1-9.tgz', code: 200 },
    { url: 'esprima-fb/-/esprima-fb-3001.0001.0000-dev-harmony-fb.tgz', code: 200 },
    { url: 'favicon.ico', code: 404 },
    { url: 'mkdirp/12.1.0', code: 404 },
    { url: 'mkdirp/12.1.20', code: 404 },
    { url: 'mkdirp/-/some-module.tgz', code: 404 },
    { url: 'mkdirp/-/some-module.zip', code: 404 },
    { url: 'mkdirp/some-module.tgz', code: 404 },
    { url: 'simple-empty-app', code: 200, method: 'put'},
    { url: 'mkdirp/latest', code: 200 },
    { url: 'mkdirp/-/mkdirp-latest', code: 200 },
    { url: 'mkdirp/*', code: 200 }
  ];

  _.forEach(urls, function(url) {
    it('Should return status ' + url.code + ' for ' + url.url, function(done) {
      restler[url.method || 'get'](mockConfig.url + '/' + url.url)
      .on('complete', function(result, res) {
        assert.equal(res.statusCode, url.code);
        done();
      });
    });
  });
  
});

