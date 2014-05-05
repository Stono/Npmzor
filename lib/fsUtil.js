'use strict';
var _ = require('lodash');

var FileUtil = function(config, fs, crypto, tgz) {
  var initDefault = function(source, target) {
    return source || target;
  };
  
  config = initDefault(config, require('../config'));
  fs     = initDefault(fs, require('fs'));
  crypto = initDefault(crypto, require('./crypto'));
  tgz    = initDefault(tgz, new (require('tar.gz'))());

  var log = new require('../lib/logger').Logger(config, 'FsUtil');

  var getTemporaryLocation = function() {
    return config.temp + '/' + Date.now().toString(12);
  };
  
  /*
   * Copy a file to the target location, returning the sha sum
   */
  var copyFile = function(source, target, opts, cb) {
    opts = _.merge({
      sha: false,
      deleteSource: false
    }, opts);
    
    var cbCalled = false;
    
    var rd = fs.createReadStream(source);
    rd.on('error', done);
    
    var wr = fs.createWriteStream(target);
    wr.on('error', done);
    wr.on('close', function() {
      if (opts.sha) {
        // Get the sha sum
        crypto.sha1(target, function(err, sum) {
          done(err, sum);
        });
      } else {
        done();
      }
    });
    rd.pipe(wr);
  
    function done(err, sum) {
      if (!cbCalled) {
        if(opts.deleteSource) { fs.unlink(source) }
        cb(err, sum);
        cbCalled = true;
      }
    }
  };
  
  var deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file){
        var curPath = path + '/' + file;
        if(fs.lstatSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  };
  
  /*
   * Extracts a file from a TGZ, reads the specific file contents
   * and then deletes all trace of the extracted file
   */
  var readFileFromTgz = function(path, file, callback) {
    var templLocation = getTemporaryLocation();
    tgz.extract(path, tempLocation, function(err) {
      if (err) {
        log.error('Failed to extract tgz file ' + err);
        callback(err);
      } else {
        fs.readFile(tempLocation + '/' + file, function(err, contents) {
          try {
            if (err) {
              callback(err, null);
            } else {
              callback(undefined, contents);
            }
          } catch(err) {
            log.error(err);
          }
        });
      }
    });
  };
  
  return Object.freeze({
    copyFile: copyFile,
    existsSync: fs.existsSync,
    deleteFolder: deleteFolderRecursive,
    readFileFromTgz: readFileFromTgz,
    getTemporaryLocation: getTemporaryLocation
  });
};

module.exports = {
  FileUtil: FileUtil
};