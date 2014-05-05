'use strict';

var fs = require('fs');
var TestUtil = function(config) {
  
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
  
  var clearCache = function() {
    deleteFolderRecursive(config.cache.tgz);
  };
  
  var clearInternal = function() {
    deleteFolderRecursive(config.internal.tgz);
  };

  var clearDb = function() {
    deleteFolderRecursive(config.db);  
  };
  
  var clearAll = function() {
    clearCache();
    clearDb();
    clearInterval();
  };
  
  return Object.freeze({
    clearCache: clearCache,
    clearInternal: clearInternal,
    clearDb: clearDb,
    clearAll: clearAll
  });
};

module.exports = {
  TestUtil: TestUtil
};