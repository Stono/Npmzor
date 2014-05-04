'use strict';
/*
 * WARNING: Tingo, assert, and the setup we have dont
 * seem to play well together when an error occures.
 * Therefore if you have a failing test, dont trust the
 * error you're seeing - and do some manual debugging to
 * find the issue (the fail will be genuine however)
 */
var fs     = require('fs');
var assert = require('assert');
var mkdirp = require('mkdirp');
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
  
  beforeEach(function(done) {
    if(fs.existsSync(pathToTestDb)) {
      deleteFolderRecursive(pathToTestDb);    
    }
    mkdirp(pathToTestDb, function() {
      done();
    });
  });
  
  beforeEach(function() {
    var Db = require('tingodb')().Db;
    var db = new Db(pathToTestDb, {});
    mockConfig.cache.timeout = 60;
    registryCache = new RegistryCache(mockConfig, db, fs);
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
  
  it('Should add a tgz file from its cache', function(done) {
    var path = __dirname + '/../data/sample-files/simple-empty-app-0.0.1.tgz';
    registryCache.addModule('index', 'name', '0.0.1', path, function(err) {
      assert.equal(err, undefined, err);
      registryCache.getModule('index', 'name', '0.0.1', function(err, path) {
        assert.equal(err, undefined, err);
        assert.equal(path, mockConfig.cache.tgz + '/index/name/0.0.1');
        done();
      });
    });
  });
  
});