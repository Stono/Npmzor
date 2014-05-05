'use strict';

var initDefault = function(obj, def){
  return obj || def;
};

var InternalRegistry = function(config, db, targz, fs, crypto) { 
  var log = new require('../lib/logger').Logger(config, 'InternalRegistry');
  var indexCollection = db.collection('npm_internal_registry');
  
  crypto = initDefault(crypto, require('../lib/crypto'));
  targz = initDefault(targz, new (require('tar.gz'))());
  fs = initDefault(fs, require('fs'));
  
  var getTemporaryLocation = function() {
    return config.temp + '/' + Date.now().toString(12);
  };

  var getRoot = function() {
    return 'internal';
  };

  var createCacheDir = function(path) {
    if(!fs.existsSync(path)) {
      fs.mkdirSync(path, '0766');    
    }
  };
  
  var getCachePath = function() {
    createCacheDir(config.internal.tgz);
    return config.internal.tgz;
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
  
  /*
   * Copy a file to the target location, returning the sha sum
   */
  var copyFile = function(source, target, cb) {
    var cbCalled = false;
    
    var rd = fs.createReadStream(source);
    rd.on('error', done);
  
    var wr = fs.createWriteStream(target);
    wr.on('error', done);
    wr.on('close', function() {
      // Get the sha sum
      crypto.sha1(target, function(err, sum) {
        done(err, sum);
      });
    });
    rd.pipe(wr);
  
    function done(err, sum) {
      if (!cbCalled) {
        cb(err, sum);
        cbCalled = true;
      }
    }
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
    var modulePath = getModuleVersionCachePath(name, name, version);
    copyFile(path, modulePath, function(err, shaSum) {
      if (err) {
        log.error('Failed to add module to the internal tarball collection: ' + err);
      } else {
        log.debug(name + ', version (' + version + ') added to the internal tarball collection');
        callback(undefined, modulePath, shaSum);
      }
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
    var tempLocation = getTemporaryLocation();
    targz.extract(path, tempLocation, function(err) {
      if (err) {
        log.error('Failed to extract tgz file ' + err);
        callback(err);
      } else {
        fs.readFile(tempLocation + '/package/package.json', function(err, contents) {
          var json = JSON.parse(contents.toString());
          moveAndAddtoIndex(json, path, callback);
        });
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
    var path = getModuleVersionCachePath(index, name, version);
    if (fs.existsSync(path)) {
      callback(undefined, path);
    } else {
      callback(undefined, null);
    }
  };
  
  // Must expose the same pattern as npmRegistry.js
  return Object.freeze({
    addModule: addModule,
    getModuleIndex: getModuleIndex,
    getModule: getModule,
    getRoot: getRoot
  });

};

module.exports = {  
  InternalRegistry: InternalRegistry
};