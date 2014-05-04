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

  var clearDb = function() {
    deleteFolderRecursive(config.cache.db);  
  };
  
  return Object.freeze({
    clearCache: clearCache,
    clearDb: clearDb
  });
};

module.exports = {
  TestUtil: TestUtil
};