'use strict';
var mkdirp            = require('mkdirp');
var assert            = require('assert');
var InternalRegistry  = require('../../lib/internalRegistry').InternalRegistry;
var mockConfig        = require('../mockConfig').getNoProxyConfig();
var testUtil          = new require('../testUtil').TestUtil(mockConfig);

describe.only('Internal NPM Registry', function() {
  
  var internalRegistry;
  
  before(function() {
    testUtil.clearCache();
    testUtil.clearDb();
  });
  
  beforeEach(function(done) {
    mkdirp(mockConfig.cache.db, function() {
      var Db = require('tingodb')().Db;
      var db = new Db(mockConfig.cache.db, {});
      
      internalRegistry = new InternalRegistry(mockConfig, db);
      done();
    });    
  });
  
  it('Should allow you to add a module', function(done) {
    var path = __dirname + '/../data/sample-files/simple-empty-app-0.0.1.tgz';
    internalRegistry.addModule(path, function(err, name, version) {
      assert.equal(err, undefined);
      assert.equal(name, 'simple-empty-app');
      assert.equal(version, '0.0.1');
      internalRegistry.getModule('simple-empty-app', function(err, path) {
        assert.equal(err, undefined);
        assert(path !== null);
        done();
      });
    });
  });
  
});