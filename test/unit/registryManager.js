'use strict';
var http            = require('http');
var assert          = require('assert');
var NpmRegistry     = require('../../lib/npmRegistry').NpmRegistry;
var RegistryManager = require('../../lib/registryManager').RegistryManager;
var HttpUtil        = require('../../lib/httpUtil').HttpUtil;

var mockConfig  = require('../mockConfig').getNoProxyConfig();

describe('Registry Manager (registryManager)', function() {

  var registryManager;
  var npmRegistry;
  var registryRoot = 'http://127.0.0.1';

  beforeEach(function() {
    var httpUtil    = new HttpUtil(mockConfig, http);
    npmRegistry     = new NpmRegistry(httpUtil, registryRoot);
    registryManager = new RegistryManager(mockConfig);    
  });
  
  it('Should accept a new Registry', function(done) {
    registryManager.addRegistry(npmRegistry, function(err) {
      assert.equal(err, null);
      registryManager.getRegistry(registryRoot, function(err, registry) {
        assert.equal(err, null);
        assert.equal(registry, npmRegistry);
        done();
      });      
    }); 
  });
  
  it('Should not accept a Registry that already exists', function(done) {
    registryManager.addRegistry(npmRegistry, function(err) {
      assert.equal(err, null);
      registryManager.addRegistry(npmRegistry, function(err) {
        assert(err !== undefined);
        done();
      });      
    });
  });
  
});