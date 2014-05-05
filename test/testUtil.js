'use strict';

var fileUtil = new require('../lib/fsUtil').FileUtil();
var TestUtil = function(config) {
  
  var clearCache = function() {
    fileUtil.deleteFolder(config.cache.tgz);
  };
  
  var clearInternal = function() {
    fileUtil.deleteFolder(config.internal.tgz);
  };

  var clearDb = function() {
    fileUtil.deleteFolder(config.db);  
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