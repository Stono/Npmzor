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
  
  var getRegistry = function(registryRoot) {
    return registryCollection[registryRoot];
  };
  
  var setRegistry = function(registry) {
    log.debug(registry.getRoot() +' has been added.');
    registryCollection[registry.getRoot()] = registry;
  };
  
  var addRegistry = function(registry, callback) {
    if (getRegistry(registry.getRoot()) !== undefined) {
      callback('Registry already exists!');
      return;
    }
    setRegistry(registry);

    callback(null);
  };
  
  var getRegistryAsync = function(registryRoot, callback) {
    callback(null, getRegistry(registryRoot));
  };
  
  return Object.freeze({
    addRegistry: addRegistry,
    getRegistry: getRegistryAsync
  });

};

module.exports = {
  RegistryManager: RegistryManager
};