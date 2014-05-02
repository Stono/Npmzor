'use strict';
var http            = require('http');
var assert          = require('assert');
var deride          = require('deride');
var NpmRegistry     = require('../../lib/npmRegistry').NpmRegistry;
var RegistryManager = require('../../lib/registryManager').RegistryManager;
var HttpUtil        = require('../../lib/httpUtil').HttpUtil;

var mockConfig  = require('../mockConfig').getNoProxyConfig();

describe('Registry Manager (registryManager)', function() {

  var registryManager;
  var npmRegistry;
  var registryRoot = 'registry1';

  beforeEach(function() {
    var httpUtil    = new HttpUtil(mockConfig, http);
    npmRegistry     = new NpmRegistry(mockConfig, httpUtil, registryRoot);
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

  describe('Index Queries', function() {
    
    it('Should forward requests to the external Registry', function(done) {
      var mockRegistry = deride.wrap(npmRegistry);
      mockRegistry.setup.getModuleIndex.toDoThis(function(name, callback) {
        callback(undefined, {
          _id: 'fake-repo'
        });
      });
      
      registryManager.addRegistrySync(mockRegistry);    
      registryManager.getModuleIndex('fake-repo', function(err, details) {
        assert.equal(err, undefined, err);
        assert.equal(details._id, 'fake-repo');
        mockRegistry.expect.getModuleIndex.called.once();
        done();
      });
    });
    
    it('Should not hit the second registry if the first returned a positive result', function(done) {
      var mockRegistry1 = deride.wrap(npmRegistry);
      mockRegistry1.setup.getModuleIndex.toDoThis(function(name, callback) {
        callback(undefined, {
          _id: 'fake-repo'
        });
      });
      
      var mockRegistry2 = deride.wrap(npmRegistry);
      mockRegistry2.setup.getRoot.toReturn('registry2');
      
      registryManager.addRegistrySync(mockRegistry1);
      registryManager.addRegistrySync(mockRegistry2);
      
      registryManager.getModuleIndex('fake-repo', function(err, details) {
        assert.equal(err, undefined, err);
        assert.equal(details._id, 'fake-repo');
        mockRegistry1.expect.getModuleIndex.called.once();
        mockRegistry2.expect.getModuleIndex.called.never();
        done();
      });
    });
    
    it('Should hit the second registry if the first returned a negative result', function(done) {
      var mockRegistry1 = deride.wrap(npmRegistry);    
      var mockRegistry2 = deride.wrap(npmRegistry);
      mockRegistry1.setup.getModuleIndex.toDoThis(function(name, callback) {
        callback(undefined, null);
      });
      
      mockRegistry2.setup.getRoot.toReturn('registry2');
      mockRegistry2.setup.getModuleIndex.toDoThis(function(name, callback) {
        callback(undefined, {
          _id: 'fake-repo'
        });
      });
      
      registryManager.addRegistrySync(mockRegistry1);
      registryManager.addRegistrySync(mockRegistry2);
      
      registryManager.getModuleIndex('fake-repo', function(err, details) {
        assert.equal(err, undefined, err);
        assert.equal(details._id, 'fake-repo');
        mockRegistry1.expect.getModuleIndex.called.once();
        mockRegistry2.expect.getModuleIndex.called.once();
        done();
      });
    });
    
    it('Should return an error if no results were found', function(done) {
      registryManager.getModuleIndex('fake-repo-no-results', function(err) {
        assert.notEqual(err, undefined);
        done();
      });      
    });

  });
  
});