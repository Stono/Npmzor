'use strict';
/*
 * Handles the caching of NPM Registry calls
 * DB needs to be a mongodb api compatible provider
 * For example mongodb or tingodb
 */
require('date-utils');
var RegistryCache = function(config, db) {
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
      'name': jsonContents._id,
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
    indexCollection.findOne({'name': name}, function(err, item) {
      validateIndex(name, item, callback);
    });
  };
    
  var removeIndex = function(name, callback) {
    log.debug(name + ' will be removed from the cache.');
    indexCollection.remove({'name': name}, callback);
  };
  
  return Object.freeze({
    addIndex: setIndex,
    getIndex: getIndex
  });

};

module.exports = {
  RegistryCache: RegistryCache
};