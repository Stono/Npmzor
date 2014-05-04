'use strict';
/*
 * Handles the caching of NPM Registry calls
 * DB needs to be a mongodb api compatible provider
 * For example mongodb or tingodb
 */
require('date-utils');
var RegistryCache = function(config, db, fs) {
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
    indexCollection.insert({
      '_id': jsonContents._id,
      'dateAdded': Date.now(),
      'contents': JSON.stringify(jsonContents)
    }, {w:1}, function(err) {
      if (err) {
        log.err(err);
        callback('Unable to add item to cache: ' + err, null);
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
  
  var copyFile = function(source, target, cb) {
    var cbCalled = false;
  
    var rd = fs.createReadStream(source);
    rd.on('error', done);
  
    var wr = fs.createWriteStream(target);
    wr.on('error', done);
    wr.on('close', function() {
      done();
    });
    rd.pipe(wr);
  
    function done(err) {
      if (!cbCalled) {
        cb(err);
        cbCalled = true;
      }
    }
  };
  
  var createCacheDir = function(path) {
    if(!fs.existsSync(path)) {
      fs.mkdirSync(path, '0766');    
    }
  };
  
  var getCachePath = function() {
    createCacheDir(config.cache.tgz);
    return config.cache.tgz;
  };
  
  var getIndexCachePath = function(index) {
    var indexCachePath = getCachePath() + '/' + index;
    createCacheDir(indexCachePath);
    return indexCachePath;
  };
  
  var getModuleCachePath = function(index, name) {
    var moduleCachePath = getIndexCachePath(index) + '/' + name;
    createCacheDir(moduleCachePath);
    return moduleCachePath;
  };
  
  var getModuleVersionCachePath = function(index, name, version) {
    var moduleVersionCachePath = getModuleCachePath(index, name) + '/' + version;
    return moduleVersionCachePath;
  };
  
  var addModule = function(index, name, version, path, callback) {
    var moduleCachePath = getModuleVersionCachePath(index, name, version);
    copyFile(path, moduleCachePath, function(err) {
      if (err) {
        log.error('Failed to add module to the cache: ' + err);
      } else {
        log.debug(name + ', version (' + version + ') added to the cache');
        callback(undefined, moduleCachePath);
      }
    });
  };
  
  var getModule = function(index, name, version, callback) {
    var moduleCachePath = getModuleVersionCachePath(index, name, version);
    if (fs.existsSync(moduleCachePath)) {
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