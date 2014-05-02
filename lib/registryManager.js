'use strict';
/*
 * This class handles the aggregation of mutliple
 * npm repositories.  The idea is the they are added
 * in order of importance, and the first repo
 * to return a result will be returned
 */
var _           = require('lodash');
var http        = require('http');
var NpmRegistry = require('./npmRegistry').NpmRegistry;
var HttpUtil    = require('./httpUtil').HttpUtil;

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
  
  var addRegistrySync = function(registry) {
    if (getRegistrySync(registry.getRoot()) !== undefined) {
      throw new Error('Registry already exists!');
    }
    setRegistry(registry);
  };
  
  // Initialise any registries that are in the config
  _.forEach(config.registries, function(registryRoot) {
    var httpUtil    = new HttpUtil(config, http);
    var newRegistry = new NpmRegistry(config, httpUtil, registryRoot);
    addRegistrySync(newRegistry);   
  });
  
  var getRegistry = function(registryRoot, callback) {
    callback(null, getRegistrySync(registryRoot));
  };
  
  // This function performs async calls to the registries
  // but in a synchrnous order, as we want it to honor priority
  var getModuleIndexRecursive = function(whichOne, name, callback) {
    var currentItemKey  = getRegistryKey(whichOne);
    var currentRegistry = registryCollection[currentItemKey];
    if (currentRegistry === undefined) {
      log.warn('Failed to find ' + name + ' in any Registry');
      // We've exhausted the registry collection therefore
      // callback to the parent with null.
      callback('Failed to find ' + name, null);
      return;
    }
    currentRegistry.getModuleIndex(name, function(err, json) {
      if (err !==undefined || json === null) {
        getModuleIndexRecursive(whichOne+1, name, callback);
      } else {
        log.debug('Found ' + name + ' in ' + currentRegistry.getRoot());
        callback(undefined, json);
      }
    });
  };
  
  var getModuleIndex = function(name, callback) {
    getModuleIndexRecursive(0, name, callback);
  };
  
  return Object.freeze({
    addRegistry: addRegistry,
    addRegistrySync: addRegistrySync,
    getRegistry: getRegistry,
    getModuleIndex: getModuleIndex
  });

};

module.exports = {
  RegistryManager: RegistryManager
};