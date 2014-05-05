'use strict';
var mkdirp = require('mkdirp');

var InternalRegistry = function(config, db, fsUtil) {
  fsUtil = fsUtil || new require('./fsUtil').FileUtil(config);
  
  var log = new require('../lib/logger').Logger(config, 'InternalRegistry');
  var indexCollection = db.collection('npm_internal_registry');

  var getModulePath = function(index, name) {
    return config.internal.tgz + '/' + index + '/' + name;  
  };
  
  var getModuleVersionPath = function(index, name, version) {
    return getModulePath(index, name) + '/' + version;
  };
  
  var createModulePath = function(index, name, callback) {
    mkdirp(getModulePath(index, name), callback);
  };
  
  /*
   * Returns the root index object
   * which is our wrapper, .contents contains the stringified json
   */
  var getIndex = function(name, callback) {
    indexCollection.findOne({'_id': name}, function(err, item) {
      if (err) {
        log.error('Error getting internal registry item: ' + err);
        callback(err, null);
      } else {
        if (item) {
          callback(undefined, item);
        } else {
          callback(undefined, null);
        }        
      }
    });
  };
  
  /*
   * Set a root index item
   * which is our wrapper .contents contains the stringified json
   */
  var setIndex = function(json, callback) {
    indexCollection.update(
    {
      '_id': json._id
    },
    {
      '_id': json._id,
      'dateAdded': Date.now(),
      'contents': JSON.stringify(json)
    },
    {
      upsert: true
    },
    function(err) {
      if (err) {
        log.error(err);
        callback('Unable to add item to internal index: ' + err, null);
      } else {
        callback(undefined, json);
      }
    }); 
  };
  
  /*
   * Returns a model representative of a /index call
   * to an actual npm repository
   */
  var createIndex = function(json, callback) {
    var template = {
      _id: json.name,
      name: json.name,
      description: json.description,
      'dist-tags': {
        latest: json.version
      },
      versions: {}
    };
    template.versions[json.version] = {
      name: json.name,
      description: json.description,
      version: json.version
    };
    
    setIndex(template, function(err, json) {
      log.debug(json.name + ' was created in the internal index');
      callback(err, json);
    });
  };
  
  /*
   * Adds a tarball to the system and retuns the path and sha1 sum
   */
  var addTarball = function(index, name, version, path, callback) {
    createModulePath(name, name, function() {
      var modulePath = getModuleVersionPath(name, name, version);
      fsUtil.copyFile(path, modulePath, {sha: true}, function(err, shaSum) {
        if (err) {
          log.error('Failed to add module to the internal tarball collection: ' + err);
          callback(err, null);
        } else {
          log.debug(name + ', version (' + version + ') added to the internal tarball collection');
          callback(undefined, modulePath, shaSum);
        }
      });
    });
  };
  
  /*
   * Takes a JSON index and adds the new version
   */
  var addToIndex = function(index, json, path, callback) {
    addTarball(index, json.name, json.version, path, function(err, cachePath, shaSum) {

      index['dist-tags'].latest = json.version;
      index.name = json.name;
      index.description = json.description;
      index.versions[json.version] = {
        name: json.name,
        description: json.description,
        version: json.version,
        dist: {
          shasum: shaSum,
          tarball: config.url + '/' + json.name + '/-/' + json.name + '-' + json.version + '.tgz'
        }
      };
      setIndex(index, function(err) {
        if (err) {
          log.error('Failed to updated index ' + index._id + ' with new version ' + json.version + ': ' + err);
          callback(err, null);
        } else {
          log.debug(json.name + ', version (' + json.version + ') was created in the internal index');
          callback(undefined, json.name, json.version);
        }
      });
    });
  };
  
  /*
   * Takes a tarball and adds it to the index
   */
  var moveAndAddtoIndex = function (json, path, callback) {
    getModuleIndex(json.name, function(err, item) {
      if (!err) {
        if (item === null) {
          createIndex(json, function(err, index) {
            addToIndex(index, json, path, callback);
          });
        } else {
          addToIndex(item, json, path, callback);
        }
      } else {
        callback(err, null);
      }
    });
  };
  
  /*
   * Adds a tarball to the system.
   * Will extract it and read the package.json
   */
  var addModule = function(path, callback) {
    fsUtil.readFileFromTgz(path, 'package/package.json', function(err, contents) {
      if (err) {
        log.error('Failed to extract tgz file ' + err);
        callback(err);
      } else {
        var json = JSON.parse(contents.toString());
        moveAndAddtoIndex(json, path, callback);
      }        
    });
  };
  
  var getModuleIndex = function(name, callback) {
    getIndex(name, function(err, item) {
      if (err) {
        log.error('Failed to lookup ' + name + ' in internal registry');
        callback(err, null);
      } else {
        if (item) {
          log.debug(name + ' Found in internal registry');
          callback(undefined, JSON.parse(item.contents));
        } else {
          log.debug(name + ' Not found in internal registry');
          callback(undefined, null);
        }
      }
    }); 
  };
  
  var getModule = function(index, name, version, callback) {
    var path = getModuleVersionPath(index, name, version);
    if (fsUtil.existsSync(path)) {
      callback(undefined, path);
    } else {
      callback(undefined, null);
    }
  };
  
  // Must expose the same pattern as npmRegistry.js
  return Object.freeze({
    addModule: addModule,
    getModuleIndex: getModuleIndex,
    getModule: getModule
  });

};

module.exports = {  
  InternalRegistry: InternalRegistry
};