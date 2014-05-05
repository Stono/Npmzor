'use strict';

//var NpmRegistry      = require('../../lib/npmRegistry').NpmRegistry;
var RegistryManager  = require('../../lib/registryManager').RegistryManager;
var RegistryCache    = require('../../lib/registryCache').RegistryCache;
var HttpUtil         = require('../../lib/httpUtil').HttpUtil;
var InternalRegistry = require('../../lib/internalRegistry').InternalRegistry;

var Db              = require('tingodb')().Db;    
var mkdirp = require('mkdirp');
var assert = require('assert');
var deride = require('deride');

var mockConfig  = require('../mockConfig').getNoProxyConfig();         
var testUtil   = new require('../testUtil').TestUtil(mockConfig);

describe('Registry Manager Internal Registry Interaction', function() {

  var internalRegistry,
      registryManager,
      mockCache;
  
  beforeEach(function(done) {
    testUtil.clearAll();
    mkdirp(mockConfig.db, function() {
      var httpUtil    = new HttpUtil(mockConfig);
      var db = new Db(mockConfig.db, {});
      
      internalRegistry = new InternalRegistry(mockConfig, db);

      mockCache   = deride.wrap(new RegistryCache(mockConfig, db));
      mockCache.setup.getIndex.toCallbackWith([undefined, null]);
      mockCache.setup.addIndex.toCallbackWith([undefined, null]);
      
      registryManager = new RegistryManager(mockConfig, mockCache, httpUtil, internalRegistry);
      done();
    });    
  });
  
  it('Should return an index stored in the internal registry', function(done) {
    var path = __dirname + '/../data/sample-files/simple-empty-app-0.0.1.tgz';
    internalRegistry.addModule(path, function() {
      registryManager.getModuleIndex('simple-empty-app', function(err, details) {
        assert.equal(err, undefined, err);
        assert.equal(details._id, 'simple-empty-app');
        done();
      });
    });
  });

  it('Should return a module stored in the internal registry', function(done) {
    var path = __dirname + '/../data/sample-files/simple-empty-app-0.0.1.tgz';
    internalRegistry.addModule(path, function() {
      registryManager.getModule('simple-empty-app', 'simple-empty-app', '0.0.1', function(err, path) {
        assert.equal(err, undefined, err);
        assert(path.indexOf('internal/simple-empty-app/simple-empty-app/0.0.1') > -1);
        console.log(path);
        done();
      });
    });
  });
  
  it('Should not touch the cache when getting internal stuff', function(done) {
    var path = __dirname + '/../data/sample-files/simple-empty-app-0.0.1.tgz';
    internalRegistry.addModule(path, function() {
      registryManager.getModuleIndex('simple-empty-app', function(err, details) {
        assert.equal(err, undefined, err);
        assert.equal(details._id, 'simple-empty-app');
        mockCache.expect.addIndex.called.never();
        mockCache.expect.getIndex.called.never();
        done();
      });
    });
  });
  
});