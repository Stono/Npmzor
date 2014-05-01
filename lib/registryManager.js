'use strict';
/*
 * This class handles the aggregation of mutliple
 * npm repositories.  The idea is the they are added
 * in order of importance, and the first repo
 * to return a result will be returned
 */
var RegistryManager = function(config) {
  var log = new require('../lib/logger').Logger(config, 'RegistryManager');
  var registryCollection = {};
  
  var getRegistrySync = function(registryRoot) {
    return registryCollection[registryRoot];
  };
  
  var setRegistry = function(registry) {
    log.debug(registry.getRoot() +' has been added.');
    registryCollection[registry.getRoot()] = registry;
  };
  
  var getRegistryKey = function(index) {
    return Object.keys(registryCollection)[index];  
  };
  
  var addRegistry = function(registry, callback) {
    if (getRegistrySync(registry.getRoot()) !== undefined) {
      callback('Registry already exists!');
      return;
    }
    setRegistry(registry);

    callback(undefined);
  };
  
  var getRegistry = function(registryRoot, callback) {
    callback(null, getRegistrySync(registryRoot));
  };
  
  // This function performs async calls to the registries
  // but in a synchrnous order, as we want it to honor priority
  var getModuleIndexRecursive = function(whichOne, name, callback) {
    var currentItemKey  = getRegistryKey(whichOne);
    var currentRegistry = registryCollection[currentItemKey];
    if (currentRegistry === undefined) {
      // We've exhausted the registry collection therefore
      // callback to the parent with null.
      callback(undefined, null);
    }
    currentRegistry.getModuleIndex(name, function(err, json) {
      if (err !==undefined || json === undefined) {
        getModuleIndexRecursive(whichOne+1, name, callback);
      } else {
        callback(null, json);
      }
    });
  };
  
  var getModuleIndex = function(name, callback) {
    getModuleIndexRecursive(0, name, callback);
  };
  
  return Object.freeze({
    addRegistry: addRegistry,
    getRegistry: getRegistry,
    getModuleIndex: getModuleIndex
  });

};

module.exports = {
  RegistryManager: RegistryManager
};