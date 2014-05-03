'use strict';
var fs     = require('fs');
var assert = require('assert');
var RegistryCache = require('../../lib/registryCache').RegistryCache;
var mockConfig    = require('../mockConfig').getNoProxyConfig();

describe('NPM Registry Cache', function() {
  var registryCache;
  var pathToDbs    = __dirname + '/../../db';
  var pathToTestDb = pathToDbs + '/test';

  var contents = fs.readFileSync(__dirname + '/../data/sample-requests/mkdirp').toString();
    contents = JSON.parse(contents);
  
  var deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file){
        var curPath = path + '/' + file;
        if(fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };
  
  before(function() {
    if(!fs.existsSync(pathToDbs)) {
      fs.mkdirSync(pathToDbs, '0766');
    }
  });
  
  beforeEach(function() {
    if(fs.existsSync(pathToTestDb)) {
      deleteFolderRecursive(pathToTestDb);    
    }
    fs.mkdirSync(pathToTestDb, '0766');
  });
  
  beforeEach(function() {
    var Db = require('tingodb')().Db;
    var db = new Db(pathToTestDb, {});
    mockConfig.cache.timeout = 60;
    registryCache = new RegistryCache(mockConfig, db);
  });
  
  it('Should add an index to its cache', function(done) {
    registryCache.addIndex(contents, function(err) {
      assert.equal(err, undefined, 'There was an error inserting the cache item');
      registryCache.getIndex('mkdirp', function(err, index) {
        assert.equal(JSON.stringify(index), JSON.stringify(contents), 'The cache item was not found in the cache');
        done();
      });
    });
  });
  
  it('Should not return an index that has passed its expiry', function(done) {
    mockConfig.cache.timeout = 0;
    registryCache.addIndex(contents, function(err) {
      assert.equal(err, undefined, 'There was an error inserting the cache item');
      registryCache.getIndex('mkdirp', function(err, index) {
        assert.equal(index, undefined);
        done();
      });
    });
  });
  
});