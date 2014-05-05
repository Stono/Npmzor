'use strict';
var _ = require('lodash');

var FileUtil = function(fs, crypto) {
  var initDefault = function(source, target) {
    return source || target;
  };
  fs     = initDefault(fs, require('fs'));
  crypto = initDefault(crypto, require('./crypto'));
  
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
  
  return Object.freeze({
    copyFile: copyFile,
    existsSync: fs.existsSync,
    deleteFolder: deleteFolderRecursive
  });
};

module.exports = {
  FileUtil: FileUtil
};