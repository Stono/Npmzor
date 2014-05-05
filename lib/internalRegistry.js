'use strict';

var InternalRegistry = function(config, db, targz, fs, crypto) { 
  var log = new require('../lib/logger').Logger(config, 'InternalRegistry');
  var indexCollection = db.collection('npm_internal_registry');
  
  crypto = crypto || require('../lib/crypto');

  targz = targz || new (require('tar.gz'))();
  fs    = fs || require('fs');
  
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
  
  var getIndex = function(name, callback) {
    indexCollection.findOne({'_id': name}, function(err, item) {
      if (err) {
        log.error('Error getting internal registry item: ' + err);
        callback(err, null);
      } else {
        callback(undefined, item);
      }
    });
  };
  
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
        console.log(err);
        log.error(err);
        callback('Unable to add item to internal index: ' + err, null);
      } else {
        callback(undefined, json);
      }
    }); 
  };
  
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
  
  var addTarball = function(index, name, version, path, callback) {
    var moduleCachePath = getModuleVersionCachePath(index, name, version);
    copyFile(path, moduleCachePath, function(err, shaSum) {
      if (err) {
        log.error('Failed to add module to the internal tarball collection: ' + err);
      } else {
        log.debug(name + ', version (' + version + ') added to the internal tarball collection');
        callback(undefined, moduleCachePath, shaSum);
      }
    });
  };
  
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
  
  var moveAndAddtoIndex = function (json, path, callback) {
    /*
     *TODO: Need to getOrCreateIndex, and on callback
     *addOrUpdate this module
     */
    getIndex(json.name, function(err, item) {
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
    
  var getModule = function(index, name, version, callback) {
    var moduleCachePath = getModuleVersionCachePath(index, name, version);
    if (fs.existsSync(moduleCachePath)) {
      log.debug(name + ', version (' + version + ') was found in the internal registry');
      callback(undefined, moduleCachePath);
    } else {
      log.debug(name + ', version (' + version + ') was not found in the internal registry');
      callback(undefined, null);
    }
  };
  
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
  
  var getModule = function(name, callback) {
    indexCollection.findOne({'_id': name}, function(err, item) {
      if (err) {
        log.error('Failed to lookup ' + name + ' in internal registry');
        callback(err, null);
      } else {
        callback(undefined, JSON.parse(item.contents));
      }
    });  
  };
  
  // Must expose the same pattern as npmRegistry.js
  return Object.freeze({
    addModule: addModule,
    getModule: getModule,
    getRoot: getRoot
  });

};

module.exports = {
  InternalRegistry: InternalRegistry
};