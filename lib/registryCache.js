'use strict';
/*
 * Handles the caching of NPM Registry calls
 * DB needs to be a mongodb api compatible provider
 * For example mongodb or tingodb
 */
var mkdirp = require('mkdirp');
require('date-utils');

var RegistryCache = function(config, db, fsUtil) {
  fsUtil = fsUtil || new require('./fsUtil').FileUtil();
  
  var indexCollection = db.collection('npm_registry_index');
  var log = new require('../lib/logger').Logger(config, 'RegistryCache');
  
  var getExpiryDate = function() {
    var now = new Date();
    now.addSeconds(-config.cache.timeout);
    return now.getTime();
  };
  
  var validateIndex = function(name, item, callback) {
    if (!item) {
      log.debug(name + ' was not found in the cache');
      callback(undefined, null);
    } else {
      if(item.dateAdded < getExpiryDate()) {
        log.debug(name + ' has expired and will be removed from cache.');
        removeIndex(name, callback);
      } else {
        log.debug(name + ' was found in the cache');
        callback(undefined, JSON.parse(item.contents));
      }
    }
  };
  
  var setIndex = function(jsonContents, callback) {
    indexCollection.update(
    {
      '_id': jsonContents._id
    },
    {
      '_id': jsonContents._id,
      'dateAdded': Date.now(),
      'contents': JSON.stringify(jsonContents)
    },
    {
      upsert: true
    },
    function(err) {
      if (err) {
        log.err(err);
        log.error('Unable to add item to cache: ' + err);
        callback(err, null);
      } else {
        log.debug(jsonContents._id + ' was added to the cache');
        callback(undefined, jsonContents);
      }
    });
  };

  var getIndex = function(name, callback) {
    indexCollection.findOne({'_id': name}, function(err, item) {
      validateIndex(name, item, callback);
    });
  };
    
  var removeIndex = function(name, callback) {
    log.debug(name + ' will be removed from the cache.');
    indexCollection.remove({'_id': name}, callback);
  };
   
  var getModuleCachePath = function(index, name) {
    return config.cache.tgz + '/' + index + '/' + name;  
  };
  
  var getModuleVersionCachePath = function(index, name, version) {
    return getModuleCachePath(index, name) + '/' + version;
  };
  
  var createModuleCachePath = function(index, name, callback) {
    mkdirp(getModuleCachePath(index, name), callback);
  };
  
  
  var addModule = function(index, name, version, path, callback) {
    createModuleCachePath(index, name, function() {
      var moduleCachePath = getModuleVersionCachePath(index, name, version);
      fsUtil.copyFile(path, moduleCachePath, {}, function(err) {
        if (err) {
          log.error('Failed to add module to the cache: ' + err);
          callback(err, null);
        } else {
          log.debug(name + ', version (' + version + ') added to the cache');
          callback(undefined, moduleCachePath);
        }
      });
    });
  };
  
  var getModule = function(index, name, version, callback) {
    var moduleCachePath = getModuleVersionCachePath(index, name, version);
    if (fsUtil.existsSync(moduleCachePath)) {
      log.debug(name + ', version (' + version + ') was found in the cache');
      callback(undefined, moduleCachePath);
    } else {
      log.debug(name + ', version (' + version + ') was not found in the cache');
      callback(undefined, null);
    }
  };
  
  return Object.freeze({
    addIndex: setIndex,
    getIndex: getIndex,
    addModule: addModule,
    getModule: getModule
  });

};

module.exports = {
  RegistryCache: RegistryCache
};