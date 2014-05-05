'use strict';
/*
 * This class handles the aggregation of mutliple
 * npm repositories.  The idea is the they are added
 * in order of importance, and the first repo
 * to return a result will be returned
 */
var _           = require('lodash');
var NpmRegistry = require('./npmRegistry').NpmRegistry;

var RegistryManager = function(config, registryCache, httpUtil, internalRegistry) {
  var log = new require('../lib/logger').Logger(config, 'RegistryManager');
  var registryCollection = {};
  
  var getRegistrySync = function(registryRoot) {
    return registryCollection[registryRoot];
  };
  
  var setRegistry = function(registry) {
    log.debug(registry.getRoot() +' has been added.');
    registryCollection[registry.getRoot()] = registry;
  };
  
  var addRegistrySync = function(registry) {
    if (getRegistrySync(registry.getRoot()) !== undefined) {
      throw new Error('Registry already exists!');
    }
    setRegistry(registry);
  };
  
  // Initialise any registries that are in the config
  _.forEach(config.registries, function(registryRoot) {
    var newRegistry = new NpmRegistry(config, httpUtil, registryRoot);
    addRegistrySync(newRegistry);   
  });
  
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
      log.warn('Failed to find ' + name + ' in any Registry');
      // We've exhausted the registry collection therefore
      // callback to the parent with null.
      callback('Failed to find ' + name, null);
      return;
    }
    log.debug('Looking for ' + name + ' on ' + currentRegistry.getRoot());
    currentRegistry.getModuleIndex(name, function(err, json) {
      if (err !==undefined || json === null) {
        getModuleIndexRecursive(whichOne+1, name, callback);
      } else {
        log.debug('Found ' + name + ' in ' + currentRegistry.getRoot());
        // Cache it
        registryCache.addIndex(json, function(err) {
          callback(err, json);
        });
      }
    });
  };
  
  // This function performs async calls to the registries
  // but in a synchrnous order, as we want it to honor priority
  var getModuleRecursive = function(whichOne, index, name, version, callback) {
    var currentItemKey  = getRegistryKey(whichOne);
    var currentRegistry = registryCollection[currentItemKey];
    if (currentRegistry === undefined) {
      log.warn('Failed to find ' + name + ', version ' + version + ' in any Registry');
      // We've exhausted the registry collection therefore
      // callback to the parent with null.
      callback('Failed to find ' + name + ', version ' + version, null);
      return;
    }
    log.debug('Looking for ' + name + ', version ' + version + ' on ' + currentRegistry.getRoot());
    currentRegistry.getModule(index, name, version, function(err, pathToTemp) {
      if (err !==undefined || pathToTemp === null) {
        getModuleRecursive(whichOne+1, index, name, version, callback);
      } else {
        log.debug('Found ' + name + ', version ' + version + ' on ' + currentRegistry.getRoot());
        // Cache it
        registryCache.addModule(index, name, version, pathToTemp, function(err) {
          callback(err, pathToTemp);
        });
      }
    });
  };

  var getModuleIndex = function(name, callback) {
    internalRegistry.getModuleIndex(name, function(err, item) {
      if (item) {
        callback(undefined, item);
      } else {
        registryCache.getIndex(name, function(err, item) {
          if (item) {
            callback(undefined, item);
          } else {
            getModuleIndexRecursive(0, name, callback);
          }
        });
      }      
    });
  };
  
  var getModule = function(index, name, version, callback) {
    internalRegistry.getModule(index, name, version, function(err, path) {
      if (path) {
        callback(undefined, path);
      } else {
        registryCache.getModule(index, name, version, function(err, path) {
          if (path) {
            callback(undefined, path);
          } else {
            getModuleRecursive(0, index, name, version, callback); 
          }
        });
      }
    });
  };

  var addInternalModule = function(path, callback) {
    internalRegistry.addModule(path, callback);
  };
  
  return Object.freeze({
    addRegistry: addRegistry,
    addRegistrySync: addRegistrySync,
    getRegistry: getRegistry,
    getModuleIndex: getModuleIndex,
    getModule: getModule,
    addInternalModule: addInternalModule
  });

};

module.exports = {
  RegistryManager: RegistryManager
};