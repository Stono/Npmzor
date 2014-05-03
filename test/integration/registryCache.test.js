'use strict';
var fs     = require('fs');
var assert = require('assert');
var RegistryCache = require('../../lib/registryCache').RegistryCache;

describe('NPM Registry Cache', function() {
  var registryCache;
  var pathToDbs    = __dirname + '/../../db';
  var pathToTestDb = pathToDbs + '/test';
  
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
    registryCache = new RegistryCache(db);
  });
  
  it('Should add an index to its cache', function(done) {
    var contents = fs.readFileSync(__dirname + '/../data/sample-requests/mkdirp').toString();
    contents = JSON.parse(contents);
    registryCache.addIndex(contents, function(err) {
      assert.equal(err, null, 'There was an error inserting the cache item');
      registryCache.getIndex('mkdirp', function(err, index) {
        assert.equal(err, null, 'There was an error reading the cache item');
        assert.equal(index.toString(), contents.toString(), 'The cache item was not found in the cache');
        done();
      });
    });
  });
  
});