'use strict';
var assert            = require('assert');
var InternalRegistry  = require('../../lib/internalRegistry').InternalRegistry;
var mockConfig        = require('../mockConfig').getNoProxyConfig();
var testUtil          = new require('../testUtil').TestUtil(mockConfig);

describe('Internal NPM Registry', function() {
  
  var internalRegistry;
  
  beforeEach(function(done) {
    testUtil.clearAll();
    var Db = require('tingodb')().Db;
    var db = new Db(mockConfig.db, {});
      
    internalRegistry = new InternalRegistry(mockConfig, db);
    done();
  });
  
  it('Should allow you to add a module', function(done) {
    var path = __dirname + '/../data/sample-files/simple-empty-app-0.0.1.tgz';
    internalRegistry.addModule(path, function(err, name, version) {
      assert.equal(err, undefined);
      assert.equal(name, 'simple-empty-app');
      assert.equal(version, '0.0.1');
      internalRegistry.getModuleIndex('simple-empty-app', function(err, index) {
        assert.equal(err, undefined);
        assert.equal(index['dist-tags'].latest, '0.0.1');
        assert.equal(index.versions['0.0.1'].dist.shasum, '4c3f6548fef5305e6ef5029ed7c34c992a707820');
        done();
      });
    });
  });
  
  it('Should allow you to update a module', function(done) {
    var path = __dirname + '/../data/sample-files/simple-empty-app-0.0.1.tgz';
    var path2 = __dirname + '/../data/sample-files/simple-empty-app-0.0.2.tgz';
    
    internalRegistry.addModule(path, function(err) {
      assert.equal(err, undefined);
      internalRegistry.addModule(path2, function(err) {
        assert.equal(err, undefined);
        internalRegistry.getModuleIndex('simple-empty-app', function(err, index) {
          assert.equal(err, undefined);
          assert.equal(index['dist-tags'].latest, '0.0.2');
          assert.equal(index.versions['0.0.1'].dist.shasum, '4c3f6548fef5305e6ef5029ed7c34c992a707820');
          assert.equal(index.versions['0.0.2'].dist.shasum, '477d9f84a5ded6e65cc0557e52ebc85ba7b23c05');
          done();
        });         
      });
    });
  });
  
});
